# @mmd-toolkit/er-no-empty-description-block

英語版: [er-no-empty-description-block.md](./er-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`accDescr` のブロックは、図に説明を与えるために書く。
何も持たないか空白だけを持つと、mermaid.js はエラーなしに受理し、
説明を変えない。

## 規則の詳細

この規則は、ER 図（`erDiagram`）に当てる。
何も持たないか空白だけを持つ `accDescr` のブロックを報告する。
ディレクティブだけを持つブロックも報告するが、mermaid.js はその設定を適用する。

コメントだけを持つブロックは、何もしない意図をコメントが示すので報告しない。
コメント行とディレクティブを持つブロックも報告しない。

同じ行のほかの文の後や、ヘッダーの後の空のブロックも報告する。
`accTitle:` のテキストの中の `accDescr {}` は、
そのテキストの一部なので報告しない。
方向の後のものは、[er-no-ignored-text](./er-no-ignored-text.ja.md) が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-empty-description-block: error
erDiagram
  A
  accDescr {}
```

```mmd
%% eslint @mmd-toolkit/er-no-empty-description-block: error
erDiagram
  A
  accDescr { }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-empty-description-block: error
erDiagram
  A
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/er-no-empty-description-block: error
erDiagram
  A
  accDescr {
    %% c
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md)
- [er-no-unclosed-description-block](./er-no-unclosed-description-block.ja.md)
- [er-no-duplicate-description](./er-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/er-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/er-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
