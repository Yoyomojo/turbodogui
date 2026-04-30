import { http } from './http';

export const getBarChartCategories = () => http<string[]>(
  'https://dummyjson.com/products/categories'
);

export interface BarChartProduct {
  category: string;
  price: number;
}

export interface BarChartProductsResponse {
  products: BarChartProduct[];
}

export const getBarChartProducts = () => http<BarChartProductsResponse>(
  'https://dummyjson.com/products?limit=100&select=category,price'
);
