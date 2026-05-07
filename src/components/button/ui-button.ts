import { UIComponent } from "../../core/component";
import styles from "./ui-button.css?raw";

export class UIButton extends UIComponent {
  protected render(): void {
    const validTypes = ["button", "submit", "reset"] as const;
    const requestedType = this.getAttribute("type") ?? "button";
    const type = validTypes.includes(requestedType as any) ? requestedType : "button";
    const label = (this.textContent?.trim() || this.getAttribute("label")) ?? "Button";
    const disabled = this.hasAttribute("disabled");
    const variant = this.getAttribute("variant");
    const validVariants = ["success", "warning", "alert"] as const;
    const variantClass = validVariants.includes(variant as any) ? `button--${variant}` : "";
    const size = this.getAttribute("size") ?? "medium";
    const validSizes = ["small", "medium", "large", "extra-large"] as const;
    const sizeClass = validSizes.includes(size as any) ? `button--${size}` : "button--medium";

    this.root.innerHTML = `
      ${this.css(styles)}
      <button part="button" type="${type}" ${disabled ? "disabled" : ""} class="${[variantClass, sizeClass].filter(Boolean).join(" ")}">${label}</button>
    `;
  }
}

customElements.define("ui-button", UIButton);
