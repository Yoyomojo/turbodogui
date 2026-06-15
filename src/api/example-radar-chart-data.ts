import { http } from '../core/http';

interface Product {
    category: string;
    price: number;
    stock: number;
    rating: number;
    discountPercentage: number;
}

interface ProductsResponse {
    products: Product[];
}

export const getRadarChartData = async (): Promise<{
    labels: string[];
    data: {
        label: string;
        values: number[];
    }[];
}> => {
    const res = await http<ProductsResponse>(
        'https://dummyjson.com/products?limit=100&select=category,price,stock,rating,discountPercentage'
    );

    const groups: Record<string, { priceSum: number; stockSum: number; ratingSum: number; discountSum: number; count: number }> = {};

    for (const p of res.products) {
        if (!groups[p.category]) {
            groups[p.category] = { priceSum: 0, stockSum: 0, ratingSum: 0, discountSum: 0, count: 0 };
        }

        groups[p.category].priceSum += p.price;
        groups[p.category].stockSum += p.stock;
        groups[p.category].ratingSum += p.rating;
        groups[p.category].discountSum += p.discountPercentage;
        groups[p.category].count += 1;
    }

    const entries = Object.entries(groups).sort(([, a], [, b]) => b.count - a.count).slice(0, 8);

    const averages = entries.map(([, s]) => ({
        price: s.priceSum / s.count,
        stock: s.stockSum / s.count,
        rating: s.ratingSum / s.count,
        discount: s.discountSum / s.count,
    }));

    const priceValues = averages.map((item) => item.price);
    const stockValues = averages.map((item) => item.stock);
    const ratingValues = averages.map((item) => item.rating);
    const discountValues = averages.map((item) => item.discount);

    const scaleToHundred = (values: number[], invert = false) => {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        return values.map((value) => {
            const score = ((value - min) / range) * 100;
            return Math.round(invert ? 100 - score : score);
        });
    };

    return {
        labels: entries.map(([category]) => category),
        data: [
            {
                label: 'Affordability',
                values: scaleToHundred(priceValues, true),
            },
            {
                label: 'Availability',
                values: scaleToHundred(stockValues),
            },
            {
                label: 'Customer Rating',
                values: scaleToHundred(ratingValues.map((value) => value * 20)),
            },
            {
                label: 'Discount Appeal',
                values: scaleToHundred(discountValues),
            },
        ],
    };
};
