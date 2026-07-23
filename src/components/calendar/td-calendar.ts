import { UIComponent } from "../../core/component";
import styles from "./td-calendar.css?raw";

const CHEV_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;
const CHEV_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

export class UICalendar extends UIComponent {
    private _viewYear = new Date().getFullYear();
    private _viewMonth = new Date().getMonth();
    private _hoverDate: string | null = null;

    static get observedAttributes(): string[] {
        return ["mode", "value", "range-start", "range-end", "min", "max"];
    }

    connectedCallback(): void {
        const initial = this.getAttribute("value") ?? this.getAttribute("range-start") ?? "";
        const d = this._parseDate(initial);
        if (d) {
            this._viewYear = d.getFullYear();
            this._viewMonth = d.getMonth();
        }
        this.render();
    }

    attributeChangedCallback(): void {
        if (!this.isConnected) return;
        this._hoverDate = null;
        this.render();
    }

    private _parseDate(str: string | null): Date | null {
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

    private get _mode(): "single" | "range" {
        return this.getAttribute("mode") === "range" ? "range" : "single";
    }

    private _buildCalendarHTML(): string {
        const year = this._viewYear;
        const month = this._viewMonth;
        const firstDow = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayStr = this._toISODate(new Date());
        const minDate = this._parseDate(this.getAttribute("min"));
        const maxDate = this._parseDate(this.getAttribute("max"));
        const mode = this._mode;
        const selectedStr = mode === "single" ? (this.getAttribute("value") ?? "") : "";
        const rangeStart = mode === "range" ? (this.getAttribute("range-start") ?? "") : "";
        const rangeEnd = mode === "range" ? (this.getAttribute("range-end") ?? "") : "";
        const hoverStr = this._hoverDate ?? "";

        const monthLabel = new Date(year, month, 1)
            .toLocaleDateString(undefined, { month: "long", year: "numeric" });

        const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        let cells = weekdays
            .map(d => `<div class="cal-wday" aria-hidden="true">${d}</div>`)
            .join("");

        for (let i = 0; i < firstDow; i++) {
            cells += `<div class="cal-day cal-day--empty" aria-hidden="true"></div>`;
        }

        const startDateObj = mode === "range" ? this._parseDate(rangeStart) : null;
        const effectiveEndStr = rangeEnd || hoverStr;
        const endDateObj = mode === "range" ? this._parseDate(effectiveEndStr) : null;

        let lowStr = "";
        let highStr = "";
        if (startDateObj && endDateObj) {
            const [low, high] = startDateObj <= endDateObj
                ? [startDateObj, endDateObj]
                : [endDateObj, startDateObj];
            lowStr = this._toISODate(low);
            highStr = this._toISODate(high);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const iso = this._toISODate(dateObj);
            const isToday = iso === todayStr;
            const isSel = mode === "single" && iso === selectedStr;
            const isDisabled =
                (minDate !== null && dateObj < minDate) ||
                (maxDate !== null && dateObj > maxDate);

            let isRangeStart = false;
            let isRangeEnd = false;
            let isInRange = false;

            if (mode === "range" && lowStr && highStr) {
                isRangeStart = iso === lowStr;
                isRangeEnd = iso === highStr;
                isInRange = iso > lowStr && iso < highStr;
            } else if (mode === "range" && startDateObj && !endDateObj) {
                isRangeStart = iso === rangeStart;
            }

            const showToday = isToday && !isSel && !isRangeStart && !isRangeEnd;

            const cls = [
                "cal-day",
                showToday ? "cal-day--today" : "",
                isSel ? "cal-day--selected" : "",
                isRangeStart ? "cal-day--range-start" : "",
                isRangeEnd ? "cal-day--range-end" : "",
                isInRange ? "cal-day--in-range" : "",
                isDisabled ? "cal-day--disabled" : "",
            ].filter(Boolean).join(" ");

            const attrs = isDisabled
                ? `aria-disabled="true" tabindex="-1"`
                : `tabindex="0"`;

            const pressed = isSel || isRangeStart || isRangeEnd;

            cells += `<div class="${cls}" role="button" data-date="${iso}" ${attrs} aria-label="${iso}" aria-pressed="${pressed}">${d}</div>`;
        }

        return `
      <div class="cal-header">
        <button class="cal-nav" type="button" data-action="prev" aria-label="Previous month">${CHEV_LEFT}</button>
        <span class="cal-month-label">${monthLabel}</span>
        <button class="cal-nav" type="button" data-action="next" aria-label="Next month">${CHEV_RIGHT}</button>
      </div>
      <div class="cal-grid" role="grid" aria-label="${monthLabel}">${cells}</div>
    `;
    }

    protected render(): void {
        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="calendar">${this._buildCalendarHTML()}</div>
    `;
        this._attachListeners();
    }

    private _attachListeners(): void {
        const header = this.root.querySelector<HTMLElement>(".cal-header");
        header?.addEventListener("click", (e) => {
            const nav = (e.target as HTMLElement).closest<HTMLElement>("[data-action]");
            if (nav?.dataset.action === "prev") this._stepMonth(-1);
            else if (nav?.dataset.action === "next") this._stepMonth(1);
        });

        const grid = this.root.querySelector<HTMLElement>(".cal-grid");
        if (!grid) return;

        grid.addEventListener("click", (e) => this._onGridClick(e));
        grid.addEventListener("keydown", (e: KeyboardEvent) => this._onGridKeydown(e));

        if (this._mode === "range") {
            grid.addEventListener("mouseover", (e) => {
                const rangeStart = this.getAttribute("range-start");
                const rangeEnd = this.getAttribute("range-end");
                if (!rangeStart || rangeEnd) return;
                const day = (e.target as HTMLElement).closest<HTMLElement>("[data-date]");
                if (day && !day.classList.contains("cal-day--disabled")) {
                    const iso = day.dataset.date ?? null;
                    if (iso !== this._hoverDate) {
                        this._hoverDate = iso;
                        this._updateRangeDisplay();
                    }
                }
            });
            grid.addEventListener("mouseleave", () => {
                if (this._hoverDate !== null) {
                    this._hoverDate = null;
                    this._updateRangeDisplay();
                }
            });
        }
    }

    /** Fast DOM update for hover preview — avoids a full re-render on every mouseover. */
    private _updateRangeDisplay(): void {
        const rangeStart = this.getAttribute("range-start") ?? "";
        const rangeEnd = this.getAttribute("range-end") ?? "";
        const hoverStr = this._hoverDate ?? "";
        const startDateObj = this._parseDate(rangeStart);
        const effectiveEnd = rangeEnd || hoverStr;
        const endDateObj = this._parseDate(effectiveEnd);
        const todayStr = this._toISODate(new Date());

        let lowStr = "";
        let highStr = "";
        if (startDateObj && endDateObj) {
            const [low, high] = startDateObj <= endDateObj
                ? [startDateObj, endDateObj]
                : [endDateObj, startDateObj];
            lowStr = this._toISODate(low);
            highStr = this._toISODate(high);
        }

        this.root.querySelectorAll<HTMLElement>(".cal-day[data-date]").forEach(day => {
            const iso = day.dataset.date!;
            const isToday = iso === todayStr;

            day.classList.remove(
                "cal-day--range-start",
                "cal-day--range-end",
                "cal-day--in-range",
                "cal-day--today",
            );

            if (lowStr && highStr) {
                if (iso === lowStr) day.classList.add("cal-day--range-start");
                else if (iso === highStr) day.classList.add("cal-day--range-end");
                else if (iso > lowStr && iso < highStr) day.classList.add("cal-day--in-range");
            } else if (startDateObj && !endDateObj && iso === rangeStart) {
                day.classList.add("cal-day--range-start");
            }

            const hasRangeClass = day.classList.contains("cal-day--range-start") ||
                day.classList.contains("cal-day--range-end");
            if (isToday && !hasRangeClass) {
                day.classList.add("cal-day--today");
            }
        });
    }

    private _onGridClick(e: Event): void {
        const day = (e.target as HTMLElement).closest<HTMLElement>("[data-date]");
        if (!day || day.classList.contains("cal-day--disabled")) return;
        const iso = day.dataset.date!;
        if (this._mode === "single") {
            this._selectSingle(iso);
        } else {
            this._selectRange(iso);
        }
    }

    private _onGridKeydown(e: KeyboardEvent): void {
        if (e.key === "Enter" || e.key === " ") {
            const day = (e.target as HTMLElement).closest<HTMLElement>("[data-date]");
            if (day && !day.classList.contains("cal-day--disabled")) {
                e.preventDefault();
                const iso = day.dataset.date!;
                if (this._mode === "single") this._selectSingle(iso);
                else this._selectRange(iso);
            }
        } else if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
            e.preventDefault();
            this._moveFocus(e.key);
        }
    }

    private _moveFocus(key: string): void {
        const days = Array.from(
            this.root.querySelectorAll<HTMLElement>(".cal-day[data-date]:not([aria-disabled='true'])")
        );
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

    private _stepMonth(delta: number): void {
        let m = this._viewMonth + delta;
        let y = this._viewYear;
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        this._viewMonth = m;
        this._viewYear = y;
        this._hoverDate = null;
        this.render();
    }

    private _selectSingle(iso: string): void {
        this.setAttribute("value", iso);
        this.dispatchEvent(new CustomEvent("change", {
            detail: { value: iso },
            bubbles: true,
            composed: true,
        }));
    }

    private _selectRange(iso: string): void {
        const rangeStart = this.getAttribute("range-start");
        const rangeEnd = this.getAttribute("range-end");

        if (!rangeStart || (rangeStart && rangeEnd)) {
            // Start a new range
            this.setAttribute("range-start", iso);
            this.removeAttribute("range-end");
            this.dispatchEvent(new CustomEvent("range-change", {
                detail: { start: iso, end: null },
                bubbles: true,
                composed: true,
            }));
        } else {
            // Complete the range, normalise order
            const startDate = this._parseDate(rangeStart)!;
            const endDate = this._parseDate(iso)!;
            const [finalStart, finalEnd] = startDate <= endDate
                ? [rangeStart, iso]
                : [iso, rangeStart];

            this.setAttribute("range-start", finalStart);
            this.setAttribute("range-end", finalEnd);
            this.dispatchEvent(new CustomEvent("change", {
                detail: { start: finalStart, end: finalEnd },
                bubbles: true,
                composed: true,
            }));
        }
    }

    // ── Programmatic API ──────────────────────────────────────────────

    getValue(): string {
        return this.getAttribute("value") ?? "";
    }

    setValue(iso: string): void {
        this.setAttribute("value", iso);
    }

    getRangeStart(): string {
        return this.getAttribute("range-start") ?? "";
    }

    getRangeEnd(): string {
        return this.getAttribute("range-end") ?? "";
    }

    setRange(start: string, end: string): void {
        const startDate = this._parseDate(start);
        const endDate = this._parseDate(end);
        if (!startDate || !endDate) return;
        const [s, e] = startDate <= endDate ? [start, end] : [end, start];
        this.setAttribute("range-start", s);
        this.setAttribute("range-end", e);
    }

    clear(): void {
        this.removeAttribute("value");
        this.removeAttribute("range-start");
        this.removeAttribute("range-end");
    }
}

customElements.define("td-calendar", UICalendar);
