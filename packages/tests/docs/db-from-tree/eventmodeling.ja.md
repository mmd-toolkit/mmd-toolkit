# Eventmodeling: 木からの Db の構築

英語版: [eventmodeling.md](./eventmodeling.md)

`eventmodelingDbOf` は受理済みの
[書かれた木](../../../spec/docs/ast/eventmodeling.ja.md)を読み、
[eventmodeling の要約](../db-summaries.ja.md#eventmodeling)を返す。
受理は[構文](../../../spec/docs/diagrams/eventmodeling.ja.md#意味上の受理条件)と
parser の結果の記録が決める。
ここでは参照の解決や validator の検査をしない。
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/db-source-missing]
[fixture: eventmodeling/validator-command-invalid]

## 木から要約を作る手順

1. **変換した原文。**
   与えられた原文と木から、
   共有の [変換した形](../db-from-tree.ja.md#変換した形)を読む。
   共通 directive、comment region、選ばれた semicolon を除き、
   CR/CRLF を正規化し、
   実際の frontmatter より後の原文全体で HTML 属性の引用符を変換し、
   entity の placeholder を保つ。
   名前の segment は別々に読み、修飾名を dot でつなぐ。
   native の無視された本文を設定として評価しない。
   [fixture: eventmodeling/entity-texts] [fixture: eventmodeling/entity-common]
   [fixture: eventmodeling/html-common]
   [fixture: eventmodeling/line-block-values]
   [fixture: eventmodeling/space-qualified-name]
   [fixture: eventmodeling/directive-qualified]
   [fixture: eventmodeling/lex-hidden-yaml-fence-directive]
2. **共通 terminal 全体。**
   木の共通文の値の欄は本文だけを持つ。
   [値の定義](../../../spec/docs/ast/eventmodeling.ja.md#共通の文の値)のとおり、
   keyword と区切りを含む文の範囲全体と、
   直前に残る ASCII space/tab の連なりを読む。
   共通の除去をすべて施した後に数え、
   除いた directive や選ばれた semicolon の両側の空白をつなぐ。
   たとえば選ばれた semicolon は、
   ` \t; accDescr: D` を ` \t accDescr: D` に変える。
   comment region 自身の字下げと終わりの LF は除く。
   閉じた共通 directive だけの除去、空行、選ばれた semicolon は LF を残す。
   LF、LS、PS は水平の連なりの外にある。
   受理済みの木は
   [字下げ](../../../spec/docs/diagrams/eventmodeling.ja.md#共通の文)を満たす。
   LF の消費は除去後に判断し、
   semicolon の除去で native directive の closer と LF が直結する場合も含む。
   選ばれない semicolon は構文として、空の説明ブロックは文の境目として残る。
   どちらも除かれたかのように prefix をつながない。
   共通 converter の trim、空白の畳み込み、
   escape の復号を施さない。
   [fixture: eventmodeling/gram-common-leading-directive-both-sides]
   [fixture: eventmodeling/gram-common-leading-directive-before-padding]
   [fixture: eventmodeling/gram-common-leading-directive-after-padding]
   [fixture: eventmodeling/gram-common-leading-directive-after-header]
   [fixture: eventmodeling/gram-common-block-leading-directive]
   [fixture: eventmodeling/gram-common-leading-semicolon-both-sides]
   [fixture: eventmodeling/gram-common-leading-semicolon-after-padding]
   [fixture: eventmodeling/gram-common-leading-semicolon-before-padding]
   [fixture: eventmodeling/gram-common-leading-comment-region-padding]
   [fixture: eventmodeling/lex-common-yaml-comment-line-padding]
   [fixture: eventmodeling/lex-common-block-comment-line-padding]
   [fixture: eventmodeling/lex-common-native-directive-comment-line-padding]
   [fixture: eventmodeling/lex-common-yaml-directive-only-line]
   [fixture: eventmodeling/lex-common-block-directive-only-line]
   [fixture: eventmodeling/lex-common-yaml-blank-line-padding]
   [fixture: eventmodeling/lex-common-block-inline-directive-padding]
   [fixture: eventmodeling/lex-common-selected-semicolon-exposes-lf]
   [fixture: eventmodeling/lex-common-selected-semicolon-padding]
   [fixture: eventmodeling/lex-common-selected-semicolon-before-lf]
   [fixture: eventmodeling/lex-common-unselected-semicolon-padding]
   [fixture: eventmodeling/lex-common-after-block-ls-indented]
   [fixture: eventmodeling/lex-common-after-block-ps-indented]
   [fixture: eventmodeling/gram-common-leading-semicolon-unselected]
   [fixture: eventmodeling/lex-common-empty-description-inline-padding]
   [fixture: eventmodeling/lex-common-empty-description-leaves-lf]
   [fixture: eventmodeling/gram-common-leading-empty-description-boundary]
3. **アクセシビリティの setter。**
   `accTitle` と `accDescr` は空から始める。
   アクセシビリティの代入を原文順に読み、最後の代入を残す。
   本文が null でも terminal 全体には keyword と区切りがあるため置き換える。
   各 terminal 全体に `textReplacementOf(embedded.config)` を施す。
   title はその後に先頭の空白を除く。
   description は各 LF と、その後の空白やさらに続く LF を一つの LF に変える。
   それ以外の先頭・末尾の空白は保つ。
   data と名前には security による文字列の置換を施さない。
   書かれた図全体の title と `embedded.title` は要約に入らない。
   [fixture: eventmodeling/common-repeat]
   [fixture: eventmodeling/common-repeat-empty]
   [fixture: eventmodeling/common-description-repeat]
   [fixture: eventmodeling/common-whitespace]
   [fixture: eventmodeling/common-title-only]
   [fixture: eventmodeling/frontmatter-title]
   [fixture: eventmodeling/config-security-level-other]
4. **Frame。**
   time/reset frame の文を宣言順に読み、同名の重複も残す。
   kind は `time` または `reset`、name は書かれた数字列、
   modelEntityType は書かれた語のまま、entityIdentifier は修飾名をつなぐ。
   sourceFrames は書かれた数字列の集合を文字列順にソートして公開する。
   未定義・前方・自己参照も解決せず、
   先頭のゼロを区別する。 [fixture: eventmodeling/db-frame-order]
   [fixture: eventmodeling/db-frame-duplicates]
   [fixture: eventmodeling/db-all-aliases]
   [fixture: eventmodeling/db-qualified-names]
   [fixture: eventmodeling/db-source-order]
   [fixture: eventmodeling/db-source-leading-zero]
   [fixture: eventmodeling/db-source-missing]
   [fixture: eventmodeling/db-source-forward]
   [fixture: eventmodeling/db-source-self]
5. **Data の選択と本文。**
   body 全体で名前ごとの最初の data 宣言を記録する。
   frame の data 参照に一致する最初の block があれば選び、なければ inline data、
   どちらもなければ null にする。
   最初の block が空でも選び、後の同名宣言では置き換えない。
   型タグと named gap を除き、brace または引用符を含む変換後の本文を読む。
   backslash を復号せず、宣言された data 言語としても解析しない。
   block の直後の変換後の LF は含め、EOF に足す論理 LF も含む。
   閉じの lookahead だけになる space、LS、PS は含めない。
   受理済みの node が持つ、本文ありを優先した閉じの選択を保つ。
   kind が `inline` または `block` の `{kind, value}` を公開する。
   [fixture: eventmodeling/db-data-first]
   [fixture: eventmodeling/db-data-empty-first]
   [fixture: eventmodeling/db-data-reference-inline]
   [fixture: eventmodeling/db-data-unresolved-inline]
   [fixture: eventmodeling/db-data-unresolved]
   [fixture: eventmodeling/db-reset-data-reference]
   [fixture: eventmodeling/lex-inline-empty]
   [fixture: eventmodeling/lex-inline-quote-conversion]
   [fixture: eventmodeling/data-all-types]
   [fixture: eventmodeling/data-block-types]
   [fixture: eventmodeling/data-block-close-eof]
   [fixture: eventmodeling/data-block-close-space]
   [fixture: eventmodeling/lex-block-close-ps-boundary]
   [fixture: eventmodeling/lex-block-adjacent-later-close]

要約は model entity、note、GWT、未使用の data、型タグ、native の無視された形、
描画時の計算を除く。
書かれた node は木と checker の対象として残る。
[fixture: eventmodeling/db-entities-notes-gwt]
[fixture: eventmodeling/db-data-unused]
[fixture: eventmodeling/gram-written-tree]

## 記録との比較

`specified.json` があればそれを使い、なければ `expected.json` を使う。
設定は `embeddedValuesOf` から得る。
eventmodeling のすべての木と、
eventmodeling と検出される common fixture を含める。
site security の fixture は site 設定を使い、
frontmatter の HTML による値の違いは指定の読みで比較する。
受理の木が欠けていれば入力とともに報告し、違いも入力とともに報告する。
error の記録は `fixtureAccepts` がその読みを拒否するときだけ飛ばす。
受理しても比較 Db がない場合は、
[共有の規則](../../../spec/docs/known-divergences/embedded-data-opaque.ja.md#比較する-db)に従って明示する。 [fixture: common/detect-minimal-eventmodeling]
[fixture: eventmodeling/config-security-level-other]
[fixture: eventmodeling/div-html-frontmatter-value]
[fixture: eventmodeling/config-fontfamily-keeps-title]
[fixture: eventmodeling/div-invalid-keeps-config]
