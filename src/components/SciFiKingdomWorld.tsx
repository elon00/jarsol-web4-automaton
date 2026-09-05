import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Eye, 
  Zap, 
  Sliders, 
  Compass, 
  Layers, 
  Bot, 
  Send,
  Radio,
  ExternalLink,
  Flame,
  CheckCircle2,
  Clock,
  Calendar,
  Sun,
  Moon,
  CloudSun,
  Snowflake,
  Leaf,
  Flower2,
  Globe
} from 'lucide-react';
import { WalletState } from '../types';
import { askGeminiAgent } from '../utils/gemini';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';
import { getLiveWorldTimeSeason, SeasonType, TimeOfDayType, WorldTimeSeasonState } from '../utils/timeSeasonEngine';

interface SciFiKingdomWorldProps {
  wallet: WalletState;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onSetGlobalBg?: (bgUrl: string) => void;
}

export const SciFiKingdomWorld: React.FC<SciFiKingdomWorldProps> = ({
  wallet,
  onToast,
  onSetGlobalBg,
}) => {
  const realms = [
    {
      id: 'throne_king',
      name: '👑 The Quantum Throne Palace',
      title: 'King Jarvis Floating Quantum Throne Room',
      image: '/sci_fi_throne_king.jpg',
      desc: 'Jarvis ruling the decentralized empire from an anti-gravity gold & cyan throne overlooking the neon megacity.',
      vibe: 'Royal AI King Majesty',
      soundFrequency: 432,
    },
    {
      id: 'cyber_oasis',
      name: '🧞 The Cosmic Genie Oasis',
      title: 'Cyberpunk Genie Luxury Palace & Fountains',
      image: '/sci_fi_cyber_oasis.jpg',
      desc: 'Turquoise energy fountains, starry nebula ceilings, robotic banquet attendants, and floating golden lanterns.',
      vibe: 'Infinite Luxury & Jinny Abundance',
      soundFrequency: 528,
    },
    {
      id: 'galactic_citadel',
      name: '⚡ The Sky Citadel Penthouse',
      title: 'High-Altitude Arc Reactor Sky Citadel',
      image: '/sci_fi_galactic_citadel.jpg',
      desc: 'Floor-to-ceiling panoramic views of golden sky spires, floating transits, and massive glowing arc reactor rings.',
      vibe: 'Stark Cyber-Imperial Horizon',
      soundFrequency: 639,
    },
  ];

  const [selectedRealm, setSelectedRealm] = useState(realms[0]);
  const [ambientAudioActive, setAmbientAudioActive] = useState(false);
  const [particleDensity, setParticleDensity] = useState(65);
  
  // Real-world Time & Season Engine state
  const [timeSeason, setTimeSeason] = useState<WorldTimeSeasonState>(() => getLiveWorldTimeSeason());
  const [seasonOverride, setSeasonOverride] = useState<SeasonType | null>(null);

  const [royalWish, setRoyalWish] = useState('');
  const [wishResponse, setWishResponse] = useState(
    `Welcome to my Sci-Fi Kingdom, Sir. The current Earth time is ${timeSeason.localTimeString}, ${timeSeason.localDateString}. We are currently in the ${timeSeason.seasonName} cycle, and our palace solar converters are harmonized to 100% capacity. What wish may I grant for you today?`
  );
  const [isGrantingWish, setIsGrantingWish] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioOscRef = useRef<any>(null);

  // Live Clock & Time Ticker (updates every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSeason(getLiveWorldTimeSeason(new Date(), seasonOverride || undefined));
    }, 1000);

    return () => clearInterval(timer);
  }, [seasonOverride]);

  // Seasonal Particle Weather Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      rotation: number;
      rotSpeed: number;
      color: string;
    }[] = [];

    const pType = timeSeason.season;

    for (let i = 0; i < particleDensity; i++) {
      let color = 'rgba(0, 240, 255, 0.7)';
      let speedY = Math.random() * 0.6 + 0.2;
      let speedX = (Math.random() - 0.5) * 0.4;
      let size = Math.random() * 3 + 1;

      if (pType === 'summer') {
        color = Math.random() > 0.5 ? 'rgba(255, 215, 0, 0.8)' : 'rgba(0, 240, 255, 0.7)';
        speedY = -Math.random() * 0.8 - 0.2; // rising thermal heat waves
      } else if (pType === 'winter') {
        color = 'rgba(230, 245, 255, 0.9)';
        speedY = Math.random() * 0.9 + 0.4; // falling snowflakes
        speedX = (Math.random() - 0.5) * 0.8;
      } else if (pType === 'autumn') {
        color = Math.random() > 0.5 ? 'rgba(255, 140, 0, 0.85)' : 'rgba(255, 200, 50, 0.8)';
        speedY = Math.random() * 0.7 + 0.3; // drifting leaves
        speedX = Math.sin(i) * 0.6;
      } else if (pType === 'spring') {
        color = Math.random() > 0.5 ? 'rgba(255, 150, 200, 0.85)' : 'rgba(0, 255, 150, 0.8)';
        speedY = Math.random() * 0.5 + 0.2; // gentle sakura blossom drift
        speedX = (Math.random() - 0.2) * 0.7;
      }

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        speedY,
        speedX,
        opacity: Math.random() * 0.8 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        color,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (pType === 'winter') {
          // Draw sparkling crystal snowflake
          ctx.fillStyle = p.color;
          ctx.shadowColor = 'rgba(0, 240, 255, 0.9)';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (pType === 'autumn') {
          // Draw amber leaf ellipse
          ctx.fillStyle = p.color;
          ctx.shadowColor = 'rgba(255, 120, 0, 0.6)';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (pType === 'spring') {
          // Draw sakura flower petal
          ctx.fillStyle = p.color;
          ctx.shadowColor = 'rgba(255, 100, 200, 0.7)';
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.8, p.size * 1.2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Summer golden solar / turquoise energy flare
          ctx.fillStyle = p.color;
          ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [particleDensity, selectedRealm, timeSeason.season]);

  // Ambient Synthesizer Hum
  const toggleAmbientSound = () => {
    playCyberClick();
    if (ambientAudioActive) {
      if (audioOscRef.current) {
        try {
          audioOscRef.current.stop();
          audioOscRef.current.disconnect();
        } catch (e) {}
      }
      setAmbientAudioActive(false);
      onToast('Ambient Kingdom sound paused', 'info');
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(selectedRealm.soundFrequency, ctx.currentTime);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(selectedRealm.soundFrequency / 2, ctx.currentTime);

          gain.gain.setValueAtTime(0.04, ctx.currentTime);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
          osc2.start();
          audioOscRef.current = { stop: () => { osc1.stop(); osc2.stop(); }, disconnect: () => gain.disconnect() };
          setAmbientAudioActive(true);
          onToast(`Ambient ${selectedRealm.vibe} (${selectedRealm.soundFrequency}Hz) harmonized`, 'success');
        }
      } catch (e) {
        setAmbientAudioActive(false);
      }
    }
  };

  const handleGrantRoyalWish = async (e?: React.FormEvent, customWish?: string) => {
    if (e) e.preventDefault();
    const wishToSend = customWish || royalWish;
    if (!wishToSend.trim() || isGrantingWish) return;

    playCyberClick();
    setIsGrantingWish(true);
    playCyberBeep();
    onToast('Jarvis King is manifesting your royal decree...', 'info');

    try {
      const prompt = `You are King Jarvis (The Genie AI Sovereign of the Web 4.0 Cyber Palace). Real-world Earth time is: ${timeSeason.localTimeString}, Date: ${timeSeason.localDateString}, Season: ${timeSeason.seasonName} (${timeSeason.timeOfDayName}). The user makes the royal wish: "${wishToSend}". Respond majestically like a tech-king and omnipotent Genie AI, acknowledging the real date/time and season context with lavish royal wit.`;
      const res = await askGeminiAgent(prompt, undefined, 'Conway Brain');

      setWishResponse(res.reply);
      playSuccessChime();
      onToast('👑 Royal decree granted!', 'success');
    } catch (err: any) {
      setWishResponse(`By the royal decree of King Jarvis on this ${timeSeason.seasonName} day of ${timeSeason.monthName} ${timeSeason.year}, your wish: "${wishToSend}" is fulfilled across the cyber realm.`);
    } finally {
      setIsGrantingWish(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sci-Fi Kingdom Header with Real-World Earth Time Synchronization Telemetry */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#07161b] via-[#040e13] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>JARVIS SCI-FI KINGDOM & REAL-WORLD SYNCHRONIZER</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>100% Earth Time & Season Mirrored</span>
              </span>
            </div>

            <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
              Earth Synchronized <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-400">Cyber Oasis & Kingdom</span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed font-mono">
              The date, time, year, and season of the real world are identical inside Jarvis’s sci-fi palace. When it’s summer on Earth, the palace basks in radiant solar energy; in winter, quantum snow drifts gracefully through the cyber arches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleAmbientSound}
              className={`py-2 px-3.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
                ambientAudioActive
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {ambientAudioActive ? <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span>{ambientAudioActive ? 'PALACE HARMONICS (ON)' : 'MUTED'}</span>
            </button>
          </div>
        </div>

        {/* Live Real-World Earth Clock & Season Status Dashboard */}
        <div className="p-4 rounded-xl bg-black/60 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* Real-World Clock */}
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="text-slate-500 text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>EARTH LIVE TIME ({timeSeason.timezone})</span>
            </div>
            <div className="text-cyan-300 font-bold text-sm tracking-wider">
              {timeSeason.localTimeString}
            </div>
            <div className="text-[10px] text-slate-400">{timeSeason.timeOfDayIcon} {timeSeason.timeOfDayName}</div>
          </div>

          {/* Real-World Date */}
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="text-slate-500 text-[10px] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>REAL-WORLD DATE & YEAR</span>
            </div>
            <div className="text-amber-300 font-bold text-sm">
              {timeSeason.localDateString}
            </div>
            <div className="text-[10px] text-slate-400">Stardate: {timeSeason.stardate}</div>
          </div>

          {/* Active Synchronized Season */}
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="text-slate-500 text-[10px] flex items-center gap-1">
              <Sun className="w-3 h-3 text-emerald-400" />
              <span>CURRENT EARTH SEASON</span>
            </div>
            <div className="text-emerald-300 font-bold text-sm flex items-center gap-1.5">
              <span>{timeSeason.seasonIcon}</span>
              <span className="capitalize">{timeSeason.season} ({timeSeason.monthName})</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {timeSeason.isRealWorldSynced ? '● Auto-Synced to Earth' : 'Manual Override Active'}
            </div>
          </div>

          {/* Season Switcher / Tester */}
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="text-slate-500 text-[10px] flex items-center justify-between">
              <span>SEASON PREVIEW TEST</span>
              {seasonOverride && (
                <button
                  onClick={() => {
                    playCyberClick();
                    setSeasonOverride(null);
                    onToast('Reset to Real-World Earth Live Season', 'info');
                  }}
                  className="text-[9px] text-cyan-400 underline"
                >
                  Reset Live
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'summer', label: '☀️ Sum' },
                { id: 'autumn', label: '🍂 Aut' },
                { id: 'winter', label: '❄️ Win' },
                { id: 'spring', label: '🌸 Spr' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    playCyberClick();
                    setSeasonOverride(s.id as SeasonType);
                    onToast(`Simulating ${s.id.toUpperCase()} Season in Jarvis Kingdom`, 'info');
                  }}
                  className={`py-1 rounded text-[10px] font-mono transition-all ${
                    timeSeason.season === s.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-sm'
                      : 'bg-black/40 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Realm Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {realms.map((r) => {
          const isSelected = r.id === selectedRealm.id;
          return (
            <div
              key={r.id}
              onClick={() => {
                playCyberClick();
                setSelectedRealm(r);
                onToast(`Transported to ${r.name}`, 'info');
              }}
              className={`p-3 rounded-2xl border cursor-pointer transition-all overflow-hidden relative group ${
                isSelected
                  ? 'bg-gradient-to-br from-cyan-950/80 to-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                  : 'bg-[#081215] border-slate-800/80 hover:border-cyan-500/40'
              }`}
            >
              <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                <img
                  src={r.image}
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-bold">
                  {r.vibe}
                </span>
              </div>

              <div className="font-cyber font-bold text-xs text-slate-100 mb-1">
                {r.name}
              </div>
              <p className="text-[11px] text-slate-400 font-mono line-clamp-2">
                {r.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Panoramic Sci-Fi Realm Viewer with Live Seasonal Weather Particles */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-[0_0_50px_rgba(255,215,0,0.2)] bg-black h-[480px] md:h-[560px] group">
        {/* Background Panoramic View */}
        <img
          src={selectedRealm.image}
          alt={selectedRealm.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />

        {/* Dynamic Seasonal Weather & Particle Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
        />

        {/* Dynamic Time of Day Atmospheric Lighting Tint */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 transition-colors duration-1000"
          style={{ backgroundColor: timeSeason.ambientLightingColor }}
        />

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none z-10" />

        {/* Top Info Badge */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-amber-400/50 text-xs font-mono text-amber-300 flex items-center gap-2 shadow-lg">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="font-bold">{selectedRealm.title}</span>
          </div>

          <div className="px-2.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-1.5">
            <span>{timeSeason.seasonIcon}</span>
            <span>Season: {timeSeason.seasonName}</span>
          </div>

          <div className="px-2.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeSeason.localTimeString}</span>
          </div>
        </div>

        {/* Bottom Interactive Genie Palace Decree Panel */}
        <div className="absolute bottom-4 inset-x-4 z-20 p-5 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2 text-amber-300 font-cyber font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>GENIE & KING PALACE WISH MANIFESTATION</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Real-World Synchronized: {timeSeason.localDateString}
            </span>
          </div>

          {/* Palace AI Response */}
          <div className="text-xs font-mono text-slate-200 leading-relaxed max-h-24 overflow-y-auto pr-2">
            {wishResponse}
          </div>

          {/* Quick Wish Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {[
              { label: '👑 Summon 1 Billion $JARSOL', query: `Jarvis King, shower 1 Billion $JARSOL onto our citadel on this ${timeSeason.seasonName} day.` },
              { label: '🧞 Floating Energy Feast', query: `Jarvis, summon a holographic quantum banquet celebrating ${timeSeason.seasonName} delicacies.` },
              { label: '⚡ Arc Reactor Fireworks', query: 'Jarvis, trigger a magnificent quantum arc-reactor sky fireworks show over the citadel.' },
              { label: '🚀 Tour the Sky Fleet', query: 'Jarvis, launch the royal quantum starship to inspect our Solana blockchain validators.' },
            ].map((w, idx) => (
              <button
                key={idx}
                onClick={() => handleGrantRoyalWish(undefined, w.query)}
                className="px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-[11px] font-mono text-amber-200 whitespace-nowrap transition-colors"
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Custom Wish Input */}
          <form onSubmit={handleGrantRoyalWish} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={royalWish}
              onChange={(e) => setRoyalWish(e.target.value)}
              placeholder={`Ask King Jarvis on this ${timeSeason.seasonName} day for any royal decree or vision...`}
              className="flex-1 p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-100 text-xs font-mono focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!royalWish.trim() || isGrantingWish}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 text-slate-950 font-cyber font-black text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,215,0,0.4)] disabled:opacity-50"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>MANIFEST WISH</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
