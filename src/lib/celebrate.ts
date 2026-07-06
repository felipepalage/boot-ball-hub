// Comemorações sem dependência: confete em canvas + som curto via Web Audio.

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
}

const CORES = ['#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#ffffff', '#f43f5e'];

/** Dispara confete a partir do topo/centro da tela. */
export function fireConfetti(quantidade = 140, duracaoMs = 1600) {
  if (typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const parts: Particle[] = Array.from({ length: quantidade }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 240,
    y: canvas.height / 3 + (Math.random() - 0.5) * 100,
    vx: (Math.random() - 0.5) * 11,
    vy: Math.random() * -13 - 4,
    size: Math.random() * 7 + 4,
    color: CORES[Math.floor(Math.random() * CORES.length)],
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.35,
  }));

  const start = performance.now();
  const g = 0.42;

  const frame = (t: number) => {
    const elapsed = t - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.vy += g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - elapsed / duracaoMs);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (elapsed < duracaoMs) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}

// AudioContext compartilhado, destravado no 1º gesto do usuário (política de autoplay).
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    getAudioCtx()?.resume().catch(() => {});
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock);
}

/** Rugido de torcida comemorando o gol (ruído filtrado com swell) + apito. Sem arquivo de áudio. */
export function playGoalSound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const t = ctx.currentTime;
    const dur = 1.8;

    // Ruído branco base (a "massa" da torcida)
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    // Band-pass dá o timbre de "aaahh" da galera
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(500, t);
    bp.frequency.linearRampToValueAtTime(950, t + 0.4); // sobe como o grito crescendo
    bp.Q.value = 0.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.18); // swell rápido (GOOOL!)
    gain.gain.setValueAtTime(0.55, t + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur); // decai

    src.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
    src.stop(t + dur);

    // Apito curto por cima, pra dar cara de futebol
    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 2100;
    lfo.frequency.value = 16; // vibrato do apito
    lfoGain.gain.value = 70;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    oGain.gain.setValueAtTime(0.0001, t);
    oGain.gain.exponentialRampToValueAtTime(0.14, t + 0.03);
    oGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(oGain);
    oGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.42);
    lfo.start(t);
    lfo.stop(t + 0.42);
  } catch {
    // silencioso
  }
}
