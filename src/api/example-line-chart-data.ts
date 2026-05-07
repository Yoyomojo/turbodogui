import { http } from "../core/http";

interface Product { category: string; price: number; stock: number; }
interface ProductsResponse { products: Product[]; }

export const getLineChartData = async (): Promise<{
  labels: string[];
  data: { label: string; values: number[] }[];
}> => {
  const res = await http<ProductsResponse>("https://dummyjson.com/products?limit=100&select=category,price,stock");
  const totals: Record<string, { priceSum: number; stockSum: number; count: number }> = {};
  for (const p of res.products) {
    if (!totals[p.category]) totals[p.category] = { priceSum: 0, stockSum: 0, count: 0 };
    totals[p.category].priceSum += p.price;
    totals[p.category].stockSum += p.stock;
    totals[p.category].count++;
  }
  const entries = Object.entries(totals);
  return {
    labels: entries.map(([label]) => label),
    data: [
      { label: "Avg Price ($)", values: entries.map(([, { priceSum, count }]) => Math.round(priceSum / count)) },
      { label: "Avg Stock",     values: entries.map(([, { stockSum, count }]) => Math.round(stockSum / count)) },
    ],
  };
};
