import { UIComponent } from "../../core/component";
import styles from "./td-checkbox.css?raw";
export class UICheckbox extends UIComponent {
    static get observedAttributes(): string[] {
        return ["checked", "disabled", "error"];
    }
    get checked(): boolean {
        return this.hasAttribute("checked");
    }
    set checked(val: boolean) {
        if (val) {
            this.setAttribute("checked", "");
        }
        else {
            this.removeAttribute("checked");
        }
    }
    get disabled(): boolean {
        return this.hasAttribute("disabled");
    }
    set disabled(val: boolean) {
        if (val) {
            this.setAttribute("disabled", "");
        }
        else {
            this.removeAttribute("disabled");
        }
    }
    attributeChangedCallback(name: string): void {
        const input = this.root.querySelector<HTMLInputElement>("input");
        if (!input)
            return;
        if (name === "checked") {
            input.checked = this.hasAttribute("checked");
        }
        if (name === "disabled") {
            input.disabled = this.hasAttribute("disabled");
        }
        if (name === "error") {
            this._updateErrorState();
        }
    }
    private _updateErrorState(): void {
        const hasError = this.hasAttribute("error");
        const field = this.root.querySelector<HTMLElement>(".field");
        const input = this.root.querySelector<HTMLInputElement>("input");
        if (!field || !input)
            return;
        field.classList.toggle("field--error", hasError);
        input.setAttribute("aria-invalid", String(hasError));
        let errorMsg = this.root.querySelector<HTMLElement>(".error-message");
        if (hasError && !errorMsg) {
            const errorId = `${input.id}-error`;
            input.setAttribute("aria-describedby", errorId);
            errorMsg = document.createElement("div");
            errorMsg.className = "error-message";
            errorMsg.id = errorId;
            errorMsg.setAttribute("role", "alert");
            errorMsg.textContent = "This field is required";
            field.appendChild(errorMsg);
        }
        else if (!hasError && errorMsg) {
            input.removeAttribute("aria-describedby");
            input.setAttribute("aria-invalid", "false");
            errorMsg.remove();
        }
    }
    protected render(): void {
        const label = this.getAttribute("label") ?? "";
        const name = this.getAttribute("name") ?? "";
        const value = this.getAttribute("value") ?? "on";
        const checked = this.hasAttribute("checked");
        const disabled = this.hasAttribute("disabled");
        const required = this.hasAttribute("required");
        const error = this.hasAttribute("error");
        const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`;
        const errorId = `${checkboxId}-error`;
        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="field${error ? " field--error" : ""}">
        <label class="checkbox-wrap" for="${checkboxId}">
          <input
            part="input"
            id="${checkboxId}"
            type="checkbox"
            name="${name}"
            value="${value}"
            ${checked ? "checked" : ""}
            ${disabled ? "disabled" : ""}
            ${required ? "required aria-required='true'" : ""}
            ${error ? `aria-invalid="true" aria-describedby="${errorId}"` : 'aria-invalid="false"'}
          />
          ${label ? `<span part="label" class="checkbox-label">${label}${required ? '<span class="required-marker" aria-label="required">*</span>' : ""}</span>` : ""}
        </label>
        ${error ? `<div class="error-message" id="${errorId}" role="alert">This field is required</div>` : ""}
      </div>
    `;
        const input = this.root.querySelector<HTMLInputElement>("input");
        input?.addEventListener("change", () => {
            if (input.checked) {
                this.setAttribute("checked", "");
            }
            else {
                this.removeAttribute("checked");
            }
            this.dispatchEvent(new CustomEvent("change", {
                detail: { checked: input.checked, value: input.value },
                bubbles: true,
                composed: true,
            }));
        });
    }
}
customElements.define("td-checkbox", UICheckbox);
