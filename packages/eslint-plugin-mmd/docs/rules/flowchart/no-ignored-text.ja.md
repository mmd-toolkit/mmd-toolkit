# mmd/flowchart/no-ignored-text

英語版: [no-ignored-text.md](./no-ignored-text.md)

方向の行にあって、mermaid.js が読まないテキストを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡 この規則は、[エディタの提案](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)で手で直せる。

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

方向の値の後のテキストは、最初の `%%` より前に、
`%%` がなければテキスト全体に、`;` と空白しかないときは報告しない。
`direction TB %% vertical`、`direction TB; %% vertical`、
`direction TB;` がそうである。
書き手は `%%` から後をコメントのつもりで書き、`;` は文を終えるだけなので、
テキストを捨てる mermaid.js は、書き手のつもりのものを何も捨てていない。
`%%` より前にほかのテキストがあれば報告する。
`direction TB; x %% c` では、`x` が捨てられる。

`A-->B; direction TB` のように、報告するテキストがどれも、
方向と `;` で区切られているときは、
規則は、そこで行を分ける書き換えを提案する。
その `;` の後の空白を、改行とその行の字下げにし、`;` は残す。
書き手が `;` の後で行を分けたのと同じになる。
残した `;` が区切りにならず、テキストの一部になってしまうときは、
`;` も空白と一緒に消す。
行の終わりまでがテキストになる `accTitle: What to buy` の後や、
行の残りが捨てられる方向の値の後がそうである。
mermaid.js は、そのテキストを文として読み、方向を方向の文として読む。
この提案は、分けたテキストが文として読まれ、
行の上で捨てられるものがなくなるときだけ出す。
そうでないときは、提案を出さない。
`;` がなければ、テキストが文のつもりだったかが分からない。
`A[Set direction LR]-->B` のようなラベルの中では、改行がラベルを変える。
分けた後は、テキストが文として読まれるので、
2 つ目の `accTitle` のように、その中身をほかの規則が報告することがある。

この規則に**反する**コードの例:

```mmd
%% eslint mmd/flowchart/no-ignored-text: error
flowchart LR
  subgraph S
    A-->B; direction TB
  end
```

```mmd
%% eslint mmd/flowchart/no-ignored-text: error
flowchart LR
  A-->B direction TB
```

```mmd
%% eslint mmd/flowchart/no-ignored-text: error
flowchart LR
  subgraph S
    direction TB; A-->B
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint mmd/flowchart/no-ignored-text: error
flowchart LR
  subgraph S
    A --> B
    direction TB
  end
```

```mmd
%% eslint mmd/flowchart/no-ignored-text: error
flowchart LR
  subgraph S
    direction TB %% vertical
    A --> B
  end
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../../src/rules/flowchart/no-ignored-text.ts)
- [テストのソース](../../../tests/rules/flowchart/no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
