import unittest
import json
import io
import urllib.error
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routes.voice import router
from app.services import voice_service as voice


class VoiceTests(unittest.TestCase):
    def setUp(self):
        app = FastAPI()
        app.include_router(router)
        self.client = TestClient(app)

    def post(self, content=b'\x1aE\xdf\xa3audio', **data):
        return self.client.post('/onboarding/product-from-voice',
                                files={'audio': ('voice.webm', content, 'audio/webm')},
                                data={'selected_language': 'bn', 'duration_seconds': '15', **data})

    def test_valid_pipeline_and_missing_values(self):
        values = dict.fromkeys(voice.Details.model_fields)
        values.update(title='Clay pot', materials=['Clay'])
        with patch.object(voice, 'transcribe', return_value=voice.Transcript(
                transcript='I make clay pots', source_language='en', duration_seconds=15.0)), \
                patch.object(voice, 'extract_details', return_value=voice.Details(**values)):
            result = self.post()
        self.assertEqual(result.status_code, 200)
        self.assertIsNone(result.json()['details']['price'])
        self.assertIn('dimensions', result.json()['missing_fields'])
        self.assertEqual(result.json()['details']['materials'], ['Clay'])

    def test_invalid_audio_language_duration(self):
        self.assertEqual(self.post(b'not audio').status_code, 415)
        self.assertEqual(self.post(selected_language='unknown').status_code, 422)
        self.assertEqual(self.post(duration_seconds='150').status_code, 422)
        self.assertEqual(self.post(duration_seconds='0').status_code, 422)

    def test_provider_failure_is_sanitized(self):
        with patch.object(voice, 'product_from_voice', side_effect=RuntimeError('private provider details')):
            response = self.post()
        self.assertEqual(response.status_code, 503)
        self.assertNotIn('private provider details', response.text)

    def test_missing_key_is_actionable_without_exposing_provider_details(self):
        with patch.object(voice, 'product_from_voice', side_effect=voice.VoiceProviderError(
                'missing_api_key', 'private provider details', 503)):
            response = self.post()
        self.assertEqual(response.status_code, 503)
        self.assertIn('Gemini API key is not configured', response.json()['detail'])
        self.assertNotIn('private provider details', response.text)

    def test_strict_schema(self):
        values = dict.fromkeys(voice.Details.model_fields)
        values.update(materials='clay')
        with self.assertRaises(ValueError):
            voice.Details(**values)
        values.update(materials=[], category='Invented category')
        with self.assertRaises(ValueError):
            voice.Details(**values)

    def test_empty_transcription(self):
        with patch.object(voice, 'generate', return_value=voice.Transcript(
                transcript='', source_language='en', duration_seconds=10.0)):
            with self.assertRaises(ValueError):
                voice.transcribe(b'audio', 'audio/webm', 'en')

    def test_provider_structured_transport(self):
        output = {'status': 'completed', 'outputs': [{'type': 'text', 'text': json.dumps({
            'transcript': 'clay pot', 'source_language': 'en', 'duration_seconds': 5.0})}]}
        with patch.dict('os.environ', {'GEMINI_API_KEY': 'unit-test-placeholder'}), \
                patch('urllib.request.urlopen', return_value=io.BytesIO(json.dumps(output).encode())) as send:
            result = voice.transcribe(b'audio', 'audio/webm', 'en')
        self.assertEqual(result.transcript, 'clay pot')
        payload = json.loads(send.call_args.args[0].data)
        self.assertFalse(payload['store'])
        self.assertEqual(payload['response_format']['mime_type'], 'application/json')
        self.assertIn('schema', payload['response_format'])
        self.assertNotIn('unit-test-placeholder', str(payload))

    def test_oversize_audio(self):
        with patch.object(voice, 'MAX_AUDIO_BYTES', 4):
            self.assertEqual(self.post().status_code, 413)

    def test_transient_provider_failure_retries_once(self):
        output = {'status': 'completed', 'steps': [{'type': 'model_output', 'content': [
            {'type': 'text', 'text': json.dumps({'transcript': 'clay pot', 'source_language': 'en', 'duration_seconds': 5.0})}]}]}
        failure = urllib.error.HTTPError('https://example.test', 503, 'unavailable', {}, io.BytesIO(b'{}'))
        with patch.dict('os.environ', {'GEMINI_API_KEY': 'test'}), patch.object(voice.time, 'sleep'), \
                patch('urllib.request.urlopen', side_effect=[failure, io.BytesIO(json.dumps(output).encode())]) as send:
            self.assertEqual(voice.transcribe(b'audio', 'audio/webm', 'en').transcript, 'clay pot')
        self.assertEqual(send.call_count, 2)

    def test_retries_are_bounded_and_credentials_or_quota_are_not_retried(self):
        for status, count, category in [(503, 2, 'provider_unavailable'),
                                        (403, 1, 'authentication_failure'), (429, 1, 'quota_rate_limit')]:
            failures = [urllib.error.HTTPError('https://example.test', status, 'error', {}, io.BytesIO(b'{}')) for _ in range(2)]
            with patch.dict('os.environ', {'GEMINI_API_KEY': 'test'}), patch.object(voice.time, 'sleep'), \
                    patch('urllib.request.urlopen', side_effect=failures) as send:
                with self.assertRaises(voice.VoiceProviderError) as caught:
                    voice.transcribe(b'audio', 'audio/webm', 'en')
            self.assertEqual(send.call_count, count)
            self.assertEqual(caught.exception.category, category)
            self.assertEqual(caught.exception.provider_status, status)

    def test_current_interactions_steps_parse_final_output_only(self):
        text = json.dumps({'transcript': 'clay pot', 'source_language': 'en', 'duration_seconds': 5.0})
        output = {'status': 'completed', 'steps': [
            {'type': 'model_output', 'content': [{'type': 'text', 'text': 'earlier output'}]},
            {'type': 'thought', 'content': [{'type': 'text', 'text': 'ignore thoughts'}]},
            {'type': 'model_output', 'content': [
                {'type': 'text', 'text': text[:20]}, {'type': 'text', 'text': text[20:]}]},
        ]}
        with patch.dict('os.environ', {'GEMINI_API_KEY': 'unit-test-placeholder'}), \
                patch('urllib.request.urlopen', return_value=io.BytesIO(json.dumps(output).encode())):
            result = voice.transcribe(b'audio', 'audio/webm', 'en')
        self.assertEqual(result.transcript, 'clay pot')

    def test_completed_response_without_model_output_fails_closed(self):
        output = {'status': 'completed', 'steps': [{'type': 'thought', 'content': []}]}
        with patch.dict('os.environ', {'GEMINI_API_KEY': 'unit-test-placeholder'}), \
                patch('urllib.request.urlopen', return_value=io.BytesIO(json.dumps(output).encode())):
            with self.assertRaises(voice.VoiceProviderError) as caught:
                voice.transcribe(b'audio', 'audio/webm', 'en')
        self.assertEqual(caught.exception.category, 'malformed_ai_response')

    def test_provider_errors_are_classified_and_key_redacted(self):
        for status, message, category in [(403, 'invalid API key secret', 'authentication_failure'),
                (429, 'quota exceeded', 'quota_rate_limit'), (404, 'model not found', 'invalid_model'),
                (400, 'unsupported audio mime', 'unsupported_audio')]:
            error = urllib.error.HTTPError('https://example.test', status, 'error', {},
                io.BytesIO(json.dumps({'error': {'message': message}}).encode()))
            result = voice.provider_http_error(error, 'secret')
            self.assertEqual(result.category, category)
            self.assertNotIn('secret', str(result))

    def test_transport_failure_retains_reason_and_safe_route_message(self):
        with patch.dict('os.environ', {'GEMINI_API_KEY': 'test'}), patch('urllib.request.urlopen',
                side_effect=urllib.error.URLError(PermissionError('socket blocked 10013'))):
            with self.assertRaises(voice.VoiceProviderError) as caught:
                voice.extract_details('clay pot')
        self.assertEqual(caught.exception.category, 'network_failure')
        self.assertIn('10013', str(caught.exception))
        with patch.object(voice, 'product_from_voice', side_effect=caught.exception):
            response = self.post()
        self.assertEqual(response.status_code, 502)
        self.assertNotIn('10013', response.text)


if __name__ == '__main__':
    unittest.main()
