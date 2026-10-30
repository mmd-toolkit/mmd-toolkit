# gitgraph のノード

英語版: [gitgraph.md](./gitgraph.md)

この文書は `gitgraph` のソースの木を定義します。
共有の葉は [ast.md](../ast.md)、
受理条件は [diagrams/gitgraph.md](../diagrams/gitgraph.md) にあります。
値は文字列のエスケープを復号せず、Db の正規化もせず、書かれたまま保ちます。
任意のフィールドは欠けるとき null、リストは空のリストにします。
繰り返した文や option も含め、すべてのリストはソース順です。
以下の子の欄は訪問順を表します。 [fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/header-only] [fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/gram-cherry-pick-repeated-options]
[fixture: gitgraph/lex-string-escapes]

## ノード

### GitgraphDiagram

| フィールド            | 型                          | 意味                     |
| --------------------- | --------------------------- | ------------------------ |
| `direction`           | LR, TB, BT or null          | 見出しに書かれた方向。   |
| `textBeforeHeader`    | list of GitgraphIgnoredText | 見出しの前に残した形。   |
| `textBeforeDirection` | list of GitgraphIgnoredText | 書かれた方向の前の形。   |
| `textBeforeColon`     | list of GitgraphIgnoredText | 分離したコロンの前の形。 |
| `body`                | list of GitgraphBodyItem    | 書かれた文と隠れた形。   |

子の欄: `textBeforeHeader`、`textBeforeDirection`、`textBeforeColon`、`body`。
範囲は、残した最初の見出し前の形、なければ見出しの語から、
最後に書かれた見出し・本文の構成要素までです。
無関係な外側の空白は除きます。
見出しのノード、推定した方向、コロンの有無、
実効タイトルのフィールドは作りません。 [fixture: gitgraph/header-only]
[fixture: gitgraph/header-tb] [fixture: gitgraph/header-colon]
[fixture: gitgraph/header-spaced-colon]
[fixture: gitgraph/lex-yaml-after-comment]
[fixture: gitgraph/header-hidden-before-colon]
[fixture: gitgraph/header-hidden-before-direction]

textBeforeHeader は検出点から残る図固有の隠れた形だけを持ち、
残された YAML と 2 回目の走査のディレクティブも含みます。
検出で通過した裸の `%%` 行は共有 Comment で、このノードではなく、
図の範囲を延ばしません。
一緒に通過した空白・改行は、残した形の間でも trivia として読み直しません。
図固有の隠れた形の境界は、引き続き受理条件です。
[fixture: gitgraph/lex-yaml-after-comment]
[fixture: gitgraph/lex-hidden-directive-second-scan]
[fixture: gitgraph/detect-two-second-scan-forms]
[fixture: gitgraph/detect-bare-brace-eof-header]
[fixture: gitgraph/detect-bare-unclosed-before-header]
[fixture: gitgraph/div-detect-retained-yaml-bare-ls-line]
[fixture: gitgraph/div-lex-preheader-bare-between-retained-unicode]
[fixture: gitgraph/detect-retained-opener-bom]

LR・TB・BT が書かれていなければ direction は null です。
方向が書かれていなければ textBeforeDirection は空です。
分離したコロンがなければ textBeforeColon は空で、
gitGraph に接着したコロンとの間には隙間がありません。
最後の見出しの構成要素の後の隠れた形は body に入れます。
同じ隙間に 2 個の形があれば、 2 個のノードにします。
[fixture: gitgraph/header-only] [fixture: gitgraph/header-colon]
[fixture: gitgraph/header-bt] [fixture: gitgraph/header-hidden-before-colon]
[fixture: gitgraph/header-hidden-before-direction]
[fixture: gitgraph/header-two-hidden-forms]
[fixture: gitgraph/lex-hidden-directive-unknown-content]
[fixture: gitgraph/lex-hidden-directive-before-branch-name]

GitgraphBodyItem は GitgraphCommitStatement、GitgraphBranchStatement、
GitgraphCheckoutStatement、GitgraphMergeStatement、GitgraphCherryPickStatement、
GitgraphTitleStatement、GitgraphAccTitleStatement、GitgraphAccDescrStatement、
GitgraphAccDescrBlockStatement、GitgraphIgnoredText のいずれかです。
空行やコメントだけの行は本文の項目を作りません。
重複する id や共通の文の繰り返しも、別々のソースの出現として保ちます。
[fixture: gitgraph/gram-all-fields] [fixture: gitgraph/db-duplicate-id]
[fixture: gitgraph/common-third-values]
[fixture: gitgraph/comment-before-header]

### GitgraphCommitStatement

| フィールド  | 型                          | 意味                      |
| ----------- | --------------------------- | ------------------------- |
| `options`   | list of commit options      | 書かれたすべての option。 |
| `textAfter` | list of GitgraphIgnoredText | EOL の前の隠れた末尾。    |

options はソース順の GitgraphIdOption、GitgraphMessageOption、
GitgraphTagOption、GitgraphTypeOption です。
子の欄: `options`、`textAfter`。
範囲は commit から最後の option・隠れた末尾まで、なければ語だけで、
EOL は除きます。
空の option リストも有効です。 [fixture: gitgraph/header-commit-inline]
[fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/lex-hidden-directive-commit-eof]

### GitgraphBranchStatement

| フィールド       | 型                          | 意味                   |
| ---------------- | --------------------------- | ---------------------- |
| `textBeforeName` | list of GitgraphIgnoredText | 名前の前の隠れた形。   |
| `name`           | Identifier or StringLiteral | 書かれた分岐名。       |
| `order`          | GitgraphOrderOption or null | 任意の分岐の順序。     |
| `textAfter`      | list of GitgraphIgnoredText | EOL の前の隠れた末尾。 |

子の欄: `textBeforeName`、`name`、`order`、`textAfter`。
範囲は branch から最後の名前・order・末尾の構成要素までで、EOL を除きます。
order がなければ null です。
名前はどちらの引用符でも書け、空や空白だけの引用名も受理します。
実効の比較名で、書かれた形を置き換えません。
[fixture: gitgraph/gram-branch-order] [fixture: gitgraph/gram-branch-empty]
[fixture: gitgraph/gram-branch-whitespace]
[fixture: gitgraph/gram-branch-single-quotes]
[fixture: gitgraph/lex-hidden-directive-before-branch-name]
[fixture: gitgraph/lex-branch-between-name-order-hidden]

### GitgraphCheckoutStatement

| フィールド         | 型                          | 意味                   |
| ------------------ | --------------------------- | ---------------------- |
| `keyword`          | checkout or switch          | 書かれた別名。         |
| `textBeforeBranch` | list of GitgraphIgnoredText | 名前の前の隠れた形。   |
| `branch`           | Identifier or StringLiteral | 書かれた分岐の参照。   |
| `textAfter`        | list of GitgraphIgnoredText | EOL の前の隠れた末尾。 |

子の欄: `textBeforeBranch`、`branch`、`textAfter`。
範囲は checkout または switch から分岐か最後の隠れた末尾までで、
EOL を除きます。
keyword は書かれた別名を保ち、子にはしません。 [fixture: gitgraph/gram-checkout]
[fixture: gitgraph/gram-switch]
[fixture: gitgraph/lex-hidden-directive-before-checkout-name]
[fixture: gitgraph/lex-hidden-directive-checkout-eof]

### GitgraphMergeStatement

| フィールド         | 型                          | 意味                      |
| ------------------ | --------------------------- | ------------------------- |
| `textBeforeBranch` | list of GitgraphIgnoredText | 元の分岐の前の隠れた形。  |
| `branch`           | Identifier or StringLiteral | 書かれた元の分岐。        |
| `options`          | list of merge options       | 書かれたすべての option。 |
| `textAfter`        | list of GitgraphIgnoredText | EOL の前の隠れた末尾。    |

options は GitgraphIdOption、GitgraphTagOption、GitgraphTypeOption です。
子の欄: `textBeforeBranch`、`branch`、`options`、`textAfter`。
範囲は merge から最後の分岐・option・末尾の構成要素までで、EOL を除きます。
id や type の繰り返しは別々に保ちます。 [fixture: gitgraph/gram-merge-options]
[fixture: gitgraph/gram-merge-repeated-options]
[fixture: gitgraph/lex-hidden-directive-before-merge-name]
[fixture: gitgraph/lex-hidden-directive-merge-eof]

### GitgraphCherryPickStatement

| フィールド  | 型                          | 意味                      |
| ----------- | --------------------------- | ------------------------- |
| `options`   | list of cherry-pick options | 書かれたすべての option。 |
| `textAfter` | list of GitgraphIgnoredText | EOL の前の隠れた末尾。    |

options は GitgraphIdOption、GitgraphParentOption、GitgraphTagOption です。
子の欄: `options`、`textAfter`。
範囲は cherry-pick から最後の option・隠れた末尾までで、EOL を除きます。
文法上は option がなくても表せますが、意味上の受理には元の実効 id が必要です。
[fixture: gitgraph/gram-cherry-pick-repeated-options]
[fixture: gitgraph/lex-hidden-directive-cherry-pick-eof]
[fixture: gitgraph/db-cherry-pick-missing]

### GitgraphIdOption

| フィールド        | 型                          | 意味                   |
| ----------------- | --------------------------- | ---------------------- |
| `textBefore`      | list of GitgraphIgnoredText | この option の前の形。 |
| `textBeforeValue` | list of GitgraphIgnoredText | 導入部の後の形。       |
| `value`           | StringLiteral               | 書かれた id の値。     |

子の欄: `textBefore`、`textBeforeValue`、`value`。
範囲は textBefore の最初の形、なければ `id` の語から、値を閉じる引用符までです。
textBefore は直前の構成要素とこの option の間、
textBeforeValue は完全な導入部の後の隠れた形を持ちます。
該当する形がなければ空です。 [fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/lex-hidden-directive-between-option-value]
[fixture: gitgraph/lex-option-between-options-hidden]

StringLiteral は引用符つきのソースを raw、書かれた内部を value に保ち、
エスケープを復号しません。
closed は true です。
空の値も StringLiteral ノードとして保ちます。
[fixture: gitgraph/gram-commit-empty-values]
[fixture: gitgraph/lex-string-escapes]

### GitgraphMessageOption

| フィールド        | 型                          | 意味                                 |
| ----------------- | --------------------------- | ------------------------------------ |
| `textBefore`      | list of GitgraphIgnoredText | この option の前の形。               |
| `keyword`         | msg or null                 | 明示した導入の語、または裸の文字列。 |
| `textBeforeValue` | list of GitgraphIgnoredText | 導入部の後の形。                     |
| `value`           | StringLiteral               | 書かれた message の値。              |

子の欄: `textBefore`、`textBeforeValue`、`value`。
範囲は textBefore の最初の形、なければ option の語か開始の引用符から、
値の終わりまでです。
textBefore は直前の構成要素とこの option の間、
textBeforeValue は完全な導入部の後の隠れた形を持ちます。
該当する形がなければ空です。 [fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/lex-option-before-message-hidden]
[fixture: gitgraph/lex-hidden-between-id-message-global-control]

明示した `msg:` なら keyword は msg、裸の文字列なら null です。
導入部がなければ textBeforeValue は空で、
引用符の前の隠れた形は textBefore に入れます。
どちらの形も、繰り返した message も別々の option として保ちます。
[fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/lex-option-before-message-hidden]
[fixture: gitgraph/lex-hidden-between-id-message-global-control]

### GitgraphTagOption

| フィールド        | 型                          | 意味                   |
| ----------------- | --------------------------- | ---------------------- |
| `textBefore`      | list of GitgraphIgnoredText | この option の前の形。 |
| `textBeforeValue` | list of GitgraphIgnoredText | 導入部の後の形。       |
| `value`           | StringLiteral               | 書かれた tag の値。    |

子の欄: `textBefore`、`textBeforeValue`、`value`。
範囲は textBefore の最初の形、なければ `tag` の語から、
値を閉じる引用符までです。
textBefore は直前の構成要素とこの option の間、
textBeforeValue は完全な導入部の後の隠れた形を持ちます。
該当する形がなければ空です。 [fixture: gitgraph/gram-cherry-pick-tags]
[fixture: gitgraph/gram-commit-empty-values]
[fixture: gitgraph/lex-option-between-options-hidden]

StringLiteral は引用符つきのソースを raw、書かれた内部を value に保ち、
エスケープを復号しません。
closed は true です。
空の値も StringLiteral ノードとして保ちます。
[fixture: gitgraph/gram-commit-empty-values]
[fixture: gitgraph/lex-string-escapes]

### GitgraphTypeOption

| フィールド        | 型                           | 意味                   |
| ----------------- | ---------------------------- | ---------------------- |
| `textBefore`      | list of GitgraphIgnoredText  | この option の前の形。 |
| `textBeforeValue` | list of GitgraphIgnoredText  | 導入部の後の形。       |
| `value`           | NORMAL, REVERSE or HIGHLIGHT | 書かれた type の値。   |

子の欄: `textBefore`、`textBeforeValue`。
範囲は textBefore の最初の形、なければ `type` の語から、
書かれた `NORMAL`・`REVERSE`・`HIGHLIGHT` の語の終わりまでです。
textBefore は直前の構成要素とこの option の間、
textBeforeValue は完全な導入部の後の隠れた形を持ちます。
該当する形がなければ空です。 [fixture: gitgraph/gram-merge-repeated-options]
[fixture: gitgraph/lex-option-before-type-value-hidden]
[fixture: gitgraph/lex-option-type-hidden-tail]

value は書かれた固定のキーワードで、
数値の Db の type でも子ノードでもありません。
ほかの綴りは認めません。 [fixture: gitgraph/gram-commit-type-lowercase]
[fixture: gitgraph/gram-commit-type-unknown]
[fixture: gitgraph/lex-type-longer-reference-control]
[fixture: gitgraph/gram-all-fields]

### GitgraphParentOption

| フィールド        | 型                          | 意味                   |
| ----------------- | --------------------------- | ---------------------- |
| `textBefore`      | list of GitgraphIgnoredText | この option の前の形。 |
| `textBeforeValue` | list of GitgraphIgnoredText | 導入部の後の形。       |
| `value`           | StringLiteral               | 書かれた parent の値。 |

子の欄: `textBefore`、`textBeforeValue`、`value`。
範囲は textBefore の最初の形、なければ `parent` の語から、
値を閉じる引用符までです。
textBefore は直前の構成要素とこの option の間、
textBeforeValue は完全な導入部の後の隠れた形を持ちます。
該当する形がなければ空です。 [fixture: gitgraph/gram-cherry-pick-merge-parent]
[fixture: gitgraph/gram-cherry-pick-repeated-options]
[fixture: gitgraph/lex-parent-global-before-colon]

StringLiteral は引用符つきのソースを raw、書かれた内部を value に保ち、
エスケープを復号しません。
closed は true です。
空の値も StringLiteral ノードとして保ちます。
[fixture: gitgraph/gram-cherry-pick-empty-parent]
[fixture: gitgraph/gram-cherry-pick-merge-parent]

### GitgraphOrderOption

| フィールド        | 型                          | 意味                   |
| ----------------- | --------------------------- | ---------------------- |
| `textBefore`      | list of GitgraphIgnoredText | この option の前の形。 |
| `textBeforeValue` | list of GitgraphIgnoredText | 導入部の後の形。       |
| `value`           | NumericLiteral              | 書かれた order の値。  |

子の欄: `textBefore`、`textBeforeValue`、`value`。
範囲は textBefore の最初の形、なければ `order` の語から、
値の最後の数字までです。
textBefore は直前の構成要素とこの option の間、
textBeforeValue は完全な導入部の後の隠れた形を持ちます。
該当する形がなければ空です。 [fixture: gitgraph/gram-branch-order]
[fixture: gitgraph/lex-branch-between-name-order-hidden]
[fixture: gitgraph/lex-hidden-directive-before-order]
[fixture: gitgraph/number-overflow]

NumericLiteral は書かれた数字をすべて raw に保ち、
value は精度の損失や桁あふれを含めた共有の倍精度数です。
実効の分岐の順序に置き換えません。 [fixture: gitgraph/number-zero]
[fixture: gitgraph/number-precision] [fixture: gitgraph/number-overflow]

### 文の隙間の所有

後の option の前の隠れた形は、分岐名と order の間も含め、
その option の textBefore に入れます。
最後の option・名前の後から読み飛ばされない EOL までは、文の textAfter、
その EOL の後は本文の項目です。
同じ出現を複製しません。
図固有のコメントは共有 Comment です。
裸の分岐の参照は Identifier、引用した参照は StringLiteral に持ち、
エスケープを復号しません。 [fixture: gitgraph/lex-option-between-options-hidden]
[fixture: gitgraph/lex-branch-between-name-order-hidden]
[fixture: gitgraph/lex-hidden-directive-commit-eof]
[fixture: gitgraph/lex-hidden-directive-before-branch-name]
[fixture: gitgraph/comment-commit-glued]
[fixture: gitgraph/gram-branch-single-quotes]
[fixture: gitgraph/lex-reference-shape]

### GitgraphTitleStatement

| フィールド  | 型                          | 意味                   |
| ----------- | --------------------------- | ---------------------- |
| `value`     | GitgraphLiteral or null     | 書かれた共通の値。     |
| `textAfter` | list of GitgraphIgnoredText | EOL の前の隠れた末尾。 |

value は、title とちょうど 1 個の ASCII の空白かタブの後から、
行の値の終わりまでで、残りの空白はすべて保ちます。
区切りがない場合や区切りの後に内容がなければ null です。
[fixture: gitgraph/lex-title-bare-hidden-tail]
[fixture: gitgraph/lex-title-tab-hidden-tail] [fixture: gitgraph/title-tab]
[fixture: gitgraph/title-conversion]
[fixture: gitgraph/common-title-only-whitespace]

子の欄: `value`、`textAfter`。
範囲は title から値の最後の文字まで、
空の形ならそれを完了する語・コロン・閉じ波括弧までです。
textAfter があれば最後の形まで延ばし、EOL と無関係な外側の空白は除きます。
読み飛ばされない EOL の後の隠れた形は、末尾ではなく本文の項目です。
繰り返した共通の文や空の文も残します。
[fixture: gitgraph/lex-title-bare-hidden-tail]
[fixture: gitgraph/lex-title-tab-hidden-tail] [fixture: gitgraph/title-tab]
[fixture: gitgraph/title-conversion]
[fixture: gitgraph/common-title-only-whitespace]
[fixture: gitgraph/common-third-values]
[fixture: gitgraph/lex-hidden-directive-title-eof]

### GitgraphAccTitleStatement

| フィールド  | 型                          | 意味                   |
| ----------- | --------------------------- | ---------------------- |
| `value`     | GitgraphLiteral or null     | 書かれた共通の値。     |
| `textAfter` | list of GitgraphIgnoredText | EOL の前の隠れた末尾。 |

value はコロンの直後から行の値の終わりまでで、両端の空白も含めます。
内容がない場合だけ null で、空白だけでもリテラルです。
[fixture: gitgraph/lex-acctitle-empty-hidden-tail]
[fixture: gitgraph/common-acctitle-only-whitespace]
[fixture: gitgraph/acctitle-unicode-trim]

子の欄: `value`、`textAfter`。
範囲は accTitle から値の最後の文字まで、
空の形ならそれを完了する語・コロン・閉じ波括弧までです。
textAfter があれば最後の形まで延ばし、EOL と無関係な外側の空白は除きます。
読み飛ばされない EOL の後の隠れた形は、末尾ではなく本文の項目です。
繰り返した共通の文や空の文も残します。
[fixture: gitgraph/lex-acctitle-empty-hidden-tail]
[fixture: gitgraph/common-acctitle-only-whitespace]
[fixture: gitgraph/acctitle-unicode-trim]
[fixture: gitgraph/common-third-values]
[fixture: gitgraph/lex-hidden-directive-acctitle-eof]

### GitgraphAccDescrStatement

| フィールド  | 型                          | 意味                   |
| ----------- | --------------------------- | ---------------------- |
| `value`     | GitgraphLiteral or null     | 書かれた共通の値。     |
| `textAfter` | list of GitgraphIgnoredText | EOL の前の隠れた末尾。 |

value はコロンの直後から行の値の終わりまでで、両端の空白も含めます。
内容がない場合だけ null で、空白だけでもリテラルです。
[fixture: gitgraph/lex-description-line-null]
[fixture: gitgraph/common-accdescr-only-whitespace]
[fixture: gitgraph/accdescr-unicode-trim]

子の欄: `value`、`textAfter`。
範囲は accDescr から値の最後の文字まで、
空の形ならそれを完了する語・コロン・閉じ波括弧までです。
textAfter があれば最後の形まで延ばし、EOL と無関係な外側の空白は除きます。
読み飛ばされない EOL の後の隠れた形は、末尾ではなく本文の項目です。
繰り返した共通の文や空の文も残します。
[fixture: gitgraph/lex-description-line-null]
[fixture: gitgraph/common-accdescr-only-whitespace]
[fixture: gitgraph/accdescr-unicode-trim]
[fixture: gitgraph/common-third-values]
[fixture: gitgraph/lex-hidden-directive-accdescr-eof]

### GitgraphAccDescrBlockStatement

| フィールド  | 型                          | 意味                   |
| ----------- | --------------------------- | ---------------------- |
| `value`     | GitgraphLiteral or null     | 書かれた共通の値。     |
| `textAfter` | list of GitgraphIgnoredText | EOL の前の隠れた末尾。 |

value は波括弧の内部で、両端だけの共通の空白を除きます。
空白と共通の trivia だけなら null です。
内部の字下げ、物理的な改行、引用符、逆斜線は書かれたまま保ちます。
最初の閉じ波括弧は必須なので、 closed フィールドは不要です。
[fixture: gitgraph/lex-description-empty-hidden-tail]
[fixture: gitgraph/accdescr-block]
[fixture: gitgraph/common-block-only-whitespace]
[fixture: gitgraph/lex-description-block-only-directive]
[fixture: gitgraph/lex-description-block-only-comment]

子の欄: `value`、`textAfter`。
範囲は accDescr から値の最後の文字まで、
空の形ならそれを完了する語・コロン・閉じ波括弧までです。
textAfter があれば最後の形まで延ばし、EOL と無関係な外側の空白は除きます。
読み飛ばされない EOL の後の隠れた形は、末尾ではなく本文の項目です。
繰り返した共通の文や空の文も残します。
[fixture: gitgraph/lex-description-empty-hidden-tail]
[fixture: gitgraph/accdescr-block]
[fixture: gitgraph/common-block-only-whitespace]
[fixture: gitgraph/lex-description-block-only-directive]
[fixture: gitgraph/lex-description-block-only-comment]
[fixture: gitgraph/common-third-values]
[fixture: gitgraph/lex-hidden-directive-block-eof]

### GitgraphLiteral

| フィールド | 型     | 意味                         |
| ---------- | ------ | ---------------------------- |
| `value`    | string | 書かれた共通の値のテキスト。 |

子の欄はありません。
範囲は文が定義する値の最初から最後のソースの文字までで、
内部の共通の trivia をまたぎます。
value から共通のディレクティブ、コメント領域、選択されたセミコロンを除き、
文が所有する空白を含め、それ以外のソースのテキストをすべて保ちます。
null に空のリテラルは作りません。
引用符もリテラルの内容で、 StringLiteral ではありません。
[fixture: gitgraph/common-title-quoted-escape]
[fixture: gitgraph/common-title-open-quote] [fixture: gitgraph/directive-title]
[fixture: gitgraph/comment-block] [fixture: gitgraph/title-conversion]
[fixture: gitgraph/style-acctitle] [fixture: gitgraph/lex-description-line-null]

### GitgraphIgnoredText

| フィールド | 型                      | 意味                           |
| ---------- | ----------------------- | ------------------------------ |
| `kind`     | yaml-block or directive | 隠れた形の種類。               |
| `value`    | string                  | 囲みを含む空でない書かれた形。 |

子の欄はありません。
範囲は認識した `---` または `%%{` の開始から、選んだ閉じまでです。
直前の任意の ASCII の空白と、閉じの直後に消費した LF は除きます。
内部の書かれた改行、LS・PS、空白は保ちます。
追加する LF を範囲や値に含めません。
空の本文も、囲みのテキストは空ではありません。
[fixture: gitgraph/lex-yaml-empty-body]
[fixture: gitgraph/lex-yaml-three-adjacent-fences]
[fixture: gitgraph/lex-yaml-body-ls-ps]
[fixture: gitgraph/lex-hidden-directive-commit-eof]
[fixture: gitgraph/lex-hidden-yaml-block-eof]
[fixture: gitgraph/lex-hidden-directive-commit-closing-space]

隠れた YAML は yaml-block、隠れた DIRECTIVE は directive です。
value では内部の共通のディレクティブ・コメント領域・選択されたセミコロンを除き、
範囲はそれらをまたぎます。
YAML のプロパティを持たず、
ルートのフロントマターやディレクティブにもなりません。
内部の共通のディレクティブは、共通の効果を保ちます。
先に始まった文字列・共通のブロックでは、隠れた形に見える部分も内容です。
行の値は YAML に見える形を持ちますが、`%%` の前で終わるので、
その隠れた形は textAfter に入る場合があります。
一致せず図固有のコメントに戻る形は、共有 Comment です。
[fixture: gitgraph/lex-hidden-yaml-global-directive-body]
[fixture: gitgraph/lex-hidden-yaml-global-comment-body]
[fixture: gitgraph/lex-hidden-directive-global-comment-body]
[fixture: gitgraph/lex-yaml-common-init-effect]
[fixture: gitgraph/lex-hidden-directive-common-init-effect]
[fixture: gitgraph/lex-hidden-directive-string]
[fixture: gitgraph/lex-hidden-directive-block]
[fixture: gitgraph/lex-hidden-yaml-after-title]
[fixture: gitgraph/lex-title-bare-hidden-tail]
[fixture: gitgraph/lex-hidden-directive-fallback-complete-statement]
