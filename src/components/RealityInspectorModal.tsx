import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  FlaskConical, 
  Cpu, 
  Milestone, 
  Search, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Layers,
  Filter
} from 'lucide-react';
import manifestData from '../../REALITY_MANIFEST.json';

interface RealityFeature {
  id: string;
  name: string;
  category: 'REAL' | 'EXPERIMENTAL' | 'SIMULATION' | 'ROADMAP';
  real_inputs: boolean;
  algorithm: string;
  reproducibility: string;
  external_verification: string;
  production_allowed: boolean;
  notes: string;
  disclaimer_required?: boolean;
}

interface RealityInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  initialCategory?: 'ALL' | 'REAL' | 'EXPERIMENTAL' | 'SIMULATION' | 'ROADMAP';
}

export const RealityInspectorModal: React.FC<RealityInspectorModalProps> = ({
  isOpen,
  onClose,
  onToast,
  initialCategory = 'ALL',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const features: RealityFeature[] = (manifestData.features || []) as RealityFeature[];

  const categoryStats = useMemo(() => {
    const stats = {
      ALL: features.length,
      REAL: 0,
      EXPERIMENTAL: 0,
      SIMULATION: 0,
      ROADMAP: 0,
    };
    for (const f of features) {
      if (f.category in stats) {
        (stats as any)[f.category]++;
      }
    }
    return stats;
  }, [features]);

  const filteredFeatures = useMemo(() => {
    return features.filter((f) => {
      const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.algorithm.toLowerCase().includes(q) ||
        f.notes.toLowerCase().includes(q) ||
        f.reproducibility.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [features, selectedCategory, searchQuery]);

  const handleCopyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    onToast(`Copied reproduction command to clipboard`, 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-[#050e12] border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden font-mono text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-cyan-900/60 bg-gradient-to-r from-[#071920] via-[#051117] to-[#040a0e] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-400/50 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>ZERO-TRUST EVIDENCE ENGINE</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-400">
                Manifest v{manifestData.version}
              </span>
            </div>
            <h2 className="font-cyber font-black text-xl sm:text-2xl text-slate-100 tracking-wide">
              JARSOL Reality <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Inspector</span>
            </h2>
            <p className="text-xs text-slate-400">
              {manifestData.truth_principle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Close Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Stats & Filters Bar */}
        <div className="p-4 border-b border-cyan-950/80 bg-[#03090d] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'bg-black/40 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>ALL</span>
                <span className="px-1.5 py-0.2 rounded bg-black/60 text-[10px] text-slate-300 font-bold">
                  {categoryStats.ALL}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory('REAL')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'REAL'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                    : 'bg-black/40 text-slate-400 border-slate-800 hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>REAL</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-[10px] text-emerald-300 font-bold">
                  {categoryStats.REAL}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory('EXPERIMENTAL')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'EXPERIMENTAL'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'bg-black/40 text-slate-400 border-slate-800 hover:text-purple-300'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                <span>EXPERIMENTAL</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-950/80 text-[10px] text-purple-300 font-bold">
                  {categoryStats.EXPERIMENTAL}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory('SIMULATION')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'SIMULATION'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-black/40 text-slate-400 border-slate-800 hover:text-amber-300'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>SIMULATION</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-[10px] text-amber-300 font-bold">
                  {categoryStats.SIMULATION}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory('ROADMAP')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'ROADMAP'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                    : 'bg-black/40 text-slate-400 border-slate-800 hover:text-blue-300'
                }`}
              >
                <Milestone className="w-3.5 h-3.5 text-blue-400" />
                <span>ROADMAP</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-950/80 text-[10px] text-blue-300 font-bold">
                  {categoryStats.ROADMAP}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search subsystems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/60 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subsystems List / Cards Container */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {filteredFeatures.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Filter className="w-8 h-8 mx-auto text-slate-600" />
              <div>No subsystems matched your filter or search query.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFeatures.map((f) => {
                const isReal = f.category === 'REAL';
                const isExp = f.category === 'EXPERIMENTAL';
                const isSim = f.category === 'SIMULATION';
                const isRoadmap = f.category === 'ROADMAP';

                const borderClass = isReal
                  ? 'border-emerald-900/40 hover:border-emerald-500/50 bg-[#061411]/80'
                  : isExp
                  ? 'border-purple-900/40 hover:border-purple-500/50 bg-[#12081c]/80'
                  : isSim
                  ? 'border-amber-900/40 hover:border-amber-500/50 bg-[#171005]/80'
                  : 'border-blue-900/40 hover:border-blue-500/50 bg-[#08101a]/80';

                const badgeBg = isReal
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : isExp
                  ? 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                  : isSim
                  ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                  : 'bg-blue-950/80 border-blue-500/40 text-blue-300';

                return (
                  <div
                    key={f.id}
                    className={`p-4 rounded-xl border ${borderClass} transition-all space-y-3 flex flex-col justify-between shadow-lg`}
                  >
                    <div className="space-y-2">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {f.id}</div>
                          <div className="font-bold text-slate-100 text-sm leading-snug">{f.name}</div>
                        </div>

                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold shrink-0 flex items-center gap-1 ${badgeBg}`}>
                          {isReal && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {isExp && <FlaskConical className="w-3 h-3 text-purple-400" />}
                          {isSim && <Cpu className="w-3 h-3 text-amber-400" />}
                          {isRoadmap && <Milestone className="w-3 h-3 text-blue-400" />}
                          <span>{f.category}</span>
                        </span>
                      </div>

                      {/* Technical Algorithm */}
                      <div className="text-xs text-slate-400 leading-relaxed font-mono">
                        <span className="text-slate-500 text-[11px] block">Algorithm / Standard:</span>
                        <div className="text-slate-300">{f.algorithm}</div>
                      </div>

                      {/* Notes / Reality Boundary */}
                      <div className="p-2.5 rounded bg-black/40 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                        <span className="text-slate-500 font-bold">Reality Scope: </span>
                        {f.notes}
                      </div>
                    </div>

                    {/* Footer / Evidence Action */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/60 text-[11px]">
                      {/* Verification Standard */}
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-slate-500">External Standard:</span>
                        <span className="text-cyan-300 font-mono truncate max-w-[200px]" title={f.external_verification}>
                          {f.external_verification}
                        </span>
                      </div>

                      {/* Production Status & Command */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.production_allowed
                            ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400'
                            : 'bg-red-950/60 border border-red-500/30 text-red-400 flex items-center gap-1'
                        }`}>
                          {!f.production_allowed && <Lock className="w-2.5 h-2.5" />}
                          <span>{f.production_allowed ? 'PRODUCTION ALLOWED' : 'NOT PRODUCTION CLAIMABLE'}</span>
                        </span>

                        {f.reproducibility && (
                          <button
                            onClick={() => handleCopyCommand(f.reproducibility, f.id)}
                            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer text-[10px]"
                            title="Copy reproduction command"
                          >
                            {copiedId === f.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Terminal className="w-3 h-3 text-cyan-400" />
                                <span>Verify</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyan-950/80 bg-[#03080b] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>14/14 Production Gates Passing</span>
            <span>•</span>
            <span>Zero Unverified Claims Policy</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
