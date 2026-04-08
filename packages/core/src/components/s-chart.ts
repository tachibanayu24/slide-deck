// --- Constants ---

const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#f43f5e', '#06b6d4', '#f97316', '#14b8a6',
];

const GRID_LINES = 4;
const CHART_HEIGHT = 200;
const FILL_OPACITY = 0.85;

// --- Data interfaces ---

interface DataPoint {
  label: string;
  value: number;
}

interface LineDataPoint {
  label: string;
  value?: number;
  values?: number[];
}

interface ScatterPoint {
  label?: string;
  x: number;
  y: number;
  group?: string;
}

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// --- Helpers ---

/** Escape HTML/SVG special characters to prevent injection via data attributes. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '\u2026' : s;
}

/** Ensure a max value is never zero to avoid division by zero. */
function safeMax(val: number): number {
  return val > 0 ? val : 1;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v);
}

// --- Component ---

export class SChart extends HTMLElement {
  private initialized = false;

  static get observedAttributes() {
    return ['type', 'data', 'colors', 'series', 'label', 'x-label', 'y-label'];
  }

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render(), { once: true });
    } else {
      this.render();
    }
  }

  attributeChangedCallback() {
    if (this.initialized) this.render();
  }

  // --- Theme-aware colors ---

  private get isDark(): boolean {
    return this.closest('s-slide')?.getAttribute('theme') === 'dark';
  }

  private get textColor(): string {
    return this.isDark ? '#e2e8f0' : '#334155';
  }

  private get subTextColor(): string {
    return this.isDark ? '#64748b' : '#94a3b8';
  }

  private get gridColor(): string {
    return this.isDark ? '#334155' : '#e2e8f0';
  }

  private getColors(): string[] {
    const attr = this.getAttribute('colors');
    return attr ? attr.split(',').map((c) => c.trim()) : DEFAULT_COLORS;
  }

  // --- Data parsing ---

  private parseData(): DataPoint[] {
    try {
      const raw = JSON.parse(this.getAttribute('data') || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter(
        (d: unknown): d is DataPoint =>
          typeof d === 'object' && d !== null &&
          typeof (d as DataPoint).label === 'string' &&
          isFiniteNumber((d as DataPoint).value),
      );
    } catch {
      return [];
    }
  }

  private parseLineData(): LineDataPoint[] {
    try {
      const raw = JSON.parse(this.getAttribute('data') || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter(
        (d: unknown): d is LineDataPoint =>
          typeof d === 'object' && d !== null &&
          typeof (d as LineDataPoint).label === 'string' &&
          (isFiniteNumber((d as LineDataPoint).value) || Array.isArray((d as LineDataPoint).values)),
      );
    } catch {
      return [];
    }
  }

  private parseScatterData(): ScatterPoint[] {
    try {
      const raw = JSON.parse(this.getAttribute('data') || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter(
        (d: unknown): d is ScatterPoint =>
          typeof d === 'object' && d !== null &&
          isFiniteNumber((d as ScatterPoint).x) &&
          isFiniteNumber((d as ScatterPoint).y),
      );
    } catch {
      return [];
    }
  }

  private getSeries(): string[] {
    try {
      return JSON.parse(this.getAttribute('series') || '[]');
    } catch {
      return [];
    }
  }

  // --- Shared SVG helpers ---

  private svgOpen(width: number, height: number): string {
    return `<svg viewBox="0 0 ${width} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Noto Sans JP', system-ui, sans-serif;">`;
  }

  /** Horizontal grid lines with Y-axis value labels. Shared by bar, bar-horizontal, and line. */
  private renderHGrid(parts: string[], m: Margin, chartW: number, chartH: number, maxVal: number): void {
    for (let i = 0; i <= GRID_LINES; i++) {
      const y = m.top + chartH - (chartH * i) / GRID_LINES;
      const val = Math.round((maxVal * i) / GRID_LINES);
      parts.push(
        `<line x1="${m.left}" y1="${y}" x2="${m.left + chartW}" y2="${y}" stroke="${this.gridColor}" stroke-width="1" stroke-dasharray="4 4"/>`,
        `<text x="${m.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="${this.subTextColor}">${val}</text>`,
      );
    }
  }

  // --- Render dispatch ---

  // All SVG content is built from validated data (numeric values + escaped labels).
  private render() {
    const type = this.getAttribute('type') || 'bar';

    let svg: string;
    switch (type) {
      case 'bar': {
        const data = this.parseData();
        if (data.length === 0) return;
        svg = this.renderBar(data);
        break;
      }
      case 'bar-horizontal': {
        const data = this.parseData();
        if (data.length === 0) return;
        svg = this.renderBarHorizontal(data);
        break;
      }
      case 'donut': {
        const data = this.parseData();
        if (data.length === 0) return;
        svg = this.renderDonut(data);
        break;
      }
      case 'line': {
        const data = this.parseLineData();
        if (data.length === 0) return;
        svg = this.renderLine(data);
        break;
      }
      case 'scatter': {
        const data = this.parseScatterData();
        if (data.length === 0) return;
        svg = this.renderScatter(data);
        break;
      }
      default:
        return;
    }

    this.innerHTML = svg; // eslint-disable-line no-unsanitized/property
  }

  // --- Chart renderers ---

  private renderBar(data: DataPoint[]): string {
    const colors = this.getColors();
    const maxVal = safeMax(Math.max(...data.map((d) => d.value)));

    const m: Margin = { top: 24, right: 20, bottom: 36, left: 48 };
    const barWidth = Math.min(48, Math.max(24, 240 / data.length));
    const gap = Math.max(12, barWidth * 0.4);
    const chartW = data.length * (barWidth + gap) - gap;
    const svgW = m.left + chartW + m.right;
    const svgH = m.top + CHART_HEIGHT + m.bottom;

    const parts: string[] = [this.svgOpen(svgW, svgH)];
    this.renderHGrid(parts, m, chartW, CHART_HEIGHT, maxVal);

    data.forEach((d, i) => {
      const h = (d.value / maxVal) * CHART_HEIGHT;
      const x = m.left + i * (barWidth + gap);
      const y = m.top + CHART_HEIGHT - h;
      const color = colors[i % colors.length];

      parts.push(
        `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="4" fill="${color}" opacity="${FILL_OPACITY}"/>`,
        `<text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="${this.textColor}">${d.value}</text>`,
        `<text x="${x + barWidth / 2}" y="${m.top + CHART_HEIGHT + 18}" text-anchor="middle" font-size="10" fill="${this.subTextColor}">${esc(truncate(d.label, 6))}</text>`,
      );
    });

    parts.push('</svg>');
    return parts.join('');
  }

  private renderBarHorizontal(data: DataPoint[]): string {
    const colors = this.getColors();
    const maxVal = safeMax(Math.max(...data.map((d) => d.value)));

    const m: Margin = { top: 8, right: 56, bottom: 8, left: 72 };
    const barH = 24;
    const gap = 10;
    const chartW = 240;
    const chartH = data.length * (barH + gap) - gap;
    const svgW = m.left + chartW + m.right;
    const svgH = m.top + chartH + m.bottom;

    const parts: string[] = [this.svgOpen(svgW, svgH)];

    // Vertical grid lines for horizontal bar chart
    for (let i = 0; i <= GRID_LINES; i++) {
      const x = m.left + (chartW * i) / GRID_LINES;
      parts.push(
        `<line x1="${x}" y1="${m.top}" x2="${x}" y2="${m.top + chartH}" stroke="${this.gridColor}" stroke-width="1" stroke-dasharray="4 4"/>`,
      );
    }

    data.forEach((d, i) => {
      const w = (d.value / maxVal) * chartW;
      const y = m.top + i * (barH + gap);
      const color = colors[i % colors.length];

      parts.push(
        `<text x="${m.left - 8}" y="${y + barH / 2 + 4}" text-anchor="end" font-size="11" fill="${this.textColor}">${esc(truncate(d.label, 8))}</text>`,
        `<rect x="${m.left}" y="${y}" width="${w}" height="${barH}" rx="4" fill="${color}" opacity="${FILL_OPACITY}"/>`,
        `<text x="${m.left + w + 8}" y="${y + barH / 2 + 4}" font-size="11" font-weight="700" fill="${this.textColor}">${d.value}</text>`,
      );
    });

    parts.push('</svg>');
    return parts.join('');
  }

  private renderDonut(data: DataPoint[]): string {
    const colors = this.getColors();
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return '';

    const cx = 110;
    const cy = 110;
    const r = 72;
    const svgW = 380;
    const svgH = Math.max(240, 40 + data.length * 28);
    const circumference = 2 * Math.PI * r;

    const parts: string[] = [this.svgOpen(svgW, svgH)];

    let offset = 0;
    data.forEach((d, i) => {
      const dash = (d.value / total) * circumference;
      const color = colors[i % colors.length];
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="28" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" opacity="${FILL_OPACITY}"/>`,
      );
      offset += dash;
    });

    const label = this.getAttribute('label') || 'Total';
    parts.push(
      `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="22" font-weight="900" fill="${this.textColor}">${total}</text>`,
      `<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="10" fill="${this.subTextColor}">${esc(label)}</text>`,
    );

    data.forEach((d, i) => {
      const ly = 40 + i * 28;
      const color = colors[i % colors.length];
      const pct = Math.round((d.value / total) * 100);
      parts.push(
        `<rect x="240" y="${ly - 6}" width="12" height="12" rx="3" fill="${color}" opacity="${FILL_OPACITY}"/>`,
        `<text x="260" y="${ly + 4}" font-size="11" fill="${this.textColor}">${esc(d.label)}</text>`,
        `<text x="370" y="${ly + 4}" text-anchor="end" font-size="11" font-weight="700" fill="${this.textColor}">${pct}%</text>`,
      );
    });

    parts.push('</svg>');
    return parts.join('');
  }

  private renderLine(data: LineDataPoint[]): string {
    const colors = this.getColors();
    const seriesNames = this.getSeries();

    const isMulti = data[0]?.values !== undefined;
    const seriesCount = isMulti ? (data[0].values?.length || 1) : 1;

    let maxVal = 0;
    data.forEach((d) => {
      if (isMulti && d.values) {
        d.values.forEach((v) => { if (v > maxVal) maxVal = v; });
      } else if (d.value !== undefined && d.value > maxVal) {
        maxVal = d.value;
      }
    });
    maxVal = safeMax(maxVal) * 1.1;

    const m: Margin = { top: 20, right: 20, bottom: 36, left: 48 };
    const chartW = Math.max(240, data.length * 56);
    const svgW = m.left + chartW + m.right;
    const svgH = m.top + CHART_HEIGHT + m.bottom + (seriesCount > 1 ? 28 : 0);

    const parts: string[] = [this.svgOpen(svgW, svgH)];
    this.renderHGrid(parts, m, chartW, CHART_HEIGHT, maxVal);

    // X labels
    const stepX = data.length > 1 ? chartW / (data.length - 1) : 0;
    data.forEach((d, i) => {
      const x = m.left + i * stepX;
      parts.push(
        `<text x="${x}" y="${m.top + CHART_HEIGHT + 18}" text-anchor="middle" font-size="10" fill="${this.subTextColor}">${esc(truncate(d.label, 6))}</text>`,
      );
    });

    // Lines + points per series
    for (let s = 0; s < seriesCount; s++) {
      const color = colors[s % colors.length];
      const coords: Array<{ x: number; y: number }> = [];

      data.forEach((d, i) => {
        const val = isMulti ? (d.values?.[s] ?? 0) : (d.value ?? 0);
        coords.push({
          x: m.left + i * stepX,
          y: m.top + CHART_HEIGHT - (val / maxVal) * CHART_HEIGHT,
        });
      });

      const pointsStr = coords.map((c) => `${c.x},${c.y}`).join(' ');

      // Area fill
      const baseline = m.top + CHART_HEIGHT;
      parts.push(
        `<polygon points="${coords[0].x},${baseline} ${pointsStr} ${coords[coords.length - 1].x},${baseline}" fill="${color}" opacity="0.08"/>`,
      );

      // Line
      parts.push(
        `<polyline points="${pointsStr}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
      );

      // Dots
      coords.forEach((c) => {
        parts.push(
          `<circle cx="${c.x}" cy="${c.y}" r="3.5" fill="white" stroke="${color}" stroke-width="2"/>`,
        );
      });
    }

    // Legend (multi-series)
    if (seriesCount > 1) {
      const ly = m.top + CHART_HEIGHT + 36;
      for (let s = 0; s < seriesCount; s++) {
        const lx = m.left + s * 100;
        const color = colors[s % colors.length];
        const name = seriesNames[s] || `Series ${s + 1}`;
        parts.push(
          `<line x1="${lx}" y1="${ly}" x2="${lx + 16}" y2="${ly}" stroke="${color}" stroke-width="2.5"/>`,
          `<circle cx="${lx + 8}" cy="${ly}" r="3" fill="white" stroke="${color}" stroke-width="2"/>`,
          `<text x="${lx + 22}" y="${ly + 4}" font-size="10" fill="${this.textColor}">${esc(name)}</text>`,
        );
      }
    }

    parts.push('</svg>');
    return parts.join('');
  }

  private renderScatter(data: ScatterPoint[]): string {
    const colors = this.getColors();
    const xLabel = this.getAttribute('x-label') || '';
    const yLabel = this.getAttribute('y-label') || '';

    const groups = [...new Set(data.map((d) => d.group || '').filter(Boolean))];
    const groupColor = (g: string) => colors[groups.indexOf(g) % colors.length] || colors[0];

    const xs = data.map((d) => d.x);
    const ys = data.map((d) => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const rangeX = safeMax(maxX - minX);
    const rangeY = safeMax(maxY - minY);
    const padX = rangeX * 0.1;
    const padY = rangeY * 0.1;

    const m: Margin = { top: 20, right: 20, bottom: 44, left: 52 };
    const chartW = 300;
    const svgW = m.left + chartW + m.right;
    const svgH = m.top + CHART_HEIGHT + m.bottom + (groups.length > 0 ? 28 : 0);

    const scaleX = (v: number) => m.left + ((v - minX + padX) / (rangeX + padX * 2)) * chartW;
    const scaleY = (v: number) => m.top + CHART_HEIGHT - ((v - minY + padY) / (rangeY + padY * 2)) * CHART_HEIGHT;

    const parts: string[] = [this.svgOpen(svgW, svgH)];

    // Horizontal grid
    for (let i = 0; i <= GRID_LINES; i++) {
      const y = m.top + (CHART_HEIGHT * i) / GRID_LINES;
      const val = maxY + padY - ((rangeY + padY * 2) * i) / GRID_LINES;
      parts.push(
        `<line x1="${m.left}" y1="${y}" x2="${m.left + chartW}" y2="${y}" stroke="${this.gridColor}" stroke-width="1" stroke-dasharray="4 4"/>`,
        `<text x="${m.left - 8}" y="${y + 4}" text-anchor="end" font-size="9" fill="${this.subTextColor}">${Math.round(val)}</text>`,
      );
    }
    // Vertical grid
    for (let i = 0; i <= GRID_LINES; i++) {
      const x = m.left + (chartW * i) / GRID_LINES;
      const val = minX - padX + ((rangeX + padX * 2) * i) / GRID_LINES;
      parts.push(
        `<line x1="${x}" y1="${m.top}" x2="${x}" y2="${m.top + CHART_HEIGHT}" stroke="${this.gridColor}" stroke-width="1" stroke-dasharray="4 4"/>`,
        `<text x="${x}" y="${m.top + CHART_HEIGHT + 16}" text-anchor="middle" font-size="9" fill="${this.subTextColor}">${Math.round(val)}</text>`,
      );
    }

    // Axis labels
    if (xLabel) {
      parts.push(
        `<text x="${m.left + chartW / 2}" y="${m.top + CHART_HEIGHT + 32}" text-anchor="middle" font-size="10" fill="${this.subTextColor}">${esc(xLabel)}</text>`,
      );
    }
    if (yLabel) {
      parts.push(
        `<text x="12" y="${m.top + CHART_HEIGHT / 2}" text-anchor="middle" font-size="10" fill="${this.subTextColor}" transform="rotate(-90 12 ${m.top + CHART_HEIGHT / 2})">${esc(yLabel)}</text>`,
      );
    }

    // Points
    data.forEach((d) => {
      const cx = scaleX(d.x);
      const cy = scaleY(d.y);
      const color = d.group ? groupColor(d.group) : colors[0];
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="5" fill="${color}" opacity="0.7" stroke="white" stroke-width="1.5"/>`,
      );
      if (d.label) {
        parts.push(
          `<text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="9" fill="${this.textColor}">${esc(truncate(d.label, 8))}</text>`,
        );
      }
    });

    // Legend
    if (groups.length > 0) {
      const ly = m.top + CHART_HEIGHT + (xLabel ? 46 : 32);
      groups.forEach((g, i) => {
        const lx = m.left + i * 100;
        const color = groupColor(g);
        parts.push(
          `<circle cx="${lx + 6}" cy="${ly}" r="5" fill="${color}" opacity="0.7"/>`,
          `<text x="${lx + 16}" y="${ly + 4}" font-size="10" fill="${this.textColor}">${esc(g)}</text>`,
        );
      });
    }

    parts.push('</svg>');
    return parts.join('');
  }
}

customElements.define('s-chart', SChart);
