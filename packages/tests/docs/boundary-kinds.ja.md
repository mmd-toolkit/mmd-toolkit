# テキストの中の場所の種類

英語版: [boundary-kinds.md](./boundary-kinds.md)

この文書は、生成テストと差分テストがテキストの中の場所に何かを入れるとき、
`@mmd-toolkit/tests` がその場所に与える種類と、
種類で場所を選ぶ方法を説明します。

## なぜ種類か

構文の実装は、種類を持つ場所で失敗します。
キーワードと名前の間のディレクティブ、`title` の行末の `;`、
長い語の真ん中の文字などです。
すべての場所にテキストを入れるテストは、同じ種類の場所で同じ確認を繰り返します。
100 か所に 1 か所に入れるテストは、種類を偶然で覆います。
種類ごとに数か所を取るテストは、fixture にあるすべての種類を覆います。
fixture にない種類は、足す種類です。

## 2 種類の場所

**境目**は、トークン、コメント、ディレクティブが始まるか終わるオフセットです。
種類は 4 つの部分でできています。

- `before` と `after` は、そこで終わる要素と、そこで始まる要素です。
  ないときは `-` です。
  トークンは、型と、`Keyword` と `Punctuator` のときは値
  （小文字にして 14 文字で切ったもの）で表します。
  `Keyword:subgraph`、`Punctuator:-->`、`Identifier` のようになります。
  ディレクティブは `Directive:closed` か `Directive:open` です。
  行の規則が区切りとして無視する `;` は、
  型が `IgnoredSemicolon` のトークンです。
  コメントは `Comment:` と印（`%%`、`#`、`%`）です。
  コメント行が図のコメントを切った後のテキストは印を持たず、
  `Comment:fragment` です。
- `position` は、そのオフセットが行のどこにあるかで、
  `start`（テキストの始め）、`lineStart`、`lineEnd`、`mid` のどれかです。
- `statement` は、その行の文です。
  行の最初のトークンで、キーワードなら小文字にした値（`box`）、
  それ以外なら型です。行にトークンがなければ `-` です。
  どの位置でも種類の一部です。
  たとえば、`box`、`title`、`subgraph` の終わりに来るものを、
  ほかの場所の同じトークンと区別し、
  そうした行の途中に来るものも区別するためです。

**トークンの中の場所**は、2 文字以上のトークン
（ディレクティブは除く。コメントはトークンではない）の、
最初の文字の後、真ん中（始めから長さの半分の文字、切り捨て）、
最後の文字の前です。
場所はオフセットごとに 1 つです。
2 文字のトークンには `after first` だけ、
3 文字のトークンには `after first` と `before last`、
真ん中は 4 文字からです。
文字はコードポイントで数えるので、
場所がサロゲートペアの半分ずつの間に来ることはありません。
種類は 3 つの部分でできています。
`token` は上のとおりに表したトークン、
`position` は `after first`、`middle`、`before last`、
`statement` は、境目と同じく、その場所の行の文です。

## 関数

3 つとも `@mmd-toolkit/tests` から export されます。

- `findBoundaries(source)` は、1 つのテキストの境目を返します。
  各境目に `offset`、種類の 4 つの部分（`before`、`position`、`statement`、
  `after`）、`atEnd`（後ろに空白しかないか）があります。
- `findInnerPlaces(source)` は、トークンの中の場所を返します。
  各場所に `offset` と、種類の 3 つの部分
  （`token`、`position`、`statement`）があります。
- `selectByKey(lists, perKey, keyOf)` は、場所の列（テキストごとに 1 つ）から、
  鍵ごとに `perKey` か所まで取ります。
  各列の、その鍵の最初の場所を列の順に取り、
  `perKey` に届くまで次の場所を取ります。
  `keyOf` が場所の鍵を作ります。鍵から場所への Map を返します。

関数は種類の部分を返し、使う側が、使う部分をつないで鍵にします。
種類をどれだけ細かくするかは、この鍵が決めます。
境目の 4 つの部分をすべて使う鍵がいちばん細かい鍵です。
たとえば整形のテストは、文を行末でだけ鍵に入れます。

`source` は、構文解析したテキストの構造を、ただの値で表したものです。
このパッケージが parser に依存しないためです。
`text`、`tokens`（`type`、`value`、`range`）、`comments`（`mark`、`range`）、
`directives`（`closed`、`range`）です。
`@mmd-toolkit/parser` の `Root` が持っています。

```js
import { findBoundaries, loadFixtures, selectByKey } from "@mmd-toolkit/tests"

/** The key that names the statement everywhere. */
function finestKey(boundary) {
  const { before, position, statement, after } = boundary
  return `${before} | ${position} | ${statement} | ${after}`
}

// `parse` is the parser under test.
async function boundariesByKey(parse) {
  const lists = []
  for (const fixture of await loadFixtures("flowchart")) {
    const { tokens, comments, directives } = parse(fixture.input)
    const source = { text: fixture.input, tokens, comments, directives }
    lists.push(
      findBoundaries(source).map((boundary) => ({ ...boundary, fixture })),
    )
  }
  return selectByKey(lists, 2, finestKey)
}
```

parser が拒否するテキストには読むトークンがないので、
その列は空にするか、省きます。
