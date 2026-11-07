# @mmd-toolkit/parser

英語版: [README.md](./README.md)

[Mermaid](https://mermaid.js.org/) 記法（`.mmd`）のパーサーです。
図のテキストを、入力のすべての文字を保ち、各部分の位置を持つ木にします。

[mermaid-js](https://mermaid.js.org/) とは無関係の第三者プロジェクトです。

文書: [パーサー](https://mmd-toolkit.github.io/mmd-toolkit/ja/parser/)。

## Playground

ブラウザーで、このパーサーが返す構文木、トークン、コメント、ディレクティブ、
フロントマターを確認できます。
ツリーの項目を選ぶとソースの対応範囲が強調表示され、
ソースのカーソルを動かすと対応する項目が選択されます。

[Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/)
を開いて使えます。

操作方法は[Playgroundの使い方](../playground/README.ja.md)を参照してください。

## 導入

```sh
npm install @mmd-toolkit/parser
```

ES モジュールで、Node.js `^20.19.0 || ^22.13.0 || >=24` が要ります。

TypeScript の型を使うには、パーサーの版か、
互換のある新しい版の [`@mmd-toolkit/ast`](../ast) も入れます。

```sh
npm install --save-dev @mmd-toolkit/ast
```

パーサーは、これを任意の peer 依存にしています。
入れないと、`parse()` は `any` を返します。
`skipLibCheck` が無効なら、
TypeScript はパーサーの宣言ファイルで `TS2307` を報告します。

## 使い方

```ts
import { parse } from "@mmd-toolkit/parser"

const root = parse("flowchart LR\nA[Start] --> B")

const diagramType = root.diagramType // "flowchart-v2"
const range = root.range // [0, 27]
const bodyType = root.body.type // "FlowchartDiagram"
const tokenCount = root.tokens.length // 8
```

`root.body` は図そのものです。
すべてのオブジェクトから `loc` の欄を省くと、次のとおりです。

```json
{
  "type": "FlowchartDiagram",
  "direction": "LR",
  "body": [
    {
      "type": "FlowchartVertexStatement",
      "first": {
        "type": "FlowchartVertexGroup",
        "vertices": [
          {
            "type": "FlowchartVertex",
            "id": { "type": "Identifier", "name": "A", "range": [13, 14] },
            "shape": {
              "type": "FlowchartShape",
              "name": "rectangle",
              "property": null,
              "label": {
                "type": "FlowchartLabel",
                "kind": "text",
                "value": "Start",
                "range": [15, 20]
              },
              "range": [14, 21]
            },
            "cssClass": null,
            "data": [],
            "range": [13, 21]
          }
        ],
        "range": [13, 21]
      },
      "links": [
        {
          "type": "FlowchartLink",
          "id": null,
          "opening": null,
          "arrow": {
            "type": "FlowchartArrow",
            "value": "-->",
            "startMarker": "none",
            "line": "solid",
            "length": 2,
            "endMarker": "arrow",
            "range": [22, 25]
          },
          "label": null,
          "target": {
            "type": "FlowchartVertexGroup",
            "vertices": [
              {
                "type": "FlowchartVertex",
                "id": { "type": "Identifier", "name": "B", "range": [26, 27] },
                "shape": null,
                "cssClass": null,
                "data": [],
                "range": [26, 27]
              }
            ],
            "range": [26, 27]
          },
          "range": [22, 27]
        }
      ],
      "range": [13, 27]
    }
  ],
  "range": [0, 27]
}
```

8 個のトークンは、`flowchart`、`LR`、`A`、`[`、`Start`、`]`、`-->`、`B` です。

## 対応している図

| 図                             | 図種 id（ヘッダー）                                                                                                                                 | ノード                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| flowchart                      | `flowchart-v2`（`flowchart`、`graph`）、`flowchart-elk`（`flowchart-elk`）、`swimlane`（`swimlane-beta`）                                           | [`ast/flowchart.md`](../spec/docs/ast/flowchart.ja.md)         |
| シーケンス図                   | `sequence`（`sequenceDiagram`）                                                                                                                     | [`ast/sequence.md`](../spec/docs/ast/sequence.ja.md)           |
| クラス図                       | `classDiagram`（`classDiagram`、`classDiagram-v2`）                                                                                                 | [`ast/class.md`](../spec/docs/ast/class.ja.md)                 |
| 状態図                         | `stateDiagram`（`stateDiagram`、`stateDiagram-v2`）                                                                                                 | [`ast/state.md`](../spec/docs/ast/state.ja.md)                 |
| ER 図                          | `er`（`erDiagram`）                                                                                                                                 | [`ast/er.md`](../spec/docs/ast/er.ja.md)                       |
| Gantt チャート                 | `gantt`（`gantt`）                                                                                                                                  | [`ast/gantt.md`](../spec/docs/ast/gantt.ja.md)                 |
| journey 図                     | `journey`（`journey`）                                                                                                                              | [`ast/journey.md`](../spec/docs/ast/journey.ja.md)             |
| 要求図                         | `requirement`（`requirementDiagram`）                                                                                                               | [`ast/requirement.md`](../spec/docs/ast/requirement.ja.md)     |
| mindmap                        | `mindmap`（`mindmap`）                                                                                                                              | [`ast/mindmap.md`](../spec/docs/ast/mindmap.ja.md)             |
| timeline                       | `timeline`（`timeline`）                                                                                                                            | [`ast/timeline.md`](../spec/docs/ast/timeline.ja.md)           |
| sankey 図                      | `sankey`（`sankey`、`sankey-beta`）                                                                                                                 | [`ast/sankey.md`](../spec/docs/ast/sankey.ja.md)               |
| XY チャート                    | `xychart`（`xychart`、`xychart-beta`）                                                                                                              | [`ast/xychart.md`](../spec/docs/ast/xychart.ja.md)             |
| 四象限チャート                 | `quadrantChart`（`quadrantChart`）                                                                                                                  | [`ast/quadrant.md`](../spec/docs/ast/quadrant.ja.md)           |
| ブロック図                     | `block`（`block-beta`、`block`）                                                                                                                    | [`ast/block.md`](../spec/docs/ast/block.ja.md)                 |
| kanban 図                      | `kanban`（`kanban`）                                                                                                                                | [`ast/kanban.md`](../spec/docs/ast/kanban.ja.md)               |
| C4 図                          | `c4`（`C4Context`、`C4Container`、`C4Component`、`C4Dynamic`、`C4Deployment`）                                                                      | [`ast/c4.md`](../spec/docs/ast/c4.ja.md)                       |
| Venn 図                        | `venn`（`venn-beta`）                                                                                                                               | [`ast/venn.md`](../spec/docs/ast/venn.ja.md)                   |
| Ishikawa 図                    | `ishikawa`（`ishikawa`、`ishikawa-beta`）                                                                                                           | [`ast/ishikawa.md`](../spec/docs/ast/ishikawa.ja.md)           |
| Agentflow 図                   | `agentflow`（`agentflow-beta`）                                                                                                                     | [`ast/agentflow.md`](../spec/docs/ast/agentflow.ja.md)         |
| Usecase 図                     | `usecase`（`usecase-beta`）                                                                                                                         | [`ast/usecase.md`](../spec/docs/ast/usecase.ja.md)             |
| 円グラフ                       | `pie`（`pie`）                                                                                                                                      | [`ast/pie.md`](../spec/docs/ast/pie.ja.md)                     |
| gitgraph 図                    | `gitGraph`（`gitGraph`）                                                                                                                            | [`ast/gitgraph.md`](../spec/docs/ast/gitgraph.ja.md)           |
| info 図                        | `info`（`info`）                                                                                                                                    | [`ast/info.md`](../spec/docs/ast/info.ja.md)                   |
| packet 図                      | `packet`（`packet`、`packet-beta`）                                                                                                                 | [`ast/packet.md`](../spec/docs/ast/packet.ja.md)               |
| architecture 図                | `architecture`（`architecture-beta`）                                                                                                               | [`ast/architecture.md`](../spec/docs/ast/architecture.ja.md)   |
| radar 図                       | `radar`（`radar-beta`）                                                                                                                             | [`ast/radar.md`](../spec/docs/ast/radar.ja.md)                 |
| treemap 図                     | `treemap`（`treemap`、`treemap-beta`）                                                                                                              | [`ast/treemap.md`](../spec/docs/ast/treemap.ja.md)             |
| railroad 図                    | `railroad`（`railroad-beta`）、`railroadEbnf`（`railroad-ebnf-beta`）、`railroadAbnf`（`railroad-abnf-beta`）、`railroadPeg`（`railroad-peg-beta`） | [`ast/railroad.md`](../spec/docs/ast/railroad.ja.md)           |
| Wardley マップ                 | `wardley`（`wardley-beta`）                                                                                                                         | [`ast/wardley.md`](../spec/docs/ast/wardley.ja.md)             |
| Cynefin 図                     | `cynefin`（`cynefin-beta`）                                                                                                                         | [`ast/cynefin.md`](../spec/docs/ast/cynefin.ja.md)             |
| eventmodeling 図               | `eventmodeling`（`eventmodeling`）                                                                                                                  | [`ast/eventmodeling.md`](../spec/docs/ast/eventmodeling.ja.md) |
| treeview                       | `treeView`（`treeView-beta`）                                                                                                                       | [`ast/treeview.md`](../spec/docs/ast/treeview.ja.md)           |
| mermaid.js の `error` 疑似図種 | `error`（`error`）                                                                                                                                  | [`ErrorDiagram`](../spec/docs/ast.ja.md#errordiagram)          |

これで mermaid.js 12.3.0 のすべての図種です。

## API

詳しくは
[パーサーの API](https://mmd-toolkit.github.io/mmd-toolkit/ja/parser/api.html)
のページにあります。

### `parse(text)`

木の `Root` を返します。

- `diagramType`: mermaid.js が報告する図種 id。
  例えば `flowchart-v2`。
- `body`: 図。
  例えば `FlowchartDiagram`。
- `tokens`: すべてのトークン。
  ソース順。
  トークンは、`Keyword` や `RawText` などの `type` と、
  範囲のソースのテキストである `value` を持ちます。
  空白でも行終端子でもない文字は、どれもトークンかコメントにあります。
- `comments`: すべてのコメント。
  `mark` は `%%` などの印の文字で、`value` は印の後のテキストです。
  コメント行に切られたコメントの残りの部分の `mark` は `null` です。
- `directives`: すべての `%%{ ... }%%` のディレクティブ。
  `name`、`value`（内側のテキスト）、閉じているかどうかの `closed` を持ちます。
- `frontmatter`: フロントマター。
  なければ `null`。
  `value` は書かれたままの YAML のテキストで、解釈はしません。
- `range` と `loc`: 入力全体。

トークン、コメント、ディレクティブ、フロントマターはノードではありません。
これらの一覧から読みます。
欄とトークンの種類は、[トークン](./docs/tokens.ja.md#トークン)と、
[コメント、ディレクティブ、フロントマター](../spec/docs/ast.ja.md#ディレクティブとフロントマター)。

### 位置

すべてのノード、トークン、コメント、ディレクティブと、フロントマターは、
ESTree と同じく `range` と `loc` を持ちます。

- `range` は UTF-16 のコード単位で数えた `[start, end]` です。
  `end` は含みません。
- `loc` は `{ start, end }` で、それぞれ 1 から数える `line` と、
  0 から数える `column` を持ちます。

### エラー

- `ParseError` は、入力を拒否するときに投げます。
  `index`、`range`、`loc` を持つ `SyntaxError` です。
  位置の決め方は [`docs/error-positions.ja.md`](./docs/error-positions.ja.md)。

`ParseError` は `name` を設定しているので、
`instanceof` を使わずに見分けられます。

```ts
import { parse, ParseError } from "@mmd-toolkit/parser"

try {
  parse(text)
} catch (error) {
  if (error instanceof ParseError) {
    const { line, column } = error.loc.start
    // error.message を line 行 column 列に示す。
  } else {
    throw error
  }
}
```

### 型

[`@mmd-toolkit/ast`](../ast)（[導入](#導入)を参照）は、`Root`、
`FlowchartVertex`、`Identifier` など、すべてのノードの TypeScript の型と、
図種 id の合併型 `DiagramType` を公開しています。
パーサーが公開するのは、`Visitor` など、パーサー自身の型だけです。
名前と欄は、仕様の [`ast.md`](../spec/docs/ast.ja.md) と、
各図のノードの文書のものです。
各図のノードの文書は、[対応している図](#対応している図)の表から辿れます。

## 木を辿る

```ts
import { parse, traverseNodes, visitorKeys } from "@mmd-toolkit/parser"

traverseNodes(parse(text), {
  enterNode(node, parent) {
    // `node` の子ノードより前。最初のノードでは `parent` は null。
  },
  leaveNode(node, parent) {
    // `node` の子ノードより後。
  },
})

const childFieldsOfRoot = visitorKeys.Root // ["body"]
```

- `traverseNodes(node, visitor)` は、`node` とその下のすべてのノードを訪れます。
- `visitorKeys` は、ノードの種類ごとの子の欄を、辿る順に並べたものです。
- トークン、コメント、ディレクティブ、フロントマターは訪れません。
- 子ノードのリストは、
  `classDef a,,b` の空の部分のように `null` を持つことがあります。
  辿るときは飛ばします。

## 木が保つもの

- 入力は何も失われません。
  テキストと範囲から、入力をバイト単位で組み立て直せます。
- 書き手が書いた名前と値（id、ラベル、スタイルなど）は、
  自分の範囲を持つノードです。
- そうしたノードの値は、書き手がその範囲に書いたものから、次を除いたものです。
  - その中のディレクティブとコメント
  - `style` 行と `classDef` 行で mermaid.js が無視する `;`
- ほかは何も変換しません。
  実体参照、属性の引用符、行終端子は書かれたまま残ります。
  文字列の値は引用符を含みません。
  正確な規則は [`ast.md` のノード](../spec/docs/ast.ja.md#ノード)。
- 引用符で囲んだ文字列（`StringLiteral`）と数（`NumericLiteral`）は `raw`
  も持ちます。
  ノードのソースのテキストを書かれたまま、引用符もコメントも含めて持ちます。
  `click A href "u"` の URL は、`value` が `u`、`raw` が `"u"` です。
- トークンの `value` は、その範囲のソースのテキストです。

## mermaid.js との違い

`parse()` は、mermaid.js 12.3.0 が受理するものを受理し、拒否するものを拒否し、
受理したテキストを同じ図として読みます。
例外は、仕様の[既知の差異](../spec/docs/known-divergences.ja.md)です。
それぞれの文書に、違いが出る入力と、どちらでも同じに読まれる書き方があります。
たとえば:

- `sub%%{init: {}}%%graph S` のようにキーワードの内側にディレクティブがあると、
  `parse()` は例外を投げます。
  mermaid.js は前後のテキストをつないで読みます。
- flowchart では `click` は予約語です。
  `parse()` は click 文の先頭でだけ受け付け、
  `subgraph click me` のようにそれ以外の場所では例外を投げます。
  mermaid.js はこれを受理し、書かれたものとは違う図を描くことがよくあります。
- フロントマター、ディレクティブ、
  `@{ ... }` のデータブロックの中身は検査しません。
  その中身が壊れている、形が違う、
  図形など未知のものを指すという理由で mermaid.js が拒否する入力も受理します。

`parse()` は mermaid.js のサイトの設定を知らないので、
辺の数が `maxEdges`（既定 500）を超える flowchart も受理します。

これらの違いによる拒否も、ほかと同じ `ParseError` です。

## 文書

- [パーサーの案内](https://mmd-toolkit.github.io/mmd-toolkit/ja/parser/)、
  [API](https://mmd-toolkit.github.io/mmd-toolkit/ja/parser/api.html)、
  [ASTの走査](https://mmd-toolkit.github.io/mmd-toolkit/ja/parser/traversal.html):
  パーサーの使い方。
- [互換性](https://mmd-toolkit.github.io/mmd-toolkit/ja/reference/):
  保証することと、mermaid.js との違い。
- 仕様: [`ast.md`](../spec/docs/ast.ja.md)（木）、
  各図のノードの文書（[対応している図](#対応している図)の表から辿れます）、
  [`common.md`](../spec/docs/common.ja.md)（すべての図に共通の規則）。
- [`docs/tokens.ja.md`](./docs/tokens.ja.md): トークンと根の一覧。
  [`docs/positions.ja.md`](./docs/positions.ja.md): 位置、ノードの範囲、
  木の不変条件。
- [`docs/error-positions.ja.md`](./docs/error-positions.ja.md): `ParseError`
  が指す位置。
- パーサーを開発する人向け:
  [`docs/development.ja.md`](./docs/development.ja.md)、
  [`docs/testing.ja.md`](./docs/testing.ja.md)。
