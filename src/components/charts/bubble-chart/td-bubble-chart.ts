import { UIComponent } from '../../../core/component';
import styles from './td-bubble-chart.css?raw';
interface BubblePoint {
    x: number;
    y: number;
    r: number;
    label?: string;
}
interface BubbleSeries {
    label: string;
    color?: string;
    points: BubblePoint[];
}
type LegendPosition = 'top' | 'bottom' | 'left' | 'right';
export class UIBubbleChart extends UIComponent {
    static tag = 'td-bubble-chart';
    static observedAttributes = [
        'data', 'src', 'colors', 'height', 'width', 'title',
        'legend-position', 'x-label', 'y-label', 'show-values',
    ];
    private _data: BubbleSeries[] = [];
    private _colors: string[] = [];
    private _height: number = 360;
    private _width: string = '100%';
    private _title: string = '';
    private _legendPosition: LegendPosition = 'bottom';
    private _hidden: boolean[] = [];
    private _xLabel: string = '';
    private _yLabel: string = '';
    private _showValues: boolean = false;
    private _fetchController: AbortController | null = null;
    get data(): BubbleSeries[] { return this._data; }
    set data(val: BubbleSeries[]) {
        this._data = val;
        this._hidden = new Array(val.length).fill(false);
        this.render();
    }
    get colors(): string[] { return this._colors; }
    set colors(val: string[]) { this._colors = val; this.render(); }
    get height(): number { return this._height; }
    set height(val: number) { this._height = val; this.render(); }
    get width(): string { return this._width; }
    set width(val: string) { this._width = val; this.render(); }
    get title(): string { return this._title; }
    set title(val: string) { this._title = val; this.render(); }
    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        if (name === 'data') {
            try {
                this._data = JSON.parse(newValue);
                this._hidden = new Array(this._data.length).fill(false);
            }
            catch {
                this._data = [];
                this._hidden = [];
            }
            this.render();
        }
        if (name === 'colors') {
            try {
                this._colors = JSON.parse(newValue);
            }
            catch {
                this._colors = [];
            }
            this.render();
        }
        if (name === 'height') {
            const h = parseInt(newValue, 10);
            if (!isNaN(h) && h > 0)
                this._height = h;
            this.render();
        }
        if (name === 'width') {
            this._width = newValue || '100%';
            this.render();
        }
        if (name === 'title') {
            this._title = newValue || '';
            this.render();
        }
        if (name === 'legend-position') {
            if (['top', 'bottom', 'left', 'right'].includes(newValue)) {
                this._legendPosition = newValue as LegendPosition;
            }
            this.render();
        }
        if (name === 'x-label') {
            this._xLabel = newValue || '';
            this.render();
        }
        if (name === 'y-label') {
            this._yLabel = newValue || '';
            this.render();
        }
        if (name === 'show-values') {
            this._showValues = newValue !== null && newValue !== 'false';
            this.render();
        }
        if (name === 'src') {
            if (newValue)
                this._fetchSrc(newValue);
        }
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.hasAttribute('data')) {
            try {
                this._data = JSON.parse(this.getAttribute('data')!);
                this._hidden = new Array(this._data.length).fill(false);
            }
            catch {
                this._data = [];
            }
        }
        if (this.hasAttribute('colors')) {
            try {
                this._colors = JSON.parse(this.getAttribute('colors')!);
            }
            catch {
                this._colors = [];
            }
        }
        if (this.hasAttribute('height')) {
            const h = parseInt(this.getAttribute('height')!, 10);
            if (!isNaN(h) && h > 0)
                this._height = h;
        }
        if (this.hasAttribute('width'))
            this._width = this.getAttribute('width')!;
        if (this.hasAttribute('title'))
            this._title = this.getAttribute('title')!;
        if (this.hasAttribute('legend-position')) {
            const pos = this.getAttribute('legend-position');
            if (['top', 'bottom', 'left', 'right'].includes(pos!)) {
                this._legendPosition = pos as LegendPosition;
            }
        }
        if (this.hasAttribute('x-label'))
            this._xLabel = this.getAttribute('x-label')!;
        if (this.hasAttribute('y-label'))
            this._yLabel = this.getAttribute('y-label')!;
        if (this.hasAttribute('show-values')) {
            this._showValues = this.getAttribute('show-values') !== 'false';
        }
        this._hidden = new Array(this._data.length).fill(false);
        if (this.hasAttribute('src')) {
            this._fetchSrc(this.getAttribute('src')!);
        }
        this.render();
    }
    private _fetchSrc(url: string): void {
        this._fetchController?.abort();
        const controller = new AbortController();
        this._fetchController = controller;
        fetch(url, { signal: controller.signal })
            .then((r) => {
            if (!r.ok)
                throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
            .then((json: any) => {
            this.data = Array.isArray(json) ? json : (json.data ?? []);
        })
            .catch((err) => { if (err.name !== 'AbortError') { } });
    }
    disconnectedCallback(): void {
        this._fetchController?.abort();
        this._fetchController = null;
    }
    private _buildColor(series: BubbleSeries, i: number): string {
        return series.color || (this._colors.length ? this._colors[i % this._colors.length] : `hsl(${i * 55 + 180}, 65%, 55%)`);
    }
    private _niceScale(min: number, max: number, tickCount = 5): {
        niceMin: number;
        niceMax: number;
        niceStep: number;
    } {
        const range = max - min || 1;
        const rawStep = range / tickCount;
        const magnitude = rawStep > 0 ? Math.pow(10, Math.floor(Math.log10(rawStep))) : 1;
        const niceStep = Math.ceil(rawStep / magnitude) * magnitude || 1;
        const niceMin = Math.floor(min / niceStep) * niceStep;
        const niceMax = Math.ceil(max / niceStep) * niceStep || niceMin + niceStep;
        return { niceMin, niceMax, niceStep };
    }
    protected render() {
        if (!this.root)
            return;
        this.root.innerHTML = '';
        if (!this._data.length)
            return;
        if (!this._hidden || this._hidden.length !== this._data.length) {
            this._hidden = new Array(this._data.length).fill(false);
        }
        const visiblePoints = this._data.flatMap((s, i) => (this._hidden[i] ? [] : s.points));
        const scalePoints = visiblePoints.length ? visiblePoints : this._data.flatMap((s) => s.points);
        const allX = scalePoints.length ? scalePoints.map((p) => p.x) : [0, 1];
        const allY = scalePoints.length ? scalePoints.map((p) => p.y) : [0, 1];
        const allR = scalePoints.length ? scalePoints.map((p) => p.r) : [1];
        const { niceMin: xMin, niceMax: xMax, niceStep: xStep } = this._niceScale(Math.min(...allX), Math.max(...allX));
        const { niceMin: yMin, niceMax: yMax, niceStep: yStep } = this._niceScale(Math.min(...allY), Math.max(...allY));
        const maxR = Math.max(...allR, 1);
        const minBubblePx = 6;
        const maxBubblePx = 32;
        const bubblePx = (r: number) => minBubblePx + (r / maxR) * (maxBubblePx - minBubblePx);
        const svgWidth = 600;
        const leftPad = this._yLabel ? 68 : 52;
        const rightPad = 24;
        const topPad = 24;
        const bottomPad = this._xLabel ? 52 : 38;
        const chartWidth = svgWidth - leftPad - rightPad;
        const chartHeight = this._height - topPad - bottomPad;
        const xPos = (x: number) => leftPad + ((x - xMin) / (xMax - xMin || 1)) * chartWidth;
        const yPos = (y: number) => topPad + chartHeight - ((y - yMin) / (yMax - yMin || 1)) * chartHeight;
        const tooltipId = 'bubble-tooltip-' + Math.random().toString(36).slice(2);
        let svgHtml = `<svg class="bubble-chart-svg" viewBox="0 0 ${svgWidth} ${this._height}" overflow="visible" role="img" aria-label="${this._title || 'Bubble chart'}">`;
        for (let t = yMin; t <= yMax + yStep * 0.01; t = Math.round((t + yStep) * 1e9) / 1e9) {
            const gy = yPos(t);
            svgHtml += `<line x1="${leftPad}" y1="${gy}" x2="${svgWidth - rightPad}" y2="${gy}" class="bubble-gridline" />`;
            svgHtml += `<text x="${leftPad - 6}" y="${gy + 4}" text-anchor="end" class="bubble-axis-label">${Math.round(t)}</text>`;
        }
        for (let t = xMin; t <= xMax + xStep * 0.01; t = Math.round((t + xStep) * 1e9) / 1e9) {
            const gx = xPos(t);
            svgHtml += `<line x1="${gx}" y1="${topPad}" x2="${gx}" y2="${topPad + chartHeight}" class="bubble-gridline bubble-gridline--vert" />`;
            svgHtml += `<text x="${gx}" y="${topPad + chartHeight + 16}" text-anchor="middle" class="bubble-axis-label">${Math.round(t)}</text>`;
        }
        svgHtml += `<line x1="${leftPad}" y1="${topPad}" x2="${leftPad}" y2="${topPad + chartHeight}" class="bubble-axis-line" />`;
        svgHtml += `<line x1="${leftPad}" y1="${topPad + chartHeight}" x2="${svgWidth - rightPad}" y2="${topPad + chartHeight}" class="bubble-axis-line" />`;
        if (this._xLabel) {
            svgHtml += `<text x="${leftPad + chartWidth / 2}" y="${this._height - 4}" text-anchor="middle" class="bubble-axis-name">${this._xLabel}</text>`;
        }
        if (this._yLabel) {
            const midY = topPad + chartHeight / 2;
            svgHtml += `<text x="12" y="${midY}" text-anchor="middle" transform="rotate(-90,12,${midY})" class="bubble-axis-name">${this._yLabel}</text>`;
        }
        this._data.forEach((series, si) => {
            if (this._hidden[si])
                return;
            const color = this._buildColor(series, si);
            series.points.forEach((p, pi) => {
                const cx = xPos(p.x);
                const cy = yPos(p.y);
                const r = bubblePx(p.r);
                svgHtml += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="0.6" stroke="${color}" stroke-width="1.5" data-series="${si}" data-point="${pi}" tabindex="0" class="bubble-dot" />`;
                if (this._showValues) {
                    svgHtml += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" class="bubble-value-label" style="pointer-events:none">${p.r}</text>`;
                }
            });
        });
        svgHtml += `</svg>`;
        svgHtml += `<div id="${tooltipId}" class="bubble-tooltip"></div>`;
        let legendHtml = `<div class="bubble-legend bubble-legend--${this._legendPosition}">`;
        this._data.forEach((series, i) => {
            const color = this._buildColor(series, i);
            legendHtml += `<button type="button" class="bubble-legend-item" tabindex="0" aria-pressed="${!this._hidden[i]}" data-index="${i}" style="opacity:${this._hidden[i] ? 0.5 : 1};">
        <span class="bubble-legend-swatch" style="background:${color};"></span>
        <span>${series.label}</span>
      </button>`;
        });
        legendHtml += `</div>`;
        const titleHtml = this._title ? `<div class="bubble-chart-title">${this._title}</div>` : '';
        let layout: string;
        if (this._legendPosition === 'top') {
            layout = titleHtml + legendHtml + svgHtml;
        }
        else if (this._legendPosition === 'bottom') {
            layout = titleHtml + svgHtml + legendHtml;
        }
        else if (this._legendPosition === 'left') {
            layout = `${titleHtml}<div class="chart-side-layout"><div>${legendHtml}</div><div class="chart-side-chart">${svgHtml}</div></div>`;
        }
        else {
            layout = `${titleHtml}<div class="chart-side-layout"><div class="chart-side-chart">${svgHtml}</div><div>${legendHtml}</div></div>`;
        }
        this.style.width = this._width;
        this.root.innerHTML = this.css(styles) + layout;
        const svg = this.root.querySelector('svg');
        const tooltip = this.root.getElementById(tooltipId);
        if (svg && tooltip) {
            svg.querySelectorAll<SVGCircleElement>('circle.bubble-dot').forEach((dot) => {
                const si = parseInt(dot.getAttribute('data-series')!, 10);
                const pi = parseInt(dot.getAttribute('data-point')!, 10);
                const show = () => {
                    const s = this._data[si];
                    const p = s.points[pi];
                    const pointLabel = p.label ? `<br><em>${p.label}</em>` : '';
                    tooltip.innerHTML = `<strong>${s.label}</strong>${pointLabel}<br>x: ${p.x} &nbsp; y: ${p.y} &nbsp; size: ${p.r}`;
                    tooltip.style.display = 'block';
                    dot.setAttribute('stroke-width', '3');
                    dot.setAttribute('fill-opacity', '0.88');
                };
                const hide = () => {
                    tooltip.style.display = 'none';
                    tooltip.style.transform = '';
                    dot.setAttribute('stroke-width', '1.5');
                    dot.setAttribute('fill-opacity', '0.6');
                };
                dot.addEventListener('mouseenter', show);
                dot.addEventListener('mousemove', (e) => {
                    const box = svg.getBoundingClientRect();
                    tooltip.style.left = ((e as MouseEvent).clientX - box.left + 12) + 'px';
                    tooltip.style.top = ((e as MouseEvent).clientY - box.top - 12) + 'px';
                });
                dot.addEventListener('mouseleave', hide);
                dot.addEventListener('focus', () => {
                    show();
                    tooltip.style.left = '50%';
                    tooltip.style.top = '8px';
                    tooltip.style.transform = 'translateX(-50%)';
                });
                dot.addEventListener('blur', hide);
            });
        }
        this.root.querySelectorAll('.bubble-legend-item').forEach((item, i) => {
            item.addEventListener('mouseenter', () => {
                this.root.querySelectorAll<SVGCircleElement>('circle.bubble-dot').forEach((dot) => {
                    dot.style.opacity = parseInt(dot.getAttribute('data-series')!, 10) === i ? '1' : '0.15';
                });
            });
            item.addEventListener('mouseleave', () => {
                this.root.querySelectorAll<SVGCircleElement>('circle.bubble-dot').forEach((dot) => {
                    dot.style.opacity = '';
                });
            });
            item.addEventListener('click', () => {
                this._hidden[i] = !this._hidden[i];
                this.render();
            });
            item.addEventListener('keydown', (e) => {
                const ke = e as KeyboardEvent;
                if (ke.key === ' ' || ke.key === 'Enter') {
                    ke.preventDefault();
                    this._hidden[i] = !this._hidden[i];
                    this.render();
                }
            });
        });
    }
}
customElements.define(UIBubbleChart.tag, UIBubbleChart);
