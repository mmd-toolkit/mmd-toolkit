# html-tag-in-frontmatter

英語版: [html-tag-in-frontmatter.md](./html-tag-in-frontmatter.md)

図種: すべて。
これは、この仕様の mermaid.js との
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

図のテキストでは、`<` と語から次の `>` までの HTML のタグの中の `"` は、
`'` として読まれます。
ラベルが属性のあるタグを持てるようにするためです
（[HTML 属性の引用符](../common.ja.md#html-属性の引用符) を参照）。
図はフロントマターで始めることもでき、そのタイトルもそのようなタグを持てます。

```mmd
---
title: <b class="x">T</b>
---
flowchart LR
  A
```

どちらも、タイトル `<b class='x'>T</b>` を読みます。
[fixture: flowchart/frontmatter-title-html-attribute]

この文書は、フロントマターで始まってそこで終わらず、
フロントマターの境界を越えて図のテキストまで続くタグについてのものです。

venn では、frontmatter が `title: <a` を持つ場合、
`set "b="c">d"` はここでは拒否します。
[fixture: venn/div-html-tag-starts-in-frontmatter]

mermaid.js は内側の属性の引用符を変換して受理します。
[fixture: venn/div-html-tag-starts-in-frontmatter]

frontmatter に開始タグがなければ、
同じ venn の本文をどちらも拒否します。
[fixture: venn/gram-html-tag-body-only-reference]

Ishikawa では、frontmatter に `title: <a` があっても、
裸の `b="c">d` と引用されたような `"b="c">d"` を両者とも節点のテキストとして
受理します。
mermaid.js は属性の引用符を単一引用符に変えますが、
この仕様はそのタグと独立に本文を読みます。
書かれた IshikawaLiteral は元の引用符を保ちます。
[fixture: ishikawa/div-frontmatter-open-tag-bare-node]
[fixture: ishikawa/div-frontmatter-open-tag-quoted-node]

frontmatter のタグがなければ、両者とも `b="c">d` を変えずに受理します。
[fixture: ishikawa/lex-quotes-without-frontmatter-tag]

## 差異

どの例も、図の全体です。

1. タイトルで開いたタグと、`"` と `>` を持つラベル:

   ```mmd
   ---
   title: <a
   ---
   flowchart LR
     A[b="c">d]
   ```

2. タイトル内でタグが始まり、引用符で囲んだ属性値も閉じていないものと、
   タグを持つラベル:

   ```mmd
   ---
   title: <a z="
   ---
   flowchart LR
     A[<b x="y">t]
   ```

3. タイトルで開いたタグと、`"` と `>` を持つアクセシビリティのタイトル:

   ```mmd
   ---
   title: <a
   ---
   flowchart LR
     accTitle: b="c">d
     A
   ```

4. タイトルで開いたタグと、`"` と `>` を持つメッセージ:

   ```mmd
   ---
   title: <a
   ---
   sequenceDiagram
     A -x B: b="c">d
   ```

5. 同じもので、矢印が `>` を持つもの:

   ```mmd
   ---
   title: <a
   ---
   sequenceDiagram
     A ->> B: b="c">d
   ```

| 例  | mermaid.js                           | この仕様                             |
| --- | ------------------------------------ | ------------------------------------ |
| 1   | ラベル `b='c'>d` を持つ頂点 A        | 拒否                                 |
| 2   | 拒否                                 | ラベル `<b x='y'>t` を持つ頂点 A     |
| 3   | アクセシビリティのタイトル `b='c'>d` | アクセシビリティのタイトル `b="c">d` |
| 4   | メッセージ `b='c'>d`                 | メッセージ `b="c">d`                 |
| 5   | メッセージ `b="c">d`                 | 同じ                                 |

表で比較した読みを次の fixture が記録します。
[fixture: flowchart/html-tag-starts-in-frontmatter]
[fixture: flowchart/html-tag-starts-in-frontmatter-value]
[fixture: flowchart/html-tag-starts-in-frontmatter-acc-title]
[fixture: sequence/div-html-tag-starts-in-frontmatter-message]
[fixture: sequence/lex-html-tag-frontmatter-arrow-ends-tag]

つまり mermaid.js では、フロントマターで始まるタグは、
その後の最初の `>` まで続き、その `>` はテキストの中にあり得ます。
そして、その `>` の前の `"` は `'` として読まれます。
例 1 では、ラベルに `"` が残らず、
mermaid.js の flowchart の文法はそれを受理します。
フロントマターがなければ、`A[b="c">d]` はどちらも拒否します。
例 2 では、引用符の値 `z="` が `x=` の後の `"` を取るので、
`y` の後の `"` が残り、mermaid.js はラベルを拒否します。
例 5 では、矢印の `>` が、メッセージの前でタグを終えます。
この仕様は、フロントマターの後のテキストでだけタグを探し、
これらのテキストを、フロントマターがないときと同じに読みます。
フロントマター内で始まって終わるタグは、図の HTML の読み方に差異を生みません。
[fixture: pie/frontmatter-html]
差異は両方向にあり、受理も Db も変わることがあります。

kanban ではフロントマターに `title: <a` があるとき、
mermaid.js は `S["b="c">d"]` の内側の属性引用符を変換して入力を受理します。
この仕様はラベルの文字列を 2 つ目の引用符で終えて入力を拒否します。
[fixture: kanban/div-frontmatter-open-tag]

フロントマターに `<a` がなければ両者で拒否します。
[fixture: kanban/gram-frontmatter-no-tag-reference]

C4 では frontmatter に `title: <a` があると、
`Person(a,"b="c">d")` をここでは拒否し、
mermaid.js は内側の属性引用符を変換して受理します。
[fixture: c4/div-frontmatter-open-tag]

## 書き手にとっての結果

`title: <a` のように、`<` と語の後に `>` のないタイトルを持つフロントマターは、
ふつうではありません。
それがあると、mermaid.js は、そこから図の最初の `>` までのすべての `"` を
`'` として読みます。
そのため、拒否するはずのラベルを受理したり、受理するはずのラベルを拒否したり、
ラベル、タイトル、メッセージのテキストを変えたりします。
mmd-toolkit のパーサーは、図をフロントマターがないときと同じに読みます。
タイトルのタグを閉じるか、`<` を書かなければ、どちらも同じに読みます。
[fixture: pie/frontmatter-html]

## mermaid.js がそう読む理由

mermaid.js は、
[`cleanupText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)
で、すべてのタグの中の `"` を `'` に置き換えます。
これはソース全体に対して、
[`preprocessDiagram`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L65)
がフロントマターを除く前に行われます。
置き換えはフロントマターの終わりを知らないので、
そこで始まるタグがテキストの中の `>` と組になります。

## この仕様の規則と、その理由

この仕様では、字句解析器はフロントマターの後から読み始め、
読むテキストの中でだけタグを探します。
フロントマターが何を持っていても、テキストの読み方は変わりません
（[HTML 属性の引用符](../common.ja.md#html-属性の引用符) を参照）。
どの図種でも、タイトルのようなフロントマターから得る値は、
mermaid.js が得るものと同じです
（[フロントマターの設定](../../../tests/docs/configuration.ja.md#フロントマターの設定)
を参照）。
[fixture: pie/frontmatter-html]
[fixture: flowchart/frontmatter-title-html-attribute]

タグがフロントマターの境界を越えて本文まで続くことは、
mermaid.js の処理の順から生じます。
置き換えが、フロントマターを除く前に行われるからです。
仕様が構文の規則として述べるものではありません。
これは既知の差異の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

### Agentflow

agentflow にも本文だけの同じ HTML の規則を使います。
Frontmatter の記録と Label と Literal のノードは書かれたテキストを保ちますが、
隣の ignored-text では、
その範囲のままフロントマターのタグで本文の引用符の役割を変えられません。
mermaid.js に合わせるには、欠けた値の保持ではなく、
共通の走査の範囲の変更が必要です。
[fixture: agentflow/div-html-cross-frontmatter]
[fixture: agentflow/div-frontmatter-tag-enables-label]
[fixture: agentflow/div-frontmatter-tag-changes-title]

比較は両方向です。
あるフロントマターのタグは、
独立した本文の規則が拒否するラベルを mermaid.js に受理させます。
一方、閉じないフロントマターの属性は、
正しい本文のタグを mermaid.js に拒否させます。
既存の理由 2 の直接の規則が両方を扱い、
逆方向の pipeline の順序の条件が後者の受理を認めます。
[fixture: agentflow/div-frontmatter-tag-enables-label]
[fixture: agentflow/html-label-without-frontmatter-tag]
[fixture: agentflow/div-frontmatter-attribute-blocks-body-tag]
[fixture: agentflow/html-body-tag-reference]

### Usecase

usecase の対象範囲は、
frontmatter の閉じないタグや属性から本体の属性引用符までです。
Frontmatter と UsecaseLabel は文字をすべて保持できますが、
本体だけの探索で frontmatter のタグが本体の引用符の字句的役割を変えることを、
欠落テキストの節点では表せません。
mermaid の境界をまたぐ変換は、本体だけなら拒否する例を受理し、
本体だけなら受理する例を拒否します。
双方向に既存の理由 2 を適用します。
後者の受理は pipeline 順序の逆方向の基準によるもので、ラベル文法は緩めません。
[fixture: usecase/div-html-frontmatter-enables-label]
[fixture: usecase/lex-html-body-label-reference]
[fixture: usecase/div-html-frontmatter-blocks-label]
[fixture: usecase/lex-html-body-tag-reference]

両者が受理し、アクセシビリティの値だけが異なる場合もあります。
frontmatter が `title: <a`、本文が `accTitle: b="c">d` なら、
mermaid は `b='c'>d` と読み、この仕様は `b="c">d` を保ちます。
Frontmatter と UsecaseLiteral に書かれたテキストを保持し、
木の値を変換後の引用符には変えません。
アクセシビリティ文の前に矢印があれば、その `>` が frontmatter のタグを閉じ、
その値の変化は起きません。
[fixture: usecase/div-html-frontmatter-acc-title-db]
[fixture: usecase/lex-html-acc-title-body-control]
[fixture: usecase/lex-html-frontmatter-arrow-closes-tag]

### Pie

Frontmatter は書かれた本文を、StringLiteral はラベルを持ちます。
無視する兄弟節点では、フロントマターで始まるタグが、
後のラベルの引用符を書き換えることを表せません。
直接の規則は、フロントマターを図の HTML の走査から除きます。
そのため区切りをまたぐタグによって、
Mermaid が受理するラベルをここでは拒否します。
受理するフロントマター内で閉じるタグにはその差異はなく、
フロントマターのタイトルは Mermaid の変換後の値です。
属性の変換で YAML が不正になる場合は、Mermaid が拒否しても、
共通の [不透明なデータの規則](./embedded-data-opaque.ja.md) が受理します。
対応する usecase の入力と同じ扱いです。
異なるのは、区切りをまたぐ効果と、変換後の YAML の拒否だけです。
図のテキスト内で完結するタグは、共通の HTML の規則に従います。
[fixture: pie/frontmatter-html]
[fixture: pie/div-review-frontmatter-html-cross-label]
[fixture: pie/div-review-frontmatter-html-invalid-yaml]
[fixture: usecase/div-gram-frontmatter-html-attribute-quotes]
[fixture: pie/html-all-texts]

### Gitgraph

木はフロントマターと本文の文字列を独立して持てます。
囲みをまたぐ HTML の一致は、その境界を越えずに片方のノードに持てません。
理由 2 の本文だけの直接の HTML 規則により、両方で受理して値が異なる場合、
Mermaid だけが受理する場合、ここだけが受理する場合があります。
フロントマターのタイトルは Mermaid が得る値を保ち、
結果の同じ通常の本文のタグやフロントマターのタグには印を付けません。
[fixture: gitgraph/div-frontmatter-cross-title-value]
[fixture: gitgraph/div-frontmatter-cross-string-enable]
[fixture: gitgraph/div-frontmatter-cross-string-block]
[fixture: gitgraph/frontmatter-body-tag-control]
[fixture: gitgraph/frontmatter-html]

### Packet

Frontmatter と値は原文を保持するが、
本文の quote 変換は不透明な frontmatter の未閉鎖 tag に依存しない。
値が変わる場合と、両方向に受理が逆転する場合があり、本文だけの対照は一致する。
[fixture: packet/div-html-frontmatter-value]
[fixture: packet/div-html-frontmatter-accept]
[fixture: packet/div-html-frontmatter-reject]
[fixture: packet/gram-html-body-only-reference]

### Architecture

architecture では、frontmatter 内で始まった tag が文字 icon の属性 quote を
single quote に変え、本来無効な string を受理させ得る。
frontmatter 内で開始した属性が、本仕様の受理する文字 icon を壊す場合もある。
両方向と、双方が受理するが読みが異なる角括弧 label を記録する。
木は quote の原綴を持てるが、mermaid と同じ本文の変換には、
前処理の順序に沿って frontmatter の HTML 文脈を引き継ぐ必要がある。
共有の直接の規則では、frontmatter の後から本文の HTML を読む。
[fixture: architecture/div-frontmatter-open-tag-icon]
[fixture: architecture/gram-frontmatter-open-tag-reference]
[fixture: architecture/div-frontmatter-open-attribute-icon]
[fixture: architecture/gram-frontmatter-open-attribute-reference]
[fixture: architecture/div-frontmatter-open-tag-label]

### Radar

radar は frontmatter の後から本文の HTML 属性の quote を読みます。
frontmatter の開いた tag の属性状態を label や common 値に持ち越しません。
引用符の原文は StringLiteral や RadarLiteral に保てるので、
テキストの欠落を理由に拒否しません。
残る差異は、前処理の状態を持ち越さず、frontmatter
と本文の境界を直接定めるものです。
[fixture: radar/div-html-frontmatter-cross]
[fixture: radar/div-html-frontmatter-reverse]
[fixture: radar/gram-html-body-only-double]
[fixture: radar/gram-html-body-only-single]
[fixture: radar/div-html-frontmatter-value]

double quote の境界を跨ぐ例は、mermaid が書換え後に受理しますが、
仕様は本文だけの対照例と同じく拒否します。
single quote の逆方向の例は、mermaid が拒否し、
仕様は本文だけの対照例と同じく受理します。
双方が受理しても、common title が mermaid では `x='y'>`、
仕様では本文だけの読みと同じ `x="y">` になる場合もあります。
これらの受理と値の差異には、この識別子を使い、
比較を specified.json に記録します。
label と common 値の node は原綴を保ちます。
[fixture: radar/div-html-frontmatter-cross]
[fixture: radar/div-html-frontmatter-reverse]
[fixture: radar/gram-html-body-only-double]
[fixture: radar/gram-html-body-only-single]
[fixture: radar/div-html-frontmatter-value]

### Treemap

treemap は本文の HTML 属性の引用符を frontmatter の後から読みます。
frontmatter に始まる閉じていない tag の属性の状態を、
名前・共通の値・class style へ持ち込みません。
StringLiteral と TreemapLiteral は書かれた引用符を保てます。
Mermaid に合わせるには、それに加え、前処理の順序に沿って
frontmatter の HTML の文脈を持ち越す必要があります。
共有の直接の規則は、代わりに本文を frontmatter の後から読み始め、
ignored text のノードで閉じ quote を移動しません。
[fixture: treemap/div-html-tag-starts-in-frontmatter]
[fixture: treemap/div-html-frontmatter-reverse]
[fixture: treemap/div-html-frontmatter-title-value]
[fixture: treemap/div-html-frontmatter-style-value]
[fixture: treemap/html-fields]

double quote の交差の例を Mermaid は名前 `b='c'>d` として受理しますが、
ここでは拒否します。
single quote の逆方向の例を Mermaid は拒否しますが、
ここでは名前 `x="y">` として受理します。
共通 title と class 定義の例は両方で受理します。
Mermaid は title を `x='y'>`、style を `fill:x='y'>` として読みますが、
この仕様は本文だけの引用符の読みに合わせ、
`x="y">` と `fill:x="y">` を保ちます。
受理と値の差異をこの識別子で表し、比較を specified.json に記録します。
ノードは書かれた綴りを保ちます。
[fixture: treemap/div-html-tag-starts-in-frontmatter]
[fixture: treemap/div-html-frontmatter-reverse]
[fixture: treemap/div-html-frontmatter-title-value]
[fixture: treemap/div-html-frontmatter-style-value]

### Railroad

railroad の 4 方言とも、
body の HTML の引用符の読取りを frontmatter の後で始めます。
比較は受理の両方向と、両受理で値が違う場合を含みます。
rule-accept の fixture は Mermaid が受理して仕様が拒否し、
rule-reject は Mermaid が拒否して仕様が受理し、
acctitle は両方が受理して値が異なります。
Mermaid が拒否する向きも含め、各 fixture に specified の記録があります。
[fixture: railroad/ir-div-html-frontmatter-rule-accept]
[fixture: railroad/ir-div-html-frontmatter-rule-reject]
[fixture: railroad/ir-div-html-frontmatter-acctitle]
[fixture: railroad/ebnf-div-html-frontmatter-rule-accept]
[fixture: railroad/ebnf-div-html-frontmatter-rule-reject]
[fixture: railroad/ebnf-div-html-frontmatter-acctitle]
[fixture: railroad/abnf-div-html-frontmatter-rule-accept]
[fixture: railroad/abnf-div-html-frontmatter-rule-reject]
[fixture: railroad/abnf-div-html-frontmatter-acctitle]
[fixture: railroad/peg-div-html-frontmatter-rule-accept]
[fixture: railroad/peg-div-html-frontmatter-rule-reject]
[fixture: railroad/peg-div-html-frontmatter-acctitle]

第 1 の問いでは、Frontmatter、StringLiteral、RailroadLiteral に
引用符の綴りも含めて書かれた source を保ち、
native hidden form も RailroadIgnoredText の owner に保ちます。
しかし、値の欄に、
Mermaid の frontmatter を跨ぐ引用符の文脈を保つことはできません。
ignored-text の兄弟ノードで文字列の閉じる位置を変えることはできないためです。
第 2 の問いの答えは理由 2、共通の直接規則です。
body の内部だけの HTML に見える text には通常の共通引用符規則を適用し、
tag があるだけでは印を付けません。
[fixture: railroad/ir-html-body-control]
[fixture: railroad/ebnf-html-body-control]
[fixture: railroad/abnf-html-body-control]
[fixture: railroad/peg-html-body-control]

### Wardley

Frontmatter・StringLiteral・WardleyLiteral は書いた引用符を保持できます。
しかし共有の本文だけを読む HTML 規則の下では、
不透明な frontmatter の未完 tag に本文の文字列の字句境界を支配させることはできま
せん。
残る違いは理由 2 の直接の frontmatter/本文境界です。double quote の note の例は
Mermaid が text b='c'>d として受理し、
この仕様は拒否します。single quote の例は Mermaid が拒否し、
この仕様は text b="c">d として受理します。accessible title の例は双方受理
し、Mermaid は b='c'>d、この仕様は b="c">d と読みます。
本文だけの control は一致し、Mermaid が拒否する向きも含め各差異に specified.json
があります。
[fixture: wardley/div-html-frontmatter-accept]
[fixture: wardley/div-html-frontmatter-reject]
[fixture: wardley/div-html-frontmatter-value]
[fixture: wardley/html-body-double-control]
[fixture: wardley/html-body-single-control]

### Cynefin

frontmatter と本文の node を保ったうえで、本文の HTML 属性の走査は本来の
frontmatter の後から始める。不透明な YAML の未完の tag は後の文字列の引用符を支
配しない。Mermaid が受理してこの規則が拒否する場合、逆の場合、両方受理して値だけ
が異なる場合があり、本文だけの引用符の対照には共通の HTML の規則を適用する。
[fixture: cynefin/div-html-frontmatter-accept]
[fixture: cynefin/div-html-frontmatter-reject]
[fixture: cynefin/div-html-frontmatter-value]
[fixture: cynefin/html-body-double-control]
[fixture: cynefin/html-body-single-control]

[pin の文法](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/cynefin/cynefin.langium#L4-L30)と[公開の adapter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinParser.ts#L8-L19)は共通の前処理と検出の結果を読みます。[Cynefin の構文](../diagrams/cynefin.ja.md)に直接の規則を定め、[木](../ast/cynefin.ja.md)に書かれた形を保ちます。 [fixture: cynefin/db-all-fields]

### eventmodeling

eventmodeling の原文は opaque な Frontmatter と後の StringLiteral/Literal に持て
ますが、frontmatter の内容で後の HTML quote の変換を制御しません。
本当の frontmatter の後だけに共有の規則を適用します。
Mermaid が不整合な inline quote を修復して受理し、この仕様が拒否する場合と、
対応する quote を壊して拒否し、この仕様が受理する場合があります。
両方受理して accessibility の text だけが異なる場合もあり、
Mermaid は属性を single quote、指定の読みは書かれた double quote とします。
retained prefix は比較 の両方で保ちます。
[fixture: eventmodeling/div-html-frontmatter-accept]
[fixture: eventmodeling/div-html-frontmatter-reject]
[fixture: eventmodeling/div-html-frontmatter-value]
[fixture: eventmodeling/html-body-double-control]
[fixture: eventmodeling/html-body-mismatch-control]
[fixture: eventmodeling/prefix-yaml-html]
[fixture: eventmodeling/prefix-directive-html]

[event-modeling.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L9-L70)
が単位を、[図の構文](../diagrams/eventmodeling.ja.md)が直接の境目を定義します。

### Treeview

treeview は frontmatter と本文の綴りを node に保ちますが、
本文の引用符の読みで opaque な frontmatter の tag の開始を調べません。
受理は両方向に変わりえます。
div-html-frontmatter-accept は Mermaid だけが受理し、
div-html-frontmatter-reject は逆です。
div-html-frontmatter-value は両方が受理し、bare 名の引用符だけが異なります。
各 specified は比較 Db と必要な埋込み値を保ちます。
[図の構文](../diagrams/treeview.ja.md)はこの既存の直接規則を適用し、
罫線専用の差異は要しません。
[fixture: treeview/div-html-frontmatter-accept]
[fixture: treeview/div-html-frontmatter-reject]
[fixture: treeview/div-html-frontmatter-value]

## mermaid.js の文書と issue

- 固定した版の

  [C4 の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L7-L17)
  は引用された説明の内部で `<br/>` を使い、

  [折り返しの設定に YAML のフロントマターを示しています](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L159-L171)。
  フロントマターで始まり C4 の引数へ続くタグは、
  説明していません。
  `mermaid-js/mermaid` の issue と pull request を、
  2026-10-21 に `C4 frontmatter in:title,body`、
  `frontmatter HTML quotes in:title,body`、
  `C4 frontmatter tag in:title,body` で検索し、
  この形式についての報告は見つかりませんでした。

- ピン留めした

  [venn の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
  は YAML frontmatter と引用ラベルを示し、
  frontmatter の境界をまたぐ HTML タグは示していません。
  2026-10-21 に `mermaid-js/mermaid` の issue と PR を
  `venn frontmatter in:title,body` と `venn HTML in:title,body` で検索し、
  その形に関する報告は見つかりませんでした。

- ピン留めした

  [Ishikawa の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/ishikawa.md#L11-L38)
  は字下げした節点のテキストを示しますが、
  frontmatter やその境界をまたぐ HTML タグは示していません。
  2026-10-21 に `mermaid-js/mermaid` の issue と PR を
  `ishikawa`、`ishikawa frontmatter in:title,body`、
  `ishikawa HTML in:title,body` で検索し、
  frontmatter で始まり Ishikawa の節点のテキストへ続くタグの報告は
  見つかりませんでした。

- 固定版の

  [Agentflow のフロントマターの例](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/agentflow.md#L67-L90)
  は YAML の設定と本文の引用したラベルを併用しますが、
  その境界をまたぐ HTML タグは説明していません。
  2026-10-22 に `mermaid-js/mermaid` の issue と pull request を
  `agentflow frontmatter in:title,body` で検索し、merged の
  [PR #8073](https://github.com/mermaid-js/mermaid/pull/8073) が見つかりました。
  その説明はコメントの保持とフロントマターのオフセットを扱い、
  本文の引用符まで続くタグは扱っていません。

- pin の
  [usecase 文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  は引用ラベルと JSON を説明します。
  2026-10-22 に mermaid-js/mermaid の issue と PR を
  `usecase title` で検索し、
  この受理挙動を保守者が欠陥と判断したと示す報告は、
  調べた結果にはありませんでした。
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048) は
  Type: Enhancement で、2026-08-14 にマージ済みで閉じています。
  Chevrotain parser、モデル検証、JSON の表を導入します。
  この差異は共有の直接の規則に従うもので、
  bug ラベルを文法変更の承認とは読みません。

- pie の pin した
  [構文文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md)
  は、フロントマターの区切りをまたぐ HTML タグを述べません。
  2026-10-23 に `pie`、`pie frontmatter`、`pie HTML` で検索しましたが、
  この区切りをまたぐ書き換えへの保守者の判断は見つかりませんでした。
  共通の不透明なフロントマターの除外が差異を決めます。

gitgraph の
[gitgraph.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gitgraph.md)
は、
見出しと各コマンドを説明します。
2026-10-23 に issue・PR を `gitGraph`、`gitGraph directive`、
`gitGraph YAML`、`gitGraph semicolon`、`gitGraph keyword`、
`gitGraph duplicate`、`gitGraph cherry-pick` で検索しました。
確認した結果には、この共通の境界を決定するものはありませんでした。
[#4838](https://github.com/mermaid-js/mermaid/issues/4838) は終了済みで
Status: Approved が付き、
merge 済みの [#6707](https://github.com/mermaid-js/mermaid/pull/6707) は
重複 ID の警告を加えます。これらから追加の差異は作りません。

- pin の
  [packet の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/packet.md#L12-L28)
  は単一位置・範囲・相対 count を示します。
  この前処理の境界については定めていません。
  2026-10-25 に `packet bitsPerRow`、`packet fractional`、
  `packet maxPacketSize` で公式 repository の issue・PR を検索しましたが、
  ここでの差異に関する maintainer の判断を示す結果は見つかりませんでした。

- pinned の
  [architecture.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L21-L175) は見出し・宣言・辺を説明するが、
  この共通の前処理の境界を定義しない。
  2026-10-25 に公式の issue/PR を architecture group undefined、
  architecture quotes title、architecture reverse、architecture unclosed、
  architecture align で検索した。
  [#7211](https://github.com/mermaid-js/mermaid/issues/7211) は
  Open、Status: Approved で、外側の親 group の辺を扱う報告である。
  今回の共通境界に対する maintainer の判断とはしない。

- Radar:
  [radar.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/radar.md#L66-L166) は軸・曲線・option を説明します。
  2026-10-25 に公式の issue/PR を radar directive、radar semicolon、
  radar entries で調べましたが、
  上記の境界を不具合とする判断は見つかりませんでした。
  [#7187](https://github.com/mermaid-js/mermaid/issues/7187) は閉じられた
  Status: Approved の文書報告です。
  [#7188](https://github.com/mermaid-js/mermaid/pull/7188) は、
  文書例の comma の修正で、
  末尾 comma の文法上の対応を追加したものではありません。

- Treemap: pin した
  [treemap の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/treemap.md#L24-L115)
  は引用した row・字下げ・class 定義を説明し、
  この共通の前処理の境界は定めていません。
  2026-10-25 に公式 repository の issue・PR を
  `treemap quotes` で検索しました。
  調べた結果に、この差異を maintainer が判断した根拠は見つかりませんでした。
  [#6590](https://github.com/mermaid-js/mermaid/pull/6590) は
  treemap を導入し、2025-06-27 に merge された PR で、
  この境界を判断したものではありません。

- Railroad:
  [pin した構文の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/railroad.md#L1-L280)
  は 4 記法、EBNF の例外、ABNF のセミコロンの comment、
  PEG の predicate を説明します。
  native の残る YAML と frontmatter を跨ぐ HTML の引用符の文脈は定義しません。
  2026-10-26 に公式 repository の issue と PR を railroad frontmatter、
  railroad directive、railroad semicolon、railroad comment で検索しました。
  [#7979](https://github.com/mermaid-js/mermaid/issues/7979) は
  demo の見出し名の報告
  （closed、Triage）、
  [#6620](https://github.com/mermaid-js/mermaid/issues/6620) は
  ABNF の図種の提案（open、Discussion Needed）です。
  どちらも、これらの前処理の境界について、
  保守者が defect と判断した事実ではありません。
  この差異はその判断でなく既存の共通規則に従います。
  調べた結果だけで、ほかに関連する issue がないとは断定しません。

- Wardley: pin し
  た[構文の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/wardley.md#L1-L461)は座標・装飾・flow を示しますが、この共通の境界を定義しません。2026-10-26 に公式 repository の issue/PR を wardley directive、wardley semicolon、wardley flow で検索しました。[#7642](https://github.com/mermaid-js/mermaid/pull/7642) は hyphen の名、[#7726](https://github.com/mermaid-js/mermaid/pull/7726) は不要な sanitization の修正で、いずれも pin に反映済みです。[#8379](https://github.com/mermaid-js/mermaid/pull/8379) は設定保持に関する open PR でした。確認した結果はこの境界を不具合と認める判断を示さず、既存の直接の規則を適用します。検索の網羅性は主張しません。
- Cynefin
  の[pin の構文文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/cynefin.md#L21-L111)は固定の領域、引用符つきの項目、ラベルつきの遷移を説明し、[注記](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/cynefin.md#L203-L210)は自己遷移を無視すると述べます。[PR #7535](https://github.com/mermaid-js/mermaid/pull/7535) は図を加えて merge されました。2026-10-26 に cynefin parser、cynefin directive、cynefin semicolon、cynefin frontmatter で検索し、この境目について調べた範囲で maintainer の判断は見つかりませんでした。[Issue #7921](https://github.com/mermaid-js/mermaid/issues/7921) は open、Status: Triage で、framework の名前と描画の変更を求めるもので、この字句の規則の判断ではありません。

### eventmodeling

pin した
[eventmodeling.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L37-L322)
は frame、data、tag を説明しますが、共有の前処理の境目を定義しません。
2026-10-26 に公式 issue と PR を eventmodeling title、eventmodeling parser、
event modeling data、eventmodeling accTitle、
eventmodeling validator で検索しました。
2026-04-16 に merged となった
[PR #7588](https://github.com/mermaid-js/mermaid/pull/7588) は validator の登録
を追加し、この境目に関する保守者の判断ではありません。
確認した結果にはその判断はなく、既存の直接の規則を適用します。
網羅的な検索だとはしません。

### Treeview

固定版の
[treeView.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/treeView.md#L1-L277) は字下げ・引用名・注釈・罫線を説明します。
この共通の境目を定義してはいません。2026-10-26 に公式 issue/PR を
`treeView quoted`、`treeView indentation`、`treeView box`、
`treeView quotes`、`treeView whitespace`、`treeView accDescr` で検索しました。
[PR #7721](https://github.com/mermaid-js/mermaid/pull/7721) は罫線を追加した
merged の PR、
[Issue #8014](https://github.com/mermaid-js/mermaid/issues/8014) は
header 省略を提案する open の Enhancement/Triage です。
調べた結果はこの共通の境目を defect と認める maintainer の判断を示しません。
既存の直接規則を適用するもので、網羅的な検索という主張ではありません。
