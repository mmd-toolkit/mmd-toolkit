# mmd/flowchart/no-ignored-text

英語版: [no-ignored-text.md](./no-ignored-text.md)

方向の行にあって、mermaid.js が読まないテキストを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`direction` の文は、それだけで 1 行に書く。
行にほかのテキストもあると、mermaid.js は行全体を方向の文として読み、
残りをエラーなしに捨てる。

## 規則の詳細

この規則は、方向の行で、
`direction` の前か、方向の値の後にあるテキストを報告する。
`flowchart-v2`、`flowchart-elk`、`swimlane` に当たる。

同じ行で方向の前か後に書いたリンクは、`;` で区切っていても消える。
subgraph の中の `A-->B; direction TB` と `direction TB; A-->B` は、
subgraph に方向 `TB` を与え、頂点もリンクも作らない。
同じ 2 つの文を 2 行に書けば、`A` から `B` へのリンクができる。
トップレベルの `A-->B direction TB` も、頂点もリンクも作らない。
`direction LR trailing` のように方向の後に書いたテキストも、
同じように捨てられる。

方向の文のつもりでなくても、行は方向の文になることがある。
`A[Set direction LR]-->B` のように `direction` と方向の値が行に並ぶと、
その行は方向の文になり、頂点もリンクも作らない。
この規則はそれも報告する。

`direction TB %% vertical` のように、
方向の後にあって `%%` で始まるテキストは報告しない。
それはコメントのつもりで書いたもので、
mermaid.js は書き手の意図どおりにそれを捨てる。

この規則に**反する**コードの例:

```mmd
flowchart LR
  subgraph S
    A-->B; direction TB
  end
```

```mmd
flowchart LR
  A-->B direction TB
```

```mmd
flowchart LR
  subgraph S
    direction TB; A-->B
  end
```

この規則に**従う**コードの例:

```mmd
flowchart LR
  subgraph S
    A --> B
    direction TB
  end
```

```mmd
flowchart LR
  subgraph S
    direction TB %% vertical
    A --> B
  end
```

## オプション

この規則にはオプションがない。
