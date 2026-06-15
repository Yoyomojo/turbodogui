import { http } from "../core/http";
interface Product {
    category: string;
    price: number;
    stock: number;
    rating: number;
}
interface ProductsResponse {
    products: Product[];
}
export const getBubbleChartData = async (): Promise<{
    label: string;
    color?: string;
    points: {
        x: number;
        y: number;
        r: number;
        label: string;
    }[];
}[]> => {
    const res = await http<ProductsResponse>("https://dummyjson.com/products?limit=100&select=category,price,stock,rating");
    const groups: Record<string, {
        priceSum: number;
        stockSum: number;
        count: number;
    }> = {};
    for (const p of res.products) {
        if (!groups[p.category])
            groups[p.category] = { priceSum: 0, stockSum: 0, count: 0 };
        groups[p.category].priceSum += p.price;
        groups[p.category].stockSum += p.stock;
        groups[p.category].count++;
    }
    const entries = Object.entries(groups).sort(([, a], [, b]) => b.count - a.count);
    const mid = Math.ceil(entries.length / 2);
    const toPoints = (cats: typeof entries) => cats.map(([name, s]) => ({
        x: Math.round(s.priceSum / s.count),
        y: Math.round(s.stockSum / s.count),
        r: s.count,
        label: name,
    }));
    return [
        { label: "Higher-volume categories", color: "#4db6ac", points: toPoints(entries.slice(0, mid)) },
        { label: "Lower-volume categories", color: "#f06292", points: toPoints(entries.slice(mid)) },
    ];
};
