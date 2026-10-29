# @mmd-toolkit/c4-no-undef

英語版: [c4-no-undef.md](./c4-no-undef.md)

読まれるときに対象のないスタイル更新を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`UpdateElementStyle` と `UpdateRelStyle` は、
mermaid.js が更新を読む時点で存在する対象を変える。
alias を書き誤ったときや対象より前に更新を書いたときは、
mermaid.js は更新をエラーなしに受理し、何も変えない。

## 規則の詳細

この規則は、C4 図（`C4Context`、`C4Container`、`C4Component`、`C4Dynamic`、
`C4Deployment`）に当てる。
現時点のどの要素や境界にも alias が一致しない `UpdateElementStyle` と、
どの関係にも順序付きの端点が一致しない `UpdateRelStyle` を、それぞれ報告する。
対象は宣言した後から使え、境界 `global` は初めから使える。

対象より前の更新は、後の宣言に作用しないので報告する。
alias は両端の空白を除き、大文字小文字を区別して書いたとおりに比べるが、
mermaid.js は文字参照や HTML 属性の引用符を変換するので、
この規則が異なるとする alias を同じとすることがある。

関係の端点は `BiRel` でも順序を持つので、逆順なら報告する。
宣言や前の更新の `$alias`、`$from`、`$to` が対象の名前を変えた後、
古い名前を使う更新は報告する。
端点の位置に `$from` と `$to` を書いた関係は更新が名指せる端点を持たないので、
その関係への `UpdateRelStyle` は常に報告する。

端点が未定義の関係は、mermaid.js が描画時にエラーで止まるので報告しない。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-undef.ts)
- [テストのソース](../../tests/rules/c4-no-undef.test.ts)

<!-- end auto-generated rule resources -->
