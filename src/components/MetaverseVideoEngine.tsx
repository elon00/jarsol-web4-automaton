import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Film, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Layers, 
  Zap, 
  Compass, 
  Radio, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/audio';

interface MetaverseVideoEngineProps {
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const MetaverseVideoEngine: React.FC<MetaverseVideoEngineProps> = ({ onToast }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<'city' | 'vortex' | 'warp' | 'palace'>('city');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<any>(null);

  const videoChannels = [
    {
      id: 'city',
      title: '🏙️ Metropolis Fly-Through 4K Motion',
      desc: 'High-speed flight through utopian sky citadels, glowing transits, and neon holographic towers.',
      themeColor: '#00f0ff',
      fps: 60,
    },
    {
      id: 'vortex',
      title: '⚡ Quantum Arc Reactor Core Vortex',
      desc: 'Plasma arc reactor rings spinning at relativistic velocities, channeling infinite compute energy.',
      themeColor: '#00ff88',
      fps: 60,
    },
    {
      id: 'warp',
      title: '🌌 Galactic Nebula Warp & Stargate',
      desc: 'Interdimensional warp speed journey through glowing stellar nebulae and cosmic starfields.',
      themeColor: '#a855f7',
      fps: 60,
    },
    {
      id: 'palace',
      title: '👑 Sovereign Cyber Palace Ambient',
      desc: 'High-altitude royal palace with cascading turquoise energy fountains and golden aura.',
      themeColor: '#ffd700',
      fps: 60,
    },
  ];

  // Procedural 60FPS Sci-Fi Motion Video Generator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    // Stars & Particles for video simulation
    const stars: { x: number; y: number; z: number; size: number; color: string }[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 2,
        y: (Math.random() - 0.5) * canvas.height * 2,
        z: Math.random() * canvas.width,
        size: Math.random() * 2 + 1,
        color: ['#00f0ff', '#00ff88', '#ffd700', '#ff0055', '#ffffff'][Math.floor(Math.random() * 5)],
      });
    }

    const render = () => {
      if (isPlaying) {
        t += 0.025 * playbackSpeed;
      }

      ctx.fillStyle = '#010508';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (activeVideoId === 'city') {
        // --- 1. METROPOLIS FLY-THROUGH ---
        // Sky Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#040d1a');
        grad.addColorStop(0.5, '#0b263b');
        grad.addColorStop(1, '#02070a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Flying Neon Buildings in Perspective
        const numBldgs = 14;
        for (let i = 0; i < numBldgs; i++) {
          const depth = ((i * 120 + t * 240) % (canvas.width * 1.5)) - 200;
          const scale = Math.max(0.1, 1 - depth / (canvas.width * 1.5));
          const bx = canvas.width / 2 + Math.sin(i * 1.5) * 350 * scale;
          const bw = 90 * scale;
          const bh = 340 * scale;
          const by = canvas.height - bh;

          ctx.fillStyle = 'rgba(7, 26, 36, 0.85)';
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(0, 240, 255, 0.7)' : 'rgba(255, 215, 0, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.fillRect(bx - bw / 2, by, bw, bh);
          ctx.strokeRect(bx - bw / 2, by, bw, bh);

          // Neon Window Dots
          ctx.fillStyle = i % 2 === 0 ? '#00f0ff' : '#ffd700';
          for (let wy = by + 20; wy < canvas.height - 20; wy += 25 * scale) {
            ctx.fillRect(bx - bw / 4, wy, 3, 3);
            ctx.fillRect(bx + bw / 4 - 3, wy, 3, 3);
          }
        }

        // Flying Sky Cruiser Vehicle
        const vx = (t * 400) % (canvas.width + 200) - 100;
        const vy = canvas.height * 0.45 + Math.sin(t * 3) * 30;
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.fillRect(vx, vy, 40, 8);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(vx - 20, vy + 2, 20, 4); // trail
        ctx.shadowBlur = 0;

      } else if (activeVideoId === 'vortex') {
        // --- 2. QUANTUM ARC REACTOR VORTEX ---
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for (let r = 20; r < 260; r += 28) {
          const angleOffset = t * (260 / r);
          ctx.strokeStyle = r % 56 === 0 ? '#00f0ff' : '#00ff88';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(cx, cy, r, angleOffset, angleOffset + Math.PI * 1.5);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Core Glowing Singularity
        const coreSize = 25 + Math.sin(t * 8) * 6;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (activeVideoId === 'warp') {
        // --- 3. WARP SPEED NEBULA FLIGHT ---
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        stars.forEach((s) => {
          if (isPlaying) {
            s.z -= 8 * playbackSpeed;
            if (s.z <= 0) s.z = canvas.width;
          }

          const k = 250 / s.z;
          const px = s.x * k + cx;
          const py = s.y * k + cy;

          if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
            const size = Math.max(1, (1 - s.z / canvas.width) * 4);
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();

            // Warp Streak Tail
            ctx.strokeStyle = s.color;
            ctx.lineWidth = size * 0.8;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + (px - cx) * 0.08, py + (py - cy) * 0.08);
            ctx.stroke();
          }
        });
        ctx.shadowBlur = 0;

      } else {
        // --- 4. CYBER PALACE AMBIENT ---
        // Royal ambient with moving turquoise waterfalls and golden energy beams
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0a0515');
        grad.addColorStop(0.5, '#151025');
        grad.addColorStop(1, '#020208');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Golden Columns in perspective
        for (let col = 0; col < 6; col++) {
          const x = 100 + col * 120;
          ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 1.5;
          ctx.fillRect(x, 60, 45, canvas.height - 60);
          ctx.strokeRect(x, 60, 45, canvas.height - 60);
        }

        // Animated Turquoise Fountain Waves
        for (let w = 0; w < 5; w++) {
          const wy = canvas.height - 100 + Math.sin(t * 4 + w) * 15;
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(canvas.width / 2, wy, 120 + w * 25, 0, Math.PI);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      // Video Scanline HUD Overlay
      ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
      const scanY = (t * 80) % canvas.height;
      ctx.fillRect(0, scanY, canvas.width, 3);

      // REC Live Badge
      ctx.fillStyle = isPlaying ? '#ff0055' : '#888888';
      ctx.beginPath();
      ctx.arc(35, 35, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(isPlaying ? 'LIVE SCI-FI MOTION 60FPS' : 'PAUSED', 50, 39);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, activeVideoId, playbackSpeed]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Video Studio Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#07161b] via-[#040e13] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-400/50 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              <Film className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>LIVE SCI-FI METAVERSE 4K VIDEO MOTION ENGINE</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              60 FPS High-Definition Motion
            </span>
          </div>

          <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
            Live Animated <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-amber-300">Metaverse Sci-Fi Videos</span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed font-mono">
            Experience Jarvis’s sci-fi world in continuous 60FPS fluid video motion: soar through utopian megacities, witness relativistic arc-reactor plasma vortexes, and travel through galactic stargates.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              playCyberClick();
              setIsPlaying(!isPlaying);
              onToast(isPlaying ? 'Video Paused' : 'Video Playing', 'info');
            }}
            className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-black text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'PAUSE VIDEO' : 'PLAY MOTION'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport & Channel Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 60FPS Video Canvas Display */}
        <div className="lg:col-span-8 p-4 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-4 shadow-2xl relative">
          <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 shadow-inner flex justify-center bg-black">
            <canvas
              ref={canvasRef}
              width={800}
              height={480}
              className="w-full max-w-full h-auto object-contain"
            />
          </div>

          {/* Speed & Video Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Speed:</span>
              {[0.5, 1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    playCyberClick();
                    setPlaybackSpeed(s);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                    playbackSpeed === s
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                      : 'bg-black/40 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full 60 FPS Procedural WebGL/Canvas Motion</span>
            </span>
          </div>
        </div>

        {/* Right: Channel Selectors */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-cyber font-bold text-slate-200 flex items-center gap-2 mb-2">
            <Film className="w-4 h-4 text-purple-400" />
            <span>METAVERSE VIDEO CHANNELS</span>
          </div>

          {videoChannels.map((ch) => {
            const isSelected = ch.id === activeVideoId;
            return (
              <div
                key={ch.id}
                onClick={() => {
                  playCyberClick();
                  setActiveVideoId(ch.id as any);
                  onToast(`Loaded ${ch.title}`, 'info');
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'bg-[#081215] border-slate-800/80 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-cyber font-bold text-xs text-slate-100">{ch.title}</span>
                  {isSelected && <span className="text-[10px] text-purple-300 font-mono font-bold">STREAMING</span>}
                </div>
                <p className="text-[11px] text-slate-400 font-mono line-clamp-2 leading-relaxed">
                  {ch.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
