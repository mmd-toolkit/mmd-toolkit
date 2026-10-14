# @mmd-toolkit/er-no-ignored-text

英語版: [er-no-ignored-text.md](./er-no-ignored-text.md)

mermaid.js が読まないテキストを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`direction` の文は、それだけで 1 行に書く。
その行にほかのテキストもあると、
mermaid.js は行全体を方向の文として読み、残りをエラーなしに捨てる。

## 規則の詳細

この規則は、mermaid.js が読まないテキストを報告する。
対象の図種は `er` である。

`A ||--o{ B : x direction LR` は方向を `LR` にし、実体も関係も作らない。
`direction LR x` は方向を `LR` にし、`x` は捨てられる。
方向の文のつもりでない行も、方向の文になる。
役割に `direction` という語を持つ `A ||--o{ B : direction TB` では、
関係ができない。

`direction LR %% c` のように、方向の後の `%%` で始まるテキストは報告しない。
書き手はそれをコメントのつもりで書いており、
mermaid.js も書き手の意図どおりにそれを捨てる。

規則は、実体の属性ブロックにある空のバッククォート
（間に何もない 2 つのバッククォート）も報告する。
2 つの属性の間、最初の属性の前、最後の属性の後、
ブロックにひとつだけのものである。
mermaid.js はそれを飛ばす。
間に空白、コメント行、ディレクティブしかない連なりは、1 つの報告になる。

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
