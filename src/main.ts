import "./index";
import "./theme/base.css";
import { initializeTheme } from "./theme/theme";
import { initializeAppRoutes } from "./pages/app-routes";
import shellHtml from "./shared/app-shell.html?raw";
initializeTheme();
const app = document.getElementById("app");
if (!app)
  throw new Error("#app element not found");
app.innerHTML = shellHtml;
const contentEl = document.getElementById("app-content");
if (!(contentEl instanceof HTMLElement))
  throw new Error("#app-content element not found");

initializeAppRoutes(contentEl);
