# @mmd-toolkit/c4-no-duplicate-style

英語版: [c4-no-duplicate-style.md](./c4-no-duplicate-style.md)

前の更新が与えた値を置き換えるスタイル更新を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`UpdateElementStyle` と `UpdateRelStyle` は、
要素、境界、関係のスタイルを設定し、
後の更新は、それが与える欄だけを置き換える。
ある欄をもう一度与えると、前の値はエラーなしに失われる。
`UpdateElementStyle(a, $bgColor="red")` の後の
`UpdateElementStyle(a, $bgColor="blue")` は、青い背景だけを残す。

## 規則の詳細

この規則は、`UpdateElementStyle` か `UpdateRelStyle` の引数のうち、
前の更新か同じ更新の前の引数がその欄に与えた値と違う値を、
対象の欄に与えるものを報告する。
対象の図種は `c4` である。
`UpdateElementStyle` は、初めからある境界 `global` を含めて要素か境界を、
`UpdateRelStyle` は関係を更新する。
mermaid.js の文法にほかのスタイル更新はない。

対象は、[c4-no-undef](./c4-no-undef.ja.md) が述べるとおり、
更新が見つけるものである。
更新より前に宣言したもののうち、
alias が最初の引数に等しい最初の要素か、なければ最初の境界、
または端点がその順で最初の 2 つの引数に等しい最初の関係である。
名前付きの `$alias`、`$from`、`$to` は後の更新が見つけるものを変え、
それが与える欄は比べない。
対象を見つけない更新は何も変えず、比べない。

欄は、`UpdateElementStyle` の 2 つ目の引数の `bgColor` のような
引数の位置の引数名か、
どの位置にあってもよい `$bgColor` のような名前付きの属性のキーである。
`UpdateElementStyle(a, "red", $bgColor="blue")` は `bgColor` を 2 度与える。
キーは大文字小文字を区別して比べる。
`$BgColor` は別の欄で、
[c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.ja.md)
が報告する。
宣言が与える値は比べない。
宣言がある欄に値を与えると、
その欄の前の更新の値は、その後の比較に使わない。
宣言が変えない欄の更新の値は保つ。

空の引数は、その欄に空の値を与える。
`UpdateElementStyle(a, $bgColor="red")` の後の
`UpdateElementStyle(a, , "white")` は、`red` を空の値で置き換える。
空の引数はそれ自身の文字を持たないので、規則はその更新を報告する。

欄がすでに持つ値と、対象がまだ持たない欄は報告しない。
`red` と `blue` の後の 3 つ目の `red` は、`blue` を置き換えるので報告する。
値は、両端の空白を除き、ほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
値を読む前にほかの文字に変え、
`UpdateRelStyle` の 5 つ目と 6 つ目の位置のずれを整数として読むので、
ずれの `10` と `010` のように、それだけが違う 2 つの値は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

対象の欄は、それぞれ 1 度だけ与える。
1 つの欄を与えるには、`UpdateElementStyle(a, $fontColor="white")` のように、
名前付きの属性を使う。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, $bgColor="blue")
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, , "white")
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, $fontColor="white")
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  Person(b, "B")
  Rel(a, b, "Uses")
  UpdateRelStyle(a, b, $textColor="red", $lineColor="blue")
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [c4-no-undef](./c4-no-undef.ja.md)
- [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.ja.md)

## 背景

[`updateElStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L494-L590)
と
[`updateRelStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L593-L638)
は、空の引数を含めて引数が与える欄を、それぞれ対象が持っていた値の上に代入する。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-duplicate-style.ts)
- [テストのソース](../../tests/rules/c4-no-duplicate-style.test.ts)

<!-- end auto-generated rule resources -->
