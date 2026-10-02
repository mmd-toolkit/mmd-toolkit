# mmd/flowchart/no-ignored-text

英語版: [no-ignored-text.md](./no-ignored-text.md)

規則 [mmd/flowchart/no-ignored-text](../../rules/flowchart/no-ignored-text.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`textBefore` が null でないか、
`textAfter` が null でなく、その `value` が `%%` で始まらない、
`FlowchartDirectionStatement`。
2 つはどちらも `FlowchartIgnoredText` のノードで、そのテキストの範囲を持つ。
値の先頭を見ることは値を読むことで、テキストの字句解析のやり直しではない。
方向の値の後の `%%` で始まるテキストは、`Root.comments` のコメントではなく、
`textAfter` である。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `flowchart/lex-direction-line-after-semicolon`
- `flowchart/lex-direction-line-swallows-edge`
- `flowchart/lex-direction-line-then-semicolon-statement`
- `flowchart/lex-direction-line-own-line-after-link`
- `flowchart/lex-direction-line-percent-after-value`
- `flowchart/lex-direction-line-text-after-value`
- `flowchart/lex-direction-line-in-label-with-link`
