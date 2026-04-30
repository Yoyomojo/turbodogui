import { UIComponent } from "../../core/component";
import styles from "./ui-card.css?raw";

export class UICard extends UIComponent {
  protected render(): void {
    this.root.innerHTML = `
      ${this.css(styles)}
      <article class="card">
        <slot></slot>
      </article>
    `;
  }
}

customElements.define("ui-card", UICard);
