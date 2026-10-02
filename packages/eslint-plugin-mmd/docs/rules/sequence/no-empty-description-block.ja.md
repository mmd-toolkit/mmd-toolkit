# mmd/sequence/no-empty-description-block

英語版: [no-empty-description-block.md](./no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

説明のブロックは、図に説明を与えるために書く。
ブロックが何も持たないか、空白だけを持つとき、
mermaid.js はそれを受理して何もしないので、ブロックは何の効果も持たない。

## 規則の詳細

この規則は、何も持たないか空白だけを持つ、
閉じた `accDescr` のブロックを報告する。
`sequence` に当たる。

説明は、ブロックの前の値のままになる。
`accDescr: x` の後のブロック `accDescr {}` は説明を `x` のまま残し、
前に説明がなければ、説明は空のままである。
行で書いた空の説明は違う。
`accDescr:` は、説明を空のテキストにする。

コメントだけを持つブロックは報告しない。
説明の行をコメントにする書き手は、ブロックが何もしないことを意図しており、
mermaid.js もそう読む。
ブロックの前の説明が残る。

この規則に**反する**コードの例:

```mmd
sequenceDiagram
  A ->> B: x
  accDescr {}
```

```mmd
sequenceDiagram
  A ->> B: x
  accDescr { }
```

```mmd
sequenceDiagram
  A ->> B: x
  accDescr {
  }
```

この規則に**従う**コードの例:

```mmd
sequenceDiagram
  A ->> B: x
  accDescr { y }
```

```mmd
sequenceDiagram
  A ->> B: x
  accDescr {
    %% c
  }
```

## オプション

この規則にはオプションがない。
コメントだけのブロックも報告するオプションは、
この規則を使う人から要望があったときにだけ、足すことを考える。

## 関連する規則

- [flowchart/no-empty-description-block](../flowchart/no-empty-description-block.ja.md)
- [no-duplicate-description](./no-duplicate-description.ja.md)
