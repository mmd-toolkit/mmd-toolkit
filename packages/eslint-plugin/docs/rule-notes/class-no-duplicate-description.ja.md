# @mmd-toolkit/class-no-duplicate-description

英語版: [class-no-duplicate-description.md](./class-no-duplicate-description.md)

規則
[@mmd-toolkit/class-no-duplicate-description](../rules/class-no-duplicate-description.ja.md)
を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

説明を設定する文のうち、ソースでそれより前に、説明を設定する別の文があるもの。
説明を設定する文は、`ClassAccDescrStatement` と、
`value` が null でない `ClassAccDescrBlockStatement` である。
文は `ClassDiagram` の `body` に、範囲の順にある。
規則は、最初のもの以外をすべて報告する。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `class/db-acc-descr-replaces`
- `class/db-acc-descr-line-replaces-block`
- `class/db-acc-title-spaces`
