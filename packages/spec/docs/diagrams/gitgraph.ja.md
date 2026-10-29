# gitgraph

英語版: [gitgraph.md](./gitgraph.md)

この文書は `gitgraph` を定義します。
ソースの木は [ast/gitgraph.md](../ast/gitgraph.md)、
受理に使わない表示用の導出値は、
[tests の要約](../../../tests/docs/db-summaries.md#gitgraph)にあります。

構文の根拠は
[gitGraph.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/gitGraph/gitGraph.langium)、
取り込まれる
[common.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium)
と、
[reference.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/gitGraph/reference.langium)
です。
受理条件は
[gitGraphAst.ts](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/git/gitGraphAst.ts)
にも従います。

## 検出

[detection.md](../detection.md) の項目 19 は、
大文字と小文字を区別して接頭辞 `gitGraph` を選び、末尾の境界を要求しません。
接尾辞つきの見出しも検出しますが、以下の規則で拒否されます。
`gitgraph` と `GitGraph` は別名ではありません。 [fixture: gitgraph/header-only]
[fixture: gitgraph/detect-letter-suffix] [fixture: gitgraph/detect-lowercase]
[fixture: gitgraph/detect-uppercase]

見出しは `gitGraph`、`gitGraph:`、`gitGraph :`、
または `gitGraph` に `LR`・`TB`・`BT` と必須のコロンが続く形です。
コロンは見出しを閉じ、方向や文の一部ではありません。
分離したコロンや方向の前に、読み飛ばされない改行は置けません。
`gitGraph:commit` は受理し、接着した `gitGraph:` の後の方向は拒否します。
[fixture: gitgraph/header-only] [fixture: gitgraph/header-colon]
[fixture: gitgraph/header-spaced-colon] [fixture: gitgraph/header-lr]
[fixture: gitgraph/header-tb] [fixture: gitgraph/header-bt]
[fixture: gitgraph/header-direction-no-colon]
[fixture: gitgraph/header-visible-lf-before-colon]
[fixture: gitgraph/header-visible-lf-before-direction]
[fixture: gitgraph/header-colon-commit-inline]
[fixture: gitgraph/header-glued-direction-keyword]

共通の先頭 trivia、実際のフロントマター、ディレクティブ、コメント領域、
HTML 属性の引用符、エンティティ、選択されるセミコロンを適用します。
本文だけの HTML 規則でも、
フロントマターのタイトルは Mermaid がフロントマターから得る値です。
[fixture: gitgraph/frontmatter-title] [fixture: gitgraph/frontmatter-config]
[fixture: gitgraph/directive-in-string] [fixture: gitgraph/entity-all-fields]
[fixture: gitgraph/html-all-texts]
[fixture: gitgraph/div-frontmatter-cross-title-value]

検出は、
共通の [フロントマター](../common.md#frontmatter)
の形を満たす先頭以外のブロックを、
裸の `%%` 行と 2 回目の走査より前に 1 個だけ通過します。
ブロックは図のテキストとして残り、隠れた YAML の規則にも一致する必要があります。
YAML のプロパティを適用せず GitgraphIgnoredText に持ちます。
実際のフロントマターの後にも置けます。
2 個目や 2 回目の走査の後のブロックは通過しません。
残したブロックの後に 2 回目の走査の形を置くことはできます。
[fixture: gitgraph/lex-yaml-after-comment]
[fixture: gitgraph/detect-block-after-real-frontmatter]
[fixture: gitgraph/detect-two-nonleading-blocks]
[fixture: gitgraph/detect-second-scan-directive-before-block]
[fixture: gitgraph/detect-block-before-second-scan-directive]

本文行のない隣接した囲み、未閉鎖、字下げの不一致、開始の 4 個のダッシュ、
終了の囲みの接尾辞、終了後の改行の欠落、先行する裸の `%%` 行は、
この通過を妨げます。
先頭の字下げだけが除かれ、終了側だけに字下げが残る場合も同じです。
囲みが 3 行隣接すると、中央の行が共通の本文行になります。
検出に一致しても、固有の開始や終了の境界は緩和されません。
開始側の非 ASCII の空白や終了後の読めない Unicode の空白は拒否します。
[fixture: gitgraph/lex-nonleading-adjacent-detection]
[fixture: gitgraph/detect-retained-unclosed]
[fixture: gitgraph/detect-retained-mismatched-indent]
[fixture: gitgraph/detect-retained-opening-four-dashes]
[fixture: gitgraph/detect-retained-closing-suffix]
[fixture: gitgraph/detect-retained-no-closing-lf]
[fixture: gitgraph/detect-bare-before-retained-block]
[fixture: gitgraph/detect-block-equally-indented-fences]
[fixture: gitgraph/lex-nonleading-three-detection]
[fixture: gitgraph/detect-retained-opener-bom]
[fixture: gitgraph/detect-retained-closer-u3000]

残された 2 回目の走査のディレクティブは、
終了の境界を含めて隠れた DIRECTIVE の規則に従います。
見出しの前に複数の形が残る場合もあります。
検出が通過する裸の行は、`%%{}%%` や未閉鎖の `%%{!` も含め、
印が `%%` の共有 Comment です。
無視するテキストのノードではありません。
これらの行と一緒に通過した空白・改行は、どちらも読み直しません。
[fixture: gitgraph/lex-hidden-directive-second-scan]
[fixture: gitgraph/lex-hidden-directive-second-scan-glued]
[fixture: gitgraph/detect-two-second-scan-forms]
[fixture: gitgraph/detect-bare-brace-eof-header]
[fixture: gitgraph/detect-bare-unclosed-before-header]

裸の行の後に通過した共通の空白は、単独の行でも見出しの直前でも、
残した形どうしの間でも trivia です。
Mermaid は CR 変換後の ASCII の空白・タブ・LF 以外をそこで拒否します。
この仕様は
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md)
として受理します。
裸の行を通過していなければ、後の Unicode の空白は通常の字句規則に従います。
[fixture: gitgraph/div-detect-bare-before-header-ls]
[fixture: gitgraph/div-detect-bare-bom-line]
[fixture: gitgraph/detect-bare-before-header-space]
[fixture: gitgraph/detect-bare-tab-line]
[fixture: gitgraph/div-detect-retained-directive-bare-bom]
[fixture: gitgraph/div-detect-retained-yaml-bare-ls-line]
[fixture: gitgraph/div-lex-preheader-bare-between-retained-unicode]
[fixture: gitgraph/lex-preheader-hidden-no-bare-unicode]
[fixture: gitgraph/lex-leading-ls-ps]

## 字句構造

### 優先順の規則

[common.md](../common.md#reading-a-source) の図のテキストを検出点から読み、
上記の検出で通過した区間を除きます。
各単位の開始で次の順に最初の一致を取り、その後から繰り返します。
一般的な最長一致は行いません。
読めない文字や残った単位があれば、有効な接頭部の後でも図全体を拒否します。
[fixture: gitgraph/lex-error-before-statement]
[fixture: gitgraph/lex-error-after-valid-prefix]
[fixture: gitgraph/gram-error-recovered-statement]
[fixture: gitgraph/lex-reference-common-prefix]

1. キーワードを次の順で試します。
   `cherry-pick`、`gitGraph:`、`HIGHLIGHT`、`gitGraph`、`checkout`、 `REVERSE`、
   `parent:`、`commit`、`NORMAL`、`branch`、`order:`、 `switch`、`type:`、
   `merge`、`msg:`、`tag:`、`id:`、`LR`、`TB`、 `BT`、`:`。
2. `acc-descr-line` または `acc-descr-block`。
3. `acc-title-line`。
4. `title-line`。
5. `unsigned-integer`。
6. `string`。
7. `newline`（LF）。
8. 隠れた ASCII の空白。
9. 隠れた YAML。
10. 隠れた DIRECTIVE。
11. 図のコメント。
12. `bare-reference`。

説明、タイトル、文字列、隠れた形、参照の競合は上記の順に決めます。
真偽値、一般の符号つき数、一般の識別子という別の選択肢はありません。
[fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/lex-reference-common-prefix]
[fixture: gitgraph/lex-reference-boolean-spellings]
[fixture: gitgraph/lex-hidden-directive-string]
[fixture: gitgraph/lex-hidden-directive-block]
[fixture: gitgraph/lex-reference-trailing-dash]

### キーワードと構成要素

キーワードは大文字と小文字を区別します。
分離した `gitGraph` の語だけが、直後の共通の空白、テキストの終わり、
または `%%` を要求します。
共通のディレクティブと選択されたセミコロンを除いたテキストで判定し、
除いたディレクティブだけでは境界になりません。
接着した `gitGraph:` にはこの条件がありません。
[fixture: gitgraph/header-glued-direction]
[fixture: gitgraph/header-colon-commit-inline]
[fixture: gitgraph/directive-after-header-glued]
[fixture: gitgraph/directive-header-space]
[fixture: gitgraph/header-global-before-colon]
[fixture: gitgraph/header-colon-global-glued-statement]

ほかの語のキーワードより長い裸の参照が一致すれば、参照を取ります。
同じ長さならキーワードを取ります。
`commitA` と `LRname` は名前になりますが、
`commit`・`LR`・`NORMAL` は名前になりません。
キーワードの直後に引用符を置けます。
title の接頭部は裸の参照より先に読み、`titleA` は裸の分岐名になりません。
区切りのない `accTitleA` と `accDescrA` は名前になります。
引用符で囲むと、これらの競合を避けられます。
[fixture: gitgraph/lex-reference-keyword-prefixes]
[fixture: gitgraph/lex-reference-reserved]
[fixture: gitgraph/lex-reference-lr-prefix]
[fixture: gitgraph/lex-reference-reserved-direction]
[fixture: gitgraph/lex-reference-reserved-type]
[fixture: gitgraph/gram-commit-glued-options]
[fixture: gitgraph/lex-reference-common-prefix]
[fixture: gitgraph/lex-reference-acctitle-prefix]
[fixture: gitgraph/lex-reference-accdescr-prefix]
[fixture: gitgraph/lex-reference-title-prefix-quoted]
[fixture: gitgraph/lex-reference-title-case-control]

option の語 `id`・`msg`・`tag`・`type`・`parent`・`order` とコロンは、
書かれた別々の構成要素です。
この境界には共通のディレクティブと選択されたセミコロンを置けます。
通常の ASCII の空白・タブや隠れた形をコロンの前に置くことはできず、
それ以外では導入部を連続して書きます。
コロンと値の間には隠れた形を置けます。
語の中のディレクティブは既存の差異です。
[fixture: gitgraph/lex-option-global-before-colon]
[fixture: gitgraph/lex-order-global-before-colon]
[fixture: gitgraph/lex-parent-global-before-colon]
[fixture: gitgraph/lex-selected-semicolon-option-word-colon]
[fixture: gitgraph/lex-option-global-before-colon-spaced-control]
[fixture: gitgraph/lex-option-hidden-before-colon]
[fixture: gitgraph/gram-commit-colon-space]
[fixture: gitgraph/lex-hidden-directive-between-option-value]
[fixture: gitgraph/div-directive-in-option-keyword]

分離した見出しの語・方向・コロンの隙間には、隠れた完全な形を置けますが、
読み飛ばされない LF は置けません。
方向にダッシュを接着すると、裸の参照がその部分を先に持つ場合があります。
`TB---` は `TB` と隠れた YAML ではありません。
完全な方向とコロンの境界には共通の trivia を置けます。
[fixture: gitgraph/header-hidden-before-colon]
[fixture: gitgraph/header-hidden-before-direction]
[fixture: gitgraph/header-hidden-before-direction-colon]
[fixture: gitgraph/header-hidden-before-direction-colon-spaced]
[fixture: gitgraph/header-two-hidden-forms]
[fixture: gitgraph/header-global-between-direction-colon]
[fixture: gitgraph/lex-selected-semicolon-header-word-colon]

### 数と参照

符号なし整数は 0 単独、または 0 以外の ASCII の数字と、
その後の 0 個以上の ASCII の数字です。
後者では、選んだ末尾の直後がドットであってはいけません。
0 の選択肢にはこの判定がなく、後者は末尾の条件を満たすよう一致を短くできます。
order は符号、先頭の 0、小数、指数、非有限値の語を拒否します。
精度の損失や桁あふれだけでは、有効な綴りを拒否しません。
[fixture: gitgraph/number-zero] [fixture: gitgraph/number-negative-zero]
[fixture: gitgraph/number-plus] [fixture: gitgraph/number-leading-zero]
[fixture: gitgraph/number-decimal] [fixture: gitgraph/number-exponent]
[fixture: gitgraph/number-nan] [fixture: gitgraph/number-infinity]
[fixture: gitgraph/number-precision] [fixture: gitgraph/number-overflow]
[fixture: gitgraph/lex-selected-semicolon-number-control]

裸の参照は ASCII の単語文字で始まります。
後続は ASCII の単語文字・ダッシュ・スラッシュ・ドットで、
複数文字なら単語文字かダッシュで終わります。
先行する規則が一致しなかった後で、この形の最長の一致を取ります。
末尾のドットやスラッシュ、裸の Unicode の文字は拒否します。
整数の優先順により `1`・`1abc`・`0.1`・`0..1`・`12.3` は名前にならず、
`1.5`・`1.2.3`・`9.x` は名前になります。
末尾の複数のダッシュと、最後のダッシュの前のドットは受理します。
[fixture: gitgraph/lex-reference-shape]
[fixture: gitgraph/lex-reference-trailing-dot]
[fixture: gitgraph/lex-reference-trailing-slash]
[fixture: gitgraph/lex-reference-digit]
[fixture: gitgraph/lex-reference-digit-prefix]
[fixture: gitgraph/lex-reference-zero-before-dot]
[fixture: gitgraph/lex-reference-multiple-digits-before-dot]
[fixture: gitgraph/lex-reference-digit-dot]
[fixture: gitgraph/lex-reference-unicode]
[fixture: gitgraph/lex-reference-zero-double-dot]
[fixture: gitgraph/lex-reference-leading-single-nonzero-dot]
[fixture: gitgraph/lex-reference-word-ending-double-dash]
[fixture: gitgraph/lex-reference-dot-before-final-dash]

### 文字列

文字列は対応する一重または二重の引用符で開閉し、空でも構いません。
内容は、対応する引用符と逆斜線以外の文字、または逆斜線とその直後の文字の組です。
組になる文字は LF・CR・LS・PS ではいけません。
エスケープした引用符は文字列を閉じません。
エスケープしていない改行・LS・PS は内容になります。
閉じる引用符は必須で、木ではエスケープの綴りを復号せず保ちます。
[fixture: gitgraph/gram-commit-single-quotes]
[fixture: gitgraph/gram-commit-empty-values]
[fixture: gitgraph/lex-string-escapes] [fixture: gitgraph/lex-string-multiline]
[fixture: gitgraph/lex-string-cr] [fixture: gitgraph/lex-string-crlf]
[fixture: gitgraph/lex-string-ls-ps] [fixture: gitgraph/lex-string-backslash-lf]
[fixture: gitgraph/lex-string-escaped-ls]
[fixture: gitgraph/lex-string-escaped-ps]
[fixture: gitgraph/lex-string-unclosed]
[fixture: gitgraph/lex-string-unknown-unicode-escape]

先に始まった文字列や説明のブロックは、
隠れた YAML／DIRECTIVE に見える形や裸の `%%` を内容として持ちます。
値の中でも、共通のディレクティブとソースのコメント領域は共通の効果を持ちます。
これらは図固有のコメントとは別です。
[fixture: gitgraph/lex-hidden-directive-string]
[fixture: gitgraph/lex-hidden-directive-block]
[fixture: gitgraph/lex-yaml-string] [fixture: gitgraph/lex-yaml-block]
[fixture: gitgraph/comment-bare-string] [fixture: gitgraph/comment-block]
[fixture: gitgraph/directive-in-string]

### 共通の複合形

どの単位の開始でも、共通の形の前に ASCII の字下げを置けます。
`title-line` は `title` 単独、または `title`、1 個の ASCII の空白・タブ、
空でもよい行のテキストを読みます。
`acc-title-line` は `accTitle`、0 個以上の ASCII の空白・タブ、コロン、
空でもよい行のテキストを読み、 `acc-descr-line` は `accDescr` で同じ形です。
行のテキストは最初の `%%` か物理的な行末で終わり、次の行を値に取りません。
コロンの前の Unicode の空白は拒否します。 [fixture: gitgraph/title-tab]
[fixture: gitgraph/title-next-line] [fixture: gitgraph/acctitle-next-line]
[fixture: gitgraph/accdescr-next-line] [fixture: gitgraph/title-nbsp]
[fixture: gitgraph/acctitle-nbsp-colon] [fixture: gitgraph/accdescr-nbsp-colon]
[fixture: gitgraph/comment-title] [fixture: gitgraph/lex-description-line-null]

行の値の中の LS・PS、単独の `%`、セミコロン、コロン、引用符、
逆斜線は通常のテキストです。
引用符に見えても閉じる必要はありません。
ブロックの形は `accDescr`、改行や Unicode の区切りを含む共通の空白、 `{`、
最初の `}` までの内容を読みます。
波括弧は入れ子にならず、引用符と逆斜線は閉じを保護しません。
閉じていないブロックは拒否し、コロンがあれば波括弧の前でも行の形になります。
[fixture: gitgraph/eol-title-ls] [fixture: gitgraph/eol-acctitle-semicolons]
[fixture: gitgraph/common-title-open-quote]
[fixture: gitgraph/common-block-quoted-escape]
[fixture: gitgraph/accdescr-block-gap]
[fixture: gitgraph/accdescr-block-nbsp-gap]
[fixture: gitgraph/lex-description-block-opener-ps]
[fixture: gitgraph/accdescr-block-first-brace]
[fixture: gitgraph/accdescr-block-quoted-brace]
[fixture: gitgraph/accdescr-block-escaped-brace]
[fixture: gitgraph/accdescr-block-unclosed]
[fixture: gitgraph/gram-accdescr-colon-brace]

### 空白とコメント

先行する規則の後で、ASCII の空白・タブの空でない最長の列を飛ばします。
LF は読み飛ばされない改行で、共通の CR・CRLF 変換により、
物理的な各行終端を 1 個の LF として読みます。
追加する LF の前の EOF も含め、ほかの共通の空白は通常の区切りになりません。
ただし、囲む値の内容や共通の先頭 trivia にはなれます。
[fixture: gitgraph/lex-tab] [fixture: gitgraph/lex-cr]
[fixture: gitgraph/lex-crlf] [fixture: gitgraph/lex-ls]
[fixture: gitgraph/lex-ps] [fixture: gitgraph/lex-body-nbsp]
[fixture: gitgraph/lex-body-vt] [fixture: gitgraph/lex-body-ff]
[fixture: gitgraph/lex-body-u202f] [fixture: gitgraph/lex-body-bom]
[fixture: gitgraph/lex-leading-bom] [fixture: gitgraph/lex-leading-ls-ps]

図固有のコメントは、任意の ASCII の字下げ、`%%`、
物理的な行末までの最長のテキストです。
印は `%%`、値はその後のテキストで、終了の LF と直前の文字を取りません。
LS・PS は値の中に残ります。
1 個の `%` はコメントではありません。
書かれた 2 個の `%` の間には共通のディレクティブを置けます。
隠れた DIRECTIVE が一致しなければ、この規則に戻る場合があります。
[fixture: gitgraph/comment-commit-glued]
[fixture: gitgraph/comment-native-ls-content]
[fixture: gitgraph/comment-native-ps-content]
[fixture: gitgraph/comment-single-percent]
[fixture: gitgraph/comment-between-mark-characters]
[fixture: gitgraph/lex-hidden-directive-fallback-complete-statement]

### 隠れた YAML

単位の開始で、`---`、0 個以上の ASCII の空白・タブ、
LF が隠れた YAML を開きます。
物理的な行の先頭でなくても構いません。
まず本文がある形を試し、できるだけ少ない任意の文字を、後続の LF と、
その後の字下げのない `---` まで読みます。
閉じの直後は LF、共通の空白、または EOF でなければいけません。
本文がある一致がなければ、開始の LF の直後が閉じの、空の本文を試します。
YAML の内容は検証しません。 [fixture: gitgraph/lex-yaml-invalid-body]
[fixture: gitgraph/lex-yaml-empty-body]
[fixture: gitgraph/lex-yaml-three-adjacent-fences]
[fixture: gitgraph/lex-yaml-empty-first-spare-line]
[fixture: gitgraph/lex-yaml-body-ls-ps]

この優先順では、最初の後続の囲みも本文になる場合があります。
隣接する囲みの 3 行は 1 個の形で、
空のブロックが 2 個に見えても囲みが余る場合があります。
最初の本文に適格な閉じがあれば、空でない 2 個のブロックは別々です。
`---x` のような不適格な行は後の閉じまで本文に残り、
字下げした閉じは一致しません。
先行する行の値や裸の参照が、開始のダッシュに見える部分を既に持つ場合もあります。
[fixture: gitgraph/lex-yaml-empty-then-nonempty]
[fixture: gitgraph/lex-yaml-empty-followed-later-block]
[fixture: gitgraph/lex-hidden-yaml-two-empty-in-gap]
[fixture: gitgraph/lex-yaml-three-fences-before-value]
[fixture: gitgraph/lex-yaml-two-nonempty-in-gap]
[fixture: gitgraph/lex-hidden-yaml-closer-skips-nonboundary]
[fixture: gitgraph/lex-yaml-indented-closer]
[fixture: gitgraph/lex-hidden-yaml-after-title]
[fixture: gitgraph/lex-hidden-yaml-reference-absorbs-dashes]

### 隠れた DIRECTIVE と行末

任意の ASCII の空白の後の `%%{` が隠れた DIRECTIVE を開きます。
任意の文字を、直後が LF、共通の空白、
または EOF となる最初の `}%%` まで読みます。
本文は空でも、改行・LS・PS を含んでも構いません。
境界を満たさない閉じは、適格な閉じまで本文に残します。
適格な閉じがなければ、後のコメントの規則を試します。
[fixture: gitgraph/lex-hidden-directive-between-option-value]
[fixture: gitgraph/lex-hidden-directive-boundary-word]
[fixture: gitgraph/lex-hidden-directive-boundary-ls]
[fixture: gitgraph/lex-hidden-directive-closer-skips-nonboundary]
[fixture: gitgraph/lex-hidden-directive-fallback-complete-statement]

どちらの隠れた形も、閉じの直後の LF を消費します。
ほかの空白の境界は確認するだけで、その後に読むものとして残します。
隠れた形自体は EOL になりません。
完了した文と次の文を区切る唯一の LF を消費すると、入力を拒否します。
追加の LF や、閉じの後の ASCII の空白・タブがあれば、必要な EOL が残ります。
元の EOF では追加される LF を消費しても、 EOF が EOL を満たします。
[fixture: gitgraph/lex-hidden-directive-after-commit]
[fixture: gitgraph/lex-hidden-directive-commit-spare-lf]
[fixture: gitgraph/lex-hidden-directive-commit-closing-space]
[fixture: gitgraph/lex-hidden-directive-commit-eof]
[fixture: gitgraph/lex-hidden-yaml-after-commit]
[fixture: gitgraph/lex-hidden-yaml-commit-closing-space]
[fixture: gitgraph/lex-hidden-yaml-block-eof]

branch、checkout、switch、merge、cherry-pick と 4 個の共通の形にも、
同じ EOL 条件を適用します。
行の値の後の YAML に見える形は、隠れた末尾ではなく行の内容です。
文の完全な構成要素の間には隠れた形を置けます。
その隙間で消費された LF は、それ自体では文を終わらせません。
[fixture: gitgraph/lex-hidden-directive-after-branch]
[fixture: gitgraph/lex-hidden-directive-after-checkout]
[fixture: gitgraph/lex-hidden-directive-after-switch]
[fixture: gitgraph/lex-hidden-directive-after-merge]
[fixture: gitgraph/lex-hidden-directive-after-cherry-pick]
[fixture: gitgraph/lex-hidden-directive-after-title]
[fixture: gitgraph/lex-hidden-directive-after-acctitle]
[fixture: gitgraph/lex-hidden-directive-after-accdescr]
[fixture: gitgraph/lex-hidden-directive-after-block]
[fixture: gitgraph/lex-hidden-yaml-after-title]
[fixture: gitgraph/lex-option-before-type-value-hidden]
[fixture: gitgraph/lex-branch-between-name-order-hidden]

読み飛ばす各形には、所有者の決まった GitgraphIgnoredText ノードがあります。
後続の消費した LF は範囲と値に含めず、追加する LF はソースの一部にしません。
形の中の共通のディレクティブとコメント領域は trivia で、
認識された init ディレクティブの設定の効果は独立して保ちます。
隠れた形自体はフロントマターや設定にはなりません。
[fixture: gitgraph/lex-hidden-yaml-global-directive-body]
[fixture: gitgraph/lex-hidden-yaml-global-comment-body]
[fixture: gitgraph/lex-hidden-directive-global-comment-body]
[fixture: gitgraph/lex-yaml-common-init-effect]
[fixture: gitgraph/lex-hidden-directive-common-init-effect]
[fixture: gitgraph/lex-yaml-after-comment]

## 文法

記法は [common.md](../common.md#notation) に従います。
隠れた形は [ast/gitgraph.md](../ast/gitgraph.md) の隙間や本文の場所に入り、
読み飛ばされない文法の単位を追加しません。 [fixture: gitgraph/header-only]
[fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/lex-hidden-directive-between-option-value]

```text
diagram = newline* header body-item* end-of-text
header = "gitGraph" (":" | direction ":")? | "gitGraph:"
direction = "LR" | "TB" | "BT"
body-item = statement | common-statement | newline
statement = commit-statement | branch-statement | checkout-statement
          | merge-statement | cherry-pick-statement
commit-statement = "commit" commit-option* eol
commit-option = id-option | message-option | tag-option | type-option
branch-statement = "branch" branch-reference order-option? eol
checkout-statement = ("checkout" | "switch") branch-reference eol
merge-statement = "merge" branch-reference merge-option* eol
merge-option = id-option | tag-option | type-option
cherry-pick-statement = "cherry-pick" cherry-pick-option* eol
cherry-pick-option = id-option | parent-option | tag-option
id-option = "id:" string
message-option = "msg:"? string
tag-option = "tag:" string
type-option = "type:" ("NORMAL" | "REVERSE" | "HIGHLIGHT")
parent-option = "parent:" string
order-option = "order:" unsigned-integer
branch-reference = bare-reference | string
common-statement = title-line eol | acc-title-line eol
                 | acc-descr-line eol | acc-descr-block eol
eol = newline+ | end-of-text
```

| Rule                                     | Node                                                           |
| ---------------------------------------- | -------------------------------------------------------------- |
| diagram, header, direction               | GitgraphDiagram fields.                                        |
| commit-statement                         | GitgraphCommitStatement.                                       |
| branch-statement                         | GitgraphBranchStatement.                                       |
| checkout-statement                       | GitgraphCheckoutStatement.                                     |
| merge-statement                          | GitgraphMergeStatement.                                        |
| cherry-pick-statement                    | GitgraphCherryPickStatement.                                   |
| id-option, message-option, tag-option    | GitgraphIdOption, GitgraphMessageOption, GitgraphTagOption.    |
| type-option, parent-option, order-option | GitgraphTypeOption, GitgraphParentOption, GitgraphOrderOption. |
| title-line, acc-title-line               | GitgraphTitleStatement, GitgraphAccTitleStatement.             |
| acc-descr-line, acc-descr-block          | GitgraphAccDescrStatement, GitgraphAccDescrBlockStatement.     |
| bare-reference, string, unsigned-integer | Identifier, StringLiteral, NumericLiteral.                     |
| Common value; hidden form                | GitgraphLiteral; GitgraphIgnoredText.                          |

本文は空でも構いません。
commit の id・message・tag・type と、merge の id・tag・type は、
任意の順で繰り返せます。
裸の引用文字列と `msg:` はどちらも message option です。
cherry-pick の id・parent・tag も任意の順で繰り返せます。
すべての出現をソース順に保ちます。
branch は必須の名前の後に order を高々 1 個置けます。
checkout と switch は名前をちょうど 1 個要求します。
[fixture: gitgraph/header-only] [fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/gram-merge-repeated-options]
[fixture: gitgraph/gram-cherry-pick-repeated-options]
[fixture: gitgraph/gram-branch-repeated-order] [fixture: gitgraph/gram-checkout]
[fixture: gitgraph/gram-switch] [fixture: gitgraph/gram-all-fields]

必須の値の欠落、未知の option、merge の message、
cherry-pick の type や裸の message、2 個目の見出し、未対応の reset、
必須の構成要素の間の読み飛ばされない改行、同じ行の 2 個の通常の文は拒否します。
共通の行の値では、後の文に見える部分もテキストとして持つ場合があります。
完了した説明のブロックにも EOL が必要です。
追加される LF により、最後の文は書かれた行終端なしで終われます。
その LF はソースの文字ではありません。
[fixture: gitgraph/gram-commit-msg-missing]
[fixture: gitgraph/gram-commit-unknown-option]
[fixture: gitgraph/gram-merge-message]
[fixture: gitgraph/gram-cherry-pick-unknown-option]
[fixture: gitgraph/gram-reset-unsupported]
[fixture: gitgraph/gram-one-line-two-commits]
[fixture: gitgraph/directive-before-option-value-line]
[fixture: gitgraph/eol-title-semicolons] [fixture: gitgraph/eol-block-semicolon]
[fixture: gitgraph/eol-block-eof] [fixture: gitgraph/eol-commit-eof]
[fixture: gitgraph/gram-second-header]

### 意味上の受理条件

書かれた文を木で表せても、以下は受理条件です。
既定の設定では、これらの条件は木だけで判定します。
初期分岐の既定の名前は `main` です。
変換後の比較値には gitgraph のエスケープ設定を使います。
`gitGraph.htmlLabels` は未設定で実効値は true、
`gitGraph.securityLevel` は未設定です。
ルートの既定値 `securityLevel: strict` は、
この未設定の gitgraph の値を補いません。
変換後の値は、 [以下の比較規則](#比較値)で定義します。
[fixture: gitgraph/db-duplicate-main]
[fixture: gitgraph/db-duplicate-converted-branch]
[fixture: gitgraph/html-all-texts] [fixture: gitgraph/config-security-strict]
[fixture: gitgraph/config-security-loose]

フロントマターの `config` と init ディレクティブの引数は、
[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md)
により内容を解釈しません。
これらは受理条件の `gitGraph.mainBranchName` と `gitGraph.htmlLabels` を変えず、
上記の既定値を使います。
比較の参照ではこの鍵だけを除き、
Mermaid が導くタイトルや Db にだけ効く設定を残します。
[fixture: gitgraph/div-frontmatter-main-branch-preserves-title]
[fixture: gitgraph/div-frontmatter-html-labels-default-comparison]
[fixture: gitgraph/div-init-html-labels-default-comparison]
埋め込み設定により mermaid.js の受理が変わる入力は、両方向でこの差異です。
mermaid.js が受理してこの仕様が拒否する場合も、その逆の場合も含みます。
[fixture: gitgraph/docs-community-contributing-05cdc44b]
[fixture: gitgraph/docs-syntax-gitgraph-2ea99686]
[fixture: gitgraph/div-frontmatter-main-branch-duplicate-default-accepted]
[fixture: gitgraph/div-frontmatter-main-branch-checkout-default-accepted]
[fixture: gitgraph/div-init-main-branch-duplicate-default-accepted]

既定の secure key の規則では、`securityLevel` は入れ子の中も含めて secure です。
フロントマターと init ディレクティブでは、
root の `securityLevel` と `gitGraph.securityLevel` を変更できません。
これらの設定の試みは、Mermaid が既に除きます。
gitgraph の値は、テキストの外のサイト設定では与えられます。
[fixture: gitgraph/frontmatter-security-level-secure]
[fixture: gitgraph/directive-security-level-secure]
[fixture: gitgraph/config-gitgraph-loose]

サイトの設定はテキストの外にあります。
サイトの初期分岐名やエスケープの変更により、mermaid.js の受理も変わり得ます。
[設定（参考）](../../../tests/docs/configuration.ja.md#設定参考)と同じく、
サイトの設定に依存する条件は、それを持つ側がその設定を使って適用します。
残りの条件は木だけで判定します。
`gitGraph.htmlLabels` の無効化や `gitGraph.securityLevel` の loose への変更は、
エスケープを変えます。
ルートの `htmlLabels` や `securityLevel` だけを変えても、
この比較値は変わりません。 [fixture: gitgraph/config-main-branch]
[fixture: gitgraph/config-gitgraph-html-false]
[fixture: gitgraph/config-gitgraph-loose] [fixture: gitgraph/config-html-false]
[fixture: gitgraph/config-security-loose]

設定の例は、サイトの設定と内容を解釈しない埋め込み設定を区別します。

- 初期分岐名が `trunk`、その順序が 5 になります。
  [fixture: gitgraph/config-main-branch]
- 初期分岐名が空の文字列になり、 `main` に戻しません。
  [fixture: gitgraph/config-main-empty-name]
- 初期分岐名がそのままの `<b>main</b>` になり、
  書かれた分岐名や参照名に適用するエスケープを行いません。
  [fixture: gitgraph/config-main-html]
- 初期分岐名が `__proto__` になり、通常の名前として扱います。
  [fixture: gitgraph/config-main-prototype]
- Mermaid は init ディレクティブから初期名 `trunk` と順序 3 を得ます。
  ここでは引数の内容を解釈しないため、
  受理条件には引き続き `main` と既定のエスケープを使います。
  [fixture: gitgraph/directive-config]

#### 比較値

比較値は、[エンティティの規則](../common.ja.md#エンティティ) で、
エンティティ参照をプレースホルダの文字列に置き換えた後の値です。
[fixture: gitgraph/db-compare-entity-placeholder-duplicate]
[fixture: gitgraph/db-compare-entity-literal-hash-distinct]

以下の比較規則は、branch・checkout・switch・merge の分岐名、
commit・merge の commit id、cherry-pick の元の id と parent id に適用します。
受理条件の等しさを定義するもので、木は書かれた綴りを保ちます。
裸の参照はその文字を使います。
どちらの引用符の文字列も、内部の下記のエスケープを 1 回だけ復号して使います。
結果の文字が同じ裸の参照と引用文字列は、等しい値として比較します。
[fixture: gitgraph/db-compare-bare-and-quoted]
[fixture: gitgraph/db-compare-branch-lookups]
[fixture: gitgraph/db-duplicate-converted-branch]
[fixture: gitgraph/db-converted-duplicate-id]
[fixture: gitgraph/db-compare-source-parent-from-escaped-ids]
[fixture: gitgraph/db-compare-escaped-source-parent]
[fixture: gitgraph/db-compare-escape-once]

引用文字列の次の逆斜線の組は、表の文字として比較します。
各組は書かれた 2 文字だけを取り、後続の数字でゼロのエスケープを伸ばしません。
[fixture: gitgraph/db-compare-escape-backspace]
[fixture: gitgraph/db-compare-escape-form-feed]
[fixture: gitgraph/db-compare-escape-line-feed]
[fixture: gitgraph/db-compare-escape-carriage-return]
[fixture: gitgraph/db-compare-escape-tab]
[fixture: gitgraph/db-compare-escape-vertical-tab]
[fixture: gitgraph/db-compare-escape-null]
[fixture: gitgraph/db-compare-escape-null-following-digit]

| 書かれた組 | 比較する文字     |
| ---------- | ---------------- |
| `\b`       | U+0008、後退     |
| `\f`       | U+000C、改ページ |
| `\n`       | U+000A、LF       |
| `\r`       | U+000D、CR       |
| `\t`       | U+0009、タブ     |
| `\v`       | U+000B、垂直タブ |
| `\0`       | U+0000、ヌル文字 |

ほかの許される逆斜線の組は、2 文字目だけになります。
そのため `\q` は q、`\"` は二重引用符、`\'` は一重引用符、
`\\` は 1 個の逆斜線、`\/` はスラッシュです。
16 進・Unicode・8 進のエスケープはありません。
`\x41` は x41、`\u0041` は u0041 になり、どちらも A にはなりません。
先の組が作った逆斜線を、もう一度復号しません。
[fixture: gitgraph/db-duplicate-converted-branch]
[fixture: gitgraph/db-converted-duplicate-id]
[fixture: gitgraph/db-compare-escape-double-quote]
[fixture: gitgraph/db-compare-escape-single-quote]
[fixture: gitgraph/db-compare-escape-backslash]
[fixture: gitgraph/db-compare-escape-slash]
[fixture: gitgraph/db-compare-escape-hex-text]
[fixture: gitgraph/db-compare-escape-unicode-text]
[fixture: gitgraph/db-compare-escape-no-hex-unicode-decoding]
[fixture: gitgraph/db-compare-escape-once]

これらの値を読むときは共通の図のテキストを使うため、
文字列に書かれた CR・CRLF は比較の前に LF になります。
一方、復号した `\r` は CR で、その LF とは異なります。
逆斜線に物理的な改行・LS・PS が続く形は、文字列の規則で引き続き拒否します。
[fixture: gitgraph/db-compare-physical-line-endings]
[fixture: gitgraph/db-compare-escape-carriage-return]
[fixture: gitgraph/lex-string-backslash-lf]
[fixture: gitgraph/lex-string-escaped-ls]
[fixture: gitgraph/lex-string-escaped-ps]

それ以外の空白と大文字・小文字は保ちます。
両端の除去、連続する空白の圧縮、タブや Unicode の空白の通常の空白への置換、
大文字・小文字の同一視は行いません。
空の名前と空白だけの名前も異なります。
commit id、cherry-pick の元と親でも同じく保ち、
空白のない値で空白つきの id を参照することはできません。
[fixture: gitgraph/db-compare-padding-and-case]
[fixture: gitgraph/db-compare-inner-whitespace]
[fixture: gitgraph/db-compare-empty-and-whitespace]
[fixture: gitgraph/db-compare-whitespace-id-lookups]
[fixture: gitgraph/db-compare-parent-padding-mismatch]
[fixture: gitgraph/db-compare-source-padding-mismatch]

上記の既定のエスケープ設定では、エスケープの復号後に次の比較用の綴りを使います。
改行の形は `<`、任意のスラッシュ、大文字・小文字を問わない ASCII の br、
0 個以上の共通の空白、任意のスラッシュ、`>` です。
属性つきのタグと末尾の 2 個目のスラッシュは、改行の形に一致しません。
次の手順を順に適用します。

1. 改行の形をすべて、正確に小文字の `#br#` に置き換えます。
2. その結果のテキストの `<` を `&lt;`、`>` を `&gt;`、
   `=` を `&equals;` に置き換え、ほかの文字は変えません。
3. その結果の正確に小文字の `#br#` を、
   重ならない一致で左から `<br/>` に置き換えます。
   置き換えた結果は読み直しません。

書かれた文字と最初の手順で作ったプレースホルダは、最後の一致に一緒に参加します。
`#br<br>` と `<br>br#` は、どちらも最初の手順で `#br#br#`、
最後の手順で `<br/>br#` になります。
同じ分岐の checkout にどちらの綴りも使え、
両方の分岐を作ると重複として拒否します。
比較する値だけの規則で、木のソースのテキストは置き換えません。
[fixture: gitgraph/db-compare-br-overlap-checkout-accepted]
[fixture: gitgraph/db-compare-br-overlap-branch-rejected]
[fixture: gitgraph/db-compare-default-html]
[fixture: gitgraph/db-compare-default-equals]
[fixture: gitgraph/db-compare-break-spellings]
[fixture: gitgraph/db-compare-break-whitespace]
[fixture: gitgraph/db-compare-break-placeholder]
[fixture: gitgraph/db-compare-break-boundaries]
[fixture: gitgraph/html-all-texts] [fixture: gitgraph/lex-branch-html-checkout]

単一値の option を繰り返したときは、比較値には最後の出現だけを使います。
上書きされた前の id や parent は独立に検証しません。
通常の commit と merge では、比較する id の欠落や空は、
書かれた同一性の指定がないことを意味します。
cherry-pick の元の欠落や空は拒否し、parent の欠落や空は親の表明を与えません。
空白だけの id は空ではありません。
[fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/db-overwritten-invalid-source]
[fixture: gitgraph/db-overwritten-invalid-merge-id]
[fixture: gitgraph/gram-cherry-pick-repeated-options]
[fixture: gitgraph/db-state-empty-ids-are-fresh]
[fixture: gitgraph/gram-merge-empty-id]
[fixture: gitgraph/db-cherry-pick-missing]
[fixture: gitgraph/db-cherry-pick-empty-id]
[fixture: gitgraph/gram-cherry-pick-empty-parent]
[fixture: gitgraph/db-compare-whitespace-id-lookups]

#### 書かれた履歴の状態

文をソース順に読みます。
以下の判定のために、存在する分岐と各先端、現在の分岐、HEAD、
各 commit の同一性の現在の定義を保ちます。
先端は commit の同一性か空、HEAD は選択された commit か空です。
各定義は同一性、作成した分岐、種類、順序つきの親の同一性の列を持ちます。
同一性の参照は、置換も含め、常に現在の定義を意味します。
merge commit とは、現在の定義が merge で作られたものです。
通常の commit の表示用 type や merge の type option は、この区別を変えません。
[fixture: gitgraph/db-generated-ids] [fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/db-three-definitions]
[fixture: gitgraph/db-state-visual-type-still-merge]
[fixture: gitgraph/db-state-replacement-removes-merge-kind]

初めは `main` 分岐だけがあり、その先端は空です。
`main` が現在の分岐で、HEAD も空、commit の定義はありません。
この初期名を変えるのは、上記のテキストの外のサイト設定だけです。
空の先端には commit の定義がありません。 [fixture: gitgraph/header-only]
[fixture: gitgraph/db-state-empty-branch-heads]
[fixture: gitgraph/db-merge-self-empty]
[fixture: gitgraph/db-merge-empty-current]
[fixture: gitgraph/db-merge-empty-other]
[fixture: gitgraph/db-cherry-pick-empty-current]

文が空でない比較 id を指定せずに commit を作るときは、
ほかのすべての同一性と異なる、新しい無名の同一性を与えます。
生成名に見える名前も含め、書かれた id でその同一性を参照することはできません。
通常の commit と merge は、代わりに空でない比較 id を指定できます。
cherry-pick は常に無名の同一性を作ります。
記録の generated-commit-N は要約用の綴りで、
その同一性を参照する名前ではありません。 [fixture: gitgraph/db-generated-ids]
[fixture: gitgraph/db-generated-name-collision]
[fixture: gitgraph/db-random-shaped-custom-id]
[fixture: gitgraph/db-state-empty-ids-are-fresh]
[fixture: gitgraph/db-state-generated-looking-source-unknown]
[fixture: gitgraph/gram-cherry-pick]

通常の commit は、現在の分岐に通常の定義を作ります。
親は HEAD が空なら空、そうでなければ直前の HEAD の同一性 1 個です。
id は上記の同一性の規則に従います。
この定義を HEAD にし、現在の分岐の先端だけをその同一性にします。
[fixture: gitgraph/db-three-definitions]
[fixture: gitgraph/db-state-empty-branch-heads]
[fixture: gitgraph/db-state-checkout-head] [fixture: gitgraph/db-duplicate-id]

成功した branch は、比較した名前の分岐を作り、
現在の HEAD の同一性を先端にします。
HEAD が空なら先端も空です。
新しい分岐を現在の分岐にし、その先端を参照して HEAD を設定します。
先端が空なら HEAD も空です。
order の有無でこの履歴への効果は変わりません。
order は表示順を指定し、選択する HEAD や親の同一性を変えません。
成功した checkout・switch は、指定の分岐を現在の分岐にし、
同じ方法でその先端から HEAD を復元します。
commit は作らず、どの先端も変えません。 [fixture: gitgraph/db-generated-ids]
[fixture: gitgraph/db-state-empty-branch-heads]
[fixture: gitgraph/db-state-checkout-head] [fixture: gitgraph/gram-branch-order]
[fixture: gitgraph/gram-branch-order-tie] [fixture: gitgraph/gram-checkout]
[fixture: gitgraph/gram-switch]
[fixture: gitgraph/db-state-replacement-source-origin]

成功した merge は、現在の分岐に merge の定義を作ります。
親の順序は、直前の HEAD の同一性が先、元の分岐の先端の同一性が後です。
空でない比較 id が指定されていればそれを使い、
なければ新しい無名の同一性を使います。
新しい commit を HEAD にし、現在の分岐の先端だけを進めます。
元の分岐の先端は変えません。 [fixture: gitgraph/db-generated-ids]
[fixture: gitgraph/gram-all-fields] [fixture: gitgraph/gram-merge-empty-id]
[fixture: gitgraph/db-state-merge-head-and-source]

成功した cherry-pick は、元の id を現在の定義に解決し、
現在の分岐に新しい無名の同一性を持つ cherry-pick の定義を作ります。
親の順序は、直前の HEAD の同一性が先、元の同一性が後で、
両者が同じでもそのまま 2 個持ちます。
parent option は、元についての受理条件の表明だけです。
新しい親の列を選んだり、元の同一性を表明した親に置き換えたりしません。
新しい commit を HEAD にし、現在の分岐の先端だけを進めます。
元の分岐の先端は変えません。 [fixture: gitgraph/gram-cherry-pick]
[fixture: gitgraph/gram-cherry-pick-merge-parent]
[fixture: gitgraph/db-ordinary-parent-accepted]
[fixture: gitgraph/db-cherry-source-ancestor-on-current-tip]
[fixture: gitgraph/db-state-cherry-head-and-source]

通常の commit が同一性を再利用すると、作成した分岐、種類、親も含め、
現在の定義全体を新しい定義に置き換えます。
ほかの分岐の先端と既存の親の列は、同一性への参照を保ちます。
それらを書き換えたり、参照用に別の古い定義を残したりしません。
そのため、置換した同一性は新しい定義を参照します。
HEAD は置換後の定義になり、通常の commit と同じく現在の分岐の先端を設定します。
自己参照する親や循環を許します。
merge を通常の定義に置き換えた後は、以後の判定で merge ではありません。
[fixture: gitgraph/db-duplicate-id] [fixture: gitgraph/db-three-definitions]
[fixture: gitgraph/db-converted-duplicate-id]
[fixture: gitgraph/db-duplicate-earlier-id-current-head]
[fixture: gitgraph/db-state-replacement-source-origin]
[fixture: gitgraph/db-duplicate-replaces-merge-type]
[fixture: gitgraph/db-state-replacement-removes-merge-kind]

方向、共通のタイトル・アクセシビリティの文、message、tag、隠れた形、コメント、
空白は、この履歴の状態を変えません。
type option は表示を変えるもので、ここで定めた分岐の先端、HEAD、
親の同一性は変えません。 [fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/db-state-common-forms-preserve-head]
[fixture: gitgraph/db-state-visual-type-still-merge]

そのため、`commit`、`branch b`、`commit`、`checkout main`、
`merge b` の順の文は受理します。
最初の commit の同一性を b も共有し、次の commit で b だけが進みます。
checkout は最初の commit を HEAD に戻し、
merge はその同一性と b の新しい先端を順に親として、新しい同一性を作ります。
[fixture: gitgraph/db-generated-ids]

#### 拒否

各文を、文の実行前の履歴と上記の比較値で判定します。
表の条件が 1 個でも成り立てば入力を拒否し、
そうでなければその文の状態の変更を適用します。
直接の親とは、元の同一性の現在の定義にある順序つきの親の列の要素です。
祖先の探索は行いません。
根拠は
[gitGraphAst.ts](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/git/gitGraphAst.ts#L49-L394)
です。 [fixture: gitgraph/db-merge-self]
[fixture: gitgraph/db-cherry-pick-invalid-parent]
[fixture: gitgraph/db-ordinary-parent-accepted]
[fixture: gitgraph/db-cherry-source-ancestor-on-current-tip]
[fixture: gitgraph/db-state-replacement-source-origin]

| 操作                                                            | 拒否条件                                                                                                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| branch                                                          | 初期分岐（既定では `main`）を含め、既存の分岐の実効名を拒否します。初期名のサイト設定の変更は、上記のとおり設定を持つ側が適用します。              |
|                                                                 |
| [fixture: gitgraph/db-duplicate-branch]                         |
|                                                                 |
| [fixture: gitgraph/db-duplicate-main]                           |
|                                                                 |
| [fixture: gitgraph/db-duplicate-converted-branch]               |
|                                                                 |
| checkout / switch                                               | 存在しない分岐の実効名を拒否します。                                                                                                               |
|                                                                 |
| [fixture: gitgraph/db-checkout-unknown]                         |
|                                                                 |
| [fixture: gitgraph/db-switch-unknown]                           |
|                                                                 |
| merge                                                           | 両方の先端があり、現在の先端の commit が指定された元の分岐で作られた場合は拒否します。                                                             |
|                                                                 |
| [fixture: gitgraph/db-merge-current-created-on-source]          |
|                                                                 |
| [fixture: gitgraph/db-merge-same-current-origin-different-head] |
|                                                                 |
| merge                                                           | commit がなくても、現在の分岐への自己 merge を拒否します。                                                                                         |
|                                                                 |
| [fixture: gitgraph/db-merge-self]                               |
|                                                                 |
| [fixture: gitgraph/db-merge-self-empty]                         |
|                                                                 |
| merge                                                           | 現在の先端に commit の定義がない場合、元の分岐が未知の場合、元の先端に commit の定義がない場合、両方の先端が同じ現在の定義を指す場合は拒否します。 |
|                                                                 |
| [fixture: gitgraph/db-merge-empty-current]                      |
|                                                                 |
| [fixture: gitgraph/db-merge-unknown]                            |
|                                                                 |
| [fixture: gitgraph/db-merge-unknown-generated-prefix]           |
|                                                                 |
| [fixture: gitgraph/db-merge-empty-other]                        |
|                                                                 |
| [fixture: gitgraph/db-merge-same-head]                          |
| merge                                                           | 空でない実効 custom id が既存の commit を指せば拒否します。                                                                                        |
|                                                                 |
| [fixture: gitgraph/db-merge-duplicate-id]                       |
|                                                                 |
| [fixture: gitgraph/db-overwritten-invalid-merge-id]             |
|                                                                 |
| cherry-pick                                                     | 元の実効 id が欠落、空、または未知なら拒否します。                                                                                                 |
|                                                                 |
| [fixture: gitgraph/db-cherry-pick-missing]                      |
|                                                                 |
| [fixture: gitgraph/db-cherry-pick-empty-id]                     |
|                                                                 |
| [fixture: gitgraph/db-cherry-pick-unknown]                      |
|                                                                 |
| cherry-pick                                                     | 元が merge でなくても、空でない実効 parent が元の直接の親でなければ拒否します。                                                                    |
|                                                                 |
| [fixture: gitgraph/db-cherry-pick-invalid-parent]               |
|                                                                 |
| [fixture: gitgraph/db-ordinary-parent-accepted]                 |
|                                                                 |
| cherry-pick                                                     | merge が元なら、実効 parent の欠落や空を拒否します。見た目の custom type ではこの条件を除けません。                                                |
|                                                                 |
| [fixture: gitgraph/db-cherry-pick-merge-no-parent]              |
|                                                                 |
| [fixture: gitgraph/db-merge-empty-parent]                       |
|                                                                 |
| [fixture: gitgraph/gram-cherry-pick-merge-parent]               |
|                                                                 |
| cherry-pick                                                     | 元が現在の分岐で作られた場合、または現在の分岐の先端に commit の定義がなければ拒否します。                                                         |
|                                                                 |
| [fixture: gitgraph/db-cherry-pick-same-branch]                  |
|                                                                 |
| [fixture: gitgraph/db-cherry-pick-empty-current]                |
|                                                                 |

祖先関係ではなく作成した分岐を判定し、
merge を通じて既に到達できる元も cherry-pick できます。
cherry-pick の対象 ID を指定する option はありません。
[fixture: gitgraph/db-overwritten-invalid-source]
[fixture: gitgraph/db-overwritten-invalid-merge-id]
[fixture: gitgraph/gram-cherry-pick-repeated-options]
[fixture: gitgraph/db-cherry-source-ancestor-on-current-tip]
[fixture: gitgraph/gram-cherry-pick-unknown-option]

未知の分岐や、cherry-pick・merge の条件の不成立は拒否します。
木で表せることだけでは、逆方向の差異にはなりません。
[fixture: gitgraph/db-duplicate-id] [fixture: gitgraph/db-three-definitions]
[fixture: gitgraph/db-generated-name-collision]
[fixture: gitgraph/db-duplicate-replaces-merge-type]
[fixture: gitgraph/db-checkout-unknown]
[fixture: gitgraph/db-cherry-pick-invalid-parent]

### Db の正規化

[tests の要約](../../../tests/docs/db-summaries.md#gitgraph)は、
この受理判定に不要な値を説明します。
無名の同一性の要約用の綴り、表示用の文字列や tag、共通の値の変換と公開、
数の精度、commit と分岐の要約用・表示用の順序です。
受理に使う比較値と履歴は、その要約ではなく、上記で定義します。
書かれた葉や option・文のすべての出現を木に残します。
描画の要約で省かれる message も、木には保ちます。
[fixture: gitgraph/gram-all-fields] [fixture: gitgraph/lex-string-escapes]
[fixture: gitgraph/number-precision] [fixture: gitgraph/db-generated-ids]
[fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/common-third-values] [fixture: gitgraph/title-repeat-empty]
[fixture: gitgraph/db-three-definitions]
[fixture: gitgraph/gram-cherry-pick-tags]
[fixture: gitgraph/gram-branch-order-tie] [fixture: gitgraph/config-main-branch]

## 既知の差異

**[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md)。**
隠れた完全な形には GitgraphIgnoredText の所有者があり、
共通の trivia は文字列や共通のリテラルを分割できます。
キーワードの語、方向・type の語、整数、裸の参照の内部のディレクティブは、
綴りをつなぎ直さずに別の完全な構成要素として持てません。
直接の単位の規則により、Mermaid が受理する入力を理由 2 の差異として拒否します。
この仕様だけが受理する逆方向の入力はありません。
option の語とコロンの間や引用文字列の中は許し、
両方が拒否する接着した境界の例には印を付けません。
[fixture: gitgraph/div-directive-in-header]
[fixture: gitgraph/div-directive-in-commit]
[fixture: gitgraph/div-directive-in-option-keyword]
[fixture: gitgraph/div-directive-in-type]
[fixture: gitgraph/div-directive-in-number]
[fixture: gitgraph/div-directive-in-reference]
[fixture: gitgraph/lex-option-global-before-colon]
[fixture: gitgraph/directive-in-string]
[fixture: gitgraph/directive-after-header-glued]

**[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md)。**
読み飛ばす完全な形はノードになりますが、語・参照・整数の中の任意のセミコロンは、
別の単位として持てません。
これらの内部で選択されたセミコロンは、Mermaid では綴りをつなぎますが、
理由 2 によりこの仕様では拒否し、逆方向の受理はありません。
option の語とコロンの境界や完全な数の後なら trivia です。
選択されないセミコロンは両方で拒否します。
[fixture: gitgraph/div-style-semicolon-in-order-keyword]
[fixture: gitgraph/div-style-semicolon-in-order-number]
[fixture: gitgraph/div-lex-selected-semicolon-type-word]
[fixture: gitgraph/div-lex-selected-semicolon-bare-reference-valid]
[fixture: gitgraph/lex-selected-semicolon-option-word-colon]
[fixture: gitgraph/lex-selected-semicolon-number-control]
[fixture: gitgraph/lex-selected-semicolon-reference]

**[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md)。**
木はフロントマターと本文の文字列を独立して持てます。
囲みをまたぐ HTML の一致は、その境界を越えずに片方のノードに持てません。
理由 2 の本文だけの直接の HTML 規則により、両方で受理して値が異なる場合、
Mermaid だけが受理する場合、ここだけが受理する場合があります。
フロントマターのタイトルは Mermaid が得る値を保ち、
結果の同じ通常の本文のタグやフロントマターのタグには印を付けません。
[fixture: gitgraph/div-frontmatter-cross-title-value]
[fixture: gitgraph/div-frontmatter-cross-string-enable]
[fixture: gitgraph/div-frontmatter-cross-string-block]
[fixture: gitgraph/frontmatter-body-tag-control]
[fixture: gitgraph/frontmatter-html]

**[embedded-data-opaque](../known-divergences/embedded-data-opaque.md)。**
フロントマターは内容を解釈しないソースのノードを持ちます。
Mermaid が拒否する先頭の不正な YAML は、ここでは受理します。
元の入力への拒否からは Db を得られませんが、
差異の原因となるブロックや鍵だけを除いた参照入力が受理されると、
[比較する Db](../known-divergences/embedded-data-opaque.ja.md#比較する-db)
の規則により、 `specified.json` はその Db と埋め込み値を比較のために記録します。
この 2 つのフロントマターでは、その Db は初期分岐 `main` だけの空の履歴です。
[fixture: gitgraph/div-frontmatter-invalid-yaml]
[fixture: gitgraph/div-frontmatter-html-invalid-yaml]
埋め込み設定は、ここでの受理に使う初期分岐とエスケープの既定値を変えません。
設定により、Mermaid が受理してここでは拒否する場合も、その逆の場合もあります。
[fixture: gitgraph/docs-community-contributing-05cdc44b]
[fixture: gitgraph/docs-syntax-gitgraph-2ea99686]
[fixture: gitgraph/div-frontmatter-main-branch-duplicate-default-accepted]
[fixture: gitgraph/div-frontmatter-main-branch-checkout-default-accepted]
[fixture: gitgraph/div-init-main-branch-duplicate-default-accepted]
先頭以外の不正な隠れた YAML は GitgraphIgnoredText に持て、既に一致します。
Mermaid が受理する不正な init 引数も差異ではありません。
[fixture: gitgraph/div-frontmatter-invalid-yaml]
[fixture: gitgraph/div-frontmatter-html-invalid-yaml]
[fixture: gitgraph/lex-yaml-invalid-body]
[fixture: gitgraph/directive-invalid-init]

**[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md)。**
参照・文字列・共通のリテラル・無視するテキスト・Comment は、
C4 の語を書かれたまま持てます。
理由 2 の逆方向として見出しだけで検出し、後のテキストの `C4Container`、
`C4Component`、`C4Dynamic`、`C4Deployment` により Mermaid が拒否する入力も、
ここでは受理します。
Mermaid が受理する入力をこの規則で拒否することはありません。
後の `C4Context` や、 LF で終わるコメントの対照例は一致します。
[fixture: gitgraph/div-detect-c4container-id]
[fixture: gitgraph/div-detect-c4component-branch]
[fixture: gitgraph/div-detect-c4dynamic-message]
[fixture: gitgraph/div-detect-c4deployment-tag]
[fixture: gitgraph/div-detect-c4container-title]
[fixture: gitgraph/div-detect-c4component-acctitle]
[fixture: gitgraph/div-detect-c4dynamic-accdescr]
[fixture: gitgraph/div-detect-c4deployment-block]
[fixture: gitgraph/div-detect-c4container-comment-eof]
[fixture: gitgraph/div-detect-c4component-header-comment-eof]
[fixture: gitgraph/detect-c4context-id]
[fixture: gitgraph/detect-c4container-comment-lf]

**[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md)。**
通過した裸の各行は共有 Comment、一緒に通過した空白は trivia で、
残した形の後や間でも同じです。
理由 2 の逆方向として、固有の読み方がそこで拒否する共通の空白を受理します。
Mermaid が受理する入力を拒否することはありません。
裸の行を通過していなければ、同じ Unicode の空白も通常の字句規則で拒否します。
[fixture: gitgraph/div-detect-bare-before-header-ls]
[fixture: gitgraph/div-detect-bare-nbsp-line]
[fixture: gitgraph/div-detect-retained-directive-bare-bom]
[fixture: gitgraph/div-detect-retained-yaml-bare-ls-line]
[fixture: gitgraph/div-lex-preheader-bare-between-retained-unicode]
[fixture: gitgraph/detect-bare-before-header-space]
[fixture: gitgraph/lex-preheader-hidden-no-bare-unicode]

隠れた形と重複する commit は、書かれたものをノードに持てるため、
新しい差異を必要としません。
空の引用 option と説明のブロックには固有の構文があり、
tokenless-empty-forms は適用しません。
上流の導入の散文が小文字でも、見出しの別名にはしません。
[fixture: gitgraph/gram-commit-empty-values]
[fixture: gitgraph/lex-description-block-only-directive]
[fixture: gitgraph/db-duplicate-id] [fixture: gitgraph/detect-lowercase]

上流の
[gitgraph.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gitgraph.md)
は、引用した id、分岐の順序、merge、cherry-pick、方向を説明します。
2026-10-23 の確認では、
[#4838](https://github.com/mermaid-js/mermaid/issues/4838) は終了済みで Status:
Approved が付き、
merge 済みの [#6707](https://github.com/mermaid-js/mermaid/pull/6707) は重複 ID
に警告を加えますが拒否しません。
[#3715](https://github.com/mermaid-js/mermaid/issues/3715)
は数字の接頭部の名前を報告し、
merge 済みの [#3726](https://github.com/mermaid-js/mermaid/pull/3726)
は引用した分岐名を対応させました。
[#7125](https://github.com/mermaid-js/mermaid/issues/7125) は未終了で Status:
Approved が付き、
[#7155](https://github.com/mermaid-js/mermaid/pull/7155)
は作成元の判定を変える未 merge の提案です。
これらで pin した受理条件は変えません。
