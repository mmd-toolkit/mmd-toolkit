# Kanban の整形規則

英語版: [kanban.md](./kanban.md)

[kanban の木](../../spec/docs/ast/kanban.ja.md)の絶対的な level と、
平らなノードのリストに従って整形します。
各規則は仕様の Db と、書かれた埋め込みテキストを保ちます。
既知の差異には仕様の読み方を使い、素の mermaid.js の Db を作りません。

以下の入力と出力の例は、リンク先の整形 fixture です。
各規則は固定したケースを引用します。
置き方は[文書と fixture](./development.ja.md#文書と-fixture)にあります。
Markdown で示せない空白は、エスケープした文字列でテストします。

## 規則

### 字下げ

各ノードの字下げの絶対文字数を、0 や不均等な段も含めて保ちます。
字下げの各文字を空白 1 つに、`useTabs` ではタブ 1 つに置き換えます。
`tabWidth` は文字数を変えません。
絶対的な `level` が Db に入るため、最初の列の移動やタブの展開はできません。
文字の種類だけを揃えると、通常の字下げが一貫します。
インラインディレクティブの行、保持する区間、保護する隙間の字下げは、
それぞれの規則に従って原文を保ちます。
[fixture: directives/leading-directive-kept]
[fixture: line-rule-and-kept-lines/style-segment]
[fixture: blank-lines/div-between-comment-blank]
[fixture: indentation/absolute-counts]
[fixture: indentation/indentation-common-shift]
[test: kanban: tab-one-space]
[test: kanban: indent-whitespace-kind]
[test: kanban: ls-indent-one-space]
[fixture: indentation/spaces-to-tabs-count]
[test: kanban: ps-indent-count]
[fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs]

入力
([indentation/absolute-counts-input.mmd](../tests/fixtures/kanban/indentation/absolute-counts-input.mmd)):

```mmd
kanban
      S
          A
             B
      T
```

出力
([indentation/absolute-counts-output.mmd](../tests/fixtures/kanban/indentation/absolute-counts-output.mmd)):

```mmd
kanban
      S
          A
             B
      T
```

### ヘッダー

`kanban` は 1 桁目に置きます。
ヘッダー行の最初のノードは、その後ろの字下げ文字数を保って自分の行に移します。
接した形で文字数が 0 の場合も同じです。
他図種と同じヘッダー配置にしつつ、絶対的な level を保つためです。
保持するセミコロンの区間では移動しません。
インラインディレクティブは後続のテキスト全体と一緒に移します。
[fixture: header/inline-count]
[fixture: header/header-column]
[fixture: header/header-touching-shape]
[fixture: header/header-percent-in-text]
[fixture: header/header-only-lf]
[fixture: header/header-space-only]
[fixture: header/header-touching-dash]
[test: kanban: header-tab-inline]
[test: kanban: header-nbsp-count]
[test: kanban: header-bom-count]

入力
([header/inline-count-input.mmd](../tests/fixtures/kanban/header/inline-count-input.mmd)):

```mmd
kanban   S[x]
     A
```

出力
([header/inline-count-output.mmd](../tests/fixtures/kanban/header/inline-count-output.mmd)):

```mmd
kanban
   S[x]
     A
```

### ノードは 1 行に 1 つ

平らなノードのリストを記述順に、1 行に 1 つずつ印字します。
同じ id、同じ深さの列、深い項目、最後の浅い項目も保ちます。
項目の入れ子の推測、定義の統合、並べ替え、行の連結は、
ボードや値を変えるため行いません。
[fixture: nodes-one-per-line/flat-order]
[fixture: nodes-one-per-line/deeper-to-regular-items]
[fixture: nodes-one-per-line/repeated-ids]
[fixture: nodes-one-per-line/shallower-last]

入力
([nodes-one-per-line/flat-order-input.mmd](../tests/fixtures/kanban/nodes-one-per-line/flat-order-input.mmd)):

```mmd
kanban
 S
   A
     B
   C
 T
```

出力
([nodes-one-per-line/flat-order-output.mmd](../tests/fixtures/kanban/nodes-one-per-line/flat-order-output.mmd)):

```mmd
kanban
 S
   A
     B
   C
 T
```

### 形

開きと閉じを、不一致、id のない形、ダッシュの綴りも含めて残します。
id と形の間の空白は id の一部なので保ちます。
閉じを合わせても Db が同じ場合はありますが、作者の構造を変えます。
理由は [mindmap](./mindmap.ja.md#形) と同じです。
[fixture: shapes/mismatched]
[fixture: shapes/matching-closer]
[fixture: shapes/id-before-shape]
[fixture: shapes/shape-families]
[fixture: shapes/shape-alone]
[fixture: shapes/db-shape-square]
[fixture: shapes/db-shape-round]
[fixture: shapes/db-shape-circle]
[fixture: shapes/db-shape-hexagon]
[fixture: shapes/db-shape-bang]
[fixture: shapes/db-shape-bang-alt]
[fixture: shapes/db-shape-cloud]
[fixture: shapes/db-shape-cloud-alt]
[fixture: shapes/db-shape-mismatched]
[fixture: shapes/lex-shape-dash-bare]
[fixture: shapes/lex-shape-dash-string]

入力
([shapes/mismatched-input.mmd](../tests/fixtures/kanban/shapes/mismatched-input.mmd)):

```mmd
kanban
 S[x)
   A(y]
   B))z((
   C{{q}}
```

出力
([shapes/mismatched-output.mmd](../tests/fixtures/kanban/shapes/mismatched-output.mmd)):

```mmd
kanban
 S[x)
   A(y]
   B))z((
   C{{q}}
```

### ラベル

裸、引用符付き、markdown のラベルの形式と、値の全文字を保ちます。
空白だけの値、先頭の空白に続く引用符、実体参照、
エスケープ、HTML 属性の綴りも対象です。
引用符の付け外し、両端の空白の変更、符号化、復号、無害化は行いません。
空白で読み方が変わり、
Db が同じでも書かれた形式を変える理由にはならないためです。
[fixture: labels/forms]
[fixture: labels/inner-whitespace-trim]
[fixture: labels/bare-to-quoted]
[fixture: labels/leading-space-quote]
[fixture: labels/space-after-string-invalid]
[fixture: labels/bare-empty-spellings]
[fixture: labels/whitespace-only-forms]
[fixture: labels/lex-style-entity-two-semicolons]
[fixture: labels/db-grid-html-attribute-item-label-quoted]
[fixture: labels/db-grid-entity-item-label-quoted]

入力
([labels/forms-input.mmd](../tests/fixtures/kanban/labels/forms-input.mmd)):

```mmd
kanban
 S
   A[x y]
   B["x y"]
   C["`x y`"]
   D[ "x" ]
```

出力
([labels/forms-output.mmd](../tests/fixtures/kanban/labels/forms-output.mmd)):

```mmd
kanban
 S
   A[x y]
   B["x y"]
   C["`x y`"]
   D[ "x" ]
```

### アイコンとクラス

インラインディレクティブの行と保持する区間の外では、
icon と class をそれぞれ自分の行に、付くノードと同じ絶対列で置きます。
順序、重複、大文字小文字、値の空白をすべて保ちます。
字下げは付着先を決めません。
配置で付着先を示す理由は [mindmap](./mindmap.ja.md#飾り行) と同じです。
ノードの末尾に付けると id が変わったり、形が拒否されたりします。
Db に現れない class や列の icon も残します。
[fixture: icons-and-classes/aligned]
[fixture: icons-and-classes/decorations-align]
[fixture: icons-and-classes/icon-after-bare]
[fixture: icons-and-classes/class-after-bare]
[fixture: icons-and-classes/icon-after-shape]
[fixture: icons-and-classes/icon-value-trim]
[fixture: icons-and-classes/class-value-trim-summary-only]
[fixture: icons-and-classes/class-after-shape]
[fixture: icons-and-classes/gram-whitespace-class]
[fixture: icons-and-classes/gram-whitespace-icon]
[fixture: icons-and-classes/db-decoration-icon-section]
[fixture: icons-and-classes/db-decoration-icon-twice]
[fixture: icons-and-classes/db-decoration-class-twice]
[fixture: icons-and-classes/gram-decoration-then-child]
[fixture: icons-and-classes/gram-shallower-then-decoration]

入力
([icons-and-classes/aligned-input.mmd](../tests/fixtures/kanban/icons-and-classes/aligned-input.mmd)):

```mmd
kanban
 S
   A
 ::icon(x)
       :::hot
```

出力
([icons-and-classes/aligned-output.mmd](../tests/fixtures/kanban/icons-and-classes/aligned-output.mmd)):

```mmd
kanban
 S
   A
   ::icon(x)
   :::hot
```

### データブロック

`@{ ... }` は不透明なデータとして、区切り、中身、付着位置、
隣接するブロックや間のディレクティブも書かれたまま保ちます。
形の後のブロックは閉じに接し、裸のノードとブロックの間の空白は id の一部です。
空、未知のキー、重複、偽値、複数行、不正な中身も、
YAML 整形、統合、分割、並べ替え、折り返し、修復をしません。
付着位置は文法で決まり、Db が同じでも埋め込みテキストは書き換えません。
[fixture: data-blocks/adjacent]
[fixture: data-blocks/data-opaque]
[fixture: data-blocks/data-space-after-shape]
[fixture: data-blocks/data-space-after-bare]
[fixture: data-blocks/data-adjacent-gap]
[fixture: data-blocks/data-adjacent-directive]
[fixture: data-blocks/data-multiline]
[fixture: data-blocks/empty-data]
[fixture: data-blocks/data-invalid-yaml]
[fixture: data-blocks/data-unknown-duplicate]
[fixture: data-blocks/data-space-before-kept]
[fixture: data-blocks/data-empty-adjacent]
[fixture: data-blocks/data-line-rule-gap]
[fixture: data-blocks/gram-metadata-ticket-duplicate]
[fixture: data-blocks/gram-metadata-empty-multiline]
[fixture: data-blocks/db-metadata-comment-line]
[fixture: data-blocks/db-metadata-ticket-false]
[fixture: data-blocks/db-metadata-assigned-zero]
[fixture: data-blocks/db-metadata-quoted-brace]

入力
([data-blocks/adjacent-input.mmd](../tests/fixtures/kanban/data-blocks/adjacent-input.mmd)):

```mmd
kanban
 S
   A[x]@{ticket: X,}@{assigned: Ada}
```

出力
([data-blocks/adjacent-output.mmd](../tests/fixtures/kanban/data-blocks/adjacent-output.mmd)):

```mmd
kanban
 S
   A[x]@{ticket: X,}@{assigned: Ada}
```

### 空行

通常の文間の連続する空行は 1 つにし、本体の両端の空行と、
ノードのないヘッダーの行末の空白は落とします。
他図種と同じ簡潔な区切りにするためです。
図のコメントの後の空行・コメントの隙間は、末尾も含めて全体を保ちます。
既知の差異 `blank-line-after-header-or-comments` を理由に、
コメントの組を修復しないためです。
ヘッダーの空行を落とすと、素の mermaid.js が拒否した入力を受理し、
仕様の Db に一致する場合があります。
拒否された入力に素の Db はありません。
[fixture: blank-lines/collapsed]
[fixture: blank-lines/blank-body-end]
[test: kanban: blank-whitespace]
[fixture: blank-lines/blank-comment-accepted]
[fixture: blank-lines/blank-comment-text-accepted]
[fixture: blank-lines/comment-blank-trailing]
[fixture: blank-lines/decoration-blank-runs-collapsed]
[fixture: blank-lines/gram-grid-lf-header-line]
[fixture: blank-lines/div-header-space-node]
[test: kanban: header-tab-trailing]
[fixture: blank-lines/div-header-comments-blank]
[fixture: blank-lines/div-between-comment-blank]
[fixture: blank-lines/div-comment-blank-before-icon]
[fixture: blank-lines/div-comment-blank-before-class]
[test: kanban: header-bom-trailing]
[test: kanban: header-crlf-trailing]
[test: kanban: header-ff-trailing]
[test: kanban: header-ideographic-trailing]
[test: kanban: header-ls-trailing]
[test: kanban: header-nbsp-trailing]
[test: kanban: header-ps-trailing]
[test: kanban: header-vt-trailing]
[test: kanban: lex-tab-whitespace-first]
[test: kanban: lex-bom-whitespace-first]
[test: kanban: lex-cr-whitespace-first]
[test: kanban: lex-crlf-whitespace-first]
[test: kanban: lex-ideographic-whitespace-first]
[test: kanban: lex-ls-whitespace-first]
[test: kanban: lex-nbsp-whitespace-first]
[test: kanban: lex-ps-whitespace-first]
[fixture: blank-lines/header-header-comment-blank]
[fixture: blank-lines/gram-blank-before-icon]
[fixture: blank-lines/common-comment-after-directive]

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/kanban/blank-lines/collapsed-input.mmd)):

```mmd
kanban
 S


   A



 T
```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/kanban/blank-lines/collapsed-output.mmd)):

```mmd
kanban
 S

   A

 T
```

### コメント

インラインディレクティブの行、保護する隙間、保持する区間の外では、
独立したコメントを次の文の列に揃えます。
末尾では最後の文、ヘッダーの前では 1 桁目に置き、印とテキストを保ちます。
次の文を示す理由は [mindmap](./mindmap.ja.md#コメント) と同じです。
インラインコメントは同じ行に残し、安全な外側の隙間だけ、
空白があれば 1 つ、接していれば接したままにします。
id・ラベル・class の `%%`、単独の `%` や `#` のノード、
値やデータ内のコメントは、文脈を保ちます。
共通コメントの領域を分割して、読み捨てられたテキストを復活させません。
[fixture: comments/inline]
[fixture: comments/comments-align]
[fixture: comments/header-comment-gap]
[fixture: comments/percent-values]
[fixture: comments/comment-line-in-value]
[test: kanban: comment-line-ls-taken]
[fixture: comments/comment-after-data-gap]
[fixture: comments/comment-after-icon-gap]
[fixture: comments/header-leading-comment]
[fixture: comments/bare-brace-comments-aligned]

入力
([comments/inline-input.mmd](../tests/fixtures/kanban/comments/inline-input.mmd)):

```mmd
kanban
 S[x]   %% c
   A[y]%% d
```

出力
([comments/inline-output.mmd](../tests/fixtures/kanban/comments/inline-output.mmd)):

```mmd
kanban
 S[x] %% c
   A[y]%% d
```

### ディレクティブ

インラインディレクティブと、それを含むノードや装飾の行は、
字下げと隙間も含めて書かれたまま保ちます。
ヘッダー行のノードは後続全体と一緒に移します。
値や保護する隙間の外の独立したディレクティブだけを、
独立コメントと同じに揃えます。
中身、複数行、閉じのない形式、行の連結、セミコロンでの停止は保ちます。
除去後の両側の空白が字下げや値に入るので、隙間を畳めないためです。
[fixture: directives/standalone]
[fixture: directives/leading-directive-kept]
[fixture: directives/id-directive-kept]
[fixture: directives/standalone-directive-align]
[fixture: directives/unclosed-directive]
[fixture: directives/header-directive-inline]
[fixture: directives/directive-before-header]
[fixture: directives/db-grid-directive-item-label-markdown]
[fixture: directives/db-grid-directive-item-icon]
[fixture: directives/db-grid-directive-item-class]
[fixture: directives/db-metadata-directive]
[test: kanban: unicode-inline-directive-indentation]
[test: kanban: directive-before-unicode-comment]
[test: kanban: directive-after-unicode-comment]

入力
([directives/standalone-input.mmd](../tests/fixtures/kanban/directives/standalone-input.mmd)):

```mmd
kanban
 S
       %%{init: {}}%%
   A
```

出力
([directives/standalone-output.mmd](../tests/fixtures/kanban/directives/standalone-output.mmd)):

```mmd
kanban
 S
   %%{init: {}}%%
   A
```

### 行規則と保持行

セミコロンを含む区間は、字下げ、境界、インラインコメント、
除去されるディレクティブの隣接、コロンとハッシュの間の空白も保ちます。
共通の行規則は大文字小文字を区別し、`style`、次に `classDef` の順に、
値・データ・コメント内でも一致する区間の最後のセミコロンを無視できます。
区間を変えると、選ばれるセミコロンが変わり得るためです。
kanban の style 文ではありません。
保持する区間は、ヘッダーの移動や他の配置規則より優先します。
[fixture: line-rule-and-kept-lines/style-segment]
[fixture: line-rule-and-kept-lines/line-rule-kept]
[fixture: line-rule-and-kept-lines/line-rule-colon-space]
[fixture: line-rule-and-kept-lines/line-rule-wrap]
[fixture: line-rule-and-kept-lines/line-rule-comment-move]
[fixture: line-rule-and-kept-lines/line-rule-directive-kept]
[fixture: line-rule-and-kept-lines/line-rule-two-semicolons]
[fixture: line-rule-and-kept-lines/line-rule-id]
[fixture: line-rule-and-kept-lines/line-rule-data]
[fixture: line-rule-and-kept-lines/line-rule-icon]
[fixture: line-rule-and-kept-lines/line-rule-class]
[fixture: line-rule-and-kept-lines/line-rule-comment-to-own-line]
[fixture: line-rule-and-kept-lines/line-rule-classdef-and-style]
[test: kanban: line-rule-ls-segment]
[fixture: line-rule-and-kept-lines/lex-label-style-rule-upper]
[fixture: line-rule-and-kept-lines/lex-label-style-rule-no-hash]
[fixture: line-rule-and-kept-lines/lex-label-style-rule-space]
[fixture: line-rule-and-kept-lines/lex-label-style-rule-other-line]
[fixture: line-rule-and-kept-lines/lex-label-style-rule-two-semicolons]

入力
([line-rule-and-kept-lines/style-segment-input.mmd](../tests/fixtures/kanban/line-rule-and-kept-lines/style-segment-input.mmd)):

```mmd
kanban
 S
   A[style:#x;] %% c;
```

出力
([line-rule-and-kept-lines/style-segment-output.mmd](../tests/fixtures/kanban/line-rule-and-kept-lines/style-segment-output.mmd)):

```mmd
kanban
 S
   A[style:#x;] %% c;
```

### 行末の空白

保持する領域の外では、完結した形・icon・データの後ろだけ、
値の外の行末の空白を落とします。
裸の id の末尾や形・データの前の空白、空白だけの class、
ラベル・icon・データ・コメント・ディレクティブ・継続行の空白は保ちます。
[mindmap の値と外側の区別](./mindmap.ja.md#ノードのテキスト)を、
データに広げる規則です。
意味のあるテキストを保つためです。
[test: kanban: bare-trailing-trim]
[test: kanban: closed-trailing-trim]
[fixture: trailing-whitespace/class-trailing-trim]
[test: kanban: closed-whitespace-trim]
[fixture: trailing-whitespace/lex-after-quoted-spaces]

### 改行

共通の Prettier の経路で、CRLF・CR・LF を `endOfLine` に揃えます。
ラベル・icon・ディレクティブ・不透明なデータの中も同じです。
mermaid.js もこれらを正規化するので、kanban 独自の処理は設けません。
[test: kanban: crlf-to-lf]
[test: kanban: cr-to-lf]
[test: kanban: multiline-data-crlf]
[test: kanban: multiline-data-cr]
[test: kanban: crlf-in-multiline-values]
[test: a kanban diagram with other line endings]

### 空白文字

通常の字下げでは、タブ、NBSP、BOM、全角空白、垂直タブ、
改ページ、U+2028、U+2029 を 1 文字ずつ置き換えます。
値とインラインディレクティブの行では残します。
U+0085 はテキストとして保ちます。
図のコメントを終える Unicode 区切りと、
後続を飲み込む共通コメント領域は保ちます。
その区切りは、続く字下げの 1 文字に入ります。
CR・LF と違って一般的な改行ではなく、一律の変換は値や level を変えるためです。
ファイル先頭の BOM は、共通の Prettier の扱いに従います。
空でない class の後、LF の前の Unicode 区切りは値の外なので落とします。
[test: kanban: ls-is-value]
[test: kanban: ps-is-value]
[test: kanban: comment-ls-split-count]
[test: kanban: whitespace-values]
[test: kanban: nel-is-text]
[test: kanban: ps-icon-value]
[test: kanban: leading-bom]
[test: kanban: class-separator-empty-tail]
[test: kanban: ls-bare-value]
[test: kanban: ls-data-value]
[test: kanban: div-between-real-comments-ls-node]
[test: kanban: div-between-real-comments-ps-node]
[test: kanban: div-header-comment-ls-node]
[test: kanban: div-header-comment-ps-node]
[test: kanban: lex-icon-comment-ls]
[test: kanban: db-metadata-comment-ls]
[test: kanban: shape-comment-ps]
[test: kanban: common-comment-ps-swallows-suffix]

### 拒否する入力

空の形式、壊れた区切り、単独のデータ、不正な末尾、トークン境界の差異、
不正なヘッダーなど、parser が拒否した入力は共通の失敗経路に従います。
単独ファイルは構文エラーとして報告して変更せず、
Markdown は埋め込み整形を辞退して Prettier に任せます。
修復、空の値の削除、ヘッダーを有効にする改行の追加は行いません。
素の mermaid.js が不透明なデータを拒否しても、中身を修復する理由にはしません。
[fixture: rejected-inputs/empty-icon]
[fixture: rejected-inputs/empty-icon-at-section-column]
[fixture: rejected-inputs/empty-class]
[fixture: rejected-inputs/empty-shape]
[fixture: rejected-inputs/empty-string-shape]
[fixture: rejected-inputs/empty-markdown-shape]
[fixture: rejected-inputs/empty-description-not-syntax]
[fixture: rejected-inputs/semicolon-after-shape]
[fixture: rejected-inputs/header-only-invalid]
[fixture: rejected-inputs/empty-class-after-shape]
[fixture: rejected-inputs/decoration-before-node]
[fixture: rejected-inputs/data-before-shape-invalid]
[fixture: rejected-inputs/data-standalone-invalid]
[fixture: rejected-inputs/unclosed-directive-semicolon-kept]
[fixture: rejected-inputs/header-directive-inside]
[fixture: rejected-inputs/div-semicolon-opener]
[fixture: rejected-inputs/gram-indent-shallower-followed]
[fixture: rejected-inputs/gram-shape-carryover-doublecircle]
[fixture: rejected-inputs/div-frontmatter-open-tag]
[fixture: rejected-inputs/div-empty-icon-after-shape]
[fixture: rejected-inputs/div-empty-string-before-label]
[fixture: rejected-inputs/div-empty-string-after-label]
[fixture: rejected-inputs/div-empty-markdown-before-label]
[fixture: rejected-inputs/div-empty-markdown-after-label]
[fixture: rejected-inputs/gram-unclosed-shape]
[fixture: rejected-inputs/gram-unclosed-quote]
[fixture: rejected-inputs/gram-unclosed-markdown]
[fixture: rejected-inputs/gram-unclosed-icon]
[fixture: rejected-inputs/gram-decoration-before-node]
[fixture: rejected-inputs/gram-decoration-class-before-node]
[fixture: rejected-inputs/div-directive-data-marker]
[fixture: rejected-inputs/upper-case-header]
[fixture: rejected-inputs/space-after-string]
[fixture: rejected-inputs/icon-appended-to-shape]
[fixture: rejected-inputs/space-before-shaped-data]
[fixture: rejected-inputs/space-between-data]

入力
([rejected-inputs/empty-icon-input.mmd](../tests/fixtures/kanban/rejected-inputs/empty-icon-input.mmd)):

```mmd
kanban
 S
   ::icon()
```

出力
([rejected-inputs/empty-icon-output.mmd](../tests/fixtures/kanban/rejected-inputs/empty-icon-output.mmd)):

```mmd
kanban
 S
   ::icon()
```

### セミコロン

単独のノード、id、ラベル、icon、class、データ、
共通の行規則が無視する文字も含め、すべてのセミコロンを残します。
kanban では文の区切りではなく、削除や分割でテキストや読み方が変わるためです。
形の後の通常のセミコロンは拒否され得ますが、
無視される末尾は受理される場合もあり、その場合も残します。
[fixture: semicolons/values]
[fixture: semicolons/semicolon-remove]

入力
([semicolons/values-input.mmd](../tests/fixtures/kanban/semicolons/values-input.mmd)):

```mmd
kanban
 S;T
   A["x;y"]
   ;
   :::c;d
```

出力
([semicolons/values-output.mmd](../tests/fixtures/kanban/semicolons/values-output.mmd)):

```mmd
kanban
 S;T
   A["x;y"]
   ;
   :::c;d
```

### キーワードの大文字小文字

icon の印の大文字小文字と、通常のノードの単語は書かれたまま保ちます。
検出には小文字の `kanban` が必要です。
title・アクセシビリティ・style・class 定義・columns・space・end・C4 の
綴りを、印字側の特別な文としては扱いません。
作者の綴りと parser が定めた読み方を保つためで、
[mindmap](./mindmap.ja.md#キーワードの大文字小文字)と同じ理由です。
[fixture: keyword-case/icon-case]
[fixture: keyword-case/case-lower-icon]
[fixture: keyword-case/lower-case-header]
[fixture: keyword-case/keywords-ordinary]
[fixture: keyword-case/lex-c4-c4container-id]

入力
([keyword-case/icon-case-input.mmd](../tests/fixtures/kanban/keyword-case/icon-case-input.mmd)):

```mmd
kanban
 S
   A
 ::ICON(x)
 ::Icon(y)
```

出力
([keyword-case/icon-case-output.mmd](../tests/fixtures/kanban/keyword-case/icon-case-output.mmd)):

```mmd
kanban
 S
   A
   ::ICON(x)
   ::Icon(y)
```

### フロントマターの YAML

保護条件付きの共通 YAML 整形を使い、区切りの綴りを保ちます。
不正な YAML、字下げされた区切り、HTML タグの危険、
整形後に区切り行ができる場合は書かれたまま残します。
フロントマターとヘッダーの間のコメントやディレクティブも残します。
設定と共通の保護条件を保ち、埋め込みの効果を変えないためです。
この整形の許可はデータブロックには適用しません。
[fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/frontmatter-malformed]
[fixture: frontmatter-yaml/frontmatter-indented-kept]
[fixture: frontmatter-yaml/frontmatter-html-tag-kept]
[fixture: frontmatter-yaml/delimiter-line-kept]
[test: kanban: closing-delimiter-whitespace-kept]
[fixture: frontmatter-yaml/comment-and-directive]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/kanban/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:    T
config: {kanban: {ticketBaseUrl: "https://example.com/#TICKET#"}}
---
kanban
 S
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/kanban/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { kanban: { ticketBaseUrl: "https://example.com/#TICKET#" } }
---
kanban
 S
```

### 複数行の値

裸・引用符付き・markdown のラベル、icon、データは、
継続行の空白、内部のコメントやディレクティブ、空行も含めて保ちます。
`printWidth` のために、値や長い裸のノードを連結・折り返しません。
継続部分は値であり、改行の変更は Db を変えたり、別のノードを作ったりします。
不透明な埋め込みテキストも幅より優先するためです。
[fixture: multi-line-values/labels-and-icon]
[fixture: multi-line-values/multiline-join]
[fixture: multi-line-values/long-line-kept]
[fixture: multi-line-values/multiline-icon-trim-unsafe]
[fixture: multi-line-values/small-print-width]
[fixture: multi-line-values/lex-label-empty-line]
[fixture: multi-line-values/lex-label-directive-line]
[fixture: multi-line-values/lex-metadata-blank-line]

入力
([multi-line-values/labels-and-icon-input.mmd](../tests/fixtures/kanban/multi-line-values/labels-and-icon-input.mmd)):

```mmd
kanban
 S
   A[x
 y]
   B["p
 q"]
   C["`r
 s`"]
 ::icon(fa
  fa-star)
```

出力
([multi-line-values/labels-and-icon-output.mmd](../tests/fixtures/kanban/multi-line-values/labels-and-icon-output.mmd)):

```mmd
kanban
 S
   A[x
 y]
   B["p
 q"]
   C["`r
 s`"]
   ::icon(fa
  fa-star)
```

### 末尾の改行

EOF に達する閉じていないディレクティブの外では、
受理して整形したボードを共通の設定された改行で終えます。
その前の意味のある空白と、保護する末尾のコメントの隙間は保ちます。
受理する空のボードは `kanban` と改行を印字し、
拒否する裸のヘッダーは失敗のままです。
構文を修復せず共通のファイル規則に従うためです。
Markdown のフェンスやコンテナの字下げは、kanban の level に加えません。
[fixture: final-newline/accepted]
[fixture: final-newline/no-final-lf]
[fixture: final-newline/open-directive-at-eof]
[fixture: final-newline/empty-board]

入力
([final-newline/empty-board-input.mmd](../tests/fixtures/kanban/final-newline/empty-board-input.mmd)):

```mmd
kanban
```

出力
([final-newline/empty-board-output.mmd](../tests/fixtures/kanban/final-newline/empty-board-output.mmd)):

```mmd
kanban
```
