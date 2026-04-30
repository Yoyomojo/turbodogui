import { UIComponent } from "../../core/component";
import styles from "./ui-accordion.css?raw";

export class UIAccordion extends UIComponent {
  private items: Map<number, { header: HTMLElement; content: HTMLElement }> = new Map();
  private activeIndex: number | null = null;
  private keydownHandlers: Map<HTMLButtonElement, (e: KeyboardEvent) => void> = new Map();

  protected render(): void {
    const allowMultiple = this.hasAttribute("allow-multiple");
    const itemCount = parseInt(this.getAttribute("items") ?? "0", 10);

    let html = `${this.css(styles)}<div class="accordion" role="region" aria-label="Accordion">`;

    for (let i = 0; i < itemCount; i++) {
      const title = this.getAttribute(`item-${i}-title`) ?? `Item ${i + 1}`;
      html += `
        <div class="accordion-item">
          <button
            class="accordion-header"
            role="tab"
            aria-expanded="false"
            aria-controls="panel-${i}"
            data-accordion-index="${i}"
          >
            <span>${title}</span>
            <span class="accordion-toggle">▼</span>
          </button>
          <div
            class="accordion-content"
            id="panel-${i}"
            role="tabpanel"
            data-accordion-index="${i}"
          >
            <div class="accordion-body">
              <slot name="item-${i}"></slot>
            </div>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    this.root.innerHTML = html;

    this.attachEventListeners(allowMultiple);
  }

  private attachEventListeners(allowMultiple: boolean): void {
    const headers = this.root.querySelectorAll<HTMLButtonElement>(".accordion-header");

    headers.forEach((header) => {
      const clickHandler = () => {
        const index = parseInt(header.getAttribute("data-accordion-index") ?? "0", 10);
        this.toggleItem(index, allowMultiple);
      };

      const keydownHandler = (e: KeyboardEvent) => {
        const index = parseInt(header.getAttribute("data-accordion-index") ?? "0", 10);

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextHeader = this.root.querySelector<HTMLButtonElement>(
            `[data-accordion-index="${index + 1}"]`
          );
          nextHeader?.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevHeader = this.root.querySelector<HTMLButtonElement>(
            `[data-accordion-index="${index - 1}"]`
          );
          prevHeader?.focus();
        } else if (e.key === "Home") {
          e.preventDefault();
          const firstHeader = this.root.querySelector<HTMLButtonElement>(
            '[data-accordion-index="0"]'
          );
          firstHeader?.focus();
        } else if (e.key === "End") {
          e.preventDefault();
          const lastHeader = this.root.querySelector<HTMLButtonElement>(
            `[data-accordion-index="${this.root.querySelectorAll('[data-accordion-index]').length - 1}"]`
          );
          lastHeader?.focus();
        }
      };

      header.addEventListener("click", clickHandler);
      header.addEventListener("keydown", keydownHandler);
      this.keydownHandlers.set(header, keydownHandler);
    });
  }

  disconnectedCallback(): void {
    this.keydownHandlers.forEach((handler, header) => {
      header.removeEventListener("keydown", handler);
    });
    this.keydownHandlers.clear();
  }

  private toggleItem(index: number, allowMultiple: boolean): void {
    const header = this.root.querySelector<HTMLButtonElement>(
      `[data-accordion-index="${index}"]`
    );
    const content = this.root.querySelector<HTMLDivElement>(
      `[data-accordion-index="${index}"][role="tabpanel"]`
    );

    if (!header || !content) return;

    const isActive = header.classList.contains("active");

    if (!allowMultiple && this.activeIndex !== null && this.activeIndex !== index) {
      const prevHeader = this.root.querySelector<HTMLButtonElement>(
        `[data-accordion-index="${this.activeIndex}"]`
      );
      const prevContent = this.root.querySelector<HTMLDivElement>(
        `[data-accordion-index="${this.activeIndex}"][role="tabpanel"]`
      );

      if (prevHeader && prevContent) {
        prevHeader.classList.remove("active");
        prevHeader.setAttribute("aria-expanded", "false");
        prevContent.classList.remove("active");
      }
    }

    if (isActive) {
      header.classList.remove("active");
      header.setAttribute("aria-expanded", "false");
      content.classList.remove("active");
      this.activeIndex = null;
    } else {
      header.classList.add("active");
      header.setAttribute("aria-expanded", "true");
      content.classList.add("active");
      this.activeIndex = index;
    }

    this.dispatchEvent(
      new CustomEvent("accordion-toggle", {
        detail: { activeIndex: index, isActive: !isActive },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("ui-accordion", UIAccordion);
