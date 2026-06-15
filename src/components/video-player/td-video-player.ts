import { UIComponent } from "../../core/component";
import styles from "./td-video-player.css?raw";
const PLAY = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>`;
const PAUSE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;
const RWD = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/><text x="9.5" y="14.5" font-size="5.5" fill="currentColor" stroke="none" font-weight="bold" font-family="system-ui,sans-serif">10</text></svg>`;
const FWD = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.51"/><text x="9.5" y="14.5" font-size="5.5" fill="currentColor" stroke="none" font-weight="bold" font-family="system-ui,sans-serif">10</text></svg>`;
const VOL_HIGH = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
const VOL_LOW = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
const VOL_MUTE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
const FS_ON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
const FS_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`;
const SHARE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;
const VIDEO_PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;
const ACCEPTED = "video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov,.avi";
export class UIVideoPlayer extends UIComponent {
    private _video: HTMLVideoElement;
    private _iframe: HTMLIFrameElement;
    private _objectUrl = "";
    private _isEmbedSrc = false;
    private _isSeeking = false;
    private _videoEventsAttached = false;
    private _fullscreenHandler: (() => void) | null = null;
    private _localFileName = "";
    constructor() {
        super();
        this._video = document.createElement("video");
        this._video.className = "video";
        this._video.setAttribute("part", "video");
        this._video.setAttribute("playsinline", "");
        this._video.setAttribute("preload", "metadata");
        this._iframe = document.createElement("iframe");
        this._iframe.className = "embed-frame hidden";
        this._iframe.setAttribute("allowfullscreen", "");
        this._iframe.setAttribute("frameborder", "0");
        this._iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        this._iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share");
    }
    static get observedAttributes(): string[] {
        return ["src", "title", "autoplay", "muted", "loop", "poster"];
    }
    attributeChangedCallback(name: string, _old: string | null, val: string | null): void {
        if (!this.isConnected)
            return;
        switch (name) {
            case "src":
                this._localFileName = "";
                this._setSrc(val ?? "");
                this._syncSourceState();
                break;
            case "muted":
                this._video.muted = val !== null;
                break;
            case "loop":
                this._video.loop = val !== null;
                break;
            case "autoplay":
                this._video.autoplay = val !== null;
                break;
            case "poster":
                if (val)
                    this._video.poster = val;
                else
                    this._video.removeAttribute("poster");
                break;
            case "title":
                this._syncTitle();
                break;
        }
    }
    connectedCallback(): void {
        this.setAttribute("tabindex", "0");
        super.connectedCallback();
        const src = this.getAttribute("src");
        if (src) {
            this._setSrc(src);
            this._syncSourceState();
        }
        if (this.hasAttribute("muted"))
            this._video.muted = true;
        if (this.hasAttribute("loop"))
            this._video.loop = true;
        if (this.hasAttribute("autoplay"))
            this._video.autoplay = true;
        const poster = this.getAttribute("poster");
        if (poster)
            this._video.poster = poster;
        this._seekToUrlTimestamp();
    }
    disconnectedCallback(): void {
        this._video.pause();
        this._revokeObjectUrl();
        this._iframe.src = "";
        if (this._fullscreenHandler) {
            document.removeEventListener("fullscreenchange", this._fullscreenHandler);
            this._fullscreenHandler = null;
        }
    }
    play(): void { void this._video.play(); }
    pause(): void { this._video.pause(); }
    seek(s: number): void { this._video.currentTime = s; }
    get currentTime(): number { return this._video.currentTime; }
    get duration(): number { return this._video.duration; }
    get paused(): boolean { return this._video.paused; }
    protected render(): void {
        const title = this.getAttribute("title") ?? this._localFileName;
        this.root.innerHTML = `
      ${this.css(styles)}
      <div class="player" part="player">
        <div class="player-title${title ? "" : " hidden"}">${this._esc(title)}</div>

        <div class="video-wrap" part="video-wrap">
          <div class="drop-zone" role="region" aria-label="Drop a video file or browse to load">
            <div class="drop-zone-inner">
              ${VIDEO_PLACEHOLDER}
              <p class="drop-hint">Drop a video file here or</p>
              <span class="browse-btn" role="button" tabindex="0">Browse files</span>
              <p class="drop-formats">MP4 · WebM · OGG · MOV · AVI</p>
            </div>
          </div>
        </div>

        <div class="embed-bar hidden" part="embed-bar">
          <div class="embed-bar-row">
            <button class="ctrl-btn" data-action="share" aria-label="Share video" title="Share">${SHARE_ICON}</button>
          </div>
        </div>

        <div class="controls hidden" part="controls">
          <div class="progress-wrap">
            <div class="progress-track">
              <div class="progress-buffered"></div>
              <div class="progress-filled"></div>
              <input type="range" class="progress-input" min="0" max="100" value="0" step="0.1" aria-label="Seek video" />
            </div>
          </div>

          <div class="controls-row">
            <div class="controls-left">
              <button class="ctrl-btn" data-action="rewind"  aria-label="Rewind 10 seconds"       title="Rewind 10s">${RWD}</button>
              <button class="ctrl-btn ctrl-btn--play" data-action="play" aria-label="Play">${PLAY}</button>
              <button class="ctrl-btn" data-action="forward" aria-label="Fast forward 10 seconds" title="Forward 10s">${FWD}</button>

              <div class="volume-group">
                <button class="ctrl-btn" data-action="mute" aria-label="Mute">${VOL_HIGH}</button>
                <input type="range" class="volume-slider" min="0" max="1" step="0.02" value="1" aria-label="Volume" />
              </div>

              <span class="time-display">
                <span class="time-current">0:00</span><span class="time-sep"> / </span><span class="time-duration">0:00</span>
              </span>
            </div>

            <div class="controls-right">
              <button class="ctrl-btn" data-action="share"      aria-label="Share video"      title="Share">${SHARE_ICON}</button>
              <button class="ctrl-btn" data-action="fullscreen" aria-label="Enter fullscreen" title="Fullscreen">${FS_ON}</button>
            </div>
          </div>
        </div>

        <div class="toast" role="status" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;
        const wrap = this.root.querySelector<HTMLElement>(".video-wrap")!;
        wrap.prepend(this._iframe);
        wrap.prepend(this._video);
        this._attachDomListeners();
        this._attachVideoEvents();
        this._syncVolumeSlider();
    }
    private _attachDomListeners(): void {
        const dropZone = this.root.querySelector<HTMLElement>(".drop-zone")!;
        dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("drag-over"); });
        dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("drag-over");
            const file = e.dataTransfer?.files[0];
            if (file)
                this._loadFile(file);
        });
        const browseBtn = this.root.querySelector<HTMLElement>(".browse-btn")!;
        browseBtn.addEventListener("click", () => this._triggerFilePicker());
        browseBtn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                this._triggerFilePicker();
            }
        });
        this.root.addEventListener("click", (e) => {
            const btn = (e.composedPath()[0] as Element).closest<HTMLElement>("[data-action]");
            if (btn)
                this._handleAction(btn.dataset.action ?? "");
        });
        this._video.addEventListener("click", () => this._handleAction("play"));
        const progressInput = this.root.querySelector<HTMLInputElement>(".progress-input")!;
        progressInput.addEventListener("pointerdown", () => { this._isSeeking = true; });
        progressInput.addEventListener("input", () => {
            const dur = this._video.duration;
            if (!isFinite(dur))
                return;
            this._video.currentTime = (parseFloat(progressInput.value) / 100) * dur;
            this._syncProgressVisuals();
        });
        progressInput.addEventListener("pointerup", () => { this._isSeeking = false; });
        const volSlider = this.root.querySelector<HTMLInputElement>(".volume-slider")!;
        volSlider.addEventListener("input", () => {
            this._video.volume = parseFloat(volSlider.value);
            this._video.muted = this._video.volume === 0;
            this._syncVolumeSlider();
            this._syncVolumeIcon();
        });
        this.addEventListener("keydown", (e) => {
            const tag = (e.target as Element).tagName;
            if (tag === "INPUT")
                return;
            switch (e.key) {
                case " ":
                case "k":
                    e.preventDefault();
                    this._handleAction("play");
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    this._handleAction("rewind");
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    this._handleAction("forward");
                    break;
                case "m":
                    this._handleAction("mute");
                    break;
                case "f":
                    this._handleAction("fullscreen");
                    break;
            }
        });
        this._fullscreenHandler = () => this._syncFullscreenBtn();
        document.addEventListener("fullscreenchange", this._fullscreenHandler);
    }
    private _attachVideoEvents(): void {
        if (this._videoEventsAttached)
            return;
        this._videoEventsAttached = true;
        this._video.addEventListener("play", () => this._syncPlayBtn());
        this._video.addEventListener("pause", () => this._syncPlayBtn());
        this._video.addEventListener("ended", () => this._syncPlayBtn());
        this._video.addEventListener("loadedmetadata", () => this._syncDuration());
        this._video.addEventListener("timeupdate", () => { if (!this._isSeeking)
            this._syncProgress(); });
        this._video.addEventListener("progress", () => this._syncBuffered());
        this._video.addEventListener("volumechange", () => this._syncVolumeIcon());
        this._video.addEventListener("error", () => this._toast("Failed to load video"));
    }
    private _handleAction(action: string): void {
        switch (action) {
            case "play":
                this._video.paused || this._video.ended
                    ? void this._video.play()
                    : this._video.pause();
                break;
            case "rewind":
                this._video.currentTime = Math.max(0, this._video.currentTime - 10);
                break;
            case "forward":
                this._video.currentTime = Math.min(isFinite(this._video.duration) ? this._video.duration : 0, this._video.currentTime + 10);
                break;
            case "mute":
                this._video.muted = !this._video.muted;
                break;
            case "share":
                void this._share();
                break;
            case "fullscreen":
                this._toggleFullscreen();
                break;
        }
    }
    private _triggerFilePicker(): void {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ACCEPTED;
        input.addEventListener("change", () => {
            const file = input.files?.[0];
            if (file)
                this._loadFile(file);
        });
        input.click();
    }
    private _setSrc(url: string): void {
        this._revokeObjectUrl();
        const embedUrl = this._buildEmbedUrl(url);
        if (embedUrl) {
            this._isEmbedSrc = true;
            this._iframe.title = this.getAttribute("title") ?? "";
            this._iframe.src = embedUrl;
            this._video.src = "";
        }
        else {
            this._isEmbedSrc = false;
            this._iframe.src = "";
            this._video.src = url;
        }
    }
    private _buildEmbedUrl(url: string): string | null {
        if (!url)
            return null;
        try {
            const u = new URL(url);
            if (u.hostname === "player.vimeo.com")
                return url;
            if (u.hostname === "vimeo.com" || u.hostname === "www.vimeo.com") {
                const m = u.pathname.match(/^\/([0-9]+)/);
                if (m)
                    return `https://player.vimeo.com/video/${m[1]}`;
            }
            if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
                if (u.pathname.startsWith("/embed/"))
                    return url;
                const v = u.searchParams.get("v");
                if (v)
                    return `https://www.youtube.com/embed/${v}`;
            }
            if (u.hostname === "youtu.be") {
                const id = u.pathname.slice(1);
                if (id)
                    return `https://www.youtube.com/embed/${id}`;
            }
        }
        catch { }
        return null;
    }
    private _loadFile(file: File): void {
        this._revokeObjectUrl();
        this._isEmbedSrc = false;
        this._iframe.src = "";
        this._localFileName = file.name.replace(/\.[^.]+$/, "");
        this._objectUrl = URL.createObjectURL(file);
        this._video.src = this._objectUrl;
        this._syncSourceState();
        this._syncTitle();
        void this._video.play();
    }
    private _revokeObjectUrl(): void {
        if (this._objectUrl) {
            URL.revokeObjectURL(this._objectUrl);
            this._objectUrl = "";
        }
    }
    private _syncSourceState(): void {
        const hasVideo = !!(this._video.src && this._video.src !== window.location.href);
        const hasSrc = hasVideo || this._isEmbedSrc;
        this.root.querySelector(".drop-zone")?.classList.toggle("hidden", hasSrc);
        this.root.querySelector(".controls")?.classList.toggle("hidden", !hasVideo);
        this._video.classList.toggle("hidden", this._isEmbedSrc);
        this._iframe.classList.toggle("hidden", !this._isEmbedSrc);
        const embedBar = this.root.querySelector<HTMLElement>(".embed-bar");
        if (embedBar)
            embedBar.classList.toggle("hidden", !this._isEmbedSrc);
    }
    private _syncPlayBtn(): void {
        const btn = this.root.querySelector<HTMLButtonElement>("[data-action='play']");
        if (!btn)
            return;
        const paused = this._video.paused || this._video.ended;
        btn.innerHTML = paused ? PLAY : PAUSE;
        btn.setAttribute("aria-label", paused ? "Play" : "Pause");
    }
    private _syncProgress(): void {
        const dur = this._video.duration;
        if (!isFinite(dur) || dur === 0)
            return;
        const input = this.root.querySelector<HTMLInputElement>(".progress-input");
        if (input)
            input.value = String((this._video.currentTime / dur) * 100);
        this._syncProgressVisuals();
    }
    private _syncProgressVisuals(): void {
        const dur = this._video.duration;
        if (!isFinite(dur) || dur === 0)
            return;
        const pct = (this._video.currentTime / dur) * 100;
        const filled = this.root.querySelector<HTMLElement>(".progress-filled");
        if (filled)
            filled.style.width = `${pct}%`;
        this._syncTimeDisplay();
    }
    private _syncBuffered(): void {
        const dur = this._video.duration;
        if (!isFinite(dur) || dur === 0)
            return;
        const buf = this._video.buffered;
        if (!buf.length)
            return;
        const el = this.root.querySelector<HTMLElement>(".progress-buffered");
        if (el)
            el.style.width = `${(buf.end(buf.length - 1) / dur) * 100}%`;
    }
    private _syncDuration(): void {
        const el = this.root.querySelector<HTMLElement>(".time-duration");
        if (el)
            el.textContent = this._fmt(this._video.duration);
        const t = this._getUrlTimestamp();
        if (t > 0)
            this._video.currentTime = t;
    }
    private _syncTimeDisplay(): void {
        const el = this.root.querySelector<HTMLElement>(".time-current");
        if (el)
            el.textContent = this._fmt(this._video.currentTime);
    }
    private _syncVolumeIcon(): void {
        const btn = this.root.querySelector<HTMLButtonElement>("[data-action='mute']");
        if (!btn)
            return;
        const muted = this._video.muted;
        const vol = this._video.volume;
        if (muted || vol === 0) {
            btn.innerHTML = VOL_MUTE;
            btn.setAttribute("aria-label", "Unmute");
        }
        else if (vol < 0.5) {
            btn.innerHTML = VOL_LOW;
            btn.setAttribute("aria-label", "Mute");
        }
        else {
            btn.innerHTML = VOL_HIGH;
            btn.setAttribute("aria-label", "Mute");
        }
        this._syncVolumeSlider();
    }
    private _syncVolumeSlider(): void {
        const slider = this.root.querySelector<HTMLInputElement>(".volume-slider");
        if (!slider)
            return;
        const val = this._video.muted ? 0 : this._video.volume;
        slider.value = String(val);
        slider.style.setProperty("--vol-fill", `${val * 100}%`);
    }
    private _syncTitle(): void {
        const el = this.root.querySelector<HTMLElement>(".player-title");
        if (!el)
            return;
        const text = this.getAttribute("title") ?? this._localFileName;
        el.textContent = text;
        el.classList.toggle("hidden", !text);
    }
    private _syncFullscreenBtn(): void {
        const btn = this.root.querySelector<HTMLButtonElement>("[data-action='fullscreen']");
        const player = this.root.querySelector<HTMLElement>(".player");
        if (!btn || !player)
            return;
        const active = !!document.fullscreenElement;
        btn.innerHTML = active ? FS_OFF : FS_ON;
        btn.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
        player.classList.toggle("is-fullscreen", active);
    }
    private async _share(): Promise<void> {
        const externalSrc = this.getAttribute("src");
        let shareUrl = "";
        let shareText: string;
        if (this._isEmbedSrc && externalSrc) {
            shareUrl = externalSrc;
            shareText = externalSrc;
        }
        else if (externalSrc) {
            const time = Math.floor(this._video.currentTime);
            try {
                const u = new URL(externalSrc);
                u.searchParams.set("t", String(time));
                shareUrl = u.toString();
            }
            catch {
                shareUrl = externalSrc.includes("?")
                    ? `${externalSrc}&t=${time}`
                    : `${externalSrc}?t=${time}`;
            }
            shareText = shareUrl;
        }
        else {
            shareText = `Timestamp: ${this._fmt(Math.floor(this._video.currentTime))}`;
        }
        if (shareUrl && navigator.share) {
            try {
                await navigator.share({ url: shareUrl, title: this.getAttribute("title") ?? document.title });
                this._toast("Shared!");
                return;
            }
            catch (err) {
                if (err instanceof Error && err.name === "AbortError")
                    return;
            }
        }
        try {
            await navigator.clipboard.writeText(shareText);
            this._toast(shareUrl ? "Link copied!" : "Timestamp copied!");
        }
        catch {
            this._toast(shareUrl ? shareText : `Time: ${this._fmt(Math.floor(this._video.currentTime))}`);
        }
    }
    private _toggleFullscreen(): void {
        const player = this.root.querySelector<HTMLElement>(".player");
        if (!player)
            return;
        if (!document.fullscreenElement) {
            void player.requestFullscreen();
        }
        else {
            void document.exitFullscreen();
        }
    }
    private _toast(msg: string): void {
        const el = this.root.querySelector<HTMLElement>(".toast");
        if (!el)
            return;
        el.textContent = msg;
        el.classList.add("toast--show");
        setTimeout(() => el.classList.remove("toast--show"), 2500);
    }
    private _seekToUrlTimestamp(): void {
        const t = this._getUrlTimestamp();
        if (t <= 0)
            return;
        if (this._video.readyState >= 1) {
            this._video.currentTime = t;
        }
        else {
            const handler = () => {
                this._video.currentTime = t;
                this._video.removeEventListener("loadedmetadata", handler);
            };
            this._video.addEventListener("loadedmetadata", handler);
        }
    }
    private _getUrlTimestamp(): number {
        const raw = new URLSearchParams(window.location.search).get("t");
        const t = raw ? parseFloat(raw) : 0;
        return isFinite(t) && t > 0 ? t : 0;
    }
    private _fmt(s: number): string {
        if (!isFinite(s) || isNaN(s))
            return "0:00";
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        if (h > 0)
            return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
        return `${m}:${String(sec).padStart(2, "0")}`;
    }
    private _esc(s: string): string {
        return s
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
}
customElements.define("td-video-player", UIVideoPlayer);
