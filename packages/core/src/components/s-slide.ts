export class SSlide extends HTMLElement {
  private initialized = false;

  static get observedAttributes() {
    return ['bg', 'bg-overlay'];
  }

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;
    this.applyBackground();
    this.applyOverlay();
  }

  attributeChangedCallback() {
    this.applyBackground();
    this.applyOverlay();
  }

  private applyBackground() {
    const bg = this.getAttribute('bg');
    if (bg) {
      this.style.background = bg;
    }
  }

  private applyOverlay() {
    let el = this.querySelector(':scope > .sd-overlay') as HTMLElement | null;
    const overlay = this.getAttribute('bg-overlay');

    if (overlay) {
      if (!el) {
        el = document.createElement('div');
        el.className = 'sd-overlay';
        this.prepend(el);
      }
      el.style.background = overlay;
    } else if (el) {
      el.remove();
    }
  }
}

customElements.define('s-slide', SSlide);
