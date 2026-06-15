import { UIComponent } from "../../core/component";
import styles from "./td-breadcrumb.css?raw";
export interface BreadcrumbItem {
    label: string;
    href?: string;
}
function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
export class UIBreadcrumb extends UIComponent {
    private _items: BreadcrumbItem[] = [];
    private _loading = false;
    static get observedAttributes(): string[] {
        return ["items", "src", "separator"];
    }
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void {
        if (oldVal === newVal || !this.isConnected)
            return;
        if (name === "src") {
            this._fetchItems(newVal ?? "");
        }
        else {
            this.render();
        }
    }
    connectedCallback(): void {
        const attr = this.getAttribute("items");
        if (attr) {
            try {
                this._items = JSON.parse(attr);
            }
            catch { }
        }
        const src = this.getAttribute("src");
        if (src) {
            this._fetchItems(src);
            return;
        }
        super.connectedCallback();
    }
    get items(): BreadcrumbItem[] { return this._items; }
    set items(val: BreadcrumbItem[]) {
        this._items = val;
        if (this.isConnected)
            this.render();
    }
    private _fetchItems(src: string): void {
        this._loading = true;
        this.render();
        fetch(src)
            .then(r => {
            if (!r.ok)
                throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
            .then((data: BreadcrumbItem[]) => {
            this._items = data;
            this._loading = false;
            this.render();
        })
            .catch(() => {
            this._loading = false;
            this.render();
        });
    }
    protected render(): void {
        const separator = this.getAttribute("separator") ?? "/";
        const hasData = this._items.length > 0;
        if (this._loading) {
            this.root.innerHTML = `
        ${this.css(styles)}
        <nav aria-label="Breadcrumb">
          <ul class="breadcrumb" aria-busy="true"></ul>
        </nav>
      `;
            return;
        }
        if (!hasData) {
            const children = Array.from(this.children);
            const ul = document.createElement('ul');
            ul.className = 'breadcrumb';
            children.forEach((el, i) => {
                const li = document.createElement('li');
                li.className = 'breadcrumb__item';
                const ariaCurrent = el.getAttribute('aria-current');
                if (ariaCurrent)
                    li.setAttribute('aria-current', ariaCurrent);
                if (ariaCurrent === 'page') {
                    const span = document.createElement('span');
                    span.className = 'breadcrumb__current';
                    span.setAttribute('aria-current', 'page');
                    span.textContent = el.textContent ?? '';
                    li.appendChild(span);
                }
                else {
                    li.innerHTML = el.innerHTML;
                    li.querySelectorAll('a').forEach(a => a.classList.add('breadcrumb__link'));
                }
                ul.appendChild(li);
                if (i < children.length - 1) {
                    const sepLi = document.createElement('li');
                    sepLi.className = 'breadcrumb__separator';
                    sepLi.setAttribute('aria-hidden', 'true');
                    sepLi.textContent = separator;
                    ul.appendChild(sepLi);
                }
            });
            this.root.innerHTML = `${this.css(styles)}<nav aria-label="Breadcrumb"></nav>`;
            this.root.querySelector('nav')!.appendChild(ul);
            return;
        }
        const items = this._items;
        const lastIndex = items.length - 1;
        const itemsHtml = items
            .map((item, i) => {
            const isLast = i === lastIndex;
            const sepHtml = i < lastIndex
                ? `<li class="breadcrumb__separator" aria-hidden="true">${escapeHtml(separator)}</li>`
                : "";
            const crumb = isLast
                ? `<span class="breadcrumb__current" aria-current="page">${escapeHtml(item.label)}</span>`
                : item.href
                    ? `<a class="breadcrumb__link" href="${escapeHtml(item.href)}" data-index="${i}">${escapeHtml(item.label)}</a>`
                    : `<button class="breadcrumb__link" type="button" data-index="${i}">${escapeHtml(item.label)}</button>`;
            return `<li class="breadcrumb__item">${crumb}</li>${sepHtml}`;
        })
            .join("");
        this.root.innerHTML = `
      ${this.css(styles)}
      <nav aria-label="Breadcrumb">
        <ul class="breadcrumb">
          ${itemsHtml}
        </ul>
      </nav>
    `;
        this.root.querySelectorAll<HTMLElement>("[data-index]").forEach(el => {
            el.addEventListener("click", (e: Event) => {
                const idx = parseInt((e.currentTarget as HTMLElement).getAttribute("data-index") ?? "0", 10);
                const item = this._items[idx];
                this.dispatchEvent(new CustomEvent("breadcrumb-click", {
                    bubbles: true,
                    composed: true,
                    detail: { index: idx, label: item.label, href: item.href ?? null },
                }));
            });
        });
    }
}
customElements.define("td-breadcrumb", UIBreadcrumb);
