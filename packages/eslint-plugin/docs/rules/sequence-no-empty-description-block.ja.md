# @mmd-toolkit/sequence-no-empty-description-block

英語版:
[sequence-no-empty-description-block.md](./sequence-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`accDescr` のブロックは、図に説明を与えるために書く。
何も持たないか空白だけを持つと、mermaid.js はエラーなしに受理するが、
効果はない。

## 規則の詳細

この規則は、シーケンス図（`sequenceDiagram`）に当てる。
何も持たないか、空白だけを持つ閉じた `accDescr` のブロックを報告する。
ディレクティブはテキストに数えないので、
ディレクティブだけを持つブロックも報告するが、mermaid.js はその設定を適用する。

コメント行を持つブロックは、ディレクティブを持っていても報告しない。
コメントで、後で埋める説明を示せるからである。

文と同じ行でその前か最後の部分の後にある空のブロック、
ヘッダーの行でその後にある空のブロック、ボックスの中の空のブロックも報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr {}
```

```mmd
%% eslint @mmd-toolkit/sequence-no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { }
```

```mmd
%% eslint @mmd-toolkit/sequence-no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr {
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/sequence-no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr {
    %% c
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md)
- [sequence-no-unclosed-description-block](./sequence-no-unclosed-description-block.ja.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/sequence-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
