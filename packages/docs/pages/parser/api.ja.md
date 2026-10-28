# パーサーAPI

以下の関数、エラークラス、型は`@mmd-toolkit/parser`からimportできます。
インストールは[はじめに](./index.ja.md)で説明しています。

## `parse(text)`

シグネチャは`parse(text: string): Root`です。
図のヘッダーを含む、1つのMermaidの図のテキストを渡します。
同期的に`Root`を返し、解析できない場合は[エラー](#エラー)をthrowします。

## 戻り値

`Root`には、図の本体と、そのソースを扱うためのレコードが入ります。

| フィールド    | 型                     | 内容                                             |
| ------------- | ---------------------- | ------------------------------------------------ |
| `type`        | `"Root"`               | ルートノードの型。                               |
| `diagramType` | `DiagramType`          | mermaid.jsと同じ図の識別子。例: `flowchart-v2`。 |
| `body`        | `DiagramBody`          | 図の本体を表すASTノード。                        |
| `frontmatter` | `Frontmatter \| null`  | frontmatterのレコード。なければ`null`。          |
| `comments`    | `readonly Comment[]`   | ソース順に並んだすべてのコメント。               |
| `directives`  | `readonly Directive[]` | ソース順に並んだすべてのdirective。              |
| `tokens`      | `readonly Token[]`     | ソース順に並んだすべてのトークン。               |
| `range`       | `Range`                | 入力全体の範囲。                                 |
| `loc`         | `Location`             | 入力全体の位置。                                 |

コメントやdirectiveがない場合、対応する配列は空です。
frontmatterとdirectiveの中身はテキストとして保持されます。
中身のYAMLやJSONを解析してオブジェクトにすることはありません。

ASTは入力の各部分を失わずに保持します。
空白と改行はノードになりませんが、元のテキストと範囲情報を使うと、
入力をそのまま再現できます。

トークンとコメントは、`Root.tokens`と`Root.comments`から取得できます。
フィールドとトークンの種類は、
[GitHubのトークン・コメント定義][tokens]で説明しています。
Root、ノード、トークン、コメント、directive、
frontmatterの位置情報は`range`と`loc`から取得できます。
形式は[GitHubの位置情報の定義][positions]を参照してください。

## 型と図固有のフィールド

各図のノードの型に加えて、次の型を公開しています。

| 型                                                          | 用途                                              |
| ----------------------------------------------------------- | ------------------------------------------------- |
| `Root`                                                      | `parse()`の戻り値。                               |
| `Node`、`NodeBase`                                          | すべてのASTノードの型と、ノード共通のフィールド。 |
| `DiagramBody`、`DiagramType`                                | 図の本体の型と、図の識別子。                      |
| `Token`、`TokenKind`、`Comment`、`Directive`、`Frontmatter` | ソースのレコードとトークンの種類。                |
| `Range`、`Location`、`Position`                             | ソースの位置情報。                                |
| `Visitor`、`VisitorKeys`                                    | 走査のコールバックと子フィールドの対応表。        |

ノードの`type`フィールドを確認すると、TypeScriptで型を絞り込めます。
次の例では、フローチャートの方向と文の数を読み取ります。

```ts
import { parse } from "@mmd-toolkit/parser"
import type { DiagramBody, Root } from "@mmd-toolkit/parser"

const root: Root = parse("flowchart LR\n  A[Start] --> B\n")
const body: DiagramBody = root.body

if (body.type === "FlowchartDiagram") {
  console.log(body.direction) // "LR"
  console.log(body.body.length) // 1
}
```

個々のノードの型と、directive・frontmatterのフィールドは、
[GitHubのAST定義][ast]で説明しています。

## エラー

### `ParseError`

`ParseError`は`SyntaxError`を継承します。
入力が拒否された場合にthrowされ、図の種類を認識できなかった場合も含みます。
`name`は`"ParseError"`で、`message`は解析できなかった理由を表します。

| フィールド | 型         | 内容                                           |
| ---------- | ---------- | ---------------------------------------------- |
| `index`    | `number`   | 報告範囲の開始オフセット。`range[0]`と同じ値。 |
| `range`    | `Range`    | エラーとして報告されるソースの範囲。           |
| `loc`      | `Location` | `range`に対応する位置。                        |

報告する範囲の決め方は、
[GitHubのエラー位置の規則][error-positions]で説明しています。

### `UnsupportedDiagramError`

`UnsupportedDiagramError`は`Error`を継承します。
図の種類は認識できたものの、
パーサーがその種類に対応していない場合にthrowされます。
`name`は`"UnsupportedDiagramError"`、
`diagramType`は検出された図の識別子（`DiagramType`）です。
`message`は解析できなかった理由を表します。

### エラーの扱い

公開エラークラスを使って種類を区別できます。
次の未完成のフローチャートでは、`ParseError`の分岐に入ります。

```ts
import { parse, ParseError, UnsupportedDiagramError } from "@mmd-toolkit/parser"

try {
  parse("flowchart LR\n  A -->\n")
} catch (error) {
  if (error instanceof ParseError) {
    console.error(error.message, error.range)
  } else if (error instanceof UnsupportedDiagramError) {
    console.error(error.message, error.diagramType)
  } else {
    throw error
  }
}
```

## 走査API

`traverseNodes(node: Node, visitor: Visitor): void`で、開始ノードと、
その下にあるノードを訪問します。
`Visitor`には`enterNode`と`leaveNode`のコールバックが必要です。

`visitorKeys`は`VisitorKeys`型の値です。
各ノードの型に、走査順に並んだ子フィールド名を対応させます。

コールバックの引数、訪問順序、ノードを調べる例は、
[ASTの走査](./traversal.ja.md)で説明しています。

[ast]: https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/ast.ja.md
[tokens]: https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/parser/docs/tokens.ja.md
[positions]: https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/parser/docs/positions.ja.md
[error-positions]: https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/parser/docs/error-positions.ja.md
