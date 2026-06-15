import { UIComponent } from "../../core/component";
import styles from "./td-pagination.css?raw";
export class UIPagination extends UIComponent {
    private _total: number = 0;
    private _pageSize: number = 10;
    private _page: number = 1;
    private _resizeObserver: ResizeObserver | null = null;
    private _scrollHandler: (() => void) | null = null;
    static get observedAttributes(): string[] {
        return ["total", "page-size", "page"];
    }
    attributeChangedCallback(name: string, _old: string | null, val: string | null): void {
        const n = parseInt(val ?? "", 10);
        if (isNaN(n))
            return;
        if (name === "total") {
            this._total = Math.max(0, n);
            this._page = Math.min(this._page, this._totalPages || 1);
        }
        else if (name === "page-size") {
            this._pageSize = Math.max(1, n);
            this._page = Math.min(this._page, this._totalPages || 1);
        }
        else if (name === "page") {
            this._page = Math.max(1, Math.min(n, this._totalPages || 1));
        }
        if (this.isConnected)
            this.render();
    }
    get total(): number { return this._total; }
    set total(v: number) {
        this._total = Math.max(0, v);
        this._page = Math.min(this._page, this._totalPages || 1);
        this.render();
    }
    get pageSize(): number { return this._pageSize; }
    set pageSize(v: number) {
        this._pageSize = Math.max(1, v);
        this._page = Math.min(this._page, this._totalPages || 1);
        this.render();
    }
    get page(): number { return this._page; }
    set page(v: number) {
        this._page = Math.max(1, Math.min(v, this._totalPages || 1));
        this.render();
    }
    private get _totalPages(): number {
        return this._total > 0 ? Math.ceil(this._total / this._pageSize) : 0;
    }
    connectedCallback(): void {
        const ps = parseInt(this.getAttribute("page-size") ?? "", 10);
        if (!isNaN(ps))
            this._pageSize = Math.max(1, ps);
        const total = parseInt(this.getAttribute("total") ?? "", 10);
        if (!isNaN(total))
            this._total = Math.max(0, total);
        const page = parseInt(this.getAttribute("page") ?? "", 10);
        if (!isNaN(page))
            this._page = Math.max(1, page);
        super.connectedCallback();
    }
    disconnectedCallback(): void {
        this._cleanup();
    }
    protected render(): void {
        this._cleanup();
        const tp = this._totalPages;
        const pageButtonsHTML = Array.from({ length: tp }, (_, i) => {
            const n = i + 1;
            const isActive = n === this._page;
            return `<button class="page-btn${isActive ? " active" : ""}" data-page="${n}" aria-label="Page ${n}" aria-current="${isActive ? "page" : "false"}">${n}</button>`;
        }).join("");
        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="pagination${tp === 0 ? " hidden" : ""}">
        <div class="pages-nav">
          <button class="arrow-btn scroll-btn--left" aria-label="Scroll pages left" hidden>&#8249;</button>
          <div class="pages-scroll-wrapper">
            <div class="pages-list">
              <button class="arrow-btn prev-btn" aria-label="Previous page"${this._page <= 1 ? " disabled" : ""}>&#8249;</button>
              ${pageButtonsHTML}
              <button class="arrow-btn next-btn" aria-label="Next page"${this._page >= tp ? " disabled" : ""}>&#8250;</button>
            </div>
          </div>
          <button class="arrow-btn scroll-btn--right" aria-label="Scroll pages right" hidden>&#8250;</button>
        </div>
      </div>
    `;
        this._attachListeners();
        this._initScrollControls();
        this._scrollActiveIntoView();
    }
    private _attachListeners(): void {
        this.root.querySelector(".prev-btn")?.addEventListener("click", () => this._goTo(this._page - 1));
        this.root.querySelector(".next-btn")?.addEventListener("click", () => this._goTo(this._page + 1));
        this.root.querySelectorAll<HTMLButtonElement>(".page-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const p = parseInt(btn.dataset.page ?? "", 10);
                if (!isNaN(p))
                    this._goTo(p);
            });
        });
    }
    private _goTo(page: number): void {
        const next = Math.max(1, Math.min(page, this._totalPages));
        if (next === this._page)
            return;
        this._page = next;
        this.render();
        this.dispatchEvent(new CustomEvent("td-page-change", {
            bubbles: true,
            composed: true,
            detail: {
                page: this._page,
                pageSize: this._pageSize,
                offset: (this._page - 1) * this._pageSize,
                limit: this._pageSize,
            },
        }));
    }
    private _initScrollControls(): void {
        const wrapper = this.root.querySelector<HTMLElement>(".pages-scroll-wrapper");
        const btnLeft = this.root.querySelector<HTMLButtonElement>(".scroll-btn--left");
        const btnRight = this.root.querySelector<HTMLButtonElement>(".scroll-btn--right");
        if (!wrapper || !btnLeft || !btnRight)
            return;
        const updateArrows = () => {
            const hasOverflow = wrapper.scrollWidth > wrapper.clientWidth + 1;
            const atStart = wrapper.scrollLeft <= 1;
            const atEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 2;
            btnLeft.hidden = !hasOverflow || atStart;
            btnRight.hidden = !hasOverflow || atEnd;
        };
        this._scrollHandler = updateArrows;
        wrapper.addEventListener("scroll", updateArrows);
        btnLeft.addEventListener("click", () => wrapper.scrollBy({ left: -120, behavior: "smooth" }));
        btnRight.addEventListener("click", () => wrapper.scrollBy({ left: 120, behavior: "smooth" }));
        this._resizeObserver = new ResizeObserver(() => updateArrows());
        this._resizeObserver.observe(wrapper);
        const list = this.root.querySelector<HTMLElement>(".pages-list");
        if (list)
            this._resizeObserver.observe(list);
        requestAnimationFrame(() => updateArrows());
    }
    private _scrollActiveIntoView(): void {
        requestAnimationFrame(() => {
            const active = this.root.querySelector<HTMLButtonElement>(".page-btn.active");
            if (active) {
                active.scrollIntoView({ behavior: "instant", inline: "nearest", block: "nearest" });
                requestAnimationFrame(() => {
                    const wrapper = this.root.querySelector<HTMLElement>(".pages-scroll-wrapper");
                    if (wrapper && this._scrollHandler)
                        this._scrollHandler();
                });
            }
        });
    }
    private _cleanup(): void {
        this._resizeObserver?.disconnect();
        this._resizeObserver = null;
        const wrapper = this.root.querySelector<HTMLElement>(".pages-scroll-wrapper");
        if (wrapper && this._scrollHandler) {
            wrapper.removeEventListener("scroll", this._scrollHandler);
        }
        this._scrollHandler = null;
    }
}
customElements.define("td-pagination", UIPagination);
