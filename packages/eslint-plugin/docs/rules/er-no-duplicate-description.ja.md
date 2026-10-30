# @mmd-toolkit/er-no-duplicate-description

英語版: [er-no-duplicate-description.md](./er-no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
別の `accDescr` の文が説明を設定すると、
mermaid.js はエラーなしに後の説明を使い、前の説明は失われる。

## 規則の詳細

この規則は、ER 図（`erDiagram`）に当てる。
現在の説明を別の値に置き換える `accDescr:` の文か説明のブロックを報告する。
現在の説明を繰り返す文は、2 つの形を混ぜても報告しない。

説明は、両端の空白と各改行の後の空白を除いて比べるので、
ブロックの字下げと空行は数えない。
LF、CRLF、CR の改行は、LF として比べる。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。

行にテキストのない `accDescr:` も説明を設定するので数える。
その文は、テキストを持つ次の行を取る。
テキストの終わりでは、mermaid.js がエラーを出す。
subgraph の中の文も、図全体の説明を設定するので、数える。
説明を持たないブロックは、コメントだけかディレクティブだけのものも含めて、
数えない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr: second
  A
```

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr { second }
  A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accTitle: first
  accDescr: second
  A
```

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr {
    first
  }
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)
- [er-no-duplicate-title](./er-no-duplicate-title.ja.md)
- [er-no-empty-description-block](./er-no-empty-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/er-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/er-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
