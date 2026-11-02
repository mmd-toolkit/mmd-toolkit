# Mermaid in Markdown

Japanese version: [example.ja.md](./example.ja.md)

The recommended rules also check `mmd` code blocks. This diagram has two
accessibility titles; ESLint offers suggestions to remove either one.

```mmd
flowchart LR
  accTitle: Checkout
  accTitle: Payment
  Cart --> Payment
```
