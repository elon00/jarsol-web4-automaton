import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Download, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Copy, 
  Check, 
  FileText 
} from 'lucide-react';
import { WHITEPAPER_CHAPTERS } from '../data/whitepaperData';
import { WhitepaperChapter } from '../types';
import { playCyberClick } from '../utils/audio';

interface WhitepaperReaderProps {
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const WhitepaperReader: React.FC<WhitepaperReaderProps> = ({ onToast }) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(WHITEPAPER_CHAPTERS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const selectedChapter = WHITEPAPER_CHAPTERS.find((c) => c.id === selectedChapterId) || WHITEPAPER_CHAPTERS[0];

  const filteredChapters = WHITEPAPER_CHAPTERS.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.sections.some((s) => s.heading.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
    );
  });

  const exportMarkdown = () => {
    playCyberClick();
    let md = `# JARSOL // CONWAY AUTOMATON 4.0 WHITEPAPER\n\n`;
    md += `**Total Supply**: 1,000,000,000,000,000 $JARSOL SPL-2022\n`;
    md += `**Neural Architecture**: Google Gemini 3.7 Flash Engine\n`;
    md += `**Quantum Standard**: NIST FIPS 203 & 204 Post-Quantum Lattice\n\n---\n\n`;

    WHITEPAPER_CHAPTERS.forEach((ch) => {
      md += `## Chapter ${ch.number}: ${ch.title}\n*${ch.subtitle}*\n\n> ${ch.summary}\n\n`;
      ch.sections.forEach((sec) => {
        md += `### ${sec.heading}\n\n${sec.content}\n\n`;
        if (sec.keyPoints) {
          sec.keyPoints.forEach((kp) => {
            md += `- ${kp}\n`;
          });
          md += `\n`;
        }
      });
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JarSol_Whitepaper_v4.0.md`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Exported full Whitepaper to Markdown', 'success');
  };

  const copyChapterText = () => {
    let text = `# Chapter ${selectedChapter.number}: ${selectedChapter.title}\n\n${selectedChapter.summary}\n\n`;
    selectedChapter.sections.forEach((s) => {
      text += `## ${s.heading}\n\n${s.content}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onToast(`Copied Chapter ${selectedChapter.number} to clipboard`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#07161b] via-[#040e13] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>OFFICIAL PROTOCOL SPECIFICATION</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                6 Full Technical Chapters
              </span>
            </div>

            <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
              JarSol Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Whitepaper</span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed font-mono">
              The foundational blueprint for the Web 4.0 Autonomous Agent Operating System, 1,000 Trillion SPL Token-2022 Tokenomics, NIST Post-Quantum Cryptography, and Howey Double-Audit Compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportMarkdown}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-cyber font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT FULL WHITEPAPER (.MD)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reader Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Chapter Index */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute top-3 left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search whitepaper terms..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-900/60 text-cyan-200 text-xs font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-2">
            {filteredChapters.map((ch) => {
              const isSelected = ch.id === selectedChapterId;
              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    playCyberClick();
                    setSelectedChapterId(ch.id);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] text-slate-100'
                      : 'bg-[#081215] border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 font-bold mb-1">
                    <span>CHAPTER {ch.number}</span>
                    <span>{ch.readTime}</span>
                  </div>
                  <div className="font-cyber font-bold text-xs text-slate-100 line-clamp-1">
                    {ch.title}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono line-clamp-2 mt-1">
                    {ch.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Viewer */}
        <div className="lg:col-span-8 p-6 md:p-8 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-950/80 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                CHAPTER {selectedChapter.number} // {selectedChapter.readTime}
              </span>
              <h2 className="font-cyber font-black text-xl text-slate-100 mt-1">
                {selectedChapter.title}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {selectedChapter.subtitle}
              </p>
            </div>

            <button
              onClick={copyChapterText}
              className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Chapter</span>
            </button>
          </div>

          {/* Chapter Summary Alert */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono text-cyan-200 leading-relaxed">
            <strong className="text-cyan-400 block mb-1">Executive Chapter Summary:</strong>
            {selectedChapter.summary}
          </div>

          {/* Sections */}
          <div className="space-y-6 font-mono text-xs">
            {selectedChapter.sections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="font-cyber font-bold text-sm text-cyan-300 border-b border-slate-800 pb-1.5">
                  {sec.heading}
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line text-xs">
                  {sec.content}
                </p>

                {sec.keyPoints && (
                  <div className="p-3 rounded-lg bg-black/40 border border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold block">Key Cryptographic & Economic Takeaways:</span>
                    {sec.keyPoints.map((kp, kIdx) => (
                      <div key={kIdx} className="flex items-start gap-2 text-[11px] text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{kp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
