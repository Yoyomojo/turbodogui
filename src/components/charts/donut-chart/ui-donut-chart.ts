import { UIComponent } from '../../../core/component';
import styles from './ui-donut-chart.css?raw';

interface DonutChartData {
	label: string;
	value: number;
	color?: string;
}

export class UIDonutChart extends UIComponent {
	static tag = 'ui-donut-chart';
	static observedAttributes = ['data', 'src', 'colors', 'height', 'width', 'title', 'legend-position', 'show-values', 'hole-size', 'center-label'];

	private _data: DonutChartData[] = [];
	private _colors: string[] = [];
	private _height: number = 200;
	private _width: string = '100%';
	private _title: string = '';
	private _legendPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
	private _hidden: boolean[] = [];
	private _showValues: boolean = false;
	private _holeSize: number = 0.6;
	private _centerLabel: string = '';

	get width(): string { return this._width; }
	set width(val: string) { this._width = val; this.render(); }

	get title(): string { return this._title; }
	set title(val: string) { this._title = val; this.render(); }

	get height(): number { return this._height; }
	set height(val: number) { this._height = val; this.render(); }

	get data(): DonutChartData[] { return this._data; }
	set data(val: DonutChartData[]) { this._data = val; this.render(); }

	get colors(): string[] { return this._colors; }
	set colors(val: string[]) { this._colors = val; this.render(); }

	get holeSize(): number { return this._holeSize; }
	set holeSize(val: number) { this._holeSize = Math.min(0.95, Math.max(0.1, val)); this.render(); }

	get centerLabel(): string { return this._centerLabel; }
	set centerLabel(val: string) { this._centerLabel = val; this.render(); }

	attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
		if (name === 'data') {
			try {
				this.data = JSON.parse(newValue);
				this._hidden = new Array(this._data.length).fill(false);
			} catch {
				this.data = [];
				this._hidden = [];
			}
		}
		if (name === 'colors') {
			try { this.colors = JSON.parse(newValue); } catch { this.colors = []; }
		}
		if (name === 'height') {
			const h = parseInt(newValue, 10);
			if (!isNaN(h) && h > 0) this.height = h;
		}
		if (name === 'width') { this.width = newValue || '100%'; }
		if (name === 'title') { this.title = newValue || ''; }
		if (name === 'legend-position') {
			if (['top', 'bottom', 'left', 'right'].includes(newValue)) {
				this._legendPosition = newValue as any;
			}
		}
		if (name === 'show-values') {
			this._showValues = newValue !== null && newValue !== 'false';
			this.render();
		}
		if (name === 'hole-size') {
			const h = parseFloat(newValue);
			if (!isNaN(h)) this.holeSize = h;
		}
		if (name === 'center-label') {
			this.centerLabel = newValue || '';
		}
		if (name === 'src') {
			if (newValue) this._fetchSrc(newValue);
		}
	}

	connectedCallback() {
		super.connectedCallback();
		if (this.hasAttribute('colors')) {
			try { this.colors = JSON.parse(this.getAttribute('colors')!); } catch { this.colors = []; }
		}
		if (this.hasAttribute('height')) {
			const h = parseInt(this.getAttribute('height')!, 10);
			if (!isNaN(h) && h > 0) this.height = h;
		}
		if (this.hasAttribute('width')) this.width = this.getAttribute('width')!;
		if (this.hasAttribute('title')) this.title = this.getAttribute('title')!;
		if (this.hasAttribute('legend-position')) {
			const pos = this.getAttribute('legend-position');
			if (['top', 'bottom', 'left', 'right'].includes(pos!)) {
				this._legendPosition = pos as any;
			}
		}
		if (this.hasAttribute('show-values')) {
			this._showValues = this.getAttribute('show-values') !== 'false';
		}
		if (this.hasAttribute('hole-size')) {
			const h = parseFloat(this.getAttribute('hole-size')!);
			if (!isNaN(h)) this.holeSize = h;
		}
		if (this.hasAttribute('center-label')) {
			this._centerLabel = this.getAttribute('center-label')!;
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
				const data = Array.isArray(json) ? json : (json.data ?? json);
				this.data = data;
				this._hidden = new Array(this._data.length).fill(false);
			})
			.catch(() => {});
	}

	protected render() {
		if (!this.root) return;
		this.root.innerHTML = '';
		if (!this._data.length) return;
		if (!this._hidden || this._hidden.length !== this._data.length) {
			this._hidden = new Array(this._data.length).fill(false);
		}

		const visibleData = this._data.filter((_, i) => !this._hidden[i]);
		const total = visibleData.reduce((sum, d) => sum + d.value, 0);
		const size = this._height;
		const outerRadius = size / 2 - 2;
		const innerRadius = outerRadius * this._holeSize;
		const cx = size / 2;
		const cy = size / 2;
		const tooltipId = 'donut-tooltip-' + Math.random().toString(36).slice(2);

		const svgParts = [
			`<svg class="donut-chart-svg" viewBox="0 0 ${size} ${size}" style="height:${size}px;">`
		];

		let startAngle = -90; 

		this._data.forEach((slice, i) => {
			if (this._hidden[i]) return;
			const angle = (slice.value / total) * 360;
			const endAngle = startAngle + angle;
			const largeArc = angle > 180 ? 1 : 0;

			const toRad = (deg: number) => (Math.PI * deg) / 180;

			const ox1 = cx + outerRadius * Math.cos(toRad(startAngle));
			const oy1 = cy + outerRadius * Math.sin(toRad(startAngle));
			const ox2 = cx + outerRadius * Math.cos(toRad(endAngle));
			const oy2 = cy + outerRadius * Math.sin(toRad(endAngle));
			const ix1 = cx + innerRadius * Math.cos(toRad(startAngle));
			const iy1 = cy + innerRadius * Math.sin(toRad(startAngle));
			const ix2 = cx + innerRadius * Math.cos(toRad(endAngle));
			const iy2 = cy + innerRadius * Math.sin(toRad(endAngle));

			let color = slice.color;
			if (!color && this._colors.length) color = this._colors[i % this._colors.length];
			if (!color) color = `hsl(${i * 60}, 70%, 60%)`;

			const d = [
				`M ${ox1.toFixed(3)},${oy1.toFixed(3)}`,
				`A ${outerRadius},${outerRadius} 0 ${largeArc} 1 ${ox2.toFixed(3)},${oy2.toFixed(3)}`,
				`L ${ix2.toFixed(3)},${iy2.toFixed(3)}`,
				`A ${innerRadius},${innerRadius} 0 ${largeArc} 0 ${ix1.toFixed(3)},${iy1.toFixed(3)}`,
				'Z'
			].join(' ');

			svgParts.push(
				`<path d="${d}" fill="${color}" data-index="${i}" tabindex="0" />`
			);

			if (this._showValues && angle > 5) {
				const midAngle = startAngle + angle / 2;
				const labelR = (outerRadius + innerRadius) / 2;
				const lx = cx + labelR * Math.cos(toRad(midAngle));
				const ly = cy + labelR * Math.sin(toRad(midAngle));
				const pct = Math.round((slice.value / total) * 100);
				svgParts.push(
					`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" class="donut-slice-label">${pct}%</text>`
				);
			}

			startAngle = endAngle;
		});


		if (this._centerLabel) {
			svgParts.push(
				`<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" class="donut-center-label">${this._centerLabel}</text>`
			);
		}

		svgParts.push('</svg>');
		svgParts.push(`<div id="${tooltipId}" class="donut-tooltip"></div>`);

		const legendItems = this._data.map((slice, i) => {
			const color = slice.color || this._colors[i % this._colors.length] || `hsl(${i * 60}, 70%, 60%)`;
			const checked = !this._hidden[i];
			return `<div class="donut-legend-item" data-legend-index="${i}" tabindex="0" style="opacity:${checked ? 1 : 0.5};">
				<span class="donut-legend-swatch" style="background:${color};"></span>
				<span>${slice.label}</span>
			</div>`;
		}).join('');

		const legendClass = `donut-legend donut-legend--${this._legendPosition}`;
		const legendHtml = `<div class="${legendClass}">${legendItems}</div>`;
		const titleHtml = this._title ? `<div class="donut-chart-title">${this._title}</div>` : '';

		let content = '';
		if (this._legendPosition === 'top') {
			content = titleHtml + legendHtml + svgParts.join('');
		} else if (this._legendPosition === 'bottom') {
			content = titleHtml + svgParts.join('') + legendHtml;
		} else if (this._legendPosition === 'left') {
			content = `${titleHtml}<div class="chart-side-layout"><div>${legendHtml}</div><div class="chart-side-chart">${svgParts.join('')}</div></div>`;
		} else {
			content = `${titleHtml}<div class="chart-side-layout"><div class="chart-side-chart">${svgParts.join('')}</div><div>${legendHtml}</div></div>`;
		}

		this.style.width = this._width;
		content = this.css(styles) + content;

		this.root.innerHTML = content;

		const svg = this.root.querySelector('svg');
		const tooltip = this.root.getElementById(tooltipId);
		if (svg && tooltip) {
			svg.querySelectorAll('path[data-index]').forEach((path, i) => {
				path.addEventListener('mouseenter', (e) => {
					const d = this._data[i];
					tooltip.textContent = `${d.label}: ${d.value}`;
					tooltip.style.removeProperty('display');
					path.setAttribute('stroke', '#fff');
					path.setAttribute('stroke-width', '2');
				});
				path.addEventListener('mousemove', (e) => {
					const evt = e as MouseEvent;
					const rect = svg.getBoundingClientRect();
					tooltip.style.left = (evt.clientX - rect.left + 10) + 'px';
					tooltip.style.top = (evt.clientY - rect.top - 10) + 'px';
				});
				path.addEventListener('mouseleave', () => {
					tooltip.style.display = 'none'; 
					path.removeAttribute('stroke');
					path.removeAttribute('stroke-width');
				});
				path.addEventListener('focus', () => {
					const d = this._data[i];
					tooltip.textContent = `${d.label}: ${d.value}`;
					tooltip.style.removeProperty('display');
					tooltip.style.left = '50%';
					tooltip.style.top = '10px';
					tooltip.style.transform = 'translateX(-50%)';
					path.setAttribute('stroke', '#fff');
					path.setAttribute('stroke-width', '2');
				});
				path.addEventListener('blur', () => {
					tooltip.style.display = 'none'; 
					tooltip.style.transform = '';
					path.removeAttribute('stroke');
					path.removeAttribute('stroke-width');
				});
			});
		}

		const paths = this.root.querySelectorAll('svg path[data-index]');
		this.root.querySelectorAll('.donut-legend-item').forEach((item, i) => {
			item.addEventListener('mouseenter', () => {
				const path = paths[i];
				if (path) { path.setAttribute('stroke', '#fff'); path.setAttribute('stroke-width', '2'); }
			});
			item.addEventListener('mouseleave', () => {
				const path = paths[i];
				if (path) { path.removeAttribute('stroke'); path.removeAttribute('stroke-width'); }
			});
			item.addEventListener('focus', () => {
				const path = paths[i];
				if (path) { path.setAttribute('stroke', '#fff'); path.setAttribute('stroke-width', '2'); }
			});
			item.addEventListener('blur', () => {
				const path = paths[i];
				if (path) { path.removeAttribute('stroke'); path.removeAttribute('stroke-width'); }
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

customElements.define(UIDonutChart.tag, UIDonutChart);
