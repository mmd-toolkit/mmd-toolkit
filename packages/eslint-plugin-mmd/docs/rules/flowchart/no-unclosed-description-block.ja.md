# mmd/flowchart/no-unclosed-description-block

英語版: [no-unclosed-description-block.md](./no-unclosed-description-block.md)

閉じる `}` のない `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js は、`}` のない説明のブロックを受理する。
`{` の後の最初の `}` で、それがなければテキストの終わりでブロックを閉じ、
そこまでの行をブロックのテキストとして読む。
`}` がなければ、ブロックの中身にかかわらず、説明は空になる。

## 規則の詳細

この規則は、`}` で閉じていない `accDescr {` のブロックを報告する。
対象の図種は `flowchart-v2`、`flowchart-elk`、`swimlane` である。

ブロックの前に書いた説明も、空のものに置き換わる。
ブロックの後の文は、ブロックのテキストになる。
`accDescr { x` の後の行 `B --> C` は、リンクを作らない。

規則は、ほかのもののために書いた `}` が閉じるブロックも報告する。
説明のブロックは、`{` の後の最初の `}` で終わり、
そこまでのほかの文字は、`{` も含めて、そのテキストである（仕様の
[アクセシビリティの値](../../../../spec/docs/diagrams/flowchart.ja.md#アクセシビリティの値)）。
形 `A{y}` やデータブロック `A@{ shape: rect }` のように、
後の文が `{` とその `}` を持つと、その `}` がブロックを閉じ、
そこまでの行が説明になる。
`accDescr { first` の後の行 `B --> C`、`A{y}`、`D` では、
説明は `first`、`B --> C`、`A{y` になり、頂点は `D` だけになる。
規則は、ブロックの `{` より後の行に、テキストの `{` があるブロックを報告する。
ただし、ブロックを閉じる `}` が行にひとりなら報告しない。
そのときブロックを閉じる `}` は、その `{` の後の最初の `}` で、
その行に書いた形やデータブロックのものである。
`B{` の後の `y}` のように、行をまたぐ形でも同じである。
`accDescr { a { b }` のように `{` の行にある `}` と、行にひとりの `}` は、
書いたとおりにブロックを閉じるので、報告しない。
`}` が行にひとりとは、その行でその前に空白とディレクティブしかないことで、
`};` や `} C` のように、後に何があってもよい。
行にひとりの `}` は、そうした `{` の後でも書き手のものである。
`accDescr {`、`uses { here`、`}` の説明は `uses { here` である。
`accDescr {` の後の `a {b }` のように、
`{` を持ち、後の行の自分の `}` で終わる説明も報告する。
規則はその `}` を形の `}` と見分けず、そうした説明はまれだからである。
同じ理由で、`}` が行にひとりの、行をまたぐ形は報告しない。
`accDescr { x`、`B{`、`y`、`}`、`C` は、説明が `x`、`B{`、`y` になり、
頂点 `B` はできないが、その `}` は書き手のものと見分けられない。

報告ごとに、規則はブロックを閉じる書き換えを提案する。

- `{` のある行の終わりで閉じる。
  その行で `{` の後にテキストがあり、後の行が文として読まれるときに出す。
  mermaid.js は、そのテキストをブロックのテキストとして読み、
  後の行を文として読む。
  `second line, more` のように文でない行が後にあると、結果は拒否されるので、
  この提案は出さない。
- テキストの終わりで閉じる。
  ブロックが閉じておらず、`{` の行より後の行にテキストがあるときに出す。
  mermaid.js は、`{` の後のテキストすべてを説明として読む。
  後の `}` が閉じるブロックには、最初の提案だけを出す。

`{` の後に何もないブロックには、提案を出さない。
そこで閉じると、空のブロックになるからである。
ディレクティブはテキストではないので、`{` の後にディレクティブしかなければ、
行の終わりで閉じる提案は出さない。
閉じていないディレクティブがあるブロックには、提案を出さない。
そのディレクティブから後を mermaid.js がどう読むかは、
ブロックをどこで閉じても、ディレクティブで決まるからである。
`accDescr { d }` の後の行 `more %%{init: {}` と `A --> B` からは、
A から B への辺ができず、
`%%{init: {}` の代わりに `%%{wrap` があると、
ディレクティブの直前でブロックを閉じても拒否される。
ブロックの前に説明があるときや、後の文が説明を設定するときは、
ブロックを閉じるとテキストが説明を 2 度設定することになり、
[no-duplicate-description](./no-duplicate-description.ja.md)
が後のほうを報告する。
`accDescr { x` と次の行の `accDescr { y }` を行の終わりで閉じると、
説明は `y` になる。

この規則に**反する**コードの例:

```mmd
%% eslint mmd/flowchart/no-unclosed-description-block: error
flowchart LR
  A
  accDescr { x
```

```mmd
%% eslint mmd/flowchart/no-unclosed-description-block: error
flowchart LR
  A --> B
  accDescr { x
  B --> C
```

この規則に**従う**コードの例:

```mmd
%% eslint mmd/flowchart/no-unclosed-description-block: error
flowchart LR
  A
  accDescr { y }
```

```mmd
%% eslint mmd/flowchart/no-unclosed-description-block: error
flowchart LR
  A --> B
  accDescr { x }
  B --> C
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-empty-description-block](./no-empty-description-block.ja.md)
- [no-duplicate-description](./no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../../src/rules/flowchart/no-unclosed-description-block.ts)
- [テストのソース](../../../tests/rules/flowchart/no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
