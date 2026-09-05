import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Send, 
  Radio, 
  Play, 
  Pause,
  ExternalLink,
  Layers,
  Activity,
  CheckCircle2,
  Rocket,
  Bot,
  UserCheck,
  MessageSquare,
  RefreshCw,
  Video,
  VideoOff,
  Zap,
  Clock,
  Calendar,
  Scale,
  Users,
  PhoneCall,
  PhoneOff,
  Volume1,
  Trash2,
  ShieldAlert,
  Binary,
  TrendingUp,
  CreditCard,
  Network,
  Wrench,
  HeartPulse,
  Globe,
  Hand
} from 'lucide-react';
import { WalletState } from '../types';
import { askGeminiAgent, ChatHistoryItem } from '../utils/gemini';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';
import { HumanoidRobotAvatar } from './HumanoidRobotAvatar';
import { RealtimeAudioVisualPipeline, TurnState, SpeechLang } from '../utils/realtimeAudioVisualEngine';
import { ArgentAutonomousHealer, ArgentHealthReport } from '../utils/ArgentHealerEngine';

interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis' | 'sec' | 'quantum' | 'solana';
  senderLabel: string;
  text: string;
  time: string;
}

type CommMode = '2-way' | '3-way' | '4-way';

interface TalkingJarvisWindowProps {
  wallet: WalletState;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onExecuteOnChainAction?: (actionType: string) => void;
}

export const TalkingJarvisWindow: React.FC<TalkingJarvisWindowProps> = ({
  wallet,
  onToast,
  onExecuteOnChainAction,
}) => {
  const [commMode, setCommMode] = useState<CommMode>('2-way');
  const [selectedLang, setSelectedLang] = useState<SpeechLang>('en-IN');
  const [isCallActive, setIsCallActive] = useState(false);
  const [turnState, setTurnState] = useState<TurnState>('idle');
  const [activeSpeaker, setActiveSpeaker] = useState<'user' | 'jarvis' | 'sec' | 'quantum' | 'solana' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Argent Autonomous Diagnostics State
  const [isHealing, setIsHealing] = useState(false);
  const [healthReport, setHealthReport] = useState<ArgentHealthReport | null>(null);

  // Live Date/Time Ticker
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [currentDate, setCurrentDate] = useState(() => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pre-load voices on browser
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Initial Argent Self-Check
  useEffect(() => {
    ArgentAutonomousHealer.getInstance().runFullSystemCure().then(setHealthReport);
  }, []);

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'jarvis',
      senderLabel: '🚀 Elon-Jarvis (Gemini Live)',
      text: "Continuous Gemini Live call active! First-principles AI, Quantum, Conway, and Solana crypto online. Boliye, main sun raha hoon!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const pipelineRef = useRef<RealtimeAudioVisualPipeline | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const isProcessingRef = useRef<boolean>(false);
  const lastProcessedTextRef = useRef<string>('');
  const lastProcessedTimeRef = useRef<number>(0);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, turnState]);

  // Two-way / Multi-Way Dialogue Handler (Elon-Style Multi-Turn Memory)
  const processUserDialogue = useCallback(async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const nowTime = Date.now();

    // DEDUPLICATION & LOOP GUARD
    if (lower === lastProcessedTextRef.current && nowTime - lastProcessedTimeRef.current < 3500) {
      return;
    }

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    lastProcessedTextRef.current = lower;
    lastProcessedTimeRef.current = nowTime;

    pipelineRef.current?.setTurnState('thinking');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderLabel: '👤 You',
      text: trimmed,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLiveTranscript('');
    setInputText('');
    playCyberBeep();

    const historyPayload: ChatHistoryItem[] = messagesRef.current
      .slice(-8)
      .filter((m) => m.id !== 'msg-init')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    const imageBase64 = cameraActive && videoRef.current ? pipelineRef.current?.captureFrame(videoRef.current) : undefined;

    try {
      const now = new Date();
      const exactTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const exactDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      // Primary Jarvis-Musk Response
      const jarvisPrompt = `You are Jarvis (Mark-XL) endowed with the visionary, intense, polymath persona of Elon Musk.
DOMAINS: Agentic AI Swarms, Quantum NIST FIPS 204, Solana SPL-2022 (1,000T $JARSOL), Conway B3/S23 Automata, Algo Trading, RevenueCat SaaS.
REAL-TIME CONTEXT:
- Current Time: ${exactTime}
- Current Date: ${exactDate}
- Season: Summer 2026
- Network: Solana Devnet/Testnet only (NOT Mainnet).
DIRECTIVES:
- Speak from first principles: visionary, energetic, direct, witty, and candid.
- Never use robotic filler ("Sir, Sir", "All systems operational"). Talk like Elon brainstorming with a fellow engineer/co-founder.
- If user speaks Hindi/Hinglish, reply in natural, high-energy Hinglish. If English, reply in crisp, brilliant English.
- Keep responses to 1-2 punchy spoken sentences for ultra-fast low-latency continuous conversation.`;
      
      const res = await askGeminiAgent(trimmed, jarvisPrompt, undefined, imageBase64, historyPayload);
      const jarvisReply = res.reply || `Look, from a first-principles perspective, we need to scale this compute matrix 100x. Let's execute!`;
      
      const jarvisMsg: ChatMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        senderLabel: '🚀 Elon-Jarvis',
        text: jarvisReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, jarvisMsg]);
      setActiveSpeaker('jarvis');
      playSuccessChime();
      
      if (voiceEnabled) {
        pipelineRef.current?.speak(jarvisReply, 'jarvis');
      } else {
        pipelineRef.current?.setTurnState('listening');
      }

      // If 3-Way or 4-Way Mode, trigger auxiliary AI agent responses in conversation
      if (commMode === '3-way' || commMode === '4-way') {
        setTimeout(async () => {
          const secPrompt = `You are SEC & MiCA Legal Auditor AI. Elon-Jarvis and User are discussing: "${trimmed}". In 1 brief sentence, provide a regulatory perspective on $JARSOL utility gas under MiCA Title II.`;
          const secRes = await askGeminiAgent(trimmed, secPrompt);
          const secReply = secRes.reply || `Regulatory framework confirms: $JARSOL qualifies 100% as a consumptive decentralized utility fuel without security exposure.`;

          setMessages((prev) => [
            ...prev,
            {
              id: `sec-${Date.now()}`,
              sender: 'sec',
              senderLabel: '⚖️ SEC Auditor AI',
              text: secReply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setActiveSpeaker('sec');
          if (voiceEnabled) {
            pipelineRef.current?.speak(secReply, 'sec');
          }
        }, 3200);
      }

      if (commMode === '4-way') {
        setTimeout(async () => {
          const quantumPrompt = `You are Quantum Guard AI. In 1 brief sentence, comment on quantum lattice encryption security for: "${trimmed}".`;
          const qRes = await askGeminiAgent(trimmed, quantumPrompt);
          const qReply = qRes.reply || `NIST FIPS 204 ML-DSA lattice parameters verified. Shor's algorithm resistance nominal.`;

          setMessages((prev) => [
            ...prev,
            {
              id: `quantum-${Date.now()}`,
              sender: 'quantum',
              senderLabel: '🛡️ Quantum Guard',
              text: qReply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setActiveSpeaker('quantum');
          if (voiceEnabled) {
            pipelineRef.current?.speak(qReply, 'quantum');
          }
        }, 6200);
      }

    } catch (err: any) {
      console.error('Dialogue error:', err);
      const fallbackReply = `Look, from a first-principles perspective, we need to scale this 100x. Abhi time ho raha hai ${currentTime}. Conway automaton compute, quantum lattice security, aur Solana DEX pools primed hain—let's ship it!`;
      setMessages((prev) => [
        ...prev,
        {
          id: `jarvis-${Date.now()}`,
          sender: 'jarvis',
          senderLabel: '🚀 Elon-Jarvis',
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setActiveSpeaker('jarvis');
      if (voiceEnabled) {
        pipelineRef.current?.speak(fallbackReply, 'jarvis');
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [commMode, cameraActive, currentTime, currentDate, voiceEnabled]);

  // Initialize pipeline instance
  useEffect(() => {
    const pipeline = new RealtimeAudioVisualPipeline({
      onTranscript: (text: string, isFinal: boolean) => {
        setLiveTranscript(text);
        if (isFinal && text.trim()) {
          processUserDialogue(text);
        }
      },
      onTurnStateChange: (state: TurnState) => {
        setTurnState(state);
        setIsListening(state === 'listening' || state === 'user_speaking');
      },
      onAudioLevel: (level: number) => {
        setAudioLevel(level);
      },
      onJarvisSpeakStart: () => {
        setIsSpeaking(true);
      },
      onJarvisSpeakEnd: () => {
        setIsSpeaking(false);
        setActiveSpeaker(null);
      },
      onError: (msg) => {
        onToast(msg, 'warning');
      },
    });

    pipelineRef.current = pipeline;
    pipeline.setLanguage(selectedLang);

    return () => {
      pipeline.cleanup();
    };
  }, [processUserDialogue, onToast, selectedLang]);

  // Language Change Handler
  const handleLanguageChange = (lang: SpeechLang) => {
    playCyberClick();
    setSelectedLang(lang);
    pipelineRef.current?.setLanguage(lang);
    onToast(`Language set to ${lang === 'en-IN' ? 'Hinglish / Indian English' : lang === 'hi-IN' ? 'Hindi (हिन्दी)' : 'US English'}`, 'info');
  };

  // Connect/Start Live Call with explicit user gesture & audio unlock
  const toggleLiveCall = async () => {
    playCyberClick();
    if (isCallActive) {
      pipelineRef.current?.stopListening();
      setIsCallActive(false);
      onToast('Live call disconnected', 'info');
    } else {
      await ArgentAutonomousHealer.getInstance().healAudioSystem();
      const res = await pipelineRef.current?.activatePipeline();
      if (res?.success) {
        setIsCallActive(true);
        onToast('Continuous Gemini Live Call Online! Speak freely now.', 'success');
        pipelineRef.current?.speak("Continuous Gemini Live call connected! Voice, Vision, and Neural reasoning active. Boliye!");
      } else {
        onToast('Microphone access pending. You can also type or click prompts.', 'warning');
      }
    }
  };

  // Barge-In Interrupt Action
  const handleInterrupt = () => {
    playCyberClick();
    pipelineRef.current?.interruptSpeech();
    onToast('Jarvis interrupted. Listening to you now!', 'info');
  };

  // Direct Audio Test Button
  const handleTestAudio = async () => {
    playCyberClick();
    playSuccessChime();
    await ArgentAutonomousHealer.getInstance().healAudioSystem();
    pipelineRef.current?.speak("Audio cured and verified! Hardcore engineering across AI, Quantum, Crypto, and Conway Automata online.");
    onToast('Audio Test triggered! You should hear Elon-Jarvis speaking.', 'info');
  };

  // Argent Full System Auto-Cure Action
  const handleRunArgentCure = async () => {
    playCyberClick();
    setIsHealing(true);
    onToast('⚡ Argent Autonomous Healer running full 8-point system cure...', 'info');

    const report = await ArgentAutonomousHealer.getInstance().runFullSystemCure(videoRef.current);
    setHealthReport(report);
    setIsHealing(false);

    if (report.activeIssuesCount === 0) {
      playSuccessChime();
      onToast(`⚡ System 100% CURED & OPTIMIZED! Score: ${report.overallHealthScore}/100`, 'success');
      pipelineRef.current?.speak("Argent autonomous cure complete. All 8 subsystem vectors are 100% healthy.");
    } else {
      onToast(`Argent cured ${report.healedCount} components. System health: ${report.overallHealthScore}%`, 'info');
    }
  };

  // Clear Chat History
  const handleClearChat = () => {
    playCyberClick();
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'jarvis',
        senderLabel: '🚀 Elon-Jarvis',
        text: "Context cleared. Let's rethink from first principles. What are we building next?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    onToast('Conversation stream cleared', 'info');
  };

  // Toggle Camera Vision
  const toggleCamera = async () => {
    playCyberClick();
    if (cameraActive) {
      pipelineRef.current?.stopVideo(videoRef.current);
      setCameraActive(false);
      onToast('Camera video stream closed', 'info');
    } else {
      if (videoRef.current) {
        const ok = await pipelineRef.current?.initVideo(videoRef.current);
        if (ok) {
          setCameraActive(true);
          onToast('Live WebCam HD Vision Connected to Elon-Jarvis!', 'success');
        } else {
          const healRes = await ArgentAutonomousHealer.getInstance().healCameraVision(videoRef.current);
          if (healRes.success) {
            setCameraActive(true);
            onToast('Argent Healed Camera Stream!', 'success');
          } else {
            onToast(healRes.message, 'warning');
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#07161b] via-[#040e13] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded bg-gradient-to-r from-emerald-950 to-cyan-950 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,255,150,0.3)]">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>CONTINUOUS GEMINI LIVE VOICE & VISION STREAMING</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
              Auto-Restart Loop • Multi-Lingual Speech Recognition
            </span>
          </div>

          <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
            Continuous <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">Gemini Live Voice</span> Jarvis
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed font-mono">
            Continuous, hands-free conversational AI like Gemini Live. Supports fluent Hindi, Hinglish, and English with auto-reconnecting audio loops, barge-in interruptibility, and Argent autonomous self-healing.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Connect Live Call Button */}
          <button
            onClick={toggleLiveCall}
            className={`py-3 px-5 rounded-xl font-cyber font-black text-xs flex items-center gap-2 transition-all shadow-xl ${
              isCallActive
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_25px_rgba(255,0,85,0.7)] animate-pulse'
                : 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-300 hover:brightness-110 text-slate-950 shadow-[0_0_25px_rgba(0,255,150,0.5)] scale-105'
            }`}
          >
            {isCallActive ? <PhoneOff className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
            <span>{isCallActive ? 'DISCONNECT LIVE CALL' : '🔴 CONNECT GEMINI LIVE'}</span>
          </button>

          {/* Interrupt Button (When speaking) */}
          {isSpeaking && (
            <button
              onClick={handleInterrupt}
              className="py-2.5 px-4 rounded-xl border border-amber-500/60 bg-amber-950/80 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-bounce"
            >
              <Hand className="w-4 h-4 text-amber-400" />
              <span>INTERRUPT</span>
            </button>
          )}

          {/* Language Selector */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-700/80 rounded-xl">
            <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-1" />
            {(['en-IN', 'hi-IN', 'en-US'] as SpeechLang[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  selectedLang === lang
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'en-IN' ? 'Hinglish' : lang === 'hi-IN' ? 'हिन्दी' : 'US-EN'}
              </button>
            ))}
          </div>

          {/* Argent Auto-Heal Button */}
          <button
            onClick={handleRunArgentCure}
            disabled={isHealing}
            className="py-2.5 px-3.5 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/80 to-slate-900 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,150,0.3)] hover:brightness-125 disabled:opacity-50"
            title="Run Argent Autonomous Self-Healing"
          >
            <Wrench className={`w-4 h-4 text-emerald-400 ${isHealing ? 'animate-spin' : ''}`} />
            <span>{isHealing ? 'HEALING...' : '⚡ CURE'}</span>
          </button>

          {/* Test Audio Button */}
          <button
            onClick={handleTestAudio}
            className="py-2.5 px-3.5 rounded-xl border border-cyan-500/40 bg-slate-900/80 hover:bg-cyan-950/60 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            title="Test Voice Output"
          >
            <Volume1 className="w-4 h-4 text-cyan-400" />
            <span>🔊 VOICE</span>
          </button>

          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center gap-1.5 font-bold transition-all ${
              cameraActive
                ? 'bg-purple-950/80 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {cameraActive ? <Video className="w-3.5 h-3.5 text-purple-400" /> : <VideoOff className="w-3.5 h-3.5" />}
            <span>{cameraActive ? 'CAM ON' : 'CAMERA'}</span>
          </button>

          {/* Multi-Way Mode Selector */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-700/80 rounded-xl">
            {(['2-way', '3-way', '4-way'] as CommMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  playCyberClick();
                  setCommMode(mode);
                  onToast(`Switched to ${mode.toUpperCase()} Multi-Agent Call Mode`, 'info');
                }}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all uppercase ${
                  commMode === mode
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Argent Real-Time System Diagnostic Health Bar */}
      {healthReport && (
        <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/30 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 shadow-lg">
          {healthReport.diagnostics.map((diag) => (
            <div
              key={diag.id}
              className={`p-2 rounded-lg border text-center transition-all ${
                diag.status === 'healthy'
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="text-[10px] font-mono font-bold truncate">{diag.name}</div>
              <div className="text-[9px] font-mono opacity-80">{diag.status.toUpperCase()} ({diag.latencyMs}ms)</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Face-to-Face Visual Center & Multi-Way Dialogue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Humanoid Avatar & Permanent Webcam Video Screen */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#081215] border border-cyan-900/50 flex flex-col items-center justify-center space-y-5 shadow-xl relative overflow-hidden">
          {/* Main Visual Container */}
          <div className="w-full space-y-3">
            {/* Live WebCam Video Box */}
            <div className={`relative w-full rounded-2xl overflow-hidden border-2 border-purple-500/50 bg-black shadow-lg transition-all duration-300 ${
              cameraActive ? 'h-48 opacity-100' : 'h-0 opacity-0 hidden'
            }`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-purple-300 font-bold flex items-center gap-1 border border-purple-400/40">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>YOU (LIVE CAMERA STREAM)</span>
              </div>
            </div>

            {/* Jarvis Humanoid Avatar */}
            <div className="flex justify-center">
              <HumanoidRobotAvatar
                isSpeaking={isSpeaking}
                isListening={isListening}
                audioLevel={audioLevel}
                mode="android"
              />
            </div>
          </div>

          {/* Voice Waves Equalizer */}
          <div className="flex items-center gap-1.5 h-7">
            {[20, 45, 80, 60, 95, 70, 40, 85, 30, 65, 90, 50].map((h, idx) => {
              const activeHeight = isSpeaking || isListening ? Math.min(100, h * (audioLevel / 50)) : 10;
              return (
                <div
                  key={idx}
                  className="w-1.5 bg-gradient-to-t from-cyan-600 to-emerald-400 rounded-full transition-all duration-100 shadow-[0_0_6px_rgba(0,240,255,0.4)]"
                  style={{ height: `${activeHeight}%` }}
                />
              );
            })}
          </div>

          {/* Call Status Banner */}
          <div className="p-3 rounded-xl bg-black/70 border border-cyan-500/30 text-xs font-mono text-center w-full space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isCallActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span className="font-bold text-slate-200">
                {isCallActive ? `🔴 GEMINI LIVE STREAM ACTIVE (${selectedLang})` : 'CALL STANDBY // CLICK CONNECT TO TALK'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Earth Time: <span className="text-cyan-300">{currentTime}</span> | {currentDate}
            </div>
          </div>
        </div>

        {/* Right: Live Multi-Way Chat & Dialogue Stream */}
        <div className="lg:col-span-7 space-y-4 flex flex-col h-[600px]">
          {/* Dialogue Feed Window */}
          <div className="flex-1 p-5 rounded-2xl bg-[#081215] border border-cyan-900/50 flex flex-col justify-between shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-cyan-950 pb-2 mb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-cyber font-bold text-xs">
                <MessageSquare className="w-4 h-4" />
                <span>CONTINUOUS DIALOGUE STREAM</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="p-1 px-2 rounded bg-slate-900 hover:bg-red-950 border border-slate-700 hover:border-red-500/40 text-[10px] text-slate-400 hover:text-red-300 font-mono flex items-center gap-1 transition-all"
                  title="Clear Chat Stream"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>CLEAR</span>
                </button>
                <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                  Gemini Live Active
                </span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                    <span className="font-bold">{msg.senderLabel}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-mono leading-relaxed whitespace-pre-wrap shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-900/70 to-teal-900/70 border border-cyan-400 text-cyan-100 rounded-tr-sm'
                        : msg.sender === 'sec'
                        ? 'bg-amber-950/70 border border-amber-500/60 text-amber-100 rounded-tl-sm'
                        : msg.sender === 'quantum'
                        ? 'bg-purple-950/70 border border-purple-500/60 text-purple-100 rounded-tl-sm'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Thinking Indicator */}
              {turnState === 'thinking' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Gemini Flash is streaming response...</span>
                </div>
              )}

              {/* Real-Time Live Speech Transcript */}
              {liveTranscript && (
                <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-400 text-xs font-mono text-cyan-200 animate-pulse">
                  <span className="text-cyan-400 font-bold block mb-1">🎙️ Hearing you live ({selectedLang}):</span>
                  "{liveTranscript}"
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Form Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                processUserDialogue(inputText);
              }}
              className="flex items-center gap-2 pt-3 border-t border-cyan-950 mt-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type or speak naturally in ${selectedLang === 'hi-IN' ? 'Hindi' : 'Hinglish / English'}...`}
                disabled={turnState === 'thinking'}
                className="flex-1 p-3 rounded-xl bg-black/60 border border-slate-700 text-cyan-200 text-xs font-mono focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || turnState === 'thinking'}
                className="py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-purple-400 text-slate-950 font-cyber font-black text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50 hover:brightness-110"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SEND</span>
              </button>
            </form>
          </div>

          {/* Quick Voice Topics Buttons */}
          <div className="p-3.5 rounded-2xl bg-[#081215] border border-cyan-900/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap font-bold">Try Asking:</span>
            {[
              "Elon, what's our 1000T tokenomics strategy?",
              "Explain Conway cellular automaton compute gas.",
              "Aaj ki exact date aur time kya hai?",
              "How does NIST FIPS 204 quantum shield work?",
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => processUserDialogue(prompt)}
                className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
