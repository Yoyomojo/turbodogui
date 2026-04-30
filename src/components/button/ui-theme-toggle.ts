import { UIComponent } from "../../core/component";
import { getTheme, toggleTheme } from "../../theme/theme";
import styles from "./ui-theme-toggle.css?raw";

export class UIThemeToggle extends UIComponent {
  connectedCallback(): void {
    super.connectedCallback();
    this.root.addEventListener("click", this.handleClick);
  }

  disconnectedCallback(): void {
    this.root.removeEventListener("click", this.handleClick);
  }

  protected render(): void {
    const theme = getTheme();
    const label = theme === "dark" ? "Switch to Light" : "Switch to Dark";

    this.root.innerHTML = `
      ${this.css(styles)}
      <button type="button">${label}</button>
    `;
  }

  private handleClick = (): void => {
    toggleTheme();
    this.render();
  };
}

customElements.define("ui-theme-toggle", UIThemeToggle);
