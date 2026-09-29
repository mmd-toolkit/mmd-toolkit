# 期待する結果の得かた

英語版: [expected-results.md](./expected-results.md)

この文書は、`src/mermaid.ts` の `runMermaid()` が、DOM のない Node で、
pin した mermaid.js がテキストをどう扱うかを得る方法と、
一部の値を mermaid.js が無害化する前の値で記録する理由を説明します。

## 1 回の実行の手順

`runMermaid(text, { config })` は次の手順で動きます。

1. mermaid.js の設定を既定に戻す（`mermaidAPI.globalReset()`）。
   これで、前のテキストが適用したディレクティブの一覧も空になる。
   そのあと `mermaid.initialize(config)`
   （[`initialize`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L702-L740)）
   でサイト設定を作り直す。
   前の入力の設定は持ち越さない。
   既定に戻さないと、前の実行を失敗させたディレクティブ
   （例えば、mermaid.js が読めない色と `"theme": "base"`）
   がその一覧に残り、
   以後の呼び出しがすべて同じように失敗する。
   `mermaid.parse()` がその一覧を空にするのは始まってからで、
   `initialize()` はその前に動くため。
2. `mermaid.parse(text)`
   （[`parse`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L96-L117)）
   で受理・拒否を決める。
   フロントマターと `%%{init}%%` ディレクティブの設定もここで効く
   （[`processAndSetConfigs`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L73-L87)）。
3. `mermaidAPI.getDiagramFromText(text, { title })`
   （[`getDiagramFromText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L742-L746)）
   でもう一度解析し、Db を得る。
   フロントマターの `title` は `render()` と同じ渡し方をするので
   （[`renderDiagram`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L578-L579)、
   [`Diagram.fromText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L52-L54)）、
   Db の title は描画される図と一致する（`parse()` だけでは設定されない）。
   mermaid.js はフロントマターの処理
   （[`cleanupText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)、
   [`extractFrontMatter`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/frontmatter.ts#L24-L69)、
   [`frontMatterRegex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/regexes.ts#L7-L7)）を公開していないので、
   title はその処理を写したコードで取り出す。
4. 図種 ID に登録した正規化関数で Db を要約する
   （[db-summaries.ja.md](./db-summaries.ja.md) を参照）。

mermaid.js はグローバルな状態を持つので、呼び出しは直列にしています。

`runMermaid()` は最初に、ラベルのある flowchart を解析し、失敗すれば動きません。

## サニタイザは無効にする

原則として、
サニタイザ（DOMPurify（次の節）と `@braintree/sanitize-url`）は無効にします。
それ以外の設定に左右される値は、mermaid.js どおりに記録します。
例えば subgraph の向きは `flowchart.inheritDir` のもとで受け継がれます。

DOMPurify を無効にしたとき、
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L85-L97)
は
（[`sanitizeMore`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L69-L83)
を通して）、`securityLevel` が mermaid.js の値
（`strict`、`loose`、`antiscript`、`sandbox`）のどれかである限り、
テキストを変えません。
それ以外の値では `<`、`>`、`=` を文字参照にします。
要約はこれを前提にしており、
それらの値の範囲では `securityLevel` に左右されません。

`@braintree/sanitize-url` には、
Db クラスがリンクを保存するときに呼ぶ
[`utils.formatUrl()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L247-L259)
を通して到達します。
外から差し替えられないので、
図種ごとに登録した Db の差し替え
（`src/normalizers/index.ts` の `getDbPatch()`）で、
その図種の最初の Db を要約する前に Db クラスを変え、
URL を書かれたとおり（trim 済み）に保存させます。
これは `securityLevel: loose` のときに `formatUrl()` が返す値です。
そのため flowchart では
（[`FlowDB.setLink`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L553-L562)）、
`javascript:alert(1)` はそのまま、
`https://example.com` の末尾に `/` は付きません。
mermaid@12.0.0 では、class 図
（[`classDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L414-L414)）
と agentflow
（[`agentflowDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1014-L1014)）
の Db も `formatUrl()` を呼ぶので、
それらの正規化関数を足すときに同じ差し替えが要ります。

## ラベルは HTML のサニタイズ前の値で記録する

mermaid.js は解析中にテキストをサニタイズします。
例えば
[`FlowDB.addVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L201-L207)
は各ラベルを `common.ts` の
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L85-L97)
に通して結果を Db に保存し、そのあと、
サニタイズ後のテキストから前後の引用符を外します。
`sanitizeText()` は直接と
[`removeScript`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L62-L68)
を通して DOMPurify を呼び、DOMPurify は DOM を必要とします。
Node では DOMPurify に `sanitize` も `addHook` もないので、
ラベルのある入力はすべて解析に失敗します。

そこで `runMermaid()` は、mermaid.js が import する DOMPurify のインスタンスで、
`sanitize` を恒等関数に差し替えます（フックの関数も何もしないものにします）。
記録する Db は、DOMPurify が何も変えないときに mermaid.js が作る Db です。

- **影響を受ける欄**: `sanitizeText()` を通る値すべて。
  flowchart では頂点と辺のラベル、subgraph の題、ツールチップ、title、
  `accTitle`、`accDescr`。
- **影響を受ける入力**: DOMPurify が変えるテキストだけ。
  つまり HTML のマークアップか `&`、`<`、`>` を含むテキスト。
  例えば `A["a & <b onclick=x>b</b>"]` は、
  `a & <b onclick=x>b</b>` として記録する。
  mermaid.js と DOMPurify のソースから予想すると、
  ブラウザは `a &amp; <b>b</b>` を保存する。
  これはブラウザでは確かめていない。
- **残る処理**: `sanitizeText()` の残り
  （[`sanitizeMore`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L70-L83)）
  は動く。
  `htmlLabels` が有効で、`securityLevel` が `strict`、`loose`、`antiscript`、
  `sandbox` のどれでもないときは、`<`、`>`、`=` を実体参照に置き換える。
  そのような `securityLevel` を使う fixture は、置き換え後のテキストを記録する。
- **実装が比べる相手**: parser の Db 相当 JSON は、この値、
  つまり HTML のサニタイズ前のテキストと比べる。
  DOMPurify を再現する必要はない。

差し替えが mermaid.js のインスタンスに届かなくなると、
テスト（`tests/mermaid.test.ts`）が失敗します。
また、ラベルのある flowchart を解析できなければ、`runMermaid()` は動きません。

## 拒否か、ブラウザの機能の欠如か

[`mermaid.parse()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L96-L117)
が投げたエラーは、名前と message とともにすべて拒否として記録します。
例外は、
Node にないブラウザの機能を mermaid.js が使おうとしたことを示すエラーです。
次の 2 種類がそれに当たります。

- すべての `ReferenceError`。
  未定義のグローバルを参照したときにしか投げられないため。
- message が `src/rejections.ts` の `ENVIRONMENT_SIGNATURES`
  （DOMPurify、`document`、`window`、`Option` などの DOM の名前）
  に一致するエラー。
  この署名は、mermaid.js が意図して投げる 4 つの名前
  （`Error`、`MermaidParseError`、`UnknownDiagramError`、`YAMLException`）
  以外のエラーにだけ当てる。
  この 4 つの message は入力を引用するため。

これらのとき、`runMermaid()` は `MermaidEnvironmentError` を投げます。
その入力については何も記録せず、生成器はそれを一覧に出して失敗します。

mermaid.js は、JavaScript の素のエラーで入力を拒否することがあります。
例えば、
オブジェクトでない init ディレクティブ（`%%{init: 5}%%` と `%%{wrap}%%`）は
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
そのそれぞれについて、図種の Db のパッチが、
そのメソッドの呼び出しの間だけ、その関数の代役を与えます
（`src/normalizers/browser-stand-ins.ts`）。
mermaid.js 自身の処理は、そのまま動きます。
パッチはどの入力を解析するよりも前に当てるので、
パッチを当てていない Db が入力を読むことはありません。
mermaid@12.0.0 では、次の 2 つです。

- [`SequenceDB.parseBoxData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L394-L419) は、
  `box` の行の最初の語
  （またはそこにある `rgb`、`rgba`、`hsl`、`hsla` の関数）が色かを、
  `window.CSS.supports("color", 語)` で尋ねる。
  色なら、それが box の fill になり、行の残りが名前になる。
  色でなければ、fill は `transparent` になり、行全体が名前になる。
  代役は、その値が `color` プロパティの値として正しいかを答える。
  正しいとするのは、
  モジュールの一覧にある CSS 全体のキーワード、`currentcolor`、
  システム色（現行のものと廃止されたもの）と、
  置換の関数（`var()`、`env()`、`attr()`）を含む値、
  そのほかは `@csstools/css-color-parser` が 1 つの色として読む値。
  代役の答えは、309 個の値について、
  Chromium 152 の `CSS.supports("color", 値)` と照らし合わせ、すべて一致した。
  照らした値は、収集した入力の `box` の行の最初の語、大文字小文字を変えた色名、
  キーワード、現行と廃止のシステム色、色でない語、
  `rgb()`、`rgba()`、`hsl()`、`hsla()` の正しい形と誤った形。
  形には、コンマ区切りと空白区切り、パーセント、角度、`none`、アルファ、
  引数の不足と過多、`calc()`、置換の関数、相対色を含めた。
  ブラウザによって変わりうる値は、Chromium に合わせている。
  新しいシステム色、相対色、`none`、置換の関数がそれに当たる。
  Firefox と Safari では確かめていない。
  同じ関数を、`@mmd-toolkit/tests/mermaid` から、
  `cssSupportsColor` として公開している。
  この答えを外から受け取る実装のためのもの。
- [`SequenceDB.addDetails`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L526-L546) は、
  `document.getElementById` でページの要素を読む。
  ページを読む Db のメソッドは、その要素のないページとして扱う。
  ページの中身は図のテキストの一部ではないため。
  代役は要素を見つけず、`details` の文は、その actor を足すだけになる。

## 既知の差を除いて動かす

`runMermaid()` とその並びの関数は、選択肢 `withoutDivergence` を取ります。
値は既知の差の識別子です。
これを指定すると、その差が生じる字句解析器の規則を、
仕様と同じに読む規則に置き換えて、mermaid.js を動かします。
置き換えはその呼び出しの間だけです。
既定の実行、生成器、`expected.json` は、これを使いません。
これらは mermaid.js をそのまま記録します。
実装はこれを使って、印の付いた入力での mermaid.js との違いが、
その差だけから来ることを確かめます。
こうして読ませた mermaid.js と、自分を比べます。
入力はどの図種でもかまいません。
変わるのはその差が属する図種の字句解析器だけなので、
ほかの入力は既定と同じ結果になります。

規則は `src/divergence-removals.ts` に挙げてあり、
pin した mermaid.js の字句解析器の中で、
位置ではなく、コンパイルされた形で探します。
見つからないか、2 つ以上見つかると、
`runMermaid()` はどの入力よりも前に `MermaidEnvironmentError` で止まります。
そうしないと、差を除いたつもりで、そのままの mermaid.js を黙って動かすためです。
外す規則は、何にも一致しない形に置き換えます。
字句解析器は、規則の動作を一覧の中の位置で選ぶためです。
呼び出しは 1 つずつ動くので、
置き換えた規則がほかの呼び出しに届くことはありません。

- `comment-takes-character`、sequence の字句解析器
  （[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L29-L30)）:
  `}` 以外の 1 文字を `%%` の前から読んでコメントに含める規則を外す。
  そうすると、コメントは `%%` から始まる。
  数の規則も、空白と改行の前だけでなく、`%%` の前でも数を終える。

## テキストの大きさ

`mermaid.parse()` は `maxTextSize` を適用しません。
適用するのは描画だけです
（[`renderDiagram`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L502-L505)）。
fixture も適用しません。
