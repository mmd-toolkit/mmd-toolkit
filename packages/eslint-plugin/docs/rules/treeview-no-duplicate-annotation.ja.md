# @mmd-toolkit/treeview-no-duplicate-annotation

英語版:
[treeview-no-duplicate-annotation.md](./treeview-no-duplicate-annotation.md)

1 つのノードの同じ種類の注釈を置き換える注釈を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

ツリービューのノードは、注釈 `:::`、`icon()`、`##` が与えるクラス、アイコン、
説明を 1 つずつまで持つ。
ある種類の後の注釈は、前のものをエラーなしに置き換え、前の値は失われる。

## 規則の詳細

この規則は、ツリービュー（`treeView-beta`）に当てる。
同じ種類の直前の注釈が同じノードに与えた空でない値を変えるクラス、アイコン、
`##` の説明を報告する。
3 つの種類は別々に、そのノードの同じ種類の直前の注釈と比べる。
後の行の注釈は、コメント行、空の行、
ディレクティブを挟んでも前のノードのものである。

現在の値の繰り返しは報告しない。
前の値に戻す注釈も報告する。
`:::highlight`、`:::muted`、
`:::highlight` の後の 2 つのクラスはどちらも報告する。

クラスは大文字小文字を区別して名前で比べる。
アイコンは、mermaid.js が設定なしに解決するとおりに比べる。
`icon()` と `icon(none)` はどちらもアイコンを隠し、
`file` のようなパックのない名前は `mermaid-treeview:file` を意味する。
アイコンを隠すことも値なので、`icon()` の後の `icon(file)` は報告する。

この規則は `defaultIconPack` を読まないので、その設定が `custom` を名指すと、
`icon(mark)` と `icon(custom:mark)` は mermaid.js には 1 つでも、
この規則には 2 つのことがある。

説明は、両端の空白を除き、内側の空白を保って比べるので、
`## First  line` と `## First line` は違う。
空の `##` は説明の後では報告し、空の `##` の後の `##` の説明は報告しない。
mermaid.js は、説明を示す前に `#35;` のような文字参照と HTML を変換する。
それらだけが違う説明は、mermaid.js には同じでも、この規則には違うことがある。

その行の `##` の後の文字は説明のものなので、
`## note :::highlight` はクラスを与えない。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/treeview-no-duplicate-annotation.ts)
- [テストのソース](../../tests/rules/treeview-no-duplicate-annotation.test.ts)

<!-- end auto-generated rule resources -->
