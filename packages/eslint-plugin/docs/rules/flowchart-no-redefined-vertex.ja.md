# @mmd-toolkit/flowchart-no-redefined-vertex

英語版: [flowchart-no-redefined-vertex.md](./flowchart-no-redefined-vertex.md)

頂点の形やラベルを、後で違うものに書き直すことを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

頂点は何度でも書くことができ、最後の形とラベルが使われる。
別の頂点のつもりで id を使い回すと、前の形やラベルがエラーなしに失われる。

## 規則の詳細

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
形を付けて書いた頂点のうち、
同じ id に最後に書いたものと形かラベルが違うものを報告する。
形なしでの参照や、現在の形とラベルの繰り返しは報告しない。
`A@{ shape: rect }` のようなデータブロックで決めた形やラベルは、
頂点の 2 つの形付きの出現の間にあっても比べない。

ラベルは両端の空白を除いて比べ、LF、CRLF、CR はどれも LF とし、テキスト、
引用符付きのテキスト、マークダウンのテキストを区別しない。
そのほかは書いたとおりに比べるので、文字参照や HTML の属性の引用符の違いは、
mermaid.js が同じラベルとして読んでも報告することがある。

すでにあるリンクの id を持つ形付きの頂点は何も変えず、報告せず、
前の宣言としても数えない。

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
