# mmd/flowchart/no-bare-comment-marker

英語版: [no-bare-comment-marker.md](./no-bare-comment-marker.md)

`%%` だけの行を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

💡 この規則は、[エディタの提案](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)で手で直せる。

<!-- end auto-generated rule notice -->

コメントは、`%%` の後に、その行に 1 文字以上が続くものである。
`%%` だけの行はコメントではない。
こうした行は、複数の行をまとめてコメントアウトしたときにその中の空行から生じ、
また、コメントである `%% ` の行末の空白を取り除いたときにも生じる。

## 規則の詳細

この規則は、`%%` だけの行を報告する。
`flowchart-v2`、`flowchart-elk`、`swimlane` に当たる。

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
この道具は、データを読まずにそれを受理する
（[`embedded-data-opaque`](../../../../spec/docs/known-divergences/embedded-data-opaque.ja.md)）。
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

mermaid.js がこうした行をテキストに残すのは、
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)
がコメント行を取り除く式が、`%%` の後に 1 文字以上を求めるからである。
2026-10-02 の時点で、これを変えるプルリクエスト
[#7008](https://github.com/mermaid-js/mermaid/pull/7008)
（「fix: empty comments」）は、
open でマージされていない。
それが参照する issue
[#6505](https://github.com/mermaid-js/mermaid/issues/6505) は、
open で、ラベルは「Type: Bug / Error」と「Status: Triage」である。

報告ごとに、規則は `%%` を消す書き換えを提案する。
行に空白しか残らなければ、行ごと消す。
行にあるディレクティブは残る。
行をまたぐテキストの中では、`%%` だけの行を消す書き換えを提案する。
ただし、その行にディレクティブか、その始まりか終わりがあるときは提案しない。
行を消すと、ディレクティブも消えるからである。
mermaid.js は、頂点 `%%` を作らず、
テキストやデータブロックに `%%` の行はなくなる。
その行が壊していたデータブロックは読まれる。
`%%` の後に空白を足す書き換えは提案しない。
行末の空白を消すエディタが、それを元に戻すからである。

この規則に**反する**コードの例:

```mmd
flowchart LR
  A --> B
  %% C-->D
  %%
  %% D-->E
```

```mmd
flowchart LR
  A[a
%%
b]
```

```mmd
flowchart LR
  A@{
    %%
    shape: circle
  }
```

この規則に**従う**コードの例:

```mmd
flowchart LR
  A --> B
  %% C-->D

  %% D-->E
```

```mmd
flowchart LR
  A@{
    shape: circle
  }
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../../src/rules/flowchart/no-bare-comment-marker.ts)
- [テストのソース](../../../tests/rules/flowchart/no-bare-comment-marker.test.ts)

<!-- end auto-generated rule resources -->
