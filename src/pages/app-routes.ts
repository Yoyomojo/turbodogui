import { router, runPageScripts } from "../core/router";

function wrapTabHtml(html: string): string {
  return `<div class="container">${html}</div>`;
}

export type HtmlLoader = () => Promise<string>;

export interface LazyRouteDefinition {
  path: string;
  name: string;
  loadHtml: HtmlLoader;
}

export interface RouteRegistration extends LazyRouteDefinition {
  title: string;
  description: string;
  onMount?: () => void;
}

export const loadHomeHtml: HtmlLoader = () =>
  import("./home.html?raw").then((module) => module.default);

export const loadAccordionHtml: HtmlLoader = () =>
  import("./examples/tabs/tab-0-accordion.html?raw").then((module) => module.default);

export const loadTextInputHtml: HtmlLoader = () =>
  import("./examples/tabs/tab-8-text-input.html?raw").then((module) => module.default);

export const exampleTabRoutes: LazyRouteDefinition[] = [
  {
    path: "/examples/accordion",
    name: "Accordion",
    loadHtml: () => import("./examples/tabs/tab-0-accordion.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/alert",
    name: "Alert",
    loadHtml: () => import("./examples/tabs/tab-1-alert.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/api-fetching",
    name: "API Fetching",
    loadHtml: () => import("./examples/tabs/tab-2-api-fetching.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/breadcrumb",
    name: "Breadcrumb",
    loadHtml: () => import("./examples/tabs/tab-3-breadcrumb.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/carousel",
    name: "Carousel",
    loadHtml: () => import("./examples/tabs/tab-4-carousel.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/charts",
    name: "Charts",
    loadHtml: () => import("./examples/tabs/tab-5-charts.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/drawer",
    name: "Drawer",
    loadHtml: () => import("./examples/tabs/tab-6-drawer.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/grid",
    name: "Grid",
    loadHtml: () => import("./examples/tabs/tab-7-grid.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/text-input",
    name: "Text Input",
    loadHtml: () => import("./examples/tabs/tab-8-text-input.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/select",
    name: "Select",
    loadHtml: () => import("./examples/tabs/tab-8-select.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/multi-select",
    name: "Multi Select",
    loadHtml: () => import("./examples/tabs/tab-8-multi-select.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/button",
    name: "Button",
    loadHtml: () => import("./examples/tabs/tab-8-button.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/button-group",
    name: "Button Group",
    loadHtml: () => import("./examples/tabs/tab-8-button-group.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/checkbox",
    name: "Checkbox",
    loadHtml: () => import("./examples/tabs/tab-8-checkbox.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/slider",
    name: "Slider",
    loadHtml: () => import("./examples/tabs/tab-8-slider.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/file-input",
    name: "File Input",
    loadHtml: () => import("./examples/tabs/tab-8-file-input.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/links",
    name: "Links",
    loadHtml: () => import("./examples/tabs/tab-9-links.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/loader",
    name: "Loader",
    loadHtml: () => import("./examples/tabs/tab-10-loader.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/modal",
    name: "Modal",
    loadHtml: () => import("./examples/tabs/tab-11-modal.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/mosaic",
    name: "Mosaic",
    loadHtml: () => import("./examples/tabs/tab-12-mosaic.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/pagination",
    name: "Pagination",
    loadHtml: () => import("./examples/tabs/tab-13-pagination.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/sidebar",
    name: "Sidebar",
    loadHtml: () => import("./examples/tabs/tab-14-sidebar.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/table",
    name: "Table",
    loadHtml: () => import("./examples/tabs/tab-15-table.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/tabs",
    name: "Tabs",
    loadHtml: () => import("./examples/tabs/tab-16-tabs.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/tooltip",
    name: "Tooltip",
    loadHtml: () => import("./examples/tabs/tab-17-tooltip.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/utilities",
    name: "Utilities",
    loadHtml: () => import("./examples/tabs/tab-18-utilities.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/video-player",
    name: "Video Player",
    loadHtml: () => import("./examples/tabs/tab-19-video-player.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/textarea",
    name: "Textarea",
    loadHtml: () => import("./examples/tabs/tab-20-textarea.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/date-picker",
    name: "Date Picker",
    loadHtml: () => import("./examples/tabs/tab-21-date-picker.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/dropdown",
    name: "Dropdown",
    loadHtml: () => import("./examples/tabs/tab-22-dropdown.html?raw").then((module) => module.default),
  },
  {
    path: "/examples/progress-bar",
    name: "Progress Bar",
    loadHtml: () => import("./examples/tabs/tab-23-progress-bar.html?raw").then((module) => module.default),
  },
];

export const loginRoute: RouteRegistration = {
  path: "/examples/layouts/login",
  name: "Login",
  title: "Turbodog UI | Login",
  description: "Login page layout example",
  loadHtml: () => import("./examples/layouts/login/login.html?raw").then((module) => module.default),
  onMount: () => {
    void import("./examples/layouts/login/login").then((module) => module.initLoginPage());
  },
};

export const registerRoute: RouteRegistration = {
  path: "/examples/layouts/register",
  name: "Register",
  title: "Turbodog UI | Register",
  description: "Registration page layout example",
  loadHtml: () => import("./examples/layouts/register/register.html?raw").then((module) => module.default),
  onMount: () => {
    void import("./examples/layouts/register/register").then((module) => module.initRegisterPage());
  },
};

export const dashboardRoute: RouteRegistration = {
  path: "/examples/layouts/dashboard",
  name: "Dashboard",
  title: "Turbodog UI | Dashboard",
  description: "Dashboard layout example with charts and table",
  loadHtml: () => import("./examples/layouts/dashboard/dashboard.html?raw").then((module) => module.default),
  onMount: () => {
    void import("./examples/layouts/dashboard/dashboard").then((module) => module.initDashboardPage());
  },
};

export const adminPanelRoute: RouteRegistration = {
  path: "/examples/layouts/admin-panel",
  name: "Admin Panel",
  title: "Turbodog UI | Admin Panel",
  description: "Static admin panel example using Turbodog UI components",
  loadHtml: () => import("./examples/layouts/user-dashboard/user-dashboard.html?raw").then((module) => module.default),
};

export const verifyRoute: RouteRegistration = {
  path: "/examples/layouts/verify",
  name: "Verification Code",
  title: "Turbodog UI | Verification Code",
  description: "Verification code input layout example",
  loadHtml: () => import("./examples/layouts/verify/verify.html?raw").then((module) => module.default),
  onMount: () => {
    void import("./examples/layouts/verify/verify").then((module) => module.initVerifyPage());
  },
};

export function initializeAppRoutes(contentEl: HTMLElement): void {
  let routeRenderToken = 0;
  router.addListener(async () => {
    const token = ++routeRenderToken;
    contentEl.innerHTML = `
      <div class="container" style="padding-block: 2rem;">
        <td-loader variant="dots" message="Loading page..."></td-loader>
      </div>
    `;
    try {
      const html = await router.resolve();
      if (token !== routeRenderToken)
        return;
      contentEl.innerHTML = html;
      runPageScripts(contentEl);
      router.runOnMount();
    }
    catch (error) {
      if (token !== routeRenderToken)
        return;
      contentEl.innerHTML = `
        <div class="container">
          <td-card>
            <h2>Route Load Error</h2>
            <p>Failed to load this page. Please try again.</p>
          </td-card>
        </div>
      `;
      console.error(error);
    }
  });

  router.register("/", async () => loadHomeHtml(), {
    title: "Turbodog UI | Home",
    description: "A lightweight Web Component library with router, theme system, and responsive grid",
  });

  router.register("/examples", async () => wrapTabHtml(await loadAccordionHtml()), {
    title: "Turbodog UI | Accordion",
    description: "Accordion component example",
  });

  for (const tab of exampleTabRoutes) {
    router.register(tab.path, async () => wrapTabHtml(await tab.loadHtml()), {
      title: `Turbodog UI | ${tab.name}`,
      description: `${tab.name} component example`,
    });
  }

  // Legacy route kept for backward compatibility.
  router.register("/examples/inputs-buttons", async () => wrapTabHtml(await loadTextInputHtml()), {
    title: "Turbodog UI | Text Input",
    description: "Text input component example",
  });

  // Backward-compatible aliases for older plural paths.
  router.register("/examples/text-inputs", async () => wrapTabHtml(await loadTextInputHtml()), {
    title: "Turbodog UI | Text Input",
    description: "Text input component example",
  });

  router.register("/examples/selects", async () => wrapTabHtml(await import("./examples/tabs/tab-8-select.html?raw").then((module) => module.default)), {
    title: "Turbodog UI | Select",
    description: "Select component example",
  });

  router.register("/examples/multi-selects", async () => wrapTabHtml(await import("./examples/tabs/tab-8-multi-select.html?raw").then((module) => module.default)), {
    title: "Turbodog UI | Multi Select",
    description: "Multi Select component example",
  });

  router.register("/examples/buttons", async () => wrapTabHtml(await import("./examples/tabs/tab-8-button.html?raw").then((module) => module.default)), {
    title: "Turbodog UI | Button",
    description: "Button component example",
  });

  router.register("/examples/checkboxes", async () => wrapTabHtml(await import("./examples/tabs/tab-8-checkbox.html?raw").then((module) => module.default)), {
    title: "Turbodog UI | Checkbox",
    description: "Checkbox component example",
  });

  router.register("/examples/sliders", async () => wrapTabHtml(await import("./examples/tabs/tab-8-slider.html?raw").then((module) => module.default)), {
    title: "Turbodog UI | Slider",
    description: "Slider component example",
  });

  router.register("/examples/file-inputs", async () => wrapTabHtml(await import("./examples/tabs/tab-8-file-input.html?raw").then((module) => module.default)), {
    title: "Turbodog UI | File Input",
    description: "File input component example",
  });

  router.register("/examples/textareas", async () => wrapTabHtml(await import("./examples/tabs/tab-20-textarea.html?raw").then((module) => module.default)), {
    title: "Turbodog UI | Textarea",
    description: "Textarea component example",
  });

  router.register(loginRoute.path, async () => loginRoute.loadHtml(), {
    title: loginRoute.title,
    description: loginRoute.description,
    onMount: loginRoute.onMount,
  });

  router.register(registerRoute.path, async () => registerRoute.loadHtml(), {
    title: registerRoute.title,
    description: registerRoute.description,
    onMount: registerRoute.onMount,
  });

  router.register(dashboardRoute.path, async () => dashboardRoute.loadHtml(), {
    title: dashboardRoute.title,
    description: dashboardRoute.description,
    onMount: dashboardRoute.onMount,
  });

  router.register(adminPanelRoute.path, async () => adminPanelRoute.loadHtml(), {
    title: adminPanelRoute.title,
    description: adminPanelRoute.description,
    onMount: adminPanelRoute.onMount,
  });

  router.register(verifyRoute.path, async () => verifyRoute.loadHtml(), {
    title: verifyRoute.title,
    description: verifyRoute.description,
    onMount: verifyRoute.onMount,
  });

  // Backward-compatible alias for the old user dashboard path.
  router.register("/examples/layouts/user-dashboard", async () => adminPanelRoute.loadHtml(), {
    title: adminPanelRoute.title,
    description: adminPanelRoute.description,
    onMount: adminPanelRoute.onMount,
  });

  router.start();
}