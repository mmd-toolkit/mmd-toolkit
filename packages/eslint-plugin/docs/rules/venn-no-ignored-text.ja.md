# @mmd-toolkit/venn-no-ignored-text

英語版: [venn-no-ignored-text.md](./venn-no-ignored-text.md)

後のコメントが取り除く文字を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`%%` のコメントは、空白で隔てられていないとき、
すぐ前の文字を取り除くことがある。
`set A:%% size to fill in` では、コロンがコメントとともに消え、 mermaid.js は、
既定の大きさ 10 の `set A` を、エラーなしに読む。

## 規則の詳細

この規則は、コメントがこのように取り除く文字を、それぞれ報告する。
対象の図種は `venn` である。
その文字は、`style A fill:red,%% more later` のコンマのように文の後にあるか、
それだけで 1 行にあるか、ヘッダー `venn-beta` の後にある。

コメントがその前の文字を取るのは、
mermaid.js がその文字で新しい語か記号を読み始めるところだけである。
`set AB%% c` では、名前 `AB` がコメントより前に読まれ、何も取り除かれない。
`set A%% c` は名前 `A` を失って受理されないので、この規則はそれを見ない。
`%%` の前の空白も同じように取り除かれるが、何も変えず、報告しない。
ラベルや引用符の付いた名前の中の `%%` は、コメントではなく文字である。

`set A %% size to fill in` のように、
コメントとの間に空白を残してその文字を取り除くか、
コメントより前に文を書き終える。
`set A:20 %% size` は A に大きさ 20 を与える。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-ignored-text: error
venn-beta
set A:%% size to fill in
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-ignored-text: error
venn-beta
set A:20 %% size
```

## オプション

この規則にはオプションがない。

## 背景

[字句解析のコメントの規則](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/parser/venn.jison#L8-L8) は、
`%%` の前の `}` 以外のどの文字もコメントの一部として読む。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-ignored-text.ts)
- [テストのソース](../../tests/rules/venn-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
