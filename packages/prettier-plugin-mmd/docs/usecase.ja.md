# Usecase formatting rules

英語版: [usecase.md](./usecase.md)

[書かれた構文の木](../../spec/docs/ast/usecase.ja.md)から、
[usecase の仕様](../../spec/docs/diagrams/usecase.ja.md)に従い、
`usecase-beta` を整形します。
各規則は選択の理由を説明し、共有の規則をその理由とともに参照し、
規則の文から作った fixture を引用します。
入力はエスケープした JSON 文字列で示し、
出力ブロックは各規則の fixture 一つを写します。
Unicode、制御文字、CR は `usecase-cases.ts` 内でエスケープします。

HWS は ASCII の水平空白、U+0020 SPACE と U+0009 TAB を指します。
LS は U+2028 LINE SEPARATOR、PS は U+2029 PARAGRAPH SEPARATOR を指します。

整形は共有の失敗経路に従います。
単独ファイルの parser の失敗は `SyntaxError` とし、
拒否する Markdown 本文はホストへ返します。
ヘッダー、セミコロンで区切った文、別名、連鎖、入れ子の境界、未解決 note、
native 検証、未完の文字列は修復しません。
usecase は、native metadata を含む未完の一重引用文字列も拒否します。
class の未完のバッククォート名の EOF 規則は適用しません。
[corpus fixture: usecase/header-uppercase]
[corpus fixture: usecase/gram-two-statements-line]
[corpus fixture: usecase/gram-entity-as-alias]
[corpus fixture: usecase/gram-arrow-chain]
[corpus fixture: usecase/gram-boundary-nested]
[corpus fixture: usecase/gram-note-unresolved]
[corpus fixture: usecase/gram-metadata-unknown-key]
[corpus fixture: usecase/lex-plain-unclosed]
[corpus fixture: usecase/lex-native-single-quote-comment-region-lf]

受理する乖離は、
[互換性](./compatibility.ja.md#usecase-native-syntax-and-authored-values)
の指定の読みに従います。
既存の識別子は `directive-as-token-boundary`、
`ignored-semicolon-as-token-boundary`、`html-tag-in-frontmatter`、
`embedded-data-opaque`、`c4-keyword-anywhere`、
`bare-percent-line-before-header` の六つです。
すべての `div-` 入力を受理するわけではありません。
拒否と印付きのケースを含む全コーパスを、
共有の整形とコーパスのテストで検査します。
元の Mermaid が拒否した場合、元の Db はありません。
[corpus fixture: usecase/div-directive-in-id]
[corpus fixture: usecase/div-semicolon-identifier-selected]
[corpus fixture: usecase/div-html-frontmatter-acc-title-db]
[corpus fixture: usecase/div-gram-json-unquoted-key]
[corpus fixture: usecase/div-detect-c4-label]
[corpus fixture: usecase/div-comment-preheader-bare]

## Rules

### Header

[C4](./c4.ja.md#ヘッダー) と同じく、図の始まりを見つけやすくするため、
正確な小文字の `usecase-beta` を先頭列に置き、本文を次の行から置きます。
外側の ASCII 空白とタブを除き、方向は独立した文のままにします。
ヘッダーだけの入力も受理し、通常の末尾改行を加えます。
大文字、安定版の名前、同じ行の本文を持つ拒否入力は、共有の失敗経路に従います。
前のコメントと directive は後述の規則に従います。

[fixture: header/header-column] [fixture: header/leading-trivia-empty]
[corpus fixture: usecase/spec-usecase-parser-7ae00acb]

入力（escape 表記）: `" \tusecase-beta  \nA"`

出力
([header/header-column-output.mmd](../tests/fixtures/usecase/header/header-column-output.mmd)):

```mmd
usecase-beta
  A
```

### Indentation

所属を見える形にするため、class の[字下げ](./class.ja.md#字下げ)を再利用します。
ヘッダーの下を設定の 1 段、境界内の宣言を 2 段とし、`end` は開始文に揃えます。
[fixture: system-boundaries/boundary-header-comment-empty]
1 段は `tabWidth` と `useTabs` に従い、既定は空白 2 個、
タブを使う場合は各段に 1 個です。
usecase では字下げが読みを決めないので、`tabWidth: 0` は 0 のままです。
accessibility は先頭列でも ASCII 空白の後でも accessibility のままです。
YAML は共有の最小幅 1 を保ちます。
値と directive の継続行は書かれた列を保ち、
対象となる JSON の余白は [JSON tables](#json-tables) に従います。
[fixture: native-metadata/metadata-key-multiline-directive]
[fixture: native-metadata/metadata-scalar-multiline-directive]
[fixture: classes-and-styles/css-name-multiline-directive]
[fixture: json-tables/json-prefix-id-at-multiline-directive]

[fixture: indentation/indent-depth] [fixture: indentation/indent-four]
[fixture: indentation/indent-tabs] [fixture: indentation/indent-zero]
[fixture: indentation/indent-zero-a11y] [fixture: indentation/indent-zero-tabs]
[fixture: indentation/boundary-comments-before-end]
[fixture: indentation/zero-tabs-boundary]
[fixture: indentation/value-and-json-columns]

入力（escape 表記）:
`"usecase-beta\nsystemBoundary Portal\nactor User\nTask(Work)\nend\nUser-->Task"`

出力
([indentation/indent-depth-output.mmd](../tests/fixtures/usecase/indentation/indent-depth-output.mmd)):

```mmd
usecase-beta
  systemBoundary Portal
    actor User
    Task(Work)
  end
  User --> Task
```

### Statements and semicolons

各 native 文は、文法が要求する物理行を保ちます。
セミコロンは文を区切らず、actor の一覧はコンマを使います。
[スタイル文の末尾のセミコロン](#semicolons-at-the-end-of-a-style-statement)
の例外を除き、セミコロンを保ちます。
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
[fixture: statements-and-semicolons/stretch-kept-rest-formatted]
[fixture: statements-and-semicolons/no-stretch-formatted]
[fixture: json-tables/kept-body-line]
[fixture: native-metadata/metadata-selected-semicolon-between-properties]
二つの文字列処理、コロンとハッシュの間の空白の有無、Unicode の区間境界、
未完 directive を止めるセミコロンの読みを保ちます。

[fixture: statements-and-semicolons/statements-lines]
[fixture: statements-and-semicolons/semicolon-label-content]
[fixture: statements-and-semicolons/semicolon-selected-boundary]
[fixture: statements-and-semicolons/semicolon-selected-retarget-kept]
[fixture: statements-and-semicolons/safe-suffix-after-kept-value]
[fixture: statements-and-semicolons/selected-directive-prefix]

入力（escape 表記）:
`"usecase-beta\n actor  Reader\nRead(Inspect)\nReader-->Read"`

出力
([statements-and-semicolons/statements-lines-output.mmd](../tests/fixtures/usecase/statements-and-semicolons/statements-lines-output.mmd)):

```mmd
usecase-beta
  actor Reader
  Read(Inspect)
  Reader --> Read
```

### Declarations

ER の[実体](./er.ja.md#実体)を再利用します。
`actor` の後は空白 1 個、id と形の区切り、metadata と class の接尾辞は詰め、
ラベルの外側の ASCII 空白を除き、actor の項目はコンマと空白で区切ります。
一つの `actor` キーワードの下にある別々の actor の出現を見える形にするためです。
stereotype の隙間は、[class に揃えた規則](#stereotypes)に従います。
明示 id、引用だけの名前、楕円と長方形の綴り、ラベルの種類、接尾辞の順序、
宣言と参照のすべての出現を保ちます。
生成 id や解決後の actor を、書かれた端点の代わりにはしません。
境界内の metadata 形式は宣言、最上位の形式は更新のままです。
別名や形を作らず、書かれた構文を見える形にします。

[fixture: declarations/actor-list] [fixture: declarations/entity-shapes]
[fixture: declarations/suffixes] [fixture: declarations/generated-name]
[fixture: declarations/shape-change-kept]
[fixture: declarations/reference-not-redeclared]
[fixture: declarations/actor-source-occurrence]

入力（escape 表記）:
`"usecase-beta\nactor  User ( Person ) , Clerk('Desk') , \"Guest\""`

出力
([declarations/actor-list-output.mmd](../tests/fixtures/usecase/declarations/actor-list-output.mmd)):

```mmd
usecase-beta
  actor User(Person), Clerk("Desk"), "Guest"
```

### Labels

C4 の[引数の形](./c4.ja.md#引数の形)と同じく、裸、一重引用、二重引用、
markdown のラベルは種類と内部の文字を保ちます。
空の引用値も残します。
通常の引用と裸の文字列で Db が等しくても、
作者の形式を保つことで不要な書き換えを避けます。
markdown はラベルの種類も変えます。
裸のラベルを構成する単位の外側にある ASCII の水平空白だけを除きます。
内部の空白、Unicode の余白、バックスラッシュ、entity、HTML は保ちます。
`'` で囲まれた文字列は、テキストに `'`、`"`、バックスラッシュ、改行、U+2028、
U+2029、バッククォート、`&`、`#`、`<` を含む場合を除き、`"` で囲んで印字します。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
`singleQuote` は読みません。 [fixture: labels/single-quote-sensitive-kept]

[fixture: labels/label-quote-kinds] [fixture: labels/label-empty-quotes]
[fixture: labels/label-quote-rewrite-one-form]
[fixture: labels/label-quote-remove-kept] [fixture: labels/label-interior-kept]
[fixture: labels/label-backslash-kept] [fixture: labels/label-html-entities]
[fixture: labels/div-c4-label] [fixture: labels/label-markdown-remove-kept]
[test: usecase: label-unicode-padding] [fixture: labels/single-quote-option]
[fixture: labels/empty-shape-labels]
[corpus fixture: usecase/div-c4-inline-percent-eof]

入力（escape 表記）:
``"usecase-beta\nA(unquoted  words)\nB(' single  text ')\nC(\" double  text \" )\nD(\"` markdown  text `\")"``

出力
([labels/label-quote-kinds-output.mmd](../tests/fixtures/usecase/labels/label-quote-kinds-output.mmd)):

```mmd
usecase-beta
  A(unquoted  words)
  B(" single  text ")
  C(" double  text ")
  D("` markdown  text `")
```

### Stereotypes

class の[トークンの間の空白](./class.ja.md#トークンの間の空白)
の隙間を再利用します。
`<<` の前に空白を 1 つ置き、区切りの内側には何も置きません。
`A[a]<<R>>` と `A[a] <<  R  >>` は `A[a] <<R>>` になります。
mermaid.js は文字を trim するので、どの書き方も同じ Db になります。
mermaid.js の文書の例 5 件も、`<<...>>` を空白の後に、文字に接して書いています。
その 3 件は、
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/usecase.md#L141-L144)
にあります。
残る 2 件は、
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/usecase.md#L546-L549)
にあります。
文字の端にディレクティブやコメントがあるときは、その隣の空白の側を保ちます。
[fixture: stereotypes/stereotype-spaced-once]
[fixture: stereotypes/opener-gap-sides] [test: usecase: stereotype-opener-tab]
actor と use case の両方に適用し、
関係の端点や systemBoundary 内の宣言も同じです。
Mermaid は内部の両端を除き、`<<` の前の空白は構造上の空白です。
どちらの整え方も Db を保つため、共有の規則に揃えます。
[fixture: stereotypes/stereotype-inner-kept]
[fixture: stereotypes/stereotype-padding]
[fixture: stereotypes/declaration-suffixes] [fixture: stereotypes/side-padding]
[fixture: stereotypes/endpoint-suffixes]
[fixture: stereotypes/boundary-suffixes]

内部のテキストは書かれたままです。
語の間の隙間、入れ子の開始記号、引用、バックスラッシュ、句読点、
directive を保ちます。
LS、PS、NBSP は内部の内容になれます。
外側の共通空白は余白の規則に従います。
[fixture: stereotypes/stereotype-plain-backslash]
[fixture: stereotypes/directive-padding]
[fixture: stereotypes/directive-gap-sides]
[test: usecase: stereotype-unicode-exterior-padding]
[test: usecase: stereotype-unicode-gap-sides]
保護した共通コメント領域は、交差する値を余白も含めて全体のまま保ちます。
[test: usecase: stereotype-comment-region-padding-kept]
内部の `;` は余白を保つ理由にはなりません。
行の規則が読むのは `:` から `#` までの範囲だけで、余白はその外にあるからです。
[fixture: stereotypes/semicolon-padding-dropped]
物理的な複数行、空、未完の拒否入力は修復しません。
[corpus fixture: usecase/gram-stereotype-newline]
[corpus fixture: usecase/gram-stereotype-empty]
[corpus fixture: usecase/gram-stereotype-open]

[fixture: stereotypes/stereotype-padding]
[fixture: stereotypes/stereotype-inner-kept]
[fixture: stereotypes/stereotype-punctuation]
[fixture: stereotypes/directive-and-selected-semicolon]

入力（escape 表記）: `"usecase-beta\nactor User <<  service  user  >>"`

出力
([stereotypes/stereotype-padding-output.mmd](../tests/fixtures/usecase/stereotypes/stereotype-padding-output.mmd)):

```mmd
usecase-beta
  actor User <<service  user>>
```

### System boundaries

開始文、宣言の本文、揃えた `end` を別々の行に置きます。
空の境界や空の引用名も同じです。
[fixture: system-boundaries/boundary-header-comment-empty]
flowchart の [subgraph のヘッダー](./flowchart.ja.md#subgraph-のヘッダー)
の見出しの形を再利用します。
タイトルの開き `[` または `(` は id に接します。
`systemBoundary S [t]` は `systemBoundary S[t]` に、
`systemBoundary S (t)` は `systemBoundary S(t)` になります。
mermaid.js は、空白のある書き方も接する書き方も同じ境界として読みます。
括弧の内側の空白とタブは落とします。
mermaid.js がそれらを trim するからです（no-break space は trim
しないので残ります）。
`systemBoundary S[ x ]` は `systemBoundary S[x]` に、
`S("x" )` は `S("x")` になります。
[fixture: system-boundaries/boundary-title-padding-dropped]
[fixture: system-boundaries/boundary-title-opener-touches-id]
タイトルの端にディレクティブがあれば、隙間に空白を置かないので、
括弧とタイトルに接します（`S[ %%{x}%% T ]` は `S[%%{x}%%T]` になります）。
保つ `;` のある行でも空白は落とします。
ただし、[Statements and semicolons](#statements-and-semicolons)のとおり、
行の規則が読む範囲は除きます。
その範囲の外の空白を落としても `;` は動かないので、
行の規則は同じ `;` を選びます。
`S[ a;b ]` は `S[a;b]` に、`S[ a; ]` は `S[a;]` になります。
空白が、行の規則が読むかもしれない行の `:` と `#` の間にあるときは、
architecture や venn と同じく、空白 1 つを残します。
usecase の id には `:` を書けず、
ディレクティブの中の `:` は行の規則が読まないので、
規則にとってタイトルの前に `:` はありません。
`systemBoundary mystyle%%{init:{}}%%[ #x; ]` は
`systemBoundary mystyle%%{init:{}}%%[#x;]` になります。
U+2028 や U+2029 を含む空白は、書かれたまま残します。
[fixture: system-boundaries/boundary-title-directive-or-semicolon]
[fixture: system-boundaries/boundary-title-padding-after-directive-colon]
[test: usecase: U+2028 inside the brackets of a boundary title]
[test: usecase: U+2029 inside the brackets of a boundary title]
[test: usecase: U+2028 inside the brackets of a boundary title with a semicolon]
[test: usecase: U+2029 inside the brackets of a boundary title with a semicolon]
隙間のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
[fixture: system-boundaries/boundary-id-title-directed-gap]
[fixture: system-boundaries/boundary-id-title-directed-gap-runs]
native metadata、class、繰り返しの宣言を保ち、
所属は AST の 1 段の宣言本文から決めます。

[fixture: system-boundaries/boundary-headings]
[fixture: system-boundaries/boundary-empty]
[corpus fixture: usecase/db-empty-boundary-id]
[fixture: system-boundaries/boundary-title-touch]
[fixture: system-boundaries/empty-quoted-name-members]
[fixture: system-boundaries/repeated-boundaries]
[fixture: system-boundaries/quoted-markdown-title]

入力（escape 表記）:
`"usecase-beta\nsystemBoundary Box [ Display ] @{ type : 'package' } ::: box , group\nactor User\nA@{ business : true }\nend"`

出力
([system-boundaries/boundary-headings-output.mmd](../tests/fixtures/usecase/system-boundaries/boundary-headings-output.mmd)):

```mmd
usecase-beta
  systemBoundary Box[Display]@{ type: "package" }:::box,group
    actor User
    A@{ business: true }
  end
```

### Arrows

読みやすい class
の[矢印の前後の空白](./class.ja.md#矢印の前後の空白)を再利用し、
実際の usecase 演算子全体の両側を通常の空白 1 個にします。
方向、マーカー、ダッシュと点の数を保ちます。
Db の長さが固定される分割矢印の長い右半分も同じです。
意味を持つ演算子は、キーワードを mermaid.js の文書の例と同じく小文字にし、
`..>:include` と `..>:extend` と詰めて印字します。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
その後、端点の前を空白 1 個にします。
コロンとキーワードは演算子の構文です。
[fixture: arrows/semantic-operator-directives]
[fixture: arrows/arrows-semantic-case-one-form]
端点の交換や演算子の種類の変換はしません。
方向、マーカー、ダッシュと点の数は書かれたままです。
正規化した Db の演算子は出力しないためです。
`A---->B` を `A --> B` にすると最小の長さが変わり、
`A<--B` を `B --> A` にすると始点と終点の順序が変わります。
分割矢印は、Db の長さが固定される場合もダッシュの数を保ちます。

[fixture: arrows/arrows-solid] [fixture: arrows/arrows-markers]
[fixture: arrows/arrows-semantic] [fixture: arrows/arrows-length-kept]
[fixture: arrows/arrows-source-order-kept]
[fixture: arrows/arrows-semantic-case-one-form]
[fixture: arrows/arrows-generalization-actors]
[fixture: arrows/extended-split-lengths]

入力（escape 表記）: `"usecase-beta\nA..>:InClUdE B\nB..> : EXTEND C\nC--|>D"`

出力
([arrows/arrows-semantic-output.mmd](../tests/fixtures/usecase/arrows/arrows-semantic-output.mmd)):

```mmd
usecase-beta
  A ..>:include B
  B ..>:extend C
  C --|> D
```

### Arrow id boundaries

矢印と端点は AST が実際に記録したとおりに空白を置きます。
`A --order` は `A --o rder`、`A -- order` は `order` を保ちます。
前向きの `--o` と `--x` は語境界を調べずにマーカーなしの `--` より先に読むため、
その単位の中に隙間を足したり消したりすると読みが変わります。
長いマーカーなしのダッシュ列と大文字の O、X も記録された端点を保ちます。
完全な単位の境界の隙間にあるディレクティブは、
[ディレクティブ](#directives)のとおりに置きます。
[fixture: arrow-id-boundaries/arrow-marker-both-gap-sides]
これは class の o マーカーの境界と異なります。
見かけ上の意図から id を復元するのは lint の仕事です。

[corpus fixture: usecase/lex-forward-circle-id-prefix]
[corpus fixture: usecase/lex-forward-cross-id-prefix]
[fixture: arrow-id-boundaries/markerless-o-id]
[fixture: arrow-id-boundaries/markerless-x-id]
[fixture: arrow-id-boundaries/circle-spaced-id]
[corpus fixture: usecase/lex-forward-cross-id-spaced]
[fixture: arrow-id-boundaries/markerless-long-before-o]
[fixture: arrow-id-boundaries/marker-uppercase-is-id]
[fixture: arrow-id-boundaries/circle-prefix-suffixes]

入力（escape 表記）:
`"usecase-beta\nStart --order\nrder@{business:true}\nclass rder current"`

出力
([arrow-id-boundaries/circle-prefix-suffixes-output.mmd](../tests/fixtures/usecase/arrow-id-boundaries/circle-prefix-suffixes-output.mmd)):

```mmd
usecase-beta
  Start --o rder
  rder@{ business: true }
  class rder current
```

### Relationship labels and ids

flowchart
の[辺のラベルの書き方](./flowchart.ja.md#辺のラベルの書き方)を保つ考え方と、
辺 id を詰める配置を再利用します。
分割ラベルの外側は空白 1 個とし、明示 id は `@` と開始側の矢印に接して置きます。
usecase が許す矢印の半分、書かれたラベルの種類、空の引用ラベル、
actor の開始キーワード、二つの端点の出現を保ちます。
明示 id は、後の metadata、class、style の対象のままです。
パイプや class 風のコロンラベルは別の文法であり、
連鎖を有効な関係へ分割することもしません。

[fixture: relationship-labels-and-ids/split-labels]
[fixture: relationship-labels-and-ids/edge-id-tight]
[fixture: relationship-labels-and-ids/edge-id-split]
[fixture: relationship-labels-and-ids/edge-empty-label]
[fixture: relationship-labels-and-ids/edge-pipe-convert-kept]
[fixture: relationship-labels-and-ids/split-circle-and-cross]

入力（escape 表記）:
``"usecase-beta\nA--  likes  -->B\nB<--'uses'--C\nC o-- part --- D\nD x--\"`blocks`\"----E"``

出力
([relationship-labels-and-ids/split-labels-output.mmd](../tests/fixtures/usecase/relationship-labels-and-ids/split-labels-output.mmd)):

```mmd
usecase-beta
  A -- likes --> B
  B <-- "uses" -- C
  C o-- part --- D
  D x-- "`blocks`" ---- E
```

### Native metadata

native metadata は解析と検証を行う構文です。
構造の空白だけを整え、対象と `@{` は詰め、プロパティのコロンの前は詰め、
後は空白 1 個、同じ行のコンマの後と波括弧の内側も空白 1 個にします。
空の場合は `@{ }` です。
キーと値の綴り、引用の種類、整数風の文字列、真偽値、順序、重複、独立した更新、
区切り、末尾コンマを保ちます。
綴り、順序、重複は、
最終的な形状を変えたり競合で拒否されたりする場合があるため保ちます。
`U@{icon:'x',icon:''}` を `icon: '', icon: 'x'` の順にすると最終的な icon
が変わり、真偽値が必要な位置の `business: "true"` は拒否されます。
`@{` は一つの開始記号として接したままです。
`@ {` は拒否されるためです。
キー、コロン、値の間には改行を入れません。
改行は一つのプロパティを分けられないためです。
[fixture: native-metadata/metadata-key-multiline-directive]
[fixture: native-metadata/metadata-scalar-multiline-directive]
YAML や flowchart、Agentflow の不透明な metadata の整形は当てはまりません。

最初のプロパティが開始行にあるか次行にあるかを保ちます。
[fixture: native-metadata/metadata-first-gap-standalone-directive]
通常のプロパティ、コメント、directive の行は含む文より 1 段深くし、
独立した閉じ波括弧はその文に揃えます。
[fixture: native-metadata/metadata-comma-comment-close]
[fixture: native-metadata/metadata-closer-directive-own-line]
metadata のすべての空行と、コンマか改行かの区切りを保ちます。
キー、コロン、値からなる一つのプロパティ内に改行を挿入しません。
[fixture: native-metadata/metadata-first-gap-standalone-directive]
[fixture: native-metadata/metadata-selected-semicolon-between-properties]
native の検証や宣言と更新の役割を変えず、構造を読みやすくします。

共通コメント領域と改行の処理後、最後のプロパティから `}` までの、
末尾コンマと物理改行の合計は 2 個以下で、コンマは改行の前にだけ置けます。
受理される末尾では、書かれた改行と空行を保ちます。
[corpus fixture: usecase/gram-metadata-property-comma-no-newline]
[corpus fixture: usecase/gram-native-trailing-newline]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-two-newlines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-three-newlines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-four-newlines]
[corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-properties-two-newlines]
[corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines]
[corpus fixture: usecase/gram-edge-metadata-two-newlines]
[corpus fixture: usecase/gram-edge-metadata-three-newlines]
[corpus fixture: usecase/gram-metadata-trailing-comma-no-newline]
[corpus fixture: usecase/gram-native-trailing-comma-newline]
[corpus fixture: usecase/gram-metadata-trailing-comma-two-newlines]
[corpus fixture: usecase/gram-metadata-trailing-comma-three-newlines]
[corpus fixture: usecase/gram-native-trailing-newline-comma]
[corpus fixture: usecase/gram-metadata-tail-newline-before-comma]
[corpus fixture: usecase/gram-metadata-tail-newline-before-comma-newline]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-two-crlf]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-three-crlf]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-two-whitespace-lines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-whitespace-lines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-two-tab-lines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-tab-lines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-comment-two-newlines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-comment-three-newlines]
プロパティ間のコンマの後は、改行を 0 個以上置けます。
[corpus fixture: usecase/gram-metadata-property-comma-no-newline]
[corpus fixture: usecase/gram-metadata-property-comma-one-newline]
[corpus fixture: usecase/gram-metadata-property-comma-two-newlines]
[corpus fixture: usecase/gram-metadata-property-comma-three-newlines]

[fixture: native-metadata/metadata-inline]
[fixture: native-metadata/metadata-newline]
[fixture: native-metadata/metadata-empty]
[fixture: native-metadata/metadata-duplicate-order]
[fixture: native-metadata/metadata-quote-spelling]
[fixture: native-metadata/metadata-update-order-kept]
[fixture: native-metadata/metadata-boolean-quote-kept]
[fixture: native-metadata/metadata-blank-lines-kept]
[fixture: native-metadata/metadata-target-roles]
[fixture: native-metadata/metadata-newline-separators]
[fixture: native-metadata/metadata-empty-touch]
[fixture: native-metadata/all-targets]
[fixture: native-metadata/empty-multiline]
[fixture: native-metadata/blank-runs-around-trivia]
[fixture: native-metadata/boundary-property-columns]
[fixture: native-metadata/spelling-and-trailing-comma-option]
[fixture: native-metadata/multiline-directive-value-gap]

入力（escape 表記）:
`"usecase-beta\nactor U @{\n type : hollow\n , business : true,\n}"`

出力
([native-metadata/metadata-newline-output.mmd](../tests/fixtures/usecase/native-metadata/metadata-newline-output.mmd)):

```mmd
usecase-beta
  actor U@{
    type: hollow
    , business: true,
  }
```

### JSON tables

[埋め込みデータは検査しない](./compatibility.ja.md#埋め込みデータは検査しない)
を再利用します。
JSON の内容を、以下の一定量の余白の移動を除いて保ちます。
外側の json と id の隙間、および class の接尾辞を整え、
データの前は通常の空白 1 個にします。
`{` は `@` に接し、`json A @ {"a":1}` は `json A @{"a":1}` と印字します。
その間の空白とタブは Db に入らず、
mermaid.js の文書でも `@{` と書いているためです
([`json Payload@{`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/usecase.md#L334))。
`@` と `{` の間にディレクティブがある先頭部分は書かれたまま残します。
[fixture: json-tables/head-padding-dropped]
[fixture: json-tables/empty-head-padding-dropped]
[fixture: json-tables/head-beside-directive-kept]
[fixture: json-tables/json-prefix-id-at-multiline-directive]
入れ子、重複、整数キーの順序、数とエスケープ、コメント風の文字を保ちます。
キーの並べ替えは `propertyOrder` を変える場合があります。
釣り合った不正な内容は指定の不透明な読み、括弧の釣り合いの失敗は拒否のままです。
Db の検査は共有のデータブロックの経路に従います。
効果を渡さない整形 fixture の比較は null とし、
書かれた埋め込み文字列を比較します。
コーパスは、存在する場合に記録済みの効果を使います。
原文の比較では、一定量の移動だけを許します。
条件は[データブロック](./flowchart.ja.md#データブロック)に従います。

`{` の直後が改行なら、本文の全行を同じ数の半角空白だけ動かし、
文字がある最も浅い行を JSON 文の 1 段内側に置きます。
入れ子のオブジェクトを含め、行どうしの字下げの差を保ちます。
単独行の `}` は文の段に揃え、本文の後の閉じ括弧はその行に残します。
JSON の文字列には生の改行を入れられず、
Mermaid が `Bad control character in string literal` として拒否するため、
移動で文字列の内容は変わりません。 [fixture: json-tables/closing-deeper-kept]
[fixture: json-tables/closing-equal-depth]
[fixture: json-tables/zero-and-shallow] [fixture: json-tables/deep-nested-json]
[fixture: json-tables/closing-after-text]

共有の移動条件と理由は、
[データブロック](./flowchart.ja.md#データブロック)に従います。
特に、開きの行から始まる JSON、内部の directive、行全体を保つ行、行頭のタブ、
`tabWidth: 0` は書かれたまま残し、
`useTabs` のときは JSON を持つ文全体を書かれたまま残します。
外側のコメント、directive、空行、空の説明ブロックはそれぞれの規則に従います。
CR と LF は `endOfLine` に従い、
文字列の Unicode separator は文字として保ちます。
[fixture: json-tables/inline-opening-kept]
[fixture: json-tables/directive-inside-kept]
[fixture: json-tables/kept-body-line] [fixture: json-tables/zero-width-kept]
[fixture: json-tables/tab-statement-space-body]
[fixture: json-tables/surrounding-trivia]
[test: data blocks: JSON leading tab kept] [test: data blocks: usecase U+2029]
[test: data blocks: usecase CRLF]

1 行の JSON table は、`@` と `{` の間の空白を除いて、書かれたままにします。
`{` と `}` は JSON 自身の括弧であり、
mermaid.js が括弧を付けて読むブロックの両端ではないので、
[データブロック](./flowchart.ja.md#データブロック)の空白 1
つの整形は適用しません。 [fixture: json-tables/one-line-kept]

[fixture: json-tables/json-opaque]
[corpus fixture: usecase/gram-json-prefix-id-control]
[fixture: json-tables/json-invalid-opaque]
[fixture: json-tables/json-order-kept]
[fixture: json-tables/json-directive-opaque]
[fixture: json-tables/numbers-escapes-and-comment-text]

入力（escape 表記）:
`"usecase-beta\njson  Table  @ {\n \"2\": 2, \"1\": {\"z\":1}, \"2\": 3\n} ::: data , table"`

出力
([json-tables/json-opaque-output.mmd](../tests/fixtures/usecase/json-tables/json-opaque-output.mmd)):

```mmd
usecase-beta
  json Table @{
    "2": 2, "1": {"z":1}, "2": 3
  }:::data,table
```

### Semicolons at the end of a style statement

`classDef` または `style` 文の行末の `;` は、
[mermaid.js の行の規則](../../spec/docs/common.ja.md#style-行と-classdef-行)
が無視するときに削除します。
`:` と後の `#` の間に空白がない形です。
この終端を削除しても Db は変わらず、スタイルが複数でも同じです。
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]
削除する `;` の直前の空白も一緒に削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/space-before-terminator]
その行は、スタイルの空白を含め、その `;` がない行として整形します。
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]
文の前後の空行とコメント行は、通常の配置に従います。
[fixture: semicolons-at-the-end-of-a-style-statement/blank-and-comment-lines]
空の description block も通常の配置に従い、スタイルの終端は削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/empty-description-block]

同じ行でセミコロンの後にディレクティブが続く場合は、`;` を保ちます。
[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]
同じ行で `%%` のテキストが続く場合も保ちます。
ここではスタイルの文字列の一部です。
[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]
閉じていないディレクティブの後の `;` は、その停止位置を保つために残します。
[fixture: semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept]
U+2028 と U+2029 の前も同じように保護します。
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照してください。
[test: style semicolons: usecase before U+2028]
[test: style semicolons: usecase before U+2029]
文と無視される終端の間にある閉じたディレクティブは残し、`;` は削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

出力
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/usecase/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
usecase-beta
  A
  classDef c fill: #f00
  style A fill: #f00
  classDef d fill: #0f0, stroke: #00f
  style A fill: #0f0, stroke: #00f
```

### Classes and styles

ER の[スタイルとクラス](./er.ja.md#スタイルとクラス)を再利用し、
対象名と class 名の間のコンマは詰め、
一覧同士と最初の宣言の前は空白 1 個にします。
CSS 宣言同士はコンマと空白で区切ります。
宣言の最初のコロンの前には空白を置かず、後ろには空白を 1 つ置きます。
ほかの図種と同じです。
（[同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)）。
Mermaid はコロンの前後の余白を保存するため Db は変わりますが、
描かれる図は同じです。
`stroke` で終わる名前は例外です。
`classDef` や `style` は明示的な id がある関係に届き、
mermaid.js は `stroke:` だけでその矢印の先端を着色するため、
そのような名前はコロンの前に空白があるかないかを保ち、
連続する空白を 1 つにします。
宣言の名前の始まりから最後の値の成分までのテキストは、
それ以外は書かれたままです。
ダッシュの隙間の directive、引用またはエスケープしたコンマ、空文字の成分、関数、
順序、繰り返しを保ちます。
ただし、ほかの図種と同じく、
語と語の間の空白とタブの連続は空白 1 つで印字します。
（[同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)）。
`style A --  color:red` は `style A -- color: red` と印字し、
`translate(1  2)` は `translate(1 2)` と印字します。
文字列、コメント、`url(` の括弧の中の連続と、
バックスラッシュの後ろのエスケープは、書かれたまま残します。
[fixture: classes-and-styles/css-name-multiline-directive]
最後の成分の後ろの外側の水平空白だけが消えることがあります。
保持するセミコロンを含む接頭部、文中のコメントや directive、
複数行にわたる宣言は、通常の一覧の配置より優先します。

[fixture: classes-and-styles/class-lists]
[fixture: classes-and-styles/css-colon-padding]
[fixture: classes-and-styles/css-post-colon-run-collapsed]
[fixture: classes-and-styles/css-stroke-before-colon-kept]
[fixture: classes-and-styles/css-stroke-before-colon-run-collapsed]
[fixture: classes-and-styles/css-stroke-before-colon-touching]
[fixture: classes-and-styles/css-custom-gap-run-collapsed]
[fixture: classes-and-styles/css-custom-gap-touching-run-collapsed]
[fixture: classes-and-styles/css-words-run-spaced]
[fixture: classes-and-styles/css-string-runs-kept]
[fixture: classes-and-styles/css-url-runs-kept]
[fixture: classes-and-styles/css-value-internal]
[corpus fixture: usecase/gram-css-empty-string-component]
[fixture: classes-and-styles/css-gap-directive]
[fixture: classes-and-styles/css-semicolon-gap]
[corpus fixture: usecase/lex-style-hash-semicolon]
[fixture: classes-and-styles/css-pre-colon-whitespace-dropped]
[fixture: classes-and-styles/css-classdef-gap]
[fixture: classes-and-styles/css-line-rule-colon-gap-kept]
[fixture: classes-and-styles/css-both-passes]
[test: usecase: css-other-case-segment]
[fixture: classes-and-styles/declaration-order-and-repetition]
[fixture: classes-and-styles/css-functions]
[fixture: classes-and-styles/css-inline-percent]
[fixture: classes-and-styles/trailing-after-comma]

入力（escape 表記）:
`"usecase-beta\nA\nstyle  A   fill   :  red   ,  stroke-width : 2px  "`

出力
([classes-and-styles/css-colon-padding-output.mmd](../tests/fixtures/usecase/classes-and-styles/css-colon-padding-output.mmd)):

```mmd
usecase-beta
  A
  style A fill: red, stroke-width: 2px
```

### Notes

`note for <target> <label>` の各部分の間を通常の空白 1 個にします。
対象、書かれた裸、通常引用、markdown、空のラベル、および note の順序を保ちます。
class の[トークンの間の空白](./class.ja.md#トークンの間の空白)と同じ、
値の原文と読みやすいキーワード間隔を保つ理由です。
前方参照の解決で id、位置、宣言を作りません。
行内のパーセント文字はラベルの内容のままです。

[fixture: notes/notes-forms] [fixture: notes/notes-forward]
[fixture: notes/notes-empty-markdown] [fixture: notes/empty-and-markdown-order]

入力（escape 表記）:
`"usecase-beta\nA\nnote  for  A'quoted note'\nnote for A bare  note %% literal"`

出力
([notes/notes-forms-output.mmd](../tests/fixtures/usecase/notes/notes-forms-output.mmd)):

```mmd
usecase-beta
  A
  note for A "quoted note"
  note for A bare  note %% literal
```

### Direction and accessibility

方向は `direction <書かれた値>` とし、TD と全出現を保ちます。
最終的な方向から文を作り直しません。
class の[ラベル](./class.ja.md#ラベル)と C4
の[アクセシビリティの行](./c4.ja.md#アクセシビリティの行)を再利用し、
コロンをキーワードに接し、両端の空白を除いた値の前を空白 1 個にします。
Db が同じになる外側の空白を、兄弟の図種と同じ形に揃えるためです。
内部の文字と空白、コメント、directive、パーセントとセミコロンを保ちます。
空と空白だけの行は、値のないコロン形式にします。
次の物理行は別の文のままで、兄弟の次行の結合は取り込みません。
空のコロン行の次の方向の文字も、値の文字ではなく独立した方向文のままです。
[fixture: direction-and-accessibility/title-next-direction-separate]
[fixture: direction-and-accessibility/description-next-direction-separate]
[fixture: direction-and-accessibility/a11y-trimmed]
[test: usecase: a11y-unicode-exterior]

説明ブロックは、class の[複数行の値](./class.ja.md#複数行の値)と同じく、
本文行を文より 1 段深くし、独立した `}` を文の字下げに揃えます。
コメント行だけが入ったブロックも同じ配置です。
Mermaid が説明から LF 後の字下げを除くためです。
`accTitle` か `accDescr` の値の最後にある directive は、
タイトルの最後にある directive と同じに印字します。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
`accTitle: Column zero  %%{x}%%  ` も `accTitle: Column zero  %%{x}%%` も、
`accTitle: Column zero %%{x}%%` と印字します。
[fixture: direction-and-accessibility/acctitle-trailing-directive-blanks-dropped]
`accDescr` と `{` の間は、元が接していても空白 1 個にします。
keyword と本文の開始を見分けやすくするためです。
1 行のブロックの文字は、括弧に接して書かれていても、
両側に空白を 1 つずつ置きます（`{ a }`）。
[fixture: direction-and-accessibility/keyword-brace-touching]
[fixture: direction-and-accessibility/keyword-brace-space]
[fixture: direction-and-accessibility/keyword-brace-run]
[test: accessibility revisions: usecase keyword-brace-tab]
空と空白だけの内部は`{}`にします。
書かれた原文を保つ共有コメント領域とセミコロンの規則は、そのまま優先します。
usecase の字下げは構造の表示なので、幅 0 とタブにも同じ配置を使います。
[fixture: direction-and-accessibility/a11y-closer-aligned]
[fixture: direction-and-accessibility/a11y-closer-tabs]
[fixture: direction-and-accessibility/a11y-closer-zero]
[fixture: direction-and-accessibility/a11y-directive-padding]

[fixture: direction-and-accessibility/a11y-comment-empty-tabs]

[fixture: direction-and-accessibility/direction-values]
[fixture: direction-and-accessibility/a11y-padding]
[fixture: direction-and-accessibility/a11y-empty-distinct]
[fixture: direction-and-accessibility/a11y-block-value]
[fixture: direction-and-accessibility/a11y-trimmed]
[fixture: direction-and-accessibility/a11y-next-line-is-node]
[fixture: direction-and-accessibility/a11y-comment-empty]
[fixture: direction-and-accessibility/a11y-closer-aligned]
[fixture: direction-and-accessibility/all-directions]
[fixture: direction-and-accessibility/literal-directives-semicolons]
[fixture: direction-and-accessibility/empty-block-lines]

入力（escape 表記）:
`"usecase-beta\ndirection  TD\nA\ndirection\tBT\ndirection RL"`

出力
([direction-and-accessibility/direction-values-output.mmd](../tests/fixtures/usecase/direction-and-accessibility/direction-values-output.mmd)):

```mmd
usecase-beta
  direction TD
  A
  direction BT
  direction RL
```

入力（escape 表記）: `"usecase-beta\naccDescr{ a }\nA[Keyword gap]"`。

出力
([direction-and-accessibility/keyword-brace-touching-output.mmd](../tests/fixtures/usecase/direction-and-accessibility/keyword-brace-touching-output.mmd)):

```mmd
usecase-beta
  accDescr { a }
  A[Keyword gap]
```

### Blank lines

class の[空行](./class.ja.md#空行)を再利用し、通常の空行の連続を 1 行にし、
図と境界の本文の両端の空行を除きます。
1 行でまとまりを区切れ、それ以上は意味を加えないためです。
ASCII 空白とタブだけの行も通常の空行です。
裸の native コメントの後や、独立した directive の前後も同じです。
値、native metadata、JSON、directive、保護された共通領域の結合は、
それぞれの空行を保ちます。
C4 の復帰用の隙間や Ishikawa の空行の対の規則は取り込みません。

[fixture: blank-lines/blank-runs] [fixture: blank-lines/blank-boundary]
[fixture: blank-lines/blank-comments] [fixture: blank-lines/blank-in-value]
[fixture: blank-lines/directives-and-boundary-edges]

入力（escape 表記）:
`"usecase-beta\nsystemBoundary Box\n\nactor U\n\n\nA\n\nend"`

出力
([blank-lines/blank-boundary-output.mmd](../tests/fixtures/usecase/blank-lines/blank-boundary-output.mmd)):

```mmd
usecase-beta
  systemBoundary Box
    actor U

    A
  end
```

### Comments

[コメント](./class.ja.md#コメント)を再利用します。
周囲の文、境界の `end` の前では宣言に揃え、ヘッダー前では先頭列に置きます。
末尾の水平空白を含むコメント全体を保ちます。
[fixture: system-boundaries/boundary-header-comment-empty]
[test: usecase: terminal-comment-tab]
native コメントは、物理行の前方が ASCII 水平空白だけの位置で始まり、
LS と PS を越えて LF または EOF まで続きます。
裸のパーセント対と directive ではない波括弧形式もコメントです。
native の文末コメントはなく、許される行内のパーセント文字は、ラベル、note、CSS、
accessibility の内容のままです。
共通のコメント領域はすべての文脈で先に適用されます。
隠れた後続部分、結合、継続列を保ち、
文字を露出させたり値に字下げを加えたりしません。
Agentflow のサイズによる分岐は適用しません。

[fixture: comments/comments-align] [fixture: comments/comments-bare]
[fixture: comments/comments-inline-label] [test: usecase: comment-region-join]
[corpus fixture: usecase/div-comment-preheader-bare]
[fixture: comments/div-preheader-braces]
[fixture: comments/inline-note-css-accessibility]
[fixture: comments/common-region-inside-values]

入力（escape 表記）: `"usecase-beta\n%%\n%%{}%%\nA"`

出力
([comments/comments-bare-output.mmd](../tests/fixtures/usecase/comments/comments-bare-output.mmd)):

```mmd
usecase-beta
  %%
  %%{}%%
  A
```

### Directives

共有の[ディレクティブ](./class.ja.md#ディレクティブ)を再利用します。
除去は区切りを補いません。
内容、順序、複数行の列を保ち、独立した directive は揃えます。
同じ印字行の中のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
[fixture: system-boundaries/boundary-id-title-directed-gap]
[fixture: arrows/semantic-operator-directives]
[fixture: arrow-id-boundaries/arrow-marker-both-gap-sides]
ヘッダー行の directive はヘッダーと同じ行に残します。
値側の隙間、CSS の名前と値の範囲、不透明な JSON は、
[JSON tables](#json-tables) の余白を除いて正確に保ちます。
独立した JSON の id、`@`、波括弧の境界も含みます。
[fixture: classes-and-styles/css-name-multiline-directive]
[fixture: json-tables/json-prefix-id-at-multiline-directive]
native の `@{`、引用のない語、矢印は原子的な単位のままです。
EOF まで続く directive の末尾と、止めるセミコロンの位置を保ちます。
native の引用キーと値は directive の断片を含められます。
[fixture: native-metadata/metadata-key-multiline-directive]
[fixture: native-metadata/metadata-scalar-multiline-directive]

[fixture: directives/directives-align]
[fixture: directives/directives-ordinary-gap]
[fixture: directives/directives-touch]
[fixture: directives/directives-value-gap]
[fixture: directives/directives-multiline]
[fixture: directives/directives-json-prefix]
[corpus fixture: usecase/directive-after-header]
[fixture: directives/directives-open-eof]
[fixture: directives/directives-native-key-quoted]
[fixture: directives/directives-css-value]
[fixture: directives/directives-gap-prefix-o]
[fixture: directives/directives-header-spaced]
[fixture: directives/header-at-eof] [fixture: directives/before-boundary-end]
[fixture: directives/open-word-stop]

入力（escape 表記）: `"usecase-beta\nactor  %%{init: {}}%%  User"`

出力
([directives/directives-ordinary-gap-output.mmd](../tests/fixtures/usecase/directives/directives-ordinary-gap-output.mmd)):

```mmd
usecase-beta
  actor %%{init: {}}%%User
```

### Multiline values and order

C4 の[複数行の値](./c4.ja.md#複数行の値)と、
flowchart の[折り返し](./flowchart.ja.md#折り返し)を再利用します。
書かれた行と列は文字であり、`printWidth` で長い文を折り返しません。
markdown、JSON、directive、共通領域の継続を保ちます。
通常の文字列と stereotype に物理改行を足しません。
usecase は行指向なので、構造としての改行は関係を拒否させることがあります。
`A-->` の次の行に `B` を置いた入力は拒否され、
`LongSource-->LongTarget` を小さな `printWidth` で折り返すと、
受理される入力が拒否される入力になります。
markdown 文字列、JSON、説明ブロックは、値の文字として実際の改行を持てます。
説明本文の列は [Direction and accessibility](#direction-and-accessibility)
に従います。
native metadata の構造は専用の規則に従います。
[fixture: native-metadata/metadata-key-multiline-directive]
[fixture: native-metadata/metadata-scalar-multiline-directive]
互換な宣言、境界、関係、note、class の定義と割り当て、更新は、
短く書いて Db が等しい場合も原文の順序と繰り返しを保ちます。
物理行の文の結合や、解決後のモデルの出力はしません。

[fixture: multiline-values-and-order/no-wrap]
[fixture: multiline-values-and-order/multiline-markdown]
[fixture: multiline-values-and-order/repeated-order]
[fixture: multiline-values-and-order/wrap-arrow-kept]
[fixture: multiline-values-and-order/repeated-notes-and-updates]

入力（escape 表記）:
`"usecase-beta\nVeryLongSourceIdentifier-- a deliberately long label -->VeryLongTargetIdentifier"`

出力
([multiline-values-and-order/no-wrap-output.mmd](../tests/fixtures/usecase/multiline-values-and-order/no-wrap-output.mmd)):

```mmd
usecase-beta
  VeryLongSourceIdentifier -- a deliberately long label --> VeryLongTargetIdentifier
```

### Trailing whitespace

[末尾空白](./c4.ja.md#末尾空白)を再利用します。
完了した構造と CSS の最後の成分の後の、無害な ASCII 空白とタブを除きます。
CSS 宣言のコロンの前後の余白は、
[Classes and styles](#classes-and-styles) に従います。
accessibility 行と stereotype の両端の空白は、兄弟の規則に従って整えます。
[fixture: stereotypes/side-padding]
引用と markdown の値、JSON、native プロパティの文字列、コメント、
directive 内の末尾の全文字は保ちます。 [test: usecase: terminal-comment-tab]
[test: usecase: terminal-a11y-tab]
Unicode 文字を自動的に外側の水平空白とせず、空の CSS style も作りません。

[fixture: trailing-whitespace/trailing-exterior]
[fixture: trailing-whitespace/trailing-values]
[fixture: trailing-whitespace/trailing-global-trim-kept]
[fixture: trailing-whitespace/opaque-and-metadata-lines]

入力（escape 表記）:
`"usecase-beta  \nactor U \t\nA-->B  \nA@{ }\t\nstyle A fill:red \t"`

出力
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/usecase/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
usecase-beta
  actor U
  A --> B
  A@{ }
  style A fill: red
```

### Line terminators

共有の[行末](./compatibility.ja.md#行末)を再利用します。
Mermaid は読む前に物理的な CR と CRLF を LF にし、
出力は `endOfLine` に従います。
metadata、JSON、markdown、accessibility、CSS、directive の内部も同じです。
LS と PS は文脈に従う文字として、ラベル、stereotype の本文、note、
native と CSS の引用値、accessibility、コメントに保ちます。
accessibility と stereotype の外側の空白は、それぞれの規則に従って整えます。
[test: usecase: a11y-unicode-exterior]
[test: usecase: stereotype-unicode-exterior-padding]
JSON では文字列内または構造内の不透明な内容のままです。
native コメントはそれらを越えて LF まで続き、
文字列のセミコロン区間は Unicode の境界を保ちます。
id、隙間、プロパティ、CSS の拒否位置を修復しません。
ヘッダー前の共通 trivia だけが広い空白集合を使います。
ファイル先頭の BOM と frontmatter の共有の制限も同じです。
これらの文字は、パッケージのファイルに直接書かず、テストでエスケープします。
例えば `"usecase-beta\rA\rA-->B\r"` は、
`"usecase-beta\n  A\n  A --> B\n"` になります。

[test: usecase: eol-cr] [test: usecase: eol-crlf] [test: usecase: eol-output-cr]
[test: usecase: eol-output-crlf] [test: usecase: unicode-labels]
[test: usecase: unicode-stereotype] [test: usecase: unicode-native-metadata]
[test: usecase: unicode-json-string] [test: usecase: unicode-a11y]
[test: usecase: unicode-comment] [test: usecase: unicode-comment-to-lf-kept]
[test: usecase: unicode-metadata-separator-opaque] [test: usecase: bom-leading]
[test: usecase: unicode-note] [test: usecase: eol-cr-all-modes]
[test: usecase: unicode-css-string]
[test: usecase: unicode-joined-native-metadata]
[test: usecase: unicode-semicolon-segments]
[test: usecase: crlf-metadata-blank-lines] [test: usecase: nbsp-css-string]
[test: usecase: unicode-boundary-title] [test: usecase: crlf-output-values]

### Frontmatter YAML

[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を再利用します。
安全な設定は YAML 整形で読みやすくし、不正な本文、字下げした区切り、
原文または整形後の YAML の HTML タグ開始、
整形で現れる終了区切りは読みを保ちます。
区切りと終了行の余白、ヘッダー前のコメントと directive を保ちます。
frontmatter のタイトルは accessibility 文ではなく、
この版の usecase は共通のタイトルを消去します。
`tabWidth: 0` でも YAML は共有の正の最小幅、本文は 0 のままです。
frontmatter をまたぐ HTML は本文だけを見る指定の読みに従い、
元の Mermaid に合わせるための本文の引用の書き換えはしません。

[fixture: frontmatter-yaml/frontmatter-safe]
[corpus fixture: usecase/div-frontmatter-malformed]
[fixture: frontmatter-yaml/frontmatter-indented]
[fixture: frontmatter-yaml/frontmatter-html-guard]
[fixture: frontmatter-yaml/frontmatter-delimiter-guard]
[fixture: frontmatter-yaml/frontmatter-zero]
[fixture: frontmatter-yaml/frontmatter-zero-scalar]
[corpus fixture: usecase/div-html-frontmatter-acc-title-db]
[fixture: frontmatter-yaml/closing-padding-and-trivia]
[fixture: frontmatter-yaml/body-only-html-reading]
[fixture: frontmatter-yaml/malformed-title]
[fixture: frontmatter-yaml/ineffective-title-types]

入力（escape 表記）:
`"---\ntitle:   T\nconfig: {usecase: {useMaxWidth:  true}}\n---\nusecase-beta\nA"`

出力
([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/usecase/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: T
config: { usecase: { useMaxWidth: true } }
---
usecase-beta
  A
```

### Final newline

共有の[末尾の改行](./c4.ja.md#末尾の改行)を再利用し、
通常の受理入力は設定された改行 1 個で終えます。
ヘッダーだけ、裸のコメント、空の accessibility 行も同じです。
各規則が残す値の余白を改行の前に保ち、accessibility 行の外側の空白は、
その規則に従って除きます。
EOF まで続く directive の値に文字を加えません。
[test: usecase: terminal-comment-tab] [test: usecase: terminal-a11y-tab]
directive の外側の末尾空白は共有の範囲の規則に従います。
拒否された構文を末尾の追加で受理させることはしません。

[fixture: final-newline/final-ordinary]
[fixture: final-newline/final-bare-comment]
[fixture: final-newline/final-value-padding]
[fixture: final-newline/final-open-directive]
[fixture: final-newline/empty-title-and-bare-comment]
[fixture: final-newline/directive-exterior-whitespace]
[corpus fixture: usecase/db-acctitle-eof]

入力（escape 表記）: `"usecase-beta\nA\n\n\n"`

出力
([final-newline/final-ordinary-output.mmd](../tests/fixtures/usecase/final-newline/final-ordinary-output.mmd)):

```mmd
usecase-beta
  A
```

### Markdown fences

共有の
[Markdown のコードブロック](./compatibility.ja.md#markdown-のコードブロック)
を再利用します。
字下げを除いた本文に同じ規則を適用し、ホストが fence、リスト、
引用の字下げを補います。
固定したホストのテストは stereotype の接尾辞、native metadata、JSON、
複数行の値、directive、幅 0、タブ、空のヘッダー、拒否された本文を扱います。
[test: usecase Markdown: stereotype-suffixes]
accessibility 行の外側の空白は、単独ファイルと Markdown の両方で除きます。
例えば `accTitle:  Title  ` は、どちらでも `accTitle: Title` になります。
拒否した fence には、ホストの空白と改行の処理だけを適用します。

[fixture: markdown-fences/markdown-top-payload]
[fixture: markdown-fences/markdown-list-payload]
[test: usecase Markdown: top-level] [test: usecase Markdown: list]
[test: usecase Markdown: block-quote] [test: usecase Markdown: zero-metadata]
[test: usecase Markdown: tabs-boundary] [test: usecase Markdown: json]
[test: usecase Markdown: multiline-value] [test: usecase Markdown: directives]
[test: usecase Markdown: last-value-padding]
[test: usecase Markdown: rejected-payload]
[test: usecase Markdown: empty-header]

入力（escape 表記）: `"usecase-beta\nactor U\nU-->A"`

出力
([markdown-fences/markdown-top-payload-output.mmd](../tests/fixtures/usecase/markdown-fences/markdown-top-payload-output.mmd)):

```mmd
usecase-beta
  actor U
  U --> A
```
