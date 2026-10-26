# Cynefin formatting

English version: [cynefin.md](./cynefin.md)

cynefin-beta と cynefin-beta: の整形規則です。
[構文](../../spec/docs/diagrams/cynefin.ja.md)と
[木](../../spec/docs/ast/cynefin.ja.md)に従い、
[互換性](./compatibility.ja.md)の共有の制限を適用します。

## Rules

### Header

cynefin-beta と cynefin-beta: は第 1 列に置き、colon の有無を保ちます。
普通の最初の文は次の行へ移し、見出しを見つけやすくします。
global directive の接触、hidden の隣接、保護行は共有規則に従います。
見出し行を保つときは、その行の領域と項目の開きも同じ行に保ちます。
空白で離れた colon は修復せず、拒否します。

[fixture: cynefin/hidden-boundaries/meeting-inline-directive-directive]

[fixture: cynefin/hidden-boundaries/meeting-inline-directive-yaml]

[fixture: cynefin/hidden-boundaries/meeting-directive-only-line-directive]

[fixture: cynefin/hidden-boundaries/meeting-directive-only-line-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-directive]

[fixture: cynefin/hidden-boundaries/meeting-unselected-semicolon-yaml]

[fixture: cynefin/hidden-boundaries/meeting-ignored-value-semicolon-directive]

[fixture: cynefin/hidden-boundaries/meeting-ignored-value-semicolon-yaml]

[corpus fixture: cynefin/semicolon-header-selected-parts]

[fixture: cynefin/hidden-boundaries/meeting-selected-gap-semicolon-yaml]

[fixture: cynefin/hidden-boundaries/meeting-comment-line-directive]

[fixture: cynefin/hidden-boundaries/meeting-comment-line-yaml]

[fixture: cynefin/hidden-boundaries/meeting-blank-line-directive]

[fixture: cynefin/hidden-boundaries/header-inline-domain-item-yaml]

[test: cynefin/hidden-boundaries/meeting-ls-in-form-directive]

[test: cynefin/hidden-boundaries/meeting-ls-in-form-yaml]

[test: cynefin/hidden-boundaries/meeting-ps-in-form-directive]

[test: cynefin/hidden-boundaries/meeting-ps-in-form-yaml]

[fixture: cynefin/hidden-boundaries/meeting-empty-description-directive]

[fixture: cynefin/hidden-boundaries/meeting-empty-description-yaml]

[fixture: cynefin/header/header-bare-inline]

[fixture: cynefin/header/header-colon-inline]

[fixture: cynefin/header/header-bare-empty]

[fixture: cynefin/header/header-colon-empty]

[fixture: cynefin/header/header-title]

[fixture: cynefin/header/header-global-colon]

入力（escape 表記）:
`"  cynefin-beta complex \"Header\""`.

Output
([header/header-bare-inline-output.mmd](../tests/fixtures/cynefin/header/header-bare-inline-output.mmd)):

```mmd
cynefin-beta
  complex
    "Header"
```

### Indentation

本文の文は設定の 1 段、領域の項目は 2 段にします。
親は列ではなく、木の項目リストで決まるためです。
tabWidth が 0 なら空白は加えず、
useTabs は幅が 0 でも 1 段に 1 tab を使います。
値の継続行と保護された内部は元の列を保ちます。

[fixture: cynefin/indentation/indent-two]

[fixture: cynefin/indentation/indent-four]

[fixture: cynefin/indentation/indent-zero]

[fixture: cynefin/indentation/indent-tabs]

[fixture: cynefin/indentation/indent-zero-tabs]

入力（escape 表記）:
`"cynefin-beta\ncomplex\n \"Indent\"\nclear-->chaotic"`.

Output
([indentation/indent-two-output.mmd](../tests/fixtures/cynefin/indentation/indent-two-output.mmd)):

```mmd
cynefin-beta
  complex
    "Indent"
  clear --> chaotic
```

### Domains and items

領域の語は単独行、各項目はその 1 段下の行にして、
書かれた親子関係を見せます。
領域と項目、隣接する文字列、隣接する領域の間に文法上 EOL は不要なので、
分割しても Db は同じです。
空文字列、重複項目、複数行文字列を残します。
項目間のコメント、directive、空行、hidden form は列を閉じません。
保護区間と hidden の同一行の隣接を優先し、閉じ記号は補いません。

保つ semicolon の行では、領域の語と最初の項目も同じ行に保ちます。
項目だけを次の行へ動かすと、次の整形で項目同士が分かれるためです。

[fixture: cynefin/semicolons/review-semicolon-following-pair]

[fixture: cynefin/domains-and-items/open-body]

[fixture: cynefin/domains-and-items/open-empty-body]

[fixture: cynefin/domains-and-items/items-adjacent]

[fixture: cynefin/domains-and-items/items-same-line]

[fixture: cynefin/domains-and-items/items-glued-domains]

[fixture: cynefin/domains-and-items/items-empty-strings]

[fixture: cynefin/domains-and-items/items-physical-string-line]

[fixture: cynefin/domains-and-items/items-comment-sequence]

[fixture: cynefin/domains-and-items/items-directive-sequence]

[fixture: cynefin/domains-and-items/items-blank-sequence]

[corpus fixture: cynefin/gram-adjacent-items]

[corpus fixture: cynefin/gram-inline-items]

[corpus fixture: cynefin/gram-items-empty-description-redeclare]

入力（escape 表記）:
`"cynefin-beta\ncomplex\"Alpha\"'Beta'clear\"Gamma'\""`.

Output
([domains-and-items/open-body-output.mmd](../tests/fixtures/cynefin/domains-and-items/open-body-output.mmd)):

```mmd
cynefin-beta
  complex
    "Alpha"
    'Beta'
  clear
    "Gamma'"
```

### Component spacing

同じ行に残る普通の領域と項目の部品は 1 space で分け、
部品を見分けやすくします。
同じ印字行の中の global trivia は両側の接触を保ちます。
行に分ける所の配置は [Global directives](#global-directives) に従います。
hidden closer の padding と semicolon の prefix は保護されたままにします。

[fixture: cynefin/component-spacing/domain-hidden-contact]

[fixture: cynefin/component-spacing/domain-global-contact]

[fixture: cynefin/semicolons/semi-selected-outside-string]

[fixture: cynefin/semicolons/cross-domain-suffix]

入力（escape 表記）:
`"cynefin-beta\ncomplex%%{!domain-gap}%% \"ContactHidden\""`.

Output
([component-spacing/domain-hidden-contact-output.mmd](../tests/fixtures/cynefin/component-spacing/domain-hidden-contact-output.mmd)):

```mmd
cynefin-beta
  complex%%{!domain-gap}%% "ContactHidden"
```

### Statements one per line

普通の領域、遷移、共通文は source 順で別々の行にし、semicolon は加えません。
構文を補わずに文の境界を見せるためです。
遷移と共通文には可視 EOL が要ります。
領域の構文に見える title の内容は一つの値のままにし、
空の説明ブロックも項目列を終える文として残します。

[fixture: cynefin/statements-one-per-line/statement-boundaries]

[fixture: cynefin/statements-one-per-line/domain-before-title]

[fixture: cynefin/statements-one-per-line/common-apparent-domain]

[fixture: cynefin/statements-one-per-line/empty-description-redeclare]

入力（escape 表記）:
`"cynefin-beta\ncomplex\"Left\"clear\"Right\"chaotic-->clear\nconfusion\"End\""`.

Output
([statements-one-per-line/statement-boundaries-output.mmd](../tests/fixtures/cynefin/statements-one-per-line/statement-boundaries-output.mmd)):

```mmd
cynefin-beta
  complex
    "Left"
  clear
    "Right"
  chaotic --> clear
  confusion
    "End"
```

### Arrow spacing

from --> to の矢印全体の左右を普通の 1 space にし、端点の語と区別します。
矢印は分割せず、部品の間を折り返しません。
named gap の hidden と global directive の接触は元の境界を保ちます。

[fixture: cynefin/arrow-spacing/arrow-bare]

[fixture: cynefin/arrow-spacing/arrow-label]

[fixture: cynefin/hidden-forms/hidden-transition-all-gaps]

[fixture: cynefin/global-directives/global-component-gaps]

入力（escape 表記）:
`"cynefin-beta\ncomplex-->clear"`.

Output
([arrow-spacing/arrow-bare-output.mmd](../tests/fixtures/cynefin/arrow-spacing/arrow-bare-output.mmd)):

```mmd
cynefin-beta
  complex --> clear
```

### Label colon

ラベルを端点から分けるため、to : "label" の colon の前後を普通の
1 space にします。
ラベルなし、引用符の中が空、空白だけのラベルは別々の形として残します。
hidden と global trivia の隙間を普通の空白より優先します。

[fixture: cynefin/label-colon/colon-tabs]

[fixture: cynefin/label-colon/colon-empty-double]

[fixture: cynefin/label-colon/colon-empty-single]

[fixture: cynefin/label-colon/colon-space-label]

[fixture: cynefin/arrow-spacing/arrow-bare]

[fixture: cynefin/hidden-forms/hidden-transition-all-gaps]

[fixture: cynefin/global-directives/global-component-gaps]

入力（escape 表記）:
`"cynefin-beta\nchaotic --> confusion\t:\t\t'ColonTabs'"`.

Output
([label-colon/colon-tabs-output.mmd](../tests/fixtures/cynefin/label-colon/colon-tabs-output.mmd)):

```mmd
cynefin-beta
  chaotic --> confusion : 'ColonTabs'
```

### Strings

項目と遷移ラベルの StringLiteral は source span のまま印字します。
引用符、escape、空の値、内部の padding、HTML・entity、
native form に見える文字を保ち、singleQuote でも引用符は変えません。
Db が等しい引用符の変更も書かれた形を失い、
trim や escape の decode は値を変え得るためです。
共有の semicolon 保護を先に適用します。

[fixture: cynefin/strings/strings-quotes]

[fixture: cynefin/strings/strings-padding]

[fixture: cynefin/strings/strings-known-escapes]

[corpus fixture: cynefin/lex-string-unknown-single]

[fixture: cynefin/strings/strings-quote-backslash]

[fixture: cynefin/strings/strings-number-looking]

[fixture: cynefin/strings/strings-hidden-looking]

[fixture: cynefin/strings/strings-global-in-value]

[fixture: cynefin/strings/strings-html-entity-accepted]

[fixture: cynefin/strings/strings-transition-escapes]

入力（escape 表記）:
`"cynefin-beta\ncomplex 'Single' \"Double\" 'opposite \" quote' \"opposite ' quote\""`.

設定: `{"singleQuote": true}`.

Output
([strings/strings-quotes-output.mmd](../tests/fixtures/cynefin/strings/strings-quotes-output.mmd)):

```mmd
cynefin-beta
  complex
    'Single'
    "Double"
    'opposite " quote'
    "opposite ' quote"
```

### Empty domains

語だけの空領域を独立した行として残します。
以前の宣言を空リストで置き換え得るので、
単独では何も描かなくても削除すると Db が変わり得ます。
かっこも項目も補いません。

[fixture: cynefin/empty-domains/empty-domain-alone]

[fixture: cynefin/empty-domains/empty-domain-chain]

[fixture: cynefin/empty-domains/empty-domain-last-reset]

入力（escape 表記）:
`"cynefin-beta\ncomplicated"`.

Output
([empty-domains/empty-domain-alone-output.mmd](../tests/fixtures/cynefin/empty-domains/empty-domain-alone-output.mmd)):

```mmd
cynefin-beta
  complicated
```

### Redeclarations

各領域ブロックと項目を source 順で残し、
重複項目も confusion の全項目も保ちます。
後の宣言は前を置き換えるため、
統合すると読みが変わります。
Db の公開順や描画上限を理由に、並べ替え・削除・打ち切りはしません。

[fixture: cynefin/redeclarations/domain-repeat-order]

[fixture: cynefin/redeclarations/items-duplicates]

[fixture: cynefin/redeclarations/confusion-overflow]

入力（escape 表記）:
`"cynefin-beta\nclear \"Earlier\"\ncomplex \"Partner\"\nclear \"Final\""`.

Output
([redeclarations/domain-repeat-order-output.mmd](../tests/fixtures/cynefin/redeclarations/domain-repeat-order-output.mmd)):

```mmd
cynefin-beta
  clear
    "Earlier"
  complex
    "Partner"
  clear
    "Final"
```

### Transition occurrences

自己遷移、重複、未宣言の端点、空ラベルも含めて、全遷移を残します。
自己遷移が Db から消えても、書かれた構文は残るためです。
重複の削除や空白だけのラベルの trim は読みを変え得ます。

[fixture: cynefin/transition-occurrences/transition-occurrences]

入力（escape 表記）:
`"cynefin-beta\ncomplex-->clear:'First'\ncomplex-->clear:'Second'\ncomplex-->complex:'Self'\nclear-->clear\nconfusion-->chaotic:\"\""`.

Output
([transition-occurrences/transition-occurrences-output.mmd](../tests/fixtures/cynefin/transition-occurrences/transition-occurrences-output.mmd)):

```mmd
cynefin-beta
  complex --> clear : 'First'
  complex --> clear : 'Second'
  complex --> complex : 'Self'
  clear --> clear
  confusion --> chaotic : ""
```

### Title

共有の共通行 layout で普通の外端空白を trim し、
非空値の前を 1 space にして、内部の文字は保ちます。
空または空白だけの値は title だけにし、次行を値にしません。
引用符を文字列の区切りと解釈せず、Db が等しい簡潔な外端を選びます。
空の代入によるリセットと trivia の接触を残します。
null の title の separator 1 space・tab は範囲の外にあります。

[fixture: cynefin/title/title-edges]

[fixture: cynefin/title/title-no-value]

[fixture: cynefin/title/title-whitespace-only]

[fixture: cynefin/title/title-quotes]

[fixture: cynefin/title/title-unmatched-quote]

[fixture: cynefin/title/title-empty-comment-global]

[fixture: cynefin/title/null-comment]

[fixture: cynefin/title/null-directive]

[corpus fixture: cynefin/common-title-comment-only]

[corpus fixture: cynefin/common-title-directive-only]

[corpus fixture: cynefin/lex-title-one-space]

[corpus fixture: cynefin/lex-title-one-tab]

入力（escape 表記）:
`"cynefin-beta\ntitle\t  Title  inside\t\ttext  "`.

Output
([title/title-edges-output.mmd](../tests/fixtures/cynefin/title/title-edges-output.mmd)):

```mmd
cynefin-beta
  title Title  inside		text
```

### Accessibility lines

共有の accTitle: value と accDescr: value の配置を使い、
colon を keyword に付け、非空値の前を 1 space にします。
空の代入は colon で終え、次行には結合しません。
普通の外端空白だけを trim し、内部と trivia の接触を保ち、
colon 後のかっこは行の値として残します。
共通の簡潔な形で、値を解釈し直さないためです。

[fixture: cynefin/accessibility-lines/accessibility-padding]

[fixture: cynefin/accessibility-lines/accessibility-empty]

[fixture: cynefin/accessibility-lines/accessibility-whitespace-only]

[fixture: cynefin/accessibility-lines/accessibility-line-braces]

[fixture: cynefin/accessibility-lines/accessibility-quotes]

[fixture: cynefin/accessibility-lines/accessibility-trivia]

入力（escape 表記）:
`"cynefin-beta\naccTitle \t:  Access  Title \t\naccDescr\t:  Access\t\tDescription  "`.

Output
([accessibility-lines/accessibility-padding-output.mmd](../tests/fixtures/cynefin/accessibility-lines/accessibility-padding-output.mmd)):

```mmd
cynefin-beta
  accTitle: Access  Title
  accDescr: Access		Description
```

### Description blocks

accDescr ブロックは共有の説明 layout を通します。
空白だけの内部は {} にし、接するかっこは接したまま、
元からある普通の外端 padding は 1 space にします。
普通の opener 前の空白は結合し、非空値の継続列を保ち、
独立した closer は文の段にそろえます。
空ブロック内のコメント・directive は共有の配置を保ちます。
中身のない内部を padding で囲む必要はなく、
値内の native form に見える文字も値のままにするためです。

[fixture: cynefin/description-blocks/description-empty]

[fixture: cynefin/description-blocks/description-touching]

[fixture: cynefin/description-blocks/description-spaced-edges]

[fixture: cynefin/description-blocks/description-plain-opener-newline]

[fixture: cynefin/description-blocks/description-multiline-columns]

[fixture: cynefin/description-blocks/description-comment-only]

[fixture: cynefin/description-blocks/description-directive-only]

[fixture: cynefin/description-blocks/description-opener-comment]

[test: cynefin/description-blocks/description-unicode-empty]

[fixture: cynefin/description-blocks/description-native-looking-text]

[fixture: cynefin/description-blocks/opener-directive]

入力（escape 表記）:
`"cynefin-beta\naccDescr { \t\n \n}\nclear \"AfterEmpty\""`.

Output
([description-blocks/description-empty-output.mmd](../tests/fixtures/cynefin/description-blocks/description-empty-output.mmd)):

```mmd
cynefin-beta
  accDescr {}
  clear
    "AfterEmpty"
```

### Hidden forms

CynefinIgnoredText は AST の各 owner で source span を一度だけ印字します。
対象は retained prefix、本文、領域名の suffix、項目の prefix・suffix、
遷移の named gap、共通文の suffix です。
value は共通の除去を含まないので、再構築すると source を失います。
開始行は所属本文の段、内部と closer は元の列を保ちます。
項目先頭の form とその後のラベルは、保持した LF の後で項目の段にそろえます。
一つの match、後の有効な closer、別々の match、
失敗してコメントになった形を保ちます。

[fixture: cynefin/hidden-forms/hidden-domain-name]

[fixture: cynefin/hidden-forms/hidden-domain-empty]

[fixture: cynefin/hidden-forms/hidden-item-leading]

[fixture: cynefin/hidden-forms/hidden-item-trailing]

[fixture: cynefin/hidden-forms/hidden-body-after-domain]

[fixture: cynefin/hidden-forms/hidden-body-after-last-item]

[fixture: cynefin/hidden-forms/hidden-between-items]

[fixture: cynefin/hidden-forms/hidden-transition-all-gaps]

[fixture: cynefin/hidden-forms/hidden-unlabelled-gaps]

[fixture: cynefin/hidden-forms/hidden-title-owner]

[fixture: cynefin/hidden-forms/hidden-acctitle-owner]

[fixture: cynefin/hidden-forms/hidden-descr-owner]

[fixture: cynefin/hidden-forms/hidden-block-owner]

[fixture: cynefin/hidden-forms/hidden-post-common-body]

[fixture: cynefin/hidden-forms/hidden-yaml-three-fences]

[fixture: cynefin/hidden-forms/hidden-yaml-two-matches]

[fixture: cynefin/hidden-forms/hidden-directive-later-closer]

[fixture: cynefin/hidden-forms/hidden-common-cut-source]

[fixture: cynefin/hidden-forms/hidden-native-fallback-comment]

[fixture: cynefin/hidden-forms/hidden-adjacent-one-match]

[fixture: cynefin/hidden-forms/leading-two-forms]

[corpus fixture: cynefin/hidden-domain-item-members]

[corpus fixture: cynefin/hidden-all-unit-gaps]

入力（escape 表記）:
`"cynefin-beta\ncomplex%%{!name-owner}%%\n\"NameChild\""`.

Output
([hidden-forms/hidden-domain-name-output.mmd](../tests/fixtures/cynefin/hidden-forms/hidden-domain-name-output.mmd)):

```mmd
cynefin-beta
  complex%%{!name-owner}%%
    "NameChild"
```

[fixture: cynefin/hidden-forms/review-hidden-following-pair]

[fixture: cynefin/hidden-forms/cynefin-domain-name-hidden-edge]

[fixture: cynefin/hidden-forms/cynefin-item-leading-hidden-edge]

[fixture: cynefin/hidden-forms/cynefin-item-suffix-hidden-edge]

[fixture: cynefin/hidden-forms/cynefin-hidden-yaml-opening-edge]

### Hidden boundaries

範囲外の消費 LF、同一行の接触、closer の space・tab は EOF も含めて
共有の hidden-gap・block 規則で保ちます。
遷移と共通文の suffix が LF を消費するときは予備の可視 LF が要り、
closer の padding が LF を可視のまま残す場合もあります。
領域と項目には可視 EOL は要りません。
普通の端の改行の例外は見出し自身の hidden にだけ適用し、
見出し行の最初の文の suffix はその文のものとして扱います。
複数 suffix と可視 EOL 後の本文 form も保ちます。

見出し、領域の開き、項目間に同じ行保持の判断を適用し、
項目末尾の native DIRECTIVE・YAML もその判断に含めます。
その行の開きと子を同じ行に保ちます。
子だけを移すと見出し行の保護が失われ、次の整形が変わるためです。
form を所有する node は変えず、行の配置を保ちます。

native の suffix が同じ行を保つ場合も、semicolon で保護した prefix は
一度だけ印字します。
suffix の owner は保ち、項目の重複で Db を変えません。

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-without-hidden]

[fixture: cynefin/hidden-boundaries/meeting-inline-directive-directive]

[fixture: cynefin/hidden-boundaries/meeting-inline-directive-yaml]

[fixture: cynefin/hidden-boundaries/meeting-directive-only-line-directive]

[fixture: cynefin/hidden-boundaries/meeting-directive-only-line-yaml]

[fixture: cynefin/hidden-boundaries/meeting-unselected-semicolon-yaml]

[fixture: cynefin/hidden-boundaries/meeting-ignored-value-semicolon-directive]

[fixture: cynefin/hidden-boundaries/meeting-ignored-value-semicolon-yaml]

[corpus fixture: cynefin/semicolon-header-selected-parts]

[fixture: cynefin/hidden-boundaries/meeting-selected-gap-semicolon-yaml]

[fixture: cynefin/hidden-boundaries/meeting-comment-line-directive]

[fixture: cynefin/hidden-boundaries/meeting-comment-line-yaml]

[fixture: cynefin/hidden-boundaries/meeting-blank-line-directive]

[test: cynefin/hidden-boundaries/meeting-ls-in-form-directive]

[test: cynefin/hidden-boundaries/meeting-ls-in-form-yaml]

[test: cynefin/hidden-boundaries/meeting-ps-in-form-directive]

[test: cynefin/hidden-boundaries/meeting-ps-in-form-yaml]

[fixture: cynefin/hidden-boundaries/meeting-empty-description-directive]

[fixture: cynefin/hidden-boundaries/meeting-empty-description-yaml]

[fixture: cynefin/hidden-boundaries/header-inline-domain-item-directive]

[fixture: cynefin/hidden-boundaries/header-inline-domain-item-yaml]

入力（escape 表記）: `"cynefin-beta complex \"A\" %%{{x}}%%\n"`.

Output
([hidden-boundaries/header-inline-domain-item-directive-output.mmd](../tests/fixtures/cynefin/hidden-boundaries/header-inline-domain-item-directive-output.mmd)):

```mmd
cynefin-beta complex "A" %%{{x}}%%
```

[fixture: cynefin/hidden-boundaries/boundary-suffix-directive-spare]

[fixture: cynefin/hidden-boundaries/boundary-suffix-yaml-spare]

[fixture: cynefin/hidden-boundaries/boundary-suffix-directive-space]

[fixture: cynefin/hidden-boundaries/boundary-suffix-yaml-tab]

[fixture: cynefin/hidden-boundaries/boundary-before-arrow-consumed]

[fixture: cynefin/hidden-boundaries/boundary-header-inline]

[fixture: cynefin/hidden-boundaries/boundary-header-consumed]

[fixture: cynefin/hidden-boundaries/boundary-header-body-suffix]

[fixture: cynefin/hidden-boundaries/boundary-after-visible-eol]

[fixture: cynefin/hidden-boundaries/boundary-multiple-suffix]

[fixture: cynefin/hidden-boundaries/boundary-eof-padding]

[fixture: cynefin/hidden-boundaries/boundary-eof-yaml]

[fixture: cynefin/hidden-boundaries/boundary-header-yaml]

[fixture: cynefin/hidden-forms/hidden-domain-name]

[fixture: cynefin/hidden-forms/hidden-item-trailing]

入力（escape 表記）:
`"cynefin-beta\ncomplex-->clear%%{!spare}%%\n\nchaotic \"Spare\""`.

Output
([hidden-boundaries/boundary-suffix-directive-spare-output.mmd](../tests/fixtures/cynefin/hidden-boundaries/boundary-suffix-directive-spare-output.mmd)):

```mmd
cynefin-beta
  complex --> clear%%{!spare}%%

  chaotic
    "Spare"
```

### Retained prefix

textBeforeHeader があれば共有の keepsPrefix で、
見出し keyword の直前まで prefix 全体を保ちます。
先頭 LF、passed trivia、second-scan directive、
real・retained YAML の順を保ちます。
掃除すると無視された YAML が有効な frontmatter になり、
title、設定、受理を変え得るためです。

[fixture: cynefin/retained-prefix/prefix-retained-yaml]

[fixture: cynefin/retained-prefix/prefix-leading-lf]

[fixture: cynefin/retained-prefix/prefix-real-and-retained]

[fixture: cynefin/retained-prefix/prefix-secondscan]

[fixture: cynefin/retained-prefix/prefix-passed-bare-ascii]

入力（escape 表記）:
`"%% ordinary prefix\n---\ntitle: RetainedOnly\nconfig: [\n---\ncynefin-beta\ncomplex \"PrefixItem\""`.

Output
([retained-prefix/prefix-retained-yaml-output.mmd](../tests/fixtures/cynefin/retained-prefix/prefix-retained-yaml-output.mmd)):

```mmd
%% ordinary prefix
---
title: RetainedOnly
config: [
---
cynefin-beta
  complex
    "PrefixItem"
```

### Global directives

Root directive の source と順を保ちます。
同じ印字行の中では、両側の接触・分離を保ちます。
元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
普通の独立行は所属本文の段にし、項目間なら項目の段です。
複数行の内部と未完の EOF の終わりは書かれたままにします。
順の入れ替えや JSON の変更は共通の除去が結合する文字を変え得るためです。
native hidden directive は別の形として扱います。

[fixture: cynefin/global-directives/header-to-body]

[fixture: cynefin/global-directives/global-component-gaps]

[fixture: cynefin/global-directives/global-separated-components]

[fixture: cynefin/global-directives/global-title-separator]

[fixture: cynefin/global-directives/global-native-fences]

[fixture: cynefin/global-directives/global-standalone]

[fixture: cynefin/global-directives/global-multiline]

[fixture: cynefin/global-directives/global-eof-free-text]

[fixture: cynefin/global-directives/between-items-contact]

入力（escape 表記）:
`"cynefin-beta\ncomplex%%{wrap}%%-->%%{wrap}%%clear%%{wrap}%%:%%{wrap}%%'GlobalLabel'"`.

Output
([global-directives/global-component-gaps-output.mmd](../tests/fixtures/cynefin/global-directives/global-component-gaps-output.mmd)):

```mmd
cynefin-beta
  complex%%{wrap}%%-->%%{wrap}%%clear%%{wrap}%%:%%{wrap}%%'GlobalLabel'
```

### Comments

普通の独立コメントは所属本文の段、項目間は項目の段、
prefix は第 1 列にします。
inline コメントは行と接触を保ち、元から離れていれば 1 space にします。
印、内容、末尾の padding を残します。
native comment は CR・LF で終わり、LS・PS は内容です。
共有の comment-region による行結合では内部の列を保ち、
印字する最初の行だけをそろえます。
移動すると所属が変わり得るためです。

[fixture: cynefin/comments/comment-prefix]

[fixture: cynefin/comments/comment-domain-header]

[fixture: cynefin/comments/comment-touching-item]

[fixture: cynefin/comments/comment-separated-item]

[fixture: cynefin/comments/comment-standalone-body]

[fixture: cynefin/comments/comment-bare-triple]

[fixture: cynefin/comments/comment-inside-string]

[test: cynefin/comments/comment-unicode-join]

[test: cynefin/comments/comment-ls-native-content]

入力（escape 表記）:
`"%% PrefixComment\ncynefin-beta\nclear \"Commented\""`.

Output
([comments/comment-prefix-output.mmd](../tests/fixtures/cynefin/comments/comment-prefix-output.mmd)):

```mmd
%% PrefixComment
cynefin-beta
  clear
    "Commented"
```

### Blank lines

文、項目、trivia の間の普通の ASCII 空行は最大 1 行にし、
文書・本文の端の空行を削ります。
空白だけの行も空行にします。
余分な間隔を増やさず、書かれたまとまりを保つためです。
値、説明、hidden・directive 内部、retained prefix、joining region、
semicolon の保護、hidden に要る LF は各規則に従います。

[fixture: cynefin/blank-lines/blanks-between-items]

[fixture: cynefin/blank-lines/blanks-between-statements]

[fixture: cynefin/blank-lines/blanks-around-trivia]

[fixture: cynefin/blank-lines/blanks-hidden-excess]

入力（escape 表記）:
`"cynefin-beta\n\ncomplex \"BlankStart\"\n\n \t\n\n\"BlankEnd\"\n\n\n"`.

Output
([blank-lines/blanks-between-items-output.mmd](../tests/fixtures/cynefin/blank-lines/blanks-between-items-output.mmd)):

```mmd
cynefin-beta
  complex
    "BlankStart"

    "BlankEnd"
```

### Trailing whitespace

見出し、領域の語、完成した項目・遷移、説明 closer の後の、
害のない外側の ASCII padding を削ります。
値の継続行、コメント、directive・hidden 内部、必要な closer padding、
保護区間は保ちます。
全物理行の trim は値や受理を変え得るので、owner ごとに決めます。

[fixture: cynefin/trailing-whitespace/trailing-structure]

[fixture: cynefin/trailing-whitespace/trailing-string-value]

[fixture: cynefin/trailing-whitespace/trailing-comment]

[fixture: cynefin/trailing-whitespace/trailing-hidden-opener]

入力（escape 表記）:
`"cynefin-beta \t\ncomplex \t\n\"StructuralTail\" \t\nclear-->chaotic \t\naccDescr {Done} \t"`.

Output
([trailing-whitespace/trailing-structure-output.mmd](../tests/fixtures/cynefin/trailing-whitespace/trailing-structure-output.mmd)):

```mmd
cynefin-beta
  complex
    "StructuralTail"
  clear --> chaotic
  accDescr {Done}
```

### Semicolons

共有の textual-prefix 保護で全 semicolon を残します。
segment の先頭から最後の semicolon までと、
交差する値・trivia 全体を保ち、安全な suffix の隙間だけを整形します。
保護した最初の行は所属本文の段にし、項目なら項目の段にします。
中身と後続行の列は保ちます。
segment は directive と comment-region の結合を含め、
mermaid が読む形で数えます。
cynefin は文法上の semicolon を持たないので verbatimStyleLines は false で、
普通の style・classDef の語の行も整形します。
semicolon の削除や trigger の移動は Db や受理を変え得るためです。

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-without-hidden]

[fixture: cynefin/hidden-boundaries/header-inline-domain-item-directive]

[fixture: cynefin/semicolons/semi-selected-outside-string]

[fixture: cynefin/semicolons/semi-selected-before-arrow]

[fixture: cynefin/semicolons/semi-selected-string]

[fixture: cynefin/semicolons/semi-classdef]

[fixture: cynefin/semicolons/semi-nontrigger]

[fixture: cynefin/semicolons/semi-two-passes]

[fixture: cynefin/semicolons/semi-entity]

[fixture: cynefin/semicolons/semi-directive-rejoined]

[fixture: cynefin/semicolons/semi-plain-style-line-formats]

[fixture: cynefin/semicolons/semi-style-label-line-formats]

[fixture: cynefin/semicolons/semi-hidden-fence-cut]

[fixture: cynefin/semicolons/semi-line-other-value]

[fixture: cynefin/semicolons/semi-multiline-global-word]

[test: cynefin/semicolons/semi-ls-segment-owned]

[test: cynefin/semicolons/semi-ps-segment-owned]

[fixture: cynefin/semicolons/semi-item-body-indentation]

[fixture: cynefin/semicolons/last-item-protected]

[fixture: cynefin/semicolons/cross-domain-suffix]

入力（escape 表記）:
`"cynefin-beta\ncomplex \"style:#fixed\";\"SuffixItem\""`.

Output
([semicolons/semi-selected-outside-string-output.mmd](../tests/fixtures/cynefin/semicolons/semi-selected-outside-string-output.mmd)):

```mmd
cynefin-beta
  complex "style:#fixed"; "SuffixItem"
```

[fixture: cynefin/semicolons/review-semicolon-following-pair]

[fixture: cynefin/semicolons/review-semicolon-following-pair-next-line]

[fixture: cynefin/semicolons/review-style-selected-inside-string]

[fixture: cynefin/semicolons/review-semicolon-intervening-item]

[fixture: cynefin/semicolons/review-selected-after-string]

[fixture: cynefin/semicolons/review-semicolon-two-domains]

[fixture: cynefin/semicolons/cynefin-item-line-protected-next-domain]

[fixture: cynefin/semicolons/cynefin-domain-end-before-transition]

入力（escape 表記）:
`"cynefin-beta\ncomplex \"a;\" clear \"b\" \"c\""`.

Output
([semicolons/review-semicolon-following-pair-output.mmd](../tests/fixtures/cynefin/semicolons/review-semicolon-following-pair-output.mmd)):

```mmd
cynefin-beta
  complex "a;" clear "b" "c"
```

### Multiline values

printWidth では折り返しません。
領域・項目の分割を除き、文字列、遷移ラベル、説明の物理的な内容、
継続列、内部空行を保ちます。
reflow や字下げの変更は Db を変え、遷移部品の折り返しは拒否を招き得ます。
独立した説明 closer は共有規則でそろえます。

[fixture: cynefin/multiline-values/long-line-unwrapped]

[fixture: cynefin/multiline-values/multiline-string-columns]

[fixture: cynefin/multiline-values/multiline-label-columns]

入力（escape 表記）:
`"cynefin-beta\ncomplex-->clear:\"A deliberately long transition label that stays on its authored physical line\""`.

設定: `{"printWidth": 20}`.

Output
([multiline-values/long-line-unwrapped-output.mmd](../tests/fixtures/cynefin/multiline-values/long-line-unwrapped-output.mmd)):

```mmd
cynefin-beta
  complex --> clear : "A deliberately long transition label that stays on its authored physical line"
```

### Frontmatter yaml

安全な real frontmatter だけを共有の保護付き YAML formatter に通し、
Db が同じで読みやすい YAML を選びます。
malformed YAML、字下げされた fence、区切りの padding、HTML の危険、
整形で fence ができる本文は、共有の保護に従って保持します。
YAML の入れ子・block scalar は tabWidth が 0 でも正の最小幅を使います。
retained・native YAML は source のままにし、
空 title による frontmatter へのリセットも残します。

[fixture: cynefin/frontmatter-yaml/frontmatter-safe-yaml]

[fixture: cynefin/frontmatter-yaml/frontmatter-indented-fence]

[fixture: cynefin/frontmatter-yaml/frontmatter-delimiter-padding]

[fixture: cynefin/frontmatter-yaml/frontmatter-html-guard]

[fixture: cynefin/frontmatter-yaml/frontmatter-zero-positive-indent]

[fixture: cynefin/frontmatter-yaml/frontmatter-title-reset]

[fixture: cynefin/frontmatter-yaml/frontmatter-opaque-invalid-config]

[corpus fixture: cynefin/config-fontfamily-keeps-title]

[corpus fixture: cynefin/div-invalid-keeps-config]

[fixture: cynefin/frontmatter-yaml/frontmatter-fence-guard]

[test: cynefin/specified-readings/divergence-opaque-yaml]

入力（escape 表記）:
`"---\ntitle: 'SafeYaml'\nconfig: {cynefin: {width: 1000}}\n---\ncynefin-beta\nclear \"YamlBody\""`.

Output
([frontmatter-yaml/frontmatter-safe-yaml-output.mmd](../tests/fixtures/cynefin/frontmatter-yaml/frontmatter-safe-yaml-output.mmd)):

```mmd
---
title: "SafeYaml"
config: { cynefin: { width: 1000 } }
---
cynefin-beta
  clear
    "YamlBody"
```

### Line terminators and unicode

共有の host 方針で CR・CRLF を LF として読み、
値や hidden 内部も設定の LF・CRLF・CR で出力します。
LS・PS・NBSP・BOM は、共通値の外端と普通の説明 opener 前の空白を除き、
字句上の役割を保ちます。
一律に padding とすると値を変えたり、拒否入力を修復したりするためです。
先頭 BOM は Prettier が除去・復元するため、
元の frontmatter の状態と byte 一致は保証しません。

[test: cynefin/line-terminators-and-unicode/eol-bare-cr]

[test: cynefin/line-terminators-and-unicode/eol-crlf-string]

[test: cynefin/line-terminators-and-unicode/eol-output-crlf-hidden]

[test: cynefin/line-terminators-and-unicode/eol-output-cr]

[test: cynefin/line-terminators-and-unicode/unicode-string-owned]

[test: cynefin/line-terminators-and-unicode/unicode-common-edge]

[test: cynefin/line-terminators-and-unicode/unicode-block-opener]

[test: cynefin/line-terminators-and-unicode/bom-leading-host]

[corpus fixture: cynefin/line-ls-gap]

[corpus fixture: cynefin/space-nbsp-body]

### Source order

領域、項目、遷移、共通の代入、本文の hidden の全出現を source 順で残します。
空の共通代入もリセットとして残します。
有効値からの再構築や並べ替えは書かれた出現を失い、
遷移の順や空のリセットの読みを変え得るためです。

[fixture: cynefin/source-order/source-interleaving]

[fixture: cynefin/source-order/source-common-empty-resets]

入力（escape 表記）:
`"cynefin-beta\nclear \"EarlyClear\"\ntitle EarlyTitle\ncomplex-->clear:'EarlyMove'\ncomplex \"LaterComplex\"\naccTitle: Accessible\nclear \"FinalClear\"\ntitle FinalTitle"`.

Output
([source-order/source-interleaving-output.mmd](../tests/fixtures/cynefin/source-order/source-interleaving-output.mmd)):

```mmd
cynefin-beta
  clear
    "EarlyClear"
  title EarlyTitle
  complex --> clear : 'EarlyMove'
  complex
    "LaterComplex"
  accTitle: Accessible
  clear
    "FinalClear"
  title FinalTitle
```

### Final newline

普通の受理ファイルは設定の改行 1 個で終えます。
空領域、最後のコメント、閉じた hidden form も同じです。
ファイルの終わりをそろえるため、普通の末尾空行は削ります。
未完の global directive、retained prefix の境界、
hidden に要る padding、保護された終わりを優先します。

[fixture: cynefin/final-newline/final-newline-domain]

[fixture: cynefin/final-newline/final-newline-empty-domain]

[fixture: cynefin/final-newline/final-newline-comment]

[fixture: cynefin/final-newline/final-newline-closed-hidden]

[fixture: cynefin/final-newline/final-newline-trailing-blanks]

[corpus fixture: cynefin/header-only]

[corpus fixture: cynefin/header-colon]

入力（escape 表記）:
`"cynefin-beta\ncomplex \"FinalItem\""`.

Output
([final-newline/final-newline-domain-output.mmd](../tests/fixtures/cynefin/final-newline/final-newline-domain-output.mmd)):

```mmd
cynefin-beta
  complex
    "FinalItem"
```

### Specified readings

既存の六つの差異に従います。
directive-as-token-boundary、ignored-semicolon-as-token-boundary、
html-tag-in-frontmatter、embedded-data-opaque、
bare-percent-line-before-header、c4-keyword-anywhere です。
cynefin 固有の acceptance-setting key や差異は加えません。
raw 拒否には raw Db がないので、
利用できる指定読みと embedded effect を使います。
単独の parse 失敗は出力せず構文エラーとし、
Markdown は embedding を辞退して、拒否 payload を host に任せます。

[test: cynefin/specified-readings/divergence-opaque-yaml]

[test: cynefin/specified-readings/divergence-c4-string]

[test: cynefin/specified-readings/divergence-html-cross]

[test: cynefin/specified-readings/divergence-bare-unicode]

[corpus fixture: cynefin/directive-arrow-inside]

[corpus fixture: cynefin/semicolon-arrow-inside]

[corpus fixture: cynefin/gram-domain-braces]

### Markdown fences

共有の Markdown 接続で、dedent した payload に同じ規則を適用します。
host が fence・list・quote の字下げを決め、
最終 code line の padding を削ります。
内部の hidden に要る padding は保護します。
末尾 hidden の padding は host が削っても単独整形では保ちます。
実際の host 出力と 3 回の冪等を、単独 payload の Db 一致と別に検査します。

[test: cynefin Markdown: top-level]

[test: cynefin Markdown: list]

[test: cynefin Markdown: quote]

[test: cynefin Markdown: zero]

[test: cynefin Markdown: tabs]

[test: cynefin Markdown: hidden-boundary]

[test: cynefin Markdown: header-hidden]

[test: cynefin Markdown: prefix]

[test: cynefin Markdown: frontmatter]

[test: cynefin Markdown: final-hidden-padding]

[test: cynefin Markdown: rejected]

Input:

````markdown
```mermaid
cynefin-beta:complex"FencedAlpha"'FencedBeta'
```
````

Output:

````markdown
```mermaid
cynefin-beta:
  complex
    "FencedAlpha"
    'FencedBeta'
```
````
