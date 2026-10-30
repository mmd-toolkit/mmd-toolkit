# @mmd-toolkit/treeview-no-unclosed-description-block

英語版:
[treeview-no-unclosed-description-block.md](./treeview-no-unclosed-description-block.md)

どの `}` も閉じない `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`accDescr {` のブロックは、その `}` まで続く。
`}` がないと、mermaid.js はエラーなしにその行をノードとして読む。
ブロックの文字はファイルの名前になり、ツリービューは説明を持たない。

## 規則の詳細

この規則は、ツリービュー（`treeView-beta`）に当てる。
`accDescr`、空白かタブか何もなし、`{` の順で始まる名前のノードを報告する。
`"accDescr { Project files"` のような引用符の中の名前は、
名前として書いたものなので報告しない。
後の行の `}` は、`a}b` のようなファイル名の中でもブロックを閉じ、
そこまでの行を説明にするので、そのようなブロックは報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/treeview-no-unclosed-description-block: error
treeView-beta
  accDescr { Project files
  root/
    file
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/treeview-no-unclosed-description-block: error
treeView-beta
  accDescr { Project files }
  root/
    file
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [treeview-no-empty-description-block](./treeview-no-empty-description-block.ja.md)
- [treeview-no-duplicate-description](./treeview-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/treeview-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/treeview-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
