# @mmd-toolkit/class-no-redefined-class

英語版: [class-no-redefined-class.md](./class-no-redefined-class.md)

クラスのラベルを、後で違うものに書き直すことを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

クラスは何度でも宣言でき、最後に書いたラベルが効く。
すでに使っている名前を、新しいクラスのつもりでもう一度宣言すると、
前のラベルがエラーなしに失われる。

## 規則の詳細

この規則は、ラベルを持つ class の文のうち、
同じクラスが前に違うラベルで宣言されているものを報告する。
対象の図種は `classDiagram` である。

`class A["First"]` の後の `class A["Second"]` は、
クラス `A` のラベルを `Second` にし、
ラベル `First` は失われる。
`class A` のようにラベルなしでもう一度宣言しても、ラベルは残るので報告しない。
同じラベルを書き直す場合も報告しない。
同じクラスの 2 つの class の文に書いたメンバーは足し合わされるので、比べない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-redefined-class: error
classDiagram
  class A["First"]
  class A["Second"]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-redefined-class: error
classDiagram
  class A["First"]
  class A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-redefined-vertex](./flowchart-no-redefined-vertex.ja.md)
