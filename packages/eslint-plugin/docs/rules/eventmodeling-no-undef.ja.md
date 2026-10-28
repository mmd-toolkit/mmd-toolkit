# @mmd-toolkit/eventmodeling-no-undef

英語版: [eventmodeling-no-undef.md](./eventmodeling-no-undef.md)

何も名指さない source やデータの参照を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

time frame は、`->>` の後にその番号で source を名指し、
`[[` と `]]` の間にその名前でデータブロックを名指す。
その名前がどのフレームの名前でも、どのデータブロックの名前でもないと、
mermaid.js はエラーなしに受理し、その source からの関係も、
その参照のデータも描かない。

## 規則の詳細

この規則は、どのフレームも名指さない `tf` や `timeframe` の文の source と、
どの `data` ブロックも名指さないフレームの `[[ ]]` の参照を報告する。
対象の図種は `eventmodeling` である。

`tf 01 ui Cart` の後で、フレーム `tf 02 cmd Buy ->> 99` は関係を持たない。
source を持つフレームは、その source からだけ関係を描き、
前のフレームからは描かない。
`data Payload` があるとき、
フレーム `tf 01 evt Bought [[Paylod]]` はデータを示さない。
`tf 01 evt Bought [[Paylod]] {fallback }` のようにインラインのデータがあると、
ブロックの代わりにインラインのデータを示す。

参照の後に宣言したフレームやデータブロックも数える。
名前は大文字小文字を区別して、書いたとおりに比べる。
`1`、`01`、`001` は 3 つのフレームを名指す。
後に宣言したフレームを名指す source も数える。
ただし mermaid.js は、フレームを置くときにその関係を描くので、
そこからの関係は描かない。
reset frame（`rf` や `resetframe`）の source は調べない。
mermaid.js は、source が何を名指しても reset frame の関係を描かないからである。
`note` と `gwt` が名指すフレームも調べない。
mermaid.js はどちらの文も描かないからである。

名前を直すか、フレームやデータブロックを宣言する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 ui Cart
  tf 02 cmd Buy ->> 99
```

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 evt Bought [[Paylod]]
  data Payload {
items
}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 ui Cart
  tf 02 cmd Buy ->> 01
```

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 evt Bought [[Payload]]
  data Payload {
items
}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [eventmodeling-no-redefined-data](./eventmodeling-no-redefined-data.ja.md)

## 背景

[`getState`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L106-L128) は、
source が番号を与えるフレームを取ってそれぞれから関係を描き、
source のないフレームにだけ、前のフレームからの関係を推して描く。
[`decidePositionRelation`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L570-L593) は、
reset frame の関係も、まだ置いていないフレームからの関係も描かない。
[フレームのデータ](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L339-L362) は、
その名前の最初のデータブロックであり、
その名前のブロックがなければインラインのデータである。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-undef.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-undef.test.ts)

<!-- end auto-generated rule resources -->
