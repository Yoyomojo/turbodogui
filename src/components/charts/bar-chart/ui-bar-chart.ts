import { UIComponent } from '../../../core/component';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface ReferenceLine {
  value: number;
  label?: string;
  color?: string;
}

interface LineSeries {
  label: string;
  values: number[];
  color?: string;
}

type LegendPosition = 'top' | 'bottom' | 'left' | 'right';

export class UIBarChart extends UIComponent {
  static tag = 'ui-bar-chart';
  static observedAttributes = ['data', 'colors', 'height', 'width', 'horizontal', 'title', 'font-size', 'legend-position', 'reference-lines', 'line-series'];

  private _data: BarChartData[] = [];
  private _colors: string[] = [];
  private _height: number = 200;
  private _width: string = '100%';
  private _horizontal: boolean = false;
  private _title: string = '';
  private _fontSize: string = '';
  private _legendPosition: LegendPosition = 'bottom';
  private _hidden: boolean[] = [];
  private _referenceLines: ReferenceLine[] = [];
  private _hiddenRefLines: boolean[] = [];
  private _lineSeries: LineSeries[] = [];
  private _hiddenLineSeries: boolean[] = [];

  get width(): string {
    return this._width;
  }
  set width(val: string) {
    this._width = val;
    this.render();
  }

  get horizontal(): boolean {
    return this._horizontal;
  }
  set horizontal(val: boolean) {
    this._horizontal = val;
    this.render();
  }

  get title(): string {
    return this._title;
  }
  set title(val: string) {
    this._title = val;
    this.render();
  }

  get fontSize(): string {
    return this._fontSize;
  }
  set fontSize(val: string) {
    this._fontSize = val;
    this.render();
  }

  get legendPosition(): LegendPosition {
    return this._legendPosition;
  }
  set legendPosition(val: LegendPosition) {
    this._legendPosition = val;
    this.render();
  }

  get height(): number {
    return this._height;
  }
  set height(val: number) {
    this._height = val;
    this.render();
  }

  get data(): BarChartData[] {
    return this._data;
  }
  set data(val: BarChartData[]) {
    this._data = val;
    this.render();
  }

  get colors(): string[] {
    return this._colors;
  }
  set colors(val: string[]) {
    this._colors = val;
    this.render();
  }

  get referenceLines(): ReferenceLine[] {
    return this._referenceLines;
  }
  set referenceLines(val: ReferenceLine[]) {
    this._referenceLines = val;
    this._hiddenRefLines = new Array(val.length).fill(false);
    this.render();
  }

  get lineSeries(): LineSeries[] {
    return this._lineSeries;
  }
  set lineSeries(val: LineSeries[]) {
    this._lineSeries = val;
    this._hiddenLineSeries = new Array(val.length).fill(false);
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data') {
      try {
        this.data = JSON.parse(newValue);
        this._hidden = new Array(this._data.length).fill(false);
      } catch (e) {
        this.data = [];
        this._hidden = [];
      }
    }
    if (name === 'colors') {
      try {
        this.colors = JSON.parse(newValue);
      } catch (e) {
        this.colors = [];
      }
    }
    if (name === 'height') {
      const h = parseInt(newValue, 10);
      if (!isNaN(h) && h > 0) {
        this.height = h;
      }
    }
    if (name === 'width') {
      this.width = newValue || '100%';
    }
    if (name === 'horizontal') {
      this.horizontal = newValue !== null && newValue !== 'false';
    }
    if (name === 'title') {
      this.title = newValue || '';
    }
    if (name === 'font-size') {
      this.fontSize = newValue || '';
    }
    if (name === 'legend-position') {
      if (["top","bottom","left","right"].includes(newValue)) {
        this.legendPosition = newValue as LegendPosition;
      }
    }
    if (name === 'reference-lines') {
      try {
        this._referenceLines = JSON.parse(newValue);
        this._hiddenRefLines = new Array(this._referenceLines.length).fill(false);
      } catch {
        this._referenceLines = [];
        this._hiddenRefLines = [];
      }
      this.render();
    }
    if (name === 'line-series') {
      try {
        this._lineSeries = JSON.parse(newValue);
        this._hiddenLineSeries = new Array(this._lineSeries.length).fill(false);
      } catch {
        this._lineSeries = [];
        this._hiddenLineSeries = [];
      }
      this.render();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasAttribute('colors')) {
      try {
        this.colors = JSON.parse(this.getAttribute('colors')!);
      } catch {
        this.colors = [];
      }
    }
    if (this.hasAttribute('height')) {
      const h = parseInt(this.getAttribute('height')!, 10);
      if (!isNaN(h) && h > 0) {
        this.height = h;
      }
    }
    if (this.hasAttribute('width')) {
      this.width = this.getAttribute('width')!;
    }
    if (this.hasAttribute('horizontal')) {
      this.horizontal = this.getAttribute('horizontal') !== 'false';
    }
    if (this.hasAttribute('title')) {
      this.title = this.getAttribute('title')!;
    }
    if (this.hasAttribute('font-size')) {
      this.fontSize = this.getAttribute('font-size')!;
    }
    if (this.hasAttribute('legend-position')) {
      const pos = this.getAttribute('legend-position');
      if (["top","bottom","left","right"].includes(pos!)) {
        this.legendPosition = pos as LegendPosition;
      }
    }
    if (this.hasAttribute('data')) {
      try {
        this.data = JSON.parse(this.getAttribute('data')!);
        this._hidden = new Array(this._data.length).fill(false);
      } catch {
        this.data = [];
        this._hidden = [];
      }
    }
    if (this.hasAttribute('reference-lines')) {
      try {
        this._referenceLines = JSON.parse(this.getAttribute('reference-lines')!);
        this._hiddenRefLines = new Array(this._referenceLines.length).fill(false);
      } catch {
        this._referenceLines = [];
        this._hiddenRefLines = [];
      }
    }
    if (this.hasAttribute('line-series')) {
      try {
        this._lineSeries = JSON.parse(this.getAttribute('line-series')!);
        this._hiddenLineSeries = new Array(this._lineSeries.length).fill(false);
      } catch {
        this._lineSeries = [];
        this._hiddenLineSeries = [];
      }
    }
    this.render();
  }

  private _buildColor(bar: BarChartData, i: number): string {
    return bar.color || (this._colors.length ? this._colors[i % this._colors.length] : `hsl(${i * 60}, 70%, 60%)`);
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
    if (!this._hiddenRefLines || this._hiddenRefLines.length !== this._referenceLines.length) {
      this._hiddenRefLines = new Array(this._referenceLines.length).fill(false);
    }
    const refLineMax = this._referenceLines.length
      ? Math.max(...this._referenceLines.filter((_, ri) => !this._hiddenRefLines[ri]).map(r => r.value))
      : 0;
    const lineSeriesMax = this._lineSeries.length
      ? Math.max(...this._lineSeries.flatMap((s, si) => this._hiddenLineSeries[si] ? [] : s.values))
      : 0;
    const max = Math.max(...this._data.map((d, i) => this._hidden[i] ? 0 : d.value), refLineMax, lineSeriesMax, 1);
    const { niceMax, niceStep } = this._niceScale(max);

    let legendHtml = '';
    legendHtml += `<div class="bar-legend bar-legend--${this._legendPosition}">`;
    this._data.forEach((bar, i) => {
      const color = this._buildColor(bar, i);
      legendHtml += `<button type="button" class="bar-legend-item" tabindex="0" aria-pressed="${!this._hidden[i]}" data-index="${i}" style="display:inline-flex;align-items:center;margin:0 0.5em 0.5em 0;gap:0.5em;background:none;border:none;cursor:pointer;outline:none;opacity:${this._hidden[i] ? 0.5 : 1};">
        <span class="bar-legend-swatch" style="display:inline-block;width:1.1em;height:1.1em;border-radius:2px;background:${color};border:2px solid #fff;box-shadow:0 0 0 1px #ccc;"></span>
        <span>${bar.label}</span>
      </button>`;
    });
    this._referenceLines.forEach((ref, ri) => {
      const color = ref.color || '#ef5350';
      const label = ref.label ?? `Ref ${ref.value}`;
      legendHtml += `<button type="button" class="bar-legend-item bar-legend-ref-item" tabindex="0" aria-pressed="${!this._hiddenRefLines[ri]}" data-ref-index="${ri}" style="display:inline-flex;align-items:center;margin:0 0.5em 0.5em 0;gap:0.5em;background:none;border:none;cursor:pointer;outline:none;opacity:${this._hiddenRefLines[ri] ? 0.5 : 1};">
        <span style="display:inline-block;width:1.5em;height:0;border-top:3px dashed ${color};"></span>
        <span>${label}</span>
      </button>`;
    });
    this._lineSeries.forEach((series, si) => {
      const color = series.color || `hsl(${si * 60 + 200}, 70%, 50%)`;
      legendHtml += `<button type="button" class="bar-legend-item bar-legend-line-item" tabindex="0" aria-pressed="${!this._hiddenLineSeries[si]}" data-line-index="${si}" style="display:inline-flex;align-items:center;margin:0 0.5em 0.5em 0;gap:0.5em;background:none;border:none;cursor:pointer;outline:none;opacity:${this._hiddenLineSeries[si] ? 0.5 : 1};">
        <svg width="22" height="14" style="overflow:visible;flex-shrink:0;"><line x1="0" y1="7" x2="22" y2="7" stroke="${color}" stroke-width="2"/><circle cx="11" cy="7" r="4" fill="${color}"/></svg>
        <span>${series.label}</span>
      </button>`;
    });
    legendHtml += '</div>';

    let tooltipId = 'bar-tooltip-' + Math.random().toString(36).slice(2);
    let svgHtml: string;
    let fontSize: number;

    if (this._horizontal) {
      const barCount = this._data.length;
      const barHeight = 28;
      const gap = 8;
      const chartRight = 10;
      const chartTop = 8;
      const rowHeight = barHeight + gap;
      const svgHeight = chartTop + rowHeight * barCount + 4;
      const svgWidth = 600;
      const dynamicFontSizeH = Math.max(8, Math.min(14, Math.round(barHeight * 0.5)));
      fontSize = this._fontSize ? parseFloat(this._fontSize) : dynamicFontSizeH;
      const longestLabelH = this._data.reduce((m, d) => Math.max(m, d.label.length), 0);
      const labelWidth = Math.max(80, Math.min(200, Math.ceil(longestLabelH * fontSize * 0.62) + 8));
      const chartWidth = svgWidth - labelWidth - chartRight;

      svgHtml = `<svg class="bar-chart-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" overflow="visible" style="width:100%;">`;
      for (let t = 0; t <= niceMax; t += niceStep) {
        const gx = labelWidth + (t / niceMax) * chartWidth;
        svgHtml += `<line x1="${gx}" y1="${chartTop}" x2="${gx}" y2="${svgHeight - 4}" class="bar-chart-gridline" />`;
        svgHtml += `<text x="${gx}" y="${svgHeight}" text-anchor="middle" class="bar-chart-axis-label">${t}</text>`;
      }
      this._data.forEach((bar, i) => {
        if (this._hidden[i]) return;
        const color = this._buildColor(bar, i);
        const barW = (bar.value / niceMax) * chartWidth;
        const y = chartTop + i * rowHeight;
        svgHtml += `<text x="${labelWidth - 8}" y="${y + barHeight / 2 + 4}" text-anchor="end" class="bar-chart-label">${bar.label}</text>`;
        svgHtml += `<rect x="${labelWidth}" y="${y}" width="${barW}" height="${barHeight}" fill="${color}" rx="4" data-index="${i}" tabindex="0" />`;
      });
      svgHtml += '</svg>';
    } else {
      const barCount = this._data.length;
      const height = this._height;
      const chartLeft = 52;
      const chartTop = 16;
      const svgWidth = Math.max(600, barCount * 60);
      const barGap = 8;
      const barWidth = Math.max(16, (svgWidth - chartLeft - barGap * (barCount + 1)) / barCount);
      const angledLabels = barWidth < 60;
      const dynamicFontSizeV = Math.max(8, Math.min(14, Math.round(barWidth * 0.28)));
      fontSize = this._fontSize ? parseFloat(this._fontSize) : dynamicFontSizeV;
      // chartBottom must fit: 8px gap + label text height + a few px below baseline
      const chartBottom = angledLabels ? 72 : Math.max(28, Math.ceil(fontSize * 2 + 4));
      const chartHeight = height - chartBottom - chartTop;

      const longestLabelV = this._data.reduce((m, d) => Math.max(m, d.label.length), 0);
      const labelTextWidth = longestLabelV * fontSize * 0.6;
      const sin40 = Math.sin(40 * Math.PI / 180);
      // Place labelY so the TOP of the text (labelY - fontSize) is 8px below the bar bottom
      const labelY = height - chartBottom + fontSize + 8;
      const labelBottom = labelY + (angledLabels ? labelTextWidth * sin40 + fontSize : fontSize);
      const totalHeight = Math.ceil(Math.max(height, labelBottom + 4));

      svgHtml = `<svg class="bar-chart-svg" viewBox="0 0 ${svgWidth} ${totalHeight}" overflow="visible" style="width:100%;">`;
      for (let t = 0; t <= niceMax; t += niceStep) {
        const gy = chartTop + chartHeight - (t / niceMax) * chartHeight;
        svgHtml += `<line x1="${chartLeft}" y1="${gy}" x2="${svgWidth - 10}" y2="${gy}" class="bar-chart-gridline" />`;
        svgHtml += `<text x="${chartLeft - 6}" y="${gy + 4}" text-anchor="end" class="bar-chart-axis-label">${t}</text>`;
      }
      this._data.forEach((bar, i) => {
        if (this._hidden[i]) return;
        const color = this._buildColor(bar, i);
        const barH = (bar.value / niceMax) * chartHeight;
        const x = chartLeft + barGap / 2 + i * (barWidth + barGap);
        const y = chartTop + chartHeight - barH;
        const cx = x + barWidth / 2;
        svgHtml += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="${color}" rx="4" data-index="${i}" tabindex="0" />`;
        if (angledLabels) {
          svgHtml += `<text x="${cx}" y="${labelY}" text-anchor="end" transform="rotate(-40,${cx},${labelY})" class="bar-chart-label">${bar.label}</text>`;
        } else {
          svgHtml += `<text x="${cx}" y="${labelY}" text-anchor="middle" class="bar-chart-label">${bar.label}</text>`;
        }
      });
      this._referenceLines.forEach((ref, ri) => {
        if (this._hiddenRefLines[ri]) return;
        const color = ref.color || '#ef5350';
        const lineY = chartTop + chartHeight - (ref.value / niceMax) * chartHeight;
        const labelText = ref.label ? `${ref.label}: ${ref.value}` : String(ref.value);
        svgHtml += `<line x1="${chartLeft}" y1="${lineY}" x2="${svgWidth - 10}" y2="${lineY}" stroke="${color}" stroke-width="2" stroke-dasharray="6 3" style="pointer-events:none;" />`;
        svgHtml += `<line x1="${chartLeft}" y1="${lineY}" x2="${svgWidth - 10}" y2="${lineY}" stroke="transparent" stroke-width="12" class="bar-ref-line-hit" data-ref-index="${ri}" tabindex="0" aria-label="${labelText}" style="cursor:default;" />`;
        svgHtml += `<text x="${svgWidth - 12}" y="${lineY - 5}" text-anchor="end" class="bar-chart-ref-label" fill="${color}">${labelText}</text>`;
      });
      this._lineSeries.forEach((series, si) => {
        if (this._hiddenLineSeries[si]) return;
        const color = series.color || `hsl(${si * 60 + 200}, 70%, 50%)`;
        const points = series.values.map((val, i) => {
          const cx = chartLeft + barGap / 2 + i * (barWidth + barGap) + barWidth / 2;
          const cy = chartTop + chartHeight - (val / niceMax) * chartHeight;
          return `${cx},${cy}`;
        });
        svgHtml += `<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" style="pointer-events:none;" />`;
        series.values.forEach((val, i) => {
          const cx = chartLeft + barGap / 2 + i * (barWidth + barGap) + barWidth / 2;
          const cy = chartTop + chartHeight - (val / niceMax) * chartHeight;
          const bar = this._data[i];
          const tooltipText = `${series.label} — ${bar ? bar.label : i}: ${val}`;
          svgHtml += `<circle cx="${cx}" cy="${cy}" r="5" fill="${color}" stroke="#fff" stroke-width="2" class="bar-line-dot" data-line-index="${si}" data-point-index="${i}" tabindex="0" aria-label="${tooltipText}" style="cursor:default;" />`;
        });
      });
      svgHtml += '</svg>';
    }

    svgHtml += `<div id="${tooltipId}" class="bar-tooltip" style="display:none;position:absolute;z-index:10;"></div>`;

    const titleHtml = this._title
      ? `<div class="bar-chart-title">${this._title}</div>`
      : '';
    this.root.innerHTML = this.css(`
      .bar-chart-svg { width: 100%; height: auto; min-height: 100px; overflow: visible; }
      :host { display: block; width: ${this._width}; min-height: 100px; position: relative; }
      .bar-chart-title { font-weight: bold; font-size: 1.1em; margin-bottom: 0.5em; text-align: center; color: var(--ui-fg, inherit); }
      .bar-chart-label { font-size: ${fontSize}px; fill: var(--ui-fg, #222); }
      .bar-chart-axis-label { font-size: calc(${fontSize}px * 0.85); fill: var(--ui-muted, #888); }
      .bar-chart-gridline { stroke: var(--ui-border, #e0e0e0); stroke-width: 1; }
      .bar-tooltip { background: #222; color: #fff; padding: 0.4em 0.7em; border-radius: 4px; font-size: 0.95em; pointer-events: none; position: absolute; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: opacity 0.15s; opacity: 0.95; }
      .bar-legend { display: flex; flex-wrap: wrap; gap: 0.5em; margin-bottom: 1em; }
      .bar-legend--top, .bar-legend--bottom { flex-direction: row; justify-content: center; }
      .bar-legend--left, .bar-legend--right { flex-direction: column; align-items: flex-start; }
      .bar-legend--left { float: left; margin-right: 1.5em; }
      .bar-legend--right { float: right; margin-left: 1.5em; }
      .bar-legend-item:focus-visible { outline: 2px solid #2563eb; z-index: 2; }
      .bar-legend-swatch { border: 2px solid #fff; box-shadow: 0 0 0 1px #ccc; }
      .bar-chart-ref-label { font-size: calc(${fontSize}px * 0.88); font-weight: 600; }
      .bar-line-dot:hover, .bar-line-dot:focus { r: 7; outline: none; }
    `) + titleHtml +
      (this._legendPosition === 'top' ? legendHtml + svgHtml :
        this._legendPosition === 'bottom' ? svgHtml + legendHtml :
        this._legendPosition === 'left' ? `<div style="display:flex;"><div>${legendHtml}</div><div style="flex:1;">${svgHtml}</div></div>` :
        `<div style="display:flex;"><div style="flex:1;">${svgHtml}</div><div>${legendHtml}</div></div>`);

    const svg = this.root.querySelector('svg');
    const tooltip = this.root.getElementById(tooltipId);
    if (svg && tooltip) {
      svg.querySelectorAll<SVGLineElement>('.bar-ref-line-hit').forEach((line) => {
        const ri = parseInt(line.dataset.refIndex!);
        const ref = this._referenceLines[ri];
        if (!ref) return;
        const labelText = ref.label ? `${ref.label}: ${ref.value}` : String(ref.value);
        line.addEventListener('mouseenter', (e) => {
          tooltip.textContent = labelText;
          tooltip.style.display = 'block';
        });
        line.addEventListener('mousemove', (e) => {
          const evt = e as MouseEvent;
          const rectBox = svg.getBoundingClientRect();
          tooltip.style.left = (evt.clientX - rectBox.left + 10) + 'px';
          tooltip.style.top = (evt.clientY - rectBox.top - 10) + 'px';
        });
        line.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });
        line.addEventListener('focus', () => {
          tooltip.textContent = labelText;
          tooltip.style.display = 'block';
          tooltip.style.left = '50%';
          tooltip.style.top = '10px';
          tooltip.style.transform = 'translateX(-50%)';
        });
        line.addEventListener('blur', () => {
          tooltip.style.display = 'none';
          tooltip.style.transform = '';
        });
      });

      svg.querySelectorAll('rect[data-index]').forEach((rect, i) => {
        rect.addEventListener('mouseenter', (e) => {
          const d = this._data[i];
          tooltip.textContent = `${d.label}: ${d.value}`;
          tooltip.style.display = 'block';
          rect.setAttribute('stroke', '#fff');
          rect.setAttribute('stroke-width', '2');
        });
        rect.addEventListener('mousemove', (e) => {
          const evt = e as MouseEvent;
          const rectBox = svg.getBoundingClientRect();
          tooltip.style.left = (evt.clientX - rectBox.left + 10) + 'px';
          tooltip.style.top = (evt.clientY - rectBox.top - 10) + 'px';
        });
        rect.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
          rect.removeAttribute('stroke');
          rect.removeAttribute('stroke-width');
        });
        rect.addEventListener('focus', () => {
          const d = this._data[i];
          tooltip.textContent = `${d.label}: ${d.value}`;
          tooltip.style.display = 'block';
          tooltip.style.left = '50%';
          tooltip.style.top = '10px';
          tooltip.style.transform = 'translateX(-50%)';
          rect.setAttribute('stroke', '#fff');
          rect.setAttribute('stroke-width', '2');
        });
        rect.addEventListener('blur', () => {
          tooltip.style.display = 'none';
          tooltip.style.transform = '';
          rect.removeAttribute('stroke');
          rect.removeAttribute('stroke-width');
        });
      });
    }

    this.root.querySelectorAll('.bar-legend-item').forEach((item, i) => {
      item.addEventListener('mouseenter', () => {
        const rect = this.root.querySelector(`rect[data-index="${i}"]`);
        if (rect) {
          rect.setAttribute('stroke', '#fff');
          rect.setAttribute('stroke-width', '2');
        }
      });
      item.addEventListener('mouseleave', () => {
        const rect = this.root.querySelector(`rect[data-index="${i}"]`);
        if (rect) {
          rect.removeAttribute('stroke');
          rect.removeAttribute('stroke-width');
        }
      });
      item.addEventListener('focus', () => {
        const rect = this.root.querySelector(`rect[data-index="${i}"]`);
        if (rect) {
          rect.setAttribute('stroke', '#fff');
          rect.setAttribute('stroke-width', '2');
        }
      });
      item.addEventListener('blur', () => {
        const rect = this.root.querySelector(`rect[data-index="${i}"]`);
        if (rect) {
          rect.removeAttribute('stroke');
          rect.removeAttribute('stroke-width');
        }
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

    this.root.querySelectorAll<HTMLButtonElement>('.bar-legend-ref-item').forEach((item) => {
      const ri = parseInt(item.dataset.refIndex!);
      item.addEventListener('click', () => {
        this._hiddenRefLines[ri] = !this._hiddenRefLines[ri];
        this.render();
      });
      item.addEventListener('keydown', (e) => {
        const ke = e as KeyboardEvent;
        if (ke.key === ' ' || ke.key === 'Enter') {
          ke.preventDefault();
          this._hiddenRefLines[ri] = !this._hiddenRefLines[ri];
          this.render();
        }
      });
    });

    if (svg && tooltip) {
      svg.querySelectorAll<SVGCircleElement>('.bar-line-dot').forEach((dot) => {
        const si = parseInt(dot.dataset.lineIndex!);
        const pi = parseInt(dot.dataset.pointIndex!);
        const series = this._lineSeries[si];
        if (!series) return;
        const bar = this._data[pi];
        const tooltipText = `${series.label} — ${bar ? bar.label : pi}: ${series.values[pi]}`;
        dot.addEventListener('mouseenter', (e) => {
          tooltip.textContent = tooltipText;
          tooltip.style.display = 'block';
        });
        dot.addEventListener('mousemove', (e) => {
          const evt = e as MouseEvent;
          const rectBox = svg.getBoundingClientRect();
          tooltip.style.left = (evt.clientX - rectBox.left + 10) + 'px';
          tooltip.style.top = (evt.clientY - rectBox.top - 10) + 'px';
        });
        dot.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });
        dot.addEventListener('focus', () => {
          tooltip.textContent = tooltipText;
          tooltip.style.display = 'block';
          tooltip.style.left = '50%';
          tooltip.style.top = '10px';
          tooltip.style.transform = 'translateX(-50%)';
        });
        dot.addEventListener('blur', () => {
          tooltip.style.display = 'none';
          tooltip.style.transform = '';
        });
      });
    }

    this.root.querySelectorAll<HTMLButtonElement>('.bar-legend-line-item').forEach((item) => {
      const si = parseInt(item.dataset.lineIndex!);
      item.addEventListener('click', () => {
        this._hiddenLineSeries[si] = !this._hiddenLineSeries[si];
        this.render();
      });
      item.addEventListener('keydown', (e) => {
        const ke = e as KeyboardEvent;
        if (ke.key === ' ' || ke.key === 'Enter') {
          ke.preventDefault();
          this._hiddenLineSeries[si] = !this._hiddenLineSeries[si];
          this.render();
        }
      });
    });
  }
}

customElements.define(UIBarChart.tag, UIBarChart);
