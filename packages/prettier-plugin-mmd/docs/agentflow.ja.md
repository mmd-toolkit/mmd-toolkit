# Agentflowの整形規則

English version: [agentflow.md](./agentflow.md)

書かれた構文木から`agentflow-beta`を整形する規則です。
仕様の読み、出現順序、埋め込み原文を保ちます。
共有するflowchartの規則と理由を参照し、違いはagentflowの文で説明します。
入力は末尾改行の有無と空白が見えるよう、エスケープしたJSON文字列で示します。
出力のコードブロックは固定fixtureの内容です。
Unicodeと制御文字のケースはテストのエスケープした文字列に置きます。

整形は構文修復ではありません。
解析失敗はSyntaxErrorとし、Markdownではホストへ処理を返します。
受理する差異は、
[mermaid.js と違って読む入力](./compatibility.ja.md#mermaidjs-と違って読む入力)
に従って仕様の読みで整形します。
拒否と差異を含む全corpus入力をcorpusテストで確認します。
たとえば`"Agentflow-beta TB\nA\n"`は見出しを修復せず拒否します。
[corpus fixture: agentflow/header-upper]
仕様の乖離のうちagentflowに当たるのは6つです。
directive-as-token-boundary、ignored-semicolon-as-token-boundary、
embedded-data-opaque、html-tag-in-frontmatter、bare-percent-line-before-header、
tokenless-empty-forms です。
直前の文字や後続の改行を取るコメント、空行の対応付け、C4の検出は適用せず、
agentflowの文字にあるC4の語はagentflowの文字のままです。
予約語`click`も適用しません。
整形は印字中にmermaid.jsへ問い合わせず、
mermaid.jsの読みが違うからと結果を戻しません。
整形は構文修復ではなく、例外の読みは仕様がすでに定義しているためです。

## Rules

### Header

[方向](./flowchart.ja.md#方向)と同じく、見出しを第1列に置き、
方向の綴りを保ちます。
見出しを見つけやすくし、見出しと本文でTDの方針を揃えるためです。
agentflowが受理する見出しは小文字の`agentflow-beta`だけです。
方向の省略と記号を保ち、次行のLRは頂点のままです。
通常の後続文は本文へ移し、directiveの付着はDirectivesに従います。
[fixture: header/header-column] [fixture: header/header-direction-spelling]
[fixture: header/header-inline-separated]
[fixture: header/header-next-line-direction] [fixture: header/header-symbol]
記号の方向は、
[flowchart](./flowchart.ja.md#方向)と同じく空白 1 つの後に置きます。
`agentflow-beta<` は `agentflow-beta <` と印字します。
[fixture: header/header-symbol-touching-spaced]
[test: agentflow: U+2028 between the header keyword and its direction]

入力（escape 表記）: `"agentflow-beta"`。 [fixture: header/header-only]

出力
([header/header-only-output.mmd](../tests/fixtures/agentflow/header/header-only-output.mmd)):

```mmd
agentflow-beta
```

### Indentation

[字下げ](./flowchart.ja.md#字下げ)と同じ規則と理由です。
元の桁位置は所属を決めないため、木の入れ子を字下げで示します。
見出しとflow/globalの本文を1段深くし、endを開始語に揃えます。
connectorには本文がありません。
`useTabs`では1段をタブ1つにします。
agentflowは共有の意味を持つ字下げ幅を使い、
`tabWidth: 0`でも本文の1段を最低1つの空白にします。
字下げのある`accTitle: direction LR`は方向文ですが、1桁目へ移すとDbが変わり、
styleで始まる方向行は拒否されるためです。
桁位置で読みが変わる非方向行はDirectionに従って元の字下げを保ちます。
[fixture: indentation/indent-direction-unsafe]
[fixture: indentation/indent-nested] [fixture: indentation/indent-tabs]
[fixture: indentation/indent-zero]

入力（escape 表記）: `"agentflow-beta TB\nflow F\nA\nend"`。
[fixture: indentation/indent-four]

出力
([indentation/indent-four-output.mmd](../tests/fixtures/agentflow/indentation/indent-four-output.mmd)):

```mmd
agentflow-beta TB
    flow F
        A
    end
```

### Containers

flowchartの [字下げ](./flowchart.ja.md#字下げ) と
[1 行に 1 文](./flowchart.ja.md#1-行に-1-文) を再利用します。
開始行、本文、終了行で構造を読みやすくするためです。
名前のあるflowと無名flow、global、空の本文と混在する入れ子、文順を保ちます。
globalはコンテナーを出力しなくても所属を変えるのでブロックのままです。
名前やデータを補いません。
agentflowのend/globalが取る空白はASCIIの空白とタブだけです。
LFを名前へ取り込まず、endの後のセミコロンは親の本文の独立した空文です。
[fixture: containers/containers-empty] [fixture: containers/containers-one-line]
[fixture: containers/end-name-not-greedy]
[fixture: containers/global-flatten-unsafe]

入力（escape 表記）: `"agentflow-beta TB\nglobal\t \nA\nend B"`。
[fixture: containers/global-tabs]

出力
([containers/global-tabs-output.mmd](../tests/fixtures/agentflow/containers/global-tabs-output.mmd)):

```mmd
agentflow-beta TB
  global
    A
  end
  B
```

### Names and headings

通常の1断片の名前に明示的なタイトルがある場合は、
[subgraph のヘッダー](./flowchart.ja.md#subgraph-のヘッダー)に従い、
タイトルの `[` を名前に接します。
`flow F [T]` は `flow F[T]` に、
`connector F [T]` は `connector F[T]` になります。
agentflow の文書にあるタイトル付きの見出し 19 件は、すべてこの書き方です。
その範囲は、
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/agentflow.md#L26-L363)
にあります。
どちらの形でも Db は同じです。
タイトルの括弧の内側の空白は落とし、`[ T ]` は `[T]` に、
`["x" ]` は `["x"]` にします。
flowchart と同じ形で、agentflowだけ違う形を選ぶ理由がないためです。
タイトルが別に読まれる所（`[ /x/ ]`、agentflow の `[ x@ ]`）には、
空白を 1 つ残します。
タイトルの端にディレクティブがあれば、隙間に空白を置かないので、
括弧とタイトルに接します。
`flow F[ %%{x}%% T ]` は `flow F[%%{x}%%T]` に、
`flow G[ T %%{x}%% ]` は `flow G[T%%{x}%%]` になります。
`]` と同じ行にある U+2028 と U+2029 は残し、
継続行の先頭にあるものは字下げとして読まれます。
[fixture: names-and-headings/heading-title-directive-at-edge]
[test: agentflow: U+2028 inside the brackets of a flow title]
[test: agentflow: U+2029 inside the brackets of a flow title]
[fixture: names-and-headings/heading-title-padding-dropped]
[fixture: names-and-headings/name-heading-touches-title]
[fixture: names-and-headings/name-heading-touches-title-kinds]
複数の部分からなる名前（消された `click` や空の文字列を含む名前）は、
最初の部分から最後の部分まで、タイトルの前の空白を含めて、書かれたまま残します。
`click` の後では、その空白が click の id を終わらせるので、
`flow F click [T]` と `flow F click[T]` は別の見出しです。
空の文字列の後では Db は同じですが、名前を同じように書かれたまま残します。
[fixture: names-and-headings/name-heading-title-multi-part-name-kept]
名前をディレクティブかコメントが終わらせるときは、その後ろに書かれた空白を、
[ディレクティブ](#directives)と同じく保ちます。
隙間の中にディレクティブがあれば、その後ろに空白があるかどうかを保ち、
書かれていればその空白は 1 つにします。
ディレクティブの前の空白は、`[` がディレクティブから離れているあいだは、
名前がディレクティブまで続くので、
書かれたまま残します（`flow F   %%{init: {}}%% [T]` は変わりません）。
`[` がディレクティブに接していると、名前はディレクティブの前で終わり、
タイトルは名前に接するので、ディレクティブの前の空白は落とします。
`flow H   %%{init: {}}%%[T]` は `flow H%%{init: {}}%%[T]` になります。
[fixture: names-and-headings/name-heading-title-beside-directive]
[fixture: names-and-headings/name-heading-title-gap-run-beside-directive]
[test: agentflow: a comment and U+2028 between a flow name and its title]
`:` と `#` の間の隙間は、flowchart と同じく、空白があるかないかを保ちます。
[fixture: names-and-headings/name-heading-title-after-colon-before-hash]
隙間の U+2028 と U+2029 は、そのまま残します。
[test: agentflow: U+2028 between a flow name and its title]
[test: agentflow: U+2029 between a connector name and its title]

データブロックの `@{` は、タイトルがない通常の 1 つの部分からなる名前に、
タイトルの `[` と同じく接します。
`connector github @{ protocol: "mcp" }` は
`connector github@{ protocol: "mcp" }` に、
`flow F  @{ a: 1 }` は `flow F@{ a: 1 }` と印字します。
mermaid.js が名前の後の空白を trim するので Db は同じであり、
その文書ではデータブロックの `@{` を前の id やタイトルに接して書いています
([`create["create_issue"]@{ ... }`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/agentflow.md#L290))。
ディレクティブやコメントを含む名前は、上に書いたとおり書かれたまま残します。
[fixture: names-and-headings/heading-data-touches-name]
[test: agentflow: U+2029 between a connector name and its data block]

`flow`、`connector`、`global` の後ろの空白は、
空白やタブがいくつ書かれていても空白 1 つにします。
キーワードが空白を 1 文字取り、残りは mermaid.js が名前から trim するからです。
`flow   F["T"]` は `flow F["T"]` に、
空白が続く `global` は `global` になります。
[fixture: names-and-headings/heading-word-gap-collapsed]
隙間のディレクティブは、[ディレクティブ](#directives)のとおりに置きます。
[fixture: names-and-headings/heading-word-gap-beside-directive]
ここまでは名前が 1 つの部分のときの規則で、複数の部分からなる名前は、
上に書いたとおり書かれたまま残します。
[fixture: names-and-headings/name-heading-title-multi-part-name-kept]
隙間の U+2028 と U+2029 は、そのまま残します。
[test: agentflow: U+2028 after the flow word]
[test: agentflow: U+2029 after the connector word]

明示的なタイトルの前にある空白だけの名前は、書かれた文字を保ちます。
除くと、必要な名前がなくなるためです。 [fixture:
names-and-headings/whitespace-name-before-title]

それ以外は、名前の最初の断片から最後の断片までの原文を保ちます。
引用形式の空白、消される`click`、空の説明・文字列・markdown・call、
その間の隙間と後続行の桁位置も含みます。
MermaidがIDから消す場合も、これらは名前の一部です。
flowchartとは異なり、この`click`を拒否せず、endの後のLFを名前に取りません。
connectorにも名前がありますが、閉じる`end`はありません。
[fixture: names-and-headings/name-collapse-unsafe]
[fixture: names-and-headings/name-click-reindent-unsafe]
[fixture: names-and-headings/name-quoted-tail]
[fixture: names-and-headings/name-whitespace-only]
[fixture: names-and-headings/directive-after-erased-string]

名前をclickのIDとして読んだ後は、空白1文字だけでその読みを終えます。
タイトル、データ、区切り、EOFの前でも、そのタブやLFを保ちます。
追加の空白は次の名前の断片です。
空の文字列と空のmarkdown文字列も、この終了文字を消しません。
消される形と後続の名前の文字の間に空白がすでにあれば、
clickの読みは終わっているので、名前の後のLFを取り込んで空行を足しません。
connectorの名前では、消される空文字列に直続する文字が`;`で始まることもあります。
そのclickの読みをLFで終える場合は、文を区切るLFの前にそのLFも保ちます。
除くと後続文が名前に結合され、拒否され得るためです。
[fixture: names-and-headings/connector-empty-string-adjacent-semicolon-exit]
[fixture: names-and-headings/connector-empty-string-adjacent-text-exit]
[fixture: names-and-headings/click-empty-string-lf-body]
[fixture: names-and-headings/click-empty-markdown-eof-tab]
[fixture: names-and-headings/directive-before-click-exit]
[fixture: names-and-headings/empty-string-before-name-space]
[fixture: names-and-headings/empty-string-before-name-lf]
[test: agentflow: empty-string-before-name-ls-flow]
[test: agentflow: empty-string-before-name-ls-connector]
[fixture: names-and-headings/click-empty-markdown-connector-tab]
[fixture: names-and-headings/click-empty-markdown-lf-body]
[fixture: names-and-headings/click-empty-markdown-space-semicolon]
[fixture: names-and-headings/click-empty-string-connector-tab]
[fixture: names-and-headings/click-empty-string-eof-tab]
[fixture: names-and-headings/click-empty-string-space-semicolon]
[fixture: names-and-headings/name-exit-lf-empty-line]
[fixture: names-and-headings/name-exit-lf-semicolon]
[fixture: names-and-headings/name-exit-tab-eof]
[fixture: names-and-headings/name-ordinary-fragment-blank]
[fixture: names-and-headings/name-click-exit-before-data-tab]
[fixture: names-and-headings/name-click-exit-before-title-tab]

click の ID として読む名前が、終了文字なしで EOF に達するときは、
名前の本文を書かれたとおりに保ちます。
加えるのは [Final newline](#final-newline) の末尾の LF だけです。
[fixture: names-and-headings/name-click-exit-eof]

clickのIDの読みを終える文字の後の通常の空行は、Blank linesに従います。
[fixture: names-and-headings/name-exit-lf-empty-line]
[fixture: names-and-headings/name-ordinary-fragment-blank]

区切りの`;`を改行に変えるときは、空の説明ブロックの後で名前を終える、
空白だけの断片を落とします。
`;`の前の空白は名前の文字ですが、印字するLFの前では名前でないためです。
Kept linesによってセミコロンが同じ行に残る場合は保ちます。
[fixture: names-and-headings/empty-description-kept-separator]
flowとconnectorの名前、空白、タブ、空白の連続、LFが続く区切りと、
区切りの連続に適用します。
[fixture: names-and-headings/empty-description-space-flow]
[fixture: names-and-headings/empty-description-tab-flow]
[fixture: names-and-headings/empty-description-two-spaces-flow]
[fixture: names-and-headings/empty-description-separator-lf]
[fixture: names-and-headings/empty-description-separated-semicolons]
[fixture: names-and-headings/empty-description-space-connector]
[fixture: names-and-headings/empty-description-tab-connector]
[fixture: names-and-headings/empty-description-two-spaces-connector]

入力（escape 表記）: `"agentflow-beta TB\nflow F accDescr {} ;A\nend"`。
[fixture: names-and-headings/empty-description-space-flow]

出力
([names-and-headings/empty-description-space-flow-output.mmd](../tests/fixtures/agentflow/names-and-headings/empty-description-space-flow-output.mmd)):

```mmd
agentflow-beta TB
  flow F accDescr {}
    A
  end
```

### Single space gaps

flowchartの [トークンの間の空白](./flowchart.ja.md#トークンの間の空白)
と異なり、style/classDef/class/linkStyleの後、classの値とinterpolate名、
tooltipの前の必須の空白1文字の隙間は決して揃えません。
文法が空白1文字だけを取り、その後の空白は値の文字で、
トークンを期待する場所に空白が2文字あると拒否されることもあるためです。
この1文字として使うタブも保ちます。
directiveを挟む最初のstyleの先頭空白、スタイルの値の中の語と語の間の空白、
空のstyleリスト項目、classDefのエスケープしたコンマ、順序と反復を保ちます。
最初のstyleの空白は、flowchart と同じには揃えません。
各スタイルの最初の `:` の前に空白を置かず、値が空でなければ、
後ろに空白を 1 つ置きます。
スタイルの間の `,` の前に空白を置かず、後ろに空白を 1 つ置きます。
`style A fill :#f00,stroke:  #333` は、
`style A fill: #f00, stroke: #333` になります。
[fixture: single-space-gaps/style-colon-spaced]
番号を指定した `linkStyle` では、`fill` で始まるスタイルの前の `,` の後ろに、
空白があるかないかを保ち、空白の連続は空白 1 つにします。
mermaid.js は先頭だけを読むので、`fill-opacity` も含みます。
[fixture: single-space-gaps/link-style-fill-after-comma-kept]
[fixture: single-space-gaps/link-style-fill-opacity-after-comma-kept]
番号か `default` を指定した `linkStyle` では、`stroke:` で始まるスタイルも、
前に空白があるかないかを保ちます。
look が `handDrawn` のときは、mermaid.js が先頭の `stroke:` を読むからです。
[fixture: single-space-gaps/link-style-stroke-after-comma-kept]
この文のほかのスタイルと `linkStyle default` は、1 つの形で印字します。
詳しくは [同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)
を参照してください。
リンクにも適用される `linkStyle` と `classDef` では、
`stroke` で終わる名前と `:` の間の空白の有無を保ち、
空白の連続は空白 1 つにします。
詳しくは [同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)
を参照してください。
[fixture: single-space-gaps/link-style-stroke-before-colon-kept]
[fixture: single-space-gaps/class-def-stroke-before-colon-kept]
`style` はノードに適用され、1 つの形で印字します。
[fixture: single-space-gaps/style-stroke-before-colon-spaced]
[flowchart](./flowchart.ja.md#トークンの間の空白)と同じく、
`style` のスタイルの末尾のバックスラッシュの後の空白は読まれません。
[fixture: single-space-gaps/style-backslash-space-dropped]
[flowchart](./flowchart.ja.md#トークンの間の空白)と同じく、
`linkStyle` のスタイルのうち、名前が `stroke` で終わり、
値が空白とタブだけのものは、書かれたまま残します。
[fixture: single-space-gaps/link-style-blank-stroke-value-kept]
[flowchart](./flowchart.ja.md#トークンの間の空白)と同じく、
バックスラッシュで終わる `linkStyle` のスタイルは、
その後に空白があるかないかを保ち、空白の連続は最初の 1 文字にします。
[fixture: single-space-gaps/link-style-backslash-space-kept]
`classDef` では、バックスラッシュの後の `,` はスタイルの一部です。
バックスラッシュと `,` の間の空白は、
除くと `,` がスタイルの一部になるので残します。
`style` と `linkStyle` では、`,` は前に何があってもスタイルを終えます。
バックスラッシュの後で `:` の前にある空白も、
除くと `:` がエスケープされるので残します。
[fixture: single-space-gaps/style-escaped-space-before-comma]
[fixture: single-space-gaps/style-backslash-before-comma]
[fixture: single-space-gaps/style-colon-escaped-space-kept]
ディレクティブやコメントがある文、空白だけのスタイルがある文、
スタイルに改行か U+2028・U+2029 があるか、行に保つ `;` がある文は、
書かれたままにします。 [fixture: single-space-gaps/classdef-first-tab]
[fixture: single-space-gaps/linkstyle-first-spaces]
[fixture: single-space-gaps/style-directive-gap]
[fixture: single-space-gaps/style-first-spaces]
[fixture: single-space-gaps/styles-inner-gaps]
[fixture: single-space-gaps/style-comma-before-dropped]
[fixture: single-space-gaps/style-comma-beside-directive-kept]
[test: agentflow: U+2028 before the comma of a style statement]

linkStyleの後とinterpolate名の前のタブは、
それぞれ文法が要求する空白1文字なので、両方とも保ちます。
[fixture: single-space-gaps/linkstyle-required-tab]
[fixture: single-space-gaps/interpolate-required-tab]

入力（escape 表記）: `"agentflow-beta TB\nA\nclass\tA\tc\n"`。
[fixture: single-space-gaps/class-required-tab]

出力
([single-space-gaps/class-required-tab-output.mmd](../tests/fixtures/agentflow/single-space-gaps/class-required-tab-output.mmd)):

```mmd
agentflow-beta TB
  A
  class	A	c
```

### Arrows

[矢印の前後の空白](./flowchart.ja.md#矢印の前後の空白)と同じく、
関係を読みやすくするため矢印の外側に空白1つを置きます。
辺IDは@と矢印に接し、directiveとの接触を保ちます。
Dbの上限を超えるものも含め、ダッシュとドットの数を保ちます。
上限未満では、長さを変えると別の矢印になります。
`A---->B`を`A --> B`にするとDbが変わります。
上限を超える場合は、Dbが同じですが、木は書かれた長さを持ちます。
Dbが同じというだけでは、著者の文字を書き換える許可にならないため、
上限で打ち切った矢印へ短くしません。
agentflowの矢印は`-->`、`--x`、`-.-`とその延長形だけです。
参照辺の長さはドット数です。
後続のxは頂点の文字になり、未対応の矢印を補いません。
[fixture: arrows/arrow-cap-spelling]
[fixture: arrows/arrow-length-change-unsafe] [fixture: arrows/arrow-lengths]
[fixture: arrows/edge-id] [fixture: arrows/marker-letter-vertex]
[fixture: arrows/three-kinds]

データブロックの後の辺IDは、ブロックに接します。
vertex 文は、矢印が読む空白を除き、データブロックの後に空白を取りません。
そのため`A@{ shape: rect }e1@-->B`は受理され、
`A@{ shape: rect } e1@-->B`は拒否されます。
[fixture: arrows/edge-id-after-data-block-touches]
矢印の始まりと同じ形の辺IDは、前の形かデータブロックに接します。
たとえば`A["x"]--a@-->B`です。
agentflowでは、`--`、`-.-`、`-..-`で始まる辺IDがそれに当たります。
`x--a`、`==a`、`-.a`、`.-a`のような辺IDは、空白の後でも同じに読まれるので、
前に空白を1つ置きます。 [fixture: arrows/edge-id-arrow-like-kept-attached]
[fixture: arrows/edge-id-not-arrow-like-gets-one-space]

入力（escape 表記）: `"agentflow-beta TB\nA--xB"`。
[fixture: arrows/arrow-kind-change-unsafe]

出力
([arrows/arrow-kind-change-unsafe-output.mmd](../tests/fixtures/agentflow/arrows/arrow-kind-change-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A --x B
```

### Edge labels

[辺のラベルの書き方](./flowchart.ja.md#辺のラベルの書き方)と
[矢印の前後の空白](./flowchart.ja.md#矢印の前後の空白)を同じ理由で再利用します。
分割形式の文字はパイプを含められるため、著者の形式を保ちます。
パイプを矢印とラベルに接し、
分割した文字の外側と閉じパイプの後を空白1つにします。
分割形式があるのは通常辺と失敗辺だけです。
文字列とmarkdownの種類、後続の裸の文字、分割ラベル内のセミコロン、
パーセント文字と改行を保ちます。
別の文字列や参照辺の分割形式を補いません。
[fixture: edge-labels/edge-label-forms]
[fixture: edge-labels/split-pipe-content]
パイプの間の文字列は文字を保ち、パイプは矢印と引用符に接します。
`A  -->  |"x  y"|B` は `A -->|"x  y"| B` と印字します。
[fixture: edge-labels/pipe-label-string-kept]
閉じ引用符から離して書かれた閉じパイプも同じで、
`A-->|"x" |B` は `A -->|"x"| B` と印字します。
[fixture: edge-labels/pipe-string-closing-touches]
[test: agentflow: U+2028 between the closing quote and the `|` of an edge label]

入力（escape 表記）: `"agentflow-beta TB\nA --> |x| B"`。
[fixture: edge-labels/pipe-label-gap]

出力
([edge-labels/pipe-label-gap-output.mmd](../tests/fixtures/agentflow/edge-labels/pipe-label-gap-output.mmd)):

```mmd
agentflow-beta TB
  A -->|x| B
```

### Labels

[ラベルの内側の空白](./flowchart.ja.md#ラベルの内側の空白)と同じく、
Mermaidが捨てる通常の裸のラベルの外側空白を取り除きます。
内部と引用形式・Markdown 形式のラベルの文字は保ちます。
空白とタブだけのラベルは、空白 1 つに印字します。
先頭のスラッシュ、逆スラッシュ、ダッシュ、引用符、
最初の語にある@によって別の構文になるときは、両端に空白1つを残します。
斜辺の閉じ`?]`と`=]`の前には空白を足しません。
agentflowのラベルコメントの直前の空白とタブは値の文字なので保ちます。
コメント、LF、後続行の桁位置も保ちます。
コメント内の閉じ括弧は形を閉じないので、コメントの文字のままです。
チルダは文字です。
形、実体参照とHTMLの綴りも保ちます。 [fixture: labels/labels-closers]
[fixture: labels/labels-leading-sensitive]
[fixture: labels/labels-leading-at-sign] [fixture: labels/labels-padding]
[fixture: labels/labels-tilde] [fixture: labels/labels-trim-sensitive-unsafe]

flow/connectorの見出しのタイトルは、
[subgraph のヘッダー](./flowchart.ja.md#subgraph-のヘッダー)に従います。
flowchartと同じ理由で、`[ T ]`を含め括弧の内側の空白を落とします。
[fixture: names-and-headings/name-heading-touches-title]

入力（escape 表記）: `"agentflow-beta TB\nA[text]"`。
[fixture: labels/labels-quote-unsafe]

出力
([labels/labels-quote-unsafe-output.mmd](../tests/fixtures/agentflow/labels/labels-quote-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A[text]
```

### Vertices and lists

[トークンの間の空白](./flowchart.ja.md#トークンの間の空白)と
[書かれたまま残すもの](./flowchart.ja.md#書かれたまま残すもの)
と同じ規則と理由です。
接触は字句の区別で、&の両側の空白がグループと1つのIDを分けます。
ID、形、:::、データの接触、プロパティのIdentifier、
実際のコンマ区切りリストの穴と空の両端、コンマを含む単一ID、
出現と順序を保ちます。
IDの分割、並べ替え、末尾コンマの補完はしません。
スタイルの対象、classの接尾辞、2つ目のclassのID、
コンマを含む頂点IDは1つのIdentifierで、
コンマで分かれるのは文法上のIDリストだけです。
プロパティのオペランドはIdentifierであり、書き換える数値ではありません。
[fixture: vertices-and-lists/class-list-holes]
[fixture: vertices-and-lists/groups-suffixes]

入力（escape 表記）: `"agentflow-beta TB\nA&B"`。
[fixture: vertices-and-lists/ampersand-id]

出力
([vertices-and-lists/ampersand-id-output.mmd](../tests/fixtures/agentflow/vertices-and-lists/ampersand-id-output.mmd)):

```mmd
agentflow-beta TB
  A&B
```

### Metadata blocks

[データブロック](./flowchart.ja.md#データブロック)と同じです。
埋め込み内容は構文木の外なので、完全な各@{...}を別々に保ちます。
書かれた頂点やflow/connector見出しへの付着、接触、directive、別名、
未知キーとプロトタイプ名のキー、スカラー、配列、空、複数行の内容を保ちます。
agentflow の後の振り分けや別名解決を根拠に YAML を書き換えたり、
結合したりしません。
内容だけの拒否には仕様の不透明な読みを使い、rawの拒否にはDbがありません。
区切り記号の不備は拒否のままです。 [fixture: metadata-blocks/metadata-adjacent]
[fixture: metadata-blocks/metadata-alias-rewrite-unsafe]
[fixture: metadata-blocks/metadata-multiline]

1 行のブロックは、両端の内側に空白を 1 つずつ置いて印字します。
書かれたままにする場合は、
[データブロック](./flowchart.ja.md#データブロック)に挙げたとおりです。
[fixture: metadata-blocks/one-line-padded]
[fixture: metadata-blocks/one-line-space-only-padded]
[fixture: metadata-blocks/one-line-directive-kept]
[fixture: metadata-blocks/one-line-kept-line-kept]
[fixture: metadata-blocks/one-line-touching-blocks-kept]
[fixture: metadata-blocks/one-line-separate-blocks-padded]
[fixture: metadata-blocks/compat-document-marker-data-block-kept]
[fixture: metadata-blocks/one-line-document-marker-after-space-padded]
[fixture: metadata-blocks/one-line-padded-zero-width]
[fixture: metadata-blocks/one-line-surrounding-trivia]
[test: data blocks: agentflow one line with U+2028 inside]
[test: data blocks: agentflow one line with no-break spaces at the ends]
[test: data blocks: agentflow one line with U+2029 inside]

開きの直後が改行のブロックでは、本文の全行を同じ数の半角空白だけ動かし、
文字がある最も浅い行を文の 1 段内側に置きます。
`flow` の本文でも同じです。
入れ子の YAML の字下げの差を保ち、単独行の `}` は文の段に揃え、
本文の後の閉じ括弧はその行と一緒に動かします。
[fixture: metadata-blocks/zero-and-shallow]
[fixture: metadata-blocks/deep-nested-yaml]
[fixture: metadata-blocks/closing-after-text]
[fixture: metadata-blocks/connector-multiline]

ほかの移動条件と理由は、
[データブロック](./flowchart.ja.md#データブロック)に従います。
開きの行に本文があるブロック、内部の directive、行全体を保つ行、幅 0 の字下げ、
文の最初の行より後から始まるブロックは書かれたまま残します。
`useTabs` でも本文と単独行の閉じ括弧は半角空白とし、閉じ括弧は文の桁に置きます。
前後のコメント、directive、空の説明、空行、区切りはそれぞれの規則に従います。
[fixture: metadata-blocks/inline-and-directive-kept]
[fixture: metadata-blocks/kept-body-line]
[fixture: metadata-blocks/zero-width-kept]
[fixture: metadata-blocks/tab-statement-space-body]
[fixture: metadata-blocks/surrounding-trivia]
[test: data blocks: agentflow U+2029] [test: data blocks: agentflow CRLF]

`flow` や `global` のコンテナの見出しにあるブロックも、同じように動かします。
[fixture: metadata-blocks/container-header]

矢印の改行後のブロックは、文の最初の行より後から始まるため桁を残し、
1 行でも複数行でも、ブロックを 2 つ持つ文は、どちらも桁を残します。
`flow` の見出しと `connector` も同じです。
[fixture: metadata-blocks/later-statement-blocks-kept]
[fixture: metadata-blocks/adjacent-single-line-after-kept]
[fixture: metadata-blocks/adjacent-single-line-before-kept]
[fixture: metadata-blocks/separate-single-line-block-kept]
[fixture: metadata-blocks/container-header-adjacent-kept]
[fixture: metadata-blocks/connector-adjacent-single-line-kept]

入力（escape 表記）: `"agentflow-beta TB\nA@{}@{\n}"`。
[fixture: metadata-blocks/metadata-empty]

出力
([metadata-blocks/metadata-empty-output.mmd](../tests/fixtures/agentflow/metadata-blocks/metadata-empty-output.mmd)):

```mmd
agentflow-beta TB
  A@{}@{
}
```

### Semicolons

[セミコロン](./flowchart.ja.md#セミコロン)と同じく、
意味を足さない通常の区切りと最上位の空文を取り除きます。
本文の空文は所属に影響するので独立した行に保ちます。
flowとglobalの両方で、入れ子のendの後の空文も保ちます。
globalの所属を平坦化しません。
Kept linesと、空のstyleに続く空の説明ブロックの同じ行の保持が優先します。
[fixture: semicolons/semicolon-before-directive]
[fixture: semicolons/semicolons-drop-member-unsafe]
[fixture: semicolons/semicolons-flow] [fixture: semicolons/semicolons-global]

行の規則は、
agentflow が受け付ける行の途中の `%%` コメントのテキストを読みますが、
ディレクティブは読みません。
`A[style:]-->B %% #x;` は矢印を詰めたままで、
`C[style:]-->D %%{init:{"x":"#;"}}%%` はほかの行と同じく空白を入れて印字します。
[fixture: semicolons/line-rule-comment-read]

入力（escape 表記）: `"agentflow-beta TB\nA;B;; ;"`。
[fixture: semicolons/semicolons-top]

出力
([semicolons/semicolons-top-output.mmd](../tests/fixtures/agentflow/semicolons/semicolons-top-output.mmd)):

```mmd
agentflow-beta TB
  A
  B
```

### Kept lines

[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)と
[セミコロン](./flowchart.ja.md#セミコロン)と同じ理由です。
セミコロンを移動したり落としたりすると、無視するセミコロンが変わり得ます。
値やコメント内にセミコロンがある行は、文とセミコロンを同じ行に保ちます。
コロンと後続の`#`の間の空白の有無も保ちます。
その文字が無視するセミコロンを選ぶためです。
通常のトークン間の隙間は整形します。
ほかに候補がない末尾の無視セミコロン1つは落とせます。
[fixture: kept-lines/line-rule-kept] [fixture: kept-lines/line-rule-colon-space]
[fixture: kept-lines/line-rule-safe-terminal]
[fixture: kept-lines/line-rule-shift-unsafe]
[fixture: kept-lines/line-rule-two-passes]

文か名前がaccTitle/accDescr/direction/click/call/hrefで終わる場合と、
IDがdirectionで終わる場合は、その後の区切りセミコロンを保ちます。
その語が新しいLFと後続の文字を読む場合があるためです。
最後のstyleが空で、その行に空の説明ブロックが続く場合も同じ行に保ちます。
分けると必須の空白の読みが変わるためです。
[fixture: kept-lines/word-separator-kept]
[corpus fixture: agentflow/gram-empty-description-splits-interpolate-spaces]

未閉鎖directiveを終えるセミコロンは元の位置に保ちます。
保つ行をまたぐ値とコメントは分断しません。
セミコロンの規則が見る文字をU+2028/U+2029が区切る位置も保ちます。
agentflowのendとglobalはLFを取らず、実コメントには、
flowchartが頂点として読むパーセント文字の扱いを適用しません。
[fixture: kept-lines/open-directive-semicolon]
[corpus fixture: agentflow/lex-style-trigger-ls-segment]

入力（escape 表記）: `"agentflow-beta TB\nA[Style:#x;y]"`。
[fixture: kept-lines/line-rule-nonmatch]

出力
([kept-lines/line-rule-nonmatch-output.mmd](../tests/fixtures/agentflow/kept-lines/line-rule-nonmatch-output.mmd)):

```mmd
agentflow-beta TB
  A[Style:#x;y]
```

### Blank lines

[空行](./flowchart.ja.md#空行)と同じく、空行1つで文を区切れるので、
それ以上の連続する空行を1つにします。
空白だけの行も同じで、文書とflow/globalの本文の両端の空行を落とします。
値、データ、directiveの内部の空行を保ちます。
agentflowのコメントはLFを残し、後続の空行を取りません。
空行の対応付けのdivergenceは適用しません。
Default size branchesが通常の空行規則に優先します。
[fixture: blank-lines/blank-comment-content] [fixture: blank-lines/blank-runs]
[fixture: blank-lines/blank-value]

入力（escape 表記）: `"agentflow-beta TB\nA\n%% c\n\n\nB"`。
[fixture: blank-lines/blank-comments]

出力
([blank-lines/blank-comments-output.mmd](../tests/fixtures/agentflow/blank-lines/blank-comments-output.mmd)):

```mmd
agentflow-beta TB
  A
  %% c

  B
```

### Comments

実コメントの前に連続する通常の区切りと最上位の空文も取り除きます。
[fixture: comments/repeated-separators-before-comment]

[コメント](./flowchart.ja.md#コメント)と同じ理由で、
独立したコメントを近隣の文に揃え、著者の全文と末尾空白を保ちます。
[fixture: comments/comments-align] [fixture: comments/comment-trailing]
害のない末尾コメント前の隙間は空白1つにします。
agentflowではセミコロンや説明の閉じ記号の後も実コメントです。
その直前の通常の区切りセミコロンは落とせます。
通常サイズのコメントはLS/PSを通ってLFかEOFまで続きます。
開始済みのID内の%%はIDの文字です。
ラベル側の空白はLabelsに従います。 [fixture: comments/comment-label]
[fixture: comments/comment-label-spaces-unsafe]
文字列、markdown、分割ラベル、accessibility、callback、データでは、
コメントに見える文字も値です。 [fixture: comments/comment-looking-values]
裸の%%と仕様が受理する見出し前のパーセント波括弧コメントも保ちます。
上限超過時の共通領域はDefault size branchesに従います。

入力（escape 表記）: `"agentflow-beta TB\nA;%% c\nB"`。
[fixture: comments/comment-after-semicolon]

出力
([comments/comment-after-semicolon-output.mmd](../tests/fixtures/agentflow/comments/comment-after-semicolon-output.mmd)):

```mmd
agentflow-beta TB
  A %% c
  B
```

### Directives

[ディレクティブ](./flowchart.ja.md#ディレクティブ)と同じ理由です。
除去で区切りが生まれないため、内容、順序、後続行の桁位置を保ちます。
独立したdirectiveを揃え、同じ印字行の中のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
見出しの区切りの後のdirectiveは、後続文との接触の有無を保ち、
flowchartと同じく本文へ移します。
Dbは同じで、agentflowだけ見出しに付ける理由がないためです。
Kept linesですでに保つ行は分けません。
[fixture: directives/header-directive-before-body]
[fixture: directives/header-directive-touching-body]
[fixture: directives/header-touching-kept-line]
[fixture: directives/directive-gap] [fixture: directives/directive-header]
[fixture: directives/directive-multiline] [fixture: directives/directive-touch]
[fixture: directives/directive-value] [fixture: directives/directives-align]

EOFまで未閉鎖の末尾と、directiveを止めるセミコロンを保ちます。
名前の文字、最初のstyleの空白、ラベルコメント脇の空白が一般規則に優先します。
トークン内のdirectiveは仕様の拒否のままで、受理する文字やデータを修復しません。
[fixture: directives/directive-eof]

入力（escape 表記）: `"agentflow-beta TB;%%{init: {}}%%A"`。
[fixture: directives/header-init-directive-touching-body]

出力
([directives/header-init-directive-touching-body-output.mmd](../tests/fixtures/agentflow/directives/header-init-directive-touching-body-output.mmd)):

```mmd
agentflow-beta TB
  %%{init: {}}%%A
```

### Default size branches

agentflowは既定でコメントを保ち、50000 UTF-16単位を超えると読みが変わるため、
flowchartとは別の規則です。
frontmatterとdirectiveを除き、CRLFを1単位、サロゲート対を2単位として測ります。
[fixture: default-size-branches/size-utf16-surrogate]
50000以上なら図の全文と末尾をそのまま保ちます。
[fixture: default-size-branches/size-preserving-to-fallback-unsafe]
未満でも、印字計画の長さが50000未満に収まるときだけ通常配置を適用し、
それ以外は全文と末尾を保ちます。
[fixture: default-size-branches/size-below-planned-crossing]
コメントの除去によるDbの変化を防ぐためです。
ホストが戻すBOM、字下げや末尾LFによる増加、空白削除による減少も含みます。
上限に合わせて著者のコメントを消しません。
frontmatterには保護付きYAML整形を使え、CR/LF変換も共通のままです。
ホストが戻すBOMはエスケープしたテストの文字列で、
サイズ境界でのCRLFはcorpusで確認します。 [test: agentflow: size-bom-grow-unsafe]
[corpus fixture: agentflow/comment-default-size-above-crlf]
記録済みの範囲で計画を測り、出力の再解析やサイト設定の推測はしません。

たとえば`tabWidth: 0`の固定入力`size-utf16-exact-zero`は、UTF-16が50000単位、
コードポイントが49999です。
出力は本文の先頭の空白2つと末尾を含め、入力と同じです。
空白を1つに揃えると、Unicodeの文字数で誤って判断したことになります。
[fixture: default-size-branches/size-utf16-exact-zero]

### Direction

[方向](./flowchart.ja.md#方向)と
[字下げ](./flowchart.ja.md#字下げ)の例外と同じ理由です。
コンテナー内のTDは観測でき、字下げでaccessibilityより先に方向文を読めます。
語、方向の値、前後の無視される文字と、書かれた改行を保ちます。
Mermaidは順に試す方向の選択肢と、その選択肢内の最後の出現で方向を決めます。
最後の方向らしい語へ選び直さず、通常の隙間だけを整えます。
[fixture: direction/direction-text]
[corpus fixture: agentflow/lex-direction-value-priority]
[fixture: direction/direction-block-directive]
[fixture: direction/direction-gaps]
[fixture: direction/direction-keyword-directive]
[fixture: direction/direction-lowercase-text]
[fixture: direction/direction-lowercase-value]
[fixture: direction/direction-title-column]
[fixture: direction/direction-value-directive]

非方向行の字下げでdirectionと、その後の空白とTB/BT/RL/LR/TDが、
方向文として読まれる場合は元の桁位置を保ちます。
directiveを除いた文字と、accessibilityの語に次行の値を結合した文字で見ます。
小文字などの似た綴りは該当しません。
逆に、実際の方向文は`tabWidth: 0`でも本文の字下げを正にします。
accessibilityやstyleの前置きが1桁目の優先順位を取り戻さないためです。
[fixture: direction/planned-title-direction]
[fixture: direction/planned-description-direction]
[fixture: direction/zero-title-indented]
[fixture: direction/zero-description-indented]
[fixture: direction/zero-style-direction]

入力（escape 表記）: `"agentflow-beta TB\nflow F\ndirection TD\nA\nend"`。
[fixture: direction/direction-td-change-unsafe]

出力
([direction/direction-td-change-unsafe-output.mmd](../tests/fixtures/agentflow/direction/direction-td-change-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  flow F
    direction TD
    A
  end
```

### Accessibility

[アクセシビリティの行](./flowchart.ja.md#アクセシビリティの行)
を同じ理由で再利用します。
Dbが同じ形から選ぶ場合は、その図種の理由がなければ兄弟の図種に揃えるためです。
agentflowの通常のアクセシビリティ行に固有の理由はないので、C4、class、
usecaseと両方のgraphで、`accTitle: value`と`accDescr: value`に揃えます。
コロンを語に接し、両端をtrimした値の前にASCII空白1つを置き、
内部の空白とインラインの`%%`と`#`を値の文字として保ちます。
[fixture: accessibility/tight-colon] [fixture: accessibility/spaced-colon]
[fixture: accessibility/value-padding]
[fixture: accessibility/inline-percent-hash]
空と空白だけの値も`accTitle:`または`accDescr:`の文として保ち、
後ろに空白を足しません。 [fixture: accessibility/empty-title]
[fixture: accessibility/empty-description]
[fixture: accessibility/accessibility-empty-null]
[corpus fixture: agentflow/db-acctitle-eof]
[corpus fixture: agentflow/db-accdescr-eof]

通常の次行の値はMermaidの読みどおりにつなぎます。
[fixture: accessibility/next-line-values]
flowchartと異なり、コロンの後のコメントらしい行も値の文字なので、
その行を値としてつなぎ、次の文を別に保ちます。
[fixture: accessibility/next-line-percent-value]
文中にdirectiveがあれば通常の結合をせず、従来の複数行の文の配置を保ちます。
継続行とdirective行をキーワードより1段深く置き、文字と著者の改行を保ちます。
flowchartの継続行の規則を同じ理由で再利用するためです。
[fixture: accessibility/inline-directive-kept]
[fixture: accessibility/next-line-directive-kept]
[fixture: accessibility/title-directive-continuation]
[corpus fixture: agentflow/db-accdescr-directive-next-line]
[corpus fixture: agentflow/lex-directive-acctitle-next-line]

例外も同じです。
[Kept lines](#kept-lines)の非区切りの`;`を含む行は、
アクセシビリティの文字と`;`の脇の空白を保ちます。
セミコロンが別の文にある場合も同じです。
複数行に書かれた文は、文を区切る `;` を含んでいても、つなぎます。
ほかの `;` がない行では、プリンタが文を 1 行ずつに分けて置くので、
その文だけをつなぎます。 [fixture: accessibility/semicolon-value-kept]
[fixture: accessibility/neighbour-semicolon-kept]
`;` があるだけでは、行をつなぐ妨げにはなりません。
[fixture: accessibility/next-line-semicolon-joined]
方向の文字列がある行は[Direction](#direction)に従い、原文、改行、
桁位置を保ちます。
ほかの文書化された保持行の理由も優先します。
[fixture: accessibility/direction-text-kept]
[fixture: accessibility/next-line-direction-kept]
通常の字下げは`tabWidth: 0`でも同じ正の最小幅を使い、
`useTabs`も同じタブの1段を使います。
両方の設定で保持の例外も保ちます。 [fixture: accessibility/zero-width]
[fixture: accessibility/tabs]

CRの正規化と、外側の隙間で受理するNBSP・U+2028・U+2029、
値内部のUnicodeの文字と保持する`;`の脇のUnicode空白も、
flowchartと同じ理由で同じ規則を使います。
これらのケースはエスケープしたテストに置きます。
[test: graph accessibility: agentflow cr-lines]
[test: graph accessibility: agentflow unicode-gaps]
[test: graph accessibility: agentflow unicode-values]
[test: graph accessibility: agentflow unicode-semicolon-kept]

説明ブロックも兄弟の図種に揃える同じ理由で、
[アクセシビリティの行](./flowchart.ja.md#アクセシビリティの行)と
[複数行の値](./flowchart.ja.md#複数行の値)を再利用します。
文字とtriviaのない通常の閉じたブロックの内側は、空白や空行があっても`{}`です。
外側の語と波括弧の隙間は、元が接していても空白 1 個にします。
語と本文の開始を見分けやすくするためで、`accDescr {}` と印字します。
[fixture: accessibility/empty-block-touching-keyword]
囲む文字がないので内側の空白も不要で、usecaseのDbが同じ形に従います。
[fixture: accessibility/empty-block-tight]
[fixture: accessibility/empty-block-spaced]
[fixture: accessibility/empty-block-lines]
内側で受理するNBSP・U+2028・U+2029の空白も落とします。
[test: accessibility blocks: agentflow empty-block-unicode]
保持行と directive の内部は原文の配置を保ちます。
[fixture: accessibility/empty-block-semicolon-kept]
[fixture: accessibility/empty-block-directive-kept]

空でない 1 行のブロックの文字は、両側に空白を 1 つずつ置きます。
兄弟の図種と同じ形です。
詳しくは、
[アクセシビリティの行](./flowchart.ja.md#アクセシビリティの行)
を参照してください。
`{a}`、`{ a }`、`{  a  }`、`{  a}`、`{a  }` は、どれも `{ a }` になります。
[fixture: accessibility/block-tight-text]
[fixture: accessibility/block-spaced-text]
[fixture: accessibility/block-padded-text]
[fixture: accessibility/block-left-padding-only]
[fixture: accessibility/block-right-padding-only]
トップレベルの閉じた説明ブロックの本文は文より 1 段深くそろえます。
Mermaid がアクセシビリティの説明からこの字下げを除くためです。
flow または global の本文では、原文がメンバーの決定にも使われるため、
元の列を保ちます。
global 本文の原文を変えると、後続の flow のメンバーが変わる場合があります。
[fixture: accessibility/global-description-membership-kept]
単独行の閉じ括弧は、0桁目でも字下げされていても`accDescr`に揃えます。
[fixture: accessibility/block-close-column-zero]
[fixture: accessibility/block-close-indented]
[fixture: accessibility/block-comment-close-column-zero]
[fixture: accessibility/block-comment-close-indented]
`tabWidth: 0`の本文の最小幅でも同じ空ブロックと閉じ括弧の規則を使います。
[fixture: accessibility/block-zero-width]

未閉鎖ブロックの内容と EOF の末尾は原文どおり保ち、括弧や改行を足しません。
flowchart と異なり、コメントに見える説明行も値であり、
字下げは同じブロックの文脈の規則に従います。
文法が割り当てる閉じた空の説明文は別の文で、Nameとclick内ではIgnoredTextです。
空のstyleと後続の空の説明ブロックはKept linesに従って同じ行に保ちます。
文の先頭にある、消される空の文字列、空のmarkdown文字列、空のcallは文ではなく、
`tokenless-empty-forms`として拒否します。
[fixture: accessibility/accessibility-block]
[fixture: accessibility/accessibility-comment-indent-alternative]
[fixture: accessibility/accessibility-comment-is-value]
[fixture: accessibility/accessibility-empty-block]
[fixture: accessibility/accessibility-lines]
[fixture: accessibility/accessibility-open-eof]

入力（escape 表記）:
`"agentflow-beta TB\naccTitle:Compact title\naccDescr:Compact description"`。

出力
([accessibility/tight-colon-output.mmd](../tests/fixtures/agentflow/accessibility/tight-colon-output.mmd)):

```mmd
agentflow-beta TB
  accTitle: Compact title
  accDescr: Compact description
```

入力（escape 表記）: `"agentflow-beta TB\naccDescr {a}\nA[Block spacing]"`

出力
([accessibility/block-tight-text-output.mmd](../tests/fixtures/agentflow/accessibility/block-tight-text-output.mmd)):

```mmd
agentflow-beta TB
  accDescr { a }
  A[Block spacing]
```

入力（escape 表記）:
`"agentflow-beta TB\naccDescr: previous description\naccDescr { }\nA[Empty spacing]"`

出力
([accessibility/empty-block-spaced-output.mmd](../tests/fixtures/agentflow/accessibility/empty-block-spaced-output.mmd)):

```mmd
agentflow-beta TB
  accDescr: previous description
  accDescr {}
  A[Empty spacing]
```

入力（escape 表記）:
`"agentflow-beta TB\naccTitle:\n%%{init: {}}%%\nTitle after directive\nA[Continuation]"`。

出力
([accessibility/title-directive-continuation-output.mmd](../tests/fixtures/agentflow/accessibility/title-directive-continuation-output.mmd)):

```mmd
agentflow-beta TB
  accTitle:
    %%{init: {}}%%
    Title after directive
  A[Continuation]
```

### Multiline statements and values

通常のアクセシビリティのコロン行と、triviaのない閉じた空の説明ブロックは、
[Accessibility](#accessibility)に従い行をつなぎます。
[fixture: accessibility/next-line-values]
[fixture: accessibility/empty-block-lines]

[複数行の文](./flowchart.ja.md#複数行の文)と、
[複数行の値](./flowchart.ja.md#複数行の値)を同じ理由で再利用します。
改行位置は著者が選び、[Accessibility](#accessibility) の説明本文の字下げを除き、
値の後続行の桁位置は文字だからです。
通常の継続トークンはさらに1段深くします。
文字列、markdown、分割文字、Name、データ、directive、
複数行clickの後続行の桁位置を保ちます。
idと呼び出しの後のclickの隙間に、余分な空白単位を足すと、
拒否される場合があります。
詳しくは[clickの文](#click-statements)を参照してください。
agentflowが閉じ波括弧の後で畳むのは直後のLF前の行空白だけです。
それ以降の空のLFと、LS/PS/VT/FF/NBSPを含む元の値の行を保ちます。
不透明なデータの閉じ括弧をaccessibilityの閉じ括弧として揃えません。
[fixture: multiline-statements-and-values/brace-blank-kept]
[fixture: multiline-statements-and-values/multiline-chain]
[fixture: multiline-statements-and-values/multiline-string]

入力（escape 表記）: `"agentflow-beta TB\nA\nclick A\ncb"`。
[fixture: multiline-statements-and-values/multiline-click]

出力
([multiline-statements-and-values/multiline-click-output.mmd](../tests/fixtures/agentflow/multiline-statements-and-values/multiline-click-output.mmd)):

```mmd
agentflow-beta TB
  A
  click A
cb
```

### Chains and line wrapping

[連鎖](./flowchart.ja.md#連鎖)と
[折り返し](./flowchart.ja.md#折り返し)と同じく、著者が選ぶ文の境界を保ち、
printWidthで辺を再配置しません。
長い行、明示的に分けた文、反復と原文の順序を保ちます。
agentflowの振り分け、生成ID、完了順のコンテナーでは順序が観測できます。
Dbの正規化で等しくても、ドメインの形、数値やプロトタイプ名のオペランド、
実体参照、HTML、診断に関わる綴りを保ちます。
[fixture: chains-and-line-wrapping/long-chain]
[fixture: chains-and-line-wrapping/order-repeated]

入力（escape 表記）: `"agentflow-beta TB\nA[first]\nA[second]"`。
[fixture: chains-and-line-wrapping/order-sort-unsafe]

出力
([chains-and-line-wrapping/order-sort-unsafe-output.mmd](../tests/fixtures/agentflow/chains-and-line-wrapping/order-sort-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A[first]
  A[second]
```

### Trailing whitespace

[スタイルの行末の空白](./flowchart.ja.md#スタイルの行末の空白) と同じ理由です。
テストは、末尾の空白を除いたスタイルを比べますが、
空白だけのstyleには書かれた空白1文字が必要です。
害のない外側とstyle末尾の空白を落とします。
コンマ、classDefのエスケープしたコンマ、directive、無視セミコロン、
空の説明で分かれた空白だけのstyleを保ちます。
最初のstyleの追加空白は先頭の値なので保ちます。
名前の末尾はNames and headingsに従います。
ラベルコメント脇、文字列、データ、コメント、directive、
値の後続行の空白も保ちます。
禁止されるclass/callback/titleの空白は拒否のままで、
サイズ保護が削除に優先します。 [fixture: trailing-whitespace/trailing-comment]
[fixture: trailing-whitespace/trailing-name]
[fixture: trailing-whitespace/trailing-null-style]
[flowchart](./flowchart.ja.md#スタイルの行末の空白)と同じく、
バックスラッシュで終わる `linkStyle` は、その後の空白も 1 文字として保ちます。
[fixture: trailing-whitespace/link-style-backslash-at-end-kept]

入力（escape 表記）:
`"agentflow-beta TB\nA   \nA-->B \t\nstyle A fill:red \t"`。
[fixture: trailing-whitespace/trailing-exterior]

出力
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/agentflow/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
agentflow-beta TB
  A
  A --> B
  style A fill: red
```

### Line terminators

[行末](./compatibility.ja.md#行末)と同じ理由です。
Mermaidは読む前にCRLFとCRをLFへ変え、PrettierはendOfLineの改行を出力します。
LS/PSを一般的な改行にせず、値、コメント、style行の区間、
未閉鎖directiveの境界で保ちます。
受理される通常の見出しや演算子の空白は整えられますが、必須の空白1文字と、
名前をclickのIDとして読むのを終える空白はそれぞれ保ちます。
NELは空白ではありません。
BOMとfrontmatterの共通の制限も適用します。
不可視文字はfixtureに直接書かず、エスケープしたケースで確認します。

入力`"agentflow-beta TB\r\nA[\"a\r\n b\"]\r\n"`は、
出力`"agentflow-beta TB\n  A[\"a\n b\"]\n"`になります。
[test: agentflow: eol-crlf]

### Frontmatter YAML

[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)と
[フロントマター](./compatibility.ja.md#フロントマター)を同じ理由で再利用します。
安全なYAMLは通常整形し、危険な文字は読みを保つため残します。
区切り行とその空白、不正なYAML、字下げされた区切り、HTMLタグの開始、
整形で区切りが現れる場合を保ちます。
YAMLにはsignificantIndentationWidthの共通の最小幅1を使います。
tabWidthが0でも同じで、agentflow本文も同じ最小幅を使います。
frontmatterのtitle/configはaccessibilityや不透明なデータとは別です。
frontmatterをまたぐHTMLには本文だけを見る仕様を使い、
rawの前処理を真似て本文の引用符を変えません。
[fixture: frontmatter-yaml/frontmatter-delimiter-guard]
[fixture: frontmatter-yaml/frontmatter-html-guard]
[fixture: frontmatter-yaml/frontmatter-indented]
[fixture: frontmatter-yaml/frontmatter-yaml]
[fixture: frontmatter-yaml/frontmatter-zero-block-scalar]
[fixture: frontmatter-yaml/frontmatter-zero-width]

入力（escape 表記）: `"---\ntitle: [\n---\nagentflow-beta TB\nA"`。
[fixture: frontmatter-yaml/frontmatter-invalid]

出力
([frontmatter-yaml/frontmatter-invalid-output.mmd](../tests/fixtures/agentflow/frontmatter-yaml/frontmatter-invalid-output.mmd)):

```mmd
---
title: [
---
agentflow-beta TB
  A
```

### Final newline

[空行](./flowchart.ja.md#空行) と
[ディレクティブ](./flowchart.ja.md#ディレクティブ) と同じく、
見出しだけの場合も含め、通常の受理ファイルを設定された改行1つで終えます。
EOFまで続くdirectiveと値、およびサイズ保護された末尾は保ちます。
値の文字を足したりサイズ境界を越えたりすると読みが変わるためです。
nullのstyleに必要な空白とコメントの文字は改行の前に保ちます。
未閉鎖directiveの後にある外側の空白には共通の末尾空白規則を使い、
EOFで終わるdirectiveには値の文字を足しません。
[fixture: final-newline/final-comment]
[fixture: final-newline/final-open-description]

入力（escape 表記）: `"agentflow-beta TB\nA\n\n\n"`。
[fixture: final-newline/final-ordinary]

出力
([final-newline/final-ordinary-output.mmd](../tests/fixtures/agentflow/final-newline/final-ordinary-output.mmd)):

```mmd
agentflow-beta TB
  A
```

### Markdown fences

[Markdown のコードブロック](./compatibility.ja.md#markdown-のコードブロック)
と同じく、外側の字下げを除いた図に単独ファイルと同じ規則を使います。
fence、リスト、引用の字下げはMarkdownが付けます。
最上位、入れ子リスト、引用、設定、値、directive、Name、大きな保持本文について、
ホストと字下げを除いたDbを別に確認します。
Prettierはブロック最終行の末尾空白を落とし、
最後の空白だけのstyleが拒否され得ます。
この制限は処理を返した失敗入力にも適用し、
単独ファイルの値を削る許可にはなりません。
サイズ境界は外側の字下げを除いた本文で判断します。
[fixture: markdown-fences/markdown-list-payload]

入力（escape 表記）: `"agentflow-beta TB\nA-->B"`。
[fixture: markdown-fences/markdown-top-payload]

出力
([markdown-fences/markdown-top-payload-output.mmd](../tests/fixtures/agentflow/markdown-fences/markdown-top-payload-output.mmd)):

```mmd
agentflow-beta TB
  A --> B
```

### Click statements

[トークンの間の空白](./flowchart.ja.md#トークンの間の空白)と、
[複数行の文](./flowchart.ja.md#複数行の文)の callback値の保持を再利用します。
callの括弧前の空白は名前で、引数と文字列は著者の文字だからです。
最初のclick語の後の害のない隙間を整え、
ID・リスト・値以降と後続行の桁位置を保ちます。
href/callの有無、target、記号・数値・プロトタイプ名のID、穴、
URLとtooltipの空白、引数を渡す2つ目のcallも含みます。
agentflowのtextBeforeUrl/textBeforeTooltipには、消されるclick、
空の説明・文字列・markdown・callを各節点と元の隙間で保ちます。
hrefの両側も同じです。
callback名とtargetの前にはprefix欄がありません。
tooltip/target前に必須の空白1文字を保ち、末尾の空の説明は後続文とします。
消される前置きを保つのは、
仕様がそれを受理して木のtextBeforeUrl/textBeforeTooltipに持つため、
除くと書かれた文字が失われるからです。
`click`を予約語として扱って拒否するflowchartの規則は、agentflowには当てません。
[fixture: click-statements/callback-padding-unsafe]
[fixture: click-statements/tooltip-required-tab]
[fixture: click-statements/url-form-kept]

固定のリンクtarget前のタブも保ちます。
保持するclickの前置き内のdirectiveも接触する隙間を保ちます。
[fixture: click-statements/target-required-tab]
[fixture: click-statements/prefix-with-directive]

呼び出しの引数は、[flowchart](./flowchart.ja.md#トークンの間の空白)と同じく、
両端と `,` の前に空白を置かず、後ろに空白を 1 つ置きます。
`click A call f(  "x" ,y )` は `click A call f("x", y)` と印字します。
（[同じに描かれる呼び出しの引数](./compatibility.ja.md#同じに描かれる呼び出しの引数)）。
[fixture: click-statements/callback-arguments-spaced]
mermaid.js の行の規則が読むかもしれない引数の間の隙間は、
空白があるかないかを保ちます。
`click A call f(style:x,#b;c)` は書かれたまま残します。
`,` の後に空白を置くと、規則が無視する最後の `;` が変わるからです。
（[同じに描かれる呼び出しの引数](./compatibility.ja.md#同じに描かれる呼び出しの引数)）。
[fixture: click-statements/callback-arguments-line-rule-kept]
引数が空白だけの呼び出しの括弧は、
[flowchart](./flowchart.ja.md#トークンの間の空白)と同じく互いに接します。
`click A call f( )` は、
tooltip や消された前置きが続くときも `click A call f()` になります。
mermaid.js はどちらの書き方も同じ呼び出しとして読むからです。
`(` の前に空白がある `f ()` は、名前がその空白を取るので変えません。
`)` の後の空白は、ここで空白がもう 1 文字あると拒否されることがあるので、
書かれたままです。 [fixture: click-statements/callback-blank-parentheses-touch]
[test: agentflow: U+2028 between the parentheses of a blank callback]
[test: agentflow: U+2029 between the parentheses of a blank callback]
改行がすべて文字列の中か、引数のある呼び出しの括弧の間にある文は、
最初の click キーワードの後の隙間を 1 行の文と同じに整え、
残りは書かれたままにします。
`click   A "/u" "x` と次の行の `  y"` は、
`click A "/u" "x` と `  y"` になります。
隙間に改行があるとき、または空の `f(` と `)` の間に改行があるときは、
文を書かれたまま残します。
[fixture: click-statements/string-over-lines-keyword-gap]
[fixture: click-statements/callback-parentheses-over-lines]

入力（escape 表記）: `"agentflow-beta TB\nA\nclick   A cb\n"`。
[fixture: click-statements/click-keyword-gap]

出力
([click-statements/click-keyword-gap-output.mmd](../tests/fixtures/agentflow/click-statements/click-keyword-gap-output.mmd)):

```mmd
agentflow-beta TB
  A
  click A cb
```
