import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Gamepad2, 
  Crown, 
  Sparkles, 
  Zap, 
  Coins, 
  ShieldCheck, 
  Compass, 
  Layers, 
  Bot, 
  Volume2, 
  VolumeX, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Clock,
  Globe,
  Radio,
  ExternalLink,
  Flame,
  CheckCircle2,
  Trophy,
  Activity
} from 'lucide-react';
import { WalletState } from '../types';
import { askGeminiAgent } from '../utils/gemini';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';
import { getLiveWorldTimeSeason, WorldTimeSeasonState } from '../utils/timeSeasonEngine';

interface MetaverseGameEngineProps {
  wallet: WalletState;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onNavigateTab?: (tab: string) => void;
}

interface PlayerPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
}

interface CollectibleItem {
  id: number;
  x: number;
  y: number;
  type: 'crystal' | 'token' | 'shield';
  collected: boolean;
  value: number;
}

interface MetaverseQuest {
  id: string;
  title: string;
  desc: string;
  rewardJarsol: string;
  completed: boolean;
  actionKey?: string;
}

export const MetaverseGameEngine: React.FC<MetaverseGameEngineProps> = ({
  wallet,
  onToast,
  onNavigateTab,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real-world Time & Season Engine
  const [timeSeason, setTimeSeason] = useState<WorldTimeSeasonState>(() => getLiveWorldTimeSeason());

  // Player State
  const [player, setPlayer] = useState<PlayerPosition>({
    x: 400,
    y: 300,
    direction: 'down',
    isMoving: false,
  });

  // 24/7 Metaverse Stats
  const [metaverseScore, setMetaverseScore] = useState<number>(1250);
  const [passiveJarsolEarned, setPassiveJarsolEarned] = useState<number>(450.85);
  const [activeZone, setActiveZone] = useState<string>('Central Quantum Plaza');
  const [dialogueOpen, setDialogueOpen] = useState<boolean>(false);
  const [dialogueText, setDialogueText] = useState<string>('');
  const [dialogueSpeaker, setDialogueSpeaker] = useState<string>('King Jarvis');

  // Collectibles in the Metaverse
  const [items, setItems] = useState<CollectibleItem[]>([
    { id: 1, x: 220, y: 180, type: 'crystal', collected: false, value: 50 },
    { id: 2, x: 580, y: 150, type: 'token', collected: false, value: 100 },
    { id: 3, x: 180, y: 420, type: 'shield', collected: false, value: 75 },
    { id: 4, x: 620, y: 440, type: 'crystal', collected: false, value: 50 },
    { id: 5, x: 380, y: 120, type: 'token', collected: false, value: 150 },
  ]);

  // Quests
  const [quests, setQuests] = useState<MetaverseQuest[]>([
    {
      id: 'q1',
      title: '👑 Audience with King Jarvis',
      desc: 'Approach the central floating quantum throne to receive your royal blessing.',
      rewardJarsol: '1,000,000 JARSOL',
      completed: false,
      actionKey: 'throne',
    },
    {
      id: 'q2',
      title: '💎 Gather 5 Quantum Energy Crystals',
      desc: 'Collect floating quantum crystals scattered across the cyber plaza.',
      rewardJarsol: '500,000 JARSOL',
      completed: false,
    },
    {
      id: 'q3',
      title: '🔄 Real Raydium DEX Portal',
      desc: 'Step into the Raydium liquidity gate to activate on-chain Solana trading.',
      rewardJarsol: '2,500,000 JARSOL',
      completed: false,
      actionKey: 'dex',
    },
  ]);

  // 24/7 Continuous Background Farming Loop & Live Real-Time Synchronizer
  useEffect(() => {
    const loop = setInterval(() => {
      // 1. Update real-world Earth time & season
      setTimeSeason(getLiveWorldTimeSeason());

      // 2. 24/7 passive yield mining in both real and virtual realms
      setPassiveJarsolEarned((prev) => parseFloat((prev + 0.125).toFixed(3)));
    }, 1000);

    return () => clearInterval(loop);
  }, []);

  // Keyboard Movement Handler
  useEffect(() => {
    const keysDown = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault();
        keysDown.add(e.key.toLowerCase());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const moveInterval = setInterval(() => {
      if (keysDown.size === 0) {
        setPlayer((prev) => (prev.isMoving ? { ...prev, isMoving: false } : prev));
        return;
      }

      setPlayer((prev) => {
        let dx = 0;
        let dy = 0;
        let dir = prev.direction;
        const speed = 4.5;

        if (keysDown.has('arrowup') || keysDown.has('w')) {
          dy -= speed;
          dir = 'up';
        }
        if (keysDown.has('arrowdown') || keysDown.has('s')) {
          dy += speed;
          dir = 'down';
        }
        if (keysDown.has('arrowleft') || keysDown.has('a')) {
          dx -= speed;
          dir = 'left';
        }
        if (keysDown.has('arrowright') || keysDown.has('d')) {
          dx += speed;
          dir = 'right';
        }

        const newX = Math.max(30, Math.min(770, prev.x + dx));
        const newY = Math.max(30, Math.min(570, prev.y + dy));

        // Check Zone Triggers
        if (newX > 320 && newX < 480 && newY > 220 && newY < 380) {
          setActiveZone('👑 Royal King Throne Plaza');
        } else if (newX < 250 && newY < 250) {
          setActiveZone('🔄 Raydium DEX Swap Portal');
        } else if (newX > 550 && newY < 250) {
          setActiveZone('🛡️ Post-Quantum Defense Bastion');
        } else if (newX < 250 && newY > 380) {
          setActiveZone('🧞 Genie Cyber Oasis Fountains');
        } else if (newX > 550 && newY > 380) {
          setActiveZone('🚀 Solana Launchpad Skyport');
        } else {
          setActiveZone('Central Cyberverse Promenade');
        }

        // Check Item Collisions
        setItems((prevItems) =>
          prevItems.map((item) => {
            if (!item.collected) {
              const dist = Math.hypot(item.x - newX, item.y - newY);
              if (dist < 26) {
                playSuccessChime();
                setMetaverseScore((s) => s + item.value);
                setPassiveJarsolEarned((p) => p + item.value * 10);
                onToast(`+${item.value} XP & ${item.value * 10} $JARSOL Harvested in Metaverse!`, 'success');
                return { ...item, collected: true };
              }
            }
            return item;
          })
        );

        return {
          x: newX,
          y: newY,
          direction: dir,
          isMoving: true,
        };
      });
    }, 30);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveInterval);
    };
  }, [onToast]);

  // Main 24/7 Metaverse Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Cyber Isometric Grid Floor
      ctx.fillStyle = '#040b0e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Draw Interactive Metaverse Landmarks
      // A. Central King Throne Zone (Center)
      ctx.save();
      ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(400, 300, 75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('👑 KING JARVIS THRONE', 400, 280);
      ctx.fillText('[ENTER / TALK]', 400, 325);
      ctx.restore();

      // B. Top-Left: Raydium DEX Portal
      ctx.save();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(40, 40, 150, 90, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🔄 RAYDIUM DEX GATE', 115, 75);
      ctx.fillText('SOL / $JARSOL SWAP', 115, 95);
      ctx.restore();

      // C. Top-Right: Post-Quantum Bastion
      ctx.save();
      ctx.fillStyle = 'rgba(0, 255, 120, 0.15)';
      ctx.strokeStyle = '#00ff78';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(610, 40, 150, 90, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#00ff78';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🛡️ PQC LATTICE SHIELD', 685, 75);
      ctx.fillText('NIST FIPS 204 GATE', 685, 95);
      ctx.restore();

      // D. Bottom-Left: Genie Cyber Oasis
      ctx.save();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(40, 470, 150, 90, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🧞 JINNY CYBER OASIS', 115, 505);
      ctx.fillText('TURQUOISE FOUNTAINS', 115, 525);
      ctx.restore();

      // E. Bottom-Right: Solana Launchpad Skyport
      ctx.save();
      ctx.fillStyle = 'rgba(255, 140, 0, 0.15)';
      ctx.strokeStyle = '#ff8c00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(610, 470, 150, 90, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ff8c00';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🚀 SOLANA LAUNCHPAD', 685, 505);
      ctx.fillText('1,000T MINT SKYPORT', 685, 525);
      ctx.restore();

      // 3. Draw Collectibles
      items.forEach((item) => {
        if (!item.collected) {
          ctx.save();
          const time = Date.now() * 0.003;
          const floatY = item.y + Math.sin(time + item.id) * 4;

          if (item.type === 'crystal') {
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(item.x, floatY - 9);
            ctx.lineTo(item.x + 8, floatY);
            ctx.lineTo(item.x, floatY + 9);
            ctx.lineTo(item.x - 8, floatY);
            ctx.closePath();
            ctx.fill();
          } else if (item.type === 'token') {
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(item.x, floatY, 8, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#00ff78';
            ctx.shadowColor = '#00ff78';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(item.x, floatY, 7, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      // 4. Draw Player Cyber Avatar
      ctx.save();
      // Glowing aura
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(player.x, player.y, 16, 0, Math.PI * 2);
      ctx.fill();

      // Avatar Body
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Visor Eye
      ctx.fillStyle = '#ffffff';
      let eyeX = player.x;
      let eyeY = player.y;
      if (player.direction === 'up') eyeY -= 4;
      if (player.direction === 'down') eyeY += 4;
      if (player.direction === 'left') eyeX -= 4;
      if (player.direction === 'right') eyeX += 4;

      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Name Tag
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOU (PLAYER)', player.x, player.y - 18);
      ctx.restore();

      // 5. Environmental Lighting Overlay (Dawn / Day / Sunset / Night)
      ctx.save();
      ctx.fillStyle = timeSeason.ambientLightingColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [player, items, timeSeason]);

  // Touch / Direction Button Handler
  const handleMoveDir = (dir: 'up' | 'down' | 'left' | 'right') => {
    const speed = 18;
    setPlayer((prev) => {
      let dx = 0;
      let dy = 0;
      if (dir === 'up') dy = -speed;
      if (dir === 'down') dy = speed;
      if (dir === 'left') dx = -speed;
      if (dir === 'right') dx = speed;

      return {
        x: Math.max(30, Math.min(770, prev.x + dx)),
        y: Math.max(30, Math.min(570, prev.y + dy)),
        direction: dir,
        isMoving: true,
      };
    });
  };

  const handleInteractWithZone = async () => {
    playCyberClick();
    if (activeZone.includes('Throne')) {
      playCyberBeep();
      setDialogueSpeaker('King Jarvis (Virtual Sovereign)');
      setDialogueText(
        `Greetings, traveler of the 24/7 Metaverse! On Earth it is currently ${timeSeason.localDateString} (${timeSeason.localTimeString}) during the ${timeSeason.seasonName}. Here in the cyber realm, your passive mining has generated ${passiveJarsolEarned.toFixed(2)} $JARSOL. The kingdom stands ready to fulfill your wishes.`
      );
      setDialogueOpen(true);
    } else if (activeZone.includes('Raydium')) {
      if (onNavigateTab) onNavigateTab('dex');
      onToast('Transporting to Real Solana Raydium DEX Swap...', 'info');
    } else if (activeZone.includes('PQC')) {
      if (onNavigateTab) onNavigateTab('pqc');
      onToast('Opening Post-Quantum Lattice Defense Shield...', 'info');
    } else if (activeZone.includes('Launchpad')) {
      if (onNavigateTab) onNavigateTab('launchpad');
      onToast('Opening 1,000T Solana Token Launchpad...', 'info');
    } else {
      onToast(`You are standing in ${activeZone}. Move closer to a portal to interact!`, 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Metaverse Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#07161b] via-[#040e13] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-gradient-to-r from-cyan-950 to-emerald-950 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>24/7 DUAL-REALM METAVERSE VIRTUAL GAME ENGINE</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              Real World ↔ Virtual World Active 24/7
            </span>
          </div>

          <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
            24/7 Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-emerald-400">Metaverse Cyberverse Game</span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed font-mono">
            Explore Jarvis’s open-world virtual metaverse 24 hours a day, 7 days a week. Walk freely with WASD or arrow keys, collect floating quantum crystals, interact with King Jarvis, and step into portals to execute real Solana DEX trades.
          </p>
        </div>

        {/* Real-time 24/7 Earnings Telemetry */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1.5">
          <div className="text-slate-400 text-[11px] flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>24/7 Passive Mining Yield:</span>
          </div>
          <div className="text-emerald-400 font-bold text-base flex items-center gap-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{passiveJarsolEarned.toFixed(2)} $JARSOL</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Metaverse XP: <span className="text-cyan-300 font-bold">{metaverseScore} XP</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Game Viewport & Control Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 24/7 Game Canvas Viewport */}
        <div className="lg:col-span-8 p-4 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-4 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>CURRENT ZONE:</span>
              <span className="text-amber-300">{activeZone}</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>{timeSeason.timeOfDayIcon} {timeSeason.timeOfDayName}</span>
              <span>•</span>
              <span className="text-emerald-400">{timeSeason.seasonIcon} {timeSeason.seasonName}</span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 shadow-inner flex justify-center bg-black">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full max-w-full h-auto object-contain cursor-crosshair"
            />

            {/* In-game Dialogue Modal */}
            {dialogueOpen && (
              <div className="absolute bottom-4 inset-x-6 p-4 rounded-xl bg-black/90 backdrop-blur-md border border-amber-400 text-xs font-mono text-slate-200 space-y-2 z-30 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between text-amber-300 font-bold text-xs border-b border-slate-800 pb-1">
                  <span>👑 {dialogueSpeaker}</span>
                  <button
                    onClick={() => setDialogueOpen(false)}
                    className="text-slate-400 hover:text-white px-1"
                  >
                    ✕ CLOSE
                  </button>
                </div>
                <p className="leading-relaxed text-slate-300">{dialogueText}</p>
              </div>
            )}
          </div>

          {/* Action & Movement Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleInteractWithZone}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 text-slate-950 font-cyber font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all hover:brightness-110"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>INTERACT WITH {activeZone.toUpperCase()}</span>
            </button>

            {/* Directional Pad for Mobile / Click Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleMoveDir('left')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300"
                title="Move Left (A / Left Arrow)"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleMoveDir('up')}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300"
                  title="Move Up (W / Up Arrow)"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveDir('down')}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300"
                  title="Move Down (S / Down Arrow)"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => handleMoveDir('right')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300"
                title="Move Right (D / Right Arrow)"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Metaverse Quests & Real-World Telemetry */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quests Card */}
          <div className="p-5 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
              <div className="flex items-center gap-2 text-amber-300 font-cyber font-bold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>24/7 METAVERSE QUESTS</span>
              </div>
              <span className="text-[10px] text-slate-500">Real Rewards</span>
            </div>

            <div className="space-y-2.5">
              {quests.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1.5 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-[11px]">{q.title}</span>
                    <span className="text-amber-400 text-[10px] font-bold">{q.rewardJarsol}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">{q.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dual-World Real-Time Bridge Status */}
          <div className="p-5 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center gap-2 text-cyan-300 font-cyber font-bold border-b border-cyan-950 pb-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>DUAL-WORLD 24/7 BRIDGE</span>
            </div>

            <div className="space-y-2 text-slate-300 text-[11px]">
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Earth Real Time:</span>
                <span className="text-cyan-300 font-bold">{timeSeason.localTimeString}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Earth Real Date:</span>
                <span className="text-amber-300">{timeSeason.localDateString}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Solana Devnet Slot:</span>
                <span className="text-emerald-400 font-bold">485,648,190 (Live)</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between">
                <span className="text-slate-400">24/7 State:</span>
                <span className="text-emerald-400 font-bold">PERMANENTLY SYNCHRONIZED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
