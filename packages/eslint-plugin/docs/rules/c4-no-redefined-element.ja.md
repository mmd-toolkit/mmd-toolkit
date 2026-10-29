# @mmd-toolkit/c4-no-redefined-element

英語版: [c4-no-redefined-element.md](./c4-no-redefined-element.md)

前のラベル、種類、型を置き換える要素や境界の宣言を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

形の alias は 1 つの要素を識別する。
別の宣言が同じ alias を使うと、mermaid.js は既存の要素をその位置で更新する。
異なるラベルや種類は前のものをエラーなしに置き換え、2 つ目の要素は作らない。

## 規則の詳細

この規則は、要素の種類を変える形の宣言と、
空でない文字列ラベルを異なる文字列ラベルに置き換える形の宣言を報告する。
対象の図種は `c4` である。

同じ alias を最初に書いた宣言ではなく、現時点で一致する要素と比べる。
ラベルが `First`、`Second`、`Second`、`First` なら、2 つ目と 4 つ目を報告する。
alias とラベルは、mermaid.js が引数を読むとおりに両端の空白を除き、
大文字小文字を区別する。
alias とラベルは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
読む前にほかの文字に変えるので、それだけが違う 2 つの alias やラベルは、
mermaid.js には同じで、この規則には違うことがある。
成功した省略可能な `$alias` の代入は、後の宣言が照合する alias を変える。
省略可能な `$label` は、ラベルの比較より前に適用する。

同じ種類とラベルを書き直しても報告しない。
初めて空でないラベルを与えるときも報告しない。
`Person(a,)` のようにラベルを省いた宣言は空のラベルを与え、
`Person(a, "First")` の後では報告する。
省いた technology と description は前の値を保つ。
`Container(a, "API", "Java", "Payments")` の後の `Container(a, "API")`
は両方を保つ。
この規則はラベルと種類を比べ、省略可能な説明、技術、親の変更、
スタイル更新は比べない。
スタイル更新が直接書いたラベルは、宣言の文字列ラベルとは別なので比較しない。

境界も同じく、ラベルと型で比べる。
同じラベルでもう一度書いた境界は、本体の要素をそれに足し、報告しない。
違うラベルは報告し、違う型も報告する。
型は、`Enterprise_Boundary` の `ENTERPRISE` のようにキーワードが与えるものか、
`Boundary` や `Node` の 3 つ目の引数に書いたものである。
型なしでもう一度書いた境界は、キーワードの既定の型 `system` か `node` を取る。
そのため `Boundary(b, "Bank", "company")` の後の `Boundary(b, "Bank")` は、
型 `company` を失うので報告する。
誰も書いていない既定の型と空の型は、失われたと数えない。
初めからある境界 `global` は、書き手が書いたラベルも型も持たないので、
`global` の宣言は比べない。

要素と境界の alias は別である。
境界の alias を使う要素は、どちらの 2 つ目の宣言でもなく、報告しない。
同じ接続先の組を持つ関係の繰り返しは、この規則の対象外である。

別の要素には別の alias を与えるか、種類とラベルを 1 度だけ書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Person(a, "Customer")
  Person(a, "Administrator")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Person(a, "Customer")
  System(a, "Customer")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Boundary(bank, "Bank") {
    Person(customer, "Customer")
  }
  Boundary(bank, "Branch") {
    System(atm, "ATM")
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Person(customer, "Customer")
  Person(admin, "Administrator")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Person(a, "Customer")
  Person(a, "Customer")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Container(a, "API", "Java", "Payments")
  Container(a, "API")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Person(a, "")
  Person(a, "Customer")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Boundary(bank, "Bank") {
    Person(customer, "Customer")
  }
  Boundary(bank, "Bank") {
    System(atm, "ATM")
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [c4-no-undef](./c4-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-redefined-element.ts)
- [テストのソース](../../tests/rules/c4-no-redefined-element.test.ts)

<!-- end auto-generated rule resources -->
