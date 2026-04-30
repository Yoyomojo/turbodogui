import { router } from "../core/router";
import { getPieChartProducts } from "../api/example-pie-chart-data";

export function initializePieChartExamples(): void {
  setupPieChart();

  router.subscribe(() => {
    setTimeout(() => {
      setupPieChart();
    }, 50);
  });
}

function setupPieChart(): void {
  const pie = document.getElementById("pie-demo");
  if (!pie) return;

  getPieChartProducts().then((res) => {
    const data = Object.values(
      res.products.reduce<Record<string, { label: string; value: number }>>(
        (acc, p) => {
          if (!acc[p.category])
            acc[p.category] = { label: p.category, value: 0 };
          acc[p.category].value += p.stock;
          return acc;
        },
        {}
      )
    );
    const el = document.getElementById("pie-demo");
    if (el) el.setAttribute("data", JSON.stringify(data));
  });
}
