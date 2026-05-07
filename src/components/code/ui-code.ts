import { UIComponent } from "../../core/component";
import styles from "./ui-code.css?raw";

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function trimIndent(str: string): string {
  const lines = str.replace(/^\n/, "").replace(/\n\s*$/, "").split("\n");
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return "";
  const indent = Math.min(...nonEmpty.map((l) => l.match(/^(\s*)/)![1].length));
  return lines.map((l) => l.slice(indent)).join("\n");
}

export class UICode extends UIComponent {
  private _code: string | null = null;
  private _resetTimer: ReturnType<typeof setTimeout> | undefined;

  static get observedAttributes(): string[] {
    return ["language", "filename"];
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get code(): string {
    return this._code ?? this._extractCode();
  }

  set code(val: string) {
    this._code = val;
    if (this.isConnected) this.render();
  }

  private _extractCode(): string {
    const tpl = this.querySelector("template");
    if (tpl) return trimIndent(tpl.innerHTML);
    return trimIndent(this.textContent ?? "");
  }

  protected render(): void {
    const language = this.getAttribute("language") ?? "";
    const filename = this.getAttribute("filename") ?? "";
    const code = this._code ?? this._extractCode();
    const escaped = escapeHtml(code);

    const labelHtml = [
      filename ? `<span class="filename">${escapeHtml(filename)}</span>` : "",
      language ? `<span class="lang-badge">${escapeHtml(language)}</span>` : "",
    ]
      .filter(Boolean)
      .join("");

    this.root.innerHTML = `
      ${this.css(styles)}
      <div class="code-wrap">
        <div class="code-header">
          <span class="labels">${labelHtml}</span>
          <button class="copy-btn" title="Copy to clipboard" aria-label="Copy code to clipboard">
            ${COPY_ICON}
          </button>
        </div>
        <pre class="code-pre"><code>${escaped}</code></pre>
      </div>
    `;

    const btn = this.root.querySelector<HTMLButtonElement>(".copy-btn")!;

    btn.addEventListener("click", () => {
      const onSuccess = () => {
        btn.innerHTML = CHECK_ICON;
        btn.classList.add("copied");
        clearTimeout(this._resetTimer);
        this._resetTimer = setTimeout(() => {
          btn.innerHTML = COPY_ICON;
          btn.classList.remove("copied");
        }, 2000);
      };

      navigator.clipboard.writeText(code).then(onSuccess).catch(() => {
        // Fallback for environments without clipboard API
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        onSuccess();
      });
    });
  }
}

customElements.define("ui-code", UICode);
