import { UIComponent } from "../../core/component";
import styles from "./td-textarea.css?raw";

export class UITextarea extends UIComponent {
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
        const textarea = this.root.querySelector<HTMLTextAreaElement>("textarea");

        if (!field || !textarea) {
            return;
        }

        field.classList.toggle("field--error", hasError);
        textarea.setAttribute("aria-invalid", String(hasError));

        let errorMsg = this.root.querySelector<HTMLElement>(".error-message");

        if (hasError && !errorMsg) {
            const errorId = `${textarea.id}-error`;
            textarea.setAttribute("aria-describedby", errorId);
            errorMsg = document.createElement("div");
            errorMsg.className = "error-message";
            errorMsg.id = errorId;
            errorMsg.setAttribute("role", "alert");
            errorMsg.textContent = "This field has an error";
            field.appendChild(errorMsg);
        } else if (!hasError && errorMsg) {
            textarea.removeAttribute("aria-describedby");
            textarea.setAttribute("aria-invalid", "false");
            errorMsg.remove();
        }
    }

    protected render(): void {
        const label = this.getAttribute("label");
        const placeholder = this.getAttribute("placeholder") ?? "Enter text";
        const value = this.getAttribute("value") ?? "";
        const name = this.getAttribute("name") ?? "";
        const size = this.getAttribute("size") ?? "medium";
        const resize = this.getAttribute("resize") ?? "vertical";
        const rowsAttr = this.getAttribute("rows");
        const rows = Number(rowsAttr ?? "4");
        const required = this.hasAttribute("required");
        const disabled = this.hasAttribute("disabled");
        const error = this.hasAttribute("error");

        const safeRows = Number.isFinite(rows) && rows > 0 ? Math.floor(rows) : 4;
        const fieldClass = ["field", `field--${size}`, error ? "field--error" : ""].filter(Boolean).join(" ");
        const textareaId = `textarea-${Math.random().toString(36).slice(2, 11)}`;
        const errorId = `${textareaId}-error`;

        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="${fieldClass}">
        ${label ? `<label part="label" for="${textareaId}">${label}${required ? '<span aria-label="required"> *</span>' : ""}</label>` : ""}
        <textarea
          part="textarea"
          id="${textareaId}"
          name="${name}"
          placeholder="${placeholder}"
          rows="${safeRows}"
          style="resize: ${resize};"
          ${required ? "required aria-required='true'" : ""}
          ${disabled ? "disabled" : ""}
          ${error ? `aria-invalid="true" aria-describedby="${errorId}"` : 'aria-invalid="false"'}
        >${value}</textarea>
        ${error ? `<div class="error-message" id="${errorId}" role="alert">This field has an error</div>` : ""}
      </div>
    `;
    }
}

customElements.define("td-textarea", UITextarea);
