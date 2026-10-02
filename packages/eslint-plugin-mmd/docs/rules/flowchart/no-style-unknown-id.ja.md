# mmd/flowchart/no-style-unknown-id

英語版: [no-style-unknown-id.md](./no-style-unknown-id.md)

id がどの頂点もどの subgraph も指さない `style` の文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`style` の文は、指す頂点がなければ、その頂点を作る。
id を書き誤ると、意図した箱に色が付かず、新しい箱が描かれる。

## 規則の詳細

この規則は、id が図のどの頂点の id でも、
どの subgraph の id でもない `style` の文を報告する。
`flowchart-v2`、`flowchart-elk`、`swimlane` に当たる。

`A --> B` の後の `style C fill:red` は、スタイル `fill:red` の頂点 `C` を足す。
文の位置は関係なく、`A --> B` の前の `style A fill:red` も `A` に色を付ける。
subgraph の id は報告しない。
subgraph に色を付けるのも `style` だからである。

この規則に**反する**コードの例:

```mmd
flowchart LR
  A --> B
  style C fill:red
```

この規則に**従う**コードの例:

```mmd
flowchart LR
  style A fill:red
  A --> B
```

```mmd
flowchart LR
  subgraph S
    A
  end
  style S fill:red
```

## オプション

この規則にはオプションがない。
