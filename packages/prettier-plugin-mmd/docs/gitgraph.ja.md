# Gitgraph formatting rules

English version: [gitgraph.md](./gitgraph.md)

決定した 26 項目を、書かれた AST から実装する整形規則です。
実行時に Mermaid を呼ばず、出力を再解析しません。
不可視文字はエスケープした固定テストに置きます。

## Rules

### Header

正確な `gitGraph` と書かれた方向を保持します。
方向は Db に影響します。
通常の隙間は `gitGraph LR:` または `gitGraph` とし、
見出し上の最初の文を次行へ移します。
方向のない見出しのコロンは、mermaid.js の文書の書き方に合わせて除きます。
文書は、コロンのない見出しを 30 回、コロンつきを 2 回書いています。
`gitGraph:` は `gitGraph` と印字し、対象にする版はどれも、
この 2 つの形を同じに読み、同じに描きます。
方向の後のコロンは残します。
mermaid.js はコロンのない `gitGraph LR` を拒否するためです。
ディレクティブが前にあるコロンも残します。
対象にする版のうち、コロンのない見出しの次の行に文が続くと拒否し、
コロンがあれば受理するものがあるためです。
詳しくは [ヘッダーの後のコロン](./compatibility.ja.md#ヘッダーの後のコロン)
を参照してください。
残す版は
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
の表にあります。
ディレクティブは、それがないときの隙間の空白の後に置きます。
コロンの前の隙間に空白はないので、
`gitGraph %%{x}%%:` は `gitGraph%%{x}%%:` と印字します。
[ディレクティブ](./flowchart.ja.md#ディレクティブ)の規則に従います。
[fixture: gitgraph/header/header-directive-before-colon-kept]
隠れた YAML ブロックが前にあるコロンは、ほかのコロンと同じく除きます。
対象にする版は、コロンの有無にかかわらず見出しを同じに読むか、
どちらも拒否するためです。
`gitGraph ---`、ブロック、`--- :` は、`---` のままコロンなしで印字します。
[fixture: gitgraph/header/header-yaml-before-colon]
ブロックの後の、単独の行にあるコロンは、その前の改行と一緒に除くので、
空の行は残りません。
[fixture: gitgraph/header/header-yaml-colon-on-its-own-line]
[corpus fixture: gitgraph/header-hidden-before-colon]
隠れた形の隙間と保護された見出し・本文の境界は保持します。

`gitGraph` と方向の間にある隠れた形は、直後の改行を取り、
その後の隙間を動かすと入力が拒否されることがあるため、
その隙間を書かれたまま保持します（詳しくは、
[隠れた DIRECTIVE と行末](../../spec/docs/diagrams/gitgraph.ja.md#隠れた-directive-と行末)
を参照）。
その前の隙間は通常の隙間で、空白 1 つになります。
`gitGraph  %%{}%%  LR:` は `gitGraph %%{}%%  LR:` と印字します。
[fixture: gitgraph/header/hidden-before-direction]
[corpus fixture: gitgraph/header-hidden-before-direction]

固定例: [fixture: gitgraph/header/header-absent]
[fixture: gitgraph/header/header-colon]
[fixture: gitgraph/header/header-colon-comment]
[fixture: gitgraph/header/header-colon-hidden-statement]
[fixture: gitgraph/header/header-colon-directive-line]
[fixture: gitgraph/header/header-colon-tab-blank-lines]
[fixture: gitgraph/header/header-hidden-before-colon]
[fixture: gitgraph/header/header-lr] [fixture: gitgraph/header/header-tb]
[fixture: gitgraph/header/header-bt]
[corpus fixture: gitgraph/spec-git-graph-851bf4f9]
[fixture: gitgraph/header/hidden-touching]

入力（エスケープ表記）: `"  gitGraph\t\ncommit\n"`

出力
([header/header-absent-output.mmd](../tests/fixtures/gitgraph/header/header-absent-output.mmd)):

```mmd
gitGraph
  commit
```

### Indentation

見出しは第 1 列、
通常の本文の文・独立コメント・大域的なディレクティブは設定した 1
段下に置きます。
履歴は平坦なので branch の後に段を増やしません。
gitgraph の列に文法上の意味がないため、`tabWidth: 0` は空白 0 個、
`useTabs` は幅 0 でもタブ 1 個です。
その他の値の続きの列・隠れた形の閉じ・保護部分は変えません。

固定例: [fixture: gitgraph/indentation/indent-two]
[fixture: gitgraph/indentation/indent-four]
[fixture: gitgraph/indentation/indent-zero]
[fixture: gitgraph/indentation/tabs-normal]
[fixture: gitgraph/indentation/zero-tabs]

入力（エスケープ表記）:
`"gitGraph\ncommit\n      branch b\ncommit\nswitch main\n"`

出力
([indentation/indent-two-output.mmd](../tests/fixtures/gitgraph/indentation/indent-two-output.mmd)):

```mmd
gitGraph
  commit
  branch b
  commit
  checkout main
```

### Statements one per line

通常の本文の文は、ほかの図種と同じく 1 行ずつ印字します。
共通の行値に見かけの操作語やセミコロンがあっても値のままです。
引用符内のセミコロンも文字です。
gitgraph に区切りのセミコロンはありません。
不正な隣接文やブロック後のセミコロンはコーパスで拒否を検査し、修復しません。

固定例: [fixture: gitgraph/statements-one-per-line/eol-header-inline]
[fixture: gitgraph/statements-one-per-line/eol-title-owns-text]
[fixture: gitgraph/statements-one-per-line/eol-values-semicolon]

入力（エスケープ表記）: `"gitGraph:commit id:\"a\"\n"`

出力
([statements-one-per-line/eol-header-inline-output.mmd](../tests/fixtures/gitgraph/statements-one-per-line/eol-header-inline-output.mmd)):

```mmd
gitGraph
  commit id: "a"
```

### Blank lines

通常の連続空行は 1 行にし、文書と本文の端の通常空行は削除します。
コメントの前後にも同じ規則を使い、作者の区切りを残します。
引用値・説明ブロック・ディレクティブと隠れた形の内部と、
保持する前置部分の空行は、値や字句上の役割に属するため保持します。
隠れた形が LF を消費した後は、次の文に必要なときだけ予備の LF 1 つを保ちます。
文書の終わりは設定の終端改行1つにし、見出しの直後の空行は削除します。
見出しと最初の文の間に EOL は必要ありません。
それ以外は予備の LF の後に通常の空行の規則を適用し、連続空行を1行、
空白だけの行を空行にします。
予備の LF は文法の要件で、それ以降はコメントの後と同じ作者の区切りです。

隠れた形の境界やセミコロンの保護で文が見出しの行に残っても、
その文の後置隠れた形の後は文と文の間として扱います。

[fixture: gitgraph/blank-lines/hidden-following-blanks]

[fixture: gitgraph/blank-lines/header-statement-hidden]

[fixture: gitgraph/blank-lines/header-statement-semicolon]

[fixture: gitgraph/blank-lines/hidden-document-end]

[fixture: gitgraph/blank-lines/hidden-body-end]

[fixture: gitgraph/blank-lines/hidden-header-blanks]

固定例: [fixture: gitgraph/blank-lines/blank-collapse]
[fixture: gitgraph/blank-lines/blank-comment]
[fixture: gitgraph/blank-lines/blank-string-kept]
[fixture: gitgraph/blank-lines/block-and-directive]

入力（エスケープ表記）: `"\ngitGraph\n\n\ncommit\n \t\n\ncommit\n\n"`

出力
([blank-lines/blank-collapse-output.mmd](../tests/fixtures/gitgraph/blank-lines/blank-collapse-output.mmd)):

```mmd
gitGraph
  commit

  commit
```

### Operation spacing

通常の操作語・参照・オプションの間は、接していても空白 1 個にします。
桁揃えはしません。
部品を一定の形で印字し、引用符なしの名前に必要な境界を残します。
コメント・大域的なディレクティブ・隠れた形を含む隙間は、
接触と物理境界を保持します。

固定例: [corpus fixture: gitgraph/gram-commit-glued-options]
[fixture: gitgraph/operation-spacing/gap-branch-quoted]
[fixture: gitgraph/operation-spacing/gap-branch-bare]
[fixture: gitgraph/operation-spacing/gap-merge]
[fixture: gitgraph/operation-spacing/touching-message-tag]

入力（エスケープ表記）: `"gitGraph commit\"note\"tag:\"v\"\n"`

出力
([operation-spacing/touching-message-tag-output.mmd](../tests/fixtures/gitgraph/operation-spacing/touching-message-tag-output.mmd)):

```mmd
gitGraph
  commit "note" tag: "v"
```

### Option colons

`id: "A"`、`msg: "M"`、`tag: "T"`、`type: NORMAL`、`parent: "A"`、
`order: 2` と印字します。
コロンは語に接し、通常の値の前は空白 1 個です。
このコロンはキーのコロンで、オプションが語に値を 1 つ与え、
繰り返したオプションは値を置き換えます。
詳しくは
[コロンがどの種類かの決め方](./printed-form.ja.md#コロンがどの種類かの決め方)
の手順 2 を参照してください。
語とコロンの間の注釈は、
大域的なディレクティブや選ばれたセミコロンも含めて残します。
その位置の通常の空白は不正です。

固定例: [fixture: gitgraph/option-colons/colon-commit]
[fixture: gitgraph/option-colons/colon-order]
[corpus fixture: gitgraph/lex-option-global-before-colon]
[corpus fixture: gitgraph/lex-selected-semicolon-option-word-colon]

入力（エスケープ表記）:
`"gitGraph\ncommit id:\"A\" msg:\t\"M\" tag:  \"T\" type:HIGHLIGHT\n"`

出力
([option-colons/colon-commit-output.mmd](../tests/fixtures/gitgraph/option-colons/colon-commit-output.mmd)):

```mmd
gitGraph
  commit id: "A" msg: "M" tag: "T" type: HIGHLIGHT
```

### Order and repetitions

上書きされた id・type・メッセージ、反復や空の tag を含め、
オプションと文のすべての出現を原順序で印字します。
並べ替えたりスカラーを最終値だけに減らしたりしません。
解決後の履歴からは作者の出現列が失われ、
スカラー・tag・文の順序は Db にも影響します。

固定例: [fixture: gitgraph/order-and-repetitions/order-reverse-id]
[fixture: gitgraph/order-and-repetitions/order-reverse-type]
[fixture: gitgraph/order-and-repetitions/order-reverse-tags]
[fixture: gitgraph/order-and-repetitions/order-dedup-tags]
[corpus fixture: gitgraph/gram-merge-repeated-options]
[corpus fixture: gitgraph/db-overwritten-invalid-merge-id]
[fixture: gitgraph/order-and-repetitions/order-statements]

入力（エスケープ表記）: `"gitGraph\ncommit tag:\"x\" tag:\"x\"\n"`

出力
([order-and-repetitions/order-dedup-tags-output.mmd](../tests/fixtures/gitgraph/order-and-repetitions/order-dedup-tags-output.mmd)):

```mmd
gitGraph
  commit tag: "x" tag: "x"
```

### Messages

導入語のない引用メッセージと明示した `msg:` の形を保持します。
空値や反復も保持します。
導入の形は作者の構文です。
Db の要約にメッセージ本文がなくても、一致を理由に変更や削除はしません。

固定例: [fixture: gitgraph/messages/message-forms]
[fixture: gitgraph/messages/message-empty]

入力（エスケープ表記）:
`"gitGraph\ncommit \"bare\" msg:\"explicit\" \"last\"\n"`

出力
([messages/message-forms-output.mmd](../tests/fixtures/gitgraph/messages/message-forms-output.mmd)):

```mmd
gitGraph
  commit "bare" msg: "explicit" "last"
```

### Quotes

`StringLiteral` は完全な原文の範囲で印字し、エスケープを変えません。
`'` で囲まれた文字列は、内容に `'`、`"`、バックスラッシュ、改行、
バッククォート、`&`、`#`、`<` がない限り、`"` で囲んで印字します。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
`singleQuote` は読みません。
それ以外の再エンコードにはエスケープと前処理の新たな判断が必要で、
作者の書き方も失われるためです。

固定例: [fixture: gitgraph/quotes/quotes-one-form]
[corpus fixture: gitgraph/lex-string-escapes]
[fixture: gitgraph/quotes/single-quote-option]
[fixture: gitgraph/quotes/single-quote-sensitive-kept]

入力（エスケープ表記）: `"gitGraph\ncommit id:'A' msg:\"a'b\" tag:'a\"b'\n"`

出力
([quotes/quotes-one-form-output.mmd](../tests/fixtures/gitgraph/quotes/quotes-one-form-output.mmd)):

```mmd
gitGraph
  commit id: "A" msg: "a'b" tag: 'a"b'
```

### References

branch・checkout・merge の引用符で囲んだ参照は、
対象にするすべての版の字句解析器が引用符なしでも全体を読む場合、
mermaid.js の文書の例と同じく引用符なしで印字します。
（[テキストの引用符](./compatibility.ja.md#テキストの引用符)を参照）。
`branch "dev"` は `branch dev` と印字します。
引用符なしで読める参照は、ASCII の英字、数字、`_` と、その間の `-`、`.`、
`/` からなり、ASCII の英字か `_` で始まるもので、
対象にする版のどれかが別のものとして読む名前を除きます。
その名前は次のとおりです。
`gitGraph`、`HIGHLIGHT`、`REVERSE`、`NORMAL`、`LR`、`TB` は、
大文字小文字を問わず、それだけの場合と、
語の一部でない文字の前の場合です（`lr-x`）。
`commit`、`branch`、`merge`、`cherry-pick`、`checkout`、`options` は、
大文字小文字を問わず、名前の全体がそれである場合です。
`switch` と `BT` は書かれたとおりの場合で、`title` で始まる名前も除きます。
そのため、`"commit-x"`、`"Title"`、`"bt"` は引用符を除き、`"Merge"`、`"lr-x"`、
`"switch"`、`"title1"` は引用符を残します。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
ほかの参照は引用符を残します。
文字列は引用符のとおり `"` で囲んで印字します。
空・空白のみ・Unicode・予約語・数字風の引用名もそのままです。
[fixture: references/plain-names-without-quotes]
[fixture: references/names-next-to-a-keyword-without-quotes]
[fixture: references/names-that-need-quotes]

固定例: [fixture: gitgraph/references/reference-forms]
[corpus fixture: gitgraph/lex-reference-reserved-quoted]
[corpus fixture: gitgraph/lex-reference-integer-quoted]
[fixture: gitgraph/references/reference-empty]

入力（エスケープ表記）:
`"gitGraph\nbranch a_b-c/d.e\nbranch \"titleA\"\ncheckout a_b-c/d.e\n"`

出力
([references/reference-forms-output.mmd](../tests/fixtures/gitgraph/references/reference-forms-output.mmd)):

```mmd
gitGraph
  branch a_b-c/d.e
  branch "titleA"
  checkout a_b-c/d.e
```

### Authored values

文字列と参照の両端・内部の空白、タブ、物理改行、Unicode、大小文字、エスケープ、
HTML、entity を保持します。
空値も leaf のままです。
これらは同一性・参照による検索・tag の値に影響します。
変換後の Db から再構築せず、エスケープを JavaScript として解釈しません。
物理 CR の変換は別途埋め込み先が行います。

固定例: [fixture: gitgraph/authored-values/inner-padding-change]
[fixture: gitgraph/authored-values/inner-runs-change]
[fixture: gitgraph/authored-values/inner-case-change]
[fixture: gitgraph/authored-values/inner-escape-spelling]
[corpus fixture: gitgraph/html-all-texts]
[corpus fixture: gitgraph/entity-all-fields]
[corpus fixture: gitgraph/db-compare-whitespace-id-lookups]

入力（エスケープ表記）: `"gitGraph\ncommit id:\" A \" tag:\" T \"\n"`

出力
([authored-values/inner-padding-change-output.mmd](../tests/fixtures/gitgraph/authored-values/inner-padding-change-output.mmd)):

```mmd
gitGraph
  commit id: " A " tag: " T "
```

### Order numbers

order の符号なし整数は、0、精度を失う整数、桁あふれも書かれた桁を保持します。
作者の値は変換後の倍精度浮動小数点数でなく `NumericLiteral` の原文です。
order を使って branch を並べ替えません。
不正な符号・先頭 0・小数・指数形はコーパスの拒否例です。

固定例: [corpus fixture: gitgraph/number-zero]
[corpus fixture: gitgraph/number-precision]
[corpus fixture: gitgraph/number-overflow]
[fixture: gitgraph/order-numbers/precision-digits]

入力（エスケープ表記）: `"gitGraph:branch release order:9007199254740993\n"`

出力
([order-numbers/precision-digits-output.mmd](../tests/fixtures/gitgraph/order-numbers/precision-digits-output.mmd)):

```mmd
gitGraph
  branch release order: 9007199254740993
```

### Keyword case

操作語・見出しと `NORMAL`・`REVERSE`・`HIGHLIGHT` を正確な綴りで保持します。
他の大小文字は拒否されるので、別名を作りません。

固定例: [fixture: gitgraph/keyword-case/type-uppercase]

入力（エスケープ表記）:
`"gitGraph\ncommit type:NORMAL\ncommit type:REVERSE\ncommit type:HIGHLIGHT\n"`

出力
([keyword-case/type-uppercase-output.mmd](../tests/fixtures/gitgraph/keyword-case/type-uppercase-output.mmd)):

```mmd
gitGraph
  commit type: NORMAL
  commit type: REVERSE
  commit type: HIGHLIGHT
```

### Checkout aliases

`switch` は、後続 commit との位置を保ち、`checkout` と印字します。
履歴への効果は同じで、mermaid.js の文書の例では `checkout` を 160 回使い、
`switch` は一度も使っていないためです。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
未知の branch はどちらの語でも拒否します。

固定例: [fixture: gitgraph/checkout-aliases/alias-one-form]

入力（エスケープ表記）: `"gitGraph\nbranch b\nswitch main\ncheckout b\n"`

出力
([checkout-aliases/alias-one-form-output.mmd](../tests/fixtures/gitgraph/checkout-aliases/alias-one-form-output.mmd)):

```mmd
gitGraph
  branch b
  checkout main
  checkout b
```

### Cherry pick options

cherry-pick の id・parent・tag を原順序で残し、
通常の操作語とコロンの空白規則を適用します。
上書き前の不正参照、空 parent、反復や空の tag も残します。
`id` は元コミットを指し、空 tag の削除は既定 tag を復活させ Db を変えます。
マージ元のコミットの `parent` の条件は受理側の責務です。

固定例: [fixture: gitgraph/cherry-pick-options/cherry-spacing]
[corpus fixture: gitgraph/gram-cherry-pick-repeated-options]
[corpus fixture: gitgraph/gram-cherry-pick-merge-parent]
[corpus fixture: gitgraph/gram-cherry-pick-empty-parent]
[corpus fixture: gitgraph/gram-cherry-pick-tags]
[corpus fixture: gitgraph/db-overwritten-invalid-source]
[corpus fixture: gitgraph/db-cherry-pick-only-empty-tags]

入力（エスケープ表記）:
`"gitGraph\ncommit id:\"A\"\nbranch b\ncommit id:\"B\"\ncheckout main\ncherry-pick tag:\"x\"id:\"B\"parent:\"A\"tag:\"\"\n"`

出力
([cherry-pick-options/cherry-spacing-output.mmd](../tests/fixtures/gitgraph/cherry-pick-options/cherry-spacing-output.mmd)):

```mmd
gitGraph
  commit id: "A"
  branch b
  commit id: "B"
  checkout main
  cherry-pick tag: "x" id: "B" parent: "A" tag: ""
```

### Title and common values

`title` は空白 1 個と外端だけ両端の空白を除いた非空値を印字します。
値の中の空白とタブの連なりは、空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
空や空白のみなら裸の `title` です。
題の終わりのディレクティブは、それぞれの前に空白があれば空白 1 つを置き、
行末の空白の有無にかかわらず、最後のディレクティブの後の空白を除いて印字します。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
[fixture: title-and-common-values/title-directives-end-blanks-dropped]
共通のアクセシビリティ配置で `accTitle: value`・`accDescr: value`、
空ブロックは `{}` と印字します。
これらの行の値の終わりのディレクティブは、
題の終わりのディレクティブと同じように印字します。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
[fixture: title-and-common-values/acc-directives-end-blanks-dropped]

1 行の説明ブロックは、
[1 行の説明ブロック](./compatibility.ja.md#1-行の説明ブロック) に従います。
波括弧を残すブロックは、通常の隙間では、
接して書かれていても `accDescr` と `{` の間に空白 1 つを置きます。
保護対象の注釈類やセミコロンの配置では、その隙間を保ちます。
別行の閉じは文に揃えます。
通常の説明本文と独立したコメント行は、文より1段内側に揃えます。
Db で LF 後の字下げが取り除かれるためです。
改行、内部の空行、行末空白を保持します。
ディレクティブと共有の除去対象となるコメント領域は原文全体を保ちます。
空白だけの内側は、囲む空白を要する本文がないため `{}` と印字します。
タブ、改行、Unicode の空白も同じです。
[fixture: title-and-common-values/empty-whitespace-interiors]
[test: gitgraph Unicode and tab interiors]
コメントやディレクティブだけのブロックも注釈類を残します。
フロントマターの代替の扱いを含む反復・空値・出現位置を保持します。
固定した文法では、空行・コメント・ディレクティブを挟んでも、
行形式は次の物理行を取り込みません。
対象にする版のうち最も古い版は、
空の `accTitle:` または `accDescr:` の後の文を値として読みます。
そのため、その文と、`accTitle` の値の後の `%%` の前の空白は、
書かれたまま残します。
詳しくは
[最も古い版が末尾まで読むアクセシビリティの行](./compatibility.ja.md#最も古い版が末尾まで読むアクセシビリティの行)
を参照してください。
コロン後の波括弧は行値のままです。
同じ意味の外端だけを詰め、説明の内容と字句上の所有は変えません。

固定例: [fixture: gitgraph/title-and-common-values/title-trim]
[fixture: gitgraph/title-and-common-values/acc-value-on-next-line-kept]
[fixture: gitgraph/title-and-common-values/acc-title-percent-gap-kept]
[fixture: gitgraph/title-and-common-values/block-then-comment-kept]
[corpus fixture: gitgraph/title-next-line]
[fixture: gitgraph/title-and-common-values/common-repeats-empty]
[fixture: gitgraph/title-and-common-values/a11y-fixed]
[fixture: gitgraph/title-and-common-values/a11y-no-next-line]
[fixture: gitgraph/title-and-common-values/common-literal-not-string]
[fixture: gitgraph/title-and-common-values/common-move-front]
[corpus fixture: gitgraph/accdescr-block]
[fixture: gitgraph/title-and-common-values/block-asymmetric-fixed]
[corpus fixture: gitgraph/lex-description-block-only-comment]
[corpus fixture: gitgraph/lex-description-block-only-directive]
[fixture: gitgraph/title-and-common-values/title-next-trivia]
[fixture: gitgraph/title-and-common-values/block-opener-trivia]
[corpus fixture: gitgraph/common-title-only-whitespace]
[test: gitgraph/title-and-common-values/block-opener-join-fixed]

入力（エスケープ表記）: `"gitGraph\ntitle\t  A  B\t C  \n"`

出力
([title-and-common-values/title-trim-output.mmd](../tests/fixtures/gitgraph/title-and-common-values/title-trim-output.mmd)):

```mmd
gitGraph
  title A B C
```

### Multiline values

`printWidth` で操作語・オプション・値を折り返しません。
可視 LF は文を終えるためです。
引用値の物理行、続きの列、内部の空行を保持します。
説明本文は前述の共有の字下げを使い、
隠れた形が消費した LF の隙間は専用の保持規則に従います。

固定例: [fixture: gitgraph/multiline-values/long-kept]
[fixture: gitgraph/multiline-values/multiline-string]
[fixture: gitgraph/multiline-values/block-columns-fixed]

入力（エスケープ表記）:
`"gitGraph\ncommit id:\"a-very-long-identifier-that-stays-written\" msg:\"long authored message with several words\" tag:\"release-with-a-long-tag\" type:HIGHLIGHT\n"`
({"printWidth": 20})

出力
([multiline-values/long-kept-output.mmd](../tests/fixtures/gitgraph/multiline-values/long-kept-output.mmd)):

```mmd
gitGraph
  commit id: "a-very-long-identifier-that-stays-written" msg: "long authored message with several words" tag: "release-with-a-long-tag" type: HIGHLIGHT
```

### Comments

通常の独立コメントは本文 1 段、見出し前は第 1 列へ揃えます。
行内コメントは同じ行で、接していれば接触を、離れていれば空白 1 個を残します。
作者の付着を保つため mark・本文・末尾空白を保持します。
図固有のコメントの LS/PS は内容です。
文字列とブロックはパーセントの文字を所有し、行値はその前で終わります。
共通の削除領域は完全な原文の範囲を保持します。
保持する前置部分は通常の配置に優先します。

固定例: [fixture: gitgraph/comments/comment-placement]
[fixture: gitgraph/comments/comment-bare-triple]
[fixture: gitgraph/comments/comment-in-values]
[corpus fixture: gitgraph/comment-string]
[corpus fixture: gitgraph/comment-between-mark-characters]
[corpus fixture: gitgraph/comment-native-ls-content]

入力（エスケープ表記）:
`"  %% before\ngitGraph %% header\ncommit%% glued\ncommit  %% apart\n    %% last\n"`

出力
([comments/comment-placement-output.mmd](../tests/fixtures/gitgraph/comments/comment-placement-output.mmd)):

```mmd
%% before
gitGraph %% header
  commit%% glued
  commit %% apart
  %% last
```

[fixture: gitgraph/comments/hidden-comment-indentation]

### Global directives

大域的なディレクティブの内容・順序・単位の間の位置を保持します。
同じ印字行の中のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
元は同じ行にあった単位を別の行へ分けるときは、
間のディレクティブを次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
通常の独立した開始位置だけ本文 1 段へ揃えます。
文字列内部、語とコロンの間、EOF に達する未閉鎖の形も保持します。
中身を解析しない本文と独立した設定効果を再構築しません。
語の単位の途中での分断は仕様どおり拒否します。

[fixture: gitgraph/global-directives/header-to-body]

固定例: [fixture: gitgraph/global-directives/directive-sides]
[fixture: gitgraph/global-directives/directive-lines]
[corpus fixture: gitgraph/directive-commit-id]
[corpus fixture: gitgraph/directive-in-string]
[corpus fixture: gitgraph/directive-open-after-header]
[fixture: gitgraph/global-directives/directive-order-change]

入力（エスケープ表記）:
`"gitGraph\ncommit id%%{wrap}%%:\"A\"\ncommit id:%%{wrap}%% \"B\"\n"`

出力
([global-directives/directive-sides-output.mmd](../tests/fixtures/gitgraph/global-directives/directive-sides-output.mmd)):

```mmd
gitGraph
  commit id%%{wrap}%%: "A"
  commit id: %%{wrap}%%"B"
```

### Hidden yaml

yaml-ブロックの `GitgraphIgnoredText` は、
見出し・オプション・名前・`textAfter`・本文の所有位置に、
内部の共通注釈類を含む完全な原文の範囲で保持します。
範囲外の消費 LF と閉じの余白は、EOF や注釈類・次の形の前でも残します。
範囲外の予備の LF と端の空行は [空行](#blank-lines) に従います。
直前に LF を足しません。
本文の開始記号は 1 段にでき、内部と閉じの列は変えません。
空本文・3 つの囲み・後の有効な閉じ記号・複数の形も中身を解析しません。
先に始まった文字列・ブロック・行値の所有も変えません。
境界の移動や両端の空白の除去は受理を失わせるためです。

固定例: [corpus fixture: gitgraph/lex-yaml-invalid-body]
[corpus fixture: gitgraph/lex-hidden-yaml-before-option-value]
[fixture: gitgraph/hidden-yaml/yaml-close-indent-invalid]
[corpus fixture: gitgraph/lex-hidden-yaml-commit-closing-space]
[corpus fixture: gitgraph/lex-yaml-empty-body]
[corpus fixture: gitgraph/lex-yaml-three-adjacent-fences]
[corpus fixture: gitgraph/lex-yaml-two-nonempty-in-gap]
[corpus fixture: gitgraph/lex-yaml-block]
[corpus fixture: gitgraph/lex-yaml-common-init-effect]
[corpus fixture: gitgraph/lex-hidden-yaml-closer-skips-nonboundary]
[corpus fixture: gitgraph/lex-hidden-yaml-commit-spare-lf]
[corpus fixture: gitgraph/lex-hidden-yaml-commit-eof]
[corpus fixture: gitgraph/lex-hidden-yaml-branch-closing-space]
[corpus fixture: gitgraph/lex-hidden-yaml-branch-spare-lf]
[corpus fixture: gitgraph/lex-hidden-yaml-branch-eof]
[corpus fixture: gitgraph/lex-hidden-yaml-checkout-closing-space]
[corpus fixture: gitgraph/lex-hidden-yaml-checkout-spare-lf]
[corpus fixture: gitgraph/lex-hidden-yaml-checkout-eof]
[corpus fixture: gitgraph/lex-hidden-yaml-switch-closing-space]
[corpus fixture: gitgraph/lex-hidden-yaml-switch-spare-lf]
[corpus fixture: gitgraph/lex-hidden-yaml-switch-eof]
[corpus fixture: gitgraph/lex-hidden-yaml-merge-closing-space]
[corpus fixture: gitgraph/lex-hidden-yaml-merge-spare-lf]
[corpus fixture: gitgraph/lex-hidden-yaml-merge-eof]
[corpus fixture: gitgraph/lex-hidden-yaml-cherry-pick-closing-space]
[corpus fixture: gitgraph/lex-hidden-yaml-cherry-pick-spare-lf]
[corpus fixture: gitgraph/lex-hidden-yaml-cherry-pick-eof]
[corpus fixture: gitgraph/lex-hidden-yaml-block-closing-space]
[corpus fixture: gitgraph/lex-hidden-yaml-block-spare-lf]
[corpus fixture: gitgraph/lex-hidden-yaml-block-eof]
[corpus fixture: gitgraph/header-hidden-before-colon]
[corpus fixture: gitgraph/header-hidden-before-direction]
[corpus fixture: gitgraph/header-two-hidden-forms]
[corpus fixture: gitgraph/lex-hidden-yaml-before-branch-name]
[corpus fixture: gitgraph/lex-hidden-yaml-before-type]
[corpus fixture: gitgraph/lex-hidden-yaml-before-order]
[corpus fixture: gitgraph/lex-yaml-string]
[corpus fixture: gitgraph/lex-hidden-yaml-global-comment-body]
[corpus fixture: gitgraph/lex-hidden-yaml-opener-tab]
[corpus fixture: gitgraph/lex-yaml-empty-then-nonempty]
[fixture: gitgraph/hidden-yaml/standalone-closing-padding]
[fixture: gitgraph/hidden-yaml/option-consumed-lf]

入力（エスケープ表記）: `"gitGraph commit id:---\nopaque\n---\n\"root\"\n"`

出力
([hidden-yaml/option-consumed-lf-output.mmd](../tests/fixtures/gitgraph/hidden-yaml/option-consumed-lf-output.mmd)):

```mmd
gitGraph
  commit id:---
opaque
---
"root"
```

### Hidden directives

ディレクティブの `GitgraphIgnoredText` は隠れた YAML
と同じく原文と境界を保持し、9 種すべての文の後置部分でも同じです。
図固有の形は大域的なディレクティブと別です。
空・記号・複数行の内容と、先行する文字列やブロックの所有を残します。
不成立の閉じ記号は後の閉じ記号まで内容になるか、図固有のコメントとして扱います。
分類を変える境界は足しません。
必須部品が欠けた入力は拒否します。

固定例: [fixture: gitgraph/hidden-directives/hidden-directive-body]
[corpus fixture: gitgraph/lex-option-before-type-value-hidden]
[corpus fixture: gitgraph/lex-hidden-directive-commit-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-commit-spare-lf]
[corpus fixture: gitgraph/lex-hidden-directive-closer-skips-nonboundary]
[corpus fixture: gitgraph/lex-hidden-directive-common-init-effect]
[corpus fixture: gitgraph/lex-hidden-directive-unknown-content]
[corpus fixture: gitgraph/lex-hidden-directive-string]
[corpus fixture: gitgraph/lex-hidden-directive-commit-eof]
[corpus fixture: gitgraph/lex-hidden-directive-branch-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-branch-spare-lf]
[corpus fixture: gitgraph/lex-hidden-directive-branch-eof]
[corpus fixture: gitgraph/lex-hidden-directive-checkout-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-checkout-spare-lf]
[corpus fixture: gitgraph/lex-hidden-directive-checkout-eof]
[corpus fixture: gitgraph/lex-hidden-directive-switch-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-switch-spare-lf]
[corpus fixture: gitgraph/lex-hidden-directive-switch-eof]
[corpus fixture: gitgraph/lex-hidden-directive-merge-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-merge-spare-lf]
[corpus fixture: gitgraph/lex-hidden-directive-merge-eof]
[corpus fixture: gitgraph/lex-hidden-directive-cherry-pick-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-cherry-pick-spare-lf]
[corpus fixture: gitgraph/lex-hidden-directive-cherry-pick-eof]
[corpus fixture: gitgraph/lex-hidden-directive-title-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-title-spare-lf]
[corpus fixture: gitgraph/lex-hidden-directive-title-eof]
[corpus fixture: gitgraph/lex-hidden-directive-acctitle-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-acctitle-spare-lf]
[corpus fixture: gitgraph/lex-hidden-directive-acctitle-eof]
[corpus fixture: gitgraph/lex-hidden-directive-accdescr-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-accdescr-spare-lf]
[corpus fixture: gitgraph/lex-hidden-directive-accdescr-eof]
[corpus fixture: gitgraph/lex-hidden-directive-block-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-block-spare-lf]
[corpus fixture: gitgraph/lex-hidden-directive-block-eof]
[corpus fixture: gitgraph/lex-hidden-directive-before-branch-name]
[corpus fixture: gitgraph/lex-hidden-directive-before-checkout-name]
[corpus fixture: gitgraph/lex-hidden-directive-before-merge-name]
[corpus fixture: gitgraph/lex-option-between-options-hidden]
[corpus fixture: gitgraph/lex-option-before-message-hidden]
[corpus fixture: gitgraph/lex-branch-between-name-order-hidden]
[corpus fixture: gitgraph/lex-hidden-directive-block]
[corpus fixture: gitgraph/lex-hidden-directive-fallback-complete-statement]
[corpus fixture: gitgraph/lex-hidden-directive-between-option-value]
[fixture: gitgraph/hidden-directives/hidden-add-boundary-invalid]
[fixture: gitgraph/hidden-directives/standalone-closing-padding]
[test: gitgraph/hidden-directives/hidden-physical-multiline]
[fixture: gitgraph/hidden-directives/option-consumed-lf]

入力（エスケープ表記）: `"gitGraph commit id:%%{!}%%\n'root'\n"`

出力
([hidden-directives/option-consumed-lf-output.mmd](../tests/fixtures/gitgraph/hidden-directives/option-consumed-lf-output.mmd)):

```mmd
gitGraph
  commit id:%%{!}%%
"root"
```

### Semicolons

すべてのセミコロンを残します。
保つ `;` を含む区間は、行の規則が無視する `;` が整形で変わる所を除き、
ほかの場所と同じように整形します。
この規則は、[セミコロン](./flowchart.ja.md#セミコロン)のとおり、
`style` か `classDef` の後の最初の `:` から、
最後の保つ `;` の前の最後の `#` までに空白がない並びを読みます。
その範囲の隙間と余白は空白の有無を保ち、空白の連続は空白 1 つにします。
範囲の外は、この図種の通常の規則に従います。
どの部分の配置も持たないテキストは、書かれたまま残します。
複数行にわたる文の行を空白 1 つか何も挟まずにつなぐと、
行の規則が無視する `;` が変わりうる場合は、各区間の頭から最後の保つ `;` までを、
書かれたまま残します。
それ以外の複数行の文は、1 行の文と同じように整形します。
[fixture: semicolons/stretch-kept-rest-formatted]
[fixture: semicolons/no-stretch-formatted]
保護された見出しと最初の文を分けません。
style・classDef の走査、コロンとハッシュ記号の空白、大小文字、反復、
ディレクティブが再結合する条件を満たす語と LS/PS の境界を残します。
選ばれたセミコロンの削除は別の選択を起こして Db を変えます。
単位の途中での分断は拒否します。

固定例: [fixture: gitgraph/semicolons/native-commit-value]

[fixture: gitgraph/semicolons/semicolon-header-protect]
[corpus fixture: gitgraph/style-both-words]
[corpus fixture: gitgraph/style-colon-space]
[corpus fixture: gitgraph/style-tag-three-semicolons]
[corpus fixture: gitgraph/style-directive-rejoins]
[fixture: gitgraph/semicolons/semicolon-cross-trigger]
[fixture: gitgraph/semicolons/semicolon-remove-selected]
[corpus fixture: gitgraph/style-ls-segment]

入力（エスケープ表記）: `"gitGraph title style:#a;b\n"`

出力
([semicolons/semicolon-header-protect-output.mmd](../tests/fixtures/gitgraph/semicolons/semicolon-header-protect-output.mmd)):

```mmd
gitGraph title style:#a;b
```

### Trailing whitespace

通常の見出しと完成したオプション・名前・数値・ブロックの外側にある、
無害な ASCII 行末空白を削除します。
共通の行値には外端の規則を使います。
文字列・コメント・ディレクティブと隠れた形の内部、保護部分、
続きの行の末尾は原文を保持します。
隠れた形の閉じの余白は必要な EOL を可視に保つため、EOF でも残します。

固定例: [fixture: gitgraph/trailing-whitespace/trailing-safe]
[fixture: gitgraph/trailing-whitespace/trailing-string-kept]
[corpus fixture: gitgraph/lex-hidden-directive-commit-eof]
[fixture: gitgraph/trailing-whitespace/hidden-eof-padding]

入力（エスケープ表記）:
`"gitGraph \t\ncommit id:\"A\"  \nbranch b order:2\t\naccDescr {D}\t"`

出力
([trailing-whitespace/trailing-safe-output.mmd](../tests/fixtures/gitgraph/trailing-whitespace/trailing-safe-output.mmd)):

```mmd
gitGraph
  commit id: "A"
  branch b order: 2
  accDescr: D
```

### Line terminators and unicode

共通の埋め込み先の改行規則を使い、
物理 CR/CRLF を LF にして `endOfLine` で出力します。
値・ブロック・隠れた形の内部も同じです。
内容の LS/PS/NBSP/BOM は保持し、共通の行値の外端からだけ共通空白を除きます。
通常のブロック開始記号の空白は結合できます。
構造上の非 ASCII 区切りは拒否を保ちます。
先頭 BOM は埋め込み先の Prettierの扱いに従い、バイト同一は保証しません。

固定例: [test: gitgraph/line-terminators-and-unicode/eol-cr]
[test: gitgraph/line-terminators-and-unicode/eol-crlf]
[test: gitgraph/line-terminators-and-unicode/eol-string-crlf]
[test: gitgraph/line-terminators-and-unicode/eol-block-cr]
[test: gitgraph/line-terminators-and-unicode/eol-hidden-crlf]
[test: gitgraph/line-terminators-and-unicode/eol-output-crlf]
[test: gitgraph/line-terminators-and-unicode/eol-output-cr]
[test: gitgraph/line-terminators-and-unicode/unicode-values]
[test: gitgraph/line-terminators-and-unicode/unicode-line-trim]
[test: gitgraph/line-terminators-and-unicode/unicode-leading-bom]
[corpus fixture: gitgraph/div-detect-bare-before-header-ls]
[test: gitgraph/line-terminators-and-unicode/unicode-to-lf-change]

入力（エスケープ表記）: `"gitGraph\rcommit id:\"A\"\r"`

出力（エスケープ表記）: `"gitGraph\n  commit id: \"A\"\n"`

### Frontmatter yaml

安全な実フロントマターだけ既存の YAML 整形処理に渡します。
区切りの余白、不正・字下げあり・HTML の危険がある YAML、
区切りを作る出力は書かれたままです。
YAML は `tabWidth` 0 でも共有の正の最小字下げを使います。
見出し前に保持する隠れたテキストがあれば、先頭 LF、コメント、単独行の注釈類、
再走査で読む形、実際の形と隠れた形の順序を含む前置部分全体を残します。
先頭 LF の削除は隠れた YAML を有効な title や設定に変え、Db を変えます。
隠れた形は YAML 整形処理に渡しません。

固定例: [fixture: gitgraph/frontmatter-yaml/frontmatter-safe]
[fixture: gitgraph/frontmatter-yaml/prefix-promote-change]
[fixture: gitgraph/frontmatter-yaml/prefix-retained]
[corpus fixture: gitgraph/detect-block-after-real-frontmatter]
[corpus fixture: gitgraph/lex-hidden-directive-second-scan]
[corpus fixture: gitgraph/frontmatter-html]
[corpus fixture: gitgraph/div-frontmatter-invalid-yaml]
[corpus fixture: gitgraph/div-frontmatter-cross-title-value]
[fixture: gitgraph/frontmatter-yaml/frontmatter-zero-minimum]
[fixture: gitgraph/frontmatter-yaml/frontmatter-zero-invalid]
[fixture: gitgraph/frontmatter-yaml/frontmatter-delimiter-padding]
[fixture: gitgraph/frontmatter-yaml/frontmatter-indented-kept]

入力（エスケープ表記）:
`"---\ntitle:   T\nconfig: {gitGraph: {mainBranchName: trunk, mainBranchOrder: 3}}\n---\ngitGraph\ncommit\n"`

出力
([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/gitgraph/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: T
config: { gitGraph: { mainBranchName: trunk, mainBranchOrder: 3 } }
---
gitGraph
  commit
```

### Final newline

通常の受理ファイルは設定した終端改行 1 個で終えます。
見出しのみ、最後の操作文、通常のコメント、空ブロックも同じです。
通常の末尾空行列は削除します。
EOF に達する大域的なディレクティブ、隠れた形の閉じの余白、
保持する前置部分の境界は残し、閉じた隠れた形には終端 LF を足せます。
共通のファイル終端を使いながら、消費 LF の境界を守ります。

固定例: [corpus fixture: gitgraph/header-eof]
[fixture: gitgraph/final-newline/final-commit]
[fixture: gitgraph/final-newline/final-comment]
[fixture: gitgraph/final-newline/final-block]
[fixture: gitgraph/trailing-whitespace/hidden-eof-padding]
[fixture: gitgraph/final-newline/final-open-global]
[corpus fixture: gitgraph/div-detect-c4container-comment-eof]

入力（エスケープ表記）: `"gitGraph\naccDescr{}"`

出力
([final-newline/final-block-output.mmd](../tests/fixtures/gitgraph/final-newline/final-block-output.mmd)):

```mmd
gitGraph
  accDescr {}
```

### Specified readings

既知の差異は仕様の受理と Db の読みを使います。
単独ファイルの解析失敗は構文エラーを報告し、
Markdown は埋め込みを辞退して図の本文を埋め込み先に返します。
語内のディレクティブと選ばれたセミコロンを結合して修復しません。
フロントマターの HTML は本文だけの読み、
中身を解析しない不正な YAML は架空の設定や素の mermaid.js の Db
を補わない扱いです。
C4 検出と単独のパーセントの行の差異も新設せず既存の識別子に従います。
素の mermaid.js による拒否には素の mermaid.js の Db がありません。
空の引用符付きオプションと空の説明ブロックは受理したままです。

[corpus fixture: gitgraph/div-directive-in-commit]
[corpus fixture: gitgraph/div-style-semicolon-in-order-number]
[corpus fixture: gitgraph/div-frontmatter-cross-title-value]
[corpus fixture: gitgraph/div-frontmatter-invalid-yaml]
[corpus fixture: gitgraph/div-detect-c4container-comment-eof]
[corpus fixture: gitgraph/div-detect-bare-before-header-ls]
[corpus fixture: gitgraph/gram-commit-empty-values]
[corpus fixture: gitgraph/common-block-only-whitespace]

たとえば `gitGraph\ncom%%{wrap}%%mit id:"A"` は構文エラーです。
修復した出力は作らず、Markdown は図の本文を埋め込み先に返します。

### Markdown fences

共通の Markdown 経路で外側の字下げを除いた図の本文に同じ規則を使います。
囲み・リスト・引用の字下げと改行は埋め込み先が担います。
図の本文の最終行の余白は、最後の隠れた形の境界の空白も含めて、
埋め込み先が削除する限界がありますが、
本文途中の隠れた形の閉じの空白は保持します。
埋め込み先の出力と冪等性、図の本文の Db・木・原文を別々に検査します。

[test: gitgraph Markdown: top-level] [test: gitgraph Markdown: list]
[test: gitgraph Markdown: quote] [test: gitgraph Markdown: zero]
[test: gitgraph Markdown: tabs] [test: gitgraph Markdown: hidden-gap]
[test: gitgraph Markdown: hidden-boundary] [test: gitgraph Markdown: preheader]
[test: gitgraph Markdown: frontmatter]
[test: gitgraph Markdown: global-and-semicolons]
[test: gitgraph Markdown: final-comment]
[test: gitgraph Markdown: final-hidden-padding]
[test: gitgraph Markdown: rejected]

入力（エスケープ表記）:

````json
"```mermaid\ngitGraph:commit id:\"Fence\"\n```\n"
````

出力（エスケープ表記）:

````json
"```mermaid\ngitGraph\n  commit id: \"Fence\"\n```\n"
````
