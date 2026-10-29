# `ParseError` が指す位置

英語版: [error-positions.md](./error-positions.md)

仕様はエラーの位置を定めていません。
このパッケージは次のように決めます。
`ParseError` の `index` は、常に `range` の始まりです。

## 図の前

- どの検出器にも一致しない: `range` は、
  trivia でない最初の文字からその行の終わりまで。
  テキストが trivia だけのとき（空のテキスト、空白、コメント行など）は、
  テキストの終わりの空の範囲。
  空白 2 つなら `[2, 2]`。 [fixture: common/detect-boundary-swimlane]
  [fixture: common/empty] [fixture: common/comment-only]
  [fixture: common/whitespace-only]
- `---` 疑似図種、または pie、gitgraph、info、packet、architecture、radar、
  treemap、railroad、wardley、cynefin、
  eventmodeling 以外の対応図種の前で保持した非先頭ブロック: `range` は、
  ブロックの先頭の `-` 3 文字。
  [fixture: common/frontmatter-adjacent-delimiters]
  [fixture: common/frontmatter-nonleading-class]
  [fixture: common/frontmatter-nonleading-sequence]
  [fixture: common/frontmatter-nonleading-state]
  [fixture: common/frontmatter-after-bare-percent-flowchart]
- pie、gitgraph、info、packet、architecture、radar、 treemap、railroad、
  wardley、cynefin、eventmodeling 以外で、
  [図種の検出](../../spec/docs/common.ja.md#図種の検出) の、
  ヘッダーの前のもう一度の読みで見つかるディレクティブ: `range` は、
  その開きの `%%{`。
  最初の `%` から `{` までで、
  間にあるソースのディレクティブとコメント領域を含む。
  複数あるときは最初のもの。
  [fixture: flowchart/detect-directive-across-directive]
  [fixture: sequence/detect-directive-across-directive]
  [fixture: sequence/detect-directive-across-comment-line-closed]
  [fixture: class/detect-directive-across-directive]
  [fixture: state/detect-directive-across-directive]
  [fixture: block/detect-directive-second-scan-preheader]
  [fixture: venn/detect-directive-second-scan-preheader]
  [fixture: ishikawa/detect-directive-second-scan-preheader]
  [fixture: agentflow/detect-directive-second-scan-preheader]
  [fixture: usecase/detect-directive-second-scan-preheader]

## flowchart の中

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  基本多言語面の外の文字では、その 2 つのコード単位。
  [fixture: flowchart/lex-non-bmp-character-unexpected]
  [fixture: flowchart/gram-edge-id-space-before-at]
- 終わってはならない文脈の中でテキストが終わるときは、
  `range` はその文脈に入った形で、メッセージは何が閉じていないかを示す。
  click の文脈が何も読んでいないときは、
  その `click` （`click has no click id before the end of the text`）、
  コールバック名の文脈では、
  そこに入った `call`
  （`The callback after call has no ( before the end of the text`）、
  引数の文脈では、
  引数を開く `(`
  （`The arguments of the callback have no ) before the end of the text`）。
  [fixture: flowchart/lex-click-at-end-of-text]
  [fixture: flowchart/lex-callback-no-parenthesis]
  [fixture: flowchart/lex-callback-arguments-end-of-text]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  空白だけの単位では、その単位の始まりの空の範囲。
  テキストの終わりでは、テキストの終わりの空の範囲で、
  メッセージは `Unexpected end of text`。
  `style A fill:red,` の後のように、
  テキストを終える空白の単位で文法が止まるときも、同じ。
  それ以外では、メッセージは `Unexpected token`。
  [fixture: flowchart/gram-circle-gap]
  [fixture: flowchart/gram-empty-description-block-after-class-statement]
  [fixture: flowchart/db-style-trailing-comma]
- 存在しないリンクを指す `linkStyle` の番号では、 `range` はその番号。
  [fixture: flowchart/gram-linkstyle-before-link]
- メンバー `hasOwnProperty` の後にほかのメンバーが続く subgraph では、
  `range` はそのほかのメンバー、つまり `hasOwnProperty` の後の最初のメンバー。
  メンバーは、頂点の id、入れ子の subgraph の名前、アクセシビリティの文の値、
  空の文の `;` のどれかです。
  [fixture: flowchart/gram-subgraph-member-has-own-property-then-member]
  [fixture: flowchart/gram-subgraph-member-has-own-property-nested]
  [fixture: flowchart/gram-subgraph-member-has-own-property-acc-title]
  [fixture: flowchart/gram-subgraph-member-has-own-property-empty-statement]

## シーケンス図の中

- 字句解析器のどの規則も一致しない位置では、 `range` はその 1 文字。
  [fixture: sequence/lex-id-context-line-break]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  [fixture: sequence/gram-box-create-participant]
  [fixture: sequence/lex-keyword-before-dash]
- 文法の外の拒否（mermaid.js が Db を作るときに行うもの）では、
  `range` は拒否の原因で、メッセージは理由を示す。
  - 活性化していない参加者の非活性化。
    メッセージは `A participant that is not active cannot be deactivated`。
    `deactivate` の後の id、または `-` の付いたメッセージの矢印の前の id。
    [fixture: sequence/gram-deactivate-inactive]
    [fixture: sequence/gram-deactivate-after-message]
  - すでにある参加者の作成。
    メッセージは `A participant that exists already cannot be created`。
    `create` とそのキーワードの後の id。
    [fixture: sequence/gram-create-after-message]
  - create の後で、作った参加者へ行かないメッセージと、 destroy の後で、
    消した参加者から来ず、そこへも行かないメッセージ。
    メッセージはそれぞれ
    `The message after create must go to the created participant` と
    `The message after destroy must come from or go to the destroyed participant`。
    そのメッセージ。 [fixture: sequence/gram-create-message-from-created]
    [fixture: sequence/gram-create-then-destroy-message-to-other]
  - ほかの箱をすでに持つ参加者の、
    箱の中の参加者の文（`A participant cannot be in two boxes`）。
    その文の id。 [fixture: sequence/gram-box-participant-in-two-boxes]

## クラス図の中

- 図のテキストの最初の単位がヘッダーのキーワードでないとき（`classDiagramX`
  など）は、 `range` はその単位で、
  メッセージは `A class diagram starts with classDiagram or classDiagram-v2`。
  字句解析器は、その単位を読んだところで報告する。
  その後のテキストが、終わってはいけない文脈で終わるときも同じである。
  [fixture: class/div-headerless-repeated-header]
  [fixture: class/div-headerless-empty-title]
- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  閉じていない文字列の `"` もそうである。 [fixture: class/lex-string-unclosed]
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - メンバーの本体の `{`。
    メッセージは `The member body has no } before the end of the text`。
    [fixture: class/lex-member-body-unclosed]
  - 名前空間の本体の `{`。
    メッセージは `The namespace body has no } before the end of the text`。
    [fixture: class/lex-namespace-body-unclosed]
  - ジェネリクスの型の最初の `~`。
    メッセージは
    `The generic type has no closing ~ before the end of the text`。
    [fixture: class/lex-generic-unclosed]
  - コールバックの `call` と `(`。
    flowchart と同じ。 [fixture: class/lex-call-at-end]
    [fixture: class/lex-callback-arguments-unclosed]
  - `accTitle`。
    メッセージは `accTitle has no text before the end of the text`。
    [fixture: class/lex-acc-title-at-end]
  - `accDescr`。
    メッセージは `accDescr has no text before the end of the text`。
    [fixture: class/lex-acc-descr-at-end]
  - 説明のブロックの `accDescr`。
    メッセージは `The description block has no } before the end of the text`。
    [fixture: class/lex-acc-descr-block-unclosed]
- 分けられないメソッドの行では、
  `range` はメンバーのテキスト（両端の空白を除いた行）で、
  メッセージは `A method line needs a ( that is not its first character`
  `and that a ) follows`。 [fixture: class/lex-member-method-parenthesis-first]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  [fixture: class/gram-class-annotation-then-css-class]
  [fixture: class/header-only]
- 文法の外の拒否である、ないクラスへの注釈の文では、
  `range` は注釈の後のクラスの名前で、
  メッセージは `An annotation statement needs a class that exists`。
  [fixture: class/gram-annotation-after-name-statement]

## 状態図の中

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  その後に空白しかなく、そこでテキストが終わるときは、
  下のテキストの終わりの規則に従う。
  [fixture: state/lex-composite-ignored-percent-rejected]
  [fixture: state/gram-scale-without-width]
- `state` と `{` の間に語が 2 つあるときは、 `range` は最初の語から `{` までで、
  メッセージは `A state name before { must be a single word`。
  [fixture: state/lex-state-two-names-body]
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - 複合状態の本体の `{`。
    メッセージは `The composite state has no } before the end of the text`。
    [fixture: state/lex-composite-unclosed]
  - `state` の後の文字列を開く `"`。
    メッセージは `The string has no closing " before the end of the text`。
    [fixture: state/lex-alias-string-unclosed]
  - 浮いた note の、`note` の後の最初の `"`。
    メッセージは `The floating note has no as before the end of the text`。
    [fixture: state/lex-floating-note-string-unclosed]
  - 位置、状態、テキストのどれかがない note のキーワード `note`。
    メッセージは `The note has no text before the end of the text`、
    `The note has no state before the end of the text`、
    `The note has no end note before the end of the text`。
    最後のものは、 `end note` の行が後に続かない複数行の note にも使う。
    [fixture: state/lex-note-without-position-at-end]
    [fixture: state/lex-note-no-state-at-end]
    [fixture: state/lex-end-note-two-spaces]
    [fixture: state/lex-note-unclosed-at-end]
  - `scale`。
    メッセージは `scale has no width before the end of the text`。
    [fixture: state/lex-scale-at-end]
  - 後に何もない `classDef`、`class`、`style`。
    メッセージは `classDef has no class name before the end of the text`、
    `class has no state before the end of the text`、
    `style has no state before the end of the text`。
    [fixture: state/lex-class-def-no-name-at-end]
    [fixture: state/lex-class-statement-no-state-at-end]
    [fixture: state/lex-style-statement-no-state-at-end]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  [fixture: state/gram-click-trailing-word]
  [fixture: state/gram-click-href-at-end]
- 文法の外の拒否である、説明を 2 つ以上持つ複合状態では、
  `range` はその状態に最初に本体を与えた文で、
  メッセージは `A composite state can have only one description`。
  区切られた本体の領域では、それを閉じる divider の文である。
  [fixture: state/gram-composite-terminal-two-descriptions]
  [fixture: state/gram-region-two-descriptions]

## ER 図の中

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  これが起きるのは style の文脈だけで、
  `classDef` の文の `font-size:1.5em` の `.` がその例。
  [fixture: er/lex-classdef-dot]
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - 属性ブロックの `{`。
    メッセージは `The attribute block has no } before the end of the text`。
    [fixture: er/lex-block-unclosed] [fixture: er/lex-block-unclosed-empty]
  - テキストの終わりの空白が、最後の文字の後の行送りを取った、
    `classDef` と `style`。
    メッセージは `The classDef or style statement has no line feed`
    `before the end of the text`。
    [fixture: er/lex-classdef-trailing-space-at-end]
    [fixture: er/lex-style-trailing-tab-at-end]
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と、
    `accDescr has no text before the end of the text`。
    [fixture: er/lex-acc-title-at-end] [fixture: er/lex-acc-descr-at-end]
  - 説明ブロックの `accDescr`。
    メッセージは `The description block has no } before the end of the text`。
    [fixture: er/lex-acc-descr-block-unclosed]
  - テキストがその中で終わるバッククォートの語では、
    `range` はその開きのバッククォートで、
    メッセージは
    ``The backquoted word has no closing ` before the end of the text``。
    [fixture: er/lex-backquote-unclosed]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  [fixture: er/lex-hash-after-name] [fixture: er/gram-subgraph-unclosed]

## Gantt チャートの中

- どの文脈でも、どの文字もいずれかの規則で単位を始めるので、
  字句解析器が入力を拒否するのはテキストの終わりだけ。
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - `click`。
    メッセージは `click has no click id before the end of the text`。
    [fixture: gantt/lex-click-whitespace-at-end]
  - リンクの文字列の開きの `"`。
    メッセージは `The string has no closing " before the end of the text`。
    [fixture: gantt/lex-href-unclosed] [fixture: gantt/lex-href-unclosed-lines]
  - flowchart と同じく、コールバックの `call` と `(`。
    [fixture: gantt/lex-callback-name-at-end]
    [fixture: gantt/lex-callback-arguments-unclosed]
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と、
    `accDescr has no text before the end of the text`。
    [fixture: gantt/lex-acc-title-at-end] [fixture: gantt/lex-acc-descr-at-end]
  - 説明ブロックの `accDescr`。
    メッセージは `The description block has no } before the end of the text`。
    [fixture: gantt/lex-acc-descr-block-unclosed]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  日付で始まる行は、その日付で報告する。
  データのないタスクのテキスト `a` がテキストの終わりにあれば、
  終わりで報告する。 [fixture: gantt/lex-date-line]
  [fixture: gantt/lex-task-text-only] [fixture: gantt/lex-click-id-at-end]
- 文法の外の 2 つの拒否は、文法がその文を読んだところで行う。
  `range` は、`topAxis` のキーワードで、
  メッセージは `A topAxis statement cannot be written in a Gantt chart`。
  データがタグだけのタスクでは、最初から最後までのタグで、
  メッセージは `The data of a task needs an item after its tags`。
  [fixture: gantt/db-top-axis-statement] [fixture: gantt/lex-topaxis-then-title]
  [fixture: gantt/gram-task-tags-only] [fixture: gantt/gram-task-tags-only-two]

## Journey 図の中

- どの文脈でも、どの文字もいずれかの規則で単位を始めるので、
  字句解析器が入力を拒否するのはテキストの終わりだけ。
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と、
    `accDescr has no text before the end of the text`。
    [fixture: journey/lex-acc-title-at-end]
    [fixture: journey/lex-acc-title-space-at-end]
    [fixture: journey/lex-acc-title-line-feed-at-end]
    [fixture: journey/lex-acc-descr-at-end]
  - 説明ブロックの `accDescr`。
    メッセージは `The description block has no } before the end of the text`。
    [fixture: journey/lex-acc-descr-block-unclosed]
    [fixture: journey/lex-acc-descr-block-unclosed-empty]
    [fixture: journey/lex-acc-descr-block-unclosed-lines]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  `newline` 単位では、その始まりの空の範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  データのないタスクのテキスト `a` の後に改行があれば、その改行で報告する。
  後に何もない行末のコロンと `;` は、それ自身で報告する。
  `journey2` はタスクのテキストで報告する。
  タスクのテキスト `title` がテキストの終わりにあれば、終わりで報告する。
  [fixture: journey/lex-task-text-only] [fixture: journey/lex-task-colon-at-end]
  [fixture: journey/lex-semicolon-line] [fixture: journey/header-digit-suffix]
  [fixture: journey/lex-title-at-end]

## Requirement 図の中

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  文の文脈で単位が始まる位置の `;` や `<`、キーワードの後の ASCII の外の文字、
  style の文脈のタブや `.` がその例。 [fixture: requirement/lex-semicolon-line]
  [fixture: requirement/lex-less-than-alone]
  [fixture: requirement/lex-keyword-then-e-acute]
  [fixture: requirement/lex-style-tab] [fixture: requirement/lex-style-dot]
- テキストがその中で終わる文字列では、`range` はその開きの引用符で、
  メッセージは `The string has no closing " before the end of the text`。
  [fixture: requirement/lex-string-unclosed]
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と、
    `accDescr has no text before the end of the text`。
    [fixture: requirement/lex-acc-title-at-end]
    [fixture: requirement/lex-acc-title-line-feed-at-end]
    [fixture: requirement/lex-acc-descr-at-end]
  - 説明ブロックの `accDescr`。
    メッセージは `The description block has no } before the end of the text`。
    [fixture: requirement/lex-acc-descr-block-unclosed]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  `newline` 単位では、その始まりの空の範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  `title` の行は、`title` からテキストの終わりまでの `title` 単位で報告する。
  スタイルの中の `%` は、それ自身で報告する。
  値のない欄は、その `:` の後の改行で報告する。
  並びが 1 つだけの `class` の文がテキストの終わりにあれば、終わりで報告する。
  [fixture: requirement/lex-title-statement]
  [fixture: requirement/lex-style-percent]
  [fixture: requirement/gram-requirement-value-empty]
  [fixture: requirement/lex-class-one-list]

## Mindmap の中

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  ノードのテキストの後の単独の `{` や `}`、
  形の中の `}}` を始めない `}` がその例。
  [fixture: mindmap/lex-node-text-open-brace]
  [fixture: mindmap/lex-node-text-close-brace]
  [fixture: mindmap/gram-shape-text-close-brace]
- テキストがその中で終わる文字列では、`range` はその開きの引用符で、
  メッセージは `The string has no closing " before the end of the text`。
  markdown 文字列では、その開きの引用符で、
  メッセージは
  ``The markdown string has no closing `" before the end of the text``。
  最初の `` ` `` や `"` が `` `" `` にならずに終わらせる markdown 文字列も、
  その開きの引用符で報告し、
  メッセージは ``The markdown string is not closed by `" at its first ` or "``。
  [fixture: mindmap/lex-string-unclosed]
  [fixture: mindmap/lex-markdown-string-unclosed]
  [fixture: mindmap/lex-markdown-string-quote]
  [fixture: mindmap/lex-markdown-string-then-text]
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  形の opener（`The shape has no closer before the end of the text`）と、
  `::icon(`（`The icon has no ) before the end of the text`）。
  [fixture: mindmap/lex-shape-unclosed] [fixture: mindmap/lex-icon-unclosed]
- ヘッダーでテキストが終わるときは、`range` はヘッダーで、
  メッセージは `The header cannot end the text`。
  [fixture: mindmap/db-header-without-line-feed]
  [fixture: mindmap/header-directive-at-end]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  `r[]` は `]` で、 `r[text] tail` は `tail` で報告する。
  [fixture: mindmap/db-shape-empty-description]
  [fixture: mindmap/db-shape-text-after-end]
- 文法の外の 2 つの拒否は、文法がその行を読むところで行う。
  `range` は、根と同じかより浅く字下げしたノードで、
  メッセージは `A node cannot be as indented as the root or less`。
  最初のノードより前の icon や class の行では、その行で、
  メッセージは `An icon or a class line needs a node before it`。
  [fixture: mindmap/db-indent-same-as-root]
  [fixture: mindmap/db-icon-before-node] [fixture: mindmap/db-class-before-node]

## Timeline の中

- どの文脈でも、どの文字もいずれかの規則で単位を始めるので、
  字句解析器が入力を拒否するのはテキストの終わりだけ。
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と、
    `accDescr has no text before the end of the text`。
    [fixture: timeline/gram-acc-title-empty]
    [fixture: timeline/gram-acc-descr-empty]
  - 説明ブロックの `accDescr`。
    メッセージは `The description block has no } before the end of the text`。
    [fixture: timeline/gram-acc-descr-block-unclosed]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  そこに来る単位は、event を始めない `:` と、2 つ目のヘッダーの 2 つだけ。
  ほかの単位は、字句解析器が文法の取る組で読み、
  文の中で終わるテキストは字句解析器が拒否するからである。
  [fixture: timeline/gram-event-colon-glued-to-event]
  [fixture: timeline/gram-event-empty-after-colon]
  [fixture: timeline/gram-header-as-later-line]
- 文法の外の拒否は、文法がその文を読むところで行う。
  `range` は、最初の period より前の event の文で、
  最初のコロンから最後の event まで。
  メッセージは `An event needs a period before it`。
  [fixture: timeline/gram-event-first]
  [fixture: timeline/gram-event-after-title]

## Sankey の中

- 字句解析器のどの規則も合わない位置では、`range` はそこの文字。
  欄の中でも文字列の中でも、タブ、ASCII の外の文字、
  基本多言語面の外の文字の 2 つのコード単位、
  完全な実体を始める `#` がそうである。 [fixture: sankey/gram-tab-in-field]
  [fixture: sankey/gram-quoted-non-ascii] [fixture: sankey/gram-emoji]
  [fixture: sankey/gram-entity-in-quoted-field]
- 文字列の中でテキストが終わるときは、`range` はその開きの `"` で、
  メッセージは `The string has no closing " before the end of the text`。
  [fixture: sankey/gram-quoted-unclosed]
  [fixture: sankey/gram-quoted-unclosed-at-end-of-text]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲で、
  すべて空白の単位では、その始まりの空の範囲。
  メッセージは `Unexpected token`。
  レコードや欄の前でテキストが終わるときは、テキストの終わりの空の範囲で、
  メッセージは `Unexpected end of text`。
  `sankeyx` のような、ヘッダーの前の欄も、そうした単位である。
  [fixture: sankey/gram-four-columns]
  [fixture: sankey/gram-whitespace-line-between]
  [fixture: sankey/header-word-suffix] [fixture: sankey/gram-two-columns]
  [fixture: sankey/header-only]
- 間に何もない 2 つの引用符は単位を読まないので、 `range` はその後の単位か、
  テキストの終わり。
  `"",c,1` は `,` で拒否される。 [fixture: sankey/gram-quoted-empty]
  [fixture: sankey/gram-quoted-empty-value]

## XY チャートの中

- 字句解析器のどの規則も合わない位置では、`range` はそこの文字。
  引用符のないテキストが持たない文字、たとえば `<`、ヘッダーの後の `{`、
  ASCII の外の文字と、
  文字列とアクセシビリティのテキストの外で完全な実体を始める `#` がそうである。
  [fixture: xychart/gram-title-bare-angle]
  [fixture: xychart/gram-header-brace-suffix]
  [fixture: xychart/gram-grid-nonascii-category-bare]
  [fixture: xychart/gram-grid-entity-category-bare]
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - 文字列の開きの `"`。
    メッセージは `The string has no closing " before the end of the text`。
  - カテゴリの `[`。
    メッセージは `The categories have no ] before the end of the text`。
  - 値の `[`。
    メッセージは `The values have no ] before the end of the text`。
    [fixture: xychart/gram-title-quoted-unclosed-at-end]
    [fixture: xychart/gram-x-axis-band-unclosed]
    [fixture: xychart/gram-plot-values-unclosed]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲で、
  すべて空白の単位では、その始まりの空の範囲。
  メッセージは `Unexpected token`。
  文が揃う前にテキストが終わるときは、テキストの終わりの空の範囲で、
  メッセージは `Unexpected end of text`。
  [fixture: xychart/gram-plot-values-extra-text]
  [fixture: xychart/gram-header-after-statement]
  [fixture: xychart/gram-x-axis-empty]
  [fixture: xychart/gram-title-keyword-alone-at-end]
- 文法がテキストの全体として取らない空の文字列は、
  下の既知の差異と同じくその位置で拒否する。
  `title ""` のように mermaid.js も拒否する入力でも同じである。
  [fixture: xychart/gram-title-empty-string]
  [fixture: xychart/div-empty-string-line]

## 四象限チャートの中

- 字句解析器のどの規則も合わない位置では、`range` はそこの文字。
  括弧、`|`、 markdown 文字列の中の `"` がそうである。
  [fixture: quadrant/gram-quadrant-parens] [fixture: quadrant/gram-point-parens]
  [fixture: quadrant/gram-quadrant-pipe]
  [fixture: quadrant/gram-markdown-string-quote-inside]
- 終わってはいけない文脈でテキストが終わるときは、
  最後の文字の後に空白しかないときも含めて、 `range` はその文脈に入ったもので、
  メッセージは何が閉じていないかを示す。
  - 文字列の開きの `"`。
    メッセージは `The string has no closing " before the end of the text`。
  - markdown 文字列の開きの `"`。
    メッセージは
    ``The markdown string has no closing `" before the end of the text``。
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と
    `accDescr has no text before the end of the text`。
  - 説明ブロックの `accDescr`。
    メッセージは `The description block has no } before the end of the text`。
  - クラス名の `:::`。
    メッセージは `::: has no class name before the end of the text`。
  - 点の `[`。
    メッセージは `The point has no ] before the end of the text`。
    [fixture: quadrant/gram-unclosed-axis-quote-at-end]
    [fixture: quadrant/gram-unclosed-markdown-at-end]
    [fixture: quadrant/gram-unclosed-acc-title-at-end]
    [fixture: quadrant/gram-unclosed-acc-descr-at-end]
    [fixture: quadrant/gram-unclosed-acc-block-after-text]
    [fixture: quadrant/gram-unclosed-class-marker-at-end]
    [fixture: quadrant/gram-unclosed-point-after-comma-at-end]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲で、
  すべて空白の単位、つまり `space` 単位や `newline` 単位では、
  その始まりの空の範囲。
  メッセージは `Unexpected token`。
  文が揃う前にテキストが終わるときは、テキストの終わりの空の範囲で、
  メッセージは `Unexpected end of text`。 [fixture: quadrant/header-twice]
  [fixture: quadrant/gram-name-only]
  [fixture: quadrant/gram-grid-tab-class-name]
  [fixture: quadrant/gram-unclosed-class-name-at-end]
- 文法の外の拒否は、文法が点やクラスのスタイルを読み終えたところで行う。
  `range` は、mermaid.js が取らない最初のスタイルで、
  メッセージは `A style must be radius, color, stroke-color, or stroke-width`
  `with a value of its form`。 [fixture: quadrant/gram-style-radius-word]
  [fixture: quadrant/gram-style-upper-case-key]
- 空の文字列と空の markdown 文字列は、下の既知の差異と同じくその位置で拒否する。
  `"": [0.3, 0.6]` のように mermaid.js も拒否する入力でも同じである。
  [fixture: quadrant/gram-name-quoted-empty]
  [fixture: quadrant/div-empty-string-alone]

## ブロック図の中

- 字句解析器のどの規則も合わない位置では、`range` はそこの文字。
  引用符のないラベル、id の中の `-`、形の括弧の中の空白、
  未知の方向がそうである。 [fixture: block/gram-label-unquoted]
  [fixture: block/gram-name-dash] [fixture: block/gram-spec-space-before-string]
  [fixture: block/gram-arrow-unknown]
- 終わってはいけない文脈でテキストが終わるときは、
  最後の文字の後に空白しかないときも含めて、 `range` はその文脈に入ったもので、
  メッセージは何が閉じていないかを示す。
  - 文字列の開きの `"`。
    メッセージは `The string has no closing " before the end of the text`。
  - markdown 文字列の開きの `"`。
    メッセージは
    ``The markdown string has no closing `" before the end of the text``。
  - 形の開き。
    メッセージは `The shape has no closing before the end of the text`。
  - ブロック矢印の `]>`。
    メッセージは
    `The block arrow has no directions before the end of the text`。
  - 方向の前の `(`。
    メッセージは `The directions have no ) before the end of the text`。
  - 開きの矢印。
    メッセージは `The edge label has no arrow before the end of the text`。
  - 説明ブロックの `accDescr`。
    メッセージは `The description block has no } before the end of the text`。
  - `classDef`。
    メッセージは `classDef has no styles before the end of the text`。
  - `class` と `style`。
    メッセージは `class has no ids before the end of the text` と、
    `style has no ids before the end of the text`。
    [fixture: block/gram-label-unclosed]
    [fixture: block/gram-label-backtick-start]
    [fixture: block/gram-label-unclosed-shape]
    [fixture: block/gram-arrow-no-paren]
    [fixture: block/gram-arrow-unclosed-paren]
    [fixture: block/gram-edge-label-start-without-end]
    [fixture: block/gram-empty-block-unclosed]
    [fixture: block/gram-class-def-no-name]
    [fixture: block/gram-class-def-no-style]
    [fixture: block/gram-class-apply-no-id]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲で、
  メッセージは `Unexpected token`。
  文や入れ子のブロックが揃う前にテキストが終わるときは、
  テキストの終わりの空の範囲で、メッセージは `Unexpected end of text`。
  `classDef` の名前 `DEFAULT` も、そのような単位である。
  [fixture: block/header-only-block-beta]
  [fixture: block/gram-composite-not-closed]
  [fixture: block/gram-composite-extra-end] [fixture: block/gram-edge-to-space]
  [fixture: block/gram-class-def-default-upper]
- 文法の外の拒否は、文法が `style` の文の id を読んだところで行う。
  `range` は `,` を含めたその id で、
  メッセージは `style names no block made before it`。
  [fixture: block/gram-style-undefined] [fixture: block/gram-style-list]
  [fixture: block/gram-style-on-chain]
- 空の文字列と空の markdown 文字列、文の中の空の説明ブロックは、
  下の既知の差異と同じくその位置で拒否する。
  `A[""]` のように mermaid.js も拒否する入力でも同じである。
  [fixture: block/gram-label-empty] [fixture: block/div-empty-string-line]
  [fixture: block/div-empty-markdown-line]
  [fixture: block/div-empty-block-in-edge]

## kanban 図の中

- 字句解析のどの規則も合わないところでは、`range` はその文字で、
  メッセージは `Unexpected character` です。
  単独の `@`、形の外の波括弧、ラベルの中の単独の `}`、
  引用符で囲まれないデータのキャレットが該当します。
  [fixture: kanban/gram-node-at] [fixture: kanban/gram-grid-open-brace-item-id]
  [fixture: kanban/gram-shape-single-brace-middle]
  [fixture: kanban/gram-metadata-caret]
- 閉じない文字列と markdown 文字列は、開始の引用符で報告します。
  メッセージは `The string has no closing " before the end of the text` と、
  ``The markdown string has no closing `" before the end of the text`` です。
  閉じる組でない引用符やバッククォートで終わる markdown 文字列も、
  開始の引用符で報告します。
  メッセージは ``The markdown string is not closed by `" at its first ` or "``
  です。 [fixture: kanban/gram-unclosed-quote]
  [fixture: kanban/gram-unclosed-markdown] [fixture: kanban/gram-markdown-quote]
  [fixture: kanban/gram-markdown-extra-backtick]
- ほかの閉じない文脈では、その文脈に入れたものを報告します。
  形の開始（`The shape has no closer before the end of the text`）、
  `::icon(`（`The icon has no ) before the end of the text`）、
  `@{`（`The data block has no } before the end of the text`）、
  引用符付きデータの開始の引用符です。
  最後のメッセージは
  `The data string has no closing " before the end of the text` です。
  [fixture: kanban/gram-unclosed-shape] [fixture: kanban/gram-unclosed-icon]
  [fixture: kanban/gram-metadata-unclosed]
  [fixture: kanban/gram-metadata-unclosed-quote]
- テキストを終えるヘッダーは、キーワードで報告します。
  メッセージは `The header cannot end the text` です。
  [fixture: kanban/header-only] [fixture: kanban/header-header-directive-only]
- 文法が単位を読めないところでは、そのトークンの範囲を報告します。
  メッセージは `Unexpected token` です。
  空白だけの単位なら、開始の空の範囲です。
  テキストの終わりなら、そこでの空の範囲で、
  メッセージは `Unexpected end of text` です。
  [fixture: kanban/gram-empty-label] [fixture: kanban/gram-string-plus-space]
  [fixture: kanban/gram-two-shapes-on-line]
  [fixture: kanban/gram-metadata-adjacent-space]
- 文法外の 2 つの拒否では、最初より浅いノードの次に来たノードを、
  データ接尾辞まで報告します。
  メッセージは `A node cannot follow a node less indented than the first` です。
  最初のノードの前の装飾は全体を報告し、
  メッセージは `An icon or a class line needs a node before it` です。
  [fixture: kanban/gram-indent-shallower-followed]
  [fixture: kanban/gram-decoration-before-node]
  [fixture: kanban/gram-decoration-class-before-node]
- 空の文字列、markdown 文字列、icon、class の行は、認識するどこでも、
  その形全体を、後述する共通の空の形のメッセージで報告します。
  [fixture: kanban/gram-empty-quoted-label]
  [fixture: kanban/gram-empty-markdown-shape]
  [fixture: kanban/div-empty-icon-after-shape]
  [fixture: kanban/div-empty-class-after-shape]

## C4 図の中

- 字句規則が一致しない位置は、その文字の範囲で、
  メッセージは `Unexpected character` です。
  先頭の文脈の未知の語、呼び出しのキーワードと `(` の間の空白、
  引用符のない名前付きの値が該当します。
  [fixture: c4/lex-keyword-gap-person-space] [fixture: c4/gram-named-bare-value]
  [fixture: c4/lex-after-person-word]
- 終わっていない文脈は、空白だけが残る場合も、その文脈に入った要素の範囲です。
  メッセージは下表のとおり、不足する部分を示します。
  [fixture: c4/lex-keyword-eof] [fixture: c4/lex-unclosed-parenthesis]
  [fixture: c4/lex-unclosed-quote] [fixture: c4/lex-unclosed-named]
  [fixture: c4/lex-named-open-eof] [fixture: c4/gram-unclosed-acctitle]
  [fixture: c4/gram-unclosed-accdescr]
  [fixture: c4/gram-acc-descr-block-unclosed]

| 文脈                                 | 範囲                   | メッセージ                                                        |
| ------------------------------------ | ---------------------- | ----------------------------------------------------------------- |
| 呼び出しのキーワード                 | キーワード             | `The call keyword has no ( before the end of the text`            |
| 引数                                 | 開きの `(` または `(,` | `The arguments have no ) before the end of the text`              |
| 引用された引数または名前付きの文字列 | 開きの引用符           | `The string has no closing " before the end of the text`          |
| 名前付きのキー                       | `$`                    | `The named attribute has no = before the end of the text`         |
| 名前付きの値の開き                   | `$`                    | `The named attribute has no opening " before the end of the text` |
| コロンのタイトル                     | `accTitle`             | `accTitle has no text before the end of the text`                 |
| コロンの説明                         | `accDescr`             | `accDescr has no text before the end of the text`                 |
| 説明ブロック                         | `accDescr`             | `The description block has no } before the end of the text`       |

- 文法が読めない単位は、そのトークンの範囲です。
  空白だけの単位は、その先頭の空範囲です。
  メッセージは `Unexpected token` です。
  必須の文や境界の閉じ波括弧より前でテキストが終わるときは、末尾の空範囲で、
  メッセージは `Unexpected end of text` です。
  空の名前付きの値は、閉じ引用符の位置です。
  [fixture: c4/gram-arguments-person-none] [fixture: c4/gram-named-empty-value]
  [fixture: c4/header-context-only] [fixture: c4/gram-boundary-unclosed]
  [fixture: c4/gram-unmatched-right-brace-after-person]
- 方向の先読みは、先頭の文脈の単位を読む前に拒否します。
  範囲は一致した `direction` から方向値までで、
  メッセージは `A direction line is not allowed in C4` です。
  [fixture: c4/gram-direction-tb] [fixture: c4/gram-header-direction-tb]
  [fixture: c4/gram-direction-value-next-line]
- 消費する名前付きの `__proto__` 属性は、外側の空白と `$`、
  `=` を除いたキーの範囲です。
  メッセージは `A consumed named attribute cannot have the key __proto__` です。
  [fixture: c4/gram-named-proto]
  [fixture: c4/gram-named-proto-person-description]
  [fixture: c4/gram-named-proto-existing-relationship-style]
- 固定のキーワード内の切れ目は、下記の共通の差異のエラーです。
  [fixture: c4/div-directive-header] [fixture: c4/lex-directive-keyword]
  [fixture: c4/div-semicolon-call-keyword-after-block]

## venn 図の中

- 字句規則が一致しない文字は、その文字の範囲で、
  メッセージは `Unexpected character` です。
  非 BMP 文字は両方のコード単位を覆います。
  閉じていない文字列とラベルは単位全体に一致しないので、
  開きの引用符か角括弧で報告します。
  [fixture: venn/gram-header-non-bmp-before-comment]
  [fixture: venn/gram-unclosed-id] [fixture: venn/gram-unclosed-label]
  [fixture: venn/gram-unclosed-style] [fixture: venn/lex-nbsp-line-start]
- 文法が読めない単位は、**有意な範囲**で報告します。
  単位のソース範囲から両端の空白を除いた範囲ですが、
  [トークンの規則](./tokens/venn.ja.md) が値の一部として保つ空白は含めます。
  メッセージは `Unexpected token` です。
  newline は開始位置の空の範囲です。
  ソースの終わりでは、空の範囲で `Unexpected end of text` です。
  要素が 1 つだけの union は、その要素で `Unexpected token` を報告します。
  [fixture: venn/gram-extra-set-no-id] [fixture: venn/gram-size-empty]
  [fixture: venn/gram-name-list-empty] [fixture: venn/gram-union-one]
  [fixture: venn/gram-union-trailing-comma]
  [fixture: venn/gram-set-colon-size-unclosed-directive-gap]
- ラベル全体が字句規則に一致しても、文法がその位置でラベルを読めなければ、
  開きの `[` の単位だけで報告します。
  メッセージは `Unexpected token` です。
  ラベルを受理した場合の[ノードの範囲](./positions/venn.ja.md) は、
  両方の角括弧を含みます。 [fixture: venn/gram-empty-label-alone]
  [fixture: venn/db-set-label]
- 先行する set と一致しない最初の union の要素を、その名前の範囲で報告します。
  引用した名前では引用符も含みます。
  メッセージは `A union member must name an earlier set` です。
  [fixture: venn/gram-union-unknown]
  [fixture: venn/gram-union-before-definitions]
  [fixture: venn/gram-union-inner-space]
  [fixture: venn/gram-union-case-mismatch]
- キーワード、名前、数の内部での切断は、裸の style 値の単位でも、
  後述の共通の差異のエラーになります。 [fixture: venn/header-directive-inside]
  [fixture: venn/db-grid-directive-size]
  [fixture: venn/div-directive-style-value-word]
  [fixture: venn/div-ignored-semicolon-style-value-selected]

## Ishikawa 図

- ディレクティブで切られていない最初のヘッダーの後が、
  除かれるディレクティブと追加の LF だけなら、
  選ばれたキーワードを範囲として報告します。
  メッセージは `The header cannot end the text` です。
  [fixture: ishikawa/header-only] [fixture: ishikawa/header-beta-only]
  [fixture: ishikawa/header-directive-only-eof]
- 後続のヘッダーは、そのキーワードを範囲とし、
  選ばれた beta 接尾辞と中のディレクティブも含みます。
  メッセージは `Unexpected token` で、先行する字下げは範囲外です。
  [fixture: ishikawa/header-twice] [fixture: ishikawa/header-beta-twice]
  [fixture: ishikawa/header-indented-second] [fixture:
  ishikawa/gram-header-ls-second-header] [fixture:
  ishikawa/gram-header-second-beta-prefix] [fixture:
  ishikawa/gram-directive-joins-second-header] [fixture:
  ishikawa/gram-second-header-eof] [fixture:
  ishikawa/gram-second-beta-header-eof] [fixture:
  ishikawa/gram-second-header-cut-eof]
- 最初に選ばれたヘッダーを切るディレクティブには、
  後述の共通の `Unexpected directive` エラーを使います。
  ノードのテキストには、未閉鎖の文字列や空の形のエラーはありません。
  [fixture: ishikawa/directive-in-header] [fixture:
  ishikawa/directive-in-beta-header] [fixture:
  ishikawa/div-directive-beta-prefix] [fixture:
  ishikawa/gram-root-unclosed-quote] [fixture: ishikawa/gram-empty-quotes]
  [fixture: ishikawa/gram-initial-header-cut-eof] [fixture:
  ishikawa/gram-initial-beta-cut-eof]

後続ヘッダーとディレクティブによる切断の規則は、
裸のヘッダーの EOF 規則より優先します。
後続のソースの LF があってもなくても、メッセージは同じです。
[fixture: ishikawa/header-twice] [fixture: ishikawa/gram-second-header-eof]
[fixture: ishikawa/header-beta-twice] [fixture:
ishikawa/gram-second-beta-header-eof] [fixture:
ishikawa/gram-directive-joins-second-header] [fixture:
ishikawa/gram-second-header-cut-eof] [fixture: ishikawa/directive-in-header]
[fixture: ishikawa/gram-initial-header-cut-eof] [fixture:
ishikawa/directive-in-beta-header] [fixture: ishikawa/gram-initial-beta-cut-eof]

## Agentflow での位置

| 拒否                                      | 範囲とメッセージ                                                                                                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lexer の規則に一致しない                  | その一文字。非 BMP 文字は UTF-16 の二単位を含み、`Unexpected character`。閉じない通常・markdown 文字列は開始引用符。                                                       |
| 未完のコールバックコンテキスト            | call キーワードで `The callback after call has no ( before the end of the text`、または開始丸括弧で `The arguments of the callback have no ) before the end of the text`。 |
| EOF まで click コンテキストが何も読まない | click キーワードで `click has no click id before the end of the text`。                                                                                                    |
| 文法が単位を読めない                      | 有意なトークン範囲、空白だけなら先頭の空範囲で `Unexpected token`。ソース EOF ではその空範囲で `Unexpected end of text`。                                                  |
| 無効な linkStyle 添字                     | その数値で `linkStyle <number> does not name a link that exists`。                                                                                                         |
| hasOwnProperty に続くメンバー             | 最初の後続候補の id、名前、アクセシビリティ値、または空文のセミコロンで `A flow member follows the member hasOwnProperty`。                                                |

字句規則に一致しない場合の行の例: [fixture: agentflow/lex-class-suffix-equals]
[fixture: agentflow/lex-vertex-equals-alone]
[fixture: agentflow/lex-vertex-supplementary-alone]
[fixture: agentflow/gram-bare-label-pipe]
[fixture: agentflow/gram-slanted-label-open-bracket]
[fixture: agentflow/gram-ellipse-label-open-paren]
[fixture: agentflow/lex-style-equals-in-value]

文法が単位を読めない場合の行の例:
[fixture: agentflow/gram-click-url-merged-strings]
[fixture: agentflow/gram-name-click-second-string]
[fixture: agentflow/gram-class-target-global]
[fixture: agentflow/gram-props-number-unit]
[fixture: agentflow/gram-interpolate-default-name]
[fixture: agentflow/gram-bare-label-open-bracket]
[fixture: agentflow/gram-bare-callback-global]
[fixture: agentflow/gram-connector-name-default]

[fixture: agentflow/lex-supplementary-id]
[fixture: agentflow/lex-unclosed-string]
[fixture: agentflow/lex-unclosed-markdown]
[fixture: agentflow/lex-call-without-parenthesis]
[fixture: agentflow/lex-callback-args-unclosed]
[fixture: agentflow/gram-connector-name-click-only-eof]
[fixture: agentflow/gram-node-empty-label]
[fixture: agentflow/lex-class-double-space-value]
[fixture: agentflow/gram-flow-open]
[fixture: agentflow/lex-linkstyle-leading-zero]
[fixture: agentflow/gram-linkstyle-style-out-of-bounds]
[fixture: agentflow/lex-flow-hasownproperty-member]
[fixture: agentflow/gram-flow-named-member-hasownproperty]
[fixture: agentflow/gram-connector-member-hasownproperty]
[fixture: agentflow/gram-accessibility-hasownproperty-member]
[fixture: agentflow/gram-flow-hasownproperty-before-empty-statement]
[fixture: agentflow/gram-name-click-empty-string-adjacent-text]

オペランドが一つの class 文と、値が空の style 文に改行が続く場合は、
その改行単位の空の有意範囲を報告する。
文のコメントが必須のスタイルの間隙を読む場合は、
最初の % から LF の直前までのコメント範囲を報告する。
[fixture: agentflow/gram-class-one-operand]
[fixture: agentflow/gram-style-empty-value]
[fixture: agentflow/gram-style-null-before-comment]

flow 名で click コンテキスト内の空文字列または空 markdown 文字列に、
裸のテキストが隣接した場合は、
そのテキストの有意な単位範囲を `Unexpected token` で報告する。
[fixture: agentflow/gram-name-click-empty-string-adjacent-text]
[fixture: agentflow/gram-flow-name-click-empty-markdown-adjacent-rejected]

原子的な項目内の directive と選択された無視セミコロンは、
以下の共通境界エラーになる。
保持できない空形式は、共通の空形式エラーでその全範囲を報告する。
Name と click 接頭辞で保持する形式にはこのエラーはない。
agentflow に予約語 click のエラーはない。
[fixture: agentflow/div-directive-in-id]
[fixture: agentflow/div-ignored-semicolon-in-arrow]
[fixture: agentflow/div-empty-call-before-arrow]
[fixture: agentflow/div-empty-description-before-style-comma]
[fixture: agentflow/lex-empty-call-in-flow-name]
[fixture: agentflow/gram-click-erased-before-url]

## usecase 図の中

字句解析器は文法の前に図全体を読むため、前の接頭部の文法エラーより、
後の読めない文字を先に報告します。
回復によって接頭部だけを受理することはありません。
[fixture: usecase/lex-lex-first-error-not-recovered]
[fixture: usecase/lex-lex-later-error-priority]

コメントの前に残る物理改行が、ネイティブプロパティのキー・コロン・値や、
CSS のダッシュ接頭部と語を分ける場合、そのエラー範囲は空です。
CSS のその間の U+2028 は、 label-symbol 単位全体を報告します。
[fixture: usecase/gram-native-key-comment-region-keeps-line-break]
[fixture: usecase/gram-native-value-comment-region-keeps-line-break]
[fixture: usecase/gram-css-name-comment-region-lf]
[fixture: usecase/gram-css-name-comment-region-ls]

ネイティブ metadata の最後のプロパティからの末尾コンマと残る改行が、
合計 2 個を超える場合、次のプロパティのキーが必要な位置の閉じ波括弧全体で、
`Unexpected token` を報告します。
改行は共通のコメント領域と行終端の規則を適用した後で数え、
範囲は元のソース位置を保ちます。
[fixture: usecase/gram-metadata-trailing-comma-two-newlines]
[fixture: usecase/gram-metadata-trailing-comma-three-newlines]
[fixture: usecase/gram-metadata-trailing-comma-two-newlines-hws]
[fixture: usecase/gram-metadata-trailing-comma-two-newlines-crlf]
[fixture: usecase/gram-metadata-trailing-comma-three-newlines-crlf]
[fixture: usecase/gram-metadata-trailing-comma-comment-line-blank-after]
[fixture: usecase/gram-metadata-no-trailing-comma-three-newlines]
[fixture: usecase/gram-metadata-no-trailing-comma-four-newlines]
[fixture: usecase/gram-metadata-no-trailing-comma-three-crlf]
[fixture: usecase/gram-metadata-no-trailing-comma-whitespace-lines]
[fixture: usecase/gram-metadata-no-trailing-comma-tab-lines]
[fixture: usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines]
[fixture: usecase/gram-edge-metadata-three-newlines]
[fixture: usecase/gram-metadata-no-trailing-comma-comment-three-newlines]

ネイティブ metadata の改行後のコンマには、次のプロパティが必要です。
閉じ波括弧が続く場合、その全体で `Unexpected token` を報告します。
[fixture: usecase/gram-metadata-tail-newline-before-comma]
[fixture: usecase/gram-metadata-tail-newline-before-comma-newline]

| 拒否                                | 範囲とメッセージ                                                                                                    | fixture                                                                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 合う字句規則がない                  | その文字で `Unexpected character`。閉じない通常文字列は開き引用符。                                                 | [fixture: usecase/lex-plain-crlf] [fixture: usecase/lex-plain-escaped-quote]                                                                                   |
| 文法が単位を読めない                | トークン規則が保つ空白も含む有意な範囲で `Unexpected token`。改行は空範囲、ソース EOF は `Unexpected end of text`。 | [fixture: usecase/gram-empty-label] [fixture: usecase/gram-native-key-newline-colon] [fixture: usecase/gram-boundary-open]                                     |
| 要素宣言の不一致                    | 衝突する Actor または Entity で `An element declaration conflicts with an existing symbol`。                        | [fixture: usecase/gram-generated-label-repeat] [fixture: usecase/gram-bare-declaration-label-conflict] [fixture: usecase/gram-actor-repeat-labeltype-conflict] |
| 所属の不一致                        | 衝突する Actor または Entity で `An element cannot belong to two nonempty boundaries`。                             | [fixture: usecase/spec-usecase-parser-0996ad58]                                                                                                                |
| 境界宣言の不一致                    | 衝突する境界全体で `A boundary declaration conflicts with an existing symbol`。                                     | [fixture: usecase/gram-boundary-repeat-labeltype-conflict]                                                                                                     |
| JSON または明示した辺 id の重複     | 衝突する id で `A JSON or explicit edge id must be unique`。                                                        | [fixture: usecase/gram-json-duplicate-id] [fixture: usecase/spec-usecase-parser-31b56285]                                                                      |
| 参照だけの端点のクラス              | その端点で `A reference-only endpoint cannot have a class suffix`。                                                 | [fixture: usecase/gram-classes-on-reference-only] [fixture: usecase/gram-classes-on-quoted-reference-only]                                                     |
| 境界または明示した辺の端点          | 関係全体で `A relationship cannot connect a boundary or explicit edge`。                                            | [fixture: usecase/gram-relationship-boundary-endpoint]                                                                                                         |
| include/extend の actor または JSON | 関係全体で `Include and extend require two usecases`。                                                              | [fixture: usecase/spec-usecase-parser-81a7a3d7] [fixture: usecase/spec-usecase-parser-5c692f7f]                                                                |
| 互換性のない汎化                    | 関係全体で `Generalization requires two actors or two usecases of the same kind`。                                  | [fixture: usecase/spec-usecase-parser-70ebd0e2]                                                                                                                |
| JSON 関連の不正なマーカー           | 関係全体で `JSON permits only point or markerless associations`。                                                   | [fixture: usecase/spec-usecase-parser-800c93e6]                                                                                                                |
| 不正な note 対象                    | 対象 id で `A note target must resolve to an actor or usecase`。                                                    | [fixture: usecase/gram-note-unresolved] [fixture: usecase/spec-usecase-parser-67cf728b]                                                                        |
| 未解決の metadata 対象              | 対象 id または引用ラベルで `A metadata target must resolve to a stored symbol`。                                    | [fixture: usecase/gram-metadata-empty]                                                                                                                         |
| 未解決の class/style 対象           | 対象 id で `A class or style target must resolve to a stored symbol`。                                              | [fixture: usecase/gram-class-unknown] [fixture: usecase/gram-style-unknown]                                                                                    |
| 不正なネイティブプロパティ          | キーから値までで `The native metadata property is invalid for its target`。                                         | [fixture: usecase/gram-native-quoted-business] [fixture: usecase/gram-native-unknown-empty-value] [fixture: usecase/gram-native-invalid-property-later-fix]    |
| 宣言プロパティの不一致              | 後のプロパティで `Repeated declaration metadata values must agree`。                                                | [fixture: usecase/gram-metadata-duplicate-inline-conflict] [fixture: usecase/gram-metadata-duplicate-inline-business]                                          |
| 最終的な icon/type の衝突           | 最初の宣言の出現で `An actor icon cannot coexist with a non-normal explicit type`。                                 | [fixture: usecase/spec-usecase-parser-ca3ba61c]                                                                                                                |
| 最終的な business actor の衝突      | 最初の宣言の出現で `A business actor must have normal or hollow geometry`。                                         | [fixture: usecase/spec-usecase-parser-3f58fb81]                                                                                                                |
| 最終的な business rectangle の衝突  | 最初の宣言の出現で `A rectangle cannot be a business usecase`。                                                     | [fixture: usecase/spec-usecase-parser-49661584]                                                                                                                |

字句と文法の場合は次の fixture にあります。 [fixture: usecase/lex-plain-crlf]
[fixture: usecase/lex-plain-escaped-quote]
[fixture: usecase/lex-markdown-unclosed] [fixture: usecase/gram-empty-label]
[fixture: usecase/gram-stereotype-empty]
[fixture: usecase/gram-stereotype-space]
[fixture: usecase/gram-stereotype-newline]
[fixture: usecase/gram-json-empty-delimiter-only]
[fixture: usecase/lex-json-mode-unclosed-string]
[fixture: usecase/gram-boundary-open]
[fixture: usecase/gram-native-key-newline-colon]
[fixture: usecase/gram-native-value-newline]
[fixture: usecase/gram-css-whitespace-without-component]
[fixture: usecase/gram-forbidden-uppercase]
[fixture: usecase/gram-split-opening-forward-circle-prefix]
[fixture: usecase/gram-split-opening-forward-cross-prefix]
[fixture: usecase/gram-split-opening-extra-dash]
[fixture: usecase/gram-split-backward-opening-extra-dash]
[fixture: usecase/gram-style-json-prefix-mode]
[fixture: usecase/gram-style-json-prefix-nonempty-mode]
[fixture: usecase/gram-classdef-json-prefix-mode]
[fixture: usecase/gram-style-json-prefix-after-word-mode]
[fixture: usecase/gram-style-json-prefix-after-hash-mode]

名前空間、互換性、参照の場合は次の fixture にあります。
[fixture: usecase/gram-generated-label-repeat]
[fixture: usecase/gram-bare-declaration-label-conflict]
[fixture: usecase/gram-actor-repeat-labeltype-conflict]
[fixture: usecase/spec-usecase-parser-0996ad58]
[fixture: usecase/gram-boundary-repeat-labeltype-conflict]
[fixture: usecase/gram-json-duplicate-id]
[fixture: usecase/spec-usecase-parser-31b56285]
[fixture: usecase/gram-classes-on-reference-only]
[fixture: usecase/gram-classes-on-quoted-reference-only]

関係と対象の場合は次の fixture にあります。
[fixture: usecase/spec-usecase-parser-81a7a3d7]
[fixture: usecase/spec-usecase-parser-70ebd0e2]
[fixture: usecase/spec-usecase-parser-5c692f7f]
[fixture: usecase/spec-usecase-parser-800c93e6]
[fixture: usecase/gram-note-unresolved]
[fixture: usecase/spec-usecase-parser-67cf728b]
[fixture: usecase/gram-metadata-empty] [fixture: usecase/gram-class-unknown]
[fixture: usecase/gram-style-unknown]

ネイティブプロパティと最終形状の場合は次の fixture にあります。
[fixture: usecase/gram-native-quoted-business]
[fixture: usecase/gram-metadata-unknown-key]
[fixture: usecase/gram-native-unknown-empty-value]
[fixture: usecase/gram-native-invalid-property-later-fix]
[fixture: usecase/gram-metadata-duplicate-inline-conflict]
[fixture: usecase/gram-metadata-duplicate-inline-business]
[fixture: usecase/gram-native-inline-conflict-later-fix]
[fixture: usecase/spec-usecase-parser-ca3ba61c]
[fixture: usecase/spec-usecase-parser-3f58fb81]
[fixture: usecase/spec-usecase-parser-49661584]

閉じない markdown や JSON のフォールバックは文法の単位で、
書かれた範囲全体を報告します。
閉じないステレオタイプのフォールバックも、LF を含まない並び全体です。
不可分な項目の切断は、以下の共通の境界エラーを使います。
[fixture: usecase/lex-markdown-unclosed]
[fixture: usecase/gram-json-empty-delimiter-only]
[fixture: usecase/gram-stereotype-open]
[fixture: usecase/div-directive-stereotype-closer]
[fixture: usecase/div-semicolon-stereotype-closer-selected]

## pie 図内

仕様の [字句規則](../../spec/docs/diagrams/pie.md#ordered-rules)を、
[再帰下降](../../spec/docs/diagrams/pie.md#grammar)より先に最後まで読みます。
そのため、後方の読めない文字は、前方の文法違反より先に報告します。
[fixture: pie/recover-lexer-after-parser] [fixture: pie/recover-lexer-first]

| 拒否                                   | 範囲とメッセージ                                                                              | fixture                                                                                                                                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 一致する字句規則がない                 | ソースの 1 文字に `Unexpected character`。閉じない文字列は開き引用符。                        | [fixture: pie/lex-nbsp] [fixture: pie/label-unclosed] [fixture: pie/label-unclosed-single]                                                                                                     |
| 説明ブロックか YAML 形式が閉じない     | 複合形式全体に一致しないため、キーワードの先頭文字か開きのダッシュに `Unexpected character`。 | [fixture: pie/accdescr-block-unclosed] [fixture: pie/yaml-unclosed-in-body]                                                                                                                    |
| 文法が単位を読めない                   | 有意範囲に `Unexpected token`。改行は先頭の空範囲、ソース EOF は `Unexpected end of text`。   | [fixture: pie/gram-adjacent-sections] [fixture: pie/gram-newline-before-colon] [fixture: pie/gram-missing-number] [fixture: pie/gram-block-next-inline]                                        |
| 隠し形式が唯一の区切り LF を消費       | 次の見える単位に `Unexpected token`。EOF なら EOL を満たす。                                  | [fixture: pie/review-hidden-directive-after-title] [fixture: pie/lex-yaml-after-value-before-eol] [fixture: pie/review-hidden-directive-title-eof] [fixture: pie/gram-section-eof-hidden-yaml] |
| セクションの変換後の double がゼロ未満 | 数値に `A pie section value cannot be negative`。重複セクションと負の無限大を含む。           | [fixture: pie/number-negative] [fixture: pie/db-duplicate-negative] [fixture: pie/number-negative-overflow]                                                                                    |

固定キーワードや数値の内部にある共通ディレクティブと、選ばれたセミコロンは、
後述の共通境界エラーで報告します。
一致しない隠し DIRECTIVE は、代わりにコメントに一致することがあります。
その場合、不足する構成要素は文法が報告します。
[fixture: pie/div-directive-in-header] [fixture: pie/div-directive-number]
[fixture: pie/div-atomic-semicolon-number]
[fixture: pie/review-directive-hidden-unclosed]
[fixture: pie/lex-hidden-comment-fallback-no-boundary]

## gitgraph 図

[順序付き字句規則](../../spec/docs/diagrams/gitgraph.md#ordered-rules)は、
構文解析より前に図全体を読み、正しい接頭辞の後でも読めない文字は拒否します。
[fixture: gitgraph/lex-error-after-valid-prefix]
[fixture: gitgraph/gram-error-recovered-statement]

| 拒否                                   | 範囲とメッセージ                                                                              | fixture                                                                                                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 字句規則が一致しない                   | 元の文字で `Unexpected character`。完全な文字列として一致しなければ開始引用符。               | [fixture: gitgraph/lex-body-nbsp] [fixture: gitgraph/lex-string-unclosed] [fixture: gitgraph/lex-string-backslash-lf]                                      |
| 文法が単位を読めない                   | 有意範囲で `Unexpected token`。改行は開始位置の空範囲、元の EOF は `Unexpected end of text`。 | [fixture: gitgraph/gram-commit-msg-missing] [fixture: gitgraph/gram-second-header] [fixture: gitgraph/header-direction-no-colon]                           |
| 隠れた形式が唯一の区切り LF を消費する | 次の可視単位で `Unexpected token`。EOF は EOL を満たす。                                      | [fixture: gitgraph/lex-hidden-directive-after-commit] [fixture: gitgraph/lex-hidden-yaml-after-commit] [fixture: gitgraph/lex-hidden-directive-commit-eof] |

不可分な項目の分割は、後述の共通の境界エラーです。
完全なオプション語とコロンの境界では共通 trivia を許可します。
[fixture: gitgraph/div-directive-in-commit]
[fixture: gitgraph/div-style-semicolon-in-order-number]
[fixture: gitgraph/lex-option-global-before-colon]
[fixture: gitgraph/lex-selected-semicolon-option-word-colon]

[意味検査](../../spec/docs/diagrams/gitgraph.md#rejections)は、
構文解析と共通のトークン境界検査の後にソース順で行い、
スカラーオプションは最後のものだけを検査します。
[fixture: gitgraph/db-overwritten-invalid-source]
[fixture: gitgraph/db-overwritten-invalid-merge-id]
[fixture: gitgraph/db-duplicate-order-negative-zero]

| 拒否                                     | 範囲とメッセージ                                                                       | fixture                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 比較名が既存の branch と一致             | 名前の葉。`A branch name must not already exist`。                                     | [fixture: gitgraph/db-duplicate-main] [fixture: gitgraph/db-duplicate-branch] [fixture: gitgraph/db-duplicate-converted-branch] [fixture: gitgraph/db-compare-break-placeholder] [fixture: gitgraph/db-compare-default-equals] [fixture: gitgraph/db-compare-default-html] [fixture: gitgraph/db-compare-entity-placeholder-duplicate] [fixture: gitgraph/db-compare-escape-backspace] [fixture: gitgraph/db-compare-escape-double-quote] [fixture: gitgraph/db-compare-escape-form-feed] [fixture: gitgraph/db-compare-escape-hex-text] [fixture: gitgraph/db-compare-escape-line-feed] [fixture: gitgraph/db-compare-escape-null] [fixture: gitgraph/db-compare-escape-null-following-digit] [fixture: gitgraph/db-compare-escape-single-quote] [fixture: gitgraph/db-compare-escape-slash] [fixture: gitgraph/db-compare-escape-tab] [fixture: gitgraph/db-compare-escape-unicode-text] [fixture: gitgraph/db-compare-escape-vertical-tab] [fixture: gitgraph/db-compare-physical-line-endings] |
| checkout/switch の branch が不明         | branch の葉。`Checkout or switch must name an existing branch`。                       | [fixture: gitgraph/db-checkout-unknown] [fixture: gitgraph/db-switch-unknown] [fixture: gitgraph/docs-community-contributing-05cdc44b] [fixture: gitgraph/docs-syntax-gitgraph-2ea99686]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| merge 元が現在の tip を作った branch     | 元 branch の葉。`A merge source cannot be the branch that created the current tip`。   | [fixture: gitgraph/db-merge-current-created-on-source] [fixture: gitgraph/db-merge-same-current-origin-different-head] [fixture: gitgraph/db-duplicate-earlier-id-current-head] [fixture: gitgraph/db-merge-same-head] [fixture: gitgraph/db-merge-self]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 現在の branch を自身へ merge             | branch の葉。`A branch cannot merge itself`。                                          | [fixture: gitgraph/db-merge-self-empty]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 現在の merge tip が空                    | merge 文全体。`A merge requires a commit at the current branch tip`。                  | [fixture: gitgraph/db-merge-empty-current]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| merge 元の branch が不明                 | 元 branch の葉。`A merge must name an existing source branch`。                        | [fixture: gitgraph/db-merge-unknown] [fixture: gitgraph/db-merge-unknown-generated-prefix]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| merge 元の tip が空                      | 元 branch の葉。`A merge requires a commit at the source branch tip`。                 | [fixture: gitgraph/db-merge-empty-other]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| merge の tip が同じ定義に解決            | 元 branch の葉。`A merge requires different tip definitions`。                         | [fixture: gitgraph/spec-git-graph-ba75f403]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| merge のカスタム id が既存               | 最後の id の値。`A merge id must not already name a commit`。                          | [fixture: gitgraph/db-merge-duplicate-id]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| cherry-pick 元が省略・空・不明           | 最後の元 id の葉、省略時は文全体。`A cherry-pick source id must name a commit`。       | [fixture: gitgraph/db-cherry-pick-missing] [fixture: gitgraph/db-cherry-pick-empty-id] [fixture: gitgraph/db-cherry-pick-unknown] [fixture: gitgraph/db-compare-source-padding-mismatch] [fixture: gitgraph/db-state-generated-looking-source-unknown]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| cherry-pick の parent が不正             | 最後の parent の葉。`A cherry-pick parent must be an immediate parent of the source`。 | [fixture: gitgraph/db-cherry-pick-invalid-parent] [fixture: gitgraph/db-compare-parent-padding-mismatch]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| merge 元に空でない parent がない         | 元 id の葉。`A cherry-pick of a merge requires a nonempty parent`。                    | [fixture: gitgraph/db-cherry-pick-merge-no-parent] [fixture: gitgraph/db-merge-empty-parent] [fixture: gitgraph/db-state-visual-type-still-merge]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| cherry-pick 元が現在の branch で作られた | 元 id の葉。`A cherry-pick source must be created on another branch`。                 | [fixture: gitgraph/db-cherry-pick-same-branch]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 現在の cherry-pick tip が空              | 文全体。`A cherry-pick requires a commit at the current branch tip`。                  | [fixture: gitgraph/db-cherry-pick-empty-current]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## info 図内

仕様の [順序付き規則](../../spec/docs/diagrams/info.md#ordered-rules)は、
[文法](../../spec/docs/diagrams/info.md#grammar)より前に図全体を読みます。
正しい接頭辞の後でも、読めないテキストは入力全体を拒否します。
[fixture: info/error-after-prefix] [fixture: info/error-after-common]

| 拒否                                 | 範囲とメッセージ                                                                    | fixture                                                                                                                                                                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 一致する字句規則がない               | ソースの文字に `Unexpected character`。                                             | [fixture: info/space-header-nbsp] [fixture: info/detect-unicode-suffix]                                                                                                                                                                      |
| 説明ブロックか YAML 形式が閉じない   | 完全一致がないため、キーワードの先頭文字か開始のダッシュに `Unexpected character`。 | [fixture: info/accdescr-block-open] [fixture: info/hidden-yaml-unclosed]                                                                                                                                                                     |
| 文法が単位を読めない                 | 未消費の構成要素の有意範囲に `Unexpected token`。                                   | [fixture: info/header-repeated] [fixture: info/header-repeated-flag] [fixture: info/common-same-line]                                                                                                                                        |
| 隠し形式が唯一の区切り LF を消費する | 次の可視単位に `Unexpected token`。EOF は EOL を満たす。                            | [fixture: info/hidden-directive-after-title] [fixture: info/hidden-directive-crlf] [fixture: info/hidden-yaml-after-block] [fixture: info/hidden-yaml-crlf] [fixture: info/hidden-directive-title-eof] [fixture: info/hidden-yaml-block-eof] |

固定キーワード内部の分断には、後述の共通の境界エラーを使います。
一致しない隠し DIRECTIVE は、代わりに図固有のコメントになる場合があります。
[fixture: info/div-directive-header-middle]
[fixture: info/div-selected-showinfo] [fixture: info/hidden-directive-unclosed]
[fixture: info/hidden-directive-close-glued]

## 既知の差異

[既知の差異](../../spec/docs/known-divergences.ja.md)で入力を拒否するときは、
`range` は原因の形で、メッセージは原因を示します。

- `directive-as-token-boundary`: 切ってはならないトークン（名前、数、
  キーワード、矢印、ほかの区切り記号）の内側に、ディレクティブがあるときは、
  `range` はそのディレクティブで、メッセージは `Unexpected directive`。
  [fixture: flowchart/div-directive-in-arrow-length]
- `ignored-semicolon-as-token-boundary`: そのようなトークンの内側に、
  行の規則が無視する `;` があるときは、 `range` はその `;` で、
  メッセージは `Unexpected ; that the line rule ignores`。
  [fixture: flowchart/div-ignored-semicolon-in-arrow]
- `click-reserved-word`: クリックの文を始めない `click` では、
  `range` は語 `click` で、
  メッセージは `click is a reserved word: it may only start a click statement`。
  文法は、止まったところでこれを見つけます。
  読めない単位か、その後の `space` でない最初の単位が `click` の単位であるとき、
  そして、文の始まりの `click` の後に click の id がないときです。
  `click A href "u" click _blank` のように、mermaid.js も拒否する入力も、
  同じように報告します。 [fixture: flowchart/gram-click-mid-statement-tooltip]
  [fixture: flowchart/gram-ampersand-then-click-statement]
  [fixture: flowchart/gram-click-bare-before-vertex-statement]
  [fixture: flowchart/gram-click-mid-statement-link-target]
- `tokenless-empty-forms`: どの規則も取らない空の形では、
  `range` は両端の空白を除いた形の全体です。
  つまり、空の文字列、`call` から `)` までの空の呼び出し、
  `accDescr` から `}` までの空の説明のブロックです。
  メッセージは `An empty string cannot be written here`、
  `An empty call cannot be written here`、
  `An empty description block can only be written`
  `where a statement starts or ends` のいずれかです。
  [fixture: flowchart/gram-click-empty-call-only]
  [fixture: flowchart/gram-empty-description-block-before-link]
  文法は、`click` と同じように、止まったところでこれを見つけます。
  読めない単位か、その後の `space` でない最初の単位が、空の形に属するときです。
  `A[""]` のように、mermaid.js も拒否する入力も、同じように報告します。
  [fixture: flowchart/gram-label-empty-string]
  文の始まりの `click` とその click の id の間では、
  最初の空の文字列を報告します。
  空の文字列の後に click の id がないときは、 `click` を報告します。
  [fixture: flowchart/gram-click-empty-string-before-id]
  [fixture: flowchart/gram-click-bare-before-vertex-statement]
  クラス図では、空の形に、空のバッククォートの名前（2 つのバッククォート）と、
  空のジェネリクスの型（2 つの `~`）も入ります。
  メッセージは `An empty backquoted name cannot be written here` と
  `An empty generic type can only end a class name` です。
  空のジェネリクスの型は、`class A~~B` のように、
  文法がその後の単位を読めないところで見つけます。
  [fixture: class/div-empty-backquoted-in-name]
  [fixture: class/div-empty-generic-in-name]
  クラスの名前の直後の空の文字列は、
  関係の端か線が続いて関係の多重度になるときを除き、
  文法が読むところで見つけます。
  `A ""` では、その空の文字列を報告します。
  [fixture: class/div-empty-string-after-name]
  状態図では、空の説明のブロックを、
  文法がその直後の単位を読めないところでも見つけます。
  `A accDescr {} --> B` では、`A` の後のブロックは文で、
  その後の `-->` は文を始めないので、そのブロックを報告します。
  [fixture: state/div-empty-description-block-in-transition]
  区切りの要る文の最後の単位の後、または flowchart と class のヘッダーの後で、
  区切りや改行の前にある空の説明のブロックは、それぞれ文です。
  その後に区切りや改行がないときは、最初のブロックが文の中にあることになり、
  どの図種でもそのブロックを報告します。
  flowchart の `A accDescr {} B` と `flowchart LR accDescr {} A` でも、
  状態図の `click A "u" "t" accDescr {} B` でも、ブロックを報告します。
  [fixture: flowchart/gram-empty-description-block-then-vertex]
  [fixture: flowchart/header-empty-description-block-then-statement]
  [fixture: state/gram-click-empty-description-block-then-statement]
  flowchart の文やヘッダーは、区切りの前のそのようなブロックを除いて読みます。
  そのため、文が取らない、ブロックのまわりの空白は、
  ブロックがないときと同じところで報告します。
  `flowchart LR accDescr {};A` では、`flowchart TD ;` と行 `A` と同じく、
  空白の後の `;` を報告します。
  [fixture: flowchart/header-empty-description-block-before-semicolon]
  [fixture: flowchart/header-space-before-semicolon]
  ER 図では、空の形に、空のバッククォート（属性ブロックの中で、
  間に何もない 2 つのバッククォート）も入ります。
  メッセージは `Empty backquotes can only be written between two attributes`
  です。
  続けて書かれた空の説明ブロックや空のバッククォートは、
  その最後のものの後の単位で決めます。
  その単位が前の文や属性を続けるときは、最初のものを報告します。
  `A accDescr {} ||--o{ B : x` や、属性の `int a`、2 つのバッククォート、
  `PK` がその例です。 [fixture: er/div-empty-description-block-in-relationship]
  [fixture: er/div-empty-backquotes-before-key]
  [fixture: er/div-empty-description-blocks-in-relationship]
  [fixture: er/div-empty-description-blocks-before-role]
  [fixture: er/div-empty-description-blocks-after-class-keyword]
  [fixture: er/div-empty-backquotes-twice-between-type-and-name]
  [fixture: er/div-empty-backquotes-twice-before-key-comma]
  Gantt チャートでは、空の形に、空の href （`href` と、
  間に何もない 2 つの `"`）も入ります。
  メッセージは `An empty href cannot be written here` です。
  空の href と空の call は、どこにあってもどの規則も取らないので、
  文の始まりでも click の文の中でも、文法はそこで止まります。
  `href ""` の行の次に `title T` の行が続く入力、`call ()x : 1d`、
  `click id1 href ""`、`click id1 href "u" href ""` では、その空の形を報告し、
  `href "" call ()` と `href "" accDescr {}` では 2 つのうち最初を報告します。
  [fixture: gantt/gram-empty-href-line]
  [fixture: gantt/gram-empty-call-glued-task]
  [fixture: gantt/gram-click-empty-href-only]
  [fixture: gantt/gram-click-href-then-empty-href]
  [fixture: gantt/gram-empty-href-and-empty-call-line]
  [fixture: gantt/gram-empty-href-then-empty-description-block-same-line]
  文の始まりで、その前にある空の説明ブロックは文なので、
  その後の空の href か空の call を報告します。
  `accDescr {} href ""` では、空の href を報告します。
  [fixture: gantt/gram-empty-description-block-then-empty-href-same-line]
  [fixture: gantt/gram-empty-description-block-then-empty-call-same-line]
  引用符の間にディレクティブのある空の href と、
  括弧の間にディレクティブのある空の call は、ディレクティブを越えて、
  キーワードから閉じの引用符か括弧までを報告します。
  [fixture: gantt/lex-empty-href-directive-between-quotes]
  [fixture: gantt/lex-empty-call-directive-between-parentheses]
  [fixture: gantt/div-empty-href-directive-between-quotes-before-call]
  click の文の中では、最初の部分の前の空の説明ブロックも、
  文法が止まったところで見つけます。
  最初の部分の後に続けて書かれた空の形は、その最後のものの後の単位で決めます。
  その単位が 2 つ目の部分を始めるときは、最初のものを報告します。
  `click id1 href "u" accDescr {} call f()` がその例です。
  [fixture: gantt/div-empty-href-before-call]
  [fixture: gantt/div-empty-call-before-href]
  [fixture: gantt/div-empty-href-and-empty-call-before-href]
  [fixture: gantt/div-empty-description-block-between-href-and-call]
  [fixture: gantt/div-empty-href-between-call-and-href]
  [fixture: gantt/div-empty-call-between-href-and-call]
  [fixture: gantt/div-empty-href-between-href-and-call]
  [fixture: gantt/div-empty-href-and-empty-call-between-parts]
  [fixture: gantt/div-empty-description-block-and-empty-href-between-parts]
  [fixture: gantt/div-empty-call-and-empty-description-block-between-parts]

`html-tag-in-frontmatter` は、どの `"` を `'` として読むかを変えます。
パーサーはそれを区別しないので、そこから起きる拒否は、上の規則で報告します。

## packet の中

[規則の順序](../../spec/docs/diagrams/packet.ja.md#規則の順序)に従い、
文法と意味上の受理条件より先にソース全体を走査します。
後方の字句エラーも、正しい接頭部分を持つ入力全体を拒否します。
[fixture: packet/error-after-prefix] [fixture: packet/error-recovered-block]

| 拒否                                   | 範囲とメッセージ                                                                                                            | fixture                                                                                                                                                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 字句規則が一致しない                   | そのソース文字。`Unexpected character`。                                                                                    | [fixture: packet/error-start] [fixture: packet/space-header-nbsp] [fixture: packet/lex-integer-shorter-before-dot]                                                                                           |
| 完全な文字列・説明ブロックが一致しない | 開き引用符またはキーワードの最初の文字。`Unexpected character`。                                                            | [fixture: packet/lex-label-open] [fixture: packet/lex-label-open-single] [fixture: packet/lex-label-escaped-lf] [fixture: packet/accdescr-block-open]                                                        |
| 文法が単位を読めない                   | 単位の有意範囲、トークンがなければ開始の空範囲。`Unexpected token`。EOF ではソース末尾の空範囲で `Unexpected end of text`。 | [fixture: packet/gram-second-header] [fixture: packet/gram-same-line-blocks] [fixture: packet/comment-inside-range]                                                                                          |
| 隠れた形式が唯一の区切り LF を消費する | 次の可視単位。`Unexpected token`。EOF なら EOL を満たす。                                                                   | [fixture: packet/hidden-directive-block] [fixture: packet/hidden-directive-title] [fixture: packet/hidden-yaml-block] [fixture: packet/hidden-yaml-description] [fixture: packet/hidden-directive-block-eof] |
| 範囲が降順                             | 記述されたブロック全体。`Packet range end is less than its start`。                                                         | [fixture: packet/error-descending-before-gap] [fixture: packet/error-cap-following-descending]                                                                                                               |
| ブロックが連続しない                   | 記述されたブロック全体。`Packet block start must follow the previous logical endpoint`。                                    | [fixture: packet/error-first-nonzero] [fixture: packet/error-overlap] [fixture: packet/error-repeat-third] [fixture: packet/error-cap-following-noncontiguous]                                               |
| 相対指定の数がゼロ                     | 記述されたブロック全体。`Packet relative count must be greater than zero`。                                                 | [fixture: packet/error-zero-after-valid] [fixture: packet/error-cap-following-zero]                                                                                                                          |

ブロック全体の範囲は、[ブロックの位置](./positions/packet.ja.md#範囲)に従い、
隠れた接尾形式を含みます。
サイトの行幅の検査は、保留断片の逆転も、
そのブロックの範囲で `Packet fragment start exceeds its end` として拒否します。
デフォルトの parse(text) は対応する入力を受理します。
[fixture: packet/hidden-directive-block-eof]
[fixture: packet/error-rounded-following-wide]
[fixture: packet/error-single-rounded-end-wide]
[fixture: packet/config-fraction-reject]

共通の不可分なトークンの分割エラーは、
ディレクティブまたは選択されたセミコロンを指します。
固有ディレクティブの不一致は Comment になり得ます。
YAML は範囲のダッシュへ戻り、後の字句・文法エラーになり得ます。
[fixture: packet/directive-number-middle]
[fixture: packet/div-selected-integer-interior]
[fixture: packet/hidden-directive-close-glued]
[fixture: packet/hidden-yaml-unclosed] [fixture: packet/lex-yaml-two-empty]

## architecture の中

[規則の順序](../../spec/docs/diagrams/architecture.md#ordered-rules)に従い、
文法と意味上の登録より先にテキスト全体を読みます。
不正な末尾を回復して、正しい接頭部分だけを受理することはありません。
[fixture: architecture/error-after-prefix]
[fixture: architecture/error-recovered-statement]

| 原因                                             | 範囲とメッセージ                                                                                                      | fixture                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 完全な字句規則が一致しない                       | そのソース文字。`Unexpected character`。                                                                              | [fixture: architecture/space-body-nbsp] [fixture: architecture/lex-string-unclosed] [fixture: architecture/lex-title-unclosed] [fixture: architecture/lex-icon-spaces]                                                                                                                                             |
| 文法が構成要素を読めない                         | 有意範囲、トークンがなければ開始の空範囲。`Unexpected token`。EOF ではソース末尾の空範囲で `Unexpected end of text`。 | [fixture: architecture/header-repeated] [fixture: architecture/gram-same-line-statements] [fixture: architecture/gram-group-id-missing] [fixture: architecture/gram-edge-rhs-missing]                                                                                                                              |
| 隠れた形式が唯一の区切り LF を消費する           | 次の可視構成要素。`Unexpected token`。EOF は EOL を満たす。                                                           | [fixture: architecture/hidden-yaml-service-after] [fixture: architecture/hidden-directive-after-service] [fixture: architecture/hidden-yaml-service-eof] [fixture: architecture/hidden-directive-eof]                                                                                                              |
| 宣言 ID が登録済み                               | 重複する宣言 ID。`Architecture ID is already registered`。                                                            | [fixture: architecture/error-group-duplicate] [fixture: architecture/error-service-duplicate] [fixture: architecture/error-service-junction-collision] [fixture: architecture/error-group-junction-collision]                                                                                                      |
| 宣言が自身を親にする                             | 親参照。`Architecture declaration cannot be its own parent`。                                                         | [fixture: architecture/error-group-self-parent] [fixture: architecture/error-service-self-parent] [fixture: architecture/error-junction-self-parent]                                                                                                                                                               |
| その登録段階で親が利用可能なグループでない       | 親参照。`Architecture parent must be a registered group`。                                                            | [fixture: architecture/error-group-forward-parent] [fixture: architecture/error-group-parent-node] [fixture: architecture/error-service-parent-missing] [fixture: architecture/error-service-parent-node] [fixture: architecture/error-junction-parent-missing] [fixture: architecture/error-junction-parent-node] |
| 辺の端点か整列メンバーが存在しないかグループ     | その ID。`Architecture reference must name a service or junction`。                                                   | [fixture: architecture/error-edge-lhs-missing] [fixture: architecture/error-edge-rhs-missing] [fixture: architecture/error-edge-group-lhs] [fixture: architecture/error-edge-group-rhs] [fixture: architecture/error-align-missing] [fixture: architecture/error-align-group]                                      |
| 辺の修飾子が同じ空でない親グループのノードを結ぶ | 隠れた接尾形式も含む辺全体。`Architecture group modifier cannot join nodes in the same parent group`。                | [fixture: architecture/error-edge-same-group-lhs] [fixture: architecture/error-edge-same-group-rhs]                                                                                                                                                                                                                |
| 整列がメンバーを繰り返す                         | 繰り返すメンバーの ID。`Architecture alignment members must be distinct`。                                            | [fixture: architecture/error-align-duplicate]                                                                                                                                                                                                                                                                      |

意味検査はグループ、サービス、ジャンクション、辺、整列の順です。
各種類の中ではソース順です。
共通のトークン境界検査は登録より前に実行し、
分割できない項目を切るディレクティブか選択されたセミコロンを報告します。
ネイティブのディレクティブが一致しなければコメントになることがあります。
[fixture: architecture/db-junction-order]
[fixture: architecture/db-service-forward-parent]
[fixture: architecture/error-service-parent-forward-junction]
[fixture: architecture/div-directive-name]
[fixture: architecture/div-directive-line]
[fixture: architecture/div-semicolon-parent-id]
[fixture: architecture/hidden-directive-unclosed]
[fixture: architecture/hidden-directive-close-glued]

## radar 図の中

[順序付き字句規則](../../spec/docs/diagrams/radar.ja.md) が、
文法と意味上の受理条件より先に全テキストを走査します。
不正な末尾を含む入力の先頭だけを回復して受理しません。
[fixture: radar/error-after-prefix] [fixture: radar/error-recovered-curve]

| 原因                              | 範囲とメッセージ                                                                       | fixture                                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 完全な字句規則に一致しない        | ソースの 1 文字。`Unexpected character`。                                              | [fixture: radar/error-start] [fixture: radar/space-nbsp-body] [fixture: radar/lex-string-open-axis]                   |
| 文法が構成要素を読めない          | 有意範囲で `Unexpected token`。EOF ではソース末尾の空範囲で `Unexpected end of text`。 | [fixture: radar/header-repeated] [fixture: radar/gram-axis-trailing-comma] [fixture: radar/gram-entry-empty]          |
| hidden form が共通文の EOL を消費 | 次の可視要素で `Unexpected token`。EOF なら EOL を満たす。                             | [fixture: radar/hidden-native-title] [fixture: radar/hidden-native-title-eof]                                         |
| 名前付き曲線に軸がない            | hidden gap と suffix を含む曲線全体。`Radar named curve requires axes`。               | [fixture: radar/error-reference-no-axes]                                                                              |
| 名前付き曲線に宣言した軸名がない  | hidden gap と suffix を含む曲線全体。`Radar named curve is missing an axis entry`。    | [fixture: radar/error-reference-missing] [fixture: radar/error-reference-case] [fixture: radar/error-reference-label] |

共通の不可分要素の切断エラーは、
グローバルディレクティブか選択されたセミコロンを指します。
不成立の native directive は Comment になることがあります。
[fixture: radar/directive-axis-name] [fixture: radar/div-semicolon-number]
[fixture: radar/hidden-native-unclosed]

## treemap 図の中

[順序付き規則](../../spec/docs/diagrams/treemap.md#ordered-rules)は、
再帰下降の前にテキスト全体を走査します。
回復した接頭部だけを受理しません。 [fixture: treemap/error-after-prefix]
[fixture: treemap/error-recovered-row]

| 原因                                            | 範囲とメッセージ                                                                                                              | fixture                                                                                                                                                                                                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 完全な字句規則に一致しない                      | ソース文字で `Unexpected character`。閉じない文字列は開き引用符を指す。                                                       | [fixture: treemap/error-start] [fixture: treemap/space-nbsp-body] [fixture: treemap/lex-string-open-double] [fixture: treemap/lex-string-open-single] [fixture: treemap/common-block-open]                                                                       |
| 文法が構成要素を読めない                        | 有意範囲で `Unexpected token`。インデント単位は先頭の空範囲。EOF はソース終端の空範囲で `Unexpected end of text`。            | [fixture: treemap/header-repeat] [fixture: treemap/gram-space-after-selector] [fixture: treemap/gram-two-indent-runs] [fixture: treemap/gram-selector-empty] [fixture: treemap/gram-header-trailing-indent-eof] [fixture: treemap/gram-leaf-trailing-indent-eof] |
| 共通 directive や選択セミコロンが原子を分割する | 共通の directive・セミコロン範囲で `Unexpected directive` または `Unexpected semicolon`。複合形式の構成要素は別々に検査する。 | [fixture: treemap/directive-header-middle] [fixture: treemap/directive-class-name] [fixture: treemap/div-directive-style-marker] [fixture: treemap/div-semicolon-number-atom] [fixture: treemap/div-semicolon-title-keyword]                                     |

保持された YAML はネイティブには読めないテキストなので、
ブロック全体ではなく最初のハイフンを指します。
保持された一行の二回目走査形式は Comment になり得ますが、
複数行形式のコメントでない閉じ行は読めません。
複数ルート、空名、 NaN に追加の意味エラーを適用しません。
[fixture: treemap/detect-retained-body-yaml-no-native]
[fixture: treemap/detect-second-scan-single-line-comment]
[fixture: treemap/detect-second-scan-multiline-rejected]
[fixture: treemap/spec-treemap-test-ts-177d3e59]
[fixture: treemap/db-empty-names] [fixture: treemap/db-number-nan]

## Railroad 図の中

4 方言は、文法の前にソース全体を走査します。
回復した接頭部分だけでは受理しません。 [fixture: railroad/ir-error-before-rule]
[fixture: railroad/ebnf-error-before-rule]
[fixture: railroad/abnf-error-before-rule]
[fixture: railroad/peg-error-before-rule]

| 原因                                                   | 範囲とメッセージ                                                                       | fixtures                                                                                                                                                                                                                    |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 完全な字句規則が一致しない                             | ソースの文字に `Unexpected character`。閉じていない文字列は開き引用符。                | [fixture: railroad/ir-lex-string-open-double] [fixture: railroad/ebnf-lex-string-open-single] [fixture: railroad/abnf-lex-string-open] [fixture: railroad/peg-lex-name-nonascii]                                            |
| 文法が成分を読めない                                   | 有意範囲に `Unexpected token`。EOF ならソース末尾の空範囲に `Unexpected end of text`。 | [fixture: railroad/ir-error-empty-call] [fixture: railroad/ebnf-comma-trailing] [fixture: railroad/abnf-comment-terminator] [fixture: railroad/peg-prefix-missing-operand] [fixture: railroad/ir-metadata-after-rule-title] |
| 共通ディレクティブか選択されたセミコロンがアトムを切る | 共通の範囲に `Unexpected directive` か `Unexpected semicolon`。                        | [fixture: railroad/ir-div-directive-header] [fixture: railroad/ebnf-div-directive-assignment] [fixture: railroad/abnf-div-semicolon-repeat-number] [fixture: railroad/peg-div-semicolon-assignment]                         |

native の隠れた形式には意味上の拒否がなく、直後の可視 EOL も不要です。
一致しない native directive は Comment になる場合があります。
カウント、参照、描画設定による受理条件は追加しません。
[fixture: railroad/ir-hidden-directive-closing-space]
[fixture: railroad/ebnf-native-directive-fallback]
[fixture: railroad/abnf-db-repeat-reversed]
[fixture: railroad/peg-config-init-drawing]

## Wardley 図の中

字句走査全体の後に文法と意味的受理条件を検証する。
受理できる接頭部分があっても未読テキストを許容しない。
[fixture: wardley/error-after-prefix] [fixture: wardley/error-recovered]

| 原因                                                 | 範囲とメッセージ                                                                        | fixture                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 完全な字句規則が一致しない                           | ソースの一文字で `Unexpected character`。未閉鎖文字列は開き引用符。                     | [fixture: wardley/error-start] [fixture: wardley/lex-string-open-double] [fixture: wardley/lex-string-open-single] [fixture: wardley/space-nbsp-body] [fixture: wardley/tail-link-empty-label]                                                                                                                                                                                                                                               |
| 文法が単位を読めない                                 | 有意範囲で `Unexpected token`。ソース EOF なら末尾の空範囲で `Unexpected end of text`。 | [fixture: wardley/gram-pipeline-open] [fixture: wardley/gram-coordinate-trailing-comma] [fixture: wardley/header-upper] [fixture: wardley/gram-component-strategy-duplicate]                                                                                                                                                                                                                                                                 |
| 共通ディレクティブか選択されたセミコロンが原子を分割 | その範囲で `Unexpected directive` または `Unexpected semicolon`。                       | [fixture: wardley/directive-id-inside] [fixture: wardley/directive-number] [fixture: wardley/directive-arrow-inside] [fixture: wardley/lex-selected-port-inside] [fixture: wardley/lex-selected-decimal-inside]                                                                                                                                                                                                                              |
| 検査対象の正規化座標が 0 から 100 の外               | 問題の符号なし数値の葉で `A Wardley coordinate must be between 0 and 100`。             | [fixture: wardley/gram-invalid-anchor] [fixture: wardley/gram-replaced-invalid-node] [fixture: wardley/gram-invalid-note] [fixture: wardley/gram-invalid-annotation] [fixture: wardley/gram-invalid-accelerator] [fixture: wardley/gram-invalid-deaccelerator] [fixture: wardley/gram-invalid-pipeline-child] [fixture: wardley/gram-invalid-evolve] [fixture: wardley/gram-box-first-invalid] [fixture: wardley/number-coordinate-overflow] |
| pipeline の親に登録済みの完全一致 ID がない          | 記述された参照の葉で `A Wardley pipeline parent must exist`。                           | [fixture: wardley/gram-missing-pipeline-parent] [fixture: wardley/gram-pipeline-plain-name-ref] [fixture: wardley/gram-pipeline-child-parent-before] [fixture: wardley/gram-reference-case-mismatch] [fixture: wardley/gram-reference-unicode-mismatch]                                                                                                                                                                                      |

座標検査は丸め済み double を使い、置換される宣言も各出現と pipeline 子を調べる。
登録後に既存 ID の evolve 目標のみを調べ、最初の annotations box のみを調べる。
size と stage の数値に追加の範囲制約はない。
設定は Wardley の受理条件を増やさない。
[fixture: wardley/db-coordinate-double-one]
[fixture: wardley/db-coordinate-double-hundred]
[fixture: wardley/gram-replaced-invalid-node-last]
[fixture: wardley/gram-evolve-forward-invalid]
[fixture: wardley/db-trend-missing] [fixture: wardley/db-later-invalid-box]
[fixture: wardley/db-number-overflow] [fixture: wardley/db-stages-boundaries]
[fixture: wardley/config-frontmatter-cannot-rescue]

## cynefin 図の中

公開の受理判定は、回復せず字句・構文を最後まで読むことを要求します。
追加の意味検査や設定による拒否はありません。 [fixture: cynefin/error-recovered]
[fixture: cynefin/db-self-loops] [fixture: cynefin/config-site-small-limits]

| 拒否                                                   | 範囲とメッセージ                                                                                            | fixture                                                                                                                                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 完全な字句規則に一致しない                             | ソースの文字。`Unexpected character`。未閉鎖文字列は開始引用符。                                            | [fixture: cynefin/error-start] [fixture: cynefin/lex-string-open-double] [fixture: cynefin/lex-string-open-single] [fixture: cynefin/space-nbsp-body]                      |
| 文法が単位を読めない                                   | 有意範囲。`Unexpected token`（追加 LF なら空）。単位が残らなければ末尾の空範囲で `Unexpected end of text`。 | [fixture: cynefin/gram-missing-target] [fixture: cynefin/gram-label-missing-string] [fixture: cynefin/gram-orphan-item] [fixture: cynefin/hidden-directive-sole-lf]        |
| ディレクティブや選ばれたセミコロンが不可分な単位を切る | 対象の範囲。`Unexpected directive` または `Unexpected ; that the line rule ignores`。                       | [fixture: cynefin/directive-domain-inside] [fixture: cynefin/directive-arrow-inside] [fixture: cynefin/semicolon-complex-inside] [fixture: cynefin/semicolon-arrow-inside] |

## Eventmodeling 図内

先勝ちの字句走査全体を再帰下降より先に行います。
公開 gate は回復した prefix を受理せず、参照を解決せず、
validator や設定依存の条件を加えません。
[fixture: eventmodeling/error-recovered]
[fixture: eventmodeling/link-note-forward]
[fixture: eventmodeling/validator-multiple-invalid]
[fixture: eventmodeling/config-frontmatter-cannot-rescue]

| 原因                                               | 範囲とメッセージ                                                                                            | fixture                                                                                                                                                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 完全な字句規則がない                               | ソース文字に `Unexpected character`。未閉鎖の data/comment は開始記号。                                     | [fixture: eventmodeling/error-start] [fixture: eventmodeling/lex-inline-open-double] [fixture: eventmodeling/lex-block-open] [fixture: eventmodeling/comment-block-open]                                      |
| 文法が単位を読めない                               | 有意範囲に `Unexpected token`。残る単位がなければソース末尾の空範囲に `Unexpected end of text`。            | [fixture: eventmodeling/header-double] [fixture: eventmodeling/frame-source-missing] [fixture: eventmodeling/gwt-empty-then] [fixture: eventmodeling/data-block-inline-rejected]                              |
| 共通 directive または選択 semicolon が atom を切る | 共有 directive/semicolon の範囲に `Unexpected directive` または `Unexpected ; that the line rule ignores`。 | [fixture: eventmodeling/directive-id-inside] [fixture: eventmodeling/directive-arrow-inside] [fixture: eventmodeling/directive-reference-close-inside] [fixture: eventmodeling/lex-semicolon-frame-id-inside] |

native hidden form は可視 EOL を消費せず、意味上の拒否を加えません。
失敗した native directive は Comment になれますが、
ほかの読めない suffix は拒否します。
[fixture: eventmodeling/lex-native-directive-one-line-fallback]
[fixture: eventmodeling/hidden-directive-no-boundary]
[fixture: eventmodeling/error-after-prefix]

## Treeview 図内

順序付きの字句走査全体と文法が成功する必要がある。
二つの罫線エラーは引用符・ブロックの文脈とは独立に適用し、
装飾の後でも元のソース位置を示す。
設定依存の条件や追加の意味上の受理条件はない。
[fixture: treeview/error-after-prefix] [fixture: treeview/box-error-remap]
[fixture: treeview/box-block-indent-error] [fixture:
treeview/config-frontmatter-cannot-rescue]

| 原因                                               | 範囲とメッセージ                                                                                                 | fixture                                                                                                                                                                                |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 完全な字句規則が一致しない                         | ソース文字に `Unexpected character`。閉じない引用名は開始引用符。                                                | [fixture: treeview/error-after-prefix] [fixture: treeview/box-error-remap]                                                                                                             |
| 文法が単位を読めない                               | 有意範囲に `Unexpected token`。字下げは先頭の空範囲。単位が残らなければ末尾の空範囲に `Unexpected end of text`。 | [fixture: treeview/gram-repeated-header] [fixture: treeview/gram-accessibility-after-node] [fixture: treeview/gram-quoted-tail-space-next-indent] [fixture: treeview/space-double-tab] |
| directive または選択 semicolon が atom を切る      | 共通 directive/semicolon の範囲に `Unexpected directive` または `Unexpected ; that the line rule ignores`。      | [fixture: treeview/directive-class-value-inside] [fixture: treeview/directive-icon-value-inside] [fixture: treeview/semicolon-class-inside]                                            |
| 罫線の枝に内容が残らない                           | 最初の非空白文字から枝・横棒の連続までの接頭辞に `A treeview branch must have content`。                         | [fixture: treeview/box-empty-branch-after-decoration] [fixture: treeview/box-prefixed-directive]                                                                                       |
| 罫線モードで通常の字下げと罫線のない内容が混在する | 先頭の共通空白の範囲に `Cannot mix ordinary indentation with treeview branches`。                                | [fixture: treeview/box-mixed-reject] [fixture: treeview/box-mixed-indent-nbsp] [fixture: treeview/box-quoted-indent-error] [fixture: treeview/box-block-indent-error]                  |

保持された fence に native YAML 規則はなく、
ヘッダー前の最初の bare-name 単位で文法が拒否する。
一行の二回目走査形式は native Comment になれるが、
後の非コメントの閉じ行はヘッダー前で拒否する。
[fixture: treeview/detect-block-after-directive] [fixture:
treeview/detect-secondscan-singleline] [fixture:
treeview/detect-secondscan-multiline]
