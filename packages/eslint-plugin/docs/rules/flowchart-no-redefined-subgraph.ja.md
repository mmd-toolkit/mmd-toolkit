# @mmd-toolkit/flowchart-no-redefined-subgraph

英語版:
[flowchart-no-redefined-subgraph.md](./flowchart-no-redefined-subgraph.md)

同じ id に保たれる題と違う題を持つ subgraph の宣言を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

同じ id の subgraph をもう一度書くと、同じ subgraph にメンバーが加わる。
mermaid.js は最初の題を保つので、別の宣言に書いた違う題はエラーなしに失われる。

## 規則の詳細

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
同じ subgraph の id を持つ宣言に書いた題のうち、
その subgraph が保つ題と違うものを報告する。
保つ題は最初の宣言の題であり、別の題を書かない宣言なら、生成された id ではなく、
その宣言が書く名前である。

後の宣言に題がない場合や、subgraph がすでに持つ題と同じ場合は報告しない。
題を失わずにメンバーを加えるからである。
入れ子の subgraph は外側の宣言が終わる前に読まれるので、
両方の id が同じなら入れ子の題が使われる。

題は両端の空白を除いて比べ、LF、CRLF、CR はどれも LF とし、テキスト、
引用符付きのテキスト、マークダウンのテキストを区別しない。
そのほかは書いたとおりに比べるので、文字参照や HTML の属性の引用符の違いは、
mermaid.js が同じ題として読んでも報告することがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-subgraph: error
flowchart LR
  subgraph S [One]
    A
  end
  subgraph S [Two]
    B
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-subgraph: error
flowchart LR
  subgraph S [One]
    A
  end
  subgraph S
    B
  end
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-subgraph: error
flowchart LR
  subgraph S [One]
    A
  end
  subgraph S [One]
    B
  end
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-redefined-vertex](./flowchart-no-redefined-vertex.ja.md)
- [agentflow-no-redefined-flow](./agentflow-no-redefined-flow.ja.md)

## 参考

- [Issue #8326](https://github.com/mermaid-js/mermaid/issues/8326)
- [Pull request #8337](https://github.com/mermaid-js/mermaid/pull/8337)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-redefined-subgraph.ts)
- [テストのソース](../../tests/rules/flowchart-no-redefined-subgraph.test.ts)

<!-- end auto-generated rule resources -->
