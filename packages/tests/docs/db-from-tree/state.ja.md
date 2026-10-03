# state の Db を木から作る

英語版: [state.md](./state.md)

state 図の木から Db の要約を作る手順です。
`src/db-from-tree/state.ts` がこれを実装します
（[db-from-tree.ja.md](../db-from-tree.ja.md) を参照）。
構文と木は、仕様の
[diagrams/state.ja.md](../../../spec/docs/diagrams/state.ja.md) と
[ast/state.ja.md](../../../spec/docs/ast/state.ja.md) が定めます。

mermaid.js は、構文解析の間に、描くデータ、つまりノードの列と辺の列を作ります
（[`StateDB.extract`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts#L249-L302)、
[`dataFetcher`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/dataFetcher.ts#L241-L477)）。
要約は、そのデータと、クラスの定義と、リンクから取ります。
値は、空白を含めて Db が持つとおりに保ちます。
変えるのは、
合成状態の最後の区域に mermaid.js が無作為に作る id だけです（下を参照）。

## 木から要約を作る

どの値も[変換した形](../../../spec/docs/common.ja.md#ソースの読み方)で読むので、
実体は、テキストの中と同じく id の中でもプレースホルダです。
`A#amp; --> B` は状態 `Aﬂ°amp¶ß` からの遷移を持ち、
`A : x#amp;y` は A に説明 `xﬂ°amp¶ßy` を与えます。
[fixture: state/lex-entity-in-id] [fixture: state/db-transition-id-entity]
[fixture: state/db-state-alias-id-entity] [fixture: state/db-description-entity]
[fixture: state/db-note-text-entity] [fixture: state/db-transition-label-entity]
[fixture: state/db-state-string-entity]

**id。**
状態の id は、
[文法の外での拒否](../../../spec/docs/diagrams/state.ja.md#文法の外での拒否)
が定めるもので、同じ id を持つ 2 つは 1 つの状態です。

**区域。**
分けられた本体、区域、区切りの文と区域の id は、
[文法の外での拒否](../../../spec/docs/diagrams/state.ja.md#文法の外での拒否)
が定めるものです。
mermaid.js は最後の区域に無作為の id を与えます。
要約は、そのような区域の中でのその区域の番号（ノードの順、1 から）を
`generated-region-` に続けたものを、その id が現れるところすべてで持ちます。
定義がその id で説明する区切りの状態や区域（`state "a" as divider-id-1`）は、
ほかの状態と同じく、それらの定義のラベルと説明を持ちます。
どの定義も説明しないものは、空のラベルを持ち、`description` を持ちません。
[fixture: state/db-last-region-alias-with-spaces] [fixture:
state/db-last-region-terminal-composite] [fixture:
state/db-divider-state-two-descriptions] [fixture:
state/db-region-one-description]

**巡り。**
ノードと遷移は、本体の文を順に巡ることで作ります。
巡りは**親**を持ちます。
最上位では親はなく、それ以外では、本体を巡っている合成状態か区域が親です。
文は次のものを加えます。

- 定義の文は、その説明とともに、その状態を訪れます。
- 遷移の文は、`from` の状態と `to` の状態を訪れ、遷移を加えます。
  `start` と `end` はそれらの id、`label` はそのラベルの値か空のテキストです。
- 本体のある合成状態の文、別名の定義、疑似状態の定義は、その状態を訪れます。
  別名の定義の説明は、その文字列の値から両端の空白を除いたものです。
  本体があるときは、引用符の間の文字列のテキストで、空白を含みます。
  `:` のある別名の定義は、2 つ目の説明を持ちます。
  その `secondDescription` の値で、空白を含み、なければ空のテキストです。
  `state "d" as A :` は、A に説明 `d` と空のテキストを与えます。
  疑似状態の定義は、その種類の形でその状態を訪れます。
  [fixture: state/db-alias-description-trimmed] [fixture:
  state/db-alias-body-description-untrimmed] [fixture:
  state/lex-alias-second-description] [fixture:
  state/db-alias-colon-empty-second] [fixture:
  state/db-alias-colon-spaces-second]
- ノートの文は、その状態を訪れ、ノートを加えます。
- 分けられた本体は、その区域として巡ります。
  各区域は、合成状態の状態として、形 `divider` で訪れられ、
  その文は区域を親として巡られます。
  ほかの本体はそのまま巡り、
  その中の各区切りの文は、本体なしでその id の状態を訪れます。
  そのため `state A {`、`B`、`--`、`}` は、B に親 A を与え、
  その後に、形 `divider` で `dir` のない状態 `divider-id-1` を、
  A の中に置きます。
  [fixture: state/db-divider-last-in-body] [fixture:
  state/db-dividers-each-last] [fixture: state/db-divider-alone-in-body]
- ほかの文はノードを加えません。
  本体のない合成状態の文、浮いたノート、click、classDef、class、style の文、
  方向の文、アクセシビリティの文、scale と hide の文です。
  どの文も訪れない id への click、class、style の文は、状態を加えません。
  [fixture: state/lex-state-without-body] [fixture: state/lex-floating-note]
  [fixture: state/gram-scale] [fixture: state/gram-hide-empty-description]
  [fixture: state/db-click-undefined-state] [fixture:
  state/db-class-undefined-state] [fixture: state/db-style-undefined-state]
  ノートの文はその状態を訪れるので、ほかの文が加えなくても状態を加えます。
  [fixture: state/db-note-undefined-state]

状態を訪れると、その id のノードがなければ列の終わりに加え、
あればそのノードをその場所で更新します。
id が空、`</choice>`、`</join></fork>` の状態は、ノードを作りません。
[fixture: state/lex-join-empty-id] [fixture: state/db-choice-close-tag-id]
[fixture: state/db-fork-close-tags-id]

その文が、
[文法の外での拒否](../../../spec/docs/diagrams/state.ja.md#文法の外での拒否)
の定める説明のうち、空のテキストでない説明を状態に与えるとき、
訪れは**説明を持ちます**。
訪れると、次のものを決めます。

- `parentId`。親があるときは、その id で、
  その id が空でノードを作らないときも同じです。
  後で別の合成状態か区域の中で訪れると、状態はそこへ移り、
  後で最上位で訪れても、`parentId` はそのままです。
  [fixture: state/db-state-in-two-composites] [fixture:
  state/db-parent-kept-at-top-level] [fixture:
  state/db-parent-set-by-later-composite] [fixture: state/lex-alias-without-id]
- 状態の**説明**。初めはその id だけです。
  説明を持つ最初の訪れは、そのどれかが id と同じでも、
  それらを訪れの説明に置き換えます。
  説明を持つ後の訪れは、そのどれかが id やすでにあるものと同じでも、
  その説明をほかの後に加えます。
  [fixture: state/db-description-id-alone] [fixture:
  state/db-description-equal-to-id] [fixture:
  state/db-description-id-after-description] [fixture:
  state/db-description-twice-same]
- `shape`。
  最初の訪れが、StateTerminal には `stateStart` か `stateEnd`、
  疑似状態には `fork`、`join`、`choice`、区域と区切りの文には `divider`、
  ノートの文には何も決めず、
  それ以外には `rect` を決めます。
  後の訪れがそれをもう一度決めることはありません。
  説明のある訪れは、状態の説明が 2 つ以上なら `rectWithTitle`、
  そうでなければ、前の訪れが本体を持っていれば `roundedWithTitle`、
  なければ `rect` にします。
  そのため、説明のある始まりや fork は形 `rect` を持ちます。
  本体のある最初の訪れは、`roundedWithTitle`、区域なら `divider` にします。
  [fixture: state/db-terminal-description] [fixture:
  state/db-fork-description] [fixture: state/db-fork-two-descriptions]
  そのため、ノートの文が最初に訪れた状態は、
  説明か本体のある訪れまで形を持ちません。
  `note left of A : x` の後に、`A --> B`、`A`、`state A <<fork>>` が続けば、
  A は形を持たず、`A : d` が続けば形 `rect`、
  本体のある `state A {` が続けば `roundedWithTitle` を持ちます。
  一方、`A` の後にノートが続けば `rect` です。
  合成状態の本体の中のノートは、合成状態を親としてその状態を訪れます。
  [fixture: state/db-note-first-no-shape] [fixture:
  state/db-note-first-then-state] [fixture: state/db-note-first-then-fork]
  [fixture: state/db-note-first-then-description] [fixture:
  state/db-note-first-then-body] [fixture: state/db-note-after-state-shape]
  [fixture: state/db-note-in-composite]
- `dir`。本体のある最初の訪れが、その本体の最後の方向の文の向きか、
  `TB` を決めます。後の本体はそれを変えません。
  分けられた本体の方向の文はその区域の中にあるので、
  そのような合成状態は `TB` を持ち、
  各区域は、その中の最後の方向の文の向きか `TB` を持ちます。
  分けられない本体は方向の文をそのまま持ち、区切りの文は `dir` を持ちません。
  [fixture: state/lex-composite-state-before-direction] [fixture:
  state/db-dir-first-body] [fixture: state/db-composite-divider-dir]
  [fixture: state/db-divider-last-in-body-direction]

ノートは記録を加えます。
`state` は状態の id で、`note-id` が空なら空のテキストで、
そのときは状態を訪れません（上を参照）。
`position` は、`Keyword` のトークン `left` か `right` と `of` のテキストを、
書かれたとおりに、mermaid.js が読む 1 つの空白でつないだものです。
`text` は、そのテキストの値、つまり mermaid.js が読むテキストか
（[ノートの文脈](../../../spec/docs/diagrams/state.ja.md#ノートの文脈) を参照）
、空のテキストです。
そのため `note left of A:hi` のテキストは `i` です。
[fixture: state/lex-note-mixed-case] [fixture:
state/lex-note-colon-without-space] [fixture:
state/lex-note-two-spaces-before-colon] [fixture: state/lex-note-block]
[fixture: state/lex-note-id-percent-block]

巡りの後、説明を持つ訪れを受けた状態は、その説明の最初のものを `label`、
ほかを `description` として持ちます。
説明が 1 つなら、`description` は空のリストです。
ほかの状態は、その id を `label` として持ち、`description` を持ちません。
区域と区切りの文は空のラベルを持ち、`description` を持ちません。
本体があり、説明が 2 つ以上の状態は拒否されます
（[文法の外での拒否](../../../spec/docs/diagrams/state.ja.md#文法の外での拒否) を参照）。
[fixture: state/lex-composite-divider]

**クラスとスタイル。**
状態の `classes` と `styles` は、最上位の文だけから来て、
その id の状態に、それがどこにあっても当たります。

- 遷移の中の StateReference の `cssClass` と、
  各 `class` の文のその各状態が、ソースの順にクラスを加えます。
  定義の文の `cssClass` は何も加えません。
  [fixture: state/db-classes-order] [fixture: state/db-definition-css-class]
  [fixture: state/db-class-before-state] [fixture:
  state/db-top-class-applies-nested]
  遷移の中の StateReference のクラスは、
  その id を `,` ごとに分けた各部分の状態に当たり、
  `,` を持つ id の状態には当たりません。
  `A,B:::e --> C` は A と B にクラス e を与え、`A,B` には与えません。
  `A,:::e --> B` は A にクラスを与えます。
  空の部分は、どの文も訪れない id と同じく、状態を加えません。
  [fixture: state/db-css-class-reference-comma]
  [fixture: state/db-css-class-reference-two-ids]
  [fixture: state/db-css-class-reference-comma-after-arrow]
  [fixture: state/db-css-class-reference-comma-undefined]
  [fixture: state/db-css-class-reference-comma-only]
- `style` の文は、その各状態のスタイルを、前のものを置き換えて決めます。
  その id の後の、行の終わりまでのテキストを `,` ごとに分け、
  各部分から各 `;` と両端の空白を除いたもので、空の部分も含みます。
  これらの部分が文のスタイルで、それぞれの値か、null なら空のテキストです。
  `style A x,,y` は `x`、空のテキスト、`y` を与え、
  `style A` は空のスタイル 1 つを与えます。
  [fixture: state/db-style-replaced] [fixture: state/db-style-semicolons]
  [fixture: state/db-style-empty-items] [fixture: state/db-style-blank]
  [fixture: state/db-style-trailing-comma]

合成状態の本体の中の `classDef`、`class`、`style` の文は何も変えません。
[fixture: state/db-nested-class-statement] [fixture:
state/db-nested-classdef]

**クラスの定義。**
最上位の各 `classDef` の文は、そのスタイルを、
その CSS クラスのクラスの定義に加えます。
定義がなければ加えます。
そのクラス名の後の、行の終わりまでのテキストを `,` ごとに分け、
各部分から最初の `;` と両端の空白を除いたもので、
`style` の文と同じく空の部分も含みます。
テキストが空か空白だけの文は、スタイルを加えませんが、
クラスの定義は加えます。
`classDef a x,,y` は `x`、空のテキスト、`y` を、
`classDef a ,` は空のスタイル 2 つを与えます。
[fixture: state/db-classdef-appended] [fixture:
state/db-classdef-semicolons] [fixture: state/db-classdef-empty-items]
[fixture: state/db-classdef-comma-only] [fixture:
state/db-classdef-trailing-comma] [fixture:
state/lex-classdef-without-styles]

**リンク。**
各 click の文はリンクを加えます。
`state` はその StateReference の id で、StateTerminal なら `[*]` です。
`url` と `tooltip` は、引用符を含むその文字列のテキストで、
`href` のある文では `tooltip` は空のテキストです。
[fixture: state/gram-click-tooltip] [fixture: state/gram-click-href]
[fixture: state/gram-click-terminal]

**そのほか。**
`direction` は、最上位の最後の方向の文の向きか、`TB` です。
タイトルはフロントマターのものです。行 `title T` は 2 つの状態です。
[fixture: state/db-direction-last] [fixture: state/db-title-frontmatter]
[fixture: state/db-title-line-states]

**アクセシビリティの文。**
`accTitle:` は、タイトルをその値にします。
`accDescr:` と `accDescr {` は、説明をその値にします。
そのとき、改行と、それに続く改行を含む空白を、1 つの改行に置き換えます。
後の文は、それぞれがどちらの形でも、前の文が決めた値を置き換えます。
`accTitle: first` の後に `accTitle: second` が続けばタイトルは `second` で、
`accDescr: x` の後に `accDescr { y }` が続けば説明は `y` で、
`accDescr { x }` の後に `accDescr: y` が続けば `y` です。
[fixture: state/spec-state-diagram-480eb00e] [fixture:
state/db-acc-title-replaces] [fixture:
state/db-acc-title-replaces-then-transition] [fixture:
state/db-acc-descr-replaces] [fixture: state/db-acc-descr-block-replaces]
[fixture: state/db-acc-descr-line-replaces-block]
閉じていない `accDescr {` のブロックは、テキストにかかわらず説明を空にします。
mermaid.js は、そのテキストを読んだ後、テキストの終わりで、
空のテキストを 2 つ目のブロックとして読むからです。
`accDescr: d` の後に、`accDescr {` と、テキストの終わりの行 `x` が続くと、
説明は空になり、タイトルはそのままです。
そのようなブロックはテキストの残りを取るので、
`A --> B` の後に、`accDescr {`、行 `never`、行 `C --> D` が続くものは、
状態 C と D を持ちません。
[fixture: state/db-acc-descr-block-unclosed-takes-lines] [fixture:
state/lex-acc-descr-block-unclosed] [fixture:
state/db-acc-descr-unclosed-replaces] [fixture:
state/db-acc-descr-unclosed-keeps-title]
それ以外では、値が null の文は空のテキストにし、
テキストのない閉じた説明のブロックは何も変えません。
`accTitle: x` の後にテキストの終わりの `accTitle:` が続けばタイトルは空で、
`accDescr:` も同じです。
`accDescr: x` の後に `accDescr {  }` が続いても `x` のままです。
[fixture: state/lex-acc-title-at-end] [fixture:
state/db-acc-title-empty-replaces] [fixture: state/db-acc-descr-empty-replaces]
[fixture: state/db-acc-descr-empty-block-keeps] [fixture:
state/db-acc-descr-empty-block-keeps-then-transition]
