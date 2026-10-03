# mmd/class/no-undef

英語版: [no-undef.md](./no-undef.md)

図が定義していないクラスを指す文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`style`、`cssClass`、`click`、`link`、`callback`、`note for` は、
クラスを名指しする。
その名前が図のどのクラスの名前でもないと、
mermaid.js は文を受理して何もしないか、
何も指さないノートを描く。
名前を打ち間違えても、エラーは出ない。

## 規則の詳細

この規則は、そうした文のクラス名のうち、
図のどのクラスの id でもないものを報告する。
`classDiagram` に当たる。

図のクラスは、class の文、関係、
または `A : +int x` のようなメンバーの文が宣言するもので、
図のどこにあっても、どの namespace の中にあってもよい。
flowchart では `style` が名指しした頂点を作るのと違い、
クラス `Z` のない図の `style Z fill:#f00` はクラスを作らず、何も変えない。
クラス `C` のない図の `cssClass "C" c`、`click C href "…"`、`link C "…"`、
`callback C "f"` も、何も変えない。
`note for Z "x"` はノートを残すが、
mermaid.js は図を描くときにクラス `Z` を見つけられないので、
クラスへの線のないノートを描く
（[`getData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L810-L829)）。

`cssClass` の一覧は、名前ごとに確かめる。
`cssClass "A, B" c` のように `,` の後に空白があると、
それは名前 ` B` の一部で、どのクラスも指さず、
mermaid.js は `B` に CSS クラスを付けない。

この規則に**反する**コードの例:

```mmd
classDiagram
  class A
  cssClass "C" c
```

```mmd
classDiagram
  class A
  click C href "https://x.example"
```

```mmd
classDiagram
  note for Z "x"
```

この規則に**従う**コードの例:

```mmd
classDiagram
  class A
  style A fill : #f00 , stroke-width: 2px
```

```mmd
classDiagram
  Class11 <|.. Class12
  note for Class11 "test"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart/no-undef](../flowchart/no-undef.ja.md)
