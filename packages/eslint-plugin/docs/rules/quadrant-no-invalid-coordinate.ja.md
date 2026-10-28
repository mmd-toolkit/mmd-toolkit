# @mmd-toolkit/quadrant-no-invalid-coordinate

英語版:
[quadrant-no-invalid-coordinate.md](./quadrant-no-invalid-coordinate.md)

0 から 1 の数でない点の座標を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js の文書は、点の座標を `A: [0.3, 0.6]` のように 0 から 1 の数で書く。
mermaid.js は、`0,3` のように小数点の位置にほかの文字を書いた座標も受理し、
テキストを書いたとおりに持つ。
点を描くとき、mermaid.js はそのテキストを JavaScript の数として読む。
`0,3` と `0 3` は数でなく、点はエラーなしにチャートの中の位置に描かれない。
`0x5` は 16 進数の 5 であり、チャートの外の遠くにある。

## 規則の詳細

この規則は、点の座標のうち、
mermaid.js が 0 から 1 の数として読まないものを報告する。
`0,3`、`0 3`、`0b2` のように JavaScript の数でないものと、 `0x5` や、
3 である `003` のように 0 から 1 の外の数である。
対象の図種は `quadrantChart` である。

JavaScript が 0 から 1 の数として読む座標は、
mermaid.js の文書の書き方でなくても報告しない。
`0e5` は 0、`0b1` は 1 であり、点はその位置に描かれる。

`A: [0,3, 0,6]` のような小数点のコンマは、そうした座標を 2 つ与え、
両方を報告する。
座標はそれぞれ確かめ、`A: [0.3, 0,6]` は 2 つ目を報告する。
`1.5` のような 1 より大きい座標と、`-0.5` のような 0 より小さい座標は、
`1.0` と同じく mermaid.js が拒否するので、報告しない。
座標の中の指令は、読む前に取り除く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-coordinate: error
quadrantChart
  Campaign A: [0,3, 0,6]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-coordinate: error
quadrantChart
  Campaign A: [0.3, 0.6]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [journey-no-invalid-score](./journey-no-invalid-score.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-invalid-coordinate.ts)
- [テストのソース](../../tests/rules/quadrant-no-invalid-coordinate.test.ts)

<!-- end auto-generated rule resources -->
