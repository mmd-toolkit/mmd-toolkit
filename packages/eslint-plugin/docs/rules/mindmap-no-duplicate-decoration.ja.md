# @mmd-toolkit/mindmap-no-duplicate-decoration

英語版:
[mindmap-no-duplicate-decoration.md](./mindmap-no-duplicate-decoration.md)

1 つのノードへの、2 つ目の icon の行と class の行を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

icon の行 `::icon(…)` と class の行 `:::…` は、
その前に最後に書いたノードを飾る。
ノードは icon の行と class の行を 1 つずつ取る。
mermaid.js はそれぞれの最後のものをエラーなしに残し、前のものは失われる。
class の行を 2 つ書くのは、たいてい 2 つのクラスのためで、
それは `:::urgent large` のように 1 行に書く。

## 規則の詳細

この規則は、ノードの最初の icon の行より後の icon の行と、
最初の class の行より後の class の行を、
前と違う値を設定するときに報告する。
対象の図種は `mindmap` である。

`:::urgent` と `:::large` の後、ノードのクラスは `large` だけになり、
`::icon(fa fa-book)` と `::icon(fa fa-pen)` の後、icon は `fa fa-pen` になる。
2 つの種類は別々に数える。
1 つのノードの icon の行と class の行は報告せず、
`:::urgent`、`::icon(fa fa-book)`、`:::large` では `:::large` だけを報告する。
行は、字下げにかかわらず、空行、コメント行、ディレクティブを越えても、
その前に最後に書いたノードのものであり、`::icon(` は大文字小文字を問わず読む。
ノードの icon の行とその子の icon の行は 2 つのノードのもので、報告しない。

ノードがすでに持つ icon や class を設定する行は、報告しない。
`:::urgent` の後の 2 つ目の `:::urgent` は、何も失わない。
値は、mermaid.js が持つとおりに、書いたとおりに比べる。
`:::` の後の行の終わりまでのテキストと、`::icon(` の括弧の中のテキストである。
そのため、`:::urgent large` と `:::large urgent` は 2 つの値であり、
描いた図ではノードが同じ 2 つのクラスを持つが、2 つ目を報告する。
`:::urgent` と `:::large` の後の 3 つ目の `:::urgent` は、
`large` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/mindmap-no-duplicate-decoration: error
mindmap
  Plans
    Write
    :::urgent
    :::large
```

```mmd
%% eslint @mmd-toolkit/mindmap-no-duplicate-decoration: error
mindmap
  Plans
    Write
    ::icon(fa fa-book)
    ::icon(fa fa-pen)
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/mindmap-no-duplicate-decoration: error
mindmap
  Plans
    Write
    :::urgent large
```

```mmd
%% eslint @mmd-toolkit/mindmap-no-duplicate-decoration: error
mindmap
  Plans
    Write
    ::icon(fa fa-book)
    :::urgent
```

```mmd
%% eslint @mmd-toolkit/mindmap-no-duplicate-decoration: error
mindmap
  Plans
    Write
    :::urgent
    :::urgent
```

## オプション

この規則にはオプションがない。

## 背景

mermaid.js は、最後に加えたノードの icon や class を、
それまでの値を置き換えて設定する
（[`decorateNode`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L154-L167)）。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/mindmap-no-duplicate-decoration.ts)
- [テストのソース](../../tests/rules/mindmap-no-duplicate-decoration.test.ts)

<!-- end auto-generated rule resources -->
