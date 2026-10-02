# mmd/flowchart/no-redefined-vertex

英語版: [no-redefined-vertex.md](./no-redefined-vertex.md)

頂点の形やラベルを、後で違うものに書き直すことを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

頂点は何度でも書くことができ、最後に書いた形とラベルが使われる。
新しい頂点のつもりで、使用中の id をもう一度書くと、
前の形やラベルはエラーなしに失われる。

## 規則の詳細

この規則は、形を付けて書いた頂点のうち、
同じ頂点が前に違う形か違うラベルで書かれているものを報告する。
`flowchart-v2`、`flowchart-elk`、`swimlane` に当たる。

`A[Start] --> B` の後の行 `C --> A[End]` は、頂点 `A` にラベル `End` を付け、
ラベル `Start` は失われる。
`A --> C` のように形を付けずに頂点をもう一度書くと、形とラベルは保たれ、
報告しない。
同じ形とラベルをもう一度書くことも、報告しない。

この規則に**反する**コードの例:

```mmd
flowchart LR
  A[Start] --> B
  C --> A[End]
```

この規則に**従う**コードの例:

```mmd
flowchart LR
  A[Start] --> B
  A --> C
```

```mmd
flowchart LR
  A[Start] --> B
  C --> A[Start]
```

## オプション

この規則にはオプションがない。
