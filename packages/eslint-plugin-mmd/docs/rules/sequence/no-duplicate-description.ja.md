# mmd/sequence/no-duplicate-description

英語版: [no-duplicate-description.md](./no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
mermaid.js はどの `accDescr` の文も受理し、
説明を設定する文は、それより前に設定した説明を黙って置き換える。
2 つ目の説明は、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、説明を設定する文のうち、最初のもの以外をすべて報告する。
`sequence` に当たる。

`accDescr:` は説明を設定する。
テキストがなくても説明を設定し、説明を空にする。
説明を持つ閉じたブロックも説明を設定し、
行とブロックは、どちらが先でも互いに置き換える。
`loop` のようなブロックの中の文も、図全体の説明を設定するので、数える。

説明を持たないブロックは、数えない。
それは、[no-empty-description-block](./no-empty-description-block.ja.md)
が報告する。

この規則に**反する**コードの例:

```mmd
sequenceDiagram
  A ->> B: x
  accDescr: first
  accDescr: second
```

```mmd
sequenceDiagram
  A ->> B: x
  accDescr { first }
  accDescr: second
```

```mmd
sequenceDiagram
  loop every minute
    A ->> B: x
    accDescr: inner
  end
  accDescr: outer
```

この規則に**従う**コードの例:

```mmd
sequenceDiagram
  A ->> B: x
  accDescr: first
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart/no-duplicate-description](../flowchart/no-duplicate-description.ja.md)
- [no-duplicate-title](./no-duplicate-title.ja.md)
- [no-empty-description-block](./no-empty-description-block.ja.md)

## 実装のための覚え書き

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

### 木での現れ方

説明を設定する文のうち、ソースでそれより前に、説明を設定する別の文があるもの。
説明を設定する文は、
`SequenceAccDescrStatement`（`value` が null のものも含む）と、
`closed` が true で、
`value` が null でない `SequenceAccDescrBlockStatement` である。
文は、`SequenceDiagram` と、その中のすべてのブロックとセクションの
`body` から、範囲の順に取る。
規則は、最初のもの以外をすべて報告する。

### fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `sequence/db-acc-descr-replaces`
- `sequence/db-acc-descr-line-replaces-block`
- `sequence/db-acc-descr-outer-replaces-loop`
- `sequence/db-acc-descr-line-alone`
- `sequence/db-acc-descr-empty-block-keeps`
