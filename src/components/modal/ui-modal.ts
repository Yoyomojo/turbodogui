import { UIComponent } from "../../core/component";
import styles from "./ui-modal.css?raw";

export class UIModal extends UIComponent {
  private escapeHandler?: (e: KeyboardEvent) => void;
  private tabHandler?: (e: KeyboardEvent) => void;
  private titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;

  protected render(): void {
    const title = this.getAttribute("title") ?? "Modal";
    const width = this.getAttribute("width");
    const widthStyle = width ? `width: ${width};` : "";

    this.root.innerHTML = `
      ${this.css(styles)}
      ${width ? `<style>.modal-content { ${widthStyle} }</style>` : ""}
      <div class="modal-overlay" part="overlay">
        <div class="modal-content" part="content" role="dialog" aria-modal="true" aria-labelledby="${this.titleId}">
          <div class="modal-header">
            <h2 class="modal-title" id="${this.titleId}">${title}</h2>
            <button class="modal-close" aria-label="Close modal">✕</button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
        </div>
      </div>
    `;

    this.setupListeners();
    this.setupFocusTrap();
  }

  private setupListeners(): void {
    const closeBtn = this.root.querySelector<HTMLButtonElement>(".modal-close");
    const overlay = this.root.querySelector<HTMLDivElement>(".modal-overlay");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    if (overlay && this.hasAttribute("close-on-overlay")) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.close();
        }
      });
    }

    if (this.hasAttribute("close-on-escape")) {
      this.escapeHandler = (e) => {
        if (e.key === "Escape") {
          this.close();
        }
      };
      document.addEventListener("keydown", this.escapeHandler);
    }
  }

  private setupFocusTrap(): void {
    const modalContent = this.root.querySelector<HTMLDivElement>(".modal-content");
    if (!modalContent) return;

    const focusableElements = modalContent.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    this.tabHandler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modalContent.addEventListener("keydown", this.tabHandler);

    if (firstElement) {
      firstElement.focus();
    }
  }

  disconnectedCallback(): void {
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
    }

    const modalContent = this.root.querySelector<HTMLDivElement>(".modal-content");
    if (modalContent && this.tabHandler) {
      modalContent.removeEventListener("keydown", this.tabHandler);
    }
  }

  close(): void {
    this.remove();
  }
}

customElements.define("ui-modal", UIModal);
