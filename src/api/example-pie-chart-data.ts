import { http } from './http';

export interface DummyProduct {
  id: number;
  title: string;
  price: number;
  stock: number;
  category: string;
}

export interface DummyProductsResponse {
  products: DummyProduct[];
}

export const getPieChartProducts = () => http<DummyProductsResponse>(
  'https://dummyjson.com/products?limit=100'
);
