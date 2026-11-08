# @mmd-toolkit/quadrant-no-invalid-color

英語版: [quadrant-no-invalid-color.md](./quadrant-no-invalid-color.md)

点やクラスのスタイルで、`#` のない 16 進数の色を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

点は `color` スタイルの色で描かれ、
境界線は `stroke-color` スタイルの色で描かれる。
mermaid.js は、
どちらにも `#` のない 3 桁か 6 桁の 16 進数を書いてもエラーを出さず、
そのテキストを図にそのまま書くが、ブラウザーは `f00` を色として読まない。
点やその境界線は書いた色で描かれない。

## 規則の詳細

この規則は、象限チャート（`quadrantChart`）に当てる。
点か `classDef` の `color` または `stroke-color` スタイルが、
`#` のない 3 桁か 6 桁の 16 進数で、点がその値で描かれるときに報告する。
点のスタイルの中でその名前の最後のものか、点にその名前のスタイルがないときは、
そのクラスの最後の `classDef` の中でその名前の最後のものが対象となる。
`stroke-color` は、点かそのクラスの `stroke-width` によって、
点の境界線が 0px より太く描かれるときだけ報告する。

同じ一覧の中で後の同名のスタイルが上書きするスタイル、
どの点も使わない `classDef`、点のスタイルが上書きする `classDef` の値、
同じクラスの後の `classDef` が置き換える `classDef` は報告しない。
`color: red` は、16 進数でない値には mermaid.js がエラーを出すので、報告しない。

`color: f00;` や `color: f00%%{init: {}}%%;` のように、色の直後か、
directive だけを挟んだ後に `;` があるときは、報告するが自動修正は出さない。
`#` を足すと、mermaid.js は `#f00;` を文字の符号として読み、
図を拒否するからである。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  Point A: [0.3, 0.5] color: f00, radius: 12
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  classDef hot color: f00
  Point A:::hot: [0.3, 0.5]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  Point A: [0.3, 0.5] stroke-color: f00, stroke-width: 2px
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  Point A: [0.3, 0.5] color: #f00, radius: 12
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-invalid-coordinate](./quadrant-no-invalid-coordinate.ja.md)

<!-- begin auto-generated rule version -->

## バージョン

この規則は、まだリリースされていない。

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-invalid-color.ts)
- [テストのソース](../../tests/rules/quadrant-no-invalid-color.test.ts)

<!-- end auto-generated rule resources -->
