# @mmd-toolkit/requirement-no-empty-description-block

英語版:
[requirement-no-empty-description-block.md](./requirement-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

説明のブロックは、図に説明を与えるために書く。
ブロックが何も持たないか、空白しか持たないとき、
mermaid.js はそれを受理して何もしないので、ブロックは効果を持たない。

## 規則の詳細

この規則は、何も持たないか空白しか持たない `accDescr` のブロックを報告する。
対象の図種は `requirement` である。
ブロックの中のディレクティブはテキストでない。
ディレクティブしか持たないブロックも報告し、
mermaid.js はその設定をなお適用する。

説明は、ブロックの前のままである。
`accDescr: a` の後のブロック `accDescr {}` は、説明を `a` のままにする。

コメントしか持たないブロックは報告しない。
説明の行をコメントにした書き手は、ブロックが何もしないことを意図しており、
mermaid.js もそう読む。
コメント行を持つブロックは、ほかにディレクティブを持つときも報告しない。
mermaid.js はその設定を適用する。
後で埋めるために残すブロックは、`accDescr {`、`%% TODO`、`}` のように、
中にコメントを書く。
そうしたブロックは報告しない。

空のブロックは、`requirementDiagram accDescr {}` のようにヘッダーの後にも、
本体の `}` の後の同じ行にも書ける。
requirement や element の本体の中でも、mermaid.js は空のブロックを読まない。
行にひとりのもの、`accDescr {} id: 1` のように同じ行のフィールドの前のもの、
値が文字列かキーワードのフィールドの後のもの（`risk: high accDescr {}`）、
`}` の前のものである。
規則は、そうしたブロックをどれも同じように報告し、
2 つ並べば 2 つ報告する。
`accTitle:` のテキストの中では、`accDescr {}` はそのテキストの一部で、
規則は報告しない。
方向の後のものは
[requirement-no-ignored-text](./requirement-no-ignored-text.ja.md)
が報告する。

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
