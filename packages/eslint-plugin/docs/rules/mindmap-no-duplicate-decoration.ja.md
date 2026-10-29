# @mmd-toolkit/mindmap-no-duplicate-decoration

英語版:
[mindmap-no-duplicate-decoration.md](./mindmap-no-duplicate-decoration.md)

1 つのノードへの、2 つ目の icon の行と class の行を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

icon の行 `::icon(…)` と class の行 `:::…` は、
その前に最後に書いたノードを飾る。
ノードは icon の行と class の行を 1 つずつ取る。
mermaid.js はそれぞれの最後のものをエラーなしに残し、前のものは失われる。
class の行を 2 つ書くのは、たいてい 2 つのクラスのためで、
それは `:::urgent large` のように 1 行に書く。

## 規則の詳細

この規則は、マインドマップ（`mindmap`）に当てる。
同じノードの同じ種類の現在の値を別の値に置き換える icon の行か class
の行を報告する。
icon と class の行は別々に調べ、別のノードの行とは比べない。

各行は、字下げや、間の空行、コメント行、ディレクティブにかかわらず、
その前に最後に書いたノードのものである。
`::icon(` は大文字小文字を問わず読む。
現在の値の繰り返しは報告しない。

`:::` の後と `::icon(` の中のテキストは書いたとおりに比べるので、
`:::urgent large` の後の `:::large urgent` は、同じクラスを与えても報告する。
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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/mindmap-no-duplicate-decoration.ts)
- [テストのソース](../../tests/rules/mindmap-no-duplicate-decoration.test.ts)

<!-- end auto-generated rule resources -->
