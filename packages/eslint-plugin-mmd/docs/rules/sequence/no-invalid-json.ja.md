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
%% eslint mmd/sequence/no-invalid-json: error
sequenceDiagram
  participant A
  links A: {"Dashboard": "https://x.example",}
```

```mmd
%% eslint mmd/sequence/no-invalid-json: error
sequenceDiagram
  participant A
  properties A: {"class": "internal",}
```

この規則に**従う**コードの例:

```mmd
%% eslint mmd/sequence/no-invalid-json: error
sequenceDiagram
  participant A
  links A: {"Dashboard": "https://x.example"}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-link-without-separator](./no-link-without-separator.ja.md)
- [no-ignored-init-directive](../no-ignored-init-directive.ja.md)
