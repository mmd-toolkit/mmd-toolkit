# @mmd-toolkit/block-no-invalid-direction

英語版: [block-no-invalid-direction.md](./block-no-invalid-direction.md)

向きの語のどれでもないブロック矢印の向きを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

ブロック矢印は、`A<["Next"]>(right)` のように後に書いた向きを指す。
mermaid.js は `( left )`
のような括弧の内側やコンマの前の空白をエラーなしに受理する。
その空白は向きの一部として残るため、矢印はその向きを指さない。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
単独のブロック矢印や辺の向きのうち、`right`、`left`、`up`、`down`、`x`、
`y` のどれとも一致しないものを報告する。

コンマの後の空白は無視されるので、`(x, down)` は報告しない。
コンマの前の空白は残るので、`(left ,right)` の最初の向きを報告し、
矢印は右だけを指す。

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
