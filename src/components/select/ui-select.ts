import { UIComponent } from "../../core/component";
import styles from "./ui-select.css?raw";

export class UISelect extends UIComponent {
  static get observedAttributes(): string[] {
    return ["label", "name", "disabled", "required", "multiple", "value"];
  }

  private changeHandler?: () => void;

  protected render(): void {
    const label = this.getAttribute("label");
    const name = this.getAttribute("name") ?? "";
    const disabled = this.hasAttribute("disabled") ? "disabled" : "";
    const required = this.hasAttribute("required") ? "required" : "";
    const multiple = this.hasAttribute("multiple") ? "multiple" : "";
    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

    const optionsHtml = Array.from(this.children).map(el => el.outerHTML).join('');

    this.root.innerHTML = `
      ${this.css(styles)}
      <div class="field">
        ${label ? `<label part="label" for="${selectId}">${label}${required ? '<span aria-label="required"> *</span>' : ''}</label>` : ""}
        <select part="select" id="${selectId}" name="${name}" ${disabled} ${required ? 'required aria-required="true"' : ''} ${multiple}>
          ${optionsHtml}
        </select>
      </div>
    `;

    const select = this.root.querySelector("select");

    if (select) {
      select.value = this.getAttribute("value") ?? "";

      if (this.changeHandler) {
        select.removeEventListener("change", this.changeHandler);
      }

      this.changeHandler = () => {
        this.setAttribute("value", select.value);
        this.dispatchEvent(new CustomEvent("change", {
          detail: { value: select.value },
          bubbles: true,
          composed: true
        }));
      };

      select.addEventListener("change", this.changeHandler);
    }
  }

  disconnectedCallback(): void {
    const select = this.root.querySelector("select");
    if (select && this.changeHandler) {
      select.removeEventListener("change", this.changeHandler);
    }
  }

  get value(): string {
    const select = this.root.querySelector("select");
    return select?.value ?? this.getAttribute("value") ?? "";
  }

  set value(value: string) {
    this.setAttribute("value", value);
    const select = this.root.querySelector("select");
    if (select) {
      select.value = value;
    }
  }
}

customElements.define("ui-select", UISelect);
