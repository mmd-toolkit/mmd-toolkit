# @mmd-toolkit/parser

英語版: [README.md](./README.md)

Mermaid 記法（`.mmd`）のパーサーです。
図のテキストを、入力のすべての文字を保ち、各部分の位置を持つ木にします。

mermaid-js とは無関係の第三者プロジェクトです。

## 導入

```sh
npm install @mmd-toolkit/parser
```

このパッケージは、まだ npm に公開していません。
mermaid.js のすべての図種に対応してから公開します。

ES モジュールで、Node.js `^20.19.0 || ^22.13.0 || >=24` が要ります。

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
            "className": null,
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
                "className": null,
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

- flowchart: `flowchart-v2`（`flowchart` と `graph`）、
  `flowchart-elk`、`swimlane`（`swimlane-beta`）。
- シーケンス図: `sequence`（`sequenceDiagram`）。
- mermaid.js の `error` 疑似図種。

`parse()` は、mermaid.js 12.0.0 のほかの図種も見分けますが、
それらには `UnsupportedDiagramError` を投げます。

## API

### `parse(text)`

木の `Root` を返します。

- `diagramType`: mermaid.js が報告する図種 id。
  例えば `flowchart-v2`。
- `body`: 図。
  例えば `FlowchartDiagram`。
- `tokens`: すべてのトークン。
  ソース順。
  図のトークンと、
  ほかのトークンとコメントの外にある各ディレクティブの、
  `Directive` のトークンと、
  フロントマターがあれば、最初にフロントマターのトークンがあります。
  開く `---` と閉じる `---` が `Punctuator` のトークンで、
  その間の本文が、すべて空白でなければ `RawText` のトークンです。
  トークンは、`Keyword` や `RawText` などの `type` と、
  範囲のソースのテキストである `value` を持ちます。
  空白でも行終端子でもない文字は、どれもトークンかコメントにあります。
- `comments`: すべてのコメント。
  `%%` のコメント行と、図種の字句解析器がコメントとして読むもの
  （シーケンス図の行の途中の `#` や `%` など）です。
  `value` は印の後のテキストです。
  印は、コメント行なら `%%`、
  シーケンス図のコメントなら先頭の `#`、`%%`、`%` です。
- `directives`: すべての `%%{ ... }%%` のディレクティブ。
  `name`、`value`（内側のテキスト）、閉じているかどうかの `closed` を持ちます。
- `frontmatter`: フロントマター。
  なければ `null`。
  `value` は書かれたままの YAML のテキストで、解釈はしません。
- `range` と `loc`: 入力全体。

トークン、コメント、ディレクティブ、フロントマターはノードではありません。
これらの一覧から読みます。
欄とトークンの種類は、[`ast.md` のトークン](../spec/docs/ast.ja.md#トークン)と、
[コメント、ディレクティブ、フロントマター](../spec/docs/ast.ja.md#コメントディレクティブフロントマター)。

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
- `UnsupportedDiagramError` は、図種を見分けたが、
  まだ対応していないときに投げます。
  `diagramType` がその図種です。

どちらも `name` を設定しているので、`instanceof` を使わずに見分けられます。

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

`Root`、`FlowchartVertex`、`Identifier` など、
すべてのノードの TypeScript の型と、
図種 id の合併型 `DiagramType` を公開しています。
名前と欄は、仕様の [`ast.md`](../spec/docs/ast.ja.md)、
[`ast/flowchart.md`](../spec/docs/ast/flowchart.ja.md)、
[`ast/sequence.md`](../spec/docs/ast/sequence.ja.md) のものです。

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

`parse()` は、mermaid.js 12.0.0 が受理するものを受理し、
拒否するものを拒否します。
ただし次の違いがあります。

- キーワード、矢印、文字列、数、記号の内側にディレクティブがあると、
  `parse()` は例外を投げます。
  mermaid.js は前後のテキストをつないで読みます
  （[`directive-as-token-boundary`](../spec/docs/known-divergences.ja.md#directive-as-token-boundary)）。
- フロントマター、ディレクティブ、
  `@{ ... }` のデータブロックの中身は確かめないので、中身が壊れている、
  形が違う、知らない名前（形の名前など）を挙げている、
  という理由で mermaid.js が拒否する入力も受理します
  （[`embedded-data-opaque`](../spec/docs/known-divergences.ja.md#embedded-data-opaque)）。
- フロントマターで始まる HTML タグは、
  図のテキストの読み方を変えません
  （[`html-tag-in-frontmatter`](../spec/docs/known-divergences.ja.md#html-tag-in-frontmatter)）。
- flowchart では、`click` は予約語です。
  `parse()` はクリックの文の始まりでだけ受け付け、
  `subgraph click me` や `click A href "u" click "tip"` のように、
  それ以外の場所では例外を投げます。
  mermaid.js はこれらを受理し、多くは書かれたものと違うものを描きます
  （[`click-reserved-word`](../spec/docs/known-divergences.ja.md#click-reserved-word)）。
- flowchart では、空の文字列（`""`）と空の呼び出し（`call ()`）は、
  どこにも書けません。
  空の説明のブロック（`accDescr {}`）は、文の始まりにだけ書けます。
  それ以外の場所では、`A[""x]` や `A call ()-->B` のように、
  `parse()` は例外を投げます。
  mermaid.js は、それらがないかのように入力を受理します
  （[`tokenless-empty-forms`](../spec/docs/known-divergences.ja.md#tokenless-empty-forms)）。
  シーケンス図でも、空の説明のブロックについて同じです
  （`A->>accDescr {}B: x` など）。
- シーケンス図では、コメントは `%%` から始まり、
  数の後に `%%` が続いてもかまいません。
  mermaid.js は、そこで規則が始まるときには、
  `%%` の前の文字をコメントに含めます。
  `autonumber 10%% c` は、ここでは 10 から始まり、mermaid.js は拒否します。
  `C%% c` だけの行は、ここでは拒否し、mermaid.js はコメントとして読みます
  （[`comment-takes-character`](../spec/docs/known-divergences.ja.md#comment-takes-character)）。
- `parse()` はサイトの設定を知らないので、
  辺の数が `maxEdges`（既定 500）を超える flowchart も受理します。
- これらの違いによる拒否も、ほかと同じ `ParseError` です。

## 文書

- 仕様: [`ast.md`](../spec/docs/ast.ja.md)（木）、
  [`ast/flowchart.md`](../spec/docs/ast/flowchart.ja.md)（flowchart のノード）、
  [`ast/sequence.md`](../spec/docs/ast/sequence.ja.md)（シーケンス図のノード）、
  [`common.md`](../spec/docs/common.ja.md)（すべての図に共通の規則）。
- [`docs/error-positions.ja.md`](./docs/error-positions.ja.md): `ParseError`
  が指す位置。
- [`docs/development.ja.md`](./docs/development.ja.md): パーサーの作り。
- [`docs/testing.ja.md`](./docs/testing.ja.md): テストのしかた。
