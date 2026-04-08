# スライドパターン例

実際のスライド生成時に参考にするパターン集。

## パターン1: ダーク表紙 + ライト本文

最も汎用的な構成。表紙と締めをダーク、中身をライトで統一感を出す。

```html
<!-- 表紙 -->
<s-slide layout="title" theme="dark" bg="linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e293b 100%)">
  <h1 class="text-5xl font-black text-white">メインタイトル</h1>
  <p class="text-xl text-slate-400 mt-4">サブタイトルや一行説明</p>
  <p class="text-sm text-slate-500 mt-2">日付・発表者名</p>
</s-slide>

<!-- 本文 -->
<s-slide layout="text">
  <h2 class="text-3xl font-bold mb-6">見出し</h2>
  <ul class="space-y-3 text-lg">
    <li><strong class="text-slate-800">ポイント</strong> <span class="text-slate-500">— 説明テキスト</span></li>
  </ul>
</s-slide>

<!-- 締め -->
<s-slide layout="title" theme="dark" bg="linear-gradient(135deg, #1e293b, #0f172a)">
  <p class="text-blue-400 text-sm font-bold tracking-widest mb-2">NEXT STEP</p>
  <h1 class="text-4xl font-black text-white">締めのメッセージ</h1>
</s-slide>
```

## パターン2: カード型グリッド

手順やプロセスを視覚的に見せる。

```html
<s-slide layout="text">
  <h2 class="text-2xl font-bold mb-6">プロセス</h2>
  <div class="grid grid-cols-3 gap-4">
    <div class="bg-slate-50 rounded-xl p-4">
      <div class="text-2xl font-black text-blue-500 mb-1">01</div>
      <div class="font-bold text-slate-800 mb-1">ステップ名</div>
      <div class="text-sm text-slate-400">簡潔な説明</div>
    </div>
    <!-- 02, 03... を同じ構造で -->
  </div>
</s-slide>
```

## パターン3: 図解スライド（text-image）

左に説明、右にSVG図解。

```html
<s-slide layout="text-image">
  <div data-area="text">
    <h2 class="text-2xl font-bold mb-4">アーキテクチャ</h2>
    <p class="text-slate-500 mb-4">説明テキスト。</p>
    <div class="space-y-3">
      <div class="flex items-start gap-3">
        <span class="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">ラベル</span>
        <div>
          <p class="font-semibold text-slate-800 m-0">項目名</p>
          <p class="text-sm text-slate-400 m-0">補足説明</p>
        </div>
      </div>
    </div>
  </div>
  <div data-area="visual">
    <svg viewBox="0 0 320 280" width="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: system-ui, sans-serif;">
      <!-- シンプルなボックス + 矢印の図解 -->
      <rect x="30" y="20" width="260" height="70" rx="12" fill="#2563eb" opacity="0.08" stroke="#2563eb" stroke-width="2"/>
      <text x="160" y="60" text-anchor="middle" font-size="14" fill="#2563eb" font-weight="700">コンポーネント名</text>
    </svg>
  </div>
</s-slide>
```

## パターン4: 比較（two-column）

```html
<s-slide layout="two-column">
  <div>
    <h2 class="text-2xl font-bold mb-4">Before</h2>
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800 m-0">問題点の説明</p>
    </div>
  </div>
  <div>
    <h2 class="text-2xl font-bold mb-4">After</h2>
    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
      <p class="text-green-800 m-0">改善後の説明</p>
    </div>
  </div>
</s-slide>
```

## パターン5: コードブロック付き

```html
<s-slide layout="text">
  <h2 class="text-2xl font-bold mb-4">実装例</h2>
  <p class="text-slate-500 mb-4">説明テキスト。</p>
  <div class="bg-slate-900 text-slate-200 p-5 rounded-lg text-sm font-mono leading-relaxed">
    <div class="text-slate-500">// コメント</div>
    <div>&lt;<span class="text-blue-400">s-slide</span> <span class="text-amber-300">layout</span>=<span class="text-green-400">"title"</span>&gt;</div>
    <div class="pl-4">&lt;<span class="text-blue-400">h1</span>&gt;Hello&lt;/<span class="text-blue-400">h1</span>&gt;</div>
    <div>&lt;/<span class="text-blue-400">s-slide</span>&gt;</div>
  </div>
</s-slide>
```

## パターン6: セクション区切り（ライト）

```html
<s-slide layout="section" section="Introduction">
  <p class="text-sm text-blue-600 font-semibold tracking-wider uppercase">Chapter 1</p>
  <h2 class="text-4xl font-black text-slate-800 mt-2">はじめに</h2>
  <p class="text-lg text-slate-400 mt-3">セクションの概要</p>
</s-slide>
```

## パターン7: セクション区切り（ダーク・全画面カラー）

```html
<s-slide layout="section" theme="dark" bg="linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)">
  <p class="text-9xl font-black text-white/20 leading-none">1</p>
  <h2 class="text-4xl font-black text-white mt-4">はじめに</h2>
  <p class="text-lg text-blue-200 mt-2">セクションの概要</p>
</s-slide>
```

## パターン8: 目次（toc）

```html
<s-slide layout="toc" section="Contents">
  <div>
    <p class="text-sm text-blue-600 font-semibold tracking-wider uppercase">Agenda</p>
    <h2 class="text-3xl font-black mt-1">目次</h2>
  </div>
  <div class="space-y-5">
    <div class="flex items-baseline gap-4">
      <span class="text-4xl font-black text-slate-800">1</span>
      <div>
        <p class="text-xl font-bold text-slate-800 m-0">セクション名</p>
        <p class="text-sm text-slate-400 m-0">サブタイトル</p>
      </div>
    </div>
    <div class="flex items-baseline gap-4">
      <span class="text-4xl font-black text-slate-800">2</span>
      <div>
        <p class="text-xl font-bold text-slate-800 m-0">セクション名</p>
        <p class="text-sm text-slate-400 m-0">サブタイトル</p>
      </div>
    </div>
  </div>
</s-slide>
```

## パターン9: フッター付き構成（推奨テンプレート）

copyright + section を活用した、プロフェッショナルな構成例。

```html
<s-deck copyright="©Company Inc.">
  <!-- 表紙: フッター非表示 -->
  <s-slide layout="title" theme="dark" bg="linear-gradient(135deg, #0f172a, #1e3a5f)">
    <h1 class="text-5xl font-black text-white">タイトル</h1>
    <p class="text-xl text-slate-400 mt-4">サブタイトル</p>
  </s-slide>

  <!-- 目次: section 属性でフッターにセクション名 -->
  <s-slide layout="toc" section="Contents">
    ...
  </s-slide>

  <!-- 本文: セクション名がフッター左に表示される -->
  <s-slide layout="text" section="Background">
    <h2 class="text-3xl font-bold mb-6">見出し</h2>
    ...
  </s-slide>

  <!-- 裏表紙: フッター非表示 -->
  <s-slide layout="title" theme="dark" bg="linear-gradient(135deg, #1e293b, #0f172a)">
    <h1 class="text-4xl font-black text-white">Thank you</h1>
  </s-slide>
</s-deck>
```

## パターン10: 引用・ハイライト

```html
<s-slide layout="text" section="Insights">
  <h2 class="text-2xl font-bold mb-6">キーメッセージ</h2>
  <div class="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-5 mb-4">
    <p class="text-blue-900 text-lg font-medium m-0">強調したいメッセージをここに。</p>
  </div>
  <p class="text-slate-500">補足説明があればここに。</p>
</s-slide>
```
