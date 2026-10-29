# @mmd-toolkit/block-no-duplicate-columns

英語版: [block-no-duplicate-columns.md](./block-no-duplicate-columns.md)

ブロックの列の数を変える `columns` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`columns` は、図や複合ブロックの列の数を設定する。
mermaid.js は別の `columns` をエラーなしに受理し、前に書いたブロックも含めて、
最後の数をブロック全体に使う。
前の数で、それまでの部分の配置を保つことはできない。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
`columns` の文のうち、
同じブロックの直前の `columns` が設定した列の数を変えるものを報告する。
図とそれぞれの複合ブロックは別々の数を持ち、`end` の後の文は、
また外側のブロックに属する。

数は数として比べるので、`columns 2` の後の `columns 02` は報告しない。
`auto` は、`0` を含めてどの数とも異なる。
`columns 2` と `columns 3` の後の `columns 2` は、`3` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-columns: error
block
  columns 2
  A B
  columns 3
  C
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-columns: error
block
  columns 2
  block:G
    columns 3
    A
  end
  B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-duplicate-block](./block-no-duplicate-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-duplicate-columns.ts)
- [テストのソース](../../tests/rules/block-no-duplicate-columns.test.ts)

<!-- end auto-generated rule resources -->
