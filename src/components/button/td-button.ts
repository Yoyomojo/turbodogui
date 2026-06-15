import { UIComponent } from "../../core/component";
import styles from "./td-button.css?raw";
export class UIButton extends UIComponent {
    static get observedAttributes(): string[] {
        return ["full-width", "disabled"];
    }
    get fullWidth(): boolean {
        return this.hasAttribute("full-width");
    }
    set fullWidth(val: boolean) {
        if (val) {
            this.setAttribute("full-width", "");
        }
        else {
            this.removeAttribute("full-width");
        }
    }
    attributeChangedCallback(name: string): void {
        const btn = this.root.querySelector<HTMLButtonElement>("button");
        if (!btn)
            return;
        if (name === "full-width") {
            btn.classList.toggle("button--full-width", this.hasAttribute("full-width"));
        }
        if (name === "disabled") {
            btn.disabled = this.hasAttribute("disabled");
        }
    }
    protected render(): void {
        const validTypes = ["button", "submit", "reset"] as const;
        const requestedType = this.getAttribute("type") ?? "button";
        const type = validTypes.includes(requestedType as any) ? requestedType : "button";
        const label = (this.textContent?.trim() || this.getAttribute("label")) ?? "Button";
        const disabled = this.hasAttribute("disabled");
        const fullWidth = this.hasAttribute("full-width");
        const variant = this.getAttribute("variant");
        const validVariants = ["success", "warning", "alert"] as const;
        const variantClass = validVariants.includes(variant as any) ? `button--${variant}` : "";
        const size = this.getAttribute("size") ?? "medium";
        const validSizes = ["small", "medium", "large", "extra-large"] as const;
        const sizeClass = validSizes.includes(size as any) ? `button--${size}` : "button--medium";
        const fullWidthClass = fullWidth ? "button--full-width" : "";
        this.root.innerHTML = `
      ${this.css(styles)}
      <button part="button" type="${type}" ${disabled ? "disabled" : ""} class="${[variantClass, sizeClass, fullWidthClass].filter(Boolean).join(" ")}">${label}</button>
    `;
        if (type === "submit" || type === "reset") {
            const btn = this.root.querySelector<HTMLButtonElement>("button");
            btn?.addEventListener("click", () => {
                const form = this.closest("form");
                if (!form)
                    return;
                if (type === "submit")
                    form.requestSubmit();
                if (type === "reset")
                    form.reset();
            });
        }
    }
}
customElements.define("td-button", UIButton);
