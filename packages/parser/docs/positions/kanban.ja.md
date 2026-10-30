# kanban の位置

英語版: [kanban.md](./kanban.md)

[positions.md](../positions.ja.md) を補う範囲を定めます。
ノードは [`ast/kanban.md`](../../../spec/docs/ast/kanban.ja.md)、
トークンは [tokens/kanban.md](../tokens/kanban.ja.md) にあります。

## 範囲

### KanbanDiagram

図はヘッダーのキーワードから最後の図のトークンまでです。
空の盤はヘッダーだけを覆います。
末尾のコメント、ディレクティブ、空白は範囲の外です。
[fixture: kanban/header-only-lf] [fixture: kanban/db-empty-board-comment]
[fixture: kanban/db-empty-board-whitespace]
[fixture: kanban/header-header-space-directive-only]

### KanbanNode

ノードは本文か形の開始から始まります。
列は最後のカードまで、子がなければ自身の最後の装飾、データブロック、形、
本文のうち最後のものまでです。
カードの children は常に空で、自身の最後の構成要素までです。
範囲は連続し、兄弟同士は重なりません。
先頭の字下げと無関係な後続 trivia は範囲外で、本文末尾の空白は内側です。
カードの後の深いカードも、列の下の兄弟になります。
[fixture: kanban/db-name-trailing-space] [fixture: kanban/db-name-no-id]
[fixture: kanban/db-name-space-before-shape] [fixture: kanban/db-metadata-all]
[fixture: kanban/db-metadata-two-items]
[fixture: kanban/gram-decoration-then-child] [fixture: kanban/db-indent-deeper]
[fixture: kanban/gram-nesting-item-decoration-before-deeper-item]
[fixture: kanban/db-indent-shallower-last]
[fixture: kanban/gram-shallower-then-decoration]

### KanbanShape、KanbanIconStatement、KanbanClassStatement

形は開始から終わりまでです。
icon の文は `::icon(` から `)` までです。
class の文は `:::` から class 本文までで、末尾の空白を含み、
行区間の区切りの前で終わります。 [fixture: kanban/db-shape-square]
[fixture: kanban/db-shape-mismatched] [fixture: kanban/db-decoration-icon-item]
[fixture: kanban/lex-icon-multiline] [fixture: kanban/lex-class-trailing-spaces]
[fixture: kanban/lex-class-ls-lf]

### KanbanLabel と KanbanLiteral

テキストの項目の範囲を覆い、トークンが保つ空白を含みます。
文字列と markdown のラベルは区切りを範囲に含め、値からは除きます。
値は書かれた行終端、属性の引用符、実体参照を保ちます。
範囲の中のディレクティブとコメント領域は、共通の規則に従い値から除きます。
[fixture: kanban/db-spaces-label] [fixture: kanban/lex-icon-spaces]
[fixture: kanban/lex-class-trailing-spaces] [fixture: kanban/db-markdown-label]
[fixture: kanban/lex-string-crlf]
[fixture: kanban/db-grid-html-attribute-item-label-quoted]
[fixture: kanban/db-grid-entity-item-label-quoted]
[fixture: kanban/db-grid-directive-item-label-markdown]
[fixture: kanban/lex-comment-quoted-line]

### KanbanDataBlock

各ブロックは `@{` から `}` までです。
値は区切りを除く内部全体の書かれたテキストで、空白を含みます。
空のブロックと隣り合うブロックも別々の範囲を保ちます。
範囲の中のディレクティブ、コメント領域、無視するセミコロンは値から除きます。
[fixture: kanban/db-metadata-empty] [fixture: kanban/db-metadata-adjacent-empty]
[fixture: kanban/db-metadata-spaces] [fixture: kanban/db-metadata-multiline]
[fixture: kanban/db-metadata-directive]
[fixture: kanban/db-metadata-comment-line]
[fixture: kanban/lex-metadata-style-rule]
