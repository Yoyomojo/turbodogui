type ChartEl = HTMLElement & Record<string, unknown>;
type TableEl = HTMLElement & {
    columns: unknown[];
    data: unknown[];
};
type LoaderEl = HTMLElement & {
    show?: () => void;
};
import { getBubbleChartData } from "../../../../api/example-bubble-chart-data";
type Product = {
    id: number;
    title: string;
    brand: string;
    category: string;
    price: number;
    stock: number;
    rating: number;
};
function setStatVal(id: string, value: string): void {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
        el.style.opacity = "1";
    }
}
function showContainedLoader(containerId: string, message = "Loading..."): () => void {
    const container = document.getElementById(containerId) as HTMLElement | null;
    if (!container)
        return () => { };
    if (!container.style.position) {
        container.style.position = "relative";
    }
    const loader = document.createElement("td-loader") as LoaderEl;
    loader.setAttribute("contained", "");
    loader.setAttribute("message", message);
    container.appendChild(loader);
    loader.show?.();
    return () => loader.remove();
}
export function initDashboardPage(): void {
    const hideBubbleLoader = showContainedLoader("dash-card-bubble", "Loading bubble data...");
    getBubbleChartData()
        .then((series) => {
        const bubbleChart = document.getElementById("dash-bubble-chart") as ChartEl | null;
        if (bubbleChart) {
            (bubbleChart as unknown as {
                data: unknown[];
            }).data = series;
        }
    })
        .catch((err) => console.error("Dashboard: failed to load bubble chart data", err))
        .finally(() => {
        hideBubbleLoader();
    });
    const hideProductLoaders = [
        "dash-card-stat-products",
        "dash-card-stat-price",
        "dash-card-stat-stock",
        "dash-card-stat-categories",
        "dash-card-line",
        "dash-card-donut",
        "dash-card-bar",
        "dash-card-pie",
        "dash-card-products",
    ].map((id) => showContainedLoader(id, "Loading product analytics..."));
    const hideOrdersLoader = showContainedLoader("dash-card-orders", "Loading recent orders...");
    fetch("https://dummyjson.com/products?limit=100&select=id,title,brand,category,price,stock,rating")
        .then((r) => r.json())
        .then((res) => {
        const products: Product[] = res.products;
        const totalProducts = products.length;
        const avgPrice = products.reduce((s, p) => s + p.price, 0) / products.length;
        const totalStock = products.reduce((s, p) => s + p.stock, 0);
        const categorySet = new Set(products.map((p) => p.category));
        setStatVal("dash-stat-products", totalProducts.toLocaleString());
        setStatVal("dash-stat-price", "$" + avgPrice.toFixed(2));
        setStatVal("dash-stat-stock", totalStock.toLocaleString());
        setStatVal("dash-stat-categories", categorySet.size.toString());
        const totals: Record<string, {
            priceSum: number;
            stockSum: number;
            count: number;
        }> = {};
        for (const p of products) {
            if (!totals[p.category])
                totals[p.category] = { priceSum: 0, stockSum: 0, count: 0 };
            totals[p.category].priceSum += p.price;
            totals[p.category].stockSum += p.stock;
            totals[p.category].count++;
        }
        const entries = Object.entries(totals);
        const barChart = document.getElementById("dash-bar-chart") as ChartEl | null;
        if (barChart) {
            (barChart as unknown as {
                data: unknown[];
            }).data = entries.map(([label, d]) => ({
                label,
                value: Math.round(d.priceSum / d.count),
            }));
        }
        const donutChart = document.getElementById("dash-donut-chart") as ChartEl | null;
        if (donutChart) {
            (donutChart as unknown as {
                data: unknown[];
            }).data = entries.map(([label, d]) => ({
                label,
                value: d.stockSum,
            }));
        }
        const lineChart = document.getElementById("dash-line-chart") as ChartEl | null;
        if (lineChart) {
            lineChart.setAttribute("x-labels", JSON.stringify(entries.map(([label]) => label)));
            (lineChart as unknown as {
                data: unknown[];
            }).data = [
                { label: "Avg Price ($)", values: entries.map(([, d]) => Math.round(d.priceSum / d.count)) },
                { label: "Avg Stock", values: entries.map(([, d]) => Math.round(d.stockSum / d.count)) },
            ];
        }
        const pieChart = document.getElementById("dash-pie-chart") as ChartEl | null;
        if (pieChart) {
            (pieChart as unknown as {
                data: unknown[];
            }).data = entries.map(([label, d]) => ({
                label,
                value: d.count,
            }));
        }
        const productsTable = document.getElementById("dash-products-table") as TableEl | null;
        if (productsTable) {
            productsTable.columns = [
                { key: "id", label: "ID", sortable: true },
                { key: "title", label: "Product", sortable: true },
                { key: "brand", label: "Brand", sortable: true },
                { key: "category", label: "Category", sortable: true },
                { key: "price", label: "Price ($)", sortable: true },
                { key: "stock", label: "Stock", sortable: true },
                { key: "rating", label: "Rating", sortable: true },
            ];
            productsTable.data = products
                .slice()
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 50)
                .map((p) => ({
                id: p.id,
                title: p.title,
                brand: p.brand,
                category: p.category,
                price: parseFloat(p.price.toFixed(2)),
                stock: p.stock,
                rating: parseFloat(p.rating.toFixed(1)),
            }));
        }
    })
        .catch((err) => console.error("Dashboard: failed to load products", err))
        .finally(() => {
        hideProductLoaders.forEach((hide) => hide());
    });
    fetch("https://dummyjson.com/carts?limit=15")
        .then((r) => r.json())
        .then((res) => {
        const table = document.getElementById("dash-orders-table") as TableEl | null;
        if (!table)
            return;
        const labelToCls: Record<string, string> = {
            Delivered: "badge--success-subtle",
            Shipped: "badge--primary-subtle",
            Processing: "badge--warning-subtle",
            Cancelled: "badge--alert-subtle",
        };
        const statusByMod: Record<number, string> = {
            0: "Delivered",
            1: "Shipped",
            2: "Processing",
            3: "Cancelled",
        };
        table.columns = [
            { key: "order", label: "Order" },
            { key: "customer", label: "Customer" },
            { key: "products", label: "Products" },
            { key: "qty", label: "Qty" },
            { key: "total", label: "Total", sortable: true },
            {
                key: "status",
                label: "Status",
                sortable: true,
                render: (v: unknown) => {
                    const label = String(v);
                    return `<span class="badge ${labelToCls[label] ?? ""}">${label}</span>`;
                },
            },
        ];
        table.data = res.carts.map((c: {
            id: number;
            userId: number;
            totalProducts: number;
            totalQuantity: number;
            discountedTotal: number;
        }) => ({
            order: `#${String(c.id).padStart(4, "0")}`,
            customer: `Customer ${c.userId}`,
            products: c.totalProducts,
            qty: c.totalQuantity,
            total: parseFloat(c.discountedTotal.toFixed(2)),
            status: statusByMod[c.id % 4],
        }));
    })
        .catch((err) => console.error("Dashboard: failed to load orders", err))
        .finally(() => {
        hideOrdersLoader();
    });
}
