# ASTの走査

`traverseNodes`で、解析した図のノードを調べられます。
各ノードの子を訪問する前後に、指定したビジターを呼び出します。

## コールバック

シグネチャは`traverseNodes(node: Node, visitor: Visitor): void`です。
開始ノードには、`parse()`が返す`Root`か、その中の任意のノードを渡せます。
たとえば、`root.body`を渡すと図の本体から走査を始めます。

`Visitor`には、両方のコールバックが必要です。

| コールバック              | 呼び出すタイミング             |
| ------------------------- | ------------------------------ |
| `enterNode(node, parent)` | ノードの子を訪問する前。       |
| `leaveNode(node, parent)` | ノードの子をすべて訪問した後。 |

どちらのコールバックでも、`node`は訪問する`Node`、
`parent`はこの走査での親ノードです。
開始ノードの`parent`は常に`null`になります。
`root.body`から走査を始めた場合も同じです。

次のヘッダーだけのフローチャートには、
`Root`と`FlowchartDiagram`の2つのノードがあります。

```ts
import { parse, traverseNodes } from "@mmd-toolkit/parser"

traverseNodes(parse("flowchart LR\n"), {
  enterNode(node, parent) {
    console.log("enter", node.type, parent?.type ?? null)
  },
  leaveNode(node, parent) {
    console.log("leave", node.type, parent?.type ?? null)
  },
})
```

コールバックから次の順で出力されます。

```text
enter Root null
enter FlowchartDiagram Root
leave FlowchartDiagram Root
leave Root null
```

## 特定のノードを調べる

`node.type`で、処理するノードを選び、TypeScriptの型を絞り込めます。
次の例では、フローチャートの頂点ノードからIDを集めます。
同じIDが複数のノードに現れるため、`Set`で重複を除きます。

```ts
import { parse, traverseNodes } from "@mmd-toolkit/parser"

const root = parse("flowchart LR\n  A[Start] --> B\n  B --> C\n")
const ids = new Set<string>()

traverseNodes(root, {
  enterNode(node) {
    if (node.type === "FlowchartVertex") {
      ids.add(node.id.name)
    }
  },
  leaveNode() {
    // Collection happens when a node is entered; no work is needed on leaving.
  },
})

console.log([...ids]) // ["A", "B", "C"]
```

ノードの型とフィールドは、[GitHubのAST定義][ast]で説明しています。

## 子フィールドと訪問順序

走査は深さ優先です。
1つの子とその下のノードをすべて訪問してから、次の子に進みます。
各ノードでは、`visitorKeys[node.type]`に並んだ順に子フィールドを訪問します。
子ノードの配列は、配列順に訪問します。
子フィールドや配列要素が`null`の場合は飛ばします。

```ts
import { visitorKeys } from "@mmd-toolkit/parser"

console.log(visitorKeys.Root) // ["body"]
console.log(visitorKeys.Identifier) // []
```

フィールドの順は、ソースの記述順と異なる場合があります。
たとえば、`FlowchartLink`では、
ソース中でラベルが矢印より前に書かれていても、`arrow`の後に`label`を訪問します。

## 走査しないレコード

トークン、コメント、directive、frontmatterはASTノードではなく、訪問されません。
`parse()`が返す`Root`から取得します。

| 式                 | レコード                      |
| ------------------ | ----------------------------- |
| `root.tokens`      | トークン。                    |
| `root.comments`    | コメント。                    |
| `root.directives`  | directive。                   |
| `root.frontmatter` | frontmatter。なければ`null`。 |

戻り値の説明とレコードの詳細定義への案内は、
[パーサーAPI](./api.ja.md)にあります。

[ast]: https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/ast.ja.md
