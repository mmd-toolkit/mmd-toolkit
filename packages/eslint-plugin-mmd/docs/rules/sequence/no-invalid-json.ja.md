# mmd/sequence/no-invalid-json

英語版: [no-invalid-json.md](./no-invalid-json.md)

テキストが JSON のオブジェクトでない `links` か `properties` の文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`links` と `properties` は、
`links A: {"Dashboard": "https://x.example"}` のように、
JSON のオブジェクトから、参加者にリンクやプロパティを与える。
テキストが JSON でないと、
mermaid.js は文を受理し、エラーなしに何もしない。
最後の項目の後にカンマがあるだけで当たる。

## 規則の詳細

この規則は、テキストが JSON のオブジェクトでない
`links` か `properties` の文を報告する。
`sequence` に当たる。

JSON でないテキストは何も変えない。
`links A: {"Dashboard": "https://x.example",}` は参加者にリンクを与えず、
`properties A: {"class": "internal",}` はプロパティを与えない。
オブジェクトでない JSON も報告する。
mermaid.js は、それを書き手の意図どおりには読まないからである。
文字列は、その各文字を位置をキーにして与え、
`links A: "ab"` はリンク `0` と `1` を与える。
配列は各要素を位置をキーにして与え、数は何も与えない。

`links A:` や `properties A:` のようにテキストのない文も報告する。
その文は参加者に何も与えない。

この規則に**反する**コードの例:

```mmd
sequenceDiagram
  participant A
  links A: {"Dashboard": "https://x.example",}
```

```mmd
sequenceDiagram
  participant A
  properties A: {"class": "internal",}
```

この規則に**従う**コードの例:

```mmd
sequenceDiagram
  participant A
  links A: {"Dashboard": "https://x.example"}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-link-without-separator](./no-link-without-separator.ja.md)
- [no-ignored-init-directive](../no-ignored-init-directive.ja.md)

## 実装のための覚え書き

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

### 木での現れ方

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
[no-ignored-init-directive](../no-ignored-init-directive.ja.md) と同じく、
図の字句解析のやり直しではない。

### fixture

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
