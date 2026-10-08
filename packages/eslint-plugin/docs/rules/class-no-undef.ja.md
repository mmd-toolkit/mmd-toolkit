# @mmd-toolkit/class-no-undef

英語版: [class-no-undef.md](./class-no-undef.md)

図が定義していないクラスを指す文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

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
対象の図種は `classDiagram` である。

図のクラスは、class の文、関係、
または `A : +int x` のようなメンバーの文が宣言するもので、
図のどこにあっても、どの namespace の中にあってもよい。
`bar ()-- foo` の `bar` のように、関係の片方の端だけがロリポップのとき、
関係はその端のクラスを宣言しない。
mermaid.js はそれをインターフェースにし、`style bar fill:#f00` は何も変えない。
`A ()--() B` のように両端がロリポップなら、どちらもクラスである。
flowchart では `style` が名指しした頂点を作るのと違い、
クラス `Z` のない図の `style Z fill:#f00` はクラスを作らず、何も変えない。
クラス `C` のない図の `cssClass "C" c`、`click C href "…"`、`link C "…"`、
`callback C "f"` も、何も変えない。
`note for Z "x"` はノートを残すが、
mermaid.js は図を描くときにクラス `Z` を見つけられないので、
クラスへの線のないノートを描く
（
[`getData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L810-L829)
）。

クラスを宣言する前に書いた文も、mermaid.js では何も変えない。
`class A` より前の `style A fill:#f00`、`cssClass "A" c`、`click A href "…"`、
`link A "…"`、`callback A "f"` は何も変えず、
`A` を宣言する関係やメンバーの文の後なら効く。
`class A` より前の `note for A "x"` も、`A` を指す。
こうした文は、正しく書いた図のクラスを名指しているので、規則は報告しない。

ほかに 2 つ、正しくクラスを名指していて何もしない文があり、
規則はそれらも報告しない。
`1A` のように ASCII の数字で始まる id のクラスには、
`cssClass`、`link`、`click … href` は、どこにあっても何も付けない。
mermaid.js が、それを別の id で探すからである。
`style` と `callback` は効く。
また、`class A~T~` の後の `note for A~T~ "x"` はクラス `A` を指すが、
mermaid.js は総称型を付けたままクラスを探し、線のないノートを描く。

`cssClass` の一覧は、名前ごとに確かめる。
`cssClass "A, B" c` のように `,` の後に空白があると、
それは名前 ` B` の一部で、どのクラスも指さず、
mermaid.js は `B` に CSS クラスを付けない。
`click`、`link`、`callback` のバッククォートの名前も、同じように `,` で分け、
それぞれを確かめる。
``click `A,B` href "…"`` は、`A` と `B` の両方をリンクにする。
`note for` の後の名前は分けない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-undef: error
classDiagram
  class A
  cssClass "C" c
```

```mmd
%% eslint @mmd-toolkit/class-no-undef: error
classDiagram
  class A
  click C href "https://x.example"
```

```mmd
%% eslint @mmd-toolkit/class-no-undef: error
classDiagram
  note for Z "x"
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-undef: error
classDiagram
  class A
  style A fill : #f00 , stroke-width: 2px
```

```mmd
%% eslint @mmd-toolkit/class-no-undef: error
classDiagram
  Class11 <|.. Class12
  note for Class11 "test"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-undef](./flowchart-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/class-no-undef.ts)
- [テストのソース](../../tests/rules/class-no-undef.test.ts)

<!-- end auto-generated rule resources -->
