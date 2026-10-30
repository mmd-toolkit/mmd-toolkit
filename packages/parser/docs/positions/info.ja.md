# Info の位置

英語版: [info.md](./info.md)

範囲は仕様の [info の節点](../../../spec/docs/ast/info.md#nodes)を、
元の UTF-16 オフセットとソースの物理改行で実装します。
[fixture: info/common-all] [fixture: info/line-crlf]
[fixture: info/hidden-directive-cr]

## 範囲

Root は入力全体を覆い、InfoDiagram は最初の保持されたヘッダー前の形式、
なければ info から、最後のヘッダー、フラグ、本体の形式までです。
外側の空白とコメントは除きます。 [fixture: info/header-lf]
[fixture: info/header-inline-flag] [fixture: info/common-all]
[fixture: info/frontmatter-nonleading-comment]
[fixture: info/detect-second-scan-directive] [fixture: info/comment-eof]

通過したパーセントだけの行と付随するトリビアは、保持形式の間でも、
図の範囲を延ばさず、無視されるテキストの子にもなりません。
[fixture: info/lex-detect-preheader-empty-braces]
[fixture: info/lex-detect-preheader-open-brace]
[fixture: info/div-detect-retained-yaml-bare-ls]
[fixture: info/div-detect-retained-directive-bare-bom]
[fixture: info/div-detect-yaml-bare-directive]

タイトル文は title から値の最終文字まで、null ならキーワードまでです。
アクセシビリティの行の文はキーワードから値の最終文字まで、
null ならコロンまでです。 [fixture: info/title-tabs]
[fixture: info/lex-title-one-space] [fixture: info/lex-title-one-tab]
[fixture: info/lex-title-two-spaces] [fixture: info/lex-title-directive-only]
[fixture: info/acctitle-empty] [fixture: info/acctitle-gap]
[fixture: info/lex-acctitle-directive-only] [fixture: info/accdescr-line-empty]
[fixture: info/lex-accdescr-directive-only]

説明ブロック文は accDescr から最初の閉じ波括弧までです。
空、空白だけ、共通トリビアだけのブロックも含みます。
[fixture: info/accdescr-block-empty] [fixture: info/space-block-interior]
[fixture: info/lex-block-whitespace-only]
[fixture: info/lex-block-directive-only] [fixture: info/lex-block-comment-only]
[fixture: info/lex-block-open-brace]
[fixture: info/hidden-directive-block-first-brace]

各共通文は見える EOL 前の最後の textAfter まで延びます。
その EOL 後の形式は body に属し、 EOL も図固有のコメントも範囲を延ばしません。
[fixture: info/hidden-directive-title-eof]
[fixture: info/hidden-directive-acctitle-eof]
[fixture: info/hidden-directive-accdescr-eof]
[fixture: info/hidden-directive-block-eof] [fixture: info/hidden-yaml-block-eof]
[fixture: info/lex-hidden-tail-two] [fixture: info/lex-hidden-after-visible-eol]
[fixture: info/comment-after-block]

InfoLiteral は空白を含む空でない行の値全体か、
両端の共通空白を除くブロックの内部で、 null には葉がありません。
[fixture: info/title-tabs] [fixture: info/lex-title-two-spaces]
[fixture: info/acctitle-gap] [fixture: info/lex-accdescr-line-whitespace]
[fixture: info/space-block-interior] [fixture: info/lex-block-whitespace-only]
[fixture: info/lex-block-directive-only] [fixture: info/lex-block-comment-only]

InfoIgnoredText はソースの改行と内部の空白を保ち、
開始から条件を満たす終了フェンスまでを含みます。
前の ASCII 空白と字句規則が消費する直後の LF を除き、
追加の LF は範囲を延ばしません。 [fixture: info/hidden-yaml-empty]
[fixture: info/hidden-yaml-open-padding]
[fixture: info/hidden-directive-padding] [fixture: info/hidden-directive-cr]
[fixture: info/lex-hidden-body-separators] [fixture: info/hidden-yaml-cr]
[fixture: info/lex-yaml-body-separators]
[fixture: info/hidden-directive-title-eof] [fixture: info/hidden-yaml-block-eof]

本文ありを優先する YAML 規則は、隣接する 3 つのフェンスを 1 つの葉にします。
各一致の所有先は textBeforeHeader、textBeforeShowInfo、body、textAfter の、
いずれか 1 か所です。 [fixture: info/lex-yaml-three-fences]
[fixture: info/frontmatter-nonleading-comment]
[fixture: info/lex-flag-hidden-two] [fixture: info/lex-hidden-without-flag]
[fixture: info/lex-hidden-tail-two] [fixture: info/lex-yaml-two-before-flag]

共通ディレクティブ、コメント領域、選択されたセミコロンは、
それらをまたぐ節点の範囲内に残り、記述値からは除かれます。
[fixture: info/directive-title-value] [fixture: info/directive-block-value]
[fixture: info/comment-block] [fixture: info/lex-line-comment-region-ls]
[fixture: info/style-title] [fixture: info/lex-hidden-nested-global]
[fixture: info/lex-yaml-common-comment] [fixture: info/lex-yaml-fences-selected]
