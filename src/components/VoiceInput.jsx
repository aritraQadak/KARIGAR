import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Volume2, Sparkles, RefreshCw, Check } from 'lucide-react';

const voicePresets = {
  Hindi: "यह बांकुरा की शुद्ध चिकनी मिट्टी से बना हाथ से तराशा हुआ टेराकोटा पॉट है। इसमें पारंपरिक आदिवासी कला उकेरी गई है और यह 900 डिग्री पर पकाया गया है।",
  Bengali: "এটি বাঁকুড়ার পঞ্চমুড়ার খাঁটি এঁটেল মাটি দিয়ে হাতে তৈরি টেরাকোটা পট। এতে ঐতিহ্যবাহী গ্রামীণ নকশা খোদাই করা আছে এবং কাঠের চুল্লিতে পোড়ানো।",
  English: "Handcrafted Bengal terracotta decorative pot sculpted from Bankura alluvial clay. Kiln-fired at 900°C with traditional etched tribal motifs.",
  Tamil: "வங்காளத்தின் பாரம்பரிய சுடுமண் பானை, கைவினைஞரால் நேர்த்தியாக உருவாக்கப்பட்டது.",
  Telugu: "బెంగాల్ సాంప్రదాయ టెర్రకోట మట్టి పాత్ర, చేతితో చేసిన కళాఖండం.",
  Marathi: "बांकुरा मातीपासून बनवलेले पारंपारिक टेराकोटा भांडे, हाताने कोरलेली नक्षी.",
  Gujarati: "હાથથી બનાવેલ ટેરાકોટા માટીનો સુશોભન કુંભ, પંચમુરા કળા.",
  Kannada: "ಬಂಗಾಳದ ಸಾಂಪ್ರದಾಯಿಕ ಜೇಡಿಮಣ್ಣಿನಿಂದ ಮಾಡಿದ ಅಲಂಕಾರಿಕ ಮಡಕೆ.",
  Malayalam: "പരമ്പരാഗത ബംഗാൾ ടെറാക്കോട്ട അലങ്കാര മൺപാത്രം.",
  Punjabi: "ਪੱਛਮੀ ਬੰਗਾਲ ਦੀ ਮਿੱਟੀ ਤੋਂ ਹੱਥੀਂ ਬਣਿਆ ਟੈਰਾਕੋਟਾ ਗਮਲਾ।"
};

export default function VoiceInput({ onTranscriptReady, onGenerateAI }) {
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState('Hindi');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);

  const languages = [
    'Hindi', 'Bengali', 'English', 'Tamil', 'Telugu',
    'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
  ];

  useEffect(() => {
    let interval;
    if (isRecording) {
      setTimer(0);
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTranscript('');
      // Simulate realistic speech streaming
      const sampleText = voicePresets[selectedLang] || voicePresets['Hindi'];
      const words = sampleText.split(' ');
      let index = 0;
      
      const streamInterval = setInterval(() => {
        if (index < words.length) {
          setTranscript((prev) => (prev ? prev + ' ' + words[index] : words[index]));
          index++;
        } else {
          clearInterval(streamInterval);
          setIsRecording(false);
        }
      }, 240);
    } else {
      setIsRecording(false);
    }
  };

  const handleApply = () => {
    if (onTranscriptReady && transcript) {
      onTranscriptReady(transcript, selectedLang);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white dark:from-[#1E293B] dark:via-[#1F2937] dark:to-[#111827] border border-orange-200/80 dark:border-orange-500/20 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-100 dark:border-gray-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#F9FAFB] flex items-center gap-1.5">
              🎙 {t('addProduct.voiceTitle')}
              <span className="text-[10px] bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 font-semibold px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                {t('addProduct.voiceBadge')}
              </span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#CBD5E1]">
              {t('addProduct.voiceSubtitle')}
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-[#CBD5E1] font-medium">{t('addProduct.spokenLanguage')}</label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs bg-white dark:bg-[#111827] border border-orange-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 font-medium text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mic Record Button & Waveform visualizer */}
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={toggleRecording}
          className={`relative group flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
            isRecording
              ? 'bg-red-500 text-white shadow-md shadow-red-200 animate-pulse'
              : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isRecording ? `${t('addProduct.listening', 'Listening...')} (0:0${timer})` : t('addProduct.startSpeaking')}</span>
        </button>

        {isRecording && (
          <div className="flex items-center gap-1 h-6">
            {[40, 70, 95, 60, 80, 100, 50, 75, 90, 45, 85].map((height, i) => (
              <span
                key={i}
                className="w-1 bg-orange-500 rounded-full animate-bounce"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 70}ms`,
                  animationDuration: '600ms'
                }}
              />
            ))}
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 ml-2">
              {t('addProduct.recording')} {selectedLang}...
            </span>
          </div>
        )}

        {!isRecording && !transcript && (
          <p className="text-xs text-gray-400 dark:text-gray-400 italic">
            {t('addProduct.voiceHint')}
          </p>
        )}
      </div>

      {/* Transcript Box */}
      {transcript && (
        <div className="mt-3.5 bg-white dark:bg-[#111827] rounded-lg p-3 border border-orange-100/90 dark:border-gray-700 text-sm">
          <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-400 font-medium mb-1">
            <span>{t('addProduct.recognizedSpeech')} ({selectedLang}):</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> {t('addProduct.audioCaptured')}
            </span>
          </div>
          <p className="text-gray-800 dark:text-gray-200 text-sm italic font-serif leading-relaxed">
            "{transcript}"
          </p>
          <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApply}
                className="text-xs bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 font-medium px-3 py-1.5 rounded-md border border-orange-200 dark:border-orange-800 transition-colors"
              >
                {t('addProduct.useInForm')}
              </button>
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1"
              >
                {t('common.clear', 'Clear')}
              </button>
            </div>
            {onGenerateAI && (
              <button
                type="button"
                onClick={() => onGenerateAI(transcript, selectedLang)}
                className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-3.5 py-1.5 rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('addProduct.autoFillWithAi')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
