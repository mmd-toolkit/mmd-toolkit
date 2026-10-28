# @mmd-toolkit/agentflow-no-redefined-flow

英語版: [agentflow-no-redefined-flow.md](./agentflow-no-redefined-flow.md)

その id に前に書いたタイトルを置き換える flow の宣言を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

同じ id の flow は、mermaid.js では 1 つの flow である。
そのメンバーは合わされ、後のタイトルはエラーなしに前のものを置き換える。

## 規則の詳細

この規則は、flow の宣言のタイトルのうち、
同じ id の宣言が前に flow に与えたタイトルと違うものを報告する。
対象の図種は `agentflow` である。

本体と `end` を持つ `flow F[First]` の後の宣言 `flow F[Second]` は、
flow にタイトル `Second` を与え、`First` は失われる。
タイトルなしの宣言と空白だけのタイトルの宣言は flow のタイトルを保ち、
メンバーを足すために flow をもう一度書くことは報告しない。
flow がすでに持つタイトルの宣言も報告しない。
`First` と `Second` の後の 3 つ目の `flow F[First]` は、
`Second` を置き換えるので報告する。
名前のない flow は書いたタイトルを持たず、タイトルを置き換えない。
その id は `subGraph` に、それより前に完了した flow 宣言の数を続けたもので、
同じ id の再宣言も数える。
名前のない 2 つの flow の id は異なる。
名前のない flow と、その生成 id を名前に持つ flow は合わされ、
前の空でないタイトルを保つ。

mermaid.js は flow の `end` に達したときにタイトルを設定するので、
ほかの flow の中に書いた flow が先に設定される。
宣言はその順で比べる。

flow の id は、両端の空白と mermaid.js が消す部分を除いたその名前である。
`F@{ label: Review }` のようにデータブロックが設定するタイトルは、
2 つの宣言の間にあっても比べない。
タイトルは、mermaid.js が取り除く両端の空白を除き、ほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
タイトルを読む前にほかの文字に変えるので、それだけが違う 2 つのタイトルは、
mermaid.js には 1 つで、この規則には 2 つのことがある。

flow ごとに自分の id を与え、そのタイトルは 1 度だけ書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-flow: error
agentflow-beta TB
  flow F[First]
    A
  end
  flow F[Second]
    B
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-flow: error
agentflow-beta TB
  flow F[First]
    A
  end
  flow F
    B
  end
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-duplicate-direction](./agentflow-no-duplicate-direction.ja.md)

## 背景

[`addSubGraph`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1175-L1284) は、
flow をその id の前の flow に合わせ、
空でない後のタイトルでタイトルを置き換える。
[flow の文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L406-L415) は `end` の後でそれを呼ぶ。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-redefined-flow.ts)
- [テストのソース](../../tests/rules/agentflow-no-redefined-flow.test.ts)

<!-- end auto-generated rule resources -->
