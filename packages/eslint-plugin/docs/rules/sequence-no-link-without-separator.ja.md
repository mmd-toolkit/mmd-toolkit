# @mmd-toolkit/sequence-no-link-without-separator

英語版:
[sequence-no-link-without-separator.md](./sequence-no-link-without-separator.md)

ラベルと URL の間に `@` がない `link` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

`link` の文は、ラベル、`@`、URL で参加者にリンクを与える。
`@` がなくても mermaid.js はエラーなしに文を受理するが、
書いたものと違うラベルと URL を設定する。

## 規則の詳細

この規則は、シーケンス図（`sequenceDiagram`）に当てる。
テキストに `@` のない `link` の文を、テキストのないものも報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-link-without-separator: error
sequenceDiagram
  participant A
  link A: Dashboard https://x.example
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-link-without-separator: error
sequenceDiagram
  link A: Dash @ https://x.example
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [sequence-no-invalid-json](./sequence-no-invalid-json.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-link-without-separator.ts)
- [テストのソース](../../tests/rules/sequence-no-link-without-separator.test.ts)

<!-- end auto-generated rule resources -->
