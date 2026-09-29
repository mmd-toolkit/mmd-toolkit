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
- `---` 疑似図種: `range` は、ブロックの先頭の `-` 3 文字。

## flowchart の中

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
- 終わってはならない文脈の中でテキストが終わるときは、
  `range` はその文脈に入った形で、メッセージは何が閉じていないかを示す。
  click の文脈が何も読んでいないときはその `click`
  （`click has no click id before the end of the text`）、
  コールバック名の文脈ではそこに入った `call`
  （`The callback after call has no ( before the end of the text`）、
  引数の文脈では引数を開く `(`
  （`The arguments of the callback have no ) before the end of the text`）。
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  空白だけの単位では、その単位の始まりの空の範囲。
  テキストの終わりでは、テキストの終わりの空の範囲で、
  メッセージは `Unexpected end of text`。
  `style A fill:red,` の後のように、
  テキストを終える空白の単位で文法が止まるときも、同じ。
  それ以外では、メッセージは `Unexpected token`。
- 存在しないリンクを指す `linkStyle` の番号では、`range` はその番号。
- メンバー `hasOwnProperty` の後にほかのメンバーが続く subgraph では、
  `range` はそのほかのメンバー、つまり `hasOwnProperty` の後の最初のメンバー。
  メンバーは、頂点の id、入れ子の subgraph の名前、アクセシビリティの文の値、
  空の文の `;` のどれかです。

## シーケンス図の中

- 字句解析器のどの規則も一致しない位置では、`range` はその 1 文字。
- 文法が単位を読めない位置では、`range` はその単位から空白を除いた範囲。
  テキストの終わりでは、flowchart と同じく、テキストの終わりの空の範囲。
- 文法の外の拒否（mermaid.js が Db を作るときに行うもの）では、
  `range` は拒否の原因で、メッセージは理由を示す。
  - 活性化していない参加者の非活性化
    （`A participant that is not active cannot be deactivated`）。
    `deactivate` の後の id、または `-` の付いたメッセージの矢印の前の id。
  - すでにある参加者の作成
    （`A participant that exists already cannot be created`）。
    `create` とそのキーワードの後の id。
  - create の後で、作った参加者へ行かないメッセージ
    （`The message after create must go to the created participant`）と、
    destroy の後で、消した参加者から来ず、そこへも行かないメッセージ
    （`The message after destroy must come from or go to the destroyed participant`）。
    そのメッセージ。
  - ほかの箱をすでに持つ参加者の、箱の中の参加者の文
    （`A participant cannot be in two boxes`）。
    その文の id。

## 既知の差異

[既知の差異](../../spec/docs/known-divergences.ja.md)で入力を拒否するときは、
`range` は原因の形で、メッセージは原因を示します。

- `directive-as-token-boundary`:
  ディレクティブを含められない単位（矢印、キーワード、文字列など）の内側に、
  ディレクティブがあるときは、`range` はそのディレクティブで、
  メッセージは `Unexpected directive`。
- `click-reserved-word`: クリックの文を始めない `click` では、
  `range` は語 `click` で、メッセージは
  `click is a reserved word: it may only start a click statement`。
  文法は、止まったところでこれを見つけます。
  読めない単位か、その後の `space` でない最初の単位が `click` の単位であるとき、
  そして、文の始まりの `click` の後に click の id がないときです。
  `click A href "u" click _blank` のように、mermaid.js も拒否する入力も、
  同じように報告します。
- `tokenless-empty-forms`: どの規則も取らない空の形では、
  `range` は両端の空白を除いた形の全体です。
  つまり、空の文字列、`call` から `)` までの空の呼び出し、
  `accDescr` から `}` までの空の説明のブロックです。
  メッセージは `An empty string cannot be written here`、
  `An empty call cannot be written here`、
  `An empty description block can only be written where a statement starts`
  のいずれかです。
  文法は、`click` と同じように、止まったところでこれを見つけます。
  読めない単位か、その後の `space` でない最初の単位が、
  空の形に属するときです。
  `A[""]` のように、mermaid.js も拒否する入力も、同じように報告します。
  文の始まりの `click` とその click の id の間では、
  最初の空の文字列を報告します。
  空の文字列の後に click の id がないときは、`click` を報告します。

`html-tag-in-frontmatter` は、どの `"` を `'` として読むかを変えます。
パーサーはそれを区別しないので、そこから起きる拒否は、上の規則で報告します。
