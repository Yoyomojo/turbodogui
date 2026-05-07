import { http } from "../core/http";

interface Product { category: string; stock: number; }
interface ProductsResponse { products: Product[]; }

export const getPieChartData = async (): Promise<{ label: string; value: number }[]> => {
  const res = await http<ProductsResponse>("https://dummyjson.com/products?limit=100&select=category,stock");
  const totals: Record<string, number> = {};
  for (const p of res.products) {
    totals[p.category] = (totals[p.category] || 0) + p.stock;
  }
  return Object.entries(totals).map(([label, value]) => ({ label, value }));
};
