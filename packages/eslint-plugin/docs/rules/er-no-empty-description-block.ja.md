# @mmd-toolkit/er-no-empty-description-block

英語版: [er-no-empty-description-block.md](./er-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

説明のブロックは、図に説明を与えるために書く。
ブロックが何も持たないか、空白だけを持つとき、
mermaid.js はそれを受理して何もしないので、ブロックは何の効果も持たない。

## 規則の詳細

この規則は、何も持たないか空白だけを持つ `accDescr` のブロックを報告する。
対象の図種は `er` である。
ブロックの中のディレクティブはテキストではない。
ディレクティブだけを持つブロックも報告し、
mermaid.js はその設定をそのまま適用する。

説明は、ブロックの前の値のままになる。
`accDescr { a }` の後のブロック `accDescr {}` は、説明を `a` のまま残す。

コメントだけを持つブロックは報告しない。
説明の行をコメントにする書き手は、ブロックが何もしないことを意図しており、
mermaid.js もそう読む。
コメント行を持つブロックは、ほかにディレクティブを持っていても報告しない。
mermaid.js は、そのディレクティブの設定を適用する。
後で埋めるために残すブロックは、`accDescr {`、`%% TODO`、`}` のように、
中にコメントを書く。
そうしたブロックは報告しない。

空のブロックは、`A ||--o{ B : x accDescr {}` のように同じ行の文の後や、
`erDiagram accDescr {}` のようにヘッダーの後に置くこともできる。
そこでも説明を設定せず、規則は同じように報告する。

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
