# Architecture

## 全体構成

プロジェクトは2層で構成する。

| 層 | 何か | 消費者 | 配布 |
|---|---|---|---|
| **フレームワーク** (`packages/core`) | Web Components + フレームワークCSS | ブラウザ | npm → unpkg/jsDelivr CDN |
| **プラグイン** (`plugin/`) | Skills / Commands / Examples | Claude Code | マーケットプレイスまたはGitHub |

ユーザー体験: プラグインをインストール → `/slide` で指示 → ClaudeがHTMLを生成（CDN参照付き） → ブラウザで開く。`npm install` 不要。

### なぜ分離するか

- フレームワーク単体でも使える（プラグインなしで手書きHTML可）
- プラグインは「Claudeへの知識注入」に専念。HTMLの実行には関与しない
- `file://` で開ける要件と整合する（HTMLはスタンドアロン、JSはCDN参照）

### スタイリング方針

- **フレームワークCSS** — スライドの構造のみ（サイズ、レイアウトGrid、テーマ色切替、ページ番号、print、プレゼンモード）
- **Tailwind CSS CDN** — コンテンツのスタイリング全般。LLMが追加知識ゼロで使える
- **Lucide Icons CDN** — アイコン。`<i data-lucide="icon-name">` で使用。手動SVGや絵文字の代わりに使う
- 独自ユーティリティクラスは作らない。Tailwindで表現する

## リポジトリ構成

```
slide-deck/
├── packages/
│   └── core/                    # npm パッケージ
│       ├── src/
│       │   ├── components/
│       │   │   ├── s-deck.ts    # コンテナ、ツールバー、プレゼンモード
│       │   │   └── s-slide.ts   # 個別スライド、bg属性
│       │   ├── styles/
│       │   │   └── global.css.ts  # フレームワークCSS（構造のみ）
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── plugin/                      # Claude Code プラグイン（Phase 2）
├── examples/
│   └── sample.html              # サンプルスライド
├── docs/
│   ├── HANDOFF.md               # 構想メモ（原本）
│   └── ARCHITECTURE.md          # 本ドキュメント
├── CLAUDE.md                    # Claude Code 向けプロジェクトガイド
├── README.md
├── LICENSE
└── package.json                 # ワークスペースルート
```

## フレームワーク設計

### コンポーネント

| コンポーネント | 役割 | 状態 |
|---|---|---|
| `<s-deck>` | スライドコンテナ。フッターバー、ツールバー（ナビ/グリッド/プレゼン/PDF）、キーボード操作。`copyright` 属性 | ✅ |
| `<s-slide>` | 個別スライド。`layout` / `theme` / `bg` / `section` 属性 | ✅ |
| `<s-chart>` | データ可視化。`type` + `data` でSVG描画。bar / bar-horizontal / donut / line / scatter | ✅ |
| `<s-mermaid>` | Mermaid.jsラッパー | Phase 3c |

### `<s-slide>` 属性

| 属性 | 説明 | 例 |
|---|---|---|
| `layout` | レイアウトプリセット | `title`, `text`, `text-image`, `image-text`, `two-column`, `grid-2x2`, `full-image`, `chart`, `section`, `toc` |
| `theme` | テーマ。`dark` でテキスト色を自動反転 | `dark` |
| `bg` | 背景。CSSの `background` 値 | `#0f172a`, `linear-gradient(...)` |
| `section` | フッター左側に表示するセクション名 | `Introduction` |

### `data-area` 属性

グリッドレイアウト（`text-image`, `image-text`, `chart`）の子要素にロールを明示:

- `data-area="text"` — テキストコンテンツ領域（セマンティックな意味のみ）
- `data-area="visual"` — 図表/画像領域（自動で中央揃え + object-fit）

### 設計原則

- **HTMLが一級市民**: コンポーネントは省略記法であり、いつでも生HTML/CSS/SVGに置換可能
- **属性駆動**: コンポーネントの設定はHTML属性で完結。JSのAPI呼び出し不要
- **Light DOM**: Shadow DOMの `::slotted()` はネスト要素にマッチしないため、スライド内コンテンツはLight DOMでスタイリング
- **IIFE形式**: `file://` でのCORS制約を回避するためESMではなくIIFE
- **PDF安全**: `print-color-adjust: exact`、SVGベース描画。Canvas/外部画像に依存しない
- **CDN単一ファイル**: esbuildで1ファイルに。依存ゼロ

### レイアウトプリセット

| プリセット | CSS構造 | 用途 |
|---|---|---|
| `title` | flex / center | タイトルスライド |
| `text` | flex / start | テキスト主体 |
| `text-image` | grid 1fr 1fr | 左テキスト + 右図解 |
| `image-text` | grid 1fr 1fr | 左図解 + 右テキスト |
| `two-column` | grid 1fr 1fr | 2カラム均等 |
| `grid-2x2` | grid 2×2 | 4象限マトリクス |
| `full-image` | flex / center | 全面画像/図解 |
| `chart` | grid 2fr 3fr | テキスト + チャート |
| `section` | flex + accent bar | セクション区切り |
| `toc` | grid 1fr 2fr | 目次 |

## プラグイン設計

### Claude Code プラグインの仕組み

- **Skills** — SKILL.mdでClaudeにドメイン知識を注入。Progressive Disclosureで必要時のみロード
- **Commands** — `.md` ファイルで `/xxx` スラッシュコマンドを定義
- **Agents** — 特化型サブエージェント定義
- **Hooks** — ツール実行前後にスクリプトを自動実行
- **MCP Servers** — 外部ツール連携
- **`CLAUDE_PLUGIN_DATA`** — プラグイン固有の永続ディレクトリ（アップデートを越えて存続）

配布方法:
- 公式マーケットプレイス（`anthropics/claude-plugins-official` にPR）
- 自前マーケットプレイス（GitHubリポジトリに `marketplace.json`）
- npm / 直接GitHub参照

### このプラグインで使うもの

| コンポーネント | 用途 | 状態 |
|---|---|---|
| **Commands** | `/slide` — 7フェーズスライド生成ワークフロー | ✅ |
| **Skills** | フレームワークAPIリファレンス、デザイン原則、17パターン例 | ✅ |
| **Agents** | slide-researcher, slide-visual, slide-reviewer, slide-visual-reviewer | ✅ |
| **Bin** | `slide-screenshot` — Puppeteerスクリーンショット撮影 | ✅ |
| **Bin** | `slide-gen-image` — Gemini画像生成CLI（白背景→透過変換、リトライ、スタイルディレクティブ対応） | ✅ |
| **Hooks** | SessionStart — puppeteer自動インストール | ✅ |

フィードバック蓄積は `CLAUDE_PLUGIN_DATA` に保存。

## スライド生成ワークフロー（`/slide` コマンド）

1. **テーマ入力** — ユーザーがスライドのテーマを入力
2. **ヒアリング** — Claudeが対話的に確認:
   - 資料の種類（調査・分析、ライトニングトーク、アーカイブ用資料 等）
   - デザインのトーン、対象オーディエンス
3. **アウトライン作成** — Claudeがスライド構成案を提示 → ユーザーがレビュー・修正
4. **スライド生成** — アウトライン確定後、HTMLを生成
   - 図表・画像が必要な場合はサブエージェントで並行生成
   - Gemini画像生成はAPIトークンがあれば使用、なければSVG/CSSで代替
5. **レビュー** — ユーザーが確認、修正指示があれば反映
6. **フィードバック蓄積** — 完成後、修正箇所やFBを `CLAUDE_PLUGIN_DATA` に保存し、次回以降の生成品質を向上

## 実装フェーズ

### Phase 1: フレームワーク基盤 ✅

- `<s-deck>` — ツールバー、ページ番号、プレゼンモード、キーボードナビ、グリッドビュー
- `<s-slide>` — 10種レイアウトプリセット、`theme`/`bg`/`section` 属性、`data-area`
- `copyright` 属性 → フッターバー（左: ページ番号+セクション名、右: コピーライト）
- Tailwind CSS CDN 統合
- フレームワークCSS（構造 + テーブル/リスト/コードのベーススタイル）
- print CSS（16:9、余白なし）

### Phase 2: Claude Codeプラグイン ✅

- `/slide` コマンド — 7フェーズワークフロー（Discovery → Review → Summary）
- サブエージェント4種 — slide-researcher, slide-visual, slide-reviewer, slide-visual-reviewer
- slide-generation スキル — APIリファレンス、デザイン原則、17パターン例
- `bin/slide-screenshot` — Puppeteer でスクリーンショット撮影（ビジュアルレビュー用）
- SessionStart フックで puppeteer・sharp 自動インストール

### Phase 3: コンポーネント拡充 + 生成品質向上 ✅

#### 3a. Gemini画像生成連携 ✅

- `plugin/bin/slide-gen-image` — Gemini画像生成CLI
  - Gemini API (`gemini-3.1-flash-image-preview`) で3Dオブジェクト/イラストを生成
  - 白背景→透過変換（sharp）、503リトライ（最大3回）
  - `--prompt`, `--style`, `--output`, `--width`, `--no-transparent` オプション
  - GEMINI_API_KEY は .env（cwd上方探索）または環境変数から読み込み
- slide-visual エージェントが SVG か Gemini画像かを用途に応じて自動判断
- デッキ全体の統一感: 共通スタイルディレクティブを全ビジュアルエージェントに渡す
- SessionStart フックで sharp を自動インストール

#### 3b. 生成プロンプトの品質向上 ✅

- SKILL.md にカラー戦略、グラデーションレシピ、カード装飾テクニック、視覚インパクトルールを追加
- Lucide Icons CDN 統合。手動SVG/絵文字の代わりにアイコンライブラリを使用
- 用途別 Gemini 画像プロンプト戦略（表紙/セクション/text-image で異なるサイズ・スタイル）
- スタイルプリセット選択は TODO.md へ移動

#### 3c. データ可視化コンポーネント ✅

- `<s-chart>` — bar / bar-horizontal / donut / line（複数系列）/ scatter（グループ色分け）
- ダーク背景自動対応、カスタムカラー、データ数に応じたサイズ自動調整
- `<s-mermaid>` は TODO.md へ移動

### Phase 4: 公開

- npm publish → CDN配信開始
- プラグインをマーケットプレイスに登録
- 実プレゼンで使って品質検証

## 技術的なポイント

### フレームワーク側

- **`connectedCallback` の冪等性**: `initialized` フラグで多重実行を防止
- **`disconnectedCallback`**: イベントリスナー・IntersectionObserver・ツールバーDOMを確実にクリーンアップ
- **`DOMContentLoaded` 待ち**: connectedCallback時点で子要素がパース未完了の場合がある。`document.readyState` をチェック
- **SVGベース描画**: `<s-chart>` はCanvasではなくSVGで描画。印刷時の解像度問題を回避
- **`print-color-adjust: exact`**: 背景色・グラデーションがPDFに反映されるようデフォルト適用

### プラグイン側

- **コンポーネントを1つ足すたびにClaudeで生成テスト**: API設計とプロンプト設計を同時に回す
- **examples/ がfew-shotの品質を決める**: パターン別のサンプルを充実させる
- **Progressive Disclosure**: スキルが大きくなりすぎないよう、詳細はreferences/に分離

### file:// 利用時の注意

- CDNへのHTTPリクエストが必要（インターネット接続前提）
- IIFE形式のためCORS制約なし
- 完全オフライン対応が必要になった場合は、プラグインのscripts/でJSをローカルコピーする仕組みを追加可能（優先度低）
