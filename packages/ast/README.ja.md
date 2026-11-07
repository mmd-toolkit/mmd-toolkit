# @mmd-toolkit/ast

英語版: [README.md](./README.md)

[`@mmd-toolkit/parser`](../parser) が返す構文木の TypeScript の型です。
`Root`、`FlowchartVertex`、`Identifier` など、すべてのノードの型と、
図種 id の合併型 `DiagramType` を持ちます。
名前と欄は、仕様の [`ast.md`](../spec/docs/ast.ja.md) のものです。

このパッケージは型だけを持ち、実行するコードはありません。

mermaid-js とは関係のない、第三者のプロジェクトです。

## 導入

パーサーと同じ版を、パーサーと一緒に入れます。

```sh
npm install @mmd-toolkit/parser
npm install --save-dev @mmd-toolkit/ast
```

パーサーは、このパッケージを任意の peer 依存にしています。
`prettier-plugin-mmd` と `@mmd-toolkit/eslint-plugin` の利用者が、
これをダウンロードしないようにするためです。

## 使い方

型は、すべての型を export するパーサーからも、
このパッケージからも import できます。

```ts
import { parse } from "@mmd-toolkit/parser"
import type { Root } from "@mmd-toolkit/ast"

const root: Root = parse("flowchart LR\nA --> B\n")
```
