# @mmd-toolkit/agentflow-no-ignored-text

英語版: [agentflow-no-ignored-text.md](./agentflow-no-ignored-text.md)

mermaid.js が方向の行から捨てる文字を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`direction` と方向の値を持つ行は、全体で 1 つの方向の文である。
mermaid.js は、その行の残りを、そこに書いた文も含めてエラーなしに捨てる。

## 規則の詳細

この規則は、方向の行で `direction` より前か方向の値より後にある文字を報告する。
対象の図種は `agentflow` である。

同じ行の、方向の前か後に書いたリンクは、`;` で区切っても消える。
flow の中では、
`A-->B; direction TB` と `direction TB; A-->B` は flow に方向 `TB` を与え、
頂点もリンクも作らないが、同じ 2 つの文を 2 行に書くと、
`A` から `B` へのリンクを作る。
最上位でも、`A-->B direction TB` は頂点もリンクも作らない。
`direction LR trailing` のように方向の後にある文字も、同じように捨てられる。

行は、方向の文のつもりでなくても方向の文になる。
`A[Set direction LR]-->B` のように `direction` と方向の値が行にあると、
その行は方向の文で、頂点もリンクも作らない。
この規則はそれも報告する。

次の 2 種類の文字は報告しない。

- `direction TB;` のように、`;` と空白だけの文字。
  `;` は文を終えるだけである。
- `direction TB %% vertical` や `direction TB; %% vertical` のように、
  方向の値の後で `%%` の前に `;` と空白しかない文字。
  書き手は `%%` から行の終わりまでをコメントのつもりで書いている。

mermaid.js はどちらも捨てるが、
どちらも書き手が文として読まれるつもりで書いたものを持たない。
`%%` の前のほかの文字は報告する。
`direction TB; x %% c` では、文のつもりの `x` が捨てられる。

方向の文は 1 行に単独で書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-ignored-text: error
agentflow-beta TB
  flow F
    A --> B; direction LR
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-ignored-text: error
agentflow-beta TB
  flow F
    direction LR
    A --> B
  end
```

## オプション

この規則にはオプションがない。

## 背景

[字句解析](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L165-L169) は、
`direction` と方向の値を持つ行全体を 1 つの方向の文として読む。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-ignored-text.ts)
- [テストのソース](../../tests/rules/agentflow-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
