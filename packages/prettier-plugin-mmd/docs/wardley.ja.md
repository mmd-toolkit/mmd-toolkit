# Wardley の整形規則

英語版: [wardley.md](./wardley.md)

採用した 35 項目に従い、
[Wardley の木](../../spec/docs/ast/wardley.md)を印字します。
最上位と pipeline の本文は共有 factory の同じ関数を通します。
保持する原文と mermaid.js との差は
[互換性](./compatibility.ja.md#wardley-の原文と必須の改行)に記録します。

## 規則

### 見出し

見出し wardley-beta は原綴のまま第 1 列に置き、
普通の最初の文を次の行へ移します。
図種を見つけやすくするためで、コロンは足しません。
hidden form、保持 prefix、保護行には共有の境界規則を使います。
空の本文には文を足しません。

[fixture: wardley/header/header-glued]

[fixture: wardley/header/header-inline]

[fixture: wardley/header/header-empty]

入力（escaped）:
`"wardley-betacomponentHeader[0.3,0.6]"`.

出力
([header/header-glued-output.mmd](../tests/fixtures/wardley/header/header-glued-output.mmd)):

```mmd
wardley-beta
  component Header [0.3, 0.6]
```

### 字下げ

普通の文、metadata、独立した trivia は設定の 1 段だけ字下げします。
既定は空白 2 つ、tabWidth 4 は 4 つ、0 は 0 です。
列に文法上の意味がないためです。
useTabs は幅 0 でもタブを使います。
保護区間の最初の行は本文の段に揃え、内部と後続行の列は保ちます。

[fixture: wardley/indentation/indent-two]

[fixture: wardley/indentation/indent-four]

[fixture: wardley/indentation/indent-zero]

[fixture: wardley/indentation/indent-tabs]

[fixture: wardley/indentation/indent-zero-tabs]

入力（escaped）:
`"wardley-beta\n component Indent [0.3,0.6]"`.

出力
([indentation/indent-two-output.mmd](../tests/fixtures/wardley/indentation/indent-two-output.mmd)):

```mmd
wardley-beta
  component Indent [0.3, 0.6]
```

### pipeline

pipeline Parent { と印字し、子文はさらに 1 段深く、
} は親の文と同じ段に置きます。
{ と各子文の後の可視 LF は、幅 0 でも文法に必要なので保ちます。
座標や生成 ID を足さず、書かれた親子の区切りを示します。

[fixture: wardley/pipeline/pipeline-depth]

[fixture: wardley/pipeline/pipeline-zero]

[fixture: wardley/pipeline/pipeline-tab]

入力（escaped）:
`"wardley-beta\ncomponent Parent[0.4,0.5]\npipelineParent{\n component Child[0.6]label[-1,2]\n      }"`.

出力
([pipeline/pipeline-depth-output.mmd](../tests/fixtures/wardley/pipeline/pipeline-depth-output.mmd)):

```mmd
wardley-beta
  component Parent [0.4, 0.5]
  pipeline Parent {
    component Child [0.6] label [-1, 2]
  }
```

### 文を 1 行ずつにする

普通の文は 1 行ずつにして、必須の EOL を保ちます。
Wardley のセミコロンは文の区切りではないので足しません。
値の内部の見かけの文は、木が区別した値のテキストとして残します。

[fixture: wardley/statements-one-per-line/statement-eol]

入力（escaped）:
`"wardley-beta\nanchor Sep [0.8,0.2]\ncomponent Step [0.2,0.4]"`.

出力
([statements-one-per-line/statement-eol-output.mmd](../tests/fixtures/wardley/statements-one-per-line/statement-eol-output.mmd)):

```mmd
wardley-beta
  anchor Sep [0.8, 0.2]
  component Step [0.2, 0.4]
```

### 部品間の空白

命令語と最初の完全な名前、数、文字列、括弧の間は空白 1 つにします。
pipeline も含め、接した keyword にも同じ規則を使います。
keyword に末尾境界がなく、木が名前と区別しているためです。
trivia と hidden の境界には普通の空白規則を当てません。

[fixture: wardley/component-spacing/keyword-anchor]

[fixture: wardley/component-spacing/keyword-component]

[fixture: wardley/component-spacing/keyword-evolve]

[fixture: wardley/component-spacing/keyword-note]

[fixture: wardley/component-spacing/keyword-annotations]

[fixture: wardley/component-spacing/keyword-annotation]

[fixture: wardley/component-spacing/keyword-accelerator]

[fixture: wardley/component-spacing/keyword-deaccelerator]

[fixture: wardley/component-spacing/keyword-evolution]

入力（escaped）:
`"wardley-beta\nanchorUser[0.8,0.3]"`.

出力
([component-spacing/keyword-anchor-output.mmd](../tests/fixtures/wardley/component-spacing/keyword-anchor-output.mmd)):

```mmd
wardley-beta
  anchor User [0.8, 0.3]
```

[corpus fixture: wardley/keywords-all-glued]

### 名前と引用

WardleyIdentifier と StringLiteral は source span のまま印字します。
内部の空白とタブ、ハイフン、括弧、ampersand、引用符、escape、
空と空白だけの文字列も保ち、singleQuote では書き換えません。
名前の空白を畳むことと文字列の trim は Db を変えます。
Db が同じ引用符への変更も、原綴を失い escape の再解釈が必要です。

[fixture: wardley/names-and-quotes/name-spaces]

[fixture: wardley/names-and-quotes/name-parenthesis-ampersand]

[fixture: wardley/names-and-quotes/name-quotes-empty]

[fixture: wardley/names-and-quotes/string-escape]

[fixture: wardley/names-and-quotes/name-hyphen]

入力（escaped）:
`"wardley-beta\ncomponent Foo  Bar\tBaz [0.3,0.6]"`.

出力
([names-and-quotes/name-spaces-output.mmd](../tests/fixtures/wardley/names-and-quotes/name-spaces-output.mmd)):

```mmd
wardley-beta
  component Foo  Bar	Baz [0.3, 0.6]
```

### 名前の境界

普通の名前と後続部品の間は空白 1 つにします。
ただし bare 名がちょうど title のときは、座標、pipeline の括弧、
evolve の数、矢印、port、@、/ との接し方を保ちます。
title の後の空白で metadata として読まれるためです。
引用した "title" と bare の titlex は普通に空白を置きます。
大文字の名前は名前のままです。

[fixture: wardley/name-boundaries/component-title-contact]

[fixture: wardley/name-boundaries/anchor-title-contact]

[fixture: wardley/name-boundaries/force-title-contact]

[fixture: wardley/name-boundaries/pipeline-title-contact]

[fixture: wardley/name-boundaries/link-title-contact]

[fixture: wardley/name-boundaries/stage-title-contact]

[fixture: wardley/name-boundaries/title-prefix-safe]

[fixture: wardley/name-boundaries/quoted-title]

[fixture: wardley/name-boundaries/title-link-port]

[fixture: wardley/name-boundaries/title-stage-slash]

[fixture: wardley/name-boundaries/title-evolve-hidden]

入力（escaped）:
`"wardley-beta\ncomponent title[0.3,0.6]"`.

出力
([name-boundaries/component-title-contact-output.mmd](../tests/fixtures/wardley/name-boundaries/component-title-contact-output.mmd)):

```mmd
wardley-beta
  component title[0.3, 0.6]
```

[corpus fixture: wardley/evolution-upper]

### 座標

座標は [a, b] とし、内端と comma の前は詰め、後は空白 1 つにします。
Db が同じ空白の形から、区切りを読みやすい形を選びます。
visibility、evolution の順と整数・小数の原綴を保ちます。
hidden と global trivia の gap には共有規則を使います。

[fixture: wardley/coordinates/coordinates-decimal]

[fixture: wardley/coordinates/coordinates-integer]

入力（escaped）:
`"wardley-beta\nanchor Coord [ 0.3 \t,\t 0.6 ]"`.

出力
([coordinates/coordinates-decimal-output.mmd](../tests/fixtures/wardley/coordinates/coordinates-decimal-output.mmd)):

```mmd
wardley-beta
  anchor Coord [0.3, 0.6]
```

### 数

NumericLiteral は double 値を文字列化せず、source span を印字します。
小数の先頭と末尾のゼロ、精度、丸められる境界、非正規化数、
underflow、受理される overflow を保ちます。
01.00 を 1 にすると、小数必須の位置で拒否されます。
百分率への変換も作者の単位を失うため行いません。
拒否される先頭ゼロの整数は修復しません。

[fixture: wardley/numbers/decimal-leading-zero]

[fixture: wardley/numbers/integer-precision]

[corpus fixture: wardley/db-number-overflow]

[corpus fixture: wardley/db-number-subnormal]

[corpus fixture: wardley/db-number-underflow]

[corpus fixture: wardley/db-coordinate-double-one]

[corpus fixture: wardley/db-coordinate-double-hundred]

入力（escaped）:
`"wardley-beta\ncomponent Digits [000.30,01.00]"`.

出力
([numbers/decimal-leading-zero-output.mmd](../tests/fixtures/wardley/numbers/decimal-leading-zero-output.mmd)):

```mmd
wardley-beta
  component Digits [000.30, 01.00]
```

[corpus fixture: wardley/number-int-leading-zero]

### 装飾

label offset、strategy、inertia は書かれたものを文法上の順に保ちます。
装飾の外側は空白 1 つ、括弧の内側は詰めます。
bare inertia と (inertia)、build、buy、outsource、market を保ちます。
inertia の両形は Db が同じでも、変更すると書かれたノード形を失います。
既定値は補いません。

[fixture: wardley/decorations/decorations-all]

[fixture: wardley/decorations/decorations-bare]

[fixture: wardley/decorations/decorations-strategies]

[fixture: wardley/decorations/label-only]

[fixture: wardley/decorations/bare-inertia-only]

[fixture: wardley/decorations/parenthesized-inertia-only]

[fixture: wardley/decorations/label-strategy]

[fixture: wardley/decorations/label-bare-inertia]

[fixture: wardley/decorations/label-parenthesized-inertia]

[fixture: wardley/decorations/strategy-parenthesized-inertia]

[fixture: wardley/decorations/label-strategy-bare-inertia]

入力（escaped）:
`"wardley-beta\ncomponent Decor[0.3,0.6]label[1,-2]( build )( inertia )"`.

出力
([decorations/decorations-all-output.mmd](../tests/fixtures/wardley/decorations/decorations-all-output.mmd)):

```mmd
wardley-beta
  component Decor [0.3, 0.6] label [1, -2] (build) (inertia)
```

### label offset

label [-1, 2] とし、普通の minus は符号なし整数の大きさに付けます。
-0 も符号を残し、数の原綴を保ちます。
符号を離しても Db は同じですが、付けることで対象を明確にします。
符号と数の間の hidden と global trivia の境界は保ちます。

[fixture: wardley/label-offsets/offset-sign-gap]

[fixture: wardley/label-offsets/offset-negative-zero]

入力（escaped）:
`"wardley-beta\ncomponent Sign[0.3,0.6]label[ - 1 , -\t2 ]"`.

出力
([label-offsets/offset-sign-gap-output.mmd](../tests/fixtures/wardley/label-offsets/offset-sign-gap-output.mmd)):

```mmd
wardley-beta
  component Sign [0.3, 0.6] label [-1, -2]
```

### link

木の完全な名前、port、矢印の間は、矢印のない link も空白 1 つにします。
port と矢印の原綴は保ちます。
A-->B は名前 A- と矢印 -> なので A- -> B と印字します。
原文の字面から矢印を探しません。
A -->B の矢印は --> のままです。
解析済みの部品を空白で見えるようにします。

[fixture: wardley/links/link-short]

[fixture: wardley/links/link-long-glued]

[fixture: wardley/links/link-long-spaced]

[fixture: wardley/links/link-dotted]

[fixture: wardley/links/link-minimal]

[fixture: wardley/links/link-quoted-long]

[fixture: wardley/links/link-no-arrow]

[fixture: wardley/links/link-source-forward]

[fixture: wardley/links/link-source-backward]

[fixture: wardley/links/link-source-both]

[fixture: wardley/links/link-target-no-arrow]

[fixture: wardley/links/link-both-ports]

[fixture: wardley/links/link-multiword]

入力（escaped）:
`"wardley-beta\nAlpha->Beta"`.

出力
([links/link-short-output.mmd](../tests/fixtures/wardley/links/link-short-output.mmd)):

```mmd
wardley-beta
  Alpha -> Beta
```

### flow

[test: wardley/flows/unicode-flow]

+'label'>、+'label'<、+'label'<> の内側は書かれたまま保ちます。
空ラベル、padding、backslash、継続行の列も含みます。
完全な部品間の Root directive の境界も保ちます。
普通の空白を挿入すると複合単位が拒否され、trim は Db を変えます。
flow の優先順位で見えなくても、両 port とセミコロンラベルを残します。

[fixture: wardley/flows/flow-forward]

[fixture: wardley/flows/flow-backward]

[fixture: wardley/flows/flow-both]

[fixture: wardley/flows/flow-empty]

[fixture: wardley/flows/flow-padding-escapes]

[fixture: wardley/flows/flow-derived-direction]

[fixture: wardley/flows/flow-derived-dotted]

[fixture: wardley/flows/flow-ports-and-label]

入力（escaped）:
`"wardley-beta\nAlpha+'moving'>Beta"`.

出力
([flows/flow-forward-output.mmd](../tests/fixtures/wardley/flows/flow-forward-output.mmd)):

```mmd
wardley-beta
  Alpha +'moving'> Beta
```

### セミコロンのラベル

文法上のラベル開始 ; は前の部品に付け、
後ろは物理行末まで source span のまま印字します。
Db が同じ形から、link に属する区切りと分かる接した形を選びます。
padding を足したり trim したりしません。
; の後が空白なら空白だけのラベルとして受理され、裸の ; は拒否されます。
後続のセミコロンには共有の prefix 保護を使います。
native に見える形と percent テキストもラベルのままです。

[fixture: wardley/semicolon-labels/label-exterior]

[fixture: wardley/semicolon-labels/label-whitespace]

[fixture: wardley/semicolon-labels/label-two-semicolons]

[fixture: wardley/semicolon-labels/label-apparent-syntax]

[fixture: wardley/semicolon-labels/label-comment-native]

入力（escaped）:
`"wardley-beta\nAlpha->Beta;; extra"`.

出力
([semicolon-labels/label-two-semicolons-output.mmd](../tests/fixtures/wardley/semicolon-labels/label-two-semicolons-output.mmd)):

```mmd
wardley-beta
  Alpha->Beta;; extra
```

### evolve

evolve Name 0.80 とし、部品間は空白 1 つにします。
書かれた参照と小数、空の引用名、未反映の target を保ちます。
ID が存在しなくても文を消しません。
bare 名と数を結ぶと拒否されることがあります。

[fixture: wardley/evolves/evolve-numeric-gap]

[fixture: wardley/evolves/evolve-empty-name]

入力（escaped）:
`"wardley-beta\ncomponent Motion[0.3,0.6]\nevolveMotion\t0.80"`.

出力
([evolves/evolve-numeric-gap-output.mmd](../tests/fixtures/wardley/evolves/evolve-numeric-gap-output.mmd)):

```mmd
wardley-beta
  component Motion [0.3, 0.6]
  evolve Motion 0.80
```

### note と annotation

note、annotations、annotation、force の部品間は空白 1 つにします。
annotation の外側の comma も前を詰め、後を空白 1 つにします。
列を揃えず、座標の句読法と同じ選択にします。
空文字、番号 0、整数と小数の座標、後続の検査されない box を保ちます。

[fixture: wardley/notes-and-annotations/note-spacing]

[fixture: wardley/notes-and-annotations/annotation-spacing]

[fixture: wardley/notes-and-annotations/annotation-empty]

[fixture: wardley/notes-and-annotations/annotations-later]

[fixture: wardley/notes-and-annotations/force-spacing]

入力（escaped）:
`"wardley-beta\nnote\t\"Body\"[ 0.3 ,0.6 ]"`.

出力
([notes-and-annotations/note-spacing-output.mmd](../tests/fixtures/wardley/notes-and-annotations/note-spacing-output.mmd)):

```mmd
wardley-beta
  note "Body" [0.3, 0.6]
```

### evolution

@ は両側を詰め、/ と stage の矢印 -> の左右は空白 1 つにします。
任意の boundary と第 2 名、空の引用名、stage の原順を保ちます。
付属する印と区切りを見やすくし、欠けた値は補いません。
bare の title には Name boundaries を適用します。

[fixture: wardley/evolution/stage-all-gaps]

[fixture: wardley/evolution/stage-no-boundary]

[fixture: wardley/evolution/stage-partial-boundary]

[fixture: wardley/evolution/stage-empty-names]

[fixture: wardley/evolution/stage-long-arrow-glued]

[fixture: wardley/evolution/stage-title-arrow]

入力（escaped）:
`"wardley-beta\nevolution  Early  @ 0.20/ Concept->Late@1.00 / Utility"`.

出力
([evolution/stage-all-gaps-output.mmd](../tests/fixtures/wardley/evolution/stage-all-gaps-output.mmd)):

```mmd
wardley-beta
  evolution Early@0.20 / Concept -> Late@1.00 / Utility
```

### size

size [800, 600] とし、座標と同じ括弧の形にします。
2 つの整数の source span を保ち、0 も残します。
実効的な描画寸法で文を置き換えず、数の組の表記を揃えます。

[fixture: wardley/size/size-spacing]

[fixture: wardley/size/size-zero]

入力（escaped）:
`"wardley-beta\nsize[ 800 \t,\t 600 ]"`.

出力
([size/size-spacing-output.mmd](../tests/fixtures/wardley/size/size-spacing-output.mmd)):

```mmd
wardley-beta
  size [800, 600]
```

### title

共有の common-line layout を使い、空でない値の前は空白 1 つにします。
普通の外端の共通空白は trim し、閉じない引用符も内部の文字として保ちます。
空の title は空のままで、次の行を値にしません。
値を引用文字列として扱わず、Db が同じ端の形を簡潔にします。

[fixture: wardley/title/title-trim]

[fixture: wardley/title/title-empty]

[fixture: wardley/title/title-quotes]

[fixture: wardley/title/title-next-line]

入力（escaped）:
`"wardley-beta\ntitle\t  A  subject \t"`.

出力
([title/title-trim-output.mmd](../tests/fixtures/wardley/title/title-trim-output.mmd)):

```mmd
wardley-beta
  title A  subject
```

### アクセシビリティ

[test: wardley/accessibility/unicode-empty-description]

accTitle: Value と accDescr: Value は共有の行 layout を使います。
空の代入も残します。
説明ブロックは共有の description layout を通します。
括弧との接し方を保ち、空白だけの内部は {} にします。
普通の opener 前の空白は結び、値の列は保ち、独立した closer を揃えます。
trivia は共有の継続行 layout を使います。
Db が同じ共通の形を選び、空白だけの内部には囲むテキストがありません。

[fixture: wardley/accessibility/access-lines]

[fixture: wardley/accessibility/access-empty]

[fixture: wardley/accessibility/description-tight]

[fixture: wardley/accessibility/description-edges]

[fixture: wardley/accessibility/description-empty]

[fixture: wardley/accessibility/description-opener-newline]

[fixture: wardley/accessibility/description-closer]

[fixture: wardley/accessibility/description-comment-only]

[fixture: wardley/accessibility/description-directive-only]

入力（escaped）:
`"wardley-beta\naccTitle \t:  A  B \t\naccDescr\t:  C  D \t"`.

出力
([accessibility/access-lines-output.mmd](../tests/fixtures/wardley/accessibility/access-lines-output.mmd)):

```mmd
wardley-beta
  accTitle: A  B
  accDescr: C  D
```

### hidden form

WardleyIgnoredText は木の owner で、range の原文を 1 回だけ印字します。
保持 prefix、本文、部品の gap、pipeline の開き部と本文、suffix が対象です。
value は共通除去を省くため、それから再構築しません。
hidden YAML と directive の内部と closer の列は保ちます。
先に読む文字列と値の内部はその値、失敗した native 形はコメントのままです。
3 fence の一致、別々の一致、後の適格な closer も保ちます。

[fixture: wardley/hidden-forms/hidden-body-directive]

[fixture: wardley/hidden-forms/hidden-body-yaml]

[fixture: wardley/hidden-forms/hidden-keyword-name]

[fixture: wardley/hidden-forms/hidden-coordinate]

[fixture: wardley/hidden-forms/hidden-sign]

[fixture: wardley/hidden-forms/hidden-stage]

[fixture: wardley/hidden-forms/hidden-pipeline-body]

[fixture: wardley/hidden-forms/hidden-three-fences]

[fixture: wardley/hidden-forms/hidden-two-yaml]

[fixture: wardley/hidden-forms/hidden-later-closer]

[fixture: wardley/hidden-forms/hidden-failed-comment]

[corpus fixture: wardley/hidden-all-unit-gaps]

入力（escaped）:
`"wardley-beta\n%%{!native}%%\ncomponent HiddenBody[0.3,0.6]"`.

出力
([hidden-forms/hidden-body-directive-output.mmd](../tests/fixtures/wardley/hidden-forms/hidden-body-directive-output.mmd)):

```mmd
wardley-beta
  %%{!native}%%
  component HiddenBody [0.3, 0.6]
```

[corpus fixture: wardley/hidden-directive-string]

[corpus fixture: wardley/hidden-yaml-string]

[corpus fixture: wardley/hidden-yaml-block]

[corpus fixture: wardley/directive-native-opener-split]

[corpus fixture: wardley/lex-hidden-yaml-comment-region]

### hidden の境界

range 外で消費する LF、inline の接触、closer 後の空白とタブには、
共有の hidden-gap と block 規則を使い、EOF の padding も保ちます。
suffix が LF を消費したら次の文に予備の可視 LF が必要です。
closer の padding があれば最初の LF が可視のままになります。
見出しに可視 EOL が不要な例外は、見出し自身の form だけに適用します。
最初の文が同じ行に残っても、その文には本文側の規則を使います。
pipeline の opener と子文にも可視 LF を保ちます。
可視 EOL 後の form は本文の項目です。
複数 suffix と YAML の境界を保ち、保護テキストの中に段を足しません。
hidden form が見出し行を保つときは、pipeline の開きもその行に保ちます。

[fixture: wardley/hidden-boundaries/meeting-inline-directive-directive]

[fixture: wardley/hidden-boundaries/meeting-inline-directive-yaml]

[fixture: wardley/hidden-boundaries/meeting-directive-only-line-directive]

[fixture: wardley/hidden-boundaries/meeting-directive-only-line-yaml]

[fixture: wardley/hidden-boundaries/meeting-unselected-semicolon-directive]

[fixture: wardley/hidden-boundaries/meeting-unselected-semicolon-yaml]

[fixture: wardley/hidden-boundaries/meeting-ignored-value-semicolon-directive]

[fixture: wardley/hidden-boundaries/meeting-ignored-value-semicolon-yaml]

[fixture: wardley/hidden-boundaries/meeting-selected-gap-semicolon-directive]

[fixture: wardley/hidden-boundaries/meeting-selected-gap-semicolon-yaml]

[fixture: wardley/hidden-boundaries/meeting-comment-line-directive]

[fixture: wardley/hidden-boundaries/meeting-comment-line-yaml]

[test: wardley/hidden-boundaries/meeting-ls-in-form-directive]

[test: wardley/hidden-boundaries/meeting-ls-in-form-yaml]

[test: wardley/hidden-boundaries/meeting-ps-in-form-directive]

[test: wardley/hidden-boundaries/meeting-ps-in-form-yaml]

[fixture: wardley/hidden-boundaries/native-child-value]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-opening-directive]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-opening-yaml]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-child-directive]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-child-yaml]

[fixture: wardley/hidden-boundaries/hidden-spare-lf]

[fixture: wardley/hidden-boundaries/hidden-closing-space]

[fixture: wardley/hidden-boundaries/hidden-header-no-spare]

[fixture: wardley/hidden-boundaries/hidden-pipeline-opening]

[fixture: wardley/hidden-boundaries/hidden-pipeline-child]

[fixture: wardley/hidden-boundaries/hidden-eof-space]

[fixture: wardley/hidden-boundaries/yaml-suffix-space]

[fixture: wardley/hidden-boundaries/yaml-suffix-spare]

[fixture: wardley/hidden-boundaries/hidden-after-visible-eol]

[fixture: wardley/hidden-boundaries/hidden-two-suffixes]

[fixture: wardley/hidden-boundaries/header-hidden-spare]

[fixture: wardley/hidden-boundaries/header-first-statement-hidden]

[fixture: wardley/hidden-boundaries/pipeline-opening-space]

[fixture: wardley/hidden-boundaries/pipeline-child-space]

[fixture: wardley/hidden-boundaries/pipeline-after-close]

[fixture: wardley/hidden-boundaries/pipeline-opening-yaml]

[fixture: wardley/hidden-boundaries/pipeline-child-yaml]

[fixture: wardley/hidden-boundaries/pipeline-body-before-close]

入力（escaped）:
`"wardley-beta\ncomponent Spare[0.3,0.6]%%{!end}%%\n\ncomponent After[0.4,0.7]"`.

出力
([hidden-boundaries/hidden-spare-lf-output.mmd](../tests/fixtures/wardley/hidden-boundaries/hidden-spare-lf-output.mmd)):

```mmd
wardley-beta
  component Spare [0.3, 0.6]%%{!end}%%

  component After [0.4, 0.7]
```

[fixture: wardley/hidden-boundaries/hidden-closing-tab]

[fixture: wardley/hidden-boundaries/wardley-pipeline-opening-semicolon]

[fixture: wardley/hidden-boundaries/wardley-pipeline-opening-selected-semicolon]

[fixture: wardley/hidden-boundaries/wardley-pipeline-child-before-closer]

[fixture: wardley/hidden-boundaries/wardley-pipeline-closer-semicolon]

[fixture: wardley/hidden-boundaries/wardley-pipeline-opening-hidden-spare-lf]

[fixture: wardley/hidden-boundaries/wardley-pipeline-closer-hidden-spare-lf]

### global directive

Root directive の原文、順、owner を保ちます。
同じ印字行の中では、両側の接触・分離を保ちます。
元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
普通の独立行は本文の段に揃え、
複数行の内部と EOF に達する未完の終端は保ちます。
JSON 整形や順の入れ替えはしません。
共通除去が両側の文字を結び、受理や値を変えることがあるためです。
native の hidden directive は別のノードです。

[fixture: wardley/global-directives/header-to-body]

[fixture: wardley/global-directives/global-keyword-contact]

[fixture: wardley/global-directives/global-separated]

[fixture: wardley/global-directives/global-value]

[fixture: wardley/global-directives/global-flow-components]

[fixture: wardley/global-directives/global-coordinate-sign]

[fixture: wardley/global-directives/global-standalone]

[fixture: wardley/global-directives/global-right-separated]

[fixture: wardley/global-directives/global-left-separated]

[fixture: wardley/global-directives/global-multiline]

[fixture: wardley/global-directives/global-unclosed]

入力（escaped）:
`"wardley-beta\ncomponent%%{wrap}%%Glued[0.3,0.6]"`.

出力
([global-directives/global-keyword-contact-output.mmd](../tests/fixtures/wardley/global-directives/global-keyword-contact-output.mmd)):

```mmd
wardley-beta
  component%%{wrap}%%Glued [0.3, 0.6]
```

### コメント

[test: wardley/comments/native-separators]

普通の独立コメントは所属する本文の段、見出し前は第 1 列に揃えます。
inline は同じ行と接触側を保ち、離れた gap は空白 1 つにします。
mark、本文、末尾 padding を保ち、pipeline 内では子文の段にします。
文字列、flow、link ラベルの percent テキストはその値に残します。
共通の comment-region の結合は原文の列を保ち、owner の変化を防ぎます。

[fixture: wardley/comments/comment-standalone]

[fixture: wardley/comments/comment-inline-contact]

[fixture: wardley/comments/comment-inline-separated]

[fixture: wardley/comments/comment-pipeline]

[fixture: wardley/comments/comment-triple-bare]

入力（escaped）:
`"wardley-beta\ncomponent InlineSpace[0.3,0.6] \t%% tail"`.

出力
([comments/comment-inline-separated-output.mmd](../tests/fixtures/wardley/comments/comment-inline-separated-output.mmd)):

```mmd
wardley-beta
  component InlineSpace [0.3, 0.6] %% tail
```

### 空行

普通の ASCII 空行は文と trivia の間で最大 1 行にします。
文書と本文の端の余分な空行と、空白だけの padding は落とします。
pipeline の端も必須の可視 LF を残して空行を除きます。
作者のまとまりを 1 行で示す選択です。
値、hidden と directive の内部、保持 prefix、保護区間、
必須の hidden LF には、それぞれの保持規則を使います。

[fixture: wardley/blank-lines/blanks-collapse]

[fixture: wardley/blank-lines/blanks-pipeline]

[fixture: wardley/blank-lines/blanks-comments]

入力（escaped）:
`"\n\nwardley-beta\n\n\ncomponent GroupA[0.3,0.6]\n \t\n\n\ncomponent GroupB[0.4,0.7]\n\n"`.

出力
([blank-lines/blanks-collapse-output.mmd](../tests/fixtures/wardley/blank-lines/blanks-collapse-output.mmd)):

```mmd
wardley-beta
  component GroupA [0.3, 0.6]

  component GroupB [0.4, 0.7]
```

### 行末の空白

見出し、完結した構造、説明の closer の外の無害な ASCII padding は落とします。
owner ごとに判断し、link ラベルの末尾、文字列と flow、コメント、
directive、hidden の内部、必須の closer padding、保護区間は保ちます。
物理行を一律に trim すると、Db が変わるか空白だけのラベルが拒否されます。

[fixture: wardley/trailing-whitespace/trailing-exterior]

[fixture: wardley/trailing-whitespace/trailing-string]

[fixture: wardley/trailing-whitespace/trailing-blank-label-keep]

入力（escaped）:
`"wardley-beta \t\ncomponent Tail[0.3,0.6] \t\naccDescr { End } \t"`.

出力
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/wardley/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
wardley-beta
  component Tail [0.3, 0.6]
  accDescr { End }
```

### セミコロン

Root directive を除いた後で literal の style か classDef を含む原文行は、
発火しない語の行も含め、共有の行保護で丸ごと保ちます。
文、コメント、hidden form を同じ行に残し、前後の行と結びません。
最初の行は本文の段に揃え、中身と後続行の列は保ちます。
directive をまたぐ語と U+2028/U+2029 後の comment region も、
mermaid が 1 行として読む範囲で数えます。
行規則が文法上のラベル開始も無視しうるため、
行全体を保つことで、移動後の選択を予測する必要をなくします。
書かれたセミコロンはすべて保ちます。
文法上のラベル開始だけは共有の textual-prefix 保護から除きます。
ほかのセミコロンは区間の最後のセミコロンまでと、
交差する値と trivia 全体を原文のまま保護します。
除去される Root directive の内部だけにある語は、行全体を保護する理由にしません。

[fixture: wardley/semicolons/style-label]

[fixture: wardley/semicolons/style-selected-delimiter]

[fixture: wardley/semicolons/classdef-selected-delimiter]

[fixture: wardley/semicolons/style-classdef-two-passes]

[fixture: wardley/semicolons/style-colon-space-nontrigger]

[fixture: wardley/semicolons/style-uppercase-nontrigger]

[fixture: wardley/semicolons/style-no-semicolon]

[fixture: wardley/semicolons/style-inside-global]

[fixture: wardley/semicolons/style-directive-rejoined]

[fixture: wardley/semicolons/style-directive-lines]

[fixture: wardley/semicolons/style-header-group]

[fixture: wardley/semicolons/style-header-delimiter]

[fixture: wardley/semicolons/style-hidden-value-last-line]

[test: wardley/semicolons/style-comment-ls-connected]

[test: wardley/semicolons/classdef-comment-ps-connected]

[fixture: wardley/semicolons/semicolon-value-no-style]

[fixture: wardley/semicolons/style-name-semicolon-padding]

[fixture: wardley/semicolons/style-delimiter-hash-after]

[fixture: wardley/semicolons/classdef-unclosed-directive]

[test: wardley/semicolons/style-comment-both-connected]

[test: wardley/semicolons/style-comment-before-connected]

[test: wardley/semicolons/classdef-comment-both-connected]

[test: wardley/semicolons/classdef-comment-before-connected]

[fixture: wardley/semicolons/style-pipeline-header]

[fixture: wardley/semicolons/style-pipeline-child]

[fixture: wardley/semicolons/style-trivia-line]

入力（escaped）:
`"wardley-beta\nAlpha  -> Beta; style:#tone;"`.

出力
([semicolons/style-label-output.mmd](../tests/fixtures/wardley/semicolons/style-label-output.mmd)):

```mmd
wardley-beta
  Alpha  -> Beta; style:#tone;
```

### 複数行の値

printWidth では折り返しません。
文字列、flow、説明の物理的な中身、継続行の列、内部の空行を保ちます。
普通の文の部品間の可視 LF は拒否され、値の継続行の字下げは Db を変えます。
長い component と evolution の行も折り返しません。
説明の opener と closer には Accessibility を使います。

[fixture: wardley/multiline-values/long-component]

[fixture: wardley/multiline-values/long-evolution]

[fixture: wardley/multiline-values/multiline-string-columns]

[fixture: wardley/multiline-values/multiline-flow-columns]

入力（escaped）:
`"wardley-beta\ncomponent A very long component name with repeated words[0.123456789012345,0.987654321098765]label[-13,24](build)inertia"`.

Options: `{"printWidth":20}`.

出力
([multiline-values/long-component-output.mmd](../tests/fixtures/wardley/multiline-values/long-component-output.mmd)):

```mmd
wardley-beta
  component A very long component name with repeated words [0.123456789012345, 0.987654321098765] label [-13, 24] (build) inertia
```

### フロントマターの YAML

安全な実フロントマターだけ、共有の guarded YAML formatter を使います。
不正な YAML、字下げした fence、区切りの padding、HTML の危険、
整形で fence を作る本文は書かれたまま保ちます。
YAML は幅 0 でも共有の正の最小字下げを使います。
textBeforeHeader があれば、先頭 LF、通過した trivia、second-scan form、
実 form と保持 form の順を含め、完全な prefix を保ちます。
共有の keepsPrefix により、無視する YAML が実フロントマターになって
設定や title を変えることを防ぎます。

[fixture: wardley/frontmatter-yaml/frontmatter-safe]

[fixture: wardley/frontmatter-yaml/retained-prefix]

[fixture: wardley/frontmatter-yaml/frontmatter-html-keep]

[fixture: wardley/frontmatter-yaml/prefix-secondscan]

[fixture: wardley/frontmatter-yaml/frontmatter-indented-keep]

[fixture: wardley/frontmatter-yaml/frontmatter-scalar-minimum]

[fixture: wardley/frontmatter-yaml/frontmatter-malformed]

[fixture: wardley/frontmatter-yaml/frontmatter-padding]

[fixture: wardley/frontmatter-yaml/frontmatter-fence-guard]

入力（escaped）:
`"---\ntitle: 'Map'\nconfig: {wardley: {width: 600}}\n---\nwardley-beta\ncomponent Fm[0.3,0.6]"`.

出力
([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/wardley/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: "Map"
config: { wardley: { width: 600 } }
---
wardley-beta
  component Fm [0.3, 0.6]
```

### 改行と Unicode

共有の host 方針で CR/CRLF を LF として読み、設定の改行で印字します。
値と hidden form の内部も同様です。
LS/PS/NBSP/BOM は字句上の役割を保ちます。
例外は共有の common 値の外端 trim と普通の description opener の空白です。
一般の padding に変えると、Db を変えるか拒否入力を修復してしまいます。
先頭 BOM は Prettier が除去・復元するため、
元のフロントマターの判定と byte 一致は保証しません。

[test: wardley/line-terminators-and-unicode/cr-structure]

[test: wardley/line-terminators-and-unicode/crlf-string]

[test: wardley/line-terminators-and-unicode/output-crlf]

[test: wardley/line-terminators-and-unicode/output-cr]

[test: wardley/line-terminators-and-unicode/unicode-values]

[test: wardley/line-terminators-and-unicode/unicode-common-trim]

[test: wardley/line-terminators-and-unicode/hidden-crlf]

[test: wardley/line-terminators-and-unicode/leading-bom]

[corpus fixture: wardley/space-nbsp-body]

### 原順

文、子文、stage、装飾、参照、空の代入を、全出現とともに原順で保ちます。
繰り返した宣言と pipeline、未反映の evolve、最初の annotations box、
最後の size、evolution、共通代入も書かれたまま残します。
実効 Db から再構築しません。
並べ替えや削除は読みを変え、作者の選択を失うためです。

[fixture: wardley/source-order/order-repeated-components]

[fixture: wardley/source-order/order-common-reset]

[fixture: wardley/source-order/order-pipeline-stages]

入力（escaped）:
`"wardley-beta\ncomponent Zorder[0.3,0.6]\ncomponent Aorder[0.4,0.7]\ncomponent Zorder[0.5,0.8]"`.

出力
([source-order/order-repeated-components-output.mmd](../tests/fixtures/wardley/source-order/order-repeated-components-output.mmd)):

```mmd
wardley-beta
  component Zorder [0.3, 0.6]
  component Aorder [0.4, 0.7]
  component Zorder [0.5, 0.8]
```

[corpus fixture: wardley/db-pipeline-duplicates]

[corpus fixture: wardley/db-singletons-last]

[corpus fixture: wardley/db-trend-missing]

### 最終改行

普通の受理ファイルは設定の改行 1 個で終え、末尾の普通の空行を落とします。
見出しだけ、コメント、閉じた hidden form も同じ終端に揃えます。
EOF に達する global 終端、保持 prefix の境界、保護テキスト、
必須の hidden closer padding を優先します。
ラベルの padding は値であり、末尾の余分な空行として落としません。

[corpus fixture: wardley/header-only]

[fixture: wardley/final-newline/final-comment]

[fixture: wardley/final-newline/final-hidden]

入力（escaped）:
`"wardley-beta\n%% final"`.

出力
([final-newline/final-comment-output.mmd](../tests/fixtures/wardley/final-newline/final-comment-output.mmd)):

```mmd
wardley-beta
  %% final
```

### 仕様による読み

[test: wardley/specified-readings/passed-unicode]

既存の 6 差異を適用します。
directive-as-token-boundary、ignored-semicolon-as-token-boundary、
html-tag-in-frontmatter、embedded-data-opaque、
bare-percent-line-before-header、c4-keyword-anywhere です。
Wardley 固有の opaque な受理設定キーはありません。
raw の拒否に raw Db はなく、
利用できる specified reading と埋め込み効果を使います。
単独ファイルの解析失敗は出力せず構文エラーにし、
Markdown では埋め込みを断ります。
拒否構文は修復しません。

[corpus fixture: wardley/directive-arrow-inside]

[corpus fixture: wardley/lex-selected-decimal-inside]

[corpus fixture: wardley/div-html-frontmatter-reject]

[corpus fixture: wardley/config-fontfamily-keeps-title]

[corpus fixture: wardley/bare-before-ls]

[corpus fixture: wardley/c4-component-component]

[corpus fixture: wardley/number-int-leading-zero]

[corpus fixture: wardley/directive-keyword-middle]

[corpus fixture: wardley/gram-replaced-invalid-node]

### Markdown のフェンス

共有の Markdown 接続で、段を除いた payload に同じ規則を適用します。
fence、list、quote の列は host が付け、最後の code 行の padding を落とします。
特に HostSource -> HostTarget; の後の空白だけのラベルを落とすと、
裸の ; が残り、Wardley が payload を拒否します。
単独ファイルではその padding を保ちます。
ラベルを書き換える規則は加えず、既存の Markdown host の制限として記録します。
実際の host 出力と 3 回の冪等性は、単独 payload の Db 比較とは別に検査します。

[test: wardley Markdown: top-level]

[test: wardley Markdown: list]

[test: wardley Markdown: quote]

[test: wardley Markdown: zero]

[test: wardley Markdown: tabs]

[test: wardley Markdown: hidden-boundary]

[test: wardley Markdown: prefix]

[test: wardley Markdown: frontmatter]

[test: wardley Markdown: final-whitespace-label]

[test: wardley Markdown: final-hidden-padding]

[test: wardley Markdown: rejected]

入力:

````markdown
```mermaid
wardley-betacomponentFenced[0.3,0.6]
```
````

出力:

````markdown
```mermaid
wardley-beta
  component Fenced [0.3, 0.6]
```
````
