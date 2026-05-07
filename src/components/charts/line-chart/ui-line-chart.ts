import { UIComponent } from '../../../core/component';
import styles from './ui-line-chart.css?raw';

interface LineChartSeries {
  label: string;
  values: number[];
  color?: string;
}

type LegendPosition = 'top' | 'bottom' | 'left' | 'right';

export class UILineChart extends UIComponent {
  static tag = 'ui-line-chart';
  static observedAttributes = ['data', 'src', 'x-labels', 'colors', 'height', 'width', 'title', 'legend-position', 'show-values'];

  private _data: LineChartSeries[] = [];
  private _xLabels: string[] = [];
  private _colors: string[] = [];
  private _height: number = 300;
  private _width: string = '100%';
  private _title: string = '';
  private _legendPosition: LegendPosition = 'bottom';
  private _hidden: boolean[] = [];
  private _showValues: boolean = false;

  get data(): LineChartSeries[] { return this._data; }
  set data(val: LineChartSeries[]) { this._data = val; this.render(); }

  get xLabels(): string[] { return this._xLabels; }
  set xLabels(val: string[]) { this._xLabels = val; this.render(); }

  get colors(): string[] { return this._colors; }
  set colors(val: string[]) { this._colors = val; this.render(); }

  get height(): number { return this._height; }
  set height(val: number) { this._height = val; this.render(); }

  get width(): string { return this._width; }
  set width(val: string) { this._width = val; this.render(); }

  get title(): string { return this._title; }
  set title(val: string) { this._title = val; this.render(); }

  get legendPosition(): LegendPosition { return this._legendPosition; }
  set legendPosition(val: LegendPosition) { this._legendPosition = val; this.render(); }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === 'data') {
      try {
        this._data = JSON.parse(newValue);
        this._hidden = new Array(this._data.length).fill(false);
      } catch { this._data = []; this._hidden = []; }
      this.render();
    }
    if (name === 'x-labels') {
      try { this._xLabels = JSON.parse(newValue); } catch { this._xLabels = []; }
      this.render();
    }
    if (name === 'colors') {
      try { this._colors = JSON.parse(newValue); } catch { this._colors = []; }
      this.render();
    }
    if (name === 'height') {
      const h = parseInt(newValue, 10);
      if (!isNaN(h) && h > 0) this._height = h;
      this.render();
    }
    if (name === 'width') { this._width = newValue || '100%'; this.render(); }
    if (name === 'title') { this._title = newValue || ''; this.render(); }
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
    if (name === 'src') {
      if (newValue) this._fetchSrc(newValue);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasAttribute('data')) {
      try {
        this._data = JSON.parse(this.getAttribute('data')!);
        this._hidden = new Array(this._data.length).fill(false);
      } catch { this._data = []; }
    }
    if (this.hasAttribute('x-labels')) {
      try { this._xLabels = JSON.parse(this.getAttribute('x-labels')!); } catch { this._xLabels = []; }
    }
    if (this.hasAttribute('colors')) {
      try { this._colors = JSON.parse(this.getAttribute('colors')!); } catch { this._colors = []; }
    }
    if (this.hasAttribute('height')) {
      const h = parseInt(this.getAttribute('height')!, 10);
      if (!isNaN(h) && h > 0) this._height = h;
    }
    if (this.hasAttribute('width')) this._width = this.getAttribute('width')!;
    if (this.hasAttribute('title')) this._title = this.getAttribute('title')!;
    if (this.hasAttribute('legend-position')) {
      const pos = this.getAttribute('legend-position');
      if (['top', 'bottom', 'left', 'right'].includes(pos!)) {
        this._legendPosition = pos as LegendPosition;
      }
    }
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
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: any) => {
        if (Array.isArray(json)) {
          this.data = json;
        } else {
          if (json.labels) this._xLabels = json.labels;
          this.data = json.data ?? [];
        }
        this._hidden = new Array(this._data.length).fill(false);
      })
      .catch(() => {});
  }

  private _buildColor(series: LineChartSeries, i: number): string {
    return series.color || (this._colors.length ? this._colors[i % this._colors.length] : `hsl(${i * 60}, 70%, 60%)`);
  }

  private _niceScale(max: number, tickCount = 5): { niceMax: number; niceStep: number } {
    const rawStep = max / tickCount;
    const magnitude = rawStep > 0 ? Math.pow(10, Math.floor(Math.log10(rawStep))) : 1;
    const niceStep = Math.ceil(rawStep / magnitude) * magnitude || 1;
    const niceMax = Math.ceil(max / niceStep) * niceStep || 1;
    return { niceMax, niceStep };
  }

  protected render() {
    if (!this.root) return;
    this.root.innerHTML = '';
    if (!this._data.length) return;
    if (!this._hidden || this._hidden.length !== this._data.length) {
      this._hidden = new Array(this._data.length).fill(false);
    }

    const allValues = this._data.flatMap((s, i) => this._hidden[i] ? [] : s.values);
    const max = Math.max(...allValues, 1);
    const { niceMax, niceStep } = this._niceScale(max);

    const pointCount = this._xLabels.length || (this._data[0]?.values.length ?? 0);

    const svgWidth = 600;
    const chartLeft = 52;
    const chartTop = 16;
    const chartRight = 16;
    const chartWidth = svgWidth - chartLeft - chartRight;
    const fontSize = 11;

    const slotWidth = pointCount > 1 ? chartWidth / (pointCount - 1) : chartWidth;
    const angledLabels = slotWidth < 60;
    const chartBottom = angledLabels ? 72 : 40;
    const chartHeight = this._height - chartTop - chartBottom;

    const longestLabel = this._xLabels.reduce((m, l) => Math.max(m, l.length), 0);
    const labelTextWidth = longestLabel * fontSize * 0.6;
    const sin40 = Math.sin(40 * Math.PI / 180);
    const labelY = chartTop + chartHeight + 18;
    const labelBottom = labelY + (angledLabels ? labelTextWidth * sin40 + fontSize : fontSize);
    const totalHeight = Math.ceil(Math.max(this._height, labelBottom + 4));

    const xPos = (i: number) =>
      pointCount <= 1
        ? chartLeft + chartWidth / 2
        : chartLeft + (i / (pointCount - 1)) * chartWidth;

    const yPos = (v: number) =>
      chartTop + chartHeight - (v / niceMax) * chartHeight;

    const tooltipId = 'line-tooltip-' + Math.random().toString(36).slice(2);

    let svgHtml = `<svg class="line-chart-svg" viewBox="0 0 ${svgWidth} ${totalHeight}" overflow="visible">`;

    for (let t = 0; t <= niceMax; t += niceStep) {
      const gy = yPos(t);
      svgHtml += `<line x1="${chartLeft}" y1="${gy}" x2="${svgWidth - chartRight}" y2="${gy}" class="line-chart-gridline" />`;
      svgHtml += `<text x="${chartLeft - 6}" y="${gy + 4}" text-anchor="end" class="line-chart-axis-label">${t}</text>`;
    }

    for (let i = 0; i < pointCount; i++) {
      const lx = xPos(i);
      const label = this._xLabels[i] ?? String(i + 1);
      if (angledLabels) {
        svgHtml += `<text x="${lx}" y="${labelY}" text-anchor="end" transform="rotate(-40,${lx},${labelY})" class="line-chart-axis-label">${label}</text>`;
      } else {
        svgHtml += `<text x="${lx}" y="${labelY}" text-anchor="middle" class="line-chart-axis-label">${label}</text>`;
      }
    }

    this._data.forEach((series, si) => {
      if (this._hidden[si]) return;
      const color = this._buildColor(series, si);
      const points = series.values.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ');
      svgHtml += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" data-series-index="${si}" class="line-chart-line" />`;
    });

    this._data.forEach((series, si) => {
      if (this._hidden[si]) return;
      const color = this._buildColor(series, si);
      series.values.forEach((v, pi) => {
        svgHtml += `<circle cx="${xPos(pi)}" cy="${yPos(v)}" r="5" fill="${color}" stroke="#fff" stroke-width="1.5" data-series="${si}" data-point="${pi}" tabindex="0" class="line-chart-dot" />`;
        if (this._showValues) {
          svgHtml += `<text x="${xPos(pi)}" y="${yPos(v) - 10}" text-anchor="middle" class="line-value-label" style="fill:${color}">${v}</text>`;
        }
      });
    });

    svgHtml += `</svg>`;
    svgHtml += `<div id="${tooltipId}" class="line-tooltip"></div>`;

    let legendHtml = `<div class="line-legend line-legend--${this._legendPosition}">`;
    this._data.forEach((series, i) => {
      const color = this._buildColor(series, i);
      legendHtml += `<button type="button" class="line-legend-item" tabindex="0" aria-pressed="${!this._hidden[i]}" data-index="${i}" style="opacity:${this._hidden[i] ? 0.5 : 1};">
        <span class="line-legend-swatch" style="background:${color};"></span>
        <span>${series.label}</span>
      </button>`;
    });
    legendHtml += `</div>`;

    const titleHtml = this._title ? `<div class="line-chart-title">${this._title}</div>` : '';

    let layout: string;
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
      svg.querySelectorAll<SVGCircleElement>('circle.line-chart-dot').forEach((dot) => {
        const si = parseInt(dot.getAttribute('data-series')!, 10);
        const pi = parseInt(dot.getAttribute('data-point')!, 10);

        dot.addEventListener('mouseenter', () => {
          const s = this._data[si];
          const xLabel = this._xLabels[pi] ?? String(pi + 1);
          tooltip.textContent = `${s.label} — ${xLabel}: ${s.values[pi]}`;
          tooltip.style.display = 'block';
          dot.setAttribute('r', '7');
          dot.setAttribute('stroke-width', '2.5');
        });
        dot.addEventListener('mousemove', (e) => {
          const evt = e as MouseEvent;
          const box = svg.getBoundingClientRect();
          tooltip.style.left = (evt.clientX - box.left + 12) + 'px';
          tooltip.style.top = (evt.clientY - box.top - 12) + 'px';
        });
        dot.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
          dot.setAttribute('r', '5');
          dot.setAttribute('stroke-width', '1.5');
        });
        dot.addEventListener('focus', () => {
          const s = this._data[si];
          const xLabel = this._xLabels[pi] ?? String(pi + 1);
          tooltip.textContent = `${s.label} — ${xLabel}: ${s.values[pi]}`;
          tooltip.style.display = 'block';
          tooltip.style.left = '50%';
          tooltip.style.top = '10px';
          tooltip.style.transform = 'translateX(-50%)';
          dot.setAttribute('r', '7');
          dot.setAttribute('stroke-width', '2.5');
        });
        dot.addEventListener('blur', () => {
          tooltip.style.display = 'none';
          tooltip.style.transform = '';
          dot.setAttribute('r', '5');
          dot.setAttribute('stroke-width', '1.5');
        });
      });
    }

    this.root.querySelectorAll('.line-legend-item').forEach((item, i) => {
      item.addEventListener('mouseenter', () => {
        this.root.querySelectorAll<SVGElement>('.line-chart-line').forEach((line, li) => {
          line.style.opacity = li === i ? '1' : '0.2';
        });
        this.root.querySelectorAll<SVGCircleElement>('circle.line-chart-dot').forEach((dot) => {
          const si = parseInt(dot.getAttribute('data-series')!, 10);
          dot.style.opacity = si === i ? '1' : '0.2';
        });
      });
      item.addEventListener('mouseleave', () => {
        this.root.querySelectorAll<SVGElement>('.line-chart-line').forEach((line) => {
          line.style.opacity = '';
        });
        this.root.querySelectorAll<SVGCircleElement>('circle.line-chart-dot').forEach((dot) => {
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

customElements.define(UILineChart.tag, UILineChart);
