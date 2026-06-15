import { UIComponent } from "../../core/component";
import styles from "./td-tooltip.css?raw";
function ensureStyles(): void {
    let tag = document.querySelector<HTMLStyleElement>("style[data-uitooltip]");
    if (!tag) {
        tag = document.createElement("style");
        tag.dataset.uitooltip = "";
        document.head.appendChild(tag);
    }
    tag.textContent = styles;
}
ensureStyles();
export class UITooltip extends UIComponent {
    private _float: HTMLDivElement | null = null;
    static get observedAttributes(): string[] {
        return ["label", "position", "disabled", "max-width"];
    }
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void {
        if (oldVal === newVal || !this.isConnected)
            return;
        if (name === "label" && this._float) {
            this._float.textContent = newVal ?? "";
        }
        else if (name === "max-width" && this._float) {
            this._float.style.maxWidth = newVal ?? "";
        }
        else if (name === "disabled") {
            this._hide();
        }
    }
    connectedCallback(): void {
        super.connectedCallback();
        this._createFloat();
        this.addEventListener("mouseenter", this._show);
        this.addEventListener("mouseleave", this._hide);
        this.addEventListener("focusin", this._show);
        this.addEventListener("focusout", this._hide);
    }
    disconnectedCallback(): void {
        this.removeEventListener("mouseenter", this._show);
        this.removeEventListener("mouseleave", this._hide);
        this.removeEventListener("focusin", this._show);
        this.removeEventListener("focusout", this._hide);
        this._float?.remove();
        this._float = null;
    }
    protected render(): void {
        this.root.innerHTML = `${this.css(styles)}<slot></slot>`;
    }
    private _createFloat(): void {
        this._float = document.createElement("div");
        this._float.className = "td-tooltip-float";
        this._float.setAttribute("role", "tooltip");
        this._float.setAttribute("aria-hidden", "true");
        this._float.textContent = this.getAttribute("label") ?? "";
        const mw = this.getAttribute("max-width");
        if (mw)
            this._float.style.maxWidth = mw;
        document.body.appendChild(this._float);
    }
    showAt(anchor: Element, label: string, position = "right"): void {
        const el = this._float;
        if (!el)
            return;
        el.textContent = label;
        const rect = anchor.getBoundingClientRect();
        this._position(el, rect, position);
        el.classList.add("visible");
    }
    hide(): void {
        this._float?.classList.remove("visible");
    }
    private _show = (): void => {
        if (this.hasAttribute("disabled"))
            return;
        const label = this.getAttribute("label");
        if (!label)
            return;
        const pos = this.getAttribute("position") ?? "right";
        this.showAt(this, label, pos);
    };
    private _hide = (): void => {
        this.hide();
    };
    private _position(el: HTMLElement, rect: DOMRect, pos: string): void {
        el.dataset.pos = pos;
        const gap = 10;
        switch (pos) {
            case "right":
                el.style.top = `${rect.top + rect.height / 2}px`;
                el.style.left = `${rect.right + gap}px`;
                el.style.transform = "translateY(-50%)";
                break;
            case "left":
                el.style.top = `${rect.top + rect.height / 2}px`;
                el.style.left = `${rect.left - gap}px`;
                el.style.transform = "translate(-100%, -50%)";
                break;
            case "top":
                el.style.top = `${rect.top - gap}px`;
                el.style.left = `${rect.left + rect.width / 2}px`;
                el.style.transform = "translate(-50%, -100%)";
                break;
            case "bottom":
                el.style.top = `${rect.bottom + gap}px`;
                el.style.left = `${rect.left + rect.width / 2}px`;
                el.style.transform = "translateX(-50%)";
                break;
        }
        const fr = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (fr.right > vw - gap) {
            el.style.left = `${parseFloat(el.style.left) - (fr.right - vw + gap)}px`;
        }
        else if (fr.left < gap) {
            el.style.left = `${parseFloat(el.style.left) + (gap - fr.left)}px`;
        }
        if (fr.bottom > vh - gap) {
            el.style.top = `${parseFloat(el.style.top) - (fr.bottom - vh + gap)}px`;
        }
        else if (fr.top < gap) {
            el.style.top = `${parseFloat(el.style.top) + (gap - fr.top)}px`;
        }
    }
}
customElements.define("td-tooltip", UITooltip);
