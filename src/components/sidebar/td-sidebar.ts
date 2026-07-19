import { UIComponent } from "../../core/component";
import { router } from "../../core/router";
import styles from "./td-sidebar.css?raw";
const TAB_ROUTE_MAP: Record<string, string> = {
    "tab-0": "/examples/accordion",
    "tab-1": "/examples/alert",
    "tab-2": "/examples/api-fetching",
    "tab-3": "/examples/breadcrumb",
    "tab-4": "/examples/carousel",
    "tab-5": "/examples/charts",
    "tab-6": "/examples/drawer",
    "tab-7": "/examples/grid",
    "tab-8-text-input": "/examples/text-input",
    "tab-8-select": "/examples/select",
    "tab-8-multi-select": "/examples/multi-select",
    "tab-8-button": "/examples/button",
    "tab-8-button-group": "/examples/button-group",
    "tab-8-checkbox": "/examples/checkbox",
    "tab-8-slider": "/examples/slider",
    "tab-8-file-input": "/examples/file-input",
    "tab-9": "/examples/links",
    "tab-10": "/examples/loader",
    "tab-11": "/examples/modal",
    "tab-12": "/examples/mosaic",
    "tab-13": "/examples/pagination",
    "tab-14": "/examples/sidebar",
    "tab-15": "/examples/table",
    "tab-16": "/examples/tabs",
    "tab-17": "/examples/tooltip",
    "tab-18": "/examples/utilities",
    "tab-19": "/examples/video-player",
    "tab-20": "/examples/textarea",
    "tab-21": "/examples/date-picker",
    "tab-22": "/examples/dropdown",
    "tab-23": "/examples/progress-bar",
    "tab-24": "/examples/color-picker",
};
const ROUTE_KEY_MAP: Record<string, string> = {
    "/": "home",
    "/examples": "tab-0",
    "/examples/accordion": "tab-0",
    "/examples/alert": "tab-1",
    "/examples/api-fetching": "tab-2",
    "/examples/breadcrumb": "tab-3",
    "/examples/carousel": "tab-4",
    "/examples/charts": "tab-5",
    "/examples/drawer": "tab-6",
    "/examples/grid": "tab-7",
    "/examples/text-input": "tab-8-text-input",
    "/examples/select": "tab-8-select",
    "/examples/multi-select": "tab-8-multi-select",
    "/examples/button": "tab-8-button",
    "/examples/button-group": "tab-8-button-group",
    "/examples/checkbox": "tab-8-checkbox",
    "/examples/slider": "tab-8-slider",
    "/examples/file-input": "tab-8-file-input",
    "/examples/text-inputs": "tab-8-text-input",
    "/examples/selects": "tab-8-select",
    "/examples/multi-selects": "tab-8-multi-select",
    "/examples/buttons": "tab-8-button",
    "/examples/checkboxes": "tab-8-checkbox",
    "/examples/sliders": "tab-8-slider",
    "/examples/file-inputs": "tab-8-file-input",
    "/examples/inputs-buttons": "tab-8-text-input",
    "/examples/links": "tab-9",
    "/examples/loader": "tab-10",
    "/examples/modal": "tab-11",
    "/examples/mosaic": "tab-12",
    "/examples/pagination": "tab-13",
    "/examples/sidebar": "tab-14",
    "/examples/table": "tab-15",
    "/examples/tabs": "tab-16",
    "/examples/tooltip": "tab-17",
    "/examples/utilities": "tab-18",
    "/examples/video-player": "tab-19",
    "/examples/textarea": "tab-20",
    "/examples/textareas": "tab-20",
    "/examples/date-picker": "tab-21",
    "/examples/dropdown": "tab-22",
    "/examples/progress-bar": "tab-23",
    "/examples/color-picker": "tab-24",
    "/examples/layouts/login": "layout-login",
    "/examples/layouts/register": "layout-register",
    "/examples/layouts/dashboard": "layout-dashboard",
    "/examples/layouts/admin-panel": "layout-admin-panel",
    "/examples/layouts/user-dashboard": "layout-admin-panel",
    "/examples/layouts/verify": "layout-verify",
};
export interface SidebarItem {
    key: string;
    label: string;
    icon?: string;
    href?: string;
    badge?: string;
    section?: boolean;
    data?: unknown;
}
const CHEVRON_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="15 18 9 12 15 6"></polyline>
</svg>`;
const SEARCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="11" cy="11" r="8"></circle>
  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
</svg>`;
const MENU_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <line x1="3" y1="12" x2="21" y2="12"></line>
  <line x1="3" y1="6"  x2="21" y2="6"></line>
  <line x1="3" y1="18" x2="21" y2="18"></line>
</svg>`;
function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function defaultIcon(label: string): string {
    return `<span style="font-size:0.875rem;font-weight:700;opacity:0.7">${escapeHtml(label.charAt(0).toUpperCase())}</span>`;
}
const HOST_STYLES = `
td-sidebar .nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  height: 42px;
  border: none;
  background: transparent;
  color: var(--td-fg);
  text-decoration: none;
  font-size: 0.9375rem;
  cursor: pointer;
  border-radius: 8px;
  margin: 1px 6px;
  white-space: nowrap;
  width: calc(100% - 12px);
  box-sizing: border-box;
  transition: background 150ms ease, color 150ms ease;
  text-align: left;
  font-family: inherit;
}
td-sidebar .nav-item:hover {
  background: var(--td-surface-2);
  color: var(--td-fg);
}
td-sidebar .nav-item:focus-visible {
  outline: 2px solid var(--td-primary);
  outline-offset: -2px;
}
td-sidebar .nav-item.active {
  background: var(--td-primary);
  color: var(--td-primary-foreground);
}
td-sidebar .nav-item.active:hover {
  background: var(--td-primary);
}
td-sidebar .nav-item.nav-item--hidden {
  display: none;
}
td-sidebar .nav-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
td-sidebar .nav-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 150ms ease, width 150ms ease;
  opacity: 1;
}
td-sidebar .nav-badge {
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 99px;
  background: var(--td-primary);
  color: var(--td-primary-foreground);
  line-height: 1.4;
  transition: opacity 150ms ease;
}
td-sidebar .nav-section {
  margin-top: 8px;
}
td-sidebar .nav-section-label {
  display: block;
  padding: 4px 16px 4px 14px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--td-muted);
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transition: opacity 150ms ease;
}
td-sidebar[collapsed] .nav-item {
  justify-content: center;
  padding: 0;
  gap: 0;
}
td-sidebar[collapsed] .nav-label {
  opacity: 0;
  width: 0;
  flex: none;
  overflow: hidden;
  pointer-events: none;
}
td-sidebar[collapsed] .nav-badge {
  opacity: 0;
  width: 0;
  padding: 0;
  overflow: hidden;
  pointer-events: none;
}
td-sidebar[collapsed] .nav-section-label {
  opacity: 0;
  height: 0;
  padding: 0;
}
td-sidebar[collapsed] .nav-item::after {
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: var(--td-fg);
  color: var(--td-bg);
  font-size: 0.8125rem;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  z-index: 100;
  transition: opacity 120ms ease;
  box-shadow: var(--td-shadow);
}
td-sidebar[collapsed] .nav-item:hover::after,
td-sidebar[collapsed] .nav-item:focus-visible::after {
  opacity: 1;
}
`;
export class UISidebar extends UIComponent {
    private static _hostStylesInjected = false;
    private static _injectHostStyles(): void {
        if (UISidebar._hostStylesInjected) return;
        UISidebar._hostStylesInjected = true;
        const style = document.createElement("style");
        style.setAttribute("data-component", "td-sidebar");
        style.textContent = HOST_STYLES;
        document.head.appendChild(style);
    }
    constructor() {
        super();
        UISidebar._injectHostStyles();
    }
    private _items: SidebarItem[] = [];
    private _activeKey: string = "";
    private _collapsed: boolean = false;
    private _mobileOpen: boolean = false;
    private _searchQuery: string = "";
    private _overlay: HTMLElement | null = null;
    private _mobileToggleBtn: HTMLElement | null = null;
    private _mq: MediaQueryList | null = null;
    private _mqUpdate: ((m: MediaQueryList | MediaQueryListEvent) => void) | null = null;
    private _navItemClickListener: ((e: Event) => void) | null = null;
    private _routerListener: (() => void) | null = null;
    private _brandClickListener: ((e: Event) => void) | null = null;
    static get observedAttributes(): string[] {
        return ["collapsed", "active", "search", "search-placeholder", "label", "no-toggle", "sticky"];
    }
    attributeChangedCallback(_name: string, oldVal: string | null, newVal: string | null): void {
        if (oldVal !== newVal && this.isConnected)
            this.render();
    }
    connectedCallback(): void {
        const attr = this.getAttribute("items");
        if (attr) {
            try {
                this._items = JSON.parse(attr);
            }
            catch { }
        }
        this._collapsed = this.hasAttribute("collapsed");
        this._activeKey = this.getAttribute("active") ?? "";
        super.connectedCallback();
        this._wireTooltips();
        this._createOverlay();
        this._createMobileToggle();
        this._wirePage();
    }
    disconnectedCallback(): void {
        this._overlay?.remove();
        this._mobileToggleBtn?.remove();
        if (this._mq && this._mqUpdate) {
            this._mq.removeEventListener("change", this._mqUpdate);
            this._mq = null;
            this._mqUpdate = null;
        }
        if (this._navItemClickListener) {
            this.removeEventListener("nav-item-click", this._navItemClickListener);
        }
        if (this._routerListener) {
            router.removeListener(this._routerListener);
        }
        const brandLink = document.querySelector<HTMLAnchorElement>(".topbar-brand");
        if (brandLink && this._brandClickListener) {
            brandLink.removeEventListener("click", this._brandClickListener);
        }
    }
    get items(): SidebarItem[] { return this._items; }
    set items(val: SidebarItem[]) {
        this._items = val;
        if (this.isConnected)
            this.render();
    }
    get activeKey(): string { return this._activeKey; }
    set activeKey(key: string) {
        this._activeKey = key;
        if (this.isConnected)
            this._updateActive();
    }
    get collapsed(): boolean { return this._collapsed; }
    set collapsed(val: boolean) {
        this._collapsed = val;
        if (this.isConnected)
            this._applyCollapsed();
    }
    open(): void { this._setMobileOpen(true); }
    close(): void { this._setMobileOpen(false); }
    toggle(): void { this._setMobileOpen(!this._mobileOpen); }
    protected render(): void {
        const hasSearch = this.hasAttribute("search");
        const searchPlaceholder = this.getAttribute("search-placeholder") ?? "Search…";
        const label = this.getAttribute("label") ?? "Navigation";
        const noToggle = this.hasAttribute("no-toggle");
        const headerSlotHtml = `
      <div class="sidebar-header-slot">
        <slot name="header"></slot>
      </div>
    `;
        const toggleHtml = noToggle ? "" : `
      <button
        class="toggle-btn"
        aria-label="${this._collapsed ? "Expand sidebar" : "Collapse sidebar"}"
        aria-expanded="${!this._collapsed}"
        aria-controls="sidebar-nav"
      >
        ${CHEVRON_LEFT}
      </button>
    `;
        const searchHtml = hasSearch ? `
      <div class="search-wrap">
        <div class="search-field">
          <span class="search-icon" aria-hidden="true">${SEARCH_ICON}</span>
          <input
            class="search-input"
            type="search"
            placeholder="${escapeHtml(searchPlaceholder)}"
            aria-label="${escapeHtml(searchPlaceholder)}"
            value="${escapeHtml(this._searchQuery)}"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
      </div>
    ` : "";
        const navHtml = this._buildNav(this._searchQuery);
        this.root.innerHTML = `
      ${this.css(styles)}
      <nav
        class="sidebar${this._collapsed ? " collapsed" : ""}"
        id="sidebar-nav"
        aria-label="${escapeHtml(label)}"
      >
        <div class="sidebar-header">
          ${headerSlotHtml}
          ${toggleHtml}
        </div>
        ${searchHtml}
        <div class="sidebar-nav" role="list">
          ${navHtml}
        </div>
        <div class="sidebar-slot-content">
          <slot name="body"></slot>
        </div>
        <div class="sidebar-footer">
          <slot name="footer"></slot>
        </div>
      </nav>
      <td-tooltip id="sidebar-item-tooltip"></td-tooltip>
    `;
        this._attachListeners();
    }
    private _buildNav(query: string): string {
        if (this._items.length === 0) {
            return `<slot></slot>`;
        }
        const q = query.toLowerCase().trim();
        return this._items.map((item) => {
            if (item.section) {
                return this._buildSection(item, q);
            }
            return this._buildItem(item, q);
        }).join("");
    }
    private _buildSection(item: SidebarItem, q: string): string {
        if (q) {
            const nextItems = this._items.slice(this._items.indexOf(item) + 1);
            const sectionItems = [];
            for (const i of nextItems) {
                if (i.section)
                    break;
                sectionItems.push(i);
            }
            const anyVisible = sectionItems.some(i => i.label.toLowerCase().includes(q));
            if (!anyVisible)
                return "";
        }
        return `
      <div class="nav-section" role="listitem">
        <span class="nav-section-label">${escapeHtml(item.label)}</span>
      </div>
    `;
    }
    private _buildItem(item: SidebarItem, q: string): string {
        const hidden = q && !item.label.toLowerCase().includes(q) ? " nav-item--hidden" : "";
        const active = item.key === this._activeKey ? " active" : "";
        const icon = item.icon ?? defaultIcon(item.label);
        const badge = item.badge ? `<span class="nav-badge">${escapeHtml(item.badge)}</span>` : "";
        const label = escapeHtml(item.label);
        if (item.href) {
            return `
        <a
          class="nav-item${active}${hidden}"
          href="${escapeHtml(item.href)}"
          data-key="${escapeHtml(item.key)}"
          data-tooltip="${label}"
          role="listitem"
          aria-current="${item.key === this._activeKey ? "page" : "false"}"
        >
          <span class="nav-icon" aria-hidden="true">${icon}</span>
          <span class="nav-label">${label}</span>
          ${badge}
        </a>
      `;
        }
        return `
      <button
        class="nav-item${active}${hidden}"
        type="button"
        data-key="${escapeHtml(item.key)}"
        data-tooltip="${label}"
        role="listitem"
        aria-current="${item.key === this._activeKey ? "page" : "false"}"
      >
        <span class="nav-icon" aria-hidden="true">${icon}</span>
        <span class="nav-label">${label}</span>
        ${badge}
      </button>
    `;
    }
    private _attachListeners(): void {
        const toggleBtn = this.root.querySelector<HTMLButtonElement>(".toggle-btn");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => {
                this._collapsed = !this._collapsed;
                this._applyCollapsed();
                this.dispatchEvent(new CustomEvent("sidebar-toggle", {
                    bubbles: true,
                    composed: true,
                    detail: { collapsed: this._collapsed },
                }));
            });
        }
        this.root.addEventListener("click", (e) => {
            const clicked = e.composedPath()[0] as Element;
            const target = clicked?.closest<HTMLElement>("[data-key]");
            if (!target)
                return;
            const key = target.getAttribute("data-key");
            if (!key)
                return;
            const item = this._items.find(i => i.key === key);
            this._activeKey = key;
            this._updateActive();
            if (this._mobileOpen)
                this._setMobileOpen(false);
            this.dispatchEvent(new CustomEvent("nav-item-click", {
                bubbles: true,
                composed: true,
                detail: { key, item: item ?? { key } },
            }));
        });
        const nav = this.root.querySelector<HTMLElement>(".sidebar-nav");
        const handleNavKeydown = (e: KeyboardEvent) => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key))
                return;
            const shadowItems = nav
                ? Array.from(nav.querySelectorAll<HTMLElement>(".nav-item:not(.nav-item--hidden)"))
                : [];
            const slottedItems = Array.from(this.querySelectorAll<HTMLElement>(".nav-item:not(.nav-item--hidden)"));
            const items = [...shadowItems, ...slottedItems];
            const focused = document.activeElement as HTMLElement;
            const idx = items.indexOf(focused);
            if (e.key === "ArrowDown") {
                e.preventDefault();
                items[Math.min(idx + 1, items.length - 1)]?.focus();
            }
            else if (e.key === "ArrowUp") {
                e.preventDefault();
                items[Math.max(idx - 1, 0)]?.focus();
            }
            else if (e.key === "Home") {
                e.preventDefault();
                items[0]?.focus();
            }
            else if (e.key === "End") {
                e.preventDefault();
                items[items.length - 1]?.focus();
            }
        };
        if (nav)
            nav.addEventListener("keydown", handleNavKeydown);
        this.addEventListener("keydown", (e) => {
            const target = e.target as Element;
            if (this.root.contains(target))
                return;
            handleNavKeydown(e as KeyboardEvent);
        });
        const defaultSlot = this.root.querySelector<HTMLSlotElement>("slot:not([name])");
        if (defaultSlot) {
            defaultSlot.addEventListener("slotchange", () => this._updateActive());
        }
        const searchInput = this.root.querySelector<HTMLInputElement>(".search-input");
        if (searchInput) {
            searchInput.addEventListener("input", () => {
                this._searchQuery = searchInput.value;
                this._filterItems(this._searchQuery);
            });
            searchInput.addEventListener("keydown", (e) => e.stopPropagation());
        }
    }
    private _applyCollapsed(): void {
        const sidebar = this.root.querySelector<HTMLElement>(".sidebar");
        const toggleBtn = this.root.querySelector<HTMLButtonElement>(".toggle-btn");
        if (!sidebar)
            return;
        sidebar.classList.toggle("collapsed", this._collapsed);
        if (!this._collapsed) {
            (this.root.querySelector("#sidebar-item-tooltip") as any)?.hide();
        }
        if (toggleBtn) {
            toggleBtn.setAttribute("aria-label", this._collapsed ? "Expand sidebar" : "Collapse sidebar");
            toggleBtn.setAttribute("aria-expanded", String(!this._collapsed));
        }
        if (this._collapsed) {
            this.setAttribute("collapsed", "");
        }
        else {
            this.removeAttribute("collapsed");
        }
    }
    private _updateActive(): void {
        this.root.querySelectorAll<HTMLElement>(".nav-item").forEach((el) => {
            const key = el.getAttribute("data-key");
            const isActive = key === this._activeKey;
            el.classList.toggle("active", isActive);
            el.setAttribute("aria-current", isActive ? "page" : "false");
        });
        this.querySelectorAll<HTMLElement>("[data-key]").forEach((el) => {
            const key = el.getAttribute("data-key");
            const isActive = key === this._activeKey;
            el.classList.toggle("active", isActive);
            el.setAttribute("aria-current", isActive ? "page" : "false");
        });
    }
    private _filterItems(query: string): void {
        const q = query.toLowerCase().trim();
        const filterItem = (el: HTMLElement) => {
            const label = el.querySelector(".nav-label")?.textContent?.toLowerCase() ??
                el.getAttribute("data-tooltip")?.toLowerCase() ?? "";
            el.classList.toggle("nav-item--hidden", q !== "" && !label.includes(q));
        };
        const filterSection = (section: HTMLElement) => {
            let sibling = section.nextElementSibling;
            let hasVisible = false;
            while (sibling && !sibling.classList.contains("nav-section")) {
                if (sibling.classList.contains("nav-item") && !sibling.classList.contains("nav-item--hidden")) {
                    hasVisible = true;
                    break;
                }
                sibling = sibling.nextElementSibling;
            }
            section.style.display = (!q || hasVisible) ? "" : "none";
        };
        this.root.querySelectorAll<HTMLElement>(".nav-item").forEach(filterItem);
        this.root.querySelectorAll<HTMLElement>(".nav-section").forEach(filterSection);
        this.querySelectorAll<HTMLElement>(".nav-item").forEach(filterItem);
        this.querySelectorAll<HTMLElement>(".nav-section").forEach(filterSection);
    }
    private _wireTooltips(): void {
        this.addEventListener("mouseover", (e: Event) => {
            if (!this._collapsed)
                return;
            const target = (e.composedPath()[0] as Element)?.closest<HTMLElement>(".nav-item");
            const tooltip = this.root.querySelector("#sidebar-item-tooltip") as any;
            if (!target) {
                tooltip?.hide();
                return;
            }
            const label = target.getAttribute("data-tooltip") ?? "";
            if (label)
                tooltip?.showAt(target, label, "right");
        });
        this.addEventListener("mouseleave", () => {
            (this.root.querySelector("#sidebar-item-tooltip") as any)?.hide();
        });
    }
    private _wirePage(): void {
        const mobileToggleSlot = document.getElementById("topbar-mobile-toggle");
        if (mobileToggleSlot && this._mobileToggleBtn) {
            mobileToggleSlot.appendChild(this._mobileToggleBtn);
        }
        const brandLink = document.querySelector<HTMLAnchorElement>(".topbar-brand");
        if (brandLink) {
            this._brandClickListener = (e: Event) => {
                e.preventDefault();
                router.navigate("/");
            };
            brandLink.addEventListener("click", this._brandClickListener);
        }
        this._navItemClickListener = (e: Event) => {
            const { key } = (e as CustomEvent<{
                key: string;
            }>).detail;
            if (key === "home") {
                router.navigate("/");
                return;
            }
            if (key === "layout-login") {
                router.navigate("/examples/layouts/login");
                return;
            }
            if (key === "layout-register") {
                router.navigate("/examples/layouts/register");
                return;
            }
            if (key === "layout-dashboard") {
                router.navigate("/examples/layouts/dashboard");
                return;
            }
            if (key === "layout-admin-panel" || key === "layout-user-dashboard") {
                router.navigate("/examples/layouts/admin-panel");
                return;
            }
            if (key === "layout-verify") {
                router.navigate("/examples/layouts/verify");
                return;
            }
            if (key.startsWith("tab-")) {
                const route = TAB_ROUTE_MAP[key];
                if (route) {
                    router.navigate(route);
                }
            }
        };
        this.addEventListener("nav-item-click", this._navItemClickListener);
        this._routerListener = () => {
            const path = window.location.pathname;
            const activeKey = ROUTE_KEY_MAP[path];
            if (activeKey) {
                this.activeKey = activeKey;
            }
            else if (!router.match(path)) {
                this.activeKey = "";
            }
        };
        router.addListener(this._routerListener);
    }
    private _createOverlay(): void {
        this._overlay = document.createElement("div");
        this._overlay.className = "sidebar-overlay";
        this._overlay.setAttribute("aria-hidden", "true");
        this._overlay.addEventListener("click", () => this._setMobileOpen(false));
        document.body.appendChild(this._overlay);
    }
    private _createMobileToggle(): void {
        const btn = document.createElement("button");
        btn.className = "sidebar-mobile-toggle";
        btn.setAttribute("aria-label", "Open navigation");
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-controls", "sidebar-nav");
        btn.innerHTML = MENU_ICON;
        btn.style.cssText = [
            "display:none",
            "align-items:center",
            "justify-content:center",
            "width:40px",
            "height:40px",
            "padding:0",
            "border:1px solid var(--td-border)",
            "border-radius:8px",
            "background:var(--td-surface)",
            "color:var(--td-fg)",
            "cursor:pointer",
        ].join(";");
        const mq = window.matchMedia("(max-width: 767px)");
        const update = (m: MediaQueryList | MediaQueryListEvent) => {
            btn.style.display = m.matches ? "flex" : "none";
        };
        update(mq);
        mq.addEventListener("change", update);
        this._mq = mq;
        this._mqUpdate = update;
        btn.addEventListener("click", () => this._setMobileOpen(!this._mobileOpen));
        this._mobileToggleBtn = btn;
        (this as unknown as Record<string, unknown>).mobileToggleBtn = btn;
    }
    private _setMobileOpen(open: boolean): void {
        this._mobileOpen = open;
        const sidebar = this.root.querySelector<HTMLElement>(".sidebar");
        if (sidebar)
            sidebar.classList.toggle("mobile-open", open);
        if (this._overlay)
            this._overlay.classList.toggle("visible", open);
        if (this._mobileToggleBtn) {
            this._mobileToggleBtn.setAttribute("aria-expanded", String(open));
            this._mobileToggleBtn.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        }
        if (open) {
            const first = this.root.querySelector<HTMLElement>(".toggle-btn, .nav-item, .search-input");
            first?.focus();
        }
        this.dispatchEvent(new CustomEvent("sidebar-mobile-toggle", {
            bubbles: true,
            composed: true,
            detail: { open },
        }));
    }
}
customElements.define("td-sidebar", UISidebar);
