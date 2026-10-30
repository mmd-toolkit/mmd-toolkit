# @mmd-toolkit/requirement-no-empty-description-block

英語版:
[requirement-no-empty-description-block.md](./requirement-no-empty-description-block.md)

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

この規則は、要求図（`requirementDiagram`）に当てる。
何も持たないか空白だけを持つ `accDescr` のブロックを報告する。
ディレクティブだけを持つブロックも報告するが、mermaid.js はその設定を適用する。

コメントだけを持つブロックは、何もしない意図をコメントが示すので報告しない。
コメント行とディレクティブを持つブロックも報告しない。

ヘッダーの後や本体の `}` の後の空のブロックも報告する。
requirement や element の中では、行に単独のもの、同じ行のフィールドの前のもの、
値が文字列かキーワードのフィールドの後のもの、閉じる `}` の前のものを報告する。
隣り合うブロックは、それぞれ報告する。

`accTitle:` のテキストの中の `accDescr {}` は、
そのテキストの一部なので報告しない。
方向の後のものは、
[requirement-no-ignored-text](./requirement-no-ignored-text.ja.md) が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  accDescr {}
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  requirement r {
    accDescr {}
    id: 1
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  accDescr { y }
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  accDescr {
    %% old description
  }
  requirement r {
    id: 1
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [er-no-empty-description-block](./er-no-empty-description-block.ja.md)
- [requirement-no-duplicate-description](./requirement-no-duplicate-description.ja.md)
- [requirement-no-ignored-text](./requirement-no-ignored-text.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/requirement-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/requirement-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
