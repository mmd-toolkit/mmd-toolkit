# @mmd-toolkit/requirement-no-undef

英語版: [requirement-no-undef.md](./requirement-no-undef.md)

どの requirement も element も名指さない、
`style`、`class`、`:::`、関係の名前を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style`、`class`、`:::` は、スタイルを与える requirement と element を名指し、
関係は、結ぶ 2 つを名指す。
名前がそのどれのものでもないとき、mermaid.js はエラーなしに文を受理する。
`style`、`class`、`:::` は何も変えず、関係はその端で箱を結ばない。
名前を書き間違えても、エラーにならない。

## 規則の詳細

この規則は、`style`、`class`、`:::` の文の名前と、関係の端のうち、
図のどの requirement の名前でも element の名前でもないものを報告する。
対象の図種は `requirement` である。

`requirement r` の後、`style rr fill:red` と `rr:::c` は何も変えず、
`r - satisfies -> ee` は、端 `ee` が箱でない関係を加える。
関係の始まりの側と、`r <- copies - ee` も同じである。
一覧の名前はそれぞれ調べる。
`class missing,r,e a` は `r` と `e` にクラス `a` を与え、`missing` を報告する。
`style` は箱でない最初の名前で止まる。
`style r,missing,s fill:red` は `r` にスタイルを与え、`s` には与えず、
`missing` を報告する。

図の名前は、その requirement と element の名前である。
引用符で囲んだ名前は、囲まない名前と同じ名前である。
`requirement "r"` の後の `style r` はそれにスタイルを与える。
名前は大文字小文字で区別する。
`requirement r` の後の `style R` は報告する。
名指す requirement や element より前に書いた `style` や `class` の文は、
mermaid.js では何も変えない。
そうした文は図の箱を名指しており、正しく書かれているので、規則は報告しない。
関係は、結ぶ箱より前に書いてもよい。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-undef: error
requirementDiagram
  requirement r {
    id: 1
  }
  style rr fill:red
```

```mmd
%% eslint @mmd-toolkit/requirement-no-undef: error
requirementDiagram
  requirement r {
    id: 1
  }
  element e {
    type: simulation
  }
  r - satisfies -> ee
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-undef: error
requirementDiagram
  requirement r {
    id: 1
  }
  element e {
    type: simulation
  }
  r - satisfies -> e
  style r fill:red
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [er-no-undef](./er-no-undef.ja.md)
- [requirement-no-duplicate-name](./requirement-no-duplicate-name.ja.md)

## 背景

mermaid.js は、`style`、`class`、`:::` の名前をテキストを読む間に探し、
`style` は見つからない最初の名前で戻る
（[`setCssStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L226-L240) と
[`setClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L242-L255)）。
関係の端は、図を描くときに探す
（[`getData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L292-L325)）。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/requirement-no-undef.ts)
- [テストのソース](../../tests/rules/requirement-no-undef.test.ts)

<!-- end auto-generated rule resources -->
