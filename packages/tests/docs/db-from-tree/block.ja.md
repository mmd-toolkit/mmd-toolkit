# ツリーから block の Db を作る

英語版: [block.md](./block.md)

`src/db-from-tree/block.ts` は、
[ast/block.md](../../../spec/docs/ast/block.md) のツリーについて、
[db-summaries.md の block](../db-summaries.md#block) の読み方と、
[diagrams/block.md](../../../spec/docs/diagrams/block.md) の構文に従います。
`tests/db-from-tree-block.test.ts` の手作りツリーは、
各 fixture の `expected.json` の Db と、メモリ上と JSON 往復後に比較します。
記録済み block ツリーへの適用は後の段階です。

## ツリーから要約を作る

1. **変換形。**
   テキストは [変換形](../../../spec/docs/common.md#reading-a-source) で読み、
   CR と CRLF は LF に、HTML 属性の引用符は `'` に、文字参照は置換文字列にし、
   ディレクティブ、コメント領域、
   行規則の `IgnoredSemicolon` トークンを除きます。 [fixture: block/db-label-cr]
   [fixture: block/db-label-crlf]
   [fixture: block/db-label-html-attribute-double]
   [fixture: block/db-label-entity-numeric]
   [fixture: block/db-label-entity-named] [fixture: block/db-label-directive]
   [fixture: block/db-label-directive-line]
   [fixture: block/db-label-comment-line]
   [fixture: block/db-grid-style-rule-label]

2. **ラベル。**
   StringLiteral は変換形の引用符の間のテキストを与え、両端の空白も含めてから、
   下記の文字の置き換えを適用します。 [fixture: block/db-label-padded]
   [fixture: block/db-label-spaces]
   [fixture: block/config-security-level-other-all]

3. **数値。**
   NumericLiteral は、JSON が null にした可能性のある `value` ではなく、
   変換形の数字を十進の `parseInt` で読み、
   有限でない数は `numberOrText` でそのテキストにします。
   [fixture: block/db-width-zero] [fixture: block/db-width-leading-zeros]
   [fixture: block/db-width-overflow] [fixture: block/db-columns-leading-zeros]
   [fixture: block/db-columns-overflow]

4. **初期状態。**
   `root` は型 `composite`、`columns: -1`、ラベルなし、空の子リストで始め、
   ブロック表の先頭をこの `root` とし、ほかのブロック、クラス、辺は空にします。
   [fixture: block/db-columns-only-auto]
   [fixture: block/db-name-no-final-line-feed]

5. **走査。**
   文をソース順に歩き、複合ブロックは表に入れてからその子へ入り、
   子を訪れてから外側のリストを続けます。
   [fixture: block/db-collecting-depth-first]

6. **定義。**
   表にある id のブロックを定義すると、新しい型が `na` でなければ型を、
   新しいラベルが id と異なればラベルを更新し、最初の幅、方向、列数、クラス、
   スタイル、子、配置を保持して、新しいブロックとその子リストを捨てます。
   [fixture: block/db-collecting-redefine-type-na-keeps]
   [fixture: block/db-collecting-redefine-label-equal-id]
   [fixture: block/db-collecting-redefine-label-only-odd]
   [fixture: block/db-definitions-three-widths]
   [fixture: block/db-collecting-redefine-keeps-directions]
   [fixture: block/db-collecting-composite-then-node-shape-width]
   [fixture: block/db-composite-id-same-composite]
   [fixture: block/db-composite-id-same-nested]
   [fixture: block/db-composite-id-same-as-child]
   [fixture: block/db-collecting-two-composites-share-child]

7. **未配置ブロック。**
   root の子から到達できない表の要素を表順で `unplaced` に並べ、
   未配置の祖先がある子孫はその祖先の中にだけ載せ、
   捨てた複合ブロックの子と space、class が作ったブロックも残し、辺、クラス、
   スタイルから検索できるようにします。 [fixture: block/db-unplaced-order]
   [fixture: block/db-unplaced-order-defined-later]
   [fixture: block/db-unplaced-nested-composite]
   [fixture: block/db-unplaced-columns-in-dropped]
   [fixture: block/db-unplaced-dropped-with-width]
   [fixture: block/db-unplaced-space]
   [fixture: block/db-unplaced-edge-into-dropped]
   [fixture: block/db-unplaced-class-on-unplaced-child]
   [fixture: block/db-unplaced-style-on-unplaced]

8. **列数。**
   各リストの最後の columns 文が親の列数を設定し、ほかのリストとは独立に、
   `auto` は `-1`、`0` は `0` のままとし、ノードの幅は変えません。
   [fixture: block/db-collecting-columns-per-composite]
   [fixture: block/db-definitions-columns-three]
   [fixture: block/db-columns-only-auto]
   [fixture: block/db-columns-twice-auto-last] [fixture: block/db-columns-zero]
   [fixture: block/db-columns-with-width]

9. **ノード。**
   形状のないノードは変換形の id を id とラベルに持ち、型は `na`、
   `widthInColumns` は指定した幅または 1 とし、 id の大文字小文字を保ちます。
   [fixture: block/db-name-no-final-line-feed] [fixture: block/db-name-case]
   [fixture: block/db-width-zero] [fixture: block/db-width-leading-zeros]

10. **形状。**
    形状はラベルと、書かれた開始と終了の組が下表に持つ型を与え、
    それ以外の組は `na` としてラベルを保持します。
    [fixture: block/db-shape-mixed-square-round]

11. **ブロック矢印。**
    BlockArrowShape は型 `block_arrow` とラベルを与え、
    方向は木のリストの BlockLiteral を順に取ります。
    範囲の変換形で、
    語に付いて書かれた空白を持ちます（ast/block.md の BlockArrowShape）。
    間にディレクティブのある CR と LF は 2 つの行終端で、CRLF とは違いますが、
    木の文字列ではなく範囲がそれを区別します。
    [fixture: block/db-arrow-cr-directive-lf] [fixture: block/db-arrow-all]
    [fixture: block/db-arrow-spaces] [fixture: block/db-arrow-leading-space]
    [fixture: block/db-arrow-leading-comma]
    [fixture: block/db-arrow-trailing-space]
    [fixture: block/db-arrow-glued-words] [fixture: block/db-arrow-up-down]
    [fixture: block/db-arrow-twice] [fixture: block/db-arrow-line-feed]

12. **矢印の再定義。**
    ブロック矢印の再定義は最初の方向を保持し、
    既存の形状へ矢印を与えても方向は追加せず、
    矢印へ形状を与えても方向を保持します。
    [fixture: block/db-collecting-redefine-keeps-directions]
    [fixture: block/db-arrow-redefine-from-square]
    [fixture: block/db-arrow-redefine-to-square]

13. **空き。**
    `space` は型 `space`、幅 1 のブロックを一つ作り、
    `space:N` は幅 N のブロックを N 個ソース順に作り、id とラベルを持たず、
    `space:0` は何も作らず、先頭のゼロも十進の数字として読みます。
    [fixture: block/db-space-plain] [fixture: block/db-space-width]
    [fixture: block/db-space-width-zero] [fixture: block/db-space-leading-zeros]
    [fixture: block/db-unplaced-space]

14. **複合ブロック。**
    複合ブロックは頭部の id、幅、ラベル、方向を取り、型を `composite` に、
    ないラベルを空のテキストにし、
    頭部がなければ id と幅を持たず空のラベルにして、本体が作る子を保持します。
    [fixture: block/db-composite-label] [fixture: block/db-composite-width]
    [fixture: block/db-composite-block-arrow]
    [fixture: block/db-composite-no-id]
    [fixture: block/db-composite-id-same-as-node-before]

15. **辺の頭部。**
    頭部にリンクがある複合ブロックは id、幅、頭部のラベルを持たず、
    型 `composite`、空のラベル、本体の子と列数だけを保持し、
    頭部の辺は作りません。 [fixture: block/db-composite-edge-header]
    [fixture: block/db-composite-edge-header-width]

16. **辺。**
    リンクが一つの文は、最初のノードを幅なしで、次に辺を、
    最後に行き先を幅なしで追加し、
    複合ブロック内の辺や繰り返した辺もソース順に保ちます。
    [fixture: block/db-width-on-edge-source]
    [fixture: block/db-edge-keeps-width]
    [fixture: block/db-collecting-edge-order-in-composite]
    [fixture: block/db-definitions-edges-three]

17. **辺の欄。**
    辺は始点と終点の id、ラベルまたは空のテキストを持ち、
    太線の thickness は `thick`、ほかは `normal`、点線の pattern は `dotted`、
    ほかは `solid`、始点マーカーは `arrow_point` または `arrow_open`、
    終点マーカーは `arrow_point`、`arrow_cross`、`arrow_circle` または空で、
    矢印の欄は閉じる矢印だけから取り、長さを持ちません。
    [fixture: block/db-edge-arrow] [fixture: block/db-edge-open]
    [fixture: block/db-edge-thick] [fixture: block/db-edge-dotted]
    [fixture: block/db-edge-cross] [fixture: block/db-edge-circle]
    [fixture: block/db-edge-bidirectional]
    [fixture: block/db-edge-label-mismatched] [fixture: block/db-edge-long]
    [fixture: block/db-edge-thick-open] [fixture: block/db-edge-thick-long]
    [fixture: block/db-edge-dotted-open] [fixture: block/db-edge-dotted-long]
    [fixture: block/db-edge-label-bidirectional]

18. **辺の方向。**
    辺は行き先ノードにブロック矢印があればそこに書かれた方向を取り、
    始点の方向は取りません。 [fixture: block/db-edge-to-block-arrow]
    [fixture: block/db-edge-from-block-arrow]

19. **連鎖。**
    複数のリンクを持つ文は最後のリンクより前のノードと辺を失い、
    始点をすべての連鎖で共有する欄なしのブロックに置き換えるため、
    要約には `{}` と `start` のない辺、最後の行き先が現れ、
    失ったノードを後で定義することは妨げません。 [fixture: block/db-edge-chain]
    [fixture: block/db-edge-chain-four] [fixture: block/db-edge-chain-labels]
    [fixture: block/db-edge-chain-twice]
    [fixture: block/db-edge-chain-then-node]

20. **クラス定義。**
    文の各スタイルの変換形（null は空のテキスト）を取り、
    各部分の最初の `;` を除き、各部分をトリムし、
    空の部分もクラスのスタイルへ追加し、
    複合ブロックや再定義をまたいでも最初の定義の順を保持します。
    [fixture: block/db-class-def-color-fill]
    [fixture: block/db-class-def-spaces-around-styles]
    [fixture: block/db-class-def-empty-style]
    [fixture: block/db-class-def-leading-comma]
    [fixture: block/db-class-def-three] [fixture: block/db-class-def-twice-same]
    [fixture: block/db-class-def-in-block]
    [fixture: block/db-class-def-semicolon-end]
    [fixture: block/db-class-def-semicolon-middle]
    [fixture: block/db-grid-semicolon-class-def-style]
    [fixture: block/db-grid-style-rule-class-def-style]

21. **クラス適用。**
    木の各 id の変換形を取り、その id はカンマの後の空白を持ち、トリムせず、
    変換形をトリムしたクラス名または空のテキストを一つのクラスとして追加し、
    classDef の有無によらず繰り返しと空白やカンマのある名前を保持します。
    [fixture: block/db-class-apply-list]
    [fixture: block/db-class-apply-list-spaces]
    [fixture: block/db-class-apply-names-spaces]
    [fixture: block/db-class-apply-names-list]
    [fixture: block/db-class-apply-no-name]
    [fixture: block/db-class-apply-same-twice]

22. **クラスが作るブロック。**
    その検索で見つからない id は、トリムした id の下に型 `na`、ラベルと幅なし、
    空の子リストのブロックを作り、同じトリム後の id の表の要素があれば置き換え、
    後の定義は型とラベルだけを変えて未配置のままにします。
    [fixture: block/db-class-apply-list-spaces]
    [fixture: block/db-class-apply-undefined-list]
    [fixture: block/db-class-apply-before-node-width]
    [fixture: block/db-class-apply-before-block]

23. **スタイル。**
    style 文の id はカンマを含めた一つの変換形で既存のブロックを検索し、
    文の各スタイルの変換形（null は空のテキスト）を取り、
    ブロックのスタイルを順にそれで置き換え、
    カンマの前後の空白と空白だけの部分をそのまま保ちます。
    文のスタイルが null の 1 つだけなら何も変えません。
    [fixture: block/db-grid-comma-style-id] [fixture: block/db-style-spaces]
    [fixture: block/db-grid-semicolon-style-text]
    [fixture: block/db-style-only-comma] [fixture: block/db-style-then-none]
    [fixture: block/db-definitions-style-three-empty-middle]
    [fixture: block/db-grid-style-rule-style-text]

24. **Root とプロトタイプ。**
    id `root` は図のブロックを指し、要約はその id を省き、
    形状が型とラベルを変えても列数と子を保ち、
    `__proto__` や `constructor` を含むほかの id は通常の Map のキーです。
    [fixture: block/db-proto-root-columns] [fixture: block/db-proto-root-style]
    [fixture: block/db-composite-root-id] [fixture: block/db-class-def-proto]
    [fixture: block/db-class-apply-proto-id]
    [fixture: block/db-composite-constructor-id]

25. **Db への作用なし。**
    空の説明ブロック、フロントマターのタイトル、描画設定は要約へ何も加えません。
    [fixture: block/db-empty-block-between]
    [fixture: block/db-frontmatter-config-block]
    [fixture: block/header-after-frontmatter]

26. **要約。**
    `root`、`unplaced`、`edges`、`classes` を返し、
    複合ブロック以外の空の子リスト、生成した id、space のラベル、辺の id と型、
    パレット番号、派生したテキストスタイル、レイアウトを省きます。
    [fixture: block/db-collecting-depth-first] [fixture: block/db-space-width]
    [fixture: block/db-composite-no-id] [fixture: block/db-class-def-color-fill]
    [fixture: block/db-edge-arrow]

手順 10 の形状の組:

| 開始  | 終了  | Db の型               | Fixture                                       |
| ----- | ----- | --------------------- | --------------------------------------------- |
| `[`   | `]`   | `square`              | [fixture: block/db-shape-square]              |
| `(`   | `)`   | `round`               | [fixture: block/db-shape-round]               |
| `((`  | `))`  | `circle`              | [fixture: block/db-shape-circle]              |
| `(((` | `)))` | `doublecircle`        | [fixture: block/db-shape-doublecircle]        |
| `([`  | `])`  | `stadium`             | [fixture: block/db-shape-stadium]             |
| `[[`  | `]]`  | `subroutine`          | [fixture: block/db-shape-subroutine]          |
| `[(`  | `)]`  | `cylinder`            | [fixture: block/db-shape-cylinder]            |
| `{`   | `}`   | `diamond`             | [fixture: block/db-shape-diamond]             |
| `{{`  | `}}`  | `hexagon`             | [fixture: block/db-shape-hexagon]             |
| `>`   | `]`   | `rect_left_inv_arrow` | [fixture: block/db-shape-rect-left-inv-arrow] |
| `[/`  | `/]`  | `lean_right`          | [fixture: block/db-shape-lean-right]          |
| `[\`  | `\]`  | `lean_left`           | [fixture: block/db-shape-lean-left]           |
| `[/`  | `\]`  | `trapezoid`           | [fixture: block/db-shape-trapezoid]           |
| `[\`  | `/]`  | `inv_trapezoid`       | [fixture: block/db-shape-inv-trapezoid]       |

## 文字の置き換え

27. [db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) の
    `textReplacementOf(embedded.config)` は、ノード、ブロック矢印、
    複合ブロック、辺のラベルの変換形の内容を読んだ後だけに適用し、 id、クラス、
    スタイル、方向には適用しません。
    [fixture: block/config-security-level-other-all]
