# @mmd-toolkit/state-no-undef

英語版: [state-no-undef.md](./state-no-undef.md)

どの状態も名指さない `style`、`class`、`click`、`note` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style`、`class`、`click`、ノートは、状態を名指す。
その名前が図のどの状態のものでもないとき、
mermaid.js はエラーなしにその文を受理する。
名前を打ち間違えても、エラーにならない。

## 規則の詳細

この規則は、そうした文の状態の名前のうち、
図のどの状態の id でもないものを報告する。
対象の図種は `stateDiagram` である。

図の状態は、単独で書いた状態、遷移、本体のある `state` の文、別名、
fork、join、choice が定義するもので、
図のどこにあっても、どの合成状態の中にあってもよい。
`A --> B` の後の `style Z fill:#f00` と `class Z c` は何も変えず、
`click Z href "…"` はどの状態もリンクにしない。
`note left of Z : x` は、ノートとともに新しい状態 `Z` を作り、
ほかのどの文も `Z` を定めていなければ、規則はそのノートを報告する。
そうした状態を名指すノートがいくつかあれば、報告するのは最初のものだけである。
mermaid.js は状態を 1 度だけ作り、後のノートはそれを指すからである。
ノートが作る状態は、`style`、`class`、`click` にとっては状態であり、
それらはどこにあってもその状態に効く。
`note left of Z : x` の後の `style Z fill:#f00` は `Z` にスタイルを付け、
報告するのはノートだけである。
一覧は名前ごとに確かめる。
`style A,Z fill:#f00` は `A` にスタイルを付け、`Z` を報告する。

名指す状態より前の文も、その状態に効く。
`A --> B` より前の `style A fill:#f00` は `A` にスタイルを付け、
`class` と `click` でも同じである。
合成状態の中では、`style` と `class` は、何を名指しても何も変えない。
規則は名前だけを確かめる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-undef: error
stateDiagram-v2
  A --> B
  style Z fill:#f00
```

```mmd
%% eslint @mmd-toolkit/state-no-undef: error
stateDiagram-v2
  A --> B
  note left of Z : x
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-undef: error
stateDiagram-v2
  A --> B
  style A fill:#f00
  note left of B : x
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-undef](./flowchart-no-undef.ja.md)
- [class-no-undef](./class-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/state-no-undef.ts)
- [テストのソース](../../tests/rules/state-no-undef.test.ts)

<!-- end auto-generated rule resources -->
