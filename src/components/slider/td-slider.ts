import { UIComponent } from "../../core/component";
import styles from "./td-slider.css?raw";

interface SliderBounds {
    min: number;
    max: number;
    step: number;
}

type SliderSource = "pointer" | "keyboard";

export class UISlider extends UIComponent {
    private _values: number[] = [];
    private _valuesInitialized = false;
    private _activeIndex: number | null = null;
    private _dragging = false;
    private _moveHandler: ((e: PointerEvent) => void) | null = null;
    private _upHandler: ((e: PointerEvent) => void) | null = null;

    static get observedAttributes(): string[] {
        return ["label", "min", "max", "step", "value", "values", "disabled"];
    }

    attributeChangedCallback(): void {
        this._valuesInitialized = false;
        this.render();
    }

    disconnectedCallback(): void {
        this._teardownDragHandlers();
    }

    get value(): number {
        this._ensureValues();
        return this._values[0] ?? this._getBounds().min;
    }

    set value(val: number) {
        this.setAttribute("value", String(val));
        this.removeAttribute("values");
    }

    get values(): number[] {
        this._ensureValues();
        return [...this._values];
    }

    set values(vals: number[]) {
        this.setAttribute("values", JSON.stringify(vals));
        this.removeAttribute("value");
    }

    private _getBounds(): SliderBounds {
        const min = Number(this.getAttribute("min") ?? "0");
        const maxRaw = Number(this.getAttribute("max") ?? "100");
        const max = maxRaw > min ? maxRaw : min + 1;
        const stepRaw = Number(this.getAttribute("step") ?? "1");
        const step = stepRaw > 0 ? stepRaw : 1;
        return { min, max, step };
    }

    private _ensureValues(): void {
        if (this._valuesInitialized) {
            const bounds = this._getBounds();
            this._values = this._values.map((v) => this._snapClamp(v, bounds));
            return;
        }

        const bounds = this._getBounds();
        const valuesAttr = this.getAttribute("values");
        const singleAttr = this.getAttribute("value");
        let parsed: number[] = [];

        if (valuesAttr) {
            try {
                const arr = JSON.parse(valuesAttr);
                if (Array.isArray(arr)) {
                    parsed = arr.map((v) => Number(v)).filter((v) => Number.isFinite(v));
                }
            }
            catch {
                parsed = valuesAttr
                    .split(",")
                    .map((v) => Number(v.trim()))
                    .filter((v) => Number.isFinite(v));
            }
        }

        if (parsed.length === 0 && singleAttr !== null) {
            const single = Number(singleAttr);
            if (Number.isFinite(single)) {
                parsed = [single];
            }
        }

        if (parsed.length === 0) {
            parsed = [bounds.min];
        }

        this._values = parsed.map((v) => this._snapClamp(v, bounds));
        this._valuesInitialized = true;
    }

    private _decimals(step: number): number {
        const s = String(step);
        if (!s.includes("."))
            return 0;
        return s.split(".")[1].length;
    }

    private _snapClamp(value: number, bounds: SliderBounds): number {
        const clamped = Math.min(bounds.max, Math.max(bounds.min, value));
        const snapped = Math.round((clamped - bounds.min) / bounds.step) * bounds.step + bounds.min;
        const decimals = this._decimals(bounds.step);
        return Number(snapped.toFixed(decimals));
    }

    private _valueToPercent(value: number, bounds: SliderBounds): number {
        return ((value - bounds.min) / (bounds.max - bounds.min)) * 100;
    }

    private _clientXToValue(clientX: number): number {
        const bounds = this._getBounds();
        const track = this.root.querySelector<HTMLElement>(".track-wrap");
        if (!track)
            return bounds.min;

        const rect = track.getBoundingClientRect();
        if (rect.width <= 0)
            return this._values[0] ?? bounds.min;

        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        const raw = bounds.min + ratio * (bounds.max - bounds.min);
        return this._snapClamp(raw, bounds);
    }

    private _findNearestThumb(value: number): number {
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        this._values.forEach((v, i) => {
            const dist = Math.abs(v - value);
            if (dist < nearestDistance) {
                nearestDistance = dist;
                nearestIndex = i;
            }
        });
        return nearestIndex;
    }

    private _dispatchSliderEvent(eventName: string, index: number, source: SliderSource): void {
        const bounds = this._getBounds();
        const detail = {
            index,
            value: this._values[index],
            values: [...this._values],
            min: bounds.min,
            max: bounds.max,
            step: bounds.step,
            source,
        };

        this.dispatchEvent(new CustomEvent(eventName, {
            detail,
            bubbles: true,
            composed: true,
        }));
    }

    private _setValueAt(index: number, nextValue: number, source: SliderSource): boolean {
        const bounds = this._getBounds();
        const snapped = this._snapClamp(nextValue, bounds);
        if (this._values[index] === snapped)
            return false;
        this._values[index] = snapped;
        this.render();
        this._dispatchSliderEvent("slider-input", index, source);
        return true;
    }

    private _startDrag(index: number, pointerEvent: PointerEvent): void {
        if (this.hasAttribute("disabled"))
            return;

        this._activeIndex = index;
        this._dragging = true;
        this._dispatchSliderEvent("slider-start", index, "pointer");

        this._moveHandler = (e: PointerEvent) => {
            if (this._activeIndex === null)
                return;
            const value = this._clientXToValue(e.clientX);
            this._setValueAt(this._activeIndex, value, "pointer");
        };

        this._upHandler = () => {
            if (this._activeIndex !== null) {
                const indexAtStop = this._activeIndex;
                this._dispatchSliderEvent("slider-stop", indexAtStop, "pointer");
                this._dispatchSliderEvent("change", indexAtStop, "pointer");
            }
            this._activeIndex = null;
            this._dragging = false;
            this._teardownDragHandlers();
            this.render();
        };

        window.addEventListener("pointermove", this._moveHandler);
        window.addEventListener("pointerup", this._upHandler, { once: true });

        pointerEvent.preventDefault();
    }

    private _teardownDragHandlers(): void {
        if (this._moveHandler) {
            window.removeEventListener("pointermove", this._moveHandler);
            this._moveHandler = null;
        }
        if (this._upHandler) {
            window.removeEventListener("pointerup", this._upHandler);
            this._upHandler = null;
        }
    }

    private _onTrackPointerDown(e: PointerEvent): void {
        if (this.hasAttribute("disabled"))
            return;

        const value = this._clientXToValue(e.clientX);
        const nearestIndex = this._findNearestThumb(value);
        this._setValueAt(nearestIndex, value, "pointer");
        this._startDrag(nearestIndex, e);
    }

    private _onThumbKeyDown(e: KeyboardEvent, index: number): void {
        if (this.hasAttribute("disabled"))
            return;

        const bounds = this._getBounds();
        let next = this._values[index];

        switch (e.key) {
            case "ArrowLeft":
            case "ArrowDown":
                next -= bounds.step;
                break;
            case "ArrowRight":
            case "ArrowUp":
                next += bounds.step;
                break;
            case "PageDown":
                next -= bounds.step * 10;
                break;
            case "PageUp":
                next += bounds.step * 10;
                break;
            case "Home":
                next = bounds.min;
                break;
            case "End":
                next = bounds.max;
                break;
            default:
                return;
        }

        e.preventDefault();
        this._dispatchSliderEvent("slider-start", index, "keyboard");
        this._setValueAt(index, next, "keyboard");
        this._dispatchSliderEvent("slider-stop", index, "keyboard");
        this._dispatchSliderEvent("change", index, "keyboard");

        // Restore focus on the same thumb after rerender.
        this.root.querySelector<HTMLElement>(`.thumb[data-index=\"${index}\"]`)?.focus();
    }

    protected render(): void {
        this._ensureValues();

        const bounds = this._getBounds();
        const label = this.getAttribute("label") ?? "Slider";
        const disabled = this.hasAttribute("disabled");

        const percents = this._values.map((v) => this._valueToPercent(v, bounds));
        const rangeStart = Math.min(...percents);
        const rangeEnd = Math.max(...percents);

        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="slider" role="group" aria-label="${label}">
        <div class="label-row">
          <span class="label">${label}</span>
          <span class="range-meta">${bounds.min} to ${bounds.max}</span>
        </div>

        <div class="track-wrap" ${disabled ? "aria-disabled=\"true\"" : ""}>
          <div class="track-base"></div>
          <div class="track-range" style="left:${rangeStart}%; width:${Math.max(0, rangeEnd - rangeStart)}%;"></div>
          ${this._values
            .map((v, i) => {
                const percent = this._valueToPercent(v, bounds);
                return `<button
              class="thumb${this._dragging && this._activeIndex === i ? " thumb--active" : ""}"
              type="button"
              data-index="${i}"
              style="left:${percent}%;"
              role="slider"
              aria-label="${label} ${i + 1}"
              aria-valuemin="${bounds.min}"
              aria-valuemax="${bounds.max}"
              aria-valuenow="${v}"
              aria-valuetext="${v}"
              ${disabled ? "disabled" : ""}
            ></button>`;
            })
            .join("")}
        </div>

        <div class="values">
          ${this._values.map((v, i) => `<span class=\"value-chip\">#${i + 1}: ${v}</span>`).join("")}
        </div>
      </div>
    `;

        const track = this.root.querySelector<HTMLElement>(".track-wrap");
        track?.addEventListener("pointerdown", (e: PointerEvent) => {
            const onThumb = (e.target as HTMLElement).closest(".thumb");
            if (onThumb)
                return;
            this._onTrackPointerDown(e);
        });

        this.root.querySelectorAll<HTMLElement>(".thumb").forEach((thumb) => {
            const index = Number(thumb.dataset.index ?? "0");
            thumb.addEventListener("pointerdown", (e: PointerEvent) => this._startDrag(index, e));
            thumb.addEventListener("keydown", (e: KeyboardEvent) => this._onThumbKeyDown(e, index));
        });
    }
}

customElements.define("td-slider", UISlider);
