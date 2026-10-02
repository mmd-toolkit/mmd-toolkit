# mmd/class/no-ignored-text

英語版: [no-ignored-text.md](./no-ignored-text.md)

規則 [mmd/class/no-ignored-text](../../rules/class/no-ignored-text.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`ClassIgnoredText` のうち、
`value` が `%%` で始まる、
`ClassDirectionStatement` の `textAfter` を除いたもの。
`direction` の前のテキストは `ClassDirectionStatement` の `textBefore`、
値の後のテキストはその `textAfter`、
メソッドの行の部分は `ClassMethod` の `textBefore` と `textAfter` である。
値の始まりを見ることは値を読むことで、テキストの字句解析のやり直しではない。
方向の値の後の `%%` で始まるテキストは、`Root.comments` のコメントではなく、
`textAfter` である。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `class/lex-direction-line-class-statement`
- `class/lex-direction-line-value-then-text`
- `class/lex-direction-line-in-label`
- `class/lex-direction-line-in-note`
- `class/spec-class-diagram-b33b8303`
- `class/lex-member-method-line-separator-before`
- `class/lex-member-method-line-separator-after`
- `class/db-direction-then-comment`
