# @mmd-toolkit/class-no-undef

英語版: [class-no-undef.md](./class-no-undef.md)

図が定義していないクラスを指す文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style`、`cssClass`、`click`、`link`、`callback`、`note for` はクラスを指す。
未知の名前でもエラーは出ず、文は何もしないか、何も指さないノートを描く。

## 規則の詳細

この規則は、クラス図（`classDiagram`、`classDiagram-v2`）に当てる。
`style`、`cssClass`、`click`、`link`、`callback`、`note for` の文の、
未知のクラス名を報告する。
class の文、関係、メンバーの文が宣言するクラスを、図のどこにあっても、
どの namespace の中でも数える。

片方の端だけがロリポップの関係は、その端にクラスでなくインターフェースを宣言し、
両端がロリポップなら、両端ともクラスになる。
指すクラスより前の文は、そこで効くのが `note for` だけでも報告しない。

ASCII の数字で始まる id のクラスを指す文は、`cssClass`、`link`、
`click … href` が効かなくても報告しない。
`class A~T~` の後の `note for A~T~ "x"` も、
mermaid.js がクラスへの線なしでノートを描いても報告しない。

`cssClass` の一覧は名前ごとに調べる。
`,` の後の空白も名前の一部なので、`cssClass "A, B" c` の ` B` は報告する。
`click`、`link`、`callback` のバッククォートの名前も `,` で分け、
各部分を調べる。
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
