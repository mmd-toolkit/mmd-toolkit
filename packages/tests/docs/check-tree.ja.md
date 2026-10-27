# 記録した木を検査する

English version: [check-tree.md](./check-tree.md)

この文書は、`@mmd-toolkit/tests` の `checkTree()` を説明します。
記録した木（`ast.json`）が、仕様が木について述べる条件を満たすことを、
パーサーを動かさずに、木と入力だけから検査します。

`checkTree()` は木の条件である欄、範囲、トークンとその字句の不変条件を検査し、
入力の受理は決めません。
意味による拒否を含む受理条件は parser の担当です。
記録の種類（`ast.json` または `parse-error.json`）と、
fixture の仕様の読み（`fixtureAccepts`）を比べて確かめます。

## なぜ必要か

[db-from-tree.ja.md](./db-from-tree.ja.md) の比べは、
Db を作る範囲とテキストが正しいことを示します。
木のほかの欄が正しいことは示せません。
葉のノードの値、矢印の欄、形の名前、コメントの印、
トークンが空白で始まったり終わったりしてよい所などです。
パーサーがこれらに誤った値を記録しても、Db は入力を読み直すので、
mermaid.js の Db のままです。
`checkTree()` はこの隙間を閉じます。
`ast.json` が記録する木は、そのような欄がすべて、仕様のとおりの木です。
ほかの言語のパーサーも同じ木を返さなければならず、
この検査は同じ条件をそれに課します。

## 何を読むか

```ts
const problems: TreeProblem[] = checkTree(text, tree)
```

- `text` は書かれたままの入力、
  `tree` は `ast.json` の内容（`CheckedRoot`）です。
  木は JSON そのままです。
  検査は、名前を挙げた欄を読み、欄がない、または形が違うときは、
  誤りでなく問題として報告します。
- 結果は、成り立たない条件の一覧です。
  各項目は、どこ（ノード、トークン、記録）かと、メッセージを持ちます。
  すべてを満たす木では空です。
  最初で止めず、木のすべてを検査するのは、誤った木の被害の全体を見るためです。
- ディレクティブとコメント行は、木から取らず、テキストから見つけます
  （`src/source-scan.ts` の `scanSource()`。
  [db-from-tree.ja.md](./db-from-tree.ja.md) の変換した形も使います）。
  木にないコメントやディレクティブを見つけるためです。
  木から取るのは `IgnoredSemicolon` のトークンです。
  行の規則がどの `;` を無視するかは、行の区切りと図種に依ります。
- HTML 属性の引用符の位置は、Db と同じ共有の変換で、
  フロントマターの後のソース全体から一度求めます。
  コメントや前の文も含めた文脈を、
  文字列、ラベル、データブロックの範囲に当て、
  値の中だけでタグを探し直しません。
  ノードの値とトークンは、書かれた引用符を保ちます。
  [fixture: venn/db-html-tag-from-title-name]
  [fixture: venn/db-html-tag-from-title-label]
  [fixture: venn/db-html-tag-from-title-style]
  [fixture: venn/db-html-tag-from-comment-name]
  [fixture: venn/db-html-tag-across-names]
  [fixture: c4/db-html-tag-from-earlier-text]
  [fixture: kanban/db-html-tag-from-earlier-text]
  [fixture: kanban/db-html-tag-from-earlier-text-data]
  [fixture: block/db-html-tag-from-earlier-text]
  [fixture: quadrant/db-html-tag-from-earlier-text]
  [fixture: sankey/db-html-tag-from-earlier-text]
  [fixture: sankey/db-html-tag-from-earlier-text-quoted]
  [fixture: xychart/db-html-tag-from-earlier-text]
- 木の形は、ノードの型と記録ごとの欄の表が与えます
  （`src/check-tree/node-fields.ts`）。
  各欄の名前と種類（ある型の値、ノード、ノードか null、ノードの列）です。
  木の形を定めるのは仕様で、ast.md、`ast/<図種>.md`、parser/docs/tokens.md の
  欄の表がそれです。
  この表はその写しで、`tests/check-tree-node-fields.test.ts` が、
  それらの表と合うことを求めます。
  欄がない木、その型にない欄を持つ木、
  別の種類の欄（ノードの所に列、ノードか null の所に文字列）を持つ木、
  範囲が offset の組でない木は報告し、ほかの検査は動かしません。
- ノードの子は、表がノード、ノードか null、ノードの列とする欄です。
  `Root` の子の欄は `body` だけです。
  ノードの欄の順は使わず、`loc` の中の key の順も使いません。

## 検査

- **位置。** どの範囲も入力の中にあり、どの `loc` も `range` の場所です。
  （[positions.md](../../parser/docs/positions.md) の Positions）。
  トークン、コメント、ディレクティブの範囲は空ではありません
  （positions.md の Invariants）。
- **すべての文字が置かれている。** トークンとコメントの外の文字は空白です
  （positions.md の Invariants）。
- **テキスト。** トークンの `value`、コメント・ディレクティブ・フロントマターの
  テキストは、範囲のソースと等しいです
  （positions.md の Invariants、[ast.md](../../spec/docs/ast.md)）。
- **コメント。** コメント行は走査が見つけた所にあり、印は `%%` です。
  図のコメントはその図種の印を持ち、
  閉じた block comment を除き、行の終わりで終わります
  （mindmap 図のコメントは行の区間の終わりまで走るので、
  U+2028 や U+2029 の前でも終わります）。
  flowchart と ER 図と sankey 図と block 図が印 `%%` を持つのは、
  ヘッダーの前の `%%` だけの行のコメントで、どの図種もそうです。
  それ以外のコメントには持ちません。
  gantt 図の図のコメントは、印 `%%` と `%` を持ち、
  journey 図と requirement 図と timeline 図の図のコメントは、
  印 `#`、`%%`、`%` を持ち、
  mindmap 図、xychart 図、C4 図、quadrant chart の図のコメントは、
  印 `%%` を持ちます。
  印のない断片は、コメント領域に続きます
  （parser/docs/tokens.md の Comment、
  [common.md](../../spec/docs/common.md#comment-lines) の Comment lines）。
  railroad の native comment は方言に応じて `/*`、`(*`、`;`、`#` も使います。
  eventmodeling は `/*` と `//` も使います。
  block comment は最初の必須の閉じを範囲に含み、値からは除きます。
  共通のコメント領域の後の最後の断片でも同じです。
  [fixture: eventmodeling/comment-native]
  [fixture: railroad/ir-tail-comment] [fixture: railroad/ebnf-comment-iso]
  [fixture: railroad/abnf-comment-semicolon-ls]
  [fixture: railroad/peg-comment-hash-ps]
  印と閉じは共通の除去の後のテキストで検査します。
  その中の directive も共有記録に残ります。
  [fixture: railroad/ir-comment-block-common-region]
  [fixture: railroad/ebnf-comment-iso-common-region]
  [fixture: railroad/ir-comment-c-open-mark-directive]
  [fixture: railroad/ebnf-comment-c-open-mark-directive]
  [fixture: railroad/ebnf-comment-iso-open-mark-directive]
- **ディレクティブ。** 木のディレクティブは走査が見つけたものと同じで、
  `closed` と、末尾の空白を除いた一致の範囲を持ちます
  （ast.md の Directive、common.md の Where a directive is）。
- **トークン。** ソース順で、重なりません。
  空白で始まる・終わるのは、値が始まる・終わる所、
  切れ目（ディレクティブ、コメント領域、行の規則が無視する `;`）の隣、
  直前のトークンが始めた値に続く所、
  空白だけのトークンで、同じ値に属するトークンが後ろに隙間なく続く所
  （シーケンス図の box のテキストで、色の候補と残りの間の空白）だけです。
  ディレクティブはほかのトークンの中になく、コメントもありません
  （positions.md の Invariants）。
- **文字列。** どの図種も共有するノード型 StringLiteral のトークンは、
  何も切らなければ 1 つの `String` トークンで、
  ディレクティブ、コメント領域、行の規則が無視する `;` が切れば
  切れ目の数より 1 つ多い `StringFragment` トークンです
  （parser/docs/tokens.md の String tokens）。
- **切られないトークン。** ディレクティブと行の規則が無視する `;` は、
  `String`（そのときは `StringFragment` のトークン）と
  `RawText` のトークンの中にだけあり、
  ほかのトークンの中にはありません
  （parser/docs/tokens.md の A token that a directive cuts）。
  - `Identifier` と `Numeric` の種類で、
    切れ目があり、間に空白のない 2 つのトークンは、
    切られたトークンの断片として報告します。
    1 つのトークンでできたノード（矢印、数、`Identifier`）が、
    2 つ以上持つ場合も報告します。
  - `Keyword` と `Punctuator` のトークンは、
    その図種の表が挙げるテキストを持ちます。
    切られたものの断片を見分ける判定は 1 か所
    （`src/check-tree/tokens.ts` の `fragmentsOfEntries()`）で行います。
    同じ種類の 2 つ以上のトークンが、切れ目だけを間に持って続き、
    つないだテキストが表の 1 つのテキストであれば報告します。
    トークンの数は問わず、切れ目がつながる長い連続の中の短い連続も調べます。
    切れ目が前後のどのトークンをつないでいても同じです。
    報告は連続ごとに 1 つで、1 か所（`reportCutEntries()`）で作り、
    連続の最初のトークンに付けます。
    断片を順に挙げ、それらがつくるテキストを添えます。
    そのため、`sub`、切れ目、`graph` は `subgraph` の断片で、
    `su`、切れ目、`bgr`、切れ目、`aph` もそうです。
    後者は、どの 2 つをつないでもキーワードになりません。
    疑似状態の印と空の説明ブロックの始まり
    （`<<choice>>`、切れ目、`accDescr`）は、それぞれ別の単位です。
    2 つのテキストをつないだものは、表のどのテキストでもないからです。
  - `Keyword` のテキストの表（`src/check-tree/keywords.ts`）は、
    各図種の Tokens の表の `Keyword` の行の語と、
    その行がテキストを挙げずに名前で示す単位
    （ヘッダー、方向、リンクの宛先、疑似状態の印、wrap の接頭辞、曜日）の
    テキストです。
    テストがそれを求め、記録した木のすべての `Keyword` トークンが
    表にテキストを持つことも求めます。
    gantt 図では、行がヘッダーと `day` を単位として示し、
    それは `gantt` と、weekday 文と weekend 文の 7 つの曜日です。
    journey 図では、行がヘッダー（`journey`）と、
    文を始める語（`title`、`section`、`accTitle`、`accDescr`）を示します。
  - 矢印のトークン以外の `Punctuator` のテキストは、その図種が持つものです
    （`src/check-tree/punctuators.ts`。各図種の Tokens の表の
    `Punctuator` の行の写しです）。
    そのトークンの連続が表の 1 つのテキストの断片
    （`:::` に対する `:` と `::`、`((` に対する `(` と `(`）であれば報告します。
    `A(x)%%{init: {}}%%:::c` の `)` のように、
    切れ目が前のトークンをつないでいる場合も報告します。
    形の開きと閉じは、それぞれ 1 つのトークンです。
    class の矢印の関係の端と線も、それぞれ 1 つのトークンです。
    切れ目をはさむ 2 つの `,` は 2 つの単位です。
    表に `,,` というテキストはないからです。
  - `String` のトークンは引用符で始まり、後ろに切れ目が続くものは閉じています。
- **フロントマター。** 最初のトークンは `---`、本文、`---` です。
  本文は、前後の空白を含まない 1 つの `RawText` のトークンで、
  本文が空白だけのときはありません
  （positions.md の Invariants）。
- **ノードの範囲。** ノードは、トークンの始まりから終わりまでで、
  親の範囲の中にあります。
  そのため、すべてのノードがトークンを持ちます。
  空白だけの flowchart のラベルは、
  その空白の 1 つの `RawText` のトークンを持ちます。
  ノードの子は重なりません。
  子は、子の欄の順に、リストはそれぞれの順に、ソース順に並びます。
  ただし、1 つの一覧（`src/check-tree/invariants.ts` の
  `CHILD_FIELDS_NOT_IN_SOURCE_ORDER`）のノードは例外で、
  それぞれの文書の文を添えてあります。
  2 つの矢印の間に書いた flowchart のリンクのラベルは、
  ソースでは矢印の前にあります。
  gantt の click 文のリンクは、call より前に書くと、
  ソースでは call の前にあり、子の欄は `ids`、`call`、`href` の順です
  （ids は、どの部分が続いても先頭です）。
  本体は仕様の定める図で、図のトークンを覆います
  （positions.md の Node ranges と Invariants）。
- **リテラル。** `StringLiteral` と `NumericLiteral` の `raw` は、
  範囲のソースです。
  `StringLiteral` の `closed` は、`raw` が 1 字より長く、
  始まりの引用符で終わるかどうかです
  （positions.md の Invariants、ast.md の StringLiteral）。
- **`error` の疑似図。** そのトークンは、空白も行終端も含まない
  `RawText` のトークンで、どの 2 つも接しません
  （ast.md の ErrorDiagram）。
- **値。** 値を持つノードの値は、その範囲のソースから、
  `src/check-tree/values.ts` の表が型ごとに当てる 1 つの規則で作られます
  （ast.md の Nodes、`ast/<図種>.md`）。下を参照してください。
- **トークンと値のノード。** 値のトークンは値のノードの中にあります。
  キーワードと記号は、文書が述べる例外を除いて、ありません
  （`parser/docs/tokens/<図種>.md` の Tokens）。
- **決まった語と欄。** ノードの語と印が書く欄は、その書くとおりで、
  何も書かれていないときは null です（`ast/<図種>.md`）。
  - flowchart: 矢印の印、線、長さ。
    形の名前と、property を持つかどうか。
    ラベルの `kind`。
    header の方向（header のキーワードの次のトークンが方向でなければ null）。
    direction 文の方向。
    click 文の target。
    スタイルとサブグラフの名前が持つ空白と、2 つのスタイルを分ける `,`。
    説明ブロックの `closed`。
  - sequence: 参加者の `created` と `kind`。
    メッセージの `activation`（`+` か `-`、ないときは null）。
    メッセージの 2 つの中央接続（それぞれ矢印の自分の側の `()`）。
    メッセージの矢印。
    テキストの `wrap`。
    box のテキストの部分。
    note の位置。
    autonumber 文の `off`。
    説明ブロックの `closed`。
  - class: 矢印の印と線（それぞれ 1 つのトークン）と、
    矢印であるはずの矢印のテキスト。
    メンバーの可視性と分類子（印は多くても 1 つ）。
    方向と target。
  - state: 終端と区切りのトークン。
    疑似状態の種類（`<<kind>>` か `[[kind]]` と書く）。
    note の位置。
    `hide empty description` の語（1 語が 1 トークン）。
    方向。
    説明ブロックと文字列の `closed`。
  - er: 関係の基数と線（それぞれ 1 つのトークン）。
    方向（direction 文の値を大文字にしたもの）。
    属性に `?` があるかどうか。
    実体の属性（`{` が開く）と、サブグラフの題（`[` が開く）。
  - gantt: ノードが子ノードの外に自分で書くトークンは、その規則のものです。
    種類は Tokens の表のとおりで、`:`、`,`、`{`、`}`、`(`、`)` が
    `Punctuator`、ほかは `Keyword` です。
    図の header `gantt`（大文字小文字もこのとおり）、
    文のキーワード、
    アクセシビリティ文の `:` か波括弧、
    call 部分の `call` と括弧、
    タスクのデータの `:` とコンマ、
    click 文の `click` とコンマと `href` です。
    weekday 文と weekend 文の `day`
    （小文字にしたそのトークンで、7 つの曜日か `friday` と `saturday`）。
    タグ（5 つの語のどれか。大文字小文字もこのとおり）、項目、idは、
    区切りの間の区間（コンマの数より 1 つ多い）で、
    それぞれ区間を満たし、空白だけの区間では null です。
    最初の項目はタグの語のどれでもなく、`items` は空でなく、
    リストの id と項目に `,` はありません。
    click 文の call と link の少なくとも一方があること、
    閉じていて空でない URL。
    コールバックの名前（`(` まで続きます）と、
    その引数（括弧の間が空白だけなら null）。
    値のトークンの種類。
    `GanttLiteral` のトークンは `RawText`、
    id とリストの項目は `Identifier`、
    タグは `RawText`（ディレクティブが切れば断片ごとに 1 つ）です。
    文と call 部分の範囲。
    ノードのトークンと子ノードの最初から最後までで、
    click 文は子の欄の順にかかわらずソース上で最後の部分で終わり、
    最後のトークンの後ろの空白は範囲に入りません。
    リンクの範囲は `"` から `"` までです。
    設定、title、section のテキストが始まる所
    （キーワードの後ろの空白 1 字）と終わる所
    （行の終わり。文が述べる所では `#` か `;` の前）。
    アクセシビリティ文の値の始まりと終わり
    （両端の空白を含みません）。
  - journey: ノードが自分で書くトークン、その種類、文の範囲、
    title と section のテキスト、アクセシビリティ文の値の検査は、
    gantt 図と同じコードです（`src/check-tree/statement-checks.ts`）。
    トークンの種類は parser/docs/tokens/journey.md のとおりです。
    `:`、`,`、`{`、`}` が `Punctuator`、ヘッダーとキーワードが `Keyword`、
    すべての値が `RawText` です。
    タスクが書くのは、コロンと、
    人がいるなら 2 つ目のコロンとその間のコンマです。
    スコアと人は、コロンとコンマの間の区間です
    （スコア部分は最初のコロンから 2 つ目のコロンまたはデータの終わりまで、
    人の部分は 2 つ目のコロンから 3 つ目のコロンまたは終わりまで）。
    人はコンマの数より 1 人多く、それぞれ区間を満たし、
    空白だけの区間では null で、両端の空白を含みません。
    スコアに `:` はなく、人に `,` と `:` はありません。
    `textAfter` は 3 つ目のコロンで始まり、空白で終わらず、
    2 つ目のコロンがあるときだけあります。
    タスクの description はコロンまで続き（コロンの前の空白を含みます）、
    空白で始まらず `:` を含みません。
    section の名前に `:` はありません。
    title と section のテキストは、キーワードの後ろの空白 1 字の次から始まり、
    行の終わりか `#` の前で終わります。
  - requirement: ノードが自分で書くトークン（子ノードの外）と子ノードは、
    ソースの順に、その文のものと一致します。
    トークンはテキストを小文字にしたもの、子ノードは欄の名前を、
    ラベルとして 1 つの並びにします。
    requirement と element は、キーワード、名前、
    `:::` とクラス（クラスの間は `,`。クラスがなければ両方ありません）、
    `{`、項目、`}` です。
    関係は、左の名前、`-`、関係、`->`、右の名前です。
    `backward` なら `<-`、関係、`-` です。
    direction は、前のテキスト、`direction`、値、後ろのテキストで、
    テキストは null でないときだけあります。
    style、classDef、class と略記は、キーワード（略記は名前と `:::`）と
    リストで、リストの 2 つの要素の間に `,` があります。
    アクセシビリティ文は、キーワード、`:` か波括弧、値です
    （空のブロックには値がありません）。
    欄の語は、書かれたキーワードのとおりです。
    requirement の種類は、文を始めるキーワードを種類の名前の形にしたもの
    （`functionalRequirement`）です。
    field、risk、検証方法、関係はキーワードを小文字にしたもの、
    direction は値を大文字にしたもので、どれも文書の語の 1 つです。
    names、classes、styles のリストは空ではありません。
    ヘッダーは `requirementDiagram` で、
    `requirement` は大文字小文字までこのとおり、残りはどの大文字小文字でもよい
    （diagrams/requirement.md の Detection）。
    欄の子ノードの型は、その表の型です
    （`REQUIREMENT_CHILD_TYPES`。
    ast/requirement.md の Type の列と合うことをテストが確かめます）。
    引用符のない名前とテキストは、空でなく、空白で始まらず終わらず、
    名前とフィールドの値は ASCII の単語文字で始まり、
    `:`、`,`、`{`、`<`、`>`、`-`、`=` と改行を含みません。
    スタイルは `,` を含みません
    （diagrams/requirement.md の Names and values、The style context）。
    文字列は閉じていて、空ではありません。
    `direction` の前のテキストは改行と U+2028、U+2029 を含まず、
    値の後ろのテキストは改行を含みません。
    `direction` と値の間の空白は空ではなく、
    行は最後の部分で終わります（The direction line）。
    本体の項目のテキストは、空白を除くと `accDescr{}` です
    （大文字小文字は問いません）。
    アクセシビリティ文の値は gantt 図と同じに読み、
    説明ブロックのテキストは `}` を含みません。
    トークンの種類は parser の `docs/tokens/requirement.md` のとおりです。
    ノードが自分で書くトークンは、`:`、`,`、`{`、`}`、`:::`、`-`、`->`、`<-` が
    `Punctuator`、ほかは `Keyword` です。
    テキストのトークンは `RawText`、direction の行のテキストは `RawText`、
    本体の空の description ブロックは `Keyword` と `Punctuator` です。
    名前は、`style` と `classDef` の後と `class` の文の names では
    `Identifier`、
    requirement、element、関係、省略形では `RawText`、
    `class` の文のクラスでは `Identifier` か `RawText` です。
    文の範囲は、トークンと子ノードの最初から最後までです
    （`parser/docs/positions/requirement.md`）。
  - mindmap: 検査は木とソースのテキストを読みます。
    欄の子ノードの型は、その表の型です
    （`MINDMAP_CHILD_TYPES`。
    ast/mindmap.md の Type の列と合うことをテストが確かめます）。
    開き記号、閉じ記号、ラベルの種類は、Meaning の列が挙げる語の 1 つで、
    これもテストが確かめます。
    ノードはノードテキストか形か、その両方を持ちます。
    `indent` は、書かれたテキストの中で、その行のノードの前にある空白の数で、
    空白はどれも 1 字と数えます（タブ、U+3000、U+2028 も）。
    ノードの始まりから、前の行終端子か空白でない文字まで戻って数えるので、
    ヘッダーの行にある根の `indent` は、ヘッダーの後ろの空白の数です
    （diagrams/mindmap.md の Units and contexts）。
    ノードの親は、その前の、`indent` がより小さい最も近いノードで、
    ノードの子は、そのようなノードをソース順に並べたものです。
    最初のノードでなく、そのようなノードがないノードは、
    2 つ目の根になります（Indentation and parents）。
    ノードの装飾は、そのテキストの後ろで、
    ソースの次のノード（どのノードでも）の前に置かれます
    （ast/mindmap.md の MindmapNode）。
    ノードテキストは終わりの空白を保ちます。
    形はその終わりから始まり、形がなければ行はその直後に終わります。
    空白で始まらず、
    `(`、`[`、`)`、`{`、`}` と行終端子を含まず、
    `%%`、`::icon(`（大文字小文字は問いません）、`:::`、
    キーワード `mindmap` で始まりません。
    これらは、ノードテキストの規則より前の規則が読むものです
    （The statement context）。
    アイコンは `::icon(` と `)` の間にあり、
    その隣の空白がどうでも、`)` を含みません。
    クラスは `:::` の後ろから、line feed、U+2028、U+2029、
    テキストの終わりのどれかまで続き、それらを含みません
    （The icon and class contexts）。
    形は、開き記号、ラベル、閉じ記号のとおりに書かれ、ほかには何もありません。
    開き記号 `-)` は単位の先頭にある形のものなので、
    その前にノードテキストはなく、
    閉じ記号 `-)` は文字列かマークダウン文字列にだけ続きます
    （The shape context）。
    ラベルは空ではありません。
    文字列とマークダウン文字列は区切りとともに書かれ、値は区切りを除きます。
    区切りは、ラベルの書かれたテキストの最初と最後の文字なので、
    区切りの 2 文字の間にあるディレクティブは、値に入りません。
    テキストは `"` で始まりません。
    文字列の規則がテキストの規則より先に当たるからです（The shape context）。
    テキストは `)`、`]`、`(`、`}` を含まず、
    文字列は `"` を含まず、
    マークダウン文字列はバッククォートと `"` を含みません。
    トークンの種類は `parser/docs/tokens/mindmap.md` のとおりです。
    ノードが自分で書くトークンは、
    `:::`、icon の行の `)`、形の開き記号と閉じ記号が `Punctuator`、
    ヘッダと `::icon(` が `Keyword` です。
    ノードテキスト、形のテキスト、icon、class のトークンは `RawText`、
    文字列とマークダウン文字列のトークンは `String` か `StringFragment` です。
    子の欄 `id`、`shape`、`decorations`、`children` は書かれた順で、
    列もそうです（ast.md の Nodes。ast/mindmap.md は例外を述べません）。
    ノードが自分で書くトークンをつないだものは、
    図では小文字の `mindmap`（diagrams/mindmap.md の Detection）、
    icon の行では `::icon(`（大文字小文字は問いません）と `)`、
    class の行では `:::`、形では開き記号と閉じ記号、ノードでは空です。
    ノードと文の範囲は、トークンと子ノードの最初から最後までです
    （`parser/docs/positions/mindmap.md`）。
    リテラルとラベルの範囲は、トークンの始まりから終わりまでで、
    これはすべての木の検査が読みます。
  - timeline: 検査は木とソースのテキストを読みます。
    欄の子ノードの型は、その表の型です
    （`TIMELINE_CHILD_TYPES`。
    ast/timeline.md の Type の列と、その `TimelineStatement` の文が挙げる文とに
    合うことをテストが確かめます）。
    direction は大文字小文字を問わず `LR` か `TD` で
    （`TIMELINE_DIRECTIONS`。Meaning の列と合うことをテストが確かめます）、
    event の文の events は空ではありません。
    period は空ではなく、空白で始まらず、
    実体の `#` のほかに `#` を含まず（common.md の Entities）、
    `:` と行終端子を含まず、
    `#`、`:`、行終端子、テキストの終わりの前で終わります
    （diagrams/timeline.md の The statement context、規則 14）。
    period の始まりから先の、字句解析器が読む書かれたテキスト
    （ディレクティブとコメント行を除く）は、
    period の規則より前の規則が読む単位で始まりません。
    後ろに `{` が続かない `%`、キーワード `timeline`、
    改行も含む空白文字とその後ろの 1 文字を持つ `title` と `section`、
    空白（改行も含む）の後ろに `:` か `{` を持つ `accTitle` と `accDescr` です。
    そのため、period かどうかは period の後ろの行が決めます。
    event は、`:` と空白 1 文字（改行も含む）の後ろのテキストです。
    空ではなく、行終端子を含まず、`:` は空白でない文字の前にしか含まず、
    `:`、行終端子、テキストの終わりの前で終わります。
    その前の項目との間には、その `:` とその 1 文字のほかに、
    空白と図のコメントしかありません（規則 13）。
    title と section の名前は、キーワードと空白 1 文字の後ろから始まり、
    空ではなく、行終端子を含みません。
    title は行末まで、section の名前は `:` を含まず、`:` か行末の前で終わります
    （規則 8 と 12）。
    アクセシビリティのテキストは、キーワード、`:`（ブロックでは `{`）、
    改行も含む空白の後ろに続きます（規則 9 から 11、Accessibility values）。
    空ではなく、両端に空白がありません。
    行のテキストは行末まで、ブロックのテキストは `}` を含まず、
    空白と `}` が続きます。
    テキストのないブロックは、キーワード、`{`、空白、`}` だけです。
    event の文は、period の文でも event の文でもない文の後ろにあり、
    その前に period の文があります
    （ast/timeline.md の TimelineEventStatement）。
    子の欄はソースの順です
    （ast.md の Nodes。ast/timeline.md は例外を述べません）。
    トークンの種類は `parser/docs/tokens/timeline.md` のとおりです。
    ノードが自分で書くトークンは、
    `:`、`{`、`}` が `Punctuator`、
    ヘッダー、direction、キーワードが `Keyword` です。
    テキストのトークンは `RawText` です。
    ノードが自分で書くトークンをつないだものは、
    図では `timeline` と書かれたとおりの direction、
    period の文と event の文では event ごとの `:`、
    title と section ではキーワード（大文字小文字を問わない）、
    アクセシビリティの文ではキーワードと `:`、
    ブロックではキーワードと波括弧です。
    `direction` はヘッダーの後ろのトークンで、なければ null です。
    ノードと文の範囲は、トークンと子ノードの最初から最後までです
    （`parser/docs/positions/timeline.md`）。
    リテラルの範囲は、トークンの始まりから終わりまでで、
    これはすべての木の検査が読みます。
  - sankey: 検査は木とソースのテキストを読みます。
    欄の子ノードは、その表の型です
    （`SANKEY_CHILD_TYPES`。テストが ast/sankey.md の Type の列と合わせます）。
    図の body にはリンクが 1 つ以上あります。
    SankeyIdentifier と SankeyLiteral の値は、
    両端に空白がなく、文字の間の空白と、`"` と `,` 以外の
    ASCII の印字可能文字を含みます
    （ast/sankey.md の SankeyIdentifier と SankeyLiteral）。
    StringLiteral の値は、閉じていて、空ではなく、
    ASCII の印字可能文字と行終端を含み、
    各 `"` は `"` の対の中にあります
    （diagrams/sankey.md の Strings）。
    これらの条件では、HTML の属性の引用符の `"` は `'` として読みます
    （diagrams/sankey.md の Characters）。
    sankey 図には、ヘッダーの後ろに図のコメントがありません
    （diagrams/sankey.md の Comments）。
    ヘッダー（大文字小文字を問わず `sankey` か `sankey-beta`）は、
    図が自分で書くただ 1 つのトークンで、`Keyword` のトークンです。
    ヘッダーと各レコードは、それぞれ自分の行にあります。
    ヘッダーと最初のレコードの間、2 つのレコードの間には、
    ディレクティブとコメント行を除き、
    行終端を含む空白だけがあります。
    リンクは 2 つの `Punctuator` のトークン `,` を書き、
    source、最初の `,`、target、2 つ目の `,`、value は、
    間に空白だけを置いてこの順に続きます。
    引用符のない欄のトークンは `RawText` で、
    ディレクティブや無視される `;` で複数に切れることがあります。
    欄の両端の空白は含みませんが、空白だけの欄は例外で、
    ただ 1 つのトークンがその空白で、値は空です。
    図とリンクの範囲は、トークンと子ノードの最初から最後までで、
    欄の範囲は、前後の空白を除いたトークンの範囲です
    （`parser/docs/tokens/sankey.md` と `parser/docs/positions/sankey.md`）。
  - xychart: 検査は木とソースのテキストを読みます。
    欄の子ノードは、その表の型です
    （`XYCHART_CHILD_TYPES`。
    テストが ast/xychart.md の Type の列と合わせます）。
    図にはヘッダーが 1 つ以上、band にはカテゴリーが 1 つ以上、
    プロットには値が 1 つ以上あります。
    ヘッダーは最初の文より前にあります
    （ast/xychart.md の XychartDiagram）。
    ヘッダーの向きは、なしか、
    大文字小文字を問わず `vertical` か `horizontal` で、
    プロットの種類は、小文字の `line` か `bar` です
    （`XYCHART_ORIENTATIONS` と `XYCHART_PLOT_KINDS`。
    テストが Meaning の列と合わせます）。
    title は空ではなく、軸の文には title かデータ、またはその両方があり、
    引用符で空の title の後ろにはデータがあり、
    カテゴリーは空ではありません
    （ast/xychart.md の XychartTitleStatement、XychartXAxisStatement、
    XychartYAxisStatement、XychartBand）。
    引用符のないテキストは、空ではなく、ASCII の英字と数字と
    `-`、`_`、`.`、`+`、`=`、`*`、`&`、`#` を含みます
    （diagrams/xychart.md の The statement context の規則 6）。
    軸の title には数字がありません。そこでは数字が数を始めるためです
    （The axis context）。
    アクセシビリティの文のテキストは空ではなく、
    行のものは行終端を含まず、ブロックのものは `}` を含みません
    （Accessibility values）。
    テキストのない `accTitle:` と `accDescr:` の文は最後の文です。
    そのテキストは、キーワードの後でテキストのある最初の行だからです
    （Accessibility values）。
    閉じないブロックも最後の文です。テキストの終わりまで続くからです
    （ast/xychart.md の XychartAccDescrBlockStatement）。
    数の書かれたテキストでは、符号は任意で、
    桁に任意の小数部が続くか、小数部だけです（The axis context）。
    文字列は閉じていて、`"` を含みません。
    ただし、HTML の属性の引用符の `"` は `'` として読みます（Strings）。
    図のコメントの印は `%%` です（Comments）。
    トークンの種類は `parser/docs/tokens/xychart.md` のとおりです。
    ノードが自分で書くトークンは、`[`、`]`、`,`、`;`、`:`、`{`、`}`、`-->` なら
    `Punctuator`、ヘッダー、向き、キーワードなら `Keyword` です。
    引用符のないテキストのトークンとアクセシビリティの文のテキストのトークンは
    `RawText`、数のトークンは `Numeric` です。
    ノードが自分で書くトークンと子ノードは、間に空白だけを置いて、
    次の順に並びます。
    ヘッダーと、あれば向き。
    `title` とそのテキスト。
    `x-axis` か `y-axis`、title、データ（title が先）。
    `[`、2 つごとに `,` を挟んだカテゴリー、`]`。
    始まり、`-->`、終わり。
    `line` か `bar`、title、`[`、2 つごとに `,` を挟んだ値、`]`。
    数とそのラベル。
    `accTitle` か `accDescr`、`:`、行の終わりまで続くテキスト。
    `accDescr`、`{`、テキスト、`}`（`}` があるのは `closed` が真のときだけ）。
    図は、行を終える `;` を自分で書きます。
    向きは、ヘッダーの 2 つ目のトークンを書かれたとおりに持つか、null です。
    プロットの種類は、そのキーワードを小文字にしたものです。
    `closed` は、ブロックの最後のトークンが `}` かどうかで、
    閉じないブロックは、テキストの後ろに空白しかありません。
    引用符のないテキストで、間に何もなく続く語は 1 つのトークンなので、
    そのようなテキストの 2 つのトークンの間には、空白か切れ目があります。
    図、文、その下のノードの範囲は、
    トークンと子ノードの最初から最後までです
    （`parser/docs/positions/xychart.md`）。
  - quadrant: 検査は木とソースのテキストを読みます。
    欄の子ノードは表の型です
    （`QUADRANT_CHILD_TYPES`。
    テストが ast/quadrant.md の Type の列と合わせます）。
    `classDef` はスタイルを持ちます。
    軸の文の軸は `x` か `y` で、キーワードの小文字の文字です。
    `end` は `arrow` が true でなければ null で、
    矢印はテキストの間か、ただ 1 つのテキストの後ろに書かれ、
    ほかの場合は書かれません（ast/quadrant.md の QuadrantAxisStatement）。
    象限の文の番号はキーワードの数字で、1 から 4 です
    （QuadrantQuadrantStatement）。
    ラベルの種類は `text`、`string`、`markdown` です
    （`QUADRANT_AXES` と `QUADRANT_LABEL_KINDS`。
    テストが Meaning の列と合わせます）。
    値はその書かれたテキストで、文字列かマークダウン文字列では、
    内容に残りの書かれたテキストを続けたものです（QuadrantLabel）。
    引用符のないテキストは語で始まり、英字、数字、ASCII の外の文字、
    句読点 `!$%&'*+,./=?\_#`、バッククォート、`-`、空白を含みます。
    文字列は空でなく、その後ろはテキストの残りで、文字列を含みません
    （diagrams/quadrant.md の The statement context、Texts、Strings、
    Empty strings）。
    文字は、テキストを変換した形のものです。
    その形では、実体は ASCII の外の文字です
    （Entities, HTML attribute quotes, and `style` lines）。
    タイトルはないか、空でなく、両端に Notation の空白がなく、
    行終端のないものです。
    アクセシビリティの行のテキストは、空でなく、両端に空白がなく、行終端がなく、
    ブロックのテキストは `}` を含みません（Accessibility values）。
    点のクラス名は ASCII の英字、数字、`_` で（The class name context）、
    座標は `1`、または `0` に、
    改行・U+2028・U+2029 以外の 1 文字と数字を続けたものです
    （The point context）。
    `classDef` のクラスの名前は、変換した形で、
    英字、数字、ASCII の外の文字、`&`、`#`、`*`、
    `-`、`,`、`:` を含み、空白を含みません（Classes）。
    スタイルは、英字、数字、`:`、`#`、`-`、空白を含み、
    `QUADRANT_STYLE_NAMES` の名前、`:`、その名前の形の値です
    （Points と Rejections outside the grammar）。
    1 行の 2 つの文の間には、一方が空の説明ブロックでない限り `;` があり、
    テキストのあるブロックの後ろには、その行に空の説明ブロックだけが、
    間を空けずに続き、
    行はその直後で終わります。
    行末のコメントは、その後ろに続くものに数えません
    （Diagram and statements、Titles and accessibility statements）。
    図のコメントは印 `%%` を持ちます（Comments）。
    文字列のラベルのトークンは、1 つの `String` トークンか、
    ディレクティブ、コメント領域、無視される `;` が文字列を切った場合の
    `StringFragment` トークンで、
    その後ろの語は `RawText` トークンです。

  - gitgraph: 18 ノードの型、子の欄、ソース順は
    [ast/gitgraph.md](../../spec/docs/ast/gitgraph.md) に従う。
    ヘッダーは書かれた LR・TB・BT または null だけを持つ。
    接続・分離した colon の境界を区別し、
    ヘッダーの部品の間に可視 LF を許さない。
    [fixture: gitgraph/gram-all-fields] [fixture: gitgraph/header-only]
    [fixture: gitgraph/header-colon-commit-inline] [fixture:
    gitgraph/header-hidden-before-direction-colon] [fixture:
    gitgraph/header-visible-lf-before-colon]
    各文・option は書かれた語、句読点、子の型、nullable な欄を検査する。
    checkout は checkout・switch、message は msg・裸文字列の null を保つ。
    type は NORMAL・REVERSE・HIGHLIGHT を保つ。
    繰り返す option はソース順である。
    option の語と colon は共通の除去後に接し、
    native 空白・hidden form を挟めない。
    [fixture: gitgraph/gram-commit-repeated-options] [fixture:
    gitgraph/gram-merge-repeated-options] [fixture:
    gitgraph/gram-cherry-pick-repeated-options] [fixture: gitgraph/gram-switch]
    [fixture: gitgraph/lex-option-global-before-colon] [fixture:
    gitgraph/lex-option-hidden-before-colon] [fixture:
    gitgraph/gram-commit-colon-space]

    共有の葉は、その位置の完全な字句単位である。
    文字列は閉じ、backslash の対は物理 LF・LS・PS を越せない。
    escape しない改行は内容のままである。
    order はゼロ・dot 境界の優先を満たす完全な符号なし整数である。
    裸の参照は先頭・内部・末尾の文字に従い、
    先行する整数、同長のキーワード、共通の複合形式に負ける。
    ほかのキーワードは長い裸の参照に譲る。
    [fixture: gitgraph/lex-string-escapes] [fixture:
    gitgraph/lex-string-backslash-lf] [fixture: gitgraph/lex-string-multiline]
    [fixture: gitgraph/number-leading-zero] [fixture:
    gitgraph/lex-reference-zero-before-dot] [fixture:
    gitgraph/lex-reference-multiple-digits-before-dot] [fixture:
    gitgraph/lex-reference-digit-dot] [fixture: gitgraph/lex-reference-shape]
    [fixture: gitgraph/lex-reference-reserved] [fixture:
    gitgraph/lex-reference-common-prefix] [fixture:
    gitgraph/lex-reference-keyword-prefixes]

    hidden form は所有者を 1 つだけ持つ。
    ヘッダーの指定 gap、文の参照前、option の textBefore・textBeforeValue、
    可視 EOL 前の textAfter、または EOL 後の body である。
    文字の明示的な走査で、YAML は本文を含む最初の有効な閉じを先に探す。
    それがない場合だけ直後の fence で空の本文を閉じる。
    DIRECTIVE は境界を満たす最初の閉じを使う。
    消費した直後の LF は範囲の外に置く。
    次の文には残る可視 LF が要り、余分な LF、閉じの空白、EOF を区別する。
    通常の gap は ASCII space・tab と、許す位置の可視 LF だけである。
    [fixture: gitgraph/header-hidden-before-colon] [fixture:
    gitgraph/lex-hidden-directive-before-branch-name] [fixture:
    gitgraph/lex-option-between-options-hidden] [fixture:
    gitgraph/lex-hidden-directive-between-option-value] [fixture:
    gitgraph/lex-yaml-three-adjacent-fences] [fixture:
    gitgraph/lex-yaml-empty-followed-later-block] [fixture:
    gitgraph/lex-hidden-directive-after-commit] [fixture:
    gitgraph/lex-hidden-directive-commit-spare-lf] [fixture:
    gitgraph/lex-hidden-directive-commit-closing-space] [fixture:
    gitgraph/lex-hidden-directive-commit-eof] [fixture: gitgraph/lex-body-bom]

    共通の行の値は title の区切り 1 つの後、
    または accessibility の colon の後を保つ。
    ブロックは外側の空白だけを trim し、最初の閉じ括弧で閉じる。
    空の値は null である。
    先行する文字列・複合ブロックは hidden らしい内容を所有する。
    ヘッダー後の native Comment はその中で始まれず、
    先行する DIRECTIVE を隠せない。
    ヘッダー前では、
    検出が保持する YAML は二度目の directive の前の 1 つだけである。
    通された裸の Comment と共通の空白は、
    保持した形式の間でも trivia のままである。
    本文の gap と hidden の境界は広げない。
    共有の coverage、raw・written 値、token kind、範囲の hull も検査する。
    履歴の受理条件は、parser と上記の fixture の受理の比較で確かめる。
    [fixture: gitgraph/title-tab] [fixture:
    gitgraph/lex-description-line-null] [fixture:
    gitgraph/lex-description-block-only-directive] [fixture:
    gitgraph/lex-hidden-directive-string] [fixture:
    gitgraph/lex-hidden-directive-block] [fixture:
    gitgraph/lex-hidden-directive-fallback-complete-statement] [fixture:
    gitgraph/detect-two-nonleading-blocks] [fixture:
    gitgraph/div-detect-retained-yaml-bare-ls-line] [fixture:
    gitgraph/div-detect-retained-directive-bare-bom] [fixture:
    gitgraph/div-lex-preheader-bare-between-retained-unicode] [fixture:
    gitgraph/lex-preheader-hidden-no-bare-unicode]

  - info: 7 ノードの型と欄は [ast/info.md](../../spec/docs/ast/info.md) に従う。
    showInfo は書かれた語と一致する。
    textBeforeShowInfo は flag がなければ空、あれば可視 LF を許す。
    キーワードの境界は共通の空白、EOF、percent ペアである。
    本文の gap は ASCII space・tab・LF だけである。
    共通文は繰り返し・空も保ち、複合形式の値が空の場合だけ null とする。
    title の区切り、colon の gap、block の trim と最初の閉じを、
    Db に寄与しないことと独立に検査する。
    [fixture: info/header-inline-flag] [fixture: info/header-flag-next-line]
    [fixture: info/lex-hidden-without-flag] [fixture: info/flag-letter-suffix]
    [fixture: info/space-header-nbsp] [fixture: info/title-repeat-empty]
    [fixture: info/lex-title-two-spaces] [fixture: info/acctitle-gap] [fixture:
    info/space-block-interior] [fixture: info/accdescr-block-first-close]

    各 InfoIgnoredText は、指定の header・flag gap、body、
    または可視 EOL 前の textAfter にある完全な YAML・DIRECTIVE の一致である。
    YAML は本文ありの閉じを空本文より先に選ぶ。
    DIRECTIVE は境界を満たす最初の閉じを使う。
    消費した直後の LF は範囲の外で、次の文には残る EOL が要る。
    余分な LF、閉じの空白、EOF を別々に確かめる。
    複合値が包む hidden らしいテキストは内容になる。
    ヘッダー後の native Comment は、先行する DIRECTIVE を隠したり、
    複合値の内部で始まったりできない。
    ヘッダー前の保持した形式は、自分の境界と 1 ブロックの検出順に従う。
    通された裸の Comment とそれに伴う共通の空白は、
    保持した形式の間でも trivia である。
    本文の通常の gap は広げない。RawText は共通の切断だけで分割できる。
    共有の coverage、欄、written 値、範囲、token の検査も行う。
    [fixture: info/lex-flag-hidden-two] [fixture:
    info/lex-hidden-after-visible-eol] [fixture: info/lex-yaml-three-fences]
    [fixture: info/lex-yaml-two-empty] [fixture:
    info/hidden-directive-after-title] [fixture:
    info/hidden-directive-title-spare-lf] [fixture:
    info/hidden-directive-title-space] [fixture:
    info/hidden-directive-title-eof] [fixture: info/hidden-yaml-inside-block]
    [fixture: info/hidden-directive-close-glued] [fixture:
    info/lex-detect-preheader-empty-braces] [fixture: info/detect-two-blocks]
    [fixture: info/div-detect-retained-yaml-bare-ls] [fixture:
    info/div-detect-retained-directive-bare-bom] [fixture:
    info/div-detect-yaml-bare-directive] [fixture:
    info/lex-retained-no-bare-ls] [fixture: info/lex-hidden-common-comment]

  - treeview: 13 の node 型、子の欄と訪問順は
    [ast/treeview.ja.md](../../spec/docs/ast/treeview.ja.md)に従う。
    大文字小文字を区別する見出し全体と優先順での読み、
    bare 名・引用名の全体、class と icon の atom、注釈と共通文の部品を調べる。
    値は書かれた空白を保ち、共通の除去の後に何も残らない場合だけ null にする。
    空白だけの内容は literal に保つ。
    書かれた値は罫線の綴りを保ち、変換した Db の値とは分ける。
    prefix 全体は内部の空白を保つ 1 つの RawText unit にする。
    共通の除去による分割は共有の契約に従う。
    引用名の closed は共通の属性の引用符の変換後の閉じで調べる。
    原文の区切りが異なる文字でも raw と token は原綴を保つ。
    [fixture: treeview/box-prefix-arbitrary] [fixture: treeview/html-single]
    [fixture: treeview/gram-written-tree]
    [fixture: treeview/ast-common-whitespace-values]
    [fixture: treeview/ast-common-removal-only-values]
    [fixture: treeview/ast-icon-removal-only]
    [fixture: treeview/ast-numeric-name]

    葉の外の各 branch prefix と罫線の装飾行は、ソース順で 1 つだけ所有する。
    既存の名前待ち、注釈、ブロックの gap を先に採る。
    Node.prefix/textBeforeName、注釈の prefix/textBefore、
    ブロックの textBeforeOpen が該当する。
    完了した階層ノード間の残る装飾は、次の node.textBefore に置く。
    次が子、祖先の別の子、別の根でも同じである。
    最初の階層ノードより前と最後より後の独立した装飾は body に保つ。
    葉の中の形はその葉に保ち、重なる子を作らない。
    prefix と装飾の範囲から外端の空白を除き、装飾から後続の LF も除く。
    node の indent は割り当てた通常の空白・タブの列か
    branch の深さに一致させる。
    装飾や native Comment を越える保留中の字下げも数える。
    親子は原順と割り当て済みの indent から独立に検査する。
    現在以上の indent を持つ開いた node を末尾から取り除き、
    最後に残る node、なければ body を親にする。file も親になれる。
    範囲は最初の所有構文から最後の子孫までを覆い、兄弟は重ならない。
    同一性、icon の登録、意味上の受理の gate は足さない。
    [fixture: treeview/box-written-tree]
    [fixture: treeview/box-decoration-pending-name-gap]
    [fixture: treeview/box-decoration-before-annotation]
    [fixture: treeview/ast-annotation-prefixes]
    [fixture: treeview/box-prefix-common-block-two-prefixes]
    [fixture: treeview/ast-decoration-internal-and-body]
    [fixture: treeview/box-comment-indent-carry]
    [fixture: treeview/db-quoted-tail-tab] [fixture: treeview/db-file-parent]
    [fixture: treeview/db-duplicate-names] [fixture: treeview/db-indent-pop]
    [fixture: treeview/gram-nesting-decoration-before-parent]
    [fixture: treeview/gram-nesting-decoration-before-ancestor-child]
    [fixture: treeview/gram-nesting-decoration-after-subtree]

    native の percent Comment は、先に始まった名前や値の中で始めない。
    検出が通した裸の行と付随する Unicode の trivia は読み直さない。
    保持した native Comment の前と間も同じ。
    通過した行がなければ、通常の見出し前の gap は厳密に調べる。
    共有の coverage、欄、ソース範囲、token の種類、atom の境目、
    書かれた値の検査を適用する。
    treeview に native のブロックコメントはない。
    共有の契約では引き続き、閉じを範囲に含め、値からは除く。
    [fixture: treeview/comment-in-quotes] [fixture: treeview/comment-in-bare]
    [fixture: treeview/common-block-bare-percent]
    [fixture: treeview/detect-secondscan-bare-unicode]
    [fixture: treeview/detect-retained-comment-unicode-header]
    [fixture: treeview/detect-retained-gap-ls-control]
    [fixture: treeview/directive-class-value-parts]
    [fixture: treeview/directive-icon-value-parts]
    [fixture: treeview/directive-class-value-inside]
    [fixture: treeview/semicolon-icon-value-inside]
    [fixture: railroad/ir-comment-block-common-region]

  - eventmodeling: 22 の node 型、子の欄と訪問順は
    [ast/eventmodeling.ja.md](../../spec/docs/ast/eventmodeling.ja.md)に従う。
    小文字の見出し全体と固有の境界、identifier の longer alternative、
    Identifier である 1〜3 桁の frame 名、修飾名の member、
    固定の entity/data type の語を調べる。
    Arrow の値 ->> と none/solid/arrow の欄を一致させる。
    Data tag はタグがないときだけ null。
    Clause は kind、空でない item の body、必須・任意の順序を保つ。
    参照は書かれた名前のままで、validator や linking の条件は足さない。
    [fixture: eventmodeling/gram-written-tree]
    [fixture: eventmodeling/lex-keyword-prefix-name]
    [fixture: eventmodeling/lex-name-custom-header-dot]
    [fixture: eventmodeling/db-source-leading-zero]
    [fixture: eventmodeling/db-reset-data-reference]
    [fixture: eventmodeling/gwt-without-when]
    [fixture: eventmodeling/validator-command-invalid]
    [fixture: eventmodeling/db-source-forward]

    native の無視された一致は一つの所有者を持つ。
    必須の部品には named gap を使う。
    後続の任意の source/reference/data member が、その前の形を持つ。
    修飾名の tail member は dot/name の gap を持ち、
    GWT の item/clause は前の形を持つ。
    完了した文の後の hidden は body に置く。
    可視の EOL と textAfter 欄はない。
    普通の gap は Notation の空白と完全な native comment を受け入れる。
    [fixture: eventmodeling/lex-hidden-frame-type-gap]
    [fixture: eventmodeling/lex-hidden-frame-entity-gap]
    [fixture: eventmodeling/lex-hidden-frame-optional-gaps]
    [fixture: eventmodeling/lex-qualified-hidden-components]
    [fixture: eventmodeling/lex-hidden-reference-name-close]
    [fixture: eventmodeling/lex-hidden-data-tag-gaps]
    [fixture: eventmodeling/lex-hidden-gwt-required-gaps]
    [fixture: eventmodeling/lex-hidden-gwt-items]
    [fixture: eventmodeling/lex-hidden-gwt-clause]
    [fixture: eventmodeling/lex-native-directive-object-eof]
    [fixture: eventmodeling/space-nbsp-body]
    [fixture: eventmodeling/line-ls-gap]

    Inline data は同じ行の最後の closer を選び、escape を復号しない。
    Block data と hidden YAML は本文ありを優先し、なければ隣接する空の形を使い、
    選んだ代替の最初の有効な closer で止まる。
    native directive は最初の有効な境界付き closer で止まる。
    消費した閉じの LF は範囲の外で、space/LS/PS は lookahead だけ。
    追加する論理 LF は原文の範囲を作らない。
    共通文の本文はすべての padding を保ち、区切りは本文の外に置く。
    null は除去後の内部が空であることを表す。
    [fixture: eventmodeling/lex-inline-quote-greedy]
    [fixture: eventmodeling/lex-inline-quote-conversion]
    [fixture: eventmodeling/lex-block-adjacent-later-close]
    [fixture: eventmodeling/hidden-yaml-adjacent-later]
    [fixture: eventmodeling/hidden-native-directive-later]
    [fixture: eventmodeling/data-block-close-eof]
    [fixture: eventmodeling/data-block-close-space]
    [fixture: eventmodeling/lex-block-close-ps-boundary]
    [fixture: eventmodeling/common-whitespace]
    [fixture: eventmodeling/gram-empty-payload-after-removals]

    字句の優先順位は共通の除去後に調べる。
    共通 comment region は自身の padding と LF ごと除かれ、
    共通 directive だけの行、空行、選ばれた semicolon は LF を残す。
    選ばれた semicolon の除去で native directive の closer と LF が直結すると、
    その LF を消費できる。
    その後、共通 terminal が次の行の字下げを取れるのは、
    その LF が消費されたときだけ。
    LS と PS は空白として残る。
    空の説明ブロックは文、選ばれない semicolon は構文のまま。
    [fixture: eventmodeling/lex-common-yaml-comment-line-padding]
    [fixture: eventmodeling/lex-common-block-comment-line-padding]
    [fixture: eventmodeling/lex-common-native-directive-comment-line-padding]
    [fixture: eventmodeling/lex-common-yaml-directive-only-line]
    [fixture: eventmodeling/lex-common-block-directive-only-line]
    [fixture: eventmodeling/lex-common-yaml-blank-line-padding]
    [fixture: eventmodeling/lex-common-block-inline-directive-padding]
    [fixture: eventmodeling/lex-common-selected-semicolon-exposes-lf]
    [fixture: eventmodeling/lex-common-selected-semicolon-before-lf]
    [fixture: eventmodeling/lex-common-selected-semicolon-padding]
    [fixture: eventmodeling/lex-common-after-block-ls-indented]
    [fixture: eventmodeling/lex-common-after-block-ps-indented]
    [fixture: eventmodeling/lex-common-unselected-semicolon-padding]
    [fixture: eventmodeling/lex-common-empty-description-inline-padding]
    [fixture: eventmodeling/lex-common-empty-description-leaves-lf]

    native Comment は percent/slash の mark を持ち、
    先に読まれる data・共通文・hidden の単位の中から始まれない。
    Slash block の範囲は最初の closer を含むが、値からは除く。
    Slash line の comment は LS/PS を値に残す。
    見出しの前では、検出が飛ばした bare percent 行と付随する Unicode の空白を、
    保持する形の間も含めて native 単位として読み直さない。
    保持する形自身の閉じの境界は、飛ばす行がなくても調べる。
    共通 trivia は literal や保持する本文を割ったり、
    作者の部品を隔てたりできるが、
    atom の語・数字の名前・`->>`・`[[`・`]]` の中は割れない。
    書かれた値は変換後の Db の値と分けて調べる。
    [fixture: eventmodeling/comment-native]
    [fixture: eventmodeling/comment-block-nearest-close]
    [fixture: eventmodeling/comment-line-ls-body]
    [fixture: eventmodeling/comment-line-ps-body]
    [fixture: eventmodeling/lex-native-directive-one-line-fallback]
    [fixture: eventmodeling/lex-native-yaml-in-inline]
    [fixture: eventmodeling/lex-native-yaml-inside-common]
    [fixture: eventmodeling/detect-retained-bare-ls-line]
    [fixture: eventmodeling/detect-retained-no-bare-ls-line]
    [fixture: eventmodeling/detect-retained-bare-nbsp-header]
    [fixture: eventmodeling/detect-retained-no-bare-nbsp-header]
    [fixture: eventmodeling/detect-real-retained-secondscan]
    [fixture: eventmodeling/lex-hidden-yaml-fence-directive]
    [fixture: eventmodeling/directive-qualified]
    [fixture: eventmodeling/directive-arrow-inside]
    [fixture: eventmodeling/config-security-level-other]
    [fixture: eventmodeling/div-html-frontmatter-value]

  - cynefin: 11 のノード型、子の欄と訪問順は
    [ast/cynefin.md](../../spec/docs/ast/cynefin.ja.md) に従う。
    小文字の header の語と接着した省略可能なコロン、完全な領域の固定語、
    共通の keyword の部品、引用符つきの文字列全体を検査する。
    領域の name・from・to は、書かれた Keyword と一致する。
    CynefinArrow は全体の --> と、none・solid・arrow の固定の欄を持つ。
    自己遷移、未宣言の端点、領域の再宣言、空文字列も書かれたノードとして保つ。
    [fixture: cynefin/db-all-fields] [fixture: cynefin/header-colon-inline]
    [fixture: cynefin/gram-glued-domains] [fixture: cynefin/db-self-loops]
    [fixture: cynefin/gram-transition-first]
    [fixture: cynefin/db-domain-duplicates] [fixture: cynefin/db-empty-texts]

    native の一致は全体で一つの名前つきの欄に属する。
    textAfterName と項目の textAfter は、
    最初の可視 LF または次の可視単位で終わる。
    可視 LF の後で同じブロックの実際の次の項目の前にある形は、
    その項目の textBefore に属する。次の項目が無ければ Diagram.body に属する。
    hidden の LF の消費を先に適用して可視 LF を決める。
    遷移の欄は textBeforeArrow・textBeforeTo・textBeforeColon・
    textBeforeLabel・textAfter。label が無ければコロンと label の gap は空。
    共通文の末尾の形は可視 EOL の前までで、その後の形は body に属する。
    [fixture: cynefin/hidden-domain-item-members]
    [fixture: cynefin/hidden-before-first-item-after-eol]
    [fixture: cynefin/hidden-item-after-visible-eol]
    [fixture: cynefin/hidden-domain-end-after-visible-eol]
    [fixture: cynefin/hidden-empty-domain-after-visible-eol]
    [fixture: cynefin/hidden-all-unit-gaps]
    [fixture: cynefin/hidden-unlabeled-transition-gaps]
    [fixture: cynefin/hidden-common-after-visible-eol]

    CynefinIgnoredText は kind が yaml-block または directive で、
    共通の除去を除いた、変換前の原文全体を value に保つ。
    範囲は開きから最初の適合する閉じまでで、消費した後続の CR・LF を含めない。
    YAML は本文のある一致を空の fallback より先に試す。
    native の Comment は先行する hidden directive に負け、
    文字列、共通のブロック、hidden の形の中では始まらない。
    hidden directive の一致に失敗すれば Comment になれる。
    [fixture: cynefin/hidden-yaml-adjacent-later]
    [fixture: cynefin/hidden-yaml-two-nonempty]
    [fixture: cynefin/hidden-directive-adjacent]
    [fixture: cynefin/hidden-directive-crlf]
    [fixture: cynefin/hidden-directive-comment-fallback-kept]
    [fixture: cynefin/hidden-directive-string]
    [fixture: cynefin/hidden-yaml-block]

    遷移と共通文には、次の body の形の前に消費されない可視 EOL が必要。
    領域の語と項目には不要。
    余分の LF、空白で LF を残す場合、EOF を別に検査する。
    共通の行の値は区切りの後の空白を保ち、
    ブロックの中は前後の共通の空白だけを trim する。
    title の値が null で textAfter が無ければ、範囲は keyword までで、
    区切りは範囲の外に置く。
    Diagram は最後のトークンまでである。
    [fixture: cynefin/hidden-directive-sole-lf]
    [fixture: cynefin/hidden-directive-spare-lf]
    [fixture: cynefin/hidden-directive-closing-space]
    [fixture: cynefin/hidden-directive-eof]
    [fixture: cynefin/hidden-after-domain]
    [fixture: cynefin/common-line-whitespace]
    [fixture: cynefin/common-block-whitespace]
    [fixture: cynefin/lex-title-one-space] [fixture: cynefin/lex-title-one-tab]
    [fixture: cynefin/lex-title-two-spaces]
    [fixture: cynefin/common-title-comment-only]
    [fixture: cynefin/common-title-directive-only]

    retained prefix の native な境目を保つ。
    検出が通した裸の行は Comment で、
    付随する空白は retained な形の間でも trivia。
    通過した Unicode の trivia と通常の厳密な境目を別に検査する。
    global directive と選ばれたセミコロンは作者の部品を区切り、
    値の中を切れるが、
    固定語と --> の中は割れない。
    原綴の値は Db の変換と別に検査する。
    サイトの security と frontmatter の HTML による値の指定の読みも含める。
    [fixture: cynefin/detect-retained-secondscan-bare-ls]
    [fixture: cynefin/detect-retained-secondscan-bare-ps]
    [fixture: cynefin/retained-directive-between-bares]
    [fixture: cynefin/prefix-yaml-unicode-no-bare]
    [fixture: cynefin/directive-transition-parts]
    [fixture: cynefin/semicolon-arrow-parts]
    [fixture: cynefin/directive-every-field]
    [fixture: cynefin/config-security-level-other]
    [fixture: cynefin/div-html-frontmatter-value]

  - wardley: 書かれた 28 種のノード、欄と訪問順は
    [ast/wardley.md](../../spec/docs/ast/wardley.ja.md) に従う。
    正確な小文字の header、
    最初に一致する完全な spaced-name・id-name と数の単位、
    通常の文字列と flow label の異なる escape 規則を検査する。
    decimal と integer の位置を区別し、offset の符号は符号なしの葉の外に置く。
    装飾は offset、strategy、一つの inertia の順とする。
    共通の行・block の値は仕様の null と空白の形を保つ。
    [fixture: wardley/db-all-fields] [fixture: wardley/db-id-underscore]
    [fixture: wardley/lex-name-priority] [fixture: wardley/number-leading-zero]
    [fixture: wardley/lex-link-flow-raw-escapes]
    [fixture: wardley/number-offset-negative-zero]
    [fixture: wardley/db-inertia-forms] [fixture: wardley/common-empty-literals]

    各 hidden form 全体を名前つき gap または body の所有位置で一度だけ検査する。
    YAML は本文ありの分岐の最初の有効な closer を隣接した空の分岐より優先し、
    directive は最初の境界を満たす closer を使う。
    範囲には前の padding、消費した LF、追加した LF を含めない。
    文と pipeline child は残った可視 LF で区切り、
    pipeline の opener も可視 LF を必要とする。
    header は EOL を必要としない。
    可視 EOL の後の form は前の suffix でなく body に属し、
    evolution の suffix は最後の stage に属する。
    [fixture: wardley/hidden-all-unit-gaps]
    [fixture: wardley/hidden-yaml-adjacent-later]
    [fixture: wardley/hidden-directive-adjacent]
    [fixture: wardley/lex-hidden-directive-cr]
    [fixture: wardley/hidden-directive-spare-lf]
    [fixture: wardley/lex-hidden-pipeline-open-spare]
    [fixture: wardley/lex-hidden-pipeline-child-spare]
    [fixture: wardley/lex-hidden-after-visible-eol]
    [fixture: wardley/lex-hidden-evolution-members]

    native Comment は先行する hidden directive を置き換えず、
    文字列・flow arrow・semicolon label・共通値・hidden form の
    内側から始まらない。
    header 前では detection が通した裸の Comment と伴う trivia を読み直さず、
    残された form の間も同じように扱う。
    通した行が無い場合の native 境界と通常の本文 gap は厳密なままとする。
    [fixture: wardley/comment-native-triple]
    [fixture: wardley/hidden-directive-no-boundary]
    [fixture: wardley/hidden-directive-string]
    [fixture: wardley/lex-hidden-directive-multiline-label]
    [fixture: wardley/detect-retained-secondscan-bare-ls]
    [fixture: wardley/prefix-yaml-bare-unicode]
    [fixture: wardley/retained-directive-between-bares]
    [fixture: wardley/retained-no-bare-unicode] [fixture: wardley/line-ls-gap]

    arrow の欄は書かれた dependency・flow の記号と marker を示し、
    label で変わる Db の flow と dashed の読みを示すものではない。
    port 全体、独立した二つの label、省略可能な部品の各 gap を検査する。
    checker は座標の範囲、
    親や evolve target の解決などの意味上の受理を検査しない。
    それらは parser とその結果の記録が扱う。
    [fixture: wardley/db-link-forms]
    [fixture: wardley/lex-flow-label-changes-direction]
    [fixture: wardley/lex-flow-label-changes-dashed]
    [fixture: wardley/gram-invalid-anchor]
    [fixture: wardley/gram-missing-pipeline-parent]
    [fixture: wardley/gram-invalid-evolve]

  - railroad: 書かれた 30 種のノード、欄と訪問順は
    [ast/railroad.md](../../spec/docs/ast/railroad.md) に従います。
    一つの RailroadDiagram が Root.diagramType で 4 方言を区別します。
    式の子は方言と優先順位の役割に従います。
    IR の call と書かれた group をすべて保ちます。
    自然記法の sequence/choice は member を 2 つ以上必要とします。
    規則名、代入と必須の visible な semicolon は別々の部品です。
    [fixture: railroad/ir-gram-written-tree]
    [fixture: railroad/ebnf-gram-written-tree]
    [fixture: railroad/abnf-gram-written-tree]
    [fixture: railroad/peg-gram-written-tree]
    [fixture: railroad/ir-db-singletons] [fixture: railroad/ebnf-db-singletons]

    完全な first-match の字句単位を検査します。
    metadata の先行する title prefix、IR constructor の長い名前の選択肢、
    EBNF の special/ISO/YAML の選択肢と、
    ABNF の長い semicolon comment も含みます。
    文字列は方言ごとの引用符と escape の境界に従います。
    十進 count は数字全体の atom、special sequence と percent の数値は
    RawText のテキスト単位です。
    書かれた値は綴りと共通の cut を保ちます。
    [fixture: railroad/ir-keywords-long-rule-name]
    [fixture: railroad/ebnf-reference-title-prefix]
    [fixture: railroad/ebnf-postfix-special-priority]
    [fixture: railroad/abnf-comment-terminator-control]
    [fixture: railroad/abnf-string-backslash-quote]
    [fixture: railroad/peg-string-escaped-lf]
    [fixture: railroad/abnf-directive-repeat]
    [fixture: railroad/abnf-directive-numval-digits]
    [fixture: railroad/ebnf-hidden-directive-special]

    保持した native の形を、名前付きの gap または body で 1 度ずつ検査します。
    明示の区切りの前は前の member の textAfter、後は次の textBefore に置きます。
    隣接では gap 全体を次の textBefore に置きます。
    自然記法のリストの外側の member の gap は空にして、親に任せます。
    call、group、後置、例外、repeat、述語はそれぞれ名前付きの gap を持ちます。
    native の形は repeat の部品を分断できません。
    [fixture: railroad/ir-native-ownership]
    [fixture: railroad/ebnf-native-ownership]
    [fixture: railroad/abnf-native-ownership]
    [fixture: railroad/peg-native-ownership]
    [fixture: railroad/abnf-native-in-atom]

    YAML は本文のある選択肢の最初の適合する閉じを先に取り、
    それがなければ空の fallback を使います。
    native directive は境界のある最初の閉じを取ります。
    保持する範囲に、前の padding、消費する LF、追加された LF を含めません。
    railroad は visible EOL の区切りを要求しないので、
    LF だけ、余分の LF、閉じの後の空白、EOF の対照例を受け入れます。
    native Comment は方言の行または block の規則に従い、
    先行する字句の代わりになったり、先に始まる文字列、special sequence、
    metadata、hidden の形の中で始まったりできません。
    [fixture: railroad/ir-hidden-yaml-adjacent-later]
    [fixture: railroad/ir-hidden-yaml-adjacent-eof]
    [fixture: railroad/ir-native-directive-adjacent]
    [fixture: railroad/peg-hidden-yaml-sole-lf]
    [fixture: railroad/peg-hidden-yaml-spare-lf]
    [fixture: railroad/peg-hidden-directive-closing-space]
    [fixture: railroad/ir-hidden-directive-eof]
    [fixture: railroad/ir-tail-comment]
    [fixture: railroad/ebnf-iso-first-closer]
    [fixture: railroad/peg-comment-hash-ps]
    [fixture: railroad/ebnf-enclosing-string-hidden]

    見出しの前は、検出が保持する 1 つの YAML prefix と、
    本物の second-scan directive を、
    渡された bare Comment とその付随する trivia から分けて検査します。
    渡された Unicode trivia は、保持した形の間でも再び読みません。
    渡された行がなければ native の境界を厳格に保ちます。
    body の gap は ASCII space/tab と物理改行のままです。
    metadata は最初の規則より前に限定します。
    後続する native の形は body に置きます。
    [fixture: railroad/ir-secondscan-real]
    [fixture: railroad/ir-secondscan-between-bares-unicode]
    [fixture: railroad/ir-retained-bare-secondscan-unicode]
    [fixture: railroad/ir-secondscan-no-bare-unicode]
    [fixture: railroad/ebnf-retained-ascii-control]
    [fixture: railroad/ir-hidden-after-title]
    [fixture: railroad/peg-metadata-after-rule-title]

    これらは木の条件であり、意味的な受理の gate ではありません。
    参照の解決、名前の一意性、repeat の境界の大小は要求しません。
    parser の結果の記録は fixtureAccepts と別に比べ、設定は再検証しません。
    [fixture: railroad/ir-gram-reference-resolution]
    [fixture: railroad/peg-db-duplicates]
    [fixture: railroad/abnf-db-repeat-reversed]
    [fixture: railroad/ir-config-frontmatter-fontfamily-number]

  - treemap: 9種のノードと子の順は
    [ast/treemap.ja.md](../../spec/docs/ast/treemap.ja.md) に従います。
    body は根と外側の文を持ち、section は section と leaf の子を持ちます。
    leaf に children 欄はありません。
    親子は原順から独立に検査します。
    現在の行以上の indent の開いた section を末尾から取り除き、
    最後に残る section、なければ body に置きます。
    開いた列に積むのは section だけです。
    leaf は section を閉じても親にはなりません。
    階層ノード間の独立した classDef と共通の文は、
    次のノードの statementsBefore に一度だけ置きます。
    次が祖先の別の子や別の根でも同じです。
    最初の階層ノードより前と最後より後は body に保ちます。
    名前、数、literal の中の内容は先にその葉に保ちます。
    所有先は図全体への効力を変えません。
    範囲は最初の所有文か名前から最後の子孫までを覆い、兄弟は重なりません。
    section・leaf・classDef の indent は、
    自身の構文の前の ASCII 空白・タブ数です。
    前の行や共通の除去をまたぐ場合も同じです。
    先頭の字下げは範囲に含めません。
    別々の2個の run を1個の indent にせず、
    使われない末尾の run も報告します。
    共通の複合形は自身の padding を消費します。
    null の title は区切り1文字、
    null の class style は最大の区切り空白を消費します。
    [fixture: treemap/gram-written-tree]
    [fixture: treemap/db-section-tail-space]
    [fixture: treemap/db-leaf-tail-tab]
    [fixture: treemap/gram-indent-around-global-directive]
    [fixture: treemap/gram-two-indent-runs]
    [fixture: treemap/gram-header-trailing-indent-eof]
    [fixture: treemap/common-title-one-space]
    [fixture: treemap/gram-class-whitespace-style-null]
    [fixture: treemap/db-leaf-not-parent]
    [fixture: treemap/db-leaf-closes-open-sections]
    [fixture: treemap/gram-nesting-statement-before-section]
    [fixture: treemap/gram-nesting-statement-before-ancestor-child]
    [fixture: treemap/gram-nesting-statement-after-last-child]
    [fixture: treemap/common-block-empty-interleaved]

    header は後ろの境界を求めず全体を確かめます。数は全表記と、コンマを除く
    parseFloat の値を確かめます。string はエスケープを解釈せず最初の同じ引用符で
    閉じます。識別子はその位置で最初に適用される字句の規則で確かめます。
    class 名には selector のキーワード優先を適用せず、2文字以上を求めます。
    記録した数値の非有限値は JSON の null でも表せます。
    leaf はコロンかコンマを持ち、selector の間は LF・コメントを許して字下げを
    許しません。class style は末尾の空白や取り込んだ行らしい文字も含めて、
    複合形の値全体を満たします。共通 literal は行の padding、または外側だけを
    trim した block 内部を保ちます。空の内容は null で、block は最初の閉じ括弧を
    必須とします。共通文の後に EOL を求めません。
    [fixture: treemap/header-beta] [fixture: treemap/gram-adjacent-sections]
    [fixture: treemap/db-number-nan] [fixture: treemap/db-number-underscore]
    [fixture: treemap/lex-string-conversion]
    [fixture: treemap/lex-class-name-title-prefix]
    [fixture: treemap/gram-class-one-letter]
    [fixture: treemap/comment-value-selector-gap]
    [fixture: treemap/db-class-consumes-next-line]
    [fixture: treemap/db-style-whitespace]
    [fixture: treemap/common-title-two-spaces]
    [fixture: treemap/common-block-first-close]
    [fixture: treemap/gram-description-block-acctitle-adjacent]

    ネイティブの Comment は、
    先に始まった string や複合値の内部で開始できません。
    除去済みのソース Directive 内でも開始できません。
    ネイティブの YAML・DIRECTIVE の形や ignored-text の欄はありません。
    header 前では検出が通した bare line と付随 trivia を読み直しません。
    その行がなければ、残る間はネイティブの LF だけです。
    2回目の走査で残る1行の形は
    Comment とし、内部のソース Directive は1回ずつ保ちます。
    body の間は位置ごとの ASCII 空白・LF の規則を緩めません。
    木の条件だけを検査し、parser の受理は結果の記録で確かめ、
    親子は dbFromTree で組み立てます。
    [fixture: treemap/hidden-comment-class]
    [fixture: treemap/hidden-comment-string]
    [fixture: treemap/hidden-comment-block] [fixture: treemap/hidden-yaml-body]
    [fixture: treemap/div-retained-before-bare-unicode-line]
    [fixture: treemap/div-bare-retained-unicode-header]
    [fixture: treemap/lex-retained-no-bare-unicode-header]
    [fixture: treemap/detect-second-scan-single-line-comment]
    [fixture: treemap/space-nbsp-body]
    [fixture: treemap/config-init-drawing]

  - radar: 19 のノード型、欄と訪問順は
    [ast/radar.ja.md](../../spec/docs/ast/radar.ja.md) に従う。
    宣言群と option 群は空でない comma 配列にする。
    軸と曲線の member は任意の label を保ち、
    曲線の entry は空でなく同じ型で揃う。
    名前つき entry の任意の colon も保つ。
    固定 option の語は token と照らし、数の葉は符号なし小数の綴りを保つ。
    ID は最長の綴りと、
    先行する keyword・数・boolean・graticule・共通形を調べる。
    境界のある bare 見出しは、
    label bracket・entry brace の直前なら名前になる。
    string は同じ quote で閉じ、定めた escape 境界を守る。
    これらは木の条件であり、軸参照の不足など意味上の受理条件は parser が扱う。
    [fixture: radar/gram-written-tree]
    [fixture: radar/gram-inline-statements]
    [fixture: radar/gram-curve-kind-per-curve]
    [fixture: radar/gram-detailed-colon-mixed-spelling]
    [fixture: radar/db-options-repeat]
    [fixture: radar/lex-id-keyword-prefix]
    [fixture: radar/lex-id-numeric-leading]
    [fixture: radar/lex-id-boolean-prefix]
    [fixture: radar/lex-id-graticule-prefix]
    [fixture: radar/lex-id-title-prefix]
    [fixture: radar/lex-bare-accessibility-ids]
    [fixture: radar/lex-string-escaped-ls]
    [fixture: radar/error-reference-label]
    [fixture: radar/lex-header-as-declaration]

    保持する hidden form の所有者は、指定の gap または body のちょうど 1 つ。
    原文の形全体を最初の適格な閉じと照らし、
    YAML は隣接する空 fence より本文ありの選択肢を先にする。
    消費する LF は範囲に含めない。
    member と名前つき entry の部品間に可視 LF はない。
    entry 配列は先頭、comma の後、閉じ brace の前に LF を許し、
    entry comma の前には許さない。
    label の gap と不在の部品は指定の所有を守り、
    colon を省いた textBeforeColon は空にする。
    [fixture: radar/lex-hidden-axis-comma]
    [fixture: radar/lex-hidden-curve-comma]
    [fixture: radar/lex-hidden-option-comma]
    [fixture: radar/lex-hidden-detailed-before-colon]
    [fixture: radar/lex-hidden-detailed-no-colon]
    [fixture: radar/lex-hidden-before-first-entry]
    [fixture: radar/lex-hidden-before-entries-close]
    [fixture: radar/hidden-yaml-adjacent-later]
    [fixture: radar/hidden-yaml-adjacent-eof]
    [fixture: radar/hidden-native-closer]
    [fixture: radar/hidden-yaml-crlf]
    [fixture: radar/gram-entry-newline-after-comma]
    [fixture: radar/gram-entry-before-comma-native-spare]

    共通形は共有の composite 値の検査を使い、
    null と空白だけの値、description の最初の閉じを区別する。
    後の文に可視 EOL が必要なのは共通文だけ。
    余分な LF、閉じの後の space、EOF は別の場合として調べる。
    可視 EOL より前の hidden suffix は直前の共通文か群の最後の member に属し、
    可視 EOL の後は body に属する。
    先に始まる string と composite 値は内部の hidden らしい文字を所有する。
    native Comment は先行する hidden directive に化けず、
    先に始まる string・block・hidden form の内部から始まらない。
    [fixture: radar/lex-common-empty-values]
    [fixture: radar/common-block-first-close]
    [fixture: radar/hidden-native-title]
    [fixture: radar/hidden-native-title-spare]
    [fixture: radar/hidden-native-title-space]
    [fixture: radar/hidden-native-title-eof]
    [fixture: radar/lex-hidden-after-visible-eol]
    [fixture: radar/lex-common-hidden-yaml-block-owner]
    [fixture: radar/lex-common-hidden-percent-block-owner]
    [fixture: radar/hidden-native-string]
    [fixture: radar/lex-hidden-native-fallback]

    見出しの語・colon の原文部品と、bare 見出しの境界を調べる。
    見出し前の保持形も native の境界と検出順を守る。
    裸の percent Comment とともに通された区間だけが、
    保持形の間も含めて付随する Unicode trivia を認める。
    本文の通常の gap は広げない。
    共有の欄、coverage、原文の値、範囲と token の検査も適用する。
    [fixture: radar/header-colon-inline]
    [fixture: radar/header-separated-colon]
    [fixture: radar/header-colon-hidden]
    [fixture: radar/header-native-no-boundary]
    [fixture: radar/detect-retained-two]
    [fixture: radar/detect-secondscan-native-glued]
    [fixture: radar/bare-before-header-nbsp]
    [fixture: radar/bare-line-ls]
    [fixture: radar/div-detect-yaml-bare-secondscan-native-ls]
    [fixture: radar/detect-retained-no-bare-control]
    [fixture: radar/space-nbsp-body]

  - architecture: 15 のノード型、子の欄と訪問順は
    [ast/architecture.ja.md](../../spec/docs/ast/architecture.ja.md) に従う。
    ID は keyword・共通の形・方向の優先順位と最長の ID の選択肢を調べる。
    icon 名は colon と dash を含む綴りを認める。
    string は閉じと escape の境界を確かめる。
    角括弧の label は、
    変換後のテキストで最初に完結する引用・bare の選択肢を選び、
    kind と value は原文の契約を保つ。
    中身の String と RawText のトークンはその選択に従い、
    角括弧は別の句読点とする。
    [fixture: architecture/lex-keyword-prefix-ids]
    [fixture: architecture/lex-keyword-terminal-priority]
    [fixture: architecture/lex-direction-id-prefix]
    [fixture: architecture/lex-icon-leading-symbols]
    [fixture: architecture/lex-string-escaped-ls]
    [fixture: architecture/lex-title-unquoted-fallback]
    [fixture: architecture/lex-title-padded-quotes]
    [fixture: architecture/html-label-authored-quotes]
    [fixture: architecture/lex-label-selected-semicolon-after-quote]

    宣言の語と icon・title・parent の順序、modifier の括弧と group の語、
    両 port の colon・方向、独立した marker の文字と実線を調べる。
    icon と modifier の完全な構成要素の間には共通 trivia を認めるが、
    padding と native hidden の形は認めない。
    double dash は分割せず、完全な hidden YAML に優先権を譲る。
    ArchitectureArrow.value は range 全体から共通 trivia を除いた原文で、
    内側の padding と hidden の形も保持する。
    alignment の方向と 2 個以上の member は原文順を保つ。
    最初も含め、各 member が直前の hidden gap を持つ。
    意味上の受理は parser の担当とする。
    [fixture: architecture/db-mixed]
    [fixture: architecture/directive-icon-delimiters]
    [fixture: architecture/directive-group-delimiters]
    [fixture: architecture/gram-hidden-inside-icon]
    [fixture: architecture/gram-hidden-inside-modifier]
    [fixture: architecture/gram-edge-reversed-labeled-markers]
    [fixture: architecture/hidden-yaml-edge-gaps]
    [fixture: architecture/hidden-yaml-align-gap]
    [fixture: architecture/hidden-directive-unit-gaps]
    [fixture: architecture/directive-fields]

    各 native hidden match は 1 回だけ持つ。
    所有者は名前つき gap、可視 EOL 前の textAfter、
    可視 EOL 後の body、textBeforeHeader のいずれかとする。
    省略した構成要素の gap は空にする。
    選んだ選択肢の最初の適合する閉じを確かめる。
    YAML は本文ありを隣接する空より先に試し、
    DIRECTIVE は境界に適合しない閉じを飛ばす。
    消費した直後の LF は range の外に置く。
    次の文の前には可視 EOL が残ることを求め、
    余分の LF、先読みだけの空白、EOF は別々に確かめる。
    [fixture: architecture/lex-hidden-two-suffixes]
    [fixture: architecture/lex-hidden-after-visible-eol]
    [fixture: architecture/hidden-yaml-three-fences]
    [fixture: architecture/hidden-yaml-adjacent-later-closer]
    [fixture: architecture/hidden-directive-nonqualifying-close]
    [fixture: architecture/hidden-directive-spare-lf]
    [fixture: architecture/hidden-directive-closing-space]
    [fixture: architecture/hidden-directive-eof]
    [fixture: architecture/hidden-yaml-crlf]

    共通文の共有の検査で、完全な字句の値か null、書かれた区切り・colon・括弧、
    block の trim と最初の閉じ括弧を確かめる。
    native Comment は先行する DIRECTIVE を隠したり、
    string・label・複合 description の内側に始まったりできない。
    見出し前では、
    保持した YAML と第 2 scan の directive は自分の閉じの規則を保つ。
    検出が渡した裸の行と付随する Unicode trivia は、
    保持した形の間も含めて読み直さない。
    渡した行がなければ native gap の厳密さを保つ。
    通常の body gap は、仕様の位置で ASCII 空白・タブと可視 LF だけを認める。
    [fixture: architecture/common-all]
    [fixture: architecture/common-repeat-empty]
    [fixture: architecture/common-block-first-close]
    [fixture: architecture/hidden-directive-inside-values]
    [fixture: architecture/hidden-yaml-inside-values]
    [fixture: architecture/detect-empty-braces-bare]
    [fixture: architecture/div-retained-bare-second-scan-ls]
    [fixture: architecture/retained-yaml-no-bare]
    [fixture: architecture/retained-directive-no-bare]
    [fixture: architecture/space-body-nbsp]

  - packet: 10 ノードの型、欄、訪問順は
    [ast/packet.md](../../spec/docs/ast/packet.ja.md) に従う。
    range・single・relative は書いた端点または count と
    固有の hidden gap を保つ。
    dash・plus・colon、必須の閉じた label 文字列、
    整数の綴りと完全な単位を検査する。
    整数のゼロ分岐は 1 桁で終わり、非ゼロ分岐は dot の前で短くなれる。
    range dash は全体の hidden YAML に譲る。
    通常の packet ヘッダーだけが共通空白・EOF・percent ペアの境界を要求し、
    packet-beta は最初のブロック・共通形式と接してよい。
    ブロックの成分を可視 LF で分けられない。
    意味上の拒否は parser と fixture の結果の比較に属する。
    [fixture: packet/gram-mixed] [fixture: packet/gram-single-hidden-gaps]
    [fixture: packet/gram-hidden-range-gap-spaced]
    [fixture: packet/gram-hidden-yaml-gap]
    [fixture: packet/gram-relative-hidden-colon]
    [fixture: packet/gram-leading-zero]
    [fixture: packet/lex-integer-shorter-before-dot]
    [fixture: packet/lex-dash-before-yaml] [fixture: packet/header-inline-block]
    [fixture: packet/header-beta-glued-block]
    [fixture: packet/gram-visible-newline-in-block]
    [fixture: packet/lex-label-escaped-lf]
    [fixture: packet/db-label-empty-single]

    PacketIgnoredText は全体の hidden match で、所有者はちょうど 1 つである。
    textBeforeHeader、body、ブロック内部の gap、可視 EOL 前の textAfter である。
    選んだ分岐の中で境界を満たす最初の閉じを走査する。
    YAML は本文ありの match を直後の空の fallback より先に試し、
    DIRECTIVE は境界を満たす最初の閉じを使う。
    消費した直後の LF は範囲から除き、次の文には残る可視 EOL を要求する。
    余分な LF、先読みだけの space、EOF は別の対照である。
    囲む文字列・共通値は hidden らしい内容を保ち、
    行の値は YAML の dash を取り込む。
    [fixture: packet/lex-hidden-two-suffixes]
    [fixture: packet/lex-hidden-after-visible-eol]
    [fixture: packet/hidden-yaml-adjacent-later]
    [fixture: packet/lex-yaml-two-nonempty]
    [fixture: packet/hidden-directive-later-close]
    [fixture: packet/hidden-directive-block]
    [fixture: packet/hidden-directive-block-spare]
    [fixture: packet/hidden-directive-block-space]
    [fixture: packet/hidden-directive-block-eof]
    [fixture: packet/hidden-yaml-crlf]
    [fixture: packet/hidden-yaml-in-label]
    [fixture: packet/hidden-yaml-in-description]
    [fixture: packet/hidden-yaml-title-absorbed]

    共通の文は書いた keyword、区切り・colon・brace、完全な値または null、
    ブロックの trim と最初の閉じ brace を検査する。
    共通の written value、token kind、coverage、範囲の hull も適用する。
    ヘッダー後の native Comment は先行する DIRECTIVE を隠せず、
    囲む文字列・複合 description 内でも始まれない。
    ヘッダー前では残存 YAML は二度目の directive より前の 1 つである。
    検出が通過させた裸の Comment と付随する Unicode 空白は、
    残存形式の間でも trivia のままである。
    通過した裸行がなければ native な gap を適用する。
    通常の本文 gap は ASCII space/tab と LF だけである。
    [fixture: packet/lex-title-two-spaces] [fixture: packet/acctitle-empty]
    [fixture: packet/accdescr-block-first-close]
    [fixture: packet/lex-description-comment-only]
    [fixture: packet/hidden-directive-close-glued]
    [fixture: packet/lex-label-native-directive]
    [fixture: packet/lex-description-hidden-first-brace]
    [fixture: packet/detect-one-block] [fixture: packet/detect-two-blocks]
    [fixture: packet/detect-second-scan-directive]
    [fixture: packet/detect-empty-braces-bare]
    [fixture: packet/retained-yaml-bare-ls]
    [fixture: packet/retained-directive-bare-bom]
    [fixture: packet/div-detect-yaml-bare-directive-ls]
    [fixture: packet/lex-retained-no-bare-ls] [fixture: packet/line-ls-between]

  - pie: 8 種のノードと子の順序は
    [ast/pie.md](../../spec/docs/ast/pie.md) に従う。
    showData は書かれたフラグだけを表す。
    textBeforeHeader は保持した hidden form だけを持つ。
    フラグがなければ textBeforeShowData は空である。
    その場合の見出し後、またはフラグ後の hidden form は body を始める。
    空・重複ラベルもそれぞれ区分の文として残す。[fixture:
    pie/db-all-fields] [fixture: pie/header-only] [fixture:
    pie/frontmatter-nonleading-comment] [fixture:
    pie/review-hidden-directive-before-showdata] [fixture:
    pie/frontmatter-after-header] [fixture: pie/label-empty] [fixture:
    pie/db-three-definitions]
    見出しの前の YAML は本文の行がある 1 ブロックだけで、
    二度目の directive scan と裸の percent 行より前に立つ。
    検出が通した空・句読点だけの percent-brace 行は Comment になる。
    hidden directive にはしない。
    保持した二度目の directive は共通の除去後に単語の type を持つ。
    [fixture: pie/detect-two-nonleading-blocks]
    [fixture: pie/detect-second-scan-directive-before-block] [fixture:
    pie/lex-yaml-after-comment-adjacent-fences] [fixture:
    pie/lex-yaml-after-bare-comment] [fixture:
    pie/lex-preheader-yaml-empty-line-control] [fixture:
    pie/lex-hidden-directive-second-detection-scan] [fixture:
    pie/lex-bare-percent-braces-before-header] [fixture:
    pie/lex-hidden-comment-before-header]
    裸行と、その後に検出が通した共通の空白・改行は trivia のままである。
    保持した形式とヘッダーの間でも、保持した形式同士の間でも同じ。
    本文の gap と hidden の閉じ境界は広げない。
    [fixture: pie/div-preheader-retained-yaml-bare-ls]
    [fixture: pie/div-preheader-retained-directive-bare-ls]
    [fixture: pie/div-preheader-retained-yaml-bare-bom]
    [fixture: pie/div-preheader-retained-directive-bare-bom]
    [fixture: pie/div-preheader-retained-yaml-bare-ls-line]
    [fixture: pie/div-preheader-retained-directive-bare-ls-line]
    [fixture: pie/div-preheader-retained-yaml-bare-then-directive]
    [fixture: pie/lex-preheader-retained-yaml-bare-ascii]
    [fixture: pie/lex-preheader-retained-directive-bare-ascii]
    [fixture: pie/lex-preheader-retained-yaml-bare-ascii-line]
    [fixture: pie/lex-preheader-retained-directive-bare-ascii-line]
    [fixture: pie/lex-preheader-retained-yaml-bare-then-directive-ascii]
    pie・showData は大文字小文字を区別する。
    直後には共通の空白、EOF、percent ペアが要る。
    間に残る読めない Unicode 空白は拒否する。
    StringLiteral は閉じた単引用符・二重引用符の単位である。
    escape は物理 LF・LS・PS を越せないが、escape していない改行は内容になる。
    NumericLiteral は完全な、任意の minus と整数・小数の単位である。
    先頭のゼロは小数だけで許す。
    共有の double が負かどうかは、重複の場合も含め、
    木の検査ではなく parser の受理条件に属する。
    負のゼロ・負の underflow も、書かれた数値との一致を検査する。
    [fixture: pie/header-letter-suffix]
    [fixture: pie/showdata-quote-glued] [fixture: pie/lex-header-nbsp]
    [fixture: pie/label-single-quote] [fixture: pie/label-escaped-quotes]
    [fixture: pie/label-multiline] [fixture: pie/label-backslash-ls]
    [fixture: pie/number-leading-zero]
    [fixture: pie/number-decimal-leading-zero]
    [fixture: pie/db-duplicate-negative] [fixture: pie/number-negative-zero]
    [fixture: pie/review-number-negative-underflow-final]
    共通値は複合した字句の値を完全に満たす。
    title は ASCII space・tab 1 つの後から始まる。
    accessibility の行の値は colon の直後から始まる。
    colon の前の隙間は ASCII space・tab だけである。
    行の値は書かれた両端を保ち、LF・percent ペアの前で終わる。
    description ブロックは開きの前に共通の空白を許す。
    最初の閉じ括弧で閉じ、内部を trim する。
    null は書かれた値がないことを表し、空白だけのブロックも含む。
    文自体は消えない。
    [fixture: pie/title-spaces] [fixture: pie/acctitle-spaces] [fixture:
    pie/acctitle-eof] [fixture: pie/ast-title-tab-null-eof] [fixture:
    pie/title-comment] [fixture: pie/accdescr-block-gap] [fixture:
    pie/accdescr-block-nested] [fixture: pie/review-accdescr-empty-block-first]
    PieIgnoredText は完全な hidden YAML・DIRECTIVE の形を 1 つ持つ。
    文字を明示的に走査し、YAML は本文を 1 行以上含んで、
    境界を満たす最初の閉じを検査する。
    その閉じがない場合だけ、開きの直後の fence で空の本文を閉じる。
    [fixture: pie/lex-yaml-three-adjacent-fences] [fixture:
    pie/lex-yaml-immediate-fence-before-later-closer] [fixture:
    pie/lex-yaml-three-fences-before-value] [fixture:
    pie/lex-nonleading-yaml-three-adjacent-fences] [fixture:
    pie/lex-yaml-apparent-empty-pairs-unmatched-fence] [fixture:
    pie/review-yaml-hidden-empty] [fixture:
    pie/lex-yaml-before-colon-two-blocks]
    DIRECTIVE は境界を満たす最初の閉じを使う。
    消費した直後の LF はノードに含めない。
    [fixture:
    pie/lex-yaml-closer-suffix-skip-later] [fixture:
    pie/lex-hidden-multiple-closers]
    指定の区分の隙間、共通の textAfter、図の位置だけが所有できる。
    文字列・description ブロックの中の hidden らしい形は内容になる。
    区分の部品の間・showData の前には可視の LF を許さない。
    完成した文の後の項目には hidden が消費しても残る LF が要る。EOF なら不要。
    可視の EOL の後の hidden form は直前の文でなく body に属する。[fixture:
    pie/review-yaml-between-label-colon] [fixture:
    pie/frontmatter-between-section-parts] [fixture:
    pie/lex-yaml-closer-suffix-skip-later] [fixture:
    pie/lex-hidden-multiple-closers] [fixture: pie/gram-newline-before-colon]
    [fixture: pie/showdata-next-line] [fixture: pie/review-yaml-after-section]
    [fixture: pie/review-yaml-after-section-space] [fixture:
    pie/gram-section-eof-hidden-yaml] [fixture:
    pie/lex-hidden-after-title-before-comment] [fixture:
    pie/review-label-hidden-yaml-text]
    [fixture: pie/review-block-hidden-yaml-text]
    ヘッダー後の native Comment の開始点では、
    先行する hidden DIRECTIVE 規則が一致してはならない。
    STRING・複合 description block が開始点を包んでいてもならない。
    検出が通したヘッダー前の裸の percent-brace Comment は有効なまま。
    [fixture: pie/review-hidden-directive-after-section]
    [fixture: pie/review-hidden-directive-after-title]
    [fixture: pie/review-hidden-directive-after-acctitle]
    [fixture: pie/review-hidden-directive-after-accdescr]
    [fixture: pie/review-hidden-directive-after-block]
    [fixture: pie/review-directive-empty-body]
    [fixture: pie/lex-bare-percent-braces-before-header]
    native comment は末尾の空白も消費し、LS・PS も含む。
    その空白は trim した Comment 記録の外にあるが、
    共通の領域が後続へつなぐ場合もコメントの trivia のままである。
    [fixture: pie/lex-comment-ls-region-bridge]
    共有の coverage・書かれた値・raw・範囲・token の検査も適用する。
    hidden form と共通の literal は RawText、数は Numeric、文字列は
    String・StringFragment。
    手作りの木と壊れた木で検証し、記録した木の検査は parser を import しない。

  - agentflow: 29 種のノードの子の型、フィールド順、空にできないリスト、
    スカラーの語彙は
    [ast/agentflow.ja.md](../../spec/docs/ast/agentflow.ja.md) に従います。
    構造の範囲は自身のトークンと子の外包です。
    分割ラベルはソース順では閉じ矢印の前、訪問順では矢印の後です。
    EmptyStatement はセミコロン一つです。
    ヘッダーは正確な小文字の agentflow-beta Keyword で、
    同じ行の方向か null と、必要な最初の区切りを検査します。
    [fixture: agentflow/gram-flow-all-forms]
    [fixture: agentflow/gram-global]
    [fixture: agentflow/gram-connector-all-forms]
    [fixture: agentflow/gram-tail-node-semicolons]
    [fixture: agentflow/gram-split-failure-label]
    [fixture: agentflow/header-only]
    [fixture: agentflow/header-td]
    [fixture: agentflow/lex-header-space-then-semicolon]
    [fixture: agentflow/gram-empty-description-after-header-direction]

    AgentflowIgnoredText の kind と value は必須の文字列です。
    Name の parts と click の前置きフィールドでは、
    kind は認識された消される形式に一致する必要があります。
    click、empty-string、empty-markdown-string、empty-call、
    empty-description-block のいずれかです。
    direction の前後は、綴りによらず direction-text です
    （ast/agentflow.md の AgentflowIgnoredText）。
    [fixture: agentflow/lex-flow-name-click-state]
    [fixture: agentflow/lex-empty-string-in-flow-name]
    [fixture: agentflow/lex-empty-markdown-in-flow-name]
    [fixture: agentflow/lex-empty-call-in-connector-name]
    [fixture: agentflow/lex-empty-description-in-flow-name]
    [fixture: agentflow/lex-direction-line-greedy]
    URL の前の閉じた空の説明ブロックは kind empty-description-block です。
    URL と callback のツールチップの前も、同じ消される形式の規則に従います。
    [fixture: agentflow/gram-empty-description-before-href]
    [fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]
    [fixture: agentflow/gram-click-erased-before-callback-tooltip]

    Name.parts は少なくとも一つの Label を持ち、
    認識された消される形式を個別の IgnoredText として保ちます。
    通常の断片を最大にし、書かれた空白を保ちます。
    string/markdown の kind は最初の寄与する断片だけが持てます。
    click 文脈を抜けるちょうど一つの空白は断片外です。
    click の後に認識された空文字列や空 markdown 文字列は、
    Label を寄与せずに、単位を読むという要件を満たします。
    flow では、後続の裸の断片には文脈を抜ける一空白が必要です。
    何も読んでいない末尾の click は不正です。
    [fixture: agentflow/lex-name-click-empty-string-before-text]
    [fixture: agentflow/lex-name-click-empty-markdown-before-text]
    [fixture: agentflow/lex-name-click-empty-string-before-string]
    [fixture: agentflow/lex-name-click-empty-string-then-call]
    [fixture: agentflow/lex-connector-name-click-empty-string-tail]
    [fixture: agentflow/gram-name-click-empty-string-adjacent-text]
    [fixture: agentflow/gram-flow-name-click-empty-markdown-adjacent-rejected]
    connector では、click 後の消される空文字列や空 markdown 文字列に、
    後続の text Label が接して構いません。
    kind はそれぞれ empty-string と empty-markdown-string です。
    先頭や末尾のセミコロン、名前の最初の寄与する断片も含みます
    （diagrams/agentflow.md の Names, strings, and click text、
    ast/agentflow.md の AgentflowName）。
    [fixture: agentflow/lex-connector-name-click-empty-string-adjacent-text]
    [fixture: agentflow/lex-connector-name-click-empty-string-adjacent-semicolon]
    [fixture: agentflow/lex-connector-name-click-empty-string-no-id-adjacent-semicolon]
    [fixture: agentflow/lex-connector-name-click-empty-string-trailing-semicolon]
    [fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-text]
    [fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-semicolon]
    [fixture: agentflow/lex-connector-name-click-empty-markdown-trailing-semicolon]
    [fixture: agentflow/lex-connector-name-click-empty-markdown-no-id-adjacent-semicolon]
    その Label の前で、空文字列に空 markdown 文字列が接して構いません。
    消される各形式は、個別の IgnoredText part として保ちます。
    [fixture: agentflow/lex-connector-name-click-empty-string-then-markdown]
    flow と connector の見出しは一つの空白、タイトルの括弧、
    接する隣接データを検査します。
    名前の最後の click 文脈を抜ける空白は、タイトルの開き括弧、
    見出しデータ、flow の見出し区切りの前で Name の外に保ちます。
    最後の part が消される空文字列や空 markdown 文字列でも同じで、
    後続の単位を検査する前に、この一空白を消費します。
    （diagrams/agentflow.md の Names, strings, and click text、
    ast/agentflow.md の AgentflowName）。
    [fixture: agentflow/name-click-exit-before-title-tab]
    [fixture: agentflow/name-click-exit-before-title-lf]
    [fixture: agentflow/name-click-exit-before-title-ls]
    [fixture: agentflow/name-click-exit-before-data-tab]
    [fixture: agentflow/name-click-exit-before-separator-space]
    裸の見出しタイトルでは、開き括弧の後の内側の余白は、
    trim された Label の範囲外です（ast/agentflow.md の AgentflowLabel）。
    [fixture: agentflow/name-heading-title-interior-padding]
    global は本文だけ、無名 flow はタイトルも見出しデータも持ちません。
    名前の区切り前の空ブロックは Name 内、
    明示タイトルや global 後は本文の文です。
    [fixture: agentflow/lex-flow-name-click-mixed]
    [fixture: agentflow/lex-name-click-exit-extra-space]
    [fixture: agentflow/lex-name-click-exit-crlf]
    [fixture: agentflow/lex-name-click-initial-markdown]
    [fixture: agentflow/lex-empty-call-in-flow-name]
    [fixture: agentflow/gram-flow-name-space-between-empty-blocks]
    [fixture: agentflow/gram-connector-name-terminal-click-eof]
    [fixture: agentflow/gram-flow-inline-data]
    [fixture: agentflow/gram-empty-description-after-flow-title]
    [fixture: agentflow/gram-empty-description-after-global]

    葉の綴りと token kind は、その位置の優先順つき字句規則にも従います。
    頂点 id とクラス接尾辞は id 単位を使い、
    カンマ区切りの id リストは各スロットからカンマを除きます。
    shape property は単独の id-run、interpolation と裸の callback は name、
    裸のコンテナー名はキーワードの優先順を含む name-piece を使います。
    click id は固有の空白以外の文字の連続です。
    [fixture: agentflow/lex-vertex-equals-alone]
    [fixture: agentflow/lex-vertex-supplementary-alone]
    [fixture: agentflow/gram-bare-callback-global]
    [fixture: agentflow/gram-connector-name-default]
    [fixture: agentflow/gram-style-suffix]
    [fixture: agentflow/gram-class-target-empty-ends]
    [fixture: agentflow/gram-props]
    [fixture: agentflow/gram-linkstyle-interpolate-default]
    [fixture: agentflow/gram-click-punctuation-id]
    [fixture: agentflow/lex-class-suffix-equals]
    [fixture: agentflow/gram-class-target-global]
    [fixture: agentflow/gram-props-number-unit]
    [fixture: agentflow/gram-interpolate-default-name]

    click 名の断片の初期文字列の後で、
    裸の続きが別の文字列単位を始めることはできません。
    [fixture: agentflow/gram-name-click-second-string]

    裸のラベルの続きは、通常、slanted、ellipse、分割リンクの文脈と、
    その区切りの優先順に従います。
    style リテラルは style 単位からなり、
    エスケープされたカンマは classDef だけが持てます。
    [fixture: agentflow/gram-bare-label-open-bracket]
    [fixture: agentflow/gram-bare-label-pipe]
    [fixture: agentflow/gram-slanted-label-open-bracket]
    [fixture: agentflow/gram-ellipse-label-open-paren]
    [fixture: agentflow/lex-style-equals-in-value]
    [fixture: agentflow/gram-classdef-escaped-comma-whitespace-tail]
    [fixture: agentflow/gram-split-edge-string-bare-tail]

    頂点、グループ、リンクは、繰り返しを含む書かれた出現を保ちます。
    グループの & の両側には空白が必要で、頂点の接尾辞は接します。
    プロパティの両項はコロンに接します。
    図形は共有の区切りと名前の表を使い、[| の場合だけプロパティを持ちます。
    ラベルは空でない書かれた内容と初期の kind を保ちます。
    完全な矢印は一つの Punctuator で、実線のダッシュは > か x で終わり、
    reference のドットの両側にはダッシュがあります。
    startMarker は none、line/endMarker は綴りに対応し、長さは上限を適用しません。
    開き矢印は正確に -- で、ラベルと実線の閉じ矢印を必要とします。
    パイプラベルの後の空白単位は高々一つです。
    [fixture: agentflow/gram-group-spaces]
    [fixture: agentflow/gram-group-unspaced]
    [fixture: agentflow/gram-node-three-definitions]
    [fixture: agentflow/gram-bracket-shapes]
    [fixture: agentflow/gram-props]
    [fixture: agentflow/gram-three-edge-kinds]
    [fixture: agentflow/db-edge-length-cap]
    [fixture: agentflow/gram-split-failure-label]
    [fixture: agentflow/gram-reference-quoted-pipe-label]
    [fixture: agentflow/gram-pipe-label-two-spaces-after]

    DataBlock は完全な @{ と }、RawText の内部、正確な書かれた値を持ちます。
    空ブロックと隣接ブロックも別々に保ちます。
    内部のキャレットや閉じ括弧を保護するのは二重引用符だけで、
    バックスラッシュは引用符のエスケープではありません。
    YAML、エイリアスの解決、メタデータの型、図形一覧は検証しません。
    [fixture: agentflow/gram-data-adjacent-multiline-blocks]
    [fixture: agentflow/db-data-block-empty-multiline]
    [fixture: agentflow/lex-data-block-caret]
    [fixture: agentflow/lex-data-block-quoted-caret]
    [fixture: agentflow/lex-data-backslash-quote-is-not-escape]
    [fixture: agentflow/db-data-block-invalid-yaml]
    [fixture: agentflow/div-metadata-yaml-self-alias]
    共通の前処理後のテキストでは、データブロック、リテラル、名前、
    分割リンクのテキスト、初期文字列を図のコメントで切れません。
    これらの文脈はパーセントの対を内容として読みます。
    既定のサイズ上限を超えると、
    共通のコメント領域が字句解析前に値を切れます。
    [fixture: agentflow/div-data-percent-line-is-content]
    [fixture: agentflow/comment-split-edge-label]
    [fixture: agentflow/lex-flow-name-string-comment-content]
    [fixture: agentflow/lex-accessibility-block-comment]
    [fixture: agentflow/comment-default-size-fallback-inline-label]

    style/class/linkStyle のリストは、
    末尾も含めカンマの枠と null の穴を保ちます。
    id リストには実際の id かカンマが必要です。
    null のスタイルも、必要な隙間とは別に書かれた空白単位を必要とします。
    [fixture: agentflow/gram-class-one-operand]
    [fixture: agentflow/gram-style-empty-value]
    後続コメントに取られる ASCII の余白はスタイル単位になりません。
    ASCII 以外の空白は単位として残ります。
    [fixture: agentflow/gram-style-null-before-comment]
    [fixture: agentflow/gram-style-null-before-comment-nbsp]
    スタイルのリテラルは先頭空白を保ち、末尾の余白を除きます。
    キーワード、id/クラスの値、補間の隙間は Agentflow の正確な一空白単位です。
    classDef はエスケープされたカンマをリテラル内に保ちます。
    linkStyle は補間かスタイルを持ち、番号は正準形で、
    入れ子を含め先行する鎖とグループの辺を指します。
    別の exceedsMaxEdges ヘルパーがサイトの上限を検査します。
    [fixture: agentflow/gram-class-target-empty-ends]
    [fixture: agentflow/gram-classdef-trailing-empty-name]
    [fixture: agentflow/gram-style-all-null]
    [fixture: agentflow/gram-linkstyle-trailing-null-style]
    [fixture: agentflow/db-node-style-first-leading-spaces]
    [fixture: agentflow/gram-classdef-escaped-comma]
    [fixture: agentflow/lex-style-double-space-keyword]
    [fixture: agentflow/lex-class-double-space-value]
    [fixture: agentflow/lex-linkstyle-interpolate-double-space]
    [fixture: agentflow/lex-linkstyle-leading-zero]
    [fixture: agentflow/gram-linkstyle-style-out-of-bounds]
    [fixture: agentflow/config-max-edges-group]

    URL と tooltip はそれぞれ完全な文字列単位を一つだけ占め、
    裸の続きや、結合した後続の文字列を持ちません。
    [fixture: agentflow/gram-click-url-merged-strings]

    click の id リストは空の両端を null として保ちます。
    裸のコールバックは Identifier、
    call の名前と任意の引数は不透明な Literal です。
    余白を保ち、空白だけの引数は null にします。
    最初の括弧が空なら、二つ目の call が引数を供給できます。
    URL とツールチップは閉じた空でない文字列で、
    target は最後に書かれた対象の Keyword か null です。
    textBeforeUrl/textBeforeTooltip は、
    認識された消される形式全体を所定の位置で保ち、
    後続の値を必要とします。
    コールバック名や target の前には prefix フィールドがありません。
    ツールチップと target の隙間は一空白単位です。
    [fixture: agentflow/gram-click-id-empty-ends]
    [fixture: agentflow/gram-click-callback-forms]
    [fixture: agentflow/gram-click-callback-space-args]
    [fixture: agentflow/gram-callback-arguments-after-second-call]
    [fixture: agentflow/gram-url-tooltip-whitespace-only]
    [fixture: agentflow/gram-click-link-forms]
    [fixture: agentflow/gram-click-erased-before-url]
    [fixture: agentflow/gram-click-erased-before-callback-tooltip]
    [fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]
    [fixture: agentflow/div-empty-description-before-callback-name]
    [fixture: agentflow/div-empty-description-before-link-target]

    direction は TB、BT、RL、LR、TD の優先順で家族を選び、
    その家族の最後の一致を使います。
    trim した空でない前後のテキストは IgnoredText です。
    アクセシビリティの行の値は先頭空白を飛ばして行全体を保ち、
    次の物理行から始まることもあります。
    null になるのは EOF だけです。
    ブロックの closed は書かれた括弧に従い、閉じていなければ EOF まで伸びます。
    字句上の隙間は dbFromTree と同じ既定サイズのコメント規則と、
    閉じ括弧直後の変換を使います。
    ブロックの値は最初の閉じ括弧で止まり、後続の文を値に含めません。
    [fixture: agentflow/db-accessibility-block]
    [fixture: agentflow/lex-direction-value-priority]
    [fixture: agentflow/lex-direction-last-selected-occurrence]
    [fixture: agentflow/lex-direction-unclosed-bracket-prefix]
    [fixture: agentflow/db-acctitle-next-line]
    [fixture: agentflow/db-acctitle-eof]
    [fixture: agentflow/db-accessibility-unclosed-block]
    完全な frontmatter trivia は閉じ区切り後の空行や空白だけの行を含み、
    本文の最初の空でない行の字下げは保ちます。
    [fixture: agentflow/frontmatter-extra-trivia-boundary]
    [fixture: agentflow/frontmatter-extra-trivia-below]
    [fixture: agentflow/frontmatter-extra-whitespace-line-boundary]
    [fixture: agentflow/frontmatter-extra-trivia-above]
    [fixture: agentflow/frontmatter-extra-trivia-indent-above]
    [fixture: agentflow/comment-default-size-equal-frontmatter]
    [fixture: agentflow/comment-default-size-above-frontmatter]
    [fixture: agentflow/lex-brace-string-keeps-blank-line]

    所属を除外する前の候補で、
    hasOwnProperty の後に空でない候補があれば拒否します。
    direction/global/style/class/linkStyle/click は候補を寄与しません。
    id の重複、未解決の参照、包含の循環、既知の削除済み図形は拒否しません。
    共有の単位全体の検査が、
    内部の directive と無視されるセミコロンを拒否します。
    保持先のない空形式用に、自由な文や隙間のフィールドはありません。
    [fixture: agentflow/gram-flow-named-member-hasownproperty]
    [fixture: agentflow/gram-hasownproperty-last-member]
    [fixture: agentflow/gram-flow-hasownproperty-before-empty-statement]
    [fixture: agentflow/db-flow-three-definitions]
    [fixture: agentflow/db-diagnostics-no-semantic-checks]
    [fixture: agentflow/db-diagnostics-containment-cycle]
    [fixture: agentflow/db-data-block-removed-shape]
    [fixture: agentflow/div-directive-in-arrow]
    [fixture: agentflow/div-ignored-semicolon-in-arrow]
    [fixture: agentflow/div-empty-string-statement]

  - usecase: 26 種のノード、null 条件、空にできないリスト、子の型、
    スカラーの語は
    [ast/usecase.md](../../spec/docs/ast/usecase.ja.md) に従います。
    構造の範囲は記述されたトークンと子の外周で、子はソース順です。
    ヘッダーは完全な小文字 usecase-beta 一つで、文は物理改行で区切ります。
    ネイティブな隙間は ASCII HWS だけで、Unicode 空白は許される値の内容です。
    Identifier、引用文字列、裸のラベル、ステレオタイプ、CSS の名前と値は、
    それぞれの位置の字句単位でなければなりません。
    キーワード・演算子の優先順位と数値の代替規則も検査します。
    単一引用符の StringLiteral は同じ単一引用符で閉じ、
    バックスラッシュはそれをエスケープしません。
    [fixture: usecase/db-all-fields] [fixture: usecase/lex-whitespace-leading]
    [fixture: usecase/lex-unicode-indent]
    [fixture: usecase/lex-number-decimal-id-unit]
    [fixture: usecase/lex-forward-circle-id-prefix]
    [fixture: usecase/lex-native-single-quoted-keys]
    [fixture: usecase/lex-plain-single-apostrophe]

    CSS 名は Identifier の原子一つ、またはダッシュ接頭部の Punctuator と
    Identifier の語一つです。間の HWS は名前に残り、どのトークンにも入りません。
    RawText と String の単位は、共通のソース分割がある場合だけ分かれます。
    [fixture: usecase/lex-class-property-custom-gap]
    [fixture: usecase/lex-css-name-custom-tab]
    [fixture: usecase/directive-in-label]
    [fixture: usecase/lex-directive-css-name-gap]

    分割矢印の opening は、後続ラベルのソースを含めて選ばれる完全な演算子です。
    `--o`、`--x`、より長いダッシュ列を、
    短い opening とラベルの文字へ分割できません。
    opening 後の HWS はラベルを別の単位に保ちます。
    [fixture: usecase/gram-split-opening-forward-circle-prefix]
    [fixture: usecase/gram-split-opening-forward-cross-prefix]
    [fixture: usecase/gram-split-opening-extra-dash]
    [fixture: usecase/gram-split-backward-opening-extra-dash]
    [fixture: usecase/gram-split-opening-circle-prefix-hws-control]
    [fixture: usecase/gram-split-backward-opening-dash-hws-control]

    style と classDef のどちらでも、JSON 接頭部は CSS 値の成分より先に
    コンテキストを切り替えます。
    JSON のオブジェクトが空でも空でなくても、妥当であることは
    CSS Literal として読める理由にはなりません。
    [fixture: usecase/gram-style-json-prefix-mode]
    [fixture: usecase/gram-classdef-json-prefix-mode]
    [fixture: usecase/gram-style-json-prefix-nonempty-mode]

    この接頭部は Word や hash-color の後も含め、各成分の境界で検査します。
    plain string、CSS identifier、より長い Identifier の内部からは
    照合し直しません。
    [fixture: usecase/gram-style-json-prefix-after-word-mode]
    [fixture: usecase/gram-style-json-prefix-after-hash-mode]
    [fixture: usecase/gram-style-json-prefix-in-string-control]
    [fixture: usecase/gram-style-json-prefix-css-word-control]
    [fixture: usecase/gram-style-json-prefix-identifier-control]

    actor/entity の接尾部、図形、引用だけの名前、actor リスト、
    分割・意味付き関連、一段の boundary、メタデータ更新、ノート、
    JSON の接頭部、class/style リスト、アクセシビリティは、
    記述された子と句読記号だけを持ちます。
    矢印のフィールドは記述された記号・線種・ダッシュまたはドット数です。
    ネイティブメタデータでは、コンマ・改行の区切り、
    キーとコロンと値の行内継続、スカラー型、対象別の値の集合、
    最終モデルの条件を検査し、宣言の衝突は後の更新で修復できません。
    アクセシビリティ値はコロン後または括弧の内部を全部保持し、
    空白も残して、完全に空の場合だけ null にします。
    [fixture: usecase/gram-actor-list] [fixture: usecase/db-labeled-arrows]
    [fixture: usecase/db-semantic-case] [fixture: usecase/gram-boundary-nested]
    [fixture: usecase/gram-native-key-newline-colon]
    [fixture: usecase/gram-native-value-newline]
    [fixture: usecase/gram-native-trailing-newline-comma]
    [fixture: usecase/gram-native-quoted-business]
    [fixture: usecase/gram-native-final-invalid-then-valid]
    [fixture: usecase/gram-native-inline-conflict-later-fix]
    [fixture: usecase/gram-a11y-line-raw-padding]
    [fixture: usecase/gram-a11y-whitespace-block]

    共通 trivia の除去と CR/CRLF の正規化後、
    最後のプロパティから `}` までにある末尾コンマと物理改行は、
    合計 2 個までで、コンマは改行より前にだけ置けます。
    ASCII HWS は改行数を変えません。
    [fixture: usecase/gram-metadata-trailing-comma-no-newline]
    [fixture: usecase/gram-native-trailing-comma-newline]
    [fixture: usecase/gram-metadata-trailing-comma-two-newlines]
    [fixture: usecase/gram-metadata-trailing-comma-three-newlines]
    [fixture: usecase/gram-metadata-trailing-comma-one-newline-hws]
    [fixture: usecase/gram-metadata-trailing-comma-two-newlines-hws]
    [fixture: usecase/gram-metadata-trailing-comma-one-newline-crlf]
    [fixture: usecase/gram-metadata-trailing-comma-two-newlines-crlf]
    [fixture: usecase/gram-metadata-trailing-comma-three-newlines-crlf]
    [fixture: usecase/gram-metadata-trailing-comma-comment-line]
    [fixture: usecase/gram-metadata-trailing-comma-comment-line-blank-after]
    [fixture: usecase/gram-metadata-no-trailing-comma-two-newlines]
    [fixture: usecase/gram-metadata-no-trailing-comma-three-newlines]
    [fixture: usecase/gram-metadata-no-trailing-comma-four-newlines]
    [fixture: usecase/gram-metadata-no-trailing-comma-two-crlf]
    [fixture: usecase/gram-metadata-no-trailing-comma-three-crlf]
    [fixture: usecase/gram-metadata-no-trailing-comma-two-whitespace-lines]
    [fixture: usecase/gram-metadata-no-trailing-comma-whitespace-lines]
    [fixture: usecase/gram-metadata-no-trailing-comma-two-tab-lines]
    [fixture: usecase/gram-metadata-no-trailing-comma-tab-lines]
    [fixture:
    usecase/gram-metadata-no-trailing-comma-two-properties-two-newlines]
    [fixture:
    usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines]
    [fixture: usecase/gram-edge-metadata-two-newlines]
    [fixture: usecase/gram-edge-metadata-three-newlines]
    [fixture: usecase/gram-metadata-no-trailing-comma-comment-two-newlines]
    [fixture: usecase/gram-metadata-no-trailing-comma-comment-three-newlines]
    コンマと次のプロパティの間では、引き続き複数の改行を許します。
    [fixture: usecase/gram-metadata-property-comma-two-newlines]
    [fixture: usecase/gram-metadata-property-comma-three-newlines]

    UsecaseJsonDataBlock は @、任意の HWS、開き括弧、
    不透明な RawText の内部、最初の対応する閉じ括弧を持ちます。
    二重引用符とそのバックスラッシュエスケープだけが括弧を保護します。
    JSON の内容は検証せず、ネイティブな UsecaseMetadata は構文として扱います。
    共通の完全単位検査は、原子の語や演算子内のソース分割を拒否します。
    CSS のダッシュ接頭部後の HWS や、
    JSON 接頭部の完全な成分間は trivia を許します。
    図種のテストは固定の木を手で作って壊し、corpus の検査は、
    記録された usecase の木と common の検出 fixture をすべて使います。
    [fixture: usecase/gram-json-space-after-at]
    [fixture: usecase/gram-json-double-backslash-before-quote]
    [fixture: usecase/div-json-balanced-invalid-array]
    [fixture: usecase/gram-json-brace-in-single-quote]
    [fixture: usecase/div-directive-raw-json-id]
    [fixture: usecase/lex-directive-whole-json-prefix-boundary]
    [fixture: usecase/lex-directive-css-name-gap]
    [fixture: usecase/div-semicolon-css-property-selected]

  - ishikawa: 子フィールドは ast/ishikawa.md と照合する
    `ISHIKAWA_CHILD_TYPES` に従います。
    根は任意で、各ノードはリテラル 1 個と順序付きの子ノードを持ちます。
    図とノードの範囲は、自身のトークンと子の包絡です。
    ノードは文字列と子孫の外にトークンを書きません。
    [fixture: ishikawa/header-only-lf]
    [fixture: ishikawa/header-comment-ps-whitespace-eof]
    [fixture: ishikawa/db-all-fields]
    [fixture: ishikawa/db-three-definitions]
    `indent` は書かれた行の空白数と等しい非負整数です。
    タブも 1 と数え、ディレクティブ内部と共通のコメント領域は除きます。
    ヘッダー行ではヘッダー後の空白だけを数えます。
    図コメントを終える U+2028 と U+2029 は後続の空白と共に数え、
    コメント内部の空白は除きます。
    [fixture: ishikawa/db-indent-tab-character]
    [fixture: ishikawa/db-indent-equal-mixed-whitespace]
    [fixture: ishikawa/db-indent-around-directives]
    [fixture: ishikawa/header-same-line-root]
    [fixture: ishikawa/comment-preserved-u2028]
    [fixture: ishikawa/comment-preserved-u2029]
    [fixture: ishikawa/lex-indent-multiline-directive]
    [fixture: ishikawa/lex-header-indent-multiline-directive]
    [fixture: ishikawa/lex-indent-comment-region-ls]
    [fixture: ishikawa/lex-indent-comment-region-ps]
    [fixture: ishikawa/lex-comment-ps-indent-excludes-body-padding]
    最初の原因は根の子で、根の字下げは親を決めません。
    後続の原因の字下げが最初の原因以下なら根の子です。
    それ以外では、字下げがより小さい直前の原因が親です。
    兄弟はソース順です。
    [fixture: ishikawa/db-indent-first-cause]
    [fixture: ishikawa/db-indent-root-deeper]
    [fixture: ishikawa/db-indent-root-shallower]
    [fixture: ishikawa/db-indent-relative-zero]
    [fixture: ishikawa/db-indent-clamp-below-base]
    [fixture: ishikawa/db-indent-nearest-smaller-cause]
    [fixture: ishikawa/db-indent-jump]
    [fixture: ishikawa/db-indent-pop-several]
    リテラルは空でない書かれた値を持ち、末尾空白、引用符、文字参照も保持します。
    ディレクティブ、共通のコメント領域、選ばれた無視するセミコロンは除きます。
    RawText トークンはその切断だけで分かれます。
    [fixture: ishikawa/gram-root-trailing-space]
    [fixture: ishikawa/gram-empty-quotes]
    [fixture: ishikawa/header-root-inline-entity]
    [fixture: ishikawa/directive-root-middle]
    [fixture: ishikawa/comment-ls-region-in-text]
    [fixture: ishikawa/lex-root-style-semicolon]
    文字列は字下げ、`%%`、境界を持つヘッダーの単語で始まりません。
    除かれる trivia の外に改行を持たず、論理行の末尾まで続きます。
    [fixture: ishikawa/lex-header-nonascii-child]
    [fixture: ishikawa/lex-header-middle-label]
    [fixture: ishikawa/gram-root-unclosed-quote]
    [fixture: ishikawa/directive-multiline-joins-node-text]
    [fixture: ishikawa/lex-kelvin-node-text]
    図は完全な `ishikawa` または `ishikawa-beta` の Keyword を 1 個書きます。
    ASCII 英字の大文字小文字を区別せず、他の文字は変えずに比べます。
    beta の規則が先で、元の文字で ASCII の語境界を判断します。
    選ばれたヘッダーの分割と、
    除かれるディレクティブ以外に何も続かないヘッダーを拒否します。
    [fixture: ishikawa/header-uppercase]
    [fixture: ishikawa/header-beta-mixed-case]
    [fixture: ishikawa/detect-kelvin-in-header]
    [fixture: ishikawa/lex-header-kelvin-boundary]
    [fixture: ishikawa/lex-header-dotted-i-boundary]
    [fixture: ishikawa/header-beta-letter-suffix]
    [fixture: ishikawa/directive-in-header]
    [fixture: ishikawa/div-directive-beta-prefix]
    [fixture: ishikawa/header-only]
    [fixture: ishikawa/header-directive-only-eof]
    空行、コメント、ディレクティブはノードを作りません。
    連続するノード文字列の間には、改行か図コメントを終える LS/PS があります。
    それ以外の隙間と末尾の文字は空白です。
    [fixture: ishikawa/div-header-blank-node]
    [fixture: ishikawa/div-header-trailing-space-node]
    [fixture: ishikawa/gram-between-directive-line]
    [fixture: ishikawa/gram-root-and-child-one-line]
    [fixture: ishikawa/comment-preserved-u2028]
    [fixture: ishikawa/comment-preserved-u2029]
    図コメントのマークは `%%` で、
    物理改行、U+2028、U+2029、EOF の前で終わります。
    [fixture: ishikawa/gram-preserved-comment-after-root]
    [fixture: ishikawa/comment-preserved-u2028]
    [fixture: ishikawa/comment-preserved-u2029]
    [fixture: ishikawa/comment-only-eof]
  - venn: 子の型、null 条件、空にできない名前とプロパティのリスト、
    部分集合の名前の数、数値 id のラベルの禁止、
    kind の語は ast/venn.md に従います。
    対象が null なのは有効な字下げ付き text の印だけです。
    改行後の通常の文頭がモードを終わらせ、空行、除去されたコメント、
    共通のディレクティブ、飲み込まれた断片は保ちます。
    空行の後の字下げなしの `%%{ }%%` はモードを終わらせます。
    宣言の直後のもの、ASCII 空白かタブをちょうど一つ前置したもの、
    裸の `%%` の行はモードを保ちます。
    空白かタブだけの空でない行が間にあってもモードは保たれます。
    先頭の空白かタブが二つ以上なら一つの並びとして読み飛ばします。
    規則 2 がコメントの前の別の一文字を飲み込まなければ、
    規則 7 が `%%{` でモードを終わらせます。
    ラベルは空の引用ラベルも含む書かれた内部全体を保ち、
    リテラルは単位間の空白とタイトルの空白を保ちます。
    配置と空白には statement-checks.ts を使います。
    図のコメントは `%%` で、
    無視されるテキストはその直前の空白以外の一コード単位です。
    キーワード、句読点、トークンの種類は
    `parser/docs/tokens/venn.md` に従います。
    裸のスタイルの識別子、数、色の単位はそれぞれのトークンを保ちます。
    識別子の単位より前にキーワードとタイトル行の規則を当てます。
    通常の文間は ASCII の空白だけを許します。
    規則 2 は図のテキストに残る `%%` の直前で、
    Notation の空白一文字を飲み込めます。
    U+2028 と U+2029 も、裸の `%%` や `%%{ }%%` の前では飲み込まれます。
    除去される共通のコメント行や本物のディレクティブの前では、
    通常の文間に残り、拒否されます。
    [fixture: venn/gram-comment-prefix-line-separator-bare-percent]
    [fixture: venn/gram-comment-prefix-line-separator-u2029-bare-percent]
    [fixture: venn/gram-comment-prefix-line-separator-brace-comment]
    [fixture: venn/gram-comment-prefix-line-separator-u2029-brace-comment]
    [fixture: venn/gram-comment-prefix-line-separator-between-statements-bare-percent]
    [fixture: venn/gram-comment-prefix-line-separator-between-statements-u2029-bare-percent]
    [fixture: venn/gram-comment-prefix-line-separator-between-statements-brace-comment]
    [fixture: venn/gram-comment-prefix-line-separator-between-statements-u2029-brace-comment]
    [fixture: venn/gram-comment-prefix-line-separator-between-statements-implicit-text]
    [fixture: venn/gram-comment-prefix-line-separator-between-statements-u2029-implicit-text]
    [fixture: venn/gram-comment-prefix-line-separator]
    [fixture: venn/gram-comment-prefix-line-separator-u2029]
    [fixture: venn/gram-comment-prefix-line-separator-directive]
    [fixture: venn/gram-comment-prefix-line-separator-u2029-directive]
    [fixture: venn/lex-swallowed-nbsp-gap]
    [fixture: venn/lex-swallowed-vt-gap]
    [fixture: venn/lex-swallowed-ff-gap]
    [fixture: venn/lex-swallowed-bom-gap]
    [fixture: venn/lex-swallowed-ideographic-gap]
    [fixture: venn/lex-swallowed-nbsp-header]
    [fixture: venn/lex-swallowed-nbsp-between-subsets]
    [fixture: venn/lex-swallowed-nbsp-eof]
    [fixture: venn/lex-comment-swallowed-vt]
    [fixture: venn/lex-comment-swallowed-ff]
    [fixture: venn/lex-comment-swallowed-nbsp]
    [fixture: venn/lex-comment-swallowed-ogham]
    [fixture: venn/lex-comment-swallowed-en-quad]
    [fixture: venn/lex-comment-swallowed-em-quad]
    [fixture: venn/lex-comment-swallowed-en-space]
    [fixture: venn/lex-comment-swallowed-em-space]
    [fixture: venn/lex-comment-swallowed-three-per-em]
    [fixture: venn/lex-comment-swallowed-four-per-em]
    [fixture: venn/lex-comment-swallowed-six-per-em]
    [fixture: venn/lex-comment-swallowed-figure]
    [fixture: venn/lex-comment-swallowed-punctuation]
    [fixture: venn/lex-comment-swallowed-thin-space]
    [fixture: venn/lex-comment-swallowed-hair-space]
    [fixture: venn/lex-comment-swallowed-narrow-nbsp]
    [fixture: venn/lex-comment-swallowed-medium-math]
    [fixture: venn/lex-comment-swallowed-ideographic]
    [fixture: venn/lex-comment-swallowed-bom]
    [fixture: venn/lex-comment-swallowed-cr]
    U+0085 は空白ではなく、この位置では無視されるテキストに残ります。
    [fixture: venn/lex-swallowed-nel-gap]
    図のコメントは LF の前で終わり、U+2028 と U+2029 では終わりません
    （[diagrams/venn.md の Comments](../../spec/docs/diagrams/venn.md#comments-and-swallowed-fragments)）。
    文間と末尾の検査で使うコメントの範囲は、
    共通のコメント領域が切ったソースの断片間の区切り文字と空白も含み、
    図のテキストの次の LF か EOF まで続きます。
    [fixture: venn/lex-diagram-comment-cut-ls-tree-gap]
    [fixture: venn/lex-diagram-comment-cut-ps-tree-gap]
    [fixture: venn/lex-diagram-comment-cut-ls-spaces-tree-gap]
    [fixture: venn/lex-diagram-comment-cut-ps-spaces-tree-gap]
    [fixture: venn/lex-diagram-comment-cut-ls-tab-tree-gap]
    [fixture: venn/lex-diagram-comment-cut-ps-tab-tree-gap]
    [fixture: venn/lex-diagram-comment-cut-ls-eof-tree-gap]
    [fixture: venn/lex-diagram-comment-cut-ps-eof-tree-gap]
    [fixture: venn/lex-diagram-comment-cut-ls-following-real-statement]
    [fixture: venn/lex-diagram-comment-cut-ps-following-real-statement]
    [fixture: venn/lex-diagram-comment-cut-ls-joined-unit]
    ラベルのトークンは空白を含む書かれた内部全体を覆います。
    `check-tree-venn.test.ts` が手作りの木を渡し、壊して検査します。
    名前で指定した fixture の記録済みの木も壊して検査します。
    コーパスの検査は Venn の記録済みの木すべてと common の検出例を含みます。
    Venn を記録済みの木の検査から除外しません。
  - c4: 子の型、null 条件、空にできない引数リスト、
    正確なキーワードの家族、図の kind は ast/c4.md に従います。
    `beforeBody` は空の説明ブロックだけを持ち、
    境界の本体の最初の有意な文は呼び出しです。
    C4Literal は書かれたテキストを保持し、
    `title` と `accDescription` 以外では外側の空白を除きます。
    文字列は共有の value、raw、closed を持ち、名前付きの値は空にできません。
    呼び出し、名前付き属性、タイトル、アクセシビリティ形式、文の間隔は、
    statement-checks.ts で配置、空白、外包を検査します。
    図のコメントの印は `%%` で、行終端子を外に残します。
    トークンの種類とキーワード・句読点の表は、
    `parser/docs/tokens/c4.md` に従います。
    ASCII の空白も含む `(,` と `,,` は、それぞれ一つのトークンです。
    `check-tree-c4.test.ts` は手作りの木を検査し、
    名前で指定したフィクスチャの記録済みの木も壊して検査します。
    コーパスの検査は C4 の記録済みの木すべてと、
    五つの kind の common の検出例を含みます。
    C4 を記録済みの木の検査から除外しません。
  - kanban: 子の型と欄の語は ast/kanban.md の表に従います。
    body は列、その children はカードを持ち、カードの children は空です。
    2段の親子を原順と indent から独立に検査します。
    最初の node の indent が列を定め、それ以外は直前の列のカードです。
    最後の浅いカードも同じです。
    body、children、data、decorations のリストは空でも構いません。
    ノードはテキスト、形、または両方を持ち、
    字下げは書かれた空白と等しい非負の整数です。
    テキストは末尾の空白を保ち、形は text、string、markdown の
    空でないラベルを一つと、独立した書かれた区切りを持ちます。
    隣接するデータブロックはノードと互いに接し、空を含む不透明な内部を保ちます。
    YAML は検証しません。
    空でないアイコンとクラスのテキストは空白を保ち、装飾行は直前の行に属します。
    配置、接触、範囲には statement-checks.ts を使い、
    コメントは `%%` で行区間の終わりまでです。
    トークンの種類とキーワード・句読点の表は
    `parser/docs/tokens/kanban.md` に従います。
    ノードのテキスト、裸のラベル、アイコンとクラスのテキスト、
    データ内部全体は `RawText` です。
    引用されたラベルは一つの `String` か、
    ディレクティブ、コメント領域、無視されるセミコロンで切られた
    `StringFragment` トークンです。
    データの区切りは別々の `Punctuator` トークンで、
    空の内部にトークンはありません。
    範囲は各ノードのトークンと子の外包です
    （`parser/docs/positions/kanban.md`）。
    `check-tree-kanban.test.ts` は手作りの木を検査し、
    名前を指定したフィクスチャの記録済みの木を壊します。
    コーパスの検査は kanban の記録済みの木すべてと common の検出例を含み、
    kanban を記録済みの木の検査から除外しません。
    範囲は自身の構文から最後の子孫までを覆い、兄弟は重なりません。
    装飾は字下げにかかわらず、最後に書かれた node に一度だけ置きます。
    受理は parser の結果の記録で確かめ、ここでは再実装しません。
    [fixture: kanban/db-indent-deeper]
    [fixture: kanban/db-indent-shallower-last]
    [fixture: kanban/gram-decoration-then-child]
    [fixture: kanban/gram-nesting-item-decoration-before-deeper-item]

    字下げの逆走査は、保持された native コメントの本文で止めます。
    コメントを終える LS/PS と右側の字下げは数え、
    コメント内部の空白は数えません。
    共有の directive、コメント領域、選ばれた無視するセミコロンは透明に扱います。
    コメントの範囲の次の有効な文字を、これらの共有の除去を越えて確かめ、
    コメントを終える LS/PS を行末と認めます。
    値や通常の空白の gap にある LS/PS は行末にしません。
    この検査は kanban に限り、treemap と treeview の native コメントは、
    引き続き LS/PS を越えて LF まで続きます。
    [fixture: kanban/lex-indent-comment-ps-semicolon-space]
    [fixture: kanban/lex-indent-comment-ls-semicolon-space]
    [fixture: kanban/lex-indent-comment-ps-semicolon-wide-tail]
    [fixture: kanban/lex-indent-comment-ps-space-after-card]
    [fixture: kanban/lex-indent-comment-ps-space-after-column]
    [fixture: kanban/lex-indent-comment-ls-selected-semicolon-touching]
    [fixture: kanban/lex-indent-comment-ps-selected-semicolon-indent-directive]
    [fixture: kanban/lex-indent-comment-ps-common-line]
    [fixture: kanban/lex-ps-bare-value] [fixture: kanban/lex-ls-bare-value]
    [fixture: treemap/lex-indent-comment-ps-semicolon-space]
    [fixture: treeview/lex-indent-comment-ps-semicolon-space]

  - block: 子の型は `BLOCK_CHILD_TYPES` に従い、
    ast/block.md と合わせます。
    図と複合ブロックの本体、class の id、スタイルの区間リストは空にできず、
    本体が空の説明ブロックだけでもいけません。
    null にできる欄は書かれた形と合い、幅はコロンの直後にあり、
    `space:` はコロンを含み、`columns auto` の count は null、
    名前のある複合ブロックは `block:` の後に頭部を持ち、
    リンクは開始矢印とラベルの両方を持つか、両方が null です。
    形状は書かれた開始と終了を独立に保持し、不一致の組も有効で、
    括弧の内側に空白を持ちません。
    ブロック矢印の方向は `right`、`left`、`up`、`down`、`x`、`y` の
    空でないリストで、書かれた順にあり、
    各方向は BlockLiteral で、語とその後に書かれた空白からなり、
    最初の方向は前にカンマがなければ `(` の後に書かれた空白も持ちます。
    方向の前のカンマは任意で、末尾や連続のカンマはありません。
    方向は、空白の `RawText` トークン
    （ディレクティブやコメント行が切ります）の間の語の `Keyword` トークンで、
    カンマの後の空白はどの方向にもどのトークンにもありません。
    矢印の欄は書かれたマーカー、線、長さと合い、
    各矢印は一つの句読点トークンで、開始と終了の線は異なっても構いません。
    ラベルは閉じた空でない StringLiteral で、markdown ではなく、
    幅と列数は十進の数字です。
    ノードの id は id の文字を持ち、style の id と classDef の名前は
    ASCII の語の文字を持ち、
    style の一つの id のカンマは空でない語を区切ります。
    class の id は、語と、カンマの後ではそのカンマの後に書かれた空白からなる
    BlockLiteral です。
    空白は語の `Identifier` トークンの前の `RawText` トークンです。
    クラス名は両端に空白を持たず、その行に収まります。
    スタイルはカンマとの間の空白を保つので、最初のスタイルは非空白文字で始まり、
    最後のスタイルは非空白文字で終わります。
    2 つのカンマの間の空白だけの部分はその空白のリテラルで、
    何もない部分は null です。
    文のトークンの種類、子の順、隙間、範囲の配置は statement-checks.ts と
    parser/docs/tokens/block.md、positions/block.md に従います。
    BlockLiteral の値は書かれたテキスト、識別子はトークンの連結、
    文字列は内容で、数値は書かれた数字と合わせます。
    コメントは `%%` のコメント行で、block のヘッダーの後に
    図のコメントはありません。
    2 つの単位が接しているかは書かれたテキストで判定するので、
    間にディレクティブがあっても接しています
    （shape の区切りと文字列、`:` と数）。
    `check-tree-block.test.ts` が手作りツリーと記録済みツリーを検査します。

範囲の**書かれたテキスト**は、ディレクティブ、コメント領域、
行の規則が無視する `;` を除いたソースです（ast.md の Nodes）。

**値の規則**は、ノードの値がその書かれたテキストであり、
ノードのトークンがそれと合うことを求めます。
範囲の中のトークンのテキストから `Directive` と `IgnoredSemicolon` を除き、
つないだものが値です。
値の欄（`value` か `name`）を持つすべての型がこの規則に従います。
表がほかの作り方を与える型は、その仕様の文とともに挙げます。

- 単位をつないだ値（`Identifier`、`ClassIdentifier`、class の矢印、
  class 図、ER 図、requirement 図のスタイル）は、
  単位の間の空白を除きます。
  つないだトークンが値です。`Identifier` は 1 つのトークンです。
- sankey 図の引用符のない欄（`SankeyIdentifier`、`SankeyLiteral`）の値は、
  書かれたテキストから両端の空白を除いたもので、
  空白だけの欄では空です。
  ノードは両端の空白を除いた欄ですが、空白だけの欄は例外で、
  そのただ 1 つの `RawText` トークンが空白で、
  トークンは書かれたテキストです。
- quadrant chart の座標、スタイル、クラスの名前
  （`QuadrantLiteral` と `QuadrantIdentifier`）の値は、書かれたテキストです。
  タイトル、アクセシビリティのテキスト、ブロックのテキスト
  （`QuadrantLiteral`）の値は、書かれたテキストから
  両端の Notation の空白を除いたものです。
  ラベル（`QuadrantLabel`）の値は書かれたテキストと種類から決まり、
  図の検査が読みます。
- xychart 図の引用符のないテキスト（`XychartLiteral`）の値は、
  単位をつないだ値で、空白を含みません。
  アクセシビリティの文のテキストの値は、
  書かれたテキストから両端の空白を除いたもので、
  文字の間の空白を含み、トークンは書かれたテキストです。
- 文字列、文字列で始まるラベル、
  文字列かマークダウン文字列である mindmap 図のラベル、データブロックには、
  そのテキストに属する区切りがあります。
  値は、区切りを除き、その内側に書かれた空白を保った、書かれたテキストです。
  その空白もトークンの中にあります。
- mermaid.js が読まないテキストのノード（無視されるテキストや文）は、
  書かれたものを、単位の間の空白も含めて示し、
  範囲の中のコメントは除きます。
  その空白はどのトークンの中にもありません。
  ただし、テキストの並び（`RawText`）は、切れ目の隣の空白を保ちます。
  図のコメントは、印から、その行を終える行終端子まで走ります
  （state.md の Comments、common.md の Notation）。
  行終端子は、line feed、CRLF、単独の CR のどれかで、
  どれも続かなければテキストの終わりです。
  それを切るコメント行も越えるので、値はその範囲のすべてを除きます。
  U+2028 か U+2029 の前の空白、その区切り、コメント行とその行終端、
  その後ろの空白、その後ろの断片です。
  コメントを終える行終端子（CRLF は 1 つ）と、
  図のコメントが前にないコメント行だけの行は、ほかを除きません。
- `NumericLiteral` の数と `FlowchartShape` の名前は、テキストから決まり、
  テキストそのものではありません。
  数は書かれたテキストと、名前は形の区切りと照らします。

`tests/check-tree-values.test.ts` は、表が、欄の表にある値の欄を
過不足なく挙げることを求めます。
また、値を書かれたテキストそのもの、
または単位のテキストをつないだものとする型が、
仕様の Meaning の列と合うことを求めます。
そのため、例外は仕様が述べるものになります。

図種が共有する記録は、1 か所で検査します（`leaves.ts`）。
ディレクティブの `name` は最初の語、
ルートの `diagramType` は本体が持つ id のどれかです。
図種の検査は、その図種のノードの検査です。

すべての型のすべての欄は、その欄自身の規則で検査します。
`tests/check-tree-fields.test.ts` は、記録した木で各型の各欄を壊し、
検査がそれを、その欄を持つノードで、
その欄の規則のメッセージとともに報告することを求めます。
文字列を入れたノードかノードの列の欄には、木の形の検査のメッセージがあり、
値を持つ欄には、テストの表がその欄に挙げるメッセージがあります。
別の規則の問題では、その欄の求めを満たしません。
null になりうる欄は、ソースがそれを書く所で null にし、
書かない所で値を入れて、報告がその欄自身の問題であることも求めます。
文字列の欄では、その欄を持つノードの問題です。
ノードかノードの列の欄では、その欄が覆っていた範囲の中の問題で、
そのトークンを持つノードがない、というメッセージです。
次の段落が挙げる欄では、その欄を持つノードの問題で、
欄の名前を挙げたメッセージです。

ノードかノードの列で null になりうる欄は、
ノードがそれのために何も書かない所で null です。
ノードがその欄のために書くものに値のトークンがあれば、
欄が null のときそのトークンはどのノードの中にもなく、
値のトークンの置き場所の検査が報告します。
その欄を、`{` のように、ノード自身のトークンで書く場合は、
`src/check-tree/null-fields.ts` が、
ノードのトークンのうち子ノードのどれにも入らないものを読み、
それが欄のテキストなのに null である欄を報告します。
対象は次のとおりです。

- クラスのメンバー文のメンバー（`:` の後ろにあります）。
- クラス宣言のメンバー、複合状態の本体、別名状態の本体
  （`{` が開きます）。
- ER 図の実体の属性（`{` が開きます）と、
  サブグラフの題（`[` が開きます）。
- メッセージのテキスト（その `:` の後ろにあります）。
- 参加者の別名（その `as` の後ろにあります）。
- 複合状態と別名状態の本体の前のテキスト
  （本体の `{` の前にあるトークンのうち、ノード自身の語を除くすべてです）。
- 1 行のノートのテキスト。
  空白が 2 つ以上前にある `:` で始まります。
  空白は、ディレクティブと、行の規則が無視する `;` を飛ばして数えます
  （diagrams/state.md の The note contexts）。

`{` か `[` で書く列は、空でも null ではないので、
`{` か `[` がないのに null でない列も報告します。

検査しないものがあります。

- 行の規則が無視する `;` のすべてに、
  `IgnoredSemicolon` のトークンがある、という条件。
  行の規則を 2 か所に書かないために、トークンは与えられたものとして扱い、
  その正しさは Db の比べに任せます。

## テスト

`tests/check-tree-corpus.test.ts` は、コーパスの記録した木をすべて検査し、
その中のすべてのノードの型が、値のノードか否かに分けられていることを確かめます。
表のすべてのノードの型に記録した木を求めるテストは、
コーパスのすべての図種の記録した木を読みます。
`check-tree-gantt.test.ts` と `check-tree-journey.test.ts` は、
記録した木を壊してトークンの種類と範囲を調べ、
その図種の文を 1 つずつ含む最小の木を手作りします
（手作りの木とその壊し方は `tests/check-tree-built.ts` が作ります。
journey のファイルは 14 本作ります）。
`check-tree-node-ranges.test.ts` は、click 文の子の欄の順を
手作りの木で調べます。
`check-tree-requirement.test.ts` は、上の文を 1 つずつ含む最小の木を手作りし、
その文が区別する壊し方のそれぞれで、検査が報告すべき問題を確かめ、
名前を挙げた fixture の記録した木も壊します。
`check-tree-mindmap.test.ts` は、mindmap 図の文について同じことを、
手作りの木と、名前を挙げた fixture の記録した木でします。
記録した木は、トークンの種類と範囲についても壊します。
また、検査の表が ast/mindmap.md の Type と Meaning の列と合うことを求めます。
`check-tree-timeline.test.ts` は、timeline 図の文について同じことを、
手作りの木と、名前を挙げた fixture の記録した木でします。
記録した木は、トークンの種類と範囲についても壊します。
また、検査の表が ast/timeline.md の Type と Meaning の列と合うことを求めます。
`check-tree-sankey.test.ts` は、sankey 図の上の文を持つ最小の木を手で作り、
文が分ける壊し方のそれぞれで壊して、検査が報告すべき問題を確かめ、
検査の表が ast/sankey.md の Type の列と合うことを求めます。
`check-tree-xychart.test.ts` は、xychart 図の上の文を持つ最小の木を手で作り、
文が分ける壊し方のそれぞれで壊して、検査が報告すべき問題を確かめ、
検査の表が ast/xychart.md の Type と Meaning の列と合うことを求めます。
また、名前を挙げた fixture の記録した木を壊して、
トークンの種類、並び、向き、種類、`closed`、範囲の検査を確かめます。
`check-tree-quadrant.test.ts` は、上の quadrant chart の文を持つ最小の木を、
`parser/docs/tokens/quadrant.md` の種類と並びのトークンで手で作り、
文が分ける壊し方のそれぞれで壊して、検査が報告すべき問題を確かめ、
検査の表が ast/quadrant.md の Type と Meaning の列と合うことを求めます。
名前を挙げた fixture の記録した木でも、トークンの種類と順序、象限の番号、
軸、矢印、ラベルの種類、タイトルの値、範囲を壊して確かめます。
`check-tree-kanban.test.ts` も名前を挙げた記録済みの木を壊して、
トークンの種類、切られた文字列とデータの断片、字下げ、
テキストと形の欠落、形の終わり、ラベルの種類、保たれる空白、
隣接するデータブロックの順序、ノードの範囲を確かめます。
`check-tree-nesting.test.ts` は treeview・treemap・kanban の
入れ子の木を手で作り、
親、子の順、leaf の子、kanban の2段構造、前置 gap の所有、
兄弟の重なり、所有構文や最後の子孫を含まない範囲を壊します。
対照では外側の文と装飾を body に保ちます。
各図のテストでも引き続き、
既存の名前待ち、注釈、ブロックの gap の優先を確かめます。
`check-tree-string-tokens.test.ts` は、flowchart、class、state、ER、sankey の
名前を挙げた fixture の記録した木で、最初の文字列のトークンの種類を変え、
文字列のトークンの検査がそれを報告することを求めます。
ノードの型や欄ごとに記録した木を求めるテストは、
`NODE_TYPE_PREFIXES_WITHOUT_RECORDED_TREES`
（`tests/check-tree-recorded.ts`）の接頭辞で始まる名前のノードの型を除きます。
これは、木がまだ記録されていない新しい図種の一覧で、
木が記録されたら接頭辞を外し、図種の間は空のままにします。
`tests/check-tree-fields.test.ts` は、上の段落のテストです。
記録した木を 1 度だけ読み、
各ノードの型を持つ最初の木と、
各欄が null である最初の木と null でない最初の木の索引を作り、
その索引が示す木で各欄を壊します。
その欄を持つ記録した木ならどれでもかまいません。
欄が起こすべき問題のメッセージが、どの木でも同じだからです。
また、null になりうる文字列の各欄の両方向と、
`null-fields.ts` の各規則と、
メッセージにトークンの位置を含む box のテキストの 2 つの部分に、
名前を付けた場合を持ちます
（fixture、型、欄、そのノードの問題の正確なメッセージ）。
`:` の前の空白が 2 つのノートの記録した木から手で作る、
空白が 1 つで、テキストが null で、検査が受け入れるべき 3 つのノートもあります。
`tests/check-tree-values.test.ts` は、値の規則のテストです。
値を持つ各ノードの型で、値の両端に 1 字を足し、両端から 1 字を落とし、
そうして作った値がすべて、そのノードで、
その型の規則のメッセージとともに報告されることを求めます。
規則は、書かれたテキストか、つないだトークンで、
class 図と ER 図のスタイルは後者です。
端に空白を持つトークンがある、値を持つ各ノードの型には、
名前を付けた場合（fixture、トークン、側、正確な問題）を持ち、
記録した木のそのトークンの端から空白を取って、その問題を求めます。
ほかの型には、その型のノードの中のトークンが端に空白を持たない fixture を、
理由とともに挙げます。
すべての型がどちらかであることも求めます。
コメント行が切る図のコメントの fixture も名前で挙げます。
コメントが line feed で終わる 8 つと、
CRLF、単独の CR、テキストの終わりで終わるものが 1 つずつです。
記録した木が受け入れられることを求め、
CRLF と単独の CR では、別の行終端子を持つ値が、
正確なメッセージで報告されることを求めます。
`tests/check-tree-comments.test.ts` は、図のコメントとコメント行が
line feed、CRLF、単独の CR、テキストの終わりで終わる木を手で作り、
行終端子の後ろで終わる範囲が報告されることを求めます。
`tests/check-tree-cut-tokens.test.ts` は、名前を付けた場合の一覧です。
各場合は、名前を挙げた fixture の記録した木を取り、
そのトークンの 1 つの中に、
ディレクティブ、または行の規則が無視する `;` を、1 回から 3 回書きます。
そのトークンを切る parser が記録するとおりに木を作り直します。
場合は、`Identifier`、`Numeric`、
`Keyword`（各図種で 2 つの断片に、flowchart では 3 つと 4 つにも）、
`Punctuator`（各図種で 2 つの断片に、flowchart では 3 つにも。
sequence、class、state、ER の断片は、その図種が持たないテキストです）、
`String` トークンに切った `String` で、
どれもディレクティブか `;` で切ります。
どの場合でも、場合の名前が挙げる条件の問題を、
場所とメッセージを正確に報告することを求め、
fixture の元の木に問題がないことも求めます。
`String` を `StringFragment` のトークンに、`RawText` を `RawText` のトークンに
切った木は、ディレクティブでも `;` でも、複数の図種で、
問題がまったくないことを求めます。
同じファイルは、`:::` の断片の連続に、
切れ目が前に `)`、後ろに `(`、または両方をつないだ木を手で作り、
`:::` の連続の問題が 1 つだけあることを求めます。
切れ目が分ける `)` と `(` には、問題がないことを求めます。
`tests/check-tree-keywords.test.ts` は、`Keyword` のテキストの表が、
各図種の行の語と、その行がテキストを挙げずに名前で示す単位のテキストで、
それ以外を含まないことと、
記録した木のすべての `Keyword` トークンを持つことを求めます。
また、2 つ、3 つ、4 つの `Keyword` の断片の木を手で作ります。
`tests/check-tree-punctuators.test.ts` は、`Punctuator` のテキストの表と
形の表が文書と合うことを求めます。
また、図種が持たない `Punctuator` のテキストの検査を、
手で作った木で各図種について確かめます。
`tests/check-tree-flowchart.test.ts` は、
検査が知る flowchart のヘッダーの方向が、仕様の規則のものと合うことを求めます。
`tests/check-tree-cut-whitespace.test.ts` は、
名前を付けたフィクスチャから 1 つずつ、
切れ目に接する `RawText` または `StringFragment` のトークンを取り、
切れ目に接する側の空白を取ります。
ケースは、側（切れ目の前、後）、切れ目の種類
（ディレクティブ、コメント領域、行の規則が無視する `;`）、
トークンの種類（`RawText`、`StringFragment`）ごとに 1 つです。
そうして作った木を検査が報告することを、
値のメッセージ（トークンをつないだテキストが書かれたテキストと違う）で求めます。
無視されるテキストには、ディレクティブとコメント領域の場合が 1 つずつあり、
切れ目の隣の空白がどのトークンにもないというメッセージで求めます。
さらに、記録した木 1 つずつから、ほかの例外の否定の例を 2 つ作ります。
1 つは、前のトークンが接していないのに、
先に始まった値の中で空白から始まるトークンです。
もう 1 つは、値の途中で空白で終わる空白のトークンで、
後ろにトークンが続かないものです。
検査はそれぞれを、そのメッセージで報告しなければなりません。
`tests/check-tree-node-types.test.ts` は、検査のノードの型の表が、
仕様の木の文書が定めるノードの型を分類し、それ以外を分類しないことを求めます。
`tests/check-tree.test.ts` と `tests/check-tree-*.test.ts` は、
木を 1 つの条件ずつ壊し、検査がそれを報告することを求めます。
すべての木が満たす条件
(位置、すべての文字が置かれること、トークンの順序、切れ目、コメント、
ディレクティブ、frontmatter) を壊すものは、おもに手で作った木に行います
(`check-tree.test.ts`、`check-tree-comments.test.ts`、
`check-tree-cut-units.test.ts`)。
木の形、フィールドと値、トークンの端の空白、リテラル、図種の条件を壊すものは、
記録した木に行い、図種の条件は名前を挙げた fixture の記録した木に行います。
