import { UIComponent } from '../../../core/component';
import styles from './ui-pie-chart.css?raw';

interface PieChartData {
	label: string;
	value: number;
	color?: string;
}

export class UIPieChart extends UIComponent {
	static tag = 'ui-pie-chart';
	static observedAttributes = ['data', 'src', 'colors', 'height', 'width', 'title', 'legend-position', 'show-values'];

	private _data: PieChartData[] = [];
	private _colors: string[] = [];
	private _height: number = 200;
	private _width: string = '100%';
	private _title: string = '';
	private _legendPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
	private _hidden: boolean[] = [];
	private _showValues: boolean = false;

	get width(): string {
		return this._width;
	}
	set width(val: string) {
		this._width = val;
		this.render();
	}
	get title(): string {
		return this._title;
	}
	set title(val: string) {
		this._title = val;
		this.render();
	}
	get height(): number {
		return this._height;
	}
	set height(val: number) {
		this._height = val;
		this.render();
	}

	get data(): PieChartData[] {
		return this._data;
	}
	set data(val: PieChartData[]) {
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
		if (name === 'title') {
			this.title = newValue || '';
		}
		if (name === 'legend-position') {
			if (["top","bottom","left","right"].includes(newValue)) {
				this._legendPosition = newValue as any;
			}
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
		if (this.hasAttribute('title')) {
			this.title = this.getAttribute('title')!;
		}
		if (this.hasAttribute('legend-position')) {
			const pos = this.getAttribute('legend-position');
			if (["top","bottom","left","right"].includes(pos!)) {
				this._legendPosition = pos as any;
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
		let startAngle = 0;
		const size = this._height;
		const radius = size / 2 - 2;
		const cx = size / 2;
		const cy = size / 2;
		const svgParts = [
		`<svg class="pie-chart-svg" viewBox="0 0 ${size} ${size}" style="height:${size}px;">`,
		];
		let tooltipId = 'pie-tooltip-' + Math.random().toString(36).slice(2);
		this._data.forEach((slice, i) => {
			if (this._hidden[i]) return;
			const angle = (slice.value / total) * 360;
			const endAngle = startAngle + angle;
			const largeArc = angle > 180 ? 1 : 0;
			const x1 = cx + radius * Math.cos((Math.PI * startAngle) / 180);
			const y1 = cy + radius * Math.sin((Math.PI * startAngle) / 180);
			const x2 = cx + radius * Math.cos((Math.PI * endAngle) / 180);
			const y2 = cy + radius * Math.sin((Math.PI * endAngle) / 180);
			let color = slice.color;
			if (!color && this._colors.length) {
				color = this._colors[i % this._colors.length];
			}
			if (!color) {
				color = `hsl(${i * 60}, 70%, 60%)`;
			}
			svgParts.push(
				`<path d="M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z" fill="${color}" data-index="${i}" tabindex="0" />`
			);
			if (this._showValues && angle > 5) {
					const midAngle = startAngle + angle / 2;
				const labelR = radius * 0.65;
				const lx = cx + labelR * Math.cos((Math.PI * midAngle) / 180);
				const ly = cy + labelR * Math.sin((Math.PI * midAngle) / 180);
				const pct = Math.round((slice.value / total) * 100);
				svgParts.push(
					`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" class="pie-slice-label">${pct}%</text>`
				);
			}
			startAngle = endAngle;
		});
		svgParts.push('</svg>');
		svgParts.push(`<div id="${tooltipId}" class="pie-tooltip"></div>`);

		const legendItems = this._data.map((slice, i) => {
			let color = slice.color || this._colors[i % this._colors.length] || `hsl(${i * 60}, 70%, 60%)`;
			const checked = !this._hidden[i];
			return `<div class="pie-legend-item" data-legend-index="${i}" tabindex="0" style="opacity:${checked ? 1 : 0.5};">
				<span class="pie-legend-swatch" style="background:${color};"></span>
				<span>${slice.label}</span>
			</div>`;
		}).join('');
		let legendClass = `pie-legend pie-legend--${this._legendPosition}`;
		let legendHtml = `<div class="${legendClass}">${legendItems}</div>`;

		const titleHtml = this._title
			? `<div class="pie-chart-title">${this._title}</div>`
			: '';
		let content = '';
		if (this._legendPosition === 'top') {
			content = titleHtml + legendHtml + svgParts.join('');
		} else if (this._legendPosition === 'bottom') {
			content = titleHtml + svgParts.join('') + legendHtml;
		} else if (this._legendPosition === 'left') {
			content = `${titleHtml}<div class="chart-side-layout"><div>${legendHtml}</div><div class="chart-side-chart">${svgParts.join('')}</div></div>`;
		} else if (this._legendPosition === 'right') {
			content = `${titleHtml}<div class="chart-side-layout"><div class="chart-side-chart">${svgParts.join('')}</div><div>${legendHtml}</div></div>`;
		}

		content = this.css(styles) + content;
		this.style.width = this._width;
		this.root.innerHTML = content;

		const svg = this.root.querySelector('svg');
		const tooltip = this.root.getElementById(tooltipId);
		if (svg && tooltip) {
			svg.querySelectorAll('path[data-index]').forEach((path, i) => {
				path.addEventListener('mouseenter', (e) => {
					const d = this._data[i];
					tooltip.textContent = `${d.label}: ${d.value}`;
					tooltip.style.display = 'block';
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
					tooltip.style.display = 'block';
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
		this.root.querySelectorAll('.pie-legend-item').forEach((item, i) => {
			item.addEventListener('mouseenter', () => {
				const path = paths[i];
				if (path) {
					path.setAttribute('stroke', '#fff');
					path.setAttribute('stroke-width', '2');
				}
			});
			item.addEventListener('mouseleave', () => {
				const path = paths[i];
				if (path) {
					path.removeAttribute('stroke');
					path.removeAttribute('stroke-width');
				}
			});
			item.addEventListener('focus', () => {
				const path = paths[i];
				if (path) {
					path.setAttribute('stroke', '#fff');
					path.setAttribute('stroke-width', '2');
				}
			});
			item.addEventListener('blur', () => {
				const path = paths[i];
				if (path) {
					path.removeAttribute('stroke');
					path.removeAttribute('stroke-width');
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
	}
}

customElements.define(UIPieChart.tag, UIPieChart);
