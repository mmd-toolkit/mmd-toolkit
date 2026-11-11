---
since: v0.1.0
---

# @mmd-toolkit/flowchart-no-redefined-vertex

英語版: [flowchart-no-redefined-vertex.md](./flowchart-no-redefined-vertex.md)

頂点を、違う形やラベルで、または後の subgraph が取らない形で、
書き直すことを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

頂点は何度でも書くことができ、最後の形とラベルが使われる。
別の頂点のつもりで id を使い回すと、前の形やラベルがエラーなしに失われる。
頂点は、それを持って終わった最初の subgraph に属し、後の subgraph に書いても、
そこには加わらない。

## 規則の詳細

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
形を付けて書いた頂点のうち、
同じ id に最後に書いたものと形かラベルが違うものを報告する。
形なしでの参照や、現在の形とラベルの繰り返しは、
subgraph が頂点を取らない場合（後述）を除き、報告しない。
`A@{ shape: rect }` のようなデータブロックで決めた形やラベルは、
頂点の 2 つの形付きの出現の間にあっても比べない。

ラベルは両端の空白を除いて比べ、LF、CRLF、CR はどれも LF とし、テキスト、
引用符付きのテキスト、マークダウンのテキストを区別しない。
そのほかは書いたとおりに比べるので、文字参照や HTML の属性の引用符の違いは、
mermaid.js が同じラベルとして読んでも報告することがある。

すでにあるリンクの id を持つ形付きの頂点は何も変えず、報告せず、
前の宣言としても数えない。

subgraph は、それより前に終わった subgraph が持つ頂点を取らない。
subgraph が終わる順に見る（subgraph の中の subgraph が先に終わる）。
mermaid.js は頂点を先に終わった方に残し、後の方は取らない。
後の subgraph の中の文のうち、リンク、クラス、データブロックがなく、
頂点の id だけか、頂点が持つ形を同じラベルと形のプロパティで書き、
2 つのラベルがどちらもマークダウンか、どちらもそうでないものは、
頂点について新しいことを言わないので報告する。
引用符付きのラベルと引用符のないラベルは、mermaid.js が同じに描き、
整形ツールがどちらかの形にそろえるので、ここでは同じとして扱う。
整形しても報告が変わらないようにするためである。
形のプロパティは、mermaid.js が頂点に記録するものを変え、
整形ツールも変えないので、違えば新しいことを言う。
`A & B` のような組では、頂点ごとに報告する。
前の subgraph が後の subgraph の中にあるか、同じ id を持つときは、
何も失われないので報告しない。
頂点が前に書かれていないとき（前の subgraph の名前にすぎない id は、
新しい頂点を書く）や、文が新しいことを言うとき（リンク、クラス、データブロック、
頂点の最初の形、マークダウンのラベルとそうでないラベルの違い、
プロパティの違い）も報告しない。
違う形やラベルは、上のとおり報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart LR
  A[Start] --> B
  C --> A[End]
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart TD
  subgraph a
    A
  end
  subgraph b
    A
  end
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

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-vertex: error
flowchart TD
  subgraph b
    subgraph a
      A
    end
    A
  end
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule version -->

## バージョン

この規則は、`@mmd-toolkit/eslint-plugin` v0.1.0 で追加された。

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-redefined-vertex.ts)
- [テストのソース](../../tests/rules/flowchart-no-redefined-vertex.test.ts)

<!-- end auto-generated rule resources -->
