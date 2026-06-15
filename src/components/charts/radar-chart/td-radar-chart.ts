import { UIComponent } from '../../../core/component';
import styles from './td-radar-chart.css?raw';

interface RadarChartSeries {
    label: string;
    values: number[];
    color?: string;
}

type LegendPosition = 'top' | 'bottom' | 'left' | 'right';

interface RadarApiPayload {
    labels?: string[];
    axisLabels?: string[];
    data?: RadarChartSeries[];
}

export class UIRadarChart extends UIComponent {
    static tag = 'td-radar-chart';
    static observedAttributes = [
        'data', 'src', 'axis-labels', 'x-labels', 'colors', 'height', 'width',
        'title', 'legend-position', 'show-values', 'max-value',
    ];

    private _data: RadarChartSeries[] = [];
    private _axisLabels: string[] = [];
    private _colors: string[] = [];
    private _height: number = 420;
    private _width: string = '100%';
    private _title: string = '';
    private _legendPosition: LegendPosition = 'bottom';
    private _hidden: boolean[] = [];
    private _showValues: boolean = false;
    private _maxValue: number | null = null;
    private _fetchController: AbortController | null = null;

    get data(): RadarChartSeries[] { return this._data; }
    set data(val: RadarChartSeries[]) {
        this._data = val;
        this._hidden = new Array(val.length).fill(false);
        this.render();
    }

    get axisLabels(): string[] { return this._axisLabels; }
    set axisLabels(val: string[]) {
        this._axisLabels = val;
        this.render();
    }

    get colors(): string[] { return this._colors; }
    set colors(val: string[]) {
        this._colors = val;
        this.render();
    }

    get height(): number { return this._height; }
    set height(val: number) {
        this._height = val;
        this.render();
    }

    get width(): string { return this._width; }
    set width(val: string) {
        this._width = val;
        this.render();
    }

    get title(): string { return this._title; }
    set title(val: string) {
        this._title = val;
        this.render();
    }

    get legendPosition(): LegendPosition { return this._legendPosition; }
    set legendPosition(val: LegendPosition) {
        this._legendPosition = val;
        this.render();
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        if (name === 'data') {
            try {
                this._data = JSON.parse(newValue);
                this._hidden = new Array(this._data.length).fill(false);
            } catch {
                this._data = [];
                this._hidden = [];
            }
            this.render();
        }

        if (name === 'axis-labels' || name === 'x-labels') {
            try {
                this._axisLabels = JSON.parse(newValue);
            } catch {
                this._axisLabels = [];
            }
            this.render();
        }

        if (name === 'colors') {
            try {
                this._colors = JSON.parse(newValue);
            } catch {
                this._colors = [];
            }
            this.render();
        }

        if (name === 'height') {
            const h = parseInt(newValue, 10);
            if (!isNaN(h) && h > 0) {
                this._height = h;
            }
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

        if (name === 'show-values') {
            this._showValues = newValue !== null && newValue !== 'false';
            this.render();
        }

        if (name === 'max-value') {
            const m = parseFloat(newValue);
            this._maxValue = !isNaN(m) && m > 0 ? m : null;
            this.render();
        }

        if (name === 'src' && newValue) {
            this._fetchSrc(newValue);
        }
    }

    connectedCallback() {
        super.connectedCallback();

        if (this.hasAttribute('data')) {
            try {
                this._data = JSON.parse(this.getAttribute('data')!);
                this._hidden = new Array(this._data.length).fill(false);
            } catch {
                this._data = [];
                this._hidden = [];
            }
        }

        if (this.hasAttribute('axis-labels')) {
            try {
                this._axisLabels = JSON.parse(this.getAttribute('axis-labels')!);
            } catch {
                this._axisLabels = [];
            }
        } else if (this.hasAttribute('x-labels')) {
            try {
                this._axisLabels = JSON.parse(this.getAttribute('x-labels')!);
            } catch {
                this._axisLabels = [];
            }
        }

        if (this.hasAttribute('colors')) {
            try {
                this._colors = JSON.parse(this.getAttribute('colors')!);
            } catch {
                this._colors = [];
            }
        }

        if (this.hasAttribute('height')) {
            const h = parseInt(this.getAttribute('height')!, 10);
            if (!isNaN(h) && h > 0) {
                this._height = h;
            }
        }

        if (this.hasAttribute('width')) {
            this._width = this.getAttribute('width')!;
        }

        if (this.hasAttribute('title')) {
            this._title = this.getAttribute('title')!;
        }

        if (this.hasAttribute('legend-position')) {
            const pos = this.getAttribute('legend-position');
            if (pos && ['top', 'bottom', 'left', 'right'].includes(pos)) {
                this._legendPosition = pos as LegendPosition;
            }
        }

        if (this.hasAttribute('show-values')) {
            this._showValues = this.getAttribute('show-values') !== 'false';
        }

        if (this.hasAttribute('max-value')) {
            const m = parseFloat(this.getAttribute('max-value')!);
            this._maxValue = !isNaN(m) && m > 0 ? m : null;
        }

        this._hidden = new Array(this._data.length).fill(false);

        if (this.hasAttribute('src')) {
            this._fetchSrc(this.getAttribute('src')!);
        }

        this.render();
    }

    disconnectedCallback(): void {
        this._fetchController?.abort();
        this._fetchController = null;
    }

    private _fetchSrc(url: string): void {
        this._fetchController?.abort();
        const controller = new AbortController();
        this._fetchController = controller;

        fetch(url, { signal: controller.signal })
            .then((r) => {
                if (!r.ok) {
                    throw new Error(`HTTP ${r.status}`);
                }
                return r.json() as Promise<unknown>;
            })
            .then((json) => {
                if (Array.isArray(json)) {
                    this.data = json as RadarChartSeries[];
                    return;
                }

                if (json && typeof json === 'object') {
                    const payload = json as RadarApiPayload;
                    if (Array.isArray(payload.labels)) {
                        this._axisLabels = payload.labels;
                    } else if (Array.isArray(payload.axisLabels)) {
                        this._axisLabels = payload.axisLabels;
                    }
                    this.data = Array.isArray(payload.data) ? payload.data : [];
                }
            })
            .catch((err: unknown) => {
                if (!(err instanceof Error) || err.name !== 'AbortError') {
                }
            });
    }

    private _buildColor(series: RadarChartSeries, i: number): string {
        return series.color || (this._colors.length ? this._colors[i % this._colors.length] : `hsl(${i * 65 + 180}, 70%, 55%)`);
    }

    private _niceScale(max: number, tickCount = 5): { niceMax: number; niceStep: number } {
        const safeMax = Math.max(max, 1);
        const rawStep = safeMax / tickCount;
        const magnitude = rawStep > 0 ? Math.pow(10, Math.floor(Math.log10(rawStep))) : 1;
        const niceStep = Math.ceil(rawStep / magnitude) * magnitude || 1;
        const niceMax = Math.ceil(safeMax / niceStep) * niceStep || 1;
        return { niceMax, niceStep };
    }

    protected render() {
        if (!this.root) {
            return;
        }

        this.root.innerHTML = '';

        if (!this._data.length) {
            return;
        }

        if (!this._hidden || this._hidden.length !== this._data.length) {
            this._hidden = new Array(this._data.length).fill(false);
        }

        const visibleSeries = this._data.filter((_, i) => !this._hidden[i]);

        const inferredPointCount = Math.max(...this._data.map((s) => s.values.length), 0);
        const pointCount = this._axisLabels.length || inferredPointCount;
        if (pointCount < 3) {
            return;
        }

        const labels = Array.from({ length: pointCount }, (_, i) => this._axisLabels[i] ?? String(i + 1));
        const valueSource = visibleSeries.length ? visibleSeries : this._data;
        const allValues = valueSource.flatMap((s) => s.values.slice(0, pointCount));
        const { niceMax, niceStep } = this._niceScale(Math.max(...allValues, 1));
        const maxValue = this._maxValue && this._maxValue > 0 ? Math.max(this._maxValue, 1) : niceMax;

        const svgWidth = 600;
        const topPad = 36;
        const bottomPad = 48;
        const sidePad = 70;
        const cx = svgWidth / 2;
        const cy = this._height / 2;
        const radius = Math.max(1, Math.min((svgWidth - sidePad * 2) / 2, (this._height - topPad - bottomPad) / 2));

        const angleStep = (Math.PI * 2) / pointCount;
        const toPoint = (index: number, valueRatio: number): { x: number; y: number } => {
            const angle = -Math.PI / 2 + index * angleStep;
            const r = radius * valueRatio;
            return {
                x: cx + r * Math.cos(angle),
                y: cy + r * Math.sin(angle),
            };
        };

        const tooltipId = `radar-tooltip-${Math.random().toString(36).slice(2)}`;
        let svgHtml = `<svg class="radar-chart-svg" viewBox="0 0 ${svgWidth} ${this._height}" overflow="visible" role="img" aria-label="${this._title || 'Radar chart'}">`;

        for (let level = 1; level <= 5; level++) {
            const ratio = level / 5;
            const points = labels.map((_, i) => {
                const p = toPoint(i, ratio);
                return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
            }).join(' ');
            svgHtml += `<polygon points="${points}" class="radar-grid-ring"></polygon>`;
        }

        for (let t = niceStep; t <= maxValue + niceStep * 0.01; t += niceStep) {
            const ratio = Math.min(1, t / maxValue);
            const p = toPoint(0, ratio);
            svgHtml += `<text x="${(p.x + 6).toFixed(1)}" y="${(p.y - 4).toFixed(1)}" class="radar-value-label">${Math.round(t)}</text>`;
        }

        labels.forEach((label, i) => {
            const edge = toPoint(i, 1);
            const axisAnchor = edge.x > cx + 6 ? 'start' : edge.x < cx - 6 ? 'end' : 'middle';
            const labelPoint = toPoint(i, 1.09);
            svgHtml += `<line x1="${cx}" y1="${cy}" x2="${edge.x}" y2="${edge.y}" class="radar-axis-line"></line>`;
            svgHtml += `<text x="${labelPoint.x.toFixed(1)}" y="${labelPoint.y.toFixed(1)}" text-anchor="${axisAnchor}" class="radar-axis-label">${label}</text>`;
        });

        this._data.forEach((series, si) => {
            if (this._hidden[si]) {
                return;
            }

            const color = this._buildColor(series, si);
            const linePoints = labels.map((_, i) => {
                const value = series.values[i] ?? 0;
                const ratio = Math.max(0, Math.min(1, value / maxValue));
                const p = toPoint(i, ratio);
                return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
            }).join(' ');

            svgHtml += `<polygon points="${linePoints}" fill="${color}" fill-opacity="0.18" stroke="none" class="radar-series-area" data-series-index="${si}"></polygon>`;
            svgHtml += `<polyline points="${linePoints}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" class="radar-series-line" data-series-index="${si}"></polyline>`;

            labels.forEach((_, i) => {
                const value = series.values[i] ?? 0;
                const ratio = Math.max(0, Math.min(1, value / maxValue));
                const p = toPoint(i, ratio);
                svgHtml += `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="4.5" fill="${color}" stroke="#fff" stroke-width="1.4" tabindex="0" class="radar-point" data-series="${si}" data-point="${i}"></circle>`;
                if (this._showValues) {
                    svgHtml += `<text x="${p.x.toFixed(2)}" y="${(p.y - 10).toFixed(2)}" text-anchor="middle" class="radar-value-label">${value}</text>`;
                }
            });
        });

        svgHtml += `</svg><div id="${tooltipId}" class="radar-tooltip"></div>`;

        let legendHtml = `<div class="radar-legend radar-legend--${this._legendPosition}">`;
        this._data.forEach((series, i) => {
            const color = this._buildColor(series, i);
            legendHtml += `<button type="button" class="radar-legend-item" tabindex="0" aria-pressed="${!this._hidden[i]}" data-index="${i}" style="opacity:${this._hidden[i] ? 0.5 : 1};">
                <span class="radar-legend-swatch" style="background:${color};"></span>
                <span>${series.label}</span>
            </button>`;
        });
        legendHtml += `</div>`;

        const titleHtml = this._title ? `<div class="radar-chart-title">${this._title}</div>` : '';
        let layout = '';
        if (this._legendPosition === 'top') {
            layout = titleHtml + legendHtml + svgHtml;
        } else if (this._legendPosition === 'bottom') {
            layout = titleHtml + svgHtml + legendHtml;
        } else if (this._legendPosition === 'left') {
            layout = `${titleHtml}<div class="chart-side-layout"><div>${legendHtml}</div><div class="chart-side-chart">${svgHtml}</div></div>`;
        } else {
            layout = `${titleHtml}<div class="chart-side-layout"><div class="chart-side-chart">${svgHtml}</div><div>${legendHtml}</div></div>`;
        }

        this.style.width = this._width;
        this.root.innerHTML = this.css(styles) + layout;

        const svg = this.root.querySelector('svg');
        const tooltip = this.root.getElementById(tooltipId);

        if (svg && tooltip) {
            svg.querySelectorAll<SVGCircleElement>('circle.radar-point').forEach((dot) => {
                const si = parseInt(dot.getAttribute('data-series') || '0', 10);
                const pi = parseInt(dot.getAttribute('data-point') || '0', 10);

                const show = () => {
                    const series = this._data[si];
                    const axisLabel = labels[pi] ?? String(pi + 1);
                    const value = series.values[pi] ?? 0;
                    tooltip.innerHTML = `<strong>${series.label}</strong><br>${axisLabel}: ${value}`;
                    tooltip.style.display = 'block';
                    dot.setAttribute('r', '6');
                    dot.setAttribute('stroke-width', '2.2');
                };

                const hide = () => {
                    tooltip.style.display = 'none';
                    tooltip.style.transform = '';
                    dot.setAttribute('r', '4.5');
                    dot.setAttribute('stroke-width', '1.4');
                };

                dot.addEventListener('mouseenter', show);
                dot.addEventListener('mousemove', (e) => {
                    const evt = e as MouseEvent;
                    const box = svg.getBoundingClientRect();
                    tooltip.style.left = `${evt.clientX - box.left + 12}px`;
                    tooltip.style.top = `${evt.clientY - box.top - 12}px`;
                });
                dot.addEventListener('mouseleave', hide);
                dot.addEventListener('focus', () => {
                    show();
                    tooltip.style.left = '50%';
                    tooltip.style.top = '10px';
                    tooltip.style.transform = 'translateX(-50%)';
                });
                dot.addEventListener('blur', hide);
            });
        }

        this.root.querySelectorAll<HTMLElement>('.radar-legend-item').forEach((item, i) => {
            item.addEventListener('mouseenter', () => {
                this.root.querySelectorAll<SVGElement>('.radar-series-area, .radar-series-line').forEach((part) => {
                    const si = parseInt(part.getAttribute('data-series-index') || '-1', 10);
                    part.style.opacity = si === i ? '1' : '0.2';
                });
                this.root.querySelectorAll<SVGCircleElement>('circle.radar-point').forEach((dot) => {
                    const si = parseInt(dot.getAttribute('data-series') || '-1', 10);
                    dot.style.opacity = si === i ? '1' : '0.2';
                });
            });

            item.addEventListener('mouseleave', () => {
                this.root.querySelectorAll<SVGElement>('.radar-series-area, .radar-series-line').forEach((part) => {
                    part.style.opacity = '';
                });
                this.root.querySelectorAll<SVGCircleElement>('circle.radar-point').forEach((dot) => {
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

customElements.define(UIRadarChart.tag, UIRadarChart);
