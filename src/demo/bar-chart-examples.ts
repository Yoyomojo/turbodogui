import { router } from "../core/router";
import { getBarChartProducts } from "../api/example-bar-chart-data";

export function initializeBarChartExamples(): void {
  setupBarChart();

  router.subscribe(() => {
    setTimeout(() => {
      setupBarChart();
    }, 50);
  });
}

function setupBarChart(): void {
  const bar = document.getElementById("bar-demo");
  const barH = document.getElementById("bar-demo-h");
  if (!bar && !barH) return;

  getBarChartProducts().then((res) => {
    const totals = res.products.reduce<
      Record<string, { sum: number; count: number }>
    >((acc, p) => {
      if (!acc[p.category]) acc[p.category] = { sum: 0, count: 0 };
      acc[p.category].sum += p.price;
      acc[p.category].count += 1;
      return acc;
    }, {});

    const data = Object.entries(totals).map(([category, { sum, count }]) => ({
      label: category,
      value: Math.round(sum / count),
    }));

    const elV = document.getElementById("bar-demo");
    if (elV) elV.setAttribute("data", JSON.stringify(data));

    const elH = document.getElementById("bar-demo-h");
    if (elH) elH.setAttribute("data", JSON.stringify(data));
  });
}
