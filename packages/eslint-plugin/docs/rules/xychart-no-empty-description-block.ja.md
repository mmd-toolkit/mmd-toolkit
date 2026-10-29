# @mmd-toolkit/xychart-no-empty-description-block

英語版:
[xychart-no-empty-description-block.md](./xychart-no-empty-description-block.md)

説明を持たない説明のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

説明のブロックは、チャートに説明を与えるために書く。
ブロックが何も持たないか空白しか持たないとき、
mermaid.js はそれを受理して何もしないので、ブロックは効かない。

## 規則の詳細

この規則は、閉じた `accDescr` のブロックのうち、何も持たないか、空白だけか、
改行だけを持つものを報告する。
対象の図種は `xychart` である。
ブロックの中の指令はテキストでない。
指令しか持たないブロックも報告し、mermaid.js はその設定をなお適用する。
キーワードは大文字小文字を問わず読む。

説明は、ブロックの前のままである。
`accDescr: a` の後のブロック `accDescr {}` は、説明を `a` のままにし、
ほかのブロックの後のブロックも同じである。

コメントしか持たないブロックは報告しない。
説明の行をコメントにした書き手は、ブロックが何もしないことを意図しており、
mermaid.js もそう読む。
後で埋めるために残すブロックは、`accDescr {`、`%% TODO`、`}` のように、
中にコメントを書く。
そうしたブロックは報告しない。

空のブロックは、`title T accDescr {}` や `accDescr {} title T` のように、
ほかの文の行の、その前にも後にも書ける。
そこでも説明を設定せず、規則は同じように報告する。
閉じていないブロックは、何も持たなくても、
[xychart-no-unclosed-description-block](./xychart-no-unclosed-description-block.ja.md)
が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-empty-description-block: error
xychart
  accDescr {}
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-empty-description-block: error
xychart
  accDescr { }
  line [1, 2]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-empty-description-block: error
xychart
  accDescr {
    Monthly sales
  }
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-empty-description-block: error
xychart
  accDescr {
    %% TODO
  }
  line [1, 2]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [timeline-no-empty-description-block](./timeline-no-empty-description-block.ja.md)
- [xychart-no-duplicate-description](./xychart-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/xychart-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/xychart-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
