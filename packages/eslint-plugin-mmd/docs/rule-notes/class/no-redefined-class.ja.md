# mmd/class/no-redefined-class

英語版: [no-redefined-class.md](./no-redefined-class.md)

規則 [mmd/class/no-redefined-class](../../rules/class/no-redefined-class.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`label` を持つ 2 つの `ClassDeclaration` で、クラスの id が同じで、
ラベルの `value` が違うもの。
規則は後のものを報告する。
クラスの id は、クラス名のどの欄（`prefix`、`name`、`generic`）でもない。
接頭を含めたクラス名のテキストの、最初の `~` より前の部分で、
規則は Db の導き方を繰り返すことになる
（仕様の diagrams/class.md の Building the summary from the tree）。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `class/db-class-label-redefined`
- `class/db-class-label-kept-without-label`
- `class/db-class-members-added`
