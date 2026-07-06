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

/** Som curto e comemorativo (tom ascendente). Chamado num gesto do usuário (clique). */
export function playGoalSound() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(560, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
    setTimeout(() => ctx.close().catch(() => {}), 700);
  } catch {
    // silencioso
  }
}
