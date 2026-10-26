# info の整形規則

英語版: [info.md](./info.md)

採用した20項目は原文の AST と既存の共有 printer を使います。
不可視文字と物理 CR の例はエスケープしたテストに置きます。

## 規則

### Header

第1列に `info` を置き、書かれた `showInfo` は空白1個の後へ置きます。
見出しを簡潔にするため、flag 前の通常の空白と改行を結合します。
flag の追加や削除はしません。
コメント、global directive、hidden form、保護 segment の境界は保持します。

[fixture: info/header/header-only]

[fixture: info/header/header-flag-inline]

[fixture: info/header/header-flag-next-line]

[fixture: info/header/header-comment-before-flag]

[corpus fixture: info/header-lf]

[corpus fixture: info/header-inline-flag]

[corpus fixture: info/header-flag-next-line]

入力（エスケープ表記）:
`" \tinfo  \n"`.

出力
([header/header-only-output.mmd](../tests/fixtures/info/header/header-only-output.mmd)):

```mmd
info
```

### Indentation

平坦な本文を読みやすくするため、通常の文と独立したコメント・directive を
見出しから1段下げます。
info の列に文法上の意味がないため、
`tabWidth: 0` は空白0個、`useTabs` は幅0でも tab 1個です。
値の継続列、hidden の内部と閉じ、保持 prefix は保持規則に従います。
YAML には共有の正の最小幅を使います。

[fixture: info/indentation/indent-default]

[fixture: info/indentation/indent-four]

[fixture: info/indentation/indent-zero]

[fixture: info/indentation/indent-tabs]

[fixture: info/indentation/indent-zero-tabs]

入力（エスケープ表記）:
`"info\ntitle Topic\n%% note\n%%{wrap}%%\naccTitle: Access\n"`.

出力
([indentation/indent-default-output.mmd](../tests/fixtures/info/indentation/indent-default-output.mmd)):

```mmd
info
  title Topic
  %% note
  %%{wrap}%%
  accTitle: Access
```

### Statements one per line

通常の最初の共通文を見出しの下へ移し、書かれた順と出現を保って
一行一文にします。
空の title、accessibility 行、description block も文として残します。
公開 Db が空であっても、作者が書いた構文を削除する理由にはなりません。
行の値が取り込んだ keyword は値のままです。
hidden の境界と保護 group を優先します。

[fixture: info/statements-one-per-line/first-title-inline]

[fixture: info/statements-one-per-line/first-after-flag-inline]

[fixture: info/statements-one-per-line/order-and-empty]

[fixture: info/statements-one-per-line/same-line-keyword-content]

入力（エスケープ表記）:
`"info title Topic\n"`.

出力
([statements-one-per-line/first-title-inline-output.mmd](../tests/fixtures/info/statements-one-per-line/first-title-inline-output.mmd)):

```mmd
info
  title Topic
```

### Title

外側の空白に一つの簡潔な形を与え、内部の本文を保つため、
`title`、空白1個、共通空白を外端から除いた値を印字します。
null または空白だけの値は裸の `title` にします。
空行、コメント、directive を挟んでも、次の物理行を値に取り込みません。
trivia を含む値、hidden suffix、semicolon 保護では原文の境界を保ちます。

[fixture: info/title/title-trim]

[fixture: info/title/title-whitespace]

[test: info/title/title-unicode-edges]

[fixture: info/title/title-next-empty-line]

[fixture: info/title/title-next-comment-directive]

[fixture: info/title/title-comment-edge]

[corpus fixture: info/title-empty]

[corpus fixture: info/lex-title-one-space]

[corpus fixture: info/lex-title-directive-only]

入力（エスケープ表記）:
`"info\ntitle\t   Topic  words \t\n"`.

出力
([title/title-trim-output.mmd](../tests/fixtures/info/title/title-trim-output.mmd)):

```mmd
info
  title Topic  words
```

### Accessibility lines

[共有の accessibility 配置](./pie.ja.md#accessibility-lines)を使い、
`accTitle` または `accDescr` に colon を接します。
非空値は外端を trim し、空白1個の後に置きます。
空値は colon までにします。
この一貫した簡潔な形で、内部の本文と接触するコメントを保ちます。
colon 後の brace は行の内容です。
空行、コメント、directive の先の物理行を空値へ取り込みません。
hidden suffix と保護 gap は保持します。

[fixture: info/accessibility-lines/a11y-lines]

[fixture: info/accessibility-lines/a11y-empty]

[fixture: info/accessibility-lines/a11y-next-forms]

[fixture: info/accessibility-lines/a11y-line-braces]

[fixture: info/accessibility-lines/a11y-touching-comment]

[test: info/accessibility-lines/a11y-unicode-edges]

[fixture: info/accessibility-lines/a11y-only-directive]

入力（エスケープ表記）:
`"info\naccTitle \t:  Access  words \t\naccDescr\t:   Details  words  \n"`.

出力
([accessibility-lines/a11y-lines-output.mmd](../tests/fixtures/info/accessibility-lines/a11y-lines-output.mmd)):

```mmd
info
  accTitle: Access  words
  accDescr: Details  words
```

### Description blocks

[共有の description 配置](./pie.ja.md#description-blocks)を使います。
keyword と opener、内部の辺の接触を保ち、ある外端空白列だけを1個にします。
通常の opener 空白は物理改行や Unicode 境界を越えて結合します。
実際の opener trivia は改行を保ち、共有の継続字下げを使います。
空白だけの block は、囲む本文がないため `{}` にします。
コメントだけの block ではコメントを1段内側に置きます。
単独の閉じは文の列へ合わせ、非空値の継続列と内部の空行は保ちます。
引用符と backslash は最初の閉じ brace を保護しません。

[fixture: info/description-blocks/block-gap-presence]

[test: info/description-blocks/block-opener-multiline]

[test: info/description-blocks/block-empty]

[fixture: info/description-blocks/block-columns]

[fixture: info/description-blocks/block-comment-only]

[fixture: info/description-blocks/block-opener-trivia]

[fixture: info/description-blocks/block-first-close]

[corpus fixture: info/lex-block-directive-only]

入力（エスケープ表記）:
`"info\naccDescr{D}\naccDescr   {  D  }\naccDescr {D }\naccDescr{ D}\n"`.

出力
([description-blocks/block-gap-presence-output.mmd](../tests/fixtures/info/description-blocks/block-gap-presence-output.mmd)):

```mmd
info
  accDescr{D}
  accDescr { D }
  accDescr {D }
  accDescr{ D}
```

### Authored values

InfoLiteral は decode や再構築をせず、原文を印字します。
info が共通値を公開しなくても作者の本文なので、内部空白、大小文字、
引用符、escape、HTML、entity を保ちます。
`singleQuote` で引用符を変えず、`printWidth` で値を折り返しません。
物理的な複数行 block は継続列と空行を保ちます。
共通 trivia が range を切る場合も、trivia を二重にせず原文全体を保ちます。

[fixture: info/authored-values/literal-quotes-escapes]

[test: info/authored-values/literal-html-entity]

[fixture: info/authored-values/literal-no-wrap]

[fixture: info/authored-values/literal-single-quote-option]

[corpus fixture: info/title-open-quote]

[corpus fixture: info/line-ls-block]

入力（エスケープ表記）:
`"info\ntitle \"open\\q\naccTitle: 'one\\n' \"two\"\naccDescr: \\u0041 \\t\n"`.

出力
([authored-values/literal-quotes-escapes-output.mmd](../tests/fixtures/info/authored-values/literal-quotes-escapes-output.mmd)):

```mmd
info
  title "open\q
  accTitle: 'one\n' "two"
  accDescr: \u0041 \t
```

### Hidden yaml

yaml-block の InfoIgnoredText は原文全体を所有位置に保ちます。
所有位置は textBeforeHeader、textBeforeShowInfo、body、textAfter です。
range 外で消費した LF と閉じの padding を EOF でも保ちます。
必須の境界を削除すると EOL が失われ、次の文が拒否されることがあるためです。
範囲外の spare LF と端の空行は [Blank lines](#blank-lines) に従います。
form の前に改行を足さず、opaque な本文を YAML 整形しません。
opener の通常の字下げは整え、内部と第1列の閉じは列を保ちます。
空本文、複数 form、前の不成立の閉じ、global cut も原文の範囲を保ちます。
先に始まった行や block の値を hidden として読み直しません。

[fixture: info/hidden-yaml/yaml-before-flag]

[fixture: info/hidden-yaml/yaml-body-no-flag]

[fixture: info/hidden-yaml/yaml-after-flag]

[fixture: info/hidden-yaml/yaml-block-space]

[fixture: info/hidden-yaml/yaml-block-spare]

[fixture: info/hidden-yaml/yaml-block-eof]

[fixture: info/hidden-yaml/yaml-opener-padding]

[fixture: info/hidden-yaml/yaml-two-forms]

[fixture: info/hidden-yaml/yaml-later-qualifying-closer]

[fixture: info/hidden-yaml/yaml-global-cuts]

[fixture: info/hidden-yaml/yaml-looking-block-content]

[fixture: info/hidden-yaml/yaml-looking-line-content]

[fixture: info/hidden-yaml/yaml-header-eof-padding]

[fixture: info/hidden-yaml/yaml-flag-eof-padding]

[fixture: info/hidden-yaml/yaml-body-eof-padding]

[fixture: info/hidden-yaml/yaml-body-closing-space]

[fixture: info/hidden-yaml/yaml-closer-inline-statement]

[corpus fixture: info/lex-yaml-three-fences]

入力（エスケープ表記）:
`"info\n---\nx: ignored\n---\nshowInfo\n"`.

出力
([hidden-yaml/yaml-before-flag-output.mmd](../tests/fixtures/info/hidden-yaml/yaml-before-flag-output.mmd)):

```mmd
info
  ---
x: ignored
---
showInfo
```

### Hidden directives

directive-kind の InfoIgnoredText にも同じ原文と境界の保持を適用します。
Root directive とは別です。
所有位置、任意の複数行本文、global cut、消費・spare LF、閉じの padding を
保ちます。
4種類の共通文の textAfter は、空白・tab、spare LF、EOF の境界を保ちます。
可視 EOL 後の form は body のままです。
fallback comment はコメントのままにします。
接した閉じの後に空白を足すと、取り込まれた flag が復活するためです。

[fixture: info/hidden-directives/hidden-body]

[fixture: info/hidden-directives/hidden-title-space]

[fixture: info/hidden-directives/hidden-acctitle-spare]

[fixture: info/hidden-directives/hidden-accdescr-space]

[fixture: info/hidden-directives/hidden-block-spare]

[fixture: info/hidden-directives/hidden-title-eof]

[fixture: info/hidden-directives/hidden-acctitle-eof]

[fixture: info/hidden-directives/hidden-accdescr-eof]

[fixture: info/hidden-directives/hidden-block-eof]

[test: info/hidden-directives/hidden-multiline-later-closer]

[fixture: info/hidden-directives/hidden-two-tail]

[fixture: info/hidden-directives/hidden-global-cuts]

[fixture: info/hidden-directives/hidden-title-spare]

[fixture: info/hidden-directives/hidden-acctitle-space]

[fixture: info/hidden-directives/hidden-accdescr-spare]

[fixture: info/hidden-directives/hidden-block-space]

[fixture: info/hidden-directives/hidden-header-eof-padding]

[fixture: info/hidden-directives/hidden-flag-eof-padding]

[fixture: info/hidden-directives/hidden-body-closing-space]

[fixture: info/hidden-directives/hidden-after-visible-eol]

[corpus fixture: info/hidden-directive-body]

[corpus fixture: info/hidden-directive-close-glued]

[corpus fixture: info/hidden-directive-unclosed]

入力（エスケープ表記）:
`"info showInfo\n%%{! ignored }%%\ntitle Topic\n"`.

出力
([hidden-directives/hidden-body-output.mmd](../tests/fixtures/info/hidden-directives/hidden-body-output.mmd)):

```mmd
info showInfo
  %%{! ignored }%%
  title Topic
```

### Comments

付着と原文を保つため、[共有のコメント配置](./pie.ja.md#comments)を使います。
見出し前は第1列、通常の本文の独立コメントは1段下げ、行内は同じ行です。
接触は保ち、離れた gap は空白1個にします。
mark、本文、末尾空白を保ちます。
native comment は物理 LF で終わり、LS/PS は保ちます。
先に始まった block 内の裸の percent 行は値の場合があります。
共通の除去領域は取り込んだ原文と継続列を保ちます。
保持 prefix と保護 segment は列合わせより優先します。

[fixture: info/comments/comments-align]

[fixture: info/comments/comments-inline]

[test: info/comments/comments-bare-triple]

[fixture: info/comments/comments-value-priority]

[test: info/comments/comments-common-region-join]

入力（エスケープ表記）:
`"    %% before\ninfo\n       %% body\naccTitle: Access\n"`.

出力
([comments/comments-align-output.mmd](../tests/fixtures/info/comments/comments-align-output.mmd)):

```mmd
%% before
info
  %% body
  accTitle: Access
```

[fixture: info/comments/hidden-comment-indentation]

### Global directives

共通の除去が両側を連結するため、
opaque な Root directive の原文と順序を保ちます。
同じ印字行の中では、両側の接触・分離を保ちます。
元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
通常の独立 directive の開始列だけを本文の1段へ合わせます。
完全な component 境界、値内部、複数行、malformed init、
EOF に達する終端も保ちます。
収集、再整形、削除はしません。
info の Db が空でも init は設定を変えうるためです。

[fixture: info/global-directives/header-to-body]

[fixture: info/global-directives/global-colon-brace]

[fixture: info/global-directives/global-inside-values]

[fixture: info/global-directives/global-config-align]

[fixture: info/global-directives/global-multiline]

[fixture: info/global-directives/global-unclosed-word]

[corpus fixture: info/directive-header-space-control]

[corpus fixture: info/directive-invalid-init]

[corpus fixture: info/directive-unclosed-after-header]

入力（エスケープ表記）:
`"info\naccTitle%%{wrap}%%: Access\naccDescr%%{wrap}%%{ D }\n"`.

出力
([global-directives/global-colon-brace-output.mmd](../tests/fixtures/info/global-directives/global-colon-brace-output.mmd)):

```mmd
info
  accTitle%%{wrap}%%: Access
  accDescr%%{wrap}%%{ D }
```

### Semicolons

[共有の文字列 segment 保護](./pie.ja.md#directives-and-semicolons)を使い、
すべての semicolon を残します。
最初の非空白から最後の semicolon までを保護し、
交差する値、コメント、directive は完全な範囲まで含めます。
trigger の移動が選択と受理を変えうるため、保護された見出しと本文は分離しません。
style/classDef の両 pass、大小文字、colon と hash の空白、Unicode 境界、
directive で再結合する trigger は原文を保ち、安全な外側と suffix は整えます。
semicolon は info の一般的な文区切りではありません。

[fixture: info/semicolons/native-description-value]

[fixture: info/semicolons/semicolon-line-values]

[fixture: info/semicolons/semicolon-style-classdef]

[fixture: info/semicolons/semicolon-opener-selected]

[fixture: info/semicolons/semicolon-component-boundaries]

[fixture: info/semicolons/semicolon-brace-boundary]

[fixture: info/semicolons/semicolon-nontriggers]

[test: info/semicolons/semicolon-unicode-segments]

[fixture: info/semicolons/semicolon-comment-crossing]

[fixture: info/semicolons/semicolon-directive-crossing]

[corpus fixture: info/style-block-end-semicolon]

[corpus fixture: info/style-block-end-directive]

入力（エスケープ表記）:
`"info\ntitle A;; ;\naccTitle: B;\naccDescr: C;;\n"`.

出力
([semicolons/semicolon-line-values-output.mmd](../tests/fixtures/info/semicolons/semicolon-line-values-output.mmd)):

```mmd
info
  title A;; ;
  accTitle: B;
  accDescr: C;;
```

### Blank lines

余分な空間を減らし、見た目の grouping を残すため、
通常の内部 ASCII 空行列を1行にし、文書と本文の端の空行は削除します。
コメントの周囲も同じです。
値、directive、hidden 内部、共通の結合領域、保持 prefix は、
原文の役割に関わるため改行を保ちます。
hidden form が LF を消費した後は、
次の文に必要なときだけ予備の LF 1 つを保ちます。
文書の終わりは設定の終端改行1つにし、見出しの直後の空行は削除します。
見出しと最初の文の間に EOL は必要ありません。
それ以外は予備の LF の後に通常の空行の規則を適用し、
連続空行を1行、空白だけの行を空行にします。
予備の LF は文法の要件で、それ以降はコメントの後と同じ作者の区切りです。

hidden の境界や semicolon の保護で文が見出しの行に残っても、
その文の後置 hidden form の後は文と文の間として扱います。

[fixture: info/blank-lines/hidden-following-blanks]

[fixture: info/blank-lines/header-statement-hidden]

[fixture: info/blank-lines/header-statement-semicolon]

[fixture: info/blank-lines/hidden-document-end]

[fixture: info/blank-lines/hidden-body-end]

[fixture: info/blank-lines/hidden-header-blanks]

[fixture: info/blank-lines/blank-runs]

[fixture: info/blank-lines/blank-comments]

[fixture: info/blank-lines/blank-values-kept]

[fixture: info/blank-lines/blank-hidden-kept]

入力（エスケープ表記）:
`"\n\ninfo\n\n\ntitle Topic\n \t\n\naccTitle: Access\n\n"`.

出力
([blank-lines/blank-runs-output.mmd](../tests/fixtures/info/blank-lines/blank-runs-output.mmd)):

```mmd
info
  title Topic

  accTitle: Access
```

### Trailing whitespace

通常の行末を一定にするため、header、flag、完了した block の後の
無害な外側の ASCII padding を削除します。
共通行の外端は Title と Accessibility lines に従います。
コメント、directive、hidden の内容、値の継続行、保護 segment は保ちます。
hidden の閉じの padding は EOF でも保持します。
ノードの range 外であることは、削除が安全であることを意味しません。

[fixture: info/trailing-whitespace/trailing-exterior]

[fixture: info/trailing-whitespace/trailing-comment-kept]

[fixture: info/trailing-whitespace/trailing-block-value-kept]

[fixture: info/trailing-whitespace/trailing-hidden-eof-kept]

入力（エスケープ表記）:
`"info showInfo \t\naccDescr {D} \t\n"`.

出力
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/info/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
info showInfo
  accDescr {D}
```

### Frontmatter yaml

実 frontmatter だけに[保護付き YAML 整形](./compatibility.ja.md#frontmatter)を
使います。
安全な本文を整形し、delimiter の padding は保ちます。
malformed、字下げ delimiter、HTML hazard、delimiter を生む本文は保ちます。
等価な YAML の引用符変更も Mermaid の HTML 変換で不正になりうるためです。
幅0でも YAML は共有の正の最小値を保ちます。
空の info Db とは別に embedded 設定と title を確認します。
hidden YAML はこの formatter へ渡しません。

[fixture: info/frontmatter-yaml/frontmatter-safe]

[fixture: info/frontmatter-yaml/frontmatter-delimiter-padding]

[fixture: info/frontmatter-yaml/frontmatter-indent-kept]

[fixture: info/frontmatter-yaml/frontmatter-html-kept]

[fixture: info/frontmatter-yaml/frontmatter-delimiter-producing-kept]

[fixture: info/frontmatter-yaml/frontmatter-zero-minimum]

[fixture: info/frontmatter-yaml/frontmatter-less-than-safe]

[corpus fixture: info/div-frontmatter-invalid-yaml]

入力（エスケープ表記）:
`"---\ntitle:   Topic\nconfig: {theme: dark, look: classic}\n---\ninfo\n"`.

出力
([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/info/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: Topic
config: { theme: dark, look: classic }
---
info
```

### Retained prefix

textBeforeHeader に hidden form があれば、先頭 LF、コメントの列、
通過した裸の行の trivia、second-scan form、real と hidden の順序を含め、
prefix 全体を保持します。
先頭 LF の削除で無視された YAML が実 frontmatter に昇格し、
設定が有効になったり、不正 YAML が拒否されたりするためです。
通過した percent-brace 行や未閉鎖行は共有 Comment とし、二重印字しません。
通常の通過コメントだけの prefix は共有の root 経路を使います。

[fixture: info/retained-prefix/prefix-leading-lf-kept]

[fixture: info/retained-prefix/prefix-comment-columns-kept]

[fixture: info/retained-prefix/prefix-second-scan-kept]

[fixture: info/retained-prefix/prefix-real-and-hidden]

[fixture: info/retained-prefix/prefix-bare-lines-kept]

[fixture: info/retained-prefix/prefix-between-retained-kept]

入力（エスケープ表記）:
`"\n---\ntitle: Hidden\nconfig: {theme: dark}\n---\ninfo\n"`.

出力
([retained-prefix/prefix-leading-lf-kept-output.mmd](../tests/fixtures/info/retained-prefix/prefix-leading-lf-kept-output.mmd)):

```mmd

---
title: Hidden
config: {theme: dark}
---
info
```

### Line terminators and unicode

[共有の改行方針](./compatibility.ja.md#line-endings)に従い、
Prettier が CR/CRLF を正規化して設定の LF/CRLF/CR を出します。
値、hidden text、frontmatter も同じです。
内部の LS/PS/NBSP/BOM は字句上の役割どおり保ちます。
共通行の外端は trim し、通常の block opener 空白は結合します。
不正な native Unicode gap は拒否のままです。
Prettier は先頭 BOM を除去・復元するため、opening fence の BOM があると
host が hidden YAML を実 frontmatter と読む場合があります。
byte 同一は保証しません。

[test: info/line-terminators-and-unicode/eol-cr-body]

[test: info/line-terminators-and-unicode/eol-crlf-block]

[test: info/line-terminators-and-unicode/eol-cr-hidden]

[test: info/line-terminators-and-unicode/eol-crlf-yaml]

[test: info/line-terminators-and-unicode/eol-output-crlf]

[test: info/line-terminators-and-unicode/eol-output-cr]

[test: info/line-terminators-and-unicode/eol-frontmatter]

[test: info/line-terminators-and-unicode/unicode-values-comments-hidden]

[test: info/line-terminators-and-unicode/bom-header]

[test: info/line-terminators-and-unicode/bom-frontmatter-opening]

[test: info/line-terminators-and-unicode/unicode-all-common-edges]

[corpus fixture: info/line-ls-between]

[corpus fixture: info/space-header-nbsp]

[corpus fixture: info/space-trailing-unicode]
[corpus fixture: info/frontmatter-bom-both]

入力 (escaped): `"info\rshowInfo\rtitle Topic\r"`.

出力: `"info showInfo\n  title Topic\n"`.

### Final newline

予測できる終端にするため、通常の受理ファイルは設定の改行1個で終えます。
header、flag だけのファイル、共通行、空 block、裸・triple comment、
閉じた hidden form が対象で、通常の末尾空行列は削除します。
hidden の閉じの padding と必要な境界、EOF に達する global directive の
原終端は保ちます。
C4 を含む EOF comment への LF 追加は raw の検出を変える場合がありますが、
指定された info の読みは保ちます。

[fixture: info/final-newline/final-common]

[fixture: info/final-newline/final-block]

[fixture: info/final-newline/final-comment]

[fixture: info/final-newline/final-triple-comment]

[fixture: info/final-newline/final-hidden]

[fixture: info/final-newline/final-open-global]

[corpus fixture: info/spec-info-06271baf]

[corpus fixture: info/spec-info-df27ef00]

[corpus fixture: info/div-c4container-header-comment-eof]

入力（エスケープ表記）:
`"info\ntitle\naccTitle: Access"`.

出力
([final-newline/final-common-output.mmd](../tests/fixtures/info/final-newline/final-common-output.mmd)):

```mmd
info
  title
  accTitle: Access
```

### Specified readings

[仕様が受理する構造](../../spec/docs/diagrams/info.md#known-divergences)を
使います。
keyword 内の atomic directive・selected-semicolon cut は修復せず拒否します。
opaque embedded data、C4 keyword の検出、裸 percent 後の Unicode は
識別子の付いた読みを使います。
raw 拒否には raw Db や架空の embedded 効果を補いません。
単体ファイルの解析失敗は出力せず構文エラーを報告し、
Markdown は共有経路で embedding を辞退します。

[corpus fixture: info/div-directive-header-middle]

[corpus fixture: info/div-directive-flag-middle]

[corpus fixture: info/div-directive-title-middle]

[corpus fixture: info/div-directive-acctitle-middle]

[corpus fixture: info/div-directive-accdescr-middle]

[corpus fixture: info/div-selected-showinfo]

[corpus fixture: info/div-selected-title]

[corpus fixture: info/div-selected-acctitle]

[corpus fixture: info/div-selected-accdescr-line]

[corpus fixture: info/div-selected-accdescr-block]

[corpus fixture: info/div-frontmatter-invalid-yaml]

[corpus fixture: info/div-frontmatter-html-invalid-yaml]

[corpus fixture: info/div-c4container-title]

[corpus fixture: info/div-c4component-acctitle]

[corpus fixture: info/div-c4dynamic-line]

[corpus fixture: info/div-c4deployment-block]

[corpus fixture: info/div-c4-hidden-yaml]

[corpus fixture: info/div-c4-hidden-directive]

[corpus fixture: info/div-bare-before-header-ls]

[corpus fixture: info/error-after-common]

[corpus fixture: info/lex-flag-after-empty-block]

[corpus fixture: info/lex-empty-quotes-standalone]

たとえば `"info show%%{wrap}%%Info\n"` は単体では構文エラーを報告します。
修復した出力は作りません。

### Markdown fences

[共有の Markdown 経路](./compatibility.ja.md#markdown-code-blocks)を使い、
dedent 済み payload に info の規則を適用します。
fence、list、quote の字下げと EOL は host に任せます。
実 host は payload の Db と原文とは別に確認します。
Markdown は最終行の hidden 境界を含む padding を削除します。
後続文の前にある途中の hidden padding は保つ必要があります。
不正 payload は embedding を辞退し、host のコード保持方針に従います。

[test: info Markdown: top-level]

[test: info Markdown: list]

[test: info Markdown: quote]

[test: info Markdown: zero]

[test: info Markdown: tabs]

[test: info Markdown: hidden-boundary]

[test: info Markdown: preheader]

[test: info Markdown: frontmatter]

[test: info Markdown: global-and-semicolons]

[test: info Markdown: final-comment]

[test: info Markdown: final-hidden-padding]

[test: info Markdown: rejected]

入力 (escaped): `"```mermaid\ninfo showInfo title Topic\n```\n"`.

出力: `"```mermaid\ninfo showInfo\n  title Topic\n```\n"`.
