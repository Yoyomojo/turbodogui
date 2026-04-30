import { UIComponent } from "../../core/component";
import styles from "./ui-table.css?raw";

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

type RowData = Record<string, unknown>;
type SortDir = "asc" | "desc" | null;

export class UITable extends UIComponent {
  private _columns: TableColumn[] = [];
  private _data: RowData[] = [];
  private _sortKey: string | null = null;
  private _sortDir: SortDir = null;
  private _searchQuery: string = "";

  static get observedAttributes(): string[] {
    return ["columns", "data", "csv-export", "csv-filename", "zebra", "search"];
  }

  attributeChangedCallback(): void {
    this.render();
  }

  get columns(): TableColumn[] {
    return this._columns;
  }

  set columns(value: TableColumn[]) {
    this._columns = value;
    this.render();
  }

  get data(): RowData[] {
    return this._data;
  }

  set data(value: RowData[]) {
    this._data = value;
    this.render();
  }

  private parseColumns(): TableColumn[] {
    if (this._columns.length > 0) return this._columns;
    try {
      const attr = this.getAttribute("columns");
      return attr ? JSON.parse(attr) : [];
    } catch {
      return [];
    }
  }

  private parseData(): RowData[] {
    if (this._data.length > 0) return this._data;
    try {
      const attr = this.getAttribute("data");
      return attr ? JSON.parse(attr) : [];
    } catch {
      return [];
    }
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  private getFilteredData(data: RowData[]): RowData[] {
    const q = this._searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(q)
      )
    );
  }

  private getSortedData(data: RowData[]): RowData[] {
    if (!this._sortKey || !this._sortDir) return data;
    const key = this._sortKey;
    const dir = this._sortDir;
    return [...data].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return dir === "asc" ? cmp : -cmp;
    });
  }

  protected render(): void {
    const columns = this.parseColumns();
    const rawData = this.parseData();
    const data = this.getSortedData(this.getFilteredData(rawData));
    const showCsvExport = this.hasAttribute("csv-export");
    const showSearch = this.hasAttribute("search");
    const filename = this.getAttribute("csv-filename") ?? "export";
    const zebra = this.hasAttribute("zebra");
    const safeQuery = this.escapeHtml(this._searchQuery);

    const headerCells = columns
      .map((col) => {
        const isSorted = this._sortKey === col.key;
        const ariaSort = isSorted
          ? this._sortDir === "asc"
            ? "ascending"
            : "descending"
          : "none";
        const sortIcon = isSorted
          ? this._sortDir === "asc"
            ? "↑"
            : "↓"
          : "↕";
        return col.sortable
          ? `<th class="sortable${isSorted ? " sorted" : ""}" data-sort-key="${this.escapeHtml(col.key)}" tabindex="0" aria-sort="${ariaSort}">${this.escapeHtml(col.label)} <span class="sort-icon">${sortIcon}</span></th>`
          : `<th>${this.escapeHtml(col.label)}</th>`;
      })
      .join("");

    const rows =
      data
        .map((row) => {
          const cells = columns
            .map((col) => `<td>${this.escapeHtml(row[col.key])}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("") ||
      `<tr><td colspan="${columns.length}" class="empty">No data</td></tr>`;

    this.root.innerHTML = `
      ${this.css(styles)}
      <div class="table-wrapper">
        ${showCsvExport || showSearch ? `<div class="table-toolbar">${showSearch ? `<input class="search-input" type="search" placeholder="Search..." value="${safeQuery}" aria-label="Search table">` : ""}${showCsvExport ? `<button class="csv-btn" type="button">Export CSV</button>` : ""}</div>` : ""}
        <div class="table-scroll">
          <table${zebra ? ' class="zebra"' : ""}>
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;

    this.attachListeners(columns, rawData, filename);
  }

  private attachListeners(
    columns: TableColumn[],
    rawData: RowData[],
    filename: string
  ): void {
    this.root.querySelectorAll<HTMLTableCellElement>("th.sortable").forEach((th) => {
      const key = th.dataset.sortKey!;

      const handleSort = () => {
        if (this._sortKey !== key) {
          this._sortKey = key;
          this._sortDir = "asc";
        } else if (this._sortDir === "asc") {
          this._sortDir = "desc";
        } else {
          this._sortKey = null;
          this._sortDir = null;
        }
        this.render();
      };

      th.addEventListener("click", handleSort);
      th.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSort();
        }
      });
    });

    const csvBtn = this.root.querySelector<HTMLButtonElement>(".csv-btn");
    if (csvBtn) {
      csvBtn.addEventListener("click", () =>
        this.exportCsv(columns, rawData, filename)
      );
    }

    const searchInput = this.root.querySelector<HTMLInputElement>(".search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        const cursorPos = target.selectionStart;
        this._searchQuery = target.value;
        this.render();
        const newInput = this.root.querySelector<HTMLInputElement>(".search-input");
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(cursorPos ?? 0, cursorPos ?? 0);
        }
      });
    }
  }

  private exportCsv(
    columns: TableColumn[],
    data: RowData[],
    filename: string
  ): void {
    const header = columns.map((c) => `"${c.label}"`).join(",");
    const rows = data.map((row) =>
      columns
        .map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

customElements.define("ui-table", UITable);
