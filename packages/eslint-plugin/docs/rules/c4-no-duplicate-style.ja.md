# @mmd-toolkit/c4-no-duplicate-style

英語版: [c4-no-duplicate-style.md](./c4-no-duplicate-style.md)

前の更新が与えた値を置き換えるスタイル更新を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`UpdateElementStyle` と `UpdateRelStyle` は、要素、境界、
関係のスタイルを更新する。
与えたスタイル属性は前の値をエラーなしに置き換えるため、
後の背景色で前の背景色が失われることがある。

## 規則の詳細

この規則は、C4 図（`C4Context`、`C4Container`、`C4Component`、`C4Dynamic`、
`C4Deployment`）に当てる。
前の更新や同じ更新の前の引数が設定したスタイル属性を変える引数を報告する。
同じ値の繰り返しや、初めて設定する属性は報告しない。
`$bgColor="red"`、`$bgColor="blue"` の後の 3 つ目の `$bgColor="red"` は、
`blue` を置き換えるので報告する。
空の引数は空の値を設定し、前の値を置き換えるときは更新を報告する。

対象が見つかる更新だけを比べ、対象は更新前に宣言した最初に一致する要素、
なければ境界、または端点が順に一致する最初の関係である。
初めからある境界 `global` も対象になる。
名前付きの `$alias`、`$from`、`$to` は後の更新が見つけるものを変え、比べない。

引数の位置か名前付きキーが属性を選ぶので、
`UpdateElementStyle(a, "red", $bgColor="blue")` は `bgColor` を 2 度設定する。
キーは大文字小文字を区別して比べる。
`$BgColor` は別の属性なので `$bgColor` と比べず、
[c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.ja.md) が報告する。
宣言の値は比べず、宣言が値を与えた属性だけ、それまでの更新との比較を終える。

値は両端の空白を除き、ほかは書いたとおりに比べる。
そのため、文字参照や HTML 属性の引用符が違う値を mermaid.js が同じに読んでも、
この規則は違うものとすることがある。
`UpdateRelStyle` の 5 番目と 6 番目の offset も書いたとおりに比べ、
`10` と `010` は mermaid.js が同じ整数として読んでも、
異なる値として報告することがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, $bgColor="blue")
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, , "white")
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, $fontColor="white")
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  Person(b, "B")
  Rel(a, b, "Uses")
  UpdateRelStyle(a, b, $textColor="red", $lineColor="blue")
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [c4-no-undef](./c4-no-undef.ja.md)
- [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-duplicate-style.ts)
- [テストのソース](../../tests/rules/c4-no-duplicate-style.test.ts)

<!-- end auto-generated rule resources -->
