import json
import unittest
from contextlib import contextmanager
from types import SimpleNamespace
from unittest.mock import patch
from fastapi import HTTPException
from fastapi.testclient import TestClient
from app.main import app
from app.services.listing_completeness_service import listing_completeness, parse_listing_metadata

FULL = {"title":"Terracotta Vase", "description":"Wheel-thrown vase with a natural finish",
    "category":"Pottery", "materials":["Terracotta clay"], "price":1200,
    "region":"West Bengal", "dimensions":"20cm x 12cm", "craft_technique":"Wheel-thrown pottery"}


class ListingTests(unittest.TestCase):
    def test_absent_empty_full_partial(self):
        self.assertFalse(listing_completeness(None).available)
        self.assertEqual(listing_completeness(None).score,0)
        empty=listing_completeness({})
        self.assertTrue(empty.available)
        self.assertEqual(empty.score,0)
        full=listing_completeness(FULL)
        self.assertEqual(full.score,5)
        self.assertEqual(full.completion_ratio,1)
        partial=listing_completeness({k:v for k,v in FULL.items() if k not in ('dimensions',)})
        self.assertEqual(partial.score,4.6)
        self.assertEqual(partial.completion_ratio,.875)
        self.assertEqual(partial.missing_fields,['dimensions'])

    def test_empty_and_wrong_types(self):
        for value in ('','  ',None,[],{}):
            report=listing_completeness({key:value for key in FULL})
            self.assertEqual(report.score,0)
        self.assertEqual(listing_completeness({'materials':['','   ',None]}).score,0)
        self.assertEqual(listing_completeness({'materials':['clay',' ']}).score,.75)

    def test_price(self):
        for price in (0,-1,True,False,'1200',float('inf'),float('nan'),10**1000):
            self.assertEqual(listing_completeness({'price':price}).score,0)
        for price in (.01,1200,1200.5):
            self.assertEqual(listing_completeness({'price':price}).score,.75)

    def test_json_validation(self):
        for raw in ('{broken','', '[]','null','42','{"price":NaN}'):
            with self.assertRaises(HTTPException) as caught:
                parse_listing_metadata(raw)
            self.assertEqual(caught.exception.status_code,422)
        self.assertEqual(parse_listing_metadata('{}'),{})
        self.assertIsNone(parse_listing_metadata(None))

    def test_all_subsets_bounded(self):
        names=list(FULL)
        for mask in range(1 << len(names)):
            report=listing_completeness({n:FULL[n] for i,n in enumerate(names) if mask & (1<<i)})
            self.assertLessEqual(report.score,5)
            self.assertGreaterEqual(report.score,0)

    def test_multipart_integration_and_no_extra_ml(self):
        @contextmanager
        def image(upload):
            yield {'filename':'photo.png','width':32,'height':24}, object()
        with TestClient(app) as client, patch('app.services.craft_service.validated_image',image), \
                patch('app.services.craft_service.embed_image',return_value=SimpleNamespace(model='facebook/dinov2-small',inference_device='cpu')) as embed:
            def request(metadata):
                return client.post('/verify/craft',files={'product_image':('photo.png',b'mock','image/png')},
                    data={} if metadata is None else {'listing_metadata':metadata})
            base=request(None).json()
            response=request(json.dumps(FULL))
            self.assertEqual(response.status_code,200,response.text)
            body=response.json()
            self.assertEqual(base['trust_score']['score'],35)
            self.assertEqual(body['trust_score']['score'],40)
            category=body['trust_score']['categories']['listing_completeness']
            self.assertEqual(category['score'],5)
            self.assertEqual(len(category['completed_fields']),8)
            self.assertEqual(category['missing_fields'],[])
            self.assertEqual(body['trust_score']['score'],sum(c['score'] for c in body['trust_score']['categories'].values()))
            for name in base['trust_score']['categories']:
                if name != 'listing_completeness':
                    self.assertEqual(base['trust_score']['categories'][name],body['trust_score']['categories'][name])
            self.assertEqual(embed.call_count,2)
            malformed=request('{broken')
            self.assertEqual(malformed.status_code,422)
            self.assertEqual(embed.call_count,2)


if __name__ == '__main__': unittest.main()
