# @mmd-toolkit/sequence-no-invalid-json

英語版: [sequence-no-invalid-json.md](./sequence-no-invalid-json.md)

テキストが JSON のオブジェクトでない `links` か `properties` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`links` と `properties` は、
`links A: {"Dashboard": "https://x.example"}` のように、
JSON のオブジェクトから、参加者にリンクやプロパティを与える。
テキストが JSON でないと、
mermaid.js は文を受理し、エラーなしに何もしない。
最後の項目の後にカンマを付けただけでも、そうなる。

## 規則の詳細

この規則は、テキストが JSON のオブジェクトでない
`links` か `properties` の文を報告する。
対象の図種は `sequence` である。

JSON でないテキストは何も変えない。
`links A: {"Dashboard": "https://x.example",}` は参加者にリンクを与えず、
`properties A: {"class": "internal",}` はプロパティを与えない。
オブジェクトでない JSON も報告する。
mermaid.js は、それを書き手の意図どおりには読まないからである。
文字列は、その各文字を位置をキーにして与え、
`links A: "ab"` はリンク `0` と `1` を与える。
配列は各要素を位置をキーにして与え、
数、`true`、`false`、`null` は何も与えない。

`#` は文のテキストを終わらせる。
そのため、`links A: {"Docs": "https://x.example/#top"}` のように
フラグメントのある URL は、JSON でないテキストを残し、その文を報告する。

`links A:` や `properties A:` のようにテキストのない文も報告する。
その文は参加者に何も与えない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-invalid-json: error
sequenceDiagram
  participant A
  links A: {"Dashboard": "https://x.example",}
```

```mmd
%% eslint @mmd-toolkit/sequence-no-invalid-json: error
sequenceDiagram
  participant A
  properties A: {"class": "internal",}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-invalid-json: error
sequenceDiagram
  participant A
  links A: {"Dashboard": "https://x.example"}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [sequence-no-link-without-separator](./sequence-no-link-without-separator.ja.md)
- [no-ignored-init-directive](./no-ignored-init-directive.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-invalid-json.ts)
- [テストのソース](../../tests/rules/sequence-no-invalid-json.test.ts)

<!-- end auto-generated rule resources -->
