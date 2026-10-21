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
  空白 2 つなら `[2, 2]`。
  [fixture: common/detect-boundary-swimlane]
  [fixture: common/empty]
  [fixture: common/comment-only]
  [fixture: common/whitespace-only]
- `---` 疑似図種: `range` は、ブロックの先頭の `-` 3 文字。
  [fixture: common/frontmatter-adjacent-delimiters]
- ヘッダーの前で、もう一度の読みで見つかるディレクティブ
  （[図種の検出](../../spec/docs/common.ja.md#図種の検出)）:
  `range` は、その開きの `%%{`。
  最初の `%` から `{` までで、
  間にあるソースのディレクティブとコメント領域を含む。
  複数あるときは最初のもの。
  [fixture: flowchart/detect-directive-across-directive]
  [fixture: sequence/detect-directive-across-directive]
  [fixture: sequence/detect-directive-across-comment-line-closed]
  [fixture: class/detect-directive-across-directive]
  [fixture: state/detect-directive-across-directive]

## flowchart の中

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  基本多言語面の外の文字では、その 2 つのコード単位。
  [fixture: flowchart/lex-non-bmp-character-unexpected]
  [fixture: flowchart/gram-edge-id-space-before-at]
- 終わってはならない文脈の中でテキストが終わるときは、
  `range` はその文脈に入った形で、メッセージは何が閉じていないかを示す。
  click の文脈が何も読んでいないときはその `click`
  （`click has no click id before the end of the text`）、
  コールバック名の文脈ではそこに入った `call`
  （`The callback after call has no ( before the end of the text`）、
  引数の文脈では引数を開く `(`
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
- 存在しないリンクを指す `linkStyle` の番号では、`range` はその番号。
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

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  [fixture: sequence/lex-id-context-line-break]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  [fixture: sequence/gram-box-create-participant]
  [fixture: sequence/lex-keyword-before-dash]
- 文法の外の拒否（mermaid.js が Db を作るときに行うもの）では、
  `range` は拒否の原因で、メッセージは理由を示す。
  - 活性化していない参加者の非活性化
    （`A participant that is not active cannot be deactivated`）。
    `deactivate` の後の id、または `-` の付いたメッセージの矢印の前の id。
    [fixture: sequence/gram-deactivate-inactive]
    [fixture: sequence/gram-deactivate-after-message]
  - すでにある参加者の作成
    （`A participant that exists already cannot be created`）。
    `create` とそのキーワードの後の id。
    [fixture: sequence/gram-create-after-message]
  - create の後で、作った参加者へ行かないメッセージ
    （`The message after create must go to the created participant`）と、
    destroy の後で、消した参加者から来ず、そこへも行かないメッセージ
    （`The message after destroy must come from or go to the destroyed participant`）。
    そのメッセージ。
    [fixture: sequence/gram-create-message-from-created]
    [fixture: sequence/gram-create-then-destroy-message-to-other]
  - ほかの箱をすでに持つ参加者の、箱の中の参加者の文
    （`A participant cannot be in two boxes`）。
    その文の id。
    [fixture: sequence/gram-box-participant-in-two-boxes]

## クラス図の中

- 図のテキストの最初の単位がヘッダーのキーワードでないとき
  （`classDiagramX` など）は、`range` はその単位で、メッセージは
  `A class diagram starts with classDiagram or classDiagram-v2`。
  字句解析器は、その単位を読んだところで報告する。
  その後のテキストが、終わってはいけない文脈で終わるときも同じである。
  [fixture: class/div-headerless-repeated-header]
  [fixture: class/div-headerless-empty-title]
- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  閉じていない文字列の `"` もそうである。
  [fixture: class/lex-string-unclosed]
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
    flowchart と同じ。
    [fixture: class/lex-call-at-end]
    [fixture: class/lex-callback-arguments-unclosed]
  - `accTitle`。
    メッセージは `accTitle has no text before the end of the text`。
    [fixture: class/lex-acc-title-at-end]
  - `accDescr`。
    メッセージは `accDescr has no text before the end of the text`。
    [fixture: class/lex-acc-descr-at-end]
  - 説明のブロックの `accDescr`。
    メッセージは
    `The description block has no } before the end of the text`。
    [fixture: class/lex-acc-descr-block-unclosed]
- 分けられないメソッドの行では、
  `range` はメンバーのテキスト（両端の空白を除いた行）で、メッセージは
  `A method line needs a ( that is not its first character and that a ) follows`。
  [fixture: class/lex-member-method-parenthesis-first]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  [fixture: class/gram-class-annotation-then-css-class]
  [fixture: class/header-only]
- 文法の外の拒否である、ないクラスへの注釈の文では、
  `range` は注釈の後のクラスの名前で、メッセージは
  `An annotation statement needs a class that exists`。
  [fixture: class/gram-annotation-after-name-statement]

## 状態図の中

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  その後に空白しかなく、そこでテキストが終わるときは、
  下のテキストの終わりの規則に従う。
  [fixture: state/lex-composite-ignored-percent-rejected]
  [fixture: state/gram-scale-without-width]
- `state` と `{` の間に語が 2 つあるときは、
  `range` は最初の語から `{` までで、メッセージは
  `A state name before { must be a single word`。
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
    最後のものは、`end note` の行が後に続かない複数行の note にも使う。
    [fixture: state/lex-note-without-position-at-end]
    [fixture: state/lex-note-no-state-at-end]
    [fixture: state/lex-end-note-two-spaces]
    [fixture: state/lex-note-unclosed-at-end]
  - `scale`。
    メッセージは `scale has no width before the end of the text`。
    [fixture: state/lex-scale-at-end]
  - 後に何もない `classDef`、`class`、`style`。
    メッセージは
    `classDef has no class name before the end of the text`、
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
  `range` はその状態に最初に本体を与えた文で、メッセージは
  `A composite state can have only one description`。
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
    [fixture: er/lex-block-unclosed]
    [fixture: er/lex-block-unclosed-empty]
  - テキストの終わりの空白が、最後の文字の後の行送りを取った、
    `classDef` と `style`。メッセージは
    `The classDef or style statement has no line feed before the end of the text`。
    [fixture: er/lex-classdef-trailing-space-at-end]
    [fixture: er/lex-style-trailing-tab-at-end]
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と
    `accDescr has no text before the end of the text`。
    [fixture: er/lex-acc-title-at-end]
    [fixture: er/lex-acc-descr-at-end]
  - 説明ブロックの `accDescr`。
    メッセージは `The description block has no } before the end of the text`。
    [fixture: er/lex-acc-descr-block-unclosed]
  - テキストがその中で終わるバッククォートの語では、
    `range` はその開きのバッククォートで、メッセージは
    ``The backquoted word has no closing ` before the end of the text``。
    [fixture: er/lex-backquote-unclosed]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  [fixture: er/lex-hash-after-name]
  [fixture: er/gram-subgraph-unclosed]

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
    [fixture: gantt/lex-href-unclosed]
    [fixture: gantt/lex-href-unclosed-lines]
  - flowchart と同じく、コールバックの `call` と `(`。
    [fixture: gantt/lex-callback-name-at-end]
    [fixture: gantt/lex-callback-arguments-unclosed]
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と
    `accDescr has no text before the end of the text`。
    [fixture: gantt/lex-acc-title-at-end]
    [fixture: gantt/lex-acc-descr-at-end]
  - 説明ブロックの `accDescr`。
    メッセージは `The description block has no } before the end of the text`。
    [fixture: gantt/lex-acc-descr-block-unclosed]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  日付で始まる行は、その日付で報告する。
  データのないタスクのテキスト `a` がテキストの終わりにあれば、
  終わりで報告する。
  [fixture: gantt/lex-date-line]
  [fixture: gantt/lex-task-text-only]
  [fixture: gantt/lex-click-id-at-end]
- 文法の外の 2 つの拒否は、文法がその文を読んだところで行う。
  `range` は、`topAxis` のキーワードで、メッセージは
  `A topAxis statement cannot be written in a Gantt chart`。
  データがタグだけのタスクでは、最初から最後までのタグで、メッセージは
  `The data of a task needs an item after its tags`。
  [fixture: gantt/db-top-axis-statement]
  [fixture: gantt/lex-topaxis-then-title]
  [fixture: gantt/gram-task-tags-only]
  [fixture: gantt/gram-task-tags-only-two]

## Journey 図の中

- どの文脈でも、どの文字もいずれかの規則で単位を始めるので、
  字句解析器が入力を拒否するのはテキストの終わりだけ。
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と
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
  [fixture: journey/lex-task-text-only]
  [fixture: journey/lex-task-colon-at-end]
  [fixture: journey/lex-semicolon-line]
  [fixture: journey/header-digit-suffix]
  [fixture: journey/lex-title-at-end]

## Requirement 図の中

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
  文の文脈で単位が始まる位置の `;` や `<`、キーワードの後の ASCII の外の文字、
  style の文脈のタブや `.` がその例。
  [fixture: requirement/lex-semicolon-line]
  [fixture: requirement/lex-less-than-alone]
  [fixture: requirement/lex-keyword-then-e-acute]
  [fixture: requirement/lex-style-tab]
  [fixture: requirement/lex-style-dot]
- テキストがその中で終わる文字列では、`range` はその開きの引用符で、
  メッセージは `The string has no closing " before the end of the text`。
  [fixture: requirement/lex-string-unclosed]
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と
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
  markdown 文字列では、その開きの引用符で、メッセージは
  ``The markdown string has no closing `" before the end of the text``。
  最初の `` ` `` や `"` が `` `" `` にならずに終わらせる markdown 文字列も、
  その開きの引用符で報告し、メッセージは
  ``The markdown string is not closed by `" at its first ` or "``。
  [fixture: mindmap/lex-string-unclosed]
  [fixture: mindmap/lex-markdown-string-unclosed]
  [fixture: mindmap/lex-markdown-string-quote]
  [fixture: mindmap/lex-markdown-string-then-text]
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  形の opener（`The shape has no closer before the end of the text`）と、
  `::icon(`（`The icon has no ) before the end of the text`）。
  [fixture: mindmap/lex-shape-unclosed]
  [fixture: mindmap/lex-icon-unclosed]
- ヘッダーでテキストが終わるときは、`range` はヘッダーで、
  メッセージは `The header cannot end the text`。
  [fixture: mindmap/db-header-without-line-feed]
  [fixture: mindmap/header-directive-at-end]
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
  `r[]` は `]` で、`r[text] tail` は `tail` で報告する。
  [fixture: mindmap/db-shape-empty-description]
  [fixture: mindmap/db-shape-text-after-end]
- 文法の外の 2 つの拒否は、文法がその行を読むところで行う。
  `range` は、根と同じかより浅く字下げしたノードで、
  メッセージは `A node cannot be as indented as the root or less`。
  最初のノードより前の icon や class の行では、その行で、
  メッセージは `An icon or a class line needs a node before it`。
  [fixture: mindmap/db-indent-same-as-root]
  [fixture: mindmap/db-icon-before-node]
  [fixture: mindmap/db-class-before-node]

## Timeline の中

- どの文脈でも、どの文字もいずれかの規則で単位を始めるので、
  字句解析器が入力を拒否するのはテキストの終わりだけ。
- 終わってはいけない文脈でテキストが終わるときは、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - `accTitle` と `accDescr`。
    メッセージは `accTitle has no text before the end of the text` と
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
  完全な実体を始める `#` がそうである。
  [fixture: sankey/gram-tab-in-field]
  [fixture: sankey/gram-quoted-non-ascii]
  [fixture: sankey/gram-emoji]
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
  [fixture: sankey/header-word-suffix]
  [fixture: sankey/gram-two-columns]
  [fixture: sankey/header-only]
- 間に何もない 2 つの引用符は単位を読まないので、
  `range` はその後の単位か、テキストの終わり。
  `"",c,1` は `,` で拒否される。
  [fixture: sankey/gram-quoted-empty]
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
  括弧、`|`、markdown 文字列の中の `"` がそうである。
  [fixture: quadrant/gram-quadrant-parens]
  [fixture: quadrant/gram-point-parens]
  [fixture: quadrant/gram-quadrant-pipe]
  [fixture: quadrant/gram-markdown-string-quote-inside]
- 終わってはいけない文脈でテキストが終わるときは、
  最後の文字の後に空白しかないときも含めて、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
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
  メッセージは `Unexpected end of text`。
  [fixture: quadrant/header-twice]
  [fixture: quadrant/gram-name-only]
  [fixture: quadrant/gram-grid-tab-class-name]
  [fixture: quadrant/gram-unclosed-class-name-at-end]
- 文法の外の拒否は、文法が点やクラスのスタイルを読み終えたところで行う。
  `range` は、mermaid.js が取らない最初のスタイルで、メッセージは
  `A style must be radius, color, stroke-color, or stroke-width with a value of its form`。
  [fixture: quadrant/gram-style-radius-word]
  [fixture: quadrant/gram-style-upper-case-key]
- 空の文字列と空の markdown 文字列は、下の既知の差異と同じくその位置で拒否する。
  `"": [0.3, 0.6]` のように mermaid.js も拒否する入力でも同じである。
  [fixture: quadrant/gram-name-quoted-empty]
  [fixture: quadrant/div-empty-string-alone]

## ブロック図の中

- 字句解析器のどの規則も合わない位置では、`range` はそこの文字。
  引用符のないラベル、id の中の `-`、形の括弧の中の空白、
  未知の方向がそうである。
  [fixture: block/gram-label-unquoted]
  [fixture: block/gram-name-dash]
  [fixture: block/gram-spec-space-before-string]
  [fixture: block/gram-arrow-unknown]
- 終わってはいけない文脈でテキストが終わるときは、
  最後の文字の後に空白しかないときも含めて、
  `range` はその文脈に入ったもので、メッセージは何が閉じていないかを示す。
  - 文字列の開きの `"`。
    メッセージは `The string has no closing " before the end of the text`。
  - markdown 文字列の開きの `"`。
    メッセージは
    ``The markdown string has no closing `" before the end of the text``。
  - 形の開き。
    メッセージは `The shape has no closing before the end of the text`。
  - ブロック矢印の `]>`。メッセージは
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
    メッセージは `class has no ids before the end of the text` と
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
  [fixture: block/gram-composite-extra-end]
  [fixture: block/gram-edge-to-space]
  [fixture: block/gram-class-def-default-upper]
- 文法の外の拒否は、文法が `style` の文の id を読んだところで行う。
  `range` は `,` を含めたその id で、
  メッセージは `style names no block made before it`。
  [fixture: block/gram-style-undefined]
  [fixture: block/gram-style-list]
  [fixture: block/gram-style-on-chain]
- 空の文字列と空の markdown 文字列、文の中の空の説明ブロックは、
  下の既知の差異と同じくその位置で拒否する。
  `A[""]` のように mermaid.js も拒否する入力でも同じである。
  [fixture: block/gram-label-empty]
  [fixture: block/div-empty-string-line]
  [fixture: block/div-empty-markdown-line]
  [fixture: block/div-empty-block-in-edge]

## kanban 図の中

- 字句解析のどの規則も合わないところでは、`range` はその文字で、
  メッセージは `Unexpected character` です。
  単独の `@`、形の外の波括弧、ラベルの中の単独の `}`、
  引用符で囲まれないデータのキャレットが該当します。
  [fixture: kanban/gram-node-at]
  [fixture: kanban/gram-grid-open-brace-item-id]
  [fixture: kanban/gram-shape-single-brace-middle]
  [fixture: kanban/gram-metadata-caret]
- 閉じない文字列と markdown 文字列は、開始の引用符で報告します。
  メッセージは `The string has no closing " before the end of the text` と、
  ``The markdown string has no closing `" before the end of the text`` です。
  閉じる組でない引用符やバッククォートで終わる markdown 文字列も、
  開始の引用符で報告します。
  メッセージは
  ``The markdown string is not closed by `" at its first ` or "`` です。
  [fixture: kanban/gram-unclosed-quote] [fixture: kanban/gram-unclosed-markdown]
  [fixture: kanban/gram-markdown-quote]
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
  [fixture: c4/lex-keyword-gap-person-space]
  [fixture: c4/gram-named-bare-value] [fixture: c4/lex-after-person-word]
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
  必須の文や境界の閉じ波括弧より前でテキストが終わるときは、
  末尾の空範囲で、メッセージは `Unexpected end of text` です。
  空の名前付きの値は、閉じ引用符の位置です。
  [fixture: c4/gram-arguments-person-none]
  [fixture: c4/gram-named-empty-value] [fixture: c4/header-context-only]
  [fixture: c4/gram-boundary-unclosed]
  [fixture: c4/gram-unmatched-right-brace-after-person]
- 方向の先読みは、先頭の文脈の単位を読む前に拒否します。
  範囲は一致した `direction` から方向値までで、メッセージは
  `A direction line is not allowed in C4` です。
  [fixture: c4/gram-direction-tb] [fixture: c4/gram-header-direction-tb]
  [fixture: c4/gram-direction-value-next-line]
- 消費する名前付きの `__proto__` 属性は、
  外側の空白と `$`、`=` を除いたキーの範囲です。
  メッセージは `A consumed named attribute cannot have the key __proto__` です。
  [fixture: c4/gram-named-proto]
  [fixture: c4/gram-named-proto-person-description]
  [fixture: c4/gram-named-proto-existing-relationship-style]
- 固定のキーワード内の切れ目は、下記の共通の差異のエラーです。
  [fixture: c4/div-directive-header] [fixture: c4/lex-directive-keyword]
  [fixture: c4/div-semicolon-call-keyword-after-block]

## 既知の差異

[既知の差異](../../spec/docs/known-divergences.ja.md)で入力を拒否するときは、
`range` は原因の形で、メッセージは原因を示します。

- `directive-as-token-boundary`:
  切ってはならないトークン
  （名前、数、キーワード、矢印、ほかの区切り記号）の内側に、
  ディレクティブがあるときは、`range` はそのディレクティブで、
  メッセージは `Unexpected directive`。
  [fixture: flowchart/div-directive-in-arrow-length]
- `ignored-semicolon-as-token-boundary`:
  そのようなトークンの内側に、行の規則が無視する `;` があるときは、
  `range` はその `;` で、
  メッセージは `Unexpected ; that the line rule ignores`。
  [fixture: flowchart/div-ignored-semicolon-in-arrow]
- `click-reserved-word`: クリックの文を始めない `click` では、
  `range` は語 `click` で、メッセージは
  `click is a reserved word: it may only start a click statement`。
  文法は、止まったところでこれを見つけます。
  読めない単位か、その後の `space` でない最初の単位が `click` の単位であるとき、
  そして、文の始まりの `click` の後に click の id がないときです。
  `click A href "u" click _blank` のように、mermaid.js も拒否する入力も、
  同じように報告します。
  [fixture: flowchart/gram-click-mid-statement-tooltip]
  [fixture: flowchart/gram-ampersand-then-click-statement]
  [fixture: flowchart/gram-click-bare-before-vertex-statement]
  [fixture: flowchart/gram-click-mid-statement-link-target]
- `tokenless-empty-forms`: どの規則も取らない空の形では、
  `range` は両端の空白を除いた形の全体です。
  つまり、空の文字列、`call` から `)` までの空の呼び出し、
  `accDescr` から `}` までの空の説明のブロックです。
  メッセージは `An empty string cannot be written here`、
  `An empty call cannot be written here`、
  `An empty description block can only be written where a statement starts or ends`
  のいずれかです。
  [fixture: flowchart/gram-click-empty-call-only]
  [fixture: flowchart/gram-empty-description-block-before-link]
  文法は、`click` と同じように、止まったところでこれを見つけます。
  読めない単位か、その後の `space` でない最初の単位が、
  空の形に属するときです。
  `A[""]` のように、mermaid.js も拒否する入力も、同じように報告します。
  [fixture: flowchart/gram-label-empty-string]
  文の始まりの `click` とその click の id の間では、
  最初の空の文字列を報告します。
  空の文字列の後に click の id がないときは、`click` を報告します。
  [fixture: flowchart/gram-click-empty-string-before-id]
  [fixture: flowchart/gram-click-bare-before-vertex-statement]
  クラス図では、空の形に、
  空のバッククォートの名前（2 つのバッククォート）と、
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
  ER 図では、空の形に、空のバッククォート
  （属性ブロックの中で、間に何もない 2 つのバッククォート）も入ります。
  メッセージは
  `Empty backquotes can only be written between two attributes` です。
  続けて書かれた空の説明ブロックや空のバッククォートは、
  その最後のものの後の単位で決めます。
  その単位が前の文や属性を続けるときは、最初のものを報告します。
  `A accDescr {} ||--o{ B : x` や、属性の `int a`、2 つのバッククォート、
  `PK` がその例です。
  [fixture: er/div-empty-description-block-in-relationship]
  [fixture: er/div-empty-backquotes-before-key]
  [fixture: er/div-empty-description-blocks-in-relationship]
  [fixture: er/div-empty-description-blocks-before-role]
  [fixture: er/div-empty-description-blocks-after-class-keyword]
  [fixture: er/div-empty-backquotes-twice-between-type-and-name]
  [fixture: er/div-empty-backquotes-twice-before-key-comma]
  Gantt チャートでは、空の形に、空の href
  （`href` と、間に何もない 2 つの `"`）も入ります。
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
  括弧の間にディレクティブのある空の call は、
  ディレクティブを越えて、キーワードから閉じの引用符か括弧までを報告します。
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
