# mmd/class/no-unclosed-backquote

英語版: [no-unclosed-backquote.md](./no-unclosed-backquote.md)

規則 [mmd/class/no-unclosed-backquote](../../rules/class/no-unclosed-backquote.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`name` が、`closed` が偽の `StringLiteral` である `ClassName`。
``class ` `` のようにバッククォート 1 つだけの名前も、閉じていない。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `class/lex-backquote-unclosed-takes-lines`
- `class/lex-backquote-unclosed`
- `class/lex-backquote-unclosed-alone`
- `class/docs-syntax-class-diagram-01f18827`
