# Packet formatting rules

英語版: [packet.md](./packet.md)

決定済みの26項目を、共有処理と原綴の AST で実装します。
不可視文字と物理 CR は escape した固定テストです。

## Rules

### Header

作者の `packet` または `packet-beta` を第1列に置きます。
見出しを明確にするため、通常の最初の文は次行へ移します。
`packet` だけは直後の境界が必要で、接着した綴りを作りません。
hidden の境界と保護された見出し・本文の組を優先します。
[gitgraph の checkout 別名](./gitgraph.ja.md#checkout-aliases)と同じく、
作者の同義語を `packet-beta` から `packet` へ書き換えても、
整形の利点がないため原綴を保ちます。

[fixture: packet/header/header-packet]

[fixture: packet/header/header-beta]

[fixture: packet/header/header-global-boundary]

入力 (escaped):
`" \tpacket \t\n0:\"Head\"\n"`.

出力
([header/header-packet-output.mmd](../tests/fixtures/packet/header/header-packet-output.mmd)):

```mmd
packet
  0: "Head"
```

### Indentation

通常の文と独立したコメント・global directive は、見出しから1段字下げします。
本文は平坦で、公開される行は構文の入れ子を増やしません。
packet の列には文法上の意味がないため、`tabWidth: 0` は空白0個、
`useTabs` は幅0でもタブ1個です。
値の継続列、hidden の閉じ、保持する prefix は原形を保ちます。
YAML は共有の正の最小幅を使います。

[fixture: packet/indentation/indent-default]

[fixture: packet/indentation/indent-four]

[fixture: packet/indentation/indent-zero]

[fixture: packet/indentation/indent-tabs]

[fixture: packet/indentation/indent-zero-tabs]

入力 (escaped):
`"packet\n0:\"Indent\"\n       1:\"Next\"\n"`.

出力
([indentation/indent-default-output.mmd](../tests/fixtures/packet/indentation/indent-default-output.mmd)):

```mmd
packet
  0: "Indent"
  1: "Next"
```

### Statements one per line

読みやすさのため、通常の文は1行ずつ印字します。
共通の行値は物理行末までの後続キーワードも所有し、その文字列は分割しません。
セミコロンは packet の区切りではありません。
隣接する不正な文は修復せず、共有の失敗経路で扱います。

[fixture: packet/statements-one-per-line/inline-title]

[fixture: packet/statements-one-per-line/beta-title]

[fixture: packet/statements-one-per-line/line-owns-keyword]

[corpus fixture: packet/gram-same-line-blocks]

[corpus fixture: packet/end-block-semicolon]

[corpus fixture: packet/common-block-needs-eol]

[corpus fixture: packet/gram-visible-newline-in-block]

[corpus fixture: packet/comment-inside-range]

[corpus fixture: packet/gram-empty-description-in-block]

入力 (escaped):
`"packet title Inline topic"`.

出力
([statements-one-per-line/inline-title-output.mmd](../tests/fixtures/packet/statements-one-per-line/inline-title-output.mmd)):

```mmd
packet
  title Inline topic
```

### Block forms and order

`start-end`、`start`、`+count` の3つの AST 形式を保ちます。
両端が等しい範囲もそのままです。
同じ label と空の共通代入を含め、全出現を順に残します。
Db から文を再構成したり併合したりしません。
行分割と公開上限は作者の構造を失い、空代入の削除は最終値を変えるためです。

[fixture: packet/block-forms-and-order/block-three-forms]

[fixture: packet/block-forms-and-order/keep-interleaving]

[fixture: packet/block-forms-and-order/row-split-kept]

[fixture: packet/block-forms-and-order/cap-unpublished-kept]

入力 (escaped):
`"packet\n+2:\"relative\"\n2:\"single\"\n3-3:\"equal range\"\n"`.

出力
([block-forms-and-order/block-three-forms-output.mmd](../tests/fixtures/packet/block-forms-and-order/block-three-forms-output.mmd)):

```mmd
packet
  +2: "relative"
  2: "single"
  3-3: "equal range"
```

### Range dash

数値の範囲を見た目の1単位にするため、通常は `0-15` と詰めます。
global trivia と hidden の境界は詰めずに保ちます。
消費される LF は通常の空白ではないためです。

[fixture: packet/range-dash/dash-tight]

[fixture: packet/range-dash/dash-hidden]

[fixture: packet/range-dash/dash-global-before]

[fixture: packet/range-dash/dash-global-after]

入力 (escaped):
`"packet\n0 \t- 2 : \"Dash\"\n"`.

出力
([range-dash/dash-tight-output.mmd](../tests/fixtures/packet/range-dash/dash-tight-output.mmd)):

```mmd
packet
  0-2: "Dash"
```

### Relative plus

接頭記号と相対長をまとめて読めるよう、通常は `+3` と詰めます。
count の数字は原綴を保ちます。
global trivia と hidden form の接触状態と消費 LF は保ちます。

[fixture: packet/relative-plus/plus-tight]

[fixture: packet/relative-plus/plus-hidden]

[fixture: packet/relative-plus/plus-global-after]

入力 (escaped):
`"packet\n+ \t3 :\"Plus\"\n"`.

出力
([relative-plus/plus-tight-output.mmd](../tests/fixtures/packet/relative-plus/plus-tight-output.mmd)):

```mmd
packet
  +3: "Plus"
```

### Block colons

通常は colon の前を空白0個、後を1個にし、列は揃えません。
例は `0-15: "Source Port"`、`16: "Flag"`、`+3: "Payload"` です。
gitgraph の option と共有の accessibility の colon に合わせます。
pie の空白は pie 固有の選択です。
trivia がある隙間は境界を保ちます。

[fixture: packet/block-colons/colon-compact]

[fixture: packet/block-colons/colon-hidden]

[fixture: packet/block-colons/colon-global-after]

入力 (escaped):
`"packet\n0 - 2 \t:  \"Range\"\n3 \t:\t'Single'\n+ 2 :\"Relative\"\n"`.

出力
([block-colons/colon-compact-output.mmd](../tests/fixtures/packet/block-colons/colon-compact-output.mmd)):

```mmd
packet
  0-2: "Range"
  3: 'Single'
  +2: "Relative"
```

### Quotes

StringLiteral の範囲全体を保ちます。
一重・二重・反対側の引用符、空 label と escape も含みます。
`singleQuote` では書き換えません。
再符号化は作者の綴りを失い、escape と前処理の新たな判断を要するためです。
引用符に見える共通値は、再引用する文字列ではなく literal のままです。

[fixture: packet/quotes/quotes-authored]

[fixture: packet/quotes/quotes-single-option]

入力 (escaped):
`"packet\n0:'single \"quote\"'\n1:\"double 'quote'\"\n2:''\n3:\"\"\n"`.

出力
([quotes/quotes-authored-output.mmd](../tests/fixtures/packet/quotes/quotes-authored-output.mmd)):

```mmd
packet
  0: 'single "quote"'
  1: "double 'quote'"
  2: ''
  3: ""
```

### Label content

label の padding、連続空白、タブ、escape、HTML、entity、
hidden に見える文字列を、内部の共通 trivia を含む範囲全体として保ちます。
trim、圧縮、decode は Db を変え得るためです。
物理改行だけは共有の host 方針に従います。

[fixture: packet/label-content/label-padding]

[fixture: packet/label-content/label-escapes]

[fixture: packet/label-content/label-html-entity]

[fixture: packet/label-content/label-hidden-looking]

入力 (escaped):
`"packet\n0:\"  A  B\t C  \"\n1:\" \t \"\n"`.

出力
([label-content/label-padding-output.mmd](../tests/fixtures/packet/label-content/label-padding-output.mmd)):

```mmd
packet
  0: "  A  B	 C  "
  1: " 	 "
```

### Numbers

start、end、count は NumericLiteral.value ではなく原綴の数字を印字します。
0、精度を失う整数と overflow する数字も保ちます。
double は原綴を失い、拒否される指数や Infinity の構文にもなるためです。
不正な先頭0、小数、符号、指数の入力は corpus の失敗として扱います。

[fixture: packet/numbers/number-zero]

[fixture: packet/numbers/number-precision]

[fixture: packet/numbers/number-overflow]

[fixture: packet/numbers/number-exponent]

[corpus fixture: packet/gram-leading-zero]

[corpus fixture: packet/gram-zero-range]

[corpus fixture: packet/db-precision-rounded]

[corpus fixture: packet/db-overflow-wide]

入力 (escaped):
`"packet\n0-0:\"Zero\"\n"`.

出力
([numbers/number-zero-output.mmd](../tests/fixtures/packet/numbers/number-zero-output.mmd)):

```mmd
packet
  0-0: "Zero"
```

### Title

`title` の後を空白1個とし、非空値の共通空白の外端を trim します。
null または空白だけの値は裸の `title` にします。
等価な外側の空白を統一し、内部文字列、引用符、escape を保つためです。
空行・コメント・directive を挟んでも、次の物理行から値を取りません。
空の最終代入と frontmatter への fallback を残します。
保護された trivia と hidden の境界を優先します。

[fixture: packet/title/title-trim]

[fixture: packet/title/title-null]

[fixture: packet/title/title-no-next]

[fixture: packet/title/title-literal]

[fixture: packet/title/title-frontmatter]

入力 (escaped):
`"packet\ntitle\t  Topic  words \t\n"`.

出力
([title/title-trim-output.mmd](../tests/fixtures/packet/title/title-trim-output.mmd)):

```mmd
packet
  title Topic  words
```

### Accessibility lines

共有の `accTitle: value` と `accDescr: value` を使います。
colon は語に接し、trim した非空値の前を空白1個にします。
空値は colon までです。
内部文字列とコメントの接触を変えず、外側の空白を統一するためです。
colon 後の brace は行値です。
次行の値は結合せず、hidden suffix と保護された組の隙間を保ちます。

[fixture: packet/accessibility-lines/a11y-lines]

[fixture: packet/accessibility-lines/a11y-empty-next]

[corpus fixture: packet/common-line-no-next-value]

[corpus fixture: packet/common-comment-gap]

入力 (escaped):
`"packet\naccTitle \t:  Access  words \t\naccDescr\t:  Details  words \t\n"`.

出力
([accessibility-lines/a11y-lines-output.mmd](../tests/fixtures/packet/accessibility-lines/a11y-lines-output.mmd)):

```mmd
packet
  accTitle: Access  words
  accDescr: Details  words
```

### Description blocks

共有の `layoutDescriptionBlock` を使います。
keyword と opener、内側の接触は保ち、存在する空白列は1個にします。
通常の opener 空白は物理・Unicode 行を越えて結合します。
実際の trivia があれば改行を保ちます。
囲む文字列がないため、空白だけの内側は `{}` にします。
コメント・directive だけの内側は trivia を残します。
非空値の継続列と空行を保ち、独立した閉じは文の位置へ揃えます。
引用符、backslash、hidden に見える文字列も最初の閉じ brace を保護しません。

[fixture: packet/description-blocks/description-gaps]

[fixture: packet/description-blocks/description-columns]

[fixture: packet/description-blocks/description-trivia]

[corpus fixture: packet/lex-description-directive-only]

[fixture: packet/description-blocks/description-bare]

[corpus fixture: packet/lex-description-hidden-first-brace]

[fixture: packet/description-blocks/description-opener-global]

[fixture: packet/description-blocks/description-opener-comment]

[test: packet/description-blocks/description-empty]

[test: packet/description-blocks/description-opener]

[corpus fixture: packet/lex-description-quoted-close]

[corpus fixture: packet/accdescr-block-escaped-close]

入力 (escaped):
`"packet\naccDescr{A}\naccDescr   {  B  }\naccDescr {C }\naccDescr{ D}\n"`.

出力
([description-blocks/description-gaps-output.mmd](../tests/fixtures/packet/description-blocks/description-gaps-output.mmd)):

```mmd
packet
  accDescr{A}
  accDescr { B }
  accDescr {C }
  accDescr{ D}
```

### Multiline values

printWidth では component と値を折り返しません。
block component 間の可視 LF は拒否され、label の改行変更は Db を変えるためです。
既存の label・block の物理行、継続列と内部空行を保ちます。
独立した説明の閉じは共有配置、hidden の消費 LF は境界規則に従います。

[fixture: packet/multiline-values/long-no-wrap]

[fixture: packet/multiline-values/multiline-label]

入力 (escaped):
`"packet\n0-30:\"Long authored label with enough words to exceed a narrow width\"\n"`.

Options: `{"printWidth": 20}`.

出力
([multiline-values/long-no-wrap-output.mmd](../tests/fixtures/packet/multiline-values/long-no-wrap-output.mmd)):

```mmd
packet
  0-30: "Long authored label with enough words to exceed a narrow width"
```

### Comments

共有の接触規則を使います。
通常の独立コメントは本文1段、見出し前は第1列です。
inline は同じ行に置き、接触は保ち、離れた側は空白1個にします。
mark、内容と末尾 padding を保ちます。
native comment は物理 LF・CR までで、LS・PS は内容です。
先行する string・block は percent 文字列を所有し、共通の行値はそこで終わります。
所有を変えないため、共通の削除領域は source 全体と結合する列を保ちます。

[fixture: packet/comments/comments-placement]

[fixture: packet/comments/comments-value]

[fixture: packet/comments/comments-common-region]

[test: packet/comments/comments-ls-ps]

入力 (escaped):
`"packet\n0:\"A%%B\"\naccDescr { A%%B }\ntitle Text%%comment\n"`.

出力
([comments/comments-value-output.mmd](../tests/fixtures/packet/comments/comments-value-output.mmd)):

```mmd
packet
  0: "A%%B"
  accDescr { A%%B }
  title Text%%comment
```

[fixture: packet/comments/hidden-comment-indentation]

### Global directives

共有の Root directive の配置規則を使い、opaque な内容、順序、
component の境界と値内部の文字列を保ちます。
同じ印字行の中では、両側の接触・分離を保ちます。
元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
通常の独立した開始だけ本文1段に揃えます。
複数行の内部と EOF に達する末尾は原形を保ちます。
共通の削除は区切りを補わず、init の削除は行設定を変えるためです。
native hidden DIRECTIVE は別の所有ノードのままです。

[fixture: packet/global-directives/header-to-body]

[fixture: packet/global-directives/global-positions]

[fixture: packet/global-directives/global-in-values]

[fixture: packet/global-directives/global-standalone]

[corpus fixture: packet/directive-unclosed-after-header]

[fixture: packet/global-directives/global-multiline]

入力 (escaped):
`"packet\n0%%{wrap}%%:\t\"Global\"\naccTitle%%{wrap}%%: Access\naccDescr%%{wrap}%%{ Detail }\n"`.

出力
([global-directives/global-positions-output.mmd](../tests/fixtures/packet/global-directives/global-positions-output.mmd)):

```mmd
packet
  0%%{wrap}%%: "Global"
  accTitle%%{wrap}%%: Access
  accDescr%%{wrap}%%{ Detail }
```

### Hidden yaml

yaml-block の PacketIgnoredText を、textBeforeHeader、body、
名前付きの隙間、textAfter の所有位置に1回だけ、範囲全体として保ちます。
範囲外の消費 LF と、EOF を含む閉じの padding を保ちます。
必須の境界の移動や trim は後続文を拒否させ得るためです。
範囲外の余分な LF と端の空行は [Blank lines](#blank-lines) に従います。
opaque な本文は YAML 整形せず、直前に LF を追加しません。
通常の body opener は字下げできますが、内部と閉じの列は保ちます。
空・3 fence の match、複数 form、遅い有効な閉じ、global cut も保ちます。
先行する値の字句優先順位を保ちます。

[fixture: packet/hidden-yaml/yaml-gap-count]

[fixture: packet/hidden-yaml/yaml-gap-end]

[fixture: packet/hidden-yaml/yaml-body]

[fixture: packet/hidden-yaml/yaml-suffix-space]

[fixture: packet/hidden-yaml/yaml-suffix-spare]

[fixture: packet/hidden-yaml/yaml-suffix-eof]

[fixture: packet/hidden-yaml/yaml-three-fences]

[fixture: packet/hidden-yaml/yaml-two-forms]

[fixture: packet/hidden-yaml/yaml-later-closer]

[fixture: packet/hidden-yaml/yaml-global-cut]

[fixture: packet/hidden-yaml/yaml-all-range-gaps]

[fixture: packet/hidden-yaml/yaml-beta-header]

[fixture: packet/hidden-yaml/yaml-eof-padding]

[corpus fixture: packet/hidden-yaml-adjacent-eof]

[corpus fixture: packet/hidden-yaml-title-absorbed]

[corpus fixture: packet/hidden-yaml-in-label]

[corpus fixture: packet/hidden-yaml-in-description]

[corpus fixture: packet/hidden-yaml-acctitle-absorbed]

[corpus fixture: packet/hidden-yaml-accdescr-absorbed]

[corpus fixture: packet/lex-yaml-common-comment]

入力 (escaped):
`"packet\n+---\nopaque count\n---\n2:\"Ycount\"\n"`.

出力
([hidden-yaml/yaml-gap-count-output.mmd](../tests/fixtures/packet/hidden-yaml/yaml-gap-count-output.mmd)):

```mmd
packet
  +---
opaque count
---
2: "Ycount"
```

### Hidden directives

directive の PacketIgnoredText にも共有の source・境界保持を適用し、
Root directive と区別します。
range・single・relative の内部の全隙間、7種類の文の suffix、
見出しとの接触と可視 EOL 後の body form を保ちます。
任意・複数行の本文、遅い有効な閉じ、複数 form、global cut も保ちます。
接着した無効な閉じや未閉じの形は native Comment のままの場合があります。
境界の追加はその分類を変え得るためです。

[fixture: packet/hidden-directives/hidden-all-range-gaps]

[fixture: packet/hidden-directives/hidden-single-gaps]

[fixture: packet/hidden-directives/hidden-relative-gaps]

[fixture: packet/hidden-directives/hidden-header]

[fixture: packet/hidden-directives/hidden-body]

[fixture: packet/hidden-directives/hidden-suffix-range]

[fixture: packet/hidden-directives/hidden-suffix-single]

[fixture: packet/hidden-directives/hidden-suffix-relative]

[fixture: packet/hidden-directives/hidden-common-suffixes]

[fixture: packet/hidden-directives/hidden-multiple]

[fixture: packet/hidden-directives/hidden-later-close]

[fixture: packet/hidden-directives/hidden-fallback]

[fixture: packet/hidden-directives/hidden-unclosed-comment]

[fixture: packet/hidden-directives/hidden-global-inside]

[fixture: packet/hidden-directives/hidden-eof-padding]

[corpus fixture: packet/hidden-directive-empty-adjacent]

[corpus fixture: packet/lex-directive-body-separators]

[corpus fixture: packet/lex-hidden-after-visible-eol]

入力 (escaped):
`"packet\n0%%{!d}%% -%%{!e}%% 1%%{!c}%% :%%{!l}%% \"Dgaps\"\n"`.

出力
([hidden-directives/hidden-all-range-gaps-output.mmd](../tests/fixtures/packet/hidden-directives/hidden-all-range-gaps-output.mmd)):

```mmd
packet
  0%%{!d}%% -%%{!e}%% 1%%{!c}%% :%%{!l}%% "Dgaps"
```

### Retained prefix

textBeforeHeader に hidden form があれば、prefix 全体を保ちます。
先頭 LF、コメントの列、通過した bare line の trivia、
第2 scan の form と real・hidden の順序も含みます。
先頭 LF の削除は、無視された YAML を有効な title・設定、
または不正な frontmatter へ昇格させ得るためです。
通常の通過コメントだけの prefix は、共有の root 整理を使います。

[fixture: packet/retained-prefix/prefix-retain]

[fixture: packet/retained-prefix/prefix-real-hidden]

[fixture: packet/retained-prefix/prefix-second-scan]

[fixture: packet/retained-prefix/prefix-between-retained]

入力 (escaped):
`"\n---\ntitle: Ignored title\nconfig: {packet: {bitsPerRow: 8}}\n---\npacket\n0-9:\"Prefix\"\n"`.

出力
([retained-prefix/prefix-retain-output.mmd](../tests/fixtures/packet/retained-prefix/prefix-retain-output.mmd)):

```mmd

---
title: Ignored title
config: {packet: {bitsPerRow: 8}}
---
packet
  0-9: "Prefix"
```

### Semicolons

全セミコロンを残し、共有の文字列 segment 保護を使います。
最初の非空白から最後のセミコロンまで、交差する値・コメント・
directive 全体へ延ばして保護します。
保護された見出しと最初の文は分離せず、安全な外側と suffix のみ整えます。
style・classDef の両 pass、大文字小文字、colon・hash の空白、反復、
Unicode の境界と directive で再結合する trigger を保ちます。
選ばれた1個の削除が別の1個を選び、Db を変え得るためです。
atomic cut は失敗のままです。

[fixture: packet/semicolons/native-field-value]

[fixture: packet/semicolons/semicolons-text]

[fixture: packet/semicolons/semicolons-trigger]

[fixture: packet/semicolons/semicolons-header-group]

[fixture: packet/semicolons/semicolons-nontrigger]

[fixture: packet/semicolons/semicolons-global-rejoin]

[fixture: packet/semicolons/semicolons-component]

[fixture: packet/semicolons/semicolons-comment-crossing]

[test: packet/semicolons/semicolons-ls-segment]

入力 (escaped):
`"packet\ntitle Text;;\naccTitle: Access;\naccDescr: Detail;;\n0:\"Label;\"\n"`.

出力
([semicolons/semicolons-text-output.mmd](../tests/fixtures/packet/semicolons/semicolons-text-output.mmd)):

```mmd
packet
  title Text;;
  accTitle: Access;
  accDescr: Detail;;
  0:"Label;"
```

### Blank lines

過剰な空白を減らして区切りを見せるため、通常の内部 ASCII 空行列は1空行、
文書と本文の通常の端の空行は削除します。
コメント周辺も同じです。
値、block、directive、hidden の内部、共通領域の結合、
保持する prefix の空行は、内容や原文の役割に属するため保ちます。
hidden form が LF を消費した後は、
次の文に必要なときだけ予備の LF 1 つを保ちます。
文書の終わりは設定の終端改行1つにし、見出しの直後の空行は削除します。
見出しと最初の文の間に EOL は必要ありません。
それ以外は予備の LF の後に通常の空行の規則を適用し、
連続空行を1行、空白だけの行を空行にします。
予備の LF は文法の要件で、それ以降はコメントの後と同じ作者の区切りです。

hidden の境界や semicolon の保護で文が見出しの行に残っても、
その文の後置 hidden form の後は文と文の間として扱います。

[fixture: packet/blank-lines/hidden-following-blanks]

[fixture: packet/blank-lines/header-statement-hidden]

[fixture: packet/blank-lines/header-statement-semicolon]

[fixture: packet/blank-lines/header-statement-directive-line]

[fixture: packet/blank-lines/hidden-document-end]

[fixture: packet/blank-lines/hidden-body-end]

[fixture: packet/blank-lines/hidden-header-blanks]

[fixture: packet/blank-lines/hidden-comment-blanks]

[fixture: packet/blank-lines/hidden-comment-whitespace]

[fixture: packet/blank-lines/blanks-collapse]

[fixture: packet/blank-lines/blanks-comments]

[fixture: packet/blank-lines/blanks-values]

入力 (escaped):
`"\n\npacket\n\n\n0:\"Blank\"\n \t\n\n1:\"Group\"\n\n"`.

出力
([blank-lines/blanks-collapse-output.mmd](../tests/fixtures/packet/blank-lines/blanks-collapse-output.mmd)):

```mmd
packet
  0: "Blank"

  1: "Group"
```

### Trailing whitespace

通常の行末を揃えるため、見出し、完成した block と説明の閉じの後の
無害な外側 ASCII padding を除きます。
共通の行値は共有の compact 配置に従います。
値の継続行、コメント、directive、hidden の内部と保護 segment を保ちます。
範囲外の空白も必要な EOL を可視に保てるため、
hidden の閉じの padding は EOF でも残します。

[fixture: packet/trailing-whitespace/trailing-safe]

[fixture: packet/trailing-whitespace/trailing-comment]

[fixture: packet/trailing-whitespace/trailing-multiline]

入力 (escaped):
`"packet \t\n0:\"Exterior\" \t\naccDescr { Detail } \t\n"`.

出力
([trailing-whitespace/trailing-safe-output.mmd](../tests/fixtures/packet/trailing-whitespace/trailing-safe-output.mmd)):

```mmd
packet
  0: "Exterior"
  accDescr { Detail }
```

### Frontmatter yaml

安全な実 frontmatter だけ、共有の guard 付き YAML 整形へ渡します。
delimiter の padding、不正な本文、字下げした delimiter、
HTML の危険がある本文と delimiter を生成する本文は原形を保ちます。
等価な YAML 引用でも、Mermaid の HTML 変換後に不正になり得るためです。
入れ子と block scalar に字下げが必要なため、幅0でも YAML は正の最小幅です。
hidden YAML と保持する prefix はこの整形へ渡しません。

[fixture: packet/frontmatter-yaml/frontmatter-safe]

[fixture: packet/frontmatter-yaml/frontmatter-html-guard]

[fixture: packet/frontmatter-yaml/frontmatter-indent]

[fixture: packet/frontmatter-yaml/frontmatter-zero-min]

[fixture: packet/frontmatter-yaml/frontmatter-malformed]

[fixture: packet/frontmatter-yaml/frontmatter-delimiter-producing]

入力 (escaped):
`"---\ntitle: \"<a b=\\\"c\\\">\"\n---\npacket\n0:\"Html guard\"\n"`.

出力
([frontmatter-yaml/frontmatter-html-guard-output.mmd](../tests/fixtures/packet/frontmatter-yaml/frontmatter-html-guard-output.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
packet
  0: "Html guard"
```

### Line terminators and unicode

共有の host 改行処理を使います。
物理 CR・CRLF を正規化し、endOfLine に従います。
label、block、hidden と frontmatter の内部も同じです。
LS・PS・NBSP・BOM は内容としての字句上の役割を保ちます。
共通の行値の外端は trim し、通常の block opener 空白は結合できます。
不正な native Unicode gap は拒否のままです。
Prettier は先頭 BOM を除去・復元するため、開始 fence の BOM は
YAML を昇格させ、閉じにもある BOM は失敗させ得ます。
byte の同一性は保証しません。

[corpus fixture: packet/line-ls-between]

[corpus fixture: packet/lex-yaml-bom-both-fences]
[corpus fixture: packet/space-count-bom]

[test: packet/line-terminators-and-unicode/eol-cr]

[test: packet/line-terminators-and-unicode/eol-crlf-label]

[test: packet/line-terminators-and-unicode/eol-crlf-hidden]

[test: packet/line-terminators-and-unicode/eol-cr-yaml-block]

[test: packet/line-terminators-and-unicode/eol-output-crlf]

[test: packet/line-terminators-and-unicode/eol-output-cr]

[test: packet/line-terminators-and-unicode/unicode-values]

[test: packet/line-terminators-and-unicode/unicode-line-trim]

[test: packet/line-terminators-and-unicode/bom-header]

[test: packet/line-terminators-and-unicode/unicode-hidden-content]

[test: packet/line-terminators-and-unicode/unicode-common-interiors]

[test: packet/line-terminators-and-unicode/eol-frontmatter]

[test: packet/line-terminators-and-unicode/bom-frontmatter-opening]

入力 (escaped): `"packet\r0:\"Physical\"\r"`.

出力: `"packet\n  0: \"Physical\"\n"`.

### Final newline

予測可能なファイル末尾にするため、通常の受理入力は指定改行1個で終えます。
見出しだけ、共通行、空 block、コメントと閉じた hidden form も含みます。
通常の末尾空行列を除きます。
EOF に達する global の末尾、hidden の閉じ padding、
必要な prefix と消費 LF の境界は保ちます。
最終 LF は raw C4 検出を変えても、packet の指定読みを保ち得ます。

[corpus fixture: packet/spec-packet-c4580507]

[fixture: packet/final-newline/final-statement]

[fixture: packet/final-newline/final-comment]

[corpus fixture: packet/spec-packet-7426afc4]

[corpus fixture: packet/c4container-header-comment-eof]

[corpus fixture: packet/c4component-header-comment-eof]

[corpus fixture: packet/div-c4-hidden-suffix-eof]

入力 (escaped):
`"packet\n0:\"Final\"\n\n"`.

出力
([final-newline/final-statement-output.mmd](../tests/fixtures/packet/final-newline/final-statement-output.mmd)):

```mmd
packet
  0: "Final"
```

### Specified readings

[6つの既知の差異](../../spec/docs/diagrams/packet.md#known-divergences)
に従います。
directive・選択セミコロンの atomic cut は失敗のままです。
frontmatter HTML は本文だけの変換、opaque な埋め込みデータ、
C4 検出と見出し前の bare percent trivia は指定読みを使います。
受理を変える本文の bitsPerRow は指定の比較経路だけで外し、
site 設定、title と他の設定を残します。
raw 拒否には raw Db がありません。
hidden form、空 label と空説明は新たな差異ではありません。
standalone の失敗は出力せず構文エラーを報告します。
Markdown では埋め込みを辞退し、payload を host に任せます。

[corpus fixture: packet/directive-header-middle]

[corpus fixture: packet/div-selected-title-interior]

[corpus fixture: packet/frontmatter-invalid]

[corpus fixture: packet/div-html-frontmatter-value]

[corpus fixture: packet/c4container-label]

[corpus fixture: packet/bare-before-header-ls]

[corpus fixture: packet/config-frontmatter-fraction]

[corpus fixture: packet/config-frontmatter-overrides-site]

[test: packet/specified-readings/div-bare-unicode]

例: `packet\ntit%%{wrap}%%le Atomic\n` は構文エラーです。
修復した出力は供給しません。

### Markdown fences

共有の Markdown 経路で、字下げを除いた payload に packet 規則を適用します。
fence・list・quote の字下げと改行は host に任せます。
実際の host 出力と冪等性を、payload の Db・木・source と別に検査します。
Markdown は code block の最終行の padding を trim します。
後続文の EOL が不要な最終 hidden 境界の空白も含みます。
内部の hidden padding は引き続き必要です。
拒否された payload は host の未整形 code 経路に従います。

[test: packet Markdown: top-level]

[test: packet Markdown: list]

[test: packet Markdown: quote]

[test: packet Markdown: zero]

[test: packet Markdown: tabs]

[test: packet Markdown: hidden-gap]

[test: packet Markdown: hidden-boundary]

[test: packet Markdown: preheader]

[test: packet Markdown: frontmatter]

[test: packet Markdown: global-and-semicolons]

[test: packet Markdown: final-comment]

[test: packet Markdown: final-hidden-padding]

[test: packet Markdown: rejected]

入力 (escaped): `"```mermaid\npacket 0:\"Fence\"\n```\n"`.

出力: `"```mermaid\npacket\n  0: \"Fence\"\n```\n"`.
