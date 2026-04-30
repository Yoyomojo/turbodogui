import { UIComponent } from "../../core/component";
import styles from "./ui-tabs.css?raw";

export class UITabs extends UIComponent {
  private activeTabIndex: number = 0;
  private tabButtons: HTMLButtonElement[] = [];
  private tabPanels: HTMLDivElement[] = [];
  private clickHandlers: Map<HTMLButtonElement, (e: Event) => void> = new Map();
  private keydownHandlers: Map<HTMLButtonElement, (e: KeyboardEvent) => void> = new Map();
  private scrollHandler: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;

  protected render(): void {
    const defaultTab = this.getAttribute("default-tab");
    this.activeTabIndex = defaultTab ? parseInt(defaultTab, 10) : 0;

    const tabsData = this.parseTabsData();

    const tabButtonsHTML = tabsData
      .map((_, index) => `
        <li>
          <button
            class="tab-button"
            role="tab"
            aria-selected="${index === this.activeTabIndex}"
            data-tab-index="${index}"
          >
            ${this.getTabLabel(index)}
          </button>
        </li>
      `)
      .join("");

    const tabPanelsHTML = tabsData
      .map((_, index) => `
        <div
          class="tab-panel"
          role="tabpanel"
          data-active="${index === this.activeTabIndex}"
          data-tab-index="${index}"
        >
          <slot name="tab-${index}"></slot>
        </div>
      `)
      .join("");

    this.root.innerHTML = `
      ${this.css(styles)}
      <div class="tabs-container">
        <div class="tabs-nav">
          <button class="scroll-btn scroll-btn--left" aria-label="Scroll tabs left" hidden>&#8249;</button>
          <div class="tabs-scroll-wrapper">
            <ul class="tabs-list" role="tablist">
              ${tabButtonsHTML}
            </ul>
          </div>
          <button class="scroll-btn scroll-btn--right" aria-label="Scroll tabs right" hidden>&#8250;</button>
        </div>
        <div class="tabs-content">
          ${tabPanelsHTML}
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.initScrollControls();
  }

  private initScrollControls(): void {
    const wrapper = this.root.querySelector<HTMLElement>(".tabs-scroll-wrapper");
    const btnLeft = this.root.querySelector<HTMLButtonElement>(".scroll-btn--left");
    const btnRight = this.root.querySelector<HTMLButtonElement>(".scroll-btn--right");

    if (!wrapper || !btnLeft || !btnRight) return;

    const updateArrows = () => {
      const atStart = wrapper.scrollLeft <= 0;
      const atEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 1;
      const hasOverflow = wrapper.scrollWidth > wrapper.clientWidth;

      btnLeft.hidden = !hasOverflow || atStart;
      btnRight.hidden = !hasOverflow || atEnd;
    };

    this.scrollHandler = updateArrows;
    wrapper.addEventListener("scroll", updateArrows);

    btnLeft.addEventListener("click", () => {
      wrapper.scrollBy({ left: -150, behavior: "smooth" });
    });
    btnRight.addEventListener("click", () => {
      wrapper.scrollBy({ left: 150, behavior: "smooth" });
    });

    this.resizeObserver = new ResizeObserver(updateArrows);
    this.resizeObserver.observe(wrapper);

    updateArrows();
  }

  private parseTabsData(): Array<{ label: string }> {
    const labels = this.getAttribute("labels")?.split("|") || [];

    if (labels.length > 0) {
      return labels.map(label => ({ label: label.trim() }));
    }

    const slots = this.querySelectorAll("[slot^='tab-']");
    return Array.from(slots).map((slot, index) => ({
      label: slot.getAttribute("tab-label") || `Tab ${index + 1}`,
    }));
  }

  private getTabLabel(index: number): string {
    const labels = this.getAttribute("labels")?.split("|") || [];
    if (labels[index]) {
      return labels[index].trim();
    }

    const slot = this.querySelector(`[slot="tab-${index}"]`);
    return slot?.getAttribute("tab-label") || `Tab ${index + 1}`;
  }

  private attachEventListeners(): void {
    const tabButtons = this.root.querySelectorAll<HTMLButtonElement>(".tab-button");

    tabButtons.forEach(button => {
      const clickHandler = (e: Event) => this.handleTabClick(e);
      const keydownHandler = (e: KeyboardEvent) => this.handleTabKeydown(e);

      button.addEventListener("click", clickHandler);
      button.addEventListener("keydown", keydownHandler);

      this.clickHandlers.set(button, clickHandler);
      this.keydownHandlers.set(button, keydownHandler);
    });
  }

  disconnectedCallback(): void {
    this.clickHandlers.forEach((handler, button) => {
      button.removeEventListener("click", handler);
    });
    this.keydownHandlers.forEach((handler, button) => {
      button.removeEventListener("keydown", handler);
    });
    this.clickHandlers.clear();
    this.keydownHandlers.clear();

    if (this.scrollHandler) {
      const wrapper = this.root.querySelector<HTMLElement>(".tabs-scroll-wrapper");
      wrapper?.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private handleTabClick(e: Event): void {
    const button = e.target as HTMLButtonElement;
    const tabIndex = parseInt(button.getAttribute("data-tab-index") || "0", 10);
    this.selectTab(tabIndex);
  }

  private handleTabKeydown(e: KeyboardEvent): void {
    const button = e.target as HTMLButtonElement;
    const currentIndex = parseInt(button.getAttribute("data-tab-index") || "0", 10);
    const allButtons = Array.from(this.root.querySelectorAll<HTMLButtonElement>(".tab-button"));
    const tabCount = allButtons.length;

    let nextIndex = currentIndex;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabCount;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabCount) % tabCount;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabCount - 1;
    }

    if (nextIndex !== currentIndex) {
      this.selectTab(nextIndex);
      allButtons[nextIndex]?.focus();
    }
  }

  private selectTab(index: number): void {
    const allButtons = this.root.querySelectorAll<HTMLButtonElement>(".tab-button");
    const allPanels = this.root.querySelectorAll<HTMLDivElement>(".tab-panel");

    allButtons.forEach((button, i) => {
      button.setAttribute("aria-selected", i === index ? "true" : "false");
    });

    allPanels.forEach((panel, i) => {
      panel.setAttribute("data-active", i === index ? "true" : "false");
    });

    this.activeTabIndex = index;

    this.dispatchEvent(
      new CustomEvent("tab-changed", {
        detail: { activeIndex: index },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("ui-tabs", UITabs);
