import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Zap, 
  Activity, 
  Maximize2, 
  Sliders,
  Flame
} from 'lucide-react';
import { playCyberClick } from '../utils/audio';

interface ConwayLifeCanvasProps {
  onMetabolismChange: (vitality: number) => void;
  onToast?: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const ROWS = 50;
const COLS = 80;

export const ConwayLifeCanvas: React.FC<ConwayLifeCanvasProps> = ({
  onMetabolismChange,
  onToast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [activeCells, setActiveCells] = useState(0);
  const [speedMs, setSpeedMs] = useState(75); // Interval in ms
  const [preset, setPreset] = useState<string>('gosper');

  // Grid state stored in ref for rapid animation loop
  const gridRef = useRef<Uint8Array>(new Uint8Array(ROWS * COLS));
  const nextGridRef = useRef<Uint8Array>(new Uint8Array(ROWS * COLS));
  const animFrameId = useRef<number | null>(null);
  const lastTickTime = useRef<number>(0);

  // Helper to index 1D array
  const getIdx = (r: number, c: number) => (r + ROWS) % ROWS * COLS + (c + COLS) % COLS;

  // Preset initializers
  const loadPreset = useCallback((presetName: string) => {
    const grid = new Uint8Array(ROWS * COLS);

    if (presetName === 'random') {
      for (let i = 0; i < ROWS * COLS; i++) {
        grid[i] = Math.random() > 0.82 ? 1 : 0;
      }
    } else if (presetName === 'gosper') {
      // Gosper Glider Gun pattern
      const coords = [
        [5,1],[5,2],[6,1],[6,2],
        [5,11],[6,11],[7,11],[4,12],[3,13],[3,14],[8,12],[9,13],[9,14],
        [6,15],[4,16],[8,16],[5,17],[6,17],[7,17],[6,18],
        [3,21],[4,21],[5,21],[3,22],[4,22],[5,22],[2,23],[6,23],[1,25],[2,25],[6,25],[7,25],
        [3,35],[4,35],[3,36],[4,36]
      ];
      coords.forEach(([r, c]) => {
        grid[getIdx(r + 10, c + 15)] = 1;
      });
    } else if (presetName === 'pulsar') {
      // Pulsar oscillator
      const p = [
        [2,4],[2,5],[2,6],[2,10],[2,11],[2,12],
        [7,4],[7,5],[7,6],[7,10],[7,11],[7,12],
        [9,4],[9,5],[9,6],[9,10],[9,11],[9,12],
        [14,4],[14,5],[14,6],[14,10],[14,11],[14,12],
        [4,2],[5,2],[6,2],[10,2],[11,2],[12,2],
        [4,7],[5,7],[6,7],[10,7],[11,7],[12,7],
        [4,9],[5,9],[6,9],[10,9],[11,9],[12,9],
        [4,14],[5,14],[6,14],[10,14],[11,14],[12,14]
      ];
      p.forEach(([r, c]) => {
        grid[getIdx(r + 15, c + 30)] = 1;
      });
    } else if (presetName === 'acorn') {
      // Acorn methuselah
      const acorn = [[1,2],[2,4],[3,1],[3,2],[3,5],[3,6],[3,7]];
      acorn.forEach(([r, c]) => {
        grid[getIdx(r + 20, c + 35)] = 1;
      });
    } else if (presetName === 'pentadecathlon') {
      // Pentadecathlon period 15 oscillator
      for (let c = 0; c < 10; c++) {
        if (c === 2 || c === 7) continue;
        grid[getIdx(25, 35 + c)] = 1;
      }
      grid[getIdx(24, 37)] = 1;
      grid[getIdx(26, 37)] = 1;
      grid[getIdx(24, 42)] = 1;
      grid[getIdx(26, 42)] = 1;
    }

    gridRef.current = grid;
    setGeneration(0);
  }, []);

  // Initialize with Gosper Gun on mount
  useEffect(() => {
    loadPreset('gosper');
  }, [loadPreset]);

  // Compute next Conway generation (B3/S23)
  const computeNextGen = useCallback(() => {
    const curr = gridRef.current;
    const next = nextGridRef.current;
    let liveCount = 0;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;

        // Count 8 neighbors
        let neighbors = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nIdx = getIdx(r + dr, c + dc);
            neighbors += curr[nIdx];
          }
        }

        const isAlive = curr[idx] === 1;
        if (isAlive) {
          next[idx] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
        } else {
          next[idx] = neighbors === 3 ? 1 : 0;
        }

        if (next[idx] === 1) {
          liveCount++;
        }
      }
    }

    // Swap buffers
    gridRef.current.set(next);
    setActiveCells(liveCount);
    setGeneration((g) => g + 1);

    // Compute vitality score (0 - 100%)
    const vitality = Math.min(100, Math.max(15, (liveCount / 120) * 100));
    onMetabolismChange(vitality);
  }, [onMetabolismChange]);

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = (time: number) => {
      if (!isMounted) return;

      if (isRunning && time - lastTickTime.current > speedMs) {
        computeNextGen();
        lastTickTime.current = time;
      }

      // Draw Grid
      const width = canvas.width;
      const height = canvas.height;
      const cellW = width / COLS;
      const cellH = height / ROWS;
      const grid = gridRef.current;

      // Dark background
      ctx.fillStyle = '#03080b';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = '#08171f';
      ctx.lineWidth = 0.5;
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cellH);
        ctx.lineTo(width, r * cellH);
        ctx.stroke();
      }
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellW, 0);
        ctx.lineTo(c * cellW, height);
        ctx.stroke();
      }

      // Draw Living Cells with Neon Cyber Glow
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.7)';
      ctx.shadowBlur = 6;

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r * COLS + c] === 1) {
            ctx.fillRect(c * cellW + 0.5, r * cellH + 0.5, cellW - 1, cellH - 1);
          }
        }
      }

      ctx.shadowBlur = 0; // Reset blur for performance
      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, speedMs, computeNextGen]);

  // Interactive Click on Canvas to toggle cell
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;

    const c = Math.floor((x / rect.width) * COLS);
    const r = Math.floor((y / rect.height) * ROWS);

    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      playCyberClick();
      const idx = r * COLS + c;
      gridRef.current[idx] = gridRef.current[idx] === 1 ? 0 : 1;
      setActiveCells((prev) => (gridRef.current[idx] === 1 ? prev + 1 : prev - 1));
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Controls Card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-900/60 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-cyber font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>Conway Automaton Matrix (B3/S23)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
                Entropy Engine
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Cellular vitality generates on-chain cryptographic entropy and drives AI Agent metabolism
            </p>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Generation</span>
            <span className="text-cyan-300 font-bold">{generation.toLocaleString()}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Active Cells</span>
            <span className="text-emerald-400 font-bold">{activeCells}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Grid Dimensions</span>
            <span className="text-slate-300">{COLS} x {ROWS}</span>
          </div>
        </div>
      </div>

      {/* Interactive Canvas Container */}
      <div className="relative rounded-2xl bg-[#03080b] border-2 border-cyan-500/40 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] group">
        <canvas
          ref={canvasRef}
          width={960}
          height={480}
          onClick={handleCanvasClick}
          className="w-full h-[360px] md:h-[480px] cursor-crosshair block"
        />

        {/* Overlay Overlay Info */}
        <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>CLICK CELLS TO INJECT ENTROPY</span>
          </div>
        </div>

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/30">
          <button
            onClick={() => {
              playCyberClick();
              setIsRunning(!isRunning);
            }}
            className={`p-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'PAUSE' : 'RESUME'}</span>
          </button>

          <button
            onClick={() => {
              playCyberClick();
              computeNextGen();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
            title="Step 1 Generation"
          >
            STEP
          </button>

          <button
            onClick={() => {
              playCyberClick();
              loadPreset(preset);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
            title="Reset Grid"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Selector & Speed Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Presets */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mathematical Pattern Presets</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'gosper', label: 'Gosper Glider Gun' },
              { id: 'pulsar', label: 'Pulsar Oscillator' },
              { id: 'acorn', label: 'Acorn Methuselah' },
              { id: 'pentadecathlon', label: 'Pentadecathlon' },
              { id: 'random', label: 'Quantum Random' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  playCyberClick();
                  setPreset(p.id);
                  loadPreset(p.id);
                }}
                className={`py-2 px-2.5 rounded-lg text-xs font-mono text-left transition-all border ${
                  preset === p.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'bg-black/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Slider */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulation Clock Frequency</span>
            </span>
            <span className="text-cyan-300 font-bold">{Math.round(1000 / speedMs)} FPS ({speedMs}ms)</span>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            step="10"
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Fast (50 FPS)</span>
            <span>Balanced (13 FPS)</span>
            <span>Slow (3 FPS)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
