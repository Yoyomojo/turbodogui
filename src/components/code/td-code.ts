import { UIComponent } from "../../core/component";
import styles from "./td-code.css?raw";
const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
}
function trimIndent(str: string): string {
    const lines = str.replace(/^\n/, "").replace(/\n\s*$/, "").split("\n");
    const nonEmpty = lines.filter((l) => l.trim().length > 0);
    if (nonEmpty.length === 0)
        return "";
    const indent = Math.min(...nonEmpty.map((l) => l.match(/^(\s*)/)![1].length));
    return lines.map((l) => l.slice(indent)).join("\n");
}
type TokenRule = [
    RegExp,
    string
];
function applyRules(code: string, rules: TokenRule[]): string {
    let out = "";
    let i = 0;
    while (i < code.length) {
        let matched = false;
        for (const [re, cls] of rules) {
            re.lastIndex = i;
            const m = re.exec(code);
            if (m) {
                const safe = escapeHtml(m[0]);
                out += cls ? `<span class="${cls}">${safe}</span>` : safe;
                i += m[0].length;
                matched = true;
                break;
            }
        }
        if (!matched)
            out += escapeHtml(code[i++]);
    }
    return out;
}
const _JS_RULES: TokenRule[] = [
    [/\/\/[^\n]*/y, "tok-comment"],
    [/\/\*[\s\S]*?\*\//y, "tok-comment"],
    [/`(?:[^`\\]|\\.)*`/y, "tok-string"],
    [/'(?:[^'\\\n]|\\.)*'/y, "tok-string"],
    [/"(?:[^"\\\n]|\\.)*"/y, "tok-string"],
    [/\b0x[0-9a-fA-F]+n?\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?n?\b/y, "tok-number"],
    [/\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|false|finally|for|from|function|if|import|in|instanceof|let|new|null|of|return|static|super|switch|this|throw|true|try|typeof|undefined|var|void|while|with|yield|interface|enum|implements|abstract|declare|as|namespace|module|satisfies|keyof|infer|readonly|override|using)\b/y, "tok-keyword"],
    [/\b(?:string|number|boolean|object|symbol|bigint|never|unknown|any|Function|Array|Promise|Record|Partial|Required|Readonly|Pick|Omit|Exclude|Extract|NonNullable|ReturnType|InstanceType|Parameters|Set|Map|Date|RegExp|Error|HTMLElement|Element|EventTarget|Node|Document|Window|Event|CustomEvent)\b/y, "tok-type"],
    [/\b[A-Z][A-Za-z0-9_]*\b/y, "tok-type"],
    [/\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/y, "tok-fn"],
    [/[a-zA-Z_$][a-zA-Z0-9_$]*/y, ""],
];
const _HTML_RULES: TokenRule[] = [
    [/<!--[\s\S]*?-->/y, "tok-comment"],
    [/<!DOCTYPE[^>]*>/iy, "tok-keyword"],
    [/"[^"]*"/y, "tok-string"],
    [/'[^']*'/y, "tok-string"],
    [/<\/?[a-zA-Z][a-zA-Z0-9-]*/y, "tok-tag"],
    [/[a-zA-Z_:][a-zA-Z0-9_:.-]*(?=\s*=)/y, "tok-attr"],
    [/&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;/y, "tok-number"],
    [/[^<>"'&\s][^<>"'&]*/y, ""],
];
const _CSS_RULES: TokenRule[] = [
    [/\/\*[\s\S]*?\*\//y, "tok-comment"],
    [/"[^"]*"/y, "tok-string"],
    [/'[^']*'/y, "tok-string"],
    [/@[a-zA-Z-]+/y, "tok-keyword"],
    [/#[0-9a-fA-F]{3,8}\b/y, "tok-number"],
    [/\b\d+(?:\.\d+)?(?:%|px|em|rem|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc|fr|deg|rad|turn|ms|s|dvh|dvw|svh|svw)?\b/y, "tok-number"],
    [/--[a-zA-Z][a-zA-Z0-9-]*/y, "tok-attr"],
    [/\b(?:var|calc|env|min|max|clamp|rgb|rgba|hsl|hsla|hwb|oklch|oklab|lch|lab|color|color-mix|linear-gradient|radial-gradient|conic-gradient|url|cubic-bezier|steps|translate|rotate|scale|skew|matrix|perspective)(?=\()/y, "tok-fn"],
    [/::[a-z-]+|:[a-z-]+(?!\()/y, "tok-type"],
    [/\b(?:auto|none|inherit|initial|unset|revert|normal|bold|italic|flex|grid|block|inline|relative|absolute|fixed|sticky|hidden|visible|solid|dashed|dotted|center|left|right|top|bottom|middle|baseline|stretch|start|end|space-between|space-around|space-evenly|wrap|nowrap|row|column|transparent|currentColor|important|serif|sans-serif|monospace)\b/y, "tok-keyword"],
    [/[a-zA-Z][a-zA-Z0-9-]*/y, ""],
];
const _JSON_RULES: TokenRule[] = [
    [/"(?:[^"\\]|\\.)*"(?=\s*:)/y, "tok-attr"],
    [/"(?:[^"\\]|\\.)*"/y, "tok-string"],
    [/\b(?:true|false|null)\b/y, "tok-keyword"],
    [/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y, "tok-number"],
];
const _BASH_RULES: TokenRule[] = [
    [/#[^\n]*/y, "tok-comment"],
    [/'[^']*'/y, "tok-string"],
    [/"(?:[^"\\]|\\.)*"/y, "tok-string"],
    [/\$(?:\{[^}]*\}|[a-zA-Z_][a-zA-Z0-9_]*|[0-9#@*?$!-])/y, "tok-type"],
    [/\b(?:if|then|else|elif|fi|for|while|do|done|case|esac|in|function|return|break|continue|exit|export|local|readonly|set|unset|echo|printf|source|let|declare|shift|getopts|trap|wait|exec|eval)\b/y, "tok-keyword"],
    [/\b\d+\b/y, "tok-number"],
];
function highlight(code: string, lang: string): string {
    switch (lang.toLowerCase()) {
        case "js":
        case "javascript":
        case "ts":
        case "typescript": return applyRules(code, _JS_RULES);
        case "html": return applyRules(code, _HTML_RULES);
        case "css":
        case "scss":
        case "less": return applyRules(code, _CSS_RULES);
        case "json": return applyRules(code, _JSON_RULES);
        case "bash":
        case "sh":
        case "shell": return applyRules(code, _BASH_RULES);
        default: return escapeHtml(code);
    }
}
export class UICode extends UIComponent {
    private _code: string | null = null;
    private _resetTimer: ReturnType<typeof setTimeout> | undefined;
    static get observedAttributes(): string[] {
        return ["language", "filename"];
    }
    attributeChangedCallback(): void {
        if (this.isConnected)
            this.render();
    }
    get code(): string {
        return this._code ?? this._extractCode();
    }
    set code(val: string) {
        this._code = val;
        if (this.isConnected)
            this.render();
    }
    private _extractCode(): string {
        const tpl = this.querySelector("template");
        if (tpl)
            return trimIndent(decodeHtmlEntities(tpl.innerHTML));
        return trimIndent(this.textContent ?? "");
    }
    protected render(): void {
        const language = this.getAttribute("language") ?? "";
        const filename = this.getAttribute("filename") ?? "";
        const code = this._code ?? this._extractCode();
        const highlighted = language ? highlight(code, language) : escapeHtml(code);
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
        <pre class="code-pre"><code>${highlighted}</code></pre>
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
    disconnectedCallback(): void {
        clearTimeout(this._resetTimer);
    }
}
customElements.define("td-code", UICode);
