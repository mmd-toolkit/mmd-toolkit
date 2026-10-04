# mmd/flowchart/no-undef

英語版: [no-undef.md](./no-undef.md)

図が定義していない id を指す `style`、`class`、`click` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style`、`class`、`click` は、当てる頂点、リンク、subgraph を id で指す。
その id が図のどれのものでもなくても、mermaid.js は何も言わない。
`style` はその id の新しい箱を描き、`class` と `click` は何もしない。
id を書き誤ると、意図した頂点はそのままになる。

## 規則の詳細

この規則は、`style`、`class`、`click` の文の id のうち、
図のどの頂点、subgraph、リンクの id でもないものを報告する。
`flowchart-v2`、`flowchart-elk`、`swimlane` に当たる。

`A --> B` の後の `style C fill:red` は、スタイル `fill:red` の頂点 `C` を足す。
`class C foo` は、どの頂点にもクラス `foo` を付けず、
`click C href "…"` は、どの頂点もリンクにしない。
並べた id は 1 つずつ調べる。
`class A,C foo` は `A` にクラスを付け、`C` を報告する。

図の id は、頂点と subgraph の id と、
`A e1@--> B` の `e1` のようにリンクに付けた id で、書いた場所を問わない。
`style` の文は、指す頂点より前に書いても、その頂点に色を付ける。
指す頂点より前に書いた `class` や `click` の文は、mermaid.js では何もしないが、
正しく書いた図の id を指しているので、この規則は報告しない。

`style` の文が足す頂点も図の頂点なので、
ほかに何も定義していない id の `style` は、最初の 1 つだけを報告する。
`style C fill:red` の後の 2 つ目の `style C stroke:blue` は、
頂点 `C` にスタイルを足し、
`class C foo` と `click C href "…"` はその頂点に当たる。
どれも報告しない。

リンクの id を指す `style` も報告しない。
`style` は頂点と subgraph に当たるものなので、mermaid.js はそれに何もしない。
リンクには、`linkStyle` かクラスでスタイルを付ける。

この規則に**反する**コードの例:

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  A --> B
  style C fill:red
```

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  classDef foo fill:#f00
  A --> B
  class C foo
```

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  A --> B
  click C href "https://example.com"
```

この規則に**従う**コードの例:

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  style A fill:red
  A --> B
```

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  subgraph S
    A
  end
  style S fill:red
```

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  classDef foo fill:#f00
  A e1@--> B
  class e1 foo
```

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  A --> B
  click A href "https://example.com"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [class/no-undef](../class/no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../../src/rules/flowchart/no-undef.ts)
- [テストのソース](../../../tests/rules/flowchart/no-undef.test.ts)

<!-- end auto-generated rule resources -->
