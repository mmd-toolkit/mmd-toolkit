# @mmd-toolkit/c4-no-undef

英語版: [c4-no-undef.md](./c4-no-undef.md)

読まれるときに対象のないスタイル更新を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`UpdateElementStyle` と `UpdateRelStyle` は、
mermaid.js が更新を読むときにある要素、境界、関係のスタイルを変える。
alias を書き誤ったときや、対象より前に更新を書いたときのように、
そうした対象がなければ、mermaid.js は更新をエラーなしに受理し、何も変えない。

## 規則の詳細

この規則は、読まれるときにどの要素も境界も持たない
`UpdateElementStyle` の対象と、
読まれるときにどの関係も持たない端点の順の組を持つ `UpdateRelStyle` を報告する。
対象の図種は `c4` である。

要素、境界、関係は宣言から後にあり、初めからある境界 `global` は最初からある。
`Person(customer, "Customer")` の後の `UpdateElementStyle(custmer, "red")` は、
何も変えない。
対象より前に書いた更新も報告する。
mermaid.js は後に続く宣言に何も当てず、
mermaid.js の文書は更新を図の終わりに書く。
alias は大文字小文字を区別し、両端の空白を除いて比べる。
alias は書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
alias を読む前にほかの文字に変えるので、
それだけが違う 2 つの alias は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

関係は、`BiRel` でも、端点を書いた順に持つ。
`Rel(a, b, "Uses")` の後の `UpdateRelStyle(b, a, "red")` は何も変えない。
宣言や前の更新の名前付きの `$alias`、`$from`、`$to` は、
後の更新が見つけるものを変える。
`Person(a, "A")` と `UpdateElementStyle(a, $alias="b")` の後の
`UpdateElementStyle(a, "red")` は何も変えない。
端点の位置に `$from` と `$to` を書いた関係は、更新が名指せる端点を持たない。
対象のない更新は、それぞれ報告する。

どの要素も境界も宣言しない端点を持つ関係は報告しない。
mermaid.js はそれを受理するが、図を描くときに、その関係を挙げるエラーで止まる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-undef: error
C4Context
  Person(customer, "Customer")
  UpdateElementStyle(custmer, "red")
```

```mmd
%% eslint @mmd-toolkit/c4-no-undef: error
C4Context
  UpdateElementStyle(customer, "red")
  Person(customer, "Customer")
```

```mmd
%% eslint @mmd-toolkit/c4-no-undef: error
C4Context
  Person(a, "A")
  Person(b, "B")
  Rel(a, b, "Uses")
  UpdateRelStyle(b, a, "red")
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-undef: error
C4Context
  Person(customer, "Customer")
  UpdateElementStyle(customer, "red")
```

```mmd
%% eslint @mmd-toolkit/c4-no-undef: error
C4Context
  Person(a, "A")
  Person(b, "B")
  Rel(a, b, "Uses")
  UpdateRelStyle(a, b, "red")
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.ja.md)
- [c4-no-redefined-element](./c4-no-redefined-element.ja.md)

## 背景

[`updateElStyle` と `updateRelStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L494-L670)
は、呼ばれるときにある対象を探し、
[`getC4Shape`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L693-L700)
は、要素が合わないときに境界を探す。
端点の分からない関係では、
[`drawRels`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Renderer.ts#L416-L422)
がエラーを投げる。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-undef.ts)
- [テストのソース](../../tests/rules/c4-no-undef.test.ts)

<!-- end auto-generated rule resources -->
