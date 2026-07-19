import type { NakedOptions, ParticleData } from "./types";

export class NakedEffect {
  private particles: ParticleData[] = [];

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

    const imgData = this.ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const gap = this.options.particleGap;

    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3];

        if (alpha > 128) {
          this.particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            tx: x,
            ty: y,
            color: this.options.defaultColor,
          });
        }
      }
    }
  }

  public updateAndRender(mouseX: number, mouseY: number): void {
    const len = this.particles.length;
    const { mouseRadius, pushForce, returnEase, friction } = this.options;
    const ctx = this.ctx;

    for (let i = 0; i < len; i++) {
      const p = this.particles[i];

      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const distance = dx * dx + dy * dy;
      const radiusSq = mouseRadius * mouseRadius;

      if (distance < radiusSq) {
        const dist = Math.sqrt(distance) || 1;
        const force = (radiusSq - distance) / radiusSq;

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
