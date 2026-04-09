/**
 * <s-kpi> — KPI metric cards.
 *
 * Usage:
 *   <s-kpi data='[{"label":"ARR","value":"52億円","change":"+42%","trend":"up"}]'></s-kpi>
 *
 * Attributes:
 *   data — JSON array: { label, value, change?, trend?: "up"|"down"|"neutral" }
 */

interface KpiItem {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export class SKpi extends HTMLElement {
  private initialized = false;

  static get observedAttributes() {
    return ['data'];
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

  private get isDark(): boolean {
    return this.closest('s-slide')?.getAttribute('theme') === 'dark';
  }

  private render() {
    const raw = this.getAttribute('data');
    if (!raw) return;

    let items: KpiItem[];
    try {
      items = JSON.parse(raw);
    } catch {
      return;
    }
    if (!Array.isArray(items) || items.length === 0) return;

    const dark = this.isDark;
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '12px';
    container.style.width = '100%';

    items.forEach((item) => {
      const card = document.createElement('div');
      card.style.flex = '1';
      card.style.textAlign = 'center';
      card.style.padding = '12px 8px';
      card.style.borderRadius = '8px';
      card.style.border = `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`;
      card.style.background = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc';

      const label = document.createElement('div');
      label.style.fontSize = '11px';
      label.style.color = dark ? '#94a3b8' : '#64748b';
      label.style.marginBottom = '4px';
      label.textContent = item.label;
      card.appendChild(label);

      const value = document.createElement('div');
      value.style.fontSize = '24px';
      value.style.fontWeight = '900';
      value.style.color = dark ? '#e2e8f0' : '#0f172a';
      value.style.lineHeight = '1.2';
      value.textContent = item.value;
      card.appendChild(value);

      if (item.change) {
        const change = document.createElement('div');
        change.style.fontSize = '11px';
        change.style.fontWeight = '700';
        change.style.marginTop = '4px';
        if (item.trend === 'up') {
          change.style.color = '#10b981';
        } else if (item.trend === 'down') {
          change.style.color = '#ef4444';
        } else {
          change.style.color = dark ? '#94a3b8' : '#64748b';
        }
        change.textContent = item.change;
        card.appendChild(change);
      }

      container.appendChild(card);
    });

    this.replaceChildren(container);
  }
}

customElements.define('s-kpi', SKpi);
