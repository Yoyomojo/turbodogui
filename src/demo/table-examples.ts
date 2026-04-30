import { router } from "../core/router";
import type { UITable } from "../components/table/ui-table";

export function initializeTableExamples(): void {
  setupTableExamples();

  router.subscribe(() => {
    setTimeout(() => {
      setupTableExamples();
    }, 50);
  });
}

function setupTableExamples(): void {
  const fetchBtn = document.getElementById("table-fetch-btn");
  const table = document.getElementById("table-dynamic") as UITable | null;
  const statusEl = document.getElementById("table-fetch-status");

  if (!fetchBtn || !table) return;
  const newBtn = fetchBtn.cloneNode(true) as HTMLElement;
  fetchBtn.replaceWith(newBtn);

  newBtn.addEventListener("click", async () => {
    newBtn.setAttribute("disabled", "");
    if (statusEl) {
      statusEl.textContent = "Fetching…";
      statusEl.style.display = "block";
    }

    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/users");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const users = await res.json();

      table.columns = [
        { key: "id",      label: "ID" },
        { key: "name",    label: "Name",    sortable: true },
        { key: "email",   label: "Email",   sortable: true },
        { key: "phone",   label: "Phone" },
        { key: "company", label: "Company", sortable: true },
      ];

      table.data = users.map((u: any) => ({
        id:      u.id,
        name:    u.name,
        email:   u.email,
        phone:   u.phone,
        company: u.company.name,
      }));

      if (statusEl) statusEl.style.display = "none";
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = `Error fetching data: ${(err as Error).message}`;
      }
      newBtn.removeAttribute("disabled");
    }
  });
}
