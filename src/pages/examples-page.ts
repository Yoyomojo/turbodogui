import { http } from "../core/http";
import { getBarChartData } from "../api/example-bar-chart-data";
import { getPieChartData } from "../api/example-pie-chart-data";
import { getLineChartData } from "../api/example-line-chart-data";
import { getDonutChartData } from "../api/example-donut-chart-data";
import type { UITable } from "../components/table/ui-table";
import type { TableColumn } from "../components/table/ui-table";
import type { UIBarChart } from "../components/charts/bar-chart/ui-bar-chart";
import type { UIPieChart } from "../components/charts/pie-chart/ui-pie-chart";
import type { UILineChart } from "../components/charts/line-chart/ui-line-chart";
import type { UIDonutChart } from "../components/charts/donut-chart/ui-donut-chart";
import type { UIMultiSelect } from "../components/multi-select/ui-multi-select";

export function setupExamplesPage(): void {
  setupTableExamples();
  setupStickyTableExample();
  setupNestedHeaderTableExample();
  setupLoaderButtons();
  setupModalHandlers();
  setupChartExamples();
  setupEditableTableExample();
  setupApiFetchExample();
  setupMultiSelectApiExample();
  setupCarouselModalExample();
}

function setupTableExamples(): void {
  const fetchBtn = document.getElementById("table-fetch-btn");
  const table = document.getElementById("table-dynamic") as UITable | null;
  const statusEl = document.getElementById("table-fetch-status");
  if (!fetchBtn || !table) return;

  fetchBtn.addEventListener("click", async () => {
    fetchBtn.setAttribute("disabled", "");
    if (statusEl) {
      statusEl.textContent = "Fetching…";
      statusEl.style.display = "block";
    }

    try {
      const users = await fetch("https://jsonplaceholder.typicode.com/users").then((r) => r.json()) as any[];

      table.columns = [
        { key: "id",      label: "ID" },
        { key: "name",    label: "Name",    sortable: true },
        { key: "email",   label: "Email",   sortable: true },
        { key: "phone",   label: "Phone" },
        { key: "company", label: "Company", sortable: true },
      ];

      table.data = users.map((u) => ({
        id:      u.id,
        name:    u.name,
        email:   u.email,
        phone:   u.phone,
        company: u.company.name,
      }));

      if (statusEl) statusEl.style.display = "none";
    } catch (err) {
      if (statusEl) statusEl.textContent = `Error fetching data: ${(err as Error).message}`;
      fetchBtn.removeAttribute("disabled");
    }
  });
}

function setupStickyTableExample(): void {
  const fetchBtn = document.getElementById("table-sticky-fetch-btn");
  const table = document.getElementById("table-sticky") as UITable | null;
  const statusEl = document.getElementById("table-sticky-fetch-status");
  if (!fetchBtn || !table) return;

  fetchBtn.addEventListener("click", async () => {
    fetchBtn.setAttribute("disabled", "");
    if (statusEl) {
      statusEl.textContent = "Fetching…";
      statusEl.style.display = "block";
    }

    try {
      const users = await fetch("https://jsonplaceholder.typicode.com/users").then((r) => r.json()) as any[];

      table.columns = [
        { key: "id",      label: "ID" },
        { key: "name",    label: "Name",    sortable: true },
        { key: "email",   label: "Email",   sortable: true },
        { key: "phone",   label: "Phone" },
        { key: "company", label: "Company", sortable: true },
      ];

      table.data = users.map((u) => ({
        id:      u.id,
        name:    u.name,
        email:   u.email,
        phone:   u.phone,
        company: u.company.name,
      }));

      if (statusEl) statusEl.style.display = "none";
    } catch (err) {
      if (statusEl) statusEl.textContent = `Error: ${(err as Error).message}`;
      fetchBtn.removeAttribute("disabled");
    }
  });
}

function setupNestedHeaderTableExample(): void {
  const table = document.getElementById("table-nested") as UITable | null;
  if (!table) return;

  table.columns = [
    {
      key: "", label: "Employee",
      children: [
        { key: "name",       label: "Name",       sortable: true },
        { key: "department", label: "Department",  sortable: true },
      ],
    },
    {
      key: "", label: "Contact",
      children: [
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
      ],
    },
    {
      key: "", label: "Performance",
      children: [
        { key: "y2024", label: "2024", sortable: true },
        { key: "y2025", label: "2025", sortable: true },
      ],
    },
    { key: "status", label: "Status", sortable: true },
  ];

  table.data = [
    { name: "Alice Martin",  department: "Engineering",  email: "alice@example.com",  phone: "555-0101", y2024: 91, y2025: 94, status: "Active"   },
    { name: "Bob Chen",      department: "Design",       email: "bob@example.com",    phone: "555-0102", y2024: 78, y2025: 80, status: "Active"   },
    { name: "Carol White",   department: "Product",      email: "carol@example.com",  phone: "555-0103", y2024: 85, y2025: 87, status: "Active"   },
    { name: "David Kim",     department: "Engineering",  email: "david@example.com",  phone: "555-0104", y2024: 72, y2025: 79, status: "On Leave" },
    { name: "Eva Rossi",     department: "Marketing",    email: "eva@example.com",    phone: "555-0105", y2024: 88, y2025: 91, status: "Active"   },
    { name: "Frank Müller",  department: "Engineering",  email: "frank@example.com",  phone: "555-0106", y2024: 95, y2025: 96, status: "Active"   },
    { name: "Grace Lee",     department: "Design",       email: "grace@example.com",  phone: "555-0107", y2024: 80, y2025: 78, status: "Active"   },
    { name: "Henry Park",    department: "Product",      email: "henry@example.com",  phone: "555-0108", y2024: 70, y2025: 77, status: "Inactive" },
  ];
}

function setupLoaderButtons(): void {
  document.getElementById("loader-basic-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const loader = document.createElement("ui-loader");
    document.body.appendChild(loader);
    setTimeout(() => loader.remove(), 2000);
  });

  document.getElementById("loader-message-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const loader = document.createElement("ui-loader");
    loader.setAttribute("message", "Loading data...");
    document.body.appendChild(loader);
    setTimeout(() => loader.remove(), 2000);
  });

  document.getElementById("loader-dots-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const loader = document.createElement("ui-loader");
    loader.setAttribute("message", "Processing...");
    loader.setAttribute("variant", "dots");
    document.body.appendChild(loader);
    setTimeout(() => loader.remove(), 2000);
  });

  document.getElementById("loader-custom-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const loader = document.createElement("ui-loader");
    loader.setAttribute("message", "Custom loader");
    loader.setAttribute("size", "64px");
    loader.setAttribute("color", "#FF8C00");
    document.body.appendChild(loader);
    setTimeout(() => loader.remove(), 2000);
  });

  document.getElementById("loader-contained-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const container = document.getElementById("loader-container");
    if (container) {
      const loader = document.createElement("ui-loader");
      loader.setAttribute("contained", "");
      loader.setAttribute("message", "Loading content...");
      container.appendChild(loader);
      setTimeout(() => loader.remove(), 2000);
    }
  });
}

function setupModalHandlers(): void {
  document.querySelectorAll<HTMLElement>(".modal-trigger").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(btn);
    });
  });
}

function openModal(btn: HTMLElement): void {
  const type = btn.getAttribute("data-modal-type");
  const modal = document.createElement("ui-modal");
  const p = document.createElement("p");

  if (type === "basic") {
    modal.setAttribute("title", "Welcome");
    modal.setAttribute("close-on-escape", "");
    p.textContent = "This is a basic modal. Click the X button or press Escape to close.";
  } else if (type === "overlay-close") {
    modal.setAttribute("title", "Closeable Modal");
    modal.setAttribute("close-on-overlay", "");
    modal.setAttribute("close-on-escape", "");
    p.textContent = "Click anywhere outside the modal or press Escape to close it.";
  } else if (type === "opacity") {
    modal.setAttribute("title", "Darker Overlay");
    p.textContent = "This modal has custom styling.";
  } else if (type === "wide") {
    modal.setAttribute("title", "Wide Modal");
    modal.setAttribute("width", "90vw");
    p.textContent = "This modal is 90% of the viewport width.";
  }

  modal.appendChild(p);
  document.body.appendChild(modal);
}

function setupChartExamples(): void {
  const bar   = document.getElementById("bar-chart-demo")   as UIBarChart  | null;
  const barH  = document.getElementById("bar-chart-demo-h") as UIBarChart  | null;
  const pie   = document.getElementById("pie-chart-demo")   as UIPieChart  | null;
  const line  = document.getElementById("line-chart-demo")  as UILineChart | null;
  const donut = document.getElementById("donut-chart-demo") as UIDonutChart | null;

  if (bar || barH) {
    getBarChartData().then((data) => {
      if (bar)  bar.data  = data;
      if (barH) barH.data = data;
    });
  }

  if (pie) {
    getPieChartData().then((data) => { pie.data = data; });
  }

  if (line) {
    getLineChartData().then(({ labels, data }) => {
      line.setAttribute("x-labels", JSON.stringify(labels));
      line.data = data;
    });
  }

  if (donut) {
    getDonutChartData().then((data) => { donut.data = data; });
  }
}

function setupEditableTableExample(): void {
  const table  = document.getElementById("table-editable") as UITable | null;
  const status = document.getElementById("table-editable-status");
  if (!table) return;

  fetch("https://jsonplaceholder.typicode.com/users")
    .then((r) => r.json())
    .then((users: unknown) => {
    const userList = users as any[];

    table.columns = [
      {
        key: "name",
        label: "Name",
        render: (val: unknown) =>
          `<ui-text-input size="small" style="margin-bottom:0" value="${String(val ?? "").replace(/"/g, "&quot;")}" placeholder="Name"></ui-text-input>`,
      } as TableColumn,
      { key: "email",   label: "Email",   sortable: true },
      { key: "phone",   label: "Phone" },
      { key: "company", label: "Company", sortable: true },
    ];

    table.data = userList.map((u) => ({
      id:      u.id,
      name:    u.name,
      email:   u.email,
      phone:   u.phone,
      company: u.company.name,
    }));

    table.addEventListener("cell-change", (e: Event) => {
      const { rowIndex, colKey, value } = (e as CustomEvent<{ rowIndex: number; colKey: string; value: string }>).detail;
      if (status) {
        status.textContent = `Row ${rowIndex + 1} · ${colKey}: "${value}"`;
      }
    });
  });
}

function setupApiFetchExample(): void {
  const btn       = document.getElementById("api-fetch-users-btn");
  const statusEl  = document.getElementById("api-fetch-status");
  const errorEl   = document.getElementById("api-fetch-error");
  const container = document.getElementById("api-user-list-container");
  const list      = document.getElementById("api-user-list");
  if (!btn || !list || !container) return;

  btn.addEventListener("click", async () => {
    btn.setAttribute("disabled", "");
    if (statusEl) { statusEl.textContent = "Fetching users..."; statusEl.style.display = "block"; }
    if (errorEl)  { errorEl.style.display = "none"; }

    const loader = document.createElement("ui-loader");
    loader.setAttribute("message", "Fetching users...");
    document.body.appendChild(loader);

    try {
      const users = await fetch("https://jsonplaceholder.typicode.com/users").then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }) as Array<{ id: number; name: string; email: string; phone: string; website: string; username: string; company: { name: string; catchPhrase: string; bs: string }; address: { street: string; suite: string; city: string; zipcode: string } }>;

      list.innerHTML = "";
      users.forEach((user) => {
        const li = document.createElement("li");
        li.style.cssText = "padding:12px; border-bottom:1px solid var(--ui-border); cursor:pointer; transition:background 150ms ease;";
        li.innerHTML = `<strong style="display:block">${user.name}</strong><small style="color:var(--ui-fg-muted,#6f6f6f)">${user.email}</small>`;
        li.addEventListener("mouseenter", () => { li.style.background = "var(--ui-surface-hover, rgba(0,0,0,0.03))"; });
        li.addEventListener("mouseleave", () => { li.style.background = ""; });
        li.addEventListener("click", () => {
          const modal = document.createElement("ui-modal");
          modal.setAttribute("title", user.name);
          modal.setAttribute("close-on-overlay", "");
          modal.setAttribute("close-on-escape", "");
          const dl = document.createElement("dl");
          dl.style.cssText = "display:grid; grid-template-columns:max-content 1fr; gap:0.4rem 1.5rem; margin:0;";
          const fields: [string, string][] = [
            ["Email",    user.email],
            ["Phone",    user.phone],
            ["Username", user.username],
            ["Website",  user.website],
            ["Address",  `${user.address.street}, ${user.address.suite}, ${user.address.city} ${user.address.zipcode}`],
            ["Company",  user.company.name],
            ["Tagline",  user.company.catchPhrase],
          ];
          fields.forEach(([label, value]) => {
            const dt = document.createElement("dt");
            dt.style.cssText = "font-weight:600; color:var(--ui-fg-muted,#6f6f6f); font-size:0.8125rem; padding-top:0.15rem;";
            dt.textContent = label;
            const dd = document.createElement("dd");
            dd.style.margin = "0";
            dd.textContent = value;
            dl.append(dt, dd);
          });
          modal.appendChild(dl);
          document.body.appendChild(modal);
        });
        list.appendChild(li);
      });

      container.removeAttribute("hidden");
      if (statusEl) statusEl.style.display = "none";
    } catch (err) {
      if (errorEl) { errorEl.textContent = `Error loading users: ${(err as Error).message}`; errorEl.style.display = "block"; }
      if (statusEl) statusEl.style.display = "none";
      btn.removeAttribute("disabled");
    } finally {
      loader.remove();
    }
  });
}

function setupMultiSelectApiExample(): void {
  const ms     = document.getElementById("multi-select-api") as UIMultiSelect | null;
  const status = document.getElementById("multi-select-api-status");
  if (!ms) return;

  http<{ products: { category: string }[] }>(
    "https://dummyjson.com/products?limit=100&select=category"
  )
    .then((res) => {
      const categories = [...new Set(res.products.map((p) => p.category))].sort();
      ms.options = categories.map((c) => ({ value: c, label: c }));
      if (status) {
        status.textContent = `${categories.length} categories loaded from dummyjson.com`;
        status.style.display = "block";
      }
    })
    .catch(() => {
      if (status) {
        status.textContent = "Failed to load categories.";
        status.style.display = "block";
      }
    });

  ms.addEventListener("change", (e) => {
    const selected = (e as CustomEvent<{ value: string[] }>).detail.value;
    if (status) {
      status.textContent =
        selected.length > 0
          ? `Selected: ${selected.join(", ")}`
          : "No categories selected.";
      status.style.display = "block";
    }
  });
}

function setupCarouselModalExample(): void {
  const btn = document.getElementById("carousel-modal-trigger");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const modal = document.createElement("ui-modal");
    modal.setAttribute("title", "Photo Gallery");
    modal.setAttribute("close-on-escape", "");
    modal.setAttribute("close-on-overlay", "");
    modal.setAttribute("width", "700px");

    const carousel = document.createElement("ui-carousel");
    carousel.setAttribute("label", "Photo Gallery");

    const slides: { seed: string; alt: string; caption: string }[] = [
      { seed: "cityscape1", alt: "City at dusk",  caption: "City at Dusk — Neon reflections on wet pavement as the sun drops below the skyline." },
      { seed: "desert2",    alt: "Desert dunes",  caption: "Desert Dunes — Wind-sculpted sand stretches toward a burnt-orange horizon." },
      { seed: "winter3",    alt: "Snowy forest",  caption: "Winter Forest — Silence settles over the pines after the first heavy snowfall." },
    ];

    slides.forEach(({ seed, alt, caption }, i) => {
      const div = document.createElement("div");
      div.setAttribute("slot", `slide-${i}`);
      div.innerHTML = `
        <img src="https://picsum.photos/seed/${seed}/900/400" alt="${alt}" style="width:100%;height:300px;object-fit:cover;display:block;border-radius:var(--ui-radius,14px) var(--ui-radius,14px) 0 0;">
        <div style="padding:1rem 1.25rem;background:var(--ui-surface);border-radius:0 0 var(--ui-radius,14px) var(--ui-radius,14px);">
          <p style="margin:0;font-size:0.9375rem;color:var(--ui-muted,#6b7280);">${caption}</p>
        </div>
      `;
      carousel.appendChild(div);
    });

    modal.appendChild(carousel);
    document.body.appendChild(modal);
  });
}
