# Ishikawa の整形規則

English version: [ishikawa.md](./ishikawa.md)

[Ishikawa の構文](../../spec/docs/diagrams/ishikawa.ja.md) と [木](../../spec/docs/ast/ishikawa.ja.md) を整形する規則です。
Db が等しい複数の形があるときは、選ぶ理由を記します。

エスケープ例は完全な JSON 文字列です。
`\n`、`\r`、`\t`、`\u2028`、`\u2029` は文字を表します。
例は定義時に Mermaid 12.0.0 で検査しました。
通常のテストは Mermaid を動かさず、木と記録した結果を使います。

## Rules

### Header

選ばれた `ishikawa` または `ishikawa-beta` の見出しは、
受理された綴りと大文字小文字を保ち、1 列目に置きます。
Db が等しい別の綴りへ変えず、
見出しを見つけやすくするためです。 [fixture: ishikawa/header/header-column]
[fixture: ishikawa/header/header-stable]
[fixture: ishikawa/header/header-case-alternative]
[fixture: ishikawa/header/header-lowercase]
[fixture: ishikawa/header/header-valid]

外側の空白は除きます。
beta の境界に合わない接尾辞は根のテキストに残します。
接するコメントと directive は後の規則に従います。 [fixture: ishikawa/header/header-beta-fallback]

入力（エスケープ）:

```json
"ishikawa-betaX\n A"
```

出力 ([header/header-beta-fallback-output.mmd](../tests/fixtures/ishikawa/header/header-beta-fallback-output.mmd)):

```mmd
ishikawa
  -betaX
    A
```

### Indentation

字下げは木の深さ × 設定の 1 段です。
見出しは深さ 0、根は 1、子は親より 1 段深くします。
深さごとの一様な字下げで、書かれた幅や clamp の数を持ち込まず、
同じ順序付きの木を作るためです。 [fixture: ishikawa/indentation/indent-depth]
[fixture: ishikawa/indentation/indent-flatten-unsafe]
[fixture: ishikawa/indentation/indent-sibling-causes]
[fixture: ishikawa/indentation/indent-unindented-causes]
[fixture: ishikawa/indentation/indent-zero-unclamped-unsafe]

clamp された原因や相対レベル 0 の原因も、
普通の根の子にします。 [fixture: ishikawa/indentation/indent-clamped]
[fixture: ishikawa/indentation/indent-relative-zero]

空白の 1 段は `Math.max(1, tabWidth)` 文字です。
`tabWidth: 0` でも 1 文字以上にします。
`useTabs` では 1 段にタブを 1 つ使います。
親子を保つため、
段の幅は正である必要があります。 [fixture: ishikawa/indentation/indent-four]
[fixture: ishikawa/indentation/indent-tabs]
[fixture: ishikawa/indentation/indent-zero]
[fixture: ishikawa/indentation/indent-zero-tabs]
[fixture: ishikawa/indentation/tabs-leading-directives]
[fixture: ishikawa/indentation/zero-kept-leading-directive]
[fixture: ishikawa/indentation/zero-leading-directive]
[fixture: ishikawa/indentation/zero-tabs-leading-directives]

入力（エスケープ）:

```json
"ishikawa\nR\n    A\n B\n  C\n      D\n E"
```

出力 ([indentation/indent-clamped-output.mmd](../tests/fixtures/ishikawa/indentation/indent-clamped-output.mmd)):

```mmd
ishikawa
  R
    A
    B
    C
      D
    E
```

### Root on header line

普通の見出し行の根は、全体を深さ 1 の独立した行へ移します。
接する句読点、接尾辞、percent の文字列、semicolon も一緒に移します。
Db を保ちながら、他の printer の見出しと本文の置き方に揃えるためです。
見出しのコメントと directive の接続は、専用の規則に従います。
根に含まれる文らしいテキストは分割しません。 [fixture: ishikawa/root-on-header-line/header-root]
[fixture: ishikawa/root-on-header-line/header-root-kept]
[fixture: ishikawa/root-on-header-line/header-root-percent]
[fixture: ishikawa/root-on-header-line/header-root-tab]
[fixture: ishikawa/root-on-header-line/header-root-touch]

入力（エスケープ）:

```json
"ishikawa R\n    A\n      B"
```

出力 ([root-on-header-line/header-root-output.mmd](../tests/fixtures/ishikawa/root-on-header-line/header-root-output.mmd)):

```mmd
ishikawa
  R
    A
      B
```

### Root indentation

普通の根は、見出しの 1 段下に置きます。
入力の根がすべての原因より深くても浅くても同じです。
根の字下げは親を決めないため、1 列目でも Db は同じですが、
他の printer の本文の約束に揃えます。 [fixture: ishikawa/root-indentation/root-alone]
[fixture: ishikawa/root-indentation/root-deeper]
[fixture: ishikawa/root-indentation/root-column-one]
[fixture: ishikawa/root-indentation/root-zero-alternative]

子孫は独立して木の深さを使います。
見出しと directive の組として保つ根は、その接続を保ちます。
根のない本文のコメントと directive も、
同じ本文の深さを使います。 [fixture: ishikawa/root-indentation/rootless-comment]
[fixture: ishikawa/root-indentation/rootless-directives]

入力（エスケープ）:

```json
"ishikawa\n     R"
```

出力 ([root-indentation/root-alone-output.mmd](../tests/fixtures/ishikawa/root-indentation/root-alone-output.mmd)):

```mmd
ishikawa
  R
```

### Blank lines

普通の空行の連続は 1 つにして、余分な連続を除き、まとまりを残します。
本文の端の普通の空行は除きます。
先頭の共通コメントや directive だけの行の後も同じです。 [fixture: ishikawa/blank-lines/blank-runs]
[fixture: ishikawa/blank-lines/blank-around-trivia]

図のコメントの後の区切りの空行は 1 つ保ちます。
見出しに接する図のコメントの後も同じです。
最後の図コメントの後の隙間は、
末尾まで全体を保ちます。 [fixture: ishikawa/blank-lines/blank-comment-accepted]
[fixture: ishikawa/blank-lines/blank-header-comment-accepted]
[corpus fixture: ishikawa/gram-last-comment-blank-line]
[fixture: ishikawa/blank-lines/header-comment-many-blanks]
[fixture: ishikawa/blank-lines/interior-comment-many-blanks]
[fixture: ishikawa/blank-lines/terminal-comment-complete-gap]

空白だけの行は空行ですが、埋め込まれた結合や directive 内は保ちます。
仕様上の空行とコメントの差異は、
Mermaid の組合せを修復せず整形します。 [fixture: ishikawa/blank-lines/blank-comment-div]
[fixture: ishikawa/blank-lines/blank-header-div]
[corpus fixture: ishikawa/div-beta-header-trailing-space-node]
[corpus fixture: ishikawa/div-between-comment-blank-node]
[corpus fixture: ishikawa/div-between-comment-common-gap-blank-node]
[corpus fixture: ishikawa/div-between-comment-directive-blank-node]
[corpus fixture: ishikawa/div-header-blank-indented-node]
[corpus fixture: ishikawa/div-header-blank-node]
[corpus fixture: ishikawa/div-header-common-comment-blank-node]
[corpus fixture: ishikawa/div-header-directive-blank-node]
[corpus fixture: ishikawa/div-header-several-blank-node]
[corpus fixture: ishikawa/div-header-space-directive-node]
[corpus fixture: ishikawa/div-header-spaces-line-node]
[corpus fixture: ishikawa/div-header-trailing-space-node]
[corpus fixture: ishikawa/div-header-trailing-tab-node]
[corpus fixture: ishikawa/div-header-two-comments-blank-node]
[corpus fixture: ishikawa/div-header-two-comments-common-gap]
[corpus fixture: ishikawa/div-header-whitespace-indented-node]
[corpus fixture: ishikawa/div-between-comment-blank-cr]
[corpus fixture: ishikawa/div-between-comment-blank-crlf]
[corpus fixture: ishikawa/div-header-trailing-nbsp-node]
[corpus fixture: ishikawa/div-header-two-comments-blank-cr]
[corpus fixture: ishikawa/div-header-two-comments-blank-crlf]

入力（エスケープ）:

```json
"ishikawa\nR\n\n %% c\n\n %%{init: {}}%%\n\n A"
```

出力 ([blank-lines/blank-around-trivia-output.mmd](../tests/fixtures/ishikawa/blank-lines/blank-around-trivia-output.mmd)):

```mmd
ishikawa
  R

    %% c

    %%{init: {}}%%

    A
```

### Comments

独立したコメントは次の節点に、末尾では最後の節点に揃えます。
節点との関係を示すためです。
見出しより前のコメントは 1 列目に置きます。 [fixture: ishikawa/comments/comments-align]
[fixture: ishikawa/comments/comment-on-separate-line]

本物の見出し末尾コメントは、接するか空白があるかを保ち、
外側の空白の連続を 1 つにします。 [fixture: ishikawa/comments/comment-header-gap]
[fixture: ishikawa/comments/comment-header-touch]

印、内容、
コメント末尾の空白は全体を保ちます。 [fixture: ishikawa/comments/comment-spaces]
[fixture: ishikawa/comments/comments-bare-braces]
[fixture: ishikawa/comments/header-comment-spaces]
[fixture: ishikawa/comments/kept-comment-spaces]

節点のテキスト開始後の `%%` は、引用符らしい形の中も文字列です。
`#` と単独の `%` も普通の節点テキストです。 [fixture: ishikawa/comments/comment-detach-unsafe]
[fixture: ishikawa/comments/comment-inline-value]
[corpus fixture: ishikawa/div-c4-inline-percent-eof]
[corpus fixture: ishikawa/div-c4-inline-percent-ls-eof]
[corpus fixture: ishikawa/div-c4-inline-percent-ps-eof]

Unicode の終端と共通領域の結合は、
[Line separators](#line-separators) に従います。

入力（エスケープ）:

```json
"ishikawa\nR %% literal"
```

出力 ([comments/comment-detach-unsafe-output.mmd](../tests/fixtures/ishikawa/comments/comment-detach-unsafe-output.mmd)):

```mmd
ishikawa
  R %% literal
```

### Standalone directives

独立した directive は内容と順序を保ち、コメントと同じように揃えます。
埋め込みデータを解釈せず、
節点との関係を示すためです。 [fixture: ishikawa/standalone-directives/directives-align]

見出しの前に接する directive は接したままにします。 [fixture: ishikawa/standalone-directives/directive-before-header-glued]

見出し行で見出しに接する directive は見出し側に残し、
空白で離れた根を次の行へ移します。 [fixture: ishikawa/standalone-directives/header-touching-directive]
[fixture: ishikawa/standalone-directives/header-two-touching-directives]

見出しと空白で隔てられた directive は、同じ行に続く根と一緒に移します。
directive が複数の物理行にまたがる場合も同じです。
見出し側に残すと、directive を除いた見出しの行末に空白が残り、
Mermaid が拒否するためです。
kanban が見出し行の directive を節点と一緒に移すのと同じ理由です。 [fixture: ishikawa/standalone-directives/header-spaced-directive]
[fixture: ishikawa/standalone-directives/header-spaced-multiline-directive]
[fixture: ishikawa/standalone-directives/header-spaced-two-directives]
[fixture: ishikawa/standalone-directives/header-spaced-directive-comment]
[fixture: ishikawa/standalone-directives/header-beta-spaced-directive]
[fixture: ishikawa/standalone-directives/header-spaced-directive-kept]
[fixture:
ishikawa/standalone-directives/header-spaced-directive-literal-percent]
[test: ishikawa: header-spaced-directive-comment-ls]

移した directive の後ろの隙間は、
[Inline directives](#inline-directives) により根の字下げに数えます。
既定の根の深さでは、
後ろの空白が 1 つなら前も 1 つです。 [fixture: ishikawa/standalone-directives/header-spaced-directive-tabs]
[fixture: ishikawa/standalone-directives/header-spaced-directive-zero]

複数の directive では、見出しに接する接頭部を見出し側に残し、
最初の区切りの空白より後を根と一緒に移します。 [fixture:
ishikawa/standalone-directives/header-touching-prefix-spaced-directive]

根に接する directive は、
書かれた見出しと根の組全体を保ちます。 [fixture: ishikawa/standalone-directives/directive-header-touch-root]
[fixture: ishikawa/standalone-directives/header-directive-touching-root]
[fixture: ishikawa/standalone-directives/header-two-directives-touching-root]
[fixture: ishikawa/standalone-directives/header-root-touching-directive-kept]

同じ行に根がなければ、directive とコメントは見出しとの接続を保ちます。
仕様の `div-` 入力も同じです。 [fixture: ishikawa/standalone-directives/directive-header-separated]
[corpus fixture: ishikawa/div-header-space-directive-node]

閉じたもの、複数行のもの、単語の引数、
EOF までのものも境界を保ちます。 [fixture: ishikawa/standalone-directives/directive-open-eof]

入力（エスケープ）:

```json
"%%{init: {}}%%ishikawa\nR"
```

出力 ([standalone-directives/directive-before-header-glued-output.mmd](../tests/fixtures/ishikawa/standalone-directives/directive-before-header-glued-output.mmd)):

```mmd
%%{init: {}}%%ishikawa
  R
```

入力（エスケープ）:

```json
"ishikawa %%{init: {}}%% R\n A"
```

出力 ([standalone-directives/header-spaced-directive-output.mmd](../tests/fixtures/ishikawa/standalone-directives/header-spaced-directive-output.mmd)):

```mmd
ishikawa
 %%{init: {}}%% R
    A
```

入力（エスケープ）:

```json
"ishikawa %%{init: {\n     }}%% R\n A\n  B"
```

出力 ([standalone-directives/header-spaced-multiline-directive-output.mmd](../tests/fixtures/ishikawa/standalone-directives/header-spaced-multiline-directive-output.mmd)):

```mmd
ishikawa
 %%{init: {
     }}%% R
    A
      B
```

### Inline directives

テキスト中の directive の両側の空白は、書かれたとおり保ちます。
directive の除去は両側をつなぐだけで、
空白を補わないためです。 [fixture: ishikawa/inline-directives/directive-gap-trim-unsafe]
[fixture: ishikawa/inline-directives/directive-single-space-gaps]
[fixture: ishikawa/inline-directives/directive-in-value]
[fixture: ishikawa/inline-directives/literal-side-whitespace]
[fixture: ishikawa/inline-directives/joined-line-spaces]

先頭の directive の隙間は、節点の深さによる字下げに数えます。
directive の文字自体は数えません。
隙間は収まる間は保ち、超える分は最後の隙間から順に短くします。
残りを最初の directive の前に、設定の文字で補います。
kanban の配分を再利用し、複数行の内容と継続列を保ち、
任意の入力の字下げを残さないためです。 [fixture: ishikawa/inline-directives/directive-leading]
[fixture: ishikawa/inline-directives/directive-leading-wide]
[fixture: ishikawa/inline-directives/directive-two-leading]
[fixture: ishikawa/inline-directives/directive-multiline-join]
[test: ishikawa: ls-comment-leading-directives]
[test: ishikawa: ps-comment-leading-directive-kept-zero]

入力（エスケープ）:

```json
"ishikawa\nR  %%{init: {}}%%   X"
```

出力 ([inline-directives/directive-gap-trim-unsafe-output.mmd](../tests/fixtures/ishikawa/inline-directives/directive-gap-trim-unsafe-output.mmd)):

```mmd
ishikawa
  R  %%{init: {}}%%   X
```

### Trailing whitespace

`IshikawaLiteral` の末尾の文字は、普通の行でも保持する行でも全て保ちます。
空白、タブ、Unicode の空白、colon の後の空白、
EOF の余白も literal の値の一部です。
値は作者が書いたものであり、Mermaid が trim しても、
Db が等しいことは値を消す理由になりません。
mindmap と同じ、
書かれた値を保つ選択です。 [fixture: ishikawa/trailing-whitespace/trailing-colon-kept]
[fixture: ishikawa/trailing-whitespace/trailing-kept-semicolon]
[fixture: ishikawa/trailing-whitespace/trailing-value-kept]
[fixture: ishikawa/trailing-whitespace/trailing-value-drop-alternative]
[fixture: ishikawa/trailing-whitespace/unpadded-values]
[test: ishikawa: trailing-nbsp]
[test: ishikawa: trailing-unicode-separators]
[test: ishikawa: trailing-unicode-kept-line]

内部の空白、directive の両側の隙間、結合した継続列も保ちます。
コメントの空白と directive の内容も同じです。 [fixture: ishikawa/trailing-whitespace/trailing-directive-continuation]

除くのは [Header](#header) と [Blank lines](#blank-lines) が定める見出し行の外側の余白だけで、
それは literal の値ではありません。 [fixture: ishikawa/trailing-whitespace/trailing-header-div]

入力と出力（エスケープ）:

```json
[
  {
    "input": "ishikawa\nR: \n A:  ",
    "output": "ishikawa\n  R: \n    A:  \n"
  },
  {
    "input": "ishikawa\nR style:#abc;;   \n A",
    "output": "ishikawa\n  R style:#abc;;   \n    A\n"
  },
  {
    "input": "ishikawa\nR   \n A\t  ",
    "output": "ishikawa\n  R   \n    A\t  \n"
  }
]
```

### Node text

節点テキストは、末尾の文字も含めて書かれた綴りを保ちます。
引用符、backtick、空に見える文字列や括弧や call、閉じ忘れ、数、句読点、entity、
HTML、prototype の名前も literal です。
title、accessibility、style、装飾、
データらしい形も同じです。 [fixture: ishikawa/node-text/values-opaque]
[fixture: ishikawa/node-text/values-quote-unsafe]
[fixture: ishikawa/node-text/unquoted-root]
[fixture: ishikawa/node-text/values-html-entities]

他の文法の token 間隔や値変換は適用しません。
Db から label を再構築せず、
書かれた形と設定による読みを保つためです。 [fixture: ishikawa/node-text/values-spacing-unsafe]
[fixture: ishikawa/node-text/value-single-space-and-colon]

C4 に見えるテキストも仕様の読みでは literal として保ちます。
Mermaid がソース全体から C4 を検出して拒否する入力も同じです。 [corpus fixture: ishikawa/detect-c4-component-root]
[corpus fixture: ishikawa/detect-c4-container-text]
[corpus fixture: ishikawa/detect-c4-deployment-suffix]
[corpus fixture: ishikawa/detect-c4-dynamic-quoted]
[fixture: ishikawa/node-text/div-c4]

入力（エスケープ）:

```json
"ishikawa\nR <a x=\"y\">#amp;</a>\n A#35;#x41;"
```

出力 ([node-text/values-html-entities-output.mmd](../tests/fixtures/ishikawa/node-text/values-html-entities-output.mmd)):

```mmd
ishikawa
  R <a x="y">#amp;</a>
    A#35;#x41;
```

入力（エスケープ）:

```json
"ishikawa\nR\n C4Container"
```

出力 ([node-text/div-c4-output.mmd](../tests/fixtures/ishikawa/node-text/div-c4-output.mmd)):

```mmd
ishikawa
  R
    C4Container
```

### Line rule and kept lines

semicolon はすべて残します。
Ishikawa の節点を分ける semicolon はありません。
共有の厳密な綴りの `style`、
続く `classDef` が無視するものも残します。 [fixture: ishikawa/line-rule-and-kept-lines/semicolon-plain]
[fixture: ishikawa/line-rule-and-kept-lines/semicolon-split-unsafe]
[fixture: ishikawa/line-rule-and-kept-lines/separate-cause]
[fixture: ishikawa/line-rule-and-kept-lines/line-rule-delete-unsafe]
[fixture: ishikawa/line-rule-and-kept-lines/line-rule-single-semicolon]

共有の区間保持機構で最後の semicolon までの接頭部を保ち、交差する literal、
コメント、directive は全体を含めます。
末尾を二重に印字しません。
外側の字下げは printer の空白ですが、
literal の末尾の文字は保ちます。 [fixture: ishikawa/line-rule-and-kept-lines/line-rule-kept]
[fixture: ishikawa/line-rule-and-kept-lines/line-rule-double-pass]
[fixture: ishikawa/line-rule-and-kept-lines/line-rule-directive-trigger]
[test: ishikawa: crossing-region-semicolon]
[test: ishikawa: unicode-comment-kept]

colon と hash の隙間、不一致、entity、Unicode の区間境界、
閉じていない directive を止める semicolon の違いも保ちます。
変えると選ばれる semicolon が変わるためです。 [fixture: ishikawa/line-rule-and-kept-lines/line-rule-colon-unsafe]
[fixture: ishikawa/line-rule-and-kept-lines/line-rule-spaced-hash]
[fixture: ishikawa/line-rule-and-kept-lines/line-rule-nonmatches]
[fixture: ishikawa/line-rule-and-kept-lines/open-directive-semicolon-stop]

入力（エスケープ）:

```json
"ishikawa\nR style:#abc;"
```

出力 ([line-rule-and-kept-lines/line-rule-colon-unsafe-output.mmd](../tests/fixtures/ishikawa/line-rule-and-kept-lines/line-rule-colon-unsafe-output.mmd)):

```mmd
ishikawa
  R style:#abc;
```

### Physical lines

`printWidth` に合わせて節点を折り返したり結合したりしません。
引用符らしいテキスト内でも、
普通の物理改行は節点を分けるためです。 [fixture: ishikawa/physical-lines/long-no-wrap]
[fixture: ishikawa/physical-lines/long-wrap-unsafe]
[fixture: ishikawa/physical-lines/separate-cause-lines]
[fixture: ishikawa/physical-lines/quoted-lines-nodes]
[fixture: ishikawa/physical-lines/quoted-lines-join-unsafe]
[fixture: ishikawa/physical-lines/quoted-single-line]
[fixture: ishikawa/physical-lines/ordinary-quote-blanks]
[fixture: ishikawa/physical-lines/data-looking-lines]

一方、除去される複数行 directive や共通コメント領域は、
物理行を 1 つの literal につなぐことがあります。
その領域全体、内部の空行、後の継続列を保ちます。
物理行を一律に節点とせず、
木と値のテキストを保つためです。 [test: ishikawa: joined-common-region]
[test: ishikawa: joined-deeper-continuation]

入力（エスケープ）:

```json
"ishikawa\nR\n A deliberately long cause remains one literal line even when printWidth is twenty"
```

出力 ([physical-lines/long-no-wrap-output.mmd](../tests/fixtures/ishikawa/physical-lines/long-no-wrap-output.mmd)):

```mmd
ishikawa
  R
    A deliberately long cause remains one literal line even when printWidth is twenty
```

### Case and order

見出しと literal の大文字小文字、入力と兄弟の順序、
同じ label で異なる子を持つものも含め、節点の繰返しを保ちます。
見出しの大文字小文字は Db が等しい作者の選択として保ちます。
兄弟の順序と繰返しは順序付き Db の木の一部なので、ソート、重複除去、
同じ label のまとめは行いません。 [fixture: ishikawa/case-and-order/case-order-kept]
[fixture: ishikawa/case-and-order/deduplicate-unsafe]
[fixture: ishikawa/case-and-order/single-cause]

入力（エスケープ）:

```json
"iShIkAwA\nR\n A\n  First\n A\n  Second\n title T"
```

出力 ([case-and-order/case-order-kept-output.mmd](../tests/fixtures/ishikawa/case-and-order/case-order-kept-output.mmd)):

```mmd
iShIkAwA
  R
    A
      First
    A
      Second
    title T
```

### Line terminators

CRLF と単独の CR は、共有の `endOfLine` で正規化し、設定の LF、CRLF、
CR で出力します。
引用符らしい形、directive、frontmatter、コメントの隙間も同じです。
Mermaid はこれらを LF と読み、Ishikawa に文字列の引用文脈はないため、
入力の終端バイトを保つ必要はありません。 [test: ishikawa: cr-lines]
[corpus fixture: ishikawa/lex-crlf-lines]
[test: ishikawa: crlf-quoted-nodes]
[test: ishikawa: crlf-directive]
[test: ishikawa: eol-cr]
[test: ishikawa: eol-crlf]
[test: ishikawa: cr-frontmatter-comment]

拒否される裸の見出しは拒否したままにします。
LS と PS は別の文脈による規則に従います。

入力と出力（エスケープ）:

```json
{
  "input": "ishikawa\rR\r A\r  B\r",
  "output": "ishikawa\n  R\n    A\n      B\n"
}
```

### Line separators

literal や directive 内の LS (`\u2028`) と PS (`\u2029`) は文字です。
literal の末尾の空白であっても保ちます。
LF は [Physical lines](#physical-lines) の規則で、
普通の節点の行を分けます。 [fixture: ishikawa/line-separators/lf-root-and-cause]
[fixture: ishikawa/line-separators/lf-sibling-causes]
[test: ishikawa: ls-ps-values]
[test: ishikawa: ls-value-split-unsafe]
[test: ishikawa: ps-value-split-unsafe]
[test: ishikawa: ls-ps-line-rule]

空白だけの行は空行としてまとめ、
先頭の区切り文字は字下げに直します。 [test: ishikawa: unicode-blank-lines]
[corpus fixture: ishikawa/div-header-ls-line-node]
[corpus fixture: ishikawa/div-header-ps-line-node]

図コメントを終える区切り文字は保ち、
次の節点の深さによる字下げに 1 文字として数え、残りだけ補います。
LF のコメント終端は新しい行を始め、
字下げの文字としては数えません。 [fixture: ishikawa/line-separators/lf-comment-boundary]
[test: ishikawa: ls-comment-boundary]
[test: ishikawa: kept-comment-ls-before]
[test: ishikawa: kept-comment-ps-after]
[test: ishikawa: selected-comment-ls-both]
[test: ishikawa: kept-comment-ps-wide]
[test: ishikawa: selected-comment-ps-shallow]
[test: ishikawa: ps-comment-boundary]
[test: ishikawa: ls-comment-depth-unsafe]
[test: ishikawa: ls-comment-shallower-depth]
[test: ishikawa: ls-comment-to-lf-alternative]
[test: ishikawa: ls-comment-leading-directives]
[test: ishikawa: ps-comment-leading-directive-kept-zero]
[test: ishikawa: unicode-comment-clamped]
[test: ishikawa: unicode-comment-zero]
[test: ishikawa: unicode-comment-tabs]
[test: ishikawa: unicode-comment-crlf]
[test: ishikawa: unicode-comment-blank-cr]
[corpus fixture: ishikawa/div-between-comment-ls-blank-node]
[corpus fixture: ishikawa/div-between-comment-ps-blank-node]
[corpus fixture: ishikawa/div-between-two-comments-ls-node]
[corpus fixture: ishikawa/div-between-two-comments-ps-node]
[corpus fixture: ishikawa/div-header-comment-directive-marker-ls]
[corpus fixture: ishikawa/div-header-comment-directive-value-ps]
[corpus fixture: ishikawa/div-header-comment-ls-node]
[corpus fixture: ishikawa/div-header-comment-ps-node]

共通コメント領域が飲み込む接尾部と結合は、領域全体を保ちます。
コメントの組合せを修復する別の方針を作らず、書かれた境界と親子を保つためです。
保持区間は実際のコメント終端でだけ切り、
完全な literal や directive の内部の区切り文字では切りません。 [test: ishikawa: ls-common-swallows]
[corpus fixture: ishikawa/div-header-inline-comment-ls-node]
[corpus fixture: ishikawa/div-header-inline-comment-ps-node]
[test: ishikawa: common-joined-terminal-spaces]

入力と出力（エスケープ）:

```json
{
  "input": "ishikawa\nR\n A\n%%{}%%\u2028  B",
  "output": "ishikawa\n  R\n    A\n      %%{}%%\u2028     B\n"
}
```

### Whitespace characters

受理する字下げの空白は、深さに応じた設定の文字に直します。
タブ、VT、FF、NBSP、BOM、全角空白も入力の 1 文字として数えます。
タブの見かけの幅で親を決めません。 [corpus fixture: ishikawa/lex-space-positions]
[corpus fixture: ishikawa/lex-tab-positions]
[fixture: ishikawa/whitespace-characters/space-indentation]
[fixture: ishikawa/whitespace-characters/tab-visual-expansion-unsafe]
[corpus fixture: ishikawa/lex-bom-positions]
[corpus fixture: ishikawa/lex-em-quad-positions]
[corpus fixture: ishikawa/lex-em-space-positions]
[corpus fixture: ishikawa/lex-en-quad-positions]
[corpus fixture: ishikawa/lex-en-space-positions]
[corpus fixture: ishikawa/lex-ff-positions]
[corpus fixture: ishikawa/lex-figure-space-positions]
[corpus fixture: ishikawa/lex-four-per-em-positions]
[corpus fixture: ishikawa/lex-hair-space-positions]
[corpus fixture: ishikawa/lex-ideographic-positions]
[corpus fixture: ishikawa/lex-medium-math-space-positions]
[corpus fixture: ishikawa/lex-narrow-nbsp-positions]
[corpus fixture: ishikawa/lex-nbsp-positions]
[corpus fixture: ishikawa/lex-ogham-positions]
[corpus fixture: ishikawa/lex-punctuation-space-positions]
[corpus fixture: ishikawa/lex-six-per-em-positions]
[corpus fixture: ishikawa/lex-thin-space-positions]
[corpus fixture: ishikawa/lex-three-per-em-positions]
[corpus fixture: ishikawa/lex-vt-positions]
[test: ishikawa: unicode-indentation]

literal の内部と末尾の文字は、書かれた値として保ちます。
NEL、ゼロ幅空白、NUL、
補助平面の文字も literal です。 [test: ishikawa: unicode-value-kept]
[test: ishikawa: nel-zero-width-text]

ファイル先頭の BOM と BOM と frontmatter の制限は、
compatibility にある Prettier の共有の処理に従います。 [test: ishikawa: leading-bom]

入力（エスケープ）:

```json
"ishikawa\nR\n A\n\tB\n  C"
```

出力 ([whitespace-characters/tab-visual-expansion-unsafe-output.mmd](../tests/fixtures/ishikawa/whitespace-characters/tab-visual-expansion-unsafe-output.mmd)):

```mmd
ishikawa
  R
    A
    B
      C
```

### Frontmatter YAML

共有のガード付き Prettier YAML 整形で、安全な設定を読みやすくします。
区切りと閉じる行の余白は保ちます。 [fixture: ishikawa/frontmatter-yaml/frontmatter-yaml]
[fixture: ishikawa/frontmatter-yaml/frontmatter-width-config]
[fixture: ishikawa/frontmatter-yaml/closing-delimiter-padding]
[test: ishikawa: crlf-and-bom]

YAML の字下げは `tabWidth: 0` でも最低 1 つの空白を使います。
理由は、
[フロントマター](./compatibility.ja.md#フロントマター)を参照してください。 [fixture: ishikawa/frontmatter-yaml/zero-width-block-scalar-title]
[fixture: ishikawa/frontmatter-yaml/zero-width-nested-title]
[fixture: ishikawa/frontmatter-yaml/zero-width-nested-config]

不正、字下げ付き、HTML に影響するもの、区切りの危険がある YAML は、
frontmatter の境界をまたぐ tag も含めて保ちます。 [fixture: ishikawa/frontmatter-yaml/frontmatter-indented]
[fixture: ishikawa/frontmatter-yaml/frontmatter-malformed]
[corpus fixture: ishikawa/frontmatter-malformed]
[corpus fixture: ishikawa/frontmatter-html-title]
[fixture: ishikawa/frontmatter-yaml/frontmatter-html-guard]
[fixture: ishikawa/frontmatter-yaml/frontmatter-html-requote-unsafe]
[fixture: ishikawa/frontmatter-yaml/frontmatter-html-single-quoted]
[fixture: ishikawa/frontmatter-yaml/frontmatter-delimiter-guard]
[fixture: ishikawa/frontmatter-yaml/frontmatter-delimiter-rewrite-unsafe]
[corpus fixture: ishikawa/div-frontmatter-open-tag-bare-node]
[corpus fixture: ishikawa/div-frontmatter-open-tag-quoted-node]

根は frontmatter の title を上書きします。
根がない場合の空、null、数、空白の title は記録した読みを保ち、
accessibility の metadata は Ishikawa の文を作りません。 [fixture: ishikawa/frontmatter-yaml/frontmatter-rootless]
[corpus fixture: ishikawa/frontmatter-empty-title-rootless]
[corpus fixture: ishikawa/frontmatter-null-title-rootless]
[corpus fixture: ishikawa/frontmatter-numeric-title-rootless]
[corpus fixture: ishikawa/frontmatter-whitespace-title-rootless]

データらしい節点テキストを YAML 整形しません。
空または閉じていない frontmatter の区切りは構文エラーです。

入力（エスケープ）:

```json
"---\n%YAML 1.2\n--- !!map\ntitle: T\n---\nishikawa\nR"
```

出力 ([frontmatter-yaml/frontmatter-delimiter-guard-output.mmd](../tests/fixtures/ishikawa/frontmatter-yaml/frontmatter-delimiter-guard-output.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: T
---
ishikawa
  R
```

### Final newline

普通の受理した入力は、設定の改行 1 つで終えます。
受理した根のない本文も同じです。
共有のファイルの約束に従い、
末尾の任意の空行の連続を除くためです。 [corpus fixture: ishikawa/gram-root-eof]
[corpus fixture: ishikawa/header-only-blank]
[corpus fixture: ishikawa/header-only-lf]
[fixture: ishikawa/final-newline/accepted-spaces-header]
[fixture: ishikawa/final-newline/multiple-final-lf]

拒否される裸の見出しを、改行の追加で救済しません。
最後の図コメントの隙間全体と EOF までの開いた directive は、
書かれた終わりを保ちます。
末尾の literal の余白は、Trailing
whitespace に従い保ちます。 [fixture: ishikawa/final-newline/final-comment]
[corpus fixture: ishikawa/directive-open-root-eof]
[fixture: ishikawa/final-newline/final-value-spaces]

入力（エスケープ）:

```json
"ishikawa\nR\n%% c"
```

出力 ([final-newline/final-comment-output.mmd](../tests/fixtures/ishikawa/final-newline/final-comment-output.mmd)):

```mmd
ishikawa
  R
  %% c
```

### Markdown fences

Markdown がコンテナの字下げを除いてから、 Mermaid fence に同じ規則を適用します。
fence、リスト、引用の字下げはホストが補います。
タブや幅 0 の設定も含め、図の深さを Markdown の入れ物から独立させ、
parse に失敗した本文は整形を辞退するためです。 [fixture: ishikawa/markdown-fences/markdown-top-payload]
[fixture: ishikawa/markdown-fences/markdown-list-payload]

プラグインが整形する fence では、ホストが最終行の空白を除くため、
[Trailing whitespace](#trailing-whitespace) にかかわらず、
その行の literal の余白が失われることがあります。
Mermaid は普通の節点テキストを trim するので、この変更の Db は等しく、
バイトの保持は保証しません。
整形する fence の他の literal の行末は書かれたとおり保ちます。 [fixture: ishikawa/markdown-fences/markdown-last-spaces]
[fixture: ishikawa/markdown-fences/markdown-unpadded-payload]

辞退した fence はホストにとって普通のコードであり、
全ての行の末尾の空白とタブを除きます。 [test: ishikawa Markdown: declined-nonfinal-trailing-whitespace]
ホストの出力と、字下げを除いた図の読みを分けて検査します。

入力（エスケープ）:

```json
"ishikawa R\n A\n   B"
```

出力 ([markdown-fences/markdown-top-payload-output.mmd](../tests/fixtures/ishikawa/markdown-fences/markdown-top-payload-output.mmd)):

```mmd
ishikawa
  R
    A
      B
```

[test: ishikawa Markdown: top-level]
[test: ishikawa Markdown: list]
[test: ishikawa Markdown: quote-list-clamped]
[test: ishikawa Markdown: zero-width]
[test: ishikawa Markdown: tabs]
[test: ishikawa Markdown: directives]
[test: ishikawa Markdown: joined-region]
[test: ishikawa Markdown: trailing-whitespace]
[test: ishikawa Markdown: rootless]
[test: ishikawa Markdown: rejected-bare-header]
[test: ishikawa Markdown: rejected-second-header]
[test: ishikawa Markdown: spaced-header-directive]

## Rejected inputs

共通の失敗経路は、拒否する入力を構文エラーとして報告し、独立ファイルを整形せず、
Markdown fence の整形を辞退します。
見出し、区切り、空または閉じていない frontmatter、
keyword の中の directive を修復しません。
たとえば、改行のない裸の `ishikawa` は構文エラーのままです。
仕様の token 境界の差異も、
拒否したままにします。 [corpus fixture: ishikawa/header-only]
[corpus fixture: ishikawa/header-beta-only]
[corpus fixture: ishikawa/detect-semicolon-in-header]
[corpus fixture: ishikawa/header-letter-suffix]
[corpus fixture: ishikawa/header-indented-second]
[corpus fixture: ishikawa/directive-in-header]
[corpus fixture: ishikawa/directive-in-beta-header]
[corpus fixture: ishikawa/div-directive-beta-prefix]
[corpus fixture: ishikawa/frontmatter-empty]
[corpus fixture: ishikawa/frontmatter-unclosed]
