export type FrameRect = { x: number; y: number; w: number; h: number };

export type FrameAnalysis = {
  edgeScore: number;
  variance: number;
  meanLum: number;
  detected: boolean;
};

/** Proporción credencial INE (ISO/IEC 7810 ID-1). */
export const INE_ASPECT = 85.6 / 53.98;

/** Página principal de pasaporte mexicano (aprox.). */
export const PASSPORT_ASPECT = 125 / 88;

const STABLE_FRAMES = 14;

export function computeGuideRect(
  containerW: number,
  containerH: number,
  aspect: number,
): FrameRect {
  const maxW = containerW * 0.9;
  const maxH = containerH * 0.58;
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  return {
    x: (containerW - w) / 2,
    y: (containerH - h) / 2,
    w,
    h,
  };
}

export function analyzeDocumentFrame(
  ctx: CanvasRenderingContext2D,
  frame: FrameRect,
  canvasW: number,
  canvasH: number,
): FrameAnalysis {
  const x = Math.max(0, Math.floor(frame.x));
  const y = Math.max(0, Math.floor(frame.y));
  const w = Math.min(canvasW - x, Math.floor(frame.w));
  const h = Math.min(canvasH - y, Math.floor(frame.h));

  if (w < 24 || h < 16) {
    return { edgeScore: 0, variance: 0, meanLum: 0, detected: false };
  }

  const { data } = ctx.getImageData(x, y, w, h);
  const pixels = w * h;
  let sum = 0;
  let sumSq = 0;
  let edges = 0;

  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sum += lum;
    sumSq += lum * lum;
  }

  const meanLum = sum / pixels;
  const variance = Math.max(0, sumSq / pixels - meanLum * meanLum);

  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w - 1; col++) {
      const i = (row * w + col) * 4;
      const j = i + 4;
      const lum1 = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const lum2 = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
      if (Math.abs(lum1 - lum2) > 22) edges++;
    }
  }

  for (let row = 0; row < h - 1; row++) {
    for (let col = 0; col < w; col++) {
      const i = (row * w + col) * 4;
      const j = i + w * 4;
      const lum1 = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const lum2 = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
      if (Math.abs(lum1 - lum2) > 22) edges++;
    }
  }

  const edgeScore = edges / (pixels * 1.6);
  const detected =
    variance > 350 &&
    edgeScore > 0.06 &&
    meanLum > 35 &&
    meanLum < 225;

  return { edgeScore, variance, meanLum, detected };
}

export class DocumentDetectionTracker {
  private streak = 0;

  update(detected: boolean): boolean {
    if (detected) {
      this.streak = Math.min(this.streak + 1, STABLE_FRAMES);
    } else {
      this.streak = Math.max(0, this.streak - 2);
    }
    return this.streak >= STABLE_FRAMES;
  }

  reset(): void {
    this.streak = 0;
  }
}

export function overlayToVideoCrop(
  video: HTMLVideoElement,
  container: HTMLElement,
  overlay: FrameRect,
): FrameRect {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const scale = Math.max(cw / vw, ch / vh);
  const renderedW = vw * scale;
  const renderedH = vh * scale;
  const cropLeft = (renderedW - cw) / 2;
  const cropTop = (renderedH - ch) / 2;

  return {
    x: Math.max(0, (overlay.x + cropLeft) / scale),
    y: Math.max(0, (overlay.y + cropTop) / scale),
    w: overlay.w / scale,
    h: overlay.h / scale,
  };
}
