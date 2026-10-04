# パーサー

`@mmd-toolkit/parser`は、Mermaidの図のテキストを抽象構文木（AST）に解析します。
JavaScriptやTypeScriptで図の内容を調べたり、処理したりするために使えます。

[Playgroundでオンラインの解析を試せます](https://mmd-toolkit.github.io/mmd-toolkit/playground/)。
インストールは不要です。

## インストール

プロジェクトにパーサーをインストールします。

```sh
npm install @mmd-toolkit/parser
```

## 最初の図を解析する

図のヘッダーを含む、1つの図のテキストを`parse()`に渡します。

```ts
import { parse } from "@mmd-toolkit/parser"

const root = parse("flowchart LR\n  A[Start] --> B\n")

console.log(root.diagramType) // "flowchart-v2"
```

`parse()`は、ASTのルートノード`Root`を同期的に返します。
この例では、`diagramType`でフローチャートと識別できます。

## エラー

解析できない場合、`parse()`は次の公開エラークラスのいずれかをthrowします。

- `ParseError`: 入力が拒否された場合。
  図の種類を認識できなかった場合も含みます。
- `UnsupportedDiagramError`: 図の種類は認識できたものの、
  パーサーがその種類に対応していない場合。

## 次に読むページ

- [API](./api.ja.md): 入力、戻り値、公開される型、エラーの扱い。
- [走査](./traversal.ja.md): ノードを訪問して図の内容を調べる方法。
- [互換性](../reference/index.ja.md): 構文の保証とmermaid.jsとの既知の差異。
- [AST定義（GitHub）][ast]: ノードの型とフィールドの詳細。

[ast]: https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/ast.ja.md
