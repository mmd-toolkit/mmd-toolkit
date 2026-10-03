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

- flowchart: `flowchart-v2`（`flowchart` と `graph`）、
  `flowchart-elk`、`swimlane`（`swimlane-beta`）。
- シーケンス図: `sequence`（`sequenceDiagram`）。
- クラス図: `classDiagram`（`classDiagram` と `classDiagram-v2`）。
- 状態図: `stateDiagram`（`stateDiagram` と `stateDiagram-v2`）。
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
  コメントはどのトークンの中にもありません。
  複数行の引用符つきのラベルのように、コメント行をまたぐトークンは、
  そこで断片に切られます。
  中にディレクティブや、行の規則が無視する `;` を持つ、
  テキストや引用符つきの文字列も同じです
  （[トークン](./docs/tokens.ja.md#トークン) を参照）。
  引用符つきの文字列の断片は `StringFragment` のトークンです。
- `comments`: すべてのコメント。
  `%%` のコメント行と、図種の字句解析器がコメントとして読むものです。
  後者は、シーケンス図の行の途中の `#` や `%`、クラス図の文の後の `%%`、
  状態図の `#` と `%%` などです。
  `mark` は印の文字です。
  印は、コメント行とクラス図のコメントなら `%%`、
  シーケンス図のコメントなら先頭の `#`、`%%`、`%`、
  状態図のコメントなら先頭の `#` か `%%` です。
  `value` は印の後のテキストです。
  U+2028 か U+2029 の後のコメント行は、
  それをまたいで続く図種のコメントを、トークンと同じく切ります。
  コメント行の後の部分は別のコメントで、
  `mark` は `null`、`value` はそのテキストです。
  状態図で `A %% x`、U+2029、行 `%% end`、行 `B` は、
  コメント `%% x`、`%% end`、`B` を持ち、状態は A だけです。
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
[`ast/sequence.md`](../spec/docs/ast/sequence.ja.md)、
[`ast/class.md`](../spec/docs/ast/class.ja.md)、
[`ast/state.md`](../spec/docs/ast/state.ja.md) のものです。

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

- 空白を含まない名前、キーワード、矢印、数、記号の内側に
  ディレクティブがあると、`parse()` は例外を投げます。
  mermaid.js は前後のテキストをつないで読みます
  （[`directive-as-token-boundary`](../spec/docs/known-divergences/directive-as-token-boundary.ja.md)）。
- `style` 行と `classDef` 行の規則が無視する `;` が、
  そのようなトークンの内側にあるときも、例外を投げます。
  mermaid.js はその `;` を除き、前後のテキストをつないで読みます
  （[`ignored-semicolon-as-token-boundary`](../spec/docs/known-divergences/ignored-semicolon-as-token-boundary.ja.md)）。
- フロントマター、ディレクティブ、
  `@{ ... }` のデータブロックの中身は確かめないので、中身が壊れている、
  形が違う、知らない名前（形の名前など）を挙げている、
  という理由で mermaid.js が拒否する入力も受理します
  （[`embedded-data-opaque`](../spec/docs/known-divergences/embedded-data-opaque.ja.md)）。
- フロントマターで始まる HTML タグは、
  図のテキストの読み方を変えません
  （[`html-tag-in-frontmatter`](../spec/docs/known-divergences/html-tag-in-frontmatter.ja.md)）。
- flowchart では、`click` は予約語です。
  `parse()` はクリックの文の始まりでだけ受け付け、
  `subgraph click me` や `click A href "u" click "tip"` のように、
  それ以外の場所では例外を投げます。
  mermaid.js はこれらを受理し、多くは書かれたものと違うものを描きます
  （[`click-reserved-word`](../spec/docs/known-divergences/click-reserved-word.ja.md)）。
- flowchart では、空の文字列（`""`）と空の呼び出し（`call ()`）は、
  どこにも書けません。
  空の説明のブロック（`accDescr {}`）は、文の始まりにだけ書けます。
  それ以外の場所では、`A[""x]` や `A call ()-->B` のように、
  `parse()` は例外を投げます。
  mermaid.js は、それらがないかのように入力を受理します
  （[`tokenless-empty-forms`](../spec/docs/known-divergences/tokenless-empty-forms.ja.md)）。
  シーケンス図でも、空の説明のブロックについて同じです
  （`A->>accDescr {}B: x` など）。
  クラス図では、空の文字列、空の呼び出し、空の説明のブロックに加えて、
  空のバッククォートの名前（` `` `）と、
  クラスの名前の終わりでない空のジェネリクスの型（`~~`）についても同じです
  （`class A~~B` など）。
  多重度やツールチップとしての空の文字列と、
  クラスの名前の終わりの `~~` は受理します。
  状態図では、空の説明のブロックについて同じです
  （`A accDescr {} --> B` など）。
- シーケンス図では、コメントは `%%` から始まり、
  数の後に `%%` が続いてもかまいません。
  mermaid.js は、そこで規則が始まるときには、
  `%%` の前の文字をコメントに含めます。
  `autonumber 10%% c` は、ここでは 10 から始まり、mermaid.js は拒否します。
  `C%% c` だけの行は、ここでは拒否し、mermaid.js はコメントとして読みます
  （[`comment-takes-character`](../spec/docs/known-divergences/comment-takes-character.ja.md)）。
- クラス図では、文の後のコメントは、その行の終わりで終わります。
  mermaid.js は、その後の改行も取り込み、
  次の行を同じ文の続きとして読みます。
  `A --> B %% c` の次に `class C` の行が続く入力は、
  ここでは受理し、mermaid.js は拒否します
  （[`comment-takes-line-break`](../spec/docs/known-divergences/comment-takes-line-break.ja.md)）。
- クラス図では、バッククォートの名前とジェネリクスの型は、
  どの文字で始まってもかまいません。
  ``class `note` `` はクラス `note` を宣言し、mermaid.js はこれを拒否します。
  ``A `"1"` --> B`` では、mermaid.js は文字列 `"1"` を多重度として読み、
  `parse()` はクラス `A"1"` からの関係として読みます
  （[`name-start-reads-unit`](../spec/docs/known-divergences/name-start-reads-unit.ja.md)）。
- クラス図は、ヘッダー（`classDiagram` か `classDiagram-v2`）と改行で
  始まらなければなりません。
  mermaid.js は、`classDiagramX` のように、
  ヘッダーの語にほかの語の文字が続くテキストも、
  `accTitle:` などのすぐ後でテキストが終わるときは受理します。
  `parse()` は例外を投げます
  （[`headerless-empty-ending`](../spec/docs/known-divergences/headerless-empty-ending.ja.md)）。
- `parse()` はサイトの設定を知らないので、
  辺の数が `maxEdges`（既定 500）を超える flowchart も受理します。
- これらの違いによる拒否も、ほかと同じ `ParseError` です。

## 文書

- 仕様: [`ast.md`](../spec/docs/ast.ja.md)（木）、
  [`ast/flowchart.md`](../spec/docs/ast/flowchart.ja.md)（flowchart のノード）、
  [`ast/sequence.md`](../spec/docs/ast/sequence.ja.md)（シーケンス図のノード）、
  [`ast/class.md`](../spec/docs/ast/class.ja.md)（クラス図のノード）、
  [`ast/state.md`](../spec/docs/ast/state.ja.md)（状態図のノード）、
  [`common.md`](../spec/docs/common.ja.md)（すべての図に共通の規則）。
- [`docs/tokens.ja.md`](./docs/tokens.ja.md): トークンと根の一覧。
  [`docs/positions.ja.md`](./docs/positions.ja.md): 位置、ノードの範囲、
  木の不変条件。
- [`docs/error-positions.ja.md`](./docs/error-positions.ja.md): `ParseError`
  が指す位置。
- [`docs/development.ja.md`](./docs/development.ja.md): パーサーの作り。
- [`docs/testing.ja.md`](./docs/testing.ja.md): テストのしかた。
