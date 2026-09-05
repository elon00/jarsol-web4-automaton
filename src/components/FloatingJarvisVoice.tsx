import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Send, X, Bot, Sparkles, RefreshCw } from 'lucide-react';
import { askGeminiAgent } from '../utils/gemini';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';

interface FloatingJarvisVoiceProps {
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const FloatingJarvisVoice: React.FC<FloatingJarvisVoiceProps> = ({ onToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'jarvis'; text: string; time: string }[]>([
    {
      sender: 'jarvis',
      text: "Jarvis Global Voice Assistant active. Click the microphone or type to chat with me anytime.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const latestSpeechRef = useRef<string>('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_\-\[\]\(\)]/g, '').replace(/https?:\/\/\S+/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = voices.find(
      (v) => v.lang.includes('en-GB') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male')
    );
    if (jarvisVoice) utterance.voice = jarvisVoice;
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isThinking) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: trimmed, time: timeStr }]);
    setInputText('');
    setTranscript('');
    setIsThinking(true);
    playCyberBeep();

    try {
      const prompt = `You are Jarvis (Mark-XXXIX // Humanoid AI Assistant). Answer your master directly in 1-2 spoken sentences with wit and intelligence. Factual Truth: Project is on Solana Devnet/Testnet only. User: "${trimmed}"`;
      const res = await askGeminiAgent(trimmed, prompt);

      const reply = res.reply || `At your service, Sir. Systems are standing by.`;
      setMessages((prev) => [...prev, { sender: 'jarvis', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsThinking(false);
      playSuccessChime();
      speakText(reply);
    } catch (e) {
      setIsThinking(false);
    }
  };

  // Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          latestSpeechRef.current = '';
          playCyberBeep();
        };

        recognition.onresult = (e: any) => {
          const text = e.results[e.resultIndex][0].transcript;
          latestSpeechRef.current = text;
          setTranscript(text);
        };

        recognition.onend = () => {
          setIsListening(false);
          const speech = latestSpeechRef.current.trim();
          if (speech) {
            handleSendMessage(speech);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleMic = () => {
    playCyberClick();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      latestSpeechRef.current = '';
      try {
        recognitionRef.current?.start();
      } catch (e) {
        onToast('Microphone active. Please speak to Jarvis.', 'info');
      }
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-mono">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 h-[460px] bg-[#071318]/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-3 bg-slate-900/90 border-b border-cyan-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="font-cyber font-bold text-xs text-cyan-300">JARVIS 2-WAY VOICE AI</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="p-1 text-slate-400 hover:text-white"
                title={voiceEnabled ? 'Mute' : 'Unmute'}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-900/60 border border-cyan-500/40 text-cyan-100'
                      : 'bg-black/60 border border-slate-800 text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-500 px-1 mt-0.5">{m.time}</span>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 text-[11px] text-cyan-300 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Jarvis is thinking...</span>
              </div>
            )}

            {isListening && transcript && (
              <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/40 text-[11px] text-red-200">
                🎙️ "{transcript}"
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-2.5 bg-slate-950 border-t border-cyan-950 flex items-center gap-1.5"
          >
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-xl border transition-all ${
                isListening
                  ? 'bg-red-500 text-white border-red-400 animate-pulse'
                  : 'bg-slate-900 text-cyan-300 border-cyan-500/40 hover:bg-slate-800'
              }`}
              title="Push to talk"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Speak or type to Jarvis..."
              className="flex-1 p-2 rounded-xl bg-black/60 border border-slate-800 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Activation Button */}
      <button
        onClick={() => {
          playCyberClick();
          setIsOpen(!isOpen);
        }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all hover:scale-105 border-2 border-cyan-300/60"
        title="Open Two-Way Jarvis Voice Assistant"
      >
        <Bot className="w-7 h-7 animate-pulse text-slate-950" />
      </button>
    </div>
  );
};
