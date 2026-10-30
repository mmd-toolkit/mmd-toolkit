# @mmd-toolkit/agentflow-no-redefined-vertex

英語版: [agentflow-no-redefined-vertex.md](./agentflow-no-redefined-vertex.md)

その id に前に書いたラベルや形を置き換える頂点を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`A[End]` のように形を付けて書いた頂点は、その id のラベルと形を設定する。
前の文が同じ id にそれらを書いていると、
mermaid.js は後のものをエラーなしに使い、前のラベルや形は失われる。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
形を付けて書いた頂点のうち、同じ id の現在のものとラベル、描かれる形、
種類のどれかが違うものを報告する。
現在のラベルと形の繰り返しや、形なしでの参照は報告しない。

ひし形 `{ }`、六角形 `{{ }}`、サブルーチン `[[ ]]` は書いたとおりに描かれ、
ほかの括弧の形は角の丸い長方形になる。
既定のテーマ `redux-color` は種類ごとの色を使うので、種類も比べる。
サブルーチンは tool、ひし形は decision、六角形は action、`[/ /]` は input、
connector は connector、ほかの括弧の形は task である。
そのため、`A[x]` の後の `A(x)` は報告しないが、
`A[x]` の後の `A[/x/]` は報告する。

connector の後に同じ id で形を付けて書いた頂点は、
`connector C[API]` の後の `C[Other]` や `C{API}` のように、
そのタイトルや形を変えると報告する。
種類は connector のままである。
タイトルなしで宣言した connector の後の頂点は、ラベルについては報告しない。
そのラベルは誰も書いていない id だからである。
予約 id `connectors` の頂点は何も変えず、前のラベルや形として数えない。

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
  A[Start] --> B
  C --> A[End]
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  connector github["GitHub API"]
  github["create_issue"] --> done
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  A[Start] --> B
  A --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  connector github["GitHub API"]
  create["create_issue"] --> done
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-redefined-connector](./agentflow-no-redefined-connector.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-redefined-vertex.ts)
- [テストのソース](../../tests/rules/agentflow-no-redefined-vertex.test.ts)

<!-- end auto-generated rule resources -->
