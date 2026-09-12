import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from PIL import Image
from app.services import authenticity_service as service


class AuthenticityTests(unittest.TestCase):
    def test_publication_uses_current_matching_complete_cache_only(self):
        import hashlib
        import sqlite3
        stream=io.BytesIO();Image.new('RGB',(2,2)).save(stream,format='PNG');data=stream.getvalue()
        digest=hashlib.sha256(data).hexdigest()
        files=[{'sha256':digest,'kind':'photo'}]
        with tempfile.TemporaryDirectory() as folder, patch.object(service,'CACHE_PATH',Path(folder)/'cache.db'), \
             patch.object(service,'configuration',return_value=['user','secret','v1']) as config, \
             patch.object(service,'provider_request',return_value={'status':'success','type':{'ai_generated':.01}}):
            self.assertFalse(service.publication_eligibility(files))
            service.analyze(data,'image/png','photo.png')
            self.assertTrue(service.publication_eligibility(files))
            self.assertFalse(service.publication_eligibility([{'sha256':'0'*64,'kind':'photo'}]))
            self.assertFalse(service.publication_eligibility([{'sha256':digest,'kind':'video'}]))
            config.return_value=['user','secret','v2']
            self.assertFalse(service.publication_eligibility(files))
            config.return_value=['user','secret','v1']
            with service.closing(sqlite3.connect(service.CACHE_PATH)) as db:
                db.execute('UPDATE results SET created=0');db.commit()
            self.assertFalse(service.publication_eligibility(files))

    def test_provider_errors_are_actionable_and_do_not_echo_secrets(self):
        for category, expected in [('plan_error', 'plan'), ('usage_limit', 'quota'),
                                   ('media_error', 'H.264'), ('credentials_error', 'credentials')]:
            error = service.provider_error({'error':{'type':category, 'code':42, 'message':'private-secret'}})
            self.assertIn(expected, str(error))
            self.assertNotIn('private-secret', str(error))
            self.assertEqual(error.code, 42)

    def test_http_error_translation(self):
        import urllib.error
        error = urllib.error.HTTPError('https://api.sightengine.com', 403, 'Forbidden', {},
            io.BytesIO(b'{"error":{"type":"plan_error","code":42,"message":"secret"}}'))
        with patch.object(service.urllib.request, 'urlopen', side_effect=error):
            with self.assertRaises(service.DetectorError) as raised:
                service.provider_request(b'fake', 'video/mp4', 'video.mp4', {})
        self.assertEqual(raised.exception.category, 'plan_error')

    def test_labels_and_invalid_responses(self):
        for score, label in [(0, 'Likely camera-captured'), (.1, 'Likely camera-captured'),
                             (.5, 'Inconclusive'), (.9, 'Likely AI-generated')]:
            result = service.normalize({'status':'success', 'type':{'ai_generated':score}})
            self.assertEqual(result['label'], label)
            self.assertEqual(result['review_required'], score > .1)
        for score in [None, True, '0.9', float('nan'), 2]:
            with self.assertRaises(ValueError):
                service.normalize({'status':'success', 'type':{'ai_generated':score}})

    def test_sampling_boundaries(self):
        for duration, expected in [(1, 3), (15, 3), (15.1, 5), (30, 5), (30.1, 8), (60, 8)]:
            indices = service.frame_indices(duration, 1800)
            self.assertEqual(len(indices), expected)
            self.assertEqual(indices, sorted(set(indices)))
            self.assertTrue(all(0 <= i < 1800 for i in indices))
        self.assertEqual(service.frame_indices(.1, 2), [0, 1])

    def test_video_aggregation(self):
        for scores, expected, label in [([.95]*3, 3, 'Likely AI-generated'),
                ([.05]*5, 5, 'Likely camera-captured'), ([.05, .95, .95], 3, 'Inconclusive'),
                ([.95, .5, .95], 3, 'Inconclusive'), ([.05], 3, 'Inconclusive'), ([], 3, 'Inconclusive')]:
            result = service.aggregate(scores, expected)
            self.assertEqual(result['label'], label)
            self.assertNotIn('ai_score', result)
            self.assertEqual(result['retryable'], len(scores) != expected)

    def test_video_partial_retry_and_cache(self):
        frames = [b'frame1', b'frame2', b'frame3']
        good = {'status':'success', 'type':{'ai_generated':.05}}
        with tempfile.TemporaryDirectory() as folder, patch.object(service, 'CACHE_PATH', Path(folder)/'cache.db'), \
             patch.object(service, 'configuration', return_value=['user', 'secret', 'v1']) as config, \
             patch.object(service, 'extract_video_frames', return_value=frames) as extract, \
             patch.object(service, 'provider_request', side_effect=[good, service.DetectorError('Quota', 'usage_limit')]) as post:
            result = service.analyze(b'video', 'video/mp4', 'a.mp4')
            self.assertEqual(result['label'], 'Inconclusive')
            self.assertTrue(result['retryable'])
            self.assertEqual(post.call_count, 2)  # No third call after quota failure.
            post.side_effect = None
            post.return_value = good
            result = service.analyze(b'video', 'video/mp4', 'a.mp4')
            self.assertEqual(post.call_count, 4)  # First successful frame is reused.
            self.assertEqual(result['label'], 'Likely camera-captured')
            self.assertTrue(service.analyze(b'video', 'video/mp4', 'renamed.mp4')['cached'])
            self.assertEqual(post.call_count, 4)
            self.assertEqual(extract.call_count, 2)
            config.return_value = ['user', 'secret', 'v2']
            service.analyze(b'video', 'video/mp4', 'a.mp4')
            self.assertEqual(post.call_count, 7)
            with patch.object(service, 'VIDEO_POLICY', 'changed-sampling'):
                service.analyze(b'video', 'video/mp4', 'a.mp4')
            self.assertEqual(post.call_count, 10)
            self.assertTrue(all(call.args[1] == 'image/jpeg' for call in post.call_args_list))

    def test_stop_on_credentials_and_invalid_frame_result(self):
        import sqlite3
        from contextlib import closing
        for failure in [service.DetectorError('Credentials', 'credentials_error'), ValueError('Invalid score')]:
            with closing(sqlite3.connect(':memory:')) as db:
                db.execute('CREATE TABLE results (key TEXT PRIMARY KEY, created REAL, result TEXT)')
                with patch.object(service, 'provider_request', side_effect=failure) as post:
                    result = service.analyze_frames(db, [b'a', b'b', b'c'], 'v1', {})
                    self.assertTrue(result['retryable'])
                    self.assertEqual(result['label'], 'Inconclusive')
                    self.assertEqual(post.call_count, 1)

    def test_real_fixture_extraction_without_provider(self):
        fixture = Path(__file__).parent / 'fixtures' / 'ordinary.mp4'
        with patch.object(service, 'provider_request') as post:
            frames = service.extract_video_frames(fixture.read_bytes(), 'video/mp4', fixture.name)
            self.assertEqual(len(frames), 3)
            for frame in frames:
                with Image.open(io.BytesIO(frame)) as image:
                    self.assertEqual(image.format, 'JPEG')
                    self.assertLessEqual(max(image.size), 1280)
            post.assert_not_called()

    def test_unavailable_does_not_call_provider(self):
        with patch.object(service, 'configuration', return_value=['', '', 'v1']), patch.object(service, 'provider_request') as post:
            self.assertEqual(service.analyze(b'fake', 'image/png', 'photo.png')['status'], 'unavailable')
            post.assert_not_called()

    def test_concurrent_batch_does_not_start_another_upload(self):
        with patch.object(service, 'configuration', return_value=['user', 'secret', 'v1']), patch.object(service, 'provider_request') as post:
            with service.LOCK:
                result = service.analyze(b'video', 'video/mp4', 'a.mp4')
            self.assertEqual(result['status'], 'error')
            post.assert_not_called()

    def test_hash_version_cache_and_failures(self):
        stream = io.BytesIO()
        Image.new('RGB', (2, 2)).save(stream, format='PNG')
        data = stream.getvalue()
        response = {'status':'success', 'type':{'ai_generated':.95}}
        with tempfile.TemporaryDirectory() as folder, patch.object(service, 'CACHE_PATH', Path(folder)/'cache.db'), \
             patch.object(service, 'configuration', return_value=['user', 'secret', 'v1']) as config, \
             patch.object(service, 'provider_request', return_value=response) as post:
            self.assertFalse(service.analyze(data, 'image/png', 'a.png')['cached'])
            self.assertTrue(service.analyze(data, 'image/png', 'renamed.png')['cached'])
            self.assertEqual(post.call_count, 1)
            config.return_value = ['user', 'secret', 'v2']
            self.assertFalse(service.analyze(data, 'image/png', 'a.png')['cached'])
            self.assertEqual(post.call_count, 2)
            config.return_value = ['user', 'secret', 'v3']
            post.return_value = {'status':'failure'}
            with self.assertRaises(ValueError):
                service.analyze(data, 'image/png', 'a.png')
            post.return_value = {'status':'success', 'type':{'ai_generated':.5}}
            self.assertFalse(service.analyze(data, 'image/png', 'a.png')['cached'])


if __name__ == '__main__':
    unittest.main()
