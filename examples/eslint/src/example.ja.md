# Markdown 内の Mermaid

英語版: [example.md](./example.md)

推奨規則は `mmd` コードブロックも検査します。
この図にはアクセシビリティのタイトルが 2 つあり、
ESLint はどちらかを削除する修正候補を示します。

```mmd
flowchart LR
  accTitle: Checkout
  accTitle: Payment
  Cart --> Payment
```
