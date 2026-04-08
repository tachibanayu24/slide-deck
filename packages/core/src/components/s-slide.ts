export class SSlide extends HTMLElement {
  private initialized = false;

  static get observedAttributes() {
    return ['bg'];
  }

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;
    this.applyBackground();
  }

  attributeChangedCallback() {
    this.applyBackground();
  }

  private applyBackground() {
    const bg = this.getAttribute('bg');
    if (bg) {
      this.style.background = bg;
    }
  }
}

customElements.define('s-slide', SSlide);
