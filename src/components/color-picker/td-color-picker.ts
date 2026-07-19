import { UIComponent } from "../../core/component";
import styles from "./td-color-picker.css?raw";

// ─── Color utilities ───────────────────────────────────────────────────────────

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const i = Math.floor(h / 60) % 6;
    const f = (h / 60) - Math.floor(h / 60);
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    const sets: [number, number, number][] = [
        [v, t, p], [q, v, p], [p, v, t],
        [p, q, v], [t, p, v], [v, p, q],
    ];
    return sets[i].map(c => Math.round(c * 255)) as [number, number, number];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [h * 360, max === 0 ? 0 : d / max, max];
}

function hexToRgb(hex: string): [number, number, number] | null {
    const h = hex.replace(/^#/, "").trim();
    if (h.length === 3) {
        return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
    }
    if (h.length >= 6) {
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    return null;
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    if (d === 0) return [0, 0, Math.round(l * 100)];
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function clamp(v: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, v));
}

function isValidHex(s: string): boolean {
    return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s.trim());
}

// ─── Component ────────────────────────────────────────────────────────────────

export class UIColorPicker extends UIComponent {
    private _h = 211;
    private _s = 0.83;
    private _v = 0.98;
    private _a = 1;
    private _open = false;
    private _suppressParse = false;
    private _escapeWired = false;
    private _outsideClick?: (e: MouseEvent) => void;
    private _dragging: "gradient" | "hue" | "alpha" | null = null;

    static get observedAttributes(): string[] {
        return ["value", "label", "format", "alpha", "disabled", "size", "presets"];
    }

    attributeChangedCallback(name: string): void {
        if (!this.isConnected) return;
        if (name === "value") {
            // Internal commit: _updateVisuals() already synced the DOM — skip re-render
            if (this._suppressParse) return;
            this._parseValue(this.getAttribute("value") ?? "");
        }
        this.render();
    }

    connectedCallback(): void {
        this._parseValue(this.getAttribute("value") ?? "#3b82f6");
        super.connectedCallback();
        if (!this._escapeWired) {
            this._escapeWired = true;
            this.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Escape" && this._open) {
                    this._open = false;
                    this._detachOutside();
                    this.render();
                    this.root.querySelector<HTMLButtonElement>(".trigger")?.focus();
                }
            });
        }
    }

    disconnectedCallback(): void {
        this._detachOutside();
    }

    get value(): string {
        return this.getAttribute("value") ?? this._formatValue();
    }

    set value(val: string) {
        this.setAttribute("value", val);
    }

    // ─── Color helpers ────────────────────────────────────────────────────────

    private _parseValue(val: string): void {
        if (!val) return;
        const rgb = hexToRgb(val);
        if (rgb) {
            const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
            this._h = h;
            this._s = s;
            this._v = v;
            const clean = val.replace(/^#/, "");
            if (clean.length === 8) {
                this._a = parseInt(clean.slice(6, 8), 16) / 255;
            }
            return;
        }
        const m = val.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
        if (m) {
            const [h, s, v] = rgbToHsv(Number(m[1]), Number(m[2]), Number(m[3]));
            this._h = h;
            this._s = s;
            this._v = v;
            this._a = m[4] !== undefined ? clamp(Number(m[4]), 0, 1) : 1;
        }
    }

    private _formatValue(): string {
        const [r, g, b] = hsvToRgb(this._h, this._s, this._v);
        const hasAlpha = this.hasAttribute("alpha");
        const format = this.getAttribute("format") ?? "hex";
        if (format === "rgb") {
            return hasAlpha
                ? `rgba(${r}, ${g}, ${b}, ${+this._a.toFixed(2)})`
                : `rgb(${r}, ${g}, ${b})`;
        }
        if (format === "hsl") {
            const [h, s, l] = rgbToHsl(r, g, b);
            return hasAlpha
                ? `hsla(${h}, ${s}%, ${l}%, ${+this._a.toFixed(2)})`
                : `hsl(${h}, ${s}%, ${l}%)`;
        }
        const hex = rgbToHex(r, g, b);
        if (hasAlpha) {
            return hex + Math.round(this._a * 255).toString(16).padStart(2, "0");
        }
        return hex;
    }

    private _hexOnly(): string {
        return rgbToHex(...hsvToRgb(this._h, this._s, this._v));
    }

    private _commit(): void {
        const formatted = this._formatValue();
        const [r, g, b] = hsvToRgb(this._h, this._s, this._v);
        // Suppress re-parsing—internal state is authoritative
        this._suppressParse = true;
        this.setAttribute("value", formatted); // triggers attributeChangedCallback → render()
        this._suppressParse = false;
        this.dispatchEvent(new CustomEvent("change", {
            bubbles: true,
            composed: true,
            detail: {
                value: formatted,
                hex: rgbToHex(r, g, b),
                rgb: [r, g, b] as [number, number, number],
                alpha: this._a,
            },
        }));
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    protected render(): void {
        const label = this.getAttribute("label");
        const hasAlpha = this.hasAttribute("alpha");
        const disabled = this.hasAttribute("disabled");
        const size = this.getAttribute("size") ?? "medium";
        const presetsAttr = this.getAttribute("presets");

        const [r, g, b] = hsvToRgb(this._h, this._s, this._v);
        const hexVal = rgbToHex(r, g, b);
        const formattedVal = this._formatValue();
        const hueColor = `hsl(${this._h.toFixed(1)},100%,50%)`;
        const swatchBg = hasAlpha ? `rgba(${r},${g},${b},${this._a.toFixed(3)})` : hexVal;
        const uid = `cp-${Math.random().toString(36).slice(2, 8)}`;

        let presetsHtml = "";
        if (presetsAttr) {
            try {
                const list = JSON.parse(presetsAttr) as unknown[];
                if (Array.isArray(list)) {
                    const btns = list
                        .filter((c): c is string => typeof c === "string")
                        .map(c => `<button class="preset-btn" type="button" style="background:${c}" data-color="${c}" title="${c}" aria-label="${c}"></button>`)
                        .join("");
                    presetsHtml = `<div class="presets" role="group" aria-label="Preset colors">${btns}</div>`;
                }
            } catch { /* invalid JSON */ }
        }

        const panelHtml = this._open && !disabled ? `
        <div class="panel" role="dialog" aria-modal="false" aria-label="Color picker">
            <div class="gradient-area" part="gradient"
                role="slider" tabindex="0"
                aria-label="Color saturation and brightness"
                aria-valuenow="${Math.round(this._s * 100)}"
                aria-valuemin="0" aria-valuemax="100">
                <div class="gradient-sat" style="background:linear-gradient(to right,#fff,${hueColor})"></div>
                <div class="gradient-val"></div>
                <div class="gradient-pointer" style="left:${(this._s * 100).toFixed(1)}%;top:${((1 - this._v) * 100).toFixed(1)}%"></div>
            </div>
            <div class="hue-track" part="hue"
                role="slider" tabindex="0"
                aria-label="Hue" aria-valuemin="0" aria-valuemax="360"
                aria-valuenow="${Math.round(this._h)}">
                <div class="slider-thumb" style="left:${((this._h / 360) * 100).toFixed(1)}%;background:${hueColor}"></div>
            </div>
            ${hasAlpha ? `
            <div class="alpha-track" part="alpha"
                role="slider" tabindex="0"
                aria-label="Opacity" aria-valuemin="0" aria-valuemax="100"
                aria-valuenow="${Math.round(this._a * 100)}">
                <div class="alpha-gradient" style="background:linear-gradient(to right,transparent,${hexVal})"></div>
                <div class="slider-thumb" style="left:${(this._a * 100).toFixed(1)}%;background:${swatchBg}"></div>
            </div>` : ""}
            <div class="inputs-row">
                <div class="preview-wrap"><div class="preview-inner" style="background:${swatchBg}"></div></div>
                <div class="input-group hex-wrap">
                    <input class="cp-input cp-input--hex" type="text" value="${hexVal}" maxlength="7"
                        spellcheck="false" autocomplete="off" aria-label="Hex color value">
                    <span class="field-label">HEX</span>
                </div>
                <div class="input-group">
                    <input class="cp-input cp-input--r" type="number" min="0" max="255" value="${r}" aria-label="Red">
                    <span class="field-label">R</span>
                </div>
                <div class="input-group">
                    <input class="cp-input cp-input--g" type="number" min="0" max="255" value="${g}" aria-label="Green">
                    <span class="field-label">G</span>
                </div>
                <div class="input-group">
                    <input class="cp-input cp-input--b" type="number" min="0" max="255" value="${b}" aria-label="Blue">
                    <span class="field-label">B</span>
                </div>
                ${hasAlpha ? `
                <div class="input-group">
                    <input class="cp-input cp-input--a" type="number" min="0" max="100"
                        value="${Math.round(this._a * 100)}" aria-label="Opacity percent">
                    <span class="field-label">A%</span>
                </div>` : ""}
            </div>
            ${presetsHtml}
        </div>` : "";

        this.root.innerHTML = `
            ${this.css(styles)}
            <div class="field field--${size}">
                ${label ? `<label for="${uid}">${label}</label>` : ""}
                <button
                    id="${uid}"
                    class="trigger"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="${this._open}"
                    aria-label="${label ? `${label}: ` : ""}${formattedVal}"
                    ${disabled ? "disabled" : ""}
                    part="trigger"
                >
                    <span class="swatch" style="background:${swatchBg}" part="swatch"></span>
                    <span class="trigger-value">${formattedVal}</span>
                    <span class="trigger-arrow" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </span>
                </button>
                ${panelHtml}
            </div>
        `;

        this._wireEvents();
    }

    // ─── Event wiring ─────────────────────────────────────────────────────────

    private _wireEvents(): void {
        const trigger = this.root.querySelector<HTMLButtonElement>(".trigger");
        trigger?.addEventListener("click", () => {
            if (this.hasAttribute("disabled")) return;
            this._open = !this._open;
            this.render();
            if (this._open) this._attachOutside();
            else this._detachOutside();
        });

        if (!this._open) return;

        this._wireGradient();
        this._wireHue();
        if (this.hasAttribute("alpha")) this._wireAlpha();
        this._wireInputs();
        this._wirePresets();
    }

    private _wireGradient(): void {
        const area = this.root.querySelector<HTMLElement>(".gradient-area");
        if (!area) return;

        const apply = (e: PointerEvent) => {
            const rect = area.getBoundingClientRect();
            this._s = clamp((e.clientX - rect.left) / rect.width, 0, 1);
            this._v = 1 - clamp((e.clientY - rect.top) / rect.height, 0, 1);
            this._updateVisuals();
        };

        area.addEventListener("pointerdown", (e: PointerEvent) => {
            e.preventDefault();
            this._dragging = "gradient";
            area.setPointerCapture(e.pointerId);
            apply(e);
            const onMove = (ev: PointerEvent) => { if (this._dragging === "gradient") apply(ev); };
            const onUp = () => {
                if (this._dragging !== "gradient") return;
                this._dragging = null;
                this._commit();
                document.removeEventListener("pointermove", onMove);
                document.removeEventListener("pointerup", onUp);
            };
            document.addEventListener("pointermove", onMove);
            document.addEventListener("pointerup", onUp);
        });

        area.addEventListener("keydown", (e: KeyboardEvent) => {
            const step = e.shiftKey ? 0.1 : 0.01;
            let changed = false;
            if (e.key === "ArrowRight") { this._s = clamp(this._s + step, 0, 1); changed = true; }
            else if (e.key === "ArrowLeft") { this._s = clamp(this._s - step, 0, 1); changed = true; }
            else if (e.key === "ArrowUp") { this._v = clamp(this._v + step, 0, 1); changed = true; }
            else if (e.key === "ArrowDown") { this._v = clamp(this._v - step, 0, 1); changed = true; }
            if (changed) { e.preventDefault(); this._updateVisuals(); this._commit(); }
        });
    }

    private _wireHue(): void {
        const track = this.root.querySelector<HTMLElement>(".hue-track");
        if (!track) return;

        const apply = (e: PointerEvent) => {
            const rect = track.getBoundingClientRect();
            this._h = clamp((e.clientX - rect.left) / rect.width, 0, 1) * 360;
            this._updateVisuals();
        };

        track.addEventListener("pointerdown", (e: PointerEvent) => {
            e.preventDefault();
            this._dragging = "hue";
            track.setPointerCapture(e.pointerId);
            apply(e);
            const onMove = (ev: PointerEvent) => { if (this._dragging === "hue") apply(ev); };
            const onUp = () => {
                if (this._dragging !== "hue") return;
                this._dragging = null;
                this._commit();
                document.removeEventListener("pointermove", onMove);
                document.removeEventListener("pointerup", onUp);
            };
            document.addEventListener("pointermove", onMove);
            document.addEventListener("pointerup", onUp);
        });

        track.addEventListener("keydown", (e: KeyboardEvent) => {
            const step = e.shiftKey ? 10 : 1;
            let changed = false;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") { this._h = clamp(this._h + step, 0, 360); changed = true; }
            else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { this._h = clamp(this._h - step, 0, 360); changed = true; }
            if (changed) { e.preventDefault(); this._updateVisuals(); this._commit(); }
        });
    }

    private _wireAlpha(): void {
        const track = this.root.querySelector<HTMLElement>(".alpha-track");
        if (!track) return;

        const apply = (e: PointerEvent) => {
            const rect = track.getBoundingClientRect();
            this._a = clamp((e.clientX - rect.left) / rect.width, 0, 1);
            this._updateVisuals();
        };

        track.addEventListener("pointerdown", (e: PointerEvent) => {
            e.preventDefault();
            this._dragging = "alpha";
            track.setPointerCapture(e.pointerId);
            apply(e);
            const onMove = (ev: PointerEvent) => { if (this._dragging === "alpha") apply(ev); };
            const onUp = () => {
                if (this._dragging !== "alpha") return;
                this._dragging = null;
                this._commit();
                document.removeEventListener("pointermove", onMove);
                document.removeEventListener("pointerup", onUp);
            };
            document.addEventListener("pointermove", onMove);
            document.addEventListener("pointerup", onUp);
        });

        track.addEventListener("keydown", (e: KeyboardEvent) => {
            const step = e.shiftKey ? 0.1 : 0.01;
            let changed = false;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") { this._a = clamp(this._a + step, 0, 1); changed = true; }
            else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { this._a = clamp(this._a - step, 0, 1); changed = true; }
            if (changed) { e.preventDefault(); this._updateVisuals(); this._commit(); }
        });
    }

    private _wireInputs(): void {
        const hexEl = this.root.querySelector<HTMLInputElement>(".cp-input--hex");
        if (hexEl) {
            hexEl.addEventListener("keydown", (e) => { if (e.key === "Enter") hexEl.blur(); });
            hexEl.addEventListener("blur", () => {
                const raw = hexEl.value.trim();
                const hex = raw.startsWith("#") ? raw : `#${raw}`;
                if (isValidHex(hex)) {
                    const rgb = hexToRgb(hex)!;
                    const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
                    this._h = h; this._s = s; this._v = v;
                    this._updateVisuals();
                    this._commit();
                } else {
                    hexEl.value = this._hexOnly();
                }
            });
        }

        const rEl = this.root.querySelector<HTMLInputElement>(".cp-input--r");
        const gEl = this.root.querySelector<HTMLInputElement>(".cp-input--g");
        const bEl = this.root.querySelector<HTMLInputElement>(".cp-input--b");
        const syncRgb = () => {
            const r = clamp(parseInt(rEl?.value ?? "0", 10), 0, 255);
            const g = clamp(parseInt(gEl?.value ?? "0", 10), 0, 255);
            const b = clamp(parseInt(bEl?.value ?? "0", 10), 0, 255);
            if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
                const [h, s, v] = rgbToHsv(r, g, b);
                this._h = h; this._s = s; this._v = v;
                this._updateVisuals();
                this._commit();
            }
        };
        rEl?.addEventListener("change", syncRgb);
        gEl?.addEventListener("change", syncRgb);
        bEl?.addEventListener("change", syncRgb);

        const aEl = this.root.querySelector<HTMLInputElement>(".cp-input--a");
        aEl?.addEventListener("change", () => {
            const pct = clamp(parseInt(aEl.value ?? "100", 10), 0, 100);
            if (Number.isFinite(pct)) {
                this._a = pct / 100;
                this._updateVisuals();
                this._commit();
            }
        });
    }

    private _wirePresets(): void {
        this.root.querySelectorAll<HTMLButtonElement>(".preset-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const rgb = hexToRgb(btn.dataset.color ?? "");
                if (rgb) {
                    const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
                    this._h = h; this._s = s; this._v = v;
                    this._updateVisuals();
                    this._commit();
                }
            });
        });
    }

    // ─── Live visual updates (no full re-render) ──────────────────────────────

    private _updateVisuals(): void {
        const [r, g, b] = hsvToRgb(this._h, this._s, this._v);
        const hexVal = rgbToHex(r, g, b);
        const hueColor = `hsl(${this._h.toFixed(1)},100%,50%)`;
        const hasAlpha = this.hasAttribute("alpha");
        const swatchBg = hasAlpha ? `rgba(${r},${g},${b},${this._a.toFixed(3)})` : hexVal;
        const active = this.root.activeElement;

        const gradPtr = this.root.querySelector<HTMLElement>(".gradient-pointer");
        if (gradPtr) {
            gradPtr.style.left = `${(this._s * 100).toFixed(1)}%`;
            gradPtr.style.top = `${((1 - this._v) * 100).toFixed(1)}%`;
        }
        const gradSat = this.root.querySelector<HTMLElement>(".gradient-sat");
        if (gradSat) gradSat.style.background = `linear-gradient(to right,#fff,${hueColor})`;

        const hueThumb = this.root.querySelector<HTMLElement>(".hue-track .slider-thumb");
        if (hueThumb) { hueThumb.style.left = `${((this._h / 360) * 100).toFixed(1)}%`; hueThumb.style.background = hueColor; }
        const hueTrack = this.root.querySelector<HTMLElement>(".hue-track");
        if (hueTrack) hueTrack.setAttribute("aria-valuenow", String(Math.round(this._h)));

        if (hasAlpha) {
            const alphaGrad = this.root.querySelector<HTMLElement>(".alpha-gradient");
            if (alphaGrad) alphaGrad.style.background = `linear-gradient(to right,transparent,${hexVal})`;
            const alphaThumb = this.root.querySelector<HTMLElement>(".alpha-track .slider-thumb");
            if (alphaThumb) { alphaThumb.style.left = `${(this._a * 100).toFixed(1)}%`; alphaThumb.style.background = swatchBg; }
            const alphaTrack = this.root.querySelector<HTMLElement>(".alpha-track");
            if (alphaTrack) alphaTrack.setAttribute("aria-valuenow", String(Math.round(this._a * 100)));
        }

        const preview = this.root.querySelector<HTMLElement>(".preview-inner");
        if (preview) preview.style.background = swatchBg;
        const swatch = this.root.querySelector<HTMLElement>(".swatch");
        if (swatch) swatch.style.background = swatchBg;
        const tv = this.root.querySelector<HTMLElement>(".trigger-value");
        if (tv) tv.textContent = this._formatValue();
        const trigger = this.root.querySelector<HTMLButtonElement>(".trigger");
        if (trigger) {
            const lbl = this.getAttribute("label");
            trigger.setAttribute("aria-label", `${lbl ? `${lbl}: ` : ""}${this._formatValue()}`);
        }

        const hexEl = this.root.querySelector<HTMLInputElement>(".cp-input--hex");
        if (hexEl && active !== hexEl) hexEl.value = hexVal;
        const rEl = this.root.querySelector<HTMLInputElement>(".cp-input--r");
        if (rEl && active !== rEl) rEl.value = String(r);
        const gEl = this.root.querySelector<HTMLInputElement>(".cp-input--g");
        if (gEl && active !== gEl) gEl.value = String(g);
        const bEl = this.root.querySelector<HTMLInputElement>(".cp-input--b");
        if (bEl && active !== bEl) bEl.value = String(b);
        const aEl = this.root.querySelector<HTMLInputElement>(".cp-input--a");
        if (aEl && active !== aEl) aEl.value = String(Math.round(this._a * 100));
    }

    // ─── Outside click ────────────────────────────────────────────────────────

    private _attachOutside(): void {
        this._detachOutside();
        const handler = (e: MouseEvent) => {
            if (!e.composedPath().includes(this)) {
                this._open = false;
                this._detachOutside();
                this.render();
            }
        };
        this._outsideClick = handler;
        // Defer past the triggering click
        setTimeout(() => document.addEventListener("click", handler), 0);
    }

    private _detachOutside(): void {
        if (this._outsideClick) {
            document.removeEventListener("click", this._outsideClick);
            this._outsideClick = undefined;
        }
    }
}

customElements.define("td-color-picker", UIColorPicker);
