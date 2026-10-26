# Cynefin のトークン

英語版: [cynefin.md](./cynefin.md)

字句解析は仕様の
[最初の一致順](../../../spec/docs/diagrams/cynefin.md#ordered-units)に従います。
コロン付きヘッダーが裸のヘッダーより先で、
ドメイン語には末尾の境界検査がありません。
長い代替形や一般的な識別子・数値の終端は使いません。
複合一致は記述された構成要素の境界で分けます。
[fixture: cynefin/header-colon-inline]
[fixture: cynefin/gram-glued-domains]
[fixture: cynefin/lex-domain-title-priority]
[fixture: cynefin/domain-digit]

## トークン

| 種類         | 対象                                             | fixture                                                                                                                        |
| ------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | ヘッダー語、固定ドメイン語、共通キーワード。     | [fixture: cynefin/db-all-fields]                                                                                               |
| `Punctuator` | 各コロン、矢印全体、ブロックの波括弧。           | [fixture: cynefin/header-colon] [fixture: cynefin/db-all-fields]                                                               |
| `String`     | 項目と遷移ラベルの文字列。対応する引用符を含む。 | [fixture: cynefin/db-empty-texts] [fixture: cynefin/lex-string-conversion] [fixture: cynefin/lex-transition-string-conversion] |
| `RawText`    | 共通値とネイティブ隠し形式全体。                 | [fixture: cynefin/common-repeat-empty] [fixture: cynefin/hidden-all-unit-gaps]                                                 |

両ヘッダーとも cynefin-beta が一つの Keyword です。
コロンが直結した形式だけが別の Punctuator を持ちます。
グローバルディレクティブはこの境界に入れますが、
ASCII の空白やネイティブ隠し形式は入れません。
[fixture: cynefin/header-only]
[fixture: cynefin/header-colon-inline]
[fixture: cynefin/header-global-before-colon]
[fixture: cynefin/header-spaced-colon]
[fixture: cynefin/native-header-word-colon]

行値の RawText は、title の区切り 1 文字や
アクセシビリティのコロンの後の空白をすべて含みます。
区切りだけなら値のトークンはなく、残りが空白だけならあります。
ブロック値は外側の共通空白だけを除きます。
空または共通の除去対象だけのブロックに値のトークンはありません。
共通値内の引用符は RawText のままです。
[fixture: cynefin/lex-title-one-space]
[fixture: cynefin/lex-title-one-tab]
[fixture: cynefin/lex-title-two-spaces]
[fixture: cynefin/common-line-whitespace]
[fixture: cynefin/common-block-whitespace]
[fixture: cynefin/common-block-comment-only]
[fixture: cynefin/common-block-directive-only]
[fixture: cynefin/common-quoted-values]

ネイティブ隠し形式は、条件を満たす閉じまで一つの RawText です。
開始前の空白と消費した直後の改行は含みません。
YAML は本文ありの代替形を空の本文より先に試します。
先行する文字列と共通値は内部の隠し形式風テキストを包みます。
[fixture: cynefin/hidden-yaml-opener-padding]
[fixture: cynefin/hidden-yaml-adjacent-later]
[fixture: cynefin/hidden-yaml-two-nonempty]
[fixture: cynefin/hidden-directive-adjacent]
[fixture: cynefin/hidden-directive-string]
[fixture: cynefin/hidden-yaml-block]
[fixture: cynefin/hidden-directive-crlf]

共通ディレクティブ、コメント領域、選ばれたセミコロンは
String と RawText を分割し、文字列の断片は StringFragment になります。
固定語や矢印全体の内部の分割は拒否します。
構成要素の境界と値の内部では分割でき、
ネイティブの囲み記号の各文字の間も含みます。
[fixture: cynefin/directive-every-field]
[fixture: cynefin/comment-line-in-string]
[fixture: cynefin/selected-string-interior]
[fixture: cynefin/directive-domain-inside]
[fixture: cynefin/directive-arrow-inside]
[fixture: cynefin/semicolon-complex-inside]
[fixture: cynefin/semicolon-arrow-inside]
[fixture: cynefin/directive-transition-parts]
[fixture: cynefin/directive-title-parts]
[fixture: cynefin/directive-description-brace]
[fixture: cynefin/directive-native-yaml-components]
[fixture: cynefin/selected-native-directive-closer]

## コメントと trivia

単位間の ASCII 空白・タブ、可視改行、追加された LF にトークンはありません。
ネイティブの %% コメントは CR/LF の前で終わります。
検出が通過した裸の行は共通 Comment になり、
付随する trivia は保持形式の間でも読み直しません。
[fixture: cynefin/space-tabs]
[fixture: cynefin/space-lines]
[fixture: cynefin/comment-native-between-items]

[fixture: cynefin/comment-native-triple]
[fixture: cynefin/detect-retained-secondscan-bare-ls]
[fixture: cynefin/detect-retained-secondscan-bare-ps]
