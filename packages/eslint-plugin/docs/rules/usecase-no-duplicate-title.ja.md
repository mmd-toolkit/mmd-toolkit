# @mmd-toolkit/usecase-no-duplicate-title

英語版: [usecase-no-duplicate-title.md](./usecase-no-duplicate-title.md)

前に設定したタイトルを置き換える `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

ユースケース図は、`accTitle` が設定するアクセシブルなタイトルを 1 つ持つ。
mermaid.js は後の `accTitle` をエラーなしに受理し、前のタイトルを置き換える。

## 規則の詳細

この規則は、ユースケース図（`usecase-beta`）に当てる。
直前の `accTitle` が設定した空でないアクセシブルなタイトルを変える `accTitle`
を報告する。
同じタイトルの繰り返しや、空のタイトルの後の設定は報告しない。

空か空白だけの `accTitle:` は次の行を取らずにタイトルを空にし、
空でないタイトルの後では報告する。
比較では両端の空白を除く。
ほかは書いたとおりに比べるので、
文字参照や HTML 属性の引用符の違いを mermaid.js が同じに読んでも、
この規則は異なるとすることがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-title: error
usecase-beta
  accTitle: first
  accTitle: second
  A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-title: error
usecase-beta
  accTitle: first
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [usecase-no-duplicate-description](./usecase-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/usecase-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
