# @mmd-toolkit/sequence-no-link-without-separator

英語版:
[sequence-no-link-without-separator.md](./sequence-no-link-without-separator.md)

規則
[@mmd-toolkit/sequence-no-link-without-separator](../rules/sequence-no-link-without-separator.ja.md)
を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

テキストが `@` を持たない `SequenceLinkStatement`。
つまり、`text` が null か、`text` の `value` が null か、
その `SequenceLiteral` の `value` が `@` を持たないもの。
値の中の `@` を探すことは値を読むことで、テキストの字句解析のやり直しではない。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `sequence/db-link-without-at-url`
- `sequence/db-link-without-at`
- `sequence/db-link-label`
- `sequence/db-link-empty`
