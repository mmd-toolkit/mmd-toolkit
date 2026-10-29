# @mmd-toolkit/pie-no-duplicate-description

英語版: [pie-no-duplicate-description.md](./pie-no-duplicate-description.md)

前に設定した説明を置き換える `accDescr` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

円グラフは、行かブロックの `accDescr` が設定するアクセシブルな説明を 1 つ持つ。
mermaid.js は後の説明をエラーなしに受理し、前の説明を置き換える。

## 規則の詳細

この規則は、円グラフ（`pie`）に当てる。
直前の `accDescr` が設定した空でない説明を変える `accDescr` を、
行とブロックの形式を一緒に比べて報告する。
同じ説明の繰り返しや、空の説明の後の設定は報告しない。

空か空白だけの `accDescr:` は次の行を取らずに説明を空にし、
空でない説明の後では報告する。
コメント行だけを持つブロックも説明を空にし、空でない説明の後では報告する。
空のブロックは、
代わりに
[pie-no-empty-description-block](./pie-no-empty-description-block.ja.md)
が報告する。

比較では、各行の両端の空白と空の行を除き、
2 つ以上の空白やタブの連なりを 1 つの空白とする。
LF、CRLF、CR は LF として比べる。

ほかは書いたとおりに比べるので、
文字参照や HTML 属性の引用符の違いを mermaid.js が同じに読んでも、
この規則は異なるとすることがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-description: error
pie
  accDescr: First
  accDescr: Second
  "A" : 1
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-description: error
pie
  accDescr: Second
  "A" : 1
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [pie-no-duplicate-title](./pie-no-duplicate-title.ja.md)
- [pie-no-empty-description-block](./pie-no-empty-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/pie-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/pie-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
