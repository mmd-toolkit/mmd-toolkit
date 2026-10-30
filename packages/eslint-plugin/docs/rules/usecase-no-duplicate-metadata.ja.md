# @mmd-toolkit/usecase-no-duplicate-metadata

英語版: [usecase-no-duplicate-metadata.md](./usecase-no-duplicate-metadata.md)

同じキーで前に設定した値を置き換えるメタデータの値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`User@{ type: hollow }` のようなメタデータの更新は、アクター、ユースケース、
システム境界、関係のプロパティを設定する。
別の更新が同じ要素の同じキーに違う値を与えると、
mermaid.js はエラーなしにそれを使い、前の値は失われる。

## 規則の詳細

この規則は、ユースケース図（`usecase-beta`）に当てる。
同じ要素の前の更新の、空でない異なる値を置き換える `type`、`business`、`icon`、
`animation` のプロパティを報告する。
同じ更新のキーの重複や宣言前の更新も含め、書いた順に比べる。
新しいキー、同じ値の繰り返し、空の値の後の値は報告しない。

id と値は、周りの引用符を除いて比べる。
mermaid.js が 1 つの id に変える名前も、この規則では別なので、
`"Place order"` と `Place_order` は比べない。
値はそのほかは書いたとおりに比べるので、
文字参照や HTML 属性の引用符の違いを mermaid.js が同じに読んでも、
この規則は異なるとすることがある。

`systemBoundary` の見出しのメタデータも書いた順に比べ、
前の見出しや更新を置き換える見出しは報告する。
見出しの後の更新は、
mermaid.js の文書が見出しのメタデータを変える方法として示すので報告しない。

アクターやユースケースの宣言に書いたメタデータは、
`actor A@{ type: hollow }` のようなものも比べない。
mermaid.js の文書はそれをどこかに書いた更新で変え、
メタデータの違う 2 つの宣言には mermaid.js がエラーを出す。
`animate` は、
`animation: slow` の後の `animate: false`
がアニメーションを止めないので比べない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-metadata: error
usecase-beta
  actor User
  User@{ type: hollow }
  User@{ type: awesome }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-metadata: error
usecase-beta
  actor User
  User@{ type: hollow }
```

## オプション

この規則にはオプションがない。

## 参考

- [ユースケース図の構文: システム境界](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/usecase.md#L223-L223)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-duplicate-metadata.ts)
- [テストのソース](../../tests/rules/usecase-no-duplicate-metadata.test.ts)

<!-- end auto-generated rule resources -->
