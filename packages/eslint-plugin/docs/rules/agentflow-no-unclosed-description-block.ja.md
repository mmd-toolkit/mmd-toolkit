# @mmd-toolkit/agentflow-no-unclosed-description-block

英語版:
[agentflow-no-unclosed-description-block.md](./agentflow-no-unclosed-description-block.md)

`}` で閉じていない `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`accDescr {` のブロックはその `}` まで続く。
それがないと、mermaid.js は残りの文字をブロックとしてエラーなしに読み、
その後の文は消え、説明は空になる。

## 規則の詳細

この規則は、`}` で閉じていない `accDescr {` のブロックを報告する。
対象の図種は `agentflow` である。

ブロックの前に書いた説明は空の説明で置き換えられる。
ブロックの後の文はその文字になり、
`accDescr { x` の後の行 `B --> C` はリンクを作らない。
flow の中では、ブロックは flow の `end` も取り、
mermaid.js はその文字を受理しないので、この規則はそれを見ない。

この規則は、ほかのもののために書いた `}` が閉じるブロックも報告する。
説明のブロックはその `{` の後の最初の `}` で終わり、そこまでのほかの文字は、
`{` も含めてその文字である。
`A{y}` の形や `A@{ shape: task }` のデータブロックのように、
後の文が `{` とその `}` を持つと、その `}` がブロックを閉じ、
そこまでの行が説明になる。
`accDescr { first` の後の行 `B --> C`、`A{y}`、`D` は、説明 `first`、`B --> C`、
`A{y` と、頂点 `D` だけを与える。
この規則は、ブロックの `{` より後の行に `{` を持つブロックを報告する。
ただし、ブロックを閉じる `}` がその行に単独であるものは除く。
そうでなければブロックを閉じるのは、その `{` の後の最初の `}`、
つまり形やデータブロックの `}` である。
`accDescr { a { b }` のように `{` の行にある `}` と、行に単独である `}` は、
書いたとおりにブロックを閉じ、報告しない。
`}` は、その行で前に空白と指示子しかないとき、行に単独である。
`accDescr {` の後の `a {b }` のように、`{` を持ち、
後の行の自分の `}` で終わる説明も報告する。
この規則は、その `}` を形の `}` と見分けないからである。
これが、`recommended` の設定がこの規則を有効にしない理由である。

説明が終わるところでブロックを閉じる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  A --> B
  accDescr { x
  B --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  accDescr { first
  B --> C
  A{y}
  D
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  A --> B
  accDescr { x }
  B --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  accDescr {
    uses { here
  }
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-empty-description-block](./agentflow-no-empty-description-block.ja.md)
- [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.ja.md)

## 背景

[ブロックの字句解析](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L61-L63)
は `}` 以外のすべての文字をその文字として読み、最初の `}` でブロックを終える。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/agentflow-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
