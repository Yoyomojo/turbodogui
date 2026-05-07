export abstract class UIComponent extends HTMLElement {
  protected root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
  }

  protected abstract render(): void;

  protected css(styles: string): string {
    return `<style>${styles}</style>`;
  }
}
