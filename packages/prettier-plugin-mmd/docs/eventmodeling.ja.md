# Eventmodeling formatting

English version: [eventmodeling.md](./eventmodeling.md)

`eventmodeling` の整形規則です。
[構文](../../spec/docs/diagrams/eventmodeling.ja.md)、
[木](../../spec/docs/ast/eventmodeling.ja.md)、
共有の[互換性の制限](./compatibility.ja.md) に従います。

共有 factory と blocks・atoms・hidden-gap 経路を使います。
GWT は閉じ記号を作らず、範囲で終わる本文を 2 段使います。
共通 terminal と data の字句境界は、行と字下げを選ぶ段階へ渡します。

## Rules

### Header

`eventmodeling` は第 1 列に置き、普通の最初の文を次の行へ移して、
見出しを見つけやすくします。
hidden form、保持 prefix、保護行は共有の規則に従い、
見出しの行が保つ行なら最初の文もその行に残します。
同じ項目を図種の間で同じように扱うためです。
最初の共通文は接続と前置の空白を保ちます。
行頭へ移すと identifier が優先され、拒否される場合があるためです。

[fixture: eventmodeling/header/ordinary-frame]

[fixture: eventmodeling/hidden-forms/body-hidden-yaml-no-visible-eol-needed]

[fixture: eventmodeling/header/ordinary-frame-with-native-directive]

[fixture: eventmodeling/semicolons/semicolon-inside-inline-data-protected]

[fixture: eventmodeling/header/empty-header]

[fixture: eventmodeling/header/first-title-preserved]

[fixture: eventmodeling/header/title-moved-to-line-start]

[fixture: eventmodeling/header/acctitle-moved-to-line-start]

[fixture: eventmodeling/header/accdescr-moved-to-line-start]

[fixture: eventmodeling/header/header-percent]

[fixture: eventmodeling/header/header-slash-boundary]

入力（escape 表記）: `"  eventmodeling tf 01 evt Alpha"`

出力
([header/ordinary-frame-output.mmd](../tests/fixtures/eventmodeling/header/ordinary-frame-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
```

入力（escape 表記）: `"eventmodeling tf 01 evt A %%{{x}}%%\n"`

出力
([header/ordinary-frame-with-native-directive-output.mmd](../tests/fixtures/eventmodeling/header/ordinary-frame-with-native-directive-output.mmd)):

```mmd
eventmodeling tf 01 evt A %%{{x}}%%
```

### Indentation

普通のトップレベルの文は、第 1 列から始めます。
frame、model entity、`data`、`note`、`gwt` が対象です。

固定している Mermaid は `data` と `note`
の閉じ波括弧の前の空白を受理しないため、見出しを閉じ波括弧にそろえ、
同じ階層の文も字下げせず、存在しない親子関係を示さないようにします。
固定している Mermaid が閉じ波括弧の前の空白を受理するようになったら、
本文の raw value と描画が変わらないことを確かめた上で、
トップレベルの字下げを再検討します。

GWT clause は設定の 1 段、item は 2 段にします。
`data` と `note` の見出しが完結する行も含め、
通常の構造の継続行はその文より 1 段深くします。
安全に字下げできる block 本文は、その継続した見出し行からさらに 1 段深くします。
列は親子を決めないため、`tabWidth: 0` では空白を足しません。
`useTabs` では幅が 0 でも 1 段に tab を 1 個使います。
値の継続列、metadata の空白、hidden が消費する LF の境界は、
[Data blocks](#data-blocks) の本文 margin 変更を除いて保ちます。

[fixture: eventmodeling/data-blocks/block-closer-indent-unsafe]

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

入力（escape 表記）: `"eventmodeling\ntf 01 evt Alpha\nrf 02 cmd Beta"`

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

普通の top-level AST 文は原順の各行へ分け、semicolon は足しません。
完全な単位の間に可視の EOL を要しない文法なので、
Db を変えずに境界を見せられます。
次が共通文なら先行単位との接続を保ちます。
greedy な inline data の中の見かけの文は、その値の一部のままです。
閉じた説明ブロックの後の普通の文は、新しい行へ分けます。

[fixture: eventmodeling/statements-one-per-line/adjacent-frame-reset-entity]

[fixture: eventmodeling/statements-one-per-line/frame-metadata-adjacency]

[fixture: eventmodeling/statements-one-per-line/metadata-split-unsafe]

[fixture: eventmodeling/statements-one-per-line/description-followed-by-frame]

[fixture: eventmodeling/statements-one-per-line/description-followed-by-common]

[fixture: eventmodeling/statements-one-per-line/do-not-manufacture-statement-from-greedy-data]

入力（escape 表記）:
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

frame keyword、数字の名前、entity-type、qualified name の間は、
元が native whitespace の改行でも普通の 1 space にします。
`01 evt` のように完全な部品を見分けるためです。
required identifier がちょうど `title` のときは成立する境界を保ちます。
普通の LF は継続行にし、hidden の消費 LF の後の空白は原文どおりです。
前置の空白を加えると、必要な名前が EM_TITLE になる場合があります。

[fixture: eventmodeling/frame-components/time-parts-glued-number-type]

[fixture: eventmodeling/frame-components/reset-all-parts]

[fixture: eventmodeling/frame-components/long-time-and-type]

[fixture: eventmodeling/frame-components/name-title-lf-protected]

[fixture: eventmodeling/frame-components/acc-identifiers-without-delimiters]

[fixture: eventmodeling/frame-components/hidden-before-required-title-identifier-keep-zero-indentation]

[test: eventmodeling/frame-components/required-title-unicode-gap]

[corpus fixture: eventmodeling/lex-name-title-after-lf]

入力（escape 表記）: `"eventmodeling tf 01evt Alpha"`

出力
([frame-components/time-parts-glued-number-type-output.mmd](../tests/fixtures/eventmodeling/frame-components/time-parts-glued-number-type-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
```

### Source references

完全な source arrow は `Name ->> 02 ->> 001` のように、
矢印の左右を普通の 1 space にして見分けやすくします。
全参照とその順序、先頭の 0 を保ち、逆転や解決はしません。
hidden の gap と global trivia は保護された境界を保ちます。

[fixture: eventmodeling/source-references/arrows-touching]

[fixture: eventmodeling/source-references/source-newlines-and-repetitions]

[fixture: eventmodeling/source-references/arrow-comment-contact]

入力（escape 表記）: `"eventmodeling tf 01 evt Alpha->>02->>001"`

出力
([source-references/arrows-touching-output.mmd](../tests/fixtures/eventmodeling/source-references/arrows-touching-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha ->> 02 ->> 001
```

### Data references

data reference の前は普通の 1 space、内側は `[[D]]` と詰め、
区切りを 1 組として読みやすくします。
部品間の普通の改行も詰めます。
`[[title]]` なら前置空白付きの title composite も作りません。
所有 gap の hidden と trivia は保ち、単一の参照名を qualified にしません。

[fixture: eventmodeling/data-references/reference-padded]

[fixture: eventmodeling/data-references/reference-component-lines]

[fixture: eventmodeling/data-references/reference-title-compact-valid]

[fixture: eventmodeling/data-references/reference-title-padding-unsafe]

[fixture: eventmodeling/data-references/reference-names-acctitle-accdescr]

入力（escape 表記）: `"eventmodeling tf 01 evt Alpha [[ \tD\t ]]"`

出力
([data-references/reference-padded-output.mmd](../tests/fixtures/eventmodeling/data-references/reference-padded-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha [[D]]
```

### Type tags

型タグの内側は `` `json` `` と詰め、本文の前は普通の 1 space にします。
注記と値を見分けるためです。
タグの有無と全 8 種の型語は原文どおり残します。
タグは payload を JSON などとして解釈する指示ではありません。
hidden と global trivia の境界は保ちます。

[fixture: eventmodeling/type-tags/inline-tag-parts]

[fixture: eventmodeling/type-tags/block-tag-parts]

[fixture: eventmodeling/type-tags/all-inline-tags-retained]

[fixture: eventmodeling/type-tags/tag-comments-retained]

[fixture: eventmodeling/type-tags/tag-absent-kept-absent]

[fixture: eventmodeling/type-tags/all-block-tags-retained]

入力（escape 表記）:
`"eventmodeling tf 01 evt Alpha \u0060 \tjson \t\u0060{ x }"`

出力
([type-tags/inline-tag-parts-output.mmd](../tests/fixtures/eventmodeling/type-tags/inline-tag-parts-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha `json` { x }
```

### Qualified names

qualified name の dot の普通の gap は改行や Unicode whitespace も詰め、
`Shop.Bought` にします。
dot は既存の identifier segment を接続する記号だからです。
完全な identifier の綴りと、所有する hidden・comment gap は保ちます。
hidden の消費 LF の後の `title` segment に空白を足しません。

[test: eventmodeling/qualified-names/qualified-padded]

[fixture: eventmodeling/qualified-names/qualified-lines]

[fixture: eventmodeling/qualified-names/dot-title-no-padding]

[fixture: eventmodeling/qualified-names/dot-title-padded-unsafe]

[fixture: eventmodeling/qualified-names/dot-native-comment]

[fixture: eventmodeling/qualified-names/custom-header-identifier]

[fixture: eventmodeling/qualified-names/hidden-before-title-segment-keep-no-prefix-space]

入力（escape 表記）:
`"eventmodeling rf 02 cmd Shop\n.\nBuy entity Root\n.\nChild"`

出力
([qualified-names/qualified-lines-output.mmd](../tests/fixtures/eventmodeling/qualified-names/qualified-lines-output.mmd)):

```mmd
eventmodeling
rf 02 cmd Shop.Buy
entity Root.Child
```

### Authored spellings

短形・長形の frame keyword、全 9 種の entity-type、数字の名前の綴りを保ちます。
frame keyword の別名変更は比較 Db が等しくても、選ばれた形を失います。
entity-type の別名は Db に残り、`1`、`01`、`001` は別の frame 名なので、
別名の変換も数値への正規化もしません。

[fixture: eventmodeling/authored-spellings/alias-retained]

[fixture: eventmodeling/authored-spellings/frame-aliases-db-equal]

[fixture: eventmodeling/authored-spellings/entity-type-aliases-db-different]

[fixture: eventmodeling/authored-spellings/numeric-identity-zeroes]

[fixture: eventmodeling/authored-spellings/nine-entity-types-preserved]

入力（escape 表記）:
`"eventmodeling timeframe 001 event Alpha resetframe 02 command Beta"`

出力
([authored-spellings/alias-retained-output.mmd](../tests/fixtures/eventmodeling/authored-spellings/alias-retained-output.mmd)):

```mmd
eventmodeling
timeframe 001 event Alpha
resetframe 02 command Beta
```

### Declarations and notes

コメントや directive で宣言や note の見出しが分かれる場合、GWT と同じく、
trivia と見出しが完結する行をキーワードより 1 段深くします。
data 本文の規則が margin の変更を許す場合、
本文はその開始行よりさらに 1 段深くします。
原文の順序、値の継続行、必須の hidden の境界を保ちます。
閉じ波括弧は引き続き第 1 列に置きます。

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
普通の 1 space で分けます。
block opener は見出し行の 1 space 後に置き、宣言の部品を見せます。
値と閉じの境界は data の規則に従います。
required name の `title` は frame と同じく安全な前方境界を保ちます。

[fixture: eventmodeling/declarations-and-notes/entity-ordinary]

[fixture: eventmodeling/declarations-and-notes/entity-title-lf-protected]

[fixture: eventmodeling/declarations-and-notes/data-and-note-headers]

[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

入力（escape 表記）: `"eventmodeling entity\tShop\n.\nBuy"`

出力
([declarations-and-notes/entity-ordinary-output.mmd](../tests/fixtures/eventmodeling/declarations-and-notes/entity-ordinary-output.mmd)):

```mmd
eventmodeling
entity Shop.Buy
```

### Gwt clauses and items

GWT の見出しがコメントや directive の後に続く場合、通常の継続の字下げを使い、
trivia と source-frame の行を `gwt` より 1 段深く置きます。
書かれた順序とコメントの形は保ちます。
clause keyword は引き続き 1 段、item は 2 段です。
source-frame の行は新たなトップレベルの文ではありません。
[fixture: eventmodeling/gwt-clauses-and-items/header-completion-comment]
[fixture: eventmodeling/gwt-clauses-and-items/header-directive-continuation]

`gwt 99` は第 1 列、clause keyword はさらに 1 段、
各 item はさらに 1 段深くします。
架空の閉じ記号を足さず、書かれた clause と item の関係を見せます。
必須の given・then、任意の when、item の順序・反復・型語を保ちます。
普通の item 部品は 1 space で分け、required `title` の境界、hidden、trivia、
保護された opening edge を優先します。

[fixture: eventmodeling/gwt-clauses-and-items/given-when-then-nested]

[fixture: eventmodeling/gwt-clauses-and-items/without-when-repeated-items]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-inline-alternative]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-title-identifier-keep-lf]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-clause-and-item-comments]

[test: eventmodeling/gwt-clauses-and-items/gwt-blanks-and-separators]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-title-after-hidden-keep-zero-indentation]

[corpus fixture: eventmodeling/gram-gwt-item-comment-line]

入力（escape 表記）:
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

inline body は完全な source span から印字し、波括弧・引用符、backslash、空白、
空の形、native 風の text を保ちます。
`singleQuote` では terminal を書き直しません。
lexer は同じ行の最後の対応する閉じまで読むため、
その範囲の見かけの後続 frame は data であり、文ではありません。
trim、引用符の変更、分割は Db の raw terminal を変えます。

[fixture: eventmodeling/inline-data/inline-braces-unchanged]

[fixture: eventmodeling/inline-data/inline-quote-spelling]

[fixture: eventmodeling/inline-data/inline-empty-and-whitespace]

[fixture: eventmodeling/inline-data/inline-trimming-changes-raw-value]

[fixture: eventmodeling/inline-data/inline-requote-changes-raw-value]

[fixture: eventmodeling/inline-data/greedy-apparent-frames-kept]

[fixture: eventmodeling/inline-data/data-hidden-looking-text]

入力（escape 表記）: `"eventmodeling tf 01 evt Alpha { \t x  }"`

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
通常の見出しの継続行が残る場合は `2 * tabWidth` 個にして、
本文をその開始行よりさらに 1 段深くします。
見出しへ結合される元の LF や、
inline directive の内部の LF では段を増やしません。
native hidden を含む見出しはその境界の列を保ち、本文は通常の 1 段にします。
`useTabs` でも空白を使い、`tabWidth: 0` では本文を書かれたまま残します。
本文をデータ項目に分けて解析したり、JSON や code として整形したりはせず、
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
後の行に初めて空白を加えると、描画するラベルが変わる場合があるためです。
先頭が空行でも、その次の行が第 1 物理行になるわけではありません。

[fixture: eventmodeling/data-blocks/body-first-line-zero-margin]

[fixture: eventmodeling/data-blocks/body-later-zero-margin-kept]

[fixture: eventmodeling/data-blocks/body-after-empty-first-row-kept]

空行、空白だけの行、改行、行末の空白とタブ、
行頭の margin より後の文字は保ちます。
閉じ波括弧は第 1 列に残します。
見かけの文、波括弧を含む text、直後の閉じ風の行も、
body を持つ形の規則が後の閉じまで読む場合は保ちます。

[fixture: eventmodeling/data-blocks/body-whitespace-kept]

[fixture: eventmodeling/data-blocks/block-empty-kept]

[fixture: eventmodeling/data-blocks/block-closer-indent-unsafe]

[fixture: eventmodeling/data-blocks/later-closer-owns-apparent-text]

[fixture: eventmodeling/data-blocks/block-nested-text]

開きの LF の前に空白がある場合、本文が `<`、`&`、`%%{` を含む場合、
空でない行の ASCII 空白 prefix の後がタブなどの空白の場合は、
本文全体を書かれたまま残します。
HTML、entity、directive 風の text は、字下げで描画が変わる場合があるためです。
`;` を含む本文も、書かれたまま残します。
`#amp;` などの Mermaid の native entity の綴りは、`;` で終わるからです。

[fixture: eventmodeling/data-blocks/block-interior-unchanged]

[fixture: eventmodeling/data-blocks/html-line-break-indentation-kept]

[fixture: eventmodeling/data-blocks/body-entity-kept]

[fixture: eventmodeling/data-blocks/body-native-directive-kept]

[fixture: eventmodeling/data-blocks/body-leading-tab-kept]

[test: eventmodeling/data-blocks/body-leading-nbsp-kept]

[fixture: eventmodeling/data-blocks/body-style-semicolon-kept]

Mermaid は本文内の字下げを受理し、raw value に含めます。
そのため、この行頭 margin の変更では、描画を保ちながら raw Db 値が変わります。
これは formatter の明示的な例外で、parser、仕様、
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

入力（escape 表記）:
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

入力（escape 表記）:
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

入力（escape 表記）: `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n}\n"`

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

block-data が閉じの LF を消費するか、
whitespace の lookahead で止まるかを保ちます。
普通の後続文を次の行へ移すときも、閉じ直後の水平空白は残します。
LS・PS の lookahead は terminal の外のままで、LF へ変えません。
次が共通文なら、最初の LF の有無、前置の連なり全体、
先行単位との接続を幅 0 でも保ちます。
予備 LF の追加や字下げ・閉じの空白の削除は Db や受理を変えるためです。
EOF の論理 LF は明示的な末尾 LF 1 個にできます。

[fixture: eventmodeling/data-boundaries/block-eof-logical-lf-kept]

[fixture: eventmodeling/data-boundaries/block-closer-space-retained]

[fixture: eventmodeling/data-boundaries/same-line-block-successor]

[fixture: eventmodeling/data-boundaries/lf-consuming-before-acctitle]

[fixture: eventmodeling/data-boundaries/lf-consuming-before-accdescr-preserve-one-space]

[fixture: eventmodeling/data-boundaries/note-consumed-lf]

[fixture: eventmodeling/data-boundaries/after-block-lf-tabwidth-zero-must-keep-metadata-padding]

[fixture: eventmodeling/data-boundaries/after-block-same-line-tab-metadata-boundary-kept]

入力（escape 表記）: `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n}"`

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

共通文の原文全体、直前の ASCII space・tab の連なり、
読みを成立させる先行単位との接続を保ちます。
global directive と選ばれた semicolon を挟む場合は、
除去によってつながる空白が決まるため、間の原文区間全体を保ちます。
失った連なりを後で再構築しません。
ここでは共有 accessibility layout を通しません。
EM terminal は他図種の変換済み common terminal と異なり、
keyword・delimiter・前置空白まで値として保つためです。
accTitle の setter が一部の前置空白を落としても、
共通文全体を保持して不統一な例外を避けます。

[fixture: eventmodeling/common-boundaries/common-retained-exact-leading-directive-gaps]

[fixture: eventmodeling/common-boundaries/acctitle-prefix-leading-stripped-by-setter]

[fixture: eventmodeling/common-boundaries/accdescr-prefix-significant]

[fixture: eventmodeling/common-boundaries/common-after-empty-description-keep-adjacency]

[fixture: eventmodeling/common-boundaries/native-comment-separates-common-requires-following-padding]

[fixture: eventmodeling/common-boundaries/native-comment-common-padding-change-db]

入力（escape 表記）:
`"eventmodeling tf 01 evt Alpha \t%%{init:{}}%%  accDescr: D"`

出力
([common-boundaries/common-retained-exact-leading-directive-gaps-output.mmd](../tests/fixtures/eventmodeling/common-boundaries/common-retained-exact-leading-directive-gaps-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha 	%%{init:{}}%%  accDescr: D
```

### Title

title の前置空白、1 個の separator、payload、末尾 text を原文どおり保ちます。
引用符、空の title、上書きされた出現も含みます。
次の物理行から値を取りません。
比較 summary は図の title を除くため、比較 Db が等しくても、
公開される EM_TITLE terminal を書き換える理由にはなりません。

[fixture: eventmodeling/title/title-exact-padding-and-quotes]

[fixture: eventmodeling/title/title-normalized-invisible-to-comparison-db]

[fixture: eventmodeling/title/title-empty-remains]

[fixture: eventmodeling/title/overwritten-occurrences]

入力（escape 表記）: `"eventmodeling title\ntf 01 evt Alpha"`

出力
([title/title-empty-remains-output.mmd](../tests/fixtures/eventmodeling/title/title-empty-remains-output.mmd)):

```mmd
eventmodeling title
tf 01 evt Alpha
```

### Accessibility lines

accessibility の行形式は前置空白、keyword と colon の間、colon 後と末尾の空白、
空 payload、引用符、波括弧風の text を保ちます。
EM_ACC_TITLE と EM_ACC_DESCR はこれらも値に含むためです。
空 payload でも terminal は空ではなく、colon 形式を block へ変えません。
行の値の LS・PS は内容のままです。

[fixture: eventmodeling/accessibility-lines/accessibility-lines-exact]

[fixture: eventmodeling/accessibility-lines/accessibility-shared-trim-changes]

[fixture: eventmodeling/accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string]

[fixture: eventmodeling/accessibility-lines/colon-braces-remain-text]

[test: eventmodeling/accessibility-lines/line-value-ls-ps-preserved]

[corpus fixture: eventmodeling/common-repeat-empty]

入力（escape 表記）:
`"eventmodeling accTitle: First\ntf 01 evt Alpha accTitle:"`

出力
([accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string-output.mmd](../tests/fixtures/eventmodeling/accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string-output.mmd)):

```mmd
eventmodeling accTitle: First
tf 01 evt Alpha accTitle:
```

### Description blocks

description block 全体と前置の連なりを保ちます。
開き前の改行、空白だけの内部、閉じの列も含みます。
空、空白だけ、共通除去だけの内部を区別して残します。
共有 `layoutDescriptionBlock` を通さない判断はこの 1 か所です。
通常の `{}` への圧縮と閉じの整列は EM_ACC_DESCR の値を変えるためです。
図種専用の空ブロック正規化も加えません。

[fixture: eventmodeling/description-blocks/description-whitespace-literal-retained]

[fixture: eventmodeling/description-blocks/description-opener-newline-unchanged]

[fixture: eventmodeling/description-blocks/description-closer-column-normalized-by-setter]

[fixture: eventmodeling/description-blocks/description-slash-yaml-are-content]

[corpus fixture: eventmodeling/gram-description-block-empty-after-removal]

[corpus fixture: eventmodeling/common-description-repeat]

入力（escape 表記）: `"eventmodeling accDescr\n\n{ Details }"`

出力
([description-blocks/description-opener-newline-unchanged-output.mmd](../tests/fixtures/eventmodeling/description-blocks/description-opener-newline-unchanged-output.mmd)):

```mmd
eventmodeling accDescr

{ Details }
```

### Hidden forms

IgnoredText は AST の owner ごとに source range から 1 回印字します。
見出し前・本文、必須・任意の named gap、qualified name の tail、tag、
GWT clause・item の gap を保ちます。
保持 YAML と native DIRECTIVE を設定として解釈しません。
共有 hidden 経路が内部の列、消費 LF、閉じの lookahead 空白を保ち、
普通の本文 opener は本文の段に揃えます。
必須の opening gap と共通文の前方境界は原文どおりです。
fallback の percent comment は comment のままです。

本文境界の form が保つ行は、GWT clause と item の開きでも保ちます。
見出しと入れ子の本文で同じ判断を使い、
item の移動によって次の整形で外側の開きの保護が失われないようにします。

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

入力（escape 表記）:
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

普通の独立 comment は所属本文の段に揃え、GWT item 間では item の段にします。
同じ印字行では接触を保ち、害のない分離を 1 space にします。
単位を行に分けるとき、
間の inline comment は directive と同じく次の単位へ付けます。
同じ comment を図種の間で同じように扱うため、共有の置き方を使います。
mark、内容、末尾空白、block comment の継続列を保ちます。
native の `//` と `%%` は LS・PS を越えて物理 LF まで読みます。
data block、note、`accDescr` block、slash block comment、
hidden 形の内部の `%%` のコメント行は、その text の一部です。
列は [Data blocks](#data-blocks) の本文 margin 変更を除いて保ちます。
metadata や required `title` の境界を優先します。
検出が拒否するため、slash comment を見出し前へ移しません。

[fixture: eventmodeling/comments/standalone-native-comments]

[fixture: eventmodeling/comments/inline-comments-keep-contact]

[fixture: eventmodeling/comments/native-percent-and-bare-percent]

[test: eventmodeling/comments/native-line-comment-ls-stays-content]

[fixture: eventmodeling/comments/slash-comment-before-title-identifier]

[fixture: eventmodeling/comments/do-not-move-slash-comment-before-header]

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

入力（escape 表記）: `"eventmodeling\ntf 01 evt A /*c*/ tf 02 evt B\n"`

出力
([comments/split-statements-block-output.mmd](../tests/fixtures/eventmodeling/comments/split-statements-block-output.mmd)):

```mmd
eventmodeling
tf 01 evt A
/*c*/ tf 02 evt B
```

### Default size branches

Eventmodeling の Db は、
source が `maxTextSize` （既定は UTF-16 コード単位で
50000）を超えるときにコメント行を除くので、超えないときはコメント行を残します。
この点で flowchart と異なります。
agentflow も同じ上限を持ちます（詳しくは、
[Default size branches](./agentflow.ja.md#default-size-branches) を参照）。
frontmatter、その後ろの空白だけの行、directive を除いた後で測り、
CRLF は 1 単位、サロゲートペアは 2 単位と数えます。
[fixture: default-size-branches/size-frontmatter-not-counted]
[fixture: default-size-branches/size-frontmatter-trivia-not-counted]
[fixture: default-size-branches/size-directive-not-counted]
[fixture: default-size-branches/size-utf16-surrogate]
50000 以上のときは、図の text 全体とその終わりを保ちます。
[fixture: default-size-branches/size-preserving-to-fallback-unsafe]
それ未満のときは、印字する計画の長さも 50000 未満に収まる場合だけ、
通常の整形を行い、そうでなければ図の text 全体とその終わりを保ちます。
[fixture: default-size-branches/size-below-planned-crossing]
字下げや末尾の改行で上限を越えると、
値の中のコメント行が除かれて Db が変わるので、それを防ぎます。
境界そのものは corpus が、CRLF、行の中の directive、
frontmatter の場合も含めて確かめます。
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

共有 directive 配置を使います。
同じ印字行のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
文・clause・item を行に分ける場合、間の directive は次の単位へ付け、
右の接し方を保ちます。
内容、順序、複数行の内部、値の中の位置、未完 EOF の終端を保ちます。
独立した開始は所属本文の段に揃えます。
共通文の境界は普通の空白規則でなく原文 gap 全体を保ちます。
除去される directive 自体は必要な whitespace の代わりになりません。

[fixture: eventmodeling/global-directives/directive-same-line-contacts]

[fixture: eventmodeling/global-directives/directive-follows-split-next-statement]

[fixture: eventmodeling/global-directives/directive-follows-split-next-gwt-item]

[fixture: eventmodeling/global-directives/directive-follows-split-clause]

[fixture: eventmodeling/global-directives/directive-in-value-exact]

[fixture: eventmodeling/global-directives/directive-creates-comment-mark-keep-source]

[fixture: eventmodeling/global-directives/unfinished-free-text-eof-unchanged]

[fixture: eventmodeling/global-directives/standalone-directive-before-normal-frame]

入力（escape 表記）:
`"eventmodeling tf%%{wrap}%% 01 evt Alpha%%{wrap}%%->>%%{wrap}%%02"`

出力
([global-directives/directive-same-line-contacts-output.mmd](../tests/fixtures/eventmodeling/global-directives/directive-same-line-contacts-output.mmd)):

```mmd
eventmodeling
tf %%{wrap}%%01 evt Alpha %%{wrap}%%->> %%{wrap}%%02
```

### Semicolons

全 authored semicolon を残します。
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
[fixture: semicolons/stretch-kept-rest-formatted]
[fixture: semicolons/no-stretch-formatted]
[fixture: semicolons/protected-gwt-title-hidden-gap-remains-zero]
最初の保護された本文行は所属の段に揃え、内容と後続列は書かれたままです。
required identifier と共通値の空白は構造上の字下げより優先します。
子の本文の opening edge も保護行に残し、次の整形で分かれ方が変わるのを防ぎます。
文法上の semicolon がないため `verbatimStyleLines` は false です。
`style` や `classDef` だけでは行全体を固定しません。

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

入力（escape 表記）:
`"eventmodeling tf 01 evt Alpha \"style:#x\" ;rf 02 cmd Beta"`

出力
([semicolons/selected-external-semicolon-preserved-output.mmd](../tests/fixtures/eventmodeling/semicolons/selected-external-semicolon-preserved-output.mmd)):

```mmd
eventmodeling tf 01 evt Alpha "style:#x"; rf 02 cmd Beta
```

### Blank lines

文・item 間の普通の ASCII 空行は最大 1 行、文書・本文の端は削除します。
無制限に広げず区切りを残すためです。
普通の空白だけの行は空にします。
data の内部は [Data blocks](#data-blocks) の規則に従います。
description、hidden、directive の内部、保持 prefix、
共通文の消費 LF 境界は原文どおりです。

[fixture: eventmodeling/blank-lines/ordinary-blanks-bounded]

[fixture: eventmodeling/blank-lines/gwt-blanks-bounded]

[fixture: eventmodeling/blank-lines/block-blank-contents-retained]

[fixture: eventmodeling/blank-lines/hidden-spare-blank-before-normal-frame-collapse]

[fixture: eventmodeling/blank-lines/description-empty-ends-same-line-common-no-split]

入力（escape 表記）:
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
物理行ごとの trim ではなく owner で判断します。
metadata の値と prefix、許容した margin 変更以外の data 内部、
comment・directive の末尾、hidden・data の閉じの境界、保護区間は、
空白が内容や受理条件になりうるため保ちます。

[fixture: eventmodeling/trailing-whitespace/harmless-trailing-structure]

[fixture: eventmodeling/trailing-whitespace/metadata-trailing-whitespace-retained]

[fixture: eventmodeling/trailing-whitespace/metadata-trailing-whitespace-removal-changes]

入力（escape 表記）:
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
普通の whitespace だけの部品間改行は空白規則に従い、
trivia の継続行は構造上の段を保ちます。
構造上の分割を加えるのは決定済みの GWT clause・item 配置です。
値、hidden、metadata、保護境界の内容は、
[Data blocks](#data-blocks) の限定的な本文 margin 変更を除いて保ちます。
幅に依存する選択を避けて字句境界を明示し、inline data に禁止 LF を足しません。

[fixture: eventmodeling/long-lines/long-structural-line-no-wrap]

[fixture: eventmodeling/long-lines/safe-structural-wrapping-alternate]

[fixture: eventmodeling/long-lines/inline-value-wrapping-rejects]

入力（escape 表記）:
`"eventmodeling tf 001 evt VeryLongNamespace.VeryLongEventName ->> 002 ->> 003 ->> 004 [[LongDataName]] \u0060text\u0060 {a very long authored payload}"`

出力
([long-lines/long-structural-line-no-wrap-output.mmd](../tests/fixtures/eventmodeling/long-lines/long-structural-line-no-wrap-output.mmd)):

```mmd
eventmodeling
tf 001 evt VeryLongNamespace.VeryLongEventName ->> 002 ->> 003 ->> 004 [[LongDataName]] `text` {a very long authored payload}
```

### Quotes

printer は引用符を付けたり外したりしません。
名前には引用符で囲む形がなく、`tf 01 evt "Alpha"` は拒否されます。
frame のデータの本文（行内の波括弧の中か、`data` 宣言のブロック内）、タイトル、
アクセシビリティの値にある引用符は、テキストの文字です。
Db は、データ `{"x"}` には `{"x"}` を、`{x}` には `{x}` を保持し、
`accTitle: "T"` と書かれたタイトルには `accTitle: "T"` を保持します。
そのため、引用符の有無を変えて同じテキストとして書けるものはなく、
どのテキストも変えません。 [fixture: quotes/quotes-as-written]

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

安全な本物の先頭 frontmatter だけに共有 YAML formatter を使います。
壊れた YAML、字下げ・空白付き fence、HTML quote の危険、
fence を作る本文は既存 guard により原文を保ちます。
YAML の入れ子は幅 0 でも正の最小字下げを使います。
textBeforeHeader があれば見出しまでの prefix 全体を保ちます。
native YAML や DIRECTIVE を本物の frontmatter・設定へ昇格させると、
受理が変わる場合があるためです。

[fixture: eventmodeling/frontmatter-yaml/safe-real-yaml]

[fixture: eventmodeling/frontmatter-yaml/positive-minimum-yaml-indent]

[fixture: eventmodeling/frontmatter-yaml/retained-prefix-whole]

[fixture: eventmodeling/frontmatter-yaml/real-plus-retained-plus-second-scan]

[fixture: eventmodeling/frontmatter-yaml/html-frontmatter-guard-unchanged]

[fixture: eventmodeling/frontmatter-yaml/delimiter-padding-kept]

[fixture: eventmodeling/frontmatter-yaml/indented-fences-kept]

入力（escape 表記）:
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

共有 host 方針に従い、CR・CRLF は LF として読み、
値や hidden 内も設定の `endOfLine` で出力します。
普通の native Unicode gap は部品の規則で整えます。
共通値と行 comment の LS・PS、block close の lookahead としての役割は保ちます。
消費される LF とは交換できません。
Unicode の値の端も trim しません。
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

未使用の model entity・data、note、GWT、型タグ、重複 source、後続の同名 data、
上書きされた共通文、参照と併記した inline data も含め、全出現を原順に保ちます。
変えるのは許容した本文 margin も含む、決定済みの配置だけです。
重複削除で比較 Db が等しくても authored な出現を失い、
data の並べ替えは最初の検索結果も変える場合があります。

[fixture: eventmodeling/source-order/all-occurrences-retained]

[fixture: eventmodeling/source-order/deduplicating-source-db-equal-but-not-permitted]

[fixture: eventmodeling/source-order/reordering-duplicate-data-changes-first-lookup]

[fixture: eventmodeling/source-order/unread-model-note-gwt-retained-not-raw-line-lock]

[fixture: eventmodeling/title/overwritten-occurrences]

[corpus fixture: eventmodeling/common-repeat-empty]

[corpus fixture: eventmodeling/common-description-repeat]

入力（escape 表記）:
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
必要な hidden・data の閉じの空白、保護原文、
EOF に達する未完 directive は字句上の終端を保ちます。
共有の末尾方針に揃えつつ、directive 内容への LF 追加や、
block terminal の lookahead の変更を避けます。

[fixture: eventmodeling/final-newline/final-common-line-newline]

[fixture: eventmodeling/final-newline/final-native-comment-newline]

[fixture: eventmodeling/final-newline/final-hidden-closer-padding-kept]

[fixture: eventmodeling/final-newline/final-block-padding-kept]

[fixture: eventmodeling/final-newline/hidden-eof-with-no-lf-gets-lf]

入力（escape 表記）: `"eventmodeling accDescr: D"`

出力
([final-newline/final-common-line-newline-output.mmd](../tests/fixtures/eventmodeling/final-newline/final-common-line-newline-output.mmd)):

```mmd
eventmodeling accDescr: D
```

### Specified readings

既存の 5 差異、directive-as-token-boundary、
ignored-semicolon-as-token-boundary、html-tag-in-frontmatter、
embedded-data-opaque、c4-keyword-anywhere に従います。
新しい差異を加えず、拒否入力の atomic cut を修復しません。
raw 拒否には raw Db がないため、
必要な比較は記録された specified reading を使います。
ファイルの拒否入力は構文エラーとなって書き換えず、
Markdown では host に任せます。

[corpus fixture: eventmodeling/directive-arrow-inside]

[corpus fixture: eventmodeling/lex-semicolon-frame-id-inside]

[corpus fixture: eventmodeling/div-html-frontmatter-value]

[corpus fixture: eventmodeling/div-frontmatter-invalid]

[corpus fixture: eventmodeling/c4-container-data]

### Markdown fences

共有の接続を使い、top-level、list、quote の dedent 後の payload を整形します。
設定、保持 prefix、共通文の空白も同じ規則です。
host は埋め込んだ出力の末尾改行と最後の code 行の padding を削るため、
最後の保持 padding は standalone と同じ保証を持ちません。
拒否された payload は Prettier の通常の code 処理に任せます。

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
