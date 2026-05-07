import { http } from "../core/http";

interface Product { category: string; price: number; }
interface ProductsResponse { products: Product[]; }

export const getBarChartData = async (): Promise<{ label: string; value: number }[]> => {
  const res = await http<ProductsResponse>("https://dummyjson.com/products?limit=100&select=category,price");
  const totals: Record<string, { sum: number; count: number }> = {};
  for (const p of res.products) {
    if (!totals[p.category]) totals[p.category] = { sum: 0, count: 0 };
    totals[p.category].sum += p.price;
    totals[p.category].count++;
  }
  return Object.entries(totals).map(([label, { sum, count }]) => ({
    label,
    value: Math.round(sum / count),
  }));
};
