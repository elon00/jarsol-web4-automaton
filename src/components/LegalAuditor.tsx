import React from 'react';
import { FileText, Lock, Scale } from 'lucide-react';

interface LegalAuditorProps {
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const LegalAuditor: React.FC<LegalAuditorProps> = () => (
  <section className="rounded-2xl border border-cyan-500/40 bg-[#07161b] p-6 space-y-5">
    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100"><Scale className="text-cyan-400" /> Review and acceptance</h1>
    <p className="text-slate-300">Legal review has not been performed by this application. It does not issue compliance ratings, legal approvals or a production certificate.</p>
    <button type="button" disabled className="flex items-center gap-2 rounded border border-slate-700 px-4 py-3 text-slate-400 cursor-not-allowed">
      <Lock className="w-4 h-4" /> Automated legal review unavailable
    </button>
    <ul className="space-y-2 text-sm text-slate-400">
      <li>Independent security review: pending.</li>
      <li>Token, marketing and licensing review: pending.</li>
      <li>Deployment and operating acceptance: pending.</li>
      <li>Customer and market acceptance: pending.</li>
    </ul>
    <p className="text-sm text-slate-400">Software tests and repository documents provide technical evidence. They do not establish legal status or customer acceptance.</p>
    <a href="https://github.com/elon00/jarsol-web4-automaton/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-cyan-300">
      <FileText className="w-4 h-4" /> Read the verification documentation
    </a>
  </section>
);
