# @mmd-toolkit/treeview-no-duplicate-annotation

英語版:
[treeview-no-duplicate-annotation.md](./treeview-no-duplicate-annotation.md)

1 つのノードの同じ種類の注釈を置き換える注釈を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ツリービューのノードは、注釈 `:::`、`icon()`、`##` が与えるクラス、アイコン、
説明を 1 つずつまで持つ。
ある種類の後の注釈は、前のものをエラーなしに置き換え、前の値は失われる。

## 規則の詳細

この規則は、同じ種類の前の注釈が同じノードに与えた空でない値を変えるクラス、
アイコン、`##` の説明を報告する。
対象の図種は `treeView` である。

`file :::highlight :::muted` の後では、ノードはクラス `muted` だけを持ち、
強調は描かれない。
`file icon(file) icon(folder)` の後ではフォルダーのアイコンだけが描かれ、
`file icon(file) icon()` の後ではアイコンは描かれない。
`file ## First` の次の行の `## Second` のように後の行にある注釈は、コメント行、
空の行、指示子を挟んでも、その前のノードのものである。
3 つの種類は別であり、クラスとアイコンは互いを置き換えない。
後の注釈はその直前のものと比べる。
`:::highlight`、`:::muted`、`:::highlight` の後では、
後の 2 つのクラスを報告する。

ノードがすでに持つ値を与える注釈は報告しない。
クラスは大文字小文字を区別して名前で比べる。
アイコンは、mermaid.js が設定なしに解決するとおりに比べる。
`icon()` と `icon(none)` はどちらもアイコンを隠し、
`file` のようなパックのない名前は、
組み込みのパックの名前 `mermaid-treeview:file` である。
アイコンを隠すことも値であり、`icon()` の後の `icon(file)` は報告する。
この規則は設定を読まない。
`defaultIconPack` がパックを名指すと、
`file` と `folder` のほかのパックのない名前はそのパックのアイコンなので、
`icon(mark)` と `icon(custom:mark)` は、 mermaid.js には 1 つで、
この規則には 2 つのことがある。

説明は、両端の空白を除き、内側の空白はそのまま比べる。
`## First  line` と `## First line` は 2 つの説明である。
文字のない `##` は説明を与えない。
説明の後ではそれを報告し、その後の注釈は何も失わない。
説明はそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML を、
説明を示す前にほかの文字に変え、
罫線の文字で始まる行のタブを 4 つの空白として読むので、
それだけが違う 2 つの説明は、 mermaid.js には 1 つで、
この規則には 2 つのことがある。
その行の `##` の後の文字は説明のものであり、
`## note :::highlight` は説明 `note :::highlight` を与え、クラスを与えない。

ノードの注釈は種類ごとに 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/treeview-no-duplicate-annotation: error
treeView-beta
  file :::highlight :::muted
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/treeview-no-duplicate-annotation: error
treeView-beta
  file :::highlight icon(file) ## note
```

## オプション

この規則にはオプションがない。

## 背景

[文法](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treeView/treeView.langium#L59-L64)
はノードの各種類の最後の注釈を保ち、
[パーサー](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treeView/parser.ts#L11-L39)
はノードに、そのクラス、空のものを `none` としたそのアイコン、その説明を与える。
[`getNodeIcon`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treeView/icons.ts#L57-L100)
は `none` でアイコンを隠し、 `defaultIconPack` がほかのパックを名指さなければ、
パックのない名前を組み込みのパックに入れる。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/treeview-no-duplicate-annotation.ts)
- [テストのソース](../../tests/rules/treeview-no-duplicate-annotation.test.ts)

<!-- end auto-generated rule resources -->
