# @mmd-toolkit/treeview-no-duplicate-title

英語版:
[treeview-no-duplicate-title.md](./treeview-no-duplicate-title.md)

前に設定したアクセシブルなタイトルを置き換える `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ツリービューは、`accTitle` が設定するアクセシブルなタイトルを 1 つ持つ。
後の `accTitle` は、前に設定したタイトルをエラーなしに置き換え、
前のタイトルは失われる。

## 規則の詳細

この規則は、
前の `accTitle` が設定した空でないアクセシブルなタイトルを変える `accTitle` 文を報告する。
対象の図種は `treeView` である。

`accTitle: First` と `accTitle: Second` の後では、
アクセシブルなタイトルは `Second` である。
文字のない、または空白だけの `accTitle:` はタイトルを空にする。
`accTitle: First` の後では `First` が失われるので報告する。
次の行をタイトルとして取ることはない。
空のタイトルの後の文は何も失わず、報告しない。
mermaid.js はツリービューのタイトルを描かないので、`title` は比べない。

図がすでに持つタイトルを設定する文は報告しない。
タイトルは mermaid.js が保つとおりに、両端の空白を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べるので、
`accTitle: First  report` は `accTitle: First report` と同じタイトルを設定する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。
タイトルはそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
タイトルを読む前にほかの文字に変え、
罫線の文字で始まる行のタブを 4 つの空白として読むので、
それだけが違う 2 つのタイトルは、 mermaid.js には 1 つで、
この規則には 2 つのことがある。

`accTitle` 文は 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/treeview-no-duplicate-title: error
treeView-beta
  accTitle: First
  accTitle: Second
  root/
    file
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/treeview-no-duplicate-title: error
treeView-beta
  accTitle: Second
  root/
    file
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [treeview-no-duplicate-description](./treeview-no-duplicate-description.ja.md)

## 背景

[値の変換](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L57-L60) は、
タイトルの両端の空白を除き、 2 つ以上の空白やタブの連なりを 1 つの空白にする。
パーサーは最後のタイトルを保ち、
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14) は、
それが空でないときだけそれを設定する。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/treeview-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/treeview-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
