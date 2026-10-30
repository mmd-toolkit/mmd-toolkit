# @mmd-toolkit/sequence-no-invalid-json

英語版: [sequence-no-invalid-json.md](./sequence-no-invalid-json.md)

テキストが JSON のオブジェクトでない `links` か `properties` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

`links` と `properties` は、
JSON オブジェクトから参加者にリンクやプロパティを与える。
テキストが JSON でないと、mermaid.js はエラーなしに文を受理するが、何もしない。
末尾のカンマだけでも、リンクやプロパティが失われる。

## 規則の詳細

この規則は、シーケンス図（`sequenceDiagram`）に当てる。
テキストが JSON オブジェクトでない `links` や `properties` の文を、
空のものも報告する。
ほかの JSON の値も報告する。
文字列と配列は位置をキーにした項目を与え、数、`true`、`false`、
`null` は何も与えない。

mermaid.js は `#` でテキストを終える。
URL のフラグメントを持つものなど、
`#` とその後を含めてはじめて JSON オブジェクトになるテキストは報告しない。
正しい JSON であり、
`#` で切るのは mermaid.js の不具合に見えるからである（参考を見る）。
`#` の前が正しい JSON オブジェクトの場合も、
mermaid.js がそれを読むので報告しない。

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
- [no-invalid-init-directive](./no-invalid-init-directive.ja.md)

## 参考

- [Issue #5419: `sequenceDiagram` のテキストの `#`](https://github.com/mermaid-js/mermaid/issues/5419)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-invalid-json.ts)
- [テストのソース](../../tests/rules/sequence-no-invalid-json.test.ts)

<!-- end auto-generated rule resources -->
