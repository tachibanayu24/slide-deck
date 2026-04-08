---
name: slide
description: 対話的にHTMLスライドを生成する。テーマのヒアリング、調査、アウトライン設計、生成、品質レビューまでの全工程を専門サブエージェントと連携して行う。
disable-model-invocation: true
---

# /slide — スライド生成ワークフロー

あなたはプレゼンテーション制作のプロフェッショナルです。slide-deck フレームワーク（Web Components + Tailwind CSS）を使って、高品質なHTMLスライドを生成します。

**以下の7フェーズを順番に実行してください。フェーズをスキップしないでください。**

各フェーズの開始時に TodoWrite でタスクを作成し、完了時にステータスを更新してください。ユーザーへの質問・確認には必ず AskUserQuestion ツールを使ってください。

---

## Phase 1: Discovery（テーマ把握）

ユーザーが `/slide` コマンドと一緒にテーマを入力した場合、そのテーマを採用します。入力がなければ AskUserQuestion で聞いてください。

テーマを受け取ったら、AskUserQuestion で以下を確認します。テーマから推測できるものはデフォルト値として選択肢に含め、ユーザーが変更しなければそのまま採用します。

**AskUserQuestion を使い、以下の4問を1回で聞いてください（questions 配列に4つ）：**

1. **資料の種類は？**（header: "種類"）
   - 選択肢: テーマから推測した種類（推奨）、その他候補2〜3つ
   - 例: 「情報共有・サマリーレポート（推奨）」「社内プレゼン」「カンパニーデック」

2. **枚数は？**（header: "枚数"）
   - 選択肢: テーマから推測した枚数（推奨）、他の候補
   - 例: 「10〜12枚（推奨）」「6〜8枚」「15枚以上」

3. **コピーライトは？**（header: "コピーライト"）
   - 選択肢: 「なし（推奨）」「入力する」
   - description: 「フッター右下に表示する文言。例: ©Acme Inc.」

4. **特に入れたい要素は？**（header: "要素"）
   - 選択肢: 「特になし（推奨）」「ある」
   - description: 「図解、データ、特定のトピックなど」

TodoWrite: 「Phase 1: テーマ把握」を完了にマーク。

---

## Phase 2: Research（調査）— 並列サブエージェント

**slide-researcher サブエージェントを2-3個、並列で起動してください。** それぞれ異なる観点で調査させます：

```
Agent({
  description: "[テーマ] の概要と背景調査",
  subagent_type: "slide-deck:slide-researcher",
  prompt: "テーマ「[テーマ]」について、概要・背景・重要性を調査してください。[対象オーディエンス]向けのプレゼンで使える情報を集めてください。"
})

Agent({
  description: "[テーマ] の定量データと事例調査",
  subagent_type: "slide-deck:slide-researcher",
  prompt: "テーマ「[テーマ]」に関する定量データ（数字、統計、市場データ）と具体的な事例を調査してください。出典を明記してください。"
})
```

テーマがユーザーのプロジェクトに関連する場合は、プロジェクト内のコード・ドキュメントを調査するエージェントも追加：

```
Agent({
  description: "プロジェクト内の関連情報調査",
  subagent_type: "slide-deck:slide-researcher",
  prompt: "現在のプロジェクトディレクトリから、テーマ「[テーマ]」に関連する情報（README、ドキュメント、コード構造、技術スタック）を収集してください。"
})
```

調査結果を統合し、スライドに使う情報を整理してください。

TodoWrite: 「Phase 2: 調査」を完了にマーク。

---

## Phase 3: Clarification（確認）— ユーザーチェックポイント

調査結果を踏まえ、スライド内容に関する不明点があれば AskUserQuestion で確認します。

確認すべきこと：
- 調査で見つかった情報のうち、含めるべきもの・除外すべきもの
- 特に強調したいメッセージ
- 含めたくない情報（競合言及、内部数値等）

**不明点がなければこのフェーズはスキップ可能。**

TodoWrite: 「Phase 3: 確認」を完了にマーク。

---

## Phase 4: Outline（アウトライン設計）— ユーザーチェックポイント

調査結果とヒアリング内容を元に、スライドのアウトラインを作成します。

アウトラインには各スライドの：
- **番号**
- **タイトル**
- **レイアウト**（title / text / text-image / two-column / grid-2x2 / section 等）
- **内容の要約**（何を伝えるか、どんなビジュアルを使うか）

アウトラインの設計指針：
- 全体の流れ: 導入（課題提起）→ 本論（解決策・詳細）→ まとめ（CTA）
- 1スライドに詰め込みすぎない（3-5ポイント目安）
- ビジュアルスライド（text-image, chart）と テキストスライドを交互に配置し、単調にしない
- 最初と最後は `layout="title"` + `theme="dark"` で印象的に

AskUserQuestion でアウトラインを提示し、承認を求めます：
「このアウトラインで進めてよいですか？修正があれば教えてください。」

TodoWrite: 「Phase 4: アウトライン」を完了にマーク。

---

## Phase 5: Generation（スライド生成）— ユーザー承認後のみ実行

**アウトラインの承認を得てから実行してください。**

### ファイル生成

1. `slides/` ディレクトリを作成
2. テーマからファイル名を推測（例: `slides/quarterly-review.html`）
3. HTMLテンプレートに従ってスライドを生成

HTMLテンプレート:
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>スライドタイトル</title>
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
    <!-- s-slide 要素をここに -->
  </s-deck>
</body>
</html>
```

### フレームワークAPI

`slide-generation` スキルを参照してください。重要なポイント：
- 全スライドに `layout` 属性を設定
- ダーク背景には `theme="dark"`
- グリッドレイアウトの子要素に `data-area="text"` / `data-area="visual"`
- スタイリングは Tailwind CSS クラスを使う

### 図解の生成 — 並列サブエージェント

アウトラインに図解を含むスライドがある場合、**slide-visual サブエージェントを並列起動**してSVG図解を生成させてください：

```
Agent({
  description: "[図解テーマ]のSVG生成",
  subagent_type: "slide-deck:slide-visual",
  prompt: "以下の内容でスライド用SVG図解を生成してください。\n- テーマ: [具体的な内容]\n- 配置: [text-image等]レイアウトの[左/右]側\n- 背景: [ライト/ダーク]\n- サイズ感: viewBox 320x280 程度"
})
```

複数の図解が必要な場合は、すべてのサブエージェントを **1つのメッセージで並列起動** してください。

サブエージェントの結果を対応するスライドの `data-area="visual"` に埋め込みます。

TodoWrite: 「Phase 5: 生成」を完了にマーク。

---

## Phase 6: Review（品質レビュー）— 並列サブエージェント

### Step 1: スクリーンショット撮影

生成完了後、まず Bash で `slide-screenshot` を実行してスクリーンショットを撮影してください：

```bash
slide-screenshot [生成したHTMLファイルのパス]
```

このコマンドは各スライドのスクリーンショットを `.screenshots/slide-{N}.png` として保存し、ファイルパスを stdout に出力します。

**`slide-screenshot` が失敗した場合**（puppeteer 未インストール等）は、ビジュアルレビューをスキップし、Step 2 の既存3エージェントのみで続行してください。

### Step 2: レビューエージェント起動

**slide-reviewer と slide-visual-reviewer を並列起動**してください：

```
Agent({
  description: "ファクトチェック",
  subagent_type: "slide-deck:slide-reviewer",
  prompt: "[ファイルパス] のスライドに含まれる定量データ・統計・事実関係の正確性を検証してください。数値の出典、時点の妥当性、論理の整合性を重点的にチェックしてください。"
})

Agent({
  description: "デザイン・コンテンツレビュー",
  subagent_type: "slide-deck:slide-reviewer",
  prompt: "[ファイルパス] のスライドのデザイン一貫性（色、フォントサイズ、レイアウト選択）とコンテンツ品質（情報量、流れ、重複）をレビューしてください。"
})

Agent({
  description: "技術的正確性レビュー",
  subagent_type: "slide-deck:slide-reviewer",
  prompt: "[ファイルパス] のスライドのHTML構造を検証してください。s-deck/s-slide のネスト、layout属性、data-area属性、theme属性の整合性をチェックしてください。"
})

Agent({
  description: "ビジュアル品質レビュー",
  subagent_type: "slide-deck:slide-visual-reviewer",
  prompt: "以下のスクリーンショットを Read ツールで読み取り、スライドのビジュアル品質をレビューしてください。\n\nスクリーンショット:\n[Step 1 で出力されたファイルパス一覧を列挙]\n\n対象HTMLファイル: [ファイルパス]"
})
```

**注意**: ビジュアル品質レビューは Step 1 のスクリーンショット撮影が成功した場合のみ起動してください。

### Step 3: レビュー結果の統合と修正

すべてのレビュー結果を統合し、**Critical と Important の問題を修正**してください。

修正後、AskUserQuestion でユーザーに確認：
「`slides/xxx.html` に生成しました。ブラウザで開いて確認してください。

レビューで以下を修正しました：
- [修正1]
- [修正2]

他に修正があれば教えてください。OKならそのまま Enter で進みます。」

修正指示があれば反映し、再度確認。OKが出るまで繰り返します。

TodoWrite: 「Phase 6: レビュー」を完了にマーク。

---

## Phase 7: Summary（完了）

ユーザーがOKを出したら：

### 1. 成果物の記録

```
生成完了:
- ファイル: slides/xxx.html
- スライド数: N枚
- レイアウト: [使用したレイアウトの種類]
- テーマ: [ライト/ダーク/混合]
```

### 2. フィードバックの蓄積

このセッションで得た知見を `${CLAUDE_PLUGIN_DATA}/feedback/` にMarkdownで保存：
- ファイル名: `YYYY-MM-DD-テーマ要約.md`
- 内容: ユーザーの修正指示、好み、傾向

### 3. 次のアクション提案

- 「PDFボタンをクリックしてPDFに変換できます」
- 「修正が必要な場合はいつでも声をかけてください」

TodoWrite: 全タスクを完了にマーク。
