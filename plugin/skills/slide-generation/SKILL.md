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
  <script src="https://unpkg.com/slide-deck@latest/dist/slide-deck.js"></script>
</head>
<body>
  <s-deck copyright="©Company Inc.">
    <!-- s-slide 要素をここに並べる -->
  </s-deck>
</body>
</html>
```

## コンポーネント API

### `<s-deck>`

スライド全体のコンテナ。自動で以下を提供：
- フッターバー（左: ページ番号+セクション名、右: コピーライト）
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
| `section` | 任意 | フッター左側に表示するセクション名（例: `section="Introduction"`） |

フッターの表示ルール：
- `section` 属性あり → 左フッターに `ページ番号 | セクション名`
- `section` 属性なし → 左フッターに `ページ番号 / 総数`
- `layout="title"` → フッター非表示（表紙・裏表紙用）

### `data-area` 属性（子要素）

グリッド系レイアウトの子要素にロールを明示する。

| 値 | 効果 |
|---|---|
| `text` | セマンティックな意味のみ（スタイルなし） |
| `visual` | `display: flex` + 中央揃え。画像やSVGを自動でセンタリング |

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

### 色の使い方

- **メインテキスト**: `text-slate-800` (light) / 自動 (dark)
- **サブテキスト**: `text-slate-500` (light) / `text-slate-400` (dark)
- **アクセント**: `text-blue-600`, `bg-blue-50`, `border-blue-500`
- **強調**: `font-bold text-slate-800` or `font-semibold`
- **コードブロック背景**: `bg-slate-900 text-slate-200`

### ダーク背景スライド

`theme="dark"` を設定すれば本文色は自動で明色になる。見出しや強調は Tailwind クラスで個別指定：

```html
<s-slide layout="title" theme="dark" bg="linear-gradient(...)">
  <h1 class="text-white">...</h1>           <!-- 白 -->
  <p class="text-slate-400">...</p>          <!-- 薄いグレー -->
  <p class="text-blue-400 text-sm">...</p>   <!-- アクセント -->
</s-slide>
```

### 情報量の制約

- **1スライド3〜5ポイント**が目安。詰め込みすぎない
- スライドサイズは **297mm × 167mm**（16:9）。overflow: hidden なのではみ出すと切れる
- 余白を大切にする。`mb-4`, `space-y-3` 等で適度にスペースを取る

### SVG図解のガイドライン

- `viewBox` を設定し、width/height は親に合わせる
- テキストには `font-family: system-ui, sans-serif` を指定
- 色はTailwindパレットに合わせる（`#2563eb` = blue-600, `#f59e0b` = amber-500 等）
- 矢印は `<marker>` + `<defs>` で定義
- シンプルに。要素は5〜8個程度まで

## フィードバックの参照

過去のスライド生成でユーザーから受けたフィードバックが `${CLAUDE_PLUGIN_DATA}/feedback/` に保存されている場合があります。新しいスライドを生成する前に、このディレクトリを確認し、ユーザーの好みや過去の修正パターンを反映してください。
