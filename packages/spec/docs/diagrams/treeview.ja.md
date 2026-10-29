# Treeview

英語版: [treeview.md](./treeview.md)

この文書は、`treeView` として選ばれる `treeView-beta` の構文を定める。
[原文の木](../ast/treeview.ja.md)は書かれた構文を保ち、
導出する値は
[tests の要約](../../../tests/docs/db-summaries.ja.md#treeview)が定める。
[treeView.langium][grammar] と[罫線の読み][box]に従う。
[fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]

## 検出

[detection.md](../detection.ja.md) の項目 28、[treeview の検出器][detector]は、
大文字小文字を区別する接頭辞 `treeView-beta` を選び、その後に境目を要求しない。
文法の見出しも同じ綴りであり、`treeview-beta`、`TREEVIEW-BETA`、
`treeView` はこの図種を選ばない。
検出だけでは受理は決まらない。 [fixture: treeview/header-only]
[fixture: treeview/header-letter] [fixture: treeview/header-lower]
[fixture: treeview/header-upper] [fixture: treeview/header-no-beta]

real な先頭の frontmatter、directive、コメント領域、先頭の trivia、改行、
HTML 属性の引用符、文字参照、
選択されたセミコロンには[共通の読み](../common.ja.md)を適用する。
frontmatter の記録は Root に属し、treeview の文ではない。
先にある C4 の検出器とその差異も適用する。 [fixture: treeview/frontmatter-title]
[fixture: treeview/line-cr] [fixture: treeview/line-crlf]
[fixture: treeview/html-bare] [fixture: treeview/entity-bare]
[fixture: treeview/semicolon-selected]
[fixture: treeview/c4-component-header-eof]

検出点では、裸の percent-pair 行と 2 回目の directive scan より前に、
保持された frontmatter 形のブロックを一つまで通過する。
ブロックは図のテキストのままである。
native な YAML の規則は無いため、検出が通過しても拒否する。
2 個目、裸の行の後、 2 回目の scan の directive の後では、
その通過をやり直さない。
real な frontmatter が保持ブロックに先行してよい。
[fixture: treeview/detect-block-after-directive]
[fixture: treeview/detect-retained-two-blocks]
[fixture: treeview/detect-bare-before-retained]
[fixture: treeview/detect-retained-secondscan-before]
[fixture: treeview/detect-retained-secondscan-after]
[fixture: treeview/detect-block-after-frontmatter]

本文の行が無い隣接 fence、閉じ fence の欠落、字下げの不一致、4 個の dash、
閉じ fence の接尾テキスト、その後の改行の欠落は、ブロックの通過を止める。
先頭の trim で開き fence だけの字下げが無くなり、不一致になることもある。
空白と LF が続く閉じ fence は検出が通過しても native な読みで拒否する。
[fixture: treeview/detect-retained-adjacent]
[fixture: treeview/detect-retained-missing-close]
[fixture: treeview/detect-retained-mismatch]
[fixture: treeview/detect-retained-trimmed-indent]
[fixture: treeview/detect-retained-four]
[fixture: treeview/detect-retained-suffix]
[fixture: treeview/detect-retained-close-no-lf]
[fixture: treeview/detect-retained-close-padding]

保持された 2 回目の scan の形が 1 行なら native な Comment とし、
hidden な Directive の node にしない。
コメントでない閉じの行が残る複数行の形は拒否する。
裸の行は保持されたコメントに先行してよい。
その形の内側の source directive は共有 Directive のままである。
[fixture: treeview/detect-secondscan-singleline]
[fixture: treeview/detect-secondscan-multiline]
[fixture: treeview/detect-bare-before-secondscan]

検出が通過する裸の `%%` 行は共有 Comment である。
付随する空白と改行は、保持された形の周囲でも trivia とし、再び読まない。
Mermaid が拒否する ASCII と Unicode の空白を受理する場合がある。
通過した裸の行が無ければ、その後の空白は native なテキストである。
ASCII space は可視の字下げ、NBSP や U+2028 は bare 名を始めうるが、
いずれも見出しの前では許されない。
本当の先頭の Unicode 空白は先頭の trivia となる。
[fixture: treeview/bare-line-space] [fixture: treeview/bare-line-ls]
[fixture: treeview/bare-line-ps]
[fixture: treeview/detect-secondscan-bare-ascii]
[fixture: treeview/detect-secondscan-bare-unicode]
[fixture: treeview/detect-retained-comment-ascii-header]
[fixture: treeview/detect-retained-comment-unicode-header]
[fixture: treeview/detect-retained-gap-ls-control]
[fixture: treeview/detect-no-bare-unicode-before-header]

## 字句構造

### unit の優先順

共通規則と下記の罫線規則のもとで原文を読む。
各 unit の先頭で最初に当てはまる行を取り、その後で一覧を再び試す。
一般の最長一致ではない。
見出しだけに長い代案があり、
同じ位置の bare-name がより多くの文字を読むなら代わりに bare-name を取る。
読めない文字は拒否する。 [fixture: treeview/header-only]
[fixture: treeview/header-nbsp-custom-boundary]
[fixture: treeview/header-annotation-shorter-bare]
[fixture: treeview/error-after-prefix]

| 順  | unit または trivia               | 読み                                       |
| --- | -------------------------------- | ------------------------------------------ |
| 1   | header                           | `treeView-beta`、下記の境目と長い代案。    |
| 2   | acc-descr-line / acc-descr-block | 前置空白を含む説明。colon 形が先。         |
| 3   | acc-title-line                   | 前置空白を含む colon 形。                  |
| 4   | title-line                       | 前置空白を含む title または裸の語。        |
| 5   | class-annotation                 | 前置 ASCII space/tab、`:::`、class 名。    |
| 6   | icon-annotation                  | 前置 ASCII space/tab、`icon(`、参照、`)`。 |
| 7   | description-annotation           | 前置 ASCII space/tab、`##`、行の本文。     |
| 8   | indentation                      | 最大の非空 ASCII space/tab 列。            |
| 9   | quoted-name                      | 閉じた一重・二重引用名。                   |
| 10  | hidden な ASCII 空白             | indentation に遮られる。                   |
| 11  | native Comment                   | `%%` から LF の直前まで。                  |
| 12  | hidden な改行                    | EOF の論理的な LF も含む。                 |
| 13  | bare-name                        | 下記の名前の形。                           |

[文法][grammar]は共通文法を import しない。
native YAML、hidden directive、可視の EOL の unit は無い。
hidden な ASCII 空白が indentation に優先することはない。
本文の fence は bare 名であり、hidden YAML ではない。
通常の source directive は共通規則で既に読みから外れている。
[fixture: treeview/gram-body-yaml] [fixture: treeview/gram-body-directive]
[fixture: treeview/gram-quoted-tail-space-next-indent]

### 見出しの境目

[見出しの matcher][keyword]は、
正確な keyword の直後に common の Notation の空白、`%%`、
テキストの終端を要求する。
ここでの空白は ASCII space/tab だけでなく、
common の Notation の集合全体である。
word character、数字、dash、colon、非 ASCII の文字はその境目を満たさない。
[fixture: treeview/header-letter] [fixture: treeview/header-digit]
[fixture: treeview/header-word] [fixture: treeview/header-dash]
[fixture: treeview/header-colon] [fixture: treeview/header-unicode]
[fixture: treeview/header-percent]
[fixture: treeview/header-formfeed-custom-boundary]

境目を満たしても見出しが選ばれるとは限らない。
末尾の ASCII space/tab、NBSP、 form feed、inline comment、
同じ行の名前で bare-name が見出しより長くなりうる。
LF は bare-name を延ばさない。
keyword に接する directive は、除去後に LF が残るなら許すが、
欠けた空白を補わず、長い bare 名の読みも止めない。
[fixture: treeview/db-header-tail-space] [fixture: treeview/db-header-tail-tab]
[fixture: treeview/header-nbsp-custom-boundary]
[fixture: treeview/header-formfeed-custom-boundary]
[fixture: treeview/header-percent] [fixture: treeview/box-header-same-line]
[fixture: treeview/header-directive-newline-boundary]
[fixture: treeview/directive-header-glued]
[fixture: treeview/directive-header-space-glued]

### 字下げと行

通常の字下げは ASCII space と tab を各 1 と数える。
最大の一続きの列であり、 tab stop や特定の倍数ではない。
改行は hidden なので、引用名・class・icon の後の列は、
前の行や空白だけの行からでも次の node の字下げになりうる。
hidden な改行で分かれた二つの列は結合せず、
両方が次の名前の前にあれば文法が拒否する。
この拒否条件では、
[branch の prefix](#列と-prefix-の字下げ)が表す字下げも別の列として数える。
[fixture: treeview/db-tabs-one-unit] [fixture: treeview/db-quoted-tail-space]
[fixture: treeview/db-class-tail-space] [fixture: treeview/db-icon-tail-space]
[fixture: treeview/space-line-tab] [fixture: treeview/box-blank-space-indent]
[fixture: treeview/gram-quoted-tail-space-next-indent]
[fixture: treeview/gram-class-tail-space-next-indent]
[fixture: treeview/gram-icon-tail-space-next-indent]
[fixture: treeview/box-tail-quoted-prefix-collision]
[fixture: treeview/box-tail-class-prefix-collision]
[fixture: treeview/box-tail-icon-prefix-collision]
[fixture: treeview/box-tail-collision-directive-inline]
[fixture: treeview/box-tail-collision-directive-line]
[fixture: treeview/box-tail-collision-selected-semicolon]
[fixture: treeview/box-tail-collision-unselected-semicolon]
[fixture: treeview/box-tail-collision-comment-line]
[fixture: treeview/box-tail-collision-empty-line]
[fixture: treeview/box-tail-collision-ls]
[fixture: treeview/box-tail-collision-ps]
[fixture: treeview/box-tail-collision-empty-block]

[branch 行の規則](#列と-prefix-の字下げ)が読みから外す行末の空白は、
次の node の字下げにはならない。 [fixture: treeview/box-tail-branch-no-carry]
[fixture: treeview/box-tail-trim-directive-inline]
[fixture: treeview/box-tail-trim-directive-line]
[fixture: treeview/box-tail-trim-selected-semicolon]
[fixture: treeview/box-tail-trim-unselected-semicolon]
[fixture: treeview/box-tail-trim-comment-line]
[fixture: treeview/box-tail-trim-empty-line]
[fixture: treeview/box-tail-trim-ls] [fixture: treeview/box-tail-trim-ps]
[fixture: treeview/box-tail-trim-empty-block]

間の[罫線の装飾](#行の分類と拒否)は、
通常の行から次の名前へ渡る列を消費も解消もしない。
[fixture: treeview/box-tail-decoration-carry]
[fixture: treeview/box-tail-decoration-directive-inline]
[fixture: treeview/box-tail-decoration-directive-line]
[fixture: treeview/box-tail-decoration-selected-semicolon]
[fixture: treeview/box-tail-decoration-unselected-semicolon]
[fixture: treeview/box-tail-decoration-comment-line]
[fixture: treeview/box-tail-decoration-empty-line]
[fixture: treeview/box-tail-decoration-ls]
[fixture: treeview/box-tail-decoration-ps]
[fixture: treeview/box-tail-decoration-empty-block]

bare 名と description-annotation の本文は、
末尾の ASCII space/tab を自分の中に含める。
directive だけの行の後には可視の字下げが残りうる。
共通のコメント領域には共有の除去規則を適用する。
Unicode 空白は通常の字下げではなく bare 名の字になりうる。
U+2028・U+2029 は行を終えない。 [fixture: treeview/db-bare-tail-space]
[fixture: treeview/db-description-tail-space]
[fixture: treeview/nested-child-directive-line]
[fixture: treeview/nested-child-directive-unindented]
[fixture: treeview/nested-child-comment-line]
[fixture: treeview/nested-child-empty-line] [fixture: treeview/nested-child-ls]
[fixture: treeview/nested-child-ps] [fixture: treeview/space-indent-nbsp]

### 名前

quoted-name は一重または二重の引用符で始まり、
共通規則と罫線規則のもとで次の同じ引用符で閉じる。
内側は空でもよく、改行を越え、 U+2028・U+2029 を含めてよい。
backslash は引用符を保護せず、 escape の decode もしない。
既に始まった bare 名の内側の引用符は通常の文字である。
[fixture: treeview/db-empty-names] [fixture: treeview/db-quote-conversion]
[fixture: treeview/text-double-crlf] [fixture: treeview/text-single-ls]
[fixture: treeview/text-double-ps] [fixture: treeview/lex-bare-quote-interior]

bare-name は ASCII space/tab、CR・LF、一重・二重引用符以外の文字で始まり、
その位置で `:::`、`icon(`、`##` が始まらないものとする。
CR・LF の直前まで読むが、ASCII space/tab に続いて次の形が来る直前で止まる。
`:::` と任意の ASCII space/tab と ASCII letter または underscore、`icon(`、
`##` のいずれかである。
それ以外の空白、引用符、percent のテキスト、句読記号、
Unicode の文字を名前に含めてよい。 [fixture: treeview/db-bare-internal-space]
[fixture: treeview/comment-in-bare] [fixture: treeview/gram-class-no-space]
[fixture: treeview/gram-icon-no-space]
[fixture: treeview/gram-description-no-space]
[fixture: treeview/gram-invalid-class]
[fixture: treeview/bare-invalid-class-zero]

この停止条件は注釈全体の成功を要求しない。
不正な class の接尾は既に始まった bare 名に残りうるが、
引用名の後で新しい bare 名を始めることはできない。
`icon(` で bare-name が止まった後、icon 参照の失敗で拒否する場合もある。
class の接尾が句読記号の前で終わり、別の bare node が残ることもある。
[fixture: treeview/gram-invalid-class]
[fixture: treeview/quoted-invalid-class-fallback]
[fixture: treeview/icon-pack-empty-tail] [fixture: treeview/gram-invalid-icon]
[fixture: treeview/annotation-class-punctuation]
[fixture: treeview/class-unicode-suffix]

### 注釈

各注釈は 1 個以上の ASCII space/tab で始まる。
class-annotation は続いて `:::`、任意個の ASCII space/tab、
ASCII letter または underscore、
任意個の ASCII word character または dash を読む。
名前は 1 字でもよい。 [fixture: treeview/annotation-class-space]
[fixture: treeview/annotation-class-digit]
[fixture: treeview/annotation-class-hyphen]
[fixture: treeview/annotation-class-uppercase]
[fixture: treeview/gram-class-quote-follow]

icon-annotation は正確な小文字の `icon`、`(`、参照、`)` を内側の空白無しで読む。
参照は任意個の ASCII word character または dash と、
それに続く任意の一つの colon と 1 個以上の同じ文字からなる。
空の参照と `:file` を許す。
末尾の colon、2 個目の colon、引用付きの参照、内側の空白は許さない。
接尾が別の node を始めることもある。 [fixture: treeview/db-icon-none]
[fixture: treeview/annotation-icon-leading-colon]
[fixture: treeview/annotation-icon-hyphen]
[fixture: treeview/annotation-icon-underscore]
[fixture: treeview/annotation-icon-uppercase]
[fixture: treeview/icon-pack-empty-tail] [fixture: treeview/gram-invalid-icon]
[fixture: treeview/annotation-icon-quote]
[fixture: treeview/annotation-icon-suffix]

description-annotation は `##` と CR・LF の直前までの全字を読み、
本文が無くてもよい。
U+2028・U+2029、percent のテキスト、同じ行の後の注釈らしい字も含める。
注釈の反復と任意の順を許し、後の行の description は別の注釈になる。
hidden な改行や除去されたコメント行は注釈を直前の node から切り離さない。
[fixture: treeview/spec-parser-ab2c8458]
[fixture: treeview/db-description-empty] [fixture: treeview/text-description-ls]
[fixture: treeview/text-description-ps]
[fixture: treeview/db-description-absorbs-annotations]
[fixture: treeview/db-repeat-class] [fixture: treeview/db-repeat-icon]
[fixture: treeview/annotation-description-repeat-lines]
[fixture: treeview/annotation-description-repeat-empty]
[fixture: treeview/db-annotations-next-line]
[fixture: treeview/annotation-comment-gap]

### 共通の形

共通の 4 文は前置の ASCII space/tab を読める。
title-line は `title` と正確に 1 個の ASCII space/tab と空でもよい行本文、
または裸の keyword を読む。
word boundary は無い。
`titlex` は空の title と名前に、 `title"node"` は空の title と引用名になりうる。
[fixture: treeview/common-whitespace] [fixture: treeview/common-title-eof]
[fixture: treeview/common-title-prefix]
[fixture: treeview/common-title-quoted-next]

acc-title-line と acc-descr-line は正確な keyword、任意の ASCII space/tab、
colon、空でもよい行本文を読む。
description は block より colon 形を先に試す。
3 種の行本文はいずれも最初の `%%` または CR・LF の直前で止まり、
U+2028・U+2029 を含める。
共通値の引用符はテキストであり、閉じなくてよい。
[fixture: treeview/common-acctitle-eof] [fixture: treeview/common-accline-eof]
[fixture: treeview/common-colon-block-priority]
[fixture: treeview/common-title-percent-boundary]
[fixture: treeview/text-title-ls] [fixture: treeview/text-acctitle-ps]
[fixture: treeview/text-accline-ls] [fixture: treeview/common-open-quoted-eof]

acc-descr-block は `accDescr`、任意個の common の Notation の空白、`{`、
最初の `}` の直前までの全字、必須のその閉じを読む。
開きの前の空白は改行を越えてよい。
引用符と backslash は閉じを保護しない。
空と空白だけの block も文になる。
閉じない block の形が失敗したときは、
閉じない block node ではなく bare-name へ戻りうる。
[fixture: treeview/common-whitespace] [fixture: treeview/common-repeat-empty]
[fixture: treeview/common-block-whitespace-raw]
[fixture: treeview/common-block-first-close]
[fixture: treeview/common-block-quoted-close]
[fixture: treeview/common-block-escaped-close]
[fixture: treeview/common-block-open]
[fixture: treeview/box-decoration-before-block-open]
[fixture: treeview/box-block-tail-decoration-light-vertical]
[fixture: treeview/box-block-tail-decoration-empty-control]
[fixture: treeview/box-block-tail-decoration-empty-block-before]
[fixture: treeview/box-block-tail-branch-closer]

### コメントと部品の境目

native な unit の先頭では、`%%` から次の LF の直前までを共有 Comment とする。
mark は `%%`、value は mark を含めず、range は mark を含め LF を含めない。
U+2028・U+2029 と `}%%` らしい閉じもコメント内に残る。
hidden な改行は EOF の論理的な LF も含め、 LF を別に読む。
[fixture: treeview/tail-quoted-comment]
[fixture: treeview/native-comment-closer-greedy]
[fixture: treeview/native-comment-ls] [fixture: treeview/native-comment-ps]
[fixture: treeview/comment-bare-body] [fixture: treeview/gram-body-hidden-eof]
[fixture: treeview/lex-indent-comment-ps-semicolon-space]
[fixture: treeview/lex-indent-comment-ls-semicolon-space]
[fixture: treeview/lex-indent-comment-ps-selected-semicolon]

先に始まった名前・引用値・description-annotation・accessibility block は、
その内側の percent らしいテキストを所有する。
共通の行本文は `%%` の直前で止まる。
共通の source directive とコメント領域は、
除去で native な percent mark がつながる場合も共有の所有に従い、
native の hidden directive node にはしない。 [fixture: treeview/comment-in-bare]
[fixture: treeview/comment-in-quotes]
[fixture: treeview/tail-description-comment]
[fixture: treeview/common-block-bare-percent]
[fixture: treeview/common-title-percent-boundary]
[fixture: treeview/detect-secondscan-singleline]
[fixture: treeview/comment-native-mark-directive]

directive と選択されたセミコロンについて、
見出し・共通 keyword・語 `icon`・class 名・icon 参照全体は atom とする。
`:::` と `##` は不可分の marker。
bare 名・文字列の内側・共通値・description 本文は text/string の位置であり、
空白は透明である。
keyword と colon、`icon` と `(`、marker と名前、参照と `)` など、
書かれた完成部品の間に共通 trivia を許すが、欠けた空白は補わない。
[fixture: treeview/directive-header-inside]
[fixture: treeview/directive-acctitle-inside]
[fixture: treeview/directive-icon-word-inside]
[fixture: treeview/directive-class-value-inside]
[fixture: treeview/directive-icon-value-inside]
[fixture: treeview/directive-class-inside]
[fixture: treeview/directive-description-inside]
[fixture: treeview/directive-bare-middle]
[fixture: treeview/directive-double-middle]
[fixture: treeview/directive-acctitle-parts]
[fixture: treeview/directive-icon-parts-parts]
[fixture: treeview/directive-class-value-parts]
[fixture: treeview/icon-name-close-directive]
[fixture: treeview/semicolon-icon-value-inside]
[fixture: treeview/semicolon-class-value-inside]
[fixture: treeview/icon-word-open-semicolon]
[fixture: treeview/icon-name-close-semicolon]

### 罫線の読み

#### 範囲とモード

共通の除去と文字の読みが論理的な行を定めた原文の図のテキストへ、
次の直接規則を適用する。
書換え後のテキストは作らない。
外端の common の空白を無視した行全体が `treeView-beta` である最初の行を探し、
その後だけに罫線規則を適用する。
その行が無ければ罫線の読みは無い。
境界は共通の改行の読みの後の LF であり、U+2028・U+2029 ではない。
共通 directive 内の改行も境界ではない。 [fixture: treeview/box-written-tree]
[fixture: treeview/box-header-same-line]
[fixture: treeview/box-physical-directive-inline]
[fixture: treeview/box-physical-directive-line]
[fixture: treeview/box-physical-ls] [fixture: treeview/box-physical-ps]
[fixture: treeview/box-block-tail-decoration-directive-inline]
[fixture: treeview/box-block-tail-decoration-directive-line]
[fixture: treeview/box-block-tail-decoration-directive-at-start]
[fixture: treeview/box-block-tail-decoration-selected-semicolon]
[fixture: treeview/box-block-tail-decoration-unselected-semicolon]
[fixture: treeview/box-block-tail-decoration-comment-line]
[fixture: treeview/box-block-tail-decoration-comment-after]
[fixture: treeview/box-block-tail-decoration-ls]
[fixture: treeview/box-block-tail-decoration-ps]
[fixture: treeview/box-block-tail-decoration-comment-ls]
[fixture: treeview/box-block-tail-decoration-comment-ps]
[fixture: treeview/box-block-tail-decoration-crlf]
[fixture: treeview/box-block-tail-decoration-cr]

モードの判定では、空白だけの行、common の空白の後で `%%` で始まる行、
metadata 形の行、common の空白と縦線 `│`・`┃` だけの行を除く。
metadata 形は common の空白の後で、`title` と ASCII space/tab、
`accTitle` と任意の ASCII space/tab と `:`、
または `accDescr` と任意の ASCII space/tab と `:` か `{` が始まる行である。
裸の `title` だけは当たらない。 [fixture: treeview/box-comment-only]
[fixture: treeview/box-metadata-only] [fixture: treeview/box-decoration-only]
[fixture: treeview/box-title-bare-not-metadata]
[fixture: treeview/box-title-inside-string]

残る行のどれかが `─`、`━`、`│`、`┃`、`└`、`┗`、`├`、
`┣` を含むときだけ罫線モードになる。
この判定と下記の物理的な行の規則は、引用符や block の境界を区別しない。
数値の文字参照は branch へ decode せず、共通の placeholder として読む。
共通 directive とともに除かれる罫線の字は、モードを開始できない。
[fixture: treeview/box-quoted-dash] [fixture: treeview/box-mode-dash-only]
[fixture: treeview/box-mode-vertical-with-text]
[fixture: treeview/box-entity-not-branch]
[fixture: treeview/box-entity-mixed-indent]
[fixture: treeview/box-global-directive-line]
[fixture: treeview/box-global-directive-inline]
[fixture: treeview/box-metadata-inside-string-active]

#### 列と prefix の字下げ

branch は `└`、`┗`、`├`、`┣` の一つである。
モード判定の各候補行で最初の branch を探す。
converted diagram text の UTF-16 code unit で 0 始まりの列を測り、
tab は tab stop ではなく常に ASCII space 4 個として数える。
共通規則で除かれる形は数えず、文字参照は placeholder の綴りを数える。
[fixture: treeview/box-heavy] [fixture: treeview/box-prefix-directive-column]
[fixture: treeview/box-column-nonbmp-discriminating]
[fixture: treeview/box-entity-not-branch] [fixture: treeview/box-tab-quoted]

幅は、記述順で最初の正の branch 列とし、そのような候補が無ければ 4 とする。
幅の選択では列 0 を飛ばす。
最小の列を選んだり、均等な間隔を推測したりしない。
後の行や引用名らしい prefix が、前の行にも使う幅を決めうる。
[fixture: treeview/box-infer-first-column]
[fixture: treeview/box-first-width-from-name]
[fixture: treeview/box-first-branch-leading-text]
[fixture: treeview/box-branch-no-dash]

branch 行では、その列を幅で割り、最も近い非負整数へ丸め、
ちょうど半分なら大きい方を取り、1 を加える。
これを prefix の深さとする。
prefix はその 4 倍の字下げ単位を表すが、仮想の空白や原文の token は作らない。
[fixture: treeview/box-infer-first-column] [fixture: treeview/box-round-below]
[fixture: treeview/box-round-above] [fixture: treeview/box-written-tree]

prefix は最初の branch までの全字、その直後に接する最大の `─`・`━` 列、
その後の ASCII space からなり、tab は 4 空白として読む。
その空白の後の dash は prefix ではなく内容である。
先頭の NBSP・U+2028・U+2029 は区切りではなく内容。
branch 行の残る内容中の tab も全て 4 空白として読み、
末尾の common の空白を読みから外す。
原文の綴りは source tree に保つ。 [fixture: treeview/box-branch-quoted-second]
[fixture: treeview/box-skip-space-before-dash]
[fixture: treeview/box-branch-leading-nbsp]
[fixture: treeview/box-branch-leading-ls]
[fixture: treeview/box-branch-leading-ps] [fixture: treeview/box-tab-name]
[fixture: treeview/box-only-branch-content-tab]
[fixture: treeview/box-trim-unicode-tail]
[fixture: treeview/box-multiline-name-tail-trim]
[fixture: treeview/box-dir-name-trim]

#### 行の分類と拒否

有効な罫線モードでは、見出しの行の後の各行へ、
複数行引用名や accessibility block の中でも次の順で場合を適用する。
無効なモードでは、これらの文字は通常の unit の規則で読む。
[fixture: treeview/box-quoted-decoration]
[fixture: treeview/box-block-decoration]
[fixture: treeview/box-block-decoration-plain]
[fixture: treeview/box-quoted-indent-error]
[fixture: treeview/box-block-indent-error]
[fixture: treeview/box-block-tail-decoration-light-vertical]
[fixture: treeview/box-block-tail-decoration-heavy-vertical]
[fixture: treeview/box-block-tail-decoration-light-dash]
[fixture: treeview/box-block-tail-decoration-heavy-dash]
[fixture: treeview/box-block-tail-decoration-vertical-whitespace]
[fixture: treeview/box-block-tail-decoration-close-same-line]
[fixture: treeview/box-block-tail-decoration-dash-close-same-line]
[fixture: treeview/box-block-tail-decoration-multiple-lines]
[fixture: treeview/box-block-tail-branch-content]
[fixture: treeview/box-block-tail-branch-closer]
[fixture: treeview/box-block-tail-decoration-inactive]
[fixture: treeview/box-block-tail-decoration-indent-control]
[fixture: treeview/box-block-tail-decoration-only-interior]
[fixture: treeview/box-block-tail-decoration-empty-control]
[fixture: treeview/box-block-tail-decoration-opener-line]
[fixture: treeview/box-block-tail-decoration-ascii-dash-control]
[fixture: treeview/box-block-tail-decoration-single-dash]
[fixture: treeview/box-block-tail-decoration-spaces-after]
[fixture: treeview/box-block-tail-decoration-spaces-before]
[fixture: treeview/box-block-tail-decoration-blank-after]
[fixture: treeview/box-block-tail-decoration-two-vertical-lines]
[fixture: treeview/box-block-tail-decoration-blank-before]
[fixture: treeview/box-block-tail-decoration-empty-block-before]
[fixture: treeview/box-block-tail-decoration-closer-indent]
[fixture: treeview/box-block-tail-decoration-branch-empty]
[fixture: treeview/box-quoted-tail-decoration-light-vertical]
[fixture: treeview/box-quoted-tail-decoration-light-dash]
[fixture: treeview/box-quoted-tail-branch-content]
[fixture: treeview/box-quoted-tail-decoration-single-quoted]
[fixture: treeview/box-quoted-tail-decoration-heavy-vertical]
[fixture: treeview/box-quoted-tail-decoration-heavy-dash]
[fixture: treeview/box-quoted-tail-branch-heavy]
[fixture: treeview/box-quoted-tail-decoration-two-lines]
[fixture: treeview/box-quoted-tail-branch-then-decoration]
[fixture: treeview/box-quoted-tail-decoration-then-branch]

| 場合                             | 直接の読み                                 |
| -------------------------------- | ------------------------------------------ |
| 空白だけの行                     | 読みをそのまま保つ。                       |
| comment 形または metadata 形の行 | 読みをそのまま保つ。                       |
| 空白と縦線 `│`・`┃` だけ         | 装飾。内容と後続の改行を表さない。         |
| どこかに branch がある           | 最初の branch の prefix と残る内容を読む。 |
| branch 無し、空白と罫線だけ      | 装飾。内容と後続の改行を表さない。         |
| branch 無し、罫線と別の内容      | tab と字下げも含め元の行を保つ。           |
| 罫線無し、common の空白で始まる  | 混在した字下げとして拒否する。             |
| その他                           | 元の行を保つ。                             |

モード判定と装飾の分類は異なる。
縦線だけではモードを選ばないが、横線だけならモードを選んだ後で装飾になりうる。
prefix と末尾空白の読みの後に内容が無い branch は、装飾となる前に拒否する。
引用された空名は空でない内容である。 [fixture: treeview/box-decoration-only]
[fixture: treeview/box-mode-dash-only]
[fixture: treeview/box-empty-branch-after-decoration]
[fixture: treeview/box-prefixed-directive] [fixture: treeview/box-empty-quoted]

そのまま保つ場合も、可視の字下げは消さない。
ASCII 空白だけの行や prefix 付きの native comment は、
別の字下げの前に字下げを残して拒否されうる。
NBSP だけの行はそのまま通り bare node になりうるが、
罫線の無い非空の内容の前の NBSP・U+2028・U+2029 は拒否する。
そのままの罫線入りの行は、根になるのではなく深い字下げを保つこともある。
[fixture: treeview/box-blank-space-indent]
[fixture: treeview/box-comment-indentation-error]
[fixture: treeview/box-prefixed-comment] [fixture: treeview/box-blank-nbsp-line]
[fixture: treeview/box-mixed-indent-nbsp]
[fixture: treeview/box-mixed-indent-ls] [fixture: treeview/box-mixed-indent-ps]
[fixture: treeview/box-indented-content-no-branch]
[fixture: treeview/box-trim-bare-no-branch-unicode]

物理的な行の除外は文法上の位置を変えない。
node の後の metadata 形の行も許されず、
通常の字下げの注釈の行も混在の guard で失敗しうる。
prefix は node の前の共通文、直前 node の注釈、
後の node へ字下げを渡す native comment、
accessibility block の開きの前の空白を始めうる。
必ず新しい node を始めるとは限らない。
[fixture: treeview/box-prefixed-empty-block]
[fixture: treeview/box-decoration-annotation-gap]
[fixture: treeview/box-metadata-after-node]
[fixture: treeview/box-common-prefix] [fixture: treeview/box-annotation-prefix]
[fixture: treeview/box-comment-indent-carry]
[fixture: treeview/box-branch-before-block-open]
[fixture: treeview/box-prefix-common-block-two-prefixes]

prefix 内の引用符と brace は、包む値を閉じない。
prefix のテキストには開きの引用符やその行の前の名前・description も含まれ、
その後に残る bare 名をそこで書かれたものとして読む。
既に開いた値の内側では、 prefix と装飾をその値の原綴に残し、
そこで prefix が表す空白で注釈を始めない。
この形は直接の読みで受理し、新しい差異として拒否しない。
[fixture: treeview/box-multiline-annotation-space]
[fixture: treeview/box-quoted-branch] [fixture: treeview/box-description-branch]
[fixture: treeview/box-prefix-arbitrary]
[fixture: treeview/box-trim-string-closing-quote]
[fixture: treeview/box-trim-block-closing-brace]
[fixture: treeview/box-multiline-quoted]
[fixture: treeview/box-quoted-decoration]
[fixture: treeview/box-block-decoration]

共通 directive、選択されたセミコロン、コメント行、空行、行区切りは、
子の行や複数行の値でもそれぞれの規則に従う。
空の accessibility block は preamble では文だが、
引用名に包まれればテキストであり、node 列に割り込めない。
値の中の共通 directive は共有 trivia のままである。
[fixture: treeview/nested-child-selected-semicolon]
[fixture: treeview/nested-box-directive-line]
[fixture: treeview/nested-box-selected-semicolon]
[fixture: treeview/nested-box-comment-line]
[fixture: treeview/nested-box-empty-line] [fixture: treeview/nested-box-ls]
[fixture: treeview/nested-box-ps] [fixture: treeview/nested-child-empty-block]
[fixture: treeview/nested-box-empty-block]
[fixture: treeview/box-physical-directive-inline]
[fixture: treeview/box-physical-directive-line]
[fixture: treeview/box-physical-selected-semicolon]
[fixture: treeview/box-physical-comment-line]
[fixture: treeview/box-physical-empty-line] [fixture: treeview/box-physical-ls]
[fixture: treeview/box-physical-ps]
[fixture: treeview/box-physical-empty-description]
[fixture: treeview/block-physical-comment-line]
[fixture: treeview/block-physical-empty-line]
[fixture: treeview/block-physical-selected-semicolon]
[fixture: treeview/block-physical-ls] [fixture: treeview/block-physical-ps]
[fixture: treeview/block-physical-empty-description]

branch と可変長の列の各 dash は別の作者の部品であり、
その間の directive と選択されたセミコロンを許す。
branch より前の prefix のテキストを、
見かけの keyword や注釈として判定し直さない。
選ばれていないセミコロンは dash 列を止め、内容に残る。
[fixture: treeview/box-branch-directive-parts]
[fixture: treeview/box-dash-directive-inside]
[fixture: treeview/box-branch-selected-semicolon]
[fixture: treeview/box-dash-selected-semicolon]
[fixture: treeview/box-prefix-arbitrary]
[fixture: treeview/box-branch-unselected-semicolon]
[fixture: treeview/box-dash-unselected-semicolon]

空の branch と混在した字下げの条件は字句解析とは独立に拒否する。
間の装飾の後でもエラーの行は原文の行を参照するが、この仕様は、
Mermaid の書換え後の offset、列、message の語句、
行番号の対応の実装を要求しない。 [fixture: treeview/box-error-remap]
[fixture: treeview/box-empty-branch-after-decoration]
[fixture: treeview/box-mixed-reject]

## 文法

```text
diagram = header common-statement* node* end-of-text
common-statement = title-line | acc-title-line
                 | acc-descr-line | acc-descr-block
node = indentation? (quoted-name | bare-name) annotation*
annotation = class-annotation | icon-annotation | description-annotation
```

[common の Notation](../common.ja.md)を使う。
hidden な改行と Comment は区切りではない。
罫線 prefix はその位置の字下げや前置空白を表し、装飾は文法上の文を加えず、
共通文の preamble も終わらせない。
入力の全字は source tree または共有 trivia に残す。
[fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]
[fixture: treeview/box-decoration-preamble-body]
[fixture: treeview/box-decoration-pending-name-gap]
[fixture: treeview/box-decoration-before-annotation]

本文と注釈の list は空でよい。
共通の形は最初の node より前で任意の順に反復できるが、その後には置けない。
引用名の node は同じ行に隣接できる。
bare の行は同じ行の引用符らしい字を包める。
node の無い注釈、繰り返す見出し、余分の字下げは拒否する。
セミコロンは一般の区切りではなく、選ばれなければ bare 名の一部や全体になりうる。
[fixture: treeview/header-only] [fixture: treeview/common-repeat]
[fixture: treeview/common-repeat-empty]
[fixture: treeview/gram-title-after-node]
[fixture: treeview/gram-accessibility-after-node]
[fixture: treeview/gram-description-after-node]
[fixture: treeview/gram-adjacent-quoted] [fixture: treeview/gram-inline-quoted]
[fixture: treeview/gram-inline-bare]
[fixture: treeview/gram-annotation-without-node]
[fixture: treeview/gram-repeated-header]
[fixture: treeview/tail-quoted-semicolon]
[fixture: treeview/tail-bare-semicolon]

| 規則                          | 原文の node                    |
| ----------------------------- | ------------------------------ |
| diagram                       | TreeviewDiagram                |
| node                          | TreeviewNode                   |
| class-annotation              | TreeviewClassAnnotation        |
| icon-annotation               | TreeviewIconAnnotation         |
| description-annotation        | TreeviewDescriptionAnnotation  |
| title-line                    | TreeviewTitleStatement         |
| acc-title-line                | TreeviewAccTitleStatement      |
| acc-descr-line                | TreeviewAccDescrStatement      |
| acc-descr-block               | TreeviewAccDescrBlockStatement |
| bare-name                     | TreeviewIdentifier             |
| quoted-name                   | StringLiteral                  |
| class 名 / icon 参照          | Identifier                     |
| 共通の本文 / description 本文 | TreeviewLiteral                |
| 書かれた branch prefix        | TreeviewBranchPrefix           |
| 値の外の装飾                  | TreeviewIgnoredText            |

### 字下げと親子

次の規則が TreeviewNode.children の入れ子と TreeviewDiagram.body の根を決める。
各 node に字下げを一度だけ割り当て、まだ開いている前の node を記述順に持つ。
新しい node の字下げ以上の node を開いている列の末尾から外す。
最後に残る node が親であり、残らなければ別の根となる。
現在の node を開いている列へ加える。
共通文と装飾は参加しない。 [fixture: treeview/db-indent-pop]
[fixture: treeview/box-written-tree]
[fixture: treeview/box-decoration-trailing-body]
[fixture: treeview/gram-written-tree]

file と directory らしい名前のどちらも親になれる。
最初の node の字下げ、複数の根、任意の字下げの増減、重複名、空の引用名を許す。
通常の字下げと branch が表す字下げを同じ比較に使う。
根はそれぞれ図の body に保ち、人工の根、親への参照、導出した深さは加えない。
[fixture: treeview/db-file-parent] [fixture: treeview/db-first-indented]
[fixture: treeview/db-duplicate-names] [fixture: treeview/db-empty-names]
[fixture: treeview/box-indented-box-text] [fixture: treeview/box-round-below]

共有 trivia と空行は親を増やさない。
行の内側と単独行の directive をまたいで割り当てた字下げを保ち、
二つ目の未使用の連続があれば引き続き拒否する。
LS・PS は名前やコメントの内容としての字句の読みを保ち、
階層の行区切りを増やさない。
node の後の空の description block も、 gap の要素にはせず拒否する。
[fixture: treeview/nested-child-directive-unindented]
[fixture: treeview/nested-child-directive-line]
[fixture: treeview/box-tail-decoration-directive-inline]
[fixture: treeview/nested-child-comment-line]
[fixture: treeview/nested-child-empty-line]
[fixture: treeview/nested-child-selected-semicolon]
[fixture: treeview/box-tail-decoration-unselected-semicolon]
[fixture: treeview/gram-nesting-ls-before-child]
[fixture: treeview/gram-nesting-ps-before-child]
[fixture: treeview/gram-nesting-comment-ls-before-child]
[fixture: treeview/gram-nesting-comment-ps-before-child]
[fixture: treeview/nested-child-empty-block]

accessibility block の中の空の description らしい行も、
最初の閉じ brace までは本文であり、その brace が包む block を閉じる。
後の行のテキストは通常の node になりうる。
[fixture: treeview/block-physical-empty-description]

### 意味上の受理条件

[public の parse wrapper][parse]は、
消費の不足や回復した model に付くものも含め、
lexer error と parser error のどちらか一つでもあれば拒否する。
[adapter][adapter] と [Db][db]には追加の treeview の validator
や意味上の拒否は無い。
共通規則と字句・文法の拒否に加え、
上記の罫線の二つの Error だけが図種固有の gate である。
[fixture: treeview/error-after-prefix] [fixture: treeview/gram-invalid-icon]
[fixture: treeview/gram-accessibility-after-node]
[fixture: treeview/box-empty-branch-after-decoration]
[fixture: treeview/box-mixed-reject]

単根、均等な字下げ、親が directory だけであること、名前の一意性、class の登録、
icon pack の導入を条件として足さない。
空の引用名と明示的な空の注釈は構文のままであり、
tokenless-empty-forms の差異にしない。 [fixture: treeview/db-first-indented]
[fixture: treeview/db-file-parent] [fixture: treeview/db-prototype-names]
[fixture: treeview/db-duplicate-names] [fixture: treeview/db-empty-names]
[fixture: treeview/db-icon-none] [fixture: treeview/spec-parser-ab2c8458]

### 全出現・設定・正規化

空や上書き前も含め、書かれた共通文と注釈を全て独立に保つ。
引用符の両形、元の slash、description の空白、tab、prefix、装飾も保つ。
[木の文書](../ast/treeview.ja.md)が範囲と所有を定める。
[fixture: treeview/gram-written-tree] [fixture: treeview/common-repeat-empty]
[fixture: treeview/db-repeat-class] [fixture: treeview/db-repeat-icon]
[fixture: treeview/annotation-description-repeat-empty]
[fixture: treeview/box-written-tree] [fixture: treeview/box-tab-quoted]

treeview の設定は描画の設定であり、受理の鍵を持たない。
site・frontmatter・init の設定は不正な構文を救わず、
正しい treeview の構文を拒否させない。
icon の解決は描画の処理であり、参照の妥当性の gate ではない。
不正な埋込みデータには共有の opaque-data の差異を適用する。
[fixture: treeview/config-drawing-site]
[fixture: treeview/config-frontmatter-drawing]
[fixture: treeview/config-init-drawing]
[fixture: treeview/config-frontmatter-cannot-rescue]
[fixture: treeview/config-frontmatter-cannot-reject]
[fixture: treeview/config-init-cannot-rescue]
[fixture: treeview/config-init-cannot-reject]
[fixture: treeview/div-frontmatter-invalid]

[tests の要約](../../../tests/docs/db-summaries.ja.md#treeview)が Db
の正規化を定める。
共通値の公開、名前と注釈の変換、directory の末尾の解釈、 sanitize、
導出される森を扱う。
設定依存の sanitize は外から与える Db の条件であり、
書かれた葉の値や treeview 固有の受理条件を変えない。
[fixture: treeview/db-all-fields]
[fixture: treeview/db-directory-trailing-space]
[fixture: treeview/config-security-level-default]
[fixture: treeview/config-security-level-other]
[fixture: treeview/config-security-level-other-html-false]

## 既知の差異

**[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
不可分の見出し、keyword、marker、class 名、
icon 参照全体の内側の directive は拒否する。
text、文字列の内側、完成部品の間では許される読みを保つ。
[fixture: treeview/directive-header-inside]
[fixture: treeview/directive-class-inside]
[fixture: treeview/directive-class-value-inside]
[fixture: treeview/directive-icon-value-inside]
[fixture: treeview/icon-pack-name-directive]
[fixture: treeview/directive-icon-parts-parts]

**[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
共通の行規則が実際に選ぶセミコロンにだけ、同じ原子の境目を適用する。
選ばれないセミコロンはこの差異ではない。
分かれた見出しは通常、その行規則より前の検出で失敗する。
[fixture: treeview/semicolon-class-inside]
[fixture: treeview/semicolon-class-value-inside]
[fixture: treeview/semicolon-icon-value-inside]
[fixture: treeview/semicolon-header-inside]
[fixture: treeview/box-branch-selected-semicolon]
[fixture: treeview/box-branch-unselected-semicolon]

**[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
開いた frontmatter の tag は、ここでは本文の引用符の境界を変えない。
受理が変わる両方向と、値だけの違いを指定読みで記録する。
[fixture: treeview/div-html-frontmatter-accept]
[fixture: treeview/div-html-frontmatter-reject]
[fixture: treeview/div-html-frontmatter-value]

**[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。
** 共有の埋込み本文は opaque とし、保持すべき treeview の受理の鍵は無い。
隣の有効な title や設定は比較に残す。
[fixture: treeview/div-frontmatter-invalid]
[fixture: treeview/config-fontfamily-keeps-title]
[fixture: treeview/div-invalid-keeps-config]
[fixture: treeview/div-init-primitive-wrap]

**[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)。**
通過した裸の行と付随する trivia は再び読まない。
保持された形自体は native に読めなければならない。
Unicode の空白だけでなく ASCII の字下げも対象となる。
[fixture: treeview/bare-line-space] [fixture: treeview/bare-line-nbsp]
[fixture: treeview/detect-secondscan-bare-ascii]
[fixture: treeview/detect-secondscan-bare-unicode]
[fixture: treeview/detect-retained-comment-gap]

**[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。
** 後の書かれた値、コメント、
directive に C4 の四つの anywhere keyword があっても、見出しで treeview を選ぶ。
[fixture: treeview/c4-component-header-eof]
[fixture: treeview/c4-container-bare] [fixture: treeview/c4-dynamic-title]
[fixture: treeview/c4-deployment-block]

[grammar]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/treeView/treeView.langium#L13-L64
[box]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/treeView/boxDrawingPreprocessor.ts#L8-L208
[detector]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/treeView/detector.ts#L4-L8
[keyword]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/tokenBuilder.ts#L14-L28
[parse]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L133-L174
[adapter]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/treeView/parser.ts#L11-L57
[db]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/treeView/db.ts#L17-L91
