import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Send,
  Languages,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useSeller } from '../../context/SellerContext';
import { toLocaleDigits } from '../../utils/formatters';
import { translatePersonName, transliterateText } from '../../utils/localizedDisplay';

export default function Messages() {
  const { t, i18n } = useTranslation();
  const { addToast } = useSeller();

  const [activeThreadId, setActiveThreadId] = useState('t1');
  const [inputText, setInputText] = useState('');

  // Sample buyer message conversations
  const [threads, setThreads] = useState([
    {
      id: 't1',
      buyerName: 'Aarav Patel',
      buyerCity: 'Mumbai, Maharashtra',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      unread: false,
      productContext: 'Bankura Terracotta Decorative Horse Pair',
      messages: [
        {
          id: 'm1',
          sender: 'buyer',
          text: 'Namaste Sushila ji! Can you customize the terracotta horse pair with traditional yellow ochre motifs?',
          time: '10:30 AM',
          translatedText: 'नमस्ते सुशीला जी! क्या आप टेराकोटा घोड़े की जोड़ी को पारंपरिक पीले गेरू रूपांकनों के साथ अनुकूलित कर सकती हैं?'
        },
        {
          id: 'm2',
          sender: 'artisan',
          text: 'Namaste Aarav ji. Yes, I prepare organic yellow clay pigment myself. I can create the custom pattern within 3 days before kiln firing.',
          time: '10:45 AM'
        },
        {
          id: 'm3',
          sender: 'buyer',
          text: 'That sounds wonderful. I placed the order via Karigar Escrow. Please let me know once you fire it!',
          time: '11:15 AM',
          translatedText: 'यह बहुत बढ़िया है। मैंने कारीगर एस्क्रो के माध्यम से ऑर्डर दिया है। कृपया भट्ठी में पकाने के बाद मुझे बताएं!'
        }
      ]
    },
    {
      id: 't2',
      buyerName: 'Elena Rostova',
      buyerCity: 'Berlin, Germany',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      unread: true,
      productContext: 'GI-Certified Bankura Horse 18-inch',
      messages: [
        {
          id: 'm4',
          sender: 'buyer',
          text: 'Hello! Does this clay sculpture come with international bubble-wrapping and wooden crate protection?',
          time: 'Yesterday',
          translatedText: 'नमस्ते! क्या यह मिट्टी की मूर्तिकला अंतरराष्ट्रीय बबल-रैपिंग और लकड़ी के बक्से की सुरक्षा के साथ आती है?'
        }
      ]
    }
  ]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'artisan',
      text: inputText.trim(),
      time: 'Just now'
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...t.messages, newMsg]
          };
        }
        return t;
      })
    );

    setInputText('');
    addToast(t('messages.messageSentSuccess', 'Message sent to buyer'), 'success');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1F2937] p-5 sm:p-6 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#F9FAFB] tracking-tight">
            {t('messages.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#CBD5E1] mt-1">
            {t('messages.pageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
          <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('messages.autoTranslationActive')}</span>
        </div>
      </div>

      {/* Chat Layout Container */}
      <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[560px] transition-colors">
        {/* Left Side: Threads List */}
        <div className="border-r border-gray-200/80 dark:border-gray-700/80 flex flex-col bg-white dark:bg-[#0F172A]/80">
          <div className="p-3.5 border-b border-gray-100 dark:border-gray-700/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('messages.searchPlaceholder', 'Search conversations...')}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-800 dark:text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
          </div>

          <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-700/50 overflow-y-auto">
            {threads.map((thread) => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              const isSelected = thread.id === activeThreadId;

              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-l-3 border-amber-600'
                      : 'hover:bg-gray-50 dark:hover:bg-[#1F2937]/70'
                  }`}
                >
                  <img
                    src={thread.avatar}
                    alt={thread.buyerName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {translatePersonName(thread.buyerName, i18n.language)}
                      </h4>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                        {toLocaleDigits(lastMsg.time, i18n.language)}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-amber-900 dark:text-amber-400 truncate mb-1">
                      {t('messages.re', 'Re:')} {thread.productName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {lastMsg.text}
                    </p>
                  </div>
                  {thread.unreadCount > 0 && (
                    <span className="w-4 h-4 bg-orange-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shrink-0">
                      {toLocaleDigits(thread.unreadCount, i18n.language)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Thread Messages */}
        <div className="md:col-span-2 flex flex-col justify-between h-full bg-[#FAF9F6] dark:bg-[#111827]">
          {/* Thread Header */}
          <div className="p-3.5 px-5 bg-white dark:bg-[#1F2937] border-b border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activeThread.avatar}
                alt={activeThread.buyerName}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                  {translatePersonName(activeThread.buyerName, i18n.language)}
                </h3>
                <span className="text-[11px] text-gray-400 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {transliterateText(activeThread.buyerCity, i18n.language)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                {t('messages.escrowVerified', 'Escrow Order Verified')}
              </span>
            </div>
          </div>

          {/* Messages Bubble Area */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto">
            <div className="text-center my-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-400 bg-white/80 dark:bg-[#1F2937] px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                {t('messages.endToEndSecurity', 'End-to-End Escrow Protected Direct Communication')}
              </span>
            </div>

            {activeThread.messages.map((msg) => {
              const isArtisan = msg.sender === 'artisan';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isArtisan ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md rounded-2xl p-3.5 text-xs shadow-2xs ${
                      isArtisan
                        ? 'bg-[#14532D] text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#1F2937] text-gray-800 dark:text-gray-100 rounded-bl-xs border border-gray-200/80 dark:border-gray-700'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>

                    {/* Show translation toggle for buyer messages */}
                    {!isArtisan && msg.translatedText && (
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-[11px] text-gray-600 dark:text-gray-300 bg-amber-50/50 dark:bg-amber-950/40 p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 mb-0.5">
                          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          {t('messages.translatedLabel', 'Auto Translated:')}
                        </span>
                        <span>{msg.translatedText}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Message Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3.5 bg-white dark:bg-[#1F2937] border-t border-gray-200/80 dark:border-gray-700/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('messages.typePlaceholder')}
              className="flex-1 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white dark:focus:bg-[#111827] font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#14532D] hover:bg-[#0f3e22] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>{t('messages.send')}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
