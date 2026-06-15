import { UIComponent } from "../../core/component";
import styles from "./td-file-input.css?raw";

interface FileInputChangeDetail {
    files: File[];
    names: string[];
}

interface FileInputRejectDetail {
    rejectedByType: string[];
    rejectedBySize: string[];
    maxSizeBytes: number | null;
}

interface FileNormalizationResult {
    accepted: File[];
    rejectedByType: File[];
    rejectedBySize: File[];
}

export class UIFileInput extends UIComponent {
    static get observedAttributes(): string[] {
        return [
            "label",
            "accept",
            "multiple",
            "mode",
            "size",
            "drop-title",
            "drop-subtitle",
            "accepted-label",
            "max-size-label",
            "no-files-label",
            "disabled",
            "max-size",
        ];
    }

    private _files: File[] = [];
    private _statusMessage = "";

    private _sizeClass(): string {
        const size = (this.getAttribute("size") || "medium").trim().toLowerCase();
        if (["small", "medium", "large", "extra-large"].includes(size)) {
            return size;
        }
        return "medium";
    }

    get files(): File[] {
        return [...this._files];
    }

    get label(): string {
        return this.getAttribute("label") || "File Upload";
    }

    set label(value: string) {
        this.setAttribute("label", value);
    }

    get multiple(): boolean {
        return this._isMultiple();
    }

    set multiple(value: boolean) {
        if (value) {
            this.setAttribute("multiple", "");
            this.setAttribute("mode", "multiple");
        }
        else {
            this.removeAttribute("multiple");
            this.setAttribute("mode", "single");
        }
    }

    private _acceptAttr(): string {
        return (this.getAttribute("accept") || "*/*").trim() || "*/*";
    }

    private _maxSizeBytes(): number | null {
        const raw = (this.getAttribute("max-size") || "").trim();
        if (!raw) {
            return null;
        }

        const numeric = Number(raw);
        if (Number.isFinite(numeric) && numeric > 0) {
            return Math.round(numeric);
        }

        const m = raw.match(/^([0-9]+(?:\.[0-9]+)?)\s*(b|kb|mb|gb)$/i);
        if (!m) {
            return null;
        }

        const value = Number(m[1]);
        const unit = m[2].toLowerCase();
        const factor = unit === "b" ? 1 : unit === "kb" ? 1024 : unit === "mb" ? 1024 * 1024 : 1024 * 1024 * 1024;
        return Math.round(value * factor);
    }

    private _formatBytes(bytes: number): string {
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        if (bytes < 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }

    private _isMultiple(): boolean {
        const mode = (this.getAttribute("mode") || "").trim().toLowerCase();
        if (mode === "multiple") {
            return true;
        }
        if (mode === "single") {
            return false;
        }
        return this.hasAttribute("multiple");
    }

    private _isAccepted(file: File, acceptTokens: string[]): boolean {
        if (!acceptTokens.length || acceptTokens.includes("*/*")) {
            return true;
        }

        const fileType = (file.type || "").toLowerCase();
        const fileName = file.name.toLowerCase();

        for (const tokenRaw of acceptTokens) {
            const token = tokenRaw.toLowerCase();

            if (token === "*/*") {
                return true;
            }

            if (token.startsWith(".")) {
                if (fileName.endsWith(token)) {
                    return true;
                }
                continue;
            }

            if (token.endsWith("/*")) {
                const prefix = token.slice(0, token.length - 1);
                if (fileType.startsWith(prefix)) {
                    return true;
                }
                continue;
            }

            if (fileType === token) {
                return true;
            }
        }

        return false;
    }

    private _normalizeFiles(list: FileList | File[]): FileNormalizationResult {
        const all = Array.from(list);
        const tokens = this._acceptAttr().split(",").map((v) => v.trim()).filter(Boolean);
        const maxSizeBytes = this._maxSizeBytes();
        const rejectedByType: File[] = [];
        const rejectedBySize: File[] = [];
        const accepted = all.filter((file) => {
            if (!this._isAccepted(file, tokens)) {
                rejectedByType.push(file);
                return false;
            }
            if (maxSizeBytes !== null && file.size > maxSizeBytes) {
                rejectedBySize.push(file);
                return false;
            }
            return true;
        });
        const multiple = this._isMultiple();
        return {
            accepted: multiple ? accepted : accepted.slice(0, 1),
            rejectedByType,
            rejectedBySize,
        };
    }

    private _emitReject(result: FileNormalizationResult): void {
        if (!result.rejectedByType.length && !result.rejectedBySize.length) {
            return;
        }

        const detail: FileInputRejectDetail = {
            rejectedByType: result.rejectedByType.map((f) => f.name),
            rejectedBySize: result.rejectedBySize.map((f) => f.name),
            maxSizeBytes: this._maxSizeBytes(),
        };

        this.dispatchEvent(new CustomEvent<FileInputRejectDetail>("file-reject", {
            detail,
            bubbles: true,
            composed: true,
        }));
    }

    private _emitChange(): void {
        const detail: FileInputChangeDetail = {
            files: [...this._files],
            names: this._files.map((f) => f.name),
        };

        this.dispatchEvent(new CustomEvent<FileInputChangeDetail>("change", {
            detail,
            bubbles: true,
            composed: true,
        }));
    }

    private _syncFromInput(input: HTMLInputElement): void {
        const result = input.files ? this._normalizeFiles(input.files) : { accepted: [], rejectedByType: [], rejectedBySize: [] };
        this._files = result.accepted;
        const rejectMessages: string[] = [];
        if (result.rejectedByType.length) {
            rejectMessages.push(`Ignored ${result.rejectedByType.length} file(s): unsupported type.`);
        }
        if (result.rejectedBySize.length) {
            const sizeText = this._maxSizeBytes() ? this._formatBytes(this._maxSizeBytes()!) : "the max size";
            rejectMessages.push(`Ignored ${result.rejectedBySize.length} file(s): over ${sizeText}.`);
        }
        this._statusMessage = rejectMessages.join(" ");
        this.render();
        this._emitReject(result);
        this._emitChange();
    }

    private _syncFromDrop(files: FileList): void {
        const result = this._normalizeFiles(files);
        this._files = result.accepted;
        const rejectMessages: string[] = [];
        if (result.rejectedByType.length) {
            rejectMessages.push(`Ignored ${result.rejectedByType.length} file(s): unsupported type.`);
        }
        if (result.rejectedBySize.length) {
            const sizeText = this._maxSizeBytes() ? this._formatBytes(this._maxSizeBytes()!) : "the max size";
            rejectMessages.push(`Ignored ${result.rejectedBySize.length} file(s): over ${sizeText}.`);
        }
        this._statusMessage = rejectMessages.join(" ");
        this.render();
        this._emitReject(result);
        this._emitChange();
    }

    protected render(): void {
        const label = this.label;
        const accept = this._acceptAttr();
        const maxSize = this._maxSizeBytes();
        const disabled = this.hasAttribute("disabled");
        const multiple = this._isMultiple();
                const sizeClass = this._sizeClass();
                const dropTitle = this.getAttribute("drop-title") || "Drag and drop files here";
                const dropSubtitle = this.getAttribute("drop-subtitle") || "or click to browse";
                const acceptedLabel = this.getAttribute("accepted-label") || "Accepted";
                const maxSizeLabel = this.getAttribute("max-size-label") || "Max size per file";
                const noFilesLabel = this.getAttribute("no-files-label") || "No file selected";
                const hasCustomContent = !!this.querySelector('[slot="content"]');
        const summary = this._files.length
            ? this._files.map((f) => f.name).join(", ")
                        : noFilesLabel;

        this.root.innerHTML = `
      ${this.css(styles)}
            <div class="file-input file-input--${sizeClass} ${disabled ? "file-input--disabled" : ""}">
        <label class="file-input-label">${label}</label>
        <input class="native-input" type="file" ${multiple ? "multiple" : ""} ${disabled ? "disabled" : ""} accept="${accept}" />
        <button type="button" class="drop-zone" ${disabled ? "disabled" : ""}>
                    ${hasCustomContent
                                ? `<slot name="content"></slot>`
                                : `<span class="drop-title">${dropTitle}</span>
                    <span class="drop-subtitle">${dropSubtitle}</span>
                    <span class="drop-accept">${acceptedLabel}: ${accept === "*/*" ? "All file types" : accept}</span>
                    ${maxSize !== null ? `<span class="drop-max-size">${maxSizeLabel}: ${this._formatBytes(maxSize)}</span>` : ""}`}
        </button>
                <p class="file-summary">${summary}</p>
                ${this._statusMessage ? `<p class="file-status" role="status">${this._statusMessage}</p>` : ""}
      </div>
    `;

        const input = this.root.querySelector<HTMLInputElement>(".native-input");
        const zone = this.root.querySelector<HTMLButtonElement>(".drop-zone");

        if (!input || !zone || disabled) {
            return;
        }

        zone.addEventListener("click", () => {
            input.click();
        });

        input.addEventListener("change", () => {
            this._syncFromInput(input);
        });

        zone.addEventListener("dragenter", (e) => {
            e.preventDefault();
            zone.classList.add("drop-zone--active");
        });

        zone.addEventListener("dragover", (e) => {
            e.preventDefault();
            zone.classList.add("drop-zone--active");
        });

        zone.addEventListener("dragleave", () => {
            zone.classList.remove("drop-zone--active");
        });

        zone.addEventListener("drop", (e) => {
            e.preventDefault();
            zone.classList.remove("drop-zone--active");
            if (e.dataTransfer?.files?.length) {
                this._syncFromDrop(e.dataTransfer.files);
            }
        });
    }
}

customElements.define("td-file-input", UIFileInput);
