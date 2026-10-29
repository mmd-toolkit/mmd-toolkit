# Usecase の位置

英語版: [usecase.md](./usecase.md)

この文書は、
[ast/usecase.md](../../../spec/docs/ast/usecase.ja.md) のソースノードについて、
[positions.md](../positions.ja.md) を補います。
トークンの項目は [tokens/usecase.md](../tokens/usecase.ja.md) が定めます。

## 範囲

Root はソース全体を覆います。
UsecaseDiagram はヘッダーから最後の文の最後のトークンまでで、
空ならヘッダーだけを覆います。
末尾のコメント、ディレクティブ、無視するセミコロンは含みません。
[fixture: usecase/header-lf] [fixture: usecase/gram-final-statement-eof]
[fixture: usecase/directive-closed-statement-ends]
[fixture: usecase/lex-style-hash-semicolon] [fixture: usecase/comment-bare-eof]

ActorStatement は actor から最後の actor の接尾部までで、
各 Actor はそのキーワードを除きます。
EntityStatement と Entity は同じ範囲です。
Actor と Entity は、書かれた形状の区切りと全接尾部を含み、
id と label は別の子のままです。 [fixture: usecase/gram-actor-list]
[fixture: usecase/db-all-fields]
[fixture: usecase/gram-labeled-source-metadata-declaration]
[fixture: usecase/gram-target-metadata-declaration]

SystemBoundaryStatement は systemBoundary から閉じの end までで、
宣言の本文を覆います。
title は周囲の形状区切りを除き、生成した親やメンバーのノードは作りません。
[fixture: usecase/gram-boundary-empty-id-reference]
[fixture: usecase/gram-boundary-empty-label]
[fixture: usecase/gram-boundary-end-eof]

RelationshipStatement は、actor の始点なら actor から、
それ以外は始点の名前から、終点の最後の接尾部までです。
端点は書かれた左右の順を保ちます。
矢印の各半分は演算子だけを覆い、
関連のラベルは開き矢印と最後の矢印の間にあります。
[fixture: usecase/gram-actor-relation] [fixture: usecase/db-arrows]
[fixture: usecase/db-labeled-arrows] [fixture: usecase/db-semantic-case]
[fixture: usecase/gram-split-opening-circle-prefix-hws-control]
[fixture: usecase/gram-split-backward-opening-dash-hws-control]

Label は、あれば文字列・markdown の区切りを含み、形状区切りは除きます。
裸のラベルは最初から最後の単位までで、
内部の空白と内容としての Unicode 空白を保ちます。
引用符内の余白は範囲にも値にも残ります。
[fixture: usecase/lex-label-unquoted-hws-trim]
[fixture: usecase/lex-label-unicode-whitespace-only]
[fixture: usecase/gram-empty-actor-label]
[fixture: usecase/gram-label-quoted-padding]
[fixture: usecase/lex-markdown-crlf]

ステレオタイプの Literal は、余白を含む内部全体で、<< と >> を除きます。
Metadata は不可分な @{ から閉じ波括弧までです。
MetadataProperty はキーから値までで、コロンも範囲内です。
引用符付きのネイティブのキーと値は、
対応する引用符を含む StringLiteral の範囲を持ちます。
raw は元の範囲のテキストです。
[fixture: usecase/gram-stereotype-trimmed-conflict]
[fixture: usecase/gram-native-trailing-comma-newline]
[fixture: usecase/lex-native-single-quoted-keys]
[fixture: usecase/lex-native-string-backslashes]

MetadataAssignmentStatement は target から metadata の閉じまでで、
NoteStatement は note から label の終わりまでです。
どちらも文を終える行終端を含みません。 [fixture: usecase/db-metadata-forward]
[fixture: usecase/gram-note-adjacent-string-label]

JsonStatement は json から最後のクラス接尾部までです。
JsonDataBlock は @ から対応する閉じ波括弧までで、
実際の開き波括弧の前の HWS も含みます。
外側の波括弧の内部だけが値となり、
埋め込んだプロパティや入れ子のオブジェクトの子は作りません。
[fixture: usecase/gram-json-spaced-at] [fixture: usecase/db-json-values]
[fixture: usecase/db-json-duplicate-order]
[fixture: usecase/div-json-balanced-invalid-array]

ClassDef、Class、Style の文は、最後のクラス名か CSS 成分までです。
StyleDeclaration はプロパティ名から値の最後の成分までです。
その UsecaseIdentifier はコロン前の余白を除き、
ダッシュ接頭部と語の間の HWS は保ちます。
Literal はコロン直後の HWS を含み、末尾の読み飛ばした HWS は除きます。
[fixture: usecase/db-all-fields]
[fixture: usecase/gram-class-name-trailing-comma]
[fixture: usecase/gram-styles-components]
[fixture: usecase/lex-css-property-padding]
[fixture: usecase/lex-class-property-custom-gap]
[fixture: usecase/lex-css-name-custom-tab]

DirectionStatement は direction からその値までです。
アクセシビリティの行の文は、空ならコロンまでで、
値があれば末尾の余白も含む物理的な値の終わりまでです。
ブロックの文は最初の閉じ波括弧までです。
厳密に空の内容には Literal の範囲がなく、空白だけの内容には全範囲があります。
[fixture: usecase/db-direction-all] [fixture: usecase/db-acctitle-empty]
[fixture: usecase/db-accdescr-empty-gap]
[fixture: usecase/gram-a11y-line-raw-padding]
[fixture: usecase/gram-a11y-block-raw-padding]
[fixture: usecase/gram-a11y-whitespace-block]

テキスト内のディレクティブ、コメント領域、選ばれたセミコロンは、
ノードの範囲内に残り、値とトークンからは除きます。
StringLiteral の raw は元の全ソース文字を保ちます。
位置は UTF-16 コード単位を数え、CR と CRLF のソース幅を保ちます。
U+2028 と U+2029 は行番号を進めません。 [fixture: usecase/directive-in-label]
[fixture: usecase/lex-native-single-quote-comment-region-ls]
[fixture: usecase/lex-style-hash-semicolon]
[fixture: usecase/lex-supplementary-label] [fixture: usecase/lex-markdown-crlf]
[fixture: usecase/lex-label-u2028] [fixture: usecase/lex-label-u2029]
