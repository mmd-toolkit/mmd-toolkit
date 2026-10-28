# @mmd-toolkit/state-no-empty-description-block

英語版:
[state-no-empty-description-block.md](./state-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

説明のブロックは、図に説明を与えるために書く。
ブロックが何も持たないか、空白だけを持つとき、
mermaid.js はそれを受理して何もしないので、ブロックは何の効果も持たない。

## 規則の詳細

この規則は、何も持たないか空白だけを持つ、
閉じた `accDescr` のブロックを報告する。
対象の図種は `stateDiagram` である。
ブロックの中のディレクティブはテキストではない。
ディレクティブだけを持つブロックも報告し、
mermaid.js はその設定をそのまま適用する。

説明は、ブロックの前の値のままになる。
`accDescr: x` の後のブロック `accDescr {}` は説明を `x` のまま残し、
前に説明がなければ、説明は空のままである。
行で書いた空の説明は違う。
テキストを持つ行が後にない `accDescr:` は、説明を空のテキストにする。

コメントだけを持つブロックは報告しない。
説明の行をコメントにする書き手は、ブロックが何もしないことを意図しており、
mermaid.js もそう読む。
ブロックの前の説明が残る。
コメント行を持つブロックは、ほかにディレクティブを持っていても報告しない。
mermaid.js は、そのディレクティブの設定を適用する。
後で埋めるために残すブロックは、`accDescr {`、`%% TODO`、`}` のように、
中にコメントを書く。
そうしたブロックは報告しない。

空のブロックは、`A --> B accDescr {}` のように同じ行の文の後や、
`stateDiagram-v2 accDescr {}` のようにヘッダーの後に置くこともできる。
そこでも説明を設定せず、規則は同じように報告する。
後の行の本体の `{` の前にある空のブロックは、どの文にも属さない。
それは、 [state-no-ignored-text](./state-no-ignored-text.ja.md) が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-empty-description-block: error
stateDiagram-v2
  A --> B
  accDescr {}
```

```mmd
%% eslint @mmd-toolkit/state-no-empty-description-block: error
stateDiagram-v2
  A --> B
  accDescr {
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-empty-description-block: error
stateDiagram-v2
  A --> B
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/state-no-empty-description-block: error
stateDiagram-v2
  A --> B
  accDescr {
    %% c
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md)
- [state-no-unclosed-description-block](./state-no-unclosed-description-block.ja.md)
- [state-no-duplicate-description](./state-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/state-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/state-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
