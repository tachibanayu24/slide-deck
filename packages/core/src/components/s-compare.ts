/**
 * <s-compare> — Before/After comparison diagram.
 *
 * Usage:
 *   <s-compare
 *     before='[{"text":"手動入力","detail":"Excel転記"},{"text":"属人化","detail":"担当者依存"}]'
 *     after='[{"text":"自動連携","detail":"API統合"},{"text":"標準化","detail":"ワークフロー"}]'
 *     before-label="現状"
 *     after-label="目標">
 *   </s-compare>
 *
 * Attributes:
 *   before       — JSON array: { text, detail? }
 *   after        — JSON array: { text, detail? }
 *   before-label — Header for left side (default: "Before")
 *   after-label  — Header for right side (default: "After")
 */

interface CompareItem {
  text: string;
  detail?: string;
}

export class SCompare extends HTMLElement {
  private initialized = false;

  static get observedAttributes() {
    return ['before', 'after', 'before-label', 'after-label'];
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
    const rawBefore = this.getAttribute('before');
    const rawAfter = this.getAttribute('after');
    if (!rawBefore || !rawAfter) return;

    let beforeItems: CompareItem[];
    let afterItems: CompareItem[];
    try {
      beforeItems = JSON.parse(rawBefore);
      afterItems = JSON.parse(rawAfter);
    } catch {
      return;
    }

    const dark = this.isDark;
    const beforeLabel = this.getAttribute('before-label') || 'Before';
    const afterLabel = this.getAttribute('after-label') || 'After';

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '12px';
    container.style.alignItems = 'stretch';
    container.style.width = '100%';

    // Before column
    const beforeCol = this.buildColumn(beforeItems, beforeLabel, 'before', dark);
    container.appendChild(beforeCol);

    // Arrow divider
    const arrow = document.createElement('div');
    arrow.style.display = 'flex';
    arrow.style.alignItems = 'center';
    arrow.style.flexShrink = '0';
    const arrowCircle = document.createElement('div');
    arrowCircle.style.width = '32px';
    arrowCircle.style.height = '32px';
    arrowCircle.style.borderRadius = '50%';
    arrowCircle.style.background = dark ? 'rgba(59,130,246,0.2)' : '#dbeafe';
    arrowCircle.style.display = 'flex';
    arrowCircle.style.alignItems = 'center';
    arrowCircle.style.justifyContent = 'center';
    arrowCircle.style.fontSize = '16px';
    arrowCircle.style.color = '#3b82f6';
    arrowCircle.textContent = '\u2192';
    arrow.appendChild(arrowCircle);
    container.appendChild(arrow);

    // After column
    const afterCol = this.buildColumn(afterItems, afterLabel, 'after', dark);
    container.appendChild(afterCol);

    this.replaceChildren(container);
  }

  private buildColumn(items: CompareItem[], label: string, side: 'before' | 'after', dark: boolean): HTMLElement {
    const col = document.createElement('div');
    col.style.flex = '1';

    const isBefore = side === 'before';
    const accent = isBefore ? '#ef4444' : '#10b981';
    const bgLight = isBefore ? '#fef2f2' : '#ecfdf5';
    const borderLight = isBefore ? '#fecaca' : '#a7f3d0';
    const bgDark = isBefore ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)';
    const borderDark = isBefore ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)';

    // Header
    const header = document.createElement('div');
    header.style.fontSize = '13px';
    header.style.fontWeight = '900';
    header.style.color = accent;
    header.style.marginBottom = '8px';
    header.textContent = label;
    col.appendChild(header);

    // Items
    items.forEach((item) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'flex-start';
      row.style.gap = '8px';
      row.style.padding = '8px 10px';
      row.style.marginBottom = '6px';
      row.style.borderRadius = '6px';
      row.style.border = `1px solid ${dark ? borderDark : borderLight}`;
      row.style.background = dark ? bgDark : bgLight;

      const icon = document.createElement('span');
      icon.style.fontSize = '13px';
      icon.style.marginTop = '1px';
      icon.style.flexShrink = '0';
      icon.textContent = isBefore ? '\u2717' : '\u2713';
      icon.style.color = accent;
      row.appendChild(icon);

      const textWrap = document.createElement('div');
      const textEl = document.createElement('div');
      textEl.style.fontSize = '12px';
      textEl.style.fontWeight = '700';
      textEl.style.color = dark ? '#e2e8f0' : '#0f172a';
      textEl.textContent = item.text;
      textWrap.appendChild(textEl);

      if (item.detail) {
        const detailEl = document.createElement('div');
        detailEl.style.fontSize = '10px';
        detailEl.style.color = dark ? '#94a3b8' : '#64748b';
        detailEl.style.marginTop = '2px';
        detailEl.textContent = item.detail;
        textWrap.appendChild(detailEl);
      }

      row.appendChild(textWrap);
      col.appendChild(row);
    });

    return col;
  }
}

customElements.define('s-compare', SCompare);
