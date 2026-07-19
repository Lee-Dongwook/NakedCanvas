import type { NakedOptions, ParticleData } from "./types";

export class NakedEffect {
  private readonly particles: ParticleData[] = [];

  // Dedicated offscreen buffer for text rasterization + pixel readback.
  // `willReadFrequently` lives HERE — never on the GPU-accelerated render
  // canvas — so the 5k-per-frame fillRect path keeps hardware acceleration.
  private readonly buffer: HTMLCanvasElement = document.createElement("canvas");
  private readonly bufferCtx: CanvasRenderingContext2D;

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly options: NakedOptions,
  ) {
    this.bufferCtx = this.buffer.getContext("2d", {
      willReadFrequently: true,
    })!;
  }

  public convertTextToParticles(
    text: string,
    width: number,
    height: number,
    dpr: number,
  ): void {
    this.particles.length = 0;

    // The buffer is sized and read in DEVICE pixels, so the sampling and
    // readback coordinate spaces always match — text never clips on Retina.
    const deviceWidth = Math.floor(width * dpr);
    const deviceHeight = Math.floor(height * dpr);
    this.buffer.width = deviceWidth; // reassigning width also clears the buffer
    this.buffer.height = deviceHeight;

    const bctx = this.bufferCtx;
    bctx.font = `bold ${Math.min(deviceWidth, deviceHeight) * 0.15}px sans-serif`;
    bctx.textAlign = "center";
    bctx.textBaseline = "middle";
    bctx.fillStyle = "#ffffff";
    bctx.fillText(text, deviceWidth / 2, deviceHeight / 2);

    const data = bctx.getImageData(0, 0, deviceWidth, deviceHeight).data;
    const color = this.options.defaultColor;

    // Step by gap * dpr so particle density stays constant per CSS pixel
    // regardless of DPR — the 5k budget does not balloon on Retina.
    // Runs once (not in the RAF loop), so these arrays are safe to allocate.
    const step = Math.max(1, Math.round(this.options.particleGap * dpr));
    const rows = Array.from(
      { length: Math.ceil(deviceHeight / step) },
      (_, i) => i * step,
    );
    const cols = Array.from(
      { length: Math.ceil(deviceWidth / step) },
      (_, i) => i * step,
    );

    for (const y of rows) {
      for (const x of cols) {
        const alpha = data[(y * deviceWidth + x) * 4 + 3];

        if (alpha > 128) {
          this.particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            tx: x / dpr, // back to CSS px to match the dpr-scaled render ctx
            ty: y / dpr,
            color,
          });
        }
      }
    }
  }

  public updateAndRender(mouseX: number, mouseY: number): void {
    const ctx = this.ctx;
    const { mouseRadius, pushForce, returnEase, friction } = this.options;
    const radiusSq = mouseRadius * mouseRadius;

    // Uniform color in P0: set fillStyle once, not once per particle.
    ctx.fillStyle = this.options.defaultColor;

    // `for...of` keeps the RAF loop `let`-free and allocation-free (no `new`).
    for (const p of this.particles) {
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < radiusSq) {
        const dist = Math.sqrt(distanceSq) || 1;
        const force = (radiusSq - distanceSq) / radiusSq;

        p.vx -= (dx / dist) * force * pushForce;
        p.vy -= (dy / dist) * force * pushForce;
      }

      p.vx += (p.tx - p.x) * returnEase;
      p.vy += (p.ty - p.y) * returnEase;
      p.vx *= friction;
      p.vy *= friction;
      p.x += p.vx;
      p.y += p.vy;

      ctx.fillRect(p.x, p.y, 2, 2);
    }
  }
}
