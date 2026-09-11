from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from types import SimpleNamespace
import unittest
from unittest.mock import patch, MagicMock
import numpy as np
import cv2
from fastapi import HTTPException
from fastapi.testclient import TestClient
from app.main import app
from app.services.capture_service import MemoryCaptureStore
from app.services.video_service import streaming_webm_metadata, VideoLimits
import test_craft

class CaptureTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 1, 1, tzinfo=timezone.utc)
        self.store = MemoryCaptureStore(clock=lambda: self.now)
        p = patch('app.services.capture_service.store', self.store)
        p.start(); self.addCleanup(p.stop)
        self.client = TestClient(app); self.addCleanup(self.client.close)
        @contextmanager
        def valid(video):
            yield object(), SimpleNamespace(total_frames=30, duration_seconds=1)
        p = patch('app.services.capture_service.validated_video', valid)
        p.start(); self.addCleanup(p.stop)
        p = patch('app.services.capture_service.sampled_frames', return_value=[np.zeros((2, 2, 3), dtype=np.uint8)])
        p.start(); self.addCleanup(p.stop)
    def session(self):
        r = self.client.post('/capture/session', json={'purpose': 'process_video'})
        self.assertEqual(r.status_code, 200)
        return r.json()['capture_session_id']
    def submit(self, session=None):
        return self.client.post('/capture/process-video', data={'capture_session_id': session or self.session()},
            files={'video': ('recording.webm', b'exact received bytes', 'video/webm')})
    def test_creation_secure_random(self):
        with patch('app.services.capture_service.secrets.token_urlsafe', wraps=__import__('secrets').token_urlsafe) as random:
            first, second = self.session(), self.session()
            self.assertNotEqual(first, second)
            self.assertGreaterEqual(len(first), 43)
            self.assertEqual(random.call_args.args, (32,))
        self.assertEqual(self.client.post('/capture/session', json={'purpose': 'identity'}).status_code, 422)
    def test_valid_hash_receipt_and_single_use(self):
        session = self.session()
        r = self.submit(session); self.assertEqual(r.status_code, 200, r.text)
        body = r.json(); digest = sha256(b'exact received bytes').hexdigest()
        self.assertEqual(body['video_sha256'], digest)
        receipt = self.store.resolve(body['capture_receipt_token'], digest)
        self.assertTrue(receipt.single_use_session)
        self.assertEqual(receipt.capture_session_id, session)
        self.assertEqual(receipt.duration_seconds, 1)
        self.assertEqual(self.submit(session).status_code, 409)
    def test_expired_nonexistent_wrong_purpose(self):
        session = self.session(); self.now += timedelta(seconds=301)
        self.assertEqual(self.submit(session).status_code, 410)
        self.assertEqual(self.submit('invented').status_code, 404)
        session = self.session(); self.store.sessions[session].response.purpose = 'product_video'
        self.assertEqual(self.submit(session).status_code, 422)
    def test_invalid_video_does_not_consume(self):
        session = self.session()
        with patch('app.services.capture_service.validated_video', side_effect=HTTPException(400, 'Invalid video')):
            self.assertEqual(self.submit(session).status_code, 400)
        self.assertEqual(self.submit(session).status_code, 200)
    def test_actual_invalid_video_validation(self):
        from app.services.video_service import validated_video
        session = self.session()
        with patch('app.services.capture_service.validated_video', validated_video):
            response = self.client.post('/capture/process-video', data={'capture_session_id': session},
                files={'video': ('not-video.txt', b'not video', 'text/plain')})
            self.assertEqual(response.status_code, 415)
        self.assertFalse(self.store.sessions[session].consumed)
    def test_atomic_consumption(self):
        session = self.session()
        def consume(_):
            try: self.store.consume(session, 'hash', 1); return 200
            except HTTPException as exc: return exc.status_code
        with ThreadPoolExecutor(max_workers=2) as pool:
            self.assertEqual(sorted(pool.map(consume, range(2))), [200, 409])
    def test_receipt_expiry_and_mismatch(self):
        token = self.submit().json()['capture_receipt_token']
        with self.assertRaises(HTTPException) as error: self.store.resolve(token, 'different')
        self.assertEqual(error.exception.status_code, 422)
        self.now += timedelta(seconds=1801)
        with self.assertRaises(HTTPException) as error: self.store.resolve(token, sha256(b'exact received bytes').hexdigest())
        self.assertEqual(error.exception.status_code, 410)
    def test_bounded_store(self):
        with patch('app.services.capture_service.MAX_RECORDS', 1):
            self.session()
            self.assertEqual(self.client.post('/capture/session', json={}).status_code, 503)
            self.now += timedelta(seconds=301)
            self.session()

class CaptureCraftIntegrationTests(unittest.TestCase):
    def setUp(self):
        test_craft.CraftEndpointTests.setUp(self)
        self.store = MemoryCaptureStore()
        p = patch('app.services.capture_service.store', self.store); p.start(); self.addCleanup(p.stop)
    def send(self, data=None, contents=b'mock'):
        return self.client.post('/verify/craft', data=data or {}, files={
            'process_video': ('recording.webm', contents, 'video/webm'),
            'product_image': ('photo.png', b'mock', 'image/png')})
    def receipt(self):
        session = self.store.create('process_video')
        return self.store.consume(session.capture_session_id, sha256(b'mock').hexdigest(), 10).capture_receipt_token
    def test_forged_boolean_and_ordinary_upload(self):
        for data in ({}, {'live_capture': 'true', 'capture_method': 'karigar_live_camera'}):
            r = self.send(data); self.assertEqual(r.status_code, 200, r.text)
            self.assertEqual(r.json()['live_capture_evidence']['suggested_score'], 0)
            self.assertFalse(r.json()['live_capture_evidence']['verified_capture_session'])
    def test_pipeline_and_score_unchanged(self):
        ordinary = self.send().json()
        for mock in self.mocks.values(): mock.reset_mock()
        r = self.send({'capture_receipt_token': self.receipt()})
        self.assertEqual(r.status_code, 200, r.text); live = r.json()
        self.assertEqual(live['trust_score'], ordinary['trust_score'])
        self.assertLessEqual(live['trust_score']['score'], 100)
        self.assertEqual(live['trust_score']['max_score'], 100)
        diagnostic = live['live_capture_evidence']
        self.assertEqual(diagnostic['suggested_score'], 10)
        self.assertFalse(diagnostic['included_in_trust_score'])
        self.assertIsNotNone(live['technical_signals']['temporal_analysis'])
        self.assertIsNotNone(live['technical_signals']['hand_analysis'])
        self.assertIsNotNone(live['technical_signals']['person_presence_ratio'])
        self.assertIsNotNone(live['technical_signals']['best_similarity'])
        self.assertEqual(self.mocks['detect_hands'].call_count, 8)
        self.assertEqual(self.mocks['detect_objects'].call_count, 8)
        self.mocks['embed_image'].assert_called_once()
        self.mocks['validated_video'].assert_called_once()
    def test_wrong_video_and_forged_token_before_inference(self):
        self.assertEqual(self.send({'capture_receipt_token': self.receipt()}, b'other').status_code, 422)
        self.assertEqual(self.send({'capture_receipt_token': 'invented'}).status_code, 410)
        self.mocks['embed_image'].assert_not_called()
    def test_token_requires_process_video(self):
        r = self.client.post('/verify/craft', data={'capture_receipt_token': self.receipt()},
            files={'product_image': ('photo.png', b'mock', 'image/png')})
        self.assertEqual(r.status_code, 422)

class StreamingWebMTests(unittest.TestCase):
    def capture(self, count=30):
        capture = MagicMock()
        timestamps = iter(i * 1000 / 30 for i in range(count))
        values = {cv2.CAP_PROP_FPS: 1000, cv2.CAP_PROP_FRAME_WIDTH: 8, cv2.CAP_PROP_FRAME_HEIGHT: 8}
        capture.get.side_effect = lambda prop: next(timestamps) if prop == cv2.CAP_PROP_POS_MSEC else values.get(prop)
        capture.read.side_effect = [(True, np.zeros((8,8,3), dtype=np.uint8))] * count + [(False, None)]
        return capture
    def test_missing_duration_counted_using_timestamps(self):
        capture = self.capture()
        meta = streaming_webm_metadata(capture, VideoLimits())
        self.assertEqual(meta.total_frames, 30); self.assertEqual(meta.duration_seconds, 1)
        capture.set.assert_not_called()
    def test_duration_still_bounded(self):
        with self.assertRaises(HTTPException) as error:
            streaming_webm_metadata(self.capture(31), VideoLimits(max_duration=1))
        self.assertEqual(error.exception.status_code, 413)


class RealRecordedVideoTests(unittest.TestCase):
    def test_chrome_webm_receipt_hash_and_sampling(self):
        from pathlib import Path
        from app.services.video_service import validated_video, sampled_frames, sample_frame_indices
        from fastapi import UploadFile
        from starlette.datastructures import Headers
        path = Path(__file__).parent / 'fixtures' / 'chrome-vp9-streaming.webm'
        data = path.read_bytes()
        store = MemoryCaptureStore()
        with TestClient(app) as client, patch('app.services.capture_service.store', store):
            session = store.create('process_video').capture_session_id
            response = client.post('/capture/process-video', data={'capture_session_id': session},
                files={'video': (path.name, data, 'video/webm;codecs=vp9')})
            self.assertEqual(response.status_code, 200, response.text)
            self.assertEqual(response.json()['video_sha256'], sha256(data).hexdigest())
            self.assertTrue(store.sessions[session].consumed)
        # The same shared validator and sampler used by /verify/craft can reopen the original bytes.
        with path.open('rb') as stream:
            with validated_video(UploadFile(stream, filename=path.name,
                headers=Headers({'content-type': 'video/webm'}))) as (capture, meta):
                self.assertLess(meta.fps, 240)
                frames = list(sampled_frames(capture, sample_frame_indices(meta.total_frames)))
                self.assertEqual(len(frames), 8)

    def test_malformed_webm_does_not_consume_session(self):
        store = MemoryCaptureStore()
        with TestClient(app) as client, patch('app.services.capture_service.store', store):
            session = store.create('process_video').capture_session_id
            response = client.post('/capture/process-video', data={'capture_session_id': session},
                files={'video': ('bad.webm', b'not a video', 'video/webm')})
            self.assertEqual(response.status_code, 400)
            self.assertFalse(store.sessions[session].consumed)


    def test_ordinary_mp4_still_decodes_and_samples(self):
        from pathlib import Path
        from fastapi import UploadFile
        from starlette.datastructures import Headers
        from app.services.video_service import validated_video, sampled_frames, sample_frame_indices, SequentialVideoCapture
        path = Path(__file__).parent / 'fixtures' / 'ordinary.mp4'
        with path.open('rb') as stream:
            with validated_video(UploadFile(stream, filename=path.name,
                headers=Headers({'content-type': 'video/mp4'}))) as (capture, meta):
                self.assertNotIsInstance(capture, SequentialVideoCapture)
                self.assertEqual(meta.total_frames, 30)
                self.assertEqual(len(list(sampled_frames(capture, sample_frame_indices(meta.total_frames)))), 8)
