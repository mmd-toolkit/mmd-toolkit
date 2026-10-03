# mmd/class/no-undef

英語版: [no-undef.md](./no-undef.md)

規則 [mmd/class/no-undef](../../rules/class/no-undef.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

次の名前のうち、図のどのクラスの id でもないもの。
`ClassStyleStatement` の `id`、
`ClassCssClassStatement` の `idList` の `value` を `,` ごとに分けた各名前、
`ClassLinkStatement`、`ClassCallbackStatement`、
`ClassNoteStatement` の `class`。
クラスの id は、すべての `ClassDeclaration` の `name`、
すべての `ClassMemberStatement` の `class`、
すべての `ClassRelationStatement` の `from` と `to` から取り、
`ClassNamespaceStatement` の `body` の中からも取る。

2 つの段階が木の外に出て、Db の導き方を繰り返す
（tests パッケージの docs/db-from-tree/class.md の Building the summary from the tree）。
クラスの id は、クラス名のどの欄（`prefix`、`name`、`generic`）でもなく、
接頭を含めたクラス名のテキストの、最初の `~` より前の部分である。
また、`A ()-- B` のように片方の端だけが lollipop の関係は、
その端のクラスをインターフェースにするので、もう片方の端のクラスだけを足す。
`cssClass` の一覧を `,` で分けることは、値を読むことである。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `class/db-style-undefined-class`
- `class/db-css-class-undefined-class`
- `class/db-click-undefined-class`
- `class/db-link-undefined-class`
- `class/db-callback-undefined-class`
- `class/db-note-for-undefined-class`
- `class/db-css-class-list-space`
- `class/db-style-spaces`
- `class/spec-class-diagram-bd134b38`
- `class/gram-member-statement`
- `class/db-namespace-nested`
- `class/docs-syntax-class-diagram-bc06236e`
- `flowchart/db-style-unknown-vertex`
