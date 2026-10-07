# mmd/sequence/no-duplicate-title

英語版: [no-duplicate-title.md](./no-duplicate-title.md)

規則
[mmd/sequence/no-duplicate-title](../../rules/sequence/no-duplicate-title.ja.md)
を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

ソースでそれより前に別の `SequenceTitleStatement` がある
`SequenceTitleStatement` と、
それより前に別の `SequenceAccTitleStatement` がある
`SequenceAccTitleStatement`（`value` が null のものも含む）。
文は、`SequenceDiagram` と、その中のすべてのブロックとセクションの
`body` から、範囲の順に取る。
規則は、型ごとに、最初のもの以外をすべて報告する。

フロントマターのタイトルの後の `title` の文は報告しない。
報告するには、パーサーが書かれたまま持つフロントマターの YAML を、
規則が読まなければならないからである。
報告すべきかは、未決の問題である。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `sequence/db-title-replaces`
- `sequence/db-acc-title-replaces`
- `sequence/db-title-and-acc-title`
- `sequence/db-title-replaces-frontmatter`
- `sequence/db-title-legacy`
