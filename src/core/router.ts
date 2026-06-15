export type RouteParams = Record<string, string>;
export type RouteHandler = (params: RouteParams) => string | Promise<string>;
export interface RouteMatch {
    route: Route;
    params: RouteParams;
}
export interface RouteOptions {
    title?: string;
    description?: string;
    onMount?: () => void;
}
export interface Route {
    path: string;
    render: RouteHandler;
    options?: RouteOptions;
}
export class Router {
    private routes: Route[] = [];
    private listeners = new Set<() => void>();
    private pendingOnMount: (() => void) | undefined;
    register(path: string, render: RouteHandler, options?: RouteOptions): void {
        this.routes.push({ path, render, options });
    }
    navigate(path: string): void {
        if (window.location.pathname === path)
            return;
        history.pushState({}, "", path);
        this.notify();
    }
    start(): void {
        window.addEventListener("popstate", this.handlePopState);
        this.notify();
    }
    stop(): void {
        window.removeEventListener("popstate", this.handlePopState);
    }
    addListener(listener: () => void): void {
        this.listeners.add(listener);
    }
    removeListener(listener: () => void): void {
        this.listeners.delete(listener);
    }
    private updateMetadata(route: Route): void {
        if (route.options?.title) {
            document.title = route.options.title;
        }
        if (route.options?.description) {
            let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = route.options.description;
        }
    }
    async resolve(pathname: string = window.location.pathname): Promise<string> {
        const match = this.match(pathname);
        if (!match) {
            this.updateMetadata({
                path: '',
                render: () => '',
                options: { title: '404 - turbodogui demo', description: 'Page not found' }
            });
            return `
        <td-card>
          <h2>404</h2>
          <p>Route not found: <code>${pathname}</code></p>
        </td-card>
      `;
        }
        this.updateMetadata(match.route);
        this.pendingOnMount = match.route.options?.onMount;
        return await match.route.render(match.params);
    }
    runOnMount(): void {
        this.pendingOnMount?.();
        this.pendingOnMount = undefined;
    }
    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    match(pathname: string): RouteMatch | null {
        const currentParts = this.clean(pathname).split("/").filter(Boolean);
        for (const route of this.routes) {
            const routeParts = this.clean(route.path).split("/").filter(Boolean);
            if (routeParts.length !== currentParts.length)
                continue;
            const params: RouteParams = {};
            let matched = true;
            for (let i = 0; i < routeParts.length; i += 1) {
                const routePart = routeParts[i];
                const currentPart = currentParts[i];
                if (routePart.startsWith(":")) {
                    params[routePart.slice(1)] = decodeURIComponent(currentPart);
                    continue;
                }
                if (routePart !== currentPart) {
                    matched = false;
                    break;
                }
            }
            if (matched) {
                return { route, params };
            }
        }
        return null;
    }
    private clean(pathname: string): string {
        return pathname.replace(/\/+$/, "") || "/";
    }
    private notify = (): void => {
        for (const listener of this.listeners) {
            listener();
        }
    };
    private handlePopState = (): void => {
        this.notify();
    };
}
export const router = new Router();
export function runPageScripts(container: HTMLElement): void {
    container.querySelectorAll<HTMLScriptElement>("script").forEach((old) => {
        const script = document.createElement("script");
        Array.from(old.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
        script.textContent = old.textContent;
        old.replaceWith(script);
    });
}
