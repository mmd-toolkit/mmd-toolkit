# mmd/sequence/no-create-destroy

英語版: [no-create-destroy.md](./no-create-destroy.md)

規則
[mmd/sequence/no-create-destroy](../../rules/sequence/no-create-destroy.ja.md)
を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`created` が true の `SequenceDestroyStatement`。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `sequence/gram-create-destroy`
- `sequence/db-create-destroy-then-destroy`
- `sequence/db-create-participant-before-message`
