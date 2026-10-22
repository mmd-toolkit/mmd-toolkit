# @mmd-toolkit/agentflow-no-undef

英語版: [agentflow-no-undef.md](./agentflow-no-undef.md)

何も宣言しない id への `style`、`class`、`click` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style`、`class`、`click` は、当てる要素をその id で名指す。
id を書き誤ったときのように、
どの頂点、flow、connector、リンクもその id を持たないと、
mermaid.js はその文をエラーなしに受理し、文はつもりの要素に届かない。

## 規則の詳細

この規則は、`style`、`class`、`click` の文の id のうち、
図のどの頂点、flow、connector、リンクの id でもないものを報告する。
対象の図種は `agentflow` である。

`A --> B` の後では、`style C fill:red` はスタイル `fill:red` の頂点 `C` を足し、
`class C foo` はどの要素にもクラス `foo` を与えず、
`click C href "…"` はどの要素もリンクにしない。
並びの各 id を調べ、`class A,C foo` は `A` にクラスを与え、`C` を報告する。

図の id は、どこに書いてあっても、その頂点、flow、connector の id と、
`A e1@--> B` の `e1` のようにリンクに与えた id である。
flow や connector の id は、
両端の空白と mermaid.js が消す部分を除いたその名前である。
通常の頂点より前の `style` のスタイルは、頂点を宣言しても保たれる。
connector より前の `style` は仮の頂点を作り、
最初の connector 宣言はそのスタイルを捨てる。
connector 宣言の後の `style` は connector にスタイルを付ける。
`style F fill:red` と `flow F[Worker]` は、描画では flow の枠を赤く塗り、
別の頂点 `F` を描かない。
`style` は flow 宣言の前にあっても後にあっても同じである。
リンク宣言より前の `style` も、リンクでなく、
同じ id の別の頂点にスタイルを付ける。
リンク宣言の後では、その id の頂点がなければ何も変えない。
名指す要素より前の `class` 文は mermaid.js では何もせず、
そこの `click` 文はそれをクリックできるようにしない。
そのような文は正しく書いた図の id を名指しており、この規則は報告しない。

`style` 文が足す頂点も図の頂点なので、
この規則は、ほかに何も宣言しない id の最初の `style` だけを報告する。
`style C fill:red` の後の 2 つ目の `style C stroke:blue` は
頂点 `C` にスタイルを足し、
`class C foo` と `click C href "…"` はそれに当たり、どれも報告しない。

予約 id `connectors` は、形付きで書いても、
`style` に書いても通常の頂点を作らない。
同じ名前の flow、connector、明示したリンク id の別の宣言がなければ、
`style`、`class`、`click` の各対象を報告する。
その `style` は頂点を作らない。
両端の空白を除いた名前が空の connector も何も宣言しない。

mermaid.js が要素に自分で与える id も図の id である。
名前のない flow の id `subGraph0` と、
id なしで書いたリンクの `L_A_B_0` のような id がそれである。
mermaid.js はそれで flow やリンクを見つけ、
`class subGraph0 hot` は flow にクラスを与えるので、そのような id は報告しない。
id は書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
名前を読む前にほかの文字に変えるので、
それだけが違う 2 つの id は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

id では、`#35;` と `#` は mermaid.js でも異なる id である。
上の文字参照の限界は、参照と mermaid.js の置き換え文字列についてであり、
参照と復号した文字についてではない。

id を直すか、要素を宣言する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  A --> B
  style C fill:red
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  flow review["Review Agent"]
    A
  end
  class reveiw highlighted
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  A --> B
  style A fill:red
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  connector github["GitHub API"]
  click github href "https://github.com"
```

## オプション

この規則にはオプションがない。

## 背景

[`setClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L928-L943)
と
[`setLink` と `setClickEvent`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1010-L1038)
は、呼ばれるときにその id の要素を探す。
`style` 文が呼ぶ
[`addVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L347-L565)
は、要素のない id に頂点を足す。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-undef.ts)
- [テストのソース](../../tests/rules/agentflow-no-undef.test.ts)

<!-- end auto-generated rule resources -->
