# @mmd-toolkit/block-no-spaced-class-id

英語版: [block-no-spaced-class-id.md](./block-no-spaced-class-id.md)

`class` の文の id の、コンマの前後の空白を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

`class A,B c` は、両方のブロックにクラス `c` を与える。
mermaid.js はコンマの後の空白を次の id の一部として読むため、
`class A, B c` では意図した `B` にクラスが付かない。
誤った位置の空白にエラーは出さない。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
`class` の文の、空白で始まる id と、コンマで始まるクラス名を報告する。

コンマの前の空白は id を終えるので、`class A ,B c` の id は `A` だけで、
クラス名 `,B c` を報告する。
コンマの後の空白、タブ、改行は、`root` の前も含めて報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-spaced-class-id: error
block
  A B
  classDef c fill:#f00
  class A, B c
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-spaced-class-id: error
block
  A B
  classDef c fill:#f00
  class A,B c
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-undef](./block-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-spaced-class-id.ts)
- [テストのソース](../../tests/rules/block-no-spaced-class-id.test.ts)

<!-- end auto-generated rule resources -->
