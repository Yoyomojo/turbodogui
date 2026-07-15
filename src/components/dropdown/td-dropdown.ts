import { UIComponent } from "../../core/component";
import styles from "./td-dropdown.css?raw";

export interface DropdownItem {
  label: string;
  value?: string;
  href?: string;
  target?: string;
  disabled?: boolean;
  divider?: boolean;
  icon?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FLOAT_STYLES = `
  .td-dropdown-float {
    position: fixed;
    z-index: 9000;
    background: var(--td-surface);
    border: 1px solid var(--td-border);
    border-radius: 12px;
    box-shadow: var(--td-shadow);
    padding: 6px;
    min-width: 160px;
    max-height: 320px;
    overflow-y: auto;
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
    transition: opacity 140ms ease, transform 140ms ease;
    pointer-events: none;
    font-family: inherit;
    box-sizing: border-box;
  }
  .td-dropdown-float.td-dropdown-float--open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
  .td-dropdown-float.td-dropdown-float--above {
    transform: translateY(6px) scale(0.97);
  }
  .td-dropdown-float.td-dropdown-float--above.td-dropdown-float--open {
    transform: translateY(0) scale(1);
  }
  .td-dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--td-fg);
    font: inherit;
    font-size: 0.9375rem;
    cursor: pointer;
    border-radius: 8px;
    text-align: left;
    text-decoration: none;
    box-sizing: border-box;
    transition: background 100ms ease;
    outline: none;
    white-space: nowrap;
  }
  .td-dropdown-item:hover {
    background: var(--td-surface-2);
  }
  .td-dropdown-item:focus-visible,
  .td-dropdown-item--focused {
    background: var(--td-surface-2);
    outline: 2px solid var(--td-primary);
    outline-offset: -2px;
  }
  .td-dropdown-item--disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }
  .td-dropdown-divider {
    height: 1px;
    background: var(--td-border);
    margin: 4px 6px;
    border: none;
  }
  .td-dropdown-icon {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.75;
  }
  .td-dropdown-status {
    padding: 0.65rem 1rem;
    color: var(--td-muted);
    font-size: 0.875rem;
    font-family: inherit;
  }
  .td-dropdown-item-label {
    flex: 1;
    min-width: 0;
  }
  .td-dropdown-check {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--td-primary);
    margin-left: 0.25rem;
  }
  .td-dropdown-item--selected {
    color: var(--td-primary);
    font-weight: 600;
  }
`;

function ensureFloatStyles(): void {
  if (document.querySelector("style[data-td-dropdown]")) return;
  const tag = document.createElement("style");
  tag.dataset.tdDropdown = "";
  tag.textContent = FLOAT_STYLES;
  document.head.appendChild(tag);
}

export class UIDropdown extends UIComponent {
  private _float: HTMLDivElement | null = null;
  private _open = false;
  private _items: DropdownItem[] = [];
  private _focusedIndex = -1;
  private _srcLoaded = false;
  private _outsideClick: ((e: MouseEvent) => void) | null = null;
  private _keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private _selectedValue: string | null = null;
  private _selectedLabel: string | null = null;

  static get observedAttributes(): string[] {
    return ["label", "items", "src", "disabled", "placement", "variant", "size", "value"];
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void {
    if (oldVal === newVal || !this.isConnected) return;
    if (name === "items") {
      this._parseItems();
      // Refresh selected label in case new items include the current value
      if (this._selectedValue !== null) {
        const match = this._items.find((i) => i.value === this._selectedValue);
        this._selectedLabel = match?.label ?? this._selectedLabel;
      }
      if (this._open) this._renderPanel();
      this._updateTriggerLabel();
    } else if (name === "src") {
      this._srcLoaded = false;
      if (this._open) void this._loadSrc();
    } else if (name === "value") {
      this._selectedValue = newVal || null;
      const match = this._items.find((i) => i.value === newVal);
      this._selectedLabel = match?.label ?? null;
      this._updateTriggerLabel();
      if (this._open) this._renderPanel();
    } else if (name === "label" && this._float) {
      this._float.setAttribute("aria-label", newVal ?? "Menu");
      this._updateTriggerLabel();
    } else {
      this.render();
      this._updateTriggerState();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    ensureFloatStyles();
    this._createFloat();
    this._parseItems();
  }

  disconnectedCallback(): void {
    this._close();
    this._float?.remove();
    this._float = null;
  }

  protected render(): void {
    const label = this.getAttribute("label") ?? "Menu";
    const disabled = this.hasAttribute("disabled");
    const size = this._validSize();
    const variant = this.getAttribute("variant") ?? "";
    const validVariants = ["primary", "success", "warning", "alert"] as const;
    const variantClass = validVariants.includes(variant as any) ? `trigger--${variant}` : "";

    const chevronSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    const displayLabel = this._selectedLabel ?? label;

    this.root.innerHTML = `
      ${this.css(styles)}
      <div class="dropdown-wrap">
        <button
          part="trigger"
          class="trigger trigger--${size} ${variantClass}"
          aria-haspopup="menu"
          aria-expanded="${this._open}"
          ${disabled ? "disabled" : ""}
        >
          <span class="trigger-label">${escapeHtml(displayLabel)}</span>
          <span class="trigger-chevron ${this._open ? "trigger-chevron--open" : ""}" aria-hidden="true">${chevronSvg}</span>
        </button>
      </div>
    `;

    this.root.querySelector<HTMLButtonElement>(".trigger")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggle();
    });
  }

  private _validSize(): string {
    const requested = this.getAttribute("size") ?? "medium";
    const valid = ["small", "medium", "large", "extra-large"] as const;
    return valid.includes(requested as any) ? requested : "medium";
  }

  private _createFloat(): void {
    this._float = document.createElement("div");
    this._float.className = "td-dropdown-float";
    this._float.setAttribute("role", "menu");
    this._float.setAttribute("aria-label", this.getAttribute("label") ?? "Menu");
    document.body.appendChild(this._float);
  }

  private _parseItems(): void {
    const attr = this.getAttribute("items");
    if (!attr) { this._items = []; return; }
    try {
      this._items = JSON.parse(attr) as DropdownItem[];
    } catch {
      this._items = [];
    }
  }

  private async _loadSrc(): Promise<void> {
    const src = this.getAttribute("src");
    if (!src || this._srcLoaded) return;
    if (this._float) {
      this._float.innerHTML = `<div class="td-dropdown-status">Loading…</div>`;
    }
    try {
      const url = new URL(src, window.location.href);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this._items = (await res.json()) as DropdownItem[];
      this._srcLoaded = true;
      this._renderPanel();
    } catch (err) {
      console.error("[td-dropdown] Failed to load src:", err);
      if (this._float) {
        this._float.innerHTML = `<div class="td-dropdown-status">Failed to load items</div>`;
      }
    }
  }

  private _hasHtmlItems(): boolean {
    return this.childElementCount > 0 && !this.getAttribute("items") && !this.getAttribute("src");
  }

  private _renderPanel(): void {
    if (!this._float) return;

    if (this._items.length > 0) {
      this._float.innerHTML = this._items
        .map((item, i) => this._renderItem(item, i))
        .join("");
      this._attachItemListeners();
    } else if (this._hasHtmlItems()) {
      // Render light-DOM children into the panel; wrap bare elements as menu items
      this._float.innerHTML = Array.from(this.children)
        .map((el) => el.outerHTML)
        .join("");
      Array.from(this._float.querySelectorAll<HTMLElement>("a, button")).forEach((el) => {
        el.classList.add("td-dropdown-item");
        el.setAttribute("role", "menuitem");
        el.setAttribute("tabindex", "-1");
        el.addEventListener("click", () => {
          const itemLabel = el.textContent?.trim() ?? "";
          if (!(el instanceof HTMLAnchorElement)) {
            this._selectedLabel = itemLabel;
            this._selectedValue = null;
            this._updateTriggerLabel();
          }
          this.dispatchEvent(new CustomEvent("select", {
            detail: { label: itemLabel },
            bubbles: true,
            composed: true,
          }));
          this._close();
        });
      });
      Array.from(this._float.querySelectorAll<HTMLElement>("hr")).forEach((el) => {
        el.className = "td-dropdown-divider";
        el.setAttribute("role", "separator");
        el.setAttribute("aria-hidden", "true");
      });
    } else {
      this._float.innerHTML = "";
    }
  }

  private _renderItem(item: DropdownItem, index: number): string {
    if (item.divider === true || item.label === "---") {
      return `<hr class="td-dropdown-divider" role="separator" aria-hidden="true">`;
    }
    const iconHtml = item.icon
      ? `<span class="td-dropdown-icon" aria-hidden="true">${item.icon}</span>`
      : "";
    const isSelected = item.value !== undefined && item.value !== "" && item.value === this._selectedValue;
    const selectedClass = isSelected ? "td-dropdown-item--selected" : "";
    const disabledClass = item.disabled ? "td-dropdown-item--disabled" : "";
    const dataAttrs = `data-index="${index}" data-value="${escapeHtml(item.value ?? "")}" data-label="${escapeHtml(item.label)}"`;
    const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const checkHtml = `<span class="td-dropdown-check" aria-hidden="true">${isSelected ? checkSvg : ""}</span>`;

    if (item.href && !item.disabled) {
      const rel = item.target ? ' rel="noopener noreferrer"' : "";
      const target = item.target ? ` target="${escapeHtml(item.target)}"` : "";
      return `<a role="menuitem" class="td-dropdown-item ${selectedClass} ${disabledClass}" href="${escapeHtml(item.href)}"${target}${rel} tabindex="-1" ${dataAttrs}>${iconHtml}<span class="td-dropdown-item-label">${escapeHtml(item.label)}</span>${checkHtml}</a>`;
    }

    return `<button role="menuitem" class="td-dropdown-item ${selectedClass} ${disabledClass}" type="button" ${item.disabled ? 'aria-disabled="true"' : ""} tabindex="-1" ${dataAttrs}>${iconHtml}<span class="td-dropdown-item-label">${escapeHtml(item.label)}</span>${checkHtml}</button>`;
  }

  private _attachItemListeners(): void {
    if (!this._float) return;
    this._float
      .querySelectorAll<HTMLElement>(".td-dropdown-item:not(.td-dropdown-item--disabled)")
      .forEach((el) => {
        el.addEventListener("click", () => {
          const value = el.dataset.value ?? "";
          const label = el.dataset.label ?? "";
          if (!(el instanceof HTMLAnchorElement)) {
            this._selectedValue = value || null;
            this._selectedLabel = label;
            this._updateTriggerLabel();
            this._renderPanel(); // refresh checkmarks
          }
          this.dispatchEvent(new CustomEvent("select", {
            detail: { value, label },
            bubbles: true,
            composed: true,
          }));
          if (el instanceof HTMLAnchorElement) {
            setTimeout(() => this._close(), 10);
          } else {
            this._close();
          }
        });
      });
  }

  private _toggle(): void {
    this._open ? this._close() : this._openMenu();
  }

  private _openMenu(): void {
    this._open = true;
    this._updateTriggerState();
    this._focusedIndex = -1;

    if (this.getAttribute("src") && !this._srcLoaded) {
      void this._loadSrc();
    } else {
      this._renderPanel();
    }

    this._positionFloat();

    requestAnimationFrame(() => {
      this._float?.classList.add("td-dropdown-float--open");
    });

    this._outsideClick = (e: MouseEvent) => {
      const t = e.composedPath()[0] as Node;
      if (!this.contains(t) && !this._float?.contains(t)) {
        this._close();
      }
    };
    document.addEventListener("click", this._outsideClick);

    this._keydownHandler = (e: KeyboardEvent) => this._handleKeydown(e);
    document.addEventListener("keydown", this._keydownHandler);
  }

  private _close(): void {
    if (!this._open) return;
    this._open = false;
    this._float?.classList.remove("td-dropdown-float--open");
    this._updateTriggerState();

    if (this._outsideClick) {
      document.removeEventListener("click", this._outsideClick);
      this._outsideClick = null;
    }
    if (this._keydownHandler) {
      document.removeEventListener("keydown", this._keydownHandler);
      this._keydownHandler = null;
    }
  }

  private _updateTriggerState(): void {
    const btn = this.root.querySelector<HTMLButtonElement>(".trigger");
    if (!btn) return;
    btn.setAttribute("aria-expanded", String(this._open));
    btn.querySelector(".trigger-chevron")?.classList.toggle("trigger-chevron--open", this._open);
  }

  private _positionFloat(): void {
    if (!this._float) return;
    const rect = this.getBoundingClientRect();
    const placement = this.getAttribute("placement") ?? "bottom-start";
    const gap = 4;

    this._float.style.top = "";
    this._float.style.left = "";
    this._float.style.right = "";
    this._float.style.bottom = "";
    this._float.classList.remove("td-dropdown-float--above");

    const isAbove = placement.startsWith("top");

    if (isAbove) {
      this._float.style.bottom = `${window.innerHeight - rect.top + gap}px`;
      this._float.classList.add("td-dropdown-float--above");
    } else {
      this._float.style.top = `${rect.bottom + gap}px`;
    }

    if (placement.endsWith("-end")) {
      this._float.style.right = `${window.innerWidth - rect.right}px`;
    } else {
      this._float.style.left = `${rect.left}px`;
    }

    this._float.style.minWidth = `${rect.width}px`;
  }

  private _navigableItems(): HTMLElement[] {
    return Array.from(
      this._float?.querySelectorAll<HTMLElement>(
        ".td-dropdown-item:not(.td-dropdown-item--disabled)"
      ) ?? []
    );
  }

  private _handleKeydown(e: KeyboardEvent): void {
    const items = this._navigableItems();

    if (e.key === "Escape" || e.key === "Tab") {
      e.preventDefault();
      this._close();
      this.root.querySelector<HTMLButtonElement>(".trigger")?.focus();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      this._focusedIndex = Math.min(this._focusedIndex + 1, items.length - 1);
      this._applyFocus(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
      this._applyFocus(items);
    } else if (e.key === "Home") {
      e.preventDefault();
      this._focusedIndex = 0;
      this._applyFocus(items);
    } else if (e.key === "End") {
      e.preventDefault();
      this._focusedIndex = items.length - 1;
      this._applyFocus(items);
    } else if ((e.key === "Enter" || e.key === " ") && this._focusedIndex >= 0) {
      e.preventDefault();
      items[this._focusedIndex]?.click();
    }
  }

  private _applyFocus(items: HTMLElement[]): void {
    items.forEach((item, i) =>
      item.classList.toggle("td-dropdown-item--focused", i === this._focusedIndex)
    );
    items[this._focusedIndex]?.scrollIntoView({ block: "nearest" });
    items[this._focusedIndex]?.focus();
  }

  private _updateTriggerLabel(): void {
    const el = this.root.querySelector<HTMLElement>(".trigger-label");
    if (el) {
      el.textContent = this._selectedLabel ?? (this.getAttribute("label") ?? "Menu");
    }
  }

  /** The currently selected value, or null if nothing is selected */
  get value(): string | null {
    return this._selectedValue;
  }

  set value(val: string | null) {
    if (val === null || val === "") {
      this._selectedValue = null;
      this._selectedLabel = null;
      this._updateTriggerLabel();
      if (this._open) this._renderPanel();
    } else {
      this.setAttribute("value", val);
    }
  }

  /** Programmatically open the dropdown */
  open(): void {
    if (!this._open) this._openMenu();
  }

  /** Programmatically close the dropdown */
  close(): void {
    this._close();
  }

  get isOpen(): boolean {
    return this._open;
  }
}

customElements.define("td-dropdown", UIDropdown);
