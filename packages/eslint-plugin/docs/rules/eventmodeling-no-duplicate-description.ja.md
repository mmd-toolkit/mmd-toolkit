# @mmd-toolkit/eventmodeling-no-duplicate-description

英語版:
[eventmodeling-no-duplicate-description.md](./eventmodeling-no-duplicate-description.md)

前に設定した説明を置き換える `accDescr` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

イベントモデリング図は、
`accDescr` が行かブロックで設定するアクセシブルな説明を 1 つ持つ。
後の `accDescr` は、前に設定した説明をエラーなしに置き換え、前の説明は失われる。

## 規則の詳細

この規則は、イベントモデリング図（`eventmodeling`）に当てる。
直前の `accDescr` の文字が空でないとき、
それと違う文字を持つ `accDescr` を報告する。
行の形とブロックの形は互いに比べる。
空でない文字の後では、文字がないか空白だけの `accDescr:` を報告する。
mermaid.js が `accDescr:` を含む文全体を説明として保つからである。
コメント行だけのブロックも、mermaid.js がコメントを取り除くので報告する。
前の説明に戻す文は報告する。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は報告する。
`accDescr {}` のような空のブロックとディレクティブだけのブロックは、
代わりに
[eventmodeling-no-empty-description-block](./eventmodeling-no-empty-description-block.ja.md)
が報告する。
文字のない文の後の文は、文字が失われないので報告しない。

文字は、各行の先頭と末尾の空白と空の行を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べる。
LF、CRLF、CR は LF として読む。
`accDescr: d` と `accDescr { d }` は、mermaid.js が違う記号を保つが、
違うものとして報告しない。

文字はそのほかは書いたとおりに比べる。
mermaid.js は、
説明を読む前に `#35;` のような文字参照と HTML の属性の引用符を変換するので、
それらだけが違う文字は、mermaid.js には同じでも、この規則には違うことがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-description: error
eventmodeling accDescr: First
  tf 01 evt Bought accDescr: Second
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-description: error
eventmodeling accDescr: Second
  tf 01 evt Bought
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [eventmodeling-no-duplicate-title](./eventmodeling-no-duplicate-title.ja.md)
- [eventmodeling-no-empty-description-block](./eventmodeling-no-empty-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
