# slide-deck

LLMフレンドリーなHTMLスライドフレームワーク + Claude Code プラグイン。

## 概要

- **Web Components** (`<s-deck>`, `<s-slide>`) でスライド構造を定義
- **Tailwind CSS** でコンテンツを自由にスタイリング
- **PDF出力** — ブラウザの印刷機能で完結（16:9、余白なし）
- **Claude Code プラグイン** — `/slide` コマンドでAIがスライドを自動生成（開発中）

## クイックスタート

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Slides</title>
  <script src="https://cdn.tailwindcss.com/"></script>
  <script src="https://unpkg.com/slide-deck@latest/dist/slide-deck.js"></script>
</head>
<body>
  <s-deck>
    <s-slide layout="title" theme="dark" bg="linear-gradient(135deg, #0f172a, #1e293b)">
      <h1 class="text-5xl font-black text-white">Hello, slide-deck</h1>
      <p class="text-xl text-slate-400 mt-4">LLMフレンドリーなスライド</p>
    </s-slide>

    <s-slide layout="text">
      <h2 class="text-3xl font-bold mb-4">特徴</h2>
      <ul class="space-y-2 text-lg text-slate-600">
        <li>HTMLが一級市民</li>
        <li>Tailwindで自由にスタイリング</li>
        <li>PDFボタン一発でエクスポート</li>
      </ul>
    </s-slide>
  </s-deck>
</body>
</html>
```

## フレームワーク API

フレームワーク固有の知識はこれだけ。残りは Tailwind CSS。

### `<s-deck>`

スライドのコンテナ。ツールバー（ナビゲーション、プレゼンモード、PDF出力）を自動生成。

### `<s-slide>`

| 属性 | 説明 | 例 |
|---|---|---|
| `layout` | レイアウトプリセット | `title`, `text`, `text-image`, `image-text`, `two-column`, `grid-2x2`, `full-image`, `chart`, `section` |
| `theme` | テーマ。`dark` で文字色を自動反転 | `dark` |
| `bg` | 背景。CSS の `background` 値 | `#0f172a`, `linear-gradient(...)` |

### `data-area` 属性

グリッドレイアウト（`text-image`, `image-text`, `chart`）の子要素にロールを明示：

```html
<s-slide layout="text-image">
  <div data-area="text">...</div>
  <div data-area="visual"><!-- 自動で中央揃え --></div>
</s-slide>
```

## プロジェクト構成

```
slide-deck/
├── packages/core/     # npm パッケージ（Web Components + CSS）
├── plugin/            # Claude Code プラグイン（開発中）
├── examples/          # サンプル HTML
└── docs/              # 設計ドキュメント
```

## 開発

```bash
npm install
npm run dev --workspace=packages/core   # watch モード
npm run build --workspace=packages/core # プロダクションビルド
```

## ライセンス

MIT
