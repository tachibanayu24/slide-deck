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

  private togglePresent() {
    if (this.isPresenting) {
      this.exitPresent();
    } else {
      this.enterPresent();
    }
  }

  private enterPresent() {
    if (this.isPresenting) return;
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
