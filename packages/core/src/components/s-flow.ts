/**
 * <s-flow> — Chevron process flow diagram.
 *
 * Usage:
 *   <s-flow data='[{"label":"分析","sub":"現状把握"},{"label":"策定","sub":"計画立案"}]'></s-flow>
 *
 * Attributes:
 *   data   — JSON array of steps: { label, sub?, color? }
 *   colors — Comma-separated color overrides
 */

/** Escape HTML/SVG special characters to prevent injection via data attributes. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const FLOW_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4'];

interface FlowStep {
  label: string;
  sub?: string;
  color?: string;
}

export class SFlow extends HTMLElement {
  private initialized = false;

  static get observedAttributes() {
    return ['data', 'colors'];
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

  private getColors(): string[] {
    const attr = this.getAttribute('colors');
    if (attr) return attr.split(',').map((c) => c.trim());
    return FLOW_COLORS;
  }

  private render() {
    const raw = this.getAttribute('data');
    if (!raw) return;

    let steps: FlowStep[];
    try {
      steps = JSON.parse(raw);
    } catch {
      return;
    }
    if (!Array.isArray(steps) || steps.length === 0) return;

    const colors = this.getColors();
    const n = steps.length;

    const arrowW = 18;
    const gap = 3;
    const svgH = 56;
    const svgW = 800;
    const stepW = (svgW - (n - 1) * gap) / n;

    // Build SVG with safe escaped content from parsed JSON data attributes
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.style.fontFamily = "'Noto Sans JP', system-ui, sans-serif";

    steps.forEach((step, i) => {
      const x = i * (stepW + gap);
      const color = step.color || colors[i % colors.length];
      const isFirst = i === 0;
      const isLast = i === n - 1;

      let points: string;
      if (isFirst) {
        points = `${x},0 ${x + stepW - arrowW},0 ${x + stepW},${svgH / 2} ${x + stepW - arrowW},${svgH} ${x},${svgH}`;
      } else if (isLast) {
        points = `${x},0 ${x + stepW},0 ${x + stepW},${svgH} ${x},${svgH} ${x + arrowW},${svgH / 2}`;
      } else {
        points = `${x},0 ${x + stepW - arrowW},0 ${x + stepW},${svgH / 2} ${x + stepW - arrowW},${svgH} ${x},${svgH} ${x + arrowW},${svgH / 2}`;
      }

      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', points);
      polygon.setAttribute('fill', color);
      svg.appendChild(polygon);

      const textX = x + (isFirst ? 0 : arrowW / 2) + (stepW - (isFirst ? 0 : arrowW / 2) - (isLast ? 0 : arrowW / 2)) / 2;

      if (step.sub) {
        const labelEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelEl.setAttribute('x', String(textX));
        labelEl.setAttribute('y', String(svgH / 2 - 5));
        labelEl.setAttribute('text-anchor', 'middle');
        labelEl.setAttribute('fill', 'white');
        labelEl.setAttribute('font-size', '13');
        labelEl.setAttribute('font-weight', '700');
        labelEl.textContent = step.label;
        svg.appendChild(labelEl);

        const subEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subEl.setAttribute('x', String(textX));
        subEl.setAttribute('y', String(svgH / 2 + 12));
        subEl.setAttribute('text-anchor', 'middle');
        subEl.setAttribute('fill', 'white');
        subEl.setAttribute('font-size', '9');
        subEl.setAttribute('opacity', '0.85');
        subEl.textContent = step.sub;
        svg.appendChild(subEl);
      } else {
        const labelEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelEl.setAttribute('x', String(textX));
        labelEl.setAttribute('y', String(svgH / 2 + 5));
        labelEl.setAttribute('text-anchor', 'middle');
        labelEl.setAttribute('fill', 'white');
        labelEl.setAttribute('font-size', '13');
        labelEl.setAttribute('font-weight', '700');
        labelEl.textContent = step.label;
        svg.appendChild(labelEl);
      }
    });

    this.replaceChildren(svg);
  }
}

customElements.define('s-flow', SFlow);
