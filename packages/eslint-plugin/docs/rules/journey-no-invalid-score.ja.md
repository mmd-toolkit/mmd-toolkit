# @mmd-toolkit/journey-no-invalid-score

英語版: [journey-no-invalid-score.md](./journey-no-invalid-score.md)

1 から 5 の数でないタスクの score を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`Make tea: 5 Me` のようにコロンを落とすか、
`Lunch at 12:30: 4: Me` のようにタスクの名前にコロンを書くと、
ほかのテキストが score に入る。
mermaid.js はそれをエラーなしに受理し、数でない score は顔の場所を与えず、
目盛りの外の数は顔を外に置く。
タスクの score は、最初のコロンと 2 つ目のコロンの間のテキストで、
1 から 5 の数であり、それがジャーニーの目盛りの上にタスクの顔を置く。

## 規則の詳細

この規則は、mermaid.js が読んだタスクの score が数でないとき、
または 1 より小さいか 5 より大きい数のときに、それを報告する。
対象の図種は `journey` である。

mermaid.js は score を、端の空白を除いて、JavaScript の `Number` で読む。
`Make tea: 5 Me` では人の前のコロンが落ちており、 score は数でない `5 Me` で、
人はいない。
`Make tea: 5, Me` も同じで、
`A: 5 B: 3` のように同じ行に 2 つ目のタスクを書くと、 score は `5 B` になる。
タスクの名前の中のコロンは、名前を終える。
`Lunch at 12:30: 4: Me` は、
フォーマッターが `Lunch at 12: 30: 4: Me` と印字するとおり、
タスク `Lunch at 12` で、score は 30、人は `4` であり、
`Meet at 9:00: 3` の score は 0 である。
`A: : x` のように空か空白だけの score は数 0 で、規則はそのタスクを報告する。
ほかの形の数も数として読む。
`3.5` と `0x3` は目盛りの中にあり、報告しない。
`1e2`、`-2`、`Infinity` は外にある。
`a: 5 %% c` のように score の中に書いたコメントは、score の一部である。

それぞれの報告が出力について示すこと:

- `5 Me` のように数でない score は失われる。
  顔は場所を持たず、score の中に書いた人もともに失われる。
- `7`、`0`、`-2`、`1e2`、`Infinity` のように目盛りの外の数は、
  score の働きである、顔を目盛りの上に置くことをしない。
  [mermaid.js の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/userJourney.md#L22-L24)は、
  score を 1 から 5 の数（両端を含む）と定めており、
  mermaid.js は顔を目盛りの外に描く。
- 空の score は、書いていない score 0 を加え、これも目盛りの外である。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 5 Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 7: Me
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 1: Me, Cat
```

## オプション

この規則にはオプションがない。

## 背景

mermaid.js は score を `Number` で数にし（[`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84)）、
ジャーニーを描くときに、
それで顔を置く（[`drawTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/svgDraw.js#L216-L220)）。
その文書（[syntax/userJourney.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/userJourney.md#L24)）は、
score は 1 から 5 までの数だと言う。
[#6262](https://github.com/mermaid-js/mermaid/issues/6262) （"Faces in Journey
Diagram Out of Bound"）は、ラベル "Type: Bug / Error" と "Status:
Approved" を持って開いており、
7 より大きい score で顔がジャーニーの線の上に描かれると報告する。
[#4248](https://github.com/mermaid-js/mermaid/issues/4248) （"Add scale
customization to User Journey"）は、enhancement として開いており、
書き手が選ぶ目盛りを提案する。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/journey-no-invalid-score.ts)
- [テストのソース](../../tests/rules/journey-no-invalid-score.test.ts)

<!-- end auto-generated rule resources -->
