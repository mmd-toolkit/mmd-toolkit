# @mmd-toolkit/xychart-no-invalid-orientation

英語版:
[xychart-no-invalid-orientation.md](./xychart-no-invalid-orientation.md)

mermaid.js が `horizontal` と読まない向きを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`xychart` の後の語はチャートの向きを変える。
`xychart horizontal` はチャートを横向きに描く。
mermaid.js はその語を大文字小文字を問わず読むが、
チャートの向きを変えるのは小文字の `horizontal` のときだけである。
`xychart Horizontal` は、エラーなしに縦向きに描かれる。

## 規則の詳細

この規則は、見出しの向きのうち、 `Horizontal` や `HORIZONTAL` のように、
違う大文字小文字で書いた `horizontal` を報告する。
対象の図種は `xychart` である。

mermaid.js は `horizontal` でない語をすべて縦向きとするので、
チャートは縦向きになる。
見出しの語は設定 `xyChart.chartOrientation` にも勝つ。
フロントマターでその設定を `horizontal` にしても、
`xychart Horizontal` は縦向きのままである。
2 つ目の見出しの向きも同じように読み、報告する。
`VERTICAL` のように、どの大文字小文字の `vertical` も、
それが名指す縦向きのチャートを与え、報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-invalid-orientation: error
xychart Horizontal
  line [1, 2]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-invalid-orientation: error
xychart horizontal
  line [1, 2]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [gantt-no-invalid-tag](./gantt-no-invalid-tag.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/xychart-no-invalid-orientation.ts)
- [テストのソース](../../tests/rules/xychart-no-invalid-orientation.test.ts)

<!-- end auto-generated rule resources -->
