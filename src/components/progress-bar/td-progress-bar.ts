import { UIComponent } from "../../core/component";
import styles from "./td-progress-bar.css?raw";

export class UIProgressBar extends UIComponent {
    static get observedAttributes(): string[] {
        return ["value", "max", "label", "show-value", "height", "color", "variant", "striped", "animated", "indeterminate"];
    }

    attributeChangedCallback(): void {
        this.render();
    }

    get value(): number {
        return Number(this.getAttribute("value") ?? "0");
    }

    set value(val: number) {
        this.setAttribute("value", String(val));
    }

    get max(): number {
        return Number(this.getAttribute("max") ?? "100");
    }

    set max(val: number) {
        this.setAttribute("max", String(val));
    }

    get percentage(): number {
        const max = this.max > 0 ? this.max : 100;
        return Math.min(100, Math.max(0, (this.value / max) * 100));
    }

    protected render(): void {
        const label = this.getAttribute("label");
        const showValue = this.hasAttribute("show-value");
        const indeterminate = this.hasAttribute("indeterminate");
        const height = this.getAttribute("height");
        const color = this.getAttribute("color");
        const pct = this.percentage;

        const hostStyle = [
            height ? `--progress-height: ${height};` : "",
            color ? `--progress-color: ${color};` : "",
        ].filter(Boolean).join(" ");

        this.root.innerHTML = `
            ${this.css(styles)}
            ${hostStyle ? `<style>:host { ${hostStyle} }</style>` : ""}
            <div class="progress-wrapper" part="wrapper">
                ${label || showValue ? `
                <div class="label-row" part="label-row">
                    ${label ? `<span class="label" part="label">${label}</span>` : ""}
                    ${showValue && !indeterminate ? `<span class="value-label" part="value-label">${pct.toFixed(0)}%</span>` : ""}
                </div>` : ""}
                <div
                    class="track"
                    part="track"
                    role="progressbar"
                    aria-valuenow="${indeterminate ? "" : this.value}"
                    aria-valuemin="0"
                    aria-valuemax="${this.max}"
                    ${label ? `aria-label="${label}"` : ""}
                    ${indeterminate ? 'aria-valuetext="Loading"' : ""}
                >
                    <div
                        class="bar"
                        part="bar"
                        style="width: ${indeterminate ? "40%" : `${pct}%`}"
                    ></div>
                </div>
            </div>
        `;
    }
}

customElements.define("td-progress-bar", UIProgressBar);
