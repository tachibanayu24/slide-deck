# slide-deck

LLMフレンドリーなHTMLスライドフレームワーク + Claude Code プラグイン。

## 概要

- **Web Components** (`<s-deck>`, `<s-slide>`) でスライド構造を定義
- **Tailwind CSS** でコンテンツを自由にスタイリング
- **PDF出力** — ブラウザの印刷機能で完結（16:9、余白なし）
- **Claude Code プラグイン** — `/slide` コマンドでAIがスライドを自動生成

## アーキテクチャ

```mermaid
graph TB
  subgraph "ユーザー"
    U["/slide テーマ名"]
  end

  subgraph "Claude Code Plugin"
    CMD["/slide コマンド<br/>7フェーズ オーケストレーター"]
    SKILL["slide-generation スキル<br/>フレームワーク API リファレンス"]

    subgraph "サブエージェント（並列実行）"
      R1["🔍 slide-researcher<br/>コンテンツ調査"]
      R2["🔍 slide-researcher<br/>データ・事例収集"]
      V["🎨 slide-visual<br/>SVG 図解生成"]
      REV1["✅ slide-reviewer<br/>ファクトチェック"]
      REV2["✅ slide-reviewer<br/>デザイン・品質"]
      REV3["👁️ slide-visual-reviewer<br/>ビジュアル品質"]
    end
  end

  subgraph "フレームワーク（npm / CDN）"
    FW["slide-deck.js<br/>&lt;s-deck&gt; + &lt;s-slide&gt;"]
    TW["Tailwind CSS CDN"]
  end

  subgraph "出力"
    HTML["HTML スライド"]
    PDF["PDF"]
    PRES["プレゼンモード"]
  end

  U --> CMD
  CMD --> SKILL
  CMD -->|Phase 2| R1 & R2
  CMD -->|Phase 5| V
  CMD -->|Phase 6| REV1 & REV2 & REV3
  CMD -->|Phase 5| HTML
  HTML --> FW & TW
  HTML --> PDF
  HTML --> PRES
```

## `/slide` ワークフロー

```mermaid
graph LR
  P1["1️⃣ Discovery<br/>テーマ把握"]
  P2["2️⃣ Research<br/>調査"]
  P3["3️⃣ Clarification<br/>確認"]
  P4["4️⃣ Outline<br/>構成設計"]
  P5["5️⃣ Generation<br/>スライド生成"]
  P6["6️⃣ Review<br/>品質レビュー"]
  P7["7️⃣ Summary<br/>完了"]

  P1 -->|"👤 ヒアリング"| P2
  P2 -->|"🤖 並列調査"| P3
  P3 -->|"👤 確認"| P4
  P4 -->|"👤 承認"| P5
  P5 -->|"🤖 生成+図解"| P6
  P6 -->|"🤖 並列レビュー"| P7

  style P2 fill:#dbeafe,stroke:#2563eb
  style P5 fill:#dbeafe,stroke:#2563eb
  style P6 fill:#fef3c7,stroke:#f59e0b
```

## クイックスタート

### プラグインでスライド生成（推奨）

```bash
# プラグインをインストール
claude plugin install slide-deck

# スライドを生成
claude
> /slide 新機能の紹介
```

### フレームワーク単体で手書き

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
├── packages/core/          # npm パッケージ（Web Components + CSS）
├── plugin/                 # Claude Code プラグイン
│   ├── commands/slide.md   #   /slide コマンド（7フェーズ）
│   ├── agents/             #   サブエージェント（researcher, visual, reviewer, visual-reviewer）
│   ├── bin/                #   CLI ツール（slide-screenshot）
│   └── skills/             #   フレームワークリファレンス
├── examples/               # サンプル HTML
└── docs/                   # 設計ドキュメント
```

## 開発

```bash
npm install
npm run dev --workspace=packages/core   # watch モード
npm run build --workspace=packages/core # プロダクションビルド

# プラグインのローカルテスト
claude --plugin-dir plugin/
```

## ライセンス

MIT
