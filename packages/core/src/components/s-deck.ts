import { injectGlobalStyles } from '../styles/global.css.js';

const TOOLBAR_CSS = /* css */ `
  :host {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    font-family: 'Noto Sans JP', system-ui, sans-serif;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 6px;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 12px;
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 10px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #cbd5e1;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    user-select: none;
    white-space: nowrap;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f1f5f9;
  }

  button:active {
    background: rgba(255, 255, 255, 0.15);
  }

  button.active {
    background: rgba(59, 130, 246, 0.3);
    color: #93c5fd;
  }

  .page-info {
    display: flex;
    align-items: center;
    padding: 0 8px;
    color: #94a3b8;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    min-width: 48px;
    justify-content: center;
  }

  .sep {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 4px;
  }

  .icon {
    font-size: 16px;
    line-height: 1;
  }

  @media print {
    :host { display: none; }
  }
`;

export class SDeck extends HTMLElement {
  private currentSlide = 0;
  private isPresenting = false;
  private isGridView = false;
  private toolbar: ShadowRoot | null = null;
  private toolbarHost: HTMLElement | null = null;
  private scrollObserver: IntersectionObserver | null = null;
  private initialized = false;

  static get observedAttributes() {
    return ['copyright'];
  }

  private readonly handleKeydown = (e: KeyboardEvent) => {
    if (!this.isPresenting) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
        e.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        this.prev();
        break;
      case 'Escape':
        this.exitPresent();
        break;
    }
  };

  private readonly handleFullscreenChange = () => {
    if (!document.fullscreenElement && this.isPresenting) {
      this.exitPresent();
    }
  };

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    injectGlobalStyles();

    const ready = () => {
      this.setupPageNumbers();
      this.setupHeaders();
      this.setupMessages();
      this.createToolbar();
      this.setupKeyboard();
      this.setupScrollObserver();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ready, { once: true });
    } else {
      ready();
    }
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    this.scrollObserver?.disconnect();
    this.toolbarHost?.remove();
  }

  private get slides(): HTMLElement[] {
    return Array.from(this.querySelectorAll('s-slide'));
  }

  attributeChangedCallback() {
    if (this.initialized) {
      this.propagateDeckAttributes();
    }
  }

  private setupPageNumbers() {
    const slides = this.slides;
    const total = slides.length;
    slides.forEach((slide, i) => {
      slide.setAttribute('data-page', String(i + 1));
      slide.setAttribute('data-total', String(total));
    });
    this.propagateDeckAttributes();
  }

  private propagateDeckAttributes() {
    const copyright = this.getAttribute('copyright') || '';
    this.slides.forEach((slide) => {
      slide.setAttribute('data-copyright', copyright);
    });
  }

  private setupHeaders() {
    const hiddenLayouts = ['title', 'section'];
    this.slides.forEach((slide) => {
      const header = slide.getAttribute('header');
      const layout = slide.getAttribute('layout') || '';
      if (!header || hiddenLayouts.includes(layout)) return;
      // Avoid duplicate injection
      if (slide.querySelector('.sd-header')) return;
      const el = document.createElement('div');
      el.className = 'sd-header';
      el.textContent = header;
      slide.appendChild(el);
    });
  }

  private setupMessages() {
    const hiddenLayouts = ['title', 'section'];
    this.slides.forEach((slide) => {
      const message = slide.getAttribute('message');
      const layout = slide.getAttribute('layout') || '';
      if (!message || hiddenLayouts.includes(layout)) return;
      if (slide.querySelector('.sd-message')) return;
      const el = document.createElement('div');
      el.className = 'sd-message';
      el.textContent = message;
      // Insert as first child so it appears at the top of content flow
      slide.prepend(el);
    });
  }

  private createToolbar() {
    this.toolbarHost = document.createElement('div');
    this.toolbar = this.toolbarHost.attachShadow({ mode: 'open' });

    // Static toolbar template
    this.toolbar.innerHTML = [
      '<style>', TOOLBAR_CSS, '</style>',
      '<div class="toolbar">',
      '  <button class="btn-prev" title="前のスライド"><span class="icon">\u25C0</span></button>',
      '  <span class="page-info"><span class="current">1</span> / <span class="total">1</span></span>',
      '  <button class="btn-next" title="次のスライド"><span class="icon">\u25B6</span></button>',
      '  <div class="sep"></div>',
      '  <button class="btn-grid" title="一覧表示"><span class="icon">\u2261</span></button>',
      '  <button class="btn-present" title="プレゼンテーション"><span class="icon">\u25A3</span></button>',
      '  <button class="btn-pdf" title="PDF出力"><span class="icon">\u2193</span> PDF</button>',
      '</div>',
    ].join('\n');

    const total = this.slides.length;
    const totalEl = this.toolbar.querySelector('.total');
    if (totalEl) totalEl.textContent = String(total);

    // Toolbar elements are created above, safe to query
    this.toolbar.querySelector('.btn-prev')?.addEventListener('click', () => this.prev());
    this.toolbar.querySelector('.btn-next')?.addEventListener('click', () => this.next());
    this.toolbar.querySelector('.btn-grid')?.addEventListener('click', () => this.toggleGrid());
    this.toolbar.querySelector('.btn-present')?.addEventListener('click', () => this.togglePresent());
    this.toolbar.querySelector('.btn-pdf')?.addEventListener('click', () => window.print());

    document.body.appendChild(this.toolbarHost);
  }

  private updateToolbar() {
    if (!this.toolbar) return;
    const currentEl = this.toolbar.querySelector('.current');
    if (currentEl) currentEl.textContent = String(this.currentSlide + 1);

    const presentBtn = this.toolbar.querySelector('.btn-present');
    if (presentBtn) presentBtn.classList.toggle('active', this.isPresenting);

    const gridBtn = this.toolbar.querySelector('.btn-grid');
    if (gridBtn) gridBtn.classList.toggle('active', this.isGridView);
  }

  private setupKeyboard() {
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  private setupScrollObserver() {
    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        if (this.isPresenting) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const target = entry.target;
            if (!(target instanceof HTMLElement)) continue;
            const idx = this.slides.indexOf(target);
            if (idx !== -1) {
              this.currentSlide = idx;
              this.updateToolbar();
            }
          }
        }
      },
      { threshold: 0.5 }
    );

    this.slides.forEach((slide) => this.scrollObserver!.observe(slide));
  }

  private goTo(index: number) {
    const slides = this.slides;
    if (index < 0 || index >= slides.length) return;

    this.currentSlide = index;
    this.updateToolbar();

    if (this.isPresenting) {
      slides.forEach((s, i) => s.classList.toggle('sd-active', i === index));
    } else {
      slides[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private next() {
    this.goTo(Math.min(this.currentSlide + 1, this.slides.length - 1));
  }

  private prev() {
    this.goTo(Math.max(this.currentSlide - 1, 0));
  }

  private toggleGrid() {
    if (this.isGridView) {
      this.exitGrid();
    } else {
      this.enterGrid();
    }
  }

  private enterGrid() {
    if (this.isPresenting) this.exitPresent();
    this.isGridView = true;

    // Wrap each slide in a grid cell
    this.slides.forEach((slide, i) => {
      const cell = document.createElement('div');
      cell.className = 'sd-grid-cell';
      cell.setAttribute('data-grid-index', String(i));
      this.insertBefore(cell, slide);
      cell.appendChild(slide);
      cell.addEventListener('click', this.handleGridClick);
    });

    this.classList.add('sd-grid');
    this.updateToolbar();

    // Calculate scale after layout
    requestAnimationFrame(() => this.updateGridScale());
  }

  private exitGrid() {
    this.isGridView = false;
    this.classList.remove('sd-grid');

    // Unwrap slides from grid cells
    const cells = Array.from(this.querySelectorAll('.sd-grid-cell'));
    cells.forEach((cell) => {
      const slide = cell.querySelector('s-slide');
      if (slide) {
        (slide as HTMLElement).style.transform = '';
        this.insertBefore(slide, cell);
      }
      cell.removeEventListener('click', this.handleGridClick);
      cell.remove();
    });

    this.updateToolbar();
  }

  private updateGridScale() {
    const cells = this.querySelectorAll('.sd-grid-cell');
    cells.forEach((cell) => {
      const slide = cell.querySelector('s-slide') as HTMLElement;
      if (!slide) return;
      const cellWidth = (cell as HTMLElement).offsetWidth;
      const slideWidth = slide.offsetWidth;
      if (slideWidth > 0) {
        const scale = cellWidth / slideWidth;
        slide.style.transform = `scale(${scale})`;
      }
    });
  }

  private readonly handleGridClick = (e: Event) => {
    const target = (e.currentTarget as HTMLElement);
    const idx = Number(target.getAttribute('data-grid-index'));
    if (!isNaN(idx)) {
      this.exitGrid();
      this.currentSlide = idx;
      this.updateToolbar();
      requestAnimationFrame(() => {
        this.slides[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  };

  private togglePresent() {
    if (this.isPresenting) {
      this.exitPresent();
    } else {
      this.enterPresent();
    }
  }

  private enterPresent() {
    if (this.isPresenting) return;
    if (this.isGridView) this.exitGrid();
    this.isPresenting = true;
    this.slides.forEach((s, i) => s.classList.toggle('sd-active', i === this.currentSlide));

    this.requestFullscreen().catch(() => {
      this.classList.add('sd-fullscreen');
    });

    this.updateToolbar();
  }

  private exitPresent() {
    this.isPresenting = false;
    this.classList.remove('sd-fullscreen');
    this.slides.forEach((s) => s.classList.remove('sd-active'));

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    this.updateToolbar();

    requestAnimationFrame(() => {
      this.slides[this.currentSlide]?.scrollIntoView({ block: 'center' });
    });
  }
}

customElements.define('s-deck', SDeck);
