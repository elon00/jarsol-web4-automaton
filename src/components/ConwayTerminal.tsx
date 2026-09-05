import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Rocket, 
  Scale, 
  TrendingUp, 
  RefreshCw, 
  Copy, 
  Check, 
  Trash2
} from 'lucide-react';
import { ChatMessage, WalletState } from '../types';
import { askGeminiAgent } from '../utils/gemini';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';

interface ConwayTerminalProps {
  wallet: WalletState;
  metabolismScore: number;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

type AgentRole = 'Conway Brain' | 'Quantum Guard' | 'Solana Deployer' | 'SEC Auditor' | 'Tokenomics Guru';

export const ConwayTerminal: React.FC<ConwayTerminalProps> = ({
  wallet,
  metabolismScore,
  onToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      agentRole: 'Conway Brain',
      text: `### 🌐 JARSOL // CONWAY AUTOMATON 4.0 ONLINE
**Neural Brain**: Google Gemini 3.7 Flash Engine (Connected)
**Cluster Status**: Solana Devnet/Testnet (SPL Token-2022 1,000 Trillion Hard Cap)
**Post-Quantum Defense**: NIST FIPS 203/204 Module-LWE Active

I am your autonomous Web 4.0 agent. How may I assist your on-chain operations or cryptographic architecture today?`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedRole, setSelectedRole] = useState<AgentRole>('Conway Brain');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customText || inputPrompt;
    if (!promptToSend.trim() || isThinking) return;

    playCyberClick();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsThinking(true);
    playCyberBeep();

    // Contextual system instruction based on agent persona with strict factual truth grounding
    const factualGrounding = "FACTUAL GROUNDING: The project ($JARSOL) is currently deployed and running exclusively on the Solana Devnet and Testnet clusters (RPC: https://api.devnet.solana.com). It is NOT deployed on Solana Mainnet yet. Never claim it is on Mainnet. Always state the exact truth: it is on Testnet/Devnet.";
    let systemInstruction = factualGrounding + " ";
    if (selectedRole === 'Conway Brain') {
      systemInstruction += `You are JarSol Conway Brain (Web 4.0 Autonomous OS). You control decentralized cellular automata compute cycles, the 1,000 Trillion $JARSOL economy on Solana Devnet/Testnet, and autonomous machine execution loops.`;
    } else if (selectedRole === 'Quantum Guard') {
      systemInstruction += `You are JarSol Quantum Guard. You specialize in NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA) Post-Quantum Cryptography, lattice structures, and protecting Solana against Shor's algorithm.`;
    } else if (selectedRole === 'Solana Deployer') {
      systemInstruction += `You are JarSol Solana Deployer. You are an expert in Solana SPL Token-2022 on Devnet/Testnet, Anchor smart contracts, minting 1,000 Trillion tokens, and Raydium liquidity pool engineering.`;
    } else if (selectedRole === 'SEC Auditor') {
      systemInstruction += `You are JarSol SEC & MiCA Auditor. You specialize in the US SEC Howey Test and EU MiCA regulations, proving that $JARSOL is a 100% consumptive utility token on Solana Devnet/Testnet.`;
    } else if (selectedRole === 'Tokenomics Guru') {
      systemInstruction += `You are JarSol Tokenomics & Global Marketing Guru. You design viral growth strategies, Tier-1 CEX listing roadmaps (Binance, Bybit, Gate.io), and 1,000 Trillion supply market mechanics.`;
    }

    try {
      const response = await askGeminiAgent(promptToSend, systemInstruction, selectedRole);

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentRole: selectedRole,
        text: response.reply,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, agentMsg]);
      playSuccessChime();
    } catch (err: any) {
      console.error('Chat error:', err);
      onToast('Error getting Gemini response: ' + err.message, 'error');
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    onToast('Message copied to clipboard', 'info');
  };

  const clearChat = () => {
    playCyberClick();
    setMessages([
      {
        id: 'reset-msg',
        sender: 'system',
        text: 'Terminal session cleared. All systems nominal.',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const quickPrompts = [
    { role: 'Solana Deployer' as AgentRole, text: 'Explain how to deploy 1,000 Trillion $JARSOL on Solana Testnet with SPL-2022.' },
    { role: 'SEC Auditor' as AgentRole, text: 'Analyze $JARSOL against the 4 prongs of the US SEC Howey Test.' },
    { role: 'Quantum Guard' as AgentRole, text: 'How does NIST FIPS 204 ML-DSA protect Solana against Shor’s algorithm?' },
    { role: 'Tokenomics Guru' as AgentRole, text: 'Outline the Tier-1 CEX marketing strategy for $JARSOL 1,000 Trillion supply.' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Terminal Agent Selector Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-900/60 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-cyber font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>Google Gemini 3.7 Flash Neural Agent</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                LIVE REASONING
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Switch autonomous agent personas for specialized tasks
            </p>
          </div>
        </div>

        {/* Persona Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { role: 'Conway Brain', icon: Cpu, color: 'text-cyan-400' },
              { role: 'Quantum Guard', icon: ShieldCheck, color: 'text-emerald-400' },
              { role: 'Solana Deployer', icon: Rocket, color: 'text-purple-400' },
              { role: 'SEC Auditor', icon: Scale, color: 'text-amber-400' },
              { role: 'Tokenomics Guru', icon: TrendingUp, color: 'text-pink-400' },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.role;
            return (
              <button
                key={item.role}
                onClick={() => {
                  playCyberClick();
                  setSelectedRole(item.role);
                  onToast(`Switched persona to ${item.role}`, 'info');
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.25)] font-semibold'
                    : 'bg-black/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span>{item.role}</span>
              </button>
            );
          })}

          <button
            onClick={clearChat}
            title="Clear Chat"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors ml-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="rounded-2xl bg-[#04080a] border-2 border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.12)] flex flex-col h-[520px]">
        {/* Terminal Title Bar */}
        <div className="px-4 py-2.5 bg-[#071318] border-b border-cyan-950 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-cyan-400 font-bold ml-2">jarsol@agentics-os:~ ({selectedRole})</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span>Metabolism: {metabolismScore.toFixed(0)}%</span>
            <span>|</span>
            <span className="text-emerald-400">Gemini 3.7 Flash</span>
          </div>
        </div>

        {/* Message Log Box */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 font-mono text-xs">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSys = msg.sender === 'system';

            if (isSys) {
              return (
                <div key={msg.id} className="text-center py-1 text-slate-500 text-[11px] italic">
                  -- {msg.text} --
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-xl p-4 space-y-1.5 ${
                    isUser
                      ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-100'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                    <span className="font-bold text-cyan-400">
                      {isUser ? 'Master Command (You)' : `${msg.agentRole || 'JarSol AI'} [Gemini 3.7]`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-white"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="leading-relaxed whitespace-pre-wrap prose-invert">
                    {msg.text}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Live Thinking Indicator */}
          {isThinking && (
            <div className="flex items-center gap-3 text-cyan-400 text-xs font-mono animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                <span>Gemini 3.7 Flash reasoning on {selectedRole} neural matrix...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-black/50 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">Suggested:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedRole(qp.role);
                handleSendMessage(undefined, qp.text);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-mono text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
            >
              {qp.text.substring(0, 36)}...
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => handleSendMessage(e)}
          className="p-3 bg-[#061014] border-t border-cyan-950 flex items-center gap-2"
        >
          <div className="px-2 py-1 text-cyan-400 font-mono font-bold text-xs">
            root@web4:~$
          </div>
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask ${selectedRole} anything... (e.g. Deploy 1000T supply, Audit Howey Test, Verify PQC)`}
            className="flex-1 bg-transparent border-none text-cyan-200 font-mono text-xs focus:outline-none placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isThinking}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>EXECUTE</span>
          </button>
        </form>
      </div>
    </div>
  );
};
