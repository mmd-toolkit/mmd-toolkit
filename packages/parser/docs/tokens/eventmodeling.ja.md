# Eventmodeling のトークン

英語版: [eventmodeling.md](./eventmodeling.md)

lexer は仕様の[先勝ちの順序][ordered-units]に従います。
語のキーワードだけが識別子を longer alternative に持ちます。
ヘッダーには空白、percent pair、終端の境界も必要ですが、
検出自体は接尾辞の境界を要求しません。
共通文法も可視 EOL 単位もありません。
[fixture: eventmodeling/lex-keyword-prefix-name]
[fixture: eventmodeling/lex-name-custom-header-dot]
[fixture: eventmodeling/header-slash-comment-glued]
[fixture: eventmodeling/header-letter] [fixture: eventmodeling/header-inline]

## トークン

| 種類         | 対象                                                                                | fixture                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | ヘッダー、文と節のキーワード、entity/data 型、metadata キーワード。                 | [fixture: eventmodeling/gram-written-tree]                                                                                                 |
| `Identifier` | 識別子の各部分と数字列の frame 名。                                                 | [fixture: eventmodeling/lex-id-forms] [fixture: eventmodeling/db-source-leading-zero]                                                      |
| `Punctuator` | 完全な ->>、[[、]]、各 dot/backtick、metadata の colon、data/description の波括弧。 | [fixture: eventmodeling/gram-written-tree]                                                                                                 |
| `String`     | 引用符を含む inline data の文字列全体。                                             | [fixture: eventmodeling/lex-inline-empty] [fixture: eventmodeling/lex-inline-quote-greedy]                                                 |
| `RawText`    | 波括弧 data の内部、metadata の値、native な無視形式。                              | [fixture: eventmodeling/line-block-values] [fixture: eventmodeling/common-whitespace] [fixture: eventmodeling/lex-native-directive-object] |

書かれた各構成要素は別の item です。
修飾名は各部分の Identifier と dot の Punctuator を持ち、
一つに連結した Identifier トークンにはしません。
frame 名は先頭のゼロを保ち、 Numeric トークンを使いません。
[fixture: eventmodeling/space-qualified-name]
[fixture: eventmodeling/lex-qualified-hidden-components]
[fixture: eventmodeling/db-source-leading-zero]

inline/block の波括弧、tag、metadata 区切りは値のトークンの外です。
引用された inline data は String のままで、
波括弧や metadata 内の引用符は RawText です。
inline data は同じ行の最後の閉じ記号を取り、
block data は本文がある閉じ方を優先します。
[fixture: eventmodeling/lex-inline-greedy]
[fixture: eventmodeling/lex-inline-quote-greedy]
[fixture: eventmodeling/lex-block-adjacent-later-close]
[fixture: eventmodeling/common-quoted-values]
[fixture: eventmodeling/data-all-types]

RawText の値は内部の空白と改行をすべて保ち、空白だけでも保ちます。
空の内部はトークンを作りませんが、空の引用文字列は String を持ちます。
title の値は ASCII 区切り一文字の後、accessibility 行は colon 直後です。
metadata の先行字下げはトークンにせず、 Db 導出時にソースから読めます。
[fixture: eventmodeling/lex-common-title-two-spaces]
[fixture: eventmodeling/common-whitespace]
[fixture: eventmodeling/lex-common-block-whitespace-only]
[fixture: eventmodeling/gram-description-block-empty-after-removal]
[fixture: eventmodeling/lex-inline-empty]
[fixture: eventmodeling/gram-common-leading-directive-both-sides]

native YAML/directive は消費した閉じ LF を除く一つの RawText item です。
共通 directive、コメント領域、選ばれた semicolon は RawText と String を切り、
String の断片は StringFragment になります。
keyword、identifier、数字列、->>、[[、]] の内部で切れると拒否します。
書かれた構成要素の間での分割は許可されます。
[fixture: eventmodeling/hidden-yaml-after-frame]
[fixture: eventmodeling/lex-native-directive-object-eof]
[fixture: eventmodeling/directive-string-middle]
[fixture: eventmodeling/directive-block-middle]
[fixture: eventmodeling/style-every-text]
[fixture: eventmodeling/directive-arrow-inside]
[fixture: eventmodeling/directive-reference-close-inside]
[fixture: eventmodeling/lex-semicolon-frame-id-inside]
[fixture: eventmodeling/directive-qualified]
[fixture: eventmodeling/directive-tag]

## コメントと trivia

LF/LS/PS を含む Notation 空白と論理的な末尾 LF はトークンにしません。
percent/slash-line コメントは物理 LF の前で終わり、LS/PS は内容です。
slash-block コメントは最初の閉じで終わり、
範囲と値は[共有の Comment の定義](../tokens.ja.md#comment)に従います。
通過した bare 行は共有 Comment となり、付随 trivia は読み直しません。
[fixture: eventmodeling/space-lines] [fixture: eventmodeling/line-ls-gap]
[fixture: eventmodeling/line-ps-gap] [fixture: eventmodeling/comment-eof]
[fixture: eventmodeling/comment-native]
[fixture: eventmodeling/comment-line-ls-body]
[fixture: eventmodeling/comment-line-ps-body]
[fixture: eventmodeling/detect-retained-bare-ls-line]
[fixture: eventmodeling/detect-retained-bare-nbsp-header]

[ordered-units]: ../../../spec/docs/diagrams/eventmodeling.md#ordered-units
