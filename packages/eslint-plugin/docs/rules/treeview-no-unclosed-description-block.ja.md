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

この規則は、`accDescr`、空白かタブか何もなし、`{` の順で始まる名前の
ノードを報告する。
対象の図種は `treeView` である。

`accDescr { Project files` の後では、
ツリーは `accDescr { Project files` という名前のファイルを持ち、説明は空である。
行の終わりに `{` があるブロックは `accDescr {` という名前のファイルを作り、
その文字の行もファイルになる。
`"accDescr { Project files"` のような引用符の中の名前は、
名前として書いたものであり、報告しない。

`a}b` という名前のファイルのように後の行にある `}` はブロックを閉じ、
そこまでの行は説明になってツリーから消える。
この規則はそのようなブロックを報告しない。

説明が終わるところでブロックを閉じる。

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

## 背景

[ブロックの終端記号](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treeView/treeView.langium#L15-L15)
は `}` のあるブロックにだけ合い、
[名前の終端記号](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treeView/treeView.langium#L57-L57)
は行の残りをノードの名前として取る。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/treeview-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/treeview-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
