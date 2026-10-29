# @mmd-toolkit/xychart-no-empty-description-block

英語版:
[xychart-no-empty-description-block.md](./xychart-no-empty-description-block.md)

説明を持たない説明のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`accDescr` のブロックは、図に説明を与えるために書く。
何も持たないか空白だけを持つと、mermaid.js はエラーなしに受理し、
説明を変えない。

## 規則の詳細

この規則は、XY チャート（`xychart`、`xychart-beta`）に当てる。
閉じた `accDescr` のブロックのうち、何も持たないか、
改行を含む空白だけを持つものを報告する。
ディレクティブだけを持つブロックも報告するが、mermaid.js はその設定を適用する。
キーワードは大文字小文字を問わず読む。

コメントだけを持つブロックは、何もしない意図をコメントが示すので報告しない。

同じ行のほかの文の前や後の空のブロックも報告する。
閉じていないブロックは、空のものも含めて、
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
