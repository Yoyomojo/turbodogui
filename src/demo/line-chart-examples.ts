import { router } from "../core/router";
import { getLineChartProducts, buildLineChartData } from "../api/example-line-chart-data";

export function initializeLineChartExamples(): void {
  setupLineChart();

  router.subscribe(() => {
    setTimeout(() => {
      setupLineChart();
    }, 50);
  });
}

function setupLineChart(): void {
  const el = document.getElementById("line-demo");
  if (!el) return;

  getLineChartProducts().then((res) => {
    const { categories, series } = buildLineChartData(res);
    el.setAttribute("x-labels", JSON.stringify(categories));
    el.setAttribute("data", JSON.stringify(series));
  });
}
