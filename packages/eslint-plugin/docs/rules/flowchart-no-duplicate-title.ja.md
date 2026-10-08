# @mmd-toolkit/flowchart-no-duplicate-title

英語版: [flowchart-no-duplicate-title.md](./flowchart-no-duplicate-title.md)

タイトルをもう一度設定する `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

図のアクセシビリティ用のタイトル（`accTitle`）は 1 つである。
mermaid.js はどの `accTitle` の文も受理し、
それぞれの文は、それより前に設定したタイトルを黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものであり、
整形したテキストを見ても、どちらが効くかは分からない。

## 規則の詳細

この規則は、`accTitle` の文のうち、最初のもの以外をすべて報告する。
対象の図種は `flowchart-v2`、`flowchart-elk`、`swimlane` である。

`accTitle: first` と `accTitle: second` の後、タイトルは `second` になる。
テキストのない `accTitle:` もタイトルを設定する。
空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行をタイトルにし、
そうした行が後になければ、タイトルを空にする。
どちらでも、その前に書いたタイトルは失われる。
subgraph の中の文も、図全体のタイトルを設定するので、数える。
mermaid.js は、その文の値を id としてその subgraph のメンバーにも加えるので、
その id の頂点や subgraph は、その subgraph に属する。

報告ごとに、規則は 2 つの文のどちらかを消す書き換えを提案する。
報告した文か、その前の `accTitle` の文である。
mermaid.js は、最後に残ったタイトルを使う。
subgraph の中の文を消すと、そのメンバーも消える。
ただし、subgraph のほかの文が同じ id をメンバーにしていれば残る。
文の後の `;` は、文を区切るものなら残す。
`accTitle: style:#b;` のように、仕様の
[`style` 行と `classDef` 行](../../../spec/docs/common.ja.md#style-行と-classdef-行)
の決まりで mermaid.js が無視する `;` は、文と一緒に消す。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  accTitle: first
  accTitle: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  A
  accTitle: x
  accTitle:
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  subgraph S
    A
    accTitle: inner
  end
  accTitle: outer
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  A
  accTitle: first
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/flowchart-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
