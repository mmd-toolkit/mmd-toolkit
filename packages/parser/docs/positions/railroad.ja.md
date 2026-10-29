# Railroad の位置

英語版: [railroad.md](./railroad.md)

4 方言は、
元の UTF-16 オフセットで
[railroad ソース木](../../../spec/docs/ast/railroad.ja.md)
の範囲と子の順序に従います。
Root はソース全体を覆います。
共通変換はソースの改行、引用符、エスケープ、数値の raw を書き換えません。
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree]
[fixture: railroad/ir-line-string-values]
[fixture: railroad/abnf-db-repeat-leading-zero]

## 範囲

| ノード                                         | 始点と終点                                                                                  | fixtures                                                                                                                                                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RailroadDiagram                                | 最初の保持された開始記号かヘッダーから最後の body 項目まで。空ならヘッダー末尾まで。        | [fixture: railroad/ir-secondscan-real] [fixture: railroad/ir-yaml-before-secondscan-real] [fixture: railroad/ir-header-only] [fixture: railroad/ebnf-header-only] [fixture: railroad/abnf-header-only] [fixture: railroad/peg-header-only] |
| RailroadRule                                   | 名前から必須の可視セミコロンまで。                                                          | [fixture: railroad/ir-native-ownership] [fixture: railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]                                                                       |
| 4 種のメタデータ文                             | キーワードから値まで。null の行値ならキーワードかコロン、ブロックなら必須の閉じ波括弧まで。 | [fixture: railroad/ir-common-whitespace-shapes] [fixture: railroad/ebnf-common-whitespace-shapes] [fixture: railroad/abnf-common-whitespace-shapes] [fixture: railroad/peg-common-whitespace-shapes]                                       |
| RailroadLiteral                                | 空白を含む所有された行値、または外側を trim したブロック値。                                | [fixture: railroad/ir-common-whitespace-shapes] [fixture: railroad/ir-common-block-directive-only] [fixture: railroad/ir-common-block-comment-only]                                                                                        |
| RailroadIgnoredText                            | native の開始から選択された閉じまで。消費された直後の LF は含めない。                       | [fixture: railroad/ir-hidden-yaml-adjacent-later] [fixture: railroad/ir-hidden-yaml-eof] [fixture: railroad/ir-hidden-directive-multiline] [fixture: railroad/ir-hidden-directive-eof]                                                     |
| RailroadExpressionMember                       | 最初の所有形式か式から最後の所有形式か式まで。区切りは含めない。                            | [fixture: railroad/ir-native-ownership] [fixture: railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]                                                                       |
| IR の 8 種の呼び出し                           | コンストラクターから必須の閉じ丸括弧まで。                                                  | [fixture: railroad/ir-gram-written-tree] [fixture: railroad/ir-db-singletons]                                                                                                                                                              |
| 自然方言の選択と列                             | 最初の式から最後の式まで。外側の隠れた形式は含めない。                                      | [fixture: railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]                                                                                                               |
| 3 種のグループ式                               | 開始から必須の閉じまで。内側の隠れた gap も含める。                                         | [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree]                                                                                                            |
| 接尾式 / 例外式                                | オペランドの開始から記号 / 右の primary の末尾まで。                                        | [fixture: railroad/ebnf-exception-leftfold] [fixture: railroad/ebnf-native-ownership] [fixture: railroad/peg-native-ownership]                                                                                                             |
| RailroadSpecialSequence                        | 開きから閉じの疑問符まで。                                                                  | [fixture: railroad/ebnf-special-whitespace] [fixture: railroad/ebnf-hidden-directive-special]                                                                                                                                              |
| RailroadRepeatExpression / RailroadRepeatRange | 反復の開始から primary の末尾 / 最後のカウントか星まで。                                    | [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/abnf-native-ownership] [fixture: railroad/abnf-directive-repeat]                                                                                                             |
| RailroadNumericValue                           | percent から最後の一致した十六進数字まで。内部の共通 trivia も範囲に含める。                | [fixture: railroad/abnf-numval-boundaries] [fixture: railroad/abnf-directive-numval-digits] [fixture: railroad/abnf-semicolon-numval-text]                                                                                                 |
| 述語 / any                                     | 接頭記号から完全な suffix オペランドまで / 1 文字のドット。                                 | [fixture: railroad/peg-gram-written-tree] [fixture: railroad/peg-native-ownership]                                                                                                                                                         |
| 共通の葉                                       | 名前、両方の文字列引用符、書かれた十進数字すべて。                                          | [fixture: railroad/ir-db-empty-strings] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/abnf-db-repeat-overflow]                                                                                                             |

隠れた形式は木の
[名前付き gap の所有規則](../../../spec/docs/ast/railroad.ja.md#gap-の所有)
に従います。
式の核は、親が所有する外側の形式を含めません。
リストのメンバーは区切りの各側の gap を持ち、
隣接する場合は次のメンバーが gap 全体を持ちます。
コメント、外側の空白、検出が通過した trivia、
追加された LF はノードを延長しません。 [fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]
[fixture: railroad/ir-retained-bare-secondscan-unicode]
[fixture: railroad/ir-tail-comment] [fixture: railroad/ir-header-only]
