---
name: slide-generation
description: slide-deck フレームワーク（Web Components + Tailwind CSS）を使ったHTMLスライド生成の知識。レイアウト選択、スタイリング、PDF出力のガイドライン。
user-invocable: false
---

# slide-deck フレームワーク リファレンス

## 概要

slide-deck は Web Components (`<s-deck>`, `<s-slide>`) + Tailwind CSS で構成されるHTMLスライドフレームワーク。

- スライドの**構造**はフレームワーク属性で定義
- **コンテンツのスタイリング**は Tailwind CSS クラスで行う
- フレームワーク固有の知識は最小限。残りはTailwind

## HTMLテンプレート

すべてのスライドHTMLはこのhead構造を持つ：

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
    <!-- s-slide 要素をここに並べる -->
  </s-deck>
  <script>lucide.createIcons();</script>
</body>
</html>
```

## コンポーネント API

### `<s-deck>`

スライド全体のコンテナ。自動で以下を提供：
- フッターバー（左: ページ番号/総数、右: コピーライト）
- ツールバー（画面下部: ナビゲーション、プレゼンモード、PDF出力）
- キーボードナビゲーション（プレゼンモード時: ← → Space Esc）

| 属性 | 必須 | 説明 |
|---|---|---|
| `copyright` | 任意 | フッター右側に表示するコピーライト（例: `©Company Inc.`） |

```html
<s-deck copyright="©Company Inc.">
  <s-slide>...</s-slide>
</s-deck>
```

### `<s-slide>`

個別のスライド。

| 属性 | 必須 | 説明 |
|---|---|---|
| `layout` | 推奨 | レイアウトプリセット。省略時は `text` |
| `theme` | 任意 | `dark` を指定するとテキスト色を明色に自動切替 |
| `bg` | 任意 | 背景。CSSの `background` に渡す値 |
| `header` | 任意 | スライド上部に太字で表示するタイトル（1.1rem, 700）。`title`/`section` レイアウトでは非表示 |

フッターの表示ルール：
- 左フッターに `ページ番号 / 総数`
- `layout="title"` → フッター非表示（表紙・裏表紙用）

### `data-area` 属性（子要素）

グリッド系レイアウトの子要素にロールを明示する。

| 値 | 効果 |
|---|---|
| `text` | セマンティックな意味のみ（スタイルなし） |
| `visual` | `display: flex` + 中央揃え。画像やSVGを自動でセンタリング |

### `<s-chart>`

属性駆動のSVGチャート。`data-area="visual"` 内やスタンドアロンで使用。

| 属性 | 必須 | 説明 |
|---|---|---|
| `type` | 推奨 | `bar`, `bar-horizontal`, `donut`, `line`, `scatter`。省略時は `bar` |
| `data` | 必須 | JSON配列（形式はtypeにより異なる。下記参照） |
| `colors` | 任意 | カンマ区切りの色コード。省略時はTailwindパレットから自動 |
| `label` | 任意 | donut中央の説明テキスト（省略時: "Total"） |
| `series` | 任意 | line multi-series用。JSON配列 `'["売上","利益"]'` |
| `x-label` | 任意 | scatter用。X軸ラベル |
| `y-label` | 任意 | scatter用。Y軸ラベル |
| `label-width` | 任意 | bar-horizontal用。ラベル表示幅をpxで指定（省略時は自動計算） |

ダーク背景の `<s-slide>` 内では自動でテキスト色を明色に切替。

#### data 形式

| type | data 形式 |
|---|---|
| bar, bar-horizontal, donut | `[{"label":"名前","value":数値}]` |
| line（単一系列） | `[{"label":"Q1","value":120}]` |
| line（複数系列） | `[{"label":"Q1","values":[120,80]}]` + `series='["A","B"]'` |
| scatter | `[{"label":"名前","x":数値,"y":数値,"group":"グループ名"}]` |

#### bar-horizontal ラベルの注意

横棒グラフのラベルはチャート左側に表示され、ラベル長に応じて左マージンが自動調整されます。

- **推奨ラベル長**: 半角8文字 / 全角4文字以内が最適
- **最大表示幅**: 約160px（全角で約14文字、半角で約24文字）
- 超過分は省略記号（...）で切り詰められます
- 日本語ラベルが長い場合は略称を使うか、`label-width` 属性で明示的に幅を指定してください

```html
<!-- label-width で左マージンを広げる例 -->
<s-chart type="bar-horizontal" label-width="120"
  data='[{"label":"カスタマーサクセス","value":85},{"label":"プロダクト開発","value":62}]'>
</s-chart>
```

#### 使用例

```html
<!-- 縦棒グラフ -->
<s-chart type="bar" data='[{"label":"Q1","value":120},{"label":"Q2","value":180},{"label":"Q3","value":150},{"label":"Q4","value":210}]'></s-chart>

<!-- 横棒グラフ -->
<s-chart type="bar-horizontal" data='[{"label":"React","value":85},{"label":"Vue","value":62},{"label":"Angular","value":38}]'></s-chart>

<!-- ドーナツ -->
<s-chart type="donut" label="ユーザー" data='[{"label":"モバイル","value":60},{"label":"デスクトップ","value":30},{"label":"タブレット","value":10}]'></s-chart>

<!-- 折れ線グラフ（複数系列） -->
<s-chart type="line" series='["売上","利益"]' data='[{"label":"2022","values":[100,40]},{"label":"2023","values":[150,60]},{"label":"2024","values":[210,95]},{"label":"2025","values":[280,130]}]'></s-chart>

<!-- 散布図 -->
<s-chart type="scatter" x-label="エネルギー密度 (Wh/kg)" y-label="サイクル寿命" data='[{"label":"LFP","x":160,"y":3000,"group":"リチウム"},{"label":"NMC","x":250,"y":1500,"group":"リチウム"},{"label":"Na-ion","x":120,"y":2000,"group":"次世代"},{"label":"固体","x":400,"y":1000,"group":"次世代"}]'></s-chart>
```

## レイアウト一覧と使い分け

### `title` — タイトルスライド
- 用途: 表紙、セクション区切りの大見出し
- 構造: flex / center / center。すべて中央揃え
- 典型: h1 + p（サブタイトル）+ p（日付等）
- `theme="dark"` + グラデーション背景との組み合わせが映える

```html
<s-slide layout="title" theme="dark" bg="linear-gradient(135deg, #0f172a, #1e3a5f)">
  <h1 class="text-5xl font-black text-white">タイトル</h1>
  <p class="text-xl text-slate-400 mt-4">サブタイトル</p>
</s-slide>
```

### `text` — テキスト主体
- 用途: 箇条書き、説明、手順
- 構造: flex / column / start
- 目安: h2 + 3〜5個の箇条書き or 2〜3段落

```html
<s-slide layout="text">
  <h2 class="text-3xl font-bold mb-6">見出し</h2>
  <ul class="space-y-3 text-lg">
    <li><strong class="text-slate-800">ポイント1</strong> <span class="text-slate-500">— 説明</span></li>
    <li><strong class="text-slate-800">ポイント2</strong> <span class="text-slate-500">— 説明</span></li>
  </ul>
</s-slide>
```

### `text-image` — 左テキスト + 右図解
- 用途: 説明 + 図、コンセプト + ビジュアル
- 構造: grid 1fr 1fr / align center
- 子要素2つ必要。`data-area="text"` と `data-area="visual"` を付ける

```html
<s-slide layout="text-image">
  <div data-area="text">
    <h2 class="text-2xl font-bold mb-4">見出し</h2>
    <p class="text-slate-500">説明テキスト</p>
  </div>
  <div data-area="visual">
    <svg><!-- 図解 --></svg>
  </div>
</s-slide>
```

### `image-text` — 左図解 + 右テキスト
- `text-image` の逆配置。使い方は同じ

### `two-column` — 2カラム均等
- 用途: 比較、並列情報、Before/After
- 構造: grid 1fr 1fr / align start
- 子要素2つ必要

### `grid-2x2` — 4象限マトリクス
- 用途: 比較表、分類、SWOT分析
- 構造: grid 2×2 / gap 1.5rem
- 子要素4つ必要

### `full-image` — 全面ビジュアル
- 用途: スクリーンショット、大きな図解
- padding少なめ（1.5rem）、画像は自動fit

### `chart` — チャート主体
- 用途: データ可視化 + 簡単な説明
- 構造: grid 2fr 3fr（左テキスト狭め、右チャート広め）
- 子要素2つ。左にテキスト、右にSVGチャート

### `section` — セクション区切り
- 用途: 章の区切り、トピック転換
- ライトテーマ: 左端に青いアクセントバー
- ダークテーマ + bg: 全画面カラー背景の章区切り（`title` でも代用可）

```html
<!-- ライトテーマ: アクセントバー付き -->
<s-slide layout="section">
  <p class="text-sm text-blue-600 font-semibold">Chapter 1</p>
  <h2 class="text-4xl font-black mt-2">はじめに</h2>
</s-slide>

<!-- ダークテーマ: 全画面カラー背景 -->
<s-slide layout="section" theme="dark" bg="linear-gradient(135deg, #2563eb, #7c3aed)">
  <p class="text-8xl font-black text-white/30">1</p>
  <h2 class="text-4xl font-black text-white mt-4">はじめに</h2>
</s-slide>
```

### `toc` — 目次
- 用途: 目次ページ、章の一覧
- 構造: grid 1fr 2fr（左ラベル、右コンテンツ）
- 子要素2つ必要

```html
<s-slide layout="toc">
  <div>
    <p class="text-sm text-blue-600 font-semibold">Agenda</p>
    <h2 class="text-3xl font-black mt-1">目次</h2>
  </div>
  <div class="space-y-4">
    <div><span class="text-3xl font-black text-slate-800 mr-4">1</span><span class="text-xl font-bold">テーマ名</span></div>
    <div><span class="text-3xl font-black text-slate-800 mr-4">2</span><span class="text-xl font-bold">テーマ名</span></div>
  </div>
</s-slide>
```

## スタイルプリセット

Phase 1 でユーザーが選択したプリセットに従って、配色・背景・装飾を統一する。

### シンプル

白背景中心。色は控えめに使い、情報の構造で勝負する。

| 要素 | 指定 |
|---|---|
| 表紙・締め bg | `linear-gradient(135deg, #0f172a, #1e3a5f)` |
| セクション区切り | ライトテーマ + アクセントバー（`layout="section"` デフォルト） |
| メインカラー | blue-600 (`#2563eb`) |
| アクセント | slate-800 のみ。追加色は使わない |
| カード | `bg-slate-50 rounded-xl p-5` |
| 装飾 | 最小限。線や影は控える |

### ビビッド

鮮やかなグラデーション、強いコントラスト。視覚的インパクト重視。

| 要素 | 指定 |
|---|---|
| 表紙・締め bg | `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)` |
| セクション区切り | ダークテーマ + グラデーション bg（色は章ごとに変えてもよい） |
| メインカラー | blue-600 (`#2563eb`) |
| アクセント | purple-600 (`#7c3aed`), amber-500 (`#f59e0b`) |
| カード | `bg-blue-50 rounded-xl p-5` など色付き背景。グラスモーフィズムも可 |
| 装飾 | グラデーション背景、drop-shadow、半透明カードを積極的に使う |

### ダーク

ダーク背景が主体。テック・エンジニアリング系に映える。

| 要素 | 指定 |
|---|---|
| 表紙・締め bg | `linear-gradient(160deg, #0c0a09, #1c1917 50%, #292524)` |
| セクション区切り | ダークテーマ + `bg="#1e293b"` 等の単色ダーク |
| 本文スライド | `theme="dark" bg="#0f172a"` — 全スライドダーク |
| メインカラー | cyan-400 (`#22d3ee`) or blue-400 (`#60a5fa`) |
| アクセント | emerald-400 (`#34d399`) |
| カード | `bg-white/5 border border-white/10 rounded-xl p-5` |
| 装飾 | ネオン風のアクセント色、subtle glow |

### ナチュラル

アースカラー中心。温かみと信頼感。

| 要素 | 指定 |
|---|---|
| 表紙・締め bg | `linear-gradient(135deg, #292524, #44403c)` |
| セクション区切り | ライトテーマ + `bg="linear-gradient(135deg, #ecfdf5, #f0fdfa)"` 等のソフト系 |
| メインカラー | emerald-700 (`#047857`) |
| アクセント | amber-600 (`#d97706`) |
| カード | `bg-emerald-50 rounded-xl p-5` / `bg-amber-50` |
| 装飾 | ソフトグラデーション。影は `shadow-sm` まで |

## デザイン基本原則

### 共通ルール
- **整列と一貫性**: 全要素をグリッドに沿って配置。マージン、フォント、配色を全ページ統一
- **視覚的階層化**: 大見出し＞中見出し＞本文をサイズ・太さ・色で明確に区別し視線を誘導
- **色彩戦略**: ベース、メイン、アクセントの3〜5色に限定。装飾着色を排除し強調箇所のみに色を使用
- **ノイズの排除**: 無意味な罫線・枠線・装飾を徹底排除

### 投影用スライド（プレゼン向け）
対象: LT、カンファレンス発表、社内プレゼン
- **1 Slide, 1 Message**: 1ページ1メッセージ。「瞬時に見て伝わる」量に絞る
- **視認性最大化**: 文字は大きく、太いウェイト（`text-3xl font-bold` 以上）
- **余白の解放**: ネガティブスペースを多く取り、焦点を際立たせる

### 配布用スライド（読解・ドキュメント向け）
対象: カンパニーデック、報告書、社内共有資料
- **構造化密度**: 上部リード文 + 下部に複数の論拠。情報の網羅性・正確性を担保
- **読解タイポグラフィ**: 適切な文字サイズ（`text-sm` 〜 `text-base`）、ゆとりある行間
- **境界線としての余白**: 情報チャンクを論理ブロックに区切る

## スタイリングガイドライン

### フォントサイズの目安

| 要素 | Tailwindクラス |
|---|---|
| スライドタイトル（表紙） | `text-4xl` 〜 `text-5xl font-black` |
| スライド見出し | `text-2xl` 〜 `text-3xl font-bold` |
| 本文 | `text-base` 〜 `text-lg` |
| 補足・注釈 | `text-sm text-slate-400` |
| バッジ・ラベル | `text-xs font-bold` |

### カラー戦略

デッキ全体で **ベース + メイン + アクセント** の3色を決め、全スライドで統一する。

| 役割 | 用途 | 例（Blue系） | 例（Emerald系） |
|---|---|---|---|
| ベース | テキスト、背景 | slate-800 / slate-50 | slate-800 / slate-50 |
| メイン | 見出し装飾、アイコン背景、セクション色 | blue-600 / blue-50 | emerald-600 / emerald-50 |
| アクセント | CTA、数値ハイライト、バッジ | amber-500 | violet-500 |

テキスト色の基本:
- **メインテキスト**: `text-slate-800` (light) / 自動 (dark)
- **サブテキスト**: `text-slate-500` (light) / `text-slate-400` (dark)
- **強調**: `font-bold text-slate-800` or `font-semibold`

### グラデーション背景レシピ

表紙・セクション区切りで使い分ける。**1デッキ内では同系色のバリエーション**を使って統一感を保つ。

```
/* ダーク系（表紙・締め） */
bg="linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)"          /* Deep Navy */
bg="linear-gradient(135deg, #0f172a 0%, #312e81 100%)"          /* Midnight Indigo */
bg="linear-gradient(160deg, #0c0a09 0%, #1c1917 50%, #292524 100%)" /* Warm Dark */

/* ビビッド系（セクション区切り） */
bg="linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)"          /* Blue → Purple */
bg="linear-gradient(135deg, #059669 0%, #0891b2 100%)"          /* Emerald → Cyan */
bg="linear-gradient(135deg, #dc2626 0%, #ea580c 100%)"          /* Red → Orange */

/* ソフト系（ライト背景のアクセント） */
bg="linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)"          /* Blue-50 → Violet-50 */
bg="linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)"          /* Emerald-50 → Teal-50 */
```

### ダーク背景スライド

`theme="dark"` を設定すれば本文色は自動で明色になる。見出しや強調は Tailwind クラスで個別指定：

```html
<s-slide layout="title" theme="dark" bg="linear-gradient(135deg, #0f172a, #1e3a5f)">
  <h1 class="text-white">...</h1>           <!-- 白 -->
  <p class="text-slate-400">...</p>          <!-- 薄いグレー -->
  <p class="text-blue-400 text-sm">...</p>   <!-- アクセント -->
</s-slide>
```

### カード装飾テクニック

箇条書きの代わりにカードで情報を構造化すると、視覚的インパクトが大きく上がる。

```html
<!-- メインカラーの左ボーダー -->
<div class="bg-white border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">

<!-- 薄い背景 + アイコン番号 -->
<div class="bg-blue-50 rounded-xl p-5">
  <div class="text-3xl font-black text-blue-500 mb-2">01</div>
  <h3 class="font-bold text-slate-800">タイトル</h3>
  <p class="text-sm text-slate-500 mt-1">説明</p>
</div>

<!-- ハイライト数値 -->
<div class="text-center">
  <div class="text-4xl font-black text-blue-600">98%</div>
  <div class="text-sm text-slate-400 mt-1">顧客満足度</div>
</div>

<!-- グラスモーフィズム（ダーク背景上で） -->
<div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
  <p class="text-white">内容</p>
</div>
```

### 視覚的インパクトのルール

1. **数値は大きく、単位は小さく**: `<span class="text-5xl font-black">42</span><span class="text-xl">%</span>`
2. **キーメッセージは引用ブロックで**: `bg-blue-50 border-l-4 border-blue-500` で目立たせる
3. **アイコンは Lucide を使う**: 絵文字ではなく `<i data-lucide="icon-name">` を使う（下記参照）
4. **コントラストで視線誘導**: 重要な要素だけに色を使い、それ以外は `slate-400` 〜 `slate-500`
5. **カードの影は控えめに**: `shadow-sm` が基本。`shadow-lg` は1枚のスライドで1箇所まで

### 情報量の制約

- **1スライド3〜5ポイント**が目安。詰め込みすぎない
- スライドサイズは **297mm × 167mm**（16:9）。overflow: hidden なのではみ出すと切れる
- 余白を大切にする。`mb-4`, `space-y-3` 等で適度にスペースを取る

### Lucide アイコン

Lucide CDN でアイコンを使用する。手動SVGや絵文字の代わりにこちらを使う。

```html
<!-- 基本 -->
<i data-lucide="arrow-right" class="w-5 h-5"></i>

<!-- カード内アイコン（色付き背景 + アイコン） -->
<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
  <i data-lucide="zap" class="w-5 h-5 text-blue-600"></i>
</div>

<!-- ダーク背景 -->
<i data-lucide="check-circle" class="w-6 h-6 text-emerald-400"></i>
```

よく使うアイコン名: `arrow-right`, `check-circle`, `zap`, `shield`, `globe`, `database`, `users`, `trending-up`, `bar-chart-3`, `rocket`, `lightbulb`, `target`, `layers`, `git-branch`, `cloud`, `lock`, `server`

参照: https://lucide.dev/icons

### ビジュアルのガイドライン

#### SVG図解
- 詳細なルール（カラーパレット、矢印テンプレート、図解パターン）は `slide-visual` エージェント定義を参照
- 基本: `viewBox` 必須 + `width="100%"`、色はTailwindパレット準拠、要素は5〜8個程度まで

#### Gemini画像（3Dオブジェクト・イラスト）
- `slide-gen-image` CLIで生成。GEMINI_API_KEY が必要（なければSVGにフォールバック）
- 画像は `.images/` ディレクトリに保存し、相対パスで参照
- 白背景→透過変換済み。`drop-shadow-lg` で浮遊感を演出
- デッキ全体で共通のスタイルディレクティブを使い、統一感を保つ

```html
<!-- Gemini画像の埋め込み例 -->
<div data-area="visual">
  <img src=".images/cloud-server.png" alt="クラウドサーバー" class="w-full h-auto object-contain drop-shadow-lg">
</div>
```

## フィードバックの参照

過去のスライド生成でユーザーから受けたフィードバックが `${CLAUDE_PLUGIN_DATA}/feedback/` に保存されている場合があります。新しいスライドを生成する前に、このディレクトリを確認し、ユーザーの好みや過去の修正パターンを反映してください。
