# @mmd-toolkit/ast

英語版: [README.md](./README.md)

[`@mmd-toolkit/parser`](../parser) が返す構文木の TypeScript の型です。
`Root`、`FlowchartVertex`、`Identifier` など、すべてのノードの型と、
図種 id の合併型 `DiagramType` を持ちます。
名前と欄は、仕様の [`ast.md`](../spec/docs/ast.ja.md) のものです。

このパッケージは型だけを持ち、実行するコードはありません。

mermaid-js とは関係のない、第三者のプロジェクトです。

文書: [パーサーの API](https://mmd-toolkit.github.io/mmd-toolkit/ja/parser/api.html)。

## 導入

パーサーの版か、互換のある新しい版を、パーサーと一緒に入れます。

```sh
npm install @mmd-toolkit/parser
npm install --save-dev @mmd-toolkit/ast
```

パーサー、`prettier-plugin-mmd`、`@mmd-toolkit/eslint-plugin` は、
このパッケージを任意の peer 依存にしています。
利用者が、型を使うときだけダウンロードするようにするためです。
パーサーは自分の版の `^` を求め、2 つのプラグインはどの版でも受け付けます。

## 使い方

型は、このパッケージから import します。
パーサーは export しません。

```ts
import { parse } from "@mmd-toolkit/parser"
import type { Root } from "@mmd-toolkit/ast"

const root: Root = parse("flowchart LR\nA --> B\n")
```
