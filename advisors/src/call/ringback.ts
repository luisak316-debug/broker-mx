/** Tono local de marcado mientras suena el INVITE (no depende del operador). */
let ringTimer: number | null = null;
let audioCtx: AudioContext | null = null;

function stopRing(): void {
  if (ringTimer) {
    window.clearInterval(ringTimer);
    ringTimer = null;
  }
  if (audioCtx) {
    void audioCtx.close().catch(() => undefined);
    audioCtx = null;
  }
}

function beep(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 425;
  gain.gain.value = 0.08;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.45);
}

export function startRingback(): void {
  stopRing();
  audioCtx = new AudioContext();
  void audioCtx.resume();
  beep(audioCtx);
  ringTimer = window.setInterval(() => {
    if (audioCtx) beep(audioCtx);
  }, 2000);
}

export function stopRingback(): void {
  stopRing();
}
