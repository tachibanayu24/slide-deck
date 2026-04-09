export function injectGlobalStyles() {
  if (document.getElementById('sd-global-styles')) return;

  // Google Fonts
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap';
  document.head.appendChild(link);

  // Framework CSS
  const style = document.createElement('style');
  style.id = 'sd-global-styles';
  style.textContent = FRAMEWORK_CSS;
  document.head.appendChild(style);
}

/**
 * Framework-owned CSS only.
 * Typography, spacing, colors inside slides → Tailwind classes.
 */
const FRAMEWORK_CSS = /* css */ `
/* ============================================
   slide-deck — Framework CSS
   Only structural concerns. Content styling is Tailwind's job.
   ============================================ */

/* --- Body Reset --- */
body {
  margin: 0;
  padding: 0;
  background: #f1f5f9;
}

/* --- Deck Container --- */
s-deck {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  padding: 3rem 0 6rem;
  min-height: 100vh;
}

/* --- Slide Base --- */
s-slide {
  display: flex;
  flex-direction: column;
  width: 297mm;
  height: 167mm;
  padding: 3rem;
  box-sizing: border-box;
  position: relative;
  background: #ffffff;
  color: #0f172a;
  overflow: hidden;
  font-family: 'Noto Sans JP', system-ui, sans-serif;
  font-size: 1.125rem;
  line-height: 1.7;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.06);
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

/* --- Header Bar --- */
.sd-header {
  position: absolute;
  top: 1.25rem;
  left: 1.5rem;
  right: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #334155;
  pointer-events: none;
}

s-slide[theme="dark"] .sd-header {
  color: #cbd5e1;
}

/* Extra top padding when header is present to avoid content overlap */
s-slide[header]:not([layout="title"]):not([layout="section"]) {
  padding-top: 4.5rem;
}

/* --- Footer Bar --- */

/* Left footer: page number */
s-slide::before {
  content: attr(data-page) ' / ' attr(data-total);
  position: absolute;
  bottom: 1.25rem;
  left: 1.5rem;
  font-size: 0.7rem;
  color: #94a3b8;
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
}

/* Right footer: copyright */
s-slide::after {
  content: attr(data-copyright);
  position: absolute;
  bottom: 1.25rem;
  right: 1.5rem;
  font-size: 0.7rem;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

/* Hide footer on title slides */
s-slide[layout="title"]::before,
s-slide[layout="title"]::after {
  content: none;
}

/* --- Theme: Dark --- */
s-slide[theme="dark"] {
  color: #e2e8f0;
}

s-slide[theme="dark"]::before,
s-slide[theme="dark"]::after {
  color: #64748b;
}

/* ============================================
   Layout Presets
   ============================================ */

/* Title — centered, dramatic */
s-slide[layout="title"] {
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* Text — vertical flow */
s-slide[layout="text"] {
  justify-content: flex-start;
}

/* Text + Image — left text, right visual */
s-slide[layout="text-image"] {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
}

/* Image + Text — left visual, right text */
s-slide[layout="image-text"] {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
}

/* Two Column */
s-slide[layout="two-column"] {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* 2x2 Grid */
s-slide[layout="grid-2x2"] {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1.5rem;
}

/* Full Image */
s-slide[layout="full-image"] {
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}

s-slide[layout="full-image"] img,
s-slide[layout="full-image"] svg {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Chart — narrow text + wide chart area */
s-slide[layout="chart"] {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 2rem;
  align-items: center;
}

/* Section — for section breaks / chapter dividers */
s-slide[layout="section"] {
  justify-content: center;
  align-items: flex-start;
  padding: 4rem;
}

s-slide[layout="section"]:not([theme="dark"])::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: #2563eb;
}

/* TOC — left label + right content */
s-slide[layout="toc"] {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  align-items: center;
}

/* ============================================
   Element Base Styles
   Sensible defaults for common HTML elements.
   Can be overridden with Tailwind classes.
   ============================================ */

/* --- Tables --- */
s-slide table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

s-slide th {
  text-align: left;
  font-weight: 600;
  color: #64748b;
  padding: 0.5rem 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

s-slide td {
  padding: 0.375rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

s-slide[theme="dark"] th {
  color: #94a3b8;
  border-bottom-color: #334155;
}

s-slide[theme="dark"] td {
  border-bottom-color: #1e293b;
}

/* --- Lists --- */
s-slide ul, s-slide ol {
  padding-left: 1.5em;
}

s-slide li {
  margin-bottom: 0.25em;
}

/* --- Code --- */
s-slide code {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.85em;
  background: #f1f5f9;
  padding: 0.1em 0.35em;
  border-radius: 4px;
}

s-slide[theme="dark"] code {
  background: #1e293b;
}

s-slide pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 1.25rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.8rem;
  line-height: 1.6;
}

s-slide pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}

/* --- s-chart --- */
s-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* --- data-area: visual (auto-center content) --- */
[data-area="visual"] {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

[data-area="visual"] img,
[data-area="visual"] svg {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* ============================================
   Presentation Mode (Fullscreen)
   ============================================ */
s-deck:fullscreen,
s-deck.sd-fullscreen {
  background: #000;
  padding: 0;
  gap: 0;
  justify-content: center;
  overflow: hidden;
}

s-deck:fullscreen s-slide,
s-deck.sd-fullscreen s-slide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
  border-radius: 0;
}

s-deck:fullscreen s-slide.sd-active,
s-deck.sd-fullscreen s-slide.sd-active {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
  z-index: 1;
}

/* ============================================
   Grid View (Slide Overview)
   ============================================ */
s-deck.sd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  align-items: start;
}

/* Each grid cell is a wrapper that maintains aspect ratio */
s-deck.sd-grid .sd-grid-cell {
  position: relative;
  aspect-ratio: 297 / 167;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: sd-grid-in 0.35s ease both;
}

s-deck.sd-grid .sd-grid-cell:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 0 2px #2563eb;
}

/* Slide keeps its natural size, scaled down via transform */
s-deck.sd-grid s-slide {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  border-radius: 0;
  box-shadow: none;
}

@keyframes sd-grid-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Stagger animation per cell */
s-deck.sd-grid .sd-grid-cell:nth-child(1)  { animation-delay: 0ms; }
s-deck.sd-grid .sd-grid-cell:nth-child(2)  { animation-delay: 40ms; }
s-deck.sd-grid .sd-grid-cell:nth-child(3)  { animation-delay: 80ms; }
s-deck.sd-grid .sd-grid-cell:nth-child(4)  { animation-delay: 120ms; }
s-deck.sd-grid .sd-grid-cell:nth-child(5)  { animation-delay: 160ms; }
s-deck.sd-grid .sd-grid-cell:nth-child(6)  { animation-delay: 200ms; }
s-deck.sd-grid .sd-grid-cell:nth-child(7)  { animation-delay: 240ms; }
s-deck.sd-grid .sd-grid-cell:nth-child(8)  { animation-delay: 280ms; }
s-deck.sd-grid .sd-grid-cell:nth-child(9)  { animation-delay: 320ms; }
s-deck.sd-grid .sd-grid-cell:nth-child(10) { animation-delay: 360ms; }
s-deck.sd-grid .sd-grid-cell:nth-child(n+11) { animation-delay: 400ms; }

/* ============================================
   Print
   ============================================ */
@media print {
  @page {
    size: 297mm 167mm;
    margin: 0;
  }

  body {
    margin: 0;
    background: none;
  }

  s-deck {
    display: block;
    padding: 0;
    gap: 0;
    background: none;
  }

  s-slide {
    width: 100vw;
    height: 100vh;
    box-shadow: none;
    border-radius: 0;
    break-inside: avoid;
    page-break-after: always;
  }

  s-slide:last-child {
    page-break-after: auto;
  }

  .sd-no-print {
    display: none !important;
  }
}
`;
