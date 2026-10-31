# @mmd-toolkit/textmate-grammar

英語版: [README.md](./README.md)

[playground](../playground/README.ja.md)と
[ドキュメントサイト](../docs/README.ja.md)でMermaidのテキストに色を付ける
TextMate文法です。
このパッケージは非公開で、npmには公開しません。

## 何であるか

[仕様](../spec/docs/index.ja.md)の32図種の文法を、
仕様だけから書いた1つの文法です。
図種は`packages/spec/docs/diagrams/`の文書1つにつき1つです。
agentflow、architecture、block、c4、class、cynefin、er、eventmodeling、
flowchart、gantt、gitgraph、info、ishikawa、journey、kanban、mindmap、packet、
pie、quadrant、radar、railroad、requirement、sankey、sequence、state、
timeline、treemap、treeview、usecase、venn、wardley、xychartです。
各文書のDetection節が受理するヘッダーはすべて色付けします。
たとえばflowchartの4つ（`graph`、`flowchart`、`flowchart-elk`、
`swimlane-beta`）、 c4の5つ、railroadの4つです。

`grammar/common.grammar.json`は、すべての図種が共有する規則を持ちます。
frontmatter（本文はYAMLとして色付け）、ディレクティブ（`%%{ … }%%`）、
`%%`のコメント行、中のHTMLタグとエンティティを含む文字列、共通の`title`、
`accTitle`、`accDescr`の形です。
`grammar/diagrams/<図種>.grammar.json`は、1つの図種のブロックを持ちます。
ブロックはヘッダーで始まり、その図種のすべての単位に、
種類に応じたスコープを付けます（[スコープ](#スコープ)を参照）。
`index.js`は、これらのファイルをShikiの1つの文法にまとめます。
名前は`mermaid`、別名は`mmd`です。
ファイル名が`.grammar.json`で終わるのは、リポジトリのlintのJSONスキーマ検査が、
SchemaStoreからファイル名でスキーマを選ぶからです。
SchemaStoreには、
`block.json`と`info.json`という名前の別のファイルのスキーマがあります。

各規則は`comment`に、まず何を読むかと、必要なら規則の位置を書きます。
その後に、従う仕様の文を引用します。
引用は`<文書>.md#<節>: `に続けて、仕様の1つ以上の完全な文をそのまま書きます。
連続する空白は1つにまとめられますが、インラインコード、リンク、
強調はそのまま保ちます。
引用は次の出典かコメントの末尾まで続くので、
説明はすべて最初の引用より前に置きます。
`[fixture: …]`のようなfixtureの印は、引用に含めません。
すべての規則に当てはまる限界は、
`grammar/common.grammar.json`の`comment`に1回だけ書いています。
文法は行ごとに読み、受理を確かめず、
同じ行で別の単位の後に単位が始まる位置を追いません。
`style`と`classDef`の行の規則が無視する`;`は、
まわりの規則が読むとおりに色付けします。
仕様が`'`として読むHTML属性の引用符は、
タグ全体を含む二重引用符の文字列やラベルの中でだけ、そのように読みます。
属性の引用符がディレクティブの中にあるときも、そのようには読みません。
ディレクティブに属する行区切りも、コメントが始まりうる位置として読みます。
文字列やブロックの中のコメントは、そのスコープの中で色付けします。
規則の`comment`には、これを超えて省いたものだけを書いています。

正規表現のうち複数の規則が要る部分は、変数`{{name}}`として1回だけ書きます。
Sublime Textのsublime-syntaxファイルの変数に倣っています。
`grammar/common.grammar.json`は、
仕様のcommon.mdかdetection.mdが定める形を宣言します。
空白の集合（`{{ws}}`、`{{lws}}`、`{{separators}}`）、
ディレクティブ（`{{directive}}`）、
ディレクティブが立ってよい空白（`{{gap}}`）などです。
共有の規則の部分のうち、図種の規則やその共有の規則の変種も要るものも宣言します。
そのトップレベルの`comment`は、それぞれの出典の文を名指しします。
図種の文書が定める形は、ほかの図種が同じ綴りで書いていても、その図種に置きます。
規則の中にじかに書くか、図種名とダッシュで始まる名前の、
そのファイルの変数にします。
変数は別の変数を使えます。
`index.js`は変数を置き換えます。
未知の名前、循環、2回宣言された名前、
図種名で始まらない図種ファイルの名前があると、読み込みに失敗します。

キーワードを大文字小文字を区別せずに比べる箇所では、
仕様の[表記](../spec/docs/common.ja.md#表記)により、キーワードのASCIIの文字は、
そのASCIIの大文字と小文字にだけ一致します。
long sは`s`と一致せず、KELVIN SIGNは`k`と一致しません。
Onigurumaの大文字小文字の無視はこれらにも一致させるので、
規則はキーワードを`(?i:…)`のグループに書き、
`index.js`がすべてのパターンの先頭に`(?I)`を置きます。
`(?I)`は、大文字小文字の無視をASCIIに限るOnigurumaのオプションです。

パーサーのトークンではなくTextMate文法を選んだのは、
playgroundで編集中のテキストはパーサーにしばしば拒否され、
色が消えてしまうからです。
ShikiのMermaid文法は使いません。
32図種のうち15図種しか知らず、その一部は不完全です。
C4の規則は5つのヘッダーのうち4つしか知らず、
どれも5つのヘッダーが受け付ける呼び出しの一部しか持ちません。
`accTitle`と`accDescr`もありません。
そしてそれらを、仕様ではなく自分の読み方で色付けします。
全図種を仕様から書くことで、すべての色の出所が1つになります。

## スコープ

受理される入力で仕様が定めるすべての単位に、
全図種でこの表から種類に応じたスコープを付けます。
以下の色はgithub-lightの色です。
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
| スタイルのプロパティ名         | `support.type.property-name.mermaid`                                         | 青       |
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

各種類に含むものは、次のとおりです。

- 要素の名前は、図が定義または参照する識別子です。
  ノードID、エッジID、エンティティ、属性名、状態、参加者やアクターのID、
  図の要素としてのクラス、メンバー名、タスクID、コミットID、ブランチ、規則名、
  スタイルのクラス名（`classDef`の名前、`:::name`、`class A name`）です。
  mindmapの裸のノードのように、
  仕様が1つのテキストをIDと表示テキストの両方として読む場合、
  そのテキストはラベルです。
- 関数の名前は、文が呼び出すコールバックです。
- ラベルやテキストは、図が表示または保持するテキストです。
  ノードやエッジのラベル、関係のラベル、メッセージ、ノート、タイトル、説明、
  アクセシビリティ値、タスクのテキストです。
  引用符で囲まれていれば、引用符付き文字列のスコープを持ちます。
- 型は、属性やメンバーの型、戻り値の型、総称型の引数、型としてのクラス名です。
- キーや修飾子は、メンバーや属性を修飾する語や記号です。
  `PK`、`FK`、`UK`、可視性、分類子、ステレオタイプです。
- スタイルのプロパティは、スタイルの1つの`name:value`です。
  `fill:#43a047`の名前は`fill`、値は全体で1つの`#43a047`であり、
  その中に数値はありません。
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
- その他の区切り（引用符、flowchartのエッジラベルの`|`、
  コメントとディレクティブの印）、リストや引数の括弧、分離記号（`:`、`,`、`;`、
  `:::`）は文字色を保ちます。
- どの規則も読まないテキストは、仕様が何もないものとして読むテキストです。
  隠れたYAML、隠れたディレクティブ、無視されるテキストです。
- ディレクティブでは、名前は`entity.name.function.directive.mermaid`（紫）、
  引数は`string.unquoted.directive.mermaid`（濃い青）、
  印は`punctuation.definition.directive.begin.mermaid`と`….end`です。
- データブロック（`@{ … }`）では、
  括弧は`punctuation.section.data.begin.mermaid`と`….end`、
  キーはスタイルのプロパティ名、値はその種類のスコープです。
- テキスト中のHTMLタグとエンティティは、そのテキストのスコープを保ちます。

## 使い方

highlighterは、この文法が埋め込む文法とともに読み込みます。
frontmatterのための`yaml`です。

```js
import mermaid from "@mmd-toolkit/textmate-grammar"

const highlighter = await createHighlighterCore({
  langs: [mermaid, yaml],
  // themes, engine
})
```

VitePressでは、設定は`markdown.languages: [mermaid, "yaml"]`です。
`mermaid`を名前でも並べないでください。
後に並べたShikiの同名のバンドル済み言語が、この文法を置き換えます。

この文法には、ShikiのOnigurumaエンジン（`createOnigurumaEngine`）が要ります。
`createHighlighter`とVitePressが既定で使うエンジンも、これです。
ShikiのJavaScriptエンジンは、オプション`(?I)`を拒否します。

## テスト

`pnpm --filter @mmd-toolkit/textmate-grammar test`は、
固定入力をShikiでトークン化します。

- 図種ごとに、
  `tests/fixtures/`の入力が1つあります（railroadは4つの文法それぞれに1つ）。
  その図種のキーワードを名指しする仕様の文から書き、パーサーが受理します。
  その`.expected.json`は、ヘッダー、ブロックのすべてのキーワード規則、
  `accTitle`と`accDescr`のスコープと、
  スコープが付いてはならない境界の場合を名指しします。
  テストはそれを確かめ、全トークンを`.tokens`記録と比べます。
  行区切りのように、リポジトリがfixtureファイルに置かない文字が要る入力は、
  `.expected.json`の`escapedInputs`にエスケープで書き、
  記録なしで同じように確かめます。
- すべてのヘッダーの綴りについて、
  [detection.md](../spec/docs/detection.ja.md)の各項目の最小入力と、
  図種の文書が受理する残りの綴りのコーパスのfixtureを使い、
  ヘッダーがキーワードとして色付けされることを確かめます。
- 先頭トリビア（ヘッダーより前のfrontmatter、ディレクティブ、コメント行）と、
  共有の規則の境界の場合にも、固定入力があります。

文法を変えた後は、パッケージで`pnpm run test:update`を実行すると、
`.tokens`記録を書き直します。
残す前に、書き直した記録を読んでください。

## 変え方

規則は、出典の文とともに変えます。
規則とその`comment`を変え、文が名指しする場合をfixtureが持たなければ、
その図種のfixtureと `.expected.json`も変えます。
仕様に図種が加わったときは、`grammar/diagrams/<図種>.grammar.json`を足し、
`index.js`にそのimportと一覧の位置（detection.mdの順）を足し、 fixture、
`.expected.json`、`.tokens`記録を足します。
