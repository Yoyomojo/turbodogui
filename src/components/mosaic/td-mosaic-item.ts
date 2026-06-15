import { UIComponent } from "../../core/component";
import styles from "./td-mosaic-item.css?raw";
export class UIMosaicItem extends UIComponent {
    static get observedAttributes(): string[] {
        return ["col-span", "row-span"];
    }
    attributeChangedCallback(): void {
        this._applySpans();
    }
    connectedCallback(): void {
        super.connectedCallback();
        this._applySpans();
    }
    protected render(): void {
        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="item">
        <slot></slot>
        <div class="overlay"><slot name="overlay"></slot></div>
      </div>
    `;
    }
    private _applySpans(): void {
        const cs = Math.max(1, parseInt(this.getAttribute("col-span") ?? "1", 10) || 1);
        const rs = Math.max(1, parseInt(this.getAttribute("row-span") ?? "1", 10) || 1);
        this.style.gridColumn = cs > 1 ? `span ${cs}` : "";
        this.style.gridRow = rs > 1 ? `span ${rs}` : "";
    }
}
customElements.define("td-mosaic-item", UIMosaicItem);
