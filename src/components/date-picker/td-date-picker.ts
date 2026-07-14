import { UIComponent } from "../../core/component";
import styles from "./td-date-picker.css?raw";

const CAL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const CHEV_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;
const CHEV_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

const VALID_SIZES = ["small", "medium", "large", "extra-large"] as const;

export class UIDatePicker extends UIComponent {
    private readonly _uid = `dp-${Math.random().toString(36).substr(2, 9)}`;
    private _isOpen = false;
    private _viewYear = new Date().getFullYear();
    private _viewMonth = new Date().getMonth();
    private _outsideClick?: (e: MouseEvent) => void;

    static get observedAttributes(): string[] {
        return ["label", "value", "disabled", "required", "error", "size", "name", "placeholder", "min", "max", "display-format"];
    }

    attributeChangedCallback(name: string): void {
        if (!this.isConnected) return;
        if (name === "value") {
            const d = this._parseDate(this.getAttribute("value") ?? "");
            if (d) {
                this._viewYear = d.getFullYear();
                this._viewMonth = d.getMonth();
            }
        }
        this.render();
    }

    disconnectedCallback(): void {
        this._detachOutsideClick();
    }

    private _parseDate(str: string): Date | null {
        if (!str) return null;
        const d = new Date(`${str}T00:00:00`);
        return isNaN(d.getTime()) ? null : d;
    }

    private _toISODate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    private _formatDisplay(date: Date): string {
        const fmt = this.getAttribute("display-format") ?? "MMMM D, YYYY";
        return UIDatePicker._applyFormat(date, fmt);
    }

    /**
     * Token reference:
     * YYYY  – 4-digit year          (2026)
     * YY    – 2-digit year          (26)
     * MMMM  – full month name       (January)
     * MMM   – short month name      (Jan)
     * MM    – 2-digit month         (01)
     * M     – 1–2 digit month       (1)
     * dddd  – full weekday name     (Monday)
     * ddd   – short weekday name    (Mon)
     * DD    – 2-digit day           (06)
     * Do    – day with ordinal      (6th)
     * D     – 1–2 digit day         (6)
     */
    private static _applyFormat(date: Date, fmt: string): string {
        const MONTHS_LONG  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const DAYS_LONG    = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const DAYS_SHORT   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

        const y   = date.getFullYear();
        const mon = date.getMonth();
        const d   = date.getDate();
        const dow = date.getDay();

        const ordinal = (n: number): string => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
        };

        // Alternation order ensures longer tokens win (YYYY before YY, MMMM before MMM, etc.)
        return fmt.replace(/YYYY|YY|MMMM|MMM|MM|M|dddd|ddd|DD|Do|D/g, (token) => {
            switch (token) {
                case "YYYY": return String(y);
                case "YY":   return String(y).slice(-2);
                case "MMMM": return MONTHS_LONG[mon];
                case "MMM":  return MONTHS_SHORT[mon];
                case "MM":   return String(mon + 1).padStart(2, "0");
                case "M":    return String(mon + 1);
                case "dddd": return DAYS_LONG[dow];
                case "ddd":  return DAYS_SHORT[dow];
                case "DD":   return String(d).padStart(2, "0");
                case "Do":   return ordinal(d);
                case "D":    return String(d);
                default:     return token;
            }
        });
    }

    private _buildCalendarHTML(): string {
        const year = this._viewYear;
        const month = this._viewMonth;
        const firstDow = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayStr = this._toISODate(new Date());
        const selectedStr = this.getAttribute("value") ?? "";
        const minDate = this._parseDate(this.getAttribute("min") ?? "");
        const maxDate = this._parseDate(this.getAttribute("max") ?? "");
        const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

        const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        let cells = weekdays.map(d => `<div class="cal-wday" aria-hidden="true">${d}</div>`).join("");

        for (let i = 0; i < firstDow; i++) {
            cells += `<div class="cal-day cal-day--empty" aria-hidden="true"></div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const iso = this._toISODate(dateObj);
            const isToday = iso === todayStr;
            const isSel = iso === selectedStr;
            const isDisabled = (minDate !== null && dateObj < minDate) || (maxDate !== null && dateObj > maxDate);

            const cls = [
                "cal-day",
                isToday && !isSel ? "cal-day--today" : "",
                isSel ? "cal-day--selected" : "",
                isDisabled ? "cal-day--disabled" : "",
            ].filter(Boolean).join(" ");

            const attrs = isDisabled
                ? `aria-disabled="true" tabindex="-1"`
                : `tabindex="0"`;

            cells += `<div class="${cls}" role="button" data-date="${iso}" ${attrs} aria-label="${iso}" aria-pressed="${isSel}">${d}</div>`;
        }

        return `
      <div class="cal-header">
        <button class="cal-nav" type="button" data-action="prev" aria-label="Previous month">${CHEV_LEFT}</button>
        <span class="cal-month-label">${monthLabel}</span>
        <button class="cal-nav" type="button" data-action="next" aria-label="Next month">${CHEV_RIGHT}</button>
      </div>
      <div class="cal-grid">${cells}</div>
    `;
    }

    protected render(): void {
        const label = this.getAttribute("label");
        const value = this.getAttribute("value") ?? "";
        const placeholder = this.getAttribute("placeholder") ?? "Select a date";
        const name = this.getAttribute("name") ?? "";
        const rawSize = this.getAttribute("size") ?? "medium";
        const size = (VALID_SIZES as readonly string[]).includes(rawSize) ? rawSize : "medium";
        const disabled = this.hasAttribute("disabled");
        const required = this.hasAttribute("required");
        const error = this.hasAttribute("error");

        const selectedDate = this._parseDate(value);
        const displayValue = selectedDate ? this._formatDisplay(selectedDate) : "";
        const errorId = `${this._uid}-error`;
        const fieldClass = ["field", `field--${size}`, error ? "field--error" : ""].filter(Boolean).join(" ");

        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="${fieldClass}">
        ${label ? `<label for="${this._uid}">${label}${required ? '<span aria-label="required"> *</span>' : ""}</label>` : ""}
        <div class="picker-wrap">
          <input
            id="${this._uid}"
            type="text"
            part="input"
            value="${displayValue}"
            placeholder="${placeholder}"
            readonly
            ${disabled ? "disabled" : ""}
            ${required ? "required aria-required='true'" : ""}
            ${error ? `aria-invalid="true" aria-describedby="${errorId}"` : 'aria-invalid="false"'}
            aria-haspopup="dialog"
            aria-expanded="${this._isOpen}"
          />
          <button class="picker-icon" type="button" tabindex="-1" aria-hidden="true" ${disabled ? "disabled" : ""}>${CAL_ICON}</button>
          <input type="hidden" name="${name}" value="${value}" />
          ${this._isOpen ? `<div class="cal-popup" role="dialog" aria-label="Date picker" aria-modal="true">${this._buildCalendarHTML()}</div>` : ""}
        </div>
        ${error ? `<div class="error-message" id="${errorId}" role="alert">This field has an error</div>` : ""}
      </div>
    `;

        this._attachListeners();
    }

    private _attachListeners(): void {
        this._detachOutsideClick();

        const input = this.root.querySelector<HTMLInputElement>("input[type='text']");
        const iconBtn = this.root.querySelector<HTMLButtonElement>(".picker-icon");

        input?.addEventListener("click", () => this._toggleOpen());
        iconBtn?.addEventListener("click", () => this._toggleOpen());

        input?.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this._toggleOpen(); }
            else if (e.key === "Escape" && this._isOpen) { this._isOpen = false; this.render(); }
            else if (e.key === "ArrowDown" && !this._isOpen) { e.preventDefault(); this._isOpen = true; this.render(); }
        });

        const popup = this.root.querySelector<HTMLElement>(".cal-popup");
        if (popup) {
            popup.addEventListener("click", (e) => this._onPopupClick(e));
            popup.addEventListener("keydown", (e: KeyboardEvent) => this._onPopupKeydown(e));
        }

        this._outsideClick = (e: MouseEvent) => {
            if (this._isOpen && !this.contains(e.target as Node)) {
                this._isOpen = false;
                this.render();
            }
        };
        document.addEventListener("click", this._outsideClick);
    }

    private _onPopupClick(e: Event): void {
        const target = e.target as HTMLElement;
        const dayEl = target.closest<HTMLElement>("[data-date]");
        if (dayEl) {
            if (!dayEl.classList.contains("cal-day--disabled")) {
                this._selectDate(dayEl.dataset.date!);
            }
            return;
        }
        const navEl = target.closest<HTMLElement>("[data-action]");
        if (navEl?.dataset.action === "prev") this._stepMonth(-1);
        else if (navEl?.dataset.action === "next") this._stepMonth(1);
    }

    private _onPopupKeydown(e: KeyboardEvent): void {
        if (e.key === "Escape") {
            this._isOpen = false;
            this.render();
            this.root.querySelector<HTMLInputElement>("input[type='text']")?.focus();
        } else if (e.key === "Enter" || e.key === " ") {
            const day = (e.target as HTMLElement).closest<HTMLElement>("[data-date]");
            if (day && !day.classList.contains("cal-day--disabled")) {
                e.preventDefault();
                this._selectDate(day.dataset.date!);
            }
        } else if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            this._moveFocus(e.key);
        }
    }

    private _moveFocus(key: string): void {
        const days = Array.from(this.root.querySelectorAll<HTMLElement>(".cal-day[data-date]"));
        const focused = this.root.querySelector<HTMLElement>(".cal-day:focus");
        const idx = focused ? days.indexOf(focused) : -1;
        let next = idx;
        if (key === "ArrowRight") next = idx + 1;
        else if (key === "ArrowLeft") next = idx - 1;
        else if (key === "ArrowDown") next = idx + 7;
        else if (key === "ArrowUp") next = idx - 7;
        if (next >= 0 && next < days.length) {
            days[next]?.focus();
        }
    }

    private _toggleOpen(): void {
        if (this.hasAttribute("disabled")) return;
        this._isOpen = !this._isOpen;
        this.render();
        if (this._isOpen) {
            // Focus first selected or today day after render
            requestAnimationFrame(() => {
                const sel = this.root.querySelector<HTMLElement>(".cal-day--selected, .cal-day--today");
                (sel ?? this.root.querySelector<HTMLElement>(".cal-day[tabindex='0']"))?.focus();
            });
        }
    }

    private _stepMonth(delta: number): void {
        let m = this._viewMonth + delta;
        let y = this._viewYear;
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        this._viewMonth = m;
        this._viewYear = y;
        const popup = this.root.querySelector<HTMLElement>(".cal-popup");
        if (popup) popup.innerHTML = this._buildCalendarHTML();
    }

    private _selectDate(iso: string): void {
        this._isOpen = false;
        // Setting the attribute triggers attributeChangedCallback → render()
        this.setAttribute("value", iso);
        this.dispatchEvent(new CustomEvent("change", {
            detail: { value: iso },
            bubbles: true,
            composed: true,
        }));
        this.root.querySelector<HTMLInputElement>("input[type='text']")?.focus();
    }

    private _detachOutsideClick(): void {
        if (this._outsideClick) {
            document.removeEventListener("click", this._outsideClick);
            this._outsideClick = undefined;
        }
    }

    /** Programmatic API */
    getValue(): string {
        return this.getAttribute("value") ?? "";
    }

    setValue(iso: string): void {
        this.setAttribute("value", iso);
    }

    clear(): void {
        this.removeAttribute("value");
    }
}

customElements.define("td-date-picker", UIDatePicker);
