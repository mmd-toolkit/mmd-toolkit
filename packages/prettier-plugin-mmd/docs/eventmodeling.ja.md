# Eventmodeling formatting

English version: [eventmodeling.md](./eventmodeling.md)

`eventmodeling` の整形規則です。
[構文](../../spec/docs/diagrams/eventmodeling.ja.md)、
[木](../../spec/docs/ast/eventmodeling.ja.md)、
共有の[互換性の制限](./compatibility.ja.md) に従います。

共有生成処理とブロック・印字単位・隠れた形の隙間経路を使います。
GWT は閉じ記号を作らず、範囲で終わる子の本文を 2 つ使います。
共通終端トークンとデータの字句境界によって、
印字前に行と字下げの計画が制約されます。

## Rules

### Header

`eventmodeling` は第 1 列に置き、普通の最初の文を次の行へ移して、
見出しを見つけやすくします。
文が置かれる位置（行頭）は規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[wardley](./wardley.ja.md#見出し)、[cynefin](./cynefin.ja.md#header)、
[architecture](./architecture.ja.md#header)、[packet](./packet.ja.md#header)も、
見出しを第 1 列に置き、普通の最初の文を次の行に置きます。
隠れた形、保持する前置部分、保護行は共有の規則に従い、
見出しの行が保つ行なら最初の文もその行に残します。
同じ項目を図種の間で同じように扱うためです。
最初の共通文は接続を保ちます。
行頭へ移すと識別子が優先され、拒否される場合があるためです。
対象にする版の mermaid.js のすべてが、`eventmodeling title Heading`、
`eventmodeling accTitle: Heading`、
`eventmodeling accDescr: Description` の文を次の行に移した形を拒否します。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
その前置の空白も書かれたままにします。
詳しくは [Common boundaries](#common-boundaries) を参照してください。

[fixture: eventmodeling/header/ordinary-frame]

[fixture: eventmodeling/hidden-forms/body-hidden-yaml-no-visible-eol-needed]

[fixture: eventmodeling/header/ordinary-frame-with-native-directive]

[fixture: eventmodeling/semicolons/semicolon-inside-inline-data-protected]

[fixture: eventmodeling/header/empty-header]

[fixture: eventmodeling/header/first-title-preserved]

[fixture: eventmodeling/header/title-on-header-line-kept]

[fixture: eventmodeling/header/acctitle-on-header-line-kept]

[fixture: eventmodeling/header/accdescr-on-header-line-kept]

[fixture: eventmodeling/header/header-percent]

[fixture: eventmodeling/header/header-slash-boundary]

入力（エスケープ表記）: `"  eventmodeling tf 01 evt Alpha"`

出力
([header/ordinary-frame-output.mmd](../tests/fixtures/eventmodeling/header/ordinary-frame-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
```

入力（エスケープ表記）: `"eventmodeling tf 01 evt A %%{{x}}%%\n"`

出力
([header/ordinary-frame-with-native-directive-output.mmd](../tests/fixtures/eventmodeling/header/ordinary-frame-with-native-directive-output.mmd)):

```mmd
eventmodeling tf 01 evt A %%{{x}}%%
```

### Indentation

普通のトップレベルの文は、第 1 列から始めます。
フレーム、モデルの実体、`data`、`note`、`gwt` が対象です。
行頭は規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
規則 2 は、ヘッダーの後の文を 1 段深く置きます。
[flowchart](./flowchart.ja.md#字下げ)、[class](./class.ja.md#字下げ)、
[er](./er.ja.md#字下げ)、[state](./state.ja.md#字下げ) がそう置きます。
したがって、第 1 列に置くフレーム、モデルの実体、`gwt` の文、
`data` と `note` の見出しは、規則 2 に反して印字していて、
規則で直されるのを待ちます。
改行の後の `title` とブロックの `}` は、対象にする版の mermaid.js のすべてが、
字下げした形を拒否するので、この図種ではより深く置けません。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。

固定している Mermaid は `data` と `note`
の閉じ波括弧の前の空白を受理しないため、見出しを閉じ波括弧にそろえ、
同じ階層の文も字下げせず、存在しない親子関係を示さないようにします。
固定している Mermaid が閉じ波括弧の前の空白を受理するようになったら、
本文の変換前の値と描画が変わらないことを確かめた上で、
トップレベルの字下げを再検討します。

GWT 節は設定の 1 段、項目は 2 段にします。
行頭は規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[sequence](./sequence.ja.md#字下げ)と [state](./state.ja.md#字下げ)は、
ブロックの文を、それを開く行より 1 段深く置きます。
[flowchart](./flowchart.ja.md#字下げ)も、
subgraph の中の subgraph を同じように置きます。
節は `gwt` より 1 段深く、項目は節より 1 段深くします。
`data` と `note` の見出しが完結する行も含め、
通常の構造の継続行はその文より 1 段深くします。
[Long lines](#long-lines) と同じです。
安全に字下げできるブロック本文は、
その継続した見出し行からさらに 1 段深くします（[データブロック](#data-blocks)
を参照）。
列は親子を決めないため、`tabWidth: 0` では空白を足しません。
`useTabs` では幅が 0 でも 1 段にタブを 1 個使います。
1 段の幅は、Prettier の `tabWidth` と `useTabs` のとおりです。
[flowchart](./flowchart.ja.md#字下げ)、[sequence](./sequence.ja.md#字下げ)、
[state](./state.ja.md#字下げ)、[class](./class.ja.md#字下げ)、
[er](./er.ja.md#字下げ)は、
1 段の幅を Prettier の `tabWidth` と `useTabs` から取ります。
[wardley](./wardley.ja.md#字下げ)と [radar](./radar.ja.md#indentation)は、
列にも意味がないので、`tabWidth: 0` では空白を置かず、
`useTabs` では 1 段にタブを 1 個置きます。
Prettier が JavaScript に行うのと同じです。
値の継続列、メタデータの空白、隠れた形が消費する LF の境界は、
[データブロック](#data-blocks) の本文の余白の変更を除いて保ちます。
`eventmodeling tf 01 evt Alpha.%%{{native}}%%` と改行の後の `title` は、
第 1 列に残します。
対象にする版の mermaid.js のすべてが、
2 つの空白で字下げした形を拒否するためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。

[fixture: eventmodeling/data-blocks/block-closer-indent-unsafe]
[fixture: eventmodeling/qualified-names/hidden-before-title-segment-keep-no-prefix-space]

[fixture: eventmodeling/indentation/mixed-top-level-blocks]

[fixture: eventmodeling/indentation/gwt-four-spaces]

[fixture: eventmodeling/indentation/body-four-spaces]

[fixture: eventmodeling/indentation/body-tabs]

[fixture: eventmodeling/indentation/zero-width]

[fixture: eventmodeling/indentation/ordinary-continuation]

[fixture: eventmodeling/indentation/zero-width-tabs]

[fixture: eventmodeling/indentation/data-declaration-column-one]

[fixture: eventmodeling/indentation/data-declaration-four-spaces]

[fixture: eventmodeling/indentation/data-declaration-tabs]

[fixture: eventmodeling/indentation/note-column-one]

[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

入力（エスケープ表記）: `"eventmodeling\ntf 01 evt Alpha\nrf 02 cmd Beta"`

出力
([indentation/body-four-spaces-output.mmd](../tests/fixtures/eventmodeling/indentation/body-four-spaces-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
rf 02 cmd Beta
```

出力
([indentation/data-declaration-column-one-output.mmd](../tests/fixtures/eventmodeling/indentation/data-declaration-column-one-output.mmd)):

```mmd
eventmodeling
data AddItem01 {
  sku: 'SHIRT-M'
  quantity: 2
}
```

出力
([indentation/note-column-one-output.mmd](../tests/fixtures/eventmodeling/indentation/note-column-one-output.mmd)):

```mmd
eventmodeling
note 01 {
  explanation
}
```

### Statements one per line

普通の最上位 AST 文は原順の各行へ分け、セミコロンは足しません。
文が置かれる位置（行頭）は規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[er](./er.ja.md#1-行に-1-文)、[gantt](./gantt.ja.md#1-行に-1-文)、
[journey](./journey.ja.md#1-行に-1-文)も、各文を自分の行に印字します。
ほかの規則が書かれたまま残す所は別です。
共通の後続文と、後続の文字を取り込む行内データは、下で述べます。
隠れた形か `;` を含む行は、
[Hidden forms](#hidden-forms) と [Semicolons](#semicolons) を参照してください。
完全な単位の間に可視の EOL を要しない文法なので、Db は変わりません。
次が共通文なら先行単位との接続を保ちます。
`eventmodeling accDescr {}  title Next` は 1 行のまま残します。
対象にする版の mermaid.js のすべてが、
`title Next` を自分の行にした形を拒否するためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
後続の文字を取り込む行内データの中の見かけの文は、その値の一部のままです。
閉じた説明ブロックの後の普通の文は、新しい行へ分けます。
`eventmodeling tf 01 evt Alpha {x} tf 02 evt Beta {y}` の `tf 02 evt Beta {y}`
は、値の中に残します。
対象にする版の mermaid.js のすべてが、
それを自分の行にすると違う図を描くためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。

[fixture: eventmodeling/statements-one-per-line/adjacent-frame-reset-entity]
[fixture: eventmodeling/statements-one-per-line/description-followed-by-common]
[fixture: eventmodeling/statements-one-per-line/do-not-manufacture-statement-from-greedy-data]

[fixture: eventmodeling/statements-one-per-line/frame-metadata-adjacency]

[fixture: eventmodeling/statements-one-per-line/metadata-split-unsafe]

[fixture: eventmodeling/statements-one-per-line/description-followed-by-frame]

[fixture: eventmodeling/statements-one-per-line/description-followed-by-common]

[fixture: eventmodeling/statements-one-per-line/do-not-manufacture-statement-from-greedy-data]

入力（エスケープ表記）:
`"eventmodeling tf 01 evt Alpha rf 02 cmd Beta entity Shop.Beta"`

出力
([statements-one-per-line/adjacent-frame-reset-entity-output.mmd](../tests/fixtures/eventmodeling/statements-one-per-line/adjacent-frame-reset-entity-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
rf 02 cmd Beta
entity Shop.Beta
```

### Frame components

フレームキーワード、数字の名前、実体の種類、修飾名の間は、
元が図固有の空白の改行でも普通の空白 1 個にします。
`01 evt` のように完全な部品を見分けるためです。
部品の間の空白の連なりや改行は、
[Declarations and notes](#declarations-and-notes) で述べる理由で空白 1
個にします。
必須の識別子がちょうど `title` のときは成立する境界を保ちます。
普通の LF は継続行にし、隠れた形が消費する LF の後の空白は原文どおりです。
前置の空白を加えると、必要な名前が `EM_TITLE` になる場合があります。

[fixture: eventmodeling/frame-components/time-parts-glued-number-type]

[fixture: eventmodeling/frame-components/reset-all-parts]

[fixture: eventmodeling/frame-components/long-time-and-type]

[fixture: eventmodeling/frame-components/name-title-lf-protected]

[fixture: eventmodeling/frame-components/acc-identifiers-without-delimiters]

[fixture: eventmodeling/frame-components/hidden-before-required-title-identifier-keep-zero-indentation]

[test: eventmodeling/frame-components/required-title-unicode-gap]

[corpus fixture: eventmodeling/lex-name-title-after-lf]

入力（エスケープ表記）: `"eventmodeling tf 01evt Alpha"`

出力
([frame-components/time-parts-glued-number-type-output.mmd](../tests/fixtures/eventmodeling/frame-components/time-parts-glued-number-type-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
```

### Source references

完全な参照元を結ぶ矢印は `Name ->> 02 ->> 001` のように、
矢印の左右を普通の空白 1 個にします。
規則 1 が与える形です。
`->>` は 2 つの物の間に立ち、Prettier は `x = a+b;` を、
印の両側に空白 1 個を置いて `x = a + b;` と印字します。
規則 1 の表が、flowchart の `A-->B` を `A --> B` と印字するのと同じです。
全参照とその順序、先頭の 0 を保ち、逆転や解決はしません。
隠れた形の隙間と大域的な注釈類は保護された境界を保ちます。

[fixture: eventmodeling/source-references/arrows-touching]

[fixture: eventmodeling/source-references/source-newlines-and-repetitions]

[fixture: eventmodeling/source-references/arrow-comment-contact]

入力（エスケープ表記）: `"eventmodeling tf 01 evt Alpha->>02->>001"`

出力
([source-references/arrows-touching-output.mmd](../tests/fixtures/eventmodeling/source-references/arrows-touching-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha ->> 02 ->> 001
```

### Data references

データの参照の前は普通の空白 1 個、内側は `[[D]]` と詰め、
Prettier が入れ子の角括弧に印字する形です。
部品間の普通の改行も詰めます。
`[[title]]` なら前置空白付きの title composite も作りません。
部品の間の改行が置き換わる空白 1 個は、規則 2 が与える形です。
理由は [Declarations and notes](#declarations-and-notes) と同じです。
所有する隙間の隠れた形形と注釈類は保ち、単一の参照名を修飾付きにしません。
参照は識別子を 1 つだけ持ち、ドットと別の区間を付けた形は拒否されます。

[fixture: eventmodeling/data-references/reference-padded]

[fixture: eventmodeling/data-references/reference-component-lines]

[fixture: eventmodeling/data-references/reference-title-compact-valid]

[fixture: eventmodeling/data-references/reference-title-padding-unsafe]

[fixture: eventmodeling/data-references/reference-names-acctitle-accdescr]

入力（エスケープ表記）: `"eventmodeling tf 01 evt Alpha [[ \tD\t ]]"`

出力
([data-references/reference-padded-output.mmd](../tests/fixtures/eventmodeling/data-references/reference-padded-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha [[D]]
```

### Type tags

型タグの内側は `` `json` `` と詰め、本文の前は普通の空白 1 個にします。
注記と値を見分けるためです。
タグの有無と全 8 種の型語は原文どおり残します。
タグは本文を JSON などとして解釈する指示ではありません。
隠れた形と大域的な注釈類の境界は保ちます。
タグの中のコメントと、タグの直後のコメントは、接していれば接したまま残し、
その前の空白とタブの連なりは、開始のバッククォートの直後でも、
空白 1 つにします。
タグの中のコメントの後の空白とタブの連なりも空白 1 つにします。
タグの部分の間の隙間は、空白、タブ、ノーブレークスペース、U+3000、U+2028、
U+2029 のどれを含んでいても詰めたままです。
タグの中のコメントの前、開始のバッククォートの直後、タグの中のコメントの後、
タグの後のコメントの前と後の、幅のある空白、U+2028、
U+2029 （[Comments](#comments) を参照）も空白 1 つにします。
それらの場所のそれぞれに、ノーブレークスペース、U+3000、U+2028、
U+2029 の行があります。
それらの場所での、[Comments](#comments) の集合のほかの文字については、
何も述べません。
その形を与える規則はありません。
型タグを持つほかの図はなく、[Comments](#comments) が挙げる印字器は、
コメントの前のこれらの文字を別々に印字するからです。
公開済みの版が印字する形を、決めるまで残します。
詳しくは
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
を参照してください。

[fixture: eventmodeling/type-tags/inline-tag-parts]

[fixture: eventmodeling/type-tags/block-tag-parts]

[fixture: eventmodeling/type-tags/all-inline-tags-retained]

[fixture: eventmodeling/type-tags/tag-comments-retained]
[fixture: eventmodeling/type-tags/tag-comments-spaced]
[fixture: eventmodeling/type-tags/tag-comments-spaced-after]
[fixture: eventmodeling/type-tags/tag-comments-tab-before]
[fixture: eventmodeling/type-tags/tag-comments-tab-after]
[fixture: eventmodeling/type-tags/tag-comments-before-closing-backtick-and-body]
[fixture: eventmodeling/type-tags/tag-comments-after-opening-backtick]
[test: a no-break space before a comment inside a type tag of an eventmodeling diagram]
[test: U+3000 before a comment inside a type tag of an eventmodeling diagram]
[test: U+2028 before a comment inside a type tag of an eventmodeling diagram]
[test: U+2029 before a comment inside a type tag of an eventmodeling diagram]
[test: a no-break space after a comment inside a type tag, before its next part, of an eventmodeling diagram]
[test: a no-break space after a comment inside a type tag, before its closing backtick, of an eventmodeling diagram]
[test: a no-break space before a comment after a type tag of an eventmodeling diagram]
[test: a no-break space after a comment after a type tag of an eventmodeling diagram]
[test: a no-break space between the parts of a type tag of an eventmodeling diagram]
[test: U+3000 after a comment inside a type tag, before its next part, of an eventmodeling diagram]
[test: U+2028 after a comment inside a type tag, before its next part, of an eventmodeling diagram]
[test: U+2029 after a comment inside a type tag, before its next part, of an eventmodeling diagram]
[test: U+3000 after a comment inside a type tag, before its closing backtick, of an eventmodeling diagram]
[test: U+2028 after a comment inside a type tag, before its closing backtick, of an eventmodeling diagram]
[test: U+2029 after a comment inside a type tag, before its closing backtick, of an eventmodeling diagram]
[test: U+3000 before a comment after a type tag of an eventmodeling diagram]
[test: U+2028 before a comment after a type tag of an eventmodeling diagram]
[test: U+2029 before a comment after a type tag of an eventmodeling diagram]
[test: U+3000 after a comment after a type tag of an eventmodeling diagram]
[test: U+2028 after a comment after a type tag of an eventmodeling diagram]
[test: U+2029 after a comment after a type tag of an eventmodeling diagram]
[test: U+3000 between the parts of a type tag of an eventmodeling diagram]
[test: U+2028 between the parts of a type tag of an eventmodeling diagram]
[test: U+2029 between the parts of a type tag of an eventmodeling diagram]
[test: a no-break space after the opening backtick of a type tag, before a comment, of an eventmodeling diagram]
[test: U+3000 after the opening backtick of a type tag, before a comment, of an eventmodeling diagram]
[test: U+2028 after the opening backtick of a type tag, before a comment, of an eventmodeling diagram]
[test: U+2029 after the opening backtick of a type tag, before a comment, of an eventmodeling diagram]

[fixture: eventmodeling/type-tags/tag-absent-kept-absent]

[fixture: eventmodeling/type-tags/all-block-tags-retained]

入力（エスケープ表記）:
`"eventmodeling tf 01 evt Alpha \u0060 \tjson \t\u0060{ x }"`

出力
([type-tags/inline-tag-parts-output.mmd](../tests/fixtures/eventmodeling/type-tags/inline-tag-parts-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha `json` { x }
```

### Qualified names

修飾名のドットの普通の隙間は改行や Unicode 空白も詰め、`Shop.Bought` にします。
規則 1 が与える形です。
修飾名のドットは、メンバーアクセスのドットと同じく 2 つの名前を結びます。
Prettier は、ドットの両側に空白、改行、ノーブレークスペース、
U+3000 を書いたメンバーアクセスも、
JavaScript では `a.b` と印字します（`x = a . b;` は `x = a.b;` になります）。
ドットは既存の識別子区間を接続する記号だからです。
完全な識別子の綴りは、
Db がフレームの完全な修飾名を書かれたまま持つので保ちます。
所有する隠れた形・コメント隙間も保ちます。
隠れた形が消費する LF の後の `title` 区間に空白を足しません。

[test: eventmodeling/qualified-names/qualified-padded]

[fixture: eventmodeling/qualified-names/qualified-lines]

[fixture: eventmodeling/qualified-names/dot-title-no-padding]

[fixture: eventmodeling/qualified-names/dot-title-padded-unsafe]

[fixture: eventmodeling/qualified-names/dot-native-comment]

[fixture: eventmodeling/qualified-names/custom-header-identifier]

[fixture: eventmodeling/qualified-names/hidden-before-title-segment-keep-no-prefix-space]

入力（エスケープ表記）:
`"eventmodeling rf 02 cmd Shop\n.\nBuy entity Root\n.\nChild"`

出力
([qualified-names/qualified-lines-output.mmd](../tests/fixtures/eventmodeling/qualified-names/qualified-lines-output.mmd)):

```mmd
eventmodeling
rf 02 cmd Shop.Buy
entity Root.Child
```

### Authored spellings

短形・長形のフレームキーワード、全 9 種の実体の種類、
数字の名前の綴りを保ちます。
フレームキーワードの別名変更は比較 Db が等しくても、選ばれた形を失います。
実体の種類の別名は Db に残り、`1`、`01`、`001` は別のフレーム名なので、
別名の変換も数値への正規化もしません。

[fixture: eventmodeling/authored-spellings/alias-retained]

[fixture: eventmodeling/authored-spellings/frame-aliases-db-equal]

[fixture: eventmodeling/authored-spellings/entity-type-aliases-db-different]

[fixture: eventmodeling/authored-spellings/numeric-identity-zeroes]

[fixture: eventmodeling/authored-spellings/nine-entity-types-preserved]

入力（エスケープ表記）:
`"eventmodeling timeframe 001 event Alpha resetframe 02 command Beta"`

出力
([authored-spellings/alias-retained-output.mmd](../tests/fixtures/eventmodeling/authored-spellings/alias-retained-output.mmd)):

```mmd
eventmodeling
timeframe 001 event Alpha
resetframe 02 command Beta
```

### Declarations and notes

コメントやディレクティブで宣言や note の見出しが分かれる場合、GWT と同じく、
注釈類と見出しが完結する行をキーワードより 1 段深くします。
規則 2 は、文の後ろの行と、その間のコメントやディレクティブの行に、
この深さを与えます。
コメントやディレクティブの隣の改行も残します。
理由は [Long lines](#long-lines) と同じです。
data 本文の規則が余白の変更を許す場合、
本文はその開始行よりさらに 1 段深くします。
原文の順序、値の継続行、必須の隠れた形の境界を保ちます。
閉じ波括弧は引き続き第 1 列に置きます。
対象にする版の mermaid.js のすべてが、字下げした閉じ波括弧を拒否するためです。
詳しくは [Data blocks](#data-blocks) を参照してください。

[fixture: eventmodeling/declarations-and-notes/header-completion-comments]

[fixture: eventmodeling/declarations-and-notes/header-opener-comment]

[fixture: eventmodeling/declarations-and-notes/header-directive-continuation]

[fixture: eventmodeling/declarations-and-notes/header-continuation-tabs]

[fixture: eventmodeling/declarations-and-notes/header-continuation-unsafe-body]

出力
([declarations-and-notes/header-completion-comments-output.mmd](../tests/fixtures/eventmodeling/declarations-and-notes/header-completion-comments-output.mmd)):

```mmd
eventmodeling
data
  // payload
  Cart {
    sku: SHIRT-M
}
note
  // payment note
  01 {
    Payment received
}
```

宣言と note の部品は `entity Shop.Buy`、`data D`、`note 01` と、
普通の空白 1 個で分けます。
規則 1 は、文の部品の間の改行の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[gantt](./gantt.ja.md#複数行の文)、[journey](./journey.ja.md#複数行の文)、
[quadrant](./quadrant.ja.md#複数行の文)も、
mermaid.js が複数行にわたって読む文を、部品の間に空白 1 個を置いて、
1 行に印字します。
修飾名のドットの両側には空白を置きません。
詳しくは [Qualified names](#qualified-names) を参照してください。
ほかの規則がレイアウトを書かれたまま残す所は別です。
部品の間のコメント（上の段落が扱います）、改行をまたぐスラッシュのコメント、
無視される `;` を含む行です。
ブロック開始記号は見出し行の空白 1 個後に置きます。
規則 1 が与える形です。
Prettier は、ブロックを開く `{` の前に空白 1 個を置きます。
見出しに接して書いても次の行に書いても同じで、JavaScript では `class A{}` も、
`class A` と改行と `{}` も、`class A {}` と印字します。
値と閉じの境界は data の規則に従います。
必須の名前の `title` はフレームと同じく安全な前方境界を保ちます。
`eventmodeling data`、改行、`title {` は、そのまま残します。
対象にする版の mermaid.js のすべてが、
`eventmodeling data title {` を 1 行にした形を拒否するためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。

[fixture: eventmodeling/declarations-and-notes/entity-ordinary]
[fixture: eventmodeling/declarations-and-notes/entity-break-after-whitespace-and-empty-line]
[fixture: eventmodeling/declarations-and-notes/entity-slash-comment-over-lines]
[fixture: eventmodeling/semicolons/ignored-semicolon-touches-next-atom]
[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

[fixture: eventmodeling/declarations-and-notes/entity-title-lf-protected]

[fixture: eventmodeling/declarations-and-notes/data-and-note-headers]

[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

入力（エスケープ表記）: `"eventmodeling entity\tShop\n.\nBuy"`

出力
([declarations-and-notes/entity-ordinary-output.mmd](../tests/fixtures/eventmodeling/declarations-and-notes/entity-ordinary-output.mmd)):

```mmd
eventmodeling
entity Shop.Buy
```

### Gwt clauses and items

GWT の見出しがコメントやディレクティブの後に続く場合、通常の継続の字下げを使い、
注釈類と参照元フレームの行を `gwt` より 1 段深く置きます。
文の後ろの行にこの深さを与えるのは規則 2 です（[Long lines](#long-lines)
を参照）。
書かれた順序とコメントの形は保ちます。
節キーワードは引き続き 1 段、項目は 2 段です。
理由は [Indentation](#indentation) と同じです。
参照元フレームの行は新たなトップレベルの文ではありません。

[fixture: eventmodeling/gwt-clauses-and-items/header-completion-comment]
[fixture: eventmodeling/gwt-clauses-and-items/header-directive-continuation]

続いた GWT の見出しのディレクティブの後にある節は、
その前の空白を書かれたままにします。
同じ行で項目の後ろにあるディレクティブは、その行に残ります。
`given evt A %%{{tail}}%%` は 1 行のままです。

[fixture: eventmodeling/gwt-clauses-and-items/clause-after-header-directive-with-tail-directive]

`gwt 99` は第 1 列、節キーワードはさらに 1 段、各項目はさらに 1 段深くします。
理由は [Indentation](#indentation) と同じです。
架空の閉じ記号を足さず、書かれた節と項目の関係を見せます。
必須の given・then、任意の when、項目の順序・反復・型語を保ちます。
普通の項目部品は空白 1 個で分けます。
[規則 1](./printed-form.ja.md#1-記号の横の空白) が、
キーワードとそれが取るものの間に空白 1 個を与えます。
Prettier が `return  x` を `return x;` と印字するのと同じです。
必須の `title` の境界、隠れた形、注釈類、保護された開始境界を優先します。
`eventmodeling gwt 01 given evt`、改行、
`title then cmd accTitle tf 02 evt Alpha` は、そのまま残します。
対象にする版の mermaid.js のすべてが、
改行を空白 1 つにした形を拒否するためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。

[fixture: eventmodeling/gwt-clauses-and-items/given-when-then-nested]
[fixture: eventmodeling/gwt-clauses-and-items/gwt-title-identifier-keep-lf]

[fixture: eventmodeling/gwt-clauses-and-items/without-when-repeated-items]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-inline-alternative]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-title-identifier-keep-lf]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-clause-and-item-comments]

[test: eventmodeling/gwt-clauses-and-items/gwt-blanks-and-separators]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-title-after-hidden-keep-zero-indentation]

[corpus fixture: eventmodeling/gram-gwt-item-comment-line]

入力（エスケープ表記）:
`"eventmodeling gwt 99 given evt Alpha cmd Beta when command Buy then ui Screen rmo View tf 01 evt End"`

出力
([gwt-clauses-and-items/given-when-then-nested-output.mmd](../tests/fixtures/eventmodeling/gwt-clauses-and-items/given-when-then-nested-output.mmd)):

```mmd
eventmodeling
gwt 99
  given
    evt Alpha
    cmd Beta
  when
    command Buy
  then
    ui Screen
    rmo View
tf 01 evt End
```

### Inline data

行内の本文は完全な原文の範囲から印字し、波括弧・引用符、バックスラッシュ、空白、
空の形、図固有の構文に見えるテキストを保ちます。
`singleQuote` では終端トークンを書き直しません。
字句解析器は同じ行の最後の対応する閉じまで読むため、
その範囲の見かけの後続フレームは data であり、文ではありません。
両端の空白の除去、引用符の変更、分割は Db の原文の終端トークンを変えます。

[fixture: eventmodeling/inline-data/inline-braces-unchanged]

[fixture: eventmodeling/inline-data/inline-quote-spelling]

[fixture: eventmodeling/inline-data/inline-empty-and-whitespace]

[fixture: eventmodeling/inline-data/inline-trimming-changes-raw-value]

[fixture: eventmodeling/inline-data/inline-requote-changes-raw-value]

[fixture: eventmodeling/inline-data/greedy-apparent-frames-kept]

[fixture: eventmodeling/inline-data/data-hidden-looking-text]

入力（エスケープ表記）: `"eventmodeling tf 01 evt Alpha { \t x  }"`

出力
([inline-data/inline-braces-unchanged-output.mmd](../tests/fixtures/eventmodeling/inline-data/inline-braces-unchanged-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha { 	 x  }
```

### Data blocks

`{` の直後が LF で、LF の直後の `}` で閉じる通常の data と note は、
次の条件を満たす場合、
空でない本文行をすべて `tabWidth` 個の ASCII 空白（U+0020）で字下げします。
行頭は規則 1 の場所ではなく、規則 2 も本文の行の余白を与えません。
[pie](./pie.ja.md#description-blocks)、
[radar](./radar.ja.md#description-blocks)、
[cynefin](./cynefin.ja.md#description-blocks) は、説明ブロックの行を、
文より 1 段内側の `tabWidth` 個の空白に置き、
`tabWidth: 0` では空白を置きません。
ただし、どれでもこの形は、決まっていない形の一覧（D35）の問いです。
そのため、その印字は決まった形ではなく、決まるまでリリース済みの形を残します。
詳しくは
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
を参照してください。
通常の見出しの継続行が残る場合は `2 * tabWidth` 個にして、
本文をその開始行よりさらに 1 段深くします。
[sequence](./sequence.ja.md#字下げ)と [state](./state.ja.md#字下げ)も、
ブロックの本文を、それを開く行より 1 段深く置き、継続した行がその行です。
見出しへ結合される元の LF や、
行内のディレクティブの内部の LF では段を増やしません。
段が表すのはプリンターが字下げする継続行で、結合された LF は継続行を残さず、
ディレクティブの行は書かれたままだからです。
図固有の隠れた形を含む見出しはその境界の列を保ち、本文は通常の 1 段にします。
`useTabs` でも空白を使います。
タブの余白でも、走らせた版の Db と描画は同じなので、空白を残す理由はなく、
その行は一覧（D35）にあります。
`tabWidth: 0` では本文を書かれたまま残します。
余白は 0 個で、後の行の余白を除くと別の図を描くためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
の、後の行を第 1 列に置く形と 2 つの空白で字下げする形の行を参照してください。
本文が 1 行のものと、後の行のどれにも余白がない本文は、
第 1 行の余白を除いても同じに描くので、ここでは書かれたまま残しています。
この余白も、どの規則も与えません（D35）。
本文をデータ項目に分けて解析したり、JSON やコードとして整形したりはせず、
原文の字下げの差は保ちません。

[fixture: eventmodeling/declarations-and-notes/header-completion-comments]

[fixture: eventmodeling/declarations-and-notes/header-directive-continuation]

[fixture: eventmodeling/declarations-and-notes/data-and-note-headers]

[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

[fixture: eventmodeling/declarations-and-notes/header-inline-multiline-directive]

[fixture: eventmodeling/declarations-and-notes/header-continuation-tabs]

[fixture: eventmodeling/hidden-forms/hidden-data-tag-owners]

[fixture: eventmodeling/data-blocks/body-common-margin]

[fixture: eventmodeling/data-blocks/body-overindented-first-line]

[fixture: eventmodeling/data-blocks/body-overindented-later-line]

[fixture: eventmodeling/data-blocks/body-overindented-first-note-blanks-tabs]

[fixture: eventmodeling/data-blocks/body-overindented-first-four-spaces]

[fixture: eventmodeling/indentation/data-declaration-four-spaces]

[fixture: eventmodeling/indentation/data-declaration-tabs]

[fixture: eventmodeling/data-blocks/body-zero-width]

元にない行頭の空白を加えられるのは、本文の第 1 物理行だけです。
それ以降の空でない物理行は、変更前後とも行頭に ASCII 空白が 1 個以上必要です。
満たさない場合は本文全体を書かれたまま残します。
全行に余白を置くと、後の行に初めて空白を加えます。
それは描画するラベルを変える場合があり、
11.15.0 から 12.3.0 が別のテキストと形状を描きます。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
先頭が空行でも、その次の行が第 1 物理行になるわけではありません。

[fixture: eventmodeling/data-blocks/body-first-line-zero-margin]

[fixture: eventmodeling/data-blocks/body-later-zero-margin-kept]

[fixture: eventmodeling/data-blocks/body-later-zero-margin-plain-kept]

[fixture: eventmodeling/data-blocks/body-after-empty-first-row-kept]

空行、空白だけの行、改行、行末の空白とタブ、行頭の余白より後の文字は保ちます。
フレームが読む `data` ブロックでは、
これらはフレームのために Db が持つ値の文字で、
下の余白の例外だけがそれを変えます。
閉じ波括弧は第 1 列に残します。
`eventmodeling tf 01 evt Alpha [[D]] data D {`、`x`、`}` は、そのまま残します。
対象にする版の mermaid.js のすべてが、
`}` を 2 つの空白で字下げした形を拒否するためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
ほかの図種なら `}` を字下げします（[字下げ](#indentation)を参照）。
見かけの文、波括弧を含むテキスト、直後の閉じ風の行も、
本文を持つ形の規則が後の閉じまで読む場合は保ちます。
フレームが読む `data` ブロックでは、
これらはフレームのために Db が持つ値の文字だからです。

[fixture: eventmodeling/data-blocks/body-whitespace-kept]
[fixture: eventmodeling/data-blocks/block-closer-indent-unsafe]

[fixture: eventmodeling/data-blocks/block-empty-kept]

[fixture: eventmodeling/data-blocks/block-closer-indent-unsafe]

[fixture: eventmodeling/data-blocks/later-closer-owns-apparent-text]

[fixture: eventmodeling/data-blocks/block-nested-text]

開きの LF の前に空白がある場合、本文が `<`、`&`、`%%{` を含む場合、
空でない行の ASCII 空白前置部分の後がタブなどの空白の場合は、
本文全体を書かれたまま残します。
HTML、実体参照、ディレクティブ風のテキストは、
字下げで描画が変わる場合があるためです。
`;` を含む本文も、書かれたまま残します。
`#amp;` などの Mermaid 独自の実体参照の綴りは、`;` で終わるからです。

[fixture: eventmodeling/data-blocks/block-interior-unchanged]

[fixture: eventmodeling/data-blocks/html-line-break-indentation-kept]

[fixture: eventmodeling/data-blocks/body-entity-kept]

[fixture: eventmodeling/data-blocks/body-native-directive-kept]

[fixture: eventmodeling/data-blocks/body-leading-tab-kept]

[test: eventmodeling/data-blocks/body-leading-nbsp-kept]

[fixture: eventmodeling/data-blocks/body-style-semicolon-kept]

Mermaid は本文内の字下げを受理し、変換前の値に含めます。
そのため、この行頭余白の変更では、描画を保ちながら変換前の Db 値が変わります。
これは整形処理の明示的な例外で、パーサー、仕様、
記録された Mermaid の Db の読みは変えません。

レンダラーは、データブロックの `{` と閉じる `}` の間の本文を取り出し、
`wrapLabel` に渡します。
（[`calculateTextProps`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/eventmodeling/db.ts#L358-L371)）。
`wrapLabel` は半角空白ごとに分け、空の部分を捨てます。
（[`wrapLabel`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/utils.ts#L559-L594)）。
そのため、2 行目以降の行頭の連続する半角空白は、
長さによらず空白 1 つとして描かれ、空白がなければ何も描かれません。
最初の行の先頭の半角空白は、何も描かれません。
各場合の両方のテキストを mermaid.js 12.3.0 で Chromium に描きました。
各行の余白を別の長さにした場合と、最初の行に余白を足した場合は、
生成された id を除いた SVG と画素が同じでした。
余白がなかった後続行に余白を足すと図が変わったので、
そのような本文は書かれたままにします。
テストは、印字したテキストの Db に、
書かれたテキストの Db から本文の余白を戻して比べます。
`tests/eventmodeling-data-margins.ts` の関数、
`eventmodelingDbForFormattingComparison` を使います。
固定している mermaid.js の版を上げるときは、
各場合の両方のテキストを描き直してから、例外を残します。

[fixture: eventmodeling/final-newline/final-block-padding-kept]

入力（エスケープ表記）:
`"eventmodeling\ndata AddItem01 {\n    sku: 'SHIRT-M'\n  quantity: 2\n}\n"`

出力
([data-blocks/body-overindented-first-line-output.mmd](../tests/fixtures/eventmodeling/data-blocks/body-overindented-first-line-output.mmd)):

```mmd
eventmodeling
data AddItem01 {
  sku: 'SHIRT-M'
  quantity: 2
}
```

入力（エスケープ表記）:
`"eventmodeling\ndata D {\n  sku: 'SHIRT-M'\n    quantity: 2\n  price: 10\n}\n"`

出力
([data-blocks/body-overindented-later-line-output.mmd](../tests/fixtures/eventmodeling/data-blocks/body-overindented-later-line-output.mmd)):

```mmd
eventmodeling
data D {
  sku: 'SHIRT-M'
  quantity: 2
  price: 10
}
```

入力（エスケープ表記）: `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n}\n"`

出力
([data-blocks/block-closer-indent-unsafe-output.mmd](../tests/fixtures/eventmodeling/data-blocks/block-closer-indent-unsafe-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha [[D]]
data D {
  x
}
```

### Data boundaries

ブロックデータが閉じの LF を消費するか、空白の先読みで止まるかを保ちます。
ブロックデータは、閉じの直後の LF を消費し、ほかの空白は先読みするだけなので、
先読みを LF に置き換えると Db が変わる場合があります。
詳しくは
[Eventmodeling terminals and source boundaries](./compatibility.ja.md#eventmodeling-terminals-and-source-boundaries)
を参照してください。
普通の後続文を次の行へ移すときも、閉じ直後の水平空白は残します。
空白は閉じと LF の間にあり、除くと LF がブロックに消費されるからです。
後続文は、
[Statements one per line](#statements-one-per-line) のとおり自分の行へ移します。
LS・PS の先読みは終端トークンの外のままで、LF へ変えません。
そこに LF を置くとブロックに消費されるので、理由は同じです。
次が共通文なら、最初の LF の有無、前置の連なり全体、
先行単位との接続を幅 0 でも保ちます。
予備 LF の追加や字下げ・閉じの空白の削除は Db や受理を変えるためです。
EOF の論理 LF は明示的な末尾 LF 1 個にできます。
mermaid.js は、読む前にテキストへ LF を足します。
詳しくは [テキストの終わり](../../spec/docs/common.ja.md#テキストの終わり)
を参照してください。
明示的な LF はすでに読む文字で、Prettier はファイルを 1 つの改行で終えます。
詳しくは [Final newline](#final-newline) を参照してください。

[fixture: eventmodeling/data-boundaries/block-eof-logical-lf-kept]

[fixture: eventmodeling/data-boundaries/block-closer-space-retained]

[fixture: eventmodeling/data-boundaries/same-line-block-successor]

[fixture: eventmodeling/data-boundaries/lf-consuming-before-acctitle]

[fixture: eventmodeling/data-boundaries/lf-consuming-before-accdescr-preserve-one-space]

[fixture: eventmodeling/data-boundaries/note-consumed-lf]

[fixture: eventmodeling/data-boundaries/after-block-lf-tabwidth-zero-must-keep-metadata-padding]

[fixture: eventmodeling/data-boundaries/after-block-same-line-tab-metadata-boundary-kept]

入力（エスケープ表記）: `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n}"`

出力
([data-boundaries/block-eof-logical-lf-kept-output.mmd](../tests/fixtures/eventmodeling/data-boundaries/block-eof-logical-lf-kept-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha [[D]]
data D {
  x
}
```

### Common boundaries

共通文の原文全体、直前の ASCII 空白・タブの連なり、
読みを成立させる先行単位との接続を保ちます。
大域的なディレクティブと選ばれたセミコロンを挟む場合は、
除去によってつながる空白が決まるため、間の原文区間全体を保ちます。
失った連なりを後で再構築しません。
ここでは共有アクセシビリティ配置を通しません。
EM 終端トークンは他図種の変換済み共通の終端トークンと異なり、
キーワード・区切り・前置空白まで値として保つためです。
`accTitle` の設定関数が一部の前置空白を落としても、
共通文全体を保持して不統一な例外を避けます。

[fixture: eventmodeling/common-boundaries/common-retained-exact-leading-directive-gaps]

[fixture: eventmodeling/common-boundaries/acctitle-prefix-leading-stripped-by-setter]

[fixture: eventmodeling/common-boundaries/accdescr-prefix-significant]

[fixture: eventmodeling/common-boundaries/common-after-empty-description-keep-adjacency]

[fixture: eventmodeling/common-boundaries/native-comment-separates-common-requires-following-padding]

[fixture: eventmodeling/common-boundaries/native-comment-common-padding-change-db]

入力（エスケープ表記）:
`"eventmodeling tf 01 evt Alpha \t%%{init:{}}%%  accDescr: D"`

出力
([common-boundaries/common-retained-exact-leading-directive-gaps-output.mmd](../tests/fixtures/eventmodeling/common-boundaries/common-retained-exact-leading-directive-gaps-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha 	%%{init:{}}%%  accDescr: D
```

### Title

title の前置空白、1 個の区切り、本文、末尾テキストを原文どおり保ちます。
引用符、空の title、上書きされた出現も含みます。
次の物理行から値を取りません。
比較要約は図の title を除くため、比較 Db が等しくても、
公開される `EM_TITLE` 終端トークンを書き換える理由にはなりません。

[fixture: eventmodeling/title/title-exact-padding-and-quotes]

ヘッダー行とフレーム文の行では、`title`、`accTitle:`、`accDescr:` のテキストは、
最初の `%%` の前で終わり、
`%%` はコメントを始めます（`title T  %% c` の値は `T  ` です）。
テキストの後の `//` と `/* */` はテキストの一部です（`title T  // c` の値は
`T  // c` です）。
そのため、印の前にある空白かタブの連なりは値に属し、
そこにある幅のある空白（[Comments](#comments) を参照）、U+2028、
U+2029 も値に属するので、書かれたまま残します。

`accTitle:` では、`%%`、`//`、`/* */` のどれが続くときも、
連なりを書かれたまま残します。
つなぐと、対象にするどの版でも、
Db と mermaid.js が描くテキストが変わるからです。
`title` と `accDescr:` では、連なりをつないでも描くものは同じです。
title の Db は同じで、説明の Db は連なりか末尾だけが違い、
mermaid.js は説明を空白をつめた HTML として描きます。
規則 2 は空白 1 つを与えます。
journey、timeline、sequence は `title T  %% c` を `title T %% c` と印字し、
title や説明の中の連なり（`title T  // c`）にも、
同じに描かれるテキスト中の空白の連なりが空白 1 つを与えます。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
リリース済みの版は、`title T  %% c`、`title T  // c`、`title T  /* c */`、
`accDescr: T  %% c`、`accDescr: T  // c`、`accDescr: T  /* c */` を、
書かれたまま残すので、その形は規則 2 に反して印字しており、
規則による修正を待っています。

[fixture: eventmodeling/title/header-line-title-run-before-percent-comment-kept]
[fixture: eventmodeling/title/header-line-acctitle-run-before-percent-comment-kept]
[fixture: eventmodeling/title/header-line-accdescr-run-before-percent-comment-kept]
[fixture: eventmodeling/title/frame-line-titles-run-before-percent-comment-kept]
[fixture: eventmodeling/title/header-line-title-slash-comment-mark-is-text]
[fixture: eventmodeling/title/header-line-accdescr-block-comment-mark-is-text]
[fixture: eventmodeling/title/frame-line-titles-slash-comment-marks-are-text]
[test: a no-break space before a comment mark after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+3000 before a comment mark after the text of the accTitle of the header line of an eventmodeling diagram stays as written]
[test: U+2028 before a comment mark after the text of the accDescr of the header line of an eventmodeling diagram stays as written]
[test: U+2003 before a comment mark after the text of the title of a frame statement of an eventmodeling diagram stays as written]
[test: a no-break space before a comment mark after the text of the accTitle of a frame statement of an eventmodeling diagram stays as written]
[test: U+3000 before a comment mark after the text of the accDescr of a frame statement of an eventmodeling diagram stays as written]
[test: a no-break space before a `//` comment mark after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: a no-break space before a `/* */` comment mark after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+000B before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+000C before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: a no-break space before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+1680 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2000 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2001 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2002 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2003 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2004 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2005 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2006 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2007 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2008 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2009 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+200A before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+202F before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+205F before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+3000 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+FEFF before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2028 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]
[test: U+2029 before a `%%` comment after the text of the title of the header line of an eventmodeling diagram stays as written]

[fixture: eventmodeling/title/title-normalized-invisible-to-comparison-db]

[fixture: eventmodeling/title/title-empty-remains]

[fixture: eventmodeling/title/overwritten-occurrences]

入力（エスケープ表記）: `"eventmodeling title\ntf 01 evt Alpha"`

出力
([title/title-empty-remains-output.mmd](../tests/fixtures/eventmodeling/title/title-empty-remains-output.mmd)):

```mmd
eventmodeling title
tf 01 evt Alpha
```

### Accessibility lines

アクセシビリティの行形式は前置空白、キーワードとコロンの間、
コロン後と末尾の空白、空本文、引用符、波括弧風のテキストを保ちます。
`EM_ACC_TITLE` と `EM_ACC_DESCR` は、これらの一部を値に含みます。
固定した版の Db は、
`eventmodeling   accDescr: A` と `eventmodeling accDescr: A` で accDescr
が違い、走らせた版は両方を同じに描くので、その空白は値の一部として残します。
見出しと `accTitle` の間の空白は Db に入らず（設定関数が先頭の空白を除きます）、
走らせた版は両方の形を同じに描くので、理由なしに残し、
その行は一覧（D18）にあります。
コロンの後と、`accTitle` や `accDescr` の行末の空白も、値の一部です。
走らせた版は、
その有無で SVG の `<title>` や `<desc>`
のアクセシビリティのテキストを違って描くので、残します。
`accTitle` と `:` の間が空白 1 個とタブ 1 個のときは、その隙間を保ちます。
対象にする版の mermaid.js のすべてが、
隙間をなくすとアクセシビリティのテキストを違って描くためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
空本文でも終端トークンは空ではなく、コロン形式をブロックへ変えません。
行の値の LS・PS は内容のままです。

[fixture: eventmodeling/accessibility-lines/accessibility-lines-exact]

[fixture: eventmodeling/accessibility-lines/accessibility-shared-trim-changes]

[fixture: eventmodeling/accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string]

[fixture: eventmodeling/accessibility-lines/colon-braces-remain-text]

[test: eventmodeling/accessibility-lines/line-value-ls-ps-preserved]

[corpus fixture: eventmodeling/common-repeat-empty]

入力（エスケープ表記）:
`"eventmodeling accTitle: First\ntf 01 evt Alpha accTitle:"`

出力
([accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string-output.mmd](../tests/fixtures/eventmodeling/accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string-output.mmd)):

```mmd
eventmodeling accTitle: First
tf 01 evt Alpha accTitle:
```

### Description blocks

説明ブロック全体と前置の連なりを保ちます。
開き前の改行、空白だけの内部、閉じの列も含みます。
空、空白だけ、共通除去だけの内部を区別して残します。
固定した版の Db はブロックを書かれたとおりに持ち、
（`accDescr { }` と `accDescr {}`、`accDescr`、改行、
`{ Details }` と `accDescr { Details }` は accDescr
が違います）空白だけの内部と開き前の改行は残ります。
閉じの列は Db に入らず、走らせた版は両方の形を同じに描くので、理由なしに残し、
その行は一覧（D34）にあります。
共有 `layoutDescriptionBlock` を通さない判断はこの 1 か所です。
通常の `{}` への圧縮と閉じの整列は `EM_ACC_DESCR` の値を変えるためです。
図種専用の空ブロック正規化も加えません。
`accDescr {`、空白 1 個、タブ 1 個、LF、`  }` と続く形では、その空白を保ちます。
対象にする版の mermaid.js のすべてが、
空白だけの説明に使う圧縮形 `accDescr {}` では、
アクセシビリティのテキストを違って描くためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。

[fixture: eventmodeling/description-blocks/description-whitespace-literal-retained]

[fixture: eventmodeling/description-blocks/description-opener-newline-unchanged]

[fixture: eventmodeling/description-blocks/description-closer-column-normalized-by-setter]

[fixture: eventmodeling/description-blocks/description-slash-yaml-are-content]

[corpus fixture: eventmodeling/gram-description-block-empty-after-removal]

[corpus fixture: eventmodeling/common-description-repeat]

入力（エスケープ表記）: `"eventmodeling accDescr\n\n{ Details }"`

出力
([description-blocks/description-opener-newline-unchanged-output.mmd](../tests/fixtures/eventmodeling/description-blocks/description-opener-newline-unchanged-output.mmd)):

```mmd
eventmodeling accDescr

{ Details }
```

### Hidden forms

`IgnoredText` は AST の所有ノードごとに原文の範囲から 1 回印字します。
見出し前・本文、必須・任意の名前付きの隙間、修飾名の末尾、tag、
GWT 節・項目の隙間を保ちます。
保持 YAML と図固有の `DIRECTIVE` を設定として解釈しません。
隠れた形を扱う共有経路が内部の列、消費 LF、閉じの先読み空白を保ち、
普通の本文開始記号は本文の段に揃えます。
行頭は規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[radar](./radar.ja.md#hidden-forms) は、普通の本文開始記号を字下げします。
[pie](./pie.ja.md#indentation)と [packet](./packet.ja.md#indentation)は、
独立したディレクティブを見出しの 1 段下に置き、
自分の行にある隠れたディレクティブも、どちらでもそれに従います。
必須の開始部分の隙間と共通文の前方境界は原文どおりです。
`eventmodeling`、`%%{{x}}%%`、` accDescr: D` を各行に置いた形は、
`accDescr` の前の空白 1 つも残します。
対象にする版の mermaid.js のすべてが、その空白のない形を拒否するためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
代替の扱いのパーセントコメントはコメントのままです。

本文境界の形が保つ行は、GWT 節と項目の開きでも保ちます。
見出しと入れ子の本文で同じ判断を使い、
項目の移動によって次の整形で外側の開きの保護が失われないようにします。

説明ブロックが複数行にわたるとき、その `}` の後ろにある隠れた形は、
同じ行に残ります。
`eventmodeling accDescr {A`、改行、`B} %%{{native}}%%` は、そのまま残ります。
以前は、その形が自分の行に移っていました。

[fixture: eventmodeling/hidden-forms/native-after-description-block-end-stays-on-its-line]
[fixture: eventmodeling/hidden-forms/header-inline-gwt-item-directive]

[fixture: eventmodeling/hidden-forms/header-inline-gwt-item-yaml]

[fixture: eventmodeling/hidden-forms/body-hidden-yaml-no-visible-eol-needed]

[fixture: eventmodeling/hidden-forms/hidden-frame-required-gaps]

[fixture: eventmodeling/hidden-forms/hidden-optional-owners]

[fixture: eventmodeling/hidden-forms/hidden-dot-owners]

[fixture: eventmodeling/hidden-forms/hidden-data-tag-owners]

[fixture: eventmodeling/hidden-forms/hidden-gwt-clause-item-owners]

[fixture: eventmodeling/hidden-forms/hidden-next-common-keep-consumed-lf-padding]

[fixture: eventmodeling/hidden-forms/yaml-next-common-keep-consumed-lf-padding]

[fixture: eventmodeling/hidden-forms/native-later-qualifying-close-retained]

[fixture: eventmodeling/hidden-forms/fallback-percent-comment-remains-comment]

[fixture: eventmodeling/hidden-forms/adjacent-yaml-closer-source-whole]

[fixture: eventmodeling/hidden-forms/native-directive-closer-padding-retained]

[fixture: eventmodeling/hidden-forms/no-spare-lf-required-before-ordinary-frame]

[fixture: eventmodeling/hidden-forms/reference-internal-hidden-owners]

[fixture: eventmodeling/hidden-forms/inline-tag-hidden-owners]

[fixture: eventmodeling/hidden-forms/gwt-required-source-and-given-hidden-gaps]

[corpus fixture: eventmodeling/detect-real-retained-secondscan]

入力（エスケープ表記）:
`"eventmodeling tf 01 evt Alpha ---\nx\n---\ntf 02 evt Beta"`

出力
([hidden-forms/body-hidden-yaml-no-visible-eol-needed-output.mmd](../tests/fixtures/eventmodeling/hidden-forms/body-hidden-yaml-no-visible-eol-needed-output.mmd)):

```mmd
eventmodeling tf 01 evt Alpha ---
x
---
tf 02 evt Beta
```

### Comments

普通の独立コメントは所属本文の段に揃え、GWT 項目間では項目の段にします。
行頭は規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[flowchart](./flowchart.ja.md#コメント)は、コメント行を周りの文の段に置きます。
[sequence](./sequence.ja.md#コメント)も同じです。
[journey](./journey.ja.md#コメント)、[timeline](./timeline.ja.md#コメント)、
[block](./block.ja.md#コメント)、[quadrant](./quadrant.ja.md#コメント)、
[gantt](./gantt.ja.md#コメント)は、コメント行を後ろの文の段に置きます。
eventmodeling の本文は平らなので、どちらも同じ段になります。
同じ印字行では、接するコメントは接したまま残し、
前の空白とタブの連なりは空白 1 つにします。
ただし、ヘッダー行とフレーム文の行の title、accTitle、accDescr では、
コメントの印の前の連なりが値に属するので、
そのままです（[Title](#title) を参照）。
規則 1 は、コメントの前の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[sequence](./sequence.ja.md#コメント)は、
メッセージの後ろのコメントを同じように印字します。
[journey](./journey.ja.md#コメント)も、
見出しの後ろのコメントを同じように印字します。
[timeline](./timeline.ja.md#コメント)も、見出しの後ろは同じです。
ほかの規則が空白を書かれたまま残す所は別です。
どの図の文書も、その所を、
自分の節か [文字の直後のコメント](./compatibility.ja.md#文字の直後のコメント)
で挙げています（Db が持つ空白、たとえば `section` と期間の後の空白と、
mermaid.js の読みを変える空白です）。
コメントの前にある幅のある空白、U+2028、U+2029 は、空白 1 つにします。
ただし、ヘッダー行とフレーム文の行の title、accTitle、accDescr では、
値に属するので、書かれたまま残します（[Title](#title) を参照）。
幅のある空白は、U+000B、U+000C、U+00A0、U+1680、U+2000 から U+200A、U+202F、
U+205F、U+3000、U+FEFF のどれかです。
そのすべてが、フレーム文の後ろでテキストが終わるときの行を持ち、ほかの場所には、
ノーブレークスペース、U+3000、U+2028、U+2029 の行があります。
ほかの場所は、コメントに文が続くとき、ヘッダー行、GWT のヘッダー、GWT の項目、
節のキーワード、data の宣言、note の宣言、entity の宣言、data の参照、
行内の本体、ソースの参照、ブロックの閉じ括弧の後ろです。
mermaid.js は、フレーム文の後ろでテキストが終わるときのコメントの前の U+0085、
U+180E、U+200B を字句解析のエラーで拒否するので、そこではパーサーも拒否します。
前に挙げた図は、これらの文字をそう印字しません。
sequence は、
メッセージの後ろのノーブレークスペースと U+3000 を書かれたまま残します。
journey と timeline は、見出しの後ろのこの 2 つを空白 1 つで印字します。
U+2028 と U+2029 の前では、sequence、journey、timeline は、
コメントに文が続くとき行を書かれたまま残し、
テキストが終わるときはコメントを自分の行に置きます。
そのため、これらの文字の形を与える規則はなく、
公開済みの版が印字する空白 1 つを、決めるまで残します。
詳しくは
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
を参照してください。
単位を行に分けるとき、
間の行内のコメントはディレクティブと同じく次の単位へ付けます。
同じコメントを図種の間で同じように扱うため、共有の置き方を使います。
印、内容、末尾空白、ブロックコメントの継続列を保ちます。
図固有の `//` と `%%` は LS・PS を越えて物理 LF まで読みます。
data ブロック、note、`accDescr` ブロック、スラッシュのブロックコメント、
隠れた形の内部の `%%` のコメント行は、そのテキストの一部です。
列は [データブロック](#data-blocks) の本文の余白の変更を除いて保ちます。
フレームが読む `data` ブロックでは、Db がそれを値の一部として持つからです。
メタデータや必須の `title` の境界を優先します。
検出が拒否するため、スラッシュのコメントを見出し前へ移しません。
見出しの前のコメント行は第 1 列に置きます。
行頭は規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[journey](./journey.ja.md#コメント)、[timeline](./timeline.ja.md#コメント)、
[c4](./c4.ja.md#コメント)も、見出しの前のコメント行をそう印字します。

[fixture: eventmodeling/comments/inline-gap-run-and-touching]
[test: an em space before a `//` comment after a statement of an eventmodeling diagram]
[test: a sequence diagram keeps U+2029 before a comment that a statement follows as written]
[test: a sequence diagram puts a comment after U+2028 at the end of the text on a line of its own]
[test: a timeline keeps U+2029 before a comment after its header that a statement follows as written]
[test: a timeline puts a comment after its header and U+2028 at the end of the text on a line of its own]
[test: a user journey keeps U+2029 before a comment after its header that a statement follows as written]
[test: a user journey puts a comment after its header and U+2028 at the end of the text on a line of its own]
[test: a user journey prints a no-break space before a comment after its header as one space]
[test: a timeline prints U+3000 before a comment after its header as one space]
[test: a user journey prints a run before a comment after its title as one space]
[test: a timeline prints a run before a comment after its title as one space]
[test: a sequence diagram prints a run before a comment after its title as one space]
[fixture: eventmodeling/comments/standalone-native-comments]
[test: a no-break space before a `%%` comment after a statement of an eventmodeling diagram]
[test: U+3000 before a `//` comment after a statement of an eventmodeling diagram]
[test: U+2028 before a slash comment after a statement of an eventmodeling diagram]
[test: U+2029 before a `%%` comment after a statement of an eventmodeling diagram]
[test: a no-break space before a comment that a statement follows, after a statement of an eventmodeling diagram]
[test: U+2028 before a comment that a statement follows, after a statement of an eventmodeling diagram]
[test: U+2029 before a comment that a statement follows, after a statement of an eventmodeling diagram]
[test: U+3000 before a comment that a statement follows, after a statement of an eventmodeling diagram]
[test: U+000B before a comment after a statement of an eventmodeling diagram]
[test: U+000C before a comment after a statement of an eventmodeling diagram]
[test: U+1680 before a comment after a statement of an eventmodeling diagram]
[test: U+2000 before a comment after a statement of an eventmodeling diagram]
[test: U+2001 before a comment after a statement of an eventmodeling diagram]
[test: U+2002 before a comment after a statement of an eventmodeling diagram]
[test: U+2003 before a comment after a statement of an eventmodeling diagram]
[test: U+2004 before a comment after a statement of an eventmodeling diagram]
[test: U+2005 before a comment after a statement of an eventmodeling diagram]
[test: U+2006 before a comment after a statement of an eventmodeling diagram]
[test: U+2007 before a comment after a statement of an eventmodeling diagram]
[test: U+2008 before a comment after a statement of an eventmodeling diagram]
[test: U+2009 before a comment after a statement of an eventmodeling diagram]
[test: U+200A before a comment after a statement of an eventmodeling diagram]
[test: U+202F before a comment after a statement of an eventmodeling diagram]
[test: U+205F before a comment after a statement of an eventmodeling diagram]
[test: U+FEFF before a comment after a statement of an eventmodeling diagram]
[test: a no-break space before a comment after an entity declaration of an eventmodeling diagram]
[test: U+3000 before a comment after an entity declaration of an eventmodeling diagram]
[test: U+2028 before a comment after an entity declaration of an eventmodeling diagram]
[test: U+2029 before a comment after an entity declaration of an eventmodeling diagram]
[test: a no-break space before a comment after a clause keyword of an eventmodeling diagram]
[test: U+3000 before a comment after a clause keyword of an eventmodeling diagram]
[test: U+2028 before a comment after a clause keyword of an eventmodeling diagram]
[test: U+2029 before a comment after a clause keyword of an eventmodeling diagram]
[test: a no-break space before a comment after the closing brace of a block of an eventmodeling diagram]
[test: U+3000 before a comment after the closing brace of a block of an eventmodeling diagram]
[test: U+2028 before a comment after the closing brace of a block of an eventmodeling diagram]
[test: U+2029 before a comment after the closing brace of a block of an eventmodeling diagram]
[test: a no-break space before a comment after the header of an eventmodeling diagram]
[test: U+3000 before a comment after the header of an eventmodeling diagram]
[test: U+2028 before a comment after the header of an eventmodeling diagram]
[test: U+2029 before a comment after the header of an eventmodeling diagram]
[test: a no-break space before a comment after a GWT header of an eventmodeling diagram]
[test: U+3000 before a comment after a GWT header of an eventmodeling diagram]
[test: U+2028 before a comment after a GWT header of an eventmodeling diagram]
[test: U+2029 before a comment after a GWT header of an eventmodeling diagram]
[test: a no-break space before a comment after a GWT item of an eventmodeling diagram]
[test: U+3000 before a comment after a GWT item of an eventmodeling diagram]
[test: U+2028 before a comment after a GWT item of an eventmodeling diagram]
[test: U+2029 before a comment after a GWT item of an eventmodeling diagram]
[test: a no-break space before a comment after a data declaration of an eventmodeling diagram]
[test: U+3000 before a comment after a data declaration of an eventmodeling diagram]
[test: U+2028 before a comment after a data declaration of an eventmodeling diagram]
[test: U+2029 before a comment after a data declaration of an eventmodeling diagram]
[test: a no-break space before a comment after a note declaration of an eventmodeling diagram]
[test: U+3000 before a comment after a note declaration of an eventmodeling diagram]
[test: U+2028 before a comment after a note declaration of an eventmodeling diagram]
[test: U+2029 before a comment after a note declaration of an eventmodeling diagram]
[test: a no-break space before a comment after a data reference of an eventmodeling diagram]
[test: U+3000 before a comment after a data reference of an eventmodeling diagram]
[test: U+2028 before a comment after a data reference of an eventmodeling diagram]
[test: U+2029 before a comment after a data reference of an eventmodeling diagram]
[test: a no-break space before a comment after an inline body of an eventmodeling diagram]
[test: U+3000 before a comment after an inline body of an eventmodeling diagram]
[test: U+2028 before a comment after an inline body of an eventmodeling diagram]
[test: U+2029 before a comment after an inline body of an eventmodeling diagram]
[test: a no-break space before a comment after a source reference of an eventmodeling diagram]
[test: U+3000 before a comment after a source reference of an eventmodeling diagram]
[test: U+2028 before a comment after a source reference of an eventmodeling diagram]
[test: U+2029 before a comment after a source reference of an eventmodeling diagram]
[test: a no-break space before a comment after a message of a sequence diagram]
[test: U+3000 before a comment after a message of a sequence diagram]
[test: U+2028 before a comment that a statement follows, after a message of a sequence diagram]
[test: U+2029 before a comment at the end of the text, after a message of a sequence diagram]
[test: a no-break space before a comment after the header of a timeline]
[test: U+2028 before a comment that a statement follows, after the header of a timeline]
[test: U+2029 before a comment at the end of the text, after the header of a timeline]
[test: U+3000 before a comment after the header of a user journey]
[test: U+2028 before a comment that a statement follows, after the header of a user journey]
[test: U+2029 before a comment at the end of the text, after the header of a user journey]

[fixture: eventmodeling/comments/inline-comments-keep-contact]

[fixture: eventmodeling/comments/native-percent-and-bare-percent]

[test: eventmodeling/comments/native-line-comment-ls-stays-content]

[fixture: eventmodeling/comments/slash-comment-before-title-identifier]

[fixture: eventmodeling/comments/do-not-move-slash-comment-before-header]

[fixture: eventmodeling/comments/comment-line-before-header-indented]
[fixture: eventmodeling/comments/comment-line-before-header-tab]
[fixture: eventmodeling/comments/comment-lines-before-header-several]
[fixture: eventmodeling/comments/comment-line-before-header-after-frontmatter]

[test: eventmodeling/comments/comment-after-ls-gap-ends-at-lf]

[fixture: eventmodeling/comments/comment-line-inside-data-block-kept]

[fixture: eventmodeling/comments/comment-line-inside-note-block-kept]

[fixture: eventmodeling/comments/comment-line-inside-accdescr-block-kept]

[fixture: eventmodeling/comments/comment-line-inside-slash-block-comment-kept]

[fixture: eventmodeling/comments/comment-line-inside-hidden-yaml-kept]

[corpus fixture: eventmodeling/comment-line-directive-in-data]

[corpus fixture: eventmodeling/comment-line-ignored-semicolon-in-data]

[corpus fixture: eventmodeling/comment-line-entity-in-data]

[corpus fixture: eventmodeling/comment-line-line-separator]

[corpus fixture: eventmodeling/comment-line-paragraph-separator]

[corpus fixture: eventmodeling/comment-line-directive]

[test: eventmodeling/comments/ps-native-line-comment-remains-owned]

[fixture: eventmodeling/comments/mixed-directive-order]

[fixture: eventmodeling/comments/split-statements-block]

[fixture: eventmodeling/comments/inline-percent-before-next-statement]

入力（エスケープ表記）: `"eventmodeling\ntf 01 evt A /*c*/ tf 02 evt B\n"`

出力
([comments/split-statements-block-output.mmd](../tests/fixtures/eventmodeling/comments/split-statements-block-output.mmd)):

```mmd
eventmodeling
tf 01 evt A
/*c*/ tf 02 evt B
```

### Default size branches

Eventmodeling の Db は、
原文が `maxTextSize` （既定は UTF-16 コード単位で
50000）を超えるときにコメント行を除くので、超えないときはコメント行を残します。
この点で flowchart と異なります。
agentflow も同じ上限を持ちます（詳しくは、
[既定のサイズによる分岐](./agentflow.ja.md#default-size-branches) を参照）。
フロントマター、その後ろの空白だけの行、ディレクティブを除いた後で測り、
CRLF は 1 単位、サロゲートペアは 2 単位と数えます。

[fixture: default-size-branches/size-frontmatter-not-counted]
[fixture: default-size-branches/size-frontmatter-trivia-not-counted]
[fixture: default-size-branches/size-directive-not-counted]
[fixture: default-size-branches/size-utf16-surrogate]

50000 以上のときは、図のテキスト全体とその終わりを保ちます。

[fixture: default-size-branches/size-preserving-to-fallback-unsafe]
[fixture: default-size-branches/size-at-limit-indented-comment]

それ未満のときは、印字する計画の長さも 50000 未満に収まる場合だけ、
通常の整形を行い、そうでなければ図のテキスト全体とその終わりを保ちます。

[fixture: default-size-branches/size-below-planned-crossing]
[fixture: default-size-branches/size-below-planned-crossing-indented-comment]
[fixture: default-size-branches/size-below-planned-fits-indented-comment]

字下げや末尾の改行で上限を越えると、
値の中のコメント行が除かれて Db が変わるので、それを防ぎます。
50000 単位でも 49999 単位でも、
後ろの行（コメント行を含む）が 1 つ以上の空白の内側にある data
本文の最初の行を字下げすると、12.3.0 は別のテキスト、構造、形状を描きます。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
境界そのものはコーパスが、CRLF、行の中のディレクティブ、
フロントマターの場合も含めて確かめます。

[corpus fixture: eventmodeling/comment-default-size-equal]
[corpus fixture: eventmodeling/comment-default-size-above]
[corpus fixture: eventmodeling/comment-default-size-equal-crlf]
[corpus fixture: eventmodeling/comment-default-size-above-crlf]
[corpus fixture: eventmodeling/comment-default-size-equal-inline-directive]
[corpus fixture: eventmodeling/comment-default-size-above-inline-directive]
[corpus fixture: eventmodeling/comment-default-size-equal-frontmatter]
[corpus fixture: eventmodeling/comment-default-size-above-frontmatter]
[corpus fixture: eventmodeling/frontmatter-extra-trivia-below]
[corpus fixture: eventmodeling/frontmatter-extra-trivia-boundary]
[corpus fixture: eventmodeling/frontmatter-extra-trivia-above]
[corpus fixture: eventmodeling/frontmatter-extra-whitespace-line-boundary]

### Global directives

共有ディレクティブ配置を使います。
同じ印字行のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
文・節・項目を行に分ける場合、間のディレクティブは次の単位へ付け、
右の接し方を保ちます。
規則 1 は、2 つの単位の間のディレクティブの印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[sequence](./sequence.ja.md#ディレクティブ)、
[flowchart](./flowchart.ja.md#ディレクティブ)、
[journey](./journey.ja.md#ディレクティブ)も、この隙間を同じに印字します。
内容、順序、複数行の内部、値の中の位置、未完 EOF の終端を保ちます。
独立した開始は所属本文の段に揃えます。
行頭は規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[flowchart](./flowchart.ja.md#ディレクティブ)と
[sequence](./sequence.ja.md#ディレクティブ)は、自分の行にあるディレクティブを、
周りの文の段に置きます。
[journey](./journey.ja.md#ディレクティブ)は、後ろの文の段に置きます。
共通文の境界は普通の空白規則でなく原文隙間全体を保ちます。
除去されるディレクティブ自体は必要な空白の代わりになりません。

閉じていないディレクティブは、引数の後の空白を、改行も含めて取ります。
そのため次の行はその行に続き、その行は書かれたまま印字します（詳しくは、
[閉じていないディレクティブがつなぐ行](./compatibility.ja.md#閉じていないディレクティブがつなぐ行)
を参照）。
複数行の description block の `}` の後にそのディレクティブがあるときも同じで、
`accDescr {alpha`、改行、`beta} %%{wrap foo`、改行、` tf 23 evt End` は、
`tf` の前の空白も含めて、そのまま残ります。

[fixture: eventmodeling/global-directives/description-block-end-line-with-unclosed-directive-kept]
[fixture: eventmodeling/global-directives/directive-same-line-contacts]

[fixture: eventmodeling/global-directives/directive-follows-split-next-statement]

[fixture: eventmodeling/global-directives/directive-follows-split-next-gwt-item]

[fixture: eventmodeling/global-directives/directive-follows-split-clause]

[fixture: eventmodeling/global-directives/directive-in-value-exact]

[fixture: eventmodeling/global-directives/directive-creates-comment-mark-keep-source]

[fixture: eventmodeling/global-directives/unfinished-free-text-eof-unchanged]

[fixture: eventmodeling/global-directives/standalone-directive-before-normal-frame]

入力（エスケープ表記）:
`"eventmodeling tf%%{wrap}%% 01 evt Alpha%%{wrap}%%->>%%{wrap}%%02"`

出力
([global-directives/directive-same-line-contacts-output.mmd](../tests/fixtures/eventmodeling/global-directives/directive-same-line-contacts-output.mmd)):

```mmd
eventmodeling
tf %%{wrap}%%01 evt Alpha %%{wrap}%%->> %%{wrap}%%02
```

### Semicolons

書かれたセミコロンをすべて残します。
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
規則 2 が与える 1 行の形は、行の規則が無視するものを変えてしまうからです。
1 行の形については [Declarations and notes](#declarations-and-notes)
を参照してください。
それ以外の複数行の文は、1 行の文と同じように整形します。
行の規則が無視する `;` は mermaid.js が除くため、
その両側のトークンが接していれば 1 つのトークンになります。
`;` の後の隙間は空白の有無を保ち、`/*style:#x*/;title` は書かれたまま残します。
`/*style:#x*/ title` は拒否されるためです。

[fixture: semicolons/stretch-kept-rest-formatted]
[fixture: semicolons/ignored-semicolon-touches-next-atom]
[fixture: semicolons/no-stretch-formatted]
[fixture: semicolons/protected-gwt-title-hidden-gap-remains-zero]

最初の保護された本文行は所属の段に揃え、内容と後続列は書かれたままです。
`eventmodeling gwt 01 given evt %%{{native}}%%` と改行の後の `title` は、
第 1 列に残します。
対象にする版の mermaid.js のすべてが、
2 つの空白で字下げした形を拒否するためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
ほかの図種なら字下げします（[字下げ](#indentation)を参照）。
必須の識別子と共通値の空白は構造上の字下げより優先します。
`eventmodeling data D {`、`x`、
`}` の後の ` accDescr: style:#x;` の先頭の空白は、残します。
対象にする版の mermaid.js のすべてが、その空白のない形を拒否するためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
子の本文の開始境界も保護行に残し、次の整形で分かれ方が変わるのを防ぎます。
文法上のセミコロンがないため `verbatimStyleLines` は `false` です。
`style` や `classDef` だけでは行全体を固定しません。

`;` を含む行は、その行の文をまとめて残します。
複数行の description block の最後の行に `;` があり、
その `}` の後ろに文が続くときも同じです。
`accDescr {x`、改行、`y;}` は、`tf 17 evt End` と同じ行に残ります。

[fixture: eventmodeling/semicolons/description-block-end-line-keeps-next-statement]
[fixture: eventmodeling/semicolons/native-gwt-value]

[fixture: eventmodeling/semicolons/native-frame-value]

[fixture: eventmodeling/semicolons/selected-external-semicolon-preserved]

[fixture: eventmodeling/semicolons/semicolon-inside-inline-data-protected]

[fixture: eventmodeling/semicolons/two-semicolons-removing-selected-changes-db]

[fixture: eventmodeling/semicolons/no-grammar-semicolon-style-word-line-formats]

[fixture: eventmodeling/semicolons/gwt-protected-opening-kept]

[fixture: eventmodeling/semicolons/metadata-across-selected-semicolon-gap-exact]

[fixture: eventmodeling/semicolons/selected-semicolon-exposes-native-lf]

[fixture: eventmodeling/semicolons/classdef-trigger-inline-unchanged]

[fixture: eventmodeling/semicolons/protected-metadata-prefix-is-value-whitespace]

[fixture: eventmodeling/semicolons/protected-gwt-title-hidden-gap-remains-zero]

[fixture: eventmodeling/semicolons/prefix-crosses-clause-header]

[fixture: eventmodeling/semicolons/two-hidden-clause-prefixes]

入力（エスケープ表記）:
`"eventmodeling tf 01 evt Alpha \"style:#x\" ;rf 02 cmd Beta"`

出力
([semicolons/selected-external-semicolon-preserved-output.mmd](../tests/fixtures/eventmodeling/semicolons/selected-external-semicolon-preserved-output.mmd)):

```mmd
eventmodeling tf 01 evt Alpha "style:#x"; rf 02 cmd Beta
```

### Blank lines

文・項目間の普通の ASCII 空行は最大 1 行、文書・本文の端は削除します。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が与える形です。
[flowchart](./flowchart.ja.md#空行)、[sequence](./sequence.ja.md#空行)、
[gantt](./gantt.ja.md#空行)、[journey](./journey.ja.md#空行)は、
空行の連なりを空行 1 行にし、本文の初めと終わりの空行を除きます。
Prettier がコードに行うのと同じです。
普通の空白だけの行は空にします。
data の内部は [データブロック](#data-blocks) の規則に従います。
説明、隠れた形、ディレクティブの内部、保持する前置部分、
共通文の消費 LF 境界は原文どおりです。

[fixture: eventmodeling/blank-lines/ordinary-blanks-bounded]

[fixture: eventmodeling/blank-lines/gwt-blanks-bounded]

[fixture: eventmodeling/blank-lines/block-blank-contents-retained]

[fixture: eventmodeling/blank-lines/hidden-spare-blank-before-normal-frame-collapse]

[fixture: eventmodeling/blank-lines/description-empty-ends-same-line-common-no-split]

入力（エスケープ表記）:
`"\n\neventmodeling\n\n\ntf 01 evt Alpha\n\n \t\n\nrf 02 cmd Beta\n\n"`

出力
([blank-lines/ordinary-blanks-bounded-output.mmd](../tests/fixtures/eventmodeling/blank-lines/ordinary-blanks-bounded-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha

rf 02 cmd Beta
```

### Trailing whitespace

見出しや構造部品の後の、害のない外側の ASCII 空白だけを削ります。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が与える形です。
Prettier は、JavaScript、CSS、YAML で、行末に空白を印字しません。
[requirement](./requirement.ja.md#トークンの間の空白) と
[radar](./radar.ja.md#trailing-whitespace)も、行末の空白を落とします。
物理行ごとの両端の空白の除去ではなく所有ノードで判断します。
メタデータの値と前置部分、許容した余白変更以外の data 内部、
コメント・ディレクティブの末尾、隠れた形・data の閉じの境界、保護区間は、
空白が内容や受理条件になりうるため保ちます。

[fixture: eventmodeling/trailing-whitespace/harmless-trailing-structure]

[fixture: eventmodeling/trailing-whitespace/metadata-trailing-whitespace-retained]

[fixture: eventmodeling/trailing-whitespace/metadata-trailing-whitespace-removal-changes]

入力（エスケープ表記）:
`"eventmodeling \t\ntf 01 evt Alpha \t\nentity Shop.Buy \t"`

出力
([trailing-whitespace/harmless-trailing-structure-output.mmd](../tests/fixtures/eventmodeling/trailing-whitespace/harmless-trailing-structure-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
entity Shop.Buy
```

### Long lines

`printWidth` では折り返しません。
普通の空白だけの部品間改行は空白規則に従い、
注釈類の継続行は構造上の段を保ちます。
規則 1 は、コメントやディレクティブの隣の改行の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[sequence](./sequence.ja.md#複数行の文)、[gantt](./gantt.ja.md#複数行の文)、
[journey](./journey.ja.md#複数行の文)も、そのような改行を残します。
ただし、ほかの規則が配置を書かれたまま残す所は別です。
物理行を結ぶコメント領域と、`;` を含む行がそれです。
行頭は規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[flowchart](./flowchart.ja.md#複数行の文)、
[sequence](./sequence.ja.md#複数行の文)、
[xychart](./xychart.ja.md#複数行の文)も、文の後続の行と、
その間のコメントやディレクティブの行を、文より 1 段深く置きます。
ただし、ほかの規則が配置を書かれたまま残す所は別です。
物理行を結ぶコメント領域と、`;` を含む行がそれです。
`{` が後の行にあるブロックを閉じる `}` は、文の段に置きます。
[ER](./er.ja.md#属性ブロック)も、実体のブロックの `}` を同じに置きます。
構造上の分割を加えるのは決定済みの GWT 節・項目配置です。
値、隠れた形、メタデータ、保護境界の内容は、
[データブロック](#data-blocks) の限定的な本文の余白の変更を除いて保ちます。
幅に依存する選択を避けて字句境界を明示し、行内の data に禁止 LF を足しません。

[fixture: eventmodeling/long-lines/long-structural-line-no-wrap]
[fixture: eventmodeling/long-lines/break-next-to-comment]
[fixture: eventmodeling/long-lines/break-next-to-directive]
[fixture: eventmodeling/long-lines/break-next-to-percent-comment]
[fixture: eventmodeling/comments/block-opener-on-a-later-line-after-a-comment-line]

[fixture: eventmodeling/long-lines/safe-structural-wrapping-alternate]

[fixture: eventmodeling/long-lines/inline-value-wrapping-rejects]

入力（エスケープ表記）:
`"eventmodeling tf 001 evt VeryLongNamespace.VeryLongEventName ->> 002 ->> 003 ->> 004 [[LongDataName]] \u0060text\u0060 {a very long authored payload}"`

出力
([long-lines/long-structural-line-no-wrap-output.mmd](../tests/fixtures/eventmodeling/long-lines/long-structural-line-no-wrap-output.mmd)):

```mmd
eventmodeling
tf 001 evt VeryLongNamespace.VeryLongEventName ->> 002 ->> 003 ->> 004 [[LongDataName]] `text` {a very long authored payload}
```

### Quotes

印字処理は引用符を付けたり外したりしません。
名前には引用符で囲む形がなく、`tf 01 evt "Alpha"` は拒否されます。
フレームのデータの本文（行内の波括弧の中か、`data` 宣言のブロック内）、
タイトル、アクセシビリティの値にある引用符は、テキストの文字です。
Db は、データ `{"x"}` には `{"x"}` を、`{x}` には `{x}` を保持し、
`accTitle: "T"` と書かれたタイトルには `accTitle: "T"` を保持します。
そのため、引用符の有無を変えて同じテキストとして書けるものはなく、
どのテキストも変えません。

[fixture: quotes/quotes-as-written]

入力
([quotes/quotes-as-written-input.mmd](../tests/fixtures/eventmodeling/quotes/quotes-as-written-input.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha {"x"}
tf 02 evt Beta {x}
tf 03 evt Gamma [[D]]
data D {
  "y"
}
```

出力
([quotes/quotes-as-written-output.mmd](../tests/fixtures/eventmodeling/quotes/quotes-as-written-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha {"x"}
tf 02 evt Beta {x}
tf 03 evt Gamma [[D]]
data D {
  "y"
}
```

### Frontmatter yaml

安全な本物の先頭フロントマターだけに共有 YAML 整形処理を使います。
壊れた YAML、字下げ・空白付き囲み、HTML 引用符の危険、
囲みを作る本文は既存保護条件により原文を保ちます。
YAML の入れ子は幅 0 でも正の最小字下げを使います。
`tabWidth` が 0 のとき、対象にする版の mermaid.js のすべてが、
字下げのないブロックスカラーを拒否し、
入れ子の `config` の値が入れ子でなくなると、図を別に描きます。
詳しくは [フロントマター](./compatibility.ja.md#フロントマター)
を参照してください。
`textBeforeHeader` があれば見出しまでの前置部分全体を保ちます。
図固有の YAML や `DIRECTIVE` を本物のフロントマター・設定へ昇格させると、
受理が変わる場合があるためです。

[fixture: eventmodeling/frontmatter-yaml/safe-real-yaml]

[fixture: eventmodeling/frontmatter-yaml/positive-minimum-yaml-indent]

[fixture: eventmodeling/frontmatter-yaml/retained-prefix-whole]

[fixture: eventmodeling/frontmatter-yaml/real-plus-retained-plus-second-scan]

[fixture: eventmodeling/frontmatter-yaml/html-frontmatter-guard-unchanged]

[fixture: eventmodeling/frontmatter-yaml/delimiter-padding-kept]

[fixture: eventmodeling/frontmatter-yaml/indented-fences-kept]

入力（エスケープ表記）:
`"---\ntitle: 'YamlTitle'\nconfig: {eventmodeling: {padding: 12}}\n---\neventmodeling tf 01 evt Alpha"`

出力
([frontmatter-yaml/safe-real-yaml-output.mmd](../tests/fixtures/eventmodeling/frontmatter-yaml/safe-real-yaml-output.mmd)):

```mmd
---
title: "YamlTitle"
config: { eventmodeling: { padding: 12 } }
---
eventmodeling
tf 01 evt Alpha
```

### Line terminators and unicode

共有埋め込み先方針に従い、CR・CRLF は LF として読み、
値や隠れた形の内部も設定の `endOfLine` で出力します。
Prettier はプラグインがテキストを読む前にそれらを変換し、
mermaid.js は `\r\n` と単独の `\r` を `\n` と同じ改行として読むので、
Db は変わりません。
詳しくは [行末](./compatibility.ja.md#行末) を参照してください。
普通の図固有の Unicode 隙間は部品の規則で整えます。
共通値と行コメントの LS・PS、ブロックの閉じの先読みとしての役割は保ちます。
消費される LF とは交換できません。
Unicode の値の端の空白も除きません。
Prettier の先頭 BOM の扱いは既存の制限に従います。

[test: eventmodeling/line-terminators-and-unicode/cr-block-and-description-to-lf]

[test: eventmodeling/line-terminators-and-unicode/crlf-block-and-common-to-lf]

[test: eventmodeling/line-terminators-and-unicode/configured-crlf-output]

[test: eventmodeling/line-terminators-and-unicode/configured-cr-output-hidden]

[test: eventmodeling/line-terminators-and-unicode/ls-ps-native-whitespace-safe-ordinary-components]

[test: eventmodeling/line-terminators-and-unicode/ls-ps-description-value-kept]

[test: eventmodeling/line-terminators-and-unicode/block-ls-boundary-stays-outside-value]

[test: eventmodeling/line-terminators-and-unicode/common-unicode-edges-kept]

[test: eventmodeling/line-terminators-and-unicode/leading-bom-host]

[corpus fixture: eventmodeling/lex-block-close-ps-boundary]

[corpus fixture: eventmodeling/line-inline-ls]

[corpus fixture: eventmodeling/line-inline-ps]

### Source order

未使用のモデルの実体・data、note、GWT、型タグ、重複する参照元、後続の同名 data、
上書きされた共通文、参照と併記した行内の data も含め、全出現を原順に保ちます。
変えるのは許容した本文余白も含む、決定済みの配置だけです。
重複削除で比較 Db が等しくても書かれた出現を失い、
data の並べ替えは最初の検索結果も変える場合があります。

[fixture: eventmodeling/source-order/all-occurrences-retained]

[fixture: eventmodeling/source-order/deduplicating-source-db-equal-but-not-permitted]

[fixture: eventmodeling/source-order/reordering-duplicate-data-changes-first-lookup]

[fixture: eventmodeling/source-order/unread-model-note-gwt-retained-not-raw-line-lock]

[fixture: eventmodeling/title/overwritten-occurrences]

[corpus fixture: eventmodeling/common-repeat-empty]

[corpus fixture: eventmodeling/common-description-repeat]

入力（エスケープ表記）:
`"eventmodeling entity Shop.Alpha entity Shop.Alpha note 99 {\nunused\n}\ngwt 99 given evt Alpha then cmd Beta tf 01 evt Alpha ->> 02 ->> 02 [[D]] {unused} data D {\nfirst\n}\ndata D {\nsecond\n}\ndata Unused {\nx\n}\n"`

出力
([source-order/all-occurrences-retained-output.mmd](../tests/fixtures/eventmodeling/source-order/all-occurrences-retained-output.mmd)):

```mmd
eventmodeling
entity Shop.Alpha
entity Shop.Alpha
note 99 {
  unused
}
gwt 99
  given
    evt Alpha
  then
    cmd Beta
tf 01 evt Alpha ->> 02 ->> 02 [[D]] {unused}
data D {
  first
}
data D {
  second
}
data Unused {
  x
}
```

### Final newline

普通の受理入力は設定の改行 1 個で終え、末尾の普通の空行列を削除します。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が与える形です。
[pie](./pie.ja.md#final-newline)、[packet](./packet.ja.md#final-newline)、
[kanban](./kanban.ja.md#末尾の改行)は、テキストを改行 1 個で終え、
その前の空行を削除します。
Prettier も、JavaScript、CSS、YAML でファイルを 1 つの改行で終え、
最後の行の後に空行を置きません。
mermaid.js は、読む前にテキストへ LF を足します。
詳しくは [テキストの終わり](../../spec/docs/common.ja.md#テキストの終わり)
を参照してください。
末尾の LF はすでに読む文字です。
必要な隠れた形・data の閉じの空白、保護原文、
EOF に達する未完ディレクティブは字句上の終端を保ちます。
共有の末尾方針に揃えつつ、ディレクティブ内容への LF 追加や、
ブロック終端トークンの先読みの変更を避けます。

[fixture: eventmodeling/final-newline/final-common-line-newline]

[fixture: eventmodeling/final-newline/final-native-comment-newline]

[fixture: eventmodeling/final-newline/final-hidden-closer-padding-kept]

[fixture: eventmodeling/final-newline/final-block-padding-kept]

[fixture: eventmodeling/final-newline/hidden-eof-with-no-lf-gets-lf]

入力（エスケープ表記）: `"eventmodeling accDescr: D"`

出力
([final-newline/final-common-line-newline-output.mmd](../tests/fixtures/eventmodeling/final-newline/final-common-line-newline-output.mmd)):

```mmd
eventmodeling accDescr: D
```

### Specified readings

既存の 5 差異、directive-as-token-boundary、
ignored-semicolon-as-token-boundary、html-tag-in-frontmatter、
embedded-data-opaque、c4-keyword-anywhere に従います。
新しい差異を加えず、拒否入力の単位の途中での分断を修復しません。
素の mermaid.js による拒否には素の mermaid.js の Db がないため、
必要な比較は記録された仕様が定める読みを使います。
ファイルの拒否入力は構文エラーとなって書き換えず、
Markdown では埋め込み先に任せます。

[corpus fixture: eventmodeling/directive-arrow-inside]

[corpus fixture: eventmodeling/lex-semicolon-frame-id-inside]

[corpus fixture: eventmodeling/div-html-frontmatter-value]

[corpus fixture: eventmodeling/div-frontmatter-invalid]

[corpus fixture: eventmodeling/c4-container-data]

### Markdown fences

共有の接続を使い、最上位、リスト、引用の外側の字下げを除いた本文を整形します。
設定、保持する前置部分、共通文の空白も同じ規則です。
本文の末尾の空行は、
ファイルの末尾と同じように除きます（[Final newline](#final-newline) を参照）。
Prettier がほかの言語のコードの fence を整形するのと同じです。
埋め込み先は埋め込んだ出力の末尾改行と最後のコード行の余白を削るため、
最後の保持余白は単独ファイルと同じ保証を持ちません。
拒否された本文は Prettier の通常のコード処理に任せます。

[test: eventmodeling Markdown: top-level]

[test: eventmodeling Markdown: data-declaration]

[test: eventmodeling Markdown: list]

[test: eventmodeling Markdown: quote]

[test: eventmodeling Markdown: zero]

[test: eventmodeling Markdown: tabs]

[test: eventmodeling Markdown: metadata]

[test: eventmodeling Markdown: hidden-boundary]

[test: eventmodeling Markdown: prefix]

[test: eventmodeling Markdown: frontmatter]

[test: eventmodeling Markdown: final-hidden-padding]

[test: eventmodeling Markdown: rejected]
