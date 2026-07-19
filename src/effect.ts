import type { NakedOptions, ParticleData } from "./types";

export class NakedEffect {
  private readonly particles: ParticleData[] = [];

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly options: NakedOptions,
  ) {}

  public convertTextToParticles(
    text: string,
    width: number,
    height: number,
  ): void {
    this.particles.length = 0;
    this.ctx.font = `bold ${Math.min(width, height) * 0.15}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(text, width / 2, height / 2);

    const data = this.ctx.getImageData(0, 0, width, height).data;
    const gap = this.options.particleGap;
    const color = this.options.defaultColor;

    const rows = Array.from(
      { length: Math.ceil(height / gap) },
      (_, i) => i * gap,
    );
    const cols = Array.from(
      { length: Math.ceil(width / gap) },
      (_, i) => i * gap,
    );

    for (const y of rows) {
      for (const x of cols) {
        const alpha = data[(y * width + x) * 4 + 3];

        if (alpha > 128) {
          this.particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            tx: x,
            ty: y,
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

      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 2, 2);
    }
  }
}
