# @mmd-toolkit/cynefin-no-duplicate-description

英語版:
[cynefin-no-duplicate-description.md](./cynefin-no-duplicate-description.md)

前に設定した説明を置き換える `accDescr` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

Cynefin 図は、
`accDescr` が行かブロックで設定するアクセシブルな説明を 1 つ持つ。
後の `accDescr` は、前に設定した説明をエラーなしに置き換え、前の説明は失われる。

## 規則の詳細

この規則は、Cynefin 図（`cynefin-beta`）に当てる。
直前の `accDescr` が設定した空でない説明を変える `accDescr` を報告する。
行の形とブロックの形は互いに比べる。
文字がないか空白だけの `accDescr:` は次の行を取らずに説明を空にし、
空でない説明の後では報告する。

コメント行だけのブロックも、mermaid.js がコメントを取り除くので説明を空にし、
空でない説明の後では報告する。
`accDescr {}` のような空のブロックとディレクティブだけのブロックは、
代わりに
[cynefin-no-empty-description-block](./cynefin-no-empty-description-block.ja.md)
が報告する。

空の説明の後の文と、どちらの形でも現在の説明を繰り返す文は報告しない。
前の説明に戻す文は報告する。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は報告する。
説明は、各行の先頭と末尾の空白と空の行を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べる。
LF、CRLF、CR は LF として読む。
説明はそのほかは書いたとおりに比べる。
mermaid.js は、
説明を読む前に `#35;` のような文字参照と HTML の属性の引用符を変換する。
それらだけが違う説明は、mermaid.js には同じでも、この規則には違うことがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/cynefin-no-duplicate-description: error
cynefin-beta
  accDescr: First
  accDescr: Second
  complex
    "Investigate"
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/cynefin-no-duplicate-description: error
cynefin-beta
  accDescr: Second
  complex
    "Investigate"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [cynefin-no-duplicate-title](./cynefin-no-duplicate-title.ja.md)
- [cynefin-no-empty-description-block](./cynefin-no-empty-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/cynefin-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/cynefin-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
