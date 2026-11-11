---
since: v0.1.0
---

# @mmd-toolkit/agentflow-no-redefined-vertex

英語版: [agentflow-no-redefined-vertex.md](./agentflow-no-redefined-vertex.md)

その id に前に書いたラベルや形を置き換える頂点と、
後の flow が取らない頂点を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`A[End]` のように形を付けて書いた頂点は、その id のラベルと形を設定する。
前の文が同じ id にそれらを書いていると、
mermaid.js は後のものをエラーなしに使い、前のラベルや形は失われる。
頂点は、それを持って終わった最初の flow にも属し、後の flow に書いても、
そこには加わらない。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
形を付けて書いた頂点のうち、
同じ id の現在のものとラベルか描かれる形が違うものを報告する。
現在のラベルと形の繰り返しや、形なしでの参照は、
flow が頂点を取らない場合（後述）を除き、報告しない。

ひし形 `{ }`、六角形 `{{ }}`、サブルーチン `[[ ]]`、
`[/ /]` は書いたとおりに描かれ、ほかの括弧の形は角の丸い長方形になる。
そのため、`A[x]` の後の `A(x)` は報告しないが、`A[x]` の後の `A[/x/]` は報告し、
`A[/x/]` の後の `A(x)` も報告する。

connector の後に同じ id で形を付けて書いた頂点は、
`connector C[API]` の後の `C[Other]` や `C{API}` のように、
そのタイトルや形を変えると報告する。
要素は connector のままである。
タイトルなしで宣言した connector の後の頂点は、ラベルについては報告しない。
そのラベルは誰も書いていない id だからである。
予約 id `connectors` の頂点は何も変えず、前のラベルや形として数えない。

flow は、それより前に終わった flow が持つ頂点や connector を取らない。
flow が終わる順に見る（flow の中の flow が先に終わる）。
mermaid.js はそれを先に終わった方に残し、後の方は取らない。
後の flow の中の頂点の文のうち、リンク、クラス、データブロックがなく、
id だけか、要素が持つラベルと形を同じプロパティで書き、
2 つのラベルがどちらもマークダウンか、どちらもそうでないものは、
要素について新しいことを言わないので報告する。
引用符付きのラベルと引用符のないラベルは、mermaid.js が同じに描き、
整形ツールがどちらかの形にそろえるので、ここでは同じとして扱う。
整形しても報告が変わらないようにするためである。
形のプロパティは、mermaid.js が要素に記録するものを変え、
整形ツールも変えないので、違えば新しいことを言う。
connector のタイトルは、どう書いてもマークダウンのラベルにならない。
タイトルを付けて connector を宣言し直しても、ラベルがマークダウンかどうかも、
形のプロパティも変わらない。
前の出現として、connector の宣言も数える。
後の flow の connector の宣言は、
[agentflow-no-redefined-connector](./agentflow-no-redefined-connector.ja.md)
が報告する。
`A & B` のような組では、頂点ごとに報告する。
前の flow が後の flow の中にあるか、同じ id を持つときは、
何も失われないので報告しない。
前の flow が要素を持たないときや、要素が前に書かれていないとき、
文が新しいことを言うとき（リンク、クラス、データブロック、頂点の最初の形、
マークダウンのラベルとそうでないラベルの違い、プロパティの違い）も報告しない。
`global` ブロックの直下に書いた頂点や connector は、
ブロックがどこにあってもどの flow にも属さないので、報告しない。
`global` ブロックの中に書いた flow は、自分の頂点を持つ。

`A@{ shape: decision }` のようなデータブロックが設定するラベルや形は、
形付きの頂点の間にあっても比べない。
ラベルの比較では、テキスト、引用符付きのテキスト、
マークダウンのテキストを区別しない。
ラベルは両端の空白を除き、そのほかは書いたとおりに比べるので、
文字参照や HTML の属性の引用符の違いは、
mermaid.js が同じラベルとして読んでも報告することがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  A["Start"] --> B
  C --> A["End"]
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  connector github["GitHub API"]
  github["create_issue"] --> done
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  flow a
    A
  end
  flow b
    A
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  A["Start"] --> B
  A --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  connector github["GitHub API"]
  create["create_issue"] --> done
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  global
    shared
  end
  flow a
    shared
  end
  flow b
    shared
  end
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-redefined-connector](./agentflow-no-redefined-connector.ja.md)

<!-- begin auto-generated rule version -->

## バージョン

この規則は、`@mmd-toolkit/eslint-plugin` v0.1.0 で追加された。

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-redefined-vertex.ts)
- [テストのソース](../../tests/rules/agentflow-no-redefined-vertex.test.ts)

<!-- end auto-generated rule resources -->
