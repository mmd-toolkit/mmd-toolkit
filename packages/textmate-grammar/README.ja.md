# @mmd-toolkit/textmate-grammar

英語版: [README.md](./README.md)

[Mermaid](https://mermaid.js.org/)の図の構文（`.mmd`）のためのTextMate文法です。
Shiki、VitePress、Monaco、VS CodeなどのTextMateホストで、
Mermaidのテキストに色を付けます。
32図種すべてのヘッダーとキーワード、要素の名前、ラベル、型、図形、スタイル、
コメント、ディレクティブに色を付け、frontmatterはYAMLとして色付けします。
規則はmmd-toolkitの[仕様](../spec/README.ja.md)に従います。
仕様の読みと色が違う場所は、[制限](#制限)に書きました。

[mermaid-js](https://mermaid.js.org/)とは関係のない、
サードパーティのプロジェクトです。

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

この文法は、Onigurumaの正規表現エンジン向けに書いています。

- ShikiのOnigurumaエンジン（`createOnigurumaEngine`）は、これを読めます。
  `createHighlighter`とVitePressが既定で使うのも、このエンジンです。
- VS Codeも読めます。
  VS CodeはTextMate文法をOnigurumaでトークン化します。
- ShikiのJavaScriptエンジン（`createJavaScriptRegexEngine`）も読めます。
  最初の色付けには、より長い時間がかかります。

この文法には、スコープ名が`source.yaml`のYAMLの文法も要ります。
frontmatterの本文を色付けするためです。
Shikiでは、言語`yaml`をあわせて読み込んでください。
読み込まないと、Shikiは`yaml`がないというエラーを投げます。
VS Codeは、YAMLの文法を最初から持っています。

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

### VS Codeの拡張機能

拡張機能の`dependencies`にこのパッケージを追加し、
`package.json`で文法を登録します。
[`vsce`](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#using-.vscodeignore)
は、既定で本番用の依存パッケージをVSIXに含めるので、
`path`で`node_modules`内の文法を直接指定できます。

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
        "path": "./node_modules/@mmd-toolkit/textmate-grammar/lib/mermaid.tmLanguage.json"
      }
    ]
  }
}
```

`path`は、拡張機能のルートからの相対パスです。
`.vscodeignore`を使う場合は、この文法ファイルを除外しないでください。

文法ファイルだけを含めたい場合は、このパッケージを`devDependencies`に追加し、
パッケージの`lib/mermaid.tmLanguage.json`を、
拡張機能の`syntaxes/mermaid.tmLanguage.json`にコピーする方法もあります。
その場合、`path`は`"./syntaxes/mermaid.tmLanguage.json"`にします。

### ほかのTextMateのホスト

vscode-textmateとvscode-onigurumaのようなホストでは、
`mermaid.tmLanguage.json`を`source.mermaid`の文法として読み込み、
`source.yaml`のYAMLの文法もあわせて読み込みます。

## スコープ

テーマは、トークンのスコープで文法に色を付けます。
人が書く形では、仕様が定める単位に、
全図種でこの表から種類に応じたスコープを付けます。
それ以外は[制限](#制限)に書きました。
色は読むためのものです。
スタイルのプロパティ、データブロックのキーと値、
クラスのメンバーの型と名前のように、仕様が1つの単位と読むテキストでも、
読む人に構造が見えるものは、部分ごとに種類に応じたスコープを付けます。
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
| その他の区切り                 | `keyword.operator.delimiter.<what>.begin.mermaid`、`….end.mermaid`           | 赤       |
| リストや引数の括弧             | `keyword.operator.bracket.<what>.begin.mermaid`、`….end.mermaid`             | 赤       |
| 分離記号                       | `keyword.operator.separator.<name>.mermaid`                                  | 赤       |
| コメント                       | `comment.line.<mark>.mermaid`、`comment.block.mermaid`                       | 灰色     |
| どの規則も読まないテキスト     | `comment.block.ignored.mermaid`                                              | 灰色     |
| ディレクティブ                 | `meta.directive.mermaid`                                                     | 下記参照 |
| frontmatter                    | `meta.embedded.block.yaml`                                                   | YAML     |
| データブロック                 | `meta.data.mermaid`                                                          | 下記参照 |

構造を包む`meta.*`スコープ自体は色を持たず、
中の単位はそれぞれの種類のスコープを持ちます。

各種類に含むものは、次のとおりです。

- 要素の名前は、図が定義または参照する識別子です。
  ノードID、エッジID、エンティティ、属性名、状態、参加者やアクターのID、
  図の要素としてのクラス、メンバー名、
  タスクID（`:a1, 2014-01-01, 30d`や`after a1`の`a1`）、コミットID、ブランチ、
  規則名、スタイルのクラス名（`classDef`の名前、`:::name`、
  `class A name`）です。
  mindmapの裸のノードやflowchartのサブグラフの名前のように、
  仕様が1つのテキストをIDと表示テキストの両方として読む場合、
  そのテキストはラベルです。
  erの文書は、サブグラフの名前をエンティティ名として読み、
  任意のタイトルを別に持つので、そこでは名前です。
  stateの`[*]`は、開始または終了を表すキーワードで、名前ではありません。
- 関数の名前は、文が呼び出すコールバックです。
- ラベルやテキストは、図が表示または保持するテキストです。
  ノードやエッジのラベル、関係のラベル、メッセージ、ノート、タイトル、説明、
  アクセシビリティ値、タスクのテキスト、アイコンの名前です。
  引用符で囲まれていれば、引用符付き文字列のスコープを持ちます。
- 型は、属性やメンバーの型、戻り値の型、総称型の引数、型としてのクラス名、
  クラスの注釈やusecaseのステレオタイプのように`<<`と`>>`の中の自由な名前です。
  属性やメンバーの型は、`+String name`の`String`や、
  `+pay(float amount)`の`float`です。
- キーや修飾子は、メンバーや属性を修飾する語や記号です。
  `PK`、`FK`、`UK`、可視性、分類子です。
- プロパティ名は、スタイルのプロパティの名前か、キーと値の組のキーです。
  データブロックのキー、C4の名前付き属性のキー（`$key=`）、
  `[|`で書くflowchartの長方形のプロパティ（`[|borders:lt|text]`）です。
  このプロパティの値の`lt`は、テキストです。
- スタイルのプロパティは、スタイルの1つの`name:value`です。
  `fill:#43a047`の名前は`fill`、値は全体で1つの`#43a047`であり、
  その中に数値はありません。
  `bold`や`#fff`のように`:`のないスタイルは、スタイルの全体で1つの値です。
  `:red`のように名前が空のスタイルは、区切りと値です。
- 固定値は、仕様が値として列挙する語です。
  方向（`TD`、`LR`など）、向き、ganttのタグ（`done`、`crit`など）、
  `true`と`false`、データブロックの`null`です。
- sankeyの値は、`3000`や`0.597`のように欄の全体が符号のない整数か小数のときに、
  数値です。
  `-1`のようなそれ以外の値はテキストです。
- 図形の区切りは、ノードの形を選ぶ括弧です。
  flowchartやmindmapの円の`((`と`))`、kanbanの項目の`[`と`]`、
  六角形の`{{`と`}}`などです。
  ブロックの区切りは、文、メンバー、属性のブロックを開閉する括弧です。
  複合状態、ERエンティティ、クラス本体の`{`などです。
  `subgraph`と`end`のようにブロックを開閉するキーワードは、
  キーワードのままです。
- その他の区切り（`|`のようなラベルの区切り、ディレクティブの印、総称型の`~`）、
  リストや引数の括弧、分離記号（`:`、`,`、`;`、`:::`）は、
  図形とブロックの区切りと同じく演算子の色で、行の組み立てが見えるようにします。
  プロパティ名とその値の間の`:`は、
  `keyword.operator.separator.key-value.mermaid`です。
  文字列の引用符は`punctuation.definition.string.begin.mermaid`と`….end`で、
  文字列のスコープの中にあり、テーマは文字列の色で示します。
  コメントの印は、コメントの一部です。
- どの規則も読まないテキストは、仕様が何もないものとして読むテキストです。
  隠れたYAML、隠れたディレクティブ、無視されるテキストです。
- ディレクティブでは、名前は`entity.name.function.directive.mermaid`（紫）、
  引数は`string.unquoted.directive.mermaid`（濃い青）、
  名前の後の`:`は`keyword.operator.separator.colon.mermaid`、
  印は`keyword.operator.delimiter.directive.begin.mermaid`と`….end`です。
  ディレクティブが文字列、ラベル、無視されるテキストの中にあるときも同じです。
- データブロック（`@{ … }`）では、
  括弧は`keyword.operator.bracket.data.begin.mermaid`と`….end`です。
  キーは、引用符があってもなくてもプロパティ名で、`,`は分離記号です。
  値はその種類のスコープです。
  引用符付きの値は文字列、`60`、`-1`、`20.4`のような整数や小数は数値です。
  `true`、`false`、`null`は固定値です。
  `shape: rect`の`rect`、`1e3`、配列の中の数のようなそれ以外の値はテキストです。
  kanban、flowchart、agentflow、sequence、eventmodelingの文書と、
  usecaseの文書のJSONの値は、中身を1つのテキストと読みます。
  文法は、その中で読む人に見えるキーと値を色分けし、
  ブロックは図種の文書が定める`}`で終わります。
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
  1行に単独で立つキーワードは、その行だけでキーワードと決まるときに、
  キーワードとして色付けします。
  次の行で決まるときは、その語はまわりの規則で色付けされます。
  たとえばerの`direction`は、`LR`の前ではキーワード、`A`の前では名前です。
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
  閉じる区切りの直後と、図種によっては完結した単位の後です。
  pieの`showData`の後の`title`がその例です。
  `}%%`のないディレクティブ（treeviewの`%%{init: dark title t`のように、
  語の引数で終わるもの）の後の文は、認識しないことがあります。
- 仕様は単独の復帰（CR）を行の終わりとして読みますが、
  ShikiはテキストをLFとCRLFでだけ行に分けます。
  行の中に残った単独のCRは、この文法にとって行の終わりではありません。
  値はそれを越えて続くことがあり、その後の文は認識しないことがあります。
- 大文字小文字を区別せずに比べるキーワードは、
  `deſtroy`が`destroy`に一致するように、
  そのASCIIの文字に畳まれる少数の文字にも一致します。
  仕様は、
  これらをキーワードとして読みません（[表記](../spec/docs/common.ja.md#表記)）。
- 仕様は、HTML属性の引用符付きの値の`"`を`'`として読みます。
  この文法がそう読むのは、タグ全体を含む二重引用符の文字列やラベルの中だけです。
  同じ行の前の単位でタグが始まるとき、
  読み替えた引用符が一重引用符の文字列を終えたり始めたりするとき、
  引用符がディレクティブの中にあるときは、書かれたとおりに読みます。
- `style`と`classDef`の行の規則が無視する`;`は、
  まわりの規則が読むとおりに色付けします。
  `fill:#f96;stroke:#333`のようにスタイルのプロパティの間に置く`;`は、
  図種によって色付けが違います。
- classのメンバー、メソッドの名前、引数を型と名前に分けるのは、
  `Type name`と`name : Type`の形だけです。
  1語は名前で、`~`か`[]`を含むときは型です。
  `+a b c`のように語がもっと多いものや、`=`を含むものは、
  全体で1つの色のままです。
- ganttでタスクのIDとして色付けするのは、タグの次の項目で、
  その行にあと2つだけ項目が続くものです。
  項目が4つ以上のタスク、空の項目があるタスク、
  どれかの項目にディレクティブやエンティティがあるタスクでは、
  どの項目もIDとして色付けしません。
  `after`や`until`の項目でも、ディレクティブやエンティティを含むものは、
  テキストのままです。
- データブロックでは、行の先頭か`,`の後の`key: value`に見えるテキストを、
  キーと値として色付けし、`,`を分離記号として色付けします。
  複数行のブロックの`label: Hello, world`のような引用符のない値の中、
  長いYAMLの値の中、eventmodelingの`md`や`text`のタグのデータの中でも同じです。
  データの中に入れ子になった`{`、`}`、`[`、`]`は、テキストとして色付けします。
- ディレクティブに属する行区切りや段落区切りも、
  コメント行が始まりうる位置として読みます。
  文字列、ラベル、ブロックの中のコメント行は、コメントとして色付けします。
  値のスコープが1つ開いているときは、コメントは値の一部ではありませんが、
  そのスコープの中に入ります。
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
- 二重引用符の文字列の中で、HTMLタグの`<`の前のバックスラッシュは、
  エスケープではなくテキストとして色付けします。
  タグは書かれたとおりのテキストで読まれ、
  その引用符が文字列の終わりを決めるからです。

## 文書

- [仕様](../spec/README.ja.md): この文法が従う構文。
- [docs/development.ja.md](./docs/development.ja.md): 書き方、ビルド、テスト。
