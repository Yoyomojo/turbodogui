import { UIComponent } from "../../core/component";
import styles from "./td-text-input.css?raw";

const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const eyeOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

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
        const showToggle = type === "password" && this.hasAttribute("show-password-toggle");
        const fieldClass = ["field", `field--${size}`, error ? "field--error" : ""].filter(Boolean).join(" ");
        const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
        const errorId = `${inputId}-error`;
        const inputEl = `<input
          part="input"
          id="${inputId}"
          type="${type}"
          name="${name}"
          placeholder="${placeholder}"
          value="${value}"
          ${required ? "required aria-required='true'" : ""}
          ${disabled ? "disabled" : ""}
          ${error ? `aria-invalid="true" aria-describedby="${errorId}"` : 'aria-invalid="false"'}
        />`;
        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="${fieldClass}">
        ${label ? `<label part="label" for="${inputId}">${label}${required ? '<span aria-label="required"> *</span>' : ''}</label>` : ""}
        ${showToggle
            ? `<div class="password-wrapper">${inputEl}<button type="button" class="password-toggle" aria-label="Show password">${eyeIcon}</button></div>`
            : inputEl
        }
        ${error ? `<div class="error-message" id="${errorId}" role="alert">This field has an error</div>` : ""}
      </div>
    `;
        if (showToggle) {
            const toggle = this.root.querySelector<HTMLButtonElement>(".password-toggle");
            const input = this.root.querySelector<HTMLInputElement>("input");
            toggle?.addEventListener("click", () => {
                const isPassword = input!.type === "password";
                input!.type = isPassword ? "text" : "password";
                toggle.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
                toggle.innerHTML = isPassword ? eyeOffIcon : eyeIcon;
            });
        }
    }
}
customElements.define("td-text-input", UITextInput);
