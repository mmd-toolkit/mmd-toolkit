# @mmd-toolkit/usecase-no-redefined-class

英語版: [usecase-no-redefined-class.md](./usecase-no-redefined-class.md)

前に定義したクラスのスタイルを落とすか変える `classDef` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`classDef` はクラスのスタイルを定義する。
同じクラスの後の `classDef` は、定義全体をエラーなしに置き換える。
別の定義で線を足すと、前の塗りが失われることがある。

## 規則の詳細

この規則は、ユースケース図（`usecase-beta`）に当てる。
直前の定義のスタイルを落とすか変える `classDef` の各クラスを報告する。
すべてのスタイルを保つなら、追加や並べ替えをしても報告しない。

同じ定義でプロパティが繰り返されるときは、最後の値を比べる。
`color` はラベル、`COLOR` は図形のスタイルになるため、
プロパティ名は大文字小文字を区別する。
値は両端の空白を除き、引用符の外の空白の連なりは 1 つの空白として比べるが、
`font-family:"A  B"` と `font-family:"A B"` は異なる。

`style` 文は要素にスタイルを足し、比べない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-redefined-class: error
usecase-beta
  A:::hot
  classDef hot fill:red
  classDef hot stroke:blue
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-redefined-class: error
usecase-beta
  A:::hot
  classDef hot fill:red, stroke:blue
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-redefined-class.ts)
- [テストのソース](../../tests/rules/usecase-no-redefined-class.test.ts)

<!-- end auto-generated rule resources -->
