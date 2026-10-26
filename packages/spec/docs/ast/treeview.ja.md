# Treeview の node

英語版: [treeview.md](./treeview.md)

この文書は `treeView` の source tree を定める。
共有 node と不変条件は [ast.md](../ast.ja.md)、
受理と罫線の直接の読みは [treeview の構文](../diagrams/treeview.ja.md)が定める。
任意の欄も null として存在し、list は記述順を保ち、子の欄は訪問順を示す。
[fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]

## 書かれた値

bare の node 名は空白を許す位置なので TreeviewIdentifier を使う。
引用名は共有 StringLiteral、class 名と icon 参照全体は共有 Identifier を使う。
数らしい名前も数ではなく名前である。一つの例の見た目で node の型を選ばない。
[fixture: treeview/gram-written-tree] [fixture: treeview/db-bare-internal-space]
[fixture: treeview/ast-numeric-name]

StringLiteral.raw は両端の原文の引用符と、共通 trivia も含む間の全字を保つ。
value は共有
directive・コメント領域・選択されたセミコロンを除いた書かれた内側であり、
escape を decode せず、改行も正規化しない。空の引用名も node となり、
closed は true である。
[fixture: treeview/gram-written-tree] [fixture: treeview/db-empty-names]
[fixture: treeview/db-quote-conversion]
[fixture: treeview/directive-double-middle]
[fixture: treeview/comment-line-in-quotes] [fixture: treeview/text-double-crlf]

値は書かれた tab、slash、引用符、文字参照の綴り、所有する空白を保つ。
値の中の罫線 prefix と装飾も、字句上は字下げや内容無しと読む場合まで、
その葉の綴りに残す。共有の葉に prefix や装飾の子を重ねず、
原文を仮想の空白で置き換えない。
導出する値は
[tests の要約](../../../tests/docs/db-summaries.ja.md#treeview)に属する。
[fixture: treeview/gram-written-tree] [fixture: treeview/entity-double]
[fixture: treeview/box-multiline-quoted]
[fixture: treeview/box-quoted-decoration]
[fixture: treeview/box-trim-string-closing-quote]
[fixture: treeview/box-multiline-name-tail-trim]

## gap の所有

TreeviewIgnoredText は box-decoration だけを持ち、
共有 Comment・Directive・空白・native YAML を持たない。
native な hidden YAML と directive の node は無い。
保持する形の owner は一つだけとし、次の規則を原文の順で適用する。
[fixture: treeview/box-written-tree] [fixture: treeview/gram-body-yaml]
[fixture: treeview/detect-secondscan-singleline]

見出しの後、完成した top-level item の間、
最後の item の後の装飾は Diagram.body に属する。
共通文の preamble を終わらせない。字下げを読んだ後で名前がまだ必須なら、
間の装飾は Node.textBeforeName に属する。その字下げを与えた prefix は、
名前の前に native comment が割り込んでも Node.prefix に属する。
[fixture: treeview/box-written-tree]
[fixture: treeview/box-decoration-preamble-body]
[fixture: treeview/box-decoration-trailing-body]
[fixture: treeview/box-decoration-pending-name-gap]
[fixture: treeview/box-comment-indent-carry]

後に注釈が続くなら、その前の装飾は注釈の textBefore に属する。
注釈が続かなければ top-level の body へ戻る。
注釈を始める branch はその注釈の prefix に属し、node の indent を変えない。
accDescr と block の開きの間の装飾と prefix は textBeforeOpen に属する。
[fixture: treeview/box-decoration-before-annotation]
[fixture: treeview/ast-annotation-prefixes]
[fixture: treeview/box-decoration-trailing-body]
[fixture: treeview/box-branch-before-block-open]
[fixture: treeview/box-decoration-before-block-open]
[fixture: treeview/box-prefix-common-block-two-prefixes]

既に開いた葉の内側では、包まれた罫線の形を gap node に取り出さず、その葉に保つ。
読みから外れる装飾の行末は装飾 node の外の原文の trivia のままとし、
論理的に足す LF を書かれた構文にしない。
共有コメントと directive は独立した共有の所有に従う。
[fixture: treeview/ast-decoration-internal-and-body]
[fixture: treeview/box-physical-directive-inline]
[fixture: treeview/block-physical-comment-line]
[fixture: treeview/gram-body-hidden-eof]

## node

### TreeviewDiagram

| 欄     | 型                       | 意味                   |
| ------ | ------------------------ | ---------------------- |
| `body` | TreeviewBodyItem の list | 全ての文と外側の装飾。 |

子の欄: body。範囲: 見出しの開始から最後の書かれた body item まで。
body が空なら見出しの終端まで。外側の空白、その後の共有 Comment、
追加する LF を含めない。Root.diagramType は `treeView`。
見出しは keyword の unit に保ち、別の header node を作らない。
[fixture: treeview/header-only] [fixture: treeview/gram-written-tree]
[fixture: treeview/box-decoration-trailing-body]

TreeviewBodyItem は TreeviewNode、TreeviewIgnoredText、TreeviewTitleStatement、
TreeviewAccTitleStatement、TreeviewAccDescrStatement、
TreeviewAccDescrBlockStatement のいずれか。共通文は node の前に置く。
どちらの並びにも装飾が入りうる。body は平らに全出現を記録し、
parent/children 欄や人工の根を作らない。
空行と共有 Comment は body item を作らない。
[fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]
[fixture: treeview/box-decoration-preamble-body]
[fixture: treeview/common-repeat-empty] [fixture: treeview/comment-native]

### TreeviewNode

| 欄               | 型                                      | 意味                                |
| ---------------- | --------------------------------------- | ----------------------------------- |
| `indent`         | 非負整数                                | 割り当てられた字下げ単位。          |
| `prefix`         | TreeviewBranchPrefix または null        | この node の字下げを与える prefix。 |
| `textBeforeName` | TreeviewIgnoredText の list             | 名前を待つ間の装飾。                |
| `name`           | TreeviewIdentifier または StringLiteral | 書かれた node の名前。              |
| `annotations`    | TreeviewAnnotation の list              | 記述順の全注釈。                    |

子の欄: prefix、textBeforeName、name、annotations。
範囲: prefix・textBeforeName・name の最も早い開始から最後の注釈まで。
注釈が無ければ name の終端まで。前置の通常の字下げと、
後の別 node に属する空白は含めない。name は null にならず、
空の引用名は空の value を持つ StringLiteral である。
[fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]
[fixture: treeview/box-comment-indent-carry]
[fixture: treeview/box-decoration-pending-name-gap]
[fixture: treeview/db-empty-names]

indent は割り当てられた通常の ASCII space/tab を各 1 と数え、
prefix は[直接規則](../diagrams/treeview.ja.md)の深さの 4 倍を与える。
原文の列が別の行で名前に先行してよい。列も prefix も無ければ indent は 0。
列・幅・別の導出深さを欄に持たない。
この node を与える prefix が無ければ prefix は null、
所有する装飾が無ければ textBeforeName は空である。
[fixture: treeview/db-tabs-one-unit] [fixture: treeview/db-quoted-tail-space]
[fixture: treeview/box-written-tree]
[fixture: treeview/box-comment-indent-carry]
[fixture: treeview/box-decoration-pending-name-gap]
[fixture: treeview/gram-written-tree]

TreeviewAnnotation は TreeviewClassAnnotation、TreeviewIconAnnotation、
TreeviewDescriptionAnnotation のいずれか。書かれていなければ list を空とし、
書かれていれば上書き前の class/icon、空の description も含め全出現を保つ。
name の元の slash を残し、nodeType 欄と階層の欄は持たない。
[fixture: treeview/gram-written-tree] [fixture: treeview/db-repeat-class]
[fixture: treeview/db-repeat-icon]
[fixture: treeview/annotation-description-repeat-empty]
[fixture: treeview/db-directory-trailing-space]
[fixture: treeview/db-file-parent]

### TreeviewClassAnnotation

| 欄           | 型                               | 意味                      |
| ------------ | -------------------------------- | ------------------------- |
| `textBefore` | TreeviewIgnoredText の list      | 所有する前置の装飾。      |
| `prefix`     | TreeviewBranchPrefix または null | この注釈を始める prefix。 |
| `name`       | Identifier                       | 書かれた class 名。       |

子の欄: textBefore、prefix、name。範囲: 最初の所有する装飾または prefix、
それらが無ければ `:::` から class 名の終端まで。
前の形を所有しないときの `:::` より前の区切り空白を含めない。
name は非空で null にならず、`:::` の後の任意の空白を名前の範囲に含めない。
[fixture: treeview/gram-written-tree] [fixture: treeview/annotation-class-space]
[fixture: treeview/box-decoration-before-annotation]
[fixture: treeview/box-annotation-prefix]

注釈を始める branch が無ければ prefix は null、
所有する装飾が無ければ textBefore は空。
名前の大文字小文字・underscore・dash と、繰り返す各注釈を独立に保つ。
固定の `:::` marker は句読の unit とし、名前の葉や追加の欄にはしない。
[fixture: treeview/gram-written-tree]
[fixture: treeview/annotation-class-uppercase]
[fixture: treeview/annotation-class-hyphen] [fixture: treeview/db-repeat-class]
[fixture: treeview/box-decoration-before-annotation]

### TreeviewIconAnnotation

| 欄           | 型                               | 意味                       |
| ------------ | -------------------------------- | -------------------------- |
| `textBefore` | TreeviewIgnoredText の list      | 所有する前置の装飾。       |
| `prefix`     | TreeviewBranchPrefix または null | この注釈を始める prefix。  |
| `name`       | Identifier または null           | 参照全体の原綴、または空。 |

子の欄: textBefore、prefix、name。範囲: 最初の所有する装飾または prefix、
それらが無ければ `icon` から閉じ `)` の終端まで。
共有の除去の後に参照が空のときだけ name は null。`icon()` もこの注釈を作り、
`icon(none)` は名前の Identifier を持つ。
注釈自体が無ければ list の member が無い。
[fixture: treeview/gram-written-tree] [fixture: treeview/db-icon-none]
[fixture: treeview/ast-icon-removal-only]
[fixture: treeview/ast-annotation-prefixes]

`pack:file` や `:file` の全綴りを colon も含め一つの Identifier とする。
pack を解決せず、参照の別の模型へ分解しない。無ければ prefix は null、
textBefore は空。繰り返す各注釈と元の括弧を保つ。
[fixture: treeview/gram-written-tree]
[fixture: treeview/annotation-icon-leading-colon]
[fixture: treeview/db-repeat-icon] [fixture: treeview/ast-annotation-prefixes]

### TreeviewDescriptionAnnotation

| 欄           | 型                               | 意味                      |
| ------------ | -------------------------------- | ------------------------- |
| `textBefore` | TreeviewIgnoredText の list      | 所有する前置の装飾。      |
| `prefix`     | TreeviewBranchPrefix または null | この注釈を始める prefix。 |
| `value`      | TreeviewLiteral または null      | `##` の後の本文全体。     |

子の欄: textBefore、prefix、value。範囲: 最初の所有する装飾または prefix、
それらが無ければ `##` から値の最後の字まで。
value が null なら marker の終端まで。
value は `##` の直後から行末の直前までの空白を全て含む。
空または共有の除去だけの内容なら null、空白だけなら literal とする。
[fixture: treeview/gram-written-tree] [fixture: treeview/spec-parser-ab2c8458]
[fixture: treeview/db-description-empty]
[fixture: treeview/ast-description-removal-only]
[fixture: treeview/ast-annotation-prefixes]

所有する形が無ければ prefix は null、textBefore は空。
value の内側の後続の marker らしい字、U+2028・U+2029、
別の行の description の全出現を保ち、結合したり、
最後の sanitize された値へ置き換えたりしない。
[fixture: treeview/gram-written-tree]
[fixture: treeview/db-description-absorbs-annotations]
[fixture: treeview/text-description-ls] [fixture: treeview/text-description-ps]
[fixture: treeview/annotation-description-repeat-lines]
[fixture: treeview/annotation-description-repeat-empty]
[fixture: treeview/ast-annotation-prefixes]

### TreeviewTitleStatement

| 欄       | 型                               | 意味                |
| -------- | -------------------------------- | ------------------- |
| `prefix` | TreeviewBranchPrefix または null | 文を始める prefix。 |
| `value`  | TreeviewLiteral または null      | 書かれた共通本文。  |

value は `title` と正確に 1 字の ASCII space/tab の後で始まり、
それ以上の空白を保つ。区切りが無いか、
共有の除去の後に内容が残らなければ null とし、
残る内容が空白だけなら literal とする。
[fixture: treeview/gram-written-tree] [fixture: treeview/common-title-eof]
[fixture: treeview/common-title-quoted-next]
[fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/ast-common-removal-only-values]

子の欄: prefix、value。範囲: prefix があればその開始、
無ければ `title` から本文の最後の字まで。value が null なら keyword の終端まで。
前置の空白と文末の改行を含めない。文を始める branch が無ければ prefix は null。
空と上書き前の出現も一つずつ保つ。
[fixture: treeview/gram-written-tree] [fixture: treeview/common-title-eof]
[fixture: treeview/common-title-quoted-next]
[fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/ast-common-removal-only-values]
[fixture: treeview/common-repeat-empty] [fixture: treeview/box-common-prefix]

### TreeviewAccTitleStatement

| 欄       | 型                               | 意味                |
| -------- | -------------------------------- | ------------------- |
| `prefix` | TreeviewBranchPrefix または null | 文を始める prefix。 |
| `value`  | TreeviewLiteral または null      | 書かれた共通本文。  |

value は colon の直後で始まり、本文の空白を全て保つ。
共有の除去の後に内容が残らないときだけ null とし、空白だけなら literal とする。
引用符や brace らしい本文もテキストのままとする。
[fixture: treeview/gram-written-tree] [fixture: treeview/common-acctitle-eof]
[fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/ast-common-removal-only-values]

子の欄: prefix、value。範囲: prefix があればその開始、
無ければ `accTitle` から本文の最後の字まで。
value が null なら colon の終端まで。前置の空白と文末の改行を含めない。
文を始める branch が無ければ prefix は null。空と上書き前の出現も一つずつ保つ。
[fixture: treeview/gram-written-tree] [fixture: treeview/common-acctitle-eof]
[fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/ast-common-removal-only-values]
[fixture: treeview/common-repeat-empty] [fixture: treeview/box-common-prefix]

### TreeviewAccDescrStatement

| 欄       | 型                               | 意味                |
| -------- | -------------------------------- | ------------------- |
| `prefix` | TreeviewBranchPrefix または null | 文を始める prefix。 |
| `value`  | TreeviewLiteral または null      | 書かれた共通本文。  |

value は colon の直後で始まり、本文の空白を全て保つ。
共有の除去の後に内容が残らないときだけ null とし、空白だけなら literal とする。
引用符や brace らしい本文もテキストのままとする。
[fixture: treeview/gram-written-tree] [fixture: treeview/common-accline-eof]
[fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/ast-common-removal-only-values]

子の欄: prefix、value。範囲: prefix があればその開始、
無ければ `accDescr` から本文の最後の字まで。
value が null なら colon の終端まで。前置の空白と文末の改行を含めない。
文を始める branch が無ければ prefix は null。空と上書き前の出現も一つずつ保つ。
[fixture: treeview/gram-written-tree] [fixture: treeview/common-accline-eof]
[fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/ast-common-removal-only-values]
[fixture: treeview/common-repeat-empty] [fixture: treeview/box-common-prefix]

### TreeviewAccDescrBlockStatement

| 欄               | 型                                                        | 意味                      |
| ---------------- | --------------------------------------------------------- | ------------------------- |
| `prefix`         | TreeviewBranchPrefix または null                          | keyword の前の prefix。   |
| `textBeforeOpen` | (TreeviewBranchPrefix または TreeviewIgnoredText) の list | `{` の前に所有する形。    |
| `value`          | TreeviewLiteral または null                               | 書かれた brace 内の本文。 |

子の欄: prefix、textBeforeOpen、value。範囲: prefix があればその開始、
無ければ `accDescr` から字句規則で有効な最初の閉じ `}` の終端まで。
value が null でも両端の brace を残す。前置の空白と後の trivia を含めない。
prefix が無ければ null、
必須の gap に prefix も装飾も無ければ textBeforeOpen は空。
[fixture: treeview/gram-written-tree] [fixture: treeview/common-repeat-empty]
[fixture: treeview/box-decoration-before-block-open]
[fixture: treeview/box-branch-before-block-open]
[fixture: treeview/box-prefix-common-block-two-prefixes]
[fixture: treeview/box-trim-block-closing-brace]

書かれた brace 内の全体を trim せず、外端の空白、改行、引用符、backslash、
罫線の形も保つ。空または共有の除去だけの内容のときだけ null、
空白だけなら literal とする。この型には閉じが必須なので closed 欄を持たない。
空や上書き前の block も独立に残す。
[fixture: treeview/gram-written-tree] [fixture: treeview/common-repeat-empty]
[fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/ast-common-removal-only-values]
[fixture: treeview/common-block-whitespace-raw]
[fixture: treeview/common-block-escaped-close]
[fixture: treeview/box-block-decoration]

### TreeviewIdentifier

| 欄     | 型     | 意味                       |
| ------ | ------ | -------------------------- |
| `name` | string | 書かれた bare の node 名。 |

子の欄は無い。範囲: bare-name の最初から最後の字まで。
末尾の ASCII space/tab と所有する Unicode 空白も含める。
name は共有 trivia だけを除き、大文字小文字、引用符、句読記号、
内側の連続空白を変えない。空にはならないが、非 ASCII 空白だけでもよい。
1 語だけの例でもこの型を使う。
[fixture: treeview/gram-written-tree] [fixture: treeview/db-bare-internal-space]
[fixture: treeview/db-bare-tail-space] [fixture: treeview/space-line-nbsp]
[fixture: treeview/box-quoted-branch] [fixture: treeview/directive-bare-middle]

### TreeviewLiteral

| 欄      | 型     | 意味                                      |
| ------- | ------ | ----------------------------------------- |
| `value` | string | 書かれた共通値または description の本文。 |

子の欄は無い。範囲: 親が定める本文の最初から最後の字まで。
内側の共有 trivia をまたぐ。
value は共有 directive・コメント領域・選択されたセミコロンを除き、
それ以外の書かれた字と所有する空白を正規化せず保つ。
null の欄に空の literal を作らず、空白だけの内容も非空とする。
[fixture: treeview/gram-written-tree]
[fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/common-block-whitespace-raw]
[fixture: treeview/directive-description-middle]
[fixture: treeview/common-block-directives]
[fixture: treeview/common-block-comments] [fixture: treeview/entity-block]

この葉に包まれる罫線の形は、直接の字句の読みで字下げを表したり、
末尾空白を外したり、装飾を除いたりする場合も書かれた value の一部として残す。
重なる子へ移さず、比較 Db の値へ literal を書き換えない。
[fixture: treeview/box-block-decoration]
[fixture: treeview/box-trim-block-closing-brace]
[fixture: treeview/block-physical-selected-semicolon]

### TreeviewBranchPrefix

| 欄       | 型     | 意味                            |
| -------- | ------ | ------------------------------- |
| `value`  | string | 書かれた prefix の綴り。        |
| `marker` | string | `└`、`┗`、`├`、`┣` のいずれか。 |

子の欄は無い。範囲: 物理的な行の最初の非空白の字から、
最初の branch と直後の dash 列の終端まで。
先頭の空白と dash 列の後の区切り空白を含めない。
value は共有 trivia 以外の全字を保ち、任意のテキスト、引用符、縦線、
light/heavy の dash の混在も保つ。marker は固定の branch の文字であり、
Identifier ではない。
[fixture: treeview/box-prefix-nonbmp-column]
[fixture: treeview/box-written-tree] [fixture: treeview/box-prefix-arbitrary]
[fixture: treeview/box-quoted-branch] [fixture: treeview/box-heavy]
[fixture: treeview/box-branch-no-dash]
[fixture: treeview/box-branch-directive-parts]
[fixture: treeview/box-dash-directive-inside]

この node は罫線の直接規則のもとで割り当てる字下げや前置空白を表し、
列・幅・深さの導出欄は持たない。範囲の前の原文の空白も列に数える。
prefix は node、注釈、共通文、必須の block の開きの gap に属しうる。
既存の値の中ではその葉の綴りに残し、重なる prefix の子を作らない。
[fixture: treeview/box-written-tree] [fixture: treeview/box-annotation-prefix]
[fixture: treeview/ast-annotation-prefixes]
[fixture: treeview/box-common-prefix]
[fixture: treeview/box-branch-before-block-open]
[fixture: treeview/ast-prefix-inside-and-outside]

### TreeviewIgnoredText

| 欄      | 型     | 意味                 |
| ------- | ------ | -------------------- |
| `kind`  | string | `box-decoration`。   |
| `value` | string | 書かれた装飾の綴り。 |

子の欄は無い。範囲: 装飾の行の最初から最後の非空白の字まで。
外端の空白と読みから外れる後続の改行を node の外に置く。
value は共有 trivia 以外の罫線の字と内側の空白を保つ。非空であり、
kind は常に box-decoration。空白だけの行はこの node を作らない。
[fixture: treeview/box-written-tree] [fixture: treeview/box-mode-dash-only]
[fixture: treeview/box-unicode-decoration]

外側の装飾は、最後のものも含め、
gap の所有に従って名前のある gap か body に一つずつ保つ。名前として公開せず、
複数の owner に重ねず、葉の内側の装飾を取り出さない。
native な percent の形はこの型ではなく共有 Comment のままである。
[fixture: treeview/box-written-tree]
[fixture: treeview/box-decoration-trailing-body]
[fixture: treeview/box-decoration-before-annotation]
[fixture: treeview/box-decoration-before-block-open]
[fixture: treeview/ast-decoration-internal-and-body]
[fixture: treeview/box-comment-indent-carry]

## 例

この例は整形の方針を選ぶのではなく、書かれた字下げと綴りを示す。
平らな body に共通の 4 種の文、その後に 3 個の node がある。
最初の node は二つの class、二つの icon、description を保ち、
子は引用名の末尾の空白を、最後の node は一重引用符の空名を保つ。
[fixture: treeview/gram-written-tree]

```mmd
treeView-beta
title  Tree
accTitle:  Access
accDescr: Line
accDescr {  Block
  text  }
root/ :::first icon(pack:file) :::last icon() ##  detail
  "child/ "
''
```

罫線の例でも root/ と branch の各行は記述順のままである。
src/ と子の間の縦の装飾は別の body item であり、
src/ は class・icon・description を保つ。原文の階層を合成せず、
元の列から prefix の深さを解釈する。 [fixture: treeview/box-written-tree]

```mmd
treeView-beta
root/
├── src/ :::high icon(folder) ## entry
│
│   └── "my file"
└── other
```
