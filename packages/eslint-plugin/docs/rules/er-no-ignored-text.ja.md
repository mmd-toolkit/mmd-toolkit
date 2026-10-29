# @mmd-toolkit/er-no-ignored-text

英語版: [er-no-ignored-text.md](./er-no-ignored-text.md)

mermaid.js が捨てるテキストを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`direction` の文は、それだけで 1 行に書く。
その行にほかのテキストもあると、mermaid.js は行全体を方向の文として読み、
残りをエラーなしに捨てる。

## 規則の詳細

この規則は、ER 図（`erDiagram`）に当てる。
`direction` の行で、`direction` の前か方向の値の後にあるテキストを報告する。
値の後の `%%` で始まるテキストは、書き手がコメントのつもりで書き、
mermaid.js もそのとおりに捨てるので、報告しない。
`A ||--o{ B : direction TB` のように役割に `direction` を含む関係も、
mermaid.js が方向の行と読んで関係を描かないので報告する。

実体の属性ブロックの空のバッククォート（間に何もない 2 つのバッククォート）も、
位置にかかわらず報告する。
mermaid.js はそれを飛ばす。
空白、コメント行、ディレクティブだけで区切られた空のバッククォートの連なりは、
1 つの報告になる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-ignored-text: error
erDiagram
  A ||--o{ B : x direction LR
```

```mmd
%% eslint @mmd-toolkit/er-no-ignored-text: error
erDiagram
  direction LR x
  A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-ignored-text: error
erDiagram
  direction LR
  A ||--o{ B : x
```

```mmd
%% eslint @mmd-toolkit/er-no-ignored-text: error
erDiagram
  direction LR %% c
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md)
- [class-no-ignored-text](./class-no-ignored-text.ja.md)
- [state-no-ignored-text](./state-no-ignored-text.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/er-no-ignored-text.ts)
- [テストのソース](../../tests/rules/er-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
