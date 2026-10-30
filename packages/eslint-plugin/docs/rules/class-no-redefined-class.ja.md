# @mmd-toolkit/class-no-redefined-class

英語版: [class-no-redefined-class.md](./class-no-redefined-class.md)

クラスのラベルを、後で違うものに書き直すことを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

クラスは何度でも宣言でき、最後のラベルが使われる。
別のクラスのつもりで名前を使い回すと、前のラベルがエラーなしに失われる。

## 規則の詳細

この規則は、クラス図（`classDiagram`、`classDiagram-v2`）に当てる。
クラスがすでに持つラベルと違うラベルを持つ class の文を報告する。
ラベルなしの再宣言や、現在のラベルの繰り返しは報告しない。
再宣言のメンバーは足し合わされ、比べない。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/class-no-redefined-class.ts)
- [テストのソース](../../tests/rules/class-no-redefined-class.test.ts)

<!-- end auto-generated rule resources -->
