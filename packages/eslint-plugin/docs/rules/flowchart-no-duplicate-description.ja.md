# @mmd-toolkit/flowchart-no-duplicate-description

英語版:
[flowchart-no-duplicate-description.md](./flowchart-no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡 [エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions) を選んで適用できる。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
mermaid.js はどの `accDescr` の文も受理し、説明を設定する文は、
それより前に設定した説明を黙って置き換える。
2 つ目の説明は、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものであり、整形したテキストを見ても、
どちらが効くかは分からない。

## 規則の詳細

この規則は、説明を設定する文のうち、最初のもの以外を、
前と違う説明を設定するときに報告する。
対象の図種は `flowchart-v2`、`flowchart-elk`、`swimlane` である。

`accDescr:` は説明を設定する。
テキストがなくても説明を設定する。
空行、コメント行、ディレクティブを飛ばして、テキストを持つ次の行を説明にし、
そうした行が後になければ、説明を空にする。
説明を持つ閉じたブロックも説明を設定する。
1 行の形とブロックの形を混ぜても、どちらが先でも、
後に書いたほうの説明が使われる。
subgraph の中の文も、図全体の説明を設定するので、数える。
mermaid.js は、その文の値を id としてその subgraph のメンバーにも加えるので、
その id の頂点や subgraph は、その subgraph に属する。

説明を持たないブロックと、説明を空にする閉じていないブロックは、数えない。
それらは、
[flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md) と、
[flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md) が報告する。

図がすでに持つ説明を設定する文は、どちらの形でも報告しない。
`accDescr: d` の後のブロック `accDescr { d }` は、何も失わない。
説明は、mermaid.js が持つとおりに、両端の空白と、
各改行の後の空白を除いて比べる。
そのため、ブロックの行の字下げと、その中の空行は数えない。
改行は、LF、CRLF、CR のどれも LF として読む。
そのため、CRLF で書いたブロックは、LF で書いたブロックと同じ説明を設定する。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。

報告ごとに、規則は 2 つの文のどちらかを消す書き換えを提案する。
報告した文か、その前で説明を設定する文である。
mermaid.js は、最後に残った説明を使う。
subgraph の中の文を消すと、そのメンバーも消える。
ただし、subgraph のほかの文が同じ id をメンバーにしていれば残る。
文の後の `;` は、文を区切るものなら残す。
`accDescr: style:#b;` や `accDescr { style:#b };` のように、
仕様の [`style` 行と `classDef` 行](../../../spec/docs/common.ja.md#style-行と-classdef-行) の決まりで mermaid.js が無視する `;` は、
文と一緒に消す。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  accDescr { first }
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  subgraph S
    A
    accDescr: inner
  end
  accDescr: outer
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  A
  accDescr: first
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  A
  accDescr: first
  accDescr {
    first
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)
- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md)
- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/flowchart-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
