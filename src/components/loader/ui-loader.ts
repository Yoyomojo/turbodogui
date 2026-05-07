import { UIComponent } from "../../core/component";
import styles from "./ui-loader.css?raw";

export class UILoader extends UIComponent {
  protected render(): void {
    const message = this.getAttribute("message");
    const size = this.getAttribute("size") ?? "48px";
    const color = this.getAttribute("color");
    const variant = this.getAttribute("variant") ?? "spinner";

    const colorStyle = color ? `--loader-color: ${color};` : "";
    const sizeStyle = `--loader-size: ${size};`;

    this.root.innerHTML = `
      ${this.css(styles)}
      <style>
        :host {
          ${sizeStyle}
          ${colorStyle}
        }
      </style>
      <div class="loader-overlay" part="overlay">
        <div class="loader-container">
          <div class="spinner ${variant}" part="spinner"></div>
          ${message ? `<div class="loader-text">${message}</div>` : ""}
        </div>
      </div>
    `;
  }

  show(): void {
    this.style.display = "contents";
    this.dispatchEvent(
      new CustomEvent("loader-show", {
        bubbles: true,
        composed: true,
      })
    );
  }

  hide(): void {
    this.remove();
    this.dispatchEvent(
      new CustomEvent("loader-hide", {
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("ui-loader", UILoader);
