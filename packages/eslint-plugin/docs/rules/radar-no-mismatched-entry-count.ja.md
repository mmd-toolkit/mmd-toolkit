# @mmd-toolkit/radar-no-mismatched-entry-count

英語版:
[radar-no-mismatched-entry-count.md](./radar-no-mismatched-entry-count.md)

軸の数と違う数の値を、軸の名前なしに持つ曲線を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`curve sales{1, 2, 3}` のように値だけで書いた曲線は、それを順に軸に与える。
曲線の値が図の軸より多いか少ないと、mermaid.js はエラーなしに受理し、
曲線をまったく描かず、凡例の項目だけが残る。

## 規則の詳細

この規則は、値が軸の名前を持たず、その数が図の軸の数と違う曲線を報告する。
対象の図種は `radar` である。

`axis A, B, C` の後では、
`curve sales{1, 2}` も `curve sales{1, 2, 3, 4}` も描画から除かれ、
その一部も描かれない。
軸のない図の値の曲線も報告する。

図のすべての軸を数え、曲線の後に宣言した軸も、前に宣言した名前の軸も数える。
いくつかの曲線を持つ `curve` 文の曲線は、それぞれ調べる。
`curve sales{A: 1, B: 2, C: 3}` のように軸の名前を持つ曲線は報告しない。
どの軸も名指さない値は [radar-no-undef](./radar-no-undef.ja.md) が報告し、
欠けた値は mermaid.js が受理しない。

曲線には軸ごとに値を 1 つ与える。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-mismatched-entry-count: error
radar-beta
  axis A, B, C
  curve sales{1, 2}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-mismatched-entry-count: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [radar-no-undef](./radar-no-undef.ja.md)

## 背景

[`drawCurves`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/renderer.ts#L135-L173)
は、値の数が軸の数でない曲線を飛ばす。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-mismatched-entry-count.ts)
- [テストのソース](../../tests/rules/radar-no-mismatched-entry-count.test.ts)

<!-- end auto-generated rule resources -->
