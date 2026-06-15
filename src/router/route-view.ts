import { UIComponent } from "../core/component";
import { router } from "../core/router";
export class RouteView extends UIComponent {
    private unsubscribe?: () => void;
    private renderToken = 0;
    connectedCallback(): void {
        this.unsubscribe = router.subscribe(() => this.render());
        super.connectedCallback();
    }
    disconnectedCallback(): void {
        this.unsubscribe?.();
    }
    protected render(): void {
        void this.renderAsync();
    }
    private async renderAsync(): Promise<void> {
        const token = ++this.renderToken;
        const html = await router.resolve();
        if (token !== this.renderToken)
            return;
        this.root.innerHTML = html;
    }
}
customElements.define("route-view", RouteView);
