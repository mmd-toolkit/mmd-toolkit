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

## 実装のための覚え書き

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

### 木での現れ方

`textBefore` が null でないか、
`textAfter` が null でなく、その `value` が `%%` で始まらない、
`FlowchartDirectionStatement`。
2 つはどちらも `FlowchartIgnoredText` のノードで、そのテキストの範囲を持つ。
値の先頭を見ることは値を読むことで、テキストの字句解析のやり直しではない。

### fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `flowchart/lex-direction-line-after-semicolon`
- `flowchart/lex-direction-line-swallows-edge`
- `flowchart/lex-direction-line-then-semicolon-statement`
- `flowchart/lex-direction-line-own-line-after-link`
- `flowchart/lex-direction-line-percent-after-value`
- `flowchart/lex-direction-line-text-after-value`
- `flowchart/lex-direction-line-in-label-with-link`
