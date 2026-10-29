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

この規則は、イベントモデリング図（`eventmodeling`）に当てる。
どのフレームも名指さない `tf` や `timeframe` の文の source と、
どの `data` ブロックも名指さないフレームの `[[ ]]` の参照を報告する。
参照の後に宣言したフレームやデータブロックも数える。
どの `data` ブロックも名指さない `[[ ]]` の参照は、
フレームがインラインのデータを持ち、
mermaid.js がそれを代わりに示すときも報告する。
名前は大文字小文字を区別して書いたとおりに比べるので、`1`、`01`、
`001` は 3 つのフレームを名指す。

後のフレームを名指す source は、mermaid.js がそこからの関係を描かないが、
報告しない。

reset frame（`rf`、`resetframe`）の source は、
何を名指しても mermaid.js が関係を描かないので調べないが、
その `[[ ]]` の参照は調べる。
`note` と `gwt` が名指すフレームも、
mermaid.js がどちらの文も描かないので調べない。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-undef.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-undef.test.ts)

<!-- end auto-generated rule resources -->
