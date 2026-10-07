# @mmd-toolkit/sequence-no-duplicate-description

英語版:
[sequence-no-duplicate-description.md](./sequence-no-duplicate-description.md)

規則
[@mmd-toolkit/sequence-no-duplicate-description](../rules/sequence-no-duplicate-description.ja.md)
を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

説明を設定する文のうち、ソースでそれより前に、説明を設定する別の文があるもの。
説明を設定する文は、
`SequenceAccDescrStatement`（`value` が null のものも含む）と、
`closed` が true で、
`value` が null でない `SequenceAccDescrBlockStatement` である。
文は、`SequenceDiagram` と、その中のすべてのブロックとセクションの
`body` から、範囲の順に取る。
規則は、最初のもの以外をすべて報告する。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `sequence/db-acc-descr-replaces`
- `sequence/db-acc-descr-line-replaces-block`
- `sequence/db-acc-descr-outer-replaces-loop`
- `sequence/db-acc-descr-line-alone`
- `sequence/db-acc-descr-empty-block-keeps`
- `sequence/db-acc-descr-line-empty-takes-next-lines`
