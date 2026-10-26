# Railroad のトークン

英語版: [railroad.md](./railroad.md)

4 方言はそれぞれの
[先勝ちの字句順序](../../../spec/docs/diagrams/railroad.ja.md#字句構造)
に従います。
メタデータと隠れた形式の文字規則を共有しますが、
共通の EOL 文法は取り込みません。
[fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

## トークン

| 種類         | 対象                                                                        | fixtures                                                                                                                                                                       |
| ------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | 正確な小文字のヘッダー、IR コンストラクター、メタデータのキーワード。       | [fixture: railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree]       |
| `Identifier` | 宣言名と自然方言の参照。                                                    | [fixture: railroad/ir-keywords-long-rule-name] [fixture: railroad/ebnf-name-dash] [fixture: railroad/abnf-db-prototype-names] [fixture: railroad/peg-db-prototype-names]       |
| `Numeric`    | 先頭のゼロを含む ABNF の各十進カウント全体。                                | [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/abnf-db-repeat-leading-zero] [fixture: railroad/abnf-db-repeat-overflow]                                         |
| `String`     | 空文字列も含む、両方の引用符付きの文字列全体。                              | [fixture: railroad/ir-db-empty-strings] [fixture: railroad/ebnf-db-empty-string] [fixture: railroad/abnf-db-empty-string] [fixture: railroad/peg-db-empty-string]              |
| `Punctuator` | 各代入、区切り、接頭・接尾演算子、反復の星、PEG のドット。                  | [fixture: railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree]       |
| `RawText`    | メタデータ値、native の隠れた形式全体、EBNF 特殊列全体、ABNF 数値形式全体。 | [fixture: railroad/ir-common-whitespace-shapes] [fixture: railroad/ir-native-ownership] [fixture: railroad/ebnf-special-whitespace] [fixture: railroad/abnf-numval-boundaries] |

`::=` と `<-` はそれぞれ 1 つのアトムです。
ABNF の星付き反復は、書かれた最小値、星、最大値に分かれます。
省略されたカウントにトークンはありません。
数値形式はカウントではなくテキストで、
基数文字と区切りを含む 1 項目になります。
[fixture: railroad/ebnf-div-directive-assignment]
[fixture: railroad/peg-directive-operator]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/abnf-db-repeat-implicit-zero]
[fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-numval-boundaries]

行メタデータは title の ASCII 区切り 1 文字、
またはアクセシビリティのコロンの後の空白を保持します。
ブロック値は両端の Notation 空白だけを除きます。
空の値にはトークンがなく、空白だけの行値には RawText があります。
[fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes]
[fixture: railroad/abnf-common-whitespace-shapes]
[fixture: railroad/peg-common-whitespace-shapes]
[fixture: railroad/ir-common-block-directive-only]
[fixture: railroad/ir-common-block-comment-only]

共通ディレクティブと選択されたセミコロンは String と RawText を切り、
切られた文字列は StringFragment になります。
ヘッダー、コンストラクター、メタデータのキーワード、名前、
十進カウント、複合代入の内部を切ると拒否します。
メタデータと反復の各成分は独立に検査します。
[fixture: railroad/ir-directive-string-middle]
[fixture: railroad/ebnf-directive-string]
[fixture: railroad/abnf-directive-numval-digits]
[fixture: railroad/abnf-semicolon-numval-text]
[fixture: railroad/ir-div-directive-header]
[fixture: railroad/ir-directive-keyword-glued]
[fixture: railroad/ir-directive-description-keyword]
[fixture: railroad/ir-div-semicolon-rule-name]
[fixture: railroad/abnf-div-semicolon-repeat-number]
[fixture: railroad/peg-div-semicolon-assignment]
[fixture: railroad/ir-directive-common-colon]
[fixture: railroad/abnf-directive-repeat]

## コメントと trivia

native percent コメントの mark は `%%`、PEG hash は `#`、
ABNF semicolon は `;` です。
範囲に物理改行は含めず、LS/PS は内容に含めます。
IR/EBNF C コメントの mark は `/*`、EBNF ISO は `(*` で、
最初の必須の閉じで終わります。
範囲と値は[共有の Comment の定義](../tokens.ja.md#comment)に従います。
[fixture: railroad/ir-comment-percent-ls]
[fixture: railroad/peg-comment-hash-ps]
[fixture: railroad/abnf-comment-semicolon-ls]
[fixture: railroad/ir-tail-comment]
[fixture: railroad/ebnf-comment-iso]
[fixture: railroad/ir-c-comment-first-closer]
[fixture: railroad/ebnf-iso-first-closer]

native の ASCII space/tab/CR/LF 空白にトークンやノードはありません。
検出が通過した bare 行は共通 Comment で、付随する trivia は再読しません。
隠れた YAML と native directive は RailroadIgnoredText が所有する RawText で、
消費された直後の LF はその項目の外です。
[fixture: railroad/ir-space-tabs] [fixture: railroad/ir-line-crlf]
[fixture: railroad/ir-retained-bare-secondscan-unicode]
[fixture: railroad/ir-hidden-yaml-sole-lf]
[fixture: railroad/ir-hidden-directive-closing-space]
[fixture: railroad/ir-hidden-directive-eof]
