# Usecase formatting rules

英語版: [usecase.md](./usecase.md)

[usecase の仕様](../../spec/docs/diagrams/usecase.ja.md)と、
[書かれた構文の木](../../spec/docs/ast/usecase.ja.md)に従い、
`usecase-beta` を整形します。
各規則は選択の理由を説明し、共有の理由を参照し、
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
class の未完のバッククォート名の EOF 規則は適用しません。 [corpus fixture: usecase/header-uppercase]
[corpus fixture: usecase/gram-two-statements-line]
[corpus fixture: usecase/gram-entity-as-alias]
[corpus fixture: usecase/gram-arrow-chain]
[corpus fixture: usecase/gram-boundary-nested]
[corpus fixture: usecase/gram-note-unresolved]
[corpus fixture: usecase/gram-metadata-unknown-key]
[corpus fixture: usecase/lex-plain-unclosed]
[corpus fixture: usecase/lex-native-single-quote-comment-region-lf]

受理する乖離は、
[互換性](./compatibility.ja.md#usecase-native-syntax-and-authored-values)の指定の読みに従います。
既存の識別子は `directive-as-token-boundary`、
`ignored-semicolon-as-token-boundary`、`html-tag-in-frontmatter`、
`embedded-data-opaque`、`c4-keyword-anywhere`、
`bare-percent-line-before-header` の六つです。
すべての `div-` 入力を受理するわけではありません。
拒否と印付きのケースを含む全コーパスを、
共有の整形とコーパスのテストで検査します。
元の Mermaid が拒否した場合、
元の Db はありません。 [corpus fixture: usecase/div-directive-in-id]
[corpus fixture: usecase/div-semicolon-identifier-selected]
[corpus fixture: usecase/div-html-frontmatter-acc-title-db]
[corpus fixture: usecase/div-gram-json-unquoted-key]
[corpus fixture: usecase/div-detect-c4-label]
[corpus fixture: usecase/div-comment-preheader-bare]

## Rules

### Header

[C4](./c4.ja.md#header) と同じく、図の始まりを見つけやすくするため、
正確な小文字の `usecase-beta` を先頭列に置き、本文を次の行から置きます。
外側の ASCII 空白とタブを除き、方向は独立した文のままにします。
ヘッダーだけの入力も受理し、通常の末尾改行を加えます。
大文字、安定版の名前、同じ行の本文を持つ拒否入力は、共有の失敗経路に従います。
前のコメントと directive は後述の規則に従います。

[fixture: header/header-column]
[fixture: header/leading-trivia-empty]
[corpus fixture: usecase/spec-usecase-parser-7ae00acb]

入力（エスケープ表記）:
`" \tusecase-beta  \nA"`

出力 ([header/header-column-output.mmd](../tests/fixtures/usecase/header/header-column-output.mmd)):

```mmd
usecase-beta
  A
```

### Indentation

所属を見える形にするため、
[class の字下げ](./class.ja.md#indentation)を再利用します。
ヘッダーの下を設定の 1 段、境界内の宣言を 2 段とし、
`end` は開始文に揃えます。 [fixture: system-boundaries/boundary-header-comment-empty]
1 段は `tabWidth` と `useTabs` に従い、既定は空白 2 個、
タブを使う場合は各段に 1 個です。
usecase では字下げが読みを決めないので、`tabWidth: 0` は 0 のままです。
accessibility は先頭列でも ASCII 空白の後でも accessibility のままです。
YAML は共有の最小幅 1 を保ちます。
値、JSON、
directive の継続行は書かれた列を保ちます。 [fixture: native-metadata/metadata-key-multiline-directive]
[fixture: native-metadata/metadata-scalar-multiline-directive]
[fixture: classes-and-styles/css-name-multiline-directive]
[fixture: json-tables/json-prefix-id-at-multiline-directive]

[fixture: indentation/indent-depth]
[fixture: indentation/indent-four]
[fixture: indentation/indent-tabs]
[fixture: indentation/indent-zero]
[fixture: indentation/indent-zero-a11y]
[fixture: indentation/indent-zero-tabs]
[fixture: indentation/boundary-comments-before-end]
[fixture: indentation/zero-tabs-boundary]
[fixture: indentation/value-and-json-columns]

入力（エスケープ表記）:
`"usecase-beta\nsystemBoundary Portal\nactor User\nTask(Work)\nend\nUser-->Task"`

出力 ([indentation/indent-depth-output.mmd](../tests/fixtures/usecase/indentation/indent-depth-output.mmd)):

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
[C4 の保持部分の規則](./c4.ja.md#line-rule-and-semicolons)を再利用し、
選択された末尾のものも含め、すべてのセミコロンを残します。
末尾の削除で Db が等しい場合も、一つの方針で共有の文字列規則の選択先を保ちます。
各区間の最初の非空白文字から最後のセミコロンまでを保持し、境界をまたぐ値、
CSS 宣言、コメント、directive は全体を含めます。
外側の字下げと安全な後続部分は整形します。 [fixture: native-metadata/metadata-selected-semicolon-between-properties]
二つの文字列処理、コロンとハッシュの間の空白の有無、 Unicode の区間境界、
未完 directive を止めるセミコロンの読みを保ちます。

[fixture: statements-and-semicolons/statements-lines]
[fixture: statements-and-semicolons/semicolon-label-content]
[fixture: statements-and-semicolons/semicolon-selected-boundary]
[fixture: statements-and-semicolons/semicolon-selected-retarget-kept]
[fixture: statements-and-semicolons/safe-suffix-after-kept-value]
[fixture: statements-and-semicolons/selected-directive-prefix]

入力（エスケープ表記）:
`"usecase-beta\n actor  Reader\nRead(Inspect)\nReader-->Read"`

出力 ([statements-and-semicolons/statements-lines-output.mmd](../tests/fixtures/usecase/statements-and-semicolons/statements-lines-output.mmd)):

```mmd
usecase-beta
  actor Reader
  Read(Inspect)
  Reader --> Read
```

### Declarations

[ER の要素の配置](./er.ja.md#entities)を再利用します。
`actor` の後は空白 1 個、id と形の区切り、metadata と class の接尾辞は詰め、
ラベルの外側の ASCII 空白を除き、actor の項目はコンマと空白で区切ります。
stereotype の隙間は、[class に揃えた規則](#stereotypes)に従います。
明示 id、引用だけの名前、楕円と長方形の綴り、ラベルの種類、接尾辞の順序、
宣言と参照のすべての出現を保ちます。
生成 id や解決後の actor を、書かれた端点の代わりにはしません。
境界内の metadata 形式は宣言、最上位の形式は更新のままです。
別名や形を作らず、書かれた構文を見える形にします。

[fixture: declarations/actor-list]
[fixture: declarations/entity-shapes]
[fixture: declarations/suffixes]
[fixture: declarations/generated-name]
[fixture: declarations/shape-change-kept]
[fixture: declarations/reference-not-redeclared]
[fixture: declarations/actor-source-occurrence]

入力（エスケープ表記）:
`"usecase-beta\nactor  User ( Person ) , Clerk('Desk') , \"Guest\""`

出力 ([declarations/actor-list-output.mmd](../tests/fixtures/usecase/declarations/actor-list-output.mmd)):

```mmd
usecase-beta
  actor User(Person), Clerk('Desk'), "Guest"
```

### Labels

[C4 の値の形式](./c4.ja.md#argument-forms)と同じく、裸、一重引用、二重引用、
markdown のラベルは綴りと内部の文字を保ちます。
空の引用値も残します。
通常の引用と裸の文字列で Db が等しくても、
作者の形式を保つことで不要な書き換えを避けます。
markdown はラベルの種類も変えます。
裸のラベルを構成する単位の外側にある ASCII の水平空白だけを除きます。
内部の空白、Unicode の余白、バックスラッシュ、entity、HTML は保ち、
`singleQuote` で native 文字列を書き換えません。

[fixture: labels/label-quote-kinds]
[fixture: labels/label-empty-quotes]
[fixture: labels/label-quote-rewrite-kept]
[fixture: labels/label-quote-remove-kept]
[fixture: labels/label-interior-kept]
[fixture: labels/label-backslash-kept]
[fixture: labels/label-html-entities]
[fixture: labels/div-c4-label]
[fixture: labels/label-markdown-remove-kept]
[test: usecase: label-unicode-padding]
[fixture: labels/single-quote-option]
[fixture: labels/empty-shape-labels]
[corpus fixture: usecase/div-c4-inline-percent-eof]

入力（エスケープ表記）:
``"usecase-beta\nA(unquoted  words)\nB(' single  text ')\nC(\" double  text \" )\nD(\"` markdown  text `\")"``

出力 ([labels/label-quote-kinds-output.mmd](../tests/fixtures/usecase/labels/label-quote-kinds-output.mmd)):

```mmd
usecase-beta
  A(unquoted  words)
  B(' single  text ')
  C(" double  text ")
  D("` markdown  text `")
```

### Stereotypes

[class の文に付く注釈](./class.ja.md#whitespace-between-tokens)の隙間を再利用します。
各区切りの内側の空白の有無を保ち、あれば ASCII 空白 1 個に縮めます。
`<<a>>` はそのまま、`<<  a  >>` は `<< a >>` になります。
左右を別々に扱い、空白は足しません。
`<<` の前も同じ class の規則に従い、接していれば接したまま、
空白があれば ASCII 空白 1 個に縮めます。 [fixture: stereotypes/opener-gap-sides]
[test: usecase: stereotype-opener-tab]
actor と use case の両方に適用し、
関係の端点や systemBoundary 内の宣言も同じです。
Mermaid は内部の両端を除き、`<<` の前の空白は構造上の空白です。
どちらの整え方も Db を保つため、
共有の規則に揃えます。 [fixture: stereotypes/stereotype-inner-kept]
[fixture: stereotypes/stereotype-padding]
[fixture: stereotypes/declaration-suffixes]
[fixture: stereotypes/side-padding]
[fixture: stereotypes/endpoint-suffixes]
[fixture: stereotypes/boundary-suffixes]

内部のテキストは書かれたままです。
語の間の隙間、入れ子の開始記号、引用、バックスラッシュ、句読点、
directive を保ちます。
LS、PS、NBSP は内部の内容になれます。
外側の共通空白は余白の規則に従います。 [fixture: stereotypes/stereotype-plain-backslash]
[fixture: stereotypes/directive-padding]
[fixture: stereotypes/directive-gap-sides]
[test: usecase: stereotype-unicode-exterior-padding]
[test: usecase: stereotype-unicode-gap-sides]
保護した共通コメント領域とセミコロンの接頭部は、
交差する値を余白も含めて全体のまま保ちます。 [fixture: stereotypes/semicolon-padding-kept]
[test: usecase: stereotype-comment-region-padding-kept]
物理的な複数行、空、
未完の拒否入力は修復しません。 [corpus fixture: usecase/gram-stereotype-newline]
[corpus fixture: usecase/gram-stereotype-empty]
[corpus fixture: usecase/gram-stereotype-open]

[fixture: stereotypes/stereotype-padding]
[fixture: stereotypes/stereotype-inner-kept]
[fixture: stereotypes/stereotype-punctuation]
[fixture: stereotypes/directive-and-selected-semicolon]

入力（エスケープ表記）:
`"usecase-beta\nactor User <<  service  user  >>"`

出力 ([stereotypes/stereotype-padding-output.mmd](../tests/fixtures/usecase/stereotypes/stereotype-padding-output.mmd)):

```mmd
usecase-beta
  actor User << service  user >>
```

### System boundaries

開始文、宣言の本文、揃えた `end` を別々の行に置きます。
空の境界や空の引用名も同じです。 [fixture: system-boundaries/boundary-header-comment-empty]
[flowchart の見出し](./flowchart.ja.md#subgraph-header)の選択を再利用します。
id とタイトルの隙間は、あれば空白 1 個にし、接していれば接したままにします。
丸括弧と角括弧、
および内部の余白は書かれたままです。 [fixture: system-boundaries/boundary-id-title-directed-gap]
タイトルの余白を詰めても Db は等しいですが、
見出しを flowchart と揃えることで別の方針を増やしません。
native metadata、class、繰り返しの宣言を保ち、
所属は AST の 1 段の宣言本文から決めます。

[fixture: system-boundaries/boundary-headings]
[fixture: system-boundaries/boundary-empty]
[corpus fixture: usecase/db-empty-boundary-id]
[fixture: system-boundaries/boundary-title-touch]
[fixture: system-boundaries/empty-quoted-name-members]
[fixture: system-boundaries/repeated-boundaries]
[fixture: system-boundaries/quoted-markdown-title]

入力（エスケープ表記）:
`"usecase-beta\nsystemBoundary Box [ Display ] @{ type : 'package' } ::: box , group\nactor User\nA@{ business : true }\nend"`

出力 ([system-boundaries/boundary-headings-output.mmd](../tests/fixtures/usecase/system-boundaries/boundary-headings-output.mmd)):

```mmd
usecase-beta
  systemBoundary Box [ Display ]@{ type: 'package' }:::box,group
    actor User
    A@{ business: true }
  end
```

### Arrows

読みやすい [class の矢印間隔](./class.ja.md#arrow-spacing)を再利用し、
実際の usecase 演算子全体の両側を通常の空白 1 個にします。
方向、マーカー、大小文字、ダッシュと点の数を保ちます。
Db の長さが固定される分割矢印の長い右半分も同じです。
意味を持つ演算子は `..>:InClUdE` または書かれた extend の大小文字で詰め、
端点の前を空白 1 個にします。
コロンとキーワードは演算子の構文です。 [fixture: arrows/semantic-operator-directives]
大小文字を揃えて Db が等しくても、共有の方針に従い作者の綴りを保ちます。
端点の交換や演算子の種類の変換はしません。

[fixture: arrows/arrows-solid]
[fixture: arrows/arrows-markers]
[fixture: arrows/arrows-semantic]
[fixture: arrows/arrows-length-kept]
[fixture: arrows/arrows-source-order-kept]
[fixture: arrows/arrows-semantic-case-kept]
[fixture: arrows/arrows-generalization-actors]
[fixture: arrows/extended-split-lengths]

入力（エスケープ表記）:
`"usecase-beta\nA..>:InClUdE B\nB..> : EXTEND C\nC--|>D"`

出力 ([arrows/arrows-semantic-output.mmd](../tests/fixtures/usecase/arrows/arrows-semantic-output.mmd)):

```mmd
usecase-beta
  A ..>:InClUdE B
  B ..>:EXTEND C
  C --|> D
```

### Arrow id boundaries

矢印と端点は AST が実際に記録したとおりに空白を置きます。
`A --order` は `A --o rder`、`A -- order` は `order` を保ちます。
前向きの `--o` と `--x` は語境界を調べずにマーカーなしの `--` より先に読むため、
その単位の中に隙間を足したり消したりすると読みが変わります。
長いマーカーなしのダッシュ列と大文字の O、X も記録された端点を保ちます。
完全な単位の境界の directive は、
両側の隙間の有無を保ちます。 [fixture: arrow-id-boundaries/arrow-marker-both-gap-sides]
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

入力（エスケープ表記）:
`"usecase-beta\nStart --order\nrder@{business:true}\nclass rder current"`

出力 ([arrow-id-boundaries/circle-prefix-suffixes-output.mmd](../tests/fixtures/usecase/arrow-id-boundaries/circle-prefix-suffixes-output.mmd)):

```mmd
usecase-beta
  Start --o rder
  rder@{ business: true }
  class rder current
```

### Relationship labels and ids

[flowchart の辺ラベルの形式](./flowchart.ja.md#link-label-form)を保つ考え方と、
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

入力（エスケープ表記）:
``"usecase-beta\nA--  likes  -->B\nB<--'uses'--C\nC o-- part --- D\nD x--\"`blocks`\"----E"``

出力 ([relationship-labels-and-ids/split-labels-output.mmd](../tests/fixtures/usecase/relationship-labels-and-ids/split-labels-output.mmd)):

```mmd
usecase-beta
  A -- likes --> B
  B <-- 'uses' -- C
  C o-- part --- D
  D x-- "`blocks`" ---- E
```

### Native metadata

native metadata は解析と検証を行う構文です。
構造の空白だけを整え、対象と `@{` は詰め、プロパティのコロンの前は詰め、
後は空白 1 個、同じ行のコンマの後と波括弧の内側も空白 1 個にします。
空の場合は `@{ }` です。
キーと値の綴り、引用の種類、整数風の文字列、真偽値、順序、重複、独立した更新、
区切り、
末尾コンマを保ちます。 [fixture: native-metadata/metadata-key-multiline-directive]
[fixture: native-metadata/metadata-scalar-multiline-directive]
YAML や flowchart、Agentflow の不透明な metadata の整形は当てはまりません。

最初のプロパティが開始行にあるか次行にあるかを保ちます。 [fixture: native-metadata/metadata-first-gap-standalone-directive]
通常のプロパティ、コメント、directive の行は含む文より 1 段深くし、
独立した閉じ波括弧はその文に揃えます。 [fixture: native-metadata/metadata-comma-comment-close]
[fixture: native-metadata/metadata-closer-directive-own-line]
metadata のすべての空行と、コンマか改行かの区切りを保ちます。
キー、コロン、
値からなる一つのプロパティ内に改行を挿入しません。 [fixture: native-metadata/metadata-first-gap-standalone-directive]
[fixture: native-metadata/metadata-selected-semicolon-between-properties]
native の検証や宣言と更新の役割を変えず、構造を読みやすくします。

共通コメント領域と改行の処理後、最後のプロパティから `}` までの、
末尾コンマと物理改行の合計は 2 個以下で、コンマは改行の前にだけ置けます。
受理される末尾では、
書かれた改行と空行を保ちます。 [corpus fixture: usecase/gram-metadata-property-comma-no-newline]
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
プロパティ間のコンマの後は、
改行を 0 個以上置けます。 [corpus fixture: usecase/gram-metadata-property-comma-no-newline]
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

入力（エスケープ表記）:
`"usecase-beta\nactor U @{\n type : hollow\n , business : true,\n}"`

出力 ([native-metadata/metadata-newline-output.mmd](../tests/fixtures/usecase/native-metadata/metadata-newline-output.mmd)):

```mmd
usecase-beta
  actor U@{
    type: hollow
    , business: true,
  }
```

### JSON tables

[不透明なデータの保持](./compatibility.ja.md#embedded-data-is-not-checked) を再利用します。
`@`、`{` の前の隙間、本文の全文字、
閉じ括弧を含む JSON データ範囲全体を保ちます。
外側の json と id の隙間、および class の接尾辞だけを整え、
データの前は通常の空白 1 個にします。 [fixture: json-tables/json-prefix-id-at-multiline-directive]
入れ子、重複、整数キーの順序、数とエスケープ、コメント風の文字、
継続列を保ちます。
JSON の整形で Db が等しくても、不透明な原文を書き換えることになります。
キーの並べ替えは `propertyOrder` を変える場合があります。
釣り合った不正な内容は指定の不透明な読み、括弧の釣り合いの失敗は拒否のままです。
Db の検査は共有のデータブロックの経路に従います。
効果を渡さない整形 fixture の比較は null とし、
書かれた埋め込み文字列を比較します。
コーパスは、存在する場合に記録済みの効果を使います。

[fixture: json-tables/json-opaque]
[corpus fixture: usecase/gram-json-prefix-id-control]
[fixture: json-tables/json-invalid-opaque]
[fixture: json-tables/json-order-kept]
[fixture: json-tables/json-directive-opaque]
[fixture: json-tables/numbers-escapes-and-comment-text]
[fixture: json-tables/empty-prefix-gap]

入力（エスケープ表記）:
`"usecase-beta\njson  Table  @ {\n \"2\": 2, \"1\": {\"z\":1}, \"2\": 3\n} ::: data , table"`

出力 ([json-tables/json-opaque-output.mmd](../tests/fixtures/usecase/json-tables/json-opaque-output.mmd)):

```mmd
usecase-beta
  json Table @ {
 "2": 2, "1": {"z":1}, "2": 3
}:::data,table
```

### Classes and styles

[ER の class 一覧](./er.ja.md#styles-and-classes)を再利用し、
対象名と class 名の間のコンマは詰め、
一覧同士と最初の宣言の前は空白 1 個にします。
CSS 宣言同士はコンマと空白で区切ります。
各 CSS 宣言は、名前の始まりから最後の値の成分まで書かれたままです。
Mermaid はコロンの前後と `--  color` 内の余白を保存するため、
空白を捨てる ER の CSS の読みとは異なります。
タブ、ダッシュの隙間の directive、引用またはエスケープしたコンマ、空文字の成分、
関数、順序、
繰り返しを保ちます。 [fixture: classes-and-styles/css-name-multiline-directive]
最後の成分の外側の水平空白だけを除き、
選択されたセミコロンの保持部分は通常の一覧配置より優先します。

[fixture: classes-and-styles/class-lists]
[fixture: classes-and-styles/css-colon-padding]
[fixture: classes-and-styles/css-post-colon-trim-kept]
[fixture: classes-and-styles/css-custom-gap]
[fixture: classes-and-styles/css-custom-gap-remove-kept]
[fixture: classes-and-styles/css-value-internal]
[corpus fixture: usecase/gram-css-empty-string-component]
[fixture: classes-and-styles/css-gap-directive]
[fixture: classes-and-styles/css-semicolon-gap]
[corpus fixture: usecase/lex-style-hash-semicolon]
[fixture: classes-and-styles/css-pre-colon-trim-kept]
[fixture: classes-and-styles/css-classdef-gap]
[fixture: classes-and-styles/css-line-rule-colon-gap-kept]
[fixture: classes-and-styles/css-both-passes]
[test: usecase: css-other-case-segment]
[fixture: classes-and-styles/declaration-order-and-repetition]
[fixture: classes-and-styles/css-functions]
[fixture: classes-and-styles/css-inline-percent]
[fixture: classes-and-styles/trailing-after-comma]

入力（エスケープ表記）:
`"usecase-beta\nA\nstyle  A   fill   :  red   ,  stroke-width : 2px  "`

出力 ([classes-and-styles/css-colon-padding-output.mmd](../tests/fixtures/usecase/classes-and-styles/css-colon-padding-output.mmd)):

```mmd
usecase-beta
  A
  style A fill   :  red, stroke-width : 2px
```

### Notes

`note for <target> <label>` の各部分の間を通常の空白 1 個にします。
対象、書かれた裸、通常引用、markdown、空のラベル、および note の順序を保ちます。
[class の note](./class.ja.md#whitespace-between-tokens)と同じ、
値の原文と読みやすいキーワード間隔を保つ理由です。
前方参照の解決で id、位置、宣言を作りません。
行内のパーセント文字はラベルの内容のままです。

[fixture: notes/notes-forms]
[fixture: notes/notes-forward]
[fixture: notes/notes-empty-markdown]
[fixture: notes/empty-and-markdown-order]

入力（エスケープ表記）:
`"usecase-beta\nA\nnote  for  A'quoted note'\nnote for A bare  note %% literal"`

出力 ([notes/notes-forms-output.mmd](../tests/fixtures/usecase/notes/notes-forms-output.mmd)):

```mmd
usecase-beta
  A
  note for A 'quoted note'
  note for A bare  note %% literal
```

### Direction and accessibility

方向は `direction <書かれた値>` とし、TD と全出現を保ちます。
最終的な方向から文を作り直しません。
[class のラベル](./class.ja.md#labels)と [C4 の accessibility 行](./c4.ja.md#accessibility-lines)を再利用し、
コロンをキーワードに接し、両端の空白を除いた値の前を空白 1 個にします。
Db が同じになる外側の空白を、兄弟の図種と同じ形に揃えるためです。
内部の文字と空白、コメント、directive、パーセントとセミコロンを保ちます。
空と空白だけの行は、値のないコロン形式にします。
次の物理行は別の文のままで、兄弟の次行の結合は取り込みません。
空のコロン行の次の方向の文字も、
値の文字ではなく独立した方向文のままです。 [fixture: direction-and-accessibility/title-next-direction-separate]
[fixture: direction-and-accessibility/description-next-direction-separate]
[fixture: direction-and-accessibility/a11y-trimmed]
[test: usecase: a11y-unicode-exterior]

説明ブロックは、 [class の複数行の値](./class.ja.md#multi-line-values)と同じく、
本文の行と列を保ち、独立した `}` を文の字下げに揃えます。
語と波括弧の隙間には、
[flowchartのトークンの間の空白](./flowchart.ja.md#トークンの間の空白)を、
同じ理由で再利用します。
Mermaidがトークンを読むために要する接触を、共通の隙間の規則で保つためです。
このDbが同じ形からの選択でusecase固有の理由はありません。
`accDescr{ a }`は接したまま、
空白1つ・空白列・タブは空白1つにします。 [fixture: direction-and-accessibility/keyword-brace-touching]
[fixture: direction-and-accessibility/keyword-brace-space]
[fixture: direction-and-accessibility/keyword-brace-run]
[test: accessibility revisions: usecase keyword-brace-tab]
空と空白だけの内部は`{}`にし、外側の隙間はその規則に従います。
書かれた原文を保つ共有コメント領域とセミコロンの規則は、そのまま優先します。
usecase の字下げは構造の表示なので、
幅 0 とタブにも同じ配置を使います。 [fixture: direction-and-accessibility/a11y-closer-aligned]
[fixture: direction-and-accessibility/a11y-closer-tabs]
[fixture: direction-and-accessibility/a11y-closer-zero]
[fixture: direction-and-accessibility/a11y-directive-padding]

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

入力（エスケープ表記）:
`"usecase-beta\ndirection  TD\nA\ndirection\tBT\ndirection RL"`

出力 ([direction-and-accessibility/direction-values-output.mmd](../tests/fixtures/usecase/direction-and-accessibility/direction-values-output.mmd)):

```mmd
usecase-beta
  direction TD
  A
  direction BT
  direction RL
```

入力（エスケープ表記）:
`"usecase-beta\naccDescr{ a }\nA[Keyword gap]"`。

出力 ([direction-and-accessibility/keyword-brace-touching-output.mmd](../tests/fixtures/usecase/direction-and-accessibility/keyword-brace-touching-output.mmd)):

```mmd
usecase-beta
  accDescr{ a }
  A[Keyword gap]
```

### Blank lines

[class の空行](./class.ja.md#blank-lines)を再利用し、
通常の空行の連続を 1 行にし、図と境界の本文の両端の空行を除きます。
1 行でまとまりを区切れ、それ以上は意味を加えないためです。
ASCII 空白とタブだけの行も通常の空行です。
裸の native コメントの後や、独立した directive の前後も同じです。
値、native metadata、JSON、directive、保護された共通領域の結合は、
それぞれの空行を保ちます。
C4 の復帰用の隙間や Ishikawa の空行の対の規則は取り込みません。

[fixture: blank-lines/blank-runs]
[fixture: blank-lines/blank-boundary]
[fixture: blank-lines/blank-comments]
[fixture: blank-lines/blank-in-value]
[fixture: blank-lines/directives-and-boundary-edges]

入力（エスケープ表記）:
`"usecase-beta\nsystemBoundary Box\n\nactor U\n\n\nA\n\nend"`

出力 ([blank-lines/blank-boundary-output.mmd](../tests/fixtures/usecase/blank-lines/blank-boundary-output.mmd)):

```mmd
usecase-beta
  systemBoundary Box
    actor U

    A
  end
```

### Comments

[独立したコメントの配置](./class.ja.md#comments)を再利用します。
周囲の文、境界の `end` の前では宣言に揃え、ヘッダー前では先頭列に置きます。
末尾の水平空白を含むコメント全体を保ちます。 [fixture: system-boundaries/boundary-header-comment-empty]
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

[fixture: comments/comments-align]
[fixture: comments/comments-bare]
[fixture: comments/comments-inline-label]
[test: usecase: comment-region-join]
[corpus fixture: usecase/div-comment-preheader-bare]
[fixture: comments/div-preheader-braces]
[fixture: comments/inline-note-css-accessibility]
[fixture: comments/common-region-inside-values]

入力（エスケープ表記）:
`"usecase-beta\n%%\n%%{}%%\nA"`

出力 ([comments/comments-bare-output.mmd](../tests/fixtures/usecase/comments/comments-bare-output.mmd)):

```mmd
usecase-beta
  %%
  %%{}%%
  A
```

### Directives

[共有の directive の付着](./class.ja.md#directives)を再利用します。
除去は区切りを補いません。
内容、順序、接している関係、複数行の列を保ち、独立した directive は揃えます。
無害な外側の水平空白だけをまとめます。 [fixture: system-boundaries/boundary-id-title-directed-gap]
[fixture: arrows/semantic-operator-directives]
[fixture: arrow-id-boundaries/arrow-marker-both-gap-sides]
ヘッダー行の directive はヘッダーと同じ行に残します。
値側の隙間、CSS の名前と値の範囲、不透明な JSON は正確に保ちます。
独立した JSON の id、`@`、
波括弧の境界も含みます。 [fixture: classes-and-styles/css-name-multiline-directive]
[fixture: json-tables/json-prefix-id-at-multiline-directive]
native の `@{`、引用のない語、矢印は原子的な単位のままです。
EOF まで続く directive の末尾と、止めるセミコロンの位置を保ちます。
native の引用キーと値は directive の断片を含められます。 [fixture: native-metadata/metadata-key-multiline-directive]
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
[fixture: directives/header-at-eof]
[fixture: directives/before-boundary-end]
[fixture: directives/open-word-stop]

入力（エスケープ表記）:
`"usecase-beta\nactor  %%{init: {}}%%  User"`

出力 ([directives/directives-ordinary-gap-output.mmd](../tests/fixtures/usecase/directives/directives-ordinary-gap-output.mmd)):

```mmd
usecase-beta
  actor %%{init: {}}%% User
```

### Multiline values and order

[C4 の値の列](./c4.ja.md#multiline-values)と、
[flowchart の折り返さない規則](./flowchart.ja.md#line-wrapping)を再利用します。
書かれた行と列は文字であり、`printWidth` で長い文を折り返しません。
markdown、JSON、説明、directive、共通領域の継続を保ちます。
通常の文字列と stereotype に物理改行を足しません。
native
metadata の構造は専用の規則に従います。 [fixture: native-metadata/metadata-key-multiline-directive]
[fixture: native-metadata/metadata-scalar-multiline-directive]
互換な宣言、境界、関係、note、class の定義と割り当て、更新は、
短く書いて Db が等しい場合も原文の順序と繰り返しを保ちます。
物理行の文の結合や、解決後のモデルの出力はしません。

[fixture: multiline-values-and-order/no-wrap]
[fixture: multiline-values-and-order/multiline-markdown]
[fixture: multiline-values-and-order/repeated-order]
[fixture: multiline-values-and-order/wrap-arrow-kept]
[fixture: multiline-values-and-order/repeated-notes-and-updates]

入力（エスケープ表記）:
`"usecase-beta\nVeryLongSourceIdentifier-- a deliberately long label -->VeryLongTargetIdentifier"`

出力 ([multiline-values-and-order/no-wrap-output.mmd](../tests/fixtures/usecase/multiline-values-and-order/no-wrap-output.mmd)):

```mmd
usecase-beta
  VeryLongSourceIdentifier -- a deliberately long label --> VeryLongTargetIdentifier
```

### Trailing whitespace

[外側の空白の除去](./c4.ja.md#trailing-whitespace)を再利用します。
完了した構造と CSS の最後の成分の後の、無害な ASCII 空白とタブを除きます。
CSS のコロンの余白は宣言の内部なので保ちます。
accessibility 行と stereotype の両端の空白は、
兄弟の規則に従って整えます。 [fixture: stereotypes/side-padding]
引用と markdown の値、JSON、native プロパティの文字列、コメント、
directive 内の末尾の全文字は保ちます。 [test: usecase: terminal-comment-tab]
[test: usecase: terminal-a11y-tab]
Unicode 文字を自動的に外側の水平空白とせず、空の CSS style も作りません。

[fixture: trailing-whitespace/trailing-exterior]
[fixture: trailing-whitespace/trailing-values]
[fixture: trailing-whitespace/trailing-global-trim-kept]
[fixture: trailing-whitespace/opaque-and-metadata-lines]

入力（エスケープ表記）:
`"usecase-beta  \nactor U \t\nA-->B  \nA@{ }\t\nstyle A fill:red \t"`

出力 ([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/usecase/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
usecase-beta
  actor U
  A --> B
  A@{ }
  style A fill:red
```

### Line terminators

[共有の改行](./compatibility.ja.md#line-endings)を再利用します。
Mermaid は読む前に物理的な CR と CRLF を LF にし、
出力は `endOfLine` に従います。
metadata、JSON、markdown、accessibility、CSS、directive の内部も同じです。
LS と PS は文脈に従う文字として、ラベル、stereotype の本文、note、
native と CSS の引用値、accessibility、コメントに保ちます。
accessibility と stereotype の外側の空白は、
それぞれの規則に従って整えます。 [test: usecase: a11y-unicode-exterior]
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

[test: usecase: eol-cr]
[test: usecase: eol-crlf]
[test: usecase: eol-output-cr]
[test: usecase: eol-output-crlf]
[test: usecase: unicode-labels]
[test: usecase: unicode-stereotype]
[test: usecase: unicode-native-metadata]
[test: usecase: unicode-json-string]
[test: usecase: unicode-a11y]
[test: usecase: unicode-comment]
[test: usecase: unicode-comment-to-lf-kept]
[test: usecase: unicode-metadata-separator-opaque]
[test: usecase: bom-leading]
[test: usecase: unicode-note]
[test: usecase: eol-cr-all-modes]
[test: usecase: unicode-css-string]
[test: usecase: unicode-joined-native-metadata]
[test: usecase: unicode-semicolon-segments]
[test: usecase: crlf-metadata-blank-lines]
[test: usecase: nbsp-css-string]
[test: usecase: unicode-boundary-title]
[test: usecase: crlf-output-values]

### Frontmatter YAML

[保護条件付きの frontmatter](./flowchart.ja.md#frontmatter-yaml)を再利用します。
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

入力（エスケープ表記）:
`"---\ntitle:   T\nconfig: {usecase: {useMaxWidth:  true}}\n---\nusecase-beta\nA"`

出力 ([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/usecase/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: T
config: { usecase: { useMaxWidth: true } }
---
usecase-beta
  A
```

### Final newline

[共有のファイル末尾](./c4.ja.md#final-newline)を再利用し、
通常の受理入力は設定された改行 1 個で終えます。
ヘッダーだけ、裸のコメント、空の accessibility 行も同じです。
各規則が残す値の余白を改行の前に保ち、 accessibility 行の外側の空白は、
その規則に従って除きます。
EOF まで続く directive の値に文字を加えません。 [test: usecase: terminal-comment-tab]
[test: usecase: terminal-a11y-tab]
directive の外側の末尾空白は共有の範囲の規則に従います。
拒否された構文を末尾の追加で受理させることはしません。

[fixture: final-newline/final-ordinary]
[fixture: final-newline/final-bare-comment]
[fixture: final-newline/final-value-padding]
[fixture: final-newline/final-open-directive]
[fixture: final-newline/empty-title-and-bare-comment]
[fixture: final-newline/directive-exterior-whitespace]
[corpus fixture: usecase/db-acctitle-eof]

入力（エスケープ表記）:
`"usecase-beta\nA\n\n\n"`

出力 ([final-newline/final-ordinary-output.mmd](../tests/fixtures/usecase/final-newline/final-ordinary-output.mmd)):

```mmd
usecase-beta
  A
```

### Markdown fences

[共有の Markdown の入れ物](./compatibility.ja.md#markdown-code-blocks) を再利用します。
字下げを除いた本文に同じ規則を適用し、ホストが fence、リスト、
引用の字下げを補います。
固定したホストのテストは stereotype の接尾辞、native metadata、JSON、
複数行の値、directive、幅 0、タブ、空のヘッダー、
拒否された本文を扱います。 [test: usecase Markdown: stereotype-suffixes]
accessibility 行の外側の空白は、単独ファイルと Markdown の両方で除きます。
例えば `accTitle:  Title  ` は、どちらでも `accTitle: Title` になります。
拒否した fence には、ホストの空白と改行の処理だけを適用します。

[fixture: markdown-fences/markdown-top-payload]
[fixture: markdown-fences/markdown-list-payload]
[test: usecase Markdown: top-level]
[test: usecase Markdown: list]
[test: usecase Markdown: block-quote]
[test: usecase Markdown: zero-metadata]
[test: usecase Markdown: tabs-boundary]
[test: usecase Markdown: json]
[test: usecase Markdown: multiline-value]
[test: usecase Markdown: directives]
[test: usecase Markdown: last-value-padding]
[test: usecase Markdown: rejected-payload]
[test: usecase Markdown: empty-header]

入力（エスケープ表記）:
`"usecase-beta\nactor U\nU-->A"`

出力 ([markdown-fences/markdown-top-payload-output.mmd](../tests/fixtures/usecase/markdown-fences/markdown-top-payload-output.mmd)):

```mmd
usecase-beta
  actor U
  U --> A
```
