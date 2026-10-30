# @mmd-toolkit/class-no-ignored-text

英語版: [class-no-ignored-text.md](./class-no-ignored-text.md)

mermaid.js が捨てるテキストを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`direction` の文は、それだけで 1 行に書く。
ほかのテキストも同じ行にあると、mermaid.js は行全体を方向の文として読み、
残りをエラーなしに捨てる。

## 規則の詳細

この規則は、クラス図（`classDiagram`、`classDiagram-v2`）に当てる。
同じ行の `direction` より前か、その方向の値より後にあるテキストを報告する。
関係のラベルやノートの中の方向も対象になり、
`A --> B : set direction LR now` では関係が消える。

方向の後の `%%` で始まるテキストは、コメントのつもりで書かれ、
mermaid.js が意図どおりに捨てるので報告しない。

U+2028 や U+2029 を含むメソッドの行で、捨てられる部分も報告する。
mermaid.js は、その行の 1 つの部分だけを読む。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  class A direction LR
```

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  direction TBX
```

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  A --> B : set direction LR now
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  direction RL
  class A
```

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  direction LR %% vertical
  class A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [class-no-bare-class-name](./class-no-bare-class-name.ja.md)
- [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md)
- [sequence-no-ignored-text](./sequence-no-ignored-text.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/class-no-ignored-text.ts)
- [テストのソース](../../tests/rules/class-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
