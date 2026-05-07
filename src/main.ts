import "./components/button/ui-button";
import "./components/carousel/ui-carousel";
import "./components/theme-toggle/ui-theme-toggle";
import "./components/card/ui-card";
import "./components/accordion/ui-accordion";
import "./components/loader/ui-loader";
import "./components/modal/ui-modal";
import "./components/tabs/ui-tabs";
import "./components/text-input/ui-text-input";
import "./components/select/ui-select";
import "./components/multi-select/ui-multi-select";
import "./components/table/ui-table";
import "./components/charts/pie-chart/ui-pie-chart";
import "./components/charts/donut-chart/ui-donut-chart";
import "./components/charts/bar-chart/ui-bar-chart";
import "./components/charts/line-chart/ui-line-chart";
import "./components/code/ui-code";
import { router } from "./core/router";
import "./components/link/ui-link";
import "./router/route-view";
import "./theme/base.css";
import { initializeTheme } from "./theme/theme";
import { initializeNavigation } from "./shared/nav/navigation";
import { setupExamplesPage } from "./pages/examples-page";
import navHtml from "./shared/nav/nav.html?raw";
import homeHtml from "./pages/home.html?raw";
import examplesHtml from "./pages/examples.html?raw";

initializeTheme();
initializeNavigation();

const app = document.getElementById("app");
if (app) {
  const render = () => {
    app.innerHTML = router.resolve();
  };
  router.addListener(render);
}

router.register("/", () => navHtml + homeHtml, {
  title: "Turbodog UI demo - Home",
  description: "A lightweight Web Component library with router, theme system, and responsive grid"
});

router.register("/examples", () => {
  requestAnimationFrame(() => setupExamplesPage());
  return navHtml + examplesHtml;
}, {
  title: "Turbodog UI demo - Examples",
  description: "Interactive examples of text inputs and select components"
});

router.start();
