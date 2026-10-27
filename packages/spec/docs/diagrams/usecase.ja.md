# Usecase

英語版: [usecase.md](./usecase.md)

mermaid.js の正しさの根拠:

- [`usecase.tokens.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.tokens.ts#L1-L410)
- [`usecase.parser.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.parser.ts#L1-L705)
- [`usecase.visitor.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.visitor.ts#L1-L976)
- [`usecaseModelBuilder.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L1-L1050)
- [`usecaseJson.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseJson.ts#L1-L378)
- [`usecaseDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/usecaseDb.ts#L1-L574)

`usecase` を定義します。
ソースの木は [ast/usecase.md](../ast/usecase.ja.md)、
値の変換と Db は [tests の要約](../../../tests/docs/db-summaries.ja.md#usecase)
に定義します。

## 検出

[detection.md](../detection.ja.md) の項目 39 に従い、到達位置で、
小文字の `usecase-beta` に共通の空白かテキストの終わりが続く場合に選びます。
後続文字がその空白集合に属さなければ、検出しません。
ヘッダー単位自体は長い綴りの先頭にもなれますが、検出にはこの境界が必要です。
Unicode 空白は検出を通っても usecase の文法に通らない場合があります。
ヘッダーと本体の文は別々の物理行です。
[fixture: usecase/header-without-beta] [fixture: usecase/header-uppercase]
[fixture: usecase/header-letter-suffix]
[fixture: usecase/header-unicode-suffix] [fixture: usecase/header-semicolon]
[fixture: usecase/header-spaced-semicolon] [fixture: usecase/header-same-line]
[fixture: usecase/header-u2028-eof] [fixture: usecase/lex-header-emspace-eof]

共通の frontmatter、directive、コメント領域、先頭 trivia、属性引用符、
実体参照、無視するセミコロン、CR/CRLF 変換、末尾 LF の規則を適用します。
C4 より後の登録なので C4 検出の差異も適用します。
ヘッダー前の裸のパーセント行は
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.ja.md)
の共通の先頭コメント規則に従います。
[fixture: usecase/frontmatter-crlf] [fixture: usecase/directive-before-header]
[fixture: usecase/lex-whitespace-leading] [fixture: usecase/entity-all-texts]
[fixture: usecase/div-detect-c4-label]
[fixture: usecase/div-comment-preheader-bare]
[fixture: usecase/div-comment-preheader-braces]

## 字句構造

### 既定文脈の規則の順序

現在の文脈で規則を順に試し、明示した `longer_alt` を除き、
最初の一致を取り、次の位置で再び試します。
一般的な最長一致ではありません。
LabelText と Word はカテゴリ名で、一致する規則ではありません。
[fixture: usecase/lex-keyword-longer-ids]
[fixture: usecase/lex-number-decimal-id-unit]

1. **horizontal-whitespace**: ASCII 空白とタブの最長列は trivia です。
   [fixture: usecase/lex-tab-blank-line]

2. **markdown-string**: 二重引用符と backtick から、
   最初の backtick と二重引用符までです。
   物理改行と Unicode 区切りを含め、間の文字は任意です。
   [fixture: usecase/lex-markdown-cr]

3. **unclosed-markdown**: 同じ開きから、閉じがなければソース末尾までです。
   文法は拒否します。
   [fixture: usecase/lex-markdown-unclosed]

4. **diagram-comment**: 物理行の前方が ASCII 空白とタブだけなら %%
   から行末までです。
   [fixture: usecase/comment-bare-pair]

5. **newline**: 1 つの物理行終端です。
   [fixture: usecase/lex-statements-crlf]

6. **acc-descr-block**: 同じ行頭条件で accDescr、空白とタブ 0 個以上、
   { から最初の } までです。
   [fixture: usecase/db-accdescr-block-comment]

7. **acc-title-line**: 同じ行頭条件で accTitle、空白とタブ 0 個以上、
   コロン、行の残りです。
   [fixture: usecase/lex-accessibility-line-separators]

8. **acc-descr-line**: accDescr に同じ行値の規則を適用します。
   [fixture: usecase/db-accdescr-directive-gap]

9. **json-prefix**: json、空でない空白かタブ、裸の語 id、空白とタブ、@、
   空白とタブを読みます。次が { なら JSON 文脈に入ります。
   [fixture: usecase/gram-json-spaced-at]

10. **keywords**: 下記の順です。それぞれに identifier の長い代替があります。
    [fixture: usecase/lex-keyword-longer-ids]

11. **generalization**: `--|>` です。
    [fixture: usecase/db-semantic-case]

12. **dependency-arrow**: `..>` です。
    [fixture: usecase/db-semantic-case]

13. **stereotype-open**: `<<` を読み、stereotype 文脈に入ります。
    [fixture: usecase/gram-stereotype-u2028]

14. **class-separator**: `:::` です。
    [fixture: usecase/gram-class-suffix-missing]

15. **forward-solid**: 2 個以上のダッシュに > が続きます。
    [fixture: usecase/db-labeled-arrows]

16. **backward-solid**: < に 2 個以上のダッシュが続きます。
    [fixture: usecase/gram-backward-long-labeled-left]

17. **forward-circle**: `--o` です。
    [fixture: usecase/lex-forward-circle-id-prefix]

18. **backward-circle**: `o--` です。
    [fixture: usecase/db-arrows]

19. **forward-cross**: `--x` です。
    [fixture: usecase/lex-forward-cross-id-prefix]

20. **backward-cross**: `x--` です。
    [fixture: usecase/db-labeled-arrows]

21. **markerless-solid**: 2 個以上のダッシュです。
    [fixture: usecase/gram-style-custom-markerless]

22. **metadata-open**: 連続する `@{` です。
    [fixture: usecase/gram-metadata-empty]

23. **at**: `@` です。
    [fixture: usecase/gram-json-spaced-at]

24. **braces**: `{`、次に `}` です。
    [fixture: usecase/gram-metadata-newline]

25. **brackets**: `[`、次に `]` です。
    [fixture: usecase/gram-empty-brackets]

26. **parentheses**: `(`、次に `)` です。
    [fixture: usecase/gram-empty-label]

27. **comma、colon**: 1 つのコンマ、次にコロンです。
    [fixture: usecase/gram-actor-list]

28. **hash-color**: # と空でない ASCII 十六進数字列です。
    [fixture: usecase/lex-style-hash-semicolon]

29. **plain-string**: 同じ一重か二重の引用符で閉じる文字列で、
    物理改行を含みません。
    [fixture: usecase/lex-native-single-quoted-keys]

30. **css-identifier**: 下記の CSS の語とハイフンの形です。
    [fixture: usecase/lex-style-css-token-contains-keyword]

31. **identifier**: 空でない ASCII 語文字の最長列です。
    number の長い代替があります。
    [fixture: usecase/lex-number-identifiers]

32. **number**: 下記の整数、小数、単位つきの形です。
    [fixture: usecase/lex-number-decimal-id-unit]

33. **escaped-comma**: backslash にコンマが続きます。
    [fixture: usecase/gram-styles-components]

34. **dash、dot、percent**: 1 つの -、次に .、次に % です。
    [fixture: usecase/gram-styles-components]

35. **css-punctuation**: `! # $ & * + / = ? ^ _ | ~` の 1 文字です。
    [fixture: usecase/lex-label-fallback-punctuation]

36. **label-punctuation**: `; < >`、backslash、backtick の 1 文字です。
    [fixture: usecase/lex-label-fallback-punctuation]

37. **label-symbol**: 印字可能 ASCII 外の残りの最長列で、TAB/LF/CR は除きます。
    [fixture: usecase/lex-label-fallback-symbols]

キーワードの順は `usecase-beta`、`actor`、`systemBoundary`、`end`、
`direction`、`TD`、`TB`、`BT`、`LR`、`RL`、`note`、`for`、`json`、
`classDef`、`class`、`style`、`include`、`extend`、`true`、`false` です。
include と extend だけが大文字小文字を区別しません。
より長い identifier がキーワードに勝ちます。
ハイフンと非 ASCII の接尾辞は ASCII 語を延ばしません。
`actorName` は id、`actor-name` は actor とダッシュで始まり、
`actor"A"` に空白は要りません。
長い代替は再帰的な最長一致探索ではありません。
[fixture: usecase/lex-keyword-longer-ids]
[fixture: usecase/lex-keywords-letter-suffix]
[fixture: usecase/lex-keywords-word-suffix]
[fixture: usecase/lex-actor-dash-suffix]
[fixture: usecase/lex-actor-unicode-suffix]
[fixture: usecase/db-semantic-case]
[fixture: usecase/gram-actor-keyword-adjacent-string]
[fixture: usecase/lex-keyword-longer-number]

number は数字列と任意の小数部、またはドットと数字列を読みます。
小数点の両側がある形では両側に数字が必要です。
その後に ASCII 英字を単位として取れます。符号と指数はありません。
identifier が先なので `1mg` は id、`1.5px` は number です。
native metadata は小数を拒否し、NumericLiteral の位置にはなりません。
[fixture: usecase/lex-number-identifiers] [fixture: usecase/lex-decimal-id]
[fixture: usecase/lex-number-decimal-id-unit]
[fixture: usecase/gram-metadata-number-icon]
[fixture: usecase/gram-metadata-decimal-icon]

css-identifier はダッシュ 2 つ、ASCII 英字か underscore、語文字とダッシュの列、
または ASCII 英字か underscore、語文字の列、
1 組以上のハイフンと空でない語文字の組です。
前のキーワードと markerless 規則が優先し、`--custom` は markerless と語です。
`actor-name` は actor から始まり、`my-actor` は 1 つの CSS 単位です。
[fixture: usecase/lex-css-hyphen-keyword-style]
[fixture: usecase/lex-css-keyword-prefix-label-control]
[fixture: usecase/gram-style-custom-markerless]
[fixture: usecase/lex-style-css-token-contains-keyword]
[fixture: usecase/lex-class-property-custom-gap]
[fixture: usecase/lex-class-property-long-custom]
[fixture: usecase/lex-css-name-custom-tab]
[fixture: usecase/lex-css-name-custom-nbsp]

markerless のダッシュ接頭部と後の CSS プロパティ名の語の間の空白は、
ASCII HWS です。
[fixture: usecase/lex-class-property-custom-gap]
[fixture: usecase/lex-css-name-custom-tab]
[fixture: usecase/lex-css-name-custom-nbsp]
その間の物理 LF や U+2028 の後に `%%` コメントがあっても、
名前は有効になりません。
[fixture: usecase/gram-css-name-comment-region-lf]
[fixture: usecase/gram-css-name-comment-region-ls]

共通の原子的な単位の境界規則は、CSS プロパティ名の語の内部に適用します。
`co%%{init: {}}%%lor` がその例です。
[fixture: usecase/div-directive-css-property]
`--` と後の語の間の HWS にある directive は trivia として受理します。
directive の有無にかかわらず別々の単位なので、語を結合しません。
[fixture: usecase/lex-directive-css-name-gap]
[fixture: usecase/lex-class-property-custom-gap]

CSS プロパティ名の語内にある、選ばれた無視するセミコロンは拒否します。
[fixture: usecase/div-semicolon-css-property-selected]
`style` と `classDef` のどちらでも、
`--` と後の語の間の HWS にある、選ばれた `;` は trivia として受理します。
[fixture: usecase/lex-semicolon-css-name-gap]
[fixture: usecase/lex-semicolon-classdef-css-name-gap]

plain 文字列は空でもよく、次の同じ引用符で終わります。
U+2028/U+2029 は許しますが、物理 CR/LF は拒否します。
backslash は次の引用符を保護せず、escape は復号しません。
markdown 文字列はすべての改行、両方の引用符、Unicode 区切りを含められます。
backslash の後でも最初の backtick と二重引用符で閉じます。
markdown の開きに閉じがない場合は plain 文字列として再試行しません。
[fixture: usecase/gram-empty-plain] [fixture: usecase/lex-plain-backslash]
[fixture: usecase/lex-plain-escaped-quote]
[fixture: usecase/lex-plain-single-apostrophe]
[fixture: usecase/lex-plain-crlf] [fixture: usecase/lex-plain-u2028]
[fixture: usecase/lex-markdown-crlf]
[fixture: usecase/lex-markdown-embedded-double]
[fixture: usecase/lex-markdown-earliest-close]
[fixture: usecase/lex-markdown-close-backslash]
[fixture: usecase/lex-markdown-unclosed]

共通 trivia 内の物理行終端は文字列の内容ではありません。
一重引用符の native metadata も同じです。
コメント領域の例では U+2028 を値に保ち、
文字列内に物理 LF が残る対照例は拒否します。
[fixture: usecase/lex-native-single-quote-comment-region-ls]
[fixture: usecase/lex-native-single-quote-comment-region-control]
[fixture: usecase/lex-native-single-quote-comment-region-lf]

### カテゴリと引用しないテキスト

Word は identifier と上記のキーワードです。
LabelText は Word、number、at、comma、colon、hash-color、css-identifier、
escaped-comma、dash、dot、percent、css-punctuation、label-punctuation、
label-symbol です。文字列は別の選択肢で、LabelText ではありません。
普通の id、class、metadata の語は Word ではなく正確な identifier を要求します。
ラベルや CSS で語として使えるキーワードも id にはなりません。
json-prefix 内の裸の id が明示した例外です。
[fixture: usecase/lex-keyword-labels] [fixture: usecase/lex-keyword-ids]
[fixture: usecase/gram-class-keyword-name]
[fixture: usecase/gram-classdef-keyword-id]
[fixture: usecase/lex-keyword-style-word-category]
[fixture: usecase/gram-json-keyword-id]
[fixture: usecase/gram-json-keyword-id-style]

LabelText に形状区切り、演算子、stereotype-open、metadata-open、
class-separator は含みません。
裸のラベルには 1 つ以上の単位が必要で、後に引用文字列を混ぜられません。
最初と最後の単位間の空白を保ちます。
セミコロン、単独の山括弧、backslash、backtick、NUL、他の制御文字、
Unicode 空白、補助平面の文字もラベル内容です。
引用符を単独の fallback テキストにはしません。
[fixture: usecase/lex-label-fallback-punctuation]
[fixture: usecase/lex-label-fallback-symbols] [fixture: usecase/lex-nul]
[fixture: usecase/lex-supplementary-label] [fixture: usecase/lex-label-u2028]
[fixture: usecase/lex-label-u2029] [fixture: usecase/gram-empty-label]
[fixture: usecase/gram-empty-brackets]
[fixture: usecase/gram-edge-label-operator]

### JSON 文脈

釣り合うオブジェクトと閉じないオブジェクトの fallback だけを試します。
{ から始め、二重引用符の外では { が深さを増やし、} が減らします。
深さを最初に 0 に戻す } で単位を閉じ、既定文脈に戻ります。
二重引用符の内側では backslash が直後の 1 文字を保護し、
それ以外の次の二重引用符がその領域を閉じます。
その内側の波括弧は深さを変えません。
一重引用符、角括弧、コメント、
native キーワードは釣り合いに特別な意味がありません。
空白、LF、CR、U+2028、U+2029、句読点はすべて内容です。
共通の前処理は先に適用します。
[fixture: usecase/db-json-values]
[fixture: usecase/gram-json-double-backslash-before-quote]
[fixture: usecase/lex-json-mode-unclosed-string]
[fixture: usecase/gram-json-comment] [fixture: usecase/lex-json-ls-string]
[fixture: usecase/div-lex-json-ps-whitespace]
[fixture: usecase/gram-json-brace-in-single-quote]
[fixture: usecase/div-json-balanced-single-quote]
[fixture: usecase/div-json-whole-line-bare-percent]

単位の存在を決めるのは釣り合いだけです。
JSON 内容の検証は
[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md)
により構文の外で、閉じない括弧は拒否します。
[fixture: usecase/div-json-balanced-invalid-array]
[fixture: usecase/div-json-balanced-single-quote]
[fixture: usecase/gram-json-empty-delimiter-only]

### Stereotype 文脈

最初に `>>` を試し、既定文脈に戻ります。
それ以外は最初の `>>` の直前までを読みます。
物理改行がなく、共通の空白だけではないことが条件です。
次の位置で再び閉じ印を試します。
失敗時は閉じないテキストの fallback が LF 以外の最長列を読み、文脈を出ます。
文法はその fallback を拒否します。
空、空白だけ、複数行、閉じない stereotype は拒否します。
U+2028、U+2029 は内容で、入れ子の `<<`、引用符、波括弧、句読点、
backslash は普通の内容です。
[fixture: usecase/gram-stereotype-empty]
[fixture: usecase/gram-stereotype-space]
[fixture: usecase/gram-stereotype-open]
[fixture: usecase/gram-stereotype-newline]
[fixture: usecase/gram-stereotype-u2028]
[fixture: usecase/gram-stereotype-u2029]
[fixture: usecase/lex-stereotype-nested-open]
[fixture: usecase/lex-stereotype-first-close]
[fixture: usecase/lex-stereotype-only-whitespace]

### 各文脈の空白、コメント、directive

ヘッダー前の先頭空白は共通の空白集合です。
ヘッダー後の既定文脈の trivia は ASCII 空白、タブ、物理行終端だけです。
Unicode 空白、VT/FF、NUL、U+0085 は label-symbol の内容で、
字下げや文の区切りではありません。
JSON と stereotype 文脈に空白を飛ばす規則はなく、内容として読みます。
[fixture: usecase/lex-whitespace-leading]
[fixture: usecase/lex-tab-blank-line]
[fixture: usecase/lex-unicode-blank-line]
[fixture: usecase/lex-unicode-indent] [fixture: usecase/lex-bom-blank-line]
[fixture: usecase/lex-vt] [fixture: usecase/lex-ff] [fixture: usecase/lex-nel]
[fixture: usecase/lex-style-unicode-trailing]
[fixture: usecase/lex-native-label-separators]

共通のコメント領域は文字列、metadata、JSON、アクセシビリティを含む全域です。
コメント行全体と前の空行を除くことがあります。
native コメントは異なり、既定文脈だけで、%% より前の物理行の文字が
ASCII 空白とタブだけの場合に認識します。
印は %%、値は LF を除く物理行末までで、U+2028 と U+2029 は終わりません。
ヘッダー後の裸の %% や directive でない %%{...} 行も native コメントです。
コメント行にはなりますが、文末に付ける inline コメントにはなりません。
[fixture: usecase/comment-bare-pair] [fixture: usecase/comment-bare-eof]
[fixture: usecase/comment-u2028] [fixture: usecase/comment-u2029]
[fixture: usecase/comment-after-actor] [fixture: usecase/comment-after-edge]
[fixture: usecase/gram-json-comment]
[fixture: usecase/db-accdescr-block-comment]
[fixture: usecase/lex-comment-bare-ls]
[fixture: usecase/lex-comment-region-hides-markdown-close]
[fixture: usecase/lex-comment-inline-native]
[fixture: usecase/lex-comment-region-inside-stereotype]

inline の %% は裸ラベル、note、アクセシビリティ行値、CSS 値など、
文法で許す位置では普通のデータです。他の位置では通常拒否します。
単独の %、#、// はコメント印ではありません。
directive を除いてできた %% も同じ規則で、
文字列内なら native コメントではありません。
[fixture: usecase/comment-unquoted] [fixture: usecase/comment-quoted]
[fixture: usecase/comment-after-note-unquoted]
[fixture: usecase/comment-after-style]
[fixture: usecase/comment-after-acctitle] [fixture: usecase/comment-hash]
[fixture: usecase/comment-slash] [fixture: usecase/comment-single-percent]
[fixture: usecase/lex-directive-between-percent-signs]

usecase はラベル内の inline `%%` を保ちます。
`A(C4Context %% C4Container)` の行が LF で終わると、
検出はパーセント接尾部を除いて usecase を選び、
ラベルには書かれた全文を保ちます。
EOF では検出がその接尾部を残すので、C4 を選んで拒否します。
この仕様は既存の逆方向の基準により、同じラベルを usecase として受理します。
[fixture: usecase/lex-c4-inline-percent-with-lf]
[fixture: usecase/div-c4-inline-percent-eof]

CR と CRLF は先に LF に変換して読み、木の値は元の行終端を保ちます。
U+2028 と U+2029 は文を区切りません。
plain/markdown ラベル、stereotype、アクセシビリティ値では内容です。
JSON でも不透明な内容ですが、mermaid の厳密な JSON は構造的空白としては拒否し、
文字列内では許します。この内容検証は embedded-data-opaque です。
[fixture: usecase/lex-statements-cr] [fixture: usecase/lex-statements-crlf]
[fixture: usecase/lex-plain-cr] [fixture: usecase/lex-markdown-cr]
[fixture: usecase/lex-u2028-line] [fixture: usecase/lex-u2029-line]
[fixture: usecase/lex-accessibility-line-separators]
[fixture: usecase/gram-stereotype-u2028]
[fixture: usecase/div-gram-json-u2028]
[fixture: usecase/gram-json-u2029-string]

directive は全文脈で共通 trivia で、複数行なら物理行終端を除くことがあります。
ヘッダーと文のキーワード、方向語、普通の id、辺 id、class 名、
native metadata の裸キーとスカラー、CSS プロパティ名の語、矢印、
連続した `@{`、`:::`、`<<`、`>>` は共通の原子的な単位の境界規則に従います。
文字列、ラベル内容、stereotype 内容、CSS 値、アクセシビリティ値、
JSON 内部には directive を含められます。完全な構成要素の間にも置けます。
[fixture: usecase/div-directive-in-header]
[fixture: usecase/div-directive-in-id]
[fixture: usecase/div-directive-in-keyword]
[fixture: usecase/div-directive-splits-operator]
[fixture: usecase/div-directive-in-metadata]
[fixture: usecase/div-lex-directive-in-metadata-key]
[fixture: usecase/div-lex-directive-in-class-delimiter]
[fixture: usecase/div-lex-directive-in-stereotype-opener]
[fixture: usecase/directive-in-label]
[fixture: usecase/directive-in-stereotype]
[fixture: usecase/directive-in-json]
[fixture: usecase/div-directive-in-native-boolean]
[fixture: usecase/lex-directive-native-quoted-key]
[fixture: usecase/div-directive-css-property]
[fixture: usecase/lex-directive-css-number]
[fixture: usecase/lex-directive-before-label]
[fixture: usecase/div-directive-stereotype-closer]
[fixture: usecase/div-directive-explicit-edge-id]
[fixture: usecase/lex-stereotype-closer-control]
[fixture: usecase/gram-explicit-edge-id-control]

json-prefix の json の語、id、@ は別々の構成要素です。
それぞれに境界があり、接頭部全体を原子的なキーワードにはしません。
id と @ の間、@ と { の間、それらの空白内の directive は許し、
json と id の内部で分断するものは拒否します。
native metadata の `@{` は 1 つの連続した区切りです。
[fixture: usecase/lex-directive-between-json-id]
[fixture: usecase/div-lex-directive-in-json-keyword]
[fixture: usecase/lex-directive-in-json-declaration-at]
[fixture: usecase/lex-directive-whole-json-prefix-boundary]
[fixture: usecase/div-directive-raw-json-id]
[fixture: usecase/gram-json-prefix-id-control]

共通の無視するセミコロン規則は実体参照変換より先で、全域に適用します。
選ばれたセミコロンは文字列、値、完全な単位間では除けます。
CSS プロパティ名の語を含む、上記の原子的な単位内なら既存の理由 2 の差異です。
他のセミコロンは LabelText の許す位置で内容ですが、文の区切りにはなりません。
[fixture: usecase/lex-style-hash-semicolon]
[fixture: usecase/lex-style-label-trigger]
[fixture: usecase/lex-style-label-three]
[fixture: usecase/lex-style-label-both]
[fixture: usecase/lex-style-trigger-json]
[fixture: usecase/lex-style-trigger-metadata-icon]
[fixture: usecase/lex-style-trigger-ls]
[fixture: usecase/gram-actor-semicolon] [fixture: usecase/gram-note-semicolon]
[fixture: usecase/lex-semicolon-complete-unit-boundary]
[fixture: usecase/div-semicolon-identifier-selected]
[fixture: usecase/div-semicolon-keyword-selected]
[fixture: usecase/div-semicolon-joins-arrow-selected]
[fixture: usecase/div-semicolon-native-key-valid]
[fixture: usecase/div-semicolon-native-value-selected]
[fixture: usecase/div-semicolon-stereotype-closer-selected]
[fixture: usecase/lex-semicolon-stereotype-closer-control]

forward-circle と forward-cross は markerless-solid より前で、
語境界を検査しません。
`A --order` の target は `rder`、`A --xray` の target は `ray` です。
最初の o と x は矢印に入り、marker の後に空白かタブを置けば次の id を保ちます。
[fixture: usecase/lex-forward-circle-id-prefix]
[fixture: usecase/lex-forward-cross-id-prefix]
[fixture: usecase/lex-forward-circle-id-spaced]
[fixture: usecase/lex-forward-cross-id-spaced]

## 文法

[共通の記法](../common.ja.md#表記) と上記の順序つき単位を使います。
HWS は、接頭部や行頭条件が要求する場合を除き trivia です。
id は正確な identifier、
raw-json-id は JSON 接頭部内の空でない ASCII 語文字列です。
すべての単位を消費する必要があり、残りがあれば拒否します。
[fixture: usecase/gram-two-statements-line] [fixture: usecase/header-twice]
[fixture: usecase/gram-arrow-chain] [fixture: usecase/header-same-line]

```text
diagram = "usecase-beta" line-end top-line* end-of-text
top-line = newline | comment-line | statement
comment-line = diagram-comment line-end
line-end = newline | end-of-text

statement = acc-title-statement | acc-descr-statement
          | acc-descr-block-statement | direction-statement
          | actor-statement | boundary-statement | note-statement
          | json-statement | class-def-statement | class-statement
          | style-statement | metadata-assignment | entity-statement

actor-statement = "actor" actor-item ( ( "," actor-item )+ | relation-tail )? line-end
actor-item = actor-name metadata? stereotype? class-suffix?
actor-name = id ( "(" node-label ")" )? | plain-string | markdown-string

entity-statement = entity-name relation-tail? line-end
entity-name = ( id ( "(" node-label ")" | "[" node-label "]" )?
              | plain-string | markdown-string )
              metadata? stereotype? class-suffix?
node-label = plain-string | markdown-string | label-text-unit+

relation-tail = ( id "@" )? relationship-operator entity-name
relationship-operator = semantic-operator | sole-association
                      | split-association
semantic-operator = "--|>" | "..>" ":" ( include-word | extend-word )
sole-association = forward-solid | backward-solid | markerless-solid
                 | forward-circle | backward-circle | forward-cross | backward-cross
split-association = "--" edge-label ( forward-solid | markerless-solid | "--o" | "--x" )
                  | "<--" edge-label markerless-solid
                  | "o--" edge-label markerless-solid
                  | "x--" edge-label markerless-solid
edge-label = plain-string | markdown-string | label-text-unit+

metadata = "@{" newline* ( metadata-property
           ( metadata-separator metadata-property )*
           ( "," | newline )? newline? )? "}"
metadata-property = ( id | plain-string ) ":" ( id | plain-string | "true" | "false" )
metadata-separator = "," newline* | newline+ ","? newline*
metadata-assignment = metadata-target metadata line-end
metadata-target = id | plain-string | markdown-string
stereotype = "<<" stereotype-text ">>"
class-suffix = ":::" id ( "," id )*

boundary-statement = "systemBoundary" boundary-name metadata? class-suffix?
                     line-end boundary-line* "end" line-end
boundary-name = id ( "(" node-label ")" | "[" node-label "]" )?
              | plain-string | markdown-string
boundary-line = newline | comment-line | actor-declaration | entity-name line-end
actor-declaration = "actor" actor-item ( "," actor-item )* line-end

note-statement = "note" "for" id node-label line-end
json-statement = json-prefix balanced-json-object class-suffix? line-end
json-prefix = "json" positive-hws raw-json-id hws* "@" hws*
direction-statement = "direction" ( "TD" | "TB" | "BT" | "LR" | "RL" ) line-end
class-def-statement = "classDef" id ( "," id )* styles line-end
class-statement = "class" id ( "," id )* id ( "," id )* line-end
style-statement = "style" id styles line-end
styles = style-declaration ( "," style-declaration )*
style-declaration = ( word | css-identifier | markerless-solid word ) ":" style-component+

acc-title-statement = acc-title-line line-end
acc-descr-statement = acc-descr-line line-end
acc-descr-block-statement = acc-descr-block line-end
```

style-component は Word、plain-string、number、hash-color、css-identifier、
escaped-comma、dash、dot、percent、css-punctuation、colon、括弧、角括弧、
波括弧、at、markerless-solid です。
markdown-string、label-punctuation、label-symbol、コンマ、marker 矢印、
metadata-open などの複合開き印ではなく、任意の CSS は許しません。
[fixture: usecase/gram-styles-components] [fixture: usecase/gram-style-empty]
[fixture: usecase/gram-style-markdown] [fixture: usecase/gram-style-semicolon]
[fixture: usecase/gram-style-trailing-comma]
[fixture: usecase/lex-style-unicode-trailing]

空の plain-string も値の構成単位です。
`color:""` は有効で、CSS テキストに引用符を保ちます。
コロン後の HWS だけでは構成単位を作りません。
[fixture: usecase/gram-css-empty-string-component]
[fixture: usecase/gram-css-whitespace-without-component]

1. 最上位の対象名の直後に metadata-open があると、entity より前に更新を選び、
   そのブロックで終える必要があります。
   metadata の前の明示形状ラベルはこの判定を避けます。
   境界内の同じ裸 id と metadata は entity の宣言です。
   [fixture: usecase/db-metadata-forward]
   [fixture: usecase/gram-boundary-standalone-metadata-inside]
   [fixture: usecase/gram-bare-source-metadata-forces-update]
   [fixture: usecase/gram-labeled-source-metadata-declaration]
   [fixture: usecase/gram-target-metadata-declaration]
   [fixture: usecase/gram-boundary-target-update-is-member]
2. 最上位の entity 文の先頭だけでは、ASCII の大文字小文字を無視して
   allowmixing、newpage、package、rectangle、skinparam の裸 id を拒否します。
   actor 名、境界の要素、target、先に選ぶ metadata 更新の対象には適用しません。
   [fixture: usecase/gram-forbidden-uppercase]
   [fixture: usecase/spec-usecase-parser-5642283f]
   [fixture: usecase/spec-usecase-parser-f082d9b7]
   [fixture: usecase/gram-forbidden-in-boundary]
   [fixture: usecase/gram-forbidden-actor-name]
   [fixture: usecase/gram-forbidden-target]
   [fixture: usecase/gram-forbidden-as-metadata-target]
3. 分割関連は、正確な開きの綴りと、
   互換でない単位より前に許す閉じ演算子に達する、
   空でないラベル互換列があると選びます。
   探索では引用文字列も互換ですが、文法のラベルは文字列 1 つか裸の列だけです。
   両者の混合はなく、`---` や `<---` はラベルを開けません。
   [fixture: usecase/gram-arrow-long-left-label]
   [fixture: usecase/gram-backward-long-labeled-left]
   [fixture: usecase/db-labeled-arrows]
   [fixture: usecase/gram-edge-label-operator]
4. actor はコンマリストか 1 つの関連を選び、リストの後の関連は許しません。
   関連の出現は端点 2 つだけで、連鎖を拒否します。
   [fixture: usecase/gram-actor-list]
   [fixture: usecase/gram-actor-list-relation]
   [fixture: usecase/gram-actor-relation] [fixture: usecase/gram-arrow-chain]
5. 境界は宣言だけで top-line* ではありません。
   境界に stereotype はなく、本体に class/style、方向、note、JSON、関連、
   入れ子の境界、アクセシビリティの文は置けません。
   metadata の形の要素宣言は許します。
   [fixture: usecase/gram-boundary-acc]
   [fixture: usecase/gram-boundary-actor-relation]
   [fixture: usecase/gram-boundary-class]
   [fixture: usecase/gram-boundary-direction]
   [fixture: usecase/gram-boundary-style]
   [fixture: usecase/gram-boundary-nested]
   [fixture: usecase/spec-usecase-parser-1c613ef7]
   [fixture: usecase/spec-usecase-parser-20ebe1d4]
   [fixture: usecase/spec-usecase-parser-c53dbb01]
6. metadata は先頭の空行を許し、プロパティは改行かコンマで区切ります。
   [fixture: usecase/gram-metadata-comma]
   [fixture: usecase/gram-metadata-newline]

   改行は、共通のコメント領域と行終端の規則を適用した後で数えます。
   最後のプロパティから `}` までにある末尾コンマと物理改行は、
   合計 2 個までで、コンマは改行より前にだけ置けます。
   [fixture: usecase/gram-metadata-tail-newline-before-comma]
   [fixture: usecase/gram-metadata-tail-newline-before-comma-newline]
   [fixture: usecase/gram-native-trailing-newline]
   [fixture: usecase/gram-metadata-no-trailing-comma-two-newlines]
   [fixture: usecase/gram-metadata-no-trailing-comma-three-newlines]
   [fixture: usecase/gram-metadata-no-trailing-comma-four-newlines]
   [fixture: usecase/gram-metadata-no-trailing-comma-two-properties-two-newlines]
   [fixture: usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines]
   [fixture: usecase/gram-edge-metadata-two-newlines]
   [fixture: usecase/gram-edge-metadata-three-newlines]
   [fixture: usecase/gram-metadata-trailing-comma-no-newline]
   [fixture: usecase/gram-native-trailing-comma-newline]
   [fixture: usecase/gram-metadata-trailing-comma-two-newlines]
   [fixture: usecase/gram-metadata-trailing-comma-three-newlines]

   プロパティ間のコンマの後は、次のプロパティまで 0 個以上の改行を許します。
   [fixture: usecase/gram-metadata-property-comma-no-newline]
   [fixture: usecase/gram-metadata-property-comma-one-newline]
   [fixture: usecase/gram-metadata-property-comma-two-newlines]
   [fixture: usecase/gram-metadata-property-comma-three-newlines]

   ASCII 空白とタブは改行数を変えず、CRLF は 1 改行として数えます。
   [fixture: usecase/gram-metadata-trailing-comma-one-newline-hws]
   [fixture: usecase/gram-metadata-trailing-comma-two-newlines-hws]
   [fixture: usecase/gram-metadata-property-comma-one-newline-hws]
   [fixture: usecase/gram-metadata-property-comma-two-newlines-hws]
   [fixture: usecase/gram-metadata-trailing-comma-one-newline-crlf]
   [fixture: usecase/gram-metadata-trailing-comma-two-newlines-crlf]
   [fixture: usecase/gram-metadata-trailing-comma-three-newlines-crlf]
   [fixture: usecase/gram-metadata-property-comma-one-newline-crlf]
   [fixture: usecase/gram-metadata-property-comma-two-newlines-crlf]
   [fixture: usecase/gram-metadata-property-comma-three-newlines-crlf]
   [fixture: usecase/gram-metadata-no-trailing-comma-two-crlf]
   [fixture: usecase/gram-metadata-no-trailing-comma-three-crlf]
   [fixture: usecase/gram-metadata-no-trailing-comma-two-whitespace-lines]
   [fixture: usecase/gram-metadata-no-trailing-comma-whitespace-lines]
   [fixture: usecase/gram-metadata-no-trailing-comma-two-tab-lines]
   [fixture: usecase/gram-metadata-no-trailing-comma-tab-lines]

   共通コメント領域の除去で改行数が減る場合は、残った改行だけを数えます。
   [fixture: usecase/gram-metadata-trailing-comma-comment-line]
   [fixture: usecase/gram-metadata-trailing-comma-comment-line-blank-after]
   [fixture: usecase/gram-metadata-property-comma-comment-line]
   [fixture: usecase/gram-metadata-property-comma-comment-line-blank-after]
   [fixture: usecase/gram-metadata-no-trailing-comma-comment-two-newlines]
   [fixture: usecase/gram-metadata-no-trailing-comma-comment-three-newlines]

   先頭や二重のコンマ、改行の後の最後のコンマ、
   空白だけで区切るプロパティは拒否します。
   YAML/JSON のスカラー、配列、mapping の文法を持ち込みません。
   [fixture: usecase/gram-metadata-no-separator]
   [fixture: usecase/gram-metadata-double-comma]
   [fixture: usecase/gram-metadata-empty-comma-only]
   [fixture: usecase/gram-native-leading-comma]
   [fixture: usecase/gram-native-trailing-newline-comma]
   [fixture: usecase/gram-native-trailing-comma-newline-property]
   [fixture: usecase/gram-native-key-newline-colon]
   [fixture: usecase/gram-native-value-newline]

7. class の接尾辞、名前、対象のリストに穴や末尾の空要素はありません。
   styles もコンマの後に名前と値が必要です。
   actor/entity の順は metadata、stereotype、classes、
   境界は metadata、classes、JSON はオブジェクト後の classes だけです。
   [fixture: usecase/gram-class-suffix-missing]
   [fixture: usecase/gram-class-suffix-order]
   [fixture: usecase/gram-actor-suffix-metadata-after-stereotype]
   [fixture: usecase/gram-entity-class-before-metadata]
   [fixture: usecase/gram-style-trailing-comma]
   [fixture: usecase/spec-usecase-parser-c35d5e27]
8. 完成した文は line-end が必要で、前に native HWS を置けます。
   セミコロンで代用できません。
   共通コメントや directive が行終端を保つか除くことはありますが、
   空ブロックを任意の隙間に置く例外はありません。
   空のアクセシビリティブロックにも専用の行が必要です。
   [fixture: usecase/gram-two-statements-line]
   [fixture: usecase/gram-final-statement-eof]
   [fixture: usecase/gram-boundary-end-eof]
   [fixture: usecase/gram-acc-block-semicolon]
   [fixture: usecase/lex-actor-final-tab]
   [fixture: usecase/directive-closed-statement-ends]
   [fixture: usecase/gram-a11y-empty-inline-after-node]
   [fixture: usecase/gram-a11y-empty-between-actor-and-id]
   [fixture: usecase/gram-a11y-empty-block-same-line-following]

1 つの native プロパティ内では、キー、コロン、値の間に HWS を置けます。
キーとコロンの間、コロンと値の間に物理改行は置けません。
[fixture: usecase/gram-native-key-newline-colon]
[fixture: usecase/gram-native-key-comment-region-keeps-line-break]
[fixture: usecase/gram-native-value-newline]
[fixture: usecase/gram-native-value-comment-region-keeps-line-break]
改行は完成したプロパティ同士を区切ります。
[fixture: usecase/gram-metadata-newline]

キーワードと区切りはすべて字句単位か複合一致の構成要素です。
コメント行と空行に文の節点はありません。
下記の対応で、名前、ラベル、metadata、CSS、演算子、ブロックの各節点を作り、
解決済みの Db 項目にはしません。

### 文法の外の拒否

以下は文法後の受理条件です。変換と既定値は tests の要約が定義します。

- actor、usecase、境界、JSON、明示辺の id は 1 つの名前空間です。
  引用符だけのラベルの生成 id は、変換後の内容の各 UTF-16 符号単位のうち、
  ASCII 語文字以外を underscore に置き換えたもので、空にもなります。
  生成 id が関わる別の宣言は、同じラベルでも衝突します。
  JSON と明示辺は常に一意な id が必要です。
  明示 actor/usecase/境界の繰り返しは次の互換条件を満たす場合だけです。
  class の定義は別の名前空間です。
  [fixture: usecase/gram-generated-label-repeat]
  [fixture: usecase/gram-json-duplicate-id]
  [fixture: usecase/spec-usecase-parser-31b56285]
  [fixture: usecase/spec-usecase-parser-86075211]
  [fixture: usecase/db-prototype-ids]
  [fixture: usecase/gram-empty-quoted-name]
- 明示要素の繰り返しは、種類、変換後のラベルとラベル種別、
  明示形状、空でない trim 後の stereotype が一致する必要があります。
  境界の繰り返しは変換後の表示名と種別が一致する必要があります。
  要素が所属できる空でない境界 id は 1 つだけです。
  外の宣言は所属を消さず、空の引用境界 id は競合する親を作りません。
  [fixture: usecase/spec-usecase-parser-dcb7554d]
  [fixture: usecase/spec-usecase-parser-52bb0d24]
  [fixture: usecase/spec-usecase-parser-4f100e01]
  [fixture: usecase/spec-usecase-parser-ad15d068]
  [fixture: usecase/spec-usecase-parser-0996ad58]
  [fixture: usecase/gram-actor-repeat-labeltype-conflict]
  [fixture: usecase/gram-boundary-repeat-labeltype-conflict]
  [fixture: usecase/gram-empty-boundary-conflicting-parent]
  [fixture: usecase/gram-stereotype-trimmed-conflict]
- 裸または引用符だけの関連端点は、metadata、stereotype、
  明示形状がなければ参照です。
  actor キーワードのある source は宣言です。
  class 接尾辞だけでは宣言にならず、その参照上では拒否します。
  宣言した記号は文書全体で解決し、未解決の端点は暗黙の usecase です。
  生成 id への参照だけなら生成宣言の重複ではありません。
  [fixture: usecase/gram-classes-on-reference-only]
  [fixture: usecase/gram-classes-on-quoted-reference-only]
  [fixture: usecase/db-generated-reference]
  [fixture: usecase/gram-generated-reference-not-declaration]
  [fixture: usecase/gram-metadata-on-anonymous-resolved-node]
- 関連は actor/usecase/JSON 間で、境界や明示辺には接続できません。
  include/extend は usecase 2 つ、
  generalization は actor 同士か usecase 同士です。
  JSON は forward-point、backward-point、markerless の関連だけです。
  [fixture: usecase/spec-usecase-parser-81a7a3d7]
  [fixture: usecase/spec-usecase-parser-70ebd0e2]
  [fixture: usecase/spec-usecase-parser-5c692f7f]
  [fixture: usecase/spec-usecase-parser-800c93e6]
- note の対象は actor か usecase で、後の宣言や暗黙の端点でも解決できます。
  JSON、境界、明示辺、他の note、未解決名は無効です。
  note 自身に明示 id はありません。
  [fixture: usecase/gram-note-forward] [fixture: usecase/gram-note-unresolved]
  [fixture: usecase/spec-usecase-parser-67cf728b]
  [fixture: usecase/spec-usecase-parser-839235e2]
  [fixture: usecase/spec-usecase-parser-e68079bc]
- metadata 更新は暗黙の端点も含め文書全体で対象を解決しますが、
  対象を生成しません。
  class/style も同じ名前空間で、保存した要素、境界、JSON、明示辺が対象です。
  無名辺には付けられません。
  未使用の classDef は有効で、class 名に定義は不要です。
  [fixture: usecase/db-metadata-forward]
  [fixture: usecase/gram-metadata-empty] [fixture: usecase/gram-class-unknown]
  [fixture: usecase/gram-style-unknown] [fixture: usecase/db-style-forward]
  [fixture: usecase/db-class-forward] [fixture: usecase/db-anonymous-edge-id]
  [fixture: usecase/db-edge-id-style]
  [fixture: usecase/gram-metadata-on-anonymous-resolved-node]

| 対象    | 許す native プロパティ                                                          |
| ------- | ------------------------------------------------------------------------------- |
| actor   | type: normal/hollow/awesome のテキスト、icon: テキスト、business: 裸 true/false |
| usecase | business: 裸 true/false                                                         |
| 境界    | type: rect/package のテキスト                                                   |
| 明示辺  | animate: 裸 true/false、animation: fast/slow のテキスト                         |
| JSON    | 空の metadata だけ                                                              |

テキスト値は非キーワードの裸 identifier か plain-string です。
裸の boolean キーワードは boolean、引用した boolean は文字列です。
キーは大文字小文字を区別し、未知のキーと誤った型は、空のキーや値でも拒否します。
metadata に markdown 文字列は許しません。
[fixture: usecase/gram-metadata-keyword-value]
[fixture: usecase/gram-metadata-boolean-key]
[fixture: usecase/gram-metadata-markdown-key]
[fixture: usecase/gram-metadata-uppercase-boolean]
[fixture: usecase/gram-metadata-uppercase-false]
[fixture: usecase/gram-metadata-numeric-value]
[fixture: usecase/gram-metadata-empty-key]
[fixture: usecase/gram-metadata-json-empty]
[fixture: usecase/gram-metadata-json-nonempty]
[fixture: usecase/gram-metadata-unknown-key]
[fixture: usecase/gram-native-quoted-business]
[fixture: usecase/gram-native-unknown-empty-value]

宣言内で繰り返す actor の type/icon/business と usecase の business は、
同じブロック内でも一致する必要があります。
単独の更新は前の値を置き換え、
宣言より前に書いても宣言の metadata の後に適用します。
境界の inline type は更新と同じで、繰り返し宣言の競合にはしません。
これらは native の検証で、embedded-data の差異ではありません。
[fixture: usecase/gram-metadata-duplicate-inline-conflict]
[fixture: usecase/gram-metadata-duplicate-inline-business]
[fixture: usecase/db-metadata-overrides]
[fixture: usecase/gram-metadata-standalone-before-inline]
[fixture: usecase/gram-boundary-three-classes-types]
[fixture: usecase/gram-native-duplicate-business-same]
[fixture: usecase/gram-native-inline-conflict-later-fix]

最終状態では、空でない icon と normal 以外の明示 type を共存させられません。
business true の actor は normal/hollow だけです。
rectangle を business usecase にできません。
検証は単独更新後の最終 metadata に対して行い、初期の組合せは後で修復できます。
宣言間の競合と未知または誤った型のプロパティは後で修復できません。
空の icon 文字列は許し、icon を消せます。
[fixture: usecase/spec-usecase-parser-ca3ba61c]
[fixture: usecase/spec-usecase-parser-19f94cab]
[fixture: usecase/spec-usecase-parser-3f58fb81]
[fixture: usecase/spec-usecase-parser-49661584]
[fixture: usecase/gram-actor-icon-clear]
[fixture: usecase/gram-native-final-invalid-then-valid]
[fixture: usecase/gram-native-inline-conflict-later-fix]
[fixture: usecase/gram-native-invalid-property-later-fix]

maxEdges と公開 parse の maxTextSize 設定は、
これらの usecase 入力を拒否しません。
[fixture: usecase/config-max-edges] [fixture: usecase/config-max-text]

prototype 形の id も受理します。
[fixture: usecase/db-prototype-ids]

宣言の互換性では、単独の裸 id は自分のテキストを比較用ラベルとします。
そのため、前の明示表示ラベルと衝突する場合があります。
裸の関連端点は宣言を参照するだけで、ラベルを置き換えません。
[fixture: usecase/gram-bare-declaration-label-conflict]
[fixture: usecase/gram-bare-declaration-label-matches-id]
[fixture: usecase/gram-bare-endpoint-keeps-declared-label]

### 無効な入力

trivia 以外の位置はすべて字句規則で読める必要があります。
読めない文字、文法違反、native metadata やモデルの制約への違反は、
入力を拒否します。
有効な接頭部があっても、無効な図全体を受理することはありません。
[fixture: usecase/lex-lex-first-error-not-recovered]
[fixture: usecase/lex-lex-later-error-priority]
[fixture: usecase/gram-native-invalid-property-later-fix]

### 規則と節点

| 規則                                                                  | 節点                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| diagram                                                               | UsecaseDiagram                                                                      |
| actor-statement without a relation / actor-item                       | UsecaseActorStatement / UsecaseActor                                                |
| entity-statement without a relation / entity-name                     | UsecaseEntityStatement / UsecaseEntity                                              |
| either statement with relation-tail                                   | UsecaseRelationshipStatement                                                        |
| boundary-statement                                                    | UsecaseSystemBoundaryStatement                                                      |
| metadata / metadata-property / metadata-assignment                    | UsecaseMetadata / UsecaseMetadataProperty / UsecaseMetadataAssignmentStatement      |
| node-label / edge-label / stereotype-text                             | UsecaseLabel / UsecaseLabel / UsecaseLiteral                                        |
| split opening / sole or closing arrow                                 | UsecaseOpeningArrow / UsecaseArrow                                                  |
| note-statement                                                        | UsecaseNoteStatement                                                                |
| json-statement / balanced-json-object                                 | UsecaseJsonStatement / UsecaseJsonDataBlock                                         |
| direction-statement                                                   | UsecaseDirectionStatement                                                           |
| class-def-statement / class-statement / style-statement               | UsecaseClassDefStatement / UsecaseClassStatement / UsecaseStyleStatement            |
| style-declaration / property name / value                             | UsecaseStyleDeclaration / UsecaseIdentifier / UsecaseLiteral                        |
| acc-title-statement / acc-descr-statement / acc-descr-block-statement | UsecaseAccTitleStatement / UsecaseAccDescrStatement / UsecaseAccDescrBlockStatement |

表の文と値の形を次の fixture が示します。
[fixture: usecase/gram-actor-list]
[fixture: usecase/gram-actor-relation]
[fixture: usecase/db-labeled-arrows]
[fixture: usecase/gram-json-empty]
[fixture: usecase/db-metadata-forward]
[fixture: usecase/db-accdescr-block-comment]
[fixture: usecase/gram-styles-components]

明示 id は括弧や角括弧ラベルの前の名前です。
引用符だけの名前には、書かれた id がありません。
`as` の別名と title 文はなく、`title` 単独は普通の entity id です。
[fixture: usecase/gram-entity-as-alias]
[fixture: usecase/gram-quoted-as-alias] [fixture: usecase/gram-title-bare-id]
direction とアクセシビリティの文は繰り返せ、`TD` は書かれた `TD` のままです。
[fixture: usecase/db-direction-all]
[fixture: usecase/db-direction-td] [fixture: usecase/db-acctitle-empty]
[fixture: usecase/db-accdescr-empty]
空の引用ラベルも実在する節点で、
空のアクセシビリティ値と空白だけの値は区別します。
[fixture: usecase/gram-empty-actor-label]
[fixture: usecase/gram-empty-single-string-node]
[fixture: usecase/gram-a11y-line-raw-padding]
[fixture: usecase/gram-a11y-whitespace-block]
[fixture: usecase/gram-boundary-empty-label]

## 既知の差異

次の既存識別子を適用し、他の拒否は緩めません。

- [directive-as-token-boundary](../known-divergences/directive-as-token-boundary.ja.md):
  CSS プロパティ名の語を含む native の原子的な綴りを、
  directive で分断できません。
  [fixture: usecase/div-directive-css-property]
  `--` と後の語の間の HWS にある directive は trivia として受理します。
  [fixture: usecase/lex-directive-css-name-gap]
  CSS 値と引用 metadata は分断できるテキストです。
  [fixture: usecase/lex-directive-css-number]
  [fixture: usecase/lex-directive-native-quoted-key]
- [ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.ja.md):
  選ばれた無視するセミコロンで、
  CSS プロパティ名の語を含む原子的な綴りを分断できません。
  [fixture: usecase/div-semicolon-keyword-selected]
  [fixture: usecase/div-semicolon-native-opener-selected]
  [fixture: usecase/div-semicolon-css-property-selected]
  `--` と後の語の間の HWS にある、選ばれた `;` は trivia として受理します。
  [fixture: usecase/lex-semicolon-css-name-gap]
  [fixture: usecase/lex-semicolon-classdef-css-name-gap]
  CSS 値は分断できるテキストです。
  [fixture: usecase/lex-semicolon-css-number-text]
- [html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.ja.md):
  タグ探索を本体だけに制限します。
  frontmatter をまたぐ変換とは受理が双方向に異なり、
  両者が受理して値だけ異なる場合もあります。
  [fixture: usecase/div-html-frontmatter-enables-label]
  [fixture: usecase/div-html-frontmatter-blocks-label]
  [fixture: usecase/lex-html-body-label-reference]
  [fixture: usecase/lex-html-body-tag-reference]
  [fixture: usecase/div-html-frontmatter-acc-title-db]
  [fixture: usecase/lex-html-acc-title-body-control]
  [fixture: usecase/lex-html-frontmatter-arrow-closes-tag]
- [embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md):
  frontmatter/directive と JSON の表の内部は不透明です。
  native metadata のプロパティは構文で、上記の検証をすべて保ちます。
  [fixture: usecase/div-gram-json-unquoted-key]
  [fixture: usecase/div-gram-json-trailing-comma]
  [fixture: usecase/div-gram-json-malformed-escape]
  [fixture: usecase/div-frontmatter-malformed]
  [fixture: usecase/gram-native-quoted-business]
- [c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.ja.md):
  検出に残る後続の C4 語があっても、ヘッダーから usecase を選びます。
  行末の LF は検出から inline パーセント接尾部を隠しますが、EOF は隠しません。
  [fixture: usecase/div-detect-c4-label]
  [fixture: usecase/div-c4-component-label]
  [fixture: usecase/div-c4-dynamic-json]
  [fixture: usecase/div-c4-deployment-stereotype]
  [fixture: usecase/lex-c4-inline-percent-with-lf]
  [fixture: usecase/div-c4-inline-percent-eof]
- [bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.ja.md):
  このヘッダーの前でも共通の先頭コメントを trivia にします。
  [fixture: usecase/div-comment-preheader-bare]
  [fixture: usecase/div-comment-preheader-braces]
  [fixture: usecase/div-comment-preheader-bare-unicode-blank]
