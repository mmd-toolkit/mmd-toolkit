# Wardley の位置

英語版: [wardley.md](./wardley.md)

範囲は [Wardley ノード](../../../spec/docs/ast/wardley.ja.md)に従い、
元の UTF-16 オフセットと改行を使う。
Root は入力全体を覆う。 [fixture: wardley/db-all-fields]
[fixture: wardley/line-crlf]

## 範囲

WardleyDiagram は最初の textBeforeHeader 形式、なければヘッダーから始まり、
最後の記述されたヘッダーまたは body 形式で終わる。
通過した裸の行と trivia、外側の余白、コメント、補われた LF は範囲を広げない。
ヘッダーの後の隠し形式は body に属する。 [fixture: common/detect-minimal-wardley]
[fixture: wardley/detect-real-before-retained-secondscan]
[fixture: wardley/retained-directive-between-bares]
[fixture: wardley/lex-hidden-header-no-eol] [fixture: wardley/tail-all-comments]

文は命令語、リンクなら始点名から始まる。
最後の記述要素までを覆い、可視 EOL 前の最後の textAfter 形式まで延ばす。
pipeline は必須の閉じ波括弧を含む。
子は座標括弧またはラベルオフセットから自身の接尾形式までを覆う。
可視 EOL 後の隠し形式は外側の body に属する。
textAfterOpen は必須の最初の可視 LF の前で終わる。 [fixture: wardley/db-all-fields]
[fixture: wardley/tail-all-spaces]
[fixture: wardley/lex-hidden-two-suffixes]
[fixture: wardley/lex-hidden-pipeline-open-spare]
[fixture: wardley/lex-hidden-pipeline-child-spare]
[fixture: wardley/lex-hidden-pipeline-before-close]
[fixture: wardley/lex-hidden-after-visible-eol]

座標は両括弧と内部の記述を覆う。
装飾と進化ステージは最初の textBefore 形式、なければ語、括弧、名前から始まり、
最後の要素と定義された接尾形式までを覆う。
evolution は最後のステージの接尾形式を含む。
任意の要素の前の保留形式は、その要素がある場合のみ直前の隙間に属する。
なければ次の必須要素の隙間または接尾形式に属する。 [fixture: wardley/hidden-all-unit-gaps]
[fixture: wardley/hidden-yaml-component-gaps]
[fixture: wardley/lex-hidden-evolution-members] [fixture: wardley/db-bare-link]
[fixture: wardley/lex-link-target-port-no-arrow]
[fixture: wardley/db-inertia-forms]

WardleyIdentifier は外側の余白を除き、内部のスペースとタブを含む名前を覆う。
StringLiteral は両引用符を含む。
NumericLiteral は符号なしの絶対値を覆い、オフセットのマイナスは raw の外にある。
WardleyArrow は字形全体またはフローのプラスからマーカーまでを覆う。
フローラベルの子は両単引用符を含む。 [fixture: wardley/db-unquoted-names]
[fixture: wardley/lex-name-trailing-space]
[fixture: wardley/number-offset-negative-zero] [fixture: wardley/db-empty-texts]
[fixture: wardley/line-string-values]
[fixture: wardley/directive-flow-before-label]
[fixture: wardley/directive-flow-after-label]

共通文はキーワードから始まる。
値が null なら title は語まで、アクセシビリティ行はコロンまでを覆う。
それ以外の行文は値の最後の文字まで、ブロックは必須の最初の閉じ波括弧までを覆う。
いずれも textAfter まで延ばす。
WardleyLiteral はタイトル区切り、コロン、ラベルのセミコロンの後の余白を保つ。
ブロック値は外側の共通空白のみを除き、
null には葉がない。 [fixture: wardley/common-empty-literals]
[fixture: wardley/common-title-tabs]
[fixture: wardley/common-line-whitespace]
[fixture: wardley/common-block-whitespace]
[fixture: wardley/tail-link-spaced-label]
[fixture: wardley/lex-hidden-common-prefix-eol]

WardleyIgnoredText は開きから条件を満たす閉じまでを覆う。
直前の余白と直後に消費した LF は含めない。
各一致はちょうど一つの名前付き所有先に属する。
値は共通の除去を省くが、範囲はそれをまたぐ。
StringLiteral.raw と NumericLiteral.raw は元のすべての文字を保つ。
内部の記述された改行は変えない。 [fixture: wardley/hidden-yaml-crlf]
[fixture: wardley/lex-hidden-directive-cr]
[fixture: wardley/lex-hidden-yaml-cr]
[fixture: wardley/directive-native-opener-split]
[fixture: wardley/lex-hidden-yaml-comment-region]
[fixture: wardley/directive-every-field]
[fixture: wardley/style-every-text]
