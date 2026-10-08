# @mmd-toolkit/sequence-no-unclosed-description-block

英語版:
[sequence-no-unclosed-description-block.md](./sequence-no-unclosed-description-block.md)

閉じる `}` のない `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、`}` のない説明のブロックを受理する。
`{` の後の最初の `}` で、それがなければテキストの終わりでブロックを閉じ、
そこまでの行をブロックのテキストとして読む。
`}` がなければ、ブロックの中身にかかわらず、説明は空になる。

## 規則の詳細

この規則は、`}` で閉じていない `accDescr {` のブロックを報告する。
対象の図種は `sequence` である。

ブロックの前に書いた説明も、空のものに置き換わる。
ブロックの後の文は、ブロックのテキストになる。
`accDescr { x` の後の行 `A ->> B: y` は、メッセージを作らない。

規則は、ほかのもののために書いた `}` が閉じるブロックも報告する。
説明のブロックは、`{` の後の最初の `}` で終わり、
そこまでのほかの文字は、`{` も含めて、そのテキストである（仕様の
[アクセシビリティの値](../../../spec/docs/diagrams/sequence.ja.md#アクセシビリティの値)）。
データブロック `participant A@{ "type": "actor" }`、
`links A: {"a": "https://x"}` の JSON、メッセージのテキストのように、
後の文が `{` とその `}` を持つと、その `}` がブロックを閉じ、
そこまでの行が説明になる。
`accDescr { first` の後の行 `links A: {"a": "https://x"}` と `A ->> B: x` では、
説明は `first` と `links A: {"a": "https://x"` になり、
リンクはできず、メッセージは `x` になる。
規則は、ブロックの `{` より後の行に、テキストの `{` があるブロックを報告する。
ただし、ブロックを閉じる `}` が行にひとりなら報告しない。
`accDescr { a { b }` のように `{` の行にある `}` と、行にひとりの `}` は、
書いたとおりにブロックを閉じるので、報告しない。
`}` が行にひとりとは、その行でその前に空白とディレクティブしかないことで、
`};` や `} A ->> B: x` のように、後に何があってもよい。
行にひとりの `}` は、そうした `{` の後でも書き手のものである。
`accDescr {`、`uses { here`、`}` の説明は `uses { here` である。
`accDescr {` の後の `a {b }` のように、
`{` を持ち、後の行の自分の `}` で終わる説明も報告する。
規則はその `}` をデータブロックの `}` と見分けず、
そうした説明はまれだからである。
同じ理由で、`}` が行にひとりの、行をまたぐデータブロックは報告しない。
`accDescr { x`、`participant A@{`、`"type": "actor"`、`}`、`A ->> B: y` は、
説明が `x`、`participant A@{`、`"type": "actor"` になり、
A は actor にならないが、その `}` は書き手のものと見分けられない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y
```

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y
  B ->> A: z
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
  B ->> A: z
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md)
- [sequence-no-empty-description-block](./sequence-no-empty-description-block.ja.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/sequence-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
