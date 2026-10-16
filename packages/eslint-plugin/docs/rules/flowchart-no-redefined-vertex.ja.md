# @mmd-toolkit/flowchart-no-redefined-vertex

英語版: [flowchart-no-redefined-vertex.md](./flowchart-no-redefined-vertex.md)

頂点の形やラベルを、後で違うものに書き直すことを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

頂点は何度でも書くことができ、最後に書いた形とラベルが使われる。
新しい頂点のつもりで、使用中の id をもう一度書くと、
前の形やラベルはエラーなしに失われる。

## 規則の詳細

この規則は、形を付けて書いた頂点を、
同じ頂点にそれより前に最後に付けた形とラベルと比べ、
形かラベルが違うものを報告する。
対象の図種は `flowchart-v2`、`flowchart-elk`、`swimlane` である。

`A[Start] --> B` の後の行 `C --> A[End]` は、頂点 `A` にラベル `End` を付け、
ラベル `Start` は失われる。
`A --> C` のように形を付けずに頂点をもう一度書くと、形とラベルは保たれ、
報告しない。
頂点がすでに持つ形とラベルを書くことも、報告しない。
`A[x]` と `A[y]` の後の 3 つ目の `A[y]` は、何も変えないので報告しない。
`A@{ shape: rect }` のように、データブロックで決めた形やラベルは、
頂点の 2 つの形の間にあっても比べない。
ラベルは、mermaid.js が取り除く端の空白を除いて比べる。
`A["x"]` の後の `A["x "]` は報告しない。
mermaid.js は、どの改行（LF、CRLF、CR）もラインフィードとして持ち、
HTML の属性の値を囲む引用符 `"` を `'` として持つ。
そのため、`A[<b class="x">t</b>]` と `A[<b class='x'>t</b>]` は、
同じラベルを持ち、
これらだけが違うラベルも報告しない。
ラベルの種類（テキスト、文字列、マークダウン文字列）は比べない。
`A["x"]` の後の ``A["`x`"]`` は、同じ頂点に同じテキストを書いたもので、
id を別の頂点に使い回したものではない。
mermaid.js は、最後に書いたラベルを使う。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart LR
  A[Start] --> B
  C --> A[End]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart LR
  A[Start] --> B
  A --> C
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart LR
  A[Start] --> B
  C --> A[Start]
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-redefined-vertex.ts)
- [テストのソース](../../tests/rules/flowchart-no-redefined-vertex.test.ts)

<!-- end auto-generated rule resources -->
