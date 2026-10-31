# @mmd-toolkit/textmate-grammar

英語版: [README.md](./README.md)

Mermaidの図の構文（`.mmd`）のためのTextMate文法です。
mmd-toolkitの[仕様](../spec/README.ja.md)の32図種に色を付けます。
ヘッダーとキーワード、要素の名前、ラベル、型、図形、スタイル、コメント、
ディレクティブに色を付け、frontmatterはYAMLとして色付けします。
すべての規則を仕様から書いているので、図の各単位は、
仕様がそこで読む単位の種類として色付けされます。

mermaid-jsとは関係のない、サードパーティのプロジェクトです。

## Playground

[Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/)は、
エディターをこの文法で色付けします。
[ドキュメントサイト](https://mmd-toolkit.github.io/mmd-toolkit/)は、
Mermaidのコードブロックをこの文法で色付けします。

## インストール

```sh
npm install @mmd-toolkit/textmate-grammar
```

ESモジュールで、Node.js `^20.19.0 || ^22.13.0 || >=24`が要ります。

## パッケージの中身

- `@mmd-toolkit/textmate-grammar`のdefault export:
  Shikiの言語の登録（`LanguageRegistration`）です。
  名前は`mermaid`、別名は`mmd`です。
- `@mmd-toolkit/textmate-grammar/mermaid.tmLanguage.json`:
  同じ文法のTextMate文法ファイルです。
  スコープ名は`source.mermaid`で、VS CodeやほかのTextMateのホストで使います。

## ホストに要るもの

この文法には、Onigurumaの正規表現エンジンが要ります。
すべてのパターンは`(?I)`で始まります。
`(?I)`は、大文字小文字の無視をASCIIに限るOnigurumaのオプションです。
仕様は、多くの図種のキーワードを大文字小文字を区別せずに比べます。
そのとき、仕様の[表記](../spec/docs/common.ja.md#表記)により、
キーワードのASCIIの文字は、そのASCIIの大文字と小文字にだけ一致します。
たとえばsequence図では、`DESTROY`はキーワード`destroy`ですが、
long sを含む`deſtroy`はキーワードではありません。
`(?I)`がなければ、Onigurumaの大文字小文字の無視は、これにも一致します。

- ShikiのOnigurumaエンジン（`createOnigurumaEngine`）は、これを読めます。
  `createHighlighter`とVitePressが既定で使うのも、このエンジンです。
- VS Codeも読めます。
  VS CodeはTextMate文法をOnigurumaでトークン化します。
- ShikiのJavaScriptエンジン（`createJavaScriptRegexEngine`）は、
  `Invalid or unsupported group option "(?I)"`というエラーで、
  この文法を拒否します。

この文法には、スコープ名が`source.yaml`のYAMLの文法も要ります。
frontmatterの本文を色付けするためです。
Shikiでは、言語`yaml`をあわせて読み込んでください。
読み込まないと、Shikiは`yaml`がないというエラーを投げます。
VS Codeは、YAMLの文法を最初から持っています。

この文法は、ホストが渡す行を読みます。
仕様は単独の復帰（CR）を行の終わりとして読みますが、
ShikiはテキストをLFとCRLFでだけ行に分けます。
そのためShikiでは、単独のCRはその行の中に残り、その行の残りは、
そこで行が終わっていないものとして色付けされます。

## 使い方

### Shiki

```js
import { createHighlighter } from "shiki"
import mermaid from "@mmd-toolkit/textmate-grammar"

const highlighter = await createHighlighter({
  themes: ["github-light"],
  langs: [mermaid, "yaml"],
})

const html = highlighter.codeToHtml("flowchart LR\n  A[Start] --> B", {
  lang: "mermaid",
  theme: "github-light",
})
```

`lang: "mmd"`でも同じ言語を指します。
`"mermaid"`を名前でも並べないでください。
Shikiは同じ名前で自前のMermaid文法を同梱しており、
`mermaid`という名前の言語が2つあると、後に並べたほうが使われます。

細かく分けたバンドル（`createHighlighterCore`）では、
`shiki/langs/yaml.mjs`のYAMLの言語と、
エンジン`createOnigurumaEngine(import("shiki/wasm"))`を渡してください。

### VitePress

```js
// .vitepress/config.js
import mermaid from "@mmd-toolkit/textmate-grammar"

export default {
  markdown: {
    languages: [mermaid, "yaml"],
  },
}
```

これで、`mermaid`か`mmd`と書いたコードブロックが、この文法で色付けされます。
Shikiと同じく、`"mermaid"`を名前でも並べないでください。

### Monaco Editor

[`@shikijs/monaco`](https://shiki.style/packages/monaco)を使います。
上と同じく、この文法を持つShikiのhighlighterを作り、
Monacoに言語を登録してから（`monaco.languages.register({ id: "mermaid" })`）、
`shikiToMonaco(highlighter, monaco)`を呼んでください。
Monacoは、言語`mermaid`のモデルをこの文法で色付けします。

vscode-textmateとvscode-onigurumaのような、ほかのTextMateのホストでは、
`mermaid.tmLanguage.json`を`source.mermaid`の文法として読み込み、
`source.yaml`のYAMLの文法もあわせて読み込みます。

### VS Codeの拡張機能

パッケージの`lib/mermaid.tmLanguage.json`を拡張機能にコピーし、
拡張機能の`package.json`で提供してください。

```json
{
  "contributes": {
    "languages": [
      {
        "id": "mermaid",
        "aliases": ["Mermaid"],
        "extensions": [".mmd", ".mermaid"]
      }
    ],
    "grammars": [
      {
        "language": "mermaid",
        "scopeName": "source.mermaid",
        "path": "./syntaxes/mermaid.tmLanguage.json"
      }
    ]
  }
}
```

## スコープ

テーマは、トークンのスコープで文法に色を付けます。
受理される入力で仕様が定めるすべての単位に、
全図種でこの表から種類に応じたスコープを付けます。
以下の色は、Shikiのテーマgithub-lightの色です。
github-darkも、名前、ラベル、型、キーワードを4つの異なる色で示します。
playgroundとドキュメントサイトは、この2つのテーマを使います。

| 単位の種類                     | スコープ                                                                     | 色       |
| ------------------------------ | ---------------------------------------------------------------------------- | -------- |
| ヘッダー、キーワード           | `keyword.control.mermaid`                                                    | 赤       |
| 要素の名前                     | `variable.mermaid`                                                           | オレンジ |
| 関数の名前（コールバック）     | `entity.name.function.mermaid`                                               | 紫       |
| ラベルやテキスト（引用符なし） | `string.unquoted.mermaid`                                                    | 濃い青   |
| 引用符付き文字列               | `string.quoted.double.mermaid`、`string.quoted.single.mermaid`               | 濃い青   |
| Markdown文字列                 | `string.quoted.other.markdown.mermaid`                                       | 濃い青   |
| 型                             | `entity.name.type.mermaid`                                                   | 紫       |
| キーや修飾子                   | `storage.modifier.mermaid`                                                   | 赤       |
| プロパティ名                   | `support.type.property-name.mermaid`                                         | 青       |
| スタイルのプロパティ値         | `support.constant.property-value.mermaid`                                    | 青       |
| 数値                           | `constant.numeric.mermaid`                                                   | 青       |
| 固定値                         | `constant.language.mermaid`                                                  | 青       |
| エスケープ                     | `constant.character.escape.mermaid`                                          | 青       |
| 矢印や関係                     | `keyword.operator.arrow.mermaid`                                             | 赤       |
| その他の演算子                 | `keyword.operator.mermaid`                                                   | 赤       |
| 図形の区切り                   | `keyword.operator.shape.begin.mermaid`、`keyword.operator.shape.end.mermaid` | 赤       |
| ブロックの区切り               | `keyword.operator.block.begin.mermaid`、`keyword.operator.block.end.mermaid` | 赤       |
| その他の区切り                 | `punctuation.definition.<what>.begin.mermaid`、`….end.mermaid`               | 文字色   |
| リストや引数の括弧             | `punctuation.section.<what>.begin.mermaid`、`….end.mermaid`                  | 文字色   |
| 分離記号                       | `punctuation.separator.<name>.mermaid`                                       | 文字色   |
| コメント                       | `comment.line.<mark>.mermaid`、`comment.block.mermaid`                       | 灰色     |
| どの規則も読まないテキスト     | `comment.block.ignored.mermaid`                                              | 灰色     |
| ディレクティブ                 | `meta.directive.mermaid`                                                     | 下記参照 |
| frontmatter                    | `meta.embedded.block.yaml`                                                   | YAML     |
| データブロック                 | `meta.data.mermaid`                                                          | 下記参照 |

構造を包む `meta.*` スコープ自体は色を持たず、
中の単位はそれぞれの種類のスコープを持ちます。

各種類に含むものは、次のとおりです。

- 要素の名前は、図が定義または参照する識別子です。
  ノードID、エッジID、エンティティ、属性名、状態（`[*]`も）、
  参加者やアクターのID、図の要素としてのクラス、メンバー名、タスクID、
  コミットID、ブランチ、規則名、スタイルのクラス名（`classDef`の名前、
  `:::name`、`class A name`）です。
  mindmapの裸のノードのように、
  仕様が1つのテキストをIDと表示テキストの両方として読む場合、
  そのテキストはラベルです。
- 関数の名前は、文が呼び出すコールバックです。
- ラベルやテキストは、図が表示または保持するテキストです。
  ノードやエッジのラベル、関係のラベル、メッセージ、ノート、タイトル、説明、
  アクセシビリティ値、タスクのテキスト、アイコンの名前です。
  引用符で囲まれていれば、引用符付き文字列のスコープを持ちます。
- 型は、属性やメンバーの型、戻り値の型、総称型の引数、型としてのクラス名です。
- キーや修飾子は、メンバーや属性を修飾する語や記号です。
  `PK`、`FK`、`UK`、可視性、分類子、ステレオタイプです。
- プロパティ名は、スタイルのプロパティの名前か、キーと値の組のキーです。
  図種の文書がキーを読むデータブロックのキーや、
  C4の名前付き属性のキー（`$key=`）、
  `[|`で書くflowchartの長方形のプロパティ（`[|borders:lt|text]`）です。
  このプロパティの値の`lt`は、テキストです。
- スタイルのプロパティは、スタイルの1つの`name:value`です。
  `fill:#43a047`の名前は`fill`、値は全体で1つの`#43a047`であり、
  その中に数値はありません。
  `bold`や`#fff`のように`:`のないスタイルは、スタイルの全体で1つの値です。
- 固定値は、仕様が値として列挙する語です。
  方向（`TD`、`LR`など）、向き、`true`と`false`です。
- 図形の区切りは、ノードの形を選ぶ括弧です。
  flowchartやmindmapの円の`((`と`))`、kanbanの項目の`[`と`]`、
  六角形の`{{`と`}}`などです。
  ブロックの区切りは、文、メンバー、属性のブロックを開閉する括弧です。
  複合状態、ERエンティティ、クラス本体の`{`などです。
  `subgraph`と`end`のようにブロックを開閉するキーワードは、
  キーワードのままです。
  図形とブロックの区切りは図を読むときに意味を持つので、色を付けます。
- その他の区切り（`|`のようなラベルの区切り、ディレクティブの印）、
  リストや引数の括弧、分離記号（`:`、`,`、`;`、`:::`）は文字色を保ちます。
  プロパティ名とその値の間の`:`は、
  `punctuation.separator.key-value.mermaid`です。
  文字列の引用符は`punctuation.definition.string.begin.mermaid`と`….end`で、
  文字列のスコープの中にあり、テーマは文字列の色で示します。
  コメントの印は、コメントの一部です。
- どの規則も読まないテキストは、仕様が何もないものとして読むテキストです。
  隠れたYAML、隠れたディレクティブ、無視されるテキストです。
- ディレクティブでは、名前は`entity.name.function.directive.mermaid`（紫）、
  引数は`string.unquoted.directive.mermaid`（濃い青）、
  名前の後の`:`は`punctuation.separator.colon.mermaid`、
  印は`punctuation.definition.directive.begin.mermaid`と`….end`です。
- データブロック（`@{ … }`）では、
  括弧は`punctuation.section.data.begin.mermaid`と`….end`です。
  図種の文書がその中のキーと値を読むときは、キーはプロパティ名、
  値はその種類のスコープです。
  文書が中身をテキストとして読むとき（kanban、flowchart、agentflow、sequence、
  eventmodeling、usecaseのJSONの値）は、
  図種の文書がブロックを終えるとする`}`までの中身の全体が、
  引用符も含めてテキストです。
- テキスト中のHTMLタグとエンティティは、そのテキストのスコープを保ちます。

## 図種

agentflow、architecture、block、c4、class、cynefin、er、eventmodeling、
flowchart、gantt、gitgraph、info、ishikawa、journey、kanban、mindmap、packet、
pie、quadrant、radar、railroad、requirement、sankey、sequence、state、
timeline、treemap、treeview、usecase、venn、wardley、xychartです。
仕様の[`docs/diagrams/`](../spec/docs/diagrams/)の文書1つにつき1つです。
図は、その文書のDetection節が受理するどのヘッダーからでも始まります。
たとえばflowchartの4つ（`graph`、`flowchart`、`flowchart-elk`、
`swimlane-beta`）、c4の5つ、railroadの4つです。
そこからテキストの終わりまでを、その図種の規則が色付けします。

この文法が従う仕様は、版0.1.0（gitのタグ`@mmd-toolkit/spec@0.1.0`）です。
この版の仕様は、mermaid 12.2.0に従います。

## 制限

この文法は構文解析をせずに色を付けるので、
仕様が読むとおりの単位として色付けできない場合があります。

- 行ごとに読みます。
  この文法が1つのパターンで読む形は、始まった行でだけ読みます。
  キーワードと次の行から始まる値のように、部分が改行をまたぐときは、
  次の行の部分はまわりの規則で色付けされます。
  開きの区切りから閉じの区切りまでを読む形は、行をまたいで続きます。
  flowchartの引用符付きのラベルや、
  ディレクティブの自由テキストの引数がそうです。
  ほかの行で決まる読み方は、1つの行だけでは分かりません。
  たとえばtreeviewでは、縦線だけの行が箱の飾りになるのは、
  木のほかの行が箱の文字（`─`、`━`、`│`、`┃`、`└`、`┗`、`├`、
  `┣`）を含むときだけです。
  コメントの行、タイトルやアクセシビリティの行、縦線だけのほかの行は数えません。
  この文法は、そのような行をいつも飾りとして色付けします。
- テキストが受理されるかを確かめません。
  閉じていない形、必須なのに空の値、単位が許さない文字、数の誤りのように、
  拒否されるテキストも、受理されるかのように色付けされることがあります。
  閉じていない括弧やブロックは、テキストの残りをその中身として色付けします。
  図が正しいかどうかは、
  [パーサー](../parser/README.ja.md)と
  [リンター](../eslint-plugin/README.ja.md)が示します。
- 単位の後で、同じ行の次の文や単位を認識するのは、規則が名指しする位置だけです。
  行の始め、ヘッダーの直後、ディレクティブを閉じる`}%%`の直後、
  閉じる区切りの直後です。
  `}%%`のないディレクティブ（`%%{init: dark title t`のように、
  語の引数で終わるもの）の後の文は認識しません。
- 仕様は、HTML属性の引用符付きの値の`"`を`'`として読みます。
  この文法がそう読むのは、タグ全体を含む二重引用符の文字列やラベルの中だけです。
  同じ行の前の単位でタグが始まるとき、
  読み替えた引用符が一重引用符の文字列を終えたり始めたりするとき、
  引用符がディレクティブの中にあるときは、書かれたとおりに読みます。
- `style`と`classDef`の行の規則が無視する`;`は、
  まわりの規則が読むとおりに色付けします。
- ディレクティブに属する行区切りや段落区切りも、
  コメント行が始まりうる位置として読みます。
  文字列、ラベル、ブロックの中のコメント行は、その文字列、ラベル、
  ブロックのスコープの中のコメントとして色付けします。
- 行末の`%%{`は、次の行がディレクティブの名前で始まるときと同じく、
  ディレクティブの開きとして色付けします。
  次の行が語で始まらないとき、仕様はその`%%{`の行をコメント行として読みます。
  ディレクティブの自由テキストの引数が行区切りか段落区切りで止まり、
  閉じる`}%%`が次の行にあるとき、
  その`}%%`はディレクティブの終わりとして色付けされません。
- ヘッダーより前では、テキストの最初の行でなくても、
  `---`の行がfrontmatterを始めます。
- 一部の図種の本文の中の隠れたYAMLと隠れたディレクティブは、
  コメントとして色付けします。
- 文字列の中で、HTMLタグの`<`の前のバックスラッシュは、
  エスケープではなくテキストとして色付けします。
  タグは書かれたとおりのテキストで読まれ、
  その引用符が文字列の終わりを決めるからです。

## 文書

- [仕様](../spec/README.ja.md): この文法が従う構文。
- [docs/development.ja.md](./docs/development.ja.md): 書き方、ビルド、テスト。
