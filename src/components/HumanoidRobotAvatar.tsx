import React, { useEffect, useRef, useState } from 'react';

interface HumanoidRobotAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  audioLevel: number;
  mode?: 'android' | 'hologram' | 'arc_reactor';
}

export const HumanoidRobotAvatar: React.FC<HumanoidRobotAvatarProps> = ({
  isSpeaking,
  isListening,
  audioLevel,
  mode = 'android',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [blink, setBlink] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Random natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, Math.random() * 4000 + 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Track mouse for eye tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;  // -1 to 1
    setMousePos({ x, y });
  };

  // Canvas particle & hologram aura rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: { x: number; y: number; size: number; speedY: number; opacity: number }[] = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedY: Math.random() * 0.8 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render quantum floating particles
      particles.forEach((p) => {
        p.y -= p.speedY;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = mode === 'hologram' ? `rgba(0, 240, 255, ${p.opacity})` : `rgba(0, 255, 120, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Holographic scanline sweep
      const time = Date.now() * 0.002;
      const scanY = (Math.sin(time) * 0.5 + 0.5) * canvas.height;

      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.fillRect(0, scanY - 3, canvas.width, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode]);

  // Lip-sync mouth openness based on isSpeaking & audioLevel
  const mouthOpenness = isSpeaking ? Math.min(28, Math.max(4, audioLevel * 0.35)) : 2;
  const mouthWidth = isSpeaking ? Math.min(48, Math.max(34, 36 + audioLevel * 0.15)) : 34;

  // Eye gaze displacement
  const eyeOffsetX = mousePos.x * 6;
  const eyeOffsetY = mousePos.y * 5;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-[380px] h-[400px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#040e12] via-[#020709] to-[#010405] border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(0,240,255,0.2)]"
    >
      {/* Background Holographic Canvas */}
      <canvas
        ref={canvasRef}
        width={380}
        height={400}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Cybernetic Aura / Halo Rings */}
      <div className={`absolute w-72 h-72 rounded-full border border-cyan-500/20 transition-all duration-700 ${
        isSpeaking ? 'scale-110 shadow-[0_0_50px_rgba(0,240,255,0.3)] animate-pulse' : 'scale-100'
      }`} />

      <div className={`absolute w-84 h-84 rounded-full border border-dashed border-emerald-500/20 ${
        isListening ? 'animate-spin' : ''
      }`} style={{ animationDuration: '20s' }} />

      {/* Main Humanoid Robot SVG Head & Face Structure */}
      <svg
        viewBox="0 0 200 240"
        className="relative z-10 w-64 h-80 drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]"
      >
        <defs>
          {/* Cyber Metal Gradients */}
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b242a" />
            <stop offset="50%" stopColor="#06151a" />
            <stop offset="100%" stopColor="#02080a" />
          </linearGradient>

          <linearGradient id="facePlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#11333b" />
            <stop offset="100%" stopColor="#07181e" />
          </linearGradient>

          <linearGradient id="eyeGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#00ff88" />
          </linearGradient>

          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Neck & Shoulder Mechanics */}
        <path
          d="M 80 185 L 70 230 L 130 230 L 120 185 Z"
          fill="url(#metalGrad)"
          stroke="#00f0ff"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
        <line x1="100" y1="190" x2="100" y2="230" stroke="#00ff88" strokeWidth="2" strokeDasharray="3,3" />

        {/* Humanoid Cranium & Jaw Shell */}
        <path
          d="M 50 70 C 50 25, 150 25, 150 70 C 150 110, 142 165, 125 185 C 110 195, 90 195, 75 185 C 58 165, 50 110, 50 70 Z"
          fill="url(#facePlateGrad)"
          stroke="#00f0ff"
          strokeWidth="2"
        />

        {/* Cyber Ear Pods / Audio Transceivers */}
        <rect x="42" y="75" width="8" height="30" rx="3" fill="#031014" stroke="#00f0ff" strokeWidth="1.5" />
        <rect x="150" y="75" width="8" height="30" rx="3" fill="#031014" stroke="#00f0ff" strokeWidth="1.5" />
        <circle cx="46" cy="90" r="2" fill={isListening ? "#ff0055" : "#00f0ff"} />
        <circle cx="154" cy="90" r="2" fill={isListening ? "#ff0055" : "#00f0ff"} />

        {/* Forehead Neural Core Visor */}
        <path
          d="M 75 40 L 125 40 L 120 52 L 80 52 Z"
          fill="#02090b"
          stroke="#00f0ff"
          strokeWidth="1"
        />
        <circle cx="100" cy="46" r="3.5" fill="#00ff88" filter="url(#neonGlow)" />

        {/* Cheekbone & Jaw Panel Seams */}
        <path d="M 60 95 L 75 130 L 68 165" fill="none" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.4" />
        <path d="M 140 95 L 125 130 L 132 165" fill="none" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.4" />

        {/* Eyes (Left & Right) with Eyelid Blinking */}
        {/* Left Eye Socket */}
        <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
          <ellipse cx="76" cy="90" rx="14" ry="9" fill="#010608" stroke="#00f0ff" strokeWidth="1.5" />
          {!blink ? (
            <>
              {/* Glowing Iris */}
              <ellipse
                cx="76"
                cy="90"
                rx={isSpeaking ? "8" : "7"}
                ry={isSpeaking ? "8" : "7"}
                fill="url(#eyeGlowGrad)"
                filter="url(#neonGlow)"
              />
              {/* Pupil */}
              <circle cx="76" cy="90" r="3" fill="#ffffff" />
            </>
          ) : (
            // Blinking line
            <line x1="64" y1="90" x2="88" y2="90" stroke="#00f0ff" strokeWidth="2" />
          )}

          {/* Right Eye Socket */}
          <ellipse cx="124" cy="90" rx="14" ry="9" fill="#010608" stroke="#00f0ff" strokeWidth="1.5" />
          {!blink ? (
            <>
              {/* Glowing Iris */}
              <ellipse
                cx="124"
                cy="90"
                rx={isSpeaking ? "8" : "7"}
                ry={isSpeaking ? "8" : "7"}
                fill="url(#eyeGlowGrad)"
                filter="url(#neonGlow)"
              />
              {/* Pupil */}
              <circle cx="124" cy="90" r="3" fill="#ffffff" />
            </>
          ) : (
            <line x1="112" y1="90" x2="136" y2="90" stroke="#00f0ff" strokeWidth="2" />
          )}
        </g>

        {/* Eyebrow Plates */}
        <line x1="62" y1="76" x2="88" y2="78" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
        <line x1="138" y1="76" x2="112" y2="78" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />

        {/* Humanoid Nose Geometry */}
        <polygon points="100,88 95,118 105,118" fill="#071b20" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.6" />

        {/* Interactive Lip-Sync Mouth */}
        <g transform="translate(100, 148)">
          {/* Mouth Cavity */}
          <ellipse
            cx="0"
            cy="0"
            rx={mouthWidth / 2}
            ry={mouthOpenness / 2}
            fill="#000e12"
            stroke="#00f0ff"
            strokeWidth="2"
            filter="url(#neonGlow)"
          />
          {/* Internal Cyber Acoustic Grill */}
          {isSpeaking && (
            <line
              x1={-(mouthWidth / 2) + 4}
              y1="0"
              x2={mouthWidth / 2 - 4}
              y2="0"
              stroke="#00ff88"
              strokeWidth="2"
              strokeDasharray="2,2"
            />
          )}
        </g>

        {/* Chin Plate */}
        <path d="M 88 170 L 112 170 L 107 182 L 93 182 Z" fill="#0a2026" stroke="#00f0ff" strokeWidth="1" />
      </svg>

      {/* Floating Status Badge */}
      <div className="absolute bottom-3 inset-x-4 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono">
        <span className="text-slate-400">AVATAR:</span>
        <span className="text-cyan-300 font-bold flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : (isListening ? 'bg-red-400 animate-pulse' : 'bg-cyan-400')}`} />
          {isSpeaking ? 'VOCALIZING (LIP-SYNC)' : (isListening ? 'LISTENING TO YOU' : 'ATTENTIVE (FACE-TO-FACE)')}
        </span>
      </div>
    </div>
  );
};
