# @mmd-toolkit/class-no-duplicate-title

英語版: [class-no-duplicate-title.md](./class-no-duplicate-title.md)

規則
[@mmd-toolkit/class-no-duplicate-title](../rules/class-no-duplicate-title.ja.md)
を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`ClassAccTitleStatement` のうち、
ソースでそれより前に、別の `ClassAccTitleStatement` があるもの。
文は `ClassDiagram` の `body` に、範囲の順にある。
規則は、最初のもの以外をすべて報告する。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `class/db-acc-title-replaces`
- `class/db-acc-title-spaces`
- `class/db-acc-title-line-empty-takes-next-lines`
- `class/lex-acc-title-at-end`
