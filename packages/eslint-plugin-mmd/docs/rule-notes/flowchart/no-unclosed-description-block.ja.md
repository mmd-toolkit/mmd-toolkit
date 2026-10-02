# mmd/flowchart/no-unclosed-description-block

英語版: [no-unclosed-description-block.md](./no-unclosed-description-block.md)

規則 [mmd/flowchart/no-unclosed-description-block](../../rules/flowchart/no-unclosed-description-block.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`closed` が false の `FlowchartAccDescrBlockStatement`。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `flowchart/lex-acc-descr-block-unclosed`
- `flowchart/db-acc-descr-unclosed-replaces`
- `flowchart/db-acc-descr-block-alone`
