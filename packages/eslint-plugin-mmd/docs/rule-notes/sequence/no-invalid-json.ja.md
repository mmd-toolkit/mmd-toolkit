# mmd/sequence/no-invalid-json

英語版: [no-invalid-json.md](./no-invalid-json.md)

規則
[mmd/sequence/no-invalid-json](../../rules/sequence/no-invalid-json.ja.md)
を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

テキストが JSON のオブジェクトでない、
`SequenceLinksStatement` か `SequencePropertiesStatement`。
つまり、`text` が null か、`text` の `value` が null か、
その `SequenceLiteral` の `value` を JSON として解析したとき、
JSON でないか、オブジェクトでない JSON であるもの。
木は JSON を読まない。
規則が値を解析し、mermaid.js は、
エンティティをその代わりの文字にした変換後の形でテキストを解析する
（仕様の diagrams/sequence.md の Links and properties）。
これは、パーサーが書かれたまま持つデータを読むことで、
[no-ignored-init-directive](../../rules/no-ignored-init-directive.ja.md)
と同じく、
図の字句解析のやり直しではない。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `sequence/db-links-trailing-comma`
- `sequence/db-properties-trailing-comma`
- `sequence/db-links-object`
- `sequence/db-links-not-json`
- `sequence/db-properties-not-json`
- `sequence/db-links-string-value`
- `sequence/db-links-array-value`
- `sequence/db-links-number-value`
- `sequence/db-links-empty`
- `sequence/db-properties-empty`
