# @mmd-toolkit/eventmodeling-no-duplicate-description

英語版:
[eventmodeling-no-duplicate-description.md](./eventmodeling-no-duplicate-description.md)

前に設定した説明を置き換える `accDescr` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

Event Modeling の図は、`accDescr` が行かブロックで設定する
アクセシブルな説明を 1 つ持つ。
後の `accDescr` は、前に設定した説明をエラーなしに置き換え、
前の説明は失われる。

## 規則の詳細

この規則は、前の `accDescr` の文字と違う文字を持つ `accDescr` 文を、
前の文字が空でないときに報告する。
対象の図種は `eventmodeling` である。

行の形とブロックの形は混ぜてよく、どちらが後でも、最後に書いた説明が使われる。
mermaid.js は、`accDescr` とその `:` や括弧を含めた文全体を説明として保つので、
文字のない文も説明を設定する。
説明の後では、文字のない `accDescr:` や空白だけのものを報告し、
コメント行だけを持つブロックも、mermaid.js がコメントを取り除くので報告する。
ほかに何も持たないブロックは、
[eventmodeling-no-empty-description-block](./eventmodeling-no-empty-description-block.ja.md)
が報告する。
文字のない文の後の文は文字を失わず、報告しない。

文字は語で比べる。
各行の始めと終わりの空白と空の行を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べる。
すべての改行（LF、CRLF、CR）は LF として読み、
U+2028 と U+2029 も、どちらの形でも行を終える。
そのため `accDescr: d` とブロック `accDescr { d }` は同じ語を与え、報告しない。
mermaid.js は、一方には `:` を、他方には括弧を保つが、それは比べない。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。
文字はそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
説明を読む前にほかの文字に変えるので、
それだけが違う 2 つの文字は、
mermaid.js には 1 つの説明で、この規則には 2 つのことがある。

`accDescr` 文は 1 つにする。

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

## 背景

`accDescr` の
[終端記号](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L60-L60)
は文全体を取り、
[値の変換](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L6-L41)
は、その名前が知っている名前でないので、それを変換しない。
パーサーは最後の説明を保ち、
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
は、それが空になることはないので、それを設定する。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
