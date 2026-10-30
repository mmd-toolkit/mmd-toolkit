# Agentflow

英語版: [agentflow.md](./agentflow.md)

mermaid.js での根拠:

- [`agentflow.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L38-L673)
- [`afDetector.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/afDetector.ts#L7-L11)
- [`NOTES.md`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/NOTES.md#L20-L62)
- [`agentflowParser.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/parser/agentflowParser.ts#L1-L18)
- [`agentflowDb.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L213-L2492)
- [`shapes.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/shapes.ts#L1-L147)
- [`transformData.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/transformData.ts#L1-L22)
- [`types.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/types.ts#L1-L244)
- [`diagnostics.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/diagnostics.ts#L1-L192)

`agentflow` を扱う。
木は [ast/agentflow.md](../ast/agentflow.ja.md) に定義する。
Db の変換、metadata の振り分け、所属、診断は、
この構文ではなく
[tests パッケージの要約](../../../tests/docs/db-summaries.ja.md#agentflow)
にある。

## 検出

[detection.md](../detection.ja.md) の第 6 項は、
共通の検出位置の小文字の agentflow-beta の直後が、単語文字でないか末尾なら、
agentflow を選ぶ。
文法はヘッダーを再び読む。
安定版の agentflow ヘッダーや大文字小文字の同一視はない。
ハイフンや非 ASCII の接尾部は検出を通っても文法で拒否され得る。
[fixture: agentflow/header-only] [fixture: agentflow/header-without-beta]
[fixture: agentflow/header-upper] [fixture: agentflow/detect-letter-suffix]
[fixture: agentflow/detect-digit-suffix]
[fixture: agentflow/detect-underscore-suffix]
[fixture: agentflow/detect-hyphen-suffix]
[fixture: agentflow/detect-non-ascii-suffix]

検出は C4 より先なので、id や値の中の C4 の語は別のパーサーを選ばせない。
共通のフロントマター、ディレクティブ、ヘッダー前のコメントの trivia を適用する。
裸の %% 行は mermaid.js でも受理される。
ディレクティブでない percent と波括弧の行には、
後述の bare-percent-line-before-header を適用する。
[fixture: agentflow/lex-detect-c4-component-id]
[fixture: agentflow/lex-detect-c4-container-label]
[fixture: agentflow/lex-detect-c4-dynamic-string]
[fixture: agentflow/lex-detect-c4-deployment-suffix]
[fixture: agentflow/directive-before-header]
[fixture: agentflow/frontmatter-title]
[fixture: agentflow/comment-bare-percent-line]
[fixture: agentflow/comment-bare-before-spaces]
[fixture: agentflow/div-percent-braces-before-header]
[fixture: agentflow/div-percent-braces-after-directive-before-header]

## 字句構造

変換後の[図のテキスト](../common.ja.md#ソースの読み方)を読む。
共通の行終端、HTML 属性の引用符、エンティティ、ディレクティブ、
選ばれた無視されるセミコロン、付加する LF を適用する。
木の値は書かれた表記を保つ。
以下の置換以外は [flowchart](./flowchart.ja.md#字句構造) の単位、
順序付きの文脈、最初に一致する規則を使う。
この参照で共有する規則を与え、重ねて定義しない。 [fixture: agentflow/lex-cr]
[fixture: agentflow/lex-crlf] [fixture: agentflow/lex-quoted-crlf]
[fixture: agentflow/html-attribute-quotes]
[fixture: agentflow/directive-in-string]
[fixture: agentflow/lex-style-preprocessing-semicolon]
[fixture: agentflow/header-only]

### 共有する単位と順序付きの文脈

既存の順序の文の文脈、ヘッダーの文脈、Unicode の文字の範囲、
文字列と markdown 文字列、形とプロパティの区切り、
データと二重引用のデータの文脈、コールバック名と引数の文脈、
アクセシビリティの文脈を使う。
ラベル、斜め、楕円、click の文脈には以下の変更を加える。
各規則は文脈の次の位置ごとに試し直す。
後の長い一致を優先せず、一致しない文字は拒否する。
[fixture: agentflow/gram-bracket-shapes] [fixture: agentflow/gram-props]
[fixture: agentflow/lex-quoted-supplementary-label]
[fixture: agentflow/lex-supplementary-id] [fixture: agentflow/lex-combining-id]
[fixture: agentflow/lex-callback-args-u2028]
[fixture: agentflow/lex-data-string-u2029]
[fixture: agentflow/lex-accdescr-block-u2028]

文の規則でヘッダーを読む位置では、
flowchart の選択肢を header-keyword の agentflow-beta だけに置き換える。
その後のコンテナーのキーワードの位置では、subgraph を flow、connector、
global に置き換える。
以前の graph、flowchart、subgraph は通常の id のテキストになり得るが、
agentflow のヘッダーやコンテナーにはならない。
[fixture: agentflow/lex-legacy-header-words-as-ids]
[fixture: agentflow/gram-removed-subgraph-keyword]
[fixture: agentflow/lex-flow-digit-suffix]
[fixture: agentflow/lex-connector-digit-suffix]
[fixture: agentflow/lex-global-digit-suffix]

end と global のキーワードの単位は、後続の ASCII の space と tab だけを取り、
LF や他の空白文字は取らない。
境界は他の境界付きキーワードと同じ ASCII の単語境界である。
特に end は flowchart と違い、後続の行を名前に取り込まない。
同じ行の end の後にも文を続けられる。 [fixture: agentflow/lex-global-tab-space]
[fixture: agentflow/lex-end-nbsp-with-following-node]
[fixture: agentflow/gram-flow-end-suffix]
[fixture: agentflow/gram-flow-end-unicode]
[fixture: agentflow/lex-flow-name-end-does-not-take-newline]
[fixture: agentflow/gram-end-followed-by-vertex]
[fixture: agentflow/lex-global-nbsp-before-newline]

最後の残る空白の規則は、flowchart の最長の連続とは異なり、
1 文字ごとに space の単位を作る。
先にある newline の規則は、連続する LF を 1 つの newline の単位にする。
従って space を 1 つ要求する生成規則は、その単位を 1 つだけ取る。
どの空白の間隔も任意の余白を許すという意味ではない。
[fixture: agentflow/lex-style-double-space-keyword]
[fixture: agentflow/lex-class-double-space-keyword]
[fixture: agentflow/lex-class-double-space-value]
[fixture: agentflow/lex-classdef-double-space-keyword]
[fixture: agentflow/lex-linkstyle-double-space-keyword]
[fixture: agentflow/gram-callback-tooltip-double-space]
[fixture: agentflow/gram-pipe-label-two-spaces-after]

### 矢印

文の文脈の矢印の位置では、まず閉じた solid の矢印を試す。
0 個以上の空白、2 個以上のダッシュ、> または x、0 個以上の空白を読み、
arrow を作る。
リンクテキストの文脈ならそこを抜ける。
先頭の x、o、< の印は許さない。
次に、周囲に空白を許す 2 つのダッシュが opening-arrow を作り、
唯一の solid のリンクテキストの文脈に入る。
[fixture: agentflow/gram-three-edge-kinds]
[fixture: agentflow/gram-edge-extended-length]
[fixture: agentflow/gram-removed-prefix-cross]
[fixture: agentflow/gram-removed-prefix-circle]
[fixture: agentflow/gram-removed-prefix-left]
[fixture: agentflow/gram-split-sequence-label]
[fixture: agentflow/gram-split-failure-label]
[fixture: agentflow/lex-arrow-marker-letter-is-vertex]
[fixture: agentflow/lex-split-edge-third-dash-is-text]
[fixture: agentflow/lex-split-edge-cross-letter-in-text]

その次に、文の文脈だけで、周囲に空白を許すダッシュ、1 個以上の点、
ダッシュが閉じた reference の矢印を作る。
両方のダッシュが必須である。
矢じりの接尾部はなく、リンクテキストの文脈に入らない。
縦棒のラベルは続けられる。 [fixture: agentflow/gram-reference-no-split]
[fixture: agentflow/gram-removed-dotted-arrow]
[fixture: agentflow/lex-reference-missing-leading-dash]
[fixture: agentflow/gram-reference-quoted-pipe-label]
[fixture: agentflow/gram-reference-followed-by-tag-opener]
[fixture: agentflow/gram-reference-newlines-around-arrow]

thick、点線の矢じり付き、invisible の演算子の組とテキストの文脈は除く。
ラベル内で invisible の演算子を先に拒否する規則も除き、
先頭のチルダは通常のラベルの内容とする。
残る solid のリンクテキストの文脈では、
flowchart の文字と文字列の順序と停止規則を使う。
閉じる矢印までセミコロンと行終端は内容とする。
[fixture: agentflow/gram-removed-thick]
[fixture: agentflow/gram-removed-thick-split]
[fixture: agentflow/gram-removed-dotted-split]
[fixture: agentflow/gram-removed-invisible]
[fixture: agentflow/lex-label-leading-tildes]
[fixture: agentflow/lex-label-tildes-after-string]
[fixture: agentflow/lex-split-edge-semicolon-newline]
[fixture: agentflow/gram-split-edge-second-string-rejected]
[fixture: agentflow/gram-split-edge-string-bare-tail]

### 保持するコメントと既定の大きさの上限

common.md
の[コメント保持の大きさの規則](../common.ja.md#mermaidjs-とこの仕様)に従う。
maxTextSize の既定値は 50000 であり、
完全なフロントマターのトリビアを除いたソースを測る。
閉じの --- の行の後に続く空白だけの行も、そのトリビアに含める。
ディレクティブを除き、CRLF を 1 と数え、単位は UTF-16 code unit とする。
[fixture: agentflow/comment-default-size-equal-crlf]
[fixture: agentflow/comment-default-size-above-crlf]
[fixture: agentflow/comment-default-size-equal-inline-directive]
[fixture: agentflow/comment-default-size-above-inline-directive]
[fixture: agentflow/comment-default-size-equal-frontmatter]
[fixture: agentflow/comment-default-size-above-frontmatter]
[fixture: agentflow/frontmatter-extra-trivia-below]
[fixture: agentflow/frontmatter-extra-trivia-boundary]
[fixture: agentflow/frontmatter-extra-whitespace-line-boundary]
[fixture: agentflow/frontmatter-extra-trivia-above]
50000 を超えれば共通の Step 5 のコメント領域と先頭の空白の除去を適用する。
それ以下なら図のテキストにこれらの除去を適用せず、
以下の図の規則がコメント行と行頭の空白を受け取る。
[fixture: agentflow/comment-default-size-fallback]
[fixture: agentflow/comment-default-size-equal]
[fixture: agentflow/comment-looking-string-default-size]
[fixture: agentflow/lex-comment-looking-quote-closes-string]

agentflow のテキストは、この既定の上限で読む。
テキストの設定ではこの secure の設定を変えられない。
[fixture: agentflow/config-secure-key-in-text]

どちらの大きさの分岐でも、残る図のテキストには agentflow の字句規則を適用する。
大きさで変わるのは共通の Step 5 のコメント領域と先頭の空白の除去だけである。
[fixture: agentflow/comment-default-size-fallback-inline-label]
[fixture: agentflow/comment-default-size-fallback-inline-statement]

文の id-run の直前にコメントの規則を入れる。
0 個以上の ASCII の space と tab、直後が { でない %%、
LF を含まない最長の連続を読む。
LF を含めずコメントを作り、印は %%、値はその後のテキストとする。
先行する space と tab は trivia とする。
U+2028 と U+2029 はこの図のコメントを終えない。
[fixture: agentflow/comment-directive-in-body-u2029]
[fixture: agentflow/comment-open-directive-takes-lf]
コメントはヘッダーと文の区切りになり得る。
[fixture: agentflow/comment-node-spaced] [fixture: agentflow/lex-comment-u2028]
[fixture: agentflow/lex-comment-u2029]
[fixture: agentflow/comment-before-class-keeps-newline]
[fixture: agentflow/comment-after-shape-keeps-next-statement]
[fixture: agentflow/comment-header-separator-at-eof]
[fixture: agentflow/comment-keeps-following-empty-line]

既に始まった id-run の中の percent の対は id の内容とする。
ラベルの文脈では通常の text-run の前にコメントの規則を入れ、
斜めと楕円の文脈では閉じる規則より先に試す。
これらのラベルのコメントの規則は直後が { でない %% から始まり、
LF を含まない最長の連続を読み、先行する space や tab は取らない。
これらの文字は、文字列やスラッシュの単位の後や楕円の中でもラベルの内容に残る。
LF は次のテキストの単位へ残すため、次の行へラベルを続けられる。
そのコメント行の形を閉じる区切りは、閉じる区切りではなくコメントの内容になる。
[fixture: agentflow/comment-double-percent-inside-id]
[fixture: agentflow/comment-inside-square]
[fixture: agentflow/comment-inside-trapezoid]
[fixture: agentflow/comment-inside-ellipse]
[fixture: agentflow/comment-label-keeps-interior-spaces]
[fixture: agentflow/lex-ellipse-comment-before-text]
[fixture: agentflow/comment-closing-shape-swallowed]
[fixture: agentflow/comment-square-after-string-padding]
[fixture: agentflow/comment-slanted-after-slash-padding]
[fixture: agentflow/comment-ellipse-space-padding]
[fixture: agentflow/comment-ellipse-tab-padding]
[fixture: agentflow/comment-ellipse-padding-crlf]
[fixture: agentflow/comment-ellipse-body-u2028]
[fixture: agentflow/comment-ellipse-body-u2029]
[fixture: agentflow/comment-square-after-string-directive-padding]

文字列、markdown 文字列、分割形のリンクテキスト、アクセシビリティの値、
コールバックのテキスト、データには図のコメントの規則を置かない。
percent の対やコメントのような行は内容になる。
文の文脈のコメントは、不完全な click の文を次の行のコールバックにつながない。
保持したコメントのような内容にも、
共通のディレクティブと選ばれたセミコロンの規則を適用する。
[fixture: agentflow/comment-quoted-label]
[fixture: agentflow/comment-markdown-label]
[fixture: agentflow/comment-split-edge-label]
[fixture: agentflow/lex-accessibility-block-comment]
[fixture: agentflow/db-metadata-comment-directive-body]
[fixture: agentflow/lex-multiline-string-comment-directive]
[fixture: agentflow/comment-looking-string-after-empty-line]
[fixture: agentflow/div-data-percent-line-is-content]
[fixture: agentflow/comment-before-callback-does-not-join-lines]
[fixture: agentflow/lex-title-inline-percent-content]
[fixture: agentflow/db-acctitle-comment-next-line]
[fixture: agentflow/lex-flow-name-string-comment-content]
[fixture: agentflow/comment-malformed-label-not-read]

### ラベルと閉じる波括弧の違い

固定版の裸の percent の区別を保つ。
通常または斜めの裸のラベルでは、テキストの先頭や末尾も含め単独の % を拒否する。
文字列と楕円のラベルでは受理する。
ディレクティブでない %%{ はラベルのコメントにはならず、その位置で拒否する。
NOTES.md の意図する単独の percent の読み方によって、この規則を変えない。
[fixture: agentflow/lex-single-percent-square]
[fixture: agentflow/lex-single-percent-trapezoid]
[fixture: agentflow/lex-single-percent-ellipse]
[fixture: agentflow/lex-text-percent-quoted]
[fixture: agentflow/lex-percent-at-label-end]
[fixture: agentflow/lex-square-single-percent-unit]
[fixture: agentflow/lex-slanted-single-percent-unit]
[fixture: agentflow/lex-square-nondirective-percent-braces]

flowchart の斜めの閉じる単位を使う。
単位の位置で到達した場合だけ、?] と =] も閉じる。
スラッシュのテキストの単位の後なら到達できるが、
通常のテキストの連続が ? や = を取ると、対応しない ] が残る。
文の通常の id の規則は A=B を拒否する。
flowchart の公開された lexer も同じである。
[fixture: agentflow/lex-trap-close-question]
[fixture: agentflow/lex-trap-close-equals]
[fixture: agentflow/lex-slanted-question-closer-after-slash]
[fixture: agentflow/lex-slanted-equals-closer-after-slash]
[fixture: agentflow/gram-bracket-shapes] [fixture: agentflow/lex-node-equals]

flowchart の波括弧の後の空白の変換を、次の狭い規則に置き換える。 } の後で、
0 個以上の[行の空白](../common.ja.md#表記)に直後の LF が続く場合、
その LF として読む。
これには U+2028、U+2029、垂直タブ、改ページ、U+00A0 も含む。
後続の LF がなければ、この変換を適用しない。
その後の空行は別々に残す。
ディレクティブを除いた上で、どの文脈にも適用する。
ノードの値は変換後の表記ではなくソースの空白を保つ。
[fixture: agentflow/spec-agentflow-blank-line-fold-47a9bd91]
[fixture: agentflow/gram-target-data-trailing-space]
[fixture: agentflow/gram-flow-heading-data-brace-whitespace]
[fixture: agentflow/lex-brace-string-keeps-blank-line]
[fixture: agentflow/lex-brace-line-whitespace-ls]
[fixture: agentflow/lex-brace-line-whitespace-ps]
[fixture: agentflow/lex-brace-line-whitespace-vt]
[fixture: agentflow/lex-brace-line-whitespace-ff]
[fixture: agentflow/lex-brace-line-whitespace-nbsp]
[fixture: agentflow/lex-brace-ls-without-lf]
[fixture: agentflow/gram-data-trailing-space-at-eof]

### 名前、文字列、click のテキスト

flow と connector の名前は、古いコンテナーの語を新しいキーワードに置き換えた、
共通の subgraph-name のテキストの語彙を使う。
click の文脈は click-id と click-comma を名前のテキストとして渡せる。
この位置では Identifier の葉ではなくテキストの単位とする。
消される click を IgnoredText に保ち、
click の文脈を抜けるだけの空白の前で断片を終える。
この空白はちょうど 1 つの空白文字であり、tab、U+00A0、U+2028、U+2029、
正規化された CRLF も含む。
LF にもなり得るため、後の物理行のテキストも名前を続け得る。
さらに続く通常の空白は次の断片に残る。
[fixture: agentflow/lex-name-click-exit-tab]
[fixture: agentflow/lex-name-click-exit-nbsp]
[fixture: agentflow/lex-name-click-exit-ls]
[fixture: agentflow/lex-name-click-exit-ps]
[fixture: agentflow/lex-name-click-exit-crlf]
[fixture: agentflow/lex-name-click-exit-extra-space]
[fixture: agentflow/lex-flow-name-click-state]
[fixture: agentflow/lex-connector-name-click-state]
[fixture: agentflow/lex-flow-name-click-mixed]
[fixture: agentflow/lex-connector-name-click-mixed]
[fixture: agentflow/lex-flow-name-click-after-string]
[fixture: agentflow/lex-flow-name-click-fragment-comma]

それ以外の click、コールバック、文字列の文脈には、
flowchart の順序付きの規則を使う。
URL と tooltip の前置の位置だけで、消される click を保つ。
別の click-id の群を最初の群に結合しない。
認識した閉じた空の説明ブロックや、消される空の文字列、空の markdown 文字列、
空の call も、
[消される形の規則](#空の説明ブロックと消される形)に従い同じ前置欄に置ける。
[fixture: agentflow/lex-empty-call-before-href]
[fixture: agentflow/lex-empty-string-before-url]
[fixture: agentflow/lex-empty-markdown-before-href]
[fixture: agentflow/lex-empty-string-before-url-tooltip]
[fixture: agentflow/lex-empty-call-before-url-tooltip]
[fixture: agentflow/lex-empty-markdown-before-callback-tooltip]
[fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]
字句の文脈の変化は引き続き生じる。
印を保持することは、後続の全 click の語を入れ替え可能にすることではない。
[fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/gram-click-erased-before-url-tooltip]
[fixture: agentflow/gram-click-erased-before-callback-tooltip]
[fixture: agentflow/gram-click-id-groups-not-merged]
[fixture: agentflow/gram-click-erased-after-href]
[fixture: agentflow/gram-empty-description-before-href]

共通の文字列の規則は LF、U+2028、U+2029 を許し、
バックスラッシュによる引用符のエスケープはなく、入れ子の文脈の制限を保つ。
全体が空の文字列と markdown 文字列は値ではなく empty-string の単位とする。
データには独自の二重引用の文脈を使う。
バックスラッシュは引用符をエスケープせず、単引用符は閉じる波括弧を保護しない。
その二重引用の文脈の外のキャレットは拒否する。
[fixture: agentflow/lex-quoted-u2028] [fixture: agentflow/lex-quoted-u2029]
[fixture: agentflow/lex-unclosed-string]
[fixture: agentflow/lex-unclosed-markdown]
[fixture: agentflow/lex-string-markdown-unescaped-quote]
[fixture: agentflow/lex-nested-markdown-one-content]
[fixture: agentflow/lex-url-nested-empty-string-rejected]
[fixture: agentflow/lex-nested-string-two-contents-rejected]
[fixture: agentflow/lex-data-block-single-quoted-brace]
[fixture: agentflow/lex-data-block-quoted-caret]
[fixture: agentflow/lex-data-backslash-quote-is-not-escape]
[fixture: agentflow/lex-data-block-caret]

### 単位の中のディレクティブと無視するセミコロン

Name の part を subgraph-name の代わりとして、
flowchart の
[単位の中のディレクティブ](./flowchart.ja.md#単位の中のディレクティブ)
を適用する。
id、id-list の要素、辺の id、click の文の id、補間名、
形のプロパティの両辺は名前の単位とする。
構造の単位となるキーワードと数値、矢印、複合区切りも不可分である。
これらの内部のディレクティブや選ばれた無視するセミコロンは拒否し、
完全な単位の境界や周囲の空白では拒否しない。
[fixture: agentflow/div-directive-in-id]
[fixture: agentflow/div-directive-in-arrow]
[fixture: agentflow/div-directive-in-linkstyle-number]
[fixture: agentflow/div-directive-in-props-field]
[fixture: agentflow/div-directive-in-style-separator]
[fixture: agentflow/div-ignored-semicolon-in-id]
[fixture: agentflow/div-ignored-semicolon-in-arrow]
[fixture: agentflow/lex-directive-in-pipe-boundary]
[fixture: agentflow/lex-ignored-semicolon-in-pipe-boundary]

ラベル、文字列、コールバック、アクセシビリティ、style、データの内部、
direction-text、Name の断片の単位はテキストか文字列であり、
これらの trivia を含められる。
特に metadata のキーは Identifier ではなく不透明なデータのテキストとする。
書かれた名前の選ばれた無視するセミコロンは共通の trivia に保つ。
結合後の入力を mermaid.js が既に拒否するなら、
境界の規則による divergence の印は付けない。
[fixture: agentflow/lex-directive-in-classdef-value]
[fixture: agentflow/lex-directive-in-linkstyle-value]
[fixture: agentflow/lex-directive-in-metadata-key]
[fixture: agentflow/lex-ignored-semicolon-in-metadata-key]
[fixture: agentflow/directive-in-data]
[fixture: agentflow/directive-in-callback-args]
[fixture: agentflow/lex-directive-in-flow-name-text]
[fixture: agentflow/lex-ignored-semicolon-in-flow-name-text]
[fixture: agentflow/lex-directive-joins-invalid-linkstyle-index]

Name の断片では、キーワードや数値の形の name-piece もテキストであり、
構造のキーワードや NumericLiteral の位置にはしない。
その内部のディレクティブも許す。
[fixture: agentflow/lex-directive-in-name-keyword-text]
[fixture: agentflow/lex-directive-in-name-number-text]

## 文法

[common.md](../common.ja.md#表記) の表記と end-of-text の位置を使い、
上の単位を読む。
以下に挙げる同一の生成規則は
[flowchart の文法](./flowchart.ja.md#文法)から参照し、
ノード型を次の表の Agentflow の型に置き換える。
agentflow の木に Flowchart の接頭辞のノードはない。

| 規則                                 | ノード                                 |
| ------------------------------------ | -------------------------------------- |
| `diagram`                            | AgentflowDiagram                       |
| `empty-statement`                    | AgentflowEmptyStatement                |
| `flow-statement`                     | AgentflowFlowStatement                 |
| `global-statement`                   | AgentflowGlobalStatement               |
| `connector-statement`                | AgentflowConnectorStatement            |
| `flow-name`                          | AgentflowName                          |
| `vertex-statement`                   | AgentflowVertexStatement               |
| `vertex-group`                       | AgentflowVertexGroup                   |
| `vertex`                             | AgentflowVertex                        |
| `shape`                              | AgentflowShape; AgentflowShapeProperty |
| `link`                               | AgentflowLink                          |
| `arrow`                              | AgentflowArrow                         |
| `opening-arrow`                      | AgentflowOpeningArrow                  |
| `label, link-text, name fragment`    | AgentflowLabel                         |
| `data block`                         | AgentflowDataBlock                     |
| `retained name/click/direction text` | AgentflowIgnoredText                   |
| `style-statement`                    | AgentflowStyleStatement                |
| `class-def-statement`                | AgentflowClassDefStatement             |
| `class-statement`                    | AgentflowClassStatement                |
| `numbered link-style-statement`      | AgentflowLinkStyleStatement            |
| `default link-style-statement`       | AgentflowDefaultLinkStyleStatement     |
| `callback click-statement`           | AgentflowClickCallbackStatement        |
| `URL click-statement`                | AgentflowClickUrlStatement             |
| `direction-statement`                | AgentflowDirectionStatement            |
| `title-statement`                    | AgentflowAccTitleStatement             |
| `description-statement`              | AgentflowAccDescrStatement             |
| `description-block-statement`        | AgentflowAccDescrBlockStatement        |

共通の葉は、id と裸のコールバック名と補間名に Identifier、
click の URL と tooltip に StringLiteral、
linkStyle の番号に NumericLiteral を使う。
style、call の後の名前、引数、アクセシビリティの値は AgentflowLiteral とする。
句読記号とキーワードは単位であり、値の葉を作らない。
[fixture: agentflow/gram-id-numbers-unicode]
[fixture: agentflow/db-callback-token-punctuation]
[fixture: agentflow/gram-click-link-forms]
[fixture: agentflow/gram-linkstyle-interpolate-index]
[fixture: agentflow/gram-click-callback-space-args]

### 図と文

```text
diagram                     = leading-unit* header line*
leading-unit                = space | newline | comment
header                      = header-keyword ( no-direction | header-direction first-separator )
first-separator             = ";" | newline | space+ newline | comment
line                        = statement | empty-statement | newline | space | comment
statement                   = vertex-statement statement-end
                            | style-statement statement-end
                            | class-def-statement statement-end
                            | class-statement statement-end
                            | link-style-statement statement-end
                            | click-statement statement-end
                            | connector-statement
                            | flow-statement
                            | global-statement
                            | direction-statement
                            | title-statement
                            | description-statement
                            | description-block-statement
empty-statement             = ";"
statement-end               = separator
separator                   = newline | ";" | end-of-text | comment
```

ヘッダーの方向と no-direction には、
header-keyword を agentflow-beta とした
[flowchart のヘッダーの文脈](./flowchart.ja.md#ヘッダーの文脈)を使う。
次の行の方向は頂点とする。
ヘッダー行の方向には first-separator が必要であり、
セミコロンの前の space では満たさない。
ソースに後続の改行がなくても、コメントは first-separator になり得る。
[fixture: agentflow/header-lf] [fixture: agentflow/header-only]
[fixture: agentflow/header-br] [fixture: agentflow/header-left-symbol]
[fixture: agentflow/header-up-symbol] [fixture: agentflow/header-down-symbol]
[fixture: agentflow/lex-header-direction-empty-line]
[fixture: agentflow/header-no-direction-semicolon]
[fixture: agentflow/lex-header-space-then-semicolon]
[fixture: agentflow/comment-header-separator-at-eof]

区切られる文と EmptyStatement の規則は flowchart を参照し、
区切りに comment を加える。
区切りはどの文にも属さない。
追加のセミコロンは EmptyStatement とし、空行とコメントだけの行では文を作らない。
裸の改行と、先行する ASCII の空白を取るコメントの違いも含め、
各文自身の末尾の空白の制限を保つ。
[fixture: agentflow/gram-class-double-semicolon]
[fixture: agentflow/gram-data-double-semicolon]
[fixture: agentflow/gram-tail-node-semicolons]
[fixture: agentflow/header-empty-document]
[fixture: agentflow/gram-bare-string-statement-rejected]
[fixture: agentflow/gram-connector-title-space-before-comment]
[fixture: agentflow/gram-connector-title-space-before-newline]
[fixture: agentflow/comment-keeps-following-empty-line]

### flow、global、connector と名前

```text
flow-statement      = "flow" ( space flow-name ( "[" label "]" )? data? )?
                      statement-end line* "end"
global-statement    = "global" statement-end line* "end"
connector-statement = "connector" space flow-name ( "[" label "]" )? data? statement-end
flow-name           = ( string | markdown-string | name-piece ) name-piece*
name-piece          = number | id-run | letter | space | "-" | "&" | ":" | "*" | "#"
                    | "v" | "^" | "style" | "linkStyle" | "classDef" | "class"
                    | header-keyword | "flow" | "connector" | "global" | "end"
                    | click-id | click-comma
```

flow は名前の見出し全体を省略でき、connector には名前が必要である。
flow と connector の直後の 1 つの space は文法の間隔なので、
2 つ目の space は名前の一部になり得るが、
1 つの space と改行だけでは名前にならない。
global は名前、題、データを許さない。
本文は空にもでき、flow と global を入れ子にできる。
connector に本文はない。 [fixture: agentflow/gram-flow-all-forms]
[fixture: agentflow/gram-flow-empty]
[fixture: agentflow/gram-connector-all-forms]
[fixture: agentflow/gram-global-empty] [fixture: agentflow/gram-global-data]
[fixture: agentflow/gram-global-label] [fixture: agentflow/gram-flow-nested]
[fixture: agentflow/gram-global-nested]
[fixture: agentflow/gram-flow-name-whitespace-only]
[fixture: agentflow/gram-connector-name-whitespace-only]
[fixture: agentflow/gram-global-in-global]
[fixture: agentflow/gram-flow-inside-global]
[fixture: agentflow/gram-global-name-rejected]
[fixture: agentflow/gram-flow-one-space-no-name]
[fixture: agentflow/gram-connector-one-space-no-name]

角括弧の題は名前の後に続く。 [ の前の空白は名前の空白だが、
]
の後で裸の改行の前にある通常の space は受理しない。
コメントの区切りならその空白を取れる。
見出しのデータは名前か題に直接続く隣接した完全なブロックとする。
名前のない flow に見出しのデータは書けない。
境界付きの小文字の end が flow と global を閉じ、一般の行末を表すものではない。
[fixture: agentflow/gram-flow-inline-data]
[fixture: agentflow/gram-flow-bare-inline-data]
[fixture: agentflow/gram-connector-all-forms]
[fixture: agentflow/gram-flow-open] [fixture: agentflow/gram-flow-end-suffix]
[fixture: agentflow/gram-flow-heading-data-brace-whitespace]
[fixture: agentflow/gram-flow-heading-adjacent-data]
[fixture: agentflow/gram-flow-name-space-before-title]
[fixture: agentflow/gram-flow-title-space-before-newline]
[fixture: agentflow/gram-connector-title-space-before-comment]
[fixture: agentflow/gram-connector-title-space-before-newline]
[fixture: agentflow/gram-unnamed-flow-heading-data-rejected]
[fixture: agentflow/gram-end-followed-by-vertex]

名前の生成規則は、名前の一部として読む両端と引用した余白も含め、
通常の書かれた空白を保つ。
先頭は文字列か markdown にもでき、その後は name-piece だけを続ける。
裸のテキストの後で 2 つ目の通常の文字列を始められない。
default は name-piece の選択肢にない。
コロンは通常の名前の記号である。
ソースにある opening-arrow の選択肢は、
活動中のリンクテキストの文脈を通って正しい名前を完成させないため、
この文法を広げない。 [fixture: agentflow/gram-flow-name-text-followed-string]
[fixture: agentflow/gram-flow-name-string-followed-text]
[fixture: agentflow/lex-unquoted-keyword-names]
[fixture: agentflow/lex-unquoted-rare-keyword-names]
[fixture: agentflow/gram-flow-name-double-space]
[fixture: agentflow/gram-flow-name-string-bare-tail]
[fixture: agentflow/gram-connector-name-string-bare-tail]
[fixture: agentflow/gram-flow-name-default-rejected]
[fixture: agentflow/lex-flow-name-start-link]
[fixture: agentflow/gram-flow-name-quoted-padding]
[fixture: agentflow/lex-name-token-punctuation]

名前を読む間、認識した消される click の印、閉じた空の説明ブロック、
消される空の文字列、空の markdown 文字列、空の call は、
通常の名前の文字にせず読み通す。
[fixture: agentflow/lex-empty-string-in-flow-name]
[fixture: agentflow/lex-empty-call-in-flow-name]
[fixture: agentflow/lex-empty-markdown-in-flow-name]
[fixture: agentflow/lex-empty-string-in-connector-name]
[fixture: agentflow/lex-empty-call-in-connector-name]
これらを IgnoredText の part とし、周囲の通常のテキストは Label の part とする。
click の印は引き続きその文脈に入り、
click-id と click-comma の単位はここでは名前のテキストになる。
文脈を抜ける空白はその断片に含めない。
part が分かれたからといって、追加の先頭の文字列の選択肢を許さない。
[fixture: agentflow/gram-empty-form-does-not-restart-name-string]
消される click は、先頭の文字列や markdown の断片の前にも、
先頭の markdown の断片の後にも置け、文脈を抜けた後に繰り返すこともできる。
その出口の後の閉じた空の説明ブロックは、
後続の名前のテキストの前の IgnoredText の part に残る。
これが正規化した 1 つのラベルではなく AgentflowName を定義する。
[fixture: agentflow/lex-name-click-initial-string]
[fixture: agentflow/lex-name-click-initial-markdown]
[fixture: agentflow/lex-name-markdown-before-click]
[fixture: agentflow/lex-name-click-empty-block]
[fixture: agentflow/lex-name-repeated-click]
[fixture: agentflow/lex-flow-name-click-state]
[fixture: agentflow/lex-connector-name-click-state]
[fixture: agentflow/lex-flow-name-click-mixed]
[fixture: agentflow/lex-connector-name-click-mixed]
[fixture: agentflow/lex-flow-name-click-after-string]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/gram-flow-name-space-between-empty-blocks]
[fixture: agentflow/lex-empty-description-in-connector-name]
[fixture: agentflow/lex-flow-name-click-fragment-comma]

図のコメントは裸の名前の見出しを終え、追加の名前の断片にはならない。
文字列の名前では文字列の文脈が内容として読むため、
コメントのような行を含められる。
名前のテキスト内のディレクティブと選ばれた無視するセミコロンは、
共通の trivia として許す。 [fixture: agentflow/comment-ends-flow-heading]
[fixture: agentflow/lex-flow-name-string-comment-content]
[fixture: agentflow/comment-after-unicode-flow-name]
[fixture: agentflow/lex-directive-in-flow-name-text]
[fixture: agentflow/lex-ignored-semicolon-in-flow-name-text]

Name には、空白だけでも、Label の断片が少なくとも 1 つ必要である。
空のブロックは先頭の裸の断片や文字列の断片の前に置け、IgnoredText に保つ。
新しい先頭の文字列の選択肢は作らない。
必須の 1 つの space の後の空のブロックだけでは名前にならない。
[fixture: agentflow/gram-empty-description-before-flow-name]
[fixture: agentflow/gram-empty-description-before-connector-string]
[fixture: agentflow/gram-empty-description-no-flow-name]

名前の click の文脈は、Label の断片を寄与せず、
空の文字列や空の markdown 文字列を認識することもある。
click と空の形を、別々の AgentflowIgnoredText の part として保つ。
必要な Label は flow click "" A のように後から来てもよく、
connector F click "" のように click より前にあってもよい。
文脈を抜けた後、空の文字列と後続の名前のテキストの間に空の call も置ける。
[fixture: agentflow/lex-name-click-empty-string-before-text]
[fixture: agentflow/lex-name-click-empty-markdown-before-text]
[fixture: agentflow/lex-name-click-empty-string-then-call]
[fixture: agentflow/lex-connector-name-click-empty-string-tail]
[fixture: agentflow/lex-name-click-empty-string-before-string]

flow の名前では、flow click ""A と、
空の markdown 文字列に替えた同じ隣接形を拒否する。
[fixture: agentflow/gram-name-click-empty-string-adjacent-text]
[fixture: agentflow/gram-flow-name-click-empty-markdown-adjacent-rejected]

connector の名前では、click の後で認識した消される空の文字列や、
空の markdown 文字列に、名前のテキストを直接続けられる。
空の形はそれぞれ別々の AgentflowIgnoredText の part として保つ。
kind は、空の文字列なら empty-string、
空の markdown 文字列なら empty-markdown-string とする。
後続のテキストは kind が text の AgentflowLabel の part として保つ。
空の文字列に空の markdown 文字列を直接続けてから、名前のテキストを置いてもよい。
後続のテキストはセミコロンで始まってもよく、
前に Label がないときは必要な Label を供給し、
末尾のセミコロン 1 つだけでもよい。
[fixture: agentflow/lex-connector-name-click-empty-string-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-string-adjacent-semicolon]
[fixture:
agentflow/lex-connector-name-click-empty-string-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-trailing-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-trailing-semicolon]
[fixture:
agentflow/lex-connector-name-click-empty-markdown-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-then-markdown]

後で何も認識しない消される click は、既に名前の断片があっても、
EOF に末尾の印だけを残せない。
ソースが connector click で終わる形は、末尾に LF があってもなくても拒否する。
connector F click で終わる形も mermaid.js が拒否し、差異の印は付けない。
[fixture: agentflow/gram-connector-name-click-only-eof]
[fixture: agentflow/gram-connector-name-click-only-newline]
[fixture: agentflow/gram-connector-name-terminal-click-eof]

### 頂点、形、ラベル

上の字句の置換と Agentflow のノードを使い、
[頂点の文](./flowchart.ja.md#頂点の文)、[形](./flowchart.ja.md#形)、
[ラベル](./flowchart.ja.md#ラベル)の生成規則と文を参照する。
頂点の群では & の両側に空白を要求する。
id、形、::: のクラス、データの接尾部を空白で離せない。
裸の id、形付きの id、クラスの接尾部、反復した出現は、
いずれも書かれた構造を保つ。 [fixture: agentflow/gram-bare-node]
[fixture: agentflow/gram-group-spaces] [fixture: agentflow/gram-group-unspaced]
[fixture: agentflow/gram-group-data] [fixture: agentflow/gram-style-suffix]
[fixture: agentflow/gram-style-suffix-twice]
[fixture: agentflow/gram-node-three-definitions]
[fixture: agentflow/gram-bracket-shapes] [fixture: agentflow/gram-props]

flowchart の表の完全な形の名前を、ここでも構文の名前として使う。
Agentflow のドメインの metadata の alias にはしない。
プロパティの長方形には Identifier の項を 2 つ持たせる。
ラベルの kind は先頭の text、string、markdown の形を記録し、
その後は裸の続きを許す。
ラベルには空でない字句の内容が必要であり、全体が空の文字列では満たさないが、
空白の内容は満たす。 [fixture: agentflow/gram-bracket-shapes]
[fixture: agentflow/gram-props] [fixture: agentflow/gram-node-empty-label]
[fixture: agentflow/gram-node-empty-string]
[fixture: agentflow/gram-node-empty-markdown]
[fixture: agentflow/lex-edge-empty-string-label]
[fixture: agentflow/lex-edge-empty-markdown-label]
[fixture: agentflow/gram-url-tooltip-whitespace-only]
[fixture: agentflow/gram-label-whitespace-only]
[fixture: agentflow/gram-split-edge-string-bare-tail]

### 3 種のリンク

上で定めた演算子の語彙だけを使い、
[リンク](./flowchart.ja.md#リンク)の縦棒と分割形のラベルの生成規則、
辺の id の位置、Label の構成を参照する。
sequence と failure は -- とテキストに続けて --> または --x を使える。
reference は分割テキストを使えないが、縦棒のラベルは書ける。
書かれたダッシュと点の数、id、ラベルを、意味や配置の欄なしに保つ。
[fixture: agentflow/gram-three-edge-kinds]
[fixture: agentflow/gram-split-sequence-label]
[fixture: agentflow/gram-split-failure-label]
[fixture: agentflow/gram-split-reference-label]
[fixture: agentflow/gram-edge-id] [fixture: agentflow/gram-split-edge-id]
[fixture: agentflow/gram-reference-edge-id]
[fixture: agentflow/gram-edge-extended-length]
[fixture: agentflow/db-edge-length-cap]
[fixture: agentflow/gram-reference-quoted-pipe-label]
[fixture: agentflow/gram-reference-newlines-around-arrow]

縦棒のラベルの後には space の単位を 1 つ続けられるが、2 つは続けられない。
分割テキストで文字列の選択肢を許すのは先頭だけであり、その後の裸の続きは許すが、
別の文字列は許さない。
完全な矢印の後の印のような x は、次の矢印の始点の印ではなく id の文字とする。
[fixture: agentflow/gram-pipe-labels]
[fixture: agentflow/gram-pipe-label-two-spaces-after]
[fixture: agentflow/gram-split-edge-second-string-rejected]
[fixture: agentflow/gram-split-edge-string-bare-tail]
[fixture: agentflow/lex-arrow-marker-letter-is-vertex]
[fixture: agentflow/lex-split-edge-cross-letter-in-text]

### metadata のブロック

[データブロック](./flowchart.ja.md#データブロック)と頂点の data
の生成規則を参照する。
1 個以上の完全な @{ ... } のブロックを隣接して書く。
付加は書かれた頂点の出現か明示の flow と connector の見出しに属する。
mermaid.js が隣接する内容を結合する場合も、
各ブロックを 1 つの AgentflowDataBlock とする。
空、複数行、scalar、mapping、prototype のキー、alias の内容を不透明に保ち、
AST のプロパティの列にはしない。 [fixture: agentflow/db-data-block-routing]
[fixture: agentflow/db-data-block-adjacent]
[fixture: agentflow/db-data-block-empty-multiline]
[fixture: agentflow/db-data-block-recursive-prototype-keys]
[fixture: agentflow/gram-flow-inline-data]
[fixture: agentflow/gram-connector-all-forms]
[fixture: agentflow/gram-data-null-document]
[fixture: agentflow/gram-data-adjacent-multiline-blocks]

YAML、形、型の内容だけによる拒否は、embedded-data-opaque により受理する。
結合した不正な内容と再帰する alias も含む。
構文の木に YAML の alias の解決器は置かない。
閉じないブロック、保護されない波括弧、データの二重引用の文脈の外のキャレットは、
引き続き構文として拒否する。 [fixture: agentflow/db-data-block-invalid-yaml]
[fixture: agentflow/db-data-block-unknown-shape]
[fixture: agentflow/db-metadata-yaml-shared-alias]
[fixture: agentflow/div-metadata-yaml-self-alias]
[fixture: agentflow/db-metadata-adjacent-no-comma]
[fixture: agentflow/lex-data-block-unclosed]
[fixture: agentflow/lex-data-block-caret]
[fixture: agentflow/div-data-percent-line-is-content]
[fixture: agentflow/lex-data-block-single-quoted-brace]
[fixture: agentflow/lex-data-block-quoted-caret]
[fixture: agentflow/lex-data-backslash-quote-is-not-escape]

### style、classDef、class、linkStyle

[style、class、linkStyle の文](./flowchart.ja.md#styleclasslinkstyle-の文)
を参照し、 id-list、styles、style、name、番号付きと default の選択肢を含める。
必須の space はそれぞれ Agentflow の space の単位 1 つとする。
id-list の空の要素は末尾も含め null とする。
style の対象 id、クラスの接尾部、class の文の 2 番目の id は、
コンマを含んでも 1 つの Identifier とする。
[fixture: agentflow/gram-classdef-multi]
[fixture: agentflow/gram-class-semicolon] [fixture: agentflow/gram-style-suffix]
[fixture: agentflow/gram-linkstyle-default]
[fixture: agentflow/gram-linkstyle-interpolate-index]
[fixture: agentflow/gram-linkstyle-interpolate-default]
[fixture: agentflow/lex-style-double-space-keyword]
[fixture: agentflow/lex-class-double-space-value]
[fixture: agentflow/gram-classdef-trailing-empty-name]
[fixture: agentflow/gram-class-target-empty-ends]
[fixture: agentflow/lex-default-is-valid-id]
[fixture: agentflow/lex-interpolate-is-reserved-at-unit-start]

style には許された単位が少なくとも 1 つ必要である。
最後のコンマの後も含め、空白だけの style は null とする。
バックスラッシュ直後のコンマは classDef の style の値だけに残すが、
文法は引き続き後続の style の単位を要求する。
通常の style と linkStyle のコンマは要素を分ける。
コンマ直後の空白は後続の書かれた literal に属し、末尾の余白は属さない。
style、classDef、linkStyle では、
必須の 1 つの space の間隔を超えた最初の style の先頭の空白も、
style の内容にする。 [fixture: agentflow/db-node-style-first-leading-spaces]
[fixture: agentflow/db-classdef-first-leading-spaces]
[fixture: agentflow/db-node-style-first-leading-tab]
[fixture: agentflow/db-classdef-first-leading-tab]
[fixture: agentflow/db-node-style-tab-gaps-leading-tab]
[fixture: agentflow/db-classdef-tab-gaps-leading-tab]
[fixture: agentflow/db-style-leading-whitespace]
class の値や補間名の前の間隔は、引き続きちょうど 1 つの space の単位とする。
[fixture: agentflow/lex-class-double-space-value]
[fixture: agentflow/gram-class-semicolon]
[fixture: agentflow/lex-linkstyle-interpolate-double-space]
[fixture: agentflow/gram-linkstyle-interpolate-index]
[fixture: agentflow/gram-style-whitespace-only]
[fixture: agentflow/gram-classdef-escaped-comma]
[fixture: agentflow/gram-style-whitespace-after-comma]
[fixture: agentflow/gram-classdef-escaped-comma-whitespace-tail]
[fixture: agentflow/gram-style-backslash-before-comma]

補間名の後の任意の space には style が続かなければならず、
任意の末尾の余白ではない。
空の説明ブロックの前後の space の単位は別々に保つため、それらを結合せずに、
そのブロックの後に空白だけの style を続けられる。
[fixture: agentflow/lex-linkstyle-interpolate-double-space]
[fixture: agentflow/lex-linkstyle-three-semis]
[fixture: agentflow/gram-empty-description-splits-interpolate-spaces]

### click、call、href

flowchart の click の予約語による拒否と以下の前置欄を除き、
click とコールバックの字句規則および
[クリックの文](./flowchart.ja.md#クリックの文)を参照する。
click の id は click-comma で分け、空の端を null にできる。
その文脈では矢印、キーワード、括弧の表記のような id も click の id であり、
頂点の文にはしない。
後続の空白がなければ call と href は通常の id のテキストである。
[fixture: agentflow/gram-click-callback-forms]
[fixture: agentflow/gram-click-link-forms]
[fixture: agentflow/gram-click-punctuation-id]
[fixture: agentflow/gram-click-id-empty-ends]
[fixture: agentflow/lex-click-before-semicolon-is-id]
[fixture: agentflow/db-callback-token-punctuation]
[fixture: agentflow/lex-call-hyphen-without-whitespace]
[fixture: agentflow/lex-href-hyphen-without-whitespace]

call の後のコールバックは開き括弧までの不透明な名前と、
任意の不透明な引数を持つ。
名前と引数の余白を保つ。
名前の LF、CRLF、U+2028、 U+2029 は書かれたまま保つ。
[fixture: agentflow/lex-callback-name-lf]
[fixture: agentflow/lex-callback-name-crlf]
[fixture: agentflow/lex-callback-name-u2028]
[fixture: agentflow/lex-callback-name-u2029]
最初の括弧が空なら、空でない引数を持つ 2 度目の call で引数を与えられる。
裸のコールバックには共通の name の生成規則を使う。
URL には href、次に tooltip と _self、_blank、_parent、
_top のいずれかを付けられる。
URL と tooltip は空でない文字列の構文とし、空白だけの文字列も含める。
[fixture: agentflow/gram-click-callback-space-args]
[fixture: agentflow/db-call-name-space-before-parentheses]
[fixture: agentflow/gram-click-callback-blank-args]
[fixture: agentflow/gram-click-bare-link-target]
[fixture: agentflow/gram-click-bare-link-tip-target]
[fixture: agentflow/gram-callback-arguments-after-second-call]
[fixture: agentflow/gram-url-tooltip-whitespace-only]

URL の前、href の両側も含む位置、または tooltip の前では、
既存の字句の文脈は click-id の群を加えずに click を消し得る。
通常の click の生成規則でそのキーワードを読み通し、
textBeforeUrl または textBeforeTooltip に保つ。
その位置の閉じた空の説明ブロックや、認識した消される空の文字列、
空の markdown 文字列、空の call も同じように保つ。
[fixture: agentflow/lex-empty-call-before-href]
[fixture: agentflow/lex-empty-string-before-url]
[fixture: agentflow/lex-empty-markdown-before-href]
[fixture: agentflow/lex-empty-string-before-url-tooltip]
[fixture: agentflow/lex-empty-call-before-url-tooltip]
[fixture: agentflow/lex-empty-markdown-before-callback-tooltip]
[fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]
これらの列は任意の語を飛ばしたり、
2 つの click-id の群を結合したりする規則ではない。
コールバック名に textBeforeCallback の欄はない。
[fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/gram-click-erased-before-url-tooltip]
[fixture: agentflow/gram-click-erased-before-callback-tooltip]
[fixture: agentflow/gram-click-erased-after-href]
[fixture: agentflow/gram-empty-description-before-href]
[fixture: agentflow/gram-click-id-groups-not-merged]
[fixture: agentflow/div-empty-string-before-callback]

tooltip と target の必須の間隔も space の単位 1 つとする。
2 つ目の通常の space はその間隔で吸収しない。
末尾の空の説明ブロックは、その文自身の末尾の空白の制限に従う後続の文とする。
[fixture: agentflow/lex-click-double-space-before-tooltip]
[fixture: agentflow/gram-callback-tooltip-double-space]
[fixture: agentflow/gram-empty-description-after-url-glued]
[fixture: agentflow/gram-empty-description-after-url-space]

URL とコールバックの tooltip の前の、閉じた空のブロックは、
textBeforeTooltip に置く。
裸のコールバック名と固定のリンクの target の前には対応する前置の欄がない。
これらの内部のブロックは、任意に tooltip の欄へ割り当てず、
tokenless-empty-forms とする。
[fixture: agentflow/gram-empty-description-before-url-tooltip]
[fixture: agentflow/gram-empty-description-before-callback-tooltip]
[fixture: agentflow/div-empty-description-before-callback-name]
[fixture: agentflow/div-empty-description-before-link-target]

### 方向とアクセシビリティの文

方向の行の規則と
[方向とアクセシビリティの文](./flowchart.ja.md#方向とアクセシビリティの文)
を参照する。
方向は TB、BT、RL、LR、TD の順に試し、
選んだ方向の中で最後に一致する direction のキーワードを使う。
未完成の形やリンクに見える場合も、前後のテキストは IgnoredText とする。
direction と値の間の空白には LF も含められる。
[fixture: agentflow/lex-direction-line-greedy]
[fixture: agentflow/lex-direction-after-ls]
[fixture: agentflow/lex-direction-after-ps]
[fixture: agentflow/lex-direction-value-priority]
[fixture: agentflow/lex-direction-last-selected-occurrence]
[fixture: agentflow/lex-direction-swallows-shape-and-edge]
[fixture: agentflow/gram-direction-value-next-line]
[fixture: agentflow/lex-direction-unclosed-bracket-prefix]

先の字句規則の優先順位を保つ。
行頭の accTitle と accDescr は行をアクセシビリティのテキストとして取るが、
字下げがあると先に貪欲な方向の規則に到達し得る。
これらの文は区切りを必要としない。
題と行の説明は、セミコロンと percent の対も含め、値の行の残りを読む。
値の前の空白は次の物理行も取り得る。
EOF の欠けた値は null とする。
[fixture: agentflow/lex-direction-title-column-zero]
[fixture: agentflow/lex-direction-title-indented]
[fixture: agentflow/lex-direction-description-column-zero]
[fixture: agentflow/lex-direction-description-indented]
[fixture: agentflow/lex-accessibility-semicolon-value]
[fixture: agentflow/db-acctitle-next-line]
[fixture: agentflow/db-accdescr-next-line]
[fixture: agentflow/lex-title-inline-percent-content]
[fixture: agentflow/db-acctitle-comment-next-line]
[fixture: agentflow/db-acctitle-eof]

説明ブロックは閉じる波括弧以外の全ての文字を読む。
LF、U+2028、U+2029、保持するコメントのようなテキストも含む。
開く区切りは後続の空白を取る。
EOF で閉じなくてもよく、そのテキストと closed の false を保つ。
[fixture: agentflow/gram-accdescr-open-trailing-spaces-eof]
[fixture: agentflow/gram-accdescr-open-crlf-eof]
[fixture: agentflow/gram-accdescr-open-directive-eof]
[fixture: agentflow/gram-accdescr-open-text-directive-eof]
[fixture: agentflow/gram-accdescr-open-text-spaces-eof]
[fixture: agentflow/frontmatter-accdescr-open-trailing-spaces-eof]
内容のない閉じたブロックは value を null、 closed を true とする。
[fixture: agentflow/lex-accdescr-block-u2028]
[fixture: agentflow/lex-accdescr-block-u2029]
[fixture: agentflow/lex-accessibility-block-comment]
[fixture: agentflow/db-accessibility-unclosed-block]
[fixture: agentflow/db-accessibility-empty-unclosed]
[fixture: agentflow/db-accessibility-empty-block]

### 空の説明ブロックと消される形

区切られる文には、ブロックの周囲の別々の space の単位も含め、
flowchart の
[末尾の空の説明ブロックの規則](./flowchart.ja.md#区切りの前の空の説明ブロック)
を参照する。
文の始まりでは、同じ行の次の文の前も含め、閉じた空のブロック自身を文とする。
完成した文とその区切りの間では、その文の値の一部ではなく後続の文とする。
[fixture: agentflow/lex-empty-description-before-node]
[fixture: agentflow/gram-empty-description-after-vertex]
[fixture: agentflow/gram-empty-description-after-data]
[fixture: agentflow/gram-empty-description-after-data-space-semicolon]
[fixture: agentflow/gram-empty-description-after-class-space]
[fixture: agentflow/gram-empty-description-after-url-glued]
[fixture: agentflow/gram-empty-description-after-url-space]
[fixture: agentflow/gram-empty-description-splits-interpolate-spaces]
[fixture: agentflow/gram-empty-description-after-class-glued]

ヘッダーの方向の後では図の先頭の文、
明示の flow の題や global の見出しの後では body の先頭の文、
connector の題の後では後続の文とする。
flow と connector の名前の中では Name の part とする。
既存の click の前置欄では IgnoredText とする。
ヘッダーの方向の前や、保持する欄のない他の構造の間では受理しない。
[fixture: agentflow/gram-empty-description-after-header-direction]
[fixture: agentflow/gram-empty-description-header-no-direction]
[fixture: agentflow/gram-empty-description-after-flow-name]
[fixture: agentflow/gram-empty-description-before-flow-title]
[fixture: agentflow/gram-empty-description-after-connector-name]
[fixture: agentflow/gram-empty-description-after-global]
[fixture: agentflow/gram-empty-description-after-flow-title]
[fixture: agentflow/gram-empty-description-after-connector-title]
[fixture: agentflow/gram-empty-description-before-href]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/gram-empty-description-symbol-header-semicolon]
[fixture: agentflow/gram-empty-description-global-semicolon]
[fixture: agentflow/gram-flow-name-space-between-empty-blocks]
[fixture: agentflow/lex-empty-description-in-connector-name]

頂点の Identifier を分ける空のブロック、必須のクラス名の前、最初の style の前、
style のコンマの前の空のブロックには、そのような置き場がない。
葉を分けるか任意の間の欄を加える必要があるため、
mermaid.js が受理する場合は tokenless-empty-forms として拒否する。
完成したクラスの値の後の末尾のブロックは保つ。
通常の space があると、両方の文法が拒否する場合もある。
[fixture: agentflow/div-empty-description-in-classdef]
[fixture: agentflow/div-empty-description-in-style]
[fixture: agentflow/div-empty-description-before-arrow]
[fixture: agentflow/div-empty-description-before-style-comma]
[fixture: agentflow/div-empty-description-inside-vertex-id]
[fixture: agentflow/div-empty-description-before-class-name]
[fixture: agentflow/gram-empty-description-after-class-glued]
[fixture: agentflow/gram-empty-description-after-class-space]

文の始まりの、全体が消される空の文字列、空の markdown 文字列、空の call は、
tokenless-empty-forms の agentflow の明示の例外により拒否する。
これらのための IgnoredStatement は作らない。
[fixture: agentflow/div-empty-string-statement]
[fixture: agentflow/div-empty-markdown-statement]
[fixture: agentflow/div-empty-call-statement]
[fixture: agentflow/div-empty-string-before-vertex]
[fixture: agentflow/div-empty-call-before-vertex]

それ以外の位置では、認識した消される空の形を、既存の欄が保てる場合に受理する。
flow と connector の名前では AgentflowName.parts、
後続の click の URL の前では textBeforeUrl、
URL とコールバックの後続の tooltip の前では textBeforeTooltip に置く。
その位置の消される click や閉じた空の説明ブロックと同じく、
全体の表記を別々の AgentflowIgnoredText として保つ。
前置欄には引き続き後続の URL または tooltip が必要である。
[fixture: agentflow/lex-empty-string-in-flow-name]
[fixture: agentflow/lex-empty-call-in-flow-name]
[fixture: agentflow/lex-empty-markdown-in-flow-name]
[fixture: agentflow/lex-empty-string-in-connector-name]
[fixture: agentflow/lex-empty-call-in-connector-name]
[fixture: agentflow/lex-empty-call-before-href]
[fixture: agentflow/lex-empty-string-before-url]
[fixture: agentflow/lex-empty-markdown-before-href]
[fixture: agentflow/lex-empty-string-before-url-tooltip]
[fixture: agentflow/lex-empty-call-before-url-tooltip]
[fixture: agentflow/lex-empty-markdown-before-callback-tooltip]
[fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]

単位の位置で認識した形だけに、この規則を使う。
既に始まった通常の名前の単位の中の引用符は、名前のテキストに残す。
[fixture: agentflow/lex-empty-quote-spelling-inside-name-unit]

保持する欄がない他の位置では、認識した消される空の形を、
tokenless-empty-forms の理由 1 で拒否する。
矢印やコールバック名の前、ヘッダーとその方向の間の空の形も含む。
URL の前の欄があっても、コールバック名の前に欄は作らない。
[fixture: agentflow/div-empty-string-before-arrow]
[fixture: agentflow/div-empty-call-before-arrow]
[fixture: agentflow/div-empty-string-before-callback]
[fixture: agentflow/div-empty-string-after-click]
[fixture: agentflow/div-empty-string-between-header-and-direction]

空のデータブロックはこれらの形ではなく、空白だけの文字列の構文も空ではない。
[fixture: agentflow/gram-data-null-document]
[fixture: agentflow/gram-url-tooltip-whitespace-only]

### 文法の外での拒否

flowchart の正規の linkStyle の番号の条件を参照する。
各番号は先頭のゼロのない非負整数の表記で、
その文までに作られた辺を指さなければならない。
連鎖、群、flow の中の辺をソース順に数える。
設定された maxEdges の上限も受理を決め、辺の数が上限を超えれば拒否する。
[fixture: agentflow/gram-linkstyle-style-out-of-bounds]
[fixture: agentflow/gram-linkstyle-interpolate-out-of-bounds]
[fixture: agentflow/lex-linkstyle-leading-zero]
[fixture: agentflow/lex-linkstyle-over-safe-integer]
[fixture: agentflow/config-max-edges-equal]
[fixture: agentflow/config-max-edges-exceeded]
[fixture: agentflow/config-max-edges-group]
[fixture: agentflow/lex-directive-joins-invalid-linkstyle-index]
[fixture: agentflow/gram-linkstyle-interpolate-index]

所属を絞る前の各 flow に、flowchart の hasOwnProperty の要素の条件を適用する。
頂点の連鎖は群を後ろから前へ渡し、各群は id を書かれた順で渡す。
名前のある入れ子の flow と connector は、文法が読む名前の端の空白を除いて渡す。
名前のない入れ子の flow は hasOwnProperty 以外の空でない値を渡す。
生成された表記はこの拒否には関係せず、AST の欄に持たない。
空でないアクセシビリティの値は端の空白を除いたテキスト、
追加のセミコロンはそのテキストを渡す。
[fixture: agentflow/gram-nested-unnamed-flow]
[fixture: agentflow/gram-flow-named-member-hasownproperty]
[fixture: agentflow/gram-connector-member-hasownproperty]
[fixture: agentflow/gram-flow-hasownproperty-before-empty-statement]
方向、global、style と class と linkStyle、click、コメントは要素を渡さない。
hasOwnProperty の後に他の空でない候補があれば拒否する。
[fixture: agentflow/lex-flow-prototype-members]
[fixture: agentflow/lex-flow-hasownproperty-member]
[fixture: agentflow/lex-accessibility-scope]
[fixture: agentflow/gram-accessibility-hasownproperty-member]
[fixture: agentflow/gram-hasownproperty-last-member]

この拒否を prototype に関係する id 全般の予約にはしない。
id の重複、未解決の connectorRef、入力の欠落、reference のラベル、包含の循環、
既知だが除かれた括弧や描画の形は拒否しない。
埋め込まれた内容の検証は不透明なデータの差異だけで扱い、
これらの文法の外の条件にはしない。 [fixture: agentflow/gram-prototype-ids]
[fixture: agentflow/db-flow-three-definitions]
[fixture: agentflow/db-diagnostics-no-semantic-checks]
[fixture: agentflow/db-diagnostics-containment-cycle]
[fixture: agentflow/db-data-block-removed-shape]
[fixture: agentflow/db-data-block-unsupported-shape]
[fixture: agentflow/gram-reference-quoted-pipe-label]

## 既知の差異

適用する 6 個の識別子は [known-divergences.md](../known-divergences.ja.md)
に定義する。
まず木に置き場のある書かれたテキストを保ち、その後で列挙した拒否を適用する。
以下の範囲は flowchart の差異の全一覧を移すものではない。
[fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/div-directive-in-id]

[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.ja.md):
不可分のキーワード、 Identifier、数値、矢印、複合区切りには、
全体の単位の定義を変えずに内部のディレクティブを保てない。
結合して受理される形を理由 2 で拒否する。
名前のテキスト、文字列、データの位置は受理し、
結合後も拒否される形には印を付けない。
[fixture: agentflow/div-directive-in-header]
[fixture: agentflow/div-directive-in-beta-header]
[fixture: agentflow/div-directive-in-id]
[fixture: agentflow/div-directive-in-circle-opening]
[fixture: agentflow/lex-directive-in-flow-name-text]
[fixture: agentflow/lex-directive-joins-invalid-linkstyle-index]

[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.ja.md):
不可分の単位の内部の選ばれた無視するセミコロンにも、
同じ置き場の問題により理由 2 を適用する。
EmptyStatement ではその単位の内部の文字を保てない。
テキストと不透明な metadata のキーは受理する。
[fixture: agentflow/div-ignored-semicolon-in-id]
[fixture: agentflow/div-ignored-semicolon-in-arrow]
[fixture: agentflow/lex-ignored-semicolon-in-metadata-key]
[fixture: agentflow/lex-ignored-semicolon-in-flow-name-text]

[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md):
木は埋め込まれた表記全体を保ち、内容を検証しない。
木を作るために不要な検証であるという逆方向の条件により、
mermaid.js の内容だけの拒否を受理する。
構文の区切りは引き続き要求する。 [fixture: agentflow/db-data-block-invalid-yaml]
[fixture: agentflow/db-data-block-unknown-shape]
[fixture: agentflow/db-metadata-yaml-shared-alias]
[fixture: agentflow/div-metadata-yaml-self-alias]
[fixture: agentflow/div-data-percent-line-is-content]
[fixture: agentflow/lex-data-block-unclosed]

[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.ja.md):
共通の本文だけの HTML の範囲を使う。
ノードはテキストを保てるが、
その範囲ではフロントマターをまたいで本文の引用符の役割を変えるタグを表せない。
既存の理由 2 の直接の規則を両方向に適用し、
pipeline の順序による mermaid.js の拒否の受理も含める。
[fixture: agentflow/div-frontmatter-tag-enables-label]
[fixture: agentflow/html-label-without-frontmatter-tag]
[fixture: agentflow/div-frontmatter-tag-changes-title]
[fixture: agentflow/div-frontmatter-attribute-blocks-body-tag]
[fixture: agentflow/html-body-tag-reference]

[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.ja.md):
Comment の記録はヘッダー前のディレクティブでない percent と波括弧の行を保てる。
検出は飛ばすが保持する lexer は拒否するため、
既存の逆方向の pipeline の順序の条件で受理する。
裸の %% 行は既に受理されるので印を付けない。
[fixture: agentflow/comment-bare-before-spaces]
[fixture: agentflow/div-percent-braces-before-header]
[fixture: agentflow/div-percent-braces-after-directive-before-header]
[fixture: agentflow/div-comment-header-percent-brace]

[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md):
文の始まりでは、明示の例外により、消される空の文字列、markdown、
call を拒否する。
保持する欄のない内部の消される形や空の説明ブロックは理由 1 で拒否する。
Name.parts や click の textBeforeUrl、textBeforeTooltip にある、
認識した消される空の形は IgnoredText として受理する。
[fixture: agentflow/lex-empty-string-in-flow-name]
[fixture: agentflow/lex-empty-call-in-flow-name]
[fixture: agentflow/lex-empty-markdown-in-flow-name]
[fixture: agentflow/lex-empty-string-in-connector-name]
[fixture: agentflow/lex-empty-call-in-connector-name]
[fixture: agentflow/lex-empty-call-before-href]
[fixture: agentflow/lex-empty-string-before-url]
[fixture: agentflow/lex-empty-markdown-before-href]
[fixture: agentflow/lex-empty-string-before-url-tooltip]
[fixture: agentflow/lex-empty-call-before-url-tooltip]
[fixture: agentflow/lex-empty-markdown-before-callback-tooltip]
[fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]

独立と末尾の説明ブロック、Name の part、既存の click の前置の位置は、
ノードが保てるため受理する。 [fixture: agentflow/div-empty-string-statement]
[fixture: agentflow/div-empty-call-statement]
[fixture: agentflow/div-empty-description-before-style-comma]
[fixture: agentflow/div-empty-description-inside-vertex-id]
[fixture: agentflow/gram-empty-description-after-vertex]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/gram-empty-description-before-href]

click-reserved-word は適用しない。
Name の part と click の前置欄が計測した無視されたテキストを保つ。
comment-takes-line-break と comment-takes-character も適用しない。
コメントは LF の前で止まり、前の文字を取らない。
c4-keyword-anywhere と blank-line-after-header-or-comments も適用しない。
検出は C4 より先であり、通常の空行は有効である。
[fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/lex-flow-name-click-mixed]
[fixture: agentflow/comment-before-class-keeps-newline]
[fixture: agentflow/comment-double-percent-inside-id]
[fixture: agentflow/lex-detect-c4-component-id]
[fixture: agentflow/comment-keeps-following-empty-line]
