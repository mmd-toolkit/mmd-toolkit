# 木から kanban の Db を組み立てる

英語版: [kanban.md](./kanban.md)

`src/db-from-tree/kanban.ts` は
[ast/kanban.md](../../../spec/docs/ast/kanban.ja.md) の木について、
[db-summaries.md の kanban](../db-summaries.ja.md#kanban) と
[embedded-data.md](../embedded-data.ja.md#datablockeffects) に従い、
次の手順を実装します。
`tests/db-from-tree-kanban.test.ts` は各行を手作りし、
引用した fixture の記録済み Db と、JSON 往復後も含めて比較します。
kanban のパーサーの記録済みの木はまだありません。

## 木から要約を組み立てる

1. **テキスト。** リテラルとラベルの範囲を変換した形で読み、
   書かれた値から無視されたセミコロンを特定します。
   CR と CRLF は LF、HTML 属性の引用符は単一引用符、
   エンティティはプレースホルダーになります。
   範囲からディレクティブ、コメント領域、無視するセミコロン、
   文字列と Markdown 文字列の区切りを除き、内部と末尾の空白を保ちます。
   [fixture: kanban/lex-string-crlf] [fixture: kanban/lex-cr-quoted-value]
   [fixture: kanban/db-grid-html-attribute-item-label-quoted]
   [fixture: kanban/db-grid-entity-item-label-quoted]
   [fixture: kanban/lex-directive-at-value-start]
   [fixture: kanban/lex-comment-quoted-line]
   [fixture: kanban/lex-label-style-rule] [fixture: kanban/db-markdown-label]
   [fixture: kanban/db-label-multiline] [fixture: kanban/db-spaces-label]
   [fixture: kanban/db-grid-entity-item-id]
   [fixture: kanban/db-grid-entity-named-item-id]
   [fixture: kanban/db-grid-html-attribute-item-id]
   [fixture: kanban/db-grid-entity-item-icon]
   [fixture: kanban/db-grid-html-attribute-item-icon]
   [fixture: kanban/db-grid-crlf-item-icon]
   [fixture: kanban/db-grid-entity-item-label-markdown]
   [fixture: kanban/db-grid-directive-item-id]
   [fixture: kanban/db-grid-directive-item-icon]
   [fixture: kanban/lex-label-directive-line]
2. **名前。** id はノードのテキストがあればその変換形、なければ形のラベルです。
   label は形があればそのラベルの変換形、なければノードのテキストです。
   両方に文字の置き換えを適用し、形の前と末尾の空白を保ちます。
   [fixture: kanban/db-name-no-id] [fixture: kanban/db-name-two-words]
   [fixture: kanban/db-name-space-before-shape]
   [fixture: kanban/db-name-trailing-space]
   [fixture: kanban/config-security-level-other]
3. **所属。** 平坦な body をソース順に読み、字下げは保ちません。
   最初の行が列の字下げを定め、同じ字下げは `isGroup: true` の列を始めます。
   それ以外は `isGroup: false` の項目で、
   直前の列の id を `parentId` とします。最後の浅い行も項目です。
   [fixture: kanban/db-sections-items] [fixture: kanban/db-indent-unindented]
   [fixture: kanban/db-indent-tabs] [fixture: kanban/db-indent-deeper]
   [fixture: kanban/db-indent-shallower-last]
   [fixture: kanban/db-section-item-same-id]
4. **重複 id。** 列と項目の各定義を別々に保ちます。
   プロトタイプ名と大文字小文字の違う名前も通常の別の id です。
   列を宣言順に出力し、それぞれの直後に、
   `parentId` がその id と等しい全項目を書かれた順に出力します。
   [fixture: kanban/db-section-three-definitions]
   [fixture: kanban/db-item-three-definitions]
   [fixture: kanban/db-metadata-repeated-id]
   [fixture: kanban/db-object-prototype-ids] [fixture: kanban/db-name-case]
5. **データ接尾辞。** 空でない data リストごとに、
   埋め込みの効果をソース順に一つ消費します。
   id がサニタイズ前の変換した id と等しいことを確かめ、
   `set` をこの定義に一度適用します。
   隣接する空ブロックとブロック間のディレクティブも同じ扱いです。
   [fixture: kanban/db-metadata-all]
   [fixture: kanban/db-metadata-repeated-id]
   [fixture: kanban/db-metadata-adjacent-comma]
   [fixture: kanban/db-metadata-adjacent-empty]
   [fixture: kanban/db-metadata-two-items]
   [fixture: kanban/db-metadata-adjacent-directive]
6. **不透明な効果。** 効果の値をそのまま保ちます。
   ラベルの置換、テキスト変換、任意の priority、
   入れ子の非有限数、プロトタイプ名の own キーも含みます。
   falsy な値、未知のキー、空ブロック、
   受理された shape メタデータの空の効果も保ちます。
   [fixture: kanban/db-metadata-label-list]
   [fixture: kanban/db-metadata-label-false]
   [fixture: kanban/db-metadata-label-zero]
   [fixture: kanban/db-metadata-label-null]
   [fixture: kanban/db-metadata-label-empty-string]
   [fixture: kanban/db-metadata-ticket-number]
   [fixture: kanban/db-metadata-assigned-list]
   [fixture: kanban/db-metadata-icon-true]
   [fixture: kanban/db-metadata-priority-non-finite]
   [fixture: kanban/db-metadata-priority-nested-non-finite]
   [fixture: kanban/db-metadata-priority-own-prototype-key]
   [fixture: kanban/db-metadata-priority-list]
   [fixture: kanban/db-metadata-priority-null]
   [fixture: kanban/db-metadata-priority-zero]
   [fixture: kanban/db-metadata-empty]
   [fixture: kanban/db-metadata-unknown-key]
   [fixture: kanban/db-metadata-shape-lower]
   [fixture: kanban/db-metadata-quoted-newline]
7. **公開メタデータ。** 列と項目は `label` と `ticket` の効果を公開します。
   `assigned`、`priority`、`icon` は項目だけが公開します。
   記録済みの効果は、公開されない列の欄を既に除いています。
   [fixture: kanban/db-metadata-all]
   [fixture: kanban/db-metadata-section-label]
   [fixture: kanban/db-metadata-section-ticket]
   [fixture: kanban/db-metadata-section-assigned]
   [fixture: kanban/db-metadata-section-priority]
   [fixture: kanban/db-metadata-section-icon]
8. **装飾。** 接尾辞の効果の後、項目の最後のアイコン装飾が icon を置換します。
   文字の置き換えを適用します。
   列のアイコンとすべてのクラス装飾は欄を加えません。
   [fixture: kanban/db-decoration-icon-twice]
   [fixture: kanban/db-decoration-icon-section]
   [fixture: kanban/db-decoration-class-item]
   [fixture: kanban/db-decoration-class-twice]
9. **要約。** `{ nodes }` を返します。行のない盤面では空です。
   未定義の任意欄、固定の形、描画、設定、タイトルの欄を除きます。
   body のタイトルとアクセシビリティの綴りは通常のノードテキストです。
   [fixture: kanban/header-only-lf] [fixture: kanban/db-empty-board-comment]
   [fixture: kanban/db-shape-mismatched]
   [fixture: kanban/db-shape-square] [fixture: kanban/db-shape-round]
   [fixture: kanban/db-shape-circle] [fixture: kanban/db-shape-hexagon]
   [fixture: kanban/db-shape-cloud] [fixture: kanban/db-shape-bang]
   [fixture: kanban/db-shape-cloud-alt] [fixture: kanban/db-shape-bang-alt]
   [fixture: kanban/db-metadata-all]
   [fixture: kanban/header-after-frontmatter]
   [fixture: kanban/db-frontmatter-drawing-config]
   [fixture: kanban/db-title-not-statement]
   [fixture: kanban/db-acc-title-not-statement]
   [fixture: kanban/db-acc-descr-not-statement]
