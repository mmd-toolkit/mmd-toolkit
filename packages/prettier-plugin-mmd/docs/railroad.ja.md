# Railroad の整形規則

英語版: [railroad.md](./railroad.md)

IR、EBNF、ABNF、PEG の決定32項目に従い、
一つの[railroad の木](../../spec/docs/ast/railroad.ja.md)と共有の平坦な本文
printer を使います。
parser が Root.diagramType で方言を選び、
printer は方言を再判定せずその node と token を使います。
各規則で選択の理由を説明し、
[互換性](./compatibility.ja.md#railroad-の方言と書かれた値)に保持する文字と
mermaid.js との差をまとめます。

## 規則

### 見出し

見出しを第1列に置き、通常の最初の文を次の行へ移します。
方言を見つけやすくするためです。
IR は `railroad-beta`、EBNF は `railroad-ebnf-beta`、
ABNF は `railroad-abnf-beta`、PEG は `railroad-peg-beta` を保ちます。
colon や flag は加えません。
hidden form、共有 trivia、保護された semicolon 区間は共有の境界規則に従い、
空の本文は空のままにします。

[fixture: railroad/header/abnf-hidden]

[fixture: railroad/header/abnf-inline]

[fixture: railroad/header/abnf-metadata]

[fixture: railroad/header/ebnf-global]

[fixture: railroad/header/ebnf-inline]

[fixture: railroad/header/ebnf-metadata]

[fixture: railroad/header/ir-comment]

[fixture: railroad/header/ir-inline]

[fixture: railroad/header/ir-metadata]

[fixture: railroad/header/peg-hidden-spare]

[fixture: railroad/header/peg-inline]

[fixture: railroad/header/peg-metadata]

[corpus fixture: railroad/ir-header-only]

[corpus fixture: railroad/ebnf-header-only]

[corpus fixture: railroad/abnf-header-only]

[corpus fixture: railroad/peg-header-only]

入力（escape 表記）: `"railroad-beta%% heading\nr=terminal(\"x\");"`。

出力
([header/ir-comment-output.mmd](../tests/fixtures/railroad/header/ir-comment-output.mmd)):

```mmd
railroad-beta%% heading
  r = terminal("x");
```

入力（escape 表記）: `"railroad-ebnf-beta%%{wrap}%% r=\"x\";"`。

出力
([header/ebnf-global-output.mmd](../tests/fixtures/railroad/header/ebnf-global-output.mmd)):

```mmd
railroad-ebnf-beta
  %%{wrap}%% r = "x";
```

入力（escape 表記）: `"railroad-abnf-beta%%{!heading}%%\nr=\"x\";"`。

出力
([header/abnf-hidden-output.mmd](../tests/fixtures/railroad/header/abnf-hidden-output.mmd)):

```mmd
railroad-abnf-beta%%{!heading}%%
  r = "x";
```

入力（escape 表記）: `"railroad-peg-beta%%{!heading}%%\n\nr<-\"x\";"`。

出力
([header/peg-hidden-spare-output.mmd](../tests/fixtures/railroad/header/peg-hidden-spare-output.mmd)):

```mmd
railroad-peg-beta%%{!heading}%%
  r <- "x";
```

### 字下げ

共有の平坦な本文 printer を使い、通常の規則、metadata、
独立したコメントと Root directive を設定の1段で字下げします。
既定は2 spaces、tabWidth 4 は4 spaces、0 は0 spaces です。
列に文法上の意味がないためです。
useTabs は幅0でも1 tab です。
構造の継続行と規則内の独立した trivia は2段、
別行の構造的な閉じ括弧と終端は文の位置に揃えます。
値の継続列、hidden の内部と保持 prefix は元の列を保ちます。
semicolon の保護区間の最初の行は、他の平坦な図種と同じく本文の1段に揃えます。
2行目以降は保護された本文に属するため、書かれた列を保ちます。

[fixture: railroad/indentation/abnf-default]

[fixture: railroad/indentation/abnf-four]

[fixture: railroad/indentation/abnf-tabs]

[fixture: railroad/indentation/abnf-zero]

[fixture: railroad/indentation/abnf-zero-tabs]

[fixture: railroad/indentation/ebnf-default]

[fixture: railroad/indentation/ebnf-four]

[fixture: railroad/indentation/ebnf-tabs]

[fixture: railroad/indentation/ebnf-zero]

[fixture: railroad/indentation/ebnf-zero-tabs]

[fixture: railroad/indentation/ir-default]

[fixture: railroad/indentation/ir-four]

[fixture: railroad/indentation/ir-tabs]

[fixture: railroad/indentation/ir-zero]

[fixture: railroad/indentation/ir-zero-tabs]

[fixture: railroad/indentation/peg-default]

[fixture: railroad/indentation/peg-four]

[fixture: railroad/indentation/peg-tabs]

[fixture: railroad/indentation/peg-zero]

[fixture: railroad/indentation/peg-zero-tabs]

入力（escape 表記）: `"railroad-beta\n r=terminal(\"indent\");"`。

出力
([indentation/ir-default-output.mmd](../tests/fixtures/railroad/indentation/ir-default-output.mmd)):

```mmd
railroad-beta
  r = terminal("indent");
```

入力（escape 表記）: `"railroad-ebnf-beta\n r=\"indent\";"`。

出力
([indentation/ebnf-default-output.mmd](../tests/fixtures/railroad/indentation/ebnf-default-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "indent";
```

入力（escape 表記）: `"railroad-abnf-beta\n r=\"indent\";"`。

出力
([indentation/abnf-default-output.mmd](../tests/fixtures/railroad/indentation/abnf-default-output.mmd)):

```mmd
railroad-abnf-beta
  r = "indent";
```

入力（escape 表記）: `"railroad-peg-beta\n r<-\"indent\";"`。

出力
([indentation/peg-default-output.mmd](../tests/fixtures/railroad/indentation/peg-default-output.mmd)):

```mmd
railroad-peg-beta
  r <- "indent";
```

### 規則ごとの行

通常の規則を1行ずつに置き、必須の終端 `;` を直前の空白なしで定義に付けます。
構文を変えずに規則の境界を見やすくするためです。
4方言とも最後の規則にも終端が必要です。
ABNF の終端の直後は LF または EOF にします。
`; note` はコメントなので終端にはなりません。
そのコメントと本当の終端は改行を越えて動かしません。
共有の semicolon 保護を優先します。

[fixture: railroad/statements-one-per-line/abnf-terminator]

[fixture: railroad/statements-one-per-line/abnf-terminators]

[fixture: railroad/statements-one-per-line/ebnf-rules]

[fixture: railroad/statements-one-per-line/ebnf-terminator]

[fixture: railroad/statements-one-per-line/ir-rules]

[fixture: railroad/statements-one-per-line/ir-terminator]

[fixture: railroad/statements-one-per-line/peg-rules]

[fixture: railroad/statements-one-per-line/peg-terminator]

入力（escape 表記）:
`"railroad-beta a=terminal(\"first\");b=nonterminal(\"a\");"`。

出力
([statements-one-per-line/ir-rules-output.mmd](../tests/fixtures/railroad/statements-one-per-line/ir-rules-output.mmd)):

```mmd
railroad-beta
  a = terminal("first");
  b = nonterminal("a");
```

入力（escape 表記）: `"railroad-ebnf-beta a=\"first\";b::=a;"`。

出力
([statements-one-per-line/ebnf-rules-output.mmd](../tests/fixtures/railroad/statements-one-per-line/ebnf-rules-output.mmd)):

```mmd
railroad-ebnf-beta
  a = "first";
  b ::= a;
```

入力（escape 表記）: `"railroad-abnf-beta\nr=\"terminator\" \t;"`。

出力
([statements-one-per-line/abnf-terminator-output.mmd](../tests/fixtures/railroad/statements-one-per-line/abnf-terminator-output.mmd)):

```mmd
railroad-abnf-beta
  r = "terminator";
```

入力（escape 表記）: `"railroad-peg-beta a<-\"first\";b<-a;"`。

出力
([statements-one-per-line/peg-rules-output.mmd](../tests/fixtures/railroad/statements-one-per-line/peg-rules-output.mmd)):

```mmd
railroad-peg-beta
  a <- "first";
  b <- a;
```

### 代入

代入の両側を通常の1 space にし、名前の列は揃えません。
IR と ABNF の `=`、EBNF の各 `=` または `::=`、PEG の `<-` を保ちます。
EBNF の2形は同じ Db ですが、原文の記号を置き換える必要はありません。
複合記号は1 token のままにします。

[fixture: railroad/assignment/abnf-spaces]

[fixture: railroad/assignment/ebnf-spellings]

[fixture: railroad/assignment/ir-spaces]

[fixture: railroad/assignment/peg-spaces]

入力（escape 表記）:
`"railroad-beta\nlongName\t=\tterminal(\"assignment\");s=terminal(\"short\");"`。

出力
([assignment/ir-spaces-output.mmd](../tests/fixtures/railroad/assignment/ir-spaces-output.mmd)):

```mmd
railroad-beta
  longName = terminal("assignment");
  s = terminal("short");
```

入力（escape 表記）:
`"railroad-ebnf-beta\nlongName::=\"assignment\";s =\"short\";"`。

出力
([assignment/ebnf-spellings-output.mmd](../tests/fixtures/railroad/assignment/ebnf-spellings-output.mmd)):

```mmd
railroad-ebnf-beta
  longName ::= "assignment";
  s = "short";
```

入力（escape 表記）:
`"railroad-abnf-beta\nlongName\t=\t\"assignment\";\ns=\"short\";"`。

出力
([assignment/abnf-spaces-output.mmd](../tests/fixtures/railroad/assignment/abnf-spaces-output.mmd)):

```mmd
railroad-abnf-beta
  longName = "assignment";
  s = "short";
```

入力（escape 表記）:
`"railroad-peg-beta\nlongName\t<-\t\"assignment\";s<-\"short\";"`。

出力
([assignment/peg-spaces-output.mmd](../tests/fixtures/railroad/assignment/peg-spaces-output.mmd)):

```mmd
railroad-peg-beta
  longName <- "assignment";
  s <- "short";
```

### 選択

EBNF の選択は `a | b`、ABNF と PEG は `a / b` にします。
両側の通常の1 space で選択肢を見分けやすくします。
順序と階層は保ち、IR の choice call は呼出しの規則に従います。

[fixture: railroad/choices/abnf-slashes]

[fixture: railroad/choices/ebnf-bars]

[fixture: railroad/choices/peg-slashes]

入力（escape 表記）:
`"railroad-ebnf-beta\nr=\"red\"|\"green\"\t|\t\"violet\";"`。

出力
([choices/ebnf-bars-output.mmd](../tests/fixtures/railroad/choices/ebnf-bars-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "red" | "green" | "violet";
```

入力（escape 表記）:
`"railroad-abnf-beta\nr=\"red\"/\"green\"\t/\t\"violet\";"`。

出力
([choices/abnf-slashes-output.mmd](../tests/fixtures/railroad/choices/abnf-slashes-output.mmd)):

```mmd
railroad-abnf-beta
  r = "red" / "green" / "violet";
```

入力（escape 表記）:
`"railroad-peg-beta\nr<-\"red\"/\"green\"\t/\t\"violet\";"`。

出力
([choices/peg-slashes-output.mmd](../tests/fixtures/railroad/choices/peg-slashes-output.mmd)):

```mmd
railroad-peg-beta
  r <- "red" / "green" / "violet";
```

### EBNF の並び

並びの各境界で任意 comma の有無を保ちます。
comma の前は通常の空白なし、後は1 space、comma のない境界は1 space です。
混在する形も混在のままにします。
comma の追加や削除で Db が同じでも、書かれた句読点を失うためです。

[fixture: railroad/ebnf-sequences/adjacency]

[fixture: railroad/ebnf-sequences/commas]

[fixture: railroad/ebnf-sequences/mixed]

入力（escape 表記）: `"railroad-ebnf-beta\nr=first\tsecond;"`。

出力
([ebnf-sequences/adjacency-output.mmd](../tests/fixtures/railroad/ebnf-sequences/adjacency-output.mmd)):

```mmd
railroad-ebnf-beta
  r = first second;
```

### ABNF と PEG の並び

ABNF と PEG の隣り合う member は通常の1 space で分けます。
接触していた文字列や group も対象です。
member を見分けやすくし、別の名前が一つになるのを防ぎます。
comma は加えません。

[fixture: railroad/sequences/abnf-members]

[fixture: railroad/sequences/abnf-names]

[fixture: railroad/sequences/peg-members]

[fixture: railroad/sequences/peg-names]

入力（escape 表記）: `"railroad-abnf-beta\nr=\"a\"\"b\"(ref)[\"last\"]%x44;"`。

出力
([sequences/abnf-members-output.mmd](../tests/fixtures/railroad/sequences/abnf-members-output.mmd)):

```mmd
railroad-abnf-beta
  r = "a" "b" (ref) ["last"] %x44;
```

入力（escape 表記）: `"railroad-peg-beta\nr<-\"a\"\"b\"(ref).;"`。

出力
([sequences/peg-members-output.mmd](../tests/fixtures/railroad/sequences/peg-members-output.mmd)):

```mmd
railroad-peg-beta
  r <- "a" "b" (ref) .;
```

### 括弧

EBNF の `(expr)`、`[expr]`、`{expr}`、ABNF の `(expr)`、`[expr]`、
PEG の `(expr)` の内側の通常の空白を詰めます。
入れ子や singleton を含め、括弧はすべて残します。
内端を揃え、括弧の削除で Db が同じでも原文の構造を保つためです。

[fixture: railroad/groups/abnf-delimiters]

[fixture: railroad/groups/ebnf-delimiters]

[fixture: railroad/groups/peg-delimiters]

入力（escape 表記）:
`"railroad-ebnf-beta\nr=( ( \"group\" ) ) [ \"optional\" ] { \"repeat\" };"`。

出力
([groups/ebnf-delimiters-output.mmd](../tests/fixtures/railroad/groups/ebnf-delimiters-output.mmd)):

```mmd
railroad-ebnf-beta
  r = (("group")) ["optional"] {"repeat"};
```

入力（escape 表記）:
`"railroad-abnf-beta\nr=( ( \"group\" ) ) [ \"optional\" ];"`。

出力
([groups/abnf-delimiters-output.mmd](../tests/fixtures/railroad/groups/abnf-delimiters-output.mmd)):

```mmd
railroad-abnf-beta
  r = (("group")) ["optional"];
```

入力（escape 表記）: `"railroad-peg-beta\nr<-( ( \"group\" ) );"`。

出力
([groups/peg-delimiters-output.mmd](../tests/fixtures/railroad/groups/peg-delimiters-output.mmd)):

```mmd
railroad-peg-beta
  r <- (("group"));
```

### 後置演算子

EBNF と PEG の AST 上の後置演算子 `?`、`*`、`+` を operand に付けます。
EBNF の連鎖順と PEG の一つの suffix を保ちます。
EBNF の special sequence の優先は AST に表れているため、
raw leaf 内の疑問符を後置演算子に読み替えません。
call や group に置き換えず、適用先を見やすくするためです。

[fixture: railroad/postfixes/ebnf-chain]

[fixture: railroad/postfixes/ebnf-question]

[fixture: railroad/postfixes/ebnf-special-priority]

[fixture: railroad/postfixes/peg-suffixes]

入力（escape 表記）: `"railroad-ebnf-beta\nr=\"chain\" * + [\"optional\"] ?;"`。

出力
([postfixes/ebnf-chain-output.mmd](../tests/fixtures/railroad/postfixes/ebnf-chain-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "chain"*+ ["optional"]?;
```

入力（escape 表記）:
`"railroad-peg-beta\nr<-\"optional\" ? \"repeat\" * (ref) +;"`。

出力
([postfixes/peg-suffixes-output.mmd](../tests/fixtures/railroad/postfixes/peg-suffixes-output.mmd)):

```mmd
railroad-peg-beta
  r <- "optional"? "repeat"* (ref)+;
```

### 前置 predicate

PEG の predicate は `&expr`、`!expr` と詰め、suffix operand 全体を保ちます。
group、postfix、group 内の入れ子の predicate も残します。
前置記号の適用先を見やすくし、Db の label を式の代わりに使わないためです。

[fixture: railroad/predicates/peg-nested]

[fixture: railroad/predicates/peg-operands]

入力（escape 表記）: `"railroad-peg-beta\nr<- & ( ! \"inner\" ) \"tail\";"`。

出力
([predicates/peg-nested-output.mmd](../tests/fixtures/railroad/predicates/peg-nested-output.mmd)):

```mmd
railroad-peg-beta
  r <- &(!"inner") "tail";
```

### repeat の表記

ABNF の数字と star の綴りをすべて保ちます。
先頭ゼロ、exact count、上下限の省略、ゼロ、任意の範囲、巨大な整数も対象です。
完全な repeat と primary の間の通常の空白だけを詰めます。
省略した値を補ったり optional group へ変換したりしません。
Db が同じでも表記を失い、丸めた数を再印字する理由にはならないためです。

[fixture: railroad/repeats/abnf-large]

[fixture: railroad/repeats/abnf-spellings]

[fixture: railroad/repeats/abnf-zero]

入力（escape 表記）: `"railroad-abnf-beta\nr=9007199254740993 \"large\";"`。

出力
([repeats/abnf-large-output.mmd](../tests/fixtures/railroad/repeats/abnf-large-output.mmd)):

```mmd
railroad-abnf-beta
  r = 9007199254740993"large";
```

### numeric value の表記

ABNF の numeric value は source span 全体を保ちます。
base letter の大小、数字、先頭ゼロ、dot、hyphen と、
指定した base に合わない数字も対象です。
公開される terminal は raw text なので、正規化で Db が変わるためです。
span 外の後続 reference は `%x42 Z` のように別 member にします。

[fixture: railroad/numeric-values/abnf-spellings]

[fixture: railroad/numeric-values/abnf-suffix]

入力（escape 表記）: `"railroad-abnf-beta\nr=%X041.4A-4f %DFF %b2 %B001;"`。

出力
([numeric-values/abnf-spellings-output.mmd](../tests/fixtures/railroad/numeric-values/abnf-spellings-output.mmd)):

```mmd
railroad-abnf-beta
  r = %X041.4A-4f %DFF %b2 %B001;
```

### 呼出し

IR の8 constructor を `name(...)` にします。
sequence、choice、optional、oneOrMore、zeroOrMore、terminal、 nonterminal、
special が対象です。
`(` の前と括弧の内端の通常の空白を詰め、引数 comma の前を0、
後を1 space にします。
空の引用引数、入れ子、singleton の sequence と choice も保ちます。
singleton の削除で Db が同じでも原文の call を失うためです。
末尾 comma は加えません。

[fixture: railroad/calls/ir-all]

[fixture: railroad/calls/ir-singletons]

[corpus fixture: railroad/ir-native-ownership]

[corpus fixture: railroad/ir-choice-native-ownership]

[corpus fixture: railroad/ir-keywords-all-calls]

入力（escape 表記）:
`"railroad-beta\nr=sequence ( terminal ( \"first\" ) , choice ( special ( \"note\" ),nonterminal ( \"r\" ) ) , optional ( terminal ( \"\" ) ) , oneOrMore (terminal(\"many\")),zeroOrMore (terminal(\"any\")) );"`。

出力
([calls/ir-all-output.mmd](../tests/fixtures/railroad/calls/ir-all-output.mmd)):

```mmd
railroad-beta
  r = sequence(terminal("first"), choice(special("note"), nonterminal("r")), optional(terminal("")), oneOrMore(terminal("many")), zeroOrMore(terminal("any")));
```

### 例外演算子

EBNF の例外 `-` は両側を通常の1 space にします。
左結合と右の primary を保ち、Identifier 内の hyphen は分けません。
`left-right` は一つの reference、`left - right` は例外で Db が異なるため、
この空白が必要です。

[fixture: railroad/exceptions/ebnf-hyphenated-name]

[fixture: railroad/exceptions/ebnf-left-fold]

入力（escape 表記）: `"railroad-ebnf-beta\nr=left-right;\n"`。

出力
([exceptions/ebnf-hyphenated-name-output.mmd](../tests/fixtures/railroad/exceptions/ebnf-hyphenated-name-output.mmd)):

```mmd
railroad-ebnf-beta
  r = left-right;
```

### special sequence の内容

EBNF の special sequence は source span 全体を保ちます。
両端の疑問符、外端と内部の空白、引用符、backslash、継続行の列も対象です。
外端だけの trim で Db が同じでも、原文の保持により再解釈を避けます。
内部空白の圧縮は Db を変えることがあります。

[fixture: railroad/special-sequences/ebnf-content]

[fixture: railroad/special-sequences/ebnf-lines]

入力（escape 表記）: `"railroad-ebnf-beta\nr=?  first  second\t ?;"`。

出力
([special-sequences/ebnf-content-output.mmd](../tests/fixtures/railroad/special-sequences/ebnf-content-output.mmd)):

```mmd
railroad-ebnf-beta
  r = ?  first  second	 ?;
```

### 文字列

StringLiteral の source span を保ちます。
引用符、escape、空文字列、空白だけの値、内部 padding、HTML、entity、
hidden やコメントに見える文字も対象です。
singleQuote で値を書き換えません。
IR、EBNF、PEG は両方の引用符と backslash escape を認めます。
ABNF は二重引用符だけを認め、backslash を普通の文字として読みます。
再引用に整形上の利点はなく、
内容の trim や escape の誤解釈で Db が変わるためです。

[fixture: railroad/quotes/abnf-backslash]

[fixture: railroad/quotes/abnf-empty-and-text]

[fixture: railroad/quotes/ebnf-empty-and-text]

[fixture: railroad/quotes/ebnf-escape]

[fixture: railroad/quotes/ir-empty-and-text]

[fixture: railroad/quotes/ir-escape]

[fixture: railroad/quotes/peg-empty-and-text]

[fixture: railroad/quotes/peg-escape]

入力（escape 表記）:
`"railroad-beta\nr=sequence ( terminal ( \"\" ),terminal ( \" \t \" ), nonterminal ( '' ),special(\"%%literal --- <b> plain\"));"`。

出力
([quotes/ir-empty-and-text-output.mmd](../tests/fixtures/railroad/quotes/ir-empty-and-text-output.mmd)):

```mmd
railroad-beta
  r = sequence(terminal(""), terminal(" 	 "), nonterminal(''), special("%%literal --- <b> plain"));
```

入力（escape 表記）:
`"railroad-ebnf-beta\nr=\"\" , '' \" \t \" \"%%literal --- <b> plain\";"`。

出力
([quotes/ebnf-empty-and-text-output.mmd](../tests/fixtures/railroad/quotes/ebnf-empty-and-text-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "", '' " 	 " "%%literal --- <b> plain";
```

入力（escape 表記）: `"railroad-abnf-beta\nr=\"q\\n\\t\\q\";"`。

設定: `{"singleQuote":true}`。

出力
([quotes/abnf-backslash-output.mmd](../tests/fixtures/railroad/quotes/abnf-backslash-output.mmd)):

```mmd
railroad-abnf-beta
  r = "q\n\t\q";
```

入力（escape 表記）:
`"railroad-peg-beta\nr<-\"\" '' \" \t \" \"%%literal --- <b> plain\";"`。

出力
([quotes/peg-empty-and-text-output.mmd](../tests/fixtures/railroad/quotes/peg-empty-and-text-output.mmd)):

```mmd
railroad-peg-beta
  r <- "" '' " 	 " "%%literal --- <b> plain";
```

### 長い行

printWidth による規則の折返しはしません。
構造に沿う折返しでも4方言の Db は同じになり得ますが、他の平坦な図種と揃え、値、
hidden form、trivia、保護区間をまたぐ追加の折返し方針を作らない選択です。

[fixture: railroad/long-lines/abnf-width]

[fixture: railroad/long-lines/ebnf-width]

[fixture: railroad/long-lines/ir-width]

[fixture: railroad/long-lines/peg-width]

入力（escape 表記）:
`"railroad-beta\nr=sequence(terminal(\"first long terminal\"),choice(terminal(\"second long terminal\"),nonterminal(\"reference\")));"`。

設定: `{"printWidth":20}`。

出力
([long-lines/ir-width-output.mmd](../tests/fixtures/railroad/long-lines/ir-width-output.mmd)):

```mmd
railroad-beta
  r = sequence(terminal("first long terminal"), choice(terminal("second long terminal"), nonterminal("reference")));
```

入力（escape 表記）:
`"railroad-ebnf-beta\nr=(\"first long terminal\",reference)|[\"second long terminal\"] {\"third long terminal\"};"`。

設定: `{"printWidth":20}`。

出力
([long-lines/ebnf-width-output.mmd](../tests/fixtures/railroad/long-lines/ebnf-width-output.mmd)):

```mmd
railroad-ebnf-beta
  r = ("first long terminal", reference) | ["second long terminal"] {"third long terminal"};
```

入力（escape 表記）:
`"railroad-abnf-beta\nr=2*4(\"first long terminal\"/reference)[\"second long terminal\"];"`。

設定: `{"printWidth":20}`。

出力
([long-lines/abnf-width-output.mmd](../tests/fixtures/railroad/long-lines/abnf-width-output.mmd)):

```mmd
railroad-abnf-beta
  r = 2*4("first long terminal" / reference) ["second long terminal"];
```

入力（escape 表記）:
`"railroad-peg-beta\nr<-&(\"first long terminal\"/reference)+!.\"second long terminal\";"`。

設定: `{"printWidth":20}`。

出力
([long-lines/peg-width-output.mmd](../tests/fixtures/railroad/long-lines/peg-width-output.mmd)):

```mmd
railroad-peg-beta
  r <- &("first long terminal" / reference)+ !. "second long terminal";
```

### 構造上の改行

文法上 padding である通常の CR/LF gap を各位置の空白規則へ揃えます。
IR は constructor、括弧、引数、comma、EBNF は代入、選択、並び、 group、例外、
postfix が対象です。
ABNF は代入、選択、並び、完全な repeat と primary、group、 PEG は代入、選択、
並び、prefix、suffix、group が対象です。
名前、複合代入記号、repeat の内部、numeric value は分割しません。
コメント、directive、hidden の境界、保護された semicolon の改行は保ちます。
それらの join で受理や Db が変わるためです。

[fixture: railroad/component-newlines/abnf-components]

[fixture: railroad/component-newlines/ebnf-components]

[fixture: railroad/component-newlines/ir-components]

[fixture: railroad/component-newlines/peg-components]

入力（escape 表記）:
`"railroad-beta\nr\n=\nsequence\n(terminal\n(\n\"joined\"\n)\n,\nterminal(\"tail\")\n)\n;"`。

出力
([component-newlines/ir-components-output.mmd](../tests/fixtures/railroad/component-newlines/ir-components-output.mmd)):

```mmd
railroad-beta
  r = sequence(terminal("joined"), terminal("tail"));
```

入力（escape 表記）:
`"railroad-ebnf-beta\nr\n::=\n(\n\"joined\"\n,\nother\n)\n-\n\"except\"\n+\n|\n[\n\"tail\"\n]\n;"`。

出力
([component-newlines/ebnf-components-output.mmd](../tests/fixtures/railroad/component-newlines/ebnf-components-output.mmd)):

```mmd
railroad-ebnf-beta
  r ::= ("joined", other) - "except"+ | ["tail"];
```

入力（escape 表記）:
`"railroad-abnf-beta\nr\n=\n2*4\n(\n\"joined\"\n/\nother\n)\n[\n\"tail\"\n]\n;"`。

出力
([component-newlines/abnf-components-output.mmd](../tests/fixtures/railroad/component-newlines/abnf-components-output.mmd)):

```mmd
railroad-abnf-beta
  r = 2*4("joined" / other) ["tail"];
```

入力（escape 表記）:
`"railroad-peg-beta\nr\n<-\n&\n(\n\"joined\"\n/\nother\n)\n+\n!\n.\n;"`。

出力
([component-newlines/peg-components-output.mmd](../tests/fixtures/railroad/component-newlines/peg-components-output.mmd)):

```mmd
railroad-peg-beta
  r <- &("joined" / other)+ !.;
```

### 複数行の値

文字列、EBNF special sequence、metadata block の物理改行、内部空行、
継続列を保ちます。
値を一つの atom とし、後続行に構造の字下げを足しません。
内容の reflow や字下げ変更は PEG predicate の label を含め Db を変えるためです。
説明ブロックの外端と別行の閉じ括弧は共有の説明規則に従います。

[fixture: railroad/multiline-values/abnf-columns]

[fixture: railroad/multiline-values/ebnf-columns]

[fixture: railroad/multiline-values/ir-columns]

[fixture: railroad/multiline-values/peg-columns]

入力（escape 表記）:
`"railroad-beta\nr=terminal(\"first\n   continuation\n\nlast\");"`。

出力
([multiline-values/ir-columns-output.mmd](../tests/fixtures/railroad/multiline-values/ir-columns-output.mmd)):

```mmd
railroad-beta
  r = terminal("first
   continuation

last");
```

入力（escape 表記）:
`"railroad-ebnf-beta\nr=\"first\n   continuation\n\nlast\";"`。

出力
([multiline-values/ebnf-columns-output.mmd](../tests/fixtures/railroad/multiline-values/ebnf-columns-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "first
   continuation

last";
```

入力（escape 表記）:
`"railroad-abnf-beta\nr=\"first\n   continuation\n\nlast\";"`。

出力
([multiline-values/abnf-columns-output.mmd](../tests/fixtures/railroad/multiline-values/abnf-columns-output.mmd)):

```mmd
railroad-abnf-beta
  r = "first
   continuation

last";
```

入力（escape 表記）:
`"railroad-peg-beta\nr<-&\"first\n   continuation\n\nlast\";"`。

出力
([multiline-values/peg-columns-output.mmd](../tests/fixtures/railroad/multiline-values/peg-columns-output.mmd)):

```mmd
railroad-peg-beta
  r <- &"first
   continuation

last";
```

### タイトル

共有の common-line 配置を使います。
非空値の通常の外端だけを trim して `title value` にし、
null と空白だけの値は裸の `title` にします。
引用符に見える内容、escape、内部空白は保ち、次の物理行から値を取りません。
裸の title prefix と後続の規則は別の文にし、規則を値に取り込みません。
比較 Db は本文の title を除きますが、内容を書き換える理由にはなりません。

[fixture: railroad/title/abnf-next-line]

[fixture: railroad/title/abnf-prefix]

[fixture: railroad/title/abnf-trim]

[fixture: railroad/title/abnf-whitespace]

[fixture: railroad/title/ebnf-next-line]

[fixture: railroad/title/ebnf-prefix]

[fixture: railroad/title/ebnf-trim]

[fixture: railroad/title/ebnf-whitespace]

[fixture: railroad/title/ir-next-line]

[fixture: railroad/title/ir-prefix]

[fixture: railroad/title/ir-trim]

[fixture: railroad/title/ir-whitespace]

[fixture: railroad/title/peg-next-line]

[fixture: railroad/title/peg-prefix]

[fixture: railroad/title/peg-trim]

[fixture: railroad/title/peg-whitespace]

[corpus fixture: railroad/ir-name-title-prefix-first]

[corpus fixture: railroad/ebnf-name-reserved-title]

[corpus fixture: railroad/abnf-name-title-prefix-first]

[corpus fixture: railroad/peg-name-title-prefix-first]

[corpus fixture: railroad/ir-common-title-eof]

入力（escape 表記）:
`"railroad-beta\ntitle\n%% next title\nr=terminal(\"bare title\");"`。

出力
([title/ir-next-line-output.mmd](../tests/fixtures/railroad/title/ir-next-line-output.mmd)):

```mmd
railroad-beta
  title
  %% next title
  r = terminal("bare title");
```

入力（escape 表記）:
`"railroad-ebnf-beta\ntitle\n%% next title\nr=\"bare title\";"`。

出力
([title/ebnf-next-line-output.mmd](../tests/fixtures/railroad/title/ebnf-next-line-output.mmd)):

```mmd
railroad-ebnf-beta
  title
  %% next title
  r = "bare title";
```

入力（escape 表記）: `"railroad-abnf-beta\ntitle\n%% next\nr=\"bare title\";"`。

出力
([title/abnf-next-line-output.mmd](../tests/fixtures/railroad/title/abnf-next-line-output.mmd)):

```mmd
railroad-abnf-beta
  title
  %% next
  r = "bare title";
```

入力（escape 表記）:
`"railroad-peg-beta\ntitle\n%% next title\nr<-\"bare title\";"`。

出力
([title/peg-next-line-output.mmd](../tests/fixtures/railroad/title/peg-next-line-output.mmd)):

```mmd
railroad-peg-beta
  title
  %% next title
  r <- "bare title";
```

### accessibility の行

共有の common-line 配置で `accTitle: value` と `accDescr: value` にします。
colon を keyword に付け、非空値の前を通常の1 space にします。
空値は colon で終えます。
外端の空白だけを trim し、内部の文字と括弧に見える行の値は保ちます。
次行の値は join しません。
他の図種と同じ、簡潔で読みやすい配置にするためです。

[fixture: railroad/accessibility-lines/abnf-empty]

[fixture: railroad/accessibility-lines/abnf-values]

[fixture: railroad/accessibility-lines/ebnf-empty]

[fixture: railroad/accessibility-lines/ebnf-values]

[fixture: railroad/accessibility-lines/ir-empty]

[fixture: railroad/accessibility-lines/ir-values]

[fixture: railroad/accessibility-lines/peg-empty]

[fixture: railroad/accessibility-lines/peg-values]

入力（escape 表記）:
`"railroad-beta\naccTitle:\naccDescr:\nr=terminal(\"empty access\");"`。

出力
([accessibility-lines/ir-empty-output.mmd](../tests/fixtures/railroad/accessibility-lines/ir-empty-output.mmd)):

```mmd
railroad-beta
  accTitle:
  accDescr:
  r = terminal("empty access");
```

入力（escape 表記）:
`"railroad-ebnf-beta\naccTitle: \naccDescr: {literal}\nr=\"empty access\";"`。

出力
([accessibility-lines/ebnf-empty-output.mmd](../tests/fixtures/railroad/accessibility-lines/ebnf-empty-output.mmd)):

```mmd
railroad-ebnf-beta
  accTitle:
  accDescr: {literal}
  r = "empty access";
```

入力（escape 表記）:
`"railroad-abnf-beta\naccTitle: \n%% next\naccDescr:\nr=\"empty access\";"`。

出力
([accessibility-lines/abnf-empty-output.mmd](../tests/fixtures/railroad/accessibility-lines/abnf-empty-output.mmd)):

```mmd
railroad-abnf-beta
  accTitle:
  %% next
  accDescr:
  r = "empty access";
```

入力（escape 表記）:
`"railroad-peg-beta\naccTitle:\naccDescr: \n%% next\nr<-\"empty access\";"`。

出力
([accessibility-lines/peg-empty-output.mmd](../tests/fixtures/railroad/accessibility-lines/peg-empty-output.mmd)):

```mmd
railroad-peg-beta
  accTitle:
  accDescr:
  %% next
  r <- "empty access";
```

### 説明ブロック

共有の common-description 配置から layoutDescriptionBlock を使います。
空白だけの内部は、囲む内容がないため `{}` にします。
`accDescr{` の接触と `{Text}` を保ち、
外端に書かれた空白は存在する側に1 space 残します。
keyword と opener の間の通常の改行は join します。
非空の継続列と内部空行を保ち、別行の閉じ括弧を文の位置へ揃えます。
コメントや directive だけの block は共有 fallback で内容を残します。

[fixture: railroad/description-blocks/abnf-edges]

[fixture: railroad/description-blocks/abnf-lines]

[fixture: railroad/description-blocks/abnf-trivia]

[fixture: railroad/description-blocks/ebnf-edges]

[fixture: railroad/description-blocks/ebnf-lines]

[fixture: railroad/description-blocks/ebnf-trivia]

[fixture: railroad/description-blocks/ir-edges]

[fixture: railroad/description-blocks/ir-lines]

[fixture: railroad/description-blocks/ir-trivia]

[fixture: railroad/description-blocks/peg-edges]

[fixture: railroad/description-blocks/peg-lines]

[fixture: railroad/description-blocks/peg-trivia]

入力（escape 表記）:
`"railroad-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr=terminal(\"block\");"`。

出力
([description-blocks/ir-edges-output.mmd](../tests/fixtures/railroad/description-blocks/ir-edges-output.mmd)):

```mmd
railroad-beta
  accDescr{Text}
  accDescr { Text }
  accDescr {}
  r = terminal("block");
```

入力（escape 表記）:
`"railroad-ebnf-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr=\"block\";"`。

出力
([description-blocks/ebnf-edges-output.mmd](../tests/fixtures/railroad/description-blocks/ebnf-edges-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr{Text}
  accDescr { Text }
  accDescr {}
  r = "block";
```

入力（escape 表記）:
`"railroad-abnf-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr=\"block\";"`。

出力
([description-blocks/abnf-edges-output.mmd](../tests/fixtures/railroad/description-blocks/abnf-edges-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr{Text}
  accDescr { Text }
  accDescr {}
  r = "block";
```

入力（escape 表記）:
`"railroad-peg-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr<-\"block\";"`。

出力
([description-blocks/peg-edges-output.mmd](../tests/fixtures/railroad/description-blocks/peg-edges-output.mmd)):

```mmd
railroad-peg-beta
  accDescr{Text}
  accDescr { Text }
  accDescr {}
  r <- "block";
```

### コメント

独立したコメントは本文で1段、見出し前で第1列に置きます。
inline は左右と行、接触と分離を保ち、通常の分離 gap は1 space にします。
mark、内容、末尾空白、block の継続列、順序を保ちます。
line comment の後の operand と終端は次行に残します。
全方言に `%%`、IR に `/* */`、EBNF に `/* */` と `(* *)`、
ABNF に `;` の行コメント、PEG に `#` の行コメントがあります。
裸の ABNF `;` は句読点であり、`//` は native comment ではありません。
値が所有する文字は値のままにします。
所有位置を保ち、line comment がコードを取り込むのを防ぐためです。

[fixture: railroad/comments/abnf-before-terminator]

[fixture: railroad/comments/abnf-closer]

[fixture: railroad/comments/abnf-positions]

[fixture: railroad/comments/ebnf-block-columns]

[fixture: railroad/comments/ebnf-closer]

[fixture: railroad/comments/ebnf-positions]

[fixture: railroad/comments/ir-block-columns]

[fixture: railroad/comments/ir-closer]

[fixture: railroad/comments/ir-positions]

[fixture: railroad/comments/peg-bare]

[fixture: railroad/comments/peg-closer]

[fixture: railroad/comments/peg-positions]

[corpus fixture: railroad/ir-comment-bare-percent-body]

[corpus fixture: railroad/ebnf-comment-bare-percent-body]

[corpus fixture: railroad/abnf-comment-bare-percent-body]

[corpus fixture: railroad/peg-comment-bare-percent-body]

[corpus fixture: railroad/ir-comment-percent-ls]

[corpus fixture: railroad/ebnf-comment-block-ps]

[corpus fixture: railroad/abnf-comment-semicolon-ls]

[corpus fixture: railroad/peg-comment-hash-ps]

[corpus fixture: railroad/ir-comment-iso-foreign]

[corpus fixture: railroad/abnf-comment-c-foreign]

[corpus fixture: railroad/peg-comment-iso-foreign]

入力（escape 表記）:
`"railroad-beta\nr=/*first\n second*/terminal(\"comment\");"`。

出力
([comments/ir-block-columns-output.mmd](../tests/fixtures/railroad/comments/ir-block-columns-output.mmd)):

```mmd
railroad-beta
  r =/*first
 second*/terminal("comment");
```

入力（escape 表記）: `"railroad-ebnf-beta\nr=(*first\n second*)\"comment\";"`。

出力
([comments/ebnf-block-columns-output.mmd](../tests/fixtures/railroad/comments/ebnf-block-columns-output.mmd)):

```mmd
railroad-ebnf-beta
  r =(*first
 second*)"comment";
```

入力（escape 表記）: `"railroad-abnf-beta\nr=\"comment\"; note\n;"`。

出力
([comments/abnf-before-terminator-output.mmd](../tests/fixtures/railroad/comments/abnf-before-terminator-output.mmd)):

```mmd
railroad-abnf-beta
  r = "comment"; note
  ;
```

入力（escape 表記）: `"railroad-peg-beta\n#\nr<-\"bare comment\";#"`。

出力
([comments/peg-bare-output.mmd](../tests/fixtures/railroad/comments/peg-bare-output.mmd)):

```mmd
railroad-peg-beta
  #
  r <- "bare comment";#
```

### 共有 directive

Root directive を source span から元の所有位置に1回印字します。
同じ印字行の中では、両側の接触・分離を保ちます。
元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
通常の独立した directive を本文で1段字下げします。
内容の JSON 整形や見出し前への収集はしません。
一律の空白追加が、共有処理後の文字列、repeat の部品、numeric value、
predicate の operand を変えるためです。

[fixture: railroad/global-directives/between-rules]

[fixture: railroad/global-directives/abnf-components]

[fixture: railroad/global-directives/abnf-standalone]

[fixture: railroad/global-directives/ebnf-contact]

[fixture: railroad/global-directives/ebnf-standalone]

[fixture: railroad/global-directives/ir-contact]

[fixture: railroad/global-directives/ir-standalone]

[fixture: railroad/global-directives/peg-contact]

[fixture: railroad/global-directives/peg-standalone]

入力（escape 表記）:
`"railroad-beta\nr%%{wrap}%% = %%{wrap}%%terminal(\"a%%{wrap}%%last\");"`。

出力
([global-directives/ir-contact-output.mmd](../tests/fixtures/railroad/global-directives/ir-contact-output.mmd)):

```mmd
railroad-beta
  r%%{wrap}%% = %%{wrap}%%terminal("a%%{wrap}%%last");
```

入力（escape 表記）: `"railroad-ebnf-beta\nr = %%{wrap}%% \"global\";"`。

出力
([global-directives/ebnf-contact-output.mmd](../tests/fixtures/railroad/global-directives/ebnf-contact-output.mmd)):

```mmd
railroad-ebnf-beta
  r = %%{wrap}%% "global";
```

入力（escape 表記）:
`"railroad-abnf-beta\nr=2%%{wrap}%%*%%{wrap}%%4 %%{wrap}%% \"global\" %x4%%{wrap}%%1;"`。

出力
([global-directives/abnf-components-output.mmd](../tests/fixtures/railroad/global-directives/abnf-components-output.mmd)):

```mmd
railroad-abnf-beta
  r = 2%%{wrap}%%*%%{wrap}%%4 %%{wrap}%% "global" %x4%%{wrap}%%1;
```

入力（escape 表記）: `"railroad-peg-beta\nr <- &%%{wrap}%% \"global\";"`。

出力
([global-directives/peg-contact-output.mmd](../tests/fixtures/railroad/global-directives/peg-contact-output.mmd)):

```mmd
railroad-peg-beta
  r <- &%%{wrap}%% "global";
```

### hidden form の保持

RailroadIgnoredText を AST の各 owner で range 全体から1回印字します。
規則、call、list member、group、postfix、例外、repeat と primary、
predicate と operand の gap を保ちます。
本文の opener は字下げできますが、内部と closer は元の列を保ちます。
native form の YAML や JSON を整形せず、trivia を除いた value も使いません。
三つの fence が一つの form になる場合と、
失敗した directive opener が percent comment になる場合も保ちます。
受理や opaque な文字の位置を変えないためです。

[fixture: railroad/hidden-forms/abnf-fallback]

[fixture: railroad/hidden-forms/abnf-owners]

[fixture: railroad/hidden-forms/abnf-three-fences]

[fixture: railroad/hidden-forms/abnf-yaml]

[fixture: railroad/hidden-forms/ebnf-fallback]

[fixture: railroad/hidden-forms/ebnf-owners]

[fixture: railroad/hidden-forms/ebnf-three-fences]

[fixture: railroad/hidden-forms/ebnf-yaml]

[fixture: railroad/hidden-forms/ir-fallback]

[fixture: railroad/hidden-forms/ir-owners]

[fixture: railroad/hidden-forms/ir-three-fences]

[fixture: railroad/hidden-forms/ir-unary-call-owners]

[fixture: railroad/hidden-forms/ir-yaml]

[fixture: railroad/hidden-forms/peg-fallback]

[fixture: railroad/hidden-forms/peg-owners]

[fixture: railroad/hidden-forms/peg-three-fences]

[fixture: railroad/hidden-forms/peg-yaml]

入力（escape 表記）:
`"railroad-beta\n%%{!unclosed note\nr=terminal(\"fallback\");"`。

出力
([hidden-forms/ir-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/ir-fallback-output.mmd)):

```mmd
railroad-beta
  %%{!unclosed note
  r = terminal("fallback");
```

入力（escape 表記）:
`"railroad-ebnf-beta\n%%{!unclosed note\nr=\"fallback\";"`。

出力
([hidden-forms/ebnf-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/ebnf-fallback-output.mmd)):

```mmd
railroad-ebnf-beta
  %%{!unclosed note
  r = "fallback";
```

入力（escape 表記）:
`"railroad-abnf-beta\n%%{!unclosed note\nr=\"fallback\";"`。

出力
([hidden-forms/abnf-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/abnf-fallback-output.mmd)):

```mmd
railroad-abnf-beta
  %%{!unclosed note
  r = "fallback";
```

入力（escape 表記）:
`"railroad-peg-beta\n%%{!unclosed note\nr<-\"fallback\";"`。

出力
([hidden-forms/peg-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/peg-fallback-output.mmd)):

```mmd
railroad-peg-beta
  %%{!unclosed note
  r <- "fallback";
```

### hidden の境界

node range 外で消費した LF、closer 後の space と tab、
inline の接触を共有の hidden-gap 保護で残します。
通常の規則は必須 `;` で終わるため、他図種の visible-EOL 条件は加えません。
本文の form には共有の予備 LF 規則を使い、
見出し自身の form だけに header-edge の例外を使います。
見出しの行から移した文も本文の境界を保ちます。
共有の kept-line 規則で hidden form と前後の文がその行に残る場合とは区別します。

[fixture: railroad/hidden-boundaries/abnf-closing-padding]

[fixture: railroad/hidden-boundaries/abnf-header-kept-statement]

[fixture: railroad/hidden-boundaries/abnf-moved-before-hidden]

[fixture: railroad/hidden-boundaries/ebnf-closing-padding]

[fixture: railroad/hidden-boundaries/ebnf-header-kept-statement]

[fixture: railroad/hidden-boundaries/ebnf-moved-before-hidden]

[fixture: railroad/hidden-boundaries/ir-closing-padding]

[fixture: railroad/hidden-boundaries/ir-header-kept-statement]

[fixture: railroad/hidden-boundaries/ir-moved-before-hidden]

[fixture: railroad/hidden-boundaries/peg-closing-padding]

[fixture: railroad/hidden-boundaries/peg-header-kept-statement]

[fixture: railroad/hidden-boundaries/peg-moved-before-hidden]

[corpus fixture: railroad/ir-hidden-yaml-sole-lf]

[corpus fixture: railroad/ir-hidden-yaml-spare-lf]

[corpus fixture: railroad/ebnf-hidden-yaml-sole-lf]

[corpus fixture: railroad/ebnf-hidden-yaml-spare-lf]

[corpus fixture: railroad/abnf-hidden-yaml-sole-lf]

[corpus fixture: railroad/abnf-hidden-yaml-spare-lf]

[corpus fixture: railroad/peg-hidden-yaml-sole-lf]

[corpus fixture: railroad/peg-hidden-yaml-spare-lf]

[corpus fixture: railroad/ir-hidden-directive-eof]

[corpus fixture: railroad/ebnf-hidden-directive-eof]

[corpus fixture: railroad/abnf-hidden-directive-eof]

[corpus fixture: railroad/peg-hidden-directive-eof]

入力（escape 表記）:
`"railroad-beta accDescr{moved}\n%%{!after metadata}%%\n\nr=terminal(\"after moved\");"`。

出力
([hidden-boundaries/ir-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/ir-moved-before-hidden-output.mmd)):

```mmd
railroad-beta
  accDescr{moved}
  %%{!after metadata}%%

  r = terminal("after moved");
```

入力（escape 表記）:
`"railroad-ebnf-beta accDescr{moved}\n%%{!after metadata}%%\n\nr=\"after moved\";"`。

出力
([hidden-boundaries/ebnf-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/ebnf-moved-before-hidden-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr{moved}
  %%{!after metadata}%%

  r = "after moved";
```

入力（escape 表記）:
`"railroad-abnf-beta accDescr{moved}\n%%{!after metadata}%%\n\nr=\"after moved\";"`。

出力
([hidden-boundaries/abnf-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/abnf-moved-before-hidden-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr{moved}
  %%{!after metadata}%%

  r = "after moved";
```

入力（escape 表記）:
`"railroad-peg-beta accDescr{moved}\n%%{!after metadata}%%\n\nr<-\"after moved\";"`。

出力
([hidden-boundaries/peg-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/peg-moved-before-hidden-output.mmd)):

```mmd
railroad-peg-beta
  accDescr{moved}
  %%{!after metadata}%%

  r <- "after moved";
```

### 保持 prefix

textBeforeHeader があれば、見出し keyword までの prefix 全体を保ちます。
先頭 LF、passed bare trivia、保持 YAML、second-scan form、
real と hidden の順序も対象です。
共有の keepsPrefix により、
無効だった YAML が frontmatter になって埋込み title や設定を変えるのを防ぎます。
コメントだけの通常の prefix は root の整形に従います。

[fixture: railroad/retained-prefix/abnf-leading]

[fixture: railroad/retained-prefix/abnf-second-scan]

[fixture: railroad/retained-prefix/ebnf-leading]

[fixture: railroad/retained-prefix/ebnf-second-scan]

[fixture: railroad/retained-prefix/ir-leading]

[fixture: railroad/retained-prefix/ir-second-scan]

[fixture: railroad/retained-prefix/peg-leading]

[fixture: railroad/retained-prefix/peg-second-scan]

[corpus fixture: railroad/ir-detect-block-after-frontmatter]

[corpus fixture: railroad/ebnf-frontmatter-retained]

[corpus fixture: railroad/abnf-frontmatter-retained]

[corpus fixture: railroad/peg-frontmatter-retained]

[corpus fixture: railroad/ir-retained-bare-secondscan-unicode]

入力（escape 表記）:
`"\n---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-beta\nr=terminal(\"prefix\");"`。

出力
([retained-prefix/ir-leading-output.mmd](../tests/fixtures/railroad/retained-prefix/ir-leading-output.mmd)):

```mmd

---
config: {railroad: {fontSize: 19}}
---
railroad-beta
  r = terminal("prefix");
```

入力（escape 表記）:
`"\n---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-ebnf-beta\nr=\"prefix\";"`。

出力
([retained-prefix/ebnf-leading-output.mmd](../tests/fixtures/railroad/retained-prefix/ebnf-leading-output.mmd)):

```mmd

---
config: {railroad: {fontSize: 19}}
---
railroad-ebnf-beta
  r = "prefix";
```

入力（escape 表記）:
`"\n---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-abnf-beta\nr=\"prefix\";"`。

出力
([retained-prefix/abnf-leading-output.mmd](../tests/fixtures/railroad/retained-prefix/abnf-leading-output.mmd)):

```mmd

---
config: {railroad: {fontSize: 19}}
---
railroad-abnf-beta
  r = "prefix";
```

入力（escape 表記）:
`"\n---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-peg-beta\nr<-\"prefix\";"`。

出力
([retained-prefix/peg-leading-output.mmd](../tests/fixtures/railroad/retained-prefix/peg-leading-output.mmd)):

```mmd

---
config: {railroad: {fontSize: 19}}
---
railroad-peg-beta
  r <- "prefix";
```

### セミコロン

書かれた semicolon をすべて保ちます。
規則の必須の可視終端と ABNF の native comment mark は文法の句読点として、
共有の text-prefix scan から除きます。
その他の semicolon は、交差する値や trivia 全体まで元の区間を保護します。
最初の行は他の平坦な図種と同じく本文の1段に揃えます。
最初の行の列に文法上の意味はありません。
2行目以降は書かれた列を保ち、字下げを足しません。

railroad では、global directive を除いた後の原文の行に、
文字列 style または classDef があれば、その行を書かれたまま保ちます。
行の中のすべての文、コメント、native hidden form と、その間の空白を含みます。
前後の行とは結合しません。
directive の除去で、これらの文字列が複数の物理行をまたいでできる場合は、
またがる行をすべて保ちます。
[fixture: railroad/semicolons/native-terminal-value]

[fixture: railroad/semicolons/ir-word-unclosed-directive-lines]
[fixture: railroad/semicolons/ebnf-word-unclosed-directive-lines]
[fixture: railroad/semicolons/abnf-word-unclosed-directive-lines]
[fixture: railroad/semicolons/peg-word-unclosed-directive-lines]
ここでいう行は、 mermaid.js が1行として読む範囲全体です。
U+2028 や U+2029 の後の comment line が、語を含む行の前、後、
両方のテキストをつなぐ場合も、つながる原文の行をすべて保ちます。
最初の行の字下げは本文の1段に揃え、中身と2行目以降の列は書かれたままです。

[test: railroad/semicolons/ir-style-comment-before-ls]
[test: railroad/semicolons/ir-style-comment-after-ls]
[test: railroad/semicolons/ir-style-comment-both-ls]
[test: railroad/semicolons/ir-classdef-comment-before-ps]
[test: railroad/semicolons/ir-classdef-comment-after-ps]
[test: railroad/semicolons/ir-classdef-comment-both-ps]
[test: railroad/semicolons/ebnf-style-comment-before-ls]
[test: railroad/semicolons/ebnf-style-comment-after-ls]
[test: railroad/semicolons/ebnf-style-comment-both-ls]
[test: railroad/semicolons/ebnf-classdef-comment-before-ps]
[test: railroad/semicolons/ebnf-classdef-comment-after-ps]
[test: railroad/semicolons/ebnf-classdef-comment-both-ps]
[test: railroad/semicolons/abnf-style-comment-before-ls]
[test: railroad/semicolons/abnf-style-comment-after-ls]
[test: railroad/semicolons/abnf-style-comment-both-ls]
[test: railroad/semicolons/abnf-classdef-comment-before-ps]
[test: railroad/semicolons/abnf-classdef-comment-after-ps]
[test: railroad/semicolons/abnf-classdef-comment-both-ps]
[test: railroad/semicolons/peg-style-comment-before-ls]
[test: railroad/semicolons/peg-style-comment-after-ls]
[test: railroad/semicolons/peg-style-comment-both-ls]
[test: railroad/semicolons/peg-classdef-comment-before-ps]
[test: railroad/semicolons/peg-classdef-comment-after-ps]
[test: railroad/semicolons/peg-classdef-comment-both-ps]

共有の kept-line 配置に従い、
その行をまたぐ文や不可分な値・trivia も全体を保ちます。
2行目以降の列は書かれたままです。

mermaid.js は、これらの文字列を含む行の最後の semicolon を無視し得ます。
railroad では、規則の必須終端や ABNF のコメントの印がその対象になり得ます。
行を変えると規則が拒否されたり、コメントの中身がコードとして読まれたりするため、
原文の行を保つことで両方の句読点を守ります。
内容を移した後の行規則の効き方は予測しません。

払うものは、規則名、文字列、コメントに style や classDef を含む行が、
後に colon や hash がなくても整形されないことです。
その他の行は通常の規則に従います。
除かれる global directive の中にしかない語は、行を保つ対象にしません。
directive の除去で接する文字は対象にします。

[fixture: railroad/semicolons/abnf-comment-marker-spaced]

[fixture: railroad/semicolons/abnf-comment-marker-multiline]

[fixture: railroad/semicolons/abnf-comment-marker-classdef]

[fixture: railroad/semicolons/abnf-comment-marker-repeat]

[fixture: railroad/semicolons/abnf-comment-marker-sequence]

[fixture: railroad/semicolons/ir-word-multiple-statements]

[fixture: railroad/semicolons/ebnf-word-multiple-statements]

[fixture: railroad/semicolons/abnf-word-multiple-statements]

[fixture: railroad/semicolons/peg-word-multiple-statements]

[fixture: railroad/semicolons/ir-word-quoted]

[fixture: railroad/semicolons/ebnf-word-quoted]

[fixture: railroad/semicolons/abnf-word-quoted]

[fixture: railroad/semicolons/peg-word-quoted]

[fixture: railroad/semicolons/ir-word-rule-name]

[fixture: railroad/semicolons/ebnf-word-rule-name]

[fixture: railroad/semicolons/abnf-word-rule-name]

[fixture: railroad/semicolons/peg-word-rule-name]

[fixture: railroad/semicolons/ir-word-comment-line]

[fixture: railroad/semicolons/ebnf-word-comment-line]

[fixture: railroad/semicolons/abnf-word-comment-line]

[fixture: railroad/semicolons/peg-word-comment-line]

[fixture: railroad/semicolons/ir-word-directive-lines]

[fixture: railroad/semicolons/ebnf-word-directive-lines]

[fixture: railroad/semicolons/abnf-word-directive-lines]

[fixture: railroad/semicolons/peg-word-directive-lines]

[fixture: railroad/semicolons/ir-word-neighbor-boundaries]

[fixture: railroad/semicolons/ebnf-word-neighbor-boundaries]

[fixture: railroad/semicolons/abnf-word-neighbor-boundaries]

[fixture: railroad/semicolons/peg-word-neighbor-boundaries]

[fixture: railroad/semicolons/ir-word-middle-line]

[fixture: railroad/semicolons/ebnf-word-middle-line]

[fixture: railroad/semicolons/abnf-word-middle-line]

[fixture: railroad/semicolons/peg-word-middle-line]

[fixture: railroad/semicolons/abnf-comment-marker-leading-hidden]

[fixture: railroad/semicolons/abnf-comment-marker-value]

[fixture: railroad/semicolons/abnf-comment-content]

[fixture: railroad/semicolons/abnf-numval]

[fixture: railroad/semicolons/abnf-protected]

[fixture: railroad/semicolons/ebnf-protected]

[fixture: railroad/semicolons/ebnf-special-last-line]

[fixture: railroad/semicolons/ir-protected]

[fixture: railroad/semicolons/ir-value-last-line]

[fixture: railroad/semicolons/peg-protected]

[fixture: railroad/semicolons/peg-value-last-line]

[fixture: railroad/semicolons/abnf-protected-multiline-indent]

[fixture: railroad/semicolons/abnf-protected-rule-indent]

[fixture: railroad/semicolons/abnf-protected-title-indent]

[fixture: railroad/semicolons/abnf-style-group-close]

[fixture: railroad/semicolons/abnf-style-group-newline]

[fixture: railroad/semicolons/ebnf-protected-multiline-indent]

[fixture: railroad/semicolons/ebnf-protected-rule-indent]

[fixture: railroad/semicolons/ebnf-protected-title-indent]

[fixture: railroad/semicolons/ebnf-style-comma]

[fixture: railroad/semicolons/ebnf-style-group-close]

[fixture: railroad/semicolons/ebnf-style-group-newline]

[fixture: railroad/semicolons/ebnf-style-postfix]

[fixture: railroad/semicolons/ebnf-style-postfix-newline]

[fixture: railroad/semicolons/ir-classdef-directive]

[fixture: railroad/semicolons/ir-protected-multiline-indent]

[fixture: railroad/semicolons/ir-protected-rule-indent]

[fixture: railroad/semicolons/ir-protected-title-indent]

[fixture: railroad/semicolons/ir-style-call-close]

[fixture: railroad/semicolons/ir-style-call-newline]

[fixture: railroad/semicolons/ir-style-comma]

[fixture: railroad/semicolons/ir-style-comma-newline]

[fixture: railroad/semicolons/ir-style-comment]

[fixture: railroad/semicolons/peg-protected-multiline-indent]

[fixture: railroad/semicolons/peg-protected-rule-indent]

[fixture: railroad/semicolons/peg-protected-title-indent]

[fixture: railroad/semicolons/peg-style-group-close]

[fixture: railroad/semicolons/peg-style-group-newline]

[test: railroad/semicolons/ir-style-tab]

[fixture: railroad/semicolons/ir-after-rule]

[fixture: railroad/semicolons/ebnf-after-rule-name]

[fixture: railroad/semicolons/peg-after-rule-name]

[fixture: railroad/semicolons/ir-after-description]

[fixture: railroad/semicolons/ebnf-header-after-description]

[fixture: railroad/semicolons/ir-after-rule-colon]

[fixture: railroad/semicolons/abnf-after-rule-line]

[fixture: railroad/semicolons/ebnf-after-description]

[fixture: railroad/semicolons/abnf-after-description]

[fixture: railroad/semicolons/peg-after-description]

[fixture: railroad/semicolons/ir-header-after-description]

[fixture: railroad/semicolons/abnf-header-after-description]

[fixture: railroad/semicolons/peg-header-after-description]

[fixture: railroad/semicolons/ir-after-title]

[fixture: railroad/semicolons/ebnf-after-title]

[fixture: railroad/semicolons/abnf-after-title]

[fixture: railroad/semicolons/peg-after-title]

[fixture: railroad/semicolons/ir-after-access-title]

[fixture: railroad/semicolons/ebnf-after-access-title]

[fixture: railroad/semicolons/abnf-after-access-title]

[fixture: railroad/semicolons/peg-after-access-title]

[fixture: railroad/semicolons/ir-after-access-description]

[fixture: railroad/semicolons/ebnf-after-access-description]

[fixture: railroad/semicolons/abnf-after-access-description]

[fixture: railroad/semicolons/peg-after-access-description]

[fixture: railroad/semicolons/ir-kept-description-hidden]

[fixture: railroad/semicolons/ebnf-kept-description-hidden]

[fixture: railroad/semicolons/abnf-kept-description-hidden]

[fixture: railroad/semicolons/peg-kept-description-hidden]

[fixture: railroad/semicolons/ir-kept-rule-hidden]

[fixture: railroad/semicolons/ebnf-kept-rule-hidden]

[fixture: railroad/semicolons/peg-kept-rule-hidden]

[fixture: railroad/semicolons/ir-comment-after-moved-rule]

[fixture: railroad/semicolons/ebnf-comment-after-moved-rule]

[fixture: railroad/semicolons/abnf-hidden-after-moved-rule]

[fixture: railroad/semicolons/peg-hidden-after-moved-rule]

[fixture: railroad/semicolons/ir-trailing-comment]

[fixture: railroad/semicolons/ebnf-trailing-comment]

[fixture: railroad/semicolons/abnf-following-comment-line]

[fixture: railroad/semicolons/peg-trailing-comment]

[fixture: railroad/semicolons/ir-removed-directive-word]

[fixture: railroad/semicolons/ebnf-removed-directive-word]

[fixture: railroad/semicolons/abnf-removed-directive-word]

[fixture: railroad/semicolons/peg-removed-directive-word]

[fixture: railroad/semicolons/ir-directive-split-style]

[fixture: railroad/semicolons/ebnf-directive-split-style]

[fixture: railroad/semicolons/abnf-directive-split-style]

[fixture: railroad/semicolons/peg-directive-split-style]

[fixture: railroad/semicolons/ir-terminator-after-hash]

[fixture: railroad/semicolons/ebnf-terminator-after-hash]

[fixture: railroad/semicolons/abnf-terminator-after-hash]

[fixture: railroad/semicolons/peg-terminator-after-hash]

[fixture: railroad/semicolons/ir-assignment-after-word]

[fixture: railroad/semicolons/ebnf-assignment-after-word]

[fixture: railroad/semicolons/abnf-assignment-after-word]

[fixture: railroad/semicolons/peg-assignment-after-word]

[fixture: railroad/semicolons/ir-leading-c]

[fixture: railroad/semicolons/ebnf-leading-iso]

[fixture: railroad/semicolons/ebnf-leading-c]

[fixture: railroad/semicolons/abnf-leading-hidden]

[fixture: railroad/semicolons/peg-leading-hidden]

[fixture: railroad/semicolons/ir-leading-multiline-c]

[fixture: railroad/semicolons/ir-header-leading-c]

[fixture: railroad/semicolons/ir-leading-directive-c]

[fixture: railroad/semicolons/ir-leading-hidden-classdef]

[fixture: railroad/semicolons/ebnf-leading-hidden-classdef]

[fixture: railroad/semicolons/ebnf-leading-directive-c]

[fixture: railroad/semicolons/ebnf-leading-directive-iso]

[fixture: railroad/semicolons/abnf-leading-directive-hidden]

[fixture: railroad/semicolons/peg-leading-directive-hidden]

[fixture: railroad/semicolons/ebnf-leading-multiline-c]

[fixture: railroad/semicolons/ebnf-leading-multiline-iso]

[fixture: railroad/semicolons/ebnf-header-leading-c]

[fixture: railroad/semicolons/ebnf-header-leading-iso]

[fixture: railroad/semicolons/abnf-header-leading-hidden-classdef]

[fixture: railroad/semicolons/peg-header-leading-hidden-classdef]

入力（escape 表記）:
`"railroad-beta\n accDescr { style:#x } r = sequence(terminal(\"a;b\"),terminal(\"tail\"));;"`。

出力
([semicolons/ir-protected-output.mmd](../tests/fixtures/railroad/semicolons/ir-protected-output.mmd)):

```mmd
railroad-beta
  accDescr { style:#x } r = sequence(terminal("a;b"),terminal("tail"));;
```

入力（escape 表記）:
`"railroad-ebnf-beta\n accDescr { style:#x } r = \"a;b\", \"tail\";;"`。

出力
([semicolons/ebnf-protected-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-protected-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr { style:#x } r = "a;b", "tail";;
```

入力（escape 表記）:
`"railroad-abnf-beta\n r=\"first\" ; content; protected\n \"last\";\n"`。

出力
([semicolons/abnf-comment-content-output.mmd](../tests/fixtures/railroad/semicolons/abnf-comment-content-output.mmd)):

```mmd
railroad-abnf-beta
  r="first" ; content; protected
 "last";
```

入力（escape 表記）:
`"railroad-peg-beta\n accDescr { style:#x } r <- \"a;b\" \"tail\";;"`。

出力
([semicolons/peg-protected-output.mmd](../tests/fixtures/railroad/semicolons/peg-protected-output.mmd)):

```mmd
railroad-peg-beta
  accDescr { style:#x } r <- "a;b" "tail";;
```

入力（escape 表記）: `"railroad-beta\nstyle=terminal(\":\" )/*#*/;"`。

出力
([semicolons/ir-style-call-close-output.mmd](../tests/fixtures/railroad/semicolons/ir-style-call-close-output.mmd)):

```mmd
railroad-beta
  style=terminal(":" )/*#*/;
```

入力（escape 表記）: `"railroad-abnf-beta\nstyle=(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/abnf-style-group-newline-output.mmd](../tests/fixtures/railroad/semicolons/abnf-style-group-newline-output.mmd)):

```mmd
railroad-abnf-beta
  style=(":"
)%%{!#}%% ;
```

入力（escape 表記）: `"railroad-beta\n   r=terminal(\"a;b\");"`。

出力
([semicolons/ir-protected-rule-indent-output.mmd](../tests/fixtures/railroad/semicolons/ir-protected-rule-indent-output.mmd)):

```mmd
railroad-beta
  r=terminal("a;b");
```

入力（escape 表記）: `"railroad-beta\n   r=terminal(\n \"a;b\"\n);"`。

出力
([semicolons/ir-protected-multiline-indent-output.mmd](../tests/fixtures/railroad/semicolons/ir-protected-multiline-indent-output.mmd)):

```mmd
railroad-beta
  r=terminal(
 "a;b"
);
```

入力（escape 表記）: `"railroad-beta\n/*style*/r=terminal(\":\"\n)/*#*/;"`。

出力
([semicolons/ir-leading-c-output.mmd](../tests/fixtures/railroad/semicolons/ir-leading-c-output.mmd)):

```mmd
railroad-beta
  /*style*/r=terminal(":"
)/*#*/;
```

入力（escape 表記）: `"railroad-ebnf-beta\n(*style*)r=(\":\"\n)(*#*);"`。

出力
([semicolons/ebnf-leading-iso-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-leading-iso-output.mmd)):

```mmd
railroad-ebnf-beta
  (*style*)r=(":"
)(*#*);
```

入力（escape 表記）:
`"railroad-abnf-beta\n%%{!style}%% r=(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/abnf-leading-hidden-output.mmd](../tests/fixtures/railroad/semicolons/abnf-leading-hidden-output.mmd)):

```mmd
railroad-abnf-beta
  %%{!style}%% r=(":"
)%%{!#}%% ;
```

入力（escape 表記）:
`"railroad-peg-beta\n%%{!style}%% r<-(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/peg-leading-hidden-output.mmd](../tests/fixtures/railroad/semicolons/peg-leading-hidden-output.mmd)):

```mmd
railroad-peg-beta
  %%{!style}%% r<-(":"
)%%{!#}%% ;
```

入力（escape 表記）: `"railroad-beta\n/*x\nstyle*/r=terminal(\":\"\n)/*#*/;"`。

出力
([semicolons/ir-leading-multiline-c-output.mmd](../tests/fixtures/railroad/semicolons/ir-leading-multiline-c-output.mmd)):

```mmd
railroad-beta
  /*x
style*/r=terminal(":"
)/*#*/;
```

入力（escape 表記）: `"railroad-beta /*style*/r=terminal(\":\"\n)/*#*/;"`。

出力
([semicolons/ir-header-leading-c-output.mmd](../tests/fixtures/railroad/semicolons/ir-header-leading-c-output.mmd)):

```mmd
railroad-beta /*style*/r=terminal(":"
)/*#*/;
```

入力（escape 表記）:
`"railroad-beta\na=terminal(\"style\");b=terminal(\":\"\n)/*#*/;"`。

出力
([semicolons/ir-after-rule-output.mmd](../tests/fixtures/railroad/semicolons/ir-after-rule-output.mmd)):

```mmd
railroad-beta
  a=terminal("style");b=terminal(":"
)/*#*/;
```

入力（escape 表記）: `"railroad-ebnf-beta\naccDescr{style} b=(\":\"\n)/*#*/;"`。

出力
([semicolons/ebnf-after-description-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-after-description-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr{style} b=(":"
)/*#*/;
```

入力（escape 表記）:
`"railroad-abnf-beta\naccDescr{style} b=(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/abnf-after-description-output.mmd](../tests/fixtures/railroad/semicolons/abnf-after-description-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr{style} b=(":"
)%%{!#}%% ;
```

入力（escape 表記）:
`"railroad-peg-beta\nstyle<-\"a\";b<-(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/peg-after-rule-name-output.mmd](../tests/fixtures/railroad/semicolons/peg-after-rule-name-output.mmd)):

```mmd
railroad-peg-beta
  style<-"a";b<-(":"
)%%{!#}%% ;
```

入力（escape 表記）:
`"railroad-beta\naccDescr{style} %%{!keep}%% b=terminal(\":\"\n)/*#*/;"`。

出力
([semicolons/ir-kept-description-hidden-output.mmd](../tests/fixtures/railroad/semicolons/ir-kept-description-hidden-output.mmd)):

```mmd
railroad-beta
  accDescr{style} %%{!keep}%% b=terminal(":"
)/*#*/;
```

入力（escape 表記）:
`"railroad-ebnf-beta\na=\"x\";(*classDef*) b=(\":\"\n)(*#*);"`。

出力
([semicolons/ebnf-comment-after-moved-rule-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-comment-after-moved-rule-output.mmd)):

```mmd
railroad-ebnf-beta
  a="x";(*classDef*) b=(":"
)(*#*);
```

入力（escape 表記）: `"railroad-abnf-beta\n%%{style}%% b=(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/abnf-removed-directive-word-output.mmd](../tests/fixtures/railroad/semicolons/abnf-removed-directive-word-output.mmd)):

```mmd
railroad-abnf-beta
  %%{style}%% b = (":")%%{!#}%% ;
```

入力（escape 表記）:
`"railroad-peg-beta\nr<-(\"sty%%{wrap}%%le:\"\n)%%{!#}%% ;"`。

出力
([semicolons/peg-directive-split-style-output.mmd](../tests/fixtures/railroad/semicolons/peg-directive-split-style-output.mmd)):

```mmd
railroad-peg-beta
  r<-("sty%%{wrap}%%le:"
)%%{!#}%% ;
```

入力（escape 表記）: `"railroad-ebnf-beta\nr=?style:#?\n;"`。

出力
([semicolons/ebnf-terminator-after-hash-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-terminator-after-hash-output.mmd)):

```mmd
railroad-ebnf-beta
  r=?style:#?
;
```

入力（escape 表記）: `"railroad-beta\nstyle\n=terminal(\":#\");"`。

出力
([semicolons/ir-assignment-after-word-output.mmd](../tests/fixtures/railroad/semicolons/ir-assignment-after-word-output.mmd)):

```mmd
railroad-beta
  style
=terminal(":#");
```

入力（escape 表記）: `"railroad-abnf-beta\nstyle=(\":\" )%%{!#}%% ; c\n;"`。

出力
([semicolons/abnf-comment-marker-spaced-output.mmd](../tests/fixtures/railroad/semicolons/abnf-comment-marker-spaced-output.mmd)):

```mmd
railroad-abnf-beta
  style=(":" )%%{!#}%% ; c
;
```

入力（escape 表記）: `"railroad-abnf-beta\nstyle=(\":\"\n)%%{!#}%% ; c\n;"`。

出力
([semicolons/abnf-comment-marker-multiline-output.mmd](../tests/fixtures/railroad/semicolons/abnf-comment-marker-multiline-output.mmd)):

```mmd
railroad-abnf-beta
  style=(":"
)%%{!#}%% ; c
;
```

入力（escape 表記）:
`"railroad-beta\n  a=terminal( \"x\" );style=terminal( \"y\" );b=terminal( \"z\" );"`。

出力
([semicolons/ir-word-multiple-statements-output.mmd](../tests/fixtures/railroad/semicolons/ir-word-multiple-statements-output.mmd)):

```mmd
railroad-beta
  a=terminal( "x" );style=terminal( "y" );b=terminal( "z" );
```

入力（escape 表記）: `"railroad-abnf-beta\n  accDescr{note} style=( \"x\" );"`。

出力
([semicolons/abnf-word-multiple-statements-output.mmd](../tests/fixtures/railroad/semicolons/abnf-word-multiple-statements-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr{note} style=( "x" );
```

入力（escape 表記）: `"railroad-peg-beta\n r<-( \"style\" );"`。

出力
([semicolons/peg-word-quoted-output.mmd](../tests/fixtures/railroad/semicolons/peg-word-quoted-output.mmd)):

```mmd
railroad-peg-beta
  r<-( "style" );
```

入力（escape 表記）: `"railroad-ebnf-beta\n myclassDef=( \"x\" );"`。

出力
([semicolons/ebnf-word-rule-name-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-word-rule-name-output.mmd)):

```mmd
railroad-ebnf-beta
  myclassDef=( "x" );
```

入力（escape 表記）:
`"railroad-beta\n   /*style*/  /*kept*/\nr=terminal( \"x\" );"`。

出力
([semicolons/ir-word-comment-line-output.mmd](../tests/fixtures/railroad/semicolons/ir-word-comment-line-output.mmd)):

```mmd
railroad-beta
  /*style*/  /*kept*/
  r = terminal("x");
```

入力（escape 表記）:
`"railroad-ebnf-beta\nr=( \"class%%{init:\n{}}%%Def\" );"`。

出力
([semicolons/ebnf-word-directive-lines-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-word-directive-lines-output.mmd)):

```mmd
railroad-ebnf-beta
  r=( "class%%{init:
{}}%%Def" );
```

入力（escape 表記）:
`"railroad-abnf-beta\na=(\n\"x\"\n);\nstyle=( \"y\" );\nb=(\n\"z\"\n);"`。

出力
([semicolons/abnf-word-neighbor-boundaries-output.mmd](../tests/fixtures/railroad/semicolons/abnf-word-neighbor-boundaries-output.mmd)):

```mmd
railroad-abnf-beta
  a = ("x");
  style=( "y" );
  b = ("z");
```

入力（escape 表記）: `"railroad-peg-beta\nr<-(\n\"classDef\"\n\"x\"\n);"`。

出力
([semicolons/peg-word-middle-line-output.mmd](../tests/fixtures/railroad/semicolons/peg-word-middle-line-output.mmd)):

```mmd
railroad-peg-beta
  r<-(
"classDef"
"x"
);
```

### 空行

通常の連続空行を最大1行にし、文書と本文の端の空行を除きます。
通常の空白だけの行を空にし、
見出しと完結した構造の無害な ASCII padding を除きます。
他の平坦な図種と同じ見通しにするためです。
値、コメント末尾、directive と hidden の内部、必要な closer padding、 prefix、
保護区間は各規則に従います。
ABNF の見かけの終端後の space は無害と推測せず、
AST がコメントとして読んだ結果に従います。

[fixture: railroad/blank-lines/abnf-collapse]

[fixture: railroad/blank-lines/ebnf-collapse]

[fixture: railroad/blank-lines/ir-collapse]

[fixture: railroad/blank-lines/peg-collapse]

入力（escape 表記）:
`"\nrailroad-beta \t\n\n\nr=terminal(\"blank\"); \t\n\n \t\ns=terminal(\"tail\");\n\n"`。

出力
([blank-lines/ir-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/ir-collapse-output.mmd)):

```mmd
railroad-beta
  r = terminal("blank");

  s = terminal("tail");
```

入力（escape 表記）:
`"\nrailroad-ebnf-beta \t\n\n\nr=\"blank\"; \t\n\n\ns=\"tail\";\n\n"`。

出力
([blank-lines/ebnf-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/ebnf-collapse-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "blank";

  s = "tail";
```

入力（escape 表記）:
`"\nrailroad-abnf-beta \t\n\n\nr=\"blank\";\n\n \t\ns=\"tail\";\n\n"`。

出力
([blank-lines/abnf-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/abnf-collapse-output.mmd)):

```mmd
railroad-abnf-beta
  r = "blank";

  s = "tail";
```

入力（escape 表記）:
`"\nrailroad-peg-beta \t\n\n\nr<-\"blank\"; \t\n\n\ns<-\"tail\";\n\n"`。

出力
([blank-lines/peg-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/peg-collapse-output.mmd)):

```mmd
railroad-peg-beta
  r <- "blank";

  s <- "tail";
```

### frontmatter の YAML

安全な実際の先頭 frontmatter だけを、
共有の guard 付き YAML formatter へ渡します。
埋込みの効果を保ちながら YAML を読みやすくするためです。
不正な YAML、字下げした fence、closer padding、HTML quote の危険がある形、
本文の整形で fence が現れる形、保持 prefix の YAML は書かれたままにします。
YAML の入れ子と block scalar は、tabWidth 0 でも共有の正の最小幅を使います。
native hidden YAML は opaque なので、この経路へ渡しません。

[fixture: railroad/frontmatter-yaml/abnf-padding]

[fixture: railroad/frontmatter-yaml/abnf-safe]

[fixture: railroad/frontmatter-yaml/abnf-zero]

[fixture: railroad/frontmatter-yaml/ebnf-indented]

[fixture: railroad/frontmatter-yaml/ebnf-safe]

[fixture: railroad/frontmatter-yaml/ebnf-zero]

[fixture: railroad/frontmatter-yaml/ir-html]

[fixture: railroad/frontmatter-yaml/ir-safe]

[fixture: railroad/frontmatter-yaml/ir-zero]

[fixture: railroad/frontmatter-yaml/peg-html]

[fixture: railroad/frontmatter-yaml/peg-safe]

[fixture: railroad/frontmatter-yaml/peg-zero]

[corpus fixture: railroad/ir-div-frontmatter-invalid]

[corpus fixture: railroad/ir-config-frontmatter-drawing]

[corpus fixture: railroad/ebnf-config-init-drawing]

[corpus fixture: railroad/abnf-config-frontmatter-drawing]

[corpus fixture: railroad/peg-config-init-drawing]

入力（escape 表記）:
`"---\nconfig: {railroad: {fontSize: 19, compactMode: true}}\n---\nrailroad-beta\nr=terminal(\"yaml config\");"`。

出力
([frontmatter-yaml/ir-safe-output.mmd](../tests/fixtures/railroad/frontmatter-yaml/ir-safe-output.mmd)):

```mmd
---
config: { railroad: { fontSize: 19, compactMode: true } }
---
railroad-beta
  r = terminal("yaml config");
```

入力（escape 表記）:
`"---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-ebnf-beta\nr=\"yaml config\";"`。

出力
([frontmatter-yaml/ebnf-safe-output.mmd](../tests/fixtures/railroad/frontmatter-yaml/ebnf-safe-output.mmd)):

```mmd
---
config: { railroad: { fontSize: 19 } }
---
railroad-ebnf-beta
  r = "yaml config";
```

入力（escape 表記）:
`"---\ntitle: |\n  First\n  Second\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-abnf-beta\nr=\"yaml config\";"`。

出力
([frontmatter-yaml/abnf-safe-output.mmd](../tests/fixtures/railroad/frontmatter-yaml/abnf-safe-output.mmd)):

```mmd
---
title: |
  First
  Second
config: { railroad: { fontSize: 19 } }
---
railroad-abnf-beta
  r = "yaml config";
```

入力（escape 表記）:
`"---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-peg-beta\nr<-\"yaml config\";"`。

出力
([frontmatter-yaml/peg-safe-output.mmd](../tests/fixtures/railroad/frontmatter-yaml/peg-safe-output.mmd)):

```mmd
---
config: { railroad: { fontSize: 19 } }
---
railroad-peg-beta
  r <- "yaml config";
```

### 改行と Unicode

共有の host 方針に従い、物理 CR と CRLF を LF として読み、設定した LF、CRLF、
CR で出力します。
値、hidden、frontmatter の内部も同じです。
先頭 BOM は host の除去と復元の制限に従います。
LS、PS、NBSP、BOM は通常の native gap の空白にはしません。
文字列、special sequence、native line comment が所有するものは保ちます。
共有 common value の外端では Notation whitespace の trim を使います。
Unicode separator を構造上の改行へ変えず、native の所有関係に従うためです。

[test: railroad/line-terminators-and-unicode/ir-cr]

[test: railroad/line-terminators-and-unicode/ebnf-crlf]

[test: railroad/line-terminators-and-unicode/abnf-crlf]

[test: railroad/line-terminators-and-unicode/peg-cr]

[test: railroad/line-terminators-and-unicode/ir-content]

[test: railroad/line-terminators-and-unicode/ebnf-content]

[test: railroad/line-terminators-and-unicode/abnf-content]

[test: railroad/line-terminators-and-unicode/peg-content]

[test: railroad/line-terminators-and-unicode/ir-output-crlf]

[test: railroad/line-terminators-and-unicode/ebnf-output-cr]

[test: railroad/line-terminators-and-unicode/abnf-output-crlf]

[test: railroad/line-terminators-and-unicode/peg-output-cr]

[test: railroad/line-terminators-and-unicode/ir-leading-bom]

[test: railroad/line-terminators-and-unicode/ebnf-leading-bom]

[test: railroad/line-terminators-and-unicode/abnf-leading-bom]

[test: railroad/line-terminators-and-unicode/peg-leading-bom]

[test: railroad/line-terminators-and-unicode/ir-common-edges]

[test: railroad/line-terminators-and-unicode/ebnf-common-edges]

[test: railroad/line-terminators-and-unicode/abnf-common-edges]

[test: railroad/line-terminators-and-unicode/peg-common-edges]

入力（escape 表記）: `"railroad-ebnf-beta\r\nr=? cr\r\n continuation ?;\r\n"`。

出力（escape 表記）: `"railroad-ebnf-beta\n  r = ? cr\n continuation ?;\n"`。

### 出現順

規則、選択肢、重複名、前方や未定義の reference、
metadata の繰返しと空の reset を含め、すべての出現と順序を保ちます。
call、group、repeat、predicate の operand 全体を AST から残します。
sort や空の metadata の削除で Db が変わり、正規化された singleton が同じでも、
Db から原文を再構築する理由にはならないためです。

[fixture: railroad/source-order/abnf-duplicates]

[fixture: railroad/source-order/ebnf-duplicates]

[fixture: railroad/source-order/ir-duplicates]

[fixture: railroad/source-order/peg-duplicates]

入力（escape 表記）:
`"railroad-beta\naccTitle: old\naccTitle:\nz=nonterminal(\"later\");a=terminal(\"first\");a=terminal(\"second\");later=terminal(\"end\");"`。

出力
([source-order/ir-duplicates-output.mmd](../tests/fixtures/railroad/source-order/ir-duplicates-output.mmd)):

```mmd
railroad-beta
  accTitle: old
  accTitle:
  z = nonterminal("later");
  a = terminal("first");
  a = terminal("second");
  later = terminal("end");
```

入力（escape 表記）:
`"railroad-ebnf-beta\naccDescr {old}\naccDescr {}\nz=later;a=\"first\";a=\"second\";later=\"end\";"`。

出力
([source-order/ebnf-duplicates-output.mmd](../tests/fixtures/railroad/source-order/ebnf-duplicates-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr {old}
  accDescr {}
  z = later;
  a = "first";
  a = "second";
  later = "end";
```

入力（escape 表記）:
`"railroad-abnf-beta\naccTitle: old\naccTitle:\nz=later;\na=\"first\";\na=\"second\";\nlater=\"end\";"`。

出力
([source-order/abnf-duplicates-output.mmd](../tests/fixtures/railroad/source-order/abnf-duplicates-output.mmd)):

```mmd
railroad-abnf-beta
  accTitle: old
  accTitle:
  z = later;
  a = "first";
  a = "second";
  later = "end";
```

入力（escape 表記）:
`"railroad-peg-beta\naccDescr {old}\naccDescr {}\nz<-later;a<-\"first\";a<-\"second\";later<-\"end\";"`。

出力
([source-order/peg-duplicates-output.mmd](../tests/fixtures/railroad/source-order/peg-duplicates-output.mmd)):

```mmd
railroad-peg-beta
  accDescr {old}
  accDescr {}
  z <- later;
  a <- "first";
  a <- "second";
  later <- "end";
```

### 末尾改行

通常の受理本文は設定した末尾改行1個で終えます。
空本文、規則、metadata、コメント、閉じた hidden form が対象です。
ファイル末尾を揃えるためです。
EOF まで達する Root directive、必要な hidden padding、
保護された末尾と prefix は共有の例外に従います。
ABNF の終端後に space は加えません。

[fixture: railroad/final-newline/abnf-empty]

[fixture: railroad/final-newline/abnf-rule]

[fixture: railroad/final-newline/ebnf-empty]

[fixture: railroad/final-newline/ebnf-rule]

[fixture: railroad/final-newline/ir-empty]

[fixture: railroad/final-newline/ir-rule]

[fixture: railroad/final-newline/peg-empty]

[fixture: railroad/final-newline/peg-rule]

[corpus fixture: railroad/ir-common-acctitle-eof]

[corpus fixture: railroad/ir-hidden-yaml-eof]

[corpus fixture: railroad/ebnf-hidden-yaml-eof]

[corpus fixture: railroad/abnf-hidden-yaml-eof]

[corpus fixture: railroad/peg-hidden-yaml-eof]

[corpus fixture: railroad/ir-tail-comment]

[corpus fixture: railroad/ebnf-tail-comment]

[corpus fixture: railroad/abnf-tail-comment]

[corpus fixture: railroad/peg-tail-comment]

[corpus fixture: railroad/ir-tail-directive]

[corpus fixture: railroad/ebnf-tail-directive]

[corpus fixture: railroad/abnf-tail-directive]

[corpus fixture: railroad/peg-tail-directive]

入力（escape 表記）: `"railroad-beta \t"`。

出力
([final-newline/ir-empty-output.mmd](../tests/fixtures/railroad/final-newline/ir-empty-output.mmd)):

```mmd
railroad-beta
```

入力（escape 表記）: `"railroad-ebnf-beta \t"`。

出力
([final-newline/ebnf-empty-output.mmd](../tests/fixtures/railroad/final-newline/ebnf-empty-output.mmd)):

```mmd
railroad-ebnf-beta
```

入力（escape 表記）: `"railroad-abnf-beta \t"`。

出力
([final-newline/abnf-empty-output.mmd](../tests/fixtures/railroad/final-newline/abnf-empty-output.mmd)):

```mmd
railroad-abnf-beta
```

入力（escape 表記）: `"railroad-peg-beta \t"`。

出力
([final-newline/peg-empty-output.mmd](../tests/fixtures/railroad/final-newline/peg-empty-output.mmd)):

```mmd
railroad-peg-beta
```

### 仕様による読み

既存の6差異に従います。
directive-as-token-boundary、ignored-semicolon-as-token-boundary、
html-tag-in-frontmatter、embedded-data-opaque、
bare-percent-line-before-header、c4-keyword-anywhere です。
railroad には opaque 比較から除く受理設定 key がありません。
空文字列は値で、空 call は拒否します。
raw の拒否に raw Db はないため、仕様で受理する入力は記録された読み、原文の保持、
冪等性を別に検査します。
単体の解析失敗は修復出力なしで構文エラーを返し、
Markdown は埋込み整形を辞退します。

[corpus fixture: railroad/ir-div-directive-header]

[corpus fixture: railroad/ebnf-div-directive-assignment]

[corpus fixture: railroad/abnf-div-semicolon-repeat-number]

[corpus fixture: railroad/peg-div-semicolon-assignment]

[corpus fixture: railroad/ir-div-html-frontmatter-rule-accept]

[corpus fixture: railroad/ebnf-div-html-frontmatter-rule-reject]

[corpus fixture: railroad/abnf-div-html-frontmatter-acctitle]

[corpus fixture: railroad/peg-div-html-frontmatter-rule-reject]

[corpus fixture: railroad/ir-div-frontmatter-invalid]

[corpus fixture: railroad/ebnf-config-init-fontfamily-number]

[corpus fixture: railroad/abnf-config-frontmatter-fontfamily-number]

[corpus fixture: railroad/peg-config-init-fontfamily-number]

[corpus fixture: railroad/ir-bare-nbsp]

[corpus fixture: railroad/ebnf-bare-unicode]

[corpus fixture: railroad/abnf-bare-unicode]

[corpus fixture: railroad/peg-bare-unicode]

[corpus fixture: railroad/ir-c4-container-terminal]

[corpus fixture: railroad/ebnf-c4-component-special]

[corpus fixture: railroad/abnf-c4-dynamic-string]

[corpus fixture: railroad/peg-c4-deployment-predicate]

[corpus fixture: railroad/ir-db-empty-strings]

[corpus fixture: railroad/ebnf-db-empty-string]

[corpus fixture: railroad/abnf-db-empty-string]

[corpus fixture: railroad/peg-db-empty-string]

[corpus fixture: railroad/ir-error-empty-call]

[corpus fixture: railroad/ebnf-rhs-empty]

[corpus fixture: railroad/abnf-rhs-empty]

[corpus fixture: railroad/peg-rhs-empty]

[test: railroad/specified-readings/ir-bare-trivia]

[test: railroad/specified-readings/ebnf-bare-trivia]

[test: railroad/specified-readings/abnf-bare-trivia]

[test: railroad/specified-readings/peg-bare-trivia]

たとえば `railroad-beta\nr=terminal()` は拒否され、修復出力はありません。

### Markdown フェンス

共有の Markdown 経路で、dedent した本文に同じ規則を適用します。
host が fence、list、quote の列を与え、
最終本文行の padding を除く場合があります。
最後の hidden padding も対象ですが、内部の hidden 境界は保ちます。
container の列を railroad の字下げと混同しないよう、
host 全体の出力と本文の Db 保持を別に検査します。

[test: railroad Markdown: ir-top-level]

[test: railroad Markdown: ebnf-list]

[test: railroad Markdown: abnf-quote]

[test: railroad Markdown: peg-zero]

[test: railroad Markdown: ir-tabs]

[test: railroad Markdown: ebnf-hidden-gap]

[test: railroad Markdown: abnf-prefix]

[test: railroad Markdown: peg-frontmatter]

[test: railroad Markdown: ir-final-comment]

[test: railroad Markdown: peg-hidden-boundary]

[test: railroad Markdown: abnf-final-hidden-padding]

[test: railroad Markdown: ir-rejected]

[test: railroad Markdown: ebnf-rejected]

[test: railroad Markdown: abnf-rejected]

[test: railroad Markdown: peg-rejected]

入力:

````markdown
```mermaid
railroad-beta r=terminal("fenced");
```
````

出力:

````markdown
```mermaid
railroad-beta
  r = terminal("fenced");
```
````
