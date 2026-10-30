# Venn の節点

英語版: [venn.md](./venn.md)

この文書は図種 `venn` の木を定義します。
共通部分は [ast.ja.md](../ast.ja.md)、
構文と受理条件は [diagrams/venn.ja.md](../diagrams/venn.ja.md) にあります。
値の Db への読み方は、
[tests パッケージの要約](../../../tests/docs/db-summaries.ja.md#venn)
にあります。

値は [ノード](../ast.ja.md#ノード) の書かれたテキストを保ちます。
[fixture: venn/lex-cr-quoted-value] [fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-identifier-comment-line]
[fixture: venn/lex-label-comment-line]
[fixture: venn/lex-identifier-directive-middle]
[fixture: venn/lex-label-directive-middle]
[fixture: venn/lex-identifier-style-rule]
元の行終端子と内部の空白を含み、ディレクティブ、共通のコメント領域、
選ばれた無視するセミコロンを除きます。 [fixture: venn/lex-cr-quoted-value]
[fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-identifier-comment-line]
[fixture: venn/lex-label-comment-line]
[fixture: venn/lex-identifier-directive-middle]
[fixture: venn/lex-label-directive-middle]
[fixture: venn/lex-identifier-style-rule]
[fixture: venn/lex-union-converted-equivalent-name]

## 節点

### VennDiagram

| フィールド | 型                     | 意味           |
| ---------- | ---------------------- | -------------- |
| `body`     | VennStatement のリスト | ソース順の文。 |

子の欄: `body`。 [fixture: venn/header-only] [fixture: venn/header-only-lf]
空でも構いません。 [fixture: venn/header-only] [fixture: venn/header-only-lf]

VennStatement は VennSubsetStatement、VennTextStatement、 VennStyleStatement、
VennTitleStatement、 VennIgnoredText のいずれかです。
[fixture: venn/db-all-fields] [fixture: venn/db-grid-comment-header-line]

見出しの節点はなく、見出しの行の文は `body` に属します。
[fixture: venn/header-statement-on-line] [fixture: venn/db-title-on-header]
[fixture: venn/db-indent-after-blank] [fixture: venn/db-indent-after-comment]
[fixture: venn/lex-comment-blank-header]
空行とコメントは文の節点を作りません。 [fixture: venn/header-statement-on-line]
[fixture: venn/db-title-on-header] [fixture: venn/db-indent-after-blank]
[fixture: venn/db-indent-after-comment] [fixture: venn/lex-comment-blank-header]

繰り返す宣言は字下げによる入れ子にせず、書かれた順の別々の文として保ちます。
[fixture: venn/db-three-definitions] [fixture: venn/db-union-three-definitions]
[fixture: venn/db-text-three-definitions]
[fixture: venn/db-style-three-definitions-same-target]
[fixture: venn/db-indent-width]

### VennSubsetStatement

| フィールド | 型                                   | 意味                          |
| ---------- | ------------------------------------ | ----------------------------- |
| `kind`     | 文字列                               | `set` か `union`。            |
| `sets`     | Identifier か StringLiteral のリスト | 書かれた名前。                |
| `label`    | VennLabel か null                    | 省略可能な角括弧ラベル。      |
| `size`     | NumericLiteral か null               | コロンの後の省略可能な size。 |

子の欄: `sets`、`label`、 `size`。 [fixture: venn/db-form-set-label-size]
[fixture: venn/db-form-union-label-size]

`kind` はキーワードの小文字形です。 [fixture: venn/lex-keyword-set-upper]
[fixture: venn/lex-keyword-union-upper] [fixture: venn/db-form-set]
[fixture: venn/db-form-union] [fixture: venn/db-union-repeated-member]
[fixture: venn/db-case-distinct-ids]
`sets` は `set` では名前一つ、`union` では二つ以上で、綴り、順序、
重複を保ちます。 [fixture: venn/lex-keyword-set-upper]
[fixture: venn/lex-keyword-union-upper] [fixture: venn/db-form-set]
[fixture: venn/db-form-union] [fixture: venn/db-union-repeated-member]
[fixture: venn/db-case-distinct-ids]

裸の名前は Identifier 節点、引用名は StringLiteral 節点で、
空の文字列と引用符の内側の余白も含みます。
[fixture: venn/db-grid-dash-identifier-bare]
[fixture: venn/db-empty-identifiers] [fixture: venn/db-quoted-padding]
[fixture: venn/lex-identifier-directive-only]

`label` はラベルが書かれないときだけ null で、
空の引用ラベルは VennLabel を持ちます。 [fixture: venn/db-form-set]
[fixture: venn/db-form-set-label] [fixture: venn/db-label-empty]
[fixture: venn/lex-empty-label-before-size]
[fixture: venn/lex-label-quoted-directive-only]
[fixture: venn/lex-label-quoted-ignored-semicolon-only]

`size` はコロンと size が書かれないときだけ null で、
ゼロと負の size は NumericLiteral 節点です。 [fixture: venn/db-form-set]
[fixture: venn/db-form-set-size] [fixture: venn/db-size-zero]
[fixture: venn/db-size-negative]

NumericLiteral は符号付きゼロと桁あふれも含む共通の数の定義に従い、
`raw` は書かれた数の綴りを保ちます。 [fixture: venn/db-size-negative-zero]
[fixture: venn/db-size-overflow] [fixture: venn/db-size-negative-overflow]
[fixture: venn/db-size-leading-zeros]

### VennTextStatement

| フィールド | 型                                          | 意味                                |
| ---------- | ------------------------------------------- | ----------------------------------- |
| `targets`  | Identifier か StringLiteral のリストか null | 明示の対象。暗黙の text では null。 |
| `id`       | Identifier、StringLiteral、NumericLiteral   | 書かれた text の id。               |
| `label`    | VennLabel か null                           | 省略可能な角括弧ラベル。            |

子の欄: `targets`、`id`、 `label`。 [fixture: venn/db-form-text-id-label]
[fixture: venn/db-form-indent-id-label]

明示の対象は空でない書かれたリストで、綴り、順序、重複を保ちます。
[fixture: venn/db-text-comma-list] [fixture: venn/db-form-text-string]
[fixture: venn/db-form-indent-id] [fixture: venn/db-indent-width]
[fixture: venn/gram-repeated-target-lists]
暗黙の text の `targets` は null で、
推定した親と字下げのフィールドはありません。 [fixture: venn/db-text-comma-list]
[fixture: venn/db-form-text-string] [fixture: venn/db-form-indent-id]
[fixture: venn/db-indent-width] [fixture: venn/gram-repeated-target-lists]

`id` は裸では Identifier、引用では StringLiteral、数値では NumericLiteral で、
`007` のような綴りも含みます。 [fixture: venn/db-form-text-id]
[fixture: venn/db-form-text-string] [fixture: venn/db-form-text-number]
[fixture: venn/db-text-leading-zeros] [fixture: venn/db-form-indent-number]

`label` は省略時に null で、数値の id の `label` は常に null です。
[fixture: venn/db-form-text-id] [fixture: venn/db-form-text-id-label]
[fixture: venn/db-form-text-string-label] [fixture: venn/db-form-text-number]
[fixture: venn/gram-size-numeric-label]

### VennStyleStatement

| フィールド   | 型                                   | 意味                   |
| ------------ | ------------------------------------ | ---------------------- |
| `targets`    | Identifier か StringLiteral のリスト | 書かれた対象。         |
| `properties` | VennStyleProperty のリスト           | 書かれた全プロパティ。 |

子の欄: `targets`、 `properties`。 [fixture: venn/db-form-style-multiple]
[fixture: venn/db-style-duplicate-key] [fixture: venn/db-style-case-and-order]
[fixture: venn/db-style-unknown] [fixture: venn/gram-repeated-target-lists]
両方のリストは空でなく、書かれた順序と繰り返しを保ちます。
[fixture: venn/db-form-style-multiple] [fixture: venn/db-style-duplicate-key]
[fixture: venn/db-style-case-and-order] [fixture: venn/db-style-unknown]
[fixture: venn/gram-repeated-target-lists]

### VennStyleProperty

| フィールド | 型                           | 意味                   |
| ---------- | ---------------------------- | ---------------------- |
| `key`      | Identifier                   | 裸のプロパティキー。   |
| `value`    | StringLiteral か VennLiteral | 書かれたプロパティ値。 |

子の欄: `key`、 `value`。 [fixture: venn/db-style-duplicate-key]
[fixture: venn/db-style-prototype-keys]
[fixture: venn/db-form-style-documented-properties]
予約語以外のキーは、繰り返すキーとプロトタイプに関係するキーも含め、
すべて保ちます。 [fixture: venn/db-style-duplicate-key]
[fixture: venn/db-style-prototype-keys]
[fixture: venn/db-form-style-documented-properties]

引用値は空の文字列も含めて StringLiteral です。
[fixture: venn/db-form-style-string] [fixture: venn/lex-style-empty]
[fixture: venn/db-form-style-number] [fixture: venn/db-form-style-hex]
[fixture: venn/lex-style-single-number-whole-spelling]
裸の値は数か色の単位一つでも常に VennLiteral です。
[fixture: venn/db-form-style-string] [fixture: venn/lex-style-empty]
[fixture: venn/db-form-style-number] [fixture: venn/db-form-style-hex]
[fixture: venn/lex-style-single-number-whole-spelling]

### VennTitleStatement

| フィールド | 型          | 意味                                   |
| ---------- | ----------- | -------------------------------------- |
| `value`    | VennLiteral | 最初の区切りの後のタイトルのテキスト。 |

子の欄: `value`。 [fixture: venn/db-title-padding]
[fixture: venn/db-title-only-whitespace] [fixture: venn/gram-title-empty]
[fixture: venn/gram-title-space-end]
空でも null でもありません。 [fixture: venn/db-title-padding]
[fixture: venn/db-title-only-whitespace] [fixture: venn/gram-title-empty]
[fixture: venn/gram-title-space-end]

`title` の後の最初の空白の区切りを除き、
それ以降のすべての空白文字と引用符を `value` に含めます。
[fixture: venn/db-title-padding] [fixture: venn/db-title-quotes]
[fixture: venn/db-title-only-whitespace]
[fixture: venn/db-title-value-next-line]

### VennLabel

| フィールド | 型     | 意味                                 |
| ---------- | ------ | ------------------------------------ |
| `kind`     | 文字列 | `text` か `string`。                 |
| `value`    | 文字列 | 文字列の引用符を除いた角括弧の内部。 |

子の欄はありません。 [fixture: venn/db-set-label]
[fixture: venn/db-form-set-label]
`kind` は裸のラベルでは `text`、直ちに引用されたラベルでは `string` です。
[fixture: venn/db-set-label] [fixture: venn/db-form-set-label]

値は角括弧と外側の文字列の引用符を除き、書かれた余白と行終端子をすべて保ちます。
[fixture: venn/lex-label-bare-padding] [fixture: venn/db-label-spaces]
[fixture: venn/lex-label-bare-whitespace-line] [fixture: venn/db-label-empty]
[fixture: venn/gram-label-bare-empty] [fixture: venn/db-grid-crlf-label-bare]
[fixture: venn/lex-crlf-quoted-value]
引用ラベルだけが空の値を持てます。 [fixture: venn/lex-label-bare-padding]
[fixture: venn/db-label-spaces] [fixture: venn/lex-label-bare-whitespace-line]
[fixture: venn/db-label-empty] [fixture: venn/gram-label-bare-empty]
[fixture: venn/db-grid-crlf-label-bare] [fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-label-quoted-directive-only]
[fixture: venn/lex-label-quoted-ignored-semicolon-only]
[fixture: venn/lex-label-bare-comment-only]
[fixture: venn/lex-label-quoted-comment-only]

バッククォートと単一引用符は通常の内容です。 [fixture: venn/db-label-backticks]
[fixture: venn/db-label-inner-quotes]
[fixture: venn/lex-label-quoted-close-bracket-inside]
[fixture: venn/lex-label-bare-open-bracket-inside]
引用ラベルは `]` を、裸のラベルは `[` を含められます。
[fixture: venn/db-label-backticks] [fixture: venn/db-label-inner-quotes]
[fixture: venn/lex-label-quoted-close-bracket-inside]
[fixture: venn/lex-label-bare-open-bracket-inside]

### VennLiteral

| フィールド | 型     | 意味               |
| ---------- | ------ | ------------------ |
| `value`    | 文字列 | 書かれたテキスト。 |

子の欄はありません。 [fixture: venn/db-title-padding]
[fixture: venn/db-title-only-whitespace] [fixture: venn/db-form-style-tokens]
[fixture: venn/lex-style-adjacent-units]
[fixture: venn/lex-style-single-number-whole-spelling]
タイトルは最初の区切りの後のテキストをすべて保ちます。
[fixture: venn/db-title-padding] [fixture: venn/db-title-only-whitespace]
[fixture: venn/db-form-style-tokens] [fixture: venn/lex-style-adjacent-units]
[fixture: venn/lex-style-single-number-whole-spelling]
裸の style 値は atom とその間の空白を、空白を補わずに保ちます。
[fixture: venn/db-title-padding] [fixture: venn/db-title-only-whitespace]
[fixture: venn/db-form-style-tokens] [fixture: venn/lex-style-adjacent-units]
[fixture: venn/lex-style-single-number-whole-spelling]

### VennIgnoredText

| フィールド | 型     | 意味                               |
| ---------- | ------ | ---------------------------------- |
| `value`    | 文字列 | 飲み込まれた空白以外の断片の綴り。 |

子の欄はありません。 [fixture: venn/db-grid-comment-header-line]
[fixture: venn/lex-style-extra-id-eaten] [fixture: venn/lex-set-colon-eaten]
[fixture: venn/header-nonascii-eaten]
[fixture: venn/gram-header-non-bmp-before-comment]
値はコメントの接頭辞の規則が飲み込む、
図のコメントの直前の一つの UTF-16 符号単位で、コメント自体を除きます。
[fixture: venn/db-grid-comment-header-line]
[fixture: venn/lex-style-extra-id-eaten] [fixture: venn/lex-set-colon-eaten]
[fixture: venn/header-nonascii-eaten]
[fixture: venn/gram-header-non-bmp-before-comment]
[fixture: venn/lex-first-rule-comment-before-multiline-string]

節点は完全な文の後も含めて、そのソース位置の `body` に置きます。
[fixture: venn/lex-set-extra-id-eaten]
[fixture: venn/lex-text-extra-one-letter-eaten]
[fixture: venn/lex-union-extra-id-eaten]
[fixture: venn/lex-style-comment-ignored-next-property-comma]
[fixture: venn/lex-inline-comment-eats-id]
[fixture: venn/lex-after-set-size-comment-glued]
欠けた必須の引数を置き換えません。 [fixture: venn/lex-set-extra-id-eaten]
[fixture: venn/lex-text-extra-one-letter-eaten]
[fixture: venn/lex-union-extra-id-eaten]
[fixture: venn/lex-style-comment-ignored-next-property-comma]
[fixture: venn/lex-inline-comment-eats-id]
[fixture: venn/lex-after-set-size-comment-glued]
