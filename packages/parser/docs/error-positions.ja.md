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

`html-tag-in-frontmatter` は、どの `"` を `'` として読むかを変えます。
パーサーはそれを区別しないので、そこから起きる拒否は、上の規則で報告します。
