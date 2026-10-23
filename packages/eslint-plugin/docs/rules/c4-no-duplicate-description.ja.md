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

この規則は、直前の空でない説明設定文と、
保存される値が異なる説明設定文を報告する。
対象の図種は `c4` である。

3 つの形式を、境界の内側も含めて一緒に比べる。
3 つ目は最初の文ではなく 2 つ目と比べる。
保存される説明が同じなら報告しない。
保存時に CR と CRLF は LF になり、改行の後の空白は除かれるので、
その字下げだけの違いは報告しない。
`accDescription` は最初の区切りの後の余分な空白を残し、
コロン形式とブロック形式は両端の空白を除く。

空の説明ブロックは何も変えず、報告も、直前の設定文としての比較も行わない。
コロン形式の値が後の行にあっても、空行、コメント行、指令行を挟んでも、
その値を設定する。
整形がその値をコロンの行へ移しても、前の説明の置換は変わらない。

説明は 1 つ書き、複数行にはブロックを使う。

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
