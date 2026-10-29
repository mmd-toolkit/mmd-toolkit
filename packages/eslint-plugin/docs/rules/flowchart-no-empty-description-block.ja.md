# @mmd-toolkit/flowchart-no-empty-description-block

英語版:
[flowchart-no-empty-description-block.md](./flowchart-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`accDescr` のブロックは、図に説明を与えるために書く。
何も持たないか空白だけを持つと、mermaid.js はエラーなしに受理するが、
そこから説明を取らない。

## 規則の詳細

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
何も持たないか、空白だけを持つ閉じた `accDescr` のブロックを報告する。
ディレクティブはテキストに数えないので、
ディレクティブだけを持つブロックも報告するが、mermaid.js はその設定を適用する。

コメント行を持つブロックは、ディレクティブを持っていても報告しない。
コメントで、後で埋める説明を示せるからである。

同じ行の文やヘッダーの後にある空のブロックも報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {}
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr { }
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {
    %% c
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md)
- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/flowchart-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
