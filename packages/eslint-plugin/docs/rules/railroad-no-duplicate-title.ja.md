# @mmd-toolkit/railroad-no-duplicate-title

英語版: [railroad-no-duplicate-title.md](./railroad-no-duplicate-title.md)

前に設定したタイトルを置き換える `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

レールロード図は、`accTitle` が設定するアクセシブルなタイトルを 1 つ持つ。
後の `accTitle` は、前に設定したタイトルをエラーなしに置き換え、
前のタイトルは失われる。

## 規則の詳細

この規則は、レールロード図（`railroad-beta`、`railroad-ebnf-beta`、
`railroad-abnf-beta`、`railroad-peg-beta`）に当てる。
直前の `accTitle` が設定した空でないアクセシブルなタイトルを変える `accTitle`
を報告する。
文字がないか空白だけの `accTitle:` は次の行を取らずにタイトルを空にし、
空でないタイトルの後では報告する。
空のタイトルの後の文と、現在のタイトルを繰り返す文は報告しない。
前のタイトルに戻す文は報告する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は報告する。

mermaid.js はレールロード図のタイトルを描かないので、
繰り返した `title` 文は報告しない。

タイトルは、両端の空白を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べる。
そのほかは書いたとおりに比べる。
mermaid.js は、
タイトルを読む前に `#35;` のような文字参照と HTML の属性の引用符を変換する。
それらだけが違うタイトルは、mermaid.js には同じでも、
この規則には違うことがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/railroad-no-duplicate-title: error
railroad-ebnf-beta
  accTitle: First
  accTitle: Second
  word = "a";
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/railroad-no-duplicate-title: error
railroad-ebnf-beta
  accTitle: Second
  word = "a";
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [railroad-no-duplicate-description](./railroad-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/railroad-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/railroad-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
