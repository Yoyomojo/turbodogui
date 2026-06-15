import { UIComponent } from "../../core/component";
import styles from "./td-alert.css?raw";
const ICONS: Record<string, string> = {
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    alert: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
};
const DISMISS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
const VALID_VARIANTS = ["info", "success", "warning", "alert"] as const;
type AlertVariant = (typeof VALID_VARIANTS)[number];
const _TOAST_CONTAINERS = new Map<string, HTMLElement>();
function _getToastContainer(pos: string): HTMLElement {
    let el = _TOAST_CONTAINERS.get(pos);
    if (el?.isConnected)
        return el;
    el = document.createElement("div");
    el.setAttribute("data-toast-container", pos);
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", "Notifications");
    el.setAttribute("aria-live", "polite");
    const s = el.style;
    s.position = "fixed";
    s.zIndex = "9999";
    s.display = "flex";
    s.flexDirection = "column";
    s.gap = "0.5rem";
    s.pointerEvents = "none";
    if (pos.startsWith("bottom")) {
        s.bottom = "1rem";
    }
    else {
        s.top = "1rem";
    }
    if (pos.endsWith("-left")) {
        s.left = "1rem";
    }
    else if (pos.endsWith("-center")) {
        s.left = "50%";
        s.transform = "translateX(-50%)";
    }
    else {
        s.right = "1rem";
    }
    document.body.appendChild(el);
    _TOAST_CONTAINERS.set(pos, el);
    return el;
}
export class UIAlert extends UIComponent {
    private _timer: ReturnType<typeof setTimeout> | null = null;
    static get observedAttributes(): string[] {
        return ["variant", "dismissible", "title", "toast", "toast-position", "duration"];
    }
    connectedCallback(): void {
        if (this.hasAttribute("toast") && !this.parentElement?.hasAttribute("data-toast-container")) {
            const pos = this.getAttribute("toast-position") ?? "top-right";
            _getToastContainer(pos).appendChild(this);
            return;
        }
        this.render();
        if (this.hasAttribute("toast")) {
            this._startTimer();
        }
    }
    disconnectedCallback(): void {
        if (this._timer !== null) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }
    attributeChangedCallback(_name: string, oldVal: string | null, newVal: string | null): void {
        if (oldVal !== newVal && this.isConnected)
            this.render();
    }
    private _startTimer(): void {
        const d = parseInt(this.getAttribute("duration") ?? "0", 10);
        if (d > 0) {
            this._timer = setTimeout(() => this._dismiss(), d);
        }
    }
    private _dismiss(): void {
        if (this._timer !== null) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        this.dispatchEvent(new CustomEvent("dismiss", { bubbles: true, composed: true }));
        if (this.hasAttribute("toast")) {
            this.setAttribute("data-leaving", "");
            setTimeout(() => this.remove(), 220);
        }
        else {
            this.hidden = true;
        }
    }
    protected render(): void {
        const raw = this.getAttribute("variant") ?? "info";
        const variant: AlertVariant = VALID_VARIANTS.includes(raw as AlertVariant) ? (raw as AlertVariant) : "info";
        const isToast = this.hasAttribute("toast");
        const dismissible = this.hasAttribute("dismissible") || isToast;
        const title = this.getAttribute("title");
        this.root.innerHTML = `
      ${this.css(styles)}
      <div role="alert" class="alert alert--${variant}">
        <span class="alert-icon">${ICONS[variant]}</span>
        <div class="alert-body">
          ${title ? `<p class="alert-title">${title}</p>` : ""}
          <slot></slot>
        </div>
        ${dismissible ? `<button class="alert-dismiss" aria-label="Dismiss">${DISMISS_ICON}</button>` : ""}
      </div>
    `;
        if (dismissible) {
            this.root.querySelector(".alert-dismiss")?.addEventListener("click", () => this._dismiss());
        }
    }
}
customElements.define("td-alert", UIAlert);
