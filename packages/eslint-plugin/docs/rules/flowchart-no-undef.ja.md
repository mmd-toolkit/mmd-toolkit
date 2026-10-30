# @mmd-toolkit/flowchart-no-undef

英語版: [flowchart-no-undef.md](./flowchart-no-undef.md)

図が定義していない id を指す `style`、`class`、`click` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style`、`class`、`click` は、当てる頂点、リンク、subgraph を id で指す。
mermaid.js は、知らない id にエラーを出さない。
`style` はその id の新しい箱を描き、`class` と `click` は何もしない。
id を書き誤ると、意図した頂点はそのままになる。

## 規則の詳細

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
`style`、`class`、`click` の文の id のうち、図のどの頂点、subgraph、
リンクも持たないものを報告する。
並べた id は 1 つずつ調べ、`class A,C foo` では `C` を報告する。

mermaid.js が名前のないリンクに付ける `L_A_B_0` のような id は、
定義済みと数える。
指す頂点より前の文は報告しない。
そこの `class` は何もせず、`click` は頂点をクリックできるようにしないが、
それでも報告しない。

定義のない id に `style` が頂点を作った後は、その id の後の `style`、`class`、
`click` を報告しない。
`style C fill:red` の後の `class C foo` は、`C` にクラスを付ける。

リンクの id を指す `style` も報告しない。
それはリンクにスタイルを付けず、リンクの後では何もせず、
リンクの前ではその id の頂点を足す。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  style C fill:red
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  classDef foo fill:#f00
  A --> B
  class C foo
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  click C href "https://example.com"
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  style A fill:red
  A --> B
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  subgraph S
    A
  end
  style S fill:red
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  classDef foo fill:#f00
  A e1@--> B
  class e1 foo
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  click A href "https://example.com"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [class-no-undef](./class-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-undef.ts)
- [テストのソース](../../tests/rules/flowchart-no-undef.test.ts)

<!-- end auto-generated rule resources -->
