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
| `<s-chart>` | データ可視化。`type` + `data` でSVG描画 | Phase 3c |
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
| **Skills** | フレームワークAPIリファレンス、デザイン原則、13パターン例 | ✅ |
| **Agents** | slide-researcher, slide-visual, slide-reviewer, slide-visual-reviewer | ✅ |
| **Bin** | `slide-screenshot` — Puppeteerスクリーンショット撮影 | ✅ |
| **Bin** | `slide-gen-image` — Gemini画像生成CLI | Phase 3a |
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
- slide-generation スキル — APIリファレンス、デザイン原則、13パターン例
- `bin/slide-screenshot` — Puppeteer でスクリーンショット撮影（ビジュアルレビュー用）
- SessionStart フックで puppeteer 自動インストール
- **生成品質のフィードバックループが回り始めた。まだシンプルすぎる課題あり**

### Phase 3: コンポーネント拡充 + 生成品質向上（次のセッションから）

#### 3a. Gemini画像生成連携（最優先）

参考実装: `tachibanayu24/article-writer` の `scripts/gen-ogp.mjs`
- Gemini API (`gemini-3.1-flash-image-preview`) で3Dオブジェクト/イラストを生成
- 白背景→透過変換して合成可能に
- スライド全体で統一感のあるスタイルディレクティブを使い回す

実装計画:
- `plugin/bin/slide-gen-image` — Gemini画像生成CLI（GEMINI_API_KEY は .env から読み込み、なければSVGフォールバック）
- Phase 5 で slide-visual エージェントが SVG か Gemini画像か判断
- 用途: 表紙/セクション区切りの背景、text-image の visual 側、装飾要素
- デッキ全体の統一感: 共通のスタイルディレクティブ（色味、質感、3D clay-like等）

#### 3b. 生成プロンプトの品質向上

- 現状「正しいHTML」寄りの生成指示を「視覚的に印象的」に転換
- グラデーション背景のバリエーション、カード装飾、アクセントカラーの戦略ガイド強化
- スタイルプリセット選択（Phase 1 で「ミニマル」「コーポレート」「カラフル」等を選べるように）

#### 3c. データ可視化コンポーネント

- `<s-chart>` — 棒グラフ、横棒、ドーナツ（SVG描画、`type` + `data` 属性）
- `<s-mermaid>` — Mermaid.js統合

#### 3d. ヘッダー機構

- フッターと対になる上部ヘッダー（ロゴ+セクション名のスロット）
- 参考PDFのLayerX Company Deck / LTスライドに見られるパターン

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
