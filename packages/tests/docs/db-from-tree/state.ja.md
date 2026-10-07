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
エンティティは、テキストの中と同じく id の中でもプレースホルダです。
`A#amp; --> B` は状態 `Aﬂ°amp¶ß` からの遷移を持ち、
`A : x#amp;y` は A に説明 `xﬂ°amp¶ßy` を与えます。
タイトル、スタイル、クラスの定義、URL、疑似状態の名前でも同じです。
同じ形では、各行終端（`\r\n` と単独の `\r` も）を `\n` として、
各属性の引用符を `'` として読みます。
U+2028 は行終端ではなく、値の中にそのまま残ります。
[fixture: state/lex-entity-in-id] [fixture: state/db-transition-id-entity]
[fixture: state/db-state-alias-id-entity] [fixture: state/db-description-entity]
[fixture: state/db-note-text-entity] [fixture: state/db-transition-label-entity]
[fixture: state/db-state-string-entity] [fixture: state/db-acc-title-entity]
[fixture: state/db-style-entity] [fixture: state/db-classdef-entity] [fixture:
state/db-click-url-entity] [fixture: state/db-pseudostate-id-entity] [fixture:
state/db-description-attribute-quote] [fixture:
state/db-state-string-attribute-quote] [fixture: state/db-acc-descr-block-crlf]
[fixture: state/db-acc-descr-block-lone-cr] [fixture: state/db-note-block-crlf]
[fixture: state/db-description-line-separator]

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
例えば、`state X {` の本体が、区切りの文のある `state Y {` と、
自身の区切りの文を持つとき、
Y の最後の区域は `generated-region-1`、
X の最後の区域は `generated-region-2` です。
Y の最後の区域のノードが、列の中で先に来るからです。
また、最後の区域の終了状態の id は `generated-region-1_end` です。
作者が id `generated-region-1` で書いた状態は、要約ではその区域と区別されず、
2 つが 1 つの id にまとまります。
定義がその id で説明する区切りの状態や区域（`state "a" as divider-id-1`）は、
ほかの状態と同じく、それらの定義のラベルと説明を持ちます。
どの定義も説明しないものは、空のラベルを持ち、`description` を持ちません。
[fixture: state/db-last-region-alias-with-spaces] [fixture:
state/db-last-region-terminal-composite] [fixture:
state/db-last-region-numbers-follow-node-order] [fixture:
state/db-last-region-terminal-end] [fixture:
state/db-divider-state-two-descriptions] [fixture:
state/db-divider-state-one-description] [fixture:
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
  別名の定義の説明は、その文字列の値から、
  U+2028 を含む両端の空白を除いたものです。
  本体があるときは、引用符の間の文字列のテキストで、空白を含みます。
  `:` のある別名の定義は、2 つ目の説明を持ちます。
  その `secondDescription` の値で、空白を含み、なければ空のテキストです。
  `state "d" as A :` は、A に説明 `d` と空のテキストを与えます。
  疑似状態の定義は、その種類の形でその状態を訪れます。
  [fixture: state/db-alias-description-trimmed] [fixture:
  state/db-alias-body-description-untrimmed] [fixture:
  state/lex-alias-second-description] [fixture:
  state/db-alias-colon-empty-second] [fixture:
  state/db-alias-colon-spaces-second] [fixture:
  state/db-alias-description-trimmed-line-separator]
- ノートの文は、その状態を訪れ、ノートを加えます。
- 分けられた本体は、その区域として巡ります。
  各区域は、合成状態の状態として、形 `divider` で訪れられ、
  その文は区域を親として巡られます。
  ほかの本体はそのまま巡り、
  その中の各区切りの文は、本体なしでその id の状態を訪れます。
  そのため `state A {`、`B`、`--`、`}` は、B に親 A を与え、
  その後に、形 `divider` で `dir` のない状態 `divider-id-1` を、
  A の中に置きます。
  最後の区切りの文の後のディレクティブ、コメント行、空行、U+2028 は
  文ではないので、本体は分けられないままです。
  `style` の文は文なので、本体は分けられ、最後の区域は状態を持ちません。
  合成状態の 2 つ目の本体も、最初の本体と同じく巡られ、
  その区域を、次の番号で状態に加えます。
  最初の本体が `B`、`--`、`C` で、2 つ目の本体が `D`、`--`、`E` なら、
  A に `divider-id-2` と `generated-region-2` が加わります。
  [fixture: state/db-divider-last-in-body] [fixture:
  state/db-dividers-each-last] [fixture: state/db-divider-alone-in-body]
  [fixture: state/db-divider-then-directive] [fixture:
  state/db-divider-then-comment-line] [fixture:
  state/db-divider-then-empty-line] [fixture:
  state/db-divider-then-line-separator] [fixture: state/db-divider-then-style]
  [fixture: state/db-composite-divided-twice]
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
ノートの文、別名の定義、本体のある合成状態がそれを訪れるときも同じです。
ノートは、その id を `state` として記録を加えます。
[fixture: state/lex-join-empty-id] [fixture: state/db-choice-close-tag-id]
[fixture: state/db-fork-close-tags-id] [fixture: state/db-note-close-tag-id]
[fixture: state/db-alias-close-tag-id]

その文が、
[文法の外での拒否](../../../spec/docs/diagrams/state.ja.md#文法の外での拒否)
の定める説明のうち、空のテキストでない説明を状態に与えるとき、
訪れは**説明を持ちます**。
訪れると、次のものを決めます。

- `parentId`。親があるときは、その id で、
  その id が空や `</choice>` のようにノードを作らないときも同じです。
  後で別の合成状態か区域の中で訪れると、状態はそこへ移り、
  後で最上位で訪れても、`parentId` はそのままです。
  [fixture: state/db-state-in-two-composites] [fixture:
  state/db-parent-kept-at-top-level] [fixture:
  state/db-parent-set-by-later-composite] [fixture: state/lex-alias-without-id]
  [fixture: state/db-composite-close-tag-parent]
- 状態の**説明**。初めはその id だけです。
  説明を持つ最初の訪れは、そのどれかが id と同じでも、
  それらを訪れの説明に置き換えます。
  説明を持つ後の訪れは、そのどれかが id やすでにあるものと同じでも、
  その説明をほかの後に加えます。
  `A : x`、`A : y`、`A : z` は、A にラベル `x` と説明 `y`、`z` を与えます。
  [fixture: state/db-description-id-alone] [fixture:
  state/db-description-equal-to-id] [fixture:
  state/db-description-id-after-description] [fixture:
  state/db-description-twice-same] [fixture: state/db-description-three-visits]
- `shape`。
  最初の訪れが、StateTerminal には `stateStart` か `stateEnd`、
  疑似状態には `fork`、`join`、`choice`、区域と区切りの文には `divider`、
  ノートの文には何も決めず、
  それ以外には `rect` を決めます。
  後の訪れがそれをもう一度決めることはありません。
  説明のある訪れは、状態の説明が 2 つ以上なら `rectWithTitle`、
  そうでなければ、前の訪れが本体を持っていれば `roundedWithTitle`、
  なければ `rect` にします。
  そのため、説明のある始まり、fork、区切りの文は形 `rect` を持ち、
  本体のある `state A {` の後に `A : x` が続けば、
  A は形 `roundedWithTitle` を持ちます。
  本体のある最初の訪れは、`roundedWithTitle`、区域なら `divider` にします。
  [fixture: state/db-terminal-description] [fixture:
  state/db-fork-description] [fixture: state/db-fork-two-descriptions]
  [fixture: state/db-divider-state-one-description] [fixture:
  state/db-body-then-description]
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
  `TB` を決めます。本体が空でも同じです。後の本体はそれを変えません。
  入れ子の本体の方向の文は、その本体だけのものです。
  `state A {` の中の `state B {` が `direction LR` と `C` を持てば、
  B は `LR`、A は `TB` を持ちます。
  分けられた本体の方向の文はその区域の中にあるので、
  そのような合成状態は `TB` を持ち、
  各区域は、その中の最後の方向の文の向きか `TB` を持ちます。
  分けられない本体は方向の文をそのまま持ち、区切りの文は `dir` を持ちません。
  [fixture: state/lex-composite-state-before-direction] [fixture:
  state/db-dir-first-body] [fixture: state/db-dir-last-in-body] [fixture:
  state/db-dir-nested-body] [fixture: state/db-dir-first-body-empty] [fixture:
  state/db-composite-divider-dir] [fixture:
  state/db-divider-last-in-body-direction]

ノートは記録を加えます。
`state` は状態の id で、`note-id` が空なら空のテキストで、
そのときは状態を訪れません（上を参照）。
`position` は、`Keyword` のトークン `left` か `right` と `of` のテキストを、
書かれたとおりに、mermaid.js が読む 1 つの空白でつないだものです。
`text` は、そのテキストの値、つまり mermaid.js が読むテキストか
（[ノートの文脈](../../../spec/docs/diagrams/state.ja.md#ノートの文脈) を参照）
、空のテキストです。
そのため `note left of A:hi` のテキストは `i` です。
ブロックのテキストは、各行の空白を保ち、空行も行です。
行 `a`、空行、` b` は、`a`、2 つの改行、` b` を与えます。
ディレクティブだけの行は、その空白を保つので、
行 `a`、ディレクティブの前に空白 1 つのその行、` b` は、
`a`、改行、空白 1 つ、改行、` b` を与えます。
[fixture: state/lex-note-mixed-case] [fixture:
state/lex-note-colon-without-space] [fixture:
state/lex-note-two-spaces-before-colon] [fixture: state/lex-note-block]
[fixture: state/lex-note-id-percent-block] [fixture:
state/db-note-block-empty-line] [fixture: state/db-note-block-directive-line]

巡りの後、説明を持つ訪れを受けた状態は、その説明の最初のものを `label`、
ほかを `description` として持ちます。
説明が 1 つなら、`description` は空のリストです。
ほかの状態は、その id を `label` として持ち、`description` を持ちません。
区域と区切りの文は空のラベルを持ち、`description` を持ちません。
[fixture: state/lex-composite-divider]
本体があり、説明が 2 つ以上の状態は拒否されます
（[文法の外での拒否](../../../spec/docs/diagrams/state.ja.md#文法の外での拒否)
を参照）。
[fixture: state/db-composite-two-descriptions] [fixture:
state/gram-region-two-descriptions]

**クラスとスタイル。**
状態の `classes` と `styles` は、最上位の文だけから来て、
その id の状態に、それがどこにあっても当たります。

- 遷移の中の StateReference の `cssClass` と、
  各 `class` の文のその各状態が、ソースの順にクラスを加えます。
  状態がすでに持つクラスも加えます。
  `class A c` を 2 回書けば A は `c` を 2 つ持ち、
  `A:::e --> B` の後に `class A c` が続けば `e` と `c` を持ちます。
  定義の文の `cssClass` は何も加えません。
  click の文の StateReference の `cssClass` も、
  合成状態の本体の中の遷移の `cssClass` も、何も加えません。
  P の本体の中の `A:::c --> B` は、A にクラスを与えません。
  [fixture: state/db-classes-order] [fixture:
  state/db-classes-order-transition-first] [fixture: state/db-class-twice-same]
  [fixture: state/db-definition-css-class] [fixture:
  state/db-click-reference-css-class] [fixture:
  state/db-nested-transition-css-class] [fixture: state/db-class-before-state]
  [fixture: state/db-top-class-applies-nested]
  遷移の中の StateReference のクラスは、
  その id を `,` ごとに分けた各部分の状態に当たり、
  `,` を持つ id の状態には当たりません。
  `A,B:::e --> C` は A と B にクラス e を与え、`A,B` には与えません。
  `A,:::e --> B` は A にクラスを与えます。
  空の部分は、どの文も訪れない id と同じく、状態を加えません。
  矢印の後の StateTerminal も、そのクラスを受けます。
  `A --> [*]:::c` は、`root_end` にクラス `c` を与えます。
  [fixture: state/db-css-class-reference-comma]
  [fixture: state/db-css-class-reference-two-ids]
  [fixture: state/db-css-class-reference-comma-after-arrow]
  [fixture: state/db-css-class-reference-comma-undefined]
  [fixture: state/db-css-class-reference-comma-only]
  [fixture: state/db-css-class-terminal-end]
- `style` の文は、その各状態のスタイルを、前のものを置き換えて決めます。
  あとの文が訪れる状態にも、合成状態の本体の中の状態にも、同じく当たります。
  その id の後の、行の終わりまでのテキストを `,` ごとに分け、
  各部分からそこにあるすべての `;` を除き、その後に両端の空白を除いたもので、
  空の部分も含みます。
  これらの部分が文のスタイルで、それぞれの値か、null なら空のテキストです。
  `style A x,,y` は `x`、空のテキスト、`y` を与え、
  `style A a;b;c` は `abc` を与え、
  テキストの終わりの `style A` は空のスタイル 1 つを与えます。
  id の後の空白は改行を含むので、テキストは、コメント行を挟んで、
  後の行から始まることがあります。
  `style A` の後に行 `B --> C` が続けば、A のスタイルは `B --> C` で、
  遷移は加わりません。
  `style A`、コメント行、`B` は、スタイル `B` を与えます。
  テキストは、ディレクティブと、行の規則が無視する `;` を除いて読みます。
  `style A x %%{init: {}}%% ,y` は `x` と `y` を、
  `style A %%{init: {}}%%` は空のスタイル 1 つを与えます。
  `style A fill:#f00;` は `fill:#f00` を与えます。
  `style A fill:#f00;b;c` では最後の `;` だけが無視されるので、
  `#f00;` はエンティティで、スタイルは `fill:`、そのプレースホルダ、`bc` です。
  [fixture: state/db-style-replaced] [fixture: state/db-style-semicolons]
  [fixture: state/db-style-two-semicolons-in-part] [fixture:
  state/db-style-semicolon-after-space] [fixture: state/db-style-empty-items]
  [fixture: state/db-style-blank] [fixture: state/db-style-trailing-comma]
  [fixture: state/db-style-takes-next-line] [fixture:
  state/db-style-comment-line-before-styles] [fixture:
  state/db-style-directive-before-comma] [fixture:
  state/db-style-directive-only] [fixture: state/db-style-ignored-semicolon]
  [fixture: state/db-style-ignored-semicolon-last-only] [fixture:
  state/db-style-before-state] [fixture: state/db-top-style-applies-nested]

合成状態の本体の中の `classDef`、`class`、`style` の文は何も変えません。
[fixture: state/db-nested-class-statement] [fixture:
state/db-nested-classdef] [fixture: state/db-nested-style]

**クラスの定義。**
最上位の各 `classDef` の文は、そのスタイルを、
その CSS クラスのクラスの定義に加えます。
定義がなければ加えます。
そのクラス名の後の、行の終わりまでのテキストを `,` ごとに分け、
各部分から最初の `;` を除き、その後に両端の空白を除いたもので、
`style` の文と同じく空の部分も含みます。
`style` の文との違いは `;` だけで、
`style` の部分はすべての `;` を失い、
`classDef` の部分は最初の 1 つだけを失います。
そのため `classDef c a;b;c,d;e;f` は `ab;c` と `de;f` を与え、
各部分がそれぞれの最初の `;` を失います。
テキストが空か空白だけの文、またはディレクティブだけの文は、
スタイルを加えませんが、クラスの定義は加えます。
`classDef a x,,y` は `x`、空のテキスト、`y` を、
`classDef a ,` は空のスタイル 2 つを与えます。
`style` の文と同じく、テキストは、コメント行を挟んで後の行から始まることがあり、
ディレクティブと、行の規則が無視する `;` を除いて読みます。
`classDef c a:#f00;b,d;e` では、2 つ目の部分の最後の `;` が無視されるので、
スタイルは `a:`、エンティティ `#f00;` のプレースホルダ、`b` と、`de` です。
[fixture: state/db-classdef-appended] [fixture: state/db-classdef-semicolons]
[fixture: state/db-classdef-semicolon-in-each-part] [fixture:
state/db-classdef-semicolon-after-space] [fixture:
state/db-classdef-empty-items] [fixture: state/db-classdef-comma-only] [fixture:
state/db-classdef-trailing-comma] [fixture: state/lex-classdef-without-styles]
[fixture: state/db-classdef-directive-only] [fixture:
state/db-classdef-without-styles-takes-transition] [fixture:
state/db-classdef-comment-line-before-styles] [fixture:
state/db-classdef-ignored-semicolon-last-only]

**リンク。**
各 click の文はリンクを加えます。
`state` はその StateReference の id で、StateTerminal なら `[*]` です。
`url` と `tooltip` は、引用符を含むその文字列のテキストで、
`href` のある文では `tooltip` は空のテキストです。
同じ状態への 2 つの click の文は、ソースの順に 2 つのリンクを加えます。
行の規則が無視する `;` は、文字列に含まれません。
`click A href "style:#x;"` の url は `"style:#x"` です。
[fixture: state/gram-click-tooltip] [fixture: state/gram-click-href]
[fixture: state/gram-click-terminal] [fixture: state/db-click-twice-same-state]
[fixture: state/db-click-url-ignored-semicolon]

**そのほか。**
`direction` は、最上位の最後の方向の文の向きか、`TB` です。
タイトルはフロントマターのものです。行 `title T` は 2 つの状態です。
[fixture: state/db-direction-last] [fixture: state/db-title-frontmatter]
[fixture: state/db-title-line-states]

**アクセシビリティの文。**
`accTitle:` は、タイトルをその値にします。
`accDescr:` と `accDescr {` は、説明をその値にします。
そのとき、改行と、それに続く改行を含む空白を、1 つの改行に置き換えます。
値は、木の
[StateLiteral](../../../spec/docs/ast/state.ja.md#stateliteral)
が持つとおり、両端に空白を持ちません。
`accTitle: x` と `accDescr: x` の後に空白 2 つが続いても `x` で、
`accDescr { a  }` は `a` です。
[fixture: state/db-acc-title-trailing-whitespace] [fixture:
state/db-acc-descr-trailing-whitespace] [fixture:
state/db-acc-descr-block-whitespace-before-close]
ブロックの中では、空行と、ディレクティブだけの行も、その空白です。
行 `a`、空行、`b` は、`a`、改行、`b` を与えます。
改行の前の空白は残るので、`a` の後に空白 2 つと改行が続けば、
`a`、空白 2 つ、改行を与えます。
U+2028 は改行の後では空白ですが、改行ではないので、
2 つの語の間の U+2028 は説明に残ります。
[fixture: state/db-acc-descr-block-empty-line] [fixture:
state/db-acc-descr-block-directive-line] [fixture:
state/db-acc-descr-block-space-before-line-feed] [fixture:
state/db-acc-descr-block-line-separator] [fixture:
state/db-acc-descr-block-line-separator-after-line-feed]
行の形の値は、コロンの後の空白が改行を含むので、後の行から始まることがあります。
`accDescr:` の後に行 `A --> B` が続けば、
説明は `A --> B` で、遷移は加わりません。
`accTitle:` の後の、コメント行、ディレクティブの行、空行、U+2028 の後の `x` は、
タイトル `x` を与えます。
[fixture: state/db-acc-descr-line-next-line] [fixture:
state/db-acc-title-comment-line-before-value] [fixture:
state/db-acc-title-directive-line-before-value] [fixture:
state/db-acc-title-empty-line-before-value] [fixture:
state/db-acc-title-line-separator-before-value]
値は行の終わりまで続き、その中の `accDescr {}` は値の一部です。
`accTitle: x accDescr {}` は `x accDescr {}` を与えます。
値は、ディレクティブと、行の規則が無視する `;` を除いて読みます。
`accTitle: x %%{init: {}}%% y` は、`x`、空白 2 つ、`y` を与え、
`accDescr: style:#x;` と、行 `style:#x;` のあるブロックは、
`style:#x` を与えます。
[fixture: state/db-acc-title-with-empty-description-block] [fixture:
state/db-acc-title-directive-in-text] [fixture:
state/db-acc-descr-ignored-semicolon] [fixture:
state/db-acc-descr-block-ignored-semicolon]
ブロックのテキストは最初の `}` で終わります。
ブロックの中の行 `a accDescr {} b` は、説明 `a accDescr {` を与え、
`b` と `}` は状態です。
[fixture: state/db-acc-descr-block-text-with-empty-block]
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
