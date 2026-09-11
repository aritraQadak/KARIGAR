from contextlib import contextmanager
from dataclasses import replace
from io import BytesIO
from types import SimpleNamespace
import unittest
from unittest.mock import patch
import torch
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.schemas.video import VideoMetadata
from app.services.embedding_service import EmbeddingResult
from app.services.product_video_service import analyze_product_video
from app.services.trust_score_service import TrustInputs, calculate_trust


class ProductVideoTests(unittest.TestCase):
    def setUp(self):
        self.client=TestClient(app)
        self.addCleanup(self.client.close)
        self.unit=torch.zeros(384); self.unit[0]=1
        self.embedding=EmbeddingResult(self.unit,"facebook/dinov2-small","cpu")
        self.closed=[]
        self.limits=[]
        self.indices=[]
        @contextmanager
        def video(upload,limits):
            self.limits.append(limits)
            try:
                yield object(), VideoMetadata(total_frames=300,fps=30,duration_seconds=10,width=32,height=24)
            finally:
                self.closed.append(True)
        def embeddings(capture,indices,limits):
            self.indices.extend(indices)
            return [self.embedding]*len(indices)
        for target,kwargs in (("validated_video",{"side_effect":video}),
                              ("sampled_embeddings",{"side_effect":embeddings})):
            patcher=patch("app.services.product_video_service."+target,**kwargs)
            patcher.start(); self.addCleanup(patcher.stop)
        b=BytesIO()
        with Image.new("RGB",(32,24)) as im: im.save(b,format="PNG")
        self.png=b.getvalue()
        patcher=patch("app.services.product_video_service.embed_image",return_value=self.embedding)
        self.embed=patcher.start(); self.addCleanup(patcher.stop)

    def upload(self,image=True):
        files={"product_video":("showcase.mp4",b"mock","video/mp4")}
        if image: files["product_image"]=("product.png",self.png,"image/png")
        return self.client.post("/verify/product-video",files=files)

    def test_valid_static_and_match(self):
        response=self.upload()
        self.assertEqual(response.status_code,200,response.text)
        body=response.json()
        self.assertEqual(body["frames_analyzed"],6)
        self.assertEqual(self.indices,[30,75,120,179,224,269])
        self.assertEqual(self.limits[0].max_duration,30)
        self.assertEqual(body["product_image_consistency"]["average_similarity"],1)
        self.assertEqual(body["showcase_analysis"]["view_diversity_score"],0)
        self.assertEqual(body["showcase_analysis"]["valid_frame_ratio"],1)
        self.assertEqual(self.closed,[True])

    def test_without_image(self):
        response=self.upload(False)
        self.assertEqual(response.status_code,200,response.text)
        self.assertFalse(response.json()["product_image_consistency"]["available"])
        self.assertIsNone(response.json()["product_image_consistency"]["average_similarity"])
        self.embed.assert_not_called()

    def test_invalid_video_real_validator(self):
        from app.services.video_service import validated_video
        with patch("app.services.product_video_service.validated_video",validated_video):
            response=self.client.post("/verify/product-video",files={"product_video":("bad.txt",b"bad","text/plain")})
        self.assertEqual(response.status_code,415)

    def test_craft_showcase_only(self):
        response=self.client.post("/verify/craft",files={"product_video":("showcase.mp4",b"mock","video/mp4")})
        self.assertEqual(response.status_code,200,response.text)
        body=response.json()
        self.assertIsNone(body["product_image"])
        self.assertIsNone(body["video"])
        self.assertEqual(body["trust_score"]["categories"]["product_video_evidence"]["score"],5)
        self.assertFalse(body["trust_score"]["categories"]["craft_process_evidence"]["available"])

    def test_craft_photo_and_showcase_embed_once(self):
        with patch("app.services.craft_service.embed_image", return_value=self.embedding) as image_embed:
            response=self.client.post("/verify/craft",files={
                "product_video":("showcase.mp4",b"mock","video/mp4"),
                "product_image":("product.png",self.png,"image/png")})
        self.assertEqual(response.status_code,200,response.text)
        image_embed.assert_called_once()
        self.embed.assert_not_called()
        body=response.json()
        self.assertEqual(body["trust_score"]["score"],47)
        self.assertEqual(body["trust_score"]["categories"]["product_video_evidence"]["score"],12)

    def test_alias_conflict(self):
        response=self.client.post("/verify/craft",files={key:("video.mp4",b"x","video/mp4") for key in ("video","process_video")})
        self.assertEqual(response.status_code,422)

    def test_score_bands_and_missing(self):
        for average, expected in ((None,8),(.9,15),(.8,15),(.65,13),(.5,10),(.49,8)):
            inputs=TrustInputs(product_video_analyzed=True,product_video_average_similarity=average,product_video_diversity=1)
            report=calculate_trust(inputs)
            category=report.categories["product_video_evidence"]
            self.assertEqual(category.score,expected)
            self.assertEqual(category.score,sum(c.score for c in category.components.values()))
            self.assertLessEqual(report.score,100)
            self.assertLessEqual(category.score,15)
            if average is None: self.assertFalse(category.components["product_consistency"].available)
        static=calculate_trust(TrustInputs(product_video_analyzed=True,product_video_average_similarity=1,product_video_diversity=0))
        self.assertEqual(static.categories["product_video_evidence"].score,12)
        missing=calculate_trust(TrustInputs()).categories["product_video_evidence"]
        self.assertFalse(missing.available)
        self.assertEqual(missing.score,0)


if __name__ == "__main__": unittest.main()
