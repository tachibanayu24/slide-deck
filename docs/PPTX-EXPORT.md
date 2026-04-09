# PPTX Export 機能 — 調査・試行記録

## 目標

ツールバーの PDF ボタン横に PPTX ダウンロードボタンを追加。テキスト・チャート・テーブルをネイティブ PowerPoint オブジェクトとして出力する（画像埋め込みではない）。

## ライブラリ調査結果

**pptxgenjs v4.0.1** が唯一の適合候補。

| 項目 | 詳細 |
|---|---|
| npm weekly downloads | 約180万 |
| ライセンス | MIT |
| ブラウザ対応 | UMD バンドル（CDN 1行）、file:// 対応 |
| ネイティブチャート | BAR, LINE, DOUGHNUT, SCATTER + コンボ |
| ネイティブテーブル | addTable() でセル単位の書式設定可能 |
| 背景画像 | path（URL）または data（base64）|
| バンドルサイズ | ~461KB（JSZip 同梱）|
| CDN | `https://cdn.jsdelivr.net/npm/pptxgenjs@4.0.1/dist/pptxgen.bundle.js` |

他の候補（docxtemplater: 有料モジュール必須、pptx-automizer: Node専用、nodejs-pptx: Node専用、react-pptx: React依存、dom-to-pptx: ネイティブチャート非対応）は要件不適合。

## PptxGenJS v4 API（正確な調査済み）

### チャートタイプ

3通りの指定方法（すべて同等）:
```javascript
pptx.charts.BAR      // インスタンスプロパティ（UPPER_CASE）→ "bar"
pptx.ChartType.bar   // インスタンスプロパティ（camelCase）→ "bar"
"bar"                // 文字列直接指定
```

| pptx.charts.* | 解決値 |
|---|---|
| BAR | "bar" |
| LINE | "line" |
| DOUGHNUT | "doughnut" |
| SCATTER | "scatter" |
| PIE | "pie" |
| AREA | "area" |

### シェイプタイプ

```javascript
pptx.shapes.RECTANGLE         → "rect"
pptx.shapes.ROUNDED_RECTANGLE → "roundRect"
pptx.shapes.OVAL              → "ellipse"
pptx.shapes.CHEVRON           → "chevron"
```

### データフォーマット

```javascript
// Bar / Line
[{ name: "Series", labels: ["Q1","Q2"], values: [100,200] }]

// Scatter
[{ name: "Group", labels: ["10","20"], values: [5,15] }]
// ※ labels は X 値（文字列）、values は Y 値
```

### 画像・背景の data フォーマット

```javascript
// PptxGenJS 推奨形式（data: プレフィックスなし）
slide.addImage({ data: "image/png;base64,iVBOR...", x, y, w, h });
slide.background = { data: "image/png;base64,iVBOR..." };

// data: プレフィックスありもランタイムでは動作する
slide.addImage({ data: "data:image/png;base64,iVBOR...", x, y, w, h });
```

**重要: SVG base64 は非対応。** `image/svg+xml;base64,...` を渡すとファイルパスとして解釈されエラーになる。SVG は canvas 経由で PNG にラスタライズしてから渡す必要がある。

### スライドサイズ

```javascript
pptx.defineLayout({ name: 'CUSTOM', width: 11.69, height: 6.57 }); // 297mm × 167mm
pptx.layout = 'CUSTOM';
```

## 試行した実装（2026-04-10）

### アーキテクチャ

```
packages/core/src/export/
  utils.ts          — px→inch変換、色パース、画像base64変換
  converters.ts     — 要素別変換関数（背景、テキスト、チャート、テーブル等）
  pptx-exporter.ts  — PptxGenJS動的ロード、スライド走査、変換ディスパッチ
```

- PptxGenJS は CDN から動的ロード（ボタンクリック時のみ、初回のみ）
- export 関数は IIFE バンドルに含める（~11KB 増）
- 座標変換: `getBoundingClientRect()` のピクセル比率でインチに変換

### 遭遇した問題

1. **SVG base64 非対応**
   - PptxGenJS は `image/svg+xml;base64,...` をファイルパスとして解釈しエラー
   - s-flow（シェブロンSVG）、Lucide アイコン（SVG）が全滅
   - 対策: canvas 経由で PNG にラスタライズ → async 化が必要
   - Lucide アイコンは `stroke="currentColor"` がSVGシリアライズ時に解決されず別途問題

2. **file:// プロトコルでの画像ロード**
   - `crossOrigin = 'anonymous'` を設定すると file:// で画像ロードが失敗
   - 対策: `location.protocol !== 'file:'` で分岐

3. **`data:` プレフィックス問題**
   - `canvas.toDataURL()` は `data:image/png;base64,...` を返す
   - PptxGenJS のドキュメント形式は `image/png;base64,...`（`data:` なし）
   - ランタイムでは両方動作するが、念のため除去する `toPptxData()` ヘルパーを用意

4. **チャートタイプ定数**
   - 当初 `pptx.charts.BAR` が v4 で変更されたと推測 → 実際には v3/v4 とも同じ
   - 文字列 `"bar"` でも `pptx.charts.BAR` でも動作する

5. **非同期処理の複雑さ**
   - 背景画像ロード、SVG→PNGラスタライズが async
   - forEach 内で await できない → for...of ループに変更
   - 各変換ステップを try/catch で保護（1つの失敗で全体停止を防止）

### 最終状態（リバート前）

テキスト・テーブル・KPI カードは概ね動作。以下が未解決:
- チャート: `addChart` は呼ばれるが出力で確認できず（サイレント失敗の可能性）
- s-flow SVG: PNG ラスタライズのアプローチを試みたが動作確認に至らず
- 背景画像: file:// での画像ロードが不安定
- Lucide アイコン: currentColor 問題で完全スキップ

## 次回の実装方針

1. **最小限のテストケースから始める** — 1スライド・1チャートだけのHTMLで `addChart` が動くか確認
2. **SVG → PNG 変換を先に安定させる** — `svgToPngBase64` のテストを独立して行う
3. **デバッグ用ログを充実させる** — 各ステップで生成されたデータを console.log
4. **段階的に要素を追加** — チャート → テーブル → 画像 → テキストの順で1つずつ確認
