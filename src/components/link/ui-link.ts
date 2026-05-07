import { UIComponent } from "../../core/component";
import { router } from "../../core/router";
import styles from "./ui-link.css?raw";

const VALID_VARIANTS = ["success", "warning", "alert"] as const;
type Variant = typeof VALID_VARIANTS[number];

const VALID_SIZES = ["small", "medium", "large", "extra-large"] as const;
type Size = typeof VALID_SIZES[number];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export class UILink extends UIComponent {
  static get observedAttributes(): string[] {
    return ["to", "href", "label", "title", "new-window", "button", "variant", "size", "disabled"];
  }

  attributeChangedCallback(): void {
    this.render();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.root.addEventListener("click", this.handleClick);
  }

  disconnectedCallback(): void {
    this.root.removeEventListener("click", this.handleClick);
  }

  protected render(): void {
    const to = this.getAttribute("to") ?? this.getAttribute("href") ?? "/";
    const label = this.textContent?.trim() || this.getAttribute("label") || to;
    const title = this.getAttribute("title");
    const newWindow = this.hasAttribute("new-window");
    const isButton = this.hasAttribute("button");
    const disabled = this.hasAttribute("disabled");
    const variant = this.getAttribute("variant") as Variant | null;
    const variantClass = VALID_VARIANTS.includes(variant as Variant) ? `button--${variant}` : "";
    const size = this.getAttribute("size") as Size | null;
    const sizeClass = isButton ? (VALID_SIZES.includes(size as Size) ? `button--${size}` : "button--medium") : "";

    const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
    const targetAttr = newWindow ? ` target="_blank" rel="noopener noreferrer"` : "";
    const ariaDisabled = isButton && disabled ? ` aria-disabled="true" tabindex="-1"` : "";

    let classAttr = "";
    if (isButton) {
      const classes = ["button", variantClass, sizeClass, ...(disabled ? ["disabled"] : "")].filter(Boolean);
      classAttr = ` class="${classes.join(" ")}"`;
    }

    this.root.innerHTML = `
      ${this.css(styles)}
      <a href="${escapeHtml(to)}"${classAttr}${titleAttr}${targetAttr}${ariaDisabled}>${escapeHtml(label)}</a>
    `;
  }

  private handleClick = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest("a");
    if (!anchor) return;
    if (anchor.target === "_blank") return;
    if (this.hasAttribute("disabled")) return;

    event.preventDefault();
    const to = this.getAttribute("to") ?? this.getAttribute("href") ?? "/";
    router.navigate(to);
  };
}

customElements.define("ui-link", UILink);
