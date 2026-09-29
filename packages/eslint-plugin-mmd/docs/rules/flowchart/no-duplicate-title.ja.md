# mmd/flowchart/no-duplicate-title

英語版: [no-duplicate-title.md](./no-duplicate-title.md)

タイトルをもう一度設定する `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

図のアクセシブルなタイトルは 1 つである。
mermaid.js はどの `accTitle` の文も受理し、
それぞれの文は、それより前に設定したタイトルを黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものであり、
整形したテキストを見ても、どちらが効くかは分からない。

## 規則の詳細

この規則は、`accTitle` の文のうち、最初のもの以外をすべて報告する。
`flowchart-v2`、`flowchart-elk`、`swimlane` に当たる。

`accTitle: first` と `accTitle: second` の後、タイトルは `second` になる。
テキストのない `accTitle:` もタイトルを設定する。
タイトルを空にするので、その前に書いたタイトルは失われる。
subgraph の中の文も、図全体のタイトルを設定するので、数える。

この規則に**反する**コードの例:

```mmd
flowchart LR
  accTitle: first
  accTitle: second
```

```mmd
flowchart LR
  A
  accTitle: x
  accTitle:
```

```mmd
flowchart LR
  subgraph S
    A
    accTitle: inner
  end
  accTitle: outer
```

この規則に**従う**コードの例:

```mmd
flowchart LR
  A
  accTitle: first
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-duplicate-description](./no-duplicate-description.ja.md)

## 実装のための覚え書き

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

### 木での現れ方

`FlowchartAccTitleStatement`（`value` が null のものも含む）のうち、
ソースでそれより前に、別の `FlowchartAccTitleStatement` があるもの。
文は、`FlowchartDiagram` と、その中のすべての `FlowchartSubgraphStatement` の
`body` から、範囲の順に取る。
規則は、最初のもの以外をすべて報告する。

### fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `flowchart/db-acc-title-replaces`
- `flowchart/db-acc-title-empty-replaces`
- `flowchart/db-acc-title-outer-replaces-subgraph`
- `flowchart/db-acc-repeated`
- `flowchart/db-acc-title-alone`
