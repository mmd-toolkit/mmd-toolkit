# @mmd-toolkit/block-no-duplicate-columns

英語版: [block-no-duplicate-columns.md](./block-no-duplicate-columns.md)

ブロックの列の数を変える `columns` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`columns` は、図や複合ブロックの列の数を設定する。
mermaid.js は同じブロックの 2 つ目の `columns` をエラーなしに受理し、
最後のものが、その前に書いたブロックも含めて、ブロック全体の数を設定する。
`columns 2`、`A B`、`columns 3`、`C` の後、
3 つのブロックはすべて 3 列の 1 行にある。

## 規則の詳細

この規則は、ブロックの最初のものより後の `columns` の文を、
前と違う数を設定するときに報告する。
対象の図種は `block` である。

図とそれぞれの複合ブロックは自分の数を持ち、
`end` の後の文は、また外側のブロックに属する。
数は数として比べるので、
`columns 2` の後の `columns 02` は同じ数を設定し、報告しない。
`auto` は、`0` も含めて、どの数とも違う数である。
`columns 2` と `columns 3` の後の 3 つ目の `columns 2` は、
`3` を置き換えるので報告する。

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
