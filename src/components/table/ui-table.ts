import { UIComponent } from "../../core/component";
import styles from "./ui-table.css?raw";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: RowData) => string;
  children?: TableColumn[];
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
    return ["columns", "data", "csv-export", "csv-filename", "zebra", "search", "sticky-header", "max-rows", "center-headers"];
  }

  connectedCallback(): void {
    const hasConfig =
      this._columns.length > 0 ||
      this._data.length > 0 ||
      this.hasAttribute("columns") ||
      this.hasAttribute("data");
    if (hasConfig) {
      super.connectedCallback();
    } else {

      setTimeout(() => this.render(), 0);
    }
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

  private getLeafColumns(columns: TableColumn[]): TableColumn[] {
    return columns.flatMap((col) =>
      col.children && col.children.length > 0 ? this.getLeafColumns(col.children) : [col]
    );
  }

  private getColSpan(col: TableColumn): number {
    if (!col.children || col.children.length === 0) return 1;
    return col.children.reduce((sum, c) => sum + this.getColSpan(c), 0);
  }

  private getMaxDepth(columns: TableColumn[], depth = 1): number {
    return Math.max(
      ...columns.map((col) =>
        col.children && col.children.length > 0
          ? this.getMaxDepth(col.children, depth + 1)
          : depth
      )
    );
  }

  private buildHeaderRows(columns: TableColumn[], stickyHeader: boolean): string {
    const maxDepth = this.getMaxDepth(columns);
    const levels: { col: TableColumn; depth: number }[][] = Array.from(
      { length: maxDepth },
      () => []
    );

    const traverse = (cols: TableColumn[], depth: number) => {
      for (const col of cols) {
        levels[depth].push({ col, depth });
        if (col.children && col.children.length > 0) {
          traverse(col.children, depth + 1);
        }
      }
    };
    traverse(columns, 0);

    return levels
      .map((levelCols, depth) => {
        const cells = levelCols
          .map(({ col }) => {
            const isLeaf = !col.children || col.children.length === 0;
            const colspan = isLeaf ? 1 : this.getColSpan(col);
            const rowspan = isLeaf ? maxDepth - depth : 1;
            const colspanAttr = colspan > 1 ? ` colspan="${colspan}"` : "";
            const rowspanAttr = rowspan > 1 ? ` rowspan="${rowspan}"` : "";
            const stickyStyle = stickyHeader
              ? ` style="top: calc(${depth} * var(--ui-table-row-height, 45px)); z-index: ${maxDepth - depth + 1};"`
              : "";

            if (!isLeaf) {
              return `<th${colspanAttr}${rowspanAttr} class="group-header"${stickyStyle}>${this.escapeHtml(col.label)}</th>`;
            }

            const isSorted = this._sortKey === col.key;
            const ariaSort = isSorted
              ? this._sortDir === "asc" ? "ascending" : "descending"
              : "none";
            const sortIcon = isSorted
              ? this._sortDir === "asc" ? "↑" : "↓"
              : "↕";

            return col.sortable
              ? `<th${rowspanAttr} class="leaf-header sortable${isSorted ? " sorted" : ""}" data-sort-key="${this.escapeHtml(col.key)}" tabindex="0" aria-sort="${ariaSort}"${stickyStyle}>${this.escapeHtml(col.label)} <span class="sort-icon">${sortIcon}</span></th>`
              : `<th${rowspanAttr} class="leaf-header"${stickyStyle}>${this.escapeHtml(col.label)}</th>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");
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
    const zebra = this.hasAttribute("zebra");
    const centerHeaders = this.hasAttribute("center-headers");
    const stickyHeader = this.hasAttribute("sticky-header");
    const maxRows = parseInt(this.getAttribute("max-rows") ?? "0", 10);

    const scrollClasses = ["table-scroll", ...(stickyHeader ? ["sticky-header"] : "")].join(" ");

    const tmpl = this.querySelector<HTMLTemplateElement>("template");
    if (
      this._columns.length === 0 &&
      !this.getAttribute("columns") &&
      this._data.length === 0 &&
      !this.getAttribute("data") &&
      tmpl
    ) {
      const scrollStyle = maxRows > 0
        ? ` style="max-height: calc(${maxRows + 1} * var(--ui-table-row-height, 45px)); overflow-y: auto;"`
        : "";
      this.root.innerHTML = `
        ${this.css(styles)}
        <div class="table-wrapper">
          <div class="${scrollClasses}"${scrollStyle}>
            <table${[zebra ? ' zebra' : '', centerHeaders ? ' center-headers' : ''].join('') ? ` class="${[zebra ? 'zebra' : '', centerHeaders ? 'center-headers' : ''].filter(Boolean).join(' ')}"` : ""}>
              ${tmpl.innerHTML}
            </table>
          </div>
        </div>
      `;
      return;
    }

    const columns = this.parseColumns();
    const headerDepth = this.getMaxDepth(columns);
    const leafColumns = this.getLeafColumns(columns);
    const rawData = this.parseData();
    const data = this.getSortedData(this.getFilteredData(rawData));
    const showCsvExport = this.hasAttribute("csv-export");
    const showSearch = this.hasAttribute("search");
    const filename = this.getAttribute("csv-filename") ?? "export";
    const safeQuery = this.escapeHtml(this._searchQuery);
    const scrollStyle = maxRows > 0
      ? ` style="max-height: calc(${maxRows + headerDepth} * var(--ui-table-row-height, 45px)); overflow-y: auto;"`
      : "";

    const headerRows = this.buildHeaderRows(columns, stickyHeader);

    const rows =
      data
        .map((row, rowIdx) => {
          const cells = leafColumns
            .map((col) => {
              if (col.render) {
                return `<td data-row-index="${rowIdx}" data-col-key="${this.escapeHtml(col.key)}">${col.render(row[col.key], row)}</td>`;
              }
              return `<td>${this.escapeHtml(row[col.key])}</td>`;
            })
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("") ||
      `<tr><td colspan="${leafColumns.length}" class="empty">No data</td></tr>`;

    this.root.innerHTML = `
      ${this.css(styles)}
      <div class="table-wrapper">
        ${showCsvExport || showSearch ? `<div class="table-toolbar">${showSearch ? `<input class="search-input" type="search" placeholder="Search..." value="${safeQuery}" aria-label="Search table">` : ""}${showCsvExport ? `<button class="csv-btn" type="button">Export CSV</button>` : ""}</div>` : ""}
        <div class="${scrollClasses}"${scrollStyle}>
          <table class="${[zebra ? 'zebra' : '', centerHeaders ? 'center-headers' : ''].filter(Boolean).join(' ') || ''}">
            <thead>${headerRows}</thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;

    this.attachListeners(columns, leafColumns, rawData, filename);
  }

  private buildCsvHeaderRows(columns: TableColumn[]): string[][] {
    const maxDepth = this.getMaxDepth(columns);
    const grid: string[][] = Array.from({ length: maxDepth }, () => []);

    const fill = (cols: TableColumn[], depth: number) => {
      for (const col of cols) {
        const isLeaf = !col.children || col.children.length === 0;
        if (isLeaf) {
          grid[depth].push(col.label);
          for (let d = depth + 1; d < maxDepth; d++) grid[d].push("");
        } else {
          const span = this.getColSpan(col);
          for (let i = 0; i < span; i++) grid[depth].push(col.label);
          fill(col.children!, depth + 1);
        }
      }
    };

    fill(columns, 0);
    return grid;
  }

  private attachListeners(
    allColumns: TableColumn[],
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
        this.exportCsv(allColumns, columns, rawData, filename)
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

    const tbody = this.root.querySelector<HTMLElement>("tbody");
    if (tbody) {
      tbody.addEventListener("input", (e: Event) => {
        const target = e.target as HTMLElement;
        const td = target.closest("td[data-row-index]") as HTMLElement | null;
        if (!td) return;
        const rowIndex = Number(td.dataset.rowIndex);
        const colKey = td.dataset.colKey!;
        const value = (e.composedPath()[0] as HTMLInputElement).value;
        this.dispatchEvent(
          new CustomEvent("cell-change", {
            detail: { rowIndex, colKey, value },
            bubbles: true,
            composed: true,
          })
        );
      });
    }
  }

  private exportCsv(
    allColumns: TableColumn[],
    leafColumns: TableColumn[],
    data: RowData[],
    filename: string
  ): void {
    const headerRows = this.buildCsvHeaderRows(allColumns);
    const csvRows = headerRows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","));
    const dataRows = data.map((row) =>
      leafColumns
        .map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [...csvRows, ...dataRows].join("\n");
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
