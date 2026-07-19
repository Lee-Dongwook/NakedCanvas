import type { NakedOptions } from "./types";
import { NakedEffect } from "./effect";

export type { NakedOptions, ParticleData } from "./types";

export class NakedCanvas {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly effect: NakedEffect;
  private readonly options: NakedOptions;

  private width: number = 0;
  private height: number = 0;
  private mouseX: number = -9999;
  private mouseY: number = -9999;
  private isRunning: boolean = false;

  private readonly defaultOptions: NakedOptions = {
    particleGap: 4,
    mouseRadius: 80,
    pushForce: 8,
    returnEase: 0.08,
    friction: 0.92,
    defaultColor: "#ffffff",
  };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    customOptions?: Partial<NakedOptions>,
  ) {
    this.ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    this.options = { ...this.defaultOptions, ...customOptions };
    this.effect = new NakedEffect(this.ctx, this.options);

    this.initEvents();
    this.resize();
  }

  private initEvents(): void {
    window.addEventListener("resize", () => this.resize());

    const setPointer = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e) {
        if (e.touches.length > 0) {
          this.mouseX = e.touches[0].clientX;
          this.mouseY = e.touches[0].clientY;
        }
      } else {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      }
    };

    const clearPointer = () => {
      this.mouseX = -9999;
      this.mouseY = -9999;
    };

    this.canvas.addEventListener("mousemove", setPointer);
    this.canvas.addEventListener("touchstart", setPointer, { passive: true });
    this.canvas.addEventListener("touchmove", setPointer, { passive: true });
    this.canvas.addEventListener("mouseleave", clearPointer);
    this.canvas.addEventListener("touchend", clearPointer);
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.width = this.canvas.parentElement?.clientWidth || window.innerWidth;
    this.height = this.canvas.parentElement?.clientHeight || window.innerHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);
  }

  public renderText(text: string): void {
    this.effect.convertTextToParticles(text, this.width, this.height);

    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  private loop = (): void => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.effect.updateAndRender(this.mouseX, this.mouseY);
    requestAnimationFrame(this.loop);
  };
}
