# @mmd-toolkit/c4-no-redefined-element

英語版: [c4-no-redefined-element.md](./c4-no-redefined-element.md)

前のラベル、種類、型を置き換える要素や境界の宣言を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

形の alias は 1 つの要素を識別する。
mermaid.js は同じ alias の別の宣言をエラーなしに受理し、
既存の要素をそのまま更新する。
異なるラベルや種類は前のものを置き換え、2 つ目の要素は作らない。

## 規則の詳細

この規則は、C4 図（`C4Context`、`C4Container`、`C4Component`、`C4Dynamic`、
`C4Deployment`）に当てる。
要素の種類を変える宣言か、
空でない文字列ラベルを異なる文字列ラベルで置き換える宣言を報告する。
その時点で一致する要素と比べるので、ラベルが `First`、`Second`、`Second`、
`First` なら、2 つ目と 4 つ目を報告する。
alias とラベルは両端の空白を除き、大文字小文字を区別して書いたとおりに比べ、
文字参照や HTML 属性の引用符によって mermaid.js と読みが異なることがある。

省略可能な `$alias` は後の宣言の照合を変え、`$label` は比較より前に適用する。
同じ種類とラベルの繰り返しや、最初の空でないラベルは報告しない。
`Person(a,)` のようなラベルの省略は、空でないラベルの後では報告する。

省略可能な説明、技術、親の変更、スタイル更新は比べず、
省略した技術と説明は前の値を保つ。
スタイル更新が直接書いたラベルは、宣言のラベルとして比べない。

境界はラベルと型で比べ、同じラベルの繰り返しは、本体の要素を足しても報告しない。
キーワードや第 3 引数が与える型の変更は報告し、
書いた型をキーワードの既定値 `system` や `node` に置き換える場合も含む。
書いていない既定の型と空の型は失われる前の値として数えず、
境界 `global` の宣言は報告しない。

要素と境界の alias は別なので、両者の同じ alias は報告しない。
同じ接続先の組を持つ関係の繰り返しは調べない。

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
