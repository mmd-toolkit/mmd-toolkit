# @mmd-toolkit/eventmodeling-no-redefined-data

英語版:
[eventmodeling-no-redefined-data.md](./eventmodeling-no-redefined-data.md)

前のブロックが名前を持つので、どのフレームも示せない `data` ブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

フレームは、参照する名前の最初の `data` ブロックを示す。
その名前の後のブロックは決して示されない。
mermaid.js はエラーなしにそれを受理し、その中身は失われる。

## 規則の詳細

この規則は、前の `data` ブロックが同じ名前を持つ `data` ブロックを、
フレームがその名前を参照し、中身が最初のブロックの中身と違うときに報告する。
対象の図種は `eventmodeling` である。

`first` を持つブロック `Payload` と、`second` を持つブロック `Payload` の後で、
`[[Payload]]` を持つフレームは `first` を示す。
後のブロックは最初のブロックと比べる。
`first`、`second`、`first`、`third` の後では、
2 つ目と 4 つ目のブロックを報告する。

どちらの種類のフレームも、ブロックの前でも後でも数える。
どのフレームも参照しない名前のブロックは、どれも示されないので報告しない。
`` `json` `` のような逆引用符の中のデータの型は、
mermaid.js が示さないので比べない。
mermaid.js はブロックの空白と行を書いたとおりに示すので、
中身は書いたとおりに比べ、すべての改行（LF、CRLF、CR）は LF として読む。
後の空のブロックも、空白 1 つだけが違うブロックも報告する。
ブロックの中のコメント行は、mermaid.js が取り除くので中身ではない。
mermaid.js は、`#35;` のような文字参照と HTML を、
ブロックを示す前にほかの文字に変えるので、
それだけが違う 2 つの中身は同じに示されることがあり、それでも報告する。

`Payload01` と `Payload02` のように中身ごとに名前を与えるか、
ブロックを 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-redefined-data: error
eventmodeling
  tf 01 evt Bought [[Payload]]
  data Payload {
first
}
  data Payload {
second
}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-redefined-data: error
eventmodeling
  tf 01 evt Bought [[Payload01]]
  tf 02 evt Bought [[Payload02]]
  data Payload01 {
first
}
  data Payload02 {
second
}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [eventmodeling-no-undef](./eventmodeling-no-undef.ja.md)

## 背景

[フレームのデータ](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L348-L362) は、
その名前の最初のデータブロックであり、
[文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L95-L97) は、
繰り返すエンティティのブロックに番号の付いた名前を与える。
[文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L309-L311) は、
描画がどのデータの型も特別に扱わないとも述べる。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-redefined-data.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-redefined-data.test.ts)

<!-- end auto-generated rule resources -->
