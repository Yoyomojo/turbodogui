import { UIComponent } from "../../core/component";
import styles from "./td-card.css?raw";
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
customElements.define("td-card", UICard);
