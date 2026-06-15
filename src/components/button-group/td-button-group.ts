import { UIComponent } from "../../core/component";
import styles from "./td-button-group.css?raw";

type AlignValue = "start" | "center" | "end" | "stretch";
type JustifyValue = "start" | "center" | "end" | "between" | "around" | "evenly";

export class UIButtonGroup extends UIComponent {
    static get observedAttributes(): string[] {
        return ["wrap", "gap", "align", "justify", "full-width", "pill"];
    }

    attributeChangedCallback(): void {
        this.render();
    }

    private _alignClass(value: string | null): string {
        const align = (value ?? "stretch") as AlignValue;
        if (align === "start")
            return "align-start";
        if (align === "center")
            return "align-center";
        if (align === "end")
            return "align-end";
        return "align-stretch";
    }

    private _justifyClass(value: string | null): string {
        const justify = (value ?? "start") as JustifyValue;
        if (justify === "center")
            return "justify-center";
        if (justify === "end")
            return "justify-end";
        if (justify === "between")
            return "justify-between";
        if (justify === "around")
            return "justify-around";
        if (justify === "evenly")
            return "justify-evenly";
        return "justify-start";
    }

    protected render(): void {
        const shouldWrap = this.hasAttribute("wrap");
        const fullWidth = this.hasAttribute("full-width");
        const pill = this.hasAttribute("pill");
        const gap = this.getAttribute("gap")?.trim() || "0.5rem";
        const alignClass = this._alignClass(this.getAttribute("align"));
        const justifyClass = this._justifyClass(this.getAttribute("justify"));

        this.root.innerHTML = `
      ${this.css(styles)}
      <div
        part="group"
                                class="button-group horizontal ${shouldWrap ? "wrap" : "no-wrap"} ${fullWidth ? "full-width" : ""} ${pill ? "pill" : ""} ${alignClass} ${justifyClass}"
        style="--td-button-group-gap:${gap};"
      >
        <slot></slot>
      </div>
    `;
    }
}

customElements.define("td-button-group", UIButtonGroup);