# Railroad: 木から Db を作る

英語版: [railroad.md](./railroad.md)

[構文](../../../spec/docs/diagrams/railroad.md)が受理を定め、
[構文木](../../../spec/docs/ast/railroad.md)は書かれた 30 種のノードを保つ。
`railroadDbOf` は受理された RailroadDiagram を読む。
Root.diagramType で IR、EBNF、ABNF、PEG を選び、
4 方言を同じ[要約](../db-summaries.md#railroad)の形にする。
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree]

## 木から要約を作る

1. **読みと順序。** 葉の範囲を共有の
   [変換済みテキスト](../db-from-tree.md#the-converted-form)で読む。
   規則は宣言順に公開し、重複名も残す。
   各規則に変換した名前と再帰的に作った定義を持たせる。
   native の無視する形とその gap のリストは何も公開しない。
   本文と frontmatter の title は要約に含めず、
   frontmatter の title は共有の埋め込み値に残す。
   空の図は空のアクセシビリティ文字列と空の rules リストを持つ。
   [fixture: railroad/ir-db-duplicates] [fixture: railroad/ebnf-db-duplicates]
   [fixture: railroad/abnf-db-duplicates] [fixture: railroad/peg-db-duplicates]
   [fixture: railroad/ir-native-ownership] [fixture: railroad/ir-header-only]
   [fixture: railroad/ebnf-header-only] [fixture: railroad/abnf-header-only]
   [fixture: railroad/peg-header-only]
   [fixture: railroad/ir-frontmatter-empty-body-title]
2. **アクセシビリティ。** 変換済みの literal の範囲を読み、null は空文字とする。
   共有の `commonValue` で行の値の両端を trim し、
   連続する ASCII space/tab を縮める。
   block の値は各行も trim し、連続する物理改行を縮める。
   最後の代入を使い、空の代入も前の値を抑制する。
   最終の説明に `descriptionOf` を適用し、
   両方のアクセシビリティ値に
   `textReplacementOf(embedded.config)` を適用する。
   [fixture: railroad/ir-common-repeat]
   [fixture: railroad/ir-common-repeat-empty]
   [fixture: railroad/ebnf-common-repeat-empty]
   [fixture: railroad/abnf-common-repeat-empty]
   [fixture: railroad/peg-common-repeat-empty]
   [fixture: railroad/ir-common-block-whitespace]
   [fixture: railroad/ir-html-texts] [fixture: railroad/ir-entity-texts]
   [fixture: railroad/ir-config-security-level-other]
   [fixture: railroad/ebnf-config-security-level-other]
   [fixture: railroad/abnf-config-security-level-other]
   [fixture: railroad/peg-config-security-level-other]
3. **文字列の値。** 変換済みの両端の引用符を除く。
   IR、EBNF、PEG は backslash n/r/t だけを制御文字にし、
   ほかの escape は backslash を除く。
   ABNF は二重引用符の内部を保ち、backslash を解釈しない。
   EBNF の special-sequence は両端の疑問符を除いて trim し、
   文字列の escape を解釈しない。
   PEG の述語のラベルを含む式の変換を完了した後、
   各規則名と、式内の terminal の値・nonterminal の名前・special のテキストに
   `textReplacementOf(embedded.config)` を再帰的に適用する。
   [fixture: railroad/ir-config-security-level-other]
   [fixture: railroad/ebnf-config-security-level-other]
   [fixture: railroad/abnf-config-security-level-other]
   [fixture: railroad/peg-config-security-level-other]
   [fixture: railroad/ir-lex-string-conversion]
   [fixture: railroad/ebnf-lex-string-conversion]
   [fixture: railroad/peg-lex-string-conversion]
   [fixture: railroad/abnf-lex-string-conversion]
   [fixture: railroad/abnf-string-backslash-quote]
   [fixture: railroad/ebnf-special-whitespace]
   [fixture: railroad/ebnf-html-texts]
4. **IR の call。** terminal、nonterminal、special はそれぞれ
   terminal の値、nonterminal の名前、special のテキストを公開する。
   sequence と choice は引数の定義を順に公開し、単一要素はその子へ畳む。
   optional は optional、zeroOrMore と oneOrMore は下限 0 または 1、
   上限 Infinity の repetition となる。
   入れ子のリストは平らにしない。
   [fixture: railroad/ir-db-all-fields] [fixture: railroad/ir-db-singletons]
   [fixture: railroad/ir-db-empty-strings]
   [fixture: railroad/ir-spec-railroad-renderer-8ca3b06b]
5. **自然記法と EBNF。** Identifier は nonterminal、文字列は terminal となる。
   choice と sequence の member の順を保ち、group は内部の定義を公開する。
   角括弧は optional となる。
   EBNF の波括弧は下限 0、上限 Infinity の repetition、
   後置の ?、*、+ は optional または下限 0/1、
   上限 Infinity の repetition となり、書かれた入れ子の順を保つ。
   EBNF の例外は、左の定義、terminal の dash、右の定義の sequence となり、
   左にある sequence の入れ子も保つ。
   [fixture: railroad/ebnf-db-all-fields] [fixture: railroad/ebnf-db-singletons]
   [fixture: railroad/abnf-db-singletons] [fixture: railroad/peg-db-singletons]
   [fixture: railroad/ebnf-db-postfix-order]
   [fixture: railroad/ebnf-exception-leftfold]
6. **ABNF の repeat と数値の値。** 境界を基数 10 の parseInt で読む。
   省略した下限は 0、上限は Infinity、exact count は上下限を同じにする。
   変換後の境界が 0 と 1 なら optional、ほかは repetition とし、
   逆転した境界を拒否しない。
   公開する両方の境界に共有の `numberOrText()` を適用し、
   非有限値を文字列にする。
   NumericValue は変換済みの綴り全体を terminal とし、
   基数の大文字小文字、数字、dot、hyphen を保つ。
   [fixture: railroad/abnf-db-repeat-optional]
   [fixture: railroad/abnf-db-repeat-implicit-optional]
   [fixture: railroad/abnf-db-repeat-zero-padded-optional]
   [fixture: railroad/abnf-db-repeat-implicit-zero]
   [fixture: railroad/abnf-db-repeat-reversed]
   [fixture: railroad/abnf-db-repeat-precision]
   [fixture: railroad/abnf-db-repeat-overflow]
   [fixture: railroad/abnf-db-repeat-max-overflow]
   [fixture: railroad/abnf-db-all-fields]
   [fixture: railroad/abnf-numval-boundaries]
   [fixture: railroad/abnf-directive-numval-digits]
7. **PEG の後置と述語。** 後置は同じ optional と repetition の形を使う。
   dot は special の dot となる。
   述語の対象全体を先に変換し、接頭辞と、
   terminal の二重引用文字列、nonterminal の名前、
   special のテキストでラベルを作る。
   変換後の対象がそれ以外の型なら (...) となる。
   terminal の値の引用符と変換後の改行は escape しない。
   group 内の述語を対象にする述語は、公開済みの special に接頭辞を付ける。
   書かれた group と完全な対象は構文木に残る。
   [fixture: railroad/peg-db-all-fields] [fixture: railroad/peg-db-predicates]
   [fixture: railroad/peg-db-predicate-singleton-group]
   [fixture: railroad/peg-db-predicate-predicate]
   [fixture: railroad/peg-db-predicate-quote-newline]

## 記録された木の検査

fixture に指定の読みがあればそれを使い、
同じ読みの `embeddedValuesOf` を使う。
比較可能な受理の読みで木が無ければ失敗とし、
error の記録は指定の受理が拒否する場合だけ除く。
比較 Db がない場合は
[比較 Db](../../../spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db)
のとおり明示する。
railroad には意味的な埋め込みの acceptance key はない。
[fixture: railroad/ir-div-html-frontmatter-rule-accept]
[fixture: railroad/ir-div-html-frontmatter-rule-reject]
[fixture: railroad/ebnf-div-html-frontmatter-rule-double]
[fixture: railroad/abnf-div-html-frontmatter-acctitle]
[fixture: railroad/peg-div-html-frontmatter-rule-single]
[fixture: railroad/ir-config-frontmatter-fontfamily-number]
