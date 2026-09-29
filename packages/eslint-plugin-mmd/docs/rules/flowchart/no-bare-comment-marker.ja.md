# mmd/flowchart/no-bare-comment-marker

英語版: [no-bare-comment-marker.md](./no-bare-comment-marker.md)

`%%` だけの行を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

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

行をまたぐラベルの中でも同じことが起き、ラベルが文字列でも同じである。
mermaid.js は、ほかのコメント行をラベルから取り除くが、
`%%` だけの行はラベルに残す。
`A[a`、改行、`%%`、改行、`b]` のラベルは `a`、改行、`%%`、改行、`b` で、
箱に `%%` という行が出る。
この規則はその行も報告する。

`%%` の後に空白がある行はコメントで、報告しない。
行末の空白はコードブロックの中に残らないので、下の例には載せない。

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

この規則に**従う**コードの例:

```mmd
flowchart LR
  A --> B
  %% C-->D

  %% D-->E
```

## オプション

この規則にはオプションがない。

## 実装のための覚え書き

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

### 木での現れ方

規則は、`Root.comments` のコメントがない行で、次のどちらかを報告する。

- `value` が `%%` の `Identifier` のトークンで、
  ほかのトークンがない行にあるもの。
  flowchart はそれを頂点の id として読む。
- `FlowchartLabel` のトークン（`RawText` のトークン、
  ラベルが文字列なら `String` のトークン）の `value` の中の行で、
  2 つの行終端子に挟まれ、両端の空白を除くと `%%` であるもの。
  トークンの値の中の行を読むことは値を読むことで、
  テキストの字句解析のやり直しではない。

後ろに空白があれば、その `%%` はコメントで、規則は報告しない。
ラベルの中でも同じで、コメントについての条件がそれを除く。
`%%%%{init: {}}%%` のように行にあるディレクティブはトークンではないので、
これを変えない。

### fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `common/comment-bare`
- `common/comment-bare-with-space`
- `flowchart/comment-percent-before-directive`
- `common/comment-bare-line-in-label`
- `common/comment-bare-line-in-string-label`
- `common/comment-percent-space-line-in-label`
- `common/comment-bare-between-comment-lines`
- `common/comment-bare-between-comment-lines-empty`
- `common/comment-bare-between-comment-lines-space`
