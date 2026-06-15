import { UIComponent } from "../../core/component";
import styles from "./td-drawer.css?raw";
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
export class UIDrawer extends UIComponent {
    private escapeHandler?: (e: KeyboardEvent) => void;
    private readonly labelId = `drawer-title-${Math.random().toString(36).slice(2, 9)}`;
    static get observedAttributes(): string[] {
        return ["position", "width", "height", "title", "open"];
    }
    attributeChangedCallback(name: string): void {
        if (name === "width" || name === "height") {
            this._applySize();
            return;
        }
        if (name === "open") {
            this._onOpenChange();
            return;
        }
        if (this.isConnected)
            this.render();
    }
    private _applySize(): void {
        const width = this.getAttribute("width");
        const height = this.getAttribute("height");
        if (width)
            this.style.setProperty("--_drawer-width", width);
        if (height)
            this.style.setProperty("--_drawer-height", height);
    }
    private _onOpenChange(): void {
        if (this.hasAttribute("open")) {
            this._attachEscape();
            requestAnimationFrame(() => {
                this.root.querySelector<HTMLButtonElement>(".drawer-close")?.focus();
            });
        }
        else {
            this._detachEscape();
        }
    }
    private _attachEscape(): void {
        if (this.escapeHandler)
            return;
        this.escapeHandler = (e: KeyboardEvent) => {
            if (e.key === "Escape")
                this.close();
        };
        document.addEventListener("keydown", this.escapeHandler);
    }
    private _detachEscape(): void {
        if (!this.escapeHandler)
            return;
        document.removeEventListener("keydown", this.escapeHandler);
        this.escapeHandler = undefined;
    }
    protected render(): void {
        const position = this.getAttribute("position") ?? "right";
        const title = this.getAttribute("title") ?? "";
        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="drawer-overlay" part="overlay">
        <div class="drawer-panel" data-position="${position}" part="panel"
          role="dialog" aria-modal="true" aria-labelledby="${this.labelId}">
          <div class="drawer-header">
            <h2 class="drawer-title" id="${this.labelId}">${title}</h2>
            <button class="drawer-close" aria-label="Close drawer">${CLOSE_ICON}</button>
          </div>
          <div class="drawer-body">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
        this.root.querySelector(".drawer-close")!
            .addEventListener("click", () => this.close());
        this.root.querySelector(".drawer-overlay")!
            .addEventListener("click", (e) => {
            if (e.target === e.currentTarget)
                this.close();
        });
        this._applySize();
        if (this.hasAttribute("open"))
            this._attachEscape();
    }
    open(): void {
        this.setAttribute("open", "");
    }
    close(): void {
        this.removeAttribute("open");
        this.dispatchEvent(new CustomEvent("drawer-close", { bubbles: true, composed: true }));
    }
    disconnectedCallback(): void {
        this._detachEscape();
    }
}
customElements.define("td-drawer", UIDrawer);
