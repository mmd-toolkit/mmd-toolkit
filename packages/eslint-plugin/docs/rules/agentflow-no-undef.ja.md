# @mmd-toolkit/agentflow-no-undef

英語版: [agentflow-no-undef.md](./agentflow-no-undef.md)

どこにも宣言されていない id を指す `style`、`class`、`click` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style`、`class`、`click` は、要素を id で指す。
どの頂点、flow、connector、リンクもその id を持たないと、
mermaid.js は文をエラーなしに受理するが、文は意図した要素に届かない。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
`style`、`class`、`click` の文の id のうち、図のどの頂点、flow、connector、
リンクも持たないものを報告する。
並べた id は 1 つずつ調べる。
名前のない flow の `subGraph0` やリンクの `L_A_B_0` のような生成 id も、
定義済みと数える。

指す要素より前の文は報告しない。
そこでは効かない `class` や `click`、
最初の connector 宣言がスタイルを捨てる `style`、
リンクでなく別の頂点にスタイルを付ける `style` も含む。

`style` は未知の id に頂点を作るので、同じ id の後の `style`、`class`、
`click` は報告しない。
予約 id `connectors` は形付きでも `style` でも通常の頂点を作らないので、 flow、
connector、明示したリンク id が別に宣言しなければ、その使用を毎回報告する。

id は書いたとおりに比べるので、文字参照や HTML の属性の引用符によって、
mermaid.js が同じ id と読むものを、この規則は異なる id として扱うことがある。
`#35;` と書いた id と `#` と書いた id は、mermaid.js でも別の id である。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-undef.ts)
- [テストのソース](../../tests/rules/agentflow-no-undef.test.ts)

<!-- end auto-generated rule resources -->
