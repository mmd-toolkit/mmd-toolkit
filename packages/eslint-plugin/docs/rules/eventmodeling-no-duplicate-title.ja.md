# @mmd-toolkit/eventmodeling-no-duplicate-title

英語版:
[eventmodeling-no-duplicate-title.md](./eventmodeling-no-duplicate-title.md)

前に設定したアクセシブルなタイトルを置き換える `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

Event Modeling の図は、`accTitle` が設定するアクセシブルなタイトルを 1 つ持つ。
後の `accTitle` は、前に設定したタイトルをエラーなしに置き換え、
前のタイトルは失われる。

## 規則の詳細

この規則は、前の `accTitle` の文字と違う文字を持つ `accTitle` 文を、
前の文字が空でないときに報告する。
対象の図種は `eventmodeling` である。

mermaid.js は、
`accTitle:` を含めた文全体をアクセシブルなタイトルとして保つので、
文字のない `accTitle:` や空白だけのものもタイトルを設定する。
`accTitle: First` の後では `First` が失われるので、それを報告する。
文字のない `accTitle:` の後の文は文字を失わず、報告しない。
mermaid.js は Event Modeling の図のタイトルを描かないので、`title` は比べない。

文字は、両端の空白を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べるので、
`accTitle: First  report` と `accTitle: First report` は同じ語を与え、
報告しない。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。
文字はそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
タイトルを読む前にほかの文字に変えるので、それだけが違う 2 つの文字は、
mermaid.js には 1 つのタイトルで、この規則には 2 つのことがある。

`accTitle` 文は 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-title: error
eventmodeling accTitle: First
  tf 01 evt Bought accTitle: Second
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-title: error
eventmodeling accTitle: Second
  tf 01 evt Bought
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.ja.md)

## 背景

`accTitle` の [終端記号](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L61-L61) は文全体を取り、
[値の変換](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L6-L41) は、
その名前が知っている名前でないので、それを変換しない。
パーサーは最後のタイトルを保ち、
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14) は、
それが空になることはないので、それを設定する。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
