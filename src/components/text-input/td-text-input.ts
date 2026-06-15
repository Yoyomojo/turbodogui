import { UIComponent } from "../../core/component";
import styles from "./td-text-input.css?raw";
export class UITextInput extends UIComponent {
    static get observedAttributes(): string[] {
        return ["error"];
    }
    attributeChangedCallback(): void {
        if (this.root.querySelector(".field")) {
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
            errorMsg.textContent = "This field has an error";
            field.appendChild(errorMsg);
        }
        else if (!hasError && errorMsg) {
            input.removeAttribute("aria-describedby");
            input.setAttribute("aria-invalid", "false");
            errorMsg.remove();
        }
    }
    protected render(): void {
        const label = this.getAttribute("label");
        const type = this.getAttribute("type") ?? "text";
        const placeholder = this.getAttribute("placeholder") ?? "Enter text";
        const value = this.getAttribute("value") ?? "";
        const name = this.getAttribute("name") ?? "";
        const size = this.getAttribute("size") ?? "medium";
        const required = this.hasAttribute("required");
        const disabled = this.hasAttribute("disabled");
        const error = this.hasAttribute("error");
        const fieldClass = ["field", `field--${size}`, error ? "field--error" : ""].filter(Boolean).join(" ");
        const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
        const errorId = `${inputId}-error`;
        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="${fieldClass}">
        ${label ? `<label part="label" for="${inputId}">${label}${required ? '<span aria-label="required"> *</span>' : ''}</label>` : ""}
        <input
          part="input"
          id="${inputId}"
          type="${type}"
          name="${name}"
          placeholder="${placeholder}"
          value="${value}"
          ${required ? "required aria-required='true'" : ""}
          ${disabled ? "disabled" : ""}
          ${error ? `aria-invalid="true" aria-describedby="${errorId}"` : 'aria-invalid="false"'}
        />
        ${error ? `<div class="error-message" id="${errorId}" role="alert">This field has an error</div>` : ""}
      </div>
    `;
    }
}
customElements.define("td-text-input", UITextInput);
