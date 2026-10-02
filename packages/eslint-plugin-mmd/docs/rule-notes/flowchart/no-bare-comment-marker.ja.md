# mmd/flowchart/no-bare-comment-marker

英語版: [no-bare-comment-marker.md](./no-bare-comment-marker.md)

規則 [mmd/flowchart/no-bare-comment-marker](../../rules/flowchart/no-bare-comment-marker.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

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

## fixture

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
