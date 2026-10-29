# @mmd-toolkit/venn-no-duplicate-title

英語版: [venn-no-duplicate-title.md](./venn-no-duplicate-title.md)

別のタイトルを置き換えるタイトルを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`title` 文は図全体のタイトルを設定する。
後の `title` は、エラーなしにそれを置き換える。
`title Audience` と `title Coverage` の後では、図は `Coverage` だけを示す。

## 規則の詳細

この規則は、最初のものより後の `title` 文のうち、
その前のタイトルと違うタイトルを設定するものを、それぞれ報告する。
対象の図種は `venn` である。

キーワードは大文字小文字を問わずに読まれる。
タイトルは、最初の空白またはタブの後の行の残りを、
その引用符とさらに続く空白とともに取る。
`title Audience` の後の文 `title "Audience"` は、
引用符の付いたタイトル `"Audience"` を設定し、報告される。
行の終わりにある `title` は、次の行をタイトルとして取る。

図がすでに持つタイトルを設定する文は報告しない。
`title First` と `title Second` の後の 3 つ目の `title First` は、
`Second` を置き換えるので報告する。
タイトルは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
タイトルを読む前にほかの文字に変えるので、それだけが違う 2 つのタイトルは、
mermaid.js には 1 つで、この規則には 2 つのことがある。

`title` 文は、フロントマターのタイトルもエラーなしに置き換える。
フロントマターに `title: Front` があるとき、`title T` はタイトル `T` を与える。
この規則はこれを報告しない。

`title` 文は 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-title: error
venn-beta
title Audience
title Coverage
set A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-title: error
venn-beta
title Audience
set A
```

## オプション

この規則にはオプションがない。

## 背景

[`title` 文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/parser/venn.jison#L72-L72)
は、次の関数を呼ぶ。
[`setDiagramTitle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L28-L30)
は、前に設定されたタイトルを置き換える。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/venn-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
