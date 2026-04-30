import { UIComponent } from "../../core/component";
import styles from "./ui-text-input.css?raw";

export class UITextInput extends UIComponent {
  protected render(): void {
    const label = this.getAttribute("label");
    const type = this.getAttribute("type") ?? "text";
    const placeholder = this.getAttribute("placeholder") ?? "Enter text";
    const value = this.getAttribute("value") ?? "";
    const name = this.getAttribute("name") ?? "";
    const required = this.hasAttribute("required");
    const disabled = this.hasAttribute("disabled");
    const error = this.hasAttribute("error");
    const fieldClass = error ? "field field--error" : "field";
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

customElements.define("ui-text-input", UITextInput);
