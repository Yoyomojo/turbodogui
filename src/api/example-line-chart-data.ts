import { http } from './http';

export interface LineChartProduct {
  price: number;
  stock: number;
  category: string;
}

export interface LineChartProductsResponse {
  products: LineChartProduct[];
}

export interface LineChartSeries {
  label: string;
  values: number[];
}

export interface LineChartData {
  categories: string[];
  series: LineChartSeries[];
}

export const getLineChartProducts = () =>
  http<LineChartProductsResponse>(
    'https://dummyjson.com/products?limit=100&select=category,price,stock'
  );

export function buildLineChartData(res: LineChartProductsResponse): LineChartData {
  const buckets = res.products.reduce<
    Record<string, { priceSum: number; stockSum: number; count: number }>
  >((acc, p) => {
    if (!acc[p.category]) acc[p.category] = { priceSum: 0, stockSum: 0, count: 0 };
    acc[p.category].priceSum += p.price;
    acc[p.category].stockSum += p.stock;
    acc[p.category].count += 1;
    return acc;
  }, {});

  const categories = Object.keys(buckets);
  return {
    categories,
    series: [
      { label: 'Avg Price ($)', values: categories.map((c) => Math.round(buckets[c].priceSum / buckets[c].count)) },
      { label: 'Avg Stock', values: categories.map((c) => Math.round(buckets[c].stockSum / buckets[c].count)) },
    ],
  };
}
