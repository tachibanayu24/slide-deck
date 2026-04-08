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

## パターン11: 4象限マトリクス（grid-2x2）

SWOT分析、比較表、分類に最適。

```html
<s-slide layout="grid-2x2" section="Analysis">
  <div class="bg-blue-50 rounded-lg p-5">
    <h3 class="text-lg font-bold text-blue-800 mb-2">Strengths</h3>
    <ul class="text-sm text-slate-600 space-y-1">
      <li>強み1</li>
      <li>強み2</li>
    </ul>
  </div>
  <div class="bg-amber-50 rounded-lg p-5">
    <h3 class="text-lg font-bold text-amber-800 mb-2">Weaknesses</h3>
    <ul class="text-sm text-slate-600 space-y-1">
      <li>弱み1</li>
    </ul>
  </div>
  <div class="bg-emerald-50 rounded-lg p-5">
    <h3 class="text-lg font-bold text-emerald-800 mb-2">Opportunities</h3>
    <ul class="text-sm text-slate-600 space-y-1">
      <li>機会1</li>
    </ul>
  </div>
  <div class="bg-red-50 rounded-lg p-5">
    <h3 class="text-lg font-bold text-red-800 mb-2">Threats</h3>
    <ul class="text-sm text-slate-600 space-y-1">
      <li>脅威1</li>
    </ul>
  </div>
</s-slide>
```

## パターン12: チャート主体（chart + s-chart）

左に要約テキスト、右に `<s-chart>` コンポーネント。

```html
<s-slide layout="chart" section="Data">
  <div>
    <h2 class="text-2xl font-bold mb-3">売上推移</h2>
    <p class="text-sm text-slate-500 mb-4">前年比120%の成長</p>
    <div class="text-3xl font-black text-blue-600">¥1.2B</div>
    <p class="text-sm text-slate-400">2026年Q1実績</p>
  </div>
  <div>
    <s-chart type="bar" data='[{"label":"Q1","value":80},{"label":"Q2","value":95},{"label":"Q3","value":110},{"label":"Q4","value":120}]'></s-chart>
  </div>
</s-slide>
```

ドーナツと横棒の例:

```html
<!-- ドーナツ: text-image レイアウトで -->
<s-slide layout="text-image" section="Market">
  <div data-area="text">
    <h2 class="text-2xl font-bold mb-4">市場シェア</h2>
    <p class="text-slate-500">当社は業界2位。成長率はトップ。</p>
  </div>
  <div data-area="visual">
    <s-chart type="donut" label="シェア" data='[{"label":"A社","value":35},{"label":"当社","value":28},{"label":"C社","value":22},{"label":"その他","value":15}]'></s-chart>
  </div>
</s-slide>

<!-- 横棒: 比較やランキングに -->
<s-slide layout="text-image" section="Tech">
  <div data-area="text">
    <h2 class="text-2xl font-bold mb-4">技術スタック人気度</h2>
    <p class="text-slate-500">2026年開発者調査より</p>
  </div>
  <div data-area="visual">
    <s-chart type="bar-horizontal" data='[{"label":"TypeScript","value":85},{"label":"Python","value":78},{"label":"Rust","value":42},{"label":"Go","value":38}]'></s-chart>
  </div>
</s-slide>
```

折れ線グラフと散布図の例:

```html
<!-- 折れ線グラフ（複数系列）: トレンド比較に -->
<s-slide layout="chart" section="Growth">
  <div>
    <h2 class="text-2xl font-bold mb-3">売上 vs 利益</h2>
    <p class="text-sm text-slate-500 mb-4">4年間の推移</p>
    <div class="text-3xl font-black text-blue-600">+180%</div>
    <p class="text-sm text-slate-400">売上成長率（2022→2025）</p>
  </div>
  <div>
    <s-chart type="line" series='["売上","利益"]' data='[{"label":"2022","values":[100,40]},{"label":"2023","values":[150,60]},{"label":"2024","values":[210,95]},{"label":"2025","values":[280,130]}]'></s-chart>
  </div>
</s-slide>

<!-- 散布図: ポジショニング・相関分析に -->
<s-slide layout="text-image" section="Analysis">
  <div data-area="text">
    <h2 class="text-2xl font-bold mb-4">電池技術マップ</h2>
    <p class="text-slate-500">エネルギー密度 vs サイクル寿命で各技術をプロット</p>
  </div>
  <div data-area="visual">
    <s-chart type="scatter" x-label="エネルギー密度 (Wh/kg)" y-label="サイクル寿命" data='[{"label":"LFP","x":160,"y":3000,"group":"リチウム"},{"label":"NMC","x":250,"y":1500,"group":"リチウム"},{"label":"Na-ion","x":120,"y":2000,"group":"次世代"},{"label":"固体","x":400,"y":1000,"group":"次世代"}]'></s-chart>
  </div>
</s-slide>
```

## パターン13: 全面ビジュアル（full-image）

スクリーンショットや大きな図解を全面表示。

```html
<s-slide layout="full-image" section="Demo">
  <img src="screenshot.png" alt="デモ画面" class="rounded-lg shadow-lg">
</s-slide>
```

## パターン14: 数値ハイライト（KPI・実績）

大きな数値で視覚的インパクトを出す。カードのグリッドで並べる。

```html
<s-slide layout="text" section="Results">
  <h2 class="text-2xl font-bold mb-6">主要指標</h2>
  <div class="grid grid-cols-3 gap-6">
    <div class="text-center">
      <div class="text-5xl font-black text-blue-600">98<span class="text-2xl">%</span></div>
      <div class="text-sm text-slate-400 mt-2">顧客満足度</div>
      <div class="text-xs text-emerald-500 font-bold mt-1">+12% YoY</div>
    </div>
    <div class="text-center">
      <div class="text-5xl font-black text-blue-600">3.2<span class="text-2xl">M</span></div>
      <div class="text-sm text-slate-400 mt-2">月間アクティブユーザー</div>
      <div class="text-xs text-emerald-500 font-bold mt-1">+28% YoY</div>
    </div>
    <div class="text-center">
      <div class="text-5xl font-black text-blue-600">¥1.2<span class="text-2xl">B</span></div>
      <div class="text-sm text-slate-400 mt-2">年間売上</div>
      <div class="text-xs text-emerald-500 font-bold mt-1">+20% YoY</div>
    </div>
  </div>
</s-slide>
```

## パターン15: タイムライン

時系列のイベントやロードマップに。左ボーダーのラインで接続感を出す。

```html
<s-slide layout="text" section="Roadmap">
  <h2 class="text-2xl font-bold mb-6">ロードマップ</h2>
  <div class="space-y-4 border-l-2 border-blue-200 pl-6 ml-2">
    <div class="relative">
      <div class="absolute -left-[33px] top-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
      <div class="text-xs font-bold text-blue-600">2026 Q1</div>
      <div class="font-bold text-slate-800">MVP リリース</div>
      <div class="text-sm text-slate-400">コア機能の提供開始</div>
    </div>
    <div class="relative">
      <div class="absolute -left-[33px] top-1 w-4 h-4 bg-blue-300 rounded-full border-2 border-white"></div>
      <div class="text-xs font-bold text-blue-600">2026 Q2</div>
      <div class="font-bold text-slate-800">拡張フェーズ</div>
      <div class="text-sm text-slate-400">API公開、パートナー連携</div>
    </div>
    <div class="relative">
      <div class="absolute -left-[33px] top-1 w-4 h-4 bg-slate-200 rounded-full border-2 border-white"></div>
      <div class="text-xs font-bold text-slate-400">2026 Q3</div>
      <div class="font-bold text-slate-800">スケールフェーズ</div>
      <div class="text-sm text-slate-400">グローバル展開</div>
    </div>
  </div>
</s-slide>
```

## パターン16: ダーク表紙 + グラスモーフィズム

ダーク背景上で半透明カードを使い、モダンな印象を与える。

```html
<s-slide layout="title" theme="dark" bg="linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)">
  <p class="text-blue-400 text-sm font-bold tracking-widest mb-4">PRODUCT UPDATE 2026</p>
  <h1 class="text-5xl font-black text-white mb-6">メインタイトル</h1>
  <div class="flex gap-4 mt-4">
    <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-5 py-3 text-center">
      <div class="text-2xl font-black text-white">v2.0</div>
      <div class="text-xs text-slate-400">Latest Release</div>
    </div>
    <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-5 py-3 text-center">
      <div class="text-2xl font-black text-white">50+</div>
      <div class="text-xs text-slate-400">New Features</div>
    </div>
  </div>
</s-slide>
```

## パターン17: アイコンカードグリッド（Lucide）

text レイアウト内で Tailwind の grid + Lucide アイコンでカードを並べる。

```html
<s-slide layout="text" section="Features">
  <h2 class="text-2xl font-bold mb-6">特徴</h2>
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-slate-50 rounded-xl p-5">
      <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
        <i data-lucide="zap" class="w-5 h-5 text-blue-600"></i>
      </div>
      <h3 class="font-bold text-slate-800 mb-1">高速</h3>
      <p class="text-sm text-slate-400 m-0">50ms以下のレスポンスタイム</p>
    </div>
    <div class="bg-slate-50 rounded-xl p-5">
      <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
        <i data-lucide="shield-check" class="w-5 h-5 text-emerald-600"></i>
      </div>
      <h3 class="font-bold text-slate-800 mb-1">安全</h3>
      <p class="text-sm text-slate-400 m-0">SOC2 Type II 準拠</p>
    </div>
    <div class="bg-slate-50 rounded-xl p-5">
      <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
        <i data-lucide="globe" class="w-5 h-5 text-amber-600"></i>
      </div>
      <h3 class="font-bold text-slate-800 mb-1">グローバル</h3>
      <p class="text-sm text-slate-400 m-0">30+リージョン対応</p>
    </div>
    <div class="bg-slate-50 rounded-xl p-5">
      <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-3">
        <i data-lucide="layers" class="w-5 h-5 text-violet-600"></i>
      </div>
      <h3 class="font-bold text-slate-800 mb-1">拡張性</h3>
      <p class="text-sm text-slate-400 m-0">プラグインで自由に拡張</p>
    </div>
  </div>
</s-slide>
```
