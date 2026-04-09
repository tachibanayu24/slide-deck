# slide-deck

Web Components framework for HTML slide decks — LLM-friendly, PDF-ready.

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com/"></script>
  <script src="https://unpkg.com/@tachibanayu24/slide-deck@latest/dist/slide-deck.js"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body>
  <s-deck copyright="©Acme Inc.">
    <s-slide layout="title" theme="dark" bg="linear-gradient(135deg, #0f172a, #1e293b)">
      <h1 class="text-5xl font-black text-white">Hello, slide-deck</h1>
      <p class="text-xl text-slate-400 mt-4">LLM-friendly slides</p>
    </s-slide>

    <s-slide layout="text" header="Features" section="Intro">
      <h2 class="text-3xl font-bold mb-4">Why slide-deck?</h2>
      <ul class="space-y-2 text-lg text-slate-600">
        <li>HTML is a first-class citizen</li>
        <li>Style with Tailwind CSS — zero new knowledge</li>
        <li>PDF export via browser print</li>
      </ul>
    </s-slide>
  </s-deck>
  <script>lucide.createIcons();</script>
</body>
</html>
```

Open this file in a browser. That's it — no `npm install` required.

## Components

### `<s-deck>`

Slide container. Automatically provides footer bar, toolbar (navigation, present mode, grid view, PDF export), and keyboard navigation.

| Attribute | Description |
|---|---|
| `copyright` | Footer right text (e.g. `©Acme Inc.`) |

### `<s-slide>`

Individual slide.

| Attribute | Description | Example |
|---|---|---|
| `layout` | Layout preset | `title`, `text`, `text-image`, `image-text`, `two-column`, `grid-2x2`, `full-image`, `chart`, `section`, `toc` |
| `theme` | `dark` for auto light text | `dark` |
| `bg` | CSS `background` value | `linear-gradient(135deg, #0f172a, #1e293b)` |
| `header` | Slide title shown at top (hidden on title/section layouts) | `Market Overview` |
| `section` | Section name in footer left | `Introduction` |

### `<s-chart>`

Attribute-driven SVG charts. 5 types: `bar`, `bar-horizontal`, `donut`, `line`, `scatter`.

```html
<!-- Bar chart -->
<s-chart type="bar"
  data='[{"label":"Q1","value":120},{"label":"Q2","value":180}]'>
</s-chart>

<!-- Multi-series line chart -->
<s-chart type="line" series='["Revenue","Profit"]'
  data='[{"label":"2023","values":[100,40]},{"label":"2024","values":[150,60]}]'>
</s-chart>

<!-- Donut -->
<s-chart type="donut" label="Users"
  data='[{"label":"Mobile","value":60},{"label":"Desktop","value":40}]'>
</s-chart>

<!-- Scatter with groups -->
<s-chart type="scatter" x-label="X" y-label="Y"
  data='[{"label":"A","x":10,"y":20,"group":"G1"},{"label":"B","x":30,"y":50,"group":"G2"}]'>
</s-chart>
```

### `data-area` attribute

For grid layouts (`text-image`, `image-text`, `chart`), mark child elements with roles:

```html
<s-slide layout="text-image">
  <div data-area="text">...</div>
  <div data-area="visual"><!-- auto-centered --></div>
</s-slide>
```

## Layout Presets

| Layout | Structure | Use case |
|---|---|---|
| `title` | Centered flex | Cover, closing |
| `text` | Vertical flex | Body text, bullets |
| `text-image` | 1fr 1fr grid | Left text + right visual |
| `image-text` | 1fr 1fr grid | Left visual + right text |
| `two-column` | 1fr 1fr grid | Comparisons, side-by-side |
| `grid-2x2` | 2x2 grid | SWOT, matrices |
| `full-image` | Centered flex | Screenshots, large visuals |
| `chart` | 2fr 3fr grid | Text + chart area |
| `section` | Centered flex + accent bar | Chapter dividers |
| `toc` | 1fr 2fr grid | Table of contents |

## Features

- **Toolbar**: Navigation, grid overview, present mode (fullscreen + keyboard), PDF export
- **Footer**: Auto page numbers, section names, copyright
- **Header**: Per-slide title via `header` attribute
- **Dark theme**: `theme="dark"` auto-inverts text color
- **Print CSS**: 16:9, no margins, `print-color-adjust: exact`
- **Icons**: [Lucide](https://lucide.dev) via CDN — `<i data-lucide="icon-name">`
- **Charts**: 5 built-in SVG chart types with dark theme support

## Claude Code Plugin

Install the [slide-deck plugin](https://github.com/tachibanayu24/slide-deck) to generate entire slide decks with AI:

```bash
claude plugin install slide-deck
claude
> /slide Your topic here
```

## License

MIT
