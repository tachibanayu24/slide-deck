# CLAUDE.md

## プロジェクト概要

HTMLスライドフレームワーク（npm/CDN）+ Claude Code プラグインのモノレポ。

- `packages/core/` — Web Components (`<s-deck>`, `<s-slide>`) + フレームワークCSS。esbuildでIIFEバンドル
- `plugin/` — Claude Code プラグイン（`/slide` コマンド、サブエージェント、スキル）
  - `commands/slide.md` — 7フェーズワークフロー
  - `agents/` — slide-researcher, slide-visual, slide-reviewer, slide-visual-reviewer
  - `skills/slide-generation/` — フレームワークAPIリファレンス
  - `bin/slide-screenshot` — Puppeteerベースのスクリーンショット撮影CLI
- `docs/` — 設計ドキュメント

## ビルド

```bash
npm install                              # ルートから依存インストール
npm run build --workspace=packages/core  # dist/slide-deck.js を生成
npm run typecheck --workspace=packages/core  # 型チェックのみ（noEmit）
```

esbuild で `src/index.ts` → `dist/slide-deck.js` (IIFE, minified)。`file://` で動くようIIFE形式。

## アーキテクチャ判断

- **Light DOM**: Shadow DOMの `::slotted()` はネスト要素にマッチしないため、スライド内コンテンツはLight DOMでスタイリング
- **Tailwind CSS CDN**: LLMが追加知識ゼロで使える。フレームワーク固有CSSは構造のみ（レイアウト、テーマ、print）
- **IIFE形式**: `file://` プロトコルでのCORS制約を回避するためESMではなくIIFE
- **DOMContentLoaded待ち**: `connectedCallback` 時点では子要素がパース未完了の場合があるため、`document.readyState` をチェック

## コーディング規約

- TypeScript strict mode
- esbuildがバンドルするため、importパスには `.js` 拡張子を使う
- Web Componentsの `connectedCallback` は冪等に（`initialized` フラグ）
- `disconnectedCallback` でイベントリスナー・Observerを必ずクリーンアップ

## ファイル編集時の注意

- `packages/core/src/` を変更したら `npm run build --workspace=packages/core` でリビルド
- `examples/sample.html` をブラウザで開いて動作確認（`file://` で直接開ける）
- フレームワークCSSは `global.css.ts` に集約。タイポグラフィや装飾はTailwindに任せる
- `<s-slide>` の `theme="dark"` はCSS属性セレクタで処理（JSは不要）

## 生成HTMLのテンプレート

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>タイトル</title>
  <script src="https://cdn.tailwindcss.com/"></script>
  <script>
    tailwind.config = {
      theme: { extend: { fontFamily: { sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'] } } }
    }
  </script>
  <script src="https://unpkg.com/@tachibanayu24/slide-deck@latest/dist/slide-deck.js"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body>
  <s-deck copyright="©Company Inc.">
    <s-slide layout="title" theme="dark" bg="...">
      <!-- 表紙: フッター非表示 -->
    </s-slide>
    <s-slide layout="text" section="セクション名">
      <!-- 本文: 左フッターにセクション名 -->
    </s-slide>
  </s-deck>
  <script>lucide.createIcons();</script>
</body>
</html>
```

### レイアウト一覧

`title`, `text`, `text-image`, `image-text`, `two-column`, `grid-2x2`, `full-image`, `chart`, `section`, `toc`

### `<s-chart>` コンポーネント

`type` + `data` 属性でSVG描画するデータ可視化コンポーネント。`bar`, `bar-horizontal`, `donut`, `line`, `scatter` に対応。

```html
<s-chart type="bar" data='[{"label":"Q1","value":120},{"label":"Q2","value":180}]'></s-chart>
<s-chart type="line" series='["売上","利益"]' data='[{"label":"2022","values":[100,40]},{"label":"2023","values":[150,60]}]'></s-chart>
<s-chart type="scatter" x-label="X軸" y-label="Y軸" data='[{"label":"A","x":10,"y":20,"group":"G1"}]'></s-chart>
```
