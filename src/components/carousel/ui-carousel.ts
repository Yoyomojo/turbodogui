import { UIComponent } from "../../core/component";
import styles from "./ui-carousel.css?raw";

export class UICarousel extends UIComponent {
  private _current: number = 0;
  private _total: number = 0;
  private _autoplayTimer: number | null = null;
  private _animTimer: number | null = null;
  private _touchStartX: number = 0;

  static get observedAttributes(): string[] {
    return ["label", "autoplay", "interval", "loop"];
  }


  connectedCallback(): void {
    queueMicrotask(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  disconnectedCallback(): void {
    this._stopAutoplay();
    if (this._animTimer !== null) {
      clearTimeout(this._animTimer);
      this._animTimer = null;
    }
  }

  protected render(): void {
    this._total = this._countSlides();
    if (this._current >= this._total) {
      this._current = Math.max(0, this._total - 1);
    }

    const hasLoop = this.hasAttribute("loop");
    const label = this.getAttribute("label") ?? "Carousel";

    const slidesHTML = Array.from({ length: this._total }, (_, i) => `
      <div
        class="slide${i === this._current ? " slide--active" : ""}"
        data-index="${i}"
        aria-hidden="${i !== this._current}"
        aria-roledescription="slide"
        aria-label="Slide ${i + 1} of ${this._total}"
      >
        <slot name="slide-${i}"></slot>
      </div>`).join("");

    const dotsHTML = Array.from({ length: this._total }, (_, i) => `
      <button
        class="dot${i === this._current ? " dot--active" : ""}"
        aria-label="Go to slide ${i + 1}"
        aria-selected="${i === this._current}"
        role="tab"
        data-dot="${i}"
        tabindex="${i === this._current ? "0" : "-1"}"
      ></button>`).join("");

    const showPrev = this._current > 0 || hasLoop;
    const showNext = this._current < this._total - 1 || hasLoop;

    this.root.innerHTML = `
      ${this.css(styles)}
      <div class="carousel" role="region" aria-label="${label}" aria-roledescription="carousel">
        <div class="carousel-stage">
          <div class="slides-wrap">
            ${slidesHTML}
          </div>
          <button
            class="arrow arrow--prev${showPrev ? "" : " arrow--hidden"}"
            aria-label="Previous slide"
            ${!showPrev ? "disabled" : ""}
          ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
          <button
            class="arrow arrow--next${showNext ? "" : " arrow--hidden"}"
            aria-label="Next slide"
            ${!showNext ? "disabled" : ""}
          ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
        </div>
        ${this._total > 1 ? `<div class="indicators" role="tablist" aria-label="Slide indicators">${dotsHTML}</div>` : ""}
      </div>
    `;

    this._attachListeners();
    if (this.hasAttribute("autoplay")) {
      this._startAutoplay();
    }
  }

  private _countSlides(): number {
    let count = 0;
    for (const child of Array.from(this.children)) {
      if (/^slide-\d+$/.test(child.getAttribute("slot") ?? "")) count++;
    }
    return count;
  }

  private _attachListeners(): void {
    const stage = this.root.querySelector<HTMLElement>(".carousel-stage");
    const prevBtn = this.root.querySelector<HTMLButtonElement>(".arrow--prev");
    const nextBtn = this.root.querySelector<HTMLButtonElement>(".arrow--next");
    const carousel = this.root.querySelector<HTMLElement>(".carousel");

    prevBtn?.addEventListener("click", () => this._goTo(this._current - 1));
    nextBtn?.addEventListener("click", () => this._goTo(this._current + 1));

    this.root.querySelectorAll<HTMLButtonElement>(".dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const idx = parseInt(dot.dataset.dot ?? "0", 10);
        this._goTo(idx);
      });
    });


    if (stage) {
      stage.addEventListener("touchstart", (e) => {
        this._touchStartX = e.touches[0].clientX;
      }, { passive: true });

      stage.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - this._touchStartX;
        if (Math.abs(dx) > 40) {
          this._goTo(this._current + (dx < 0 ? 1 : -1));
        }
      }, { passive: true });
    }


    if (carousel) {
      carousel.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          this._goTo(this._current - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          this._goTo(this._current + 1);
        }
      });
    }
  }

  private _goTo(index: number): void {
    const hasLoop = this.hasAttribute("loop");
    if (hasLoop) {
      if (index < 0) index = this._total - 1;
      else if (index >= this._total) index = 0;
    } else {
      if (index < 0 || index >= this._total) return;
    }
    if (index === this._current) return;
    const prev = this._current;
    this._current = index;
    this._updateView(prev);
  }

  private _updateView(prevIndex: number): void {
    const ANIM_MS = 400; 
    const hasLoop = this.hasAttribute("loop");
    const showPrev = this._current > 0 || hasLoop;
    const showNext = this._current < this._total - 1 || hasLoop;
    const goingForward = this._current > prevIndex ||
      (hasLoop && prevIndex === this._total - 1 && this._current === 0);

    const ALL = ["slide--active", "slide--entering", "slide--exiting",
      "slide--entering-right", "slide--entering-left",
      "slide--exiting-left",   "slide--exiting-right"];

    const slides = this.root.querySelectorAll<HTMLElement>(".slide");
    const incoming = slides[this._current];
    const outgoing = slides[prevIndex];

    if (!incoming || !outgoing) return;


    if (this._animTimer !== null) {
      clearTimeout(this._animTimer);
      this._animTimer = null;

      slides.forEach(s => s.classList.remove(...ALL));
      slides[this._current === prevIndex ? this._current : prevIndex]?.classList.add("slide--active");
    }


    slides.forEach(s => s.classList.remove(...ALL));

    outgoing.classList.add(
      "slide--active",        
      "slide--exiting",       
      goingForward ? "slide--exiting-left" : "slide--exiting-right"
    );

    incoming.classList.add(
      "slide--entering",      
      goingForward ? "slide--entering-right" : "slide--entering-left"
    );


    this._animTimer = window.setTimeout(() => {
      this._animTimer = null;
      slides.forEach(s => s.classList.remove(...ALL));
      incoming.classList.add("slide--active");
    }, ANIM_MS);


    slides.forEach((slide, i) => {
      slide.setAttribute("aria-hidden", String(i !== this._current));
    });


    const prevBtn = this.root.querySelector<HTMLButtonElement>(".arrow--prev");
    const nextBtn = this.root.querySelector<HTMLButtonElement>(".arrow--next");
    if (prevBtn) { prevBtn.classList.toggle("arrow--hidden", !showPrev); prevBtn.disabled = !showPrev; }
    if (nextBtn) { nextBtn.classList.toggle("arrow--hidden", !showNext); nextBtn.disabled = !showNext; }


    this.root.querySelectorAll<HTMLButtonElement>(".dot").forEach((dot, i) => {
      dot.classList.toggle("dot--active", i === this._current);
      dot.setAttribute("aria-selected", String(i === this._current));
      dot.tabIndex = i === this._current ? 0 : -1;
    });

    this.dispatchEvent(new CustomEvent("slide-change", {
      bubbles: true,
      composed: true,
      detail: { index: this._current, total: this._total },
    }));
  }

  private _startAutoplay(): void {
    this._stopAutoplay();
    const ms = Math.max(500, parseInt(this.getAttribute("interval") ?? "4000", 10));
    this._autoplayTimer = window.setInterval(() => {
      const hasLoop = this.hasAttribute("loop");
      if (this._current < this._total - 1) {
        this._goTo(this._current + 1);
      } else if (hasLoop) {
        this._goTo(0);
      } else {
        this._stopAutoplay();
      }
    }, ms);
  }

  private _stopAutoplay(): void {
    if (this._autoplayTimer !== null) {
      clearInterval(this._autoplayTimer);
      this._autoplayTimer = null;
    }
  }


  get currentIndex(): number {
    return this._current;
  }


  goTo(index: number): void {
    this._goTo(index);
  }


  next(): void {
    this._goTo(this._current + 1);
  }


  prev(): void {
    this._goTo(this._current - 1);
  }
}

customElements.define("ui-carousel", UICarousel);
