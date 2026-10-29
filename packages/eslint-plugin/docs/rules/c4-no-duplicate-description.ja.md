# @mmd-toolkit/c4-no-duplicate-description

英語版: [c4-no-duplicate-description.md](./c4-no-duplicate-description.md)

異なる図の説明を置き換える説明文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`accDescription`、`accDescr:`、空でない `accDescr { ... }` は、
1 つの共通の説明を設定する。
mermaid.js は異なる 2 つ目の説明をエラーなしに受理し、前の説明は失われる。

## 規則の詳細

この規則は、C4 図（`C4Context`、`C4Container`、`C4Component`、`C4Dynamic`、
`C4Deployment`）に当てる。
直前の空でない説明と違う説明を、
境界の中も含めて 3 つの形式を一緒に比べて報告する。
同じ説明の繰り返しは報告しない。
`accDescr: a`、`accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。

CR と CRLF は LF として比べ、改行の後の空白は無視する。
`accDescription` は最初の区切りの後の余分な空白を残し、
コロン形式とブロック形式は両端の空白を除く。

空の説明ブロックは何も変えず、報告も、その後の比較への使用もしない。
コロン形式の値が後の行にあっても、空行、コメント行、
ディレクティブの行を挟んでも、その値を設定する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-description: error
C4Context
  accDescr: Customers
  accDescr: Administrators
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-description: error
C4Context
  accDescription Customers
  accDescr { Administrators }
  accDescr: Customers
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-description: error
C4Context
  accDescription Customers
  accDescr { Customers }
  accDescr: Customers
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-description: error
C4Context
  accDescr: Customers
  accDescr {}Person(a, "A")
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-description: error
C4Context
  accDescr { Customers
  use the bank }
  accDescr { Customers
 use the bank }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [c4-no-duplicate-title](./c4-no-duplicate-title.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/c4-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
