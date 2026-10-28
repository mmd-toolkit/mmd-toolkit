# @mmd-toolkit/block-no-invalid-direction

英語版: [block-no-invalid-direction.md](./block-no-invalid-direction.md)

向きの語のどれでもないブロック矢印の向きを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ブロック矢印は、`A<["Next"]>(right)` のように、後に書いた向きを指す。
向きは `right`、`left`、`up`、`down` と、
軸の両方の向きを表す `x` と `y` である。
mermaid.js は、`( left )` のように括弧の内側やコンマの前に書いた空白を、
向きとともに持ち、描画はそれをエラーなしに読まない。
矢印はその向きを指さない。

## 規則の詳細

この規則は、ブロック矢印の向きのうち、 `right`、`left`、`up`、`down`、`x`、
`y` のどれとも一致しないものを報告する。
対象の図種は `block` であり、単独で書いたブロック矢印にも辺のものにも当てる。

コンマの後の空白は持たれない。
mermaid.js の文書が書く `(x, down)` は向き `x` と `down` を持ち、報告しない。
コンマの前の空白は持たれるので、`(left ,right)` は右だけを指し、
最初の向きを報告する。
向きは、`(left, right)` のように括弧の内側に空白を置かずに書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-invalid-direction: error
block
  A<["Next"]>( left )
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-invalid-direction: error
block
  A<["Next"]>(left)
```

```mmd
%% eslint @mmd-toolkit/block-no-invalid-direction: error
block
  A<["Next"]>(x, down)
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-mismatched-shape](./block-no-mismatched-shape.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-invalid-direction.ts)
- [テストのソース](../../tests/rules/block-no-invalid-direction.test.ts)

<!-- end auto-generated rule resources -->
