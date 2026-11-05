# 期待する結果の得かた

英語版: [expected-results.md](./expected-results.md)

この文書は、`src/mermaid.ts` の `runMermaid()` が、DOM のない Node で、
pin した mermaid.js がテキストをどう扱うかを得る方法と、
一部の値を mermaid.js が無害化する前の値で記録する理由を説明します。

## 1 回の実行の手順

`runMermaid(text, { config })` は次の手順で動きます。

1. mermaid.js の設定を既定に戻す（`mermaidAPI.globalReset()`）。
   これで、前のテキストが適用したディレクティブの一覧も空になる。
   そのあと `mermaid.initialize(config)`でサイト設定を作り直す。
   出典は
   [`initialize`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/mermaidAPI.ts#L704-L742)
   です。
   前の入力の設定は持ち越さない。
   既定に戻さないと、前の実行を失敗させたディレクティブ（例えば、
   mermaid.js が読めない色と `"theme": "base"`）がその一覧に残り、
   以後の呼び出しがすべて同じように失敗する。
   `mermaid.parse()` がその一覧を空にするのは始まってからで、
   `initialize()` はその前に動くため。
2. `mermaid.parse(text)`で受理・拒否を決める。
   出典は
   [`parse`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/mermaidAPI.ts#L96-L117)
   です。
   フロントマターと `%%{init}%%` ディレクティブの設定もここで効く。
   出典は
   [`processAndSetConfigs`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/mermaidAPI.ts#L73-L87)
   です。
3. `mermaidAPI.getDiagramFromText(text, { title })`でもう一度解析し、
   Db を得る。
   出典は
   [`getDiagramFromText`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/mermaidAPI.ts#L744-L748)
   です。
   フロントマターの `title` は `render()` と同じ渡し方をするので、
   Db の title は描画される図と一致する（`parse()` だけでは設定されない）。
   出典は
   [`renderDiagram`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/mermaidAPI.ts#L578-L579)、
   [`Diagram.fromText`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/Diagram.ts#L52-L54)
   です。
   mermaid.js はフロントマターの処理を公開していないので、
   title はその処理を写したコードで取り出す。
   出典は
   [`cleanupText`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/preprocess.ts#L6-L17)、
   [`extractFrontMatter`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/frontmatter.ts#L24-L69)、
   [`frontMatterRegex`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/regexes.ts#L10-L10)
   です。
4. 図種 ID に登録した正規化関数で Db
   を要約する（[db-summaries.ja.md](./db-summaries.ja.md) を参照）。

埋め込み値のために取り出す設定は、メモリ上では JavaScript の数の型を保ちます。
記録する `embedded.config` では、
JSON で表せない数を 1 欄のオブジェクト `{ "nonFinite": "Infinity" }`、
`{ "nonFinite": "-Infinity" }`、 `{ "nonFinite": "NaN" }` で表します。
有限の数は JSON の数のまま、文字列は文字列のままです。
`embeddedValuesOf()` は、Db を作る前に印のある値を数へ戻します。
[embedded-data.ja.md](./embedded-data.ja.md) を参照してください。
要約の端点は、位置で数と分かるので、
非有限の数を文字列で表す `numberOrText` の形を保ちます。
[fixture: packet/config-frontmatter-row-infinity]
[fixture: packet/config-frontmatter-row-infinity-string]
[fixture: packet/db-frontmatter-infinite-endpoint]

mermaid.js はグローバルな状態を持つので、呼び出しは直列にしています。

`runMermaid()` は最初に、ラベルのある flowchart を解析し、失敗すれば動きません。

## サニタイザは無効にする

原則として、
サニタイザ（DOMPurify（次の節）と `@braintree/sanitize-url`）は無効にします。
それ以外の設定に左右される値は、mermaid.js どおりに記録します。
例えば subgraph の向きは `flowchart.inheritDir` のもとで受け継がれます。

DOMPurify を無効にしたとき、
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/common/common.ts#L85-L97)
は、
（[`sanitizeMore`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/common/common.ts#L69-L83)
を通して）、 `securityLevel` が mermaid.js の値（`strict`、`loose`、
`antiscript`、 `sandbox`）のどれかである限り、
また `htmlLabels` が無効ならどの値でも、テキストを変えません。
[fixture: flowchart/db-vertex-label-markup-as-written]
[fixture: flowchart/config-security-level-loose-line-breaks]
それ以外の値で `htmlLabels` が有効なときは、 `<`、`>`、`=` を文字参照（`&lt;`、
`&gt;`、 `&equals;`）にします。
[fixture: flowchart/config-security-level-other-label-characters]
また改行タグのどの書き方も `<br/>` と書きます。
`<br>`、`<br/>`、`<br />`、`</br>`、`<BR>`、作者が書く `#br#` がそれです。
[fixture: flowchart/config-security-level-other-line-breaks]
要約はこれを前提にしており、
それらの値の範囲では `securityLevel` に左右されません。

`htmlLabels` が有効かどうかは、
設定のルートの `htmlLabels` が設定されていればそれで決まり、
設定されていないときにだけ `flowchart.htmlLabels` で決まります。
どちらも設定されていなければ有効です。
したがって `flowchart.htmlLabels: false` が無効にするのは、
ルートの `htmlLabels` が設定されていないときだけで、
ルートの `htmlLabels: true` は `flowchart.htmlLabels` が何でも有効にします。
[fixture: flowchart/config-security-level-other-html-labels-false]
[fixture: flowchart/config-security-level-other-flowchart-html-labels-false]
[fixture: flowchart/config-security-level-other-html-labels-true-flowchart-false]
[fixture: flowchart/config-security-level-other-html-labels-false-flowchart-true]

`@braintree/sanitize-url` には、
Db クラスがリンクを保存するときに呼ぶ
[`utils.formatUrl()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/utils.ts#L247-L259)
を通して到達します。
外から差し替えられないので、
図種ごとに登録した Db の差し替え（`src/normalizers/index.ts` の
`getDbPatches()`）で、どの入力を解析するよりも前に Db クラスを変え、
URL を書かれたとおり（trim 済み）に保存させます。
これは `securityLevel: loose` のときに `formatUrl()` が返す値です。
[fixture: flowchart/db-click-link-trimmed]
[fixture: class/db-click-link-trimmed]
そのため flowchart では、 `javascript:alert(1)` はそのまま、
`https://example.com` の末尾に `/` は付きません。
出典は
[`FlowDB.setLink`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L553-L562)
です。
class 図の Db も同じことをします。
[fixture: class/db-click-link-javascript-url-as-written]
[`ClassDB.setLink`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/classDb.ts#L404-L425)
を参照。
さらに `securityLevel: sandbox` のときはリンクの target を `_top` にします。
そのパッチは、ほかの値のときと同じく、
書かれた target（なければ `_blank`）を保存させます。
[fixture: class/config-security-level-sandbox-link-target]
[fixture: class/config-security-level-sandbox-link-default-target]
mermaid@12.2.0 では、 agentflow の Dbも `formatUrl()` を呼ぶので、
その正規化関数を足すときに同じ差し替えが要ります。
出典は
[`agentflowDb.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1014-L1014)
です。

gantt の Db は、
`@braintree/sanitize-url` に `formatUrl()` を通して届くのではありません。
[`setLink`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L712-L727)
が、 `securityLevel` が `loose` でなければ自分で呼びます。
Db は、すべての gantt 図が共有する 1 つのオブジェクトなので、
そのパッチはこのオブジェクトに掛けます。
パッチは URL を書かれたままで保存させます。
これは `loose` のときに `setLink` が保存するものです。
[fixture: gantt/config-security-level-strict-click-href]
[fixture: gantt/config-security-level-sandbox-click-href]

## ラベルは HTML のサニタイズ前の値で記録する

mermaid.js は解析中にテキストをサニタイズします。
例えば、
[`FlowDB.addVertex`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L201-L207)
は、
各ラベルを `common.ts` の
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/common/common.ts#L85-L97)
に通して結果を Db に保存し、そのあと、
サニタイズ後のテキストから前後の引用符を外します。
`sanitizeText()` は直接と
[`removeScript`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/common/common.ts#L62-L68)
を通して DOMPurify を呼び、 DOMPurify は DOM を必要とします。
Node では DOMPurify に `sanitize` も `addHook` もないので、
ラベルのある入力はすべて解析に失敗します。

そこで `runMermaid()` は、mermaid.js が import する DOMPurify のインスタンスで、
`sanitize` を恒等関数に差し替えます（フックの関数も何もしないものにします）。
記録する Db は、DOMPurify が何も変えないときに mermaid.js が作る Db です。

- **影響を受ける欄**: `sanitizeText()` を通る値すべて。
  flowchart では頂点と辺のラベル、subgraph の題、ツールチップ、title、
  `accTitle`、 `accDescr`（1 行のものもブロックのものも）。
  [fixture: flowchart/db-edge-label-markup-as-written]
  [fixture: flowchart/db-subgraph-title-markup-as-written]
  [fixture: flowchart/db-tooltip-markup-as-written]
  [fixture: flowchart/db-title-markup-as-written]
  [fixture: flowchart/db-acc-title-markup-as-written]
  [fixture: flowchart/db-acc-descr-markup-as-written]
  [fixture: flowchart/db-acc-descr-block-markup-as-written]
  ほかの図種でも同じで、例えば sequence 図のメッセージ、class のラベル、
  state の説明がそうである。 [fixture: sequence/db-message-markup-as-written]
  [fixture: class/db-label-markup-as-written]
  [fixture: state/db-description-markup-as-written]
- **影響を受ける入力**: DOMPurify が変えるテキストだけ。
  つまり HTML のマークアップか `&`、`<`、`>` を含むテキスト。
  例えば `A["a & <b onclick=x>b</b>"]` は、
  `a & <b onclick=x>b</b>` として記録する。
  [fixture: flowchart/db-vertex-label-markup-as-written]
  mermaid.js と DOMPurify のソースから予想すると、
  ブラウザは `a &amp; <b>b</b>` を保存する。
  これはブラウザでは確かめていない。
- **残る処理**: `sanitizeText()` の残りは動く。
  出典は
  [`sanitizeMore`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/common/common.ts#L70-L83)
  です。
  `htmlLabels` が有効（その決まり方は前の節）で、 `securityLevel` が `strict`、
  `loose`、`antiscript`、 `sandbox` のどれでもないときは、 `<`、`>`、
  `=` を実体参照に、改行タグのどの書き方も `<br/>` に置き換える。
  そのような `securityLevel` を使う fixture は、置き換え後のテキストを記録する。
  [fixture: flowchart/config-security-level-other-label-characters]
  [fixture: flowchart/config-security-level-other-line-breaks]
  置き換えが各図のどのテキストに届くかは、
  [db-from-tree.ja.md](./db-from-tree.ja.md) の「文字の置き換え」が定める。
- **実装が比べる相手**: parser の Db 相当 JSON は、この値、
  つまり HTML のサニタイズ前のテキストと比べる。
  DOMPurify を再現する必要はない。

差し替えが mermaid.js のインスタンスに届かなくなると、
テスト（`tests/mermaid.test.ts`）が失敗します。
また、ラベルのある flowchart を解析できなければ、`runMermaid()` は動きません。

## 拒否か、ブラウザの機能の欠如か

[`mermaid.parse()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/mermaidAPI.ts#L96-L117)
が投げたエラーは、名前と message とともにすべて拒否として記録します。
例外は、
Node にないブラウザの機能を mermaid.js が使おうとしたことを示すエラーです。
次の 2 種類がそれに当たります。

- すべての `ReferenceError`。
  未定義のグローバルを参照したときにしか投げられないため。
- message が `src/rejections.ts` の `ENVIRONMENT_SIGNATURES` （DOMPurify、
  `document`、`window`、 `Option` などの DOM の名前）に一致するエラー。
  この署名は、mermaid.js が意図して投げる 4 つの名前（`Error`、
  `MermaidParseError`、`UnknownDiagramError`、
  `YAMLException`）以外のエラーにだけ当てる。
  この 4 つの message は入力を引用するため。
  [fixture: flowchart/rejection-parse-error-quotes-browser-word]
  [fixture: common/rejection-unknown-diagram-quotes-browser-word]
  [fixture: common/rejection-yaml-error-quotes-browser-word]

これらのとき、`runMermaid()` は `MermaidEnvironmentError` を投げます。
その入力については何も記録せず、生成器はそれを一覧に出して失敗します。

mermaid.js は、JavaScript の素のエラーで入力を拒否することがあります。
例えば、
オブジェクトでない init ディレクティブ（`%%{init: 5}%%` と `%%{wrap}%%`）は、
`TypeError: Cannot create property 'wrap' on string '5'` を投げます。
最後の辺より後ろを指す `linkStyle` の番号も `TypeError` を投げます。
これらは拒否として記録し、生成器が手での確認用に一覧に出します。
新しい環境の問題が見つかったら署名を足してください。

fixture 自身のサイト設定（`config`）の誤り、例えば mermaid.js が読めない色は、
`mermaid.initialize()` に例外を投げさせます。
`runMermaid()` はそれを拒否として記録せず、そのまま投げます。
入力の拒否ではなく、ページの設定が壊れている状態だからです。

## 代役で与えるブラウザの関数

いくつかの Db のメソッドは、mermaid.js の解析中にブラウザの関数を呼びます。
そのそれぞれについて、図種の Db のパッチが、そのメソッドの呼び出しの間だけ、
その関数の代役を与えます（`src/normalizers/browser-stand-ins.ts`）。
mermaid.js 自身の処理は、そのまま動きます。
パッチはどの入力を解析するよりも前に当てるので、
パッチを当てていない Db が入力を読むことはありません。
mermaid@12.2.0 では、次の 2 つです。

- [`SequenceDB.parseBoxData`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L394-L419)
  は、 `box` の行の最初の語（またはそこにある `rgb`、`rgba`、`hsl`、
  `hsla` の関数）が色かを、 `window.CSS.supports("color", 語)` で尋ねる。
  色なら、それが box の fill になり、行の残りが名前になる。
  色でなければ、fill は `transparent` になり、行全体が名前になる。
  代役は、その値が `color` プロパティの値として正しいかを答える。
  正しいとするのは、まず、モジュールの一覧にある CSS 全体のキーワード、
  `currentcolor`、システム色（現行のものと廃止されたもの）。
  [fixture: sequence/db-box-colour-css-wide-keyword]
  [fixture: sequence/db-box-colour-currentcolor]
  [fixture: sequence/db-box-colour-system-colour]
  [fixture: sequence/db-box-colour-deprecated-system-colour]
  次に、置換の関数（`var()`、`env()`、 `attr()`）を含む値。
  [fixture: sequence/db-box-colour-function-substitution]
  そのほかは、`@csstools/css-color-parser` が 1 つの色として読む値で、
  例えばスラッシュでアルファを続ける空白区切りの形。
  [fixture: sequence/db-box-colour-function-space-separated-alpha]
  引数の足りない色の関数と、数とパーセントを混ぜたコンマ区切りの形は、
  正しくない。 [fixture: sequence/db-box-colour-function-too-few-arguments]
  [fixture: sequence/db-box-colour-function-mixed-percentages]
  代役の答えは、309 個の値について、
  Chromium 152 の `CSS.supports("color", 値)` と照らし合わせ、すべて一致した。
  照らした値は、収集した入力の `box` の行の最初の語、大文字小文字を変えた色名、
  キーワード、現行と廃止のシステム色、色でない語、 `rgb()`、`rgba()`、`hsl()`、
  `hsla()` の正しい形と誤った形。
  形には、コンマ区切りと空白区切り、パーセント、角度、`none`、アルファ、
  引数の不足と過多、`calc()`、置換の関数、相対色を含めた。
  ブラウザによって変わりうる値は、Chromium に合わせている。
  新しいシステム色、相対色、`none`、置換の関数がそれに当たる。
  Firefox と Safari では確かめていない。
  同じ関数を、mermaid.js を動かさない `@mmd-toolkit/tests` から、
  `cssSupportsColor` として公開している。
  この答えを外から受け取る実装のためのもの。
- [`SequenceDB.addDetails`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L526-L546)
  は、 `document.getElementById` でページの要素を読む。
  ページを読む Db のメソッドは、その要素のないページとして扱う。
  ページの中身は図のテキストの一部ではないため。
  代役は要素を見つけず、`details` の文は、その actor を足すだけになる。

## 既知の差異を除いて動かす

`runMermaid()` とその並びの関数は、選択肢 `withoutDivergences` を取ります。
値は既知の差異の識別子の一覧です。
これを指定すると、それらの差異が生じる字句解析器の規則を置き換えるか、
試す順を変えるか、C4 の検出器を置き換えるかして、仕様と同じに読ませて、
mermaid.js を動かします。
変えるのはその呼び出しの間だけです。
既定の実行、生成器、`expected.json` は、これを使いません。
これらは mermaid.js をそのまま記録します。
実装はこれを使って、印の付いた入力での mermaid.js との違いが、
それらの差異だけから来ることを確かめます。
こうして読ませた mermaid.js と、自分を比べます。
すべての入力を、こう読ませた mermaid.js と同じに受理・拒否し、
同じ Db を返すものでなければなりません。
これを使えるのは、`c4-keyword-anywhere`、`comment-takes-character`、
`comment-takes-line-break`、`name-start-reads-unit`、
`percent-brace-after-unit`、`title-digit-after-axis-statement` です。
ある図種で仕様と mermaid.js の差異が 2 つ以上あるとき、
仕様と同じに読ませるには、
1 つの入力でそのいくつかを同時に除く必要があることがあります。
同じ識別子は 1 つと数え、空の一覧ではそのままの mermaid.js を動かします。
入力はどの図種でもかまいません。
字句解析器の差異が変えるのは、その差異が属する図種の字句解析器だけなので、
ほかの図種の差異は何も変えません。
`c4-keyword-anywhere` が変えるのは、
先頭より後に C4 のキーワードを持つテキストの検出だけです。
1 つの字句解析器の同じ規則、同じ開始状態の並び、テキストを渡す同じ関数、
または 1 つの図種の同じ検出器を変える 2 つの差異は、同時には除けません。
後から変えたほうが、もう一方を打ち消すためです。
そのときは、呼び出しは両方の識別子を挙げたエラーを投げます。
選択肢でないキーを持つ options を渡すと、呼び出しは `TypeError` を投げます。
書き誤った選択肢で、そのままの mermaid.js を動かさないためです。

仕様が何を出すかを知るために、
実装が mermaid.js をこのように動かす必要はありません。
mermaid.js の入力の読み方を変える既知の差異の印（`c4-keyword-anywhere`、
`comment-takes-character`、 `comment-takes-line-break`、
`name-start-reads-unit`、 `percent-brace-after-unit`、
`title-digit-after-axis-statement`、 `html-tag-in-frontmatter`、
`bare-percent-line-before-header`、
`blank-line-after-header-or-comments`）を持つ fixture は、
それを `expected.json` と違うときに、`specified.json` に記録します。
生成器は、その差異を外して mermaid.js に読ませた結果を取ります。
`comment-takes-line-break` と `name-start-reads-unit` は、
どちらも class の字句解析器を変えるので、2 つを一緒に外します。
gantt の字句解析器を変える 3 つ、`comment-takes-character`、
`comment-takes-line-break`、`percent-brace-after-unit` は、
3 つを一緒に外します。
文字やコメントの改行を取るコメントを持つテキストは、
それらを通して `%%{` の規則に届くからです。
3 つを外して gantt のすべての fixture を読ませると、
変わるのはその印を持つ fixture だけです。
xychart の字句解析器を変える 2 つ、
`comment-takes-character` と `title-digit-after-axis-statement` は、
2 つを一緒に外します。
軸の文の後に数字を含むタイトルがあるテキストに、
語に続けたコメントがあることがあるからです。
`c4-keyword-anywhere` は、C4 の検出器を置き換えて、
そのテキストを先頭の図の図種として読ませます。
[fixture: class/div-comment-then-statement-with-backquote-keyword]
[fixture: class/div-backquote-starts-with-keyword-then-comment]
[fixture: common/detect-c4-anywhere]
[fixture: flowchart/div-c4-keyword-in-label]
[fixture: class/div-c4-keyword-as-class-name]
[fixture: state/div-c4-keyword-as-state-id]
[fixture: block/div-c4-container-in-label]
`html-tag-in-frontmatter` では、フロントマターの `<` を `(` にして、
HTML タグが始まらないようにした入力を mermaid.js に読ませた結果です。
タグは `title` に限らず、フロントマターのどのキーでも始まりえます。
フロントマターは mermaid.js が見つけるとおりに見つけます。
空白を後ろに持つ閉じの `---` の行と、 CRLF の改行も含みます。
[fixture: flowchart/html-tag-starts-in-frontmatter-other-key]
[fixture: flowchart/html-tag-starts-in-frontmatter-crlf]
[fixture: flowchart/html-tag-starts-in-frontmatter-closing-line-blank]
指定読みのフロントマターの title は、すべての図種で、
[`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/preprocess.ts#L6-L17)
の後に `extractFrontmatterTitle` が返す Mermaid の変換後の値です。
タグの中の `=` の後の `"` は `'` になります。
同じ値を Db と `embedded.title` に渡し、
Db でそれを上書きする本文の title は保ちます。
[fixture: flowchart/html-tag-starts-in-frontmatter-value]
[fixture: pie/frontmatter-html] [fixture: pie/frontmatter-title-overridden]
`embedded` の値は、書かれたとおりの入力に mermaid.js が与えるものです。
mermaid.js がその入力を拒否するときは、`(` にした入力に与えるものになり、
設定の値の `<` は `(` として記録されます。
`embedded` のフロントマターの title は、 Db と同じ reader から得ます。
[fixture: flowchart/html-tag-starts-in-frontmatter-config-value]
mermaid.js が書かれたとおりの入力を受理するときは、
書かれたとおりの入力の値になり、`(` にした入力は読みません。
mermaid.js は `<` を持つ値を設定に入れないので、 `embedded` にはその値がなく、
`(` にした値にもなりません。
[fixture: flowchart/html-tag-starts-in-frontmatter-config-value-accepted]
mermaid.js が `(` にした入力を拒否するときは、仕様どおりの読みも拒否で、
`specified.json` に `accepted: false` とエラーを記録します。
`(` への置き換えが YAML を壊したときは、読みを作れないので、生成器が止まります。
その fixture の読みの作り方を決めます。
`bare-percent-line-before-header` では、ヘッダーの前の `%%` だけの行と、
その間の空白だけの行を取り除いた入力を mermaid.js に読ませた結果です。
仕様はそれらをどの図種でもトリビアとして読み、 mermaid.js は、
flowchart（`%%` だけの行、`%%{ }%%`、`%%{}`、`%%{-x}%%`）、
state（`%%` 以外の同じ行）、 class（そのような行の後の、
タブを含む空白だけの行や、空白に挟まれたディレクティブ）、
block（`%%` だけの行、`%%{ }%%`。字句解析器は id として読みます）では、
それらを読めません。
間にあるコメント行とディレクティブは残ります。
ディレクティブは、跨ぐ行とともに、その行にある前後の空白を除いて残ります。
空白を残すと、mermaid.js では、
ディレクティブを除いた行が空白だけの行になるからです。
フロントマターは飛ばします。
title と `embedded` の値は、それらの行に依りません。
[fixture: flowchart/header-after-bare-percent-line]
[fixture: flowchart/header-after-empty-braces-line]
[fixture: flowchart/header-after-non-word-brace-line]
[fixture: flowchart/header-after-empty-braces-no-space]
[fixture: state/header-after-empty-braces-line]
[fixture: state/header-after-non-word-brace-line]
[fixture: state/header-after-empty-braces-no-space]
[fixture: class/header-after-bare-percent-then-whitespace-line]
[fixture: class/header-after-empty-braces-then-whitespace-line]
[fixture: class/header-after-bare-percent-then-tab-line]
[fixture: class/header-after-bare-percent-then-indented-directive-line]
[fixture: block/div-after-bare-percent-line]
[fixture: block/div-after-bare-percent-line-and-whitespace-line]
[fixture: block/div-after-empty-braces-line]
`blank-line-after-header-or-comments` では、ヘッダーの後の空行と空白だけの行、
およびヘッダーの行の終わりの空白を取り除いた入力を、
mermaid.js に読ませた結果です。
仕様はそれらをどこにあってもトリビアとして読みますが、 mermaid.js は、
改行とそのまわりの空白の行を 1 つのトークンとして読み、
そのトークンを行の終わりでしか受けないので、ヘッダーの後、コメント行の後、
ノードの前では拒否します。
空白だけの行とは、ディレクティブを除いたとき空白しか残らない行です。
mermaid.js はテキストを読む前にディレクティブを除くからです。
ヘッダーの後のディレクティブは、title と `embedded` の値が変わらず、
ディレクティブだけの行も残らないように、ヘッダーの前の独立した行に移します。
U+2028 か U+2029 がコメントを終え、同じ行に文が続くときは、
その前に改行を入れます。
mermaid.js の文法がそこに改行を要り、文の字下げは変わらないからです。
コメントを終える区切りの後に空白しかないときは、その空白とともに除きます。
コメント行、ヘッダーの前の行、ノードの行はそのまま残します。
ノードが閉じていないテキストの途中に、取り除く行があるときは、
空行がそのテキストの文字なので、生成器が止まります。
kanban にも同じ差異があり、mindmap と同じ規則です。
ヘッダーの行でも文の間でも、
コメントを終える U+2028 と U+2029 の後ろに文が続くときは、
その前に改行を入れます。 [fixture: kanban/div-header-comment-ls-node]
[fixture: kanban/div-header-comment-ps-node]
[fixture: mindmap/div-header-trailing-spaces-then-node]
[fixture: mindmap/div-header-space-directive-then-node]
[fixture: mindmap/div-tab-line-after-header]
[fixture: mindmap/div-header-two-comments-then-blank]
[fixture: mindmap/div-header-line-comment-comment-then-blank]
[fixture: mindmap/div-comment-line-then-blank-after-header]
[fixture: mindmap/div-comment-then-blank-between-nodes]
[fixture: mindmap/div-three-comments-then-blank-between-nodes]
[fixture: mindmap/div-shape-comment-then-blank]
[fixture: mindmap/div-icon-comment-then-blank]
[fixture: mindmap/div-comment-then-blank-then-icon]
[fixture: mindmap/div-comment-then-blank-then-class]
[fixture: mindmap/div-class-then-comment-then-blank]
[fixture: mindmap/div-percent-brace-then-blank-between-nodes]
[fixture: mindmap/db-blank-line-after-header]
[fixture: mindmap/db-whitespace-line-after-header]
[fixture: mindmap/db-directive-between-header-and-first-node]
ほかの印には、このファイルは要りません。
仕様が mermaid.js の受理するものを拒否する（`directive-as-token-boundary`、
`ignored-semicolon-as-token-boundary`、`click-reserved-word`、
`tokenless-empty-forms`、`headerless-empty-ending`）からです。
これらのどれにも、ここには差異を除く手段がありません。
入力を仕様と同じに読ませるために mermaid.js を動かすことはせず、
仕様が何を出すかは、 [既知の差異](../../spec/docs/known-divergences.ja.md)の、
その差異の文書が述べています。

`embedded-data-opaque` は両方向で `specified.json` が必要です。
参照入力では、
Mermaid の設定導出で拒否された frontmatter や directive のブロックだけを除き、
ほかのブロックは保ちます。
導出には Mermaid の公開 parse 経路を使い、図の parser だけを、
何もしない非同期関数に一時的に置き換えます。
文の不透明な内容に妨げられず、設定を読めます。
導出が失敗するときはブロックをソース順に取り、
追加すると拒否されるブロックを除きます。
HTML 属性の引用符の変換で不正になる frontmatter の YAML も同じ扱いです。
本文の hidden YAML と、ほかの図の構文は保ちます。
[fixture: usecase/div-gram-frontmatter-html-attribute-quotes]
[fixture: pie/div-review-frontmatter-html-invalid-yaml]
[fixture: pie/lex-yaml-three-adjacent-fences]

正しい埋め込み設定が受理を変えるときは、
仕様の
[比較規則](../../spec/docs/known-divergences/embedded-data-opaque.ja.md#比較する-db)
が名指しする鍵だけを除きます。
`tools/src/specified-reading.ts` の明示的な表 `OPAQUE_ACCEPTANCE_KEYS` が、
そのパスを持ちます。
その鍵があれば、参照の frontmatter に、
Mermaid が導いたテキスト内設定からその鍵だけを除いた値と、
変換済みタイトルを持たせます。
ソースの directive はその設定へ反映済みなので、除いた鍵を再適用しないよう、
参照の本文から除きます。
`wrap` など Db だけに効く設定を含め、ほかの設定は保ちます。
外部のサイト設定も、通常の runner を通じて適用されます。
[fixture: gitgraph/div-frontmatter-main-branch-preserves-title]
[fixture: sequence/div-invalid-frontmatter-preserves-wrap-directive]
[fixture: gitgraph/div-frontmatter-html-labels-default-comparison]
[fixture: gitgraph/div-init-html-labels-default-comparison]

参照入力が受理されれば、その Db と埋め込みの値を使います。
frontmatter のタイトルは、`html-tag-in-frontmatter` と同じ reader を使い、
Mermaid が変換した値です。
[fixture: gitgraph/div-frontmatter-main-branch-preserves-title]

元の入力が受理されて参照入力が拒否されるときは、参照入力の拒否を記録します。
印を付けた不透明データの失敗が両方で同じ拒否のままなら、比較 Db はありません。
受理と `db: null`、参照入力の検出した図種を記録し、
埋め込みの値は作り出しません。
参照入力に残る不正なデータブロックもこれに含みます。
`expected.json` の normalizer の検査は変わりません。
不透明な指定読みは、normalizer がある図種でも、比較 Db がない場合があります。
[fixture: flowchart/div-data-unknown-shape]
[fixture: kanban/gram-metadata-bad-yaml]
[fixture: usecase/div-gram-json-unquoted-key]

テキスト内の設定が受理を変えるとき、
指定読みは名指しされた埋め込みの鍵を適用せず、既定の受理規則を使います。
mermaid.js が受理する入力を拒否することも、
拒否する入力を受理することもあります。
[fixture: gitgraph/docs-community-contributing-05cdc44b]
[fixture: gitgraph/docs-syntax-gitgraph-2ea99686]
[fixture: gitgraph/div-frontmatter-main-branch-duplicate-default-accepted]
[fixture: gitgraph/div-frontmatter-main-branch-checkout-default-accepted]
[fixture: gitgraph/div-init-main-branch-duplicate-default-accepted]

規則は `src/divergence-removals.ts` に挙げてあり、
pin した mermaid.js の字句解析器の中で、位置ではなく、
コンパイルされた形で探します。
見つからないか、2 つ以上見つかると、
`runMermaid()` はどの入力よりも前に `MermaidEnvironmentError` で止まります。
そうしないと、差異を除いたつもりで、
そのままの mermaid.js を黙って動かすためです。
外す規則は、何にも一致しない形に置き換えます。
字句解析器は、規則の動作を一覧の中の位置で選ぶためです。
呼び出しは 1 つずつ動くので、
置き換えた規則がほかの呼び出しに届くことはありません。

規則を 2 つの形に置き換えることもあります。
字句解析器は、今の行で空白しか読んでいないときに一方を、
それ以外のときにもう一方を使います。
ここでの行は、mermaid の前処理の後のテキスト、
つまり字句解析器が読むテキストの行です。
前処理は、改行を LF にそろえ、 frontmatter、ディレクティブ、
コメント行を取り除きます。 [fixture: class/div-comment-then-statement-crlf]
[fixture: class/div-comment-then-statement-cr]
字句解析器が読んだものは、渡されたテキストから残りを除いたものです。
字句解析器が読んでいないテキストを戻して、残りがそのテキストの末尾でなくなると、
呼び出しは、誤っているかもしれない結果を返さずに、
`MermaidEnvironmentError` で止まります。

字句解析器のある開始状態で、規則を試す順を変えることもあります。
仕様と同じに読む規則を先に試し、規則そのものは変えません。
そうした規則は、その開始状態だけが試す規則の中から探します。
どの開始状態でも試す規則が、同じ形を持つことがあるためです。

規則が開始状態に自分では出ないとき、別の規則が開始状態から出ることもあります。
挙げた規則のどれかが、字句解析器がその開始状態にいる間にマッチすると、
その規則の動作が走る前に、開始状態の積み重ねからその状態を取り出します。
その動作が積むものは、そのあとに積まれます。
規則そのものは変えず、規則はすべての規則の中から探し、
その開始状態がその規則を試すものでなければなりません。
積み重ねは、テキストを読む字句解析器のものです。
mermaid.js は、パーサーが持つ字句解析器からテキストごとに字句解析器を作り、
`setInput` でテキストを渡すので、そこで積み重ねを見つけます。
字句解析器がテキストを渡される前に挙げた規則がマッチすると、
置けないテキストと同じく、呼び出しは `MermaidEnvironmentError` で止まります。
この変更は、最初にマッチした規則を取る字句解析器にだけ行います。
オプション `flex`（最長一致）や、
`backtrack_lexer`（マッチを退けることがある）がある字句解析器では、
マッチした規則が実行される規則とは限らないので、
`runMermaid()` はどの入力よりも前に `MermaidEnvironmentError` で止まります。

図種の検出器を置き換えることもあります。
置き換えた検出器は、その語をテキストの先頭だけに探します。
mermaid.js は検出器を、最初に登録された順に持っています。
すでにある検出器の id で `mermaid.registerExternalDiagrams()`
に検出器を登録すると、その検出器が同じ位置で置き換わるので、試す順は保たれます。
置き換える検出器の図は、先にその見本のテキストを読ませて、読み込んでおきます。
こうして、置き換えた検出器に loader は要りません（渡す loader は、
呼ばれたら失敗します）。
元の検出器は、呼び出しが終わるときにもう一度登録します。
`runMermaid()` はどの入力よりも前に、この置き換えを 1 度行い、検出器が、
置き換える前、置き換えている間、置き換えた後に、
その差異が挙げる確かめ用のテキストへ、挙げられた図の id を返さなければ、
`MermaidEnvironmentError` で止まります。 [fixture: common/detect-c4-anywhere]
[fixture: common/detect-minimal-c4]

- `comment-takes-character`、
  sequence の字句解析器 : `}` 以外の 1 文字を `%%`
  の前から読んでコメントに含める規則を外す。
  出典は
  [`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L29-L30)
  です。
  そうすると、コメントは `%%` から始まる。
  数の規則も、空白と改行の前だけでなく、`%%` の前でも数を終える。
  変えない mermaid.js のどんな入力も、変えたものの代わりにならない。
  その文の状態は、id の規則より先に、1 文字と `%%` をコメントに読むので、
  メッセージのように、2 文字目と 3 文字目が `%%` の id の連なりを、
  どの入力も与えられないからである。
- `comment-takes-character`、
  gantt の字句解析器 : `}` 以外の 1 文字を `%`
  の前から読んでコメントに含める規則を外す。
  出典は
  [`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L29-L29)
  です。
  そうすると、コメントは単位の始まる位置の `%` から始まり、ほかの `%` は、
  それを含む単位の文字になる。
  [fixture: gantt/div-comment-after-task-text-start]
  [fixture: gantt/div-comment-after-keyword-start]
  [fixture: gantt/div-comment-after-semicolon-after-data]
  [fixture: gantt/lex-comment-after-two-characters]
  [fixture: gantt/lex-brace-before-percent]
  [fixture: gantt/lex-colon-then-percent]
- `comment-takes-character`、
  journey の字句解析器 : `}` 以外の 1 文字を `%%`
  の前から読んでコメントに含める規則を外す。
  出典は
  [`journey.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/user-journey/parser/journey.jison#L15-L15)
  です。
  そうすると、コメントは単位の始まる位置の `%` から始まり、ほかの `%%` は、
  それを含む単位の一部になる。
  [fixture: journey/div-comment-after-task-text-start]
  [fixture: journey/div-comment-after-colon-after-section]
  [fixture: journey/div-comment-after-task-colon]
- `comment-takes-character`、
  timeline の字句解析器 : `}` 以外の 1 文字を `%%`
  の前から読んでコメントに含める規則を外す。
  出典は
  [`timeline.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L15-L15)
  です。
  そうすると、コメントは単位の始まる位置の `%` から始まり、ほかの `%%` は、
  それを含む単位の一部になる。
  [fixture: timeline/db-comment-percent-after-period-glued]
  [fixture: timeline/div-comment-after-period-start]
  [fixture: timeline/div-comment-after-non-ascii-letter]
  [fixture: timeline/div-comment-after-colon]
  [fixture: timeline/div-comment-after-block-character]
  [fixture: timeline/div-comment-after-semicolon-after-header]
  [fixture: timeline/div-comment-after-semicolon]
- `comment-takes-character`、
  xychart の字句解析器 : `}` 以外の 1 文字を `%%`
  の前から読んでコメントに含める規則を外す。
  出典は
  [`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L16-L16)
  です。
  そうすると、コメントは `%%` から始まる。
  [fixture: xychart/div-comment-glued-after-title-word]
  [fixture: xychart/div-comment-glued-after-range]
  [fixture: xychart/div-comment-takes-hyphen]
  [fixture: xychart/div-comment-takes-one-letter-word]
- `comment-takes-character`、
  quadrant の字句解析器 : `}` 以外の 1 文字を `%%`
  の前から読んでコメントに含める規則を外す。
  出典は
  [`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L17-L17)
  です。
  そうすると、コメントは `%%` から始まる。
  点の後ろやブロックの閉じ波括弧の後ろでは、
  `%%` の前の空白やタブは空白として残り、どの文もそれを取らないので、
  その行は拒否される。 [fixture: quadrant/div-quadrant-comment-glued]
  [fixture: quadrant/div-comment-unit-letters-then-digit]
  [fixture: quadrant/div-x-axis-comment-unit-dash]
  [fixture: quadrant/div-name-comment-glued]
  [fixture: quadrant/div-comment-glued-one-letter-name]
  [fixture: quadrant/div-comment-glued-digit-in-quadrant-text]
  [fixture: quadrant/div-acc-descr-block-space-and-comment-after-brace]
  [fixture: quadrant/div-comment-glued-tab-after-point]
- `comment-takes-line-break`、
  class の字句解析器 : `%%` と行の残りとその後の改行を読む規則を、
  行の中でその前に空白しかないコメントにだけ使う。
  出典は
  [`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L28-L28)
  です。
  単位の後のコメントは行の終わりで終わり、その後の改行は改行として読まれる。
  [fixture: class/div-comment-after-name-then-statement]
  [fixture: class/div-comment-after-note-string-then-statement]
  [fixture: class/div-comment-after-click-string-then-statement]
- `comment-takes-line-break`、
  gantt の字句解析器 : `%` と行の残りとその後の改行を読む規則は、
  行の終わりで終わる。
  出典は
  [`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L30-L30)
  です。
  そうすると、コメントの後の改行は改行として読まれる。
  [fixture: gantt/div-percent-comment-takes-line-feed-after-href]
  [fixture: gantt/div-percent-comment-takes-line-feeds-after-call]
  [fixture: gantt/lex-space-percent-comment-after-call-then-href-line]
- `comment-takes-line-break`、
  C4 の字句解析器 : `%%` と行の残りとその後の改行を読む二つの規則は、
  行の終わりで終わる。
  出典は
  [`c4Diagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/c4/parser/c4Diagram.jison#L98-L99)
  です。
  そうすると、図のコメントの後の行区切りは、ヘッダー、呼び出し、境界と、
  その後に続くものとを分け、コメントの後に空行があっても同じになる。
  [fixture: c4/header-context-comment-glued]
  [fixture: c4/header-context-comment-on-header-line]
  [fixture: c4/div-comment-between-joined-statements]
  [fixture: c4/div-boundary-comment-before-inline-body]
  [fixture: c4/div-boundary-comment-before-next-statement]
  [fixture: c4/div-header-comment-blank-recovery]
  [fixture: c4/div-comment-between-blank-recovery]
  [fixture: c4/div-diagram-comment-u2028]
  [fixture: c4/div-diagram-comment-u2029]
  コメントの後に空白だけの行がある場合も、文は引き続き分かれる。
  [fixture: c4/header-header-comment-spaces-recovery]
  [fixture: c4/lex-comment-between-spaces-recovery]
- `percent-brace-after-unit`、
  gantt の字句解析器 : `%%{` のたびに開始状態 `open_directive`
  に入る規則を外す。
  出典は
  [`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L18-L18)
  です。
  そうすると、ディレクティブの始まらない `%%{` は、コメントの規則が読む。
  ディレクティブそのものは、字句解析器が読む前にテキストから取り除かれる。
  [fixture: gantt/div-percent-brace-glued-after-header]
  [fixture: gantt/div-percent-brace-after-two-spaces]
  [fixture: gantt/div-percent-brace-after-glued-percent-comment]
  [fixture: gantt/lex-percent-brace-after-tab]
- `title-digit-after-axis-statement`、
  xychart の字句解析器 : 字句解析器は `x-axis` と `y-axis` のたびに、
  開始状態 `axis_data` に入り、その中でも入り、改行でだけ 1 つずつ出る。
  そのため、`;`、同じ行の次の文、
  軸の文に同じ行のプロットの文が続くときの次の行は、
  数字が数になるその状態で読まれ、数字を含む引用符のないタイトルは拒否される。
  出典は
  [`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L36-L37)
  の
  [17 行目](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L17-L17)
  です。
  `;` と文を始める語（`title`、`accTitle:`、`accDescr:`、 `x-axis`、`y-axis`、
  `line`、`bar`）の規則が先に `axis_data` から出るので、
  軸の文脈はその文の終わりで終わる。
  `accDescr {` の規則は出ない。
  字句解析器は `axis_data` の上に説明ブロックの状態を積み、
  `}` の後でまた `axis_data` にいる。
  仕様の読みもそうである。
  [fixture: xychart/div-title-digit-after-axis-semicolon]
  [fixture: xychart/div-title-digit-next-line-after-axis-and-plot]
  [fixture: xychart/div-title-digit-next-line-after-two-axes]
  [fixture: xychart/div-title-digit-after-axis-and-empty-block]
- `c4-keyword-anywhere`、 C4 の検出器 : 検出器は、
  5 つのキーワード `C4Context`、`C4Container`、`C4Component`、 `C4Dynamic`、
  `C4Deployment` を、空白の後のテキストの先頭だけに探す。
  出典は
  [`c4Detector.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/c4/c4Detector.ts#L10-L10)
  です。
  mermaid.js は、`C4Context` をそこに探し、ほかの 4 つはどこにでも探す。
  そうすると、ほかの図種のテキストが、ラベル、名前、
  メッセージとしてその 4 つを持っていても、仕様と同じに、
  先頭の図として読まれる。
  キーワードで始まるテキストは、これまでどおりに読まれる。
  [fixture: common/detect-c4-anywhere] [fixture: common/detect-minimal-c4]
  [fixture: flowchart/div-c4-keyword-in-label]
  [fixture: class/div-c4-keyword-as-class-name]
  [fixture: state/div-c4-keyword-as-state-id]
  [fixture: block/div-c4-container-in-label]
- `name-start-reads-unit`、
  class の字句解析器 : バッククォートの名前とジェネリクスの型の中で、
  それを閉じる規則と中身を読む規則を先に試す。
  出典は
  [`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)
  です。
  そうすると、中身は何で始まっても、閉じる記号まで読まれる。
  [fixture: class/div-backquote-starts-with-cssclass]
  [fixture: class/div-generic-starts-with-cssclass]
  [fixture: class/div-backquote-starts-with-callback]
  [fixture: class/div-generic-starts-with-callback]
  [fixture: class/div-backquote-starts-with-link]
  [fixture: class/div-generic-starts-with-link]
  [fixture: class/div-backquote-starts-with-click]
  [fixture: class/div-generic-starts-with-click]
  [fixture: class/div-backquote-starts-with-href]
  [fixture: class/div-generic-starts-with-href]
  [fixture: class/div-backquote-starts-with-open-annotation]
  [fixture: class/div-generic-starts-with-open-annotation]
  [fixture: class/div-backquote-starts-with-close-annotation]
  [fixture: class/div-generic-starts-with-close-annotation]

## これまでの結果の貯蔵庫

`runMermaid()` と `runMermaidWithEmbeddedData()` は、
結果をディスクの貯蔵庫に置きます。
同じテキスト、選択肢、コードの結果があれば、
mermaid.js を動かし直さずにそれを返します。
pin した mermaid.js は、同じテキストと同じ選択肢に同じ結果を返すので、
貯めた結果は新しく動かした結果と同じです。
同じ入力を何度も読むテスト（差分テスト、生成入力のテスト）は、こうして時間を、
試す実装のほうに使えます。
要約が日や時間帯に依存すると、これは成り立ちません。
gantt の Db は日付をその両方から計算するので、
要約は日付を持ちません（[db-summaries.md](./db-summaries.md) の gantt を参照）。

- 場所: リポジトリのルートの `node_modules/.cache/mmd-toolkit/mermaid-runs/`。
  git は無視します。
  コードの識別（下）ごとのディレクトリがあり、
  その中に日（UTC）ごとのディレクトリがあり、
  その中に結果 1 つにつき 1 つの圧縮したファイルがあります。
  多くの結果が同じものを持つ mermaid.js の設定の全体は、日ごとに 1 回だけ、
  そのハッシュを名前とするファイルに置き、結果はその名前を持ちます。
  結果はその日のディレクトリに書き、前の日のディレクトリから読んだ結果は、
  設定とともにその日のディレクトリに移します。
  そのため、結果のある日は、それを最後に使った日です。
  `mermaid-runs/` を消すと、貯蔵庫は空になります。
  テストを動かすと、また貯まります。
- 要らなくなったものは、頼まれなくても消えます。
  それ以外は消しません。
  各プロセスは、最初に貯蔵庫を使うときに、
  この木（このパッケージのディレクトリで、実のパスで表す）が、
  この木のコード（`src/` から動くものと `lib/` から動くもの）を使うことを、
  貯蔵庫に記録します。
  そして、貯蔵庫に記録されたどの木も使わないコードの結果を、すべて消します。
  それを使うものは二度とないためです。
  このとき読むのは、貯蔵庫のいちばん上の名前と、木の記録だけです。
  `node_modules` を共有する木（それにリンクするリポジトリの写しなど）は、
  1 つの貯蔵庫を使います。
  あるコードの結果は、まだある木がそれを記録している間は残ります。
  それを記録したすべての木が、
  別のコードを記録したとき（次に貯蔵庫を使うとき）か、なくなったときに、
  消えます。
  残りは prune が行います。
  prune は貯蔵庫のすべての名前を読み、大きな貯蔵庫では数秒かかるので、
  別の Node.js のプロセスで動きます。
  最初に貯蔵庫を使うプロセスが、prune が動いておらず、
  前の prune が終わってから 10 分を過ぎているときに、それを起こします。
  prune は、結果が 1 つも残らない過去の日のディレクトリを消します。
  貯蔵庫が上限の件数より多く持つ間は、最後に使ってから最も長いものを、
  最も古い日から日ごとに消します。
  ただし、その日のものは消しません。
  途中で止まった書き込み（プロセスが終わったもの）が残した一時ファイルも、
  1 時間より古いものを消します。
  最後に使ってから長いことだけを理由に、結果を消すことはありません。
  それでも上限より多く持つときは、prune は貯蔵庫に `.full` のファイルを置き、
  それがある間は、どのプロセスも結果を書きません。
  次の prune までは、貯蔵庫が上限より少し多く持つことがあります。
- ディレクトリの消し方: 別の Node.js のプロセスが、
  それを `.removed-` と自分のプロセス ID の名前に変えてから消します。
  そのプロセスは、それを起こしたプロセスが終わった後も続くので、
  どのプロセスも消すのを待ちません。
  消すプロセスがもう動いていないディレクトリは、新しいプロセスに任せます。
  消すプロセスが動いているものは、そのままそれに任せます。
  プロセスを起こせないときは、後の prune に任せます。
  貯蔵庫の中の失敗（読めない、書けない、
  消せないファイル。ファイルの場所にあるディレクトリ、
  ディレクトリの場所にあるファイル。直列にできない選択肢）は、
  mermaid.js を動かし直すだけで、テストを失敗させません。
  自分のコードのファイルを読めないプロセス（build を作っている間など）は、
  貯蔵庫を使わずに動きます。
- 上限の件数: 2,000,000。
  ディスクで約 8 GB です（1 件は、ファイルの最小の大きさの約 4 KB）。
  当時の最も大きな実行の結果より、大きく置いた値です。
  当時のテストには、すべての入力を回す実行がありました。
  整形の生成入力のテストは 540,000 件より多く作りましたが、
  当時の上限で数えるのが止まったので、最後まで数えられませんでした。
  parser の差分テストは、 flowchart、sequence、class、
  state で 192,209 件を作りました。
  その実行はもうありません。
  大きさが 1 つのテストに対して、この上限がどれだけ余裕を残すかは、
  測っていません。
  貯蔵庫が上限に届くと、最後に使ってから最も長い結果から消えます。
  結果は変わらず、消えたものは mermaid.js を動かし直すので、遅くなるだけです。
- 鍵: テキストと選択肢（`config`、`withoutDivergences`）を、
  V8 の形で直列にしたもの。
  `undefined` の欄と欄のないこと、`NaN` と `null` を区別します。
  結果を決めるコードのファイル（ソースからは、
  `mermaid.ts` が実行時に import する `src/` のファイル。 `RESULT_FILES`
  に挙げ、テストで確かめます。ビルドからは、`lib/` のすべてのファイル）。
  `pnpm-lock.yaml`、入っている mermaid.js の版、Node.js と V8 の版。
  どれかが変わると鍵が変わるので、貯めた結果が、
  それを作ったコードや mermaid.js より長く残ることはありません。
  `src/` のほかのファイル（fixture の読み込み、木の検査）を変えても、
  貯めた結果は残ります。
- 貯めるもの: 実行の結果。
  結果の代わりに投げられた例外（`MermaidEnvironmentError`、
  選択肢の誤り）は貯めません。
- 読み書き: 各ファイルは、別の名前で書いてから名前を変えます。
  同時に読むほかのプロセスは、ファイルの全体を見るか、
  何も見ないかのどちらかです。
  ファイルは検査の値とともに圧縮します。
  読めないファイル、検査の値が合わないファイル、別の鍵の結果を持つファイルは、
  結果がないものとします。
  そのときは動かし直して、ファイルを書き直します。
- 切り方: 環境変数 `MMD_TOOLKIT_MERMAID_CACHE=disabled`。
  どの YAML の読み方でも、書いたとおりの文字列になる語です。
  未設定か空なら、貯蔵庫を使います。
  ほかの値はエラーです。
  切るつもりの値（`off`、`0`）で、
  貯蔵庫が入ったままになることがないようにするためです。
  生成器（`fixtures:generate`、`fixtures:check`、`add`、`add-many`）は、
  自分でこれを切ります。
  fixture は mermaid.js そのものを記録するためです。
  ワークフロー `NodeCI.yml` も切ります。
  実行の手順を試すこのパッケージのテストも切りますが、
  `tests/mermaid-run-store.test.ts` の貯蔵庫のテストのうち、
  貯蔵庫を入れるものは例外です。
  実行の関数が貯蔵庫を使うこと、結果の代わりに投げられた例外が貯められないこと、
  `detectDiagramType()` が貯蔵庫を使わないことを確かめるため、
  リポジトリの貯蔵庫にテキストを通します。
- どのテストを回すかは、貯蔵庫があってもなくても、
  テストの実行の決まり（SKILL `conventions`）で決まります。
  貯蔵庫は実行を短くするもので、多く回す理由にはなりません。

## テキストの大きさ

`mermaid.parse()` は `maxTextSize` を適用しません。
適用するのは描画だけです。
出典は
[`renderDiagram`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/mermaidAPI.ts#L502-L505)
です。
fixture も適用しません。 [fixture: flowchart/config-max-text-size-not-applied]
