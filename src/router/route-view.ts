import { UIComponent } from "../core/component";
import { router } from "../core/router";

export class RouteView extends UIComponent {
  private unsubscribe?: () => void;

  connectedCallback(): void {
    this.unsubscribe = router.subscribe(() => this.render());
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
  }

  protected render(): void {
    this.root.innerHTML = router.resolve();
  }
}

customElements.define("route-view", RouteView);
