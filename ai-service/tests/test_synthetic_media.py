from dataclasses import replace
from hashlib import sha256
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch
import numpy as np
import torch
import cv2
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.synthetic_media import SyntheticMediaRisk
from app.services.synthetic_media_service import (SyntheticAnalysis, ensemble, available, unavailable,
    hand_signal, metadata_signal, temporal_signal, neighbor_pairs, WEIGHTS)
from app.services.embedding_service import EmbeddingResult, ModelLoadingError
from app.services.hand_detection_service import Hand, HandLoadingError
from app.services.video_service import sample_frame_indices
from app.services.capture_service import MemoryCaptureStore
import test_craft


def embedding(axis=0):
    vector = torch.zeros(384); vector[axis] = 1
    return EmbeddingResult(vector, "facebook/dinov2-small", "cpu")


def metadata(duration=5, fps=30):
    return SimpleNamespace(total_frames=round(duration*fps), fps=fps, duration_seconds=duration)


def signal_set(risk, coverage=1):
    return {name: available(risk, coverage, "test") for name in WEIGHTS}


class EnsembleTests(unittest.TestCase):
    def test_formula_ignores_unavailable_risk_and_counts_missing_coverage(self):
        signals = {"temporal_embedding_consistency": available(.2,.5,"test"),
                   "optical_flow_consistency": available(.8,1,"test"),
                   "hand_temporal_consistency": unavailable("no hands")}
        report = ensemble(signals)
        self.assertAlmostEqual(report.coverage,.35*.5+.4)
        self.assertAlmostEqual(report.risk_score,(.2*.35*.5+.8*.4)/(.35*.5+.4))
        self.assertIsNone(report.signals['hand_temporal_consistency'].risk)
    def test_levels_and_bounds(self):
        for risk, level in ((0,'low'),(.299,'low'),(.3,'medium'),(.599,'medium'),(.6,'high'),(1,'high')):
            result=ensemble(signal_set(risk))
            self.assertEqual(result.risk_level,level)
            self.assertGreaterEqual(result.risk_score,0); self.assertLessEqual(result.risk_score,1)
            self.assertGreaterEqual(result.coverage,0); self.assertLessEqual(result.coverage,1)
        self.assertEqual(ensemble(signal_set(0,.34)).risk_level,'inconclusive')
        self.assertEqual(ensemble({}).risk_level,'inconclusive')
        self.assertIsNone(ensemble({}).risk_score)
    def test_single_group_cannot_determine_label(self):
        self.assertEqual(ensemble({'optical_flow_consistency': available(1,1,'test')}).risk_level,'inconclusive')
        signals=signal_set(0)
        signals['optical_flow_consistency']=available(1,1,'test')
        self.assertNotEqual(ensemble(signals).risk_level,'high')
    def test_live_context_does_not_suppress_risk(self):
        result=ensemble(signal_set(.9)); result.context.karigar_live_capture=True
        self.assertAlmostEqual(result.risk_score,.9); self.assertEqual(result.risk_level,'high')
        self.assertFalse(result.included_in_trust_score)
    def test_missing_metadata_is_neutral(self):
        signal=metadata_signal(metadata(), 'browser.webm', True)
        self.assertEqual(signal.risk,0)
        self.assertTrue(signal.raw_metrics['streaming_metadata_reconstructed'])
        self.assertEqual(ensemble({'media_metadata':signal}).risk_level,'inconclusive')
    def test_nonfinite_metrics_rejected(self):
        for value in (float('nan'),float('inf')):
            with self.assertRaises(ValueError): available(value,1,'test')


class SignalTests(unittest.TestCase):
    def analysis(self, duration=5, static=False, blurry=False):
        meta=metadata(duration)
        indices=sample_frame_indices(meta.total_frames)
        analysis=SyntheticAnalysis(meta,indices,'camera.mp4')
        rng=np.random.default_rng(7)
        base=rng.integers(40,215,(240,320,3),dtype=np.uint8)
        if blurry: base=np.full_like(base,30)
        for index in analysis.indices:
            analysis.observe(index,base if static or blurry else np.roll(base,index%5,axis=1))
        return analysis, {i:embedding() for i in indices}
    def test_real_style_flow_available_no_hands(self):
        analysis, embeddings=self.analysis()
        result=analysis.finish(embeddings,{i:[] for i in analysis.representative},'cpu')
        self.assertTrue(result.signals['optical_flow_consistency'].available)
        self.assertFalse(result.signals['hand_temporal_consistency'].available)
        self.assertIsNone(result.signals['hand_temporal_consistency'].risk)
        self.assertEqual(result.risk_level,'low')
        self.assertLessEqual(result.frames_analyzed,16)
        self.assertLessEqual(max(max(im.shape) for im in analysis.gray.values()),256)
    def test_static_and_short_blurry_reduce_coverage_not_raise_risk(self):
        for options in ({'static':True},{'duration':2,'blurry':True}):
            analysis,embeddings=self.analysis(**options)
            result=analysis.finish(embeddings,None,'cpu')
            self.assertEqual(result.risk_level,'inconclusive')
            self.assertLess(result.coverage,.35)
            self.assertTrue(result.signals['optical_flow_consistency'].raw_metrics['low_information_content'])
            self.assertLess(result.risk_score,.3)
    def test_abrupt_embeddings_are_explainable_not_decisive(self):
        meta=metadata();indices=sample_frame_indices(meta.total_frames)
        stable={i:embedding() for i in indices}
        abrupt={i:embedding(n%2) for n,i in enumerate(indices)}
        a=temporal_signal(indices,stable,meta,1); b=temporal_signal(indices,abrupt,meta,1)
        self.assertGreater(b.risk,a.risk)
        self.assertEqual(b.raw_metrics['abrupt_fraction'],1)
        self.assertEqual(ensemble({'temporal_embedding_consistency':b}).risk_level,'inconclusive')
    def test_flow_failure_is_unavailable(self):
        analysis,embeddings=self.analysis()
        with self.assertLogs('app.services.synthetic_media_service',level='ERROR'), patch('app.services.synthetic_media_service.cv2.calcOpticalFlowFarneback',side_effect=cv2.error('mock flow error')):
            result=analysis.finish(embeddings,None,'cpu')
        self.assertFalse(result.signals['optical_flow_consistency'].available)
        self.assertIsNone(result.signals['optical_flow_consistency'].risk)
    def test_nonfinite_flow_is_unavailable(self):
        analysis,embeddings=self.analysis()
        with patch('app.services.synthetic_media_service.cv2.calcOpticalFlowFarneback',return_value=np.full((192,256,2),np.nan)):
            result=analysis.finish(embeddings,None,'cpu')
        self.assertFalse(result.signals['optical_flow_consistency'].available)
    def test_hand_observations_and_gaps(self):
        indices=list(range(8)); meta=metadata()
        def hand(x=0,label='Left'): return Hand(label,tuple((x+.1,.1,0.) for _ in range(21)))
        stable={i:[hand()] for i in indices}
        unstable={i:[hand(.5*(i%2),'Right' if i%2 else 'Left')] for i in indices}
        a=hand_signal(indices,stable,meta,1); b=hand_signal(indices,unstable,meta,1)
        self.assertTrue(a.available); self.assertGreater(b.risk,a.risk)
        self.assertEqual(b.raw_metrics['handedness_flip_fraction'],1)
        sparse={i:[hand()] if i<2 else [] for i in indices}
        self.assertFalse(hand_signal(indices,sparse,meta,1).available)
        far=[i*30 for i in indices]
        self.assertFalse(hand_signal(far,{i:[hand()] for i in far},meta,1).available)
    def test_two_frame_clip_inconclusive(self):
        meta=metadata(2/30);analysis=SyntheticAnalysis(meta,[0,1],'short.mp4')
        for i in analysis.indices:analysis.observe(i,np.zeros((24,32,3),dtype=np.uint8))
        result=analysis.finish({0:embedding(),1:embedding()},None,'cpu')
        self.assertEqual(result.risk_level,'inconclusive')
    def test_low_fps_has_no_nearby_pairs(self):
        self.assertEqual(neighbor_pairs([0,1,2],metadata(10,1)),[])


class EndpointTests(unittest.TestCase):
    def setUp(self):
        self.client=TestClient(app);self.addCleanup(self.client.close)
        self.store=MemoryCaptureStore()
        for name,kwargs in (
            ('app.services.capture_service.store',{'new':self.store}),
            ('app.services.synthetic_media_service.frame_embedding',{'return_value':embedding()}),
            ('app.services.synthetic_media_service.detect_hands',{'return_value':[]})):
            p=patch(name,**kwargs);p.start();self.addCleanup(p.stop)
    def request(self, filename='ordinary.mp4', data=None):
        content=(Path(__file__).parent/'fixtures'/filename).read_bytes()
        return self.client.post('/verify/synthetic-media-risk',data=data or {},
            files={'video':(filename,content,'video/webm' if filename.endswith('.webm') else 'video/mp4')})
    def test_mp4_and_chrome_webm(self):
        for name in ('ordinary.mp4','chrome-vp9-streaming.webm'):
            response=self.request(name)
            self.assertEqual(response.status_code,200,response.text)
            body=response.json(); report=body['synthetic_media_risk']
            self.assertLessEqual(body['frames_analyzed'],16)
            self.assertFalse(report['included_in_trust_score'])
            self.assertTrue(report['limitations']);self.assertGreaterEqual(body['processing_time_ms'],report['processing_time_ms'])
            self.assertLessEqual(report['coverage'],1)
    def test_malformed(self):
        response=self.client.post('/verify/synthetic-media-risk',files={'video':('bad.mp4',b'invalid','video/mp4')})
        self.assertEqual(response.status_code,400)
    def test_trusted_receipt_and_forged_flags(self):
        name='chrome-vp9-streaming.webm';content=(Path(__file__).parent/'fixtures'/name).read_bytes()
        session=self.store.create('process_video')
        receipt=self.store.consume(session.capture_session_id,sha256(content).hexdigest(),1.8)
        ordinary=self.request(name,{'live_capture':'true'}).json()['synthetic_media_risk']
        live=self.request(name,{'capture_receipt_token':receipt.capture_receipt_token}).json()['synthetic_media_risk']
        self.assertFalse(ordinary['context']['karigar_live_capture'])
        self.assertTrue(live['context']['karigar_live_capture'])
        self.assertEqual(ordinary['risk_score'],live['risk_score'])
        self.assertEqual(self.request(name,{'capture_receipt_token':'forged'}).status_code,410)
        self.assertEqual(self.request(data={'capture_receipt_token':receipt.capture_receipt_token}).status_code,422)
    def test_optional_models_fail_without_claiming_low_risk(self):
        with patch('app.services.synthetic_media_service.frame_embedding',side_effect=ModelLoadingError('unavailable')),              patch('app.services.synthetic_media_service.detect_hands',side_effect=HandLoadingError('unavailable')):
            response=self.request();self.assertEqual(response.status_code,200)
            report=response.json()['synthetic_media_risk']
            self.assertFalse(report['signals']['temporal_embedding_consistency']['available'])
            self.assertFalse(report['signals']['hand_temporal_consistency']['available'])
            self.assertEqual(report['risk_level'],'inconclusive')


class CraftIntegrationTests(unittest.TestCase):
    def setUp(self): test_craft.CraftEndpointTests.setUp(self)
    def upload(self): return test_craft.CraftEndpointTests.upload(self)
    def test_diagnostic_cannot_change_trust_score_or_model_call_count(self):
        baseline=self.upload().json()
        for mock in self.mocks.values():mock.reset_mock()
        high=ensemble(signal_set(1))
        with patch('app.services.craft_service.SyntheticAnalysis.finish',return_value=high):
            response=self.upload();self.assertEqual(response.status_code,200,response.text)
        body=response.json()
        self.assertEqual(body['synthetic_media_risk']['risk_level'],'high')
        self.assertEqual(body['trust_score'],baseline['trust_score'])
        self.assertLessEqual(body['trust_score']['score'],100)
        self.assertEqual(body['trust_score']['max_score'],100)
        self.assertFalse(body['synthetic_media_risk']['included_in_trust_score'])
        self.assertEqual(self.mocks['detect_hands'].call_count,8)
        self.assertEqual(self.mocks['detect_objects'].call_count,8)
        self.mocks['validated_video'].assert_called_once()
        self.assertEqual(self.mocks['frame_embedding'].call_count,11)
    def test_no_process_video_unavailable(self):
        response=self.client.post('/verify/craft',files={'product_image':('photo.png',b'mock','image/png')})
        self.assertEqual(response.status_code,200,response.text)
        self.assertFalse(response.json()['synthetic_media_risk']['available'])
