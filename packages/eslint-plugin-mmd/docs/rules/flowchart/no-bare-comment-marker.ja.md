# mmd/flowchart/no-bare-comment-marker

英語版: [no-bare-comment-marker.md](./no-bare-comment-marker.md)

`%%` だけの行を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

コメントは、行で前に空白とディレクティブしかない `%%` のうち、
その後の、ディレクティブの一部でない最初の文字が、
`{` でも行終端子の一部でもないものである。
`%%` だけの行はコメントではない。
こうした行は、複数の行をまとめてコメントアウトしたときにその中の空行から生じ、
また、コメントである `%% ` の行末の空白を取り除いたときにも生じる。

## 規則の詳細

この規則は、`%%` だけの行を報告する。
対象の図種は `flowchart-v2`、`flowchart-elk`、`swimlane` である。

flowchart は、そうした行の `%%` を id が `%%` の頂点として読むので、
書き手が書いていない箱が図に現れる。
`%%%%{init: {}}%%` のように、
行の中で `%%` の後にディレクティブが続いても変わらない。

行をまたぐテキストの中でも同じことが起きる。
頂点、リンク、subgraph のラベル（文字列のラベルも）、説明のブロック、
`accTitle:` や `accDescr:` の次の行に書いたタイトルや説明、
`click` のツールチップのような文字列である。
mermaid.js は、ほかのコメント行をテキストから取り除くが、
`%%` だけの行はテキストに残す。
`A[a`、改行、`%%`、改行、`b]` のラベルは `a`、改行、`%%`、改行、`b` で、
箱に `%%` という行が出る。
頂点のデータブロックの中では、その行はデータの一部になる。
データがその行をテキストとして読む所、
つまり `label: "…"` のような引用符の文字列の中や、
字下げしたテキストのブロックの中では、
テキストに残る。
それ以外の所では、`A@{`、`%%`、`shape: circle`、`}` のように、
その行がデータを壊し、mermaid.js は図を拒否する。
mmd-toolkit のパーサーは、データを読まずにそれを受理する
（
[`embedded-data-opaque`](../../../../spec/docs/known-divergences/embedded-data-opaque.ja.md)
）。
関数を呼ぶ `click` の文では、その行は関数の名前か引数に入る。
`click A` の後、名前の前にある `%%` だけの行は、名前として読まれ、
後ろの名前は新しい頂点になる。
`click A call f(1,` の後では、mermaid.js が関数に渡す引数にその行が残る。
この規則は、これらの行も報告する。

閉じていない説明のブロックの中の行は報告しない。
mermaid.js は説明を空にし、
[no-unclosed-description-block](./no-unclosed-description-block.ja.md)
がそのブロックを報告する。

`%%` の後に空白がある行はコメントで、報告しない。
行末の空白はコードブロックの中に残らないので、下の例には載せない。
`%%{"x"}` のように、`%%{` で始まりディレクティブでない行も、コメントではない。
mermaid.js は、それを形 `{}` の頂点 `%%` として読む。
この規則はそれを報告しない。
行をコメントアウトするときに、書き手が書く行ではないからである。

頂点 `%%` が文の全部のとき、規則は `%%` を消す書き換えを提案する。
行に空白しか残らなければ、行ごと消す。
行にあるディレクティブは残る。
`%%` がリンクの端のときは、提案を出さない。
消すと、`A -->` や `--> B` が端を失って mermaid.js に拒否されるか、
次の行に頂点があれば、リンクがその頂点に向かうからである。
行をまたぐテキストの中では、`%%` だけの行を消す書き換えを提案する。
ただし、その行にディレクティブか、その始まりか終わりがあるときは提案しない。
行を消すと、ディレクティブも消えるからである。
どの提案も、その報告が示す 1 行だけを消す。
mermaid.js は、その行から頂点を作らず、
テキストやデータブロックはその行を持たなくなる。
`%%` だけの行を複数持つ値では、行ごとに報告と提案がある。
そうした行が壊していたデータブロックは、それらをすべて消すと読まれる。
`%%` だけの行にこの提案を出すのは、その値（テキスト、名前、データブロック）が、
`%%` だけの行と空白のほかのものを持つときだけである。
その行が値のすべてのとき、消して何が得られるかは、場所によって違う。
値がテキストを持つ次の行である `accTitle:`、`accDescr:`、`click A` の後では、
mermaid.js はさらに後の行を値として取る。
`accTitle:`、`%%`、`A` なら、タイトルは `A` になり、頂点 `A` はなくなる。
`click A` の後では、何も続かないときのように、テキストを拒否することもある。
データブロックや、`--` と `-->` の間のリンクのテキストは空になり、
mermaid.js はそれを拒否する。
説明のブロックは空になり、
[no-empty-description-block](./no-empty-description-block.ja.md) が報告する。
ラベル、文字列、subgraph の題、ツールチップ、関数の引数では、
その行をコメントにしたときと同じ値になる。
規則は、場所の一覧を持たず、どの場所にも 1 つの条件を使う。
`%%` の後に空白を足す書き換えは提案しない。
行末の空白を消すエディタが、それを元に戻すからである。

この規則に**反する**コードの例:

```mmd
%% eslint mmd/flowchart/no-bare-comment-marker: error
flowchart LR
  A --> B
  %% C-->D
  %%
  %% D-->E
```

```mmd
%% eslint mmd/flowchart/no-bare-comment-marker: error
flowchart LR
  A[a
%%
b]
```

```mmd
%% eslint mmd/flowchart/no-bare-comment-marker: error
flowchart LR
  A@{
    %%
    shape: circle
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint mmd/flowchart/no-bare-comment-marker: error
flowchart LR
  A --> B
  %% C-->D

  %% D-->E
```

```mmd
%% eslint mmd/flowchart/no-bare-comment-marker: error
flowchart LR
  A@{
    shape: circle
  }
```

## オプション

この規則にはオプションがない。

## 背景

mermaid.js が `%%` だけの行をテキストに残すのは、
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)
がコメント行を取り除く式が、`%%` の後に 1 文字以上を求めるからである。
2026-10-02 の時点で、これを変えるプルリクエスト
[#7008](https://github.com/mermaid-js/mermaid/pull/7008)
（「fix: empty comments」）は、
open でマージされていない。
それが参照する issue
[#6505](https://github.com/mermaid-js/mermaid/issues/6505) は、
open で、ラベルは「Type: Bug / Error」と「Status: Triage」である。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../../src/rules/flowchart/no-bare-comment-marker.ts)
- [テストのソース](../../../tests/rules/flowchart/no-bare-comment-marker.test.ts)

<!-- end auto-generated rule resources -->
