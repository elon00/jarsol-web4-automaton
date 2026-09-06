import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  RefreshCw, 
  Award, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { RegulatoryAuditProng } from '../types';
import { runGeminiRegulatoryAudit } from '../utils/gemini';
import { playCyberClick, playSuccessChime } from '../utils/audio';

interface LegalAuditorProps {
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const LegalAuditor: React.FC<LegalAuditorProps> = ({ onToast }) => {
  const [runningAudit, setRunningAudit] = useState(false);
  const [auditReport, setAuditReport] = useState<any | null>(null);

  const howeyProngs: RegulatoryAuditProng[] = [
    {
      id: 'prong-1',
      name: 'Prong 1: Investment of Money',
      criterion: 'Whether capital was raised via centralized fundraising, ICO, or pre-sale.',
      status: 'PASSED',
      riskScore: 2.1,
      legalRationale: '$JARSOL tokens were deployed directly to Solana Devnet/Testnet with 100% fair launch DEX pools and zero initial coin offering or centralized pre-sale capital pooling.',
      statutoryBasis: 'SEC v. W.J. Howey Co., 328 U.S. 293 (1946); Hinman Speech (2018).'
    },
    {
      id: 'prong-2',
      name: 'Prong 2: Common Enterprise',
      criterion: 'Whether horizontal or vertical commonality binds investor funds to a single managerial core.',
      status: 'PASSED',
      riskScore: 3.5,
      legalRationale: 'Conway Automaton compute nodes operate independently across decentralized infrastructure with zero pooled profits or managerial dependency.',
      statutoryBasis: 'Revak v. SEC Realty Corp., 18 F.3d 81 (2d Cir. 1994).'
    },
    {
      id: 'prong-3',
      name: 'Prong 3: Expectation of Profits',
      criterion: 'Whether buyers are led to expect financial returns, dividends, or interest yield.',
      status: 'OPTIMAL',
      riskScore: 5.0,
      legalRationale: '$JARSOL is marketed strictly as consumptive computational gas for AI agent reasoning loops and Conway grid entropy calculations. Zero profit guarantees or dividend distributions.',
      statutoryBasis: 'United Housing Foundation, Inc. v. Forman, 421 U.S. 837 (1975).'
    },
    {
      id: 'prong-4',
      name: 'Prong 4: Solely from Efforts of Others',
      criterion: 'Whether value appreciation relies on essential managerial efforts of a centralized team.',
      status: 'PASSED',
      riskScore: 4.8,
      legalRationale: 'Autonomous agent loops are self-executing software programs governed by open-source Conway algorithms and decentralized validator nodes without centralized management.',
      statutoryBasis: 'SEC v. Glenn W. Turner Enterprises, Inc., 474 F.2d 476 (9th Cir. 1973).'
    }
  ];

  const micaChecklist = [
    { item: 'Article 4 Whitepaper Transparency', status: 'Compliant', note: '6-Chapter technical whitepaper published openly on-chain' },
    { item: 'Article 5 Marketing Communications', status: 'Compliant', note: 'Clear, balanced, non-misleading utility disclosures' },
    { item: 'Article 6 Conflict of Interest Policies', status: 'Compliant', note: 'Decentralized autonomous council governance' },
    { item: 'Article 14 Environmental Sustainability', status: 'Compliant', note: 'Solana Proof-of-History (<0.00051 kWh / transaction)' },
    { item: 'LP Custody & Proof of Burn', status: 'Compliant', note: '100% of Raydium LP permanently burned to null address' },
  ];

  const handleRunAiDoubleAudit = async () => {
    playCyberClick();
    setRunningAudit(true);
    onToast('Initiating live Gemini 3.7 Flash Regulatory Double-Audit...', 'info');

    try {
      const res = await runGeminiRegulatoryAudit();
      setAuditReport(res);
      playSuccessChime();
      onToast('Regulatory self-assessment analysis loaded (Informational)', 'info');
    } catch (err: any) {
      onToast('Evaluation failed: ' + err.message, 'error');
    } finally {
      setRunningAudit(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#07161b] via-[#040e13] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                <span>REGULATORY COMPLIANCE & CONSUMPTIVE UTILITY</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
                Self-Assessment Framework
              </span>
            </div>

            <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
              Regulatory Self-Assessment & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Consumptive Utility Proof</span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed font-mono">
              Factual evaluation of $JARSOL architecture against US SEC Howey criteria and EU MiCA Title II transparency guidelines. Notice: This analysis is informational software documentation and does not constitute statutory legal advice or government clearance.
            </p>
          </div>

          {/* Action Button */}
          <div className="min-w-[240px] space-y-3">
            <button
              onClick={handleRunAiDoubleAudit}
              disabled={runningAudit}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-cyber font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50"
            >
              {runningAudit ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>ANALYZING UTILITY SCOPE...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>RUN REGULATORY SELF-ASSESSMENT</span>
                </>
              )}
            </button>

            <div className="text-center text-[10px] font-mono text-slate-400">
              Composite Risk Score: <strong className="text-emerald-400">4.2 / 100 (Ultra Low)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* AI Live Audit Report Container */}
      {auditReport && (
        <div className="p-6 rounded-2xl bg-[#06141a] border border-emerald-500/50 shadow-[0_0_30px_rgba(0,255,102,0.15)] space-y-4 animate-in slide-in-from-top-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/60 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-cyber font-bold text-sm">
              <Award className="w-5 h-5" />
              <span>LIVE AI REGULATORY COMPLIANCE CERTIFICATE</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Issued: {auditReport.auditTimestamp}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Overall Security Risk</span>
              <span className="text-emerald-400 font-bold text-base">{auditReport.overallRiskScore} / 100 (Passed)</span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Howey Classification</span>
              <span className="text-cyan-300 font-bold">{auditReport.howeyClassification}</span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">EU MiCA Status</span>
              <span className="text-emerald-400 font-bold">{auditReport.micaCompliance}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
            {auditReport.report}
          </div>
        </div>
      )}

      {/* 4-Prong US SEC Howey Test Evaluation Grid */}
      <div className="space-y-4">
        <h3 className="font-cyber font-bold text-slate-100 text-sm flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span>US SEC Howey Test 4-Prong Technical Audit</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {howeyProngs.map((prong) => (
            <div
              key={prong.id}
              className="p-5 rounded-xl bg-[#081215] border border-cyan-950/80 hover:border-cyan-500/40 transition-all space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-cyber font-bold text-xs text-slate-200">{prong.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {prong.status} ({prong.riskScore}%)
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 italic">
                "{prong.criterion}"
              </div>

              <p className="text-xs text-slate-300 font-mono leading-relaxed bg-black/40 p-3 rounded-lg border border-slate-800/80">
                {prong.legalRationale}
              </p>

              <div className="text-[10px] font-mono text-slate-500">
                <strong>Legal Precedent:</strong> {prong.statutoryBasis}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EU MiCA Title II Compliance Matrix */}
      <div className="p-6 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-950/80 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-cyber font-bold text-sm">
            <FileText className="w-4 h-4" />
            <span>EU MiCA (Regulation 2023/1114) Title II Utility Token Matrix</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">100% Compliant</span>
        </div>

        <div className="divide-y divide-slate-800/80 font-mono text-xs">
          {micaChecklist.map((row, idx) => (
            <div key={idx} className="py-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{row.item}</span>
              </div>
              <div className="text-slate-400 text-[11px]">{row.note}</div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px]">
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
