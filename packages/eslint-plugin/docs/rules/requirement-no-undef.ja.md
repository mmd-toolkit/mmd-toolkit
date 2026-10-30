# @mmd-toolkit/requirement-no-undef

英語版: [requirement-no-undef.md](./requirement-no-undef.md)

どの requirement も element も名指さない、 `style`、`class`、`:::`、
関係の名前を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style`、`class`、`:::` は、スタイルを与える requirement と element を名指し、
関係は、結ぶ 2 つを名指す。
名前がそのどれのものでもないとき、mermaid.js はエラーなしに文を受理する。
`style`、`class`、`:::` は何も変えず、関係はその端で箱を結ばない。
名前を書き間違えても、エラーにならない。

## 規則の詳細

この規則は、要求図（`requirementDiagram`）に当てる。
`style`、`class`、`:::` と関係の両端の各名前のうち、
図のどの requirement も element も持たないものを報告する。
名前は大文字小文字を区別するが、名前を囲む引用符は名前を変えない。

一覧の名前はそれぞれ調べるが、
`style` は最初の未知の名前でスタイルの適用を止める。
名指す requirement や element より前の `style` や `class` の文は、
mermaid.js がそこで何もしなくても、図の箱を正しく名指しているので報告しない。
結ぶ箱より前に書いた関係は、mermaid.js がそれらを結ぶので報告しない。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/requirement-no-undef.ts)
- [テストのソース](../../tests/rules/requirement-no-undef.test.ts)

<!-- end auto-generated rule resources -->
