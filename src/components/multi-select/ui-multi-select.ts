import { UIComponent } from "../../core/component";
import styles from "./ui-multi-select.css?raw";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export class UIMultiSelect extends UIComponent {
  private _options: MultiSelectOption[] = [];
  private _selected: Set<string> = new Set();
  private _searchQuery: string = "";
  private _open: boolean = false;
  private _valueInitialized: boolean = false;
  private _outsideClickHandler: ((e: MouseEvent) => void) | null = null;

  static get observedAttributes(): string[] {
    return ["label", "options", "value", "search", "placeholder", "search-placeholder", "select-all"];
  }

  attributeChangedCallback(name: string): void {
    if (name === "value") {
      this._valueInitialized = false;
    }
    this.render();
  }

  disconnectedCallback(): void {
    this._removeOutsideListener();
  }

  get options(): MultiSelectOption[] {
    return this._options;
  }

  set options(val: MultiSelectOption[]) {
    this._options = val;
    this.render();
  }

  get value(): string[] {
    return Array.from(this._selected);
  }

  set value(selected: string[]) {
    this._selected = new Set(selected);
    this._valueInitialized = true;
    this.render();
  }

  private parseOptions(): MultiSelectOption[] {
    if (this._options.length > 0) return this._options;
    try {
      const attr = this.getAttribute("options");
      return attr ? JSON.parse(attr) : [];
    } catch {
      return [];
    }
  }

  private parseValue(): void {
    if (this._valueInitialized) return;
    this._valueInitialized = true;
    try {
      const attr = this.getAttribute("value");
      if (attr) {
        const parsed: string[] = JSON.parse(attr);
        this._selected = new Set(parsed);
      }
    } catch {

    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  protected render(): void {
    this.parseValue();

    const label = this.getAttribute("label");
    const hasSearch = this.hasAttribute("search");
    const hasSelectAll = this.hasAttribute("select-all");
    const placeholder = this.getAttribute("placeholder") ?? label ?? "Select options...";
    const searchPlaceholder = this.getAttribute("search-placeholder") ?? "Search...";
    const options = this.parseOptions();
    const count = this._selected.size;

    const optionMap = new Map(options.map((o) => [o.value, o.label]));

    const filtered = this._searchQuery.trim()
      ? options.filter((o) =>
          o.label.toLowerCase().includes(this._searchQuery.trim().toLowerCase())
        )
      : options;

    const filteredSelected = filtered.filter((o) => this._selected.has(o.value));
    const allState =
      filtered.length > 0 && filteredSelected.length === filtered.length
        ? "all"
        : filteredSelected.length > 0
        ? "partial"
        : "none";

    const pillsHtml =
      count > 0
        ? Array.from(this._selected)
            .map((val) => {
              const lbl = optionMap.get(val) ?? val;
              return `<span class="pill">
                <span class="pill-label">${this.escapeHtml(lbl)}</span>
                <button class="pill-remove" type="button" aria-label="Remove ${this.escapeHtml(lbl)}" data-remove="${this.escapeHtml(val)}">
                  <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </button>
              </span>`;
            })
            .join("")
        : "";

    const selectAllHtml = hasSelectAll
      ? `<li
          class="option option--select-all"
          role="option"
          tabindex="0"
          data-select-all="true"
          data-state="${allState}"
        >
          <span class="checkbox checkbox--${allState}">
            ${
              allState === "all"
                ? `<svg class="checkbox-tick" viewBox="0 0 12 12" aria-hidden="true"><polyline points="2,6 5,9 10,3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                : allState === "partial"
                ? `<svg class="checkbox-dash" viewBox="0 0 12 12" aria-hidden="true"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
                : ""
            }
          </span>
          <span>${allState === "all" ? "Deselect all" : "Select all"}</span>
        </li>`
      : "";

    const optionsHtml = filtered.length
      ? filtered
          .map((o) => {
            const checked = this._selected.has(o.value);
            return `<li
                class="option"
                role="option"
                tabindex="0"
                aria-checked="${checked}"
                data-value="${this.escapeHtml(o.value)}"
              >
                <span class="checkbox">
                  <svg class="checkbox-tick" viewBox="0 0 12 12" aria-hidden="true">
                    <polyline points="2,6 5,9 10,3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                ${this.escapeHtml(o.label)}
              </li>`;
          })
          .join("")
      : `<li class="no-match" role="option" aria-disabled="true">No options match</li>`;

    this.root.innerHTML = `
      ${this.css(styles)}
      <div class="field">
        ${label ? `<span class="field-label">${this.escapeHtml(label)}</span>` : ""}
        <div class="select-wrap">
          <div
            class="trigger${count > 0 ? " trigger--has-value" : ""}"
            role="combobox"
            tabindex="0"
            aria-haspopup="listbox"
            aria-expanded="${this._open}"
          >
            <span class="trigger-inner">
              ${count > 0 ? pillsHtml : `<span class="trigger-placeholder">${this.escapeHtml(placeholder)}</span>`}
            </span>
            <svg class="chevron${this._open ? " chevron--open" : ""}" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <polyline points="5,8 10,13 15,8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="dropdown${this._open ? " dropdown--open" : ""}" role="listbox" aria-multiselectable="true">
            ${
              hasSearch
                ? `<div class="search-wrap">
                    <svg class="search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.8"/>
                      <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                    <input
                      class="search-input"
                      type="search"
                      placeholder="${this.escapeHtml(searchPlaceholder)}"
                      value="${this.escapeHtml(this._searchQuery)}"
                      aria-label="Search options"
                      autocomplete="off"
                    />
                  </div>`
                : ""
            }
            <ul class="options-list" role="presentation">
              ${selectAllHtml}
              ${optionsHtml}
            </ul>
          </div>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  private attachListeners(): void {
    const trigger = this.root.querySelector<HTMLElement>(".trigger");
    if (trigger) {
      trigger.addEventListener("click", (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest(".pill-remove")) return;
        this.toggleDropdown();
      });
      trigger.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.toggleDropdown();
        }
        if (e.key === "ArrowDown" && !this._open) {
          e.preventDefault();
          this.openDropdown();
        }
        if (e.key === "Escape") {
          this.closeDropdown();
          trigger.focus();
        }
      });
    }

    this.root.querySelectorAll<HTMLButtonElement>(".pill-remove").forEach((btn) => {
      btn.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        const val = btn.dataset.remove;
        if (val) this.deselectOption(val);
      });
    });

    const selectAllItem = this.root.querySelector<HTMLElement>(".option--select-all");
    if (selectAllItem) {
      selectAllItem.addEventListener("click", () => this.handleSelectAll(selectAllItem));
      selectAllItem.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleSelectAll(selectAllItem);
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          (selectAllItem.nextElementSibling as HTMLElement)?.focus();
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          this.root.querySelector<HTMLElement>(".search-input, .trigger")?.focus();
        }
        if (e.key === "Escape") {
          this.closeDropdown();
          this.root.querySelector<HTMLElement>(".trigger")?.focus();
        }
      });
    }

    this.root.querySelectorAll<HTMLElement>(".option[data-value]").forEach((item) => {
      item.addEventListener("click", () => this.toggleOption(item));
      item.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.toggleOption(item);
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          (item.nextElementSibling as HTMLElement)?.focus();
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = item.previousElementSibling as HTMLElement;
          if (prev?.classList.contains("option")) {
            prev.focus();
          } else {
            this.root.querySelector<HTMLElement>(".search-input, .trigger")?.focus();
          }
        }
        if (e.key === "Escape") {
          this.closeDropdown();
          this.root.querySelector<HTMLElement>(".trigger")?.focus();
        }
      });
    });

    const searchInput = this.root.querySelector<HTMLInputElement>(".search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const cursor = (e.target as HTMLInputElement).selectionStart;
        this._searchQuery = (e.target as HTMLInputElement).value;
        this.render();
        const newInput = this.root.querySelector<HTMLInputElement>(".search-input");
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(cursor ?? 0, cursor ?? 0);
        }
      });
      searchInput.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          this.root.querySelector<HTMLElement>(".option--select-all, .option[data-value]")?.focus();
        }
        if (e.key === "Escape") {
          this.closeDropdown();
          this.root.querySelector<HTMLElement>(".trigger")?.focus();
        }
      });
    }
  }

  private handleSelectAll(item: HTMLElement): void {
    const state = item.dataset.state;
    const options = this.parseOptions();
    const filtered = this._searchQuery.trim()
      ? options.filter((o) =>
          o.label.toLowerCase().includes(this._searchQuery.trim().toLowerCase())
        )
      : options;

    if (state === "all") {
      filtered.forEach((o) => this._selected.delete(o.value));
    } else {
      filtered.forEach((o) => this._selected.add(o.value));
    }

    this.render();
    this.root.querySelector<HTMLElement>(".option--select-all")?.focus();
    this._dispatchChange();
  }

  private toggleDropdown(): void {
    this._open ? this.closeDropdown() : this.openDropdown();
  }

  private openDropdown(): void {
    this._open = true;
    this.render();
    this._attachOutsideListener();
    setTimeout(() => {
      this.root.querySelector<HTMLElement>(".search-input, .option--select-all, .option[data-value]")?.focus();
    }, 0);
  }

  private closeDropdown(): void {
    this._open = false;
    this._searchQuery = "";
    this._removeOutsideListener();
    this.render();
  }

  private _attachOutsideListener(): void {
    this._removeOutsideListener();
    this._outsideClickHandler = (e: MouseEvent) => {
      if (!e.composedPath().includes(this)) {
        this.closeDropdown();
      }
    };
    document.addEventListener("click", this._outsideClickHandler);
  }

  private _removeOutsideListener(): void {
    if (this._outsideClickHandler) {
      document.removeEventListener("click", this._outsideClickHandler);
      this._outsideClickHandler = null;
    }
  }

  private deselectOption(val: string): void {
    this._selected.delete(val);
    this.render();
    this._dispatchChange();
  }

  private toggleOption(item: HTMLElement): void {
    const val = item.dataset.value;
    if (!val) return;

    if (this._selected.has(val)) {
      this._selected.delete(val);
    } else {
      this._selected.add(val);
    }

    this.render();
    this.root.querySelector<HTMLElement>(`[data-value="${CSS.escape(val)}"]`)?.focus();
    this._dispatchChange();
  }

  private _dispatchChange(): void {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: Array.from(this._selected) },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("ui-multi-select", UIMultiSelect);
