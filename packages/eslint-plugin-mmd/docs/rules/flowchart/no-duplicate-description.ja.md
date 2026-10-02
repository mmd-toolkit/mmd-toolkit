# mmd/flowchart/no-duplicate-description

英語版: [no-duplicate-description.md](./no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
mermaid.js はどの `accDescr` の文も受理し、
説明を設定する文は、それより前に設定した説明を黙って置き換える。
2 つ目の説明は、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものであり、
整形したテキストを見ても、どちらが効くかは分からない。

## 規則の詳細

この規則は、説明を設定する文のうち、最初のもの以外をすべて報告する。
`flowchart-v2`、`flowchart-elk`、`swimlane` に当たる。

`accDescr:` は説明を設定する。
テキストがなくても説明を設定し、説明を空にする。
説明を持つ閉じたブロックも説明を設定し、
行とブロックは、どちらが先でも互いに置き換える。
subgraph の中の文も、図全体の説明を設定するので、数える。

説明を持たないブロックと閉じていないブロックは、数えない。
それらは、
[no-empty-description-block](./no-empty-description-block.ja.md) と
[no-unclosed-description-block](./no-unclosed-description-block.ja.md)
が報告する。

この規則に**反する**コードの例:

```mmd
flowchart LR
  accDescr: first
  accDescr: second
```

```mmd
flowchart LR
  accDescr { first }
  accDescr: second
```

```mmd
flowchart LR
  subgraph S
    A
    accDescr: inner
  end
  accDescr: outer
```

この規則に**従う**コードの例:

```mmd
flowchart LR
  A
  accDescr: first
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-duplicate-title](./no-duplicate-title.ja.md)
- [no-empty-description-block](./no-empty-description-block.ja.md)
- [no-unclosed-description-block](./no-unclosed-description-block.ja.md)
