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

この規則は、イベントモデリング図（`eventmodeling`）に当てる。
フレームが名前を参照し、中身が最初のブロックと違うとき、
前のブロックと同じ名前を持つ後の `data` ブロックを報告する。
後のブロックはそれぞれ最初のブロックと比べる。
time frame（`tf`、`timeframe`）も reset frame（`rf`、`resetframe`）も、
ブロックの前でも後でも数える。

どのフレームも名前を参照しないブロックは、どれも示されないので報告しない。

`` `json` `` のような逆引用符の中のデータの型は、
mermaid.js が示さないので比べない。
中身は、LF、CRLF、CR を LF として、書いたとおりに比べるので、
後の空のブロックも、空白 1 つだけが違うものも報告する。
ブロックの中のコメント行は、mermaid.js が取り除くので中身として数えない。
mermaid.js は、
ブロックを示す前に `#35;` のような文字参照と HTML を変換するので、
それらだけが違う中身は、同じに示されても報告することがある。

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

## 参考

- [Event Modeling の構文: データブロックの名前](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L95-L97)
- [Event Modeling の構文: データの型](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L309-L311)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-redefined-data.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-redefined-data.test.ts)

<!-- end auto-generated rule resources -->
