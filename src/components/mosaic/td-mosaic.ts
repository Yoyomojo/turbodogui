import { UIComponent } from "../../core/component";
import styles from "./td-mosaic.css?raw";
export class UIMosaic extends UIComponent {
    private _ro: ResizeObserver | null = null;
    private _grid: HTMLElement | null = null;
    static get observedAttributes(): string[] {
        return ["columns", "gap", "row-height"];
    }
    attributeChangedCallback(): void {
        if (this.isConnected)
            this.render();
    }
    disconnectedCallback(): void {
        this._ro?.disconnect();
        this._ro = null;
    }
    protected render(): void {
        this._ro?.disconnect();
        this._ro = null;
        const cols = Math.max(1, parseInt(this.getAttribute("columns") ?? "3", 10) || 3);
        const gap = this.getAttribute("gap") ?? "4px";
        const rowHeight = this.getAttribute("row-height");
        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="mosaic" style="grid-template-columns:repeat(${cols},1fr);gap:${gap};${rowHeight ? `grid-auto-rows:${rowHeight};` : ""}">
        <slot></slot>
      </div>
    `;
        this._grid = this.root.querySelector(".mosaic");
        if (!rowHeight) {
            this._startAutoRows(cols);
        }
    }
    private _startAutoRows(cols: number): void {
        if (!this._grid)
            return;
        const update = () => {
            if (!this._grid)
                return;
            const colGap = parseFloat(getComputedStyle(this._grid).columnGap) || 0;
            const rowH = (this._grid.clientWidth - colGap * (cols - 1)) / cols;
            if (rowH > 0)
                this._grid.style.gridAutoRows = `${Math.round(rowH)}px`;
        };
        this._ro = new ResizeObserver(update);
        this._ro.observe(this._grid);
        requestAnimationFrame(update);
    }
}
customElements.define("td-mosaic", UIMosaic);
