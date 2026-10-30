# @mmd-toolkit/pie-no-duplicate-label

英語版: [pie-no-duplicate-label.md](./pie-no-duplicate-label.md)

前の区分が持つラベルに、別の値を与える区分を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

円グラフはラベルごとに 1 つの扇形を持つ。
後の区分が同じラベルに違う値を与えると、
mermaid.js はエラーなしに最初の値を保ち、後の値を無視する。

## 規則の詳細

この規則は、円グラフ（`pie`）に当てる。
同じラベルの最初の区分と違う値を与える区分を報告する。
最初の値の繰り返しは、違う値の後でも報告しない。

値は数として比べ、`1.2` と `001.20` は等しく、`0` と `-0` も等しい。
ラベルは空白と大文字小文字を区別し、周りの引用符を除き、LF、CRLF、
CR は LF として比べる。

ラベルのほかの文字は書いたとおりに比べるので、
`\n` のようなエスケープや HTML 属性の引用符の違いを mermaid.js
が同じに読んでも、この規則は異なるとすることがある。
文字参照は mermaid.js にも書いたまま残るので、
`"#35;"` と `"#"` は異なるラベルである。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-label: error
pie
  "Revenue" : 8
  "Revenue" : 3
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-label: error
pie
  "Revenue" : 8
  "Costs" : 3
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/pie-no-duplicate-label.ts)
- [テストのソース](../../tests/rules/pie-no-duplicate-label.test.ts)

<!-- end auto-generated rule resources -->
