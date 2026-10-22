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
[Inputs read differently](./compatibility.md#inputs-read-differently-from-mermaidjs)
に従って仕様の読みで整形します。
拒否と差異を含む全corpus入力をcorpusテストで確認します。
たとえば`"Agentflow-beta TB\nA\n"`は見出しを修復せず拒否します。
[corpus fixture: agentflow/header-upper]

## Rules

### Header

[Direction](./flowchart.md#direction)と同じく、見出しを第1列に置き、
方向の綴りを保ちます。
見出しを見つけやすくし、見出しと本文でTDの方針を揃えるためです。
agentflowが受理する見出しは小文字の`agentflow-beta`だけです。
方向の省略と記号を保ち、次行のLRは頂点のままです。
通常の後続文は本文へ移し、directiveの付着はDirectivesに従います。
[fixture: header/header-column]
[fixture: header/header-direction-spelling]
[fixture: header/header-inline-separated]
[fixture: header/header-next-line-direction]
[fixture: header/header-symbol]

入力（エスケープ表記）: `"agentflow-beta"`。
[fixture: header/header-only]

Output
([header/header-only-output.mmd](../tests/fixtures/agentflow/header/header-only-output.mmd)):

```mmd
agentflow-beta
```

### Indentation

[Indentation](./flowchart.md#indentation)と同じ規則と理由です。
元の桁位置は所属を決めないため、木の入れ子を字下げで示します。
見出しとflow/globalの本文を1段深くし、endを開始語に揃えます。
connectorには本文がありません。
`useTabs`では1段をタブ1つにします。
agentflowは共有の意味を持つ字下げ幅を使い、
`tabWidth: 0`でも本文の1段を最低1つの空白にします。
字下げのある`accTitle: direction LR`は方向文ですが、
1桁目へ移すとDbが変わり、styleで始まる方向行は拒否されるためです。
桁位置で読みが変わる非方向行はDirectionに従って元の字下げを保ちます。
[fixture: indentation/indent-direction-unsafe]
[fixture: indentation/indent-nested]
[fixture: indentation/indent-tabs]
[fixture: indentation/indent-zero]

入力（エスケープ表記）: `"agentflow-beta TB\nflow F\nA\nend"`。
[fixture: indentation/indent-four]

Output
([indentation/indent-four-output.mmd](../tests/fixtures/agentflow/indentation/indent-four-output.mmd)):

```mmd
agentflow-beta TB
    flow F
        A
    end
```

### Containers

flowchartの[Indentation](./flowchart.md#indentation)と
[Statements one per line](./flowchart.md#statements-one-per-line)を
再利用します。
開始行、本文、終了行で構造を読みやすくするためです。
名前のあるflowと無名flow、global、空の本文と混在する入れ子、
文順を保ちます。
globalはコンテナーを出力しなくても所属を変えるのでブロックのままです。
名前やデータを補いません。
agentflowのend/globalが取る空白はASCIIの空白とタブだけです。
LFを名前へ取り込まず、endの後のセミコロンは親の本文の独立した空文です。
[fixture: containers/containers-empty]
[fixture: containers/containers-one-line]
[fixture: containers/end-name-not-greedy]
[fixture: containers/global-flatten-unsafe]

入力（エスケープ表記）: `"agentflow-beta TB\nglobal\t \nA\nend B"`。
[fixture: containers/global-tabs]

Output
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
[Subgraph header](./flowchart.md#subgraph-header)と同じ理由で、
タイトルとの接触を保ち、外側の連続する空白を1つにします。
どちらの書き方も使われるためです。
タイトルの内側の空白は保ち、`[ T ]`を`[ T ]`のままにします。
Dbは同じで、agentflowだけ違う形を選ぶ理由がないためです。
[fixture: names-and-headings/name-heading-padding]

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

名前をclickのIDとして読んだ後は、空白1文字だけでその読みを終えます。
タイトル、データ、区切り、EOFの前でも、そのタブやLFを保ちます。
追加の空白は次の名前の断片です。
空の文字列と空のmarkdown文字列も、この終了文字を消しません。
消される形と後続の名前の文字の間に空白がすでにあれば、
clickの読みは終わっているので、名前の後のLFを取り込んで空行を足しません。
connectorの名前では、
消される空文字列に直続する文字が`;`で始まることもあります。
そのclickの読みをLFで終える場合は、文を区切るLFの前にそのLFも保ちます。
除くと後続文が名前に結合され、拒否され得るためです。
[fixture: names-and-headings/connector-empty-string-adjacent-semicolon-exit]
[fixture: names-and-headings/connector-empty-string-adjacent-text-exit]
[fixture: names-and-headings/click-empty-string-lf-body]
[fixture: names-and-headings/click-empty-markdown-eof-tab]
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

clickのIDの読みを終える文字の後の通常の空行は、Blank linesに従います。
[fixture: names-and-headings/name-exit-lf-empty-line]
[fixture: names-and-headings/name-ordinary-fragment-blank]

区切りの`;`を改行に変えるときは、空の説明ブロックの後で名前を終える、
空白だけの断片を落とします。
`;`の前の空白は名前の文字ですが、印字するLFの前では名前でないためです。
Kept linesによってセミコロンが同じ行に残る場合は保ちます。
[fixture: names-and-headings/empty-description-kept-separator]
flowとconnectorの名前、空白、タブ、空白の連続、
LFが続く区切りと、区切りの連続に適用します。
[fixture: names-and-headings/empty-description-space-flow]
[fixture: names-and-headings/empty-description-tab-flow]
[fixture: names-and-headings/empty-description-two-spaces-flow]
[fixture: names-and-headings/empty-description-separator-lf]
[fixture: names-and-headings/empty-description-separated-semicolons]
[fixture: names-and-headings/empty-description-space-connector]
[fixture: names-and-headings/empty-description-tab-connector]
[fixture: names-and-headings/empty-description-two-spaces-connector]

入力（エスケープ表記）: `"agentflow-beta TB\nflow F accDescr {} ;A\nend"`。
[fixture: names-and-headings/empty-description-space-flow]

Output
([names-and-headings/empty-description-space-flow-output.mmd](../tests/fixtures/agentflow/names-and-headings/empty-description-space-flow-output.mmd)):

```mmd
agentflow-beta TB
  flow F accDescr {}
    A
  end
```

### Single space gaps

flowchartの[Whitespace between tokens](./flowchart.md#whitespace-between-tokens)と異なり、
style/classDef/class/linkStyleの後、classの値とinterpolate名、
tooltipの前の必須の空白1文字の隙間は決して揃えません。
文法が空白1文字だけを取り、その後の空白は値の文字で、
トークンを期待する場所に空白が2文字あると拒否されることもあるためです。
この1文字として使うタブも保ちます。
directiveを挟む最初のstyleの先頭空白、値内とコンマ脇の空白、
空のstyleリスト項目、classDefのエスケープしたコンマ、順序と反復を保ちます。
style内部を値として保つ理由はflowchartと同じですが、先頭の隙間は揃えません。
[fixture: single-space-gaps/classdef-first-tab]
[fixture: single-space-gaps/linkstyle-first-spaces]
[fixture: single-space-gaps/style-directive-gap]
[fixture: single-space-gaps/style-first-spaces]
[fixture: single-space-gaps/styles-inner-gaps]

linkStyleの後とinterpolate名の前のタブは、
それぞれ文法が要求する空白1文字なので、両方とも保ちます。
[fixture: single-space-gaps/linkstyle-required-tab]
[fixture: single-space-gaps/interpolate-required-tab]

入力（エスケープ表記）: `"agentflow-beta TB\nA\nclass\tA\tc\n"`。
[fixture: single-space-gaps/class-required-tab]

Output
([single-space-gaps/class-required-tab-output.mmd](../tests/fixtures/agentflow/single-space-gaps/class-required-tab-output.mmd)):

```mmd
agentflow-beta TB
  A
  class	A	c
```

### Arrows

[Arrow spacing](./flowchart.md#arrow-spacing)と同じく、
関係を読みやすくするため矢印の外側に空白1つを置きます。
辺IDは@と矢印に接し、directiveとの接触を保ちます。
Dbの上限を超えるものも含め、ダッシュとドットの数を保ちます。
agentflowの矢印は`-->`、`--x`、`-.-`とその延長形だけです。
参照辺の長さはドット数です。
後続のxは頂点の文字になり、未対応の矢印を補いません。
[fixture: arrows/arrow-cap-spelling]
[fixture: arrows/arrow-length-change-unsafe]
[fixture: arrows/arrow-lengths]
[fixture: arrows/edge-id]
[fixture: arrows/marker-letter-vertex]
[fixture: arrows/three-kinds]

入力（エスケープ表記）: `"agentflow-beta TB\nA--xB"`。
[fixture: arrows/arrow-kind-change-unsafe]

Output
([arrows/arrow-kind-change-unsafe-output.mmd](../tests/fixtures/agentflow/arrows/arrow-kind-change-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A --x B
```

### Edge labels

[Link label form](./flowchart.md#link-label-form)と
[Arrow spacing](./flowchart.md#arrow-spacing)を同じ理由で再利用します。
分割形式の文字はパイプを含められるため、著者の形式を保ちます。
パイプを矢印とラベルに接し、
分割した文字の外側と閉じパイプの後を空白1つにします。
分割形式があるのは通常辺と失敗辺だけです。
文字列とmarkdownの種類、後続の裸の文字、
分割ラベル内のセミコロン、パーセント文字と改行を保ちます。
別の文字列や参照辺の分割形式を補いません。
[fixture: edge-labels/edge-label-forms]
[fixture: edge-labels/split-pipe-content]

入力（エスケープ表記）: `"agentflow-beta TB\nA --> |x| B"`。
[fixture: edge-labels/pipe-label-gap]

Output
([edge-labels/pipe-label-gap-output.mmd](../tests/fixtures/agentflow/edge-labels/pipe-label-gap-output.mmd)):

```mmd
agentflow-beta TB
  A -->|x| B
```

### Labels

[Label inner whitespace](./flowchart.md#label-inner-whitespace)と同じく、
Mermaidが捨てる通常の裸のラベルの外側空白を取り除きます。
内部、引用形式、空白だけのラベルの文字は保ちます。
先頭のスラッシュ、逆スラッシュ、ダッシュ、引用符、
最初の語にある@によって別の構文になるときは、両端に空白1つを残します。
斜辺の閉じ`?]`と`=]`の前には空白を足しません。
agentflowのラベルコメントの直前の空白とタブは値の文字なので保ちます。
コメント、LF、後続行の桁位置も保ちます。
コメント内の閉じ括弧は形を閉じないので、コメントの文字のままです。
チルダは文字です。形、実体参照とHTMLの綴りも保ちます。
[fixture: labels/labels-closers]
[fixture: labels/labels-leading-sensitive]
[fixture: labels/labels-padding]
[fixture: labels/labels-tilde]
[fixture: labels/labels-trim-sensitive-unsafe]

flow/connectorの見出しのタイトルは、
[Subgraph header](./flowchart.md#subgraph-header)に従います。
flowchartと同じ理由で、`[ T ]`を含め内側の空白を保ちます。
[fixture: names-and-headings/name-heading-padding]

入力（エスケープ表記）: `"agentflow-beta TB\nA[text]"`。
[fixture: labels/labels-quote-unsafe]

Output
([labels/labels-quote-unsafe-output.mmd](../tests/fixtures/agentflow/labels/labels-quote-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A[text]
```

### Vertices and lists

[Whitespace between tokens](./flowchart.md#whitespace-between-tokens)と
[Kept as written](./flowchart.md#kept-as-written)と同じ規則と理由です。
接触は字句の区別で、&の両側の空白がグループと1つのIDを分けます。
ID、形、:::、データの接触、プロパティのIdentifier、
実際のコンマ区切りリストの穴と空の両端、
コンマを含む単一ID、出現と順序を保ちます。
IDの分割、並べ替え、末尾コンマの補完はしません。
[fixture: vertices-and-lists/class-list-holes]
[fixture: vertices-and-lists/groups-suffixes]

入力（エスケープ表記）: `"agentflow-beta TB\nA&B"`。
[fixture: vertices-and-lists/ampersand-id]

Output
([vertices-and-lists/ampersand-id-output.mmd](../tests/fixtures/agentflow/vertices-and-lists/ampersand-id-output.mmd)):

```mmd
agentflow-beta TB
  A&B
```

### Metadata blocks

[Kept as written](./flowchart.md#kept-as-written)の
不透明なデータ規則と同じです。
埋め込み内容は構文木の外なので、完全な各@{...}を別々に保ちます。
書かれた頂点やflow/connector見出しへの付着、接触、directive、
別名、
未知キーとプロトタイプ名のキー、スカラー、配列、空、
複数行の内容と桁位置を保ちます。
agentflowの後の振り分けや別名解決を根拠に書き換えたり、
結合したり、データの閉じ括弧を揃えたりしません。
内容だけの拒否には仕様の不透明な読みを使い、rawの拒否にはDbがありません。
区切り記号の不備は拒否のままです。
[fixture: metadata-blocks/metadata-adjacent]
[fixture: metadata-blocks/metadata-alias-rewrite-unsafe]
[fixture: metadata-blocks/metadata-multiline]

入力（エスケープ表記）: `"agentflow-beta TB\nA@{}@{\n}"`。
[fixture: metadata-blocks/metadata-empty]

Output
([metadata-blocks/metadata-empty-output.mmd](../tests/fixtures/agentflow/metadata-blocks/metadata-empty-output.mmd)):

```mmd
agentflow-beta TB
  A@{}@{
}
```

### Semicolons

[Semicolons](./flowchart.md#semicolons)と同じく、
意味を足さない通常の区切りと最上位の空文を取り除きます。
本文の空文は所属に影響するので独立した行に保ちます。
flowとglobalの両方で、入れ子のendの後の空文も保ちます。
globalの所属を平坦化しません。
Kept linesと、空のstyleに続く空の説明ブロックの同じ行の保持が優先します。
[fixture: semicolons/semicolon-before-directive]
[fixture: semicolons/semicolons-drop-member-unsafe]
[fixture: semicolons/semicolons-flow]
[fixture: semicolons/semicolons-global]

入力（エスケープ表記）: `"agentflow-beta TB\nA;B;; ;"`。
[fixture: semicolons/semicolons-top]

Output
([semicolons/semicolons-top-output.mmd](../tests/fixtures/agentflow/semicolons/semicolons-top-output.mmd)):

```mmd
agentflow-beta TB
  A
  B
```

### Kept lines

[Statements one per line](./flowchart.md#statements-one-per-line)と
[Semicolons](./flowchart.md#semicolons)と同じ理由です。
セミコロンを移動したり落としたりすると、無視するセミコロンが変わり得ます。
値やコメント内にセミコロンがある行は、文とセミコロンを同じ行に保ちます。
コロンと後続の`#`の間の空白の有無も保ちます。
その文字が無視するセミコロンを選ぶためです。
通常のトークン間の隙間は整形します。
ほかに候補がない末尾の無視セミコロン1つは落とせます。
[fixture: kept-lines/line-rule-kept]
[fixture: kept-lines/line-rule-colon-space]
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

入力（エスケープ表記）: `"agentflow-beta TB\nA[Style:#x;y]"`。
[fixture: kept-lines/line-rule-nonmatch]

Output
([kept-lines/line-rule-nonmatch-output.mmd](../tests/fixtures/agentflow/kept-lines/line-rule-nonmatch-output.mmd)):

```mmd
agentflow-beta TB
  A[Style:#x;y]
```

### Blank lines

[Blank lines](./flowchart.md#blank-lines)と同じく、
空行1つで文を区切れるので、それ以上の連続する空行を1つにします。
空白だけの行も同じで、文書とflow/globalの本文の両端の空行を落とします。
値、データ、directiveの内部の空行を保ちます。
agentflowのコメントはLFを残し、後続の空行を取りません。
空行の対応付けのdivergenceは適用しません。
Default size branchesが通常の空行規則に優先します。
[fixture: blank-lines/blank-comment-content]
[fixture: blank-lines/blank-runs]
[fixture: blank-lines/blank-value]

入力（エスケープ表記）: `"agentflow-beta TB\nA\n%% c\n\n\nB"`。
[fixture: blank-lines/blank-comments]

Output
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

[Comments](./flowchart.md#comments)と同じ理由で、
独立したコメントを近隣の文に揃え、著者の全文と末尾空白を保ちます。
[fixture: comments/comments-align]
[fixture: comments/comment-trailing]
害のない末尾コメント前の隙間は空白1つにします。
agentflowではセミコロンや説明の閉じ記号の後も実コメントです。
その直前の通常の区切りセミコロンは落とせます。
通常サイズのコメントはLS/PSを通ってLFかEOFまで続きます。
開始済みのID内の%%はIDの文字です。
ラベル側の空白はLabelsに従います。
[fixture: comments/comment-label]
[fixture: comments/comment-label-spaces-unsafe]
文字列、markdown、分割ラベル、accessibility、callback、データでは、
コメントに見える文字も値です。
[fixture: comments/comment-looking-values]
裸の%%と仕様が受理する見出し前のパーセント波括弧コメントも保ちます。
上限超過時の共通領域はDefault size branchesに従います。

入力（エスケープ表記）: `"agentflow-beta TB\nA;%% c\nB"`。
[fixture: comments/comment-after-semicolon]

Output
([comments/comment-after-semicolon-output.mmd](../tests/fixtures/agentflow/comments/comment-after-semicolon-output.mmd)):

```mmd
agentflow-beta TB
  A %% c
  B
```

### Directives

[Directives](./flowchart.md#directives)と同じ理由です。
除去で区切りが生まれないため、内容、順序、接触、後続行の桁位置を保ちます。
独立したdirectiveを揃え、害のない隙間だけを整えます。
見出しの区切りの後のdirectiveは、後続文との接触の有無を保ち、
flowchartと同じく本文へ移します。
Dbは同じで、agentflowだけ見出しに付ける理由がないためです。
Kept linesですでに保つ行は分けません。
[fixture: directives/header-directive-before-body]
[fixture: directives/header-directive-touching-body]
[fixture: directives/header-touching-kept-line]
[fixture: directives/directive-gap]
[fixture: directives/directive-header]
[fixture: directives/directive-multiline]
[fixture: directives/directive-touch]
[fixture: directives/directive-value]
[fixture: directives/directives-align]

EOFまで未閉鎖の末尾と、directiveを止めるセミコロンを保ちます。
名前の文字、最初のstyleの空白、ラベルコメント脇の空白が一般規則に優先します。
トークン内のdirectiveは仕様の拒否のままで、受理する文字やデータを修復しません。
[fixture: directives/directive-eof]

入力（エスケープ表記）: `"agentflow-beta TB;%%{init: {}}%%A"`。
[fixture: directives/header-init-directive-touching-body]

Output
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
サイズ境界でのCRLFはcorpusで確認します。
[test: agentflow: size-bom-grow-unsafe]
[corpus fixture: agentflow/comment-default-size-above-crlf]
記録済みの範囲で計画を測り、出力の再解析やサイト設定の推測はしません。

たとえば`tabWidth: 0`の固定入力`size-utf16-exact-zero`は、
UTF-16が50000単位、コードポイントが49999です。
出力は本文の先頭の空白2つと末尾を含め、入力と同じです。
空白を1つに揃えると、Unicodeの文字数で誤って判断したことになります。
[fixture: default-size-branches/size-utf16-exact-zero]

### Direction

[Direction](./flowchart.md#direction)と
[Indentation](./flowchart.md#indentation)の例外と同じ理由です。
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

入力（エスケープ表記）: `"agentflow-beta TB\nflow F\ndirection TD\nA\nend"`。
[fixture: direction/direction-td-change-unsafe]

Output
([direction/direction-td-change-unsafe-output.mmd](../tests/fixtures/agentflow/direction/direction-td-change-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  flow F
    direction TD
    A
  end
```

### Accessibility

[Multi-line values](./flowchart.md#multi-line-values)と
通常のトークン配置を再利用します。
後続行の桁位置は値の文字で、説明の閉じ括弧はaccDescrに揃えるためです。
次行の値も含め、通常の行値の外側空白を整えます。
セミコロンとパーセント文字、EOFのnull値、反復を保ちます。
未閉鎖ブロックの内容とEOFの末尾を保ち、括弧や改行を足しません。
flowchartと異なり、コメントに見える説明行も値なので桁位置を保ちます。
文法が割り当てる閉じた空の説明文は別の文で、
Nameとclick内ではIgnoredTextです。
空のstyleと後続の空の説明ブロックはKept linesに従って同じ行に保ちます。
[fixture: accessibility/accessibility-block]
[fixture: accessibility/accessibility-comment-indent-alternative]
[fixture: accessibility/accessibility-comment-is-value]
[fixture: accessibility/accessibility-empty-block]
[fixture: accessibility/accessibility-lines]
[fixture: accessibility/accessibility-open-eof]

入力（エスケープ表記）: `"agentflow-beta TB\naccTitle:\n"`。
[fixture: accessibility/accessibility-empty-null]

Output
([accessibility/accessibility-empty-null-output.mmd](../tests/fixtures/agentflow/accessibility/accessibility-empty-null-output.mmd)):

```mmd
agentflow-beta TB
  accTitle:
```

### Multiline statements and values

[Multi-line statements](./flowchart.md#multi-line-statements)と
[Multi-line values](./flowchart.md#multi-line-values)を同じ理由で再利用します。
改行位置は著者が選び、値の後続行の桁位置は文字だからです。
通常の継続トークンはさらに1段深くします。
文字列、markdown、分割文字、Name、データ、directive、
複数行clickの後続行の桁位置を保ちます。
clickに余分な空白単位を足すと拒否される場合があります。
agentflowが閉じ波括弧の後で畳むのは直後のLF前の行空白だけです。
それ以降の空のLFと、LS/PS/VT/FF/NBSPを含む元の値の行を保ちます。
不透明なデータの閉じ括弧をaccessibilityの閉じ括弧として揃えません。
[fixture: multiline-statements-and-values/brace-blank-kept]
[fixture: multiline-statements-and-values/multiline-chain]
[fixture: multiline-statements-and-values/multiline-string]

入力（エスケープ表記）: `"agentflow-beta TB\nA\nclick A\ncb"`。
[fixture: multiline-statements-and-values/multiline-click]

Output
([multiline-statements-and-values/multiline-click-output.mmd](../tests/fixtures/agentflow/multiline-statements-and-values/multiline-click-output.mmd)):

```mmd
agentflow-beta TB
  A
  click A
cb
```

### Chains and line wrapping

[Chains](./flowchart.md#chains)と
[Line wrapping](./flowchart.md#line-wrapping)と同じく、
著者が選ぶ文の境界を保ち、printWidthで辺を再配置しません。
長い行、明示的に分けた文、反復と原文の順序を保ちます。
agentflowの振り分け、生成ID、完了順のコンテナーでは順序が観測できます。
Dbの正規化で等しくても、ドメインの形、数値やプロトタイプ名のオペランド、
実体参照、HTML、診断に関わる綴りを保ちます。
[fixture: chains-and-line-wrapping/long-chain]
[fixture: chains-and-line-wrapping/order-repeated]

入力（エスケープ表記）: `"agentflow-beta TB\nA[first]\nA[second]"`。
[fixture: chains-and-line-wrapping/order-sort-unsafe]

Output
([chains-and-line-wrapping/order-sort-unsafe-output.mmd](../tests/fixtures/agentflow/chains-and-line-wrapping/order-sort-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A[first]
  A[second]
```

### Trailing whitespace

[Style trailing whitespace](./flowchart.md#style-trailing-whitespace)と
同じ理由です。
Db要約はstyleの末尾空白を正規化しますが、
空白だけのstyleには書かれた空白1文字が必要です。
害のない外側とstyle末尾の空白を落とします。
コンマ、classDefのエスケープしたコンマ、directive、
無視セミコロン、空の説明で分かれた空白だけのstyleを保ちます。
最初のstyleの追加空白は先頭の値なので保ちます。
名前の末尾はNames and headingsに従います。
ラベルコメント脇、文字列、データ、コメント、
directive、値の後続行の空白も保ちます。
禁止されるclass/callback/titleの空白は拒否のままで、
サイズ保護が削除に優先します。
[fixture: trailing-whitespace/trailing-comment]
[fixture: trailing-whitespace/trailing-name]
[fixture: trailing-whitespace/trailing-null-style]

入力（エスケープ表記）:
`"agentflow-beta TB\nA   \nA-->B \t\nstyle A fill:red \t"`。
[fixture: trailing-whitespace/trailing-exterior]

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/agentflow/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
agentflow-beta TB
  A
  A --> B
  style A fill:red
```

### Line terminators

[Line endings](./compatibility.md#line-endings)と同じ理由です。
Mermaidは読む前にCRLFとCRをLFへ変え、PrettierはendOfLineの改行を出力します。
LS/PSを一般的な改行にせず、値、コメント、style行の区間、
未閉鎖directiveの境界で保ちます。
受理される通常の見出しや演算子の空白は整えられますが、
必須の空白1文字と、名前をclickのIDとして読むのを終える空白はそれぞれ保ちます。
NELは空白ではありません。BOMとfrontmatterの共通の制限も適用します。
不可視文字はfixtureに直接書かず、エスケープしたケースで確認します。

入力`"agentflow-beta TB\r\nA[\"a\r\n b\"]\r\n"`は、
出力`"agentflow-beta TB\n  A[\"a\n b\"]\n"`になります。
[test: agentflow: eol-crlf]

### Frontmatter YAML

[Frontmatter YAML](./flowchart.md#frontmatter-yaml)と
[Frontmatter](./compatibility.md#frontmatter)を同じ理由で再利用します。
安全なYAMLは通常整形し、危険な文字は読みを保つため残します。
区切り行とその空白、不正なYAML、字下げされた区切り、
HTMLタグの開始、整形で区切りが現れる場合を保ちます。
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

入力（エスケープ表記）: `"---\ntitle: [\n---\nagentflow-beta TB\nA"`。
[fixture: frontmatter-yaml/frontmatter-invalid]

Output
([frontmatter-yaml/frontmatter-invalid-output.mmd](../tests/fixtures/agentflow/frontmatter-yaml/frontmatter-invalid-output.mmd)):

```mmd
---
title: [
---
agentflow-beta TB
  A
```

### Final newline

[Blank lines](./flowchart.md#blank-lines)と[Directives](./flowchart.md#directives)と同じく、
見出しだけの場合も含め、通常の受理ファイルを設定された改行1つで終えます。
EOFまで続くdirectiveと値、およびサイズ保護された末尾は保ちます。
値の文字を足したりサイズ境界を越えたりすると読みが変わるためです。
nullのstyleに必要な空白とコメントの文字は改行の前に保ちます。
未閉鎖directiveの後にある外側の空白には共通の末尾空白規則を使い、
EOFで終わるdirectiveには値の文字を足しません。
[fixture: final-newline/final-comment]
[fixture: final-newline/final-open-description]

入力（エスケープ表記）: `"agentflow-beta TB\nA\n\n\n"`。
[fixture: final-newline/final-ordinary]

Output
([final-newline/final-ordinary-output.mmd](../tests/fixtures/agentflow/final-newline/final-ordinary-output.mmd)):

```mmd
agentflow-beta TB
  A
```

### Markdown fences

[Markdown code blocks](./compatibility.md#markdown-code-blocks)と同じく、
外側の字下げを除いた図に単独ファイルと同じ規則を使います。
fence、リスト、引用の字下げはMarkdownが付けます。
最上位、入れ子リスト、引用、設定、値、directive、Name、
大きな保持本文について、ホストと字下げを除いたDbを別に確認します。
Prettierはブロック最終行の末尾空白を落とし、
最後の空白だけのstyleが拒否され得ます。
この制限は処理を返した失敗入力にも適用し、
単独ファイルの値を削る許可にはなりません。
サイズ境界は外側の字下げを除いた本文で判断します。
[fixture: markdown-fences/markdown-list-payload]

入力（エスケープ表記）: `"agentflow-beta TB\nA-->B"`。
[fixture: markdown-fences/markdown-top-payload]

Output
([markdown-fences/markdown-top-payload-output.mmd](../tests/fixtures/agentflow/markdown-fences/markdown-top-payload-output.mmd)):

```mmd
agentflow-beta TB
  A --> B
```

### Click statements

[Whitespace between tokens](./flowchart.md#whitespace-between-tokens)と
[Multi-line statements](./flowchart.md#multi-line-statements)の
callback値の保持を再利用します。
callの括弧前の空白は名前で、引数と文字列は著者の文字だからです。
最初のclick語の後の害のない隙間を整え、
ID・リスト・値以降と後続行の桁位置を保ちます。
href/callの有無、target、記号・数値・プロトタイプ名のID、
穴、
URLとtooltipの空白、引数を渡す2つ目のcallも含みます。
agentflowのtextBeforeUrl/textBeforeTooltipには、消されるclick、
空の説明・文字列・markdown・callを各節点と元の隙間で保ちます。
hrefの両側も同じです。callback名とtargetの前にはprefix欄がありません。
tooltip/target前に必須の空白1文字を保ち、末尾の空の説明は後続文とします。
[fixture: click-statements/callback-padding-unsafe]
[fixture: click-statements/tooltip-required-tab]
[fixture: click-statements/url-form-kept]

固定のリンクtarget前のタブも保ちます。
保持するclickの前置き内のdirectiveも接触する隙間を保ちます。
[fixture: click-statements/target-required-tab]
[fixture: click-statements/prefix-with-directive]

入力（エスケープ表記）: `"agentflow-beta TB\nA\nclick   A cb\n"`。
[fixture: click-statements/click-keyword-gap]

Output
([click-statements/click-keyword-gap-output.mmd](../tests/fixtures/agentflow/click-statements/click-keyword-gap-output.mmd)):

```mmd
agentflow-beta TB
  A
  click A cb
```
