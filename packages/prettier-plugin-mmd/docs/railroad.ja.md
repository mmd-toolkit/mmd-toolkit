# Railroad の整形規則

英語版: [railroad.md](./railroad.md)

IR、EBNF、ABNF、PEG の決定32項目に従い、
1 つの [railroad の木](../../spec/docs/ast/railroad.ja.md)と、
共有の平坦な本文の印字処理を使います。
パーサーが `Root.diagramType` で方言を選び、
印字処理は方言を再判定せずそのノードとトークンを使います。
各規則で選択の理由を説明し、
[互換性](./compatibility.ja.md#railroad-の方言と書かれた値)に保持する文字と
mermaid.js との差をまとめます。

## 規則

### 見出し

見出しを第1列に置き、通常の最初の文を次の行へ移します。
方言を見つけやすくするためです。
IR は `railroad-beta`、EBNF は `railroad-ebnf-beta`、
ABNF は `railroad-abnf-beta`、PEG は `railroad-peg-beta` を保ちます。
コロンや指定は加えません。
mermaid.js はこの 4 つの名前を、この綴りだけで読みます。
`-beta` のない名前、`-beta` の大文字小文字が違う名前、
すべて大文字の名前は拒否するので、ほかの綴りは印字しません。
詳しくは [ヘッダーの名前](./compatibility.ja.md#ヘッダーの名前)
を参照してください。
隠れた形、共有注釈類、保護されたセミコロン区間は共有の境界規則に従い、
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

入力（エスケープ表記）: `"railroad-beta%% heading\nr=terminal(\"x\");"`。

出力
([header/ir-comment-output.mmd](../tests/fixtures/railroad/header/ir-comment-output.mmd)):

```mmd
railroad-beta%% heading
  r = terminal("x");
```

入力（エスケープ表記）: `"railroad-ebnf-beta%%{wrap}%% r=\"x\";"`。

出力
([header/ebnf-global-output.mmd](../tests/fixtures/railroad/header/ebnf-global-output.mmd)):

```mmd
railroad-ebnf-beta
  %%{wrap}%% r = "x";
```

入力（エスケープ表記）: `"railroad-abnf-beta%%{!heading}%%\nr=\"x\";"`。

出力
([header/abnf-hidden-output.mmd](../tests/fixtures/railroad/header/abnf-hidden-output.mmd)):

```mmd
railroad-abnf-beta%%{!heading}%%
  r = "x";
```

入力（エスケープ表記）: `"railroad-peg-beta%%{!heading}%%\n\nr<-\"x\";"`。

出力
([header/peg-hidden-spare-output.mmd](../tests/fixtures/railroad/header/peg-hidden-spare-output.mmd)):

```mmd
railroad-peg-beta%%{!heading}%%
  r <- "x";
```

### 字下げ

[規則 1](./printed-form.ja.md#1-記号の横の空白)により、通常の規則、メタデータ、
独立したコメントと `Root` ディレクティブを、見出しより設定の1段深く置きます。
Prettier がブロックの中の行をそう印字するためです。
既定は空白2つ、`tabWidth` 4 は空白4つ、0 は空白を置きません。
列に文法上の意味がないためです。
`useTabs` は幅0でもタブ1つです。
構造の継続行と規則内の独立した注釈類は2段、
別行の構造的な閉じ括弧と終端は文の位置に揃えます。
入れ子の IR 呼出しは[長い行](#長い行)の規則で引数の段を使います。
その他の値の継続列、隠れた形の内部と保持前置部分は元の列を保ちます。

セミコロンの保護区間の最初の行は、本文の1段に揃えます。
2行目以降は保護された本文に属するため、書かれた列を保ちます。
最初の行の段は[規則 1](./printed-form.ja.md#1-記号の横の空白)が与えます。
Prettier がブロックの中の行を印字する形です。

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

入力（エスケープ表記）: `"railroad-beta\n r=terminal(\"indent\");"`。

出力
([indentation/ir-default-output.mmd](../tests/fixtures/railroad/indentation/ir-default-output.mmd)):

```mmd
railroad-beta
  r = terminal("indent");
```

入力（エスケープ表記）: `"railroad-ebnf-beta\n r=\"indent\";"`。

出力
([indentation/ebnf-default-output.mmd](../tests/fixtures/railroad/indentation/ebnf-default-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "indent";
```

入力（エスケープ表記）: `"railroad-abnf-beta\n r=\"indent\";"`。

出力
([indentation/abnf-default-output.mmd](../tests/fixtures/railroad/indentation/abnf-default-output.mmd)):

```mmd
railroad-abnf-beta
  r = "indent";
```

入力（エスケープ表記）: `"railroad-peg-beta\n r<-\"indent\";"`。

出力
([indentation/peg-default-output.mmd](../tests/fixtures/railroad/indentation/peg-default-output.mmd)):

```mmd
railroad-peg-beta
  r <- "indent";
```

### 規則ごとの行

通常の規則を1行ずつに置き、必須の終端 `;` を直前の空白なしで定義に付けます。
構文を変えずに、規則の境界を見やすくします。
Prettier は、
整形する言語の文を 1 つずつ自分の行に印字し（JavaScript の `a(); b()` は 2
行になります）、[flowchart](./flowchart.ja.md#1-行に-1-文) もそう述べ、
mermaid.js のドキュメントの railroad の例 14 件も、
1 行に 1 つの文を書きます（規則は複数行にまたがることがあります）。
規則 1 が、規則を終える `;` の空白を与えます。
表に「文を終える `;`」の行があり、Prettier は、
その前に空白を置きません（`a ;` は `a;` と印字します）。
例の 14 件は ` ;` と前に空白を置いて書きますが、規則 3 は綴りを決め、
記号の横の空白は規則 1 が決めるので、これは規則 1 を変えません。
4方言とも最後の規則にも終端が必要です。
ABNF の終端の直後は LF または EOF にします。
`; note` はコメントなので終端にはなりません。
そのコメントと本当の終端は改行を越えて動かしません。
共有のセミコロン保護を優先します。

[fixture: railroad/statements-one-per-line/abnf-terminator]

[fixture: railroad/statements-one-per-line/abnf-terminators]

[fixture: railroad/statements-one-per-line/ebnf-rules]

[fixture: railroad/statements-one-per-line/ebnf-terminator]

[fixture: railroad/statements-one-per-line/ir-rules]

[fixture: railroad/statements-one-per-line/ir-terminator]

[fixture: railroad/statements-one-per-line/peg-rules]

[fixture: railroad/statements-one-per-line/peg-terminator]

入力（エスケープ表記）:
`"railroad-beta a=terminal(\"first\");b=nonterminal(\"a\");"`。

出力
([statements-one-per-line/ir-rules-output.mmd](../tests/fixtures/railroad/statements-one-per-line/ir-rules-output.mmd)):

```mmd
railroad-beta
  a = terminal("first");
  b = nonterminal("a");
```

入力（エスケープ表記）: `"railroad-ebnf-beta a=\"first\";b::=a;"`。

出力
([statements-one-per-line/ebnf-rules-output.mmd](../tests/fixtures/railroad/statements-one-per-line/ebnf-rules-output.mmd)):

```mmd
railroad-ebnf-beta
  a = "first";
  b = a;
```

入力（エスケープ表記）: `"railroad-abnf-beta\nr=\"terminator\" \t;"`。

出力
([statements-one-per-line/abnf-terminator-output.mmd](../tests/fixtures/railroad/statements-one-per-line/abnf-terminator-output.mmd)):

```mmd
railroad-abnf-beta
  r = "terminator";
```

入力（エスケープ表記）: `"railroad-peg-beta a<-\"first\";b<-a;"`。

出力
([statements-one-per-line/peg-rules-output.mmd](../tests/fixtures/railroad/statements-one-per-line/peg-rules-output.mmd)):

```mmd
railroad-peg-beta
  a <- "first";
  b <- a;
```

### 代入

代入の両側を通常の空白1つにし、名前の列は揃えません。
規則 1 が空白を与えます。
Prettier は、
名前に値を与える `=` の両側に空白を 1 つずつ置き（`function f(a=1) {}` は
`function f(a = 1) {}` と印字します）、2 つのものの間にある別の記号、
たとえば PEG の `<-` も同じに印字します。
IR と ABNF の `=`、PEG の `<-` を保ち、EBNF の `::=` は `=` と印字します。
EBNF の2形は同じ Db で、mermaid.js の文書の例は `=` を 35 回使い、
`::=` は使わないためです。
（[キーワードや記号の別の綴り](./compatibility.ja.md#キーワードや記号の別の綴り)
を参照）。
複合記号は1つのトークンのままにします。

[fixture: railroad/assignment/ebnf-assignment-equals]
[fixture: railroad/assignment/abnf-spaces]

[fixture: railroad/assignment/ebnf-spellings]

[fixture: railroad/assignment/ir-spaces]

[fixture: railroad/assignment/peg-spaces]

入力（エスケープ表記）:
`"railroad-beta\nlongName\t=\tterminal(\"assignment\");s=terminal(\"short\");"`。

出力
([assignment/ir-spaces-output.mmd](../tests/fixtures/railroad/assignment/ir-spaces-output.mmd)):

```mmd
railroad-beta
  longName = terminal("assignment");
  s = terminal("short");
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\nlongName::=\"assignment\";s =\"short\";"`。

出力
([assignment/ebnf-spellings-output.mmd](../tests/fixtures/railroad/assignment/ebnf-spellings-output.mmd)):

```mmd
railroad-ebnf-beta
  longName = "assignment";
  s = "short";
```

入力（エスケープ表記）:
`"railroad-abnf-beta\nlongName\t=\t\"assignment\";\ns=\"short\";"`。

出力
([assignment/abnf-spaces-output.mmd](../tests/fixtures/railroad/assignment/abnf-spaces-output.mmd)):

```mmd
railroad-abnf-beta
  longName = "assignment";
  s = "short";
```

入力（エスケープ表記）:
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
両側に通常の空白1つを置きます。
Prettier が2つのものの間の記号に印字する形です。
順序と階層は保ち、IR の choice 呼び出しは呼出しの規則に従います。

[fixture: railroad/choices/abnf-slashes]

[fixture: railroad/choices/ebnf-bars]

[fixture: railroad/choices/peg-slashes]

入力（エスケープ表記）:
`"railroad-ebnf-beta\nr=\"red\"|\"green\"\t|\t\"violet\";"`。

出力
([choices/ebnf-bars-output.mmd](../tests/fixtures/railroad/choices/ebnf-bars-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "red" | "green" | "violet";
```

入力（エスケープ表記）:
`"railroad-abnf-beta\nr=\"red\"/\"green\"\t/\t\"violet\";"`。

出力
([choices/abnf-slashes-output.mmd](../tests/fixtures/railroad/choices/abnf-slashes-output.mmd)):

```mmd
railroad-abnf-beta
  r = "red" / "green" / "violet";
```

入力（エスケープ表記）:
`"railroad-peg-beta\nr<-\"red\"/\"green\"\t/\t\"violet\";"`。

出力
([choices/peg-slashes-output.mmd](../tests/fixtures/railroad/choices/peg-slashes-output.mmd)):

```mmd
railroad-peg-beta
  r <- "red" / "green" / "violet";
```

### EBNF の並び

並びの各境界で任意コンマの有無を保ちます。
コンマの前は通常の空白なし、後は空白1つ、コンマのない境界は空白1つです。
混在する形も混在のままにします。
コンマの追加や削除で Db が同じでも、コンマは書かれたまま保ちます。

[fixture: railroad/ebnf-sequences/adjacency]

[fixture: railroad/ebnf-sequences/commas]

[fixture: railroad/ebnf-sequences/mixed]

入力（エスケープ表記）: `"railroad-ebnf-beta\nr=first\tsecond;"`。

出力
([ebnf-sequences/adjacency-output.mmd](../tests/fixtures/railroad/ebnf-sequences/adjacency-output.mmd)):

```mmd
railroad-ebnf-beta
  r = first second;
```

### ABNF と PEG の並び

ABNF と PEG の隣り合う構成要素は通常の空白1つで分けます。
接触していた文字列や group も対象です。
[規則 1](./printed-form.ja.md#1-記号の横の空白)がこの空白を与えます。
Prettier は、続けて並ぶ値の間に、
接していても空白を 1 つ置きます（CSS の `content:"a""b"` は `content: "a" "b";`
と印字します）。
コンマは加えません。

[fixture: railroad/sequences/abnf-members]

[fixture: railroad/sequences/abnf-names]

[fixture: railroad/sequences/peg-members]

[fixture: railroad/sequences/peg-names]

入力（エスケープ表記）:
`"railroad-abnf-beta\nr=\"a\"\"b\"(ref)[\"last\"]%x44;"`。

出力
([sequences/abnf-members-output.mmd](../tests/fixtures/railroad/sequences/abnf-members-output.mmd)):

```mmd
railroad-abnf-beta
  r = "a" "b" (ref) ["last"] %x44;
```

入力（エスケープ表記）: `"railroad-peg-beta\nr<-\"a\"\"b\"(ref).;"`。

出力
([sequences/peg-members-output.mmd](../tests/fixtures/railroad/sequences/peg-members-output.mmd)):

```mmd
railroad-peg-beta
  r <- "a" "b" (ref) .;
```

### 括弧

EBNF の `(expr)`、`[expr]`、`{expr}`、ABNF の `(expr)`、`[expr]`、
PEG の `(expr)` の内側の通常の空白を詰めます。
入れ子や要素が1つの形を含め、括弧はすべて残します。
内端を揃え、括弧の削除で Db が同じでも原文の構造を保つためです。
mermaid.js のドキュメントの例は、選択ではない 1 つの項だけ、
または別のグループだけを入れたグループを 1 つも書いていないので、
[規則 3](./printed-form.ja.md#3-綴り)はその形を与えず、
括弧は書かれたまま残します。

[fixture: railroad/groups/abnf-delimiters]

[fixture: railroad/groups/ebnf-delimiters]

[fixture: railroad/groups/peg-delimiters]

入力（エスケープ表記）:
`"railroad-ebnf-beta\nr=( ( \"group\" ) ) [ \"optional\" ] { \"repeat\" };"`。

出力
([groups/ebnf-delimiters-output.mmd](../tests/fixtures/railroad/groups/ebnf-delimiters-output.mmd)):

```mmd
railroad-ebnf-beta
  r = (("group")) ["optional"] {"repeat"};
```

入力（エスケープ表記）:
`"railroad-abnf-beta\nr=( ( \"group\" ) ) [ \"optional\" ];"`。

出力
([groups/abnf-delimiters-output.mmd](../tests/fixtures/railroad/groups/abnf-delimiters-output.mmd)):

```mmd
railroad-abnf-beta
  r = (("group")) ["optional"];
```

入力（エスケープ表記）: `"railroad-peg-beta\nr<-( ( \"group\" ) );"`。

出力
([groups/peg-delimiters-output.mmd](../tests/fixtures/railroad/groups/peg-delimiters-output.mmd)):

```mmd
railroad-peg-beta
  r <- (("group"));
```

### 後置演算子

EBNF と PEG の AST 上の後置演算子 `?`、`*`、`+` を適用先に付けます。
EBNF の連鎖順と PEG の一つの後置部分を保ちます。
`"chain" * +` の 2 つの後置演算子を入れ替えると、固定した版の Db が変わります。
EBNF の special sequence の優先は AST に表れているため、
原文の leaf 内の疑問符を後置演算子に読み替えません。
呼び出しや group に置き換えません。

[fixture: railroad/postfixes/ebnf-chain]

[fixture: railroad/postfixes/ebnf-question]

[fixture: railroad/postfixes/ebnf-special-priority]

[fixture: railroad/postfixes/peg-suffixes]

入力（エスケープ表記）:
`"railroad-ebnf-beta\nr=\"chain\" * + [\"optional\"] ?;"`。

出力
([postfixes/ebnf-chain-output.mmd](../tests/fixtures/railroad/postfixes/ebnf-chain-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "chain"*+ ["optional"]?;
```

入力（エスケープ表記）:
`"railroad-peg-beta\nr<-\"optional\" ? \"repeat\" * (ref) +;"`。

出力
([postfixes/peg-suffixes-output.mmd](../tests/fixtures/railroad/postfixes/peg-suffixes-output.mmd)):

```mmd
railroad-peg-beta
  r <- "optional"? "repeat"* (ref)+;
```

### 前置 predicate

PEG の先読み条件は `&expr`、`!expr` と詰め、後続の式全体を保ちます。
グループ、後置演算子、グループ内の入れ子の先読み条件も残します。
前置記号の間隔を詰めて適用先を示します。
Db のラベルは式の代わりにはなりません。

[fixture: railroad/predicates/peg-nested]

[fixture: railroad/predicates/peg-operands]

入力（エスケープ表記）: `"railroad-peg-beta\nr<- & ( ! \"inner\" ) \"tail\";"`。

出力
([predicates/peg-nested-output.mmd](../tests/fixtures/railroad/predicates/peg-nested-output.mmd)):

```mmd
railroad-peg-beta
  r <- &(!"inner") "tail";
```

### repeat の表記

ABNF の数字とアスタリスクの綴りをすべて保ちます。
先頭ゼロ、ちょうどの回数、上下限の省略、ゼロ、繰り返しを省略できる上下限、
巨大な整数も対象です。
完全な繰り返し指定と基本式の間の通常の空白だけを詰めます。
省略した上下限を補ったり、省略可能なグループへ変換したりしません。
Db が同じでも、丸めた数を再印字する理由にはなりません。

[fixture: railroad/repeats/abnf-large]

[fixture: railroad/repeats/abnf-spellings]

[fixture: railroad/repeats/abnf-zero]

入力（エスケープ表記）: `"railroad-abnf-beta\nr=9007199254740993 \"large\";"`。

出力
([repeats/abnf-large-output.mmd](../tests/fixtures/railroad/repeats/abnf-large-output.mmd)):

```mmd
railroad-abnf-beta
  r = 9007199254740993"large";
```

### numeric value の表記

ABNF の数値は原文範囲全体を保ちます。
基数を示す文字の大小、数字、先頭ゼロ、ドット、ハイフンと、
指定した基数に合わない数字も対象です。
公開される terminal は原文のテキストなので、正規化で Db が変わるためです。
範囲外の後続参照は `%x42 Z` のように別構成要素にします。

[fixture: railroad/numeric-values/abnf-spellings]

[fixture: railroad/numeric-values/abnf-suffix]

入力（エスケープ表記）: `"railroad-abnf-beta\nr=%X041.4A-4f %DFF %b2 %B001;"`。

出力
([numeric-values/abnf-spellings-output.mmd](../tests/fixtures/railroad/numeric-values/abnf-spellings-output.mmd)):

```mmd
railroad-abnf-beta
  r = %X041.4A-4f %DFF %b2 %B001;
```

### 呼出し

IR の8つの構築関数を `name(...)` にします。
sequence、choice、optional、oneOrMore、zeroOrMore、terminal、nonterminal、
special が対象です。
`(` の前と括弧の内端の通常の空白を詰め、引数コンマの前を0、
同じ行の後を空白1つにします。
規則 1 がこの空白を与えます。
Prettier は、呼出しの `(` の前に空白を置かず（`f (a)` は `f(a);`）、
括弧の内側にも空白を置かず（`f( a )` は `f(a);` と印字します）、
コンマの前に空白を置かず、
後ろに 1 つ置きます（`f(a,b)` は `f(a, b);` と印字します）。
C4 図は、呼出しの `(` の前の空白を拒否します。
詳しくは [Rejected inputs](./c4.ja.md#拒否される入力) を参照してください。
呼出しの配置は[長い行](#長い行)の規則に従います。
空の引用引数、入れ子、要素が1つの形の sequence と choice も保ちます。
要素が1つの形は、削除しても Db が同じになる場合も保ちます。
末尾コンマは加えません。

[fixture: railroad/calls/ir-all]

[fixture: railroad/calls/ir-singletons]

[corpus fixture: railroad/ir-native-ownership]

[corpus fixture: railroad/ir-choice-native-ownership]

[corpus fixture: railroad/ir-keywords-all-calls]

入力（エスケープ表記）:
`"railroad-beta\nr=sequence ( terminal ( \"first\" ) , choice ( special ( \"note\" ),nonterminal ( \"r\" ) ) , optional ( terminal ( \"\" ) ) , oneOrMore (terminal(\"many\")),zeroOrMore (terminal(\"any\")) );"`。

出力
([calls/ir-all-output.mmd](../tests/fixtures/railroad/calls/ir-all-output.mmd)):

```mmd
railroad-beta
  r = sequence(
    terminal("first"),
    choice(
      special("note"),
      nonterminal("r")
    ),
    optional(
      terminal("")
    ),
    oneOrMore(
      terminal("many")
    ),
    zeroOrMore(
      terminal("any")
    )
  );
```

### 例外演算子

EBNF の例外 `-` は両側を通常の空白1つにします。
左結合と右の基本式を保ち、`Identifier` 内のハイフンは分けません。
`left-right` は一つの参照、`left - right` は例外で Db が異なるため、
この空白が必要です。

[fixture: railroad/exceptions/ebnf-hyphenated-name]

[fixture: railroad/exceptions/ebnf-left-fold]

入力（エスケープ表記）: `"railroad-ebnf-beta\nr=left-right;\n"`。

出力
([exceptions/ebnf-hyphenated-name-output.mmd](../tests/fixtures/railroad/exceptions/ebnf-hyphenated-name-output.mmd)):

```mmd
railroad-ebnf-beta
  r = left-right;
```

### special sequence の内容

EBNF の special sequence は原文範囲全体を保ちます。
両端の疑問符、外端の空白、引用符、バックスラッシュ、継続行の列も対象です。
テキストの中の空白とタブの連なりは、空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
外端の空白だけを除いて Db が同じでも、原文の保持により再解釈を避けます。

[fixture: railroad/special-sequences/ebnf-content]

[fixture: railroad/special-sequences/ebnf-lines]

入力（エスケープ表記）: `"railroad-ebnf-beta\nr=?  first  second\t ?;"`。

出力
([special-sequences/ebnf-content-output.mmd](../tests/fixtures/railroad/special-sequences/ebnf-content-output.mmd)):

```mmd
railroad-ebnf-beta
  r = ? first second ?;
```

### 文字列

`StringLiteral` の原文範囲を保ちます。
エスケープ、空文字列、HTML、実体参照、隠れた形やコメントに見える文字も対象です。
文字列の中の空白とタブの連なりは、空白 1 つにして印字します。
空白とタブだけの文字列は空白 1 つになります。
規則名は空白を含まないため、
文字列にその連なりを含む nonterminal はどの規則も参照せず、
その文字列はほかの文字列と同じに印字します。

mermaid.js は IR の空の引用引数を値として読み、空呼出しを拒否するので、
空文字列を保ちます。
文字列内の隠れた形やコメントに見える文字は、Db の値に属するので、
除くと Db が変わります。

[corpus fixture: railroad/ir-db-empty-strings]
[corpus fixture: railroad/ir-error-empty-call]
[corpus fixture: railroad/ebnf-enclosing-string-hidden]

[fixture: railroad/quotes/ir-string-runs-collapsed]

IR、EBNF、PEG は両方の引用符とバックスラッシュエスケープを認めます。
`'` で囲んだ文字列は `"` で囲んで印字しますが、内容に `'`、`"`、
バックスラッシュ、改行、U+2028、U+2029、バッククォート、`&`、`#`、
`<` が含まれる場合は書かれたままにします。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
`singleQuote` は読みません。
ABNF は二重引用符だけを認め、バックスラッシュを普通の文字として読みます。
内容の両端の空白の除去やエスケープの誤解釈で Db が変わります。

[fixture: railroad/quotes/ir-single-quote-sensitive-kept]
[fixture: railroad/quotes/ebnf-single-quote-sensitive-kept]
[fixture: railroad/quotes/peg-single-quote-sensitive-kept]
[fixture: railroad/quotes/abnf-backslash]

[fixture: railroad/quotes/abnf-empty-and-text]

[fixture: railroad/quotes/ebnf-empty-and-text]

[fixture: railroad/quotes/ebnf-escape]

[fixture: railroad/quotes/ir-empty-and-text]

[fixture: railroad/quotes/ir-escape]

[fixture: railroad/quotes/peg-empty-and-text]

[fixture: railroad/quotes/peg-escape]

入力（エスケープ表記）:
`"railroad-beta\nr=sequence ( terminal ( \"\" ),terminal ( \" \t \" ), nonterminal ( '' ),special(\"%%literal --- <b> plain\"));"`。

出力
([quotes/ir-empty-and-text-output.mmd](../tests/fixtures/railroad/quotes/ir-empty-and-text-output.mmd)):

```mmd
railroad-beta
  r = sequence(
    terminal(""),
    terminal(" "),
    nonterminal(""),
    special("%%literal --- <b> plain")
  );
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\nr=\"\" , '' \" \t \" \"%%literal --- <b> plain\";"`。

出力
([quotes/ebnf-empty-and-text-output.mmd](../tests/fixtures/railroad/quotes/ebnf-empty-and-text-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "", "" " " "%%literal --- <b> plain";
```

入力（エスケープ表記）: `"railroad-abnf-beta\nr=\"q\\n\\t\\q\";"`。

設定: `{"singleQuote":true}`。

出力
([quotes/abnf-backslash-output.mmd](../tests/fixtures/railroad/quotes/abnf-backslash-output.mmd)):

```mmd
railroad-abnf-beta
  r = "q\n\t\q";
```

入力（エスケープ表記）:
`"railroad-peg-beta\nr<-\"\" '' \" \t \" \"%%literal --- <b> plain\";"`。

出力
([quotes/peg-empty-and-text-output.mmd](../tests/fixtures/railroad/quotes/peg-empty-and-text-output.mmd)):

```mmd
railroad-peg-beta
  r <- "" "" " " "%%literal --- <b> plain";
```

### 長い行

`sequence`、`choice`、`optional`、`oneOrMore`、`zeroOrMore` の引数は、
後ろの行で1段深く、1行に一つずつ置きます。
閉じ括弧は呼出しと同じ段に置きます。
短い呼出しや要素が1つの形も含め、すべての入れ子の呼出しに適用します。
`printWidth` や元の空白による改行には依存しません。
文法の階層を一貫して示すためです。
末尾コンマは加えません。
対象にする版の mermaid.js は、後ろに引数がない IR 呼出しのコンマを拒否するので、
複数行の呼出しにも末尾コンマを加えません。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。

[corpus fixture: railroad/ir-choice-trailing-comma]

`terminal`、`nonterminal`、`special` は、
引用値と一つのコンパクトな単位にします。
単位の `(` の前と括弧の内側には、改行も含めて空白を置きません。
規則 1 が、行に収まる呼出しの `(` と括弧をそう印字するからです。
`f (a)` と `f( a )` は `f(a);` と印字し、`(` の前と後ろ、
`)` の前で改行した呼出しも同じく印字します。
構築関数、開き括弧、値、閉じ括弧の間の境界に、コメント、大域的なディレクティブ、
図固有の隠れた形があれば、その leaf 呼出しも複数行にします。
文字列の内容は、物理的な改行と継続行の元の列を保ちます。

[fixture: railroad/calls/ir-singletons]

[fixture: railroad/calls/ir-all]

[fixture: railroad/component-newlines/ir-components]

[fixture: railroad/comments/ir-leaf-value-comments]

[fixture: railroad/comments/ir-leaf-boundary-comments]

[fixture: railroad/global-directives/ir-call-boundaries]

[fixture: railroad/hidden-forms/ir-unary-call-owners]

[fixture: railroad/long-lines/ir-expression-grammar]

[fixture: railroad/long-lines/ir-written-breaks]

[fixture: railroad/long-lines/ir-unary-width]

[fixture: railroad/long-lines/ir-wrapped-tabs]

[fixture: railroad/long-lines/ir-wrapped-zero]

[fixture: railroad/multiline-values/ir-columns]

コメント、大域的なディレクティブ、図固有の隠れた形は引数との境界に保ち、
周囲の呼出しには構造に沿った配置を使います。
その配置と隙間は[コメント](#コメント)の規則に従います。
値の中のセミコロンは、この配置を妨げません。
注釈類の内容は[コメント](#コメント)、[共有ディレクティブ](#共有-directive)、
[隠れた形の保持](#hidden-form-の保持)の規則で保ちます。
`style` や `classDef` を含む行と無視されるセミコロンは、保護した配置を使います。
EBNF、ABNF、PEG では、最外周の選択の代入直後と、
`|` や `/` の前に作者が書いた改行を保ち、続きは 1 段深く置きます。
区切り記号は後の選択肢とまとめるため、その直後の通常の改行はつなげます。
他の式の余白は詰め、1 行の規則に改行は足しません。
規則 1 が詰めた余白を与えます。
Prettier は、値だけを入れた括弧、角括弧、
波括弧の内側に空白を置かず（`f( a )` は `f(a);`、
`x = [ 1, 2 ]` は `x = [1, 2];` と印字します）、コンマの前に空白を置かず、
後ろに 1 つ置きます。
EBNF の `{expr}` の波括弧は、名前に値を与えず、項だけを入れるので、
配列 `[ 1, 2 ]` と同じ種類です。
`printWidth` は図の改行位置を決めません。

[fixture: railroad/long-lines/ebnf-written-alternatives]
[fixture: railroad/long-lines/abnf-written-alternatives]
[fixture: railroad/long-lines/peg-written-alternatives]
[fixture: railroad/long-lines/ir-comments-kept]

[fixture: railroad/long-lines/ir-directive-kept]

[fixture: railroad/long-lines/ir-hidden-kept]

[fixture: railroad/long-lines/ir-semicolon-kept]

[fixture: railroad/long-lines/abnf-width]

[fixture: railroad/long-lines/ebnf-width]

[fixture: railroad/long-lines/ir-width]

[fixture: railroad/long-lines/peg-width]

入力（エスケープ表記）:
`"railroad-beta\nr=sequence(terminal(\"first long terminal\"),choice(terminal(\"second long terminal\"),nonterminal(\"reference\")));"`。

設定: `{"printWidth":20}`。

出力
([long-lines/ir-width-output.mmd](../tests/fixtures/railroad/long-lines/ir-width-output.mmd)):

```mmd
railroad-beta
  r = sequence(
    terminal("first long terminal"),
    choice(
      terminal("second long terminal"),
      nonterminal("reference")
    )
  );
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\nr=(\"first long terminal\",reference)|[\"second long terminal\"] {\"third long terminal\"};"`。

設定: `{"printWidth":20}`。

出力
([long-lines/ebnf-width-output.mmd](../tests/fixtures/railroad/long-lines/ebnf-width-output.mmd)):

```mmd
railroad-ebnf-beta
  r = ("first long terminal", reference) | ["second long terminal"] {"third long terminal"};
```

入力（エスケープ表記）:
`"railroad-abnf-beta\nr=2*4(\"first long terminal\"/reference)[\"second long terminal\"];"`。

設定: `{"printWidth":20}`。

出力
([long-lines/abnf-width-output.mmd](../tests/fixtures/railroad/long-lines/abnf-width-output.mmd)):

```mmd
railroad-abnf-beta
  r = 2*4("first long terminal" / reference) ["second long terminal"];
```

入力（エスケープ表記）:
`"railroad-peg-beta\nr<-&(\"first long terminal\"/reference)+!.\"second long terminal\";"`。

設定: `{"printWidth":20}`。

出力
([long-lines/peg-width-output.mmd](../tests/fixtures/railroad/long-lines/peg-width-output.mmd)):

```mmd
railroad-peg-beta
  r <- &("first long terminal" / reference)+ !. "second long terminal";
```

### 構造上の改行

[長い行](#長い行)にある最外周の選択の段落改行は、
通常の余白の詰めより優先します。

文法上余白である通常の CR/LF 隙間を各位置の空白規則へ揃えます。
IR は構築関数、括弧、引数、コンマ、EBNF は代入、選択、並び、group、例外、
後置演算子が対象です。
ABNF は代入、選択、並び、完全な repeat と基本式、group、PEG は代入、選択、並び、
前置部分、後置部分、group が対象です。
IR 呼出しは[長い行](#長い行)の規則で構造に沿って配置します。
名前、複合代入記号、repeat の内部、数値は分割しません。
コメント、ディレクティブ、隠れた形の境界、保護されたセミコロンの改行は保ちます。
それらの join で受理や Db が変わるためです。

[fixture: railroad/component-newlines/abnf-components]

[fixture: railroad/component-newlines/ebnf-components]

[fixture: railroad/component-newlines/ir-components]

[fixture: railroad/component-newlines/peg-components]

入力（エスケープ表記）:
`"railroad-beta\nr\n=\nsequence\n(terminal\n(\n\"joined\"\n)\n,\nterminal(\"tail\")\n)\n;"`。

出力
([component-newlines/ir-components-output.mmd](../tests/fixtures/railroad/component-newlines/ir-components-output.mmd)):

```mmd
railroad-beta
  r = sequence(
    terminal("joined"),
    terminal("tail")
  );
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\nr\n::=\n(\n\"joined\"\n,\nother\n)\n-\n\"except\"\n+\n|\n[\n\"tail\"\n]\n;"`。

出力
([component-newlines/ebnf-components-output.mmd](../tests/fixtures/railroad/component-newlines/ebnf-components-output.mmd)):

```mmd
railroad-ebnf-beta
  r =
    ("joined", other) - "except"+
    | ["tail"];
```

入力（エスケープ表記）:
`"railroad-abnf-beta\nr\n=\n2*4\n(\n\"joined\"\n/\nother\n)\n[\n\"tail\"\n]\n;"`。

出力
([component-newlines/abnf-components-output.mmd](../tests/fixtures/railroad/component-newlines/abnf-components-output.mmd)):

```mmd
railroad-abnf-beta
  r = 2*4("joined" / other) ["tail"];
```

入力（エスケープ表記）:
`"railroad-peg-beta\nr\n<-\n&\n(\n\"joined\"\n/\nother\n)\n+\n!\n.\n;"`。

出力
([component-newlines/peg-components-output.mmd](../tests/fixtures/railroad/component-newlines/peg-components-output.mmd)):

```mmd
railroad-peg-beta
  r <- &("joined" / other)+ !.;
```

### 複数行の値

文字列と EBNF special sequence の物理改行、内部空行、継続列を保ちます。
これらの値を一つの印字単位とし、後続行に構造の字下げを足しません。
内容の折り返し直しや字下げ変更は PEG 先読み条件のラベルを含め Db
を変えるためです。
説明ブロックの本文の字下げ、外端は共有の説明規則に従います。
独立した行の `}` は文と同じ段に置きます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、この深さを与えます。
閉じる行を `{` のある行と同じ段に置く形で、
Prettier がブロックを閉じる行を印字する形です。
`{` のある行は、`accDescr` の行か、
`{` の前にコメントかディレクティブがあるときは、文と同じ段の後の行です。

[fixture: railroad/description-blocks/brace-on-a-later-line]

[fixture: railroad/multiline-values/abnf-columns]

[fixture: railroad/multiline-values/ebnf-columns]

[fixture: railroad/multiline-values/ir-columns]

[fixture: railroad/multiline-values/peg-columns]

入力（エスケープ表記）:
`"railroad-beta\nr=terminal(\"first\n   continuation\n\nlast\");"`。

出力
([multiline-values/ir-columns-output.mmd](../tests/fixtures/railroad/multiline-values/ir-columns-output.mmd)):

```mmd
railroad-beta
  r = terminal("first
   continuation

last");
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\nr=\"first\n   continuation\n\nlast\";"`。

出力
([multiline-values/ebnf-columns-output.mmd](../tests/fixtures/railroad/multiline-values/ebnf-columns-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "first
   continuation

last";
```

入力（エスケープ表記）:
`"railroad-abnf-beta\nr=\"first\n   continuation\n\nlast\";"`。

出力
([multiline-values/abnf-columns-output.mmd](../tests/fixtures/railroad/multiline-values/abnf-columns-output.mmd)):

```mmd
railroad-abnf-beta
  r = "first
   continuation

last";
```

入力（エスケープ表記）:
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

共有の共通行配置を使います。
非空値の通常の外端の空白だけを除いて `title value` にし、
`null` と空白だけの値は裸の `title` にします。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
`title` と空でない値の間に空白 1 つを与え（Prettier は `return  x` を
`return x;` と印字する）、行末の空白とタブを除きます。
そのため、空の値の title は `title` だけになります。
引用符に見える内容とエスケープは保ち、
値の中の空白とタブの連なりは空白 1 つにして印字します。

次の物理行から値を取りません。
`title`、改行、`r=terminal("x");` を `title r=terminal("x");` とつなぐと、
規則 `r` が題のテキストになり、固定した版の Db と、
対象にする版のすべての図が変わるからです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
裸の title 前置部分と後続の規則は別の文にし、規則を値に取り込みません。
この 2 つは、
どの文とも同じく自分の行に置きます（[規則ごとの行](#規則ごとの行)を参照）。
`title x=terminal("title prefix");` と 1 行にすると、
`x=terminal("title prefix");` が題のテキストになり、
mermaid.js が固定した版で作る Db と、対象にする版のすべての図が変わります。
テストの比較 Db は本文の title を除きますが、
内容を書き換える理由にはなりません。
題のテキストの後にディレクティブだけが続くときは、
それぞれの前に空白かタブがあれば空白 1 つを置き、
最後のディレクティブの後の空白とタブを除いて印字します。
ただし、行のディレクティブのどれかに改行、`;`、U+2028、
U+2029 があるときを除きます。
（[改行かセミコロンを含むディレクティブ](./compatibility.ja.md#改行かセミコロンを含むディレクティブ)）。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
題の最後のディレクティブの後の空白とタブは行末にあるので、
[規則 1](./printed-form.ja.md#1-記号の横の空白)が除きます。

[fixture: railroad/title/ir-rule-on-next-line]

[fixture: title/title-directives-end-blanks-dropped]
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

入力（エスケープ表記）:
`"railroad-beta\ntitle\n%% next title\nr=terminal(\"bare title\");"`。

出力
([title/ir-next-line-output.mmd](../tests/fixtures/railroad/title/ir-next-line-output.mmd)):

```mmd
railroad-beta
  title
  %% next title
  r = terminal("bare title");
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\ntitle\n%% next title\nr=\"bare title\";"`。

出力
([title/ebnf-next-line-output.mmd](../tests/fixtures/railroad/title/ebnf-next-line-output.mmd)):

```mmd
railroad-ebnf-beta
  title
  %% next title
  r = "bare title";
```

入力（エスケープ表記）:
`"railroad-abnf-beta\ntitle\n%% next\nr=\"bare title\";"`。

出力
([title/abnf-next-line-output.mmd](../tests/fixtures/railroad/title/abnf-next-line-output.mmd)):

```mmd
railroad-abnf-beta
  title
  %% next
  r = "bare title";
```

入力（エスケープ表記）:
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

共有の共通行配置で `accTitle: value` と `accDescr: value` にします。
コロンをキーワードに付け、非空値の前を通常の空白1つにします。
空値はコロンで終えます。
外端の空白だけを除き、内部の文字と括弧に見える行の値は保ちます。
ただし、`accDescr` の値の中の空白とタブの連なりは空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
`accTitle` はブラウザがツールチップとして表示するので、
その連なりは書かれたまま残します。
次行の値は join しません。
`accTitle:`、改行、
`r=terminal("x");` を `accTitle: r=terminal("x");` とつなぐと、
規則 `r` が題のテキストになり、`accDescr` でも同じで、固定した版の Db と、
対象にする版のすべての図が変わるからです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
値のテキストの後にディレクティブだけが続くときは、
それぞれの前に空白かタブがあれば空白 1 つを置き、
最後のディレクティブの後の空白とタブを除いて印字します。
ただし、行のディレクティブのどれかに改行、`;`、U+2028、
U+2029 があるときを除きます。
（[改行かセミコロンを含むディレクティブ](./compatibility.ja.md#改行かセミコロンを含むディレクティブ)）。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
accessibility の値の最後のディレクティブの後の空白とタブは行末にあるので、
[規則 1](./printed-form.ja.md#1-記号の横の空白)が除きます。

[fixture: railroad/accessibility-lines/ir-acc-title-before-rule]

[fixture: accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: railroad/accessibility-lines/abnf-empty]

[fixture: railroad/accessibility-lines/abnf-values]

[fixture: railroad/accessibility-lines/ebnf-empty]

[fixture: railroad/accessibility-lines/ebnf-values]

[fixture: railroad/accessibility-lines/ir-empty]

[fixture: railroad/accessibility-lines/ir-values]

[fixture: railroad/accessibility-lines/peg-empty]

[fixture: railroad/accessibility-lines/peg-values]

入力（エスケープ表記）:
`"railroad-beta\naccTitle:\naccDescr:\nr=terminal(\"empty access\");"`。

出力
([accessibility-lines/ir-empty-output.mmd](../tests/fixtures/railroad/accessibility-lines/ir-empty-output.mmd)):

```mmd
railroad-beta
  accTitle:
  accDescr:
  r = terminal("empty access");
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\naccTitle: \naccDescr: {literal}\nr=\"empty access\";"`。

出力
([accessibility-lines/ebnf-empty-output.mmd](../tests/fixtures/railroad/accessibility-lines/ebnf-empty-output.mmd)):

```mmd
railroad-ebnf-beta
  accTitle:
  accDescr: {literal}
  r = "empty access";
```

入力（エスケープ表記）:
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

入力（エスケープ表記）:
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

1 行の説明ブロックは、
[1 行の説明ブロック](./compatibility.ja.md#1-行の説明ブロック) に従います。
波括弧を保つブロックでは、`accDescr` と `{` の間に空白 1 つを置きます。
キーワードと開始括弧の間が空白だけなら、同じ行にまとめます。
空白だけの内部は、囲む内容がないため `{}` にします。
規則 1 も、
何も入れない波括弧を `{}` と印字します（`x = { }` は `x = {};` です）。
キーワードと波括弧の間の空白 1 つと、空白だけの隙間をまとめる形は、
[pie](./pie.ja.md#description-blocks)、[info](./info.ja.md#description-blocks)、
[radar](./radar.ja.md#description-blocks) が印字する形で、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が与えます。

[fixture: railroad/description-blocks/abnf-edges]
[fixture: railroad/description-blocks/ebnf-edges]
[fixture: railroad/description-blocks/ir-edges]
[fixture: railroad/description-blocks/peg-edges]

本文が複数行のブロックでは、
通常の説明本文と独立したコメント行を文より 1 段深くします。
Db で LF 後の字下げが取り除かれるためです。
改行と内部の空行は保ちます。
行末の空白は、テキストの最後の行のものを除いて保ちます。
空白だけの行は空行にします。
規則 1 は、テキストの行の間の改行を残します。
mermaid.js がそれを値に残し、2 つの行をつなぐと説明が変わるからです。
その間の空行は、規則 1 の「空行」の行が与えます。
空行の連なりは 1 つにし、ブロックの頭と終わりには空行を置きません。
リリース済みの版は、空行の連なりと、
ブロックの頭と終わりの空行を書かれたまま残し、
これはその行が与える形ではありません。
最後のテキスト行の行末の空白は、閉じ括弧が自分の行にあるときは落とし、
同じ行で閉じ括弧が続くときは空白 1 つで印字します。
独立した行の `}` は文と同じ段に置きます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、この深さを与えます。
閉じる行を `{` のある行と同じ段に置く形で、
Prettier がブロックを閉じる行を印字する形です。
`{` のある行は、`accDescr` の行か、
`{` の前にコメントかディレクティブがあるときは、文と同じ段の後の行です。

[fixture: railroad/description-blocks/blank-lines-at-the-ends-kept]
[fixture: railroad/description-blocks/blank-line-run-kept]
[fixture: railroad/description-blocks/brace-on-a-later-line]

[fixture: railroad/description-blocks/abnf-lines]
[fixture: railroad/description-blocks/ebnf-lines]
[fixture: railroad/description-blocks/ir-lines]
[fixture: railroad/description-blocks/peg-lines]
[fixture: description-blocks/block-trailing-whitespace]
[fixture: description-blocks/block-trailing-whitespace-closer-on-the-text-line]

同じ行の後ろにその図種固有のコメントが続くブロックは、
ブロックのまま残します（ABNF 図では `accDescr { d } ; c`、
EBNF 図では `(* c *)` または `/* c */`、PEG 図では `# c`、
railroad 図では `/* c */`）。
コロンの形では、そのコメントが本文の一部になるからです。
`%%` で始まるコメントは本文を終えるので、
ブロックは `accDescr: d %% c` になります。

[fixture: railroad/description-blocks/abnf-comment-after-block-kept]
[fixture: railroad/description-blocks/ebnf-iso-comment-after-block-kept]
[fixture: railroad/description-blocks/ebnf-c-comment-after-block-kept]
[fixture: railroad/description-blocks/ir-comment-after-block-kept]
[fixture: railroad/description-blocks/peg-comment-after-block-kept]
[fixture: railroad/description-blocks/abnf-percent-comment-after-block]
[fixture: railroad/description-blocks/ebnf-percent-comment-after-block]
[fixture: railroad/description-blocks/ir-percent-comment-after-block]
[fixture: railroad/description-blocks/peg-percent-comment-after-block]

ディレクティブは原文全体を保ちます。
mermaid.js が中身を解析しないからです。
詳しくは
[埋め込みデータは検査しない](./compatibility.ja.md#埋め込みデータは検査しない)
を参照してください。
コメントかディレクティブだけのブロックも、
[コメント](#コメント) と [共有ディレクティブ](#共有-directive)
の理由で内容を残します。

[fixture: railroad/description-blocks/abnf-trivia]
[fixture: railroad/description-blocks/ebnf-trivia]
[fixture: railroad/description-blocks/ir-trivia]
[fixture: railroad/description-blocks/peg-trivia]

入力（エスケープ表記）:
`"railroad-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr=terminal(\"block\");"`。

出力
([description-blocks/ir-edges-output.mmd](../tests/fixtures/railroad/description-blocks/ir-edges-output.mmd)):

```mmd
railroad-beta
  accDescr: Text
  accDescr: Text
  accDescr {}
  r = terminal("block");
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr=\"block\";"`。

出力
([description-blocks/ebnf-edges-output.mmd](../tests/fixtures/railroad/description-blocks/ebnf-edges-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr: Text
  accDescr: Text
  accDescr {}
  r = "block";
```

入力（エスケープ表記）:
`"railroad-abnf-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr=\"block\";"`。

出力
([description-blocks/abnf-edges-output.mmd](../tests/fixtures/railroad/description-blocks/abnf-edges-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr: Text
  accDescr: Text
  accDescr {}
  r = "block";
```

入力（エスケープ表記）:
`"railroad-peg-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr<-\"block\";"`。

出力
([description-blocks/peg-edges-output.mmd](../tests/fixtures/railroad/description-blocks/peg-edges-output.mmd)):

```mmd
railroad-peg-beta
  accDescr: Text
  accDescr: Text
  accDescr {}
  r <- "block";
```

### コメント

独立したコメントは本文で1段、見出し前で第1列に置きます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
図の本文の中の独立したコメント行の深さを与えます。
Prettier がブロックの中の行をそう印字するためです。
通常の IR 呼出し以外では、行内のコメントは左右の位置と行を変えません。
接する行内コメントは接したまま残します。
印、内容、末尾空白、ブロックの継続列、順序を保ちます。
行コメントの後の適用先と終端は次行に残します。
ABNF の規則の終端では、`r="comment"; note ;` は、コメントが終端を取り込むので、
対象にする版の mermaid.js のすべてが拒否します。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
全方言に `%%`、IR に `/* */`、EBNF に `/* */` と `(* *)`、
ABNF に `;` の行コメント、PEG に `#` の行コメントがあります。
裸の ABNF `;` は句読点であり、`//` は図固有のコメントではありません。
値が所有する文字は値のままにします。
所有位置を保ち、行コメントがコードを取り込むのを防ぐためです。
[規則 1](./printed-form.ja.md#1-記号の横の空白)は、
同じ行の何かの後ろにあるコメントの前に空白 1 つを与えます。
Prettier が `x = 1;   // c` を `x = 1; // c` と印字する形です。
コメントのテキストは、末尾の空白まで書かれたまま残します。
mermaid.js が読まないからです。

通常の IR 呼出しの中では、引数前のブロックコメントを引数の行へ一緒に移します。
コンマや閉じ括弧の前のコメントは引数の後ろに残します。
行コメントの後ろのトークンは後の行に置きます。
独立したコメント行は引数の段に順序を保って置き、空行は1つまでにします。
Prettier は 2 つのものの間に空行を最大 1 つしか印字しません。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
引数の段の独立したコメントの間の空行も、最大 1 つにします。
構築関数と開き括弧の間のコメントは、その間に残します。
その位置に改行があれば、両方の括弧を継続行として字下げし、
引数をさらに1段深く置きます。
元は1行に書かれた IR 呼出しの隙間では、
構築関数と開き括弧の間のコメントの両側に空白1つを置きます。
引数前のコメントは、その引数の通常の区切りの後に置き、
引数まで空白1つを置きます。
コンマや閉じ括弧の前のコメントは、前に空白 1 つ、後ろに空白なしで置きます。
閉じ括弧は独立した行に置きます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)は、
同じ行の何かの後ろにあるコメントの前を、空白 1 つにします。
Prettier が `x = 1;   // c` を `x = 1; // c` と印字する形です。
既存の改行の隣でも同じ外側空白を使い、コメントを越えて句読点を移しません。
タブや幅0の字下げでも、コメントの連なりの内容、内部の接触、継続列、
末尾空白を保ちます。
引数の並びの中の独立したコメント行は、まわりの引数と同じ段に置きます。
[flowchart](./flowchart.ja.md#コメント)、[sequence](./sequence.ja.md#コメント)、
[state](./state.ja.md#コメント) では、コメント行がまわりの文と同じ段に立ちます。
空行の連なりは、
[radar](./radar.ja.md#blank-lines) と [info](./info.ja.md#blank-lines) のように
1 つにします。

[fixture: railroad/comments/ir-call-inline-spacing]

[fixture: railroad/comments/ir-block-comments-after-gap-breaks]

[fixture: railroad/comments/ir-call-constructor-nested]

[test: railroad/comments/ir-call-constructor-break-tabs]

[test: railroad/comments/ir-call-constructor-break-zero]

[fixture: railroad/long-lines/ir-comments-kept]

[fixture: railroad/comments/ir-call-inline-boundaries]

[fixture: railroad/comments/ir-call-comment-lines]

[fixture: railroad/comments/ir-call-own-lines]

[fixture: railroad/comments/ir-leaf-value-comments]

出力
([comments/ir-call-inline-spacing-output.mmd](../tests/fixtures/railroad/comments/ir-call-inline-spacing-output.mmd)):

```mmd
railroad-beta
  leaf = terminal /* call */ (
    /* before */ "x" /* close */
  );
  list = sequence(
    terminal("a") /* comma */,
    /* next */ terminal("b")
  );
```

[test: railroad/comments/ir-call-comment-tail-tabs]

[test: railroad/comments/ir-call-comment-tail-zero]

[fixture: railroad/comments/abnf-before-terminator]

[fixture: railroad/comments/abnf-closer]

[fixture: railroad/comments/abnf-positions]

[fixture: railroad/comments/ebnf-block-columns]

[fixture: railroad/comments/ebnf-closer]

[fixture: railroad/comments/ebnf-positions]

[fixture: railroad/comments/ir-block-columns]

[fixture: railroad/comments/ir-closer]

[fixture: railroad/comments/ir-positions]

[fixture: railroad/comments/ir-indented-comments]

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

入力（エスケープ表記）:
`"railroad-beta\nr=/*first\n second*/terminal(\"comment\");"`。

出力
([comments/ir-block-columns-output.mmd](../tests/fixtures/railroad/comments/ir-block-columns-output.mmd)):

```mmd
railroad-beta
  r =/*first
 second*/terminal("comment");
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\nr=(*first\n second*)\"comment\";"`。

出力
([comments/ebnf-block-columns-output.mmd](../tests/fixtures/railroad/comments/ebnf-block-columns-output.mmd)):

```mmd
railroad-ebnf-beta
  r =(*first
 second*)"comment";
```

入力（エスケープ表記）: `"railroad-abnf-beta\nr=\"comment\"; note\n;"`。

出力
([comments/abnf-before-terminator-output.mmd](../tests/fixtures/railroad/comments/abnf-before-terminator-output.mmd)):

```mmd
railroad-abnf-beta
  r = "comment"; note
  ;
```

入力（エスケープ表記）: `"railroad-peg-beta\n#\nr<-\"bare comment\";#"`。

出力
([comments/peg-bare-output.mmd](../tests/fixtures/railroad/comments/peg-bare-output.mmd)):

```mmd
railroad-peg-beta
  #
  r <- "bare comment";#
```

ABNF のコメントの `;` の後ろの空白は、そのコメントの本文の末尾で、
書かれたまま残します（上の規則）。
`;` の後ろに U+2028 か U+2029 があるときは、
その文字の後ろに続くコメント行の次の行で決めます。
mermaid.js はコメント行を取り除いて、
その行を `;` の行とつなげて読むからです（詳しくは、
[U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
を参照）。
その行が空か、空白だけか、ないときは、コメント行を自分の行で始め、
`;` は後ろに書かれていた空白とタブを残します。
`;`、空白、U+2028、`%% c`、空の行、規則は、`; ` と `%% c` の 2 行に印字します。
`;` と文字の間に空白がなかったときは、上の離れた隙間の空白 1 つと同じに、
`;` の後ろに空白を 1 つ置きます。
`;` だけのものは句読点で、数える版の mermaid.js はどれも、
コメントのつもりのその形を受け付けないので、空白なしで印字すると、
2 回目の整形が読めないテキストになります。
コメントの本文が `;` だけでないとき（`; %%{x}%%`）は、何も足しません。
コメント行が `;` で終わるとき（`%% style:#x;`、`%% c;`）も、
コメントが規則の中にあるとき（アトムの後ろでも自分の行でも）も同じです。

コメント行の次の行に規則、ディレクティブの行、`;` があるときは、`;`、文字、
コメント行を書かれたまま残します。
行に `style` か `classDef` があるか、`;` で終わるために、
最後まで書かれたまま残る文の中にあるときも、
書かれたまま残します（セミコロンを参照）。
`r=("x" ; `、U+2028、`%% style:#x;`、空の行、`"y");` はそのままで、
文字の前に無視される `;` があるときもそうです。
文字の後ろにディレクティブが続き、コメント行が続かないときも、
閉じていてもいなくても、書かれたまま残します。

[test: railroad/comments/abnf-semicolon-sp-comment-bl-ls]
[test: railroad/comments/abnf-semicolon-tight-comment-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-dircomment-bl-ls]
[test: railroad/comments/abnf-semicolon-sp2-comment-bl-ls]
[test: railroad/comments/abnf-semicolon-tab-comment-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-comment-eot-ls]
[test: railroad/comments/abnf-semicolon-tight-comment-eot-ls]
[test: railroad/comments/abnf-semicolon-after-rule-dircomment-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-comment-nobl-ls]
[test: railroad/comments/abnf-semicolon-sp-dir-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-text-comment-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-comment-bl-ps]
[test: railroad/comments/abnf-semicolon-tight-comment-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-dircomment-bl-ps]
[test: railroad/comments/abnf-semicolon-sp2-comment-bl-ps]
[test: railroad/comments/abnf-semicolon-tab-comment-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-comment-eot-ps]
[test: railroad/comments/abnf-semicolon-tight-comment-eot-ps]
[test: railroad/comments/abnf-semicolon-after-rule-dircomment-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-comment-nobl-ps]
[test: railroad/comments/abnf-semicolon-sp-dir-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-text-comment-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-style-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-style-bl-ps]
[test: railroad/comments/abnf-semicolon-tight-style-bl-ls]
[test: railroad/comments/abnf-semicolon-tight-style-bl-ps]
[test: railroad/comments/abnf-semicolon-tab-style-bl-ls]
[test: railroad/comments/abnf-semicolon-tab-style-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-style-eot-ls]
[test: railroad/comments/abnf-semicolon-sp-style-eot-ps]
[test: railroad/comments/abnf-semicolon-after-rule-style-bl-ls]
[test: railroad/comments/abnf-semicolon-after-rule-style-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-style-two-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-style-two-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-style-spaced-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-style-spaced-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-classdef-in-rule-bl]
[test: railroad/comments/abnf-semicolon-sp-classdef-in-rule-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-endsemi-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-endsemi-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-dir-endsemi-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-dir-endsemi-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-unclosed-dir-ls]
[test: railroad/comments/abnf-semicolon-sp-unclosed-dir-ps]
[test: railroad/comments/abnf-semicolon-in-rule-comment-bl-ls]
[test: railroad/comments/abnf-semicolon-in-rule-comment-bl-ps]
[test: railroad/comments/abnf-semicolon-in-rule-line-comment-bl-ls]
[test: railroad/comments/abnf-semicolon-in-rule-line-comment-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-two-comments-bl-ls]
[test: railroad/comments/abnf-semicolon-sp-two-comments-bl-ps]
[test: railroad/comments/abnf-semicolon-sp-two-comments-rule-ls]
[test: railroad/comments/abnf-semicolon-sp-two-comments-rule-ps]
[test: railroad/comments/abnf-semicolon-sp-comment-directive-line-ls]
[test: railroad/comments/abnf-semicolon-sp-comment-directive-line-ps]
[test: railroad/comments/abnf-semicolon-sp-comment-semicolon-line-ls]
[test: railroad/comments/abnf-semicolon-sp-comment-semicolon-line-ps]
[test: railroad/comments/abnf-semicolon-sp-comment-whitespace-line-ls]
[test: railroad/comments/abnf-semicolon-sp-comment-whitespace-line-ps]
[test: railroad/comments/abnf-semicolon-in-rule-style-line-ls]
[test: railroad/comments/abnf-semicolon-in-rule-style-line-ps]
[test: railroad/comments/abnf-semicolon-in-rule-semicolon-line-ls]
[test: railroad/comments/abnf-semicolon-in-rule-semicolon-line-ps]
[test: railroad/comments/abnf-semicolon-marker-eot-ls]
[test: railroad/comments/abnf-semicolon-marker-eot-ps]
[test: railroad/comments/abnf-semicolon-closed-directive-before-separator-ls]
[test: railroad/comments/abnf-semicolon-closed-directive-before-separator-ps]
[test: railroad/comments/abnf-semicolon-unclosed-directive-before-separator-ls]
[test: railroad/comments/abnf-semicolon-unclosed-directive-before-separator-ps]
[test: railroad/comments/abnf-semicolon-after-ignored-semicolon-ls]
[test: railroad/comments/abnf-semicolon-after-ignored-semicolon-ps]

`;` で始まるコメント行は U+2028 か U+2029 で終わり、
その文字の後ろの文字列は独立した行になります。
その行のディレクティブとコメントは、改行の後の行と同じに印字し、
ディレクティブとコメントの間は、書かれた形に空白があれば空白 1 つにします。

[test: railroad: a comment line of a semicolon, U+2028, a directive, two spaces, and a comment]
[test: railroad: a comment line of a semicolon, U+2028, a directive touching a comment]
[test: railroad: a comment line of a semicolon, U+2028, a directive, a tab, and a comment]
[test: railroad: a comment line of a semicolon, U+2029, a directive, two spaces, and a comment]

### 共有 directive

`Root` ディレクティブを原文範囲から元の所有位置に1回印字します。
通常の IR 呼出しの隙間以外では、同じ印字行の中のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
元は同じ行にあった単位を別の行へ分けるときは、
間のディレクティブを次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
保護された `style` や `classDef` の行などは、配置を書かれたまま残します。
通常の独立したディレクティブを本文で1段字下げします。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
図の本文の中の独立したディレクティブ行の深さを与えます。
Prettier がブロックの中の行をそう印字するためです。
内容の JSON 整形や見出し前への収集はしません。
一律の空白追加が、共有処理後の文字列、repeat の部品、数値、
先読み条件の適用先を変えるためです。

通常の IR 呼出しの隙間は、コメントと同じ外側空白と構造に沿った配置を使います。
ディレクティブは引数のそばに保ち、引用値の leaf 呼出しも複数行にします。
内容と、同じ連なりの他の項目との接触は元のままにします。

[fixture: railroad/long-lines/ir-directive-kept]

[fixture: railroad/global-directives/ir-call-boundaries]

[fixture: railroad/global-directives/between-rules]

[fixture: railroad/global-directives/abnf-components]

[fixture: railroad/global-directives/abnf-standalone]

[fixture: railroad/global-directives/ebnf-contact]

[fixture: railroad/global-directives/ebnf-standalone]

[fixture: railroad/global-directives/ir-contact]

[fixture: railroad/global-directives/ir-standalone]

[fixture: railroad/global-directives/peg-contact]

[fixture: railroad/global-directives/peg-standalone]

入力（エスケープ表記）:
`"railroad-beta\nr%%{wrap}%% = %%{wrap}%%terminal(\"a%%{wrap}%%last\");"`。

出力
([global-directives/ir-contact-output.mmd](../tests/fixtures/railroad/global-directives/ir-contact-output.mmd)):

```mmd
railroad-beta
  r %%{wrap}%%= %%{wrap}%%terminal("a%%{wrap}%%last");
```

入力（エスケープ表記）: `"railroad-ebnf-beta\nr = %%{wrap}%% \"global\";"`。

出力
([global-directives/ebnf-contact-output.mmd](../tests/fixtures/railroad/global-directives/ebnf-contact-output.mmd)):

```mmd
railroad-ebnf-beta
  r = %%{wrap}%%"global";
```

入力（エスケープ表記）:
`"railroad-abnf-beta\nr=2%%{wrap}%%*%%{wrap}%%4 %%{wrap}%% \"global\" %x4%%{wrap}%%1;"`。

出力
([global-directives/abnf-components-output.mmd](../tests/fixtures/railroad/global-directives/abnf-components-output.mmd)):

```mmd
railroad-abnf-beta
  r = 2%%{wrap}%%*%%{wrap}%%4%%{wrap}%%"global" %x4%%{wrap}%%1;
```

入力（エスケープ表記）: `"railroad-peg-beta\nr <- &%%{wrap}%% \"global\";"`。

出力
([global-directives/peg-contact-output.mmd](../tests/fixtures/railroad/global-directives/peg-contact-output.mmd)):

```mmd
railroad-peg-beta
  r <- &%%{wrap}%%"global";
```

### hidden form の保持

`RailroadIgnoredText` を AST の各所有ノードで範囲全体から1回印字します。
規則、呼び出し、リスト構成要素、group、後置演算子、例外、repeat と基本式、
先読み条件と適用先の隙間を保ちます。
本文の開始記号は字下げできますが、内部と閉じ記号は元の列を保ちます。

図固有の形の YAML や JSON を整形せず、注釈類を除いた値も使いません。
三つの囲み記号が一つの形になる場合と、
失敗したディレクティブ開始記号がパーセントコメントになる場合も保ちます。
受理や不透明な文字の位置を変えないためです。

通常の IR 呼出しの中では、図固有の隠れた形全体を一つの不透明な項目にします。
その中の大域的なディレクティブも含め、内容と内部の列を書かれたまま保ち、
周囲の文法を構造に沿って字下げします。

[fixture: railroad/hidden-forms/ir-call-global-inside-native]

[fixture: railroad/hidden-forms/ir-call-native-yaml]

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

入力（エスケープ表記）:
`"railroad-beta\n%%{!unclosed note\nr=terminal(\"fallback\");"`。

出力
([hidden-forms/ir-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/ir-fallback-output.mmd)):

```mmd
railroad-beta
  %%{!unclosed note
  r = terminal("fallback");
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\n%%{!unclosed note\nr=\"fallback\";"`。

出力
([hidden-forms/ebnf-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/ebnf-fallback-output.mmd)):

```mmd
railroad-ebnf-beta
  %%{!unclosed note
  r = "fallback";
```

入力（エスケープ表記）:
`"railroad-abnf-beta\n%%{!unclosed note\nr=\"fallback\";"`。

出力
([hidden-forms/abnf-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/abnf-fallback-output.mmd)):

```mmd
railroad-abnf-beta
  %%{!unclosed note
  r = "fallback";
```

入力（エスケープ表記）:
`"railroad-peg-beta\n%%{!unclosed note\nr<-\"fallback\";"`。

出力
([hidden-forms/peg-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/peg-fallback-output.mmd)):

```mmd
railroad-peg-beta
  %%{!unclosed note
  r <- "fallback";
```

### hidden の境界

通常の IR 呼出しの隙間以外では、ノード範囲外で消費した LF、
閉じ記号後の空白とタブ、同じ行の接触を共有の隠れた形の隙間保護で残します。
その呼出しの中では、
[隠れた形の保持](#hidden-form-の保持)の規則で全体を保ちます。
通常の規則は必須 `;` で終わるため、他図種の visible-EOL 条件は加えません。
本文の形には共有の予備 LF 規則を使い、
見出し自身の形だけにヘッダー端の例外を使います。
見出しの行から移した文も本文の境界を保ちます。
共有の行を保持する規則で隠れた形と前後の文がその行に残る場合とは区別します。
本文の隠れた形が取る LF の後の空行は、二つの文の間の空行です。
1 行は保ち、続く空行は 1 行にし、空行は足しません。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が空行をそう印字するからです。
`a();`、3 行の空行、`b();` は、空行 1 行で印字します。

[fixture: railroad/hidden-boundaries/abnf-closing-padding]

[fixture: railroad/hidden-boundaries/abnf-header-kept-statement]

[fixture: railroad/hidden-boundaries/abnf-moved-before-hidden]

[fixture: railroad/hidden-boundaries/ebnf-closing-padding]

[fixture: railroad/hidden-boundaries/ebnf-header-kept-statement]

[fixture: railroad/hidden-boundaries/ebnf-moved-before-hidden]

[fixture: railroad/hidden-boundaries/ir-blank-lines-after-hidden]

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

入力（エスケープ表記）:
`"railroad-beta accDescr{moved}\n%%{!after metadata}%%\n\nr=terminal(\"after moved\");"`。

出力
([hidden-boundaries/ir-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/ir-moved-before-hidden-output.mmd)):

```mmd
railroad-beta
  accDescr: moved
  %%{!after metadata}%%

  r = terminal("after moved");
```

入力（エスケープ表記）:
`"railroad-ebnf-beta accDescr{moved}\n%%{!after metadata}%%\n\nr=\"after moved\";"`。

出力
([hidden-boundaries/ebnf-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/ebnf-moved-before-hidden-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr: moved
  %%{!after metadata}%%

  r = "after moved";
```

入力（エスケープ表記）:
`"railroad-abnf-beta accDescr{moved}\n%%{!after metadata}%%\n\nr=\"after moved\";"`。

出力
([hidden-boundaries/abnf-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/abnf-moved-before-hidden-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr: moved
  %%{!after metadata}%%

  r = "after moved";
```

入力（エスケープ表記）:
`"railroad-peg-beta accDescr{moved}\n%%{!after metadata}%%\n\nr<-\"after moved\";"`。

出力
([hidden-boundaries/peg-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/peg-moved-before-hidden-output.mmd)):

```mmd
railroad-peg-beta
  accDescr: moved
  %%{!after metadata}%%

  r <- "after moved";
```

### 保持 prefix

`textBeforeHeader` があれば、見出しキーワードまでの前置部分全体を保ちます。
先頭 LF、通過した単独行の注釈類、保持 YAML、再走査で読む形、
実際の形と隠れた形の順序も対象です。
共有の `keepsPrefix` により、
無効だった YAML がフロントマターになって埋込み title
や設定を変えるのを防ぎます。
コメントだけの通常の前置部分は最上位の整形に従います。

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

入力（エスケープ表記）:
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

入力（エスケープ表記）:
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

入力（エスケープ表記）:
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

入力（エスケープ表記）:
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

書かれたセミコロンをすべて保ちます。
規則の必須の可視終端と ABNF の図固有のコメント印は文法の句読点として、
共有のテキストの前置部分の走査から除きます。
通常の IR 規則は、値の中のセミコロンをテキストとして保ち、
呼出しの構造に沿った配置を妨げません。
その他のセミコロンは、交差する値や注釈類全体まで元の区間を保護します。
保護した区間の最初の行は、本文の1段に揃えます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
ブロックの中の行にそう与えます。
最初の行の列に文法上の意味はありません。
2行目以降は書かれた列を保ち、字下げを足しません。

[fixture: railroad/long-lines/ir-semicolon-kept]

railroad では、大域的なディレクティブを除いた後の原文の行に、
文字列 style または classDef があれば、その行を書かれたまま保ちます。
行の中のすべての文、コメント、図固有の隠れた形と、その間の空白を含みます。
前後の行とは結合しません。
ABNF では、`style=(":"` と `)%%{!#}%% ;` の間の改行を保ちます。
PEG では、`r<-("sty%%{wrap}%%le:"` と `)%%{!#}%% ;` の間の改行を保ちます。
それぞれを結合した `style=(":")%%{!#}%% ;` と
`r<-("sty%%{wrap}%%le:")%%{!#}%% ;` を、
対象にする版の mermaid.js のすべてが拒否するためです（詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください）。
ディレクティブの除去で、これらの文字列が複数の物理行をまたいでできる場合は、
またがる行をすべて保ちます。

[fixture: railroad/semicolons/native-terminal-value]
[fixture: railroad/semicolons/ir-word-unclosed-directive-lines]
[fixture: railroad/semicolons/ebnf-word-unclosed-directive-lines]
[fixture: railroad/semicolons/abnf-word-unclosed-directive-lines]
[fixture: railroad/semicolons/peg-word-unclosed-directive-lines]

ここでいう行は、mermaid.js が1行として読む範囲全体です。
U+2028 や U+2029 の後のコメント行が、語を含む行の前、後、
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

共有の行を保持する配置に従い、
その行をまたぐ文や不可分な値・注釈類も全体を保ちます。
2行目以降の列は書かれたままです。

mermaid.js は、これらの文字列を含む行の最後のセミコロンを無視し得ます。
詳しくは [`;` を含む行](./compatibility.ja.md#-を含む行) を参照してください。
railroad では、規則の必須終端や ABNF のコメントの印がその対象になり得ます。
行を変えると規則が拒否されたり、コメントの中身がコードとして読まれたりするため、
原文の行を保つことで両方の句読点を守ります。
内容を移した後の行規則の効き方は予測しません。

払うものは、規則名、文字列、コメントに style や classDef を含む行が、
後にコロンやハッシュ記号がなくても整形されないことです。
その他の行は通常の規則に従います。
除かれる大域的なディレクティブの中にしかない語は、行を保つ対象にしません。
ディレクティブの除去で接する文字は対象にします。
ヘッダの前の行にある大域的なディレクティブも同じように除かれ、
その後の本文の行は、従来どおり保つか整形します。

[fixture: railroad/semicolons/ir-word-after-leading-directive]
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

入力（エスケープ表記）:
`"railroad-beta\n accDescr { style:#x } r = sequence(terminal(\"a;b\"),terminal(\"tail\"));;"`。

出力
([semicolons/ir-protected-output.mmd](../tests/fixtures/railroad/semicolons/ir-protected-output.mmd)):

```mmd
railroad-beta
  accDescr { style:#x } r = sequence(terminal("a;b"),terminal("tail"));;
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\n accDescr { style:#x } r = \"a;b\", \"tail\";;"`。

出力
([semicolons/ebnf-protected-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-protected-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr { style:#x } r = "a;b", "tail";;
```

入力（エスケープ表記）:
`"railroad-abnf-beta\n r=\"first\" ; content; protected\n \"last\";\n"`。

出力
([semicolons/abnf-comment-content-output.mmd](../tests/fixtures/railroad/semicolons/abnf-comment-content-output.mmd)):

```mmd
railroad-abnf-beta
  r="first" ; content; protected
 "last";
```

入力（エスケープ表記）:
`"railroad-peg-beta\n accDescr { style:#x } r <- \"a;b\" \"tail\";;"`。

出力
([semicolons/peg-protected-output.mmd](../tests/fixtures/railroad/semicolons/peg-protected-output.mmd)):

```mmd
railroad-peg-beta
  accDescr { style:#x } r <- "a;b" "tail";;
```

入力（エスケープ表記）: `"railroad-beta\nstyle=terminal(\":\" )/*#*/;"`。

出力
([semicolons/ir-style-call-close-output.mmd](../tests/fixtures/railroad/semicolons/ir-style-call-close-output.mmd)):

```mmd
railroad-beta
  style=terminal(":" )/*#*/;
```

入力（エスケープ表記）: `"railroad-abnf-beta\nstyle=(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/abnf-style-group-newline-output.mmd](../tests/fixtures/railroad/semicolons/abnf-style-group-newline-output.mmd)):

```mmd
railroad-abnf-beta
  style=(":"
)%%{!#}%% ;
```

入力（エスケープ表記）: `"railroad-beta\n   r=terminal(\"a;b\");"`。

出力
([semicolons/ir-protected-rule-indent-output.mmd](../tests/fixtures/railroad/semicolons/ir-protected-rule-indent-output.mmd)):

```mmd
railroad-beta
  r = terminal("a;b");
```

入力（エスケープ表記）: `"railroad-beta\n   r=terminal(\n \"a;b\"\n);"`。

出力
([semicolons/ir-protected-multiline-indent-output.mmd](../tests/fixtures/railroad/semicolons/ir-protected-multiline-indent-output.mmd)):

```mmd
railroad-beta
  r = terminal("a;b");
```

入力（エスケープ表記）: `"railroad-beta\n/*style*/r=terminal(\":\"\n)/*#*/;"`。

出力
([semicolons/ir-leading-c-output.mmd](../tests/fixtures/railroad/semicolons/ir-leading-c-output.mmd)):

```mmd
railroad-beta
  /*style*/r=terminal(":"
)/*#*/;
```

入力（エスケープ表記）: `"railroad-ebnf-beta\n(*style*)r=(\":\"\n)(*#*);"`。

出力
([semicolons/ebnf-leading-iso-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-leading-iso-output.mmd)):

```mmd
railroad-ebnf-beta
  (*style*)r=(":"
)(*#*);
```

入力（エスケープ表記）:
`"railroad-abnf-beta\n%%{!style}%% r=(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/abnf-leading-hidden-output.mmd](../tests/fixtures/railroad/semicolons/abnf-leading-hidden-output.mmd)):

```mmd
railroad-abnf-beta
  %%{!style}%% r=(":"
)%%{!#}%% ;
```

入力（エスケープ表記）:
`"railroad-peg-beta\n%%{!style}%% r<-(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/peg-leading-hidden-output.mmd](../tests/fixtures/railroad/semicolons/peg-leading-hidden-output.mmd)):

```mmd
railroad-peg-beta
  %%{!style}%% r<-(":"
)%%{!#}%% ;
```

入力（エスケープ表記）:
`"railroad-beta\n/*x\nstyle*/r=terminal(\":\"\n)/*#*/;"`。

出力
([semicolons/ir-leading-multiline-c-output.mmd](../tests/fixtures/railroad/semicolons/ir-leading-multiline-c-output.mmd)):

```mmd
railroad-beta
  /*x
style*/r=terminal(":"
)/*#*/;
```

入力（エスケープ表記）: `"railroad-beta /*style*/r=terminal(\":\"\n)/*#*/;"`。

出力
([semicolons/ir-header-leading-c-output.mmd](../tests/fixtures/railroad/semicolons/ir-header-leading-c-output.mmd)):

```mmd
railroad-beta /*style*/r=terminal(":"
)/*#*/;
```

入力（エスケープ表記）:
`"railroad-beta\na=terminal(\"style\");b=terminal(\":\"\n)/*#*/;"`。

出力
([semicolons/ir-after-rule-output.mmd](../tests/fixtures/railroad/semicolons/ir-after-rule-output.mmd)):

```mmd
railroad-beta
  a=terminal("style");b=terminal(":"
)/*#*/;
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\naccDescr{style} b=(\":\"\n)/*#*/;"`。

出力
([semicolons/ebnf-after-description-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-after-description-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr{style} b=(":"
)/*#*/;
```

入力（エスケープ表記）:
`"railroad-abnf-beta\naccDescr{style} b=(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/abnf-after-description-output.mmd](../tests/fixtures/railroad/semicolons/abnf-after-description-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr{style} b=(":"
)%%{!#}%% ;
```

入力（エスケープ表記）:
`"railroad-peg-beta\nstyle<-\"a\";b<-(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/peg-after-rule-name-output.mmd](../tests/fixtures/railroad/semicolons/peg-after-rule-name-output.mmd)):

```mmd
railroad-peg-beta
  style<-"a";b<-(":"
)%%{!#}%% ;
```

入力（エスケープ表記）:
`"railroad-beta\naccDescr{style} %%{!keep}%% b=terminal(\":\"\n)/*#*/;"`。

出力
([semicolons/ir-kept-description-hidden-output.mmd](../tests/fixtures/railroad/semicolons/ir-kept-description-hidden-output.mmd)):

```mmd
railroad-beta
  accDescr{style} %%{!keep}%% b=terminal(":"
)/*#*/;
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\na=\"x\";(*classDef*) b=(\":\"\n)(*#*);"`。

出力
([semicolons/ebnf-comment-after-moved-rule-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-comment-after-moved-rule-output.mmd)):

```mmd
railroad-ebnf-beta
  a="x";(*classDef*) b=(":"
)(*#*);
```

入力（エスケープ表記）:
`"railroad-abnf-beta\n%%{style}%% b=(\":\"\n)%%{!#}%% ;"`。

出力
([semicolons/abnf-removed-directive-word-output.mmd](../tests/fixtures/railroad/semicolons/abnf-removed-directive-word-output.mmd)):

```mmd
railroad-abnf-beta
  %%{style}%% b = (":")%%{!#}%% ;
```

入力（エスケープ表記）:
`"railroad-peg-beta\nr<-(\"sty%%{wrap}%%le:\"\n)%%{!#}%% ;"`。

出力
([semicolons/peg-directive-split-style-output.mmd](../tests/fixtures/railroad/semicolons/peg-directive-split-style-output.mmd)):

```mmd
railroad-peg-beta
  r<-("sty%%{wrap}%%le:"
)%%{!#}%% ;
```

入力（エスケープ表記）: `"railroad-ebnf-beta\nr=?style:#?\n;"`。

出力
([semicolons/ebnf-terminator-after-hash-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-terminator-after-hash-output.mmd)):

```mmd
railroad-ebnf-beta
  r=?style:#?
;
```

入力（エスケープ表記）: `"railroad-beta\nstyle\n=terminal(\":#\");"`。

出力
([semicolons/ir-assignment-after-word-output.mmd](../tests/fixtures/railroad/semicolons/ir-assignment-after-word-output.mmd)):

```mmd
railroad-beta
  style
=terminal(":#");
```

入力（エスケープ表記）: `"railroad-abnf-beta\nstyle=(\":\" )%%{!#}%% ; c\n;"`。

出力
([semicolons/abnf-comment-marker-spaced-output.mmd](../tests/fixtures/railroad/semicolons/abnf-comment-marker-spaced-output.mmd)):

```mmd
railroad-abnf-beta
  style=(":" )%%{!#}%% ; c
;
```

入力（エスケープ表記）: `"railroad-abnf-beta\nstyle=(\":\"\n)%%{!#}%% ; c\n;"`。

出力
([semicolons/abnf-comment-marker-multiline-output.mmd](../tests/fixtures/railroad/semicolons/abnf-comment-marker-multiline-output.mmd)):

```mmd
railroad-abnf-beta
  style=(":"
)%%{!#}%% ; c
;
```

入力（エスケープ表記）:
`"railroad-beta\n  a=terminal( \"x\" );style=terminal( \"y\" );b=terminal( \"z\" );"`。

出力
([semicolons/ir-word-multiple-statements-output.mmd](../tests/fixtures/railroad/semicolons/ir-word-multiple-statements-output.mmd)):

```mmd
railroad-beta
  a=terminal( "x" );style=terminal( "y" );b=terminal( "z" );
```

入力（エスケープ表記）:
`"railroad-abnf-beta\n  accDescr{note} style=( \"x\" );"`。

出力
([semicolons/abnf-word-multiple-statements-output.mmd](../tests/fixtures/railroad/semicolons/abnf-word-multiple-statements-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr{note} style=( "x" );
```

入力（エスケープ表記）: `"railroad-peg-beta\n r<-( \"style\" );"`。

出力
([semicolons/peg-word-quoted-output.mmd](../tests/fixtures/railroad/semicolons/peg-word-quoted-output.mmd)):

```mmd
railroad-peg-beta
  r<-( "style" );
```

入力（エスケープ表記）: `"railroad-ebnf-beta\n myclassDef=( \"x\" );"`。

出力
([semicolons/ebnf-word-rule-name-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-word-rule-name-output.mmd)):

```mmd
railroad-ebnf-beta
  myclassDef=( "x" );
```

入力（エスケープ表記）:
`"railroad-beta\n   /*style*/  /*kept*/\nr=terminal( \"x\" );"`。

出力
([semicolons/ir-word-comment-line-output.mmd](../tests/fixtures/railroad/semicolons/ir-word-comment-line-output.mmd)):

```mmd
railroad-beta
  /*style*/  /*kept*/
  r = terminal("x");
```

入力（エスケープ表記）:
`"railroad-ebnf-beta\nr=( \"class%%{init:\n{}}%%Def\" );"`。

出力
([semicolons/ebnf-word-directive-lines-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-word-directive-lines-output.mmd)):

```mmd
railroad-ebnf-beta
  r=( "class%%{init:
{}}%%Def" );
```

入力（エスケープ表記）:
`"railroad-abnf-beta\na=(\n\"x\"\n);\nstyle=( \"y\" );\nb=(\n\"z\"\n);"`。

出力
([semicolons/abnf-word-neighbor-boundaries-output.mmd](../tests/fixtures/railroad/semicolons/abnf-word-neighbor-boundaries-output.mmd)):

```mmd
railroad-abnf-beta
  a = ("x");
  style=( "y" );
  b = ("z");
```

入力（エスケープ表記）: `"railroad-peg-beta\nr<-(\n\"classDef\"\n\"x\"\n);"`。

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
通常の空白だけの行を空にし、見出しと完結した構造の無害な ASCII 余白を除きます。
Prettier は空行を空にし、行末の空白とタブを除きます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、通常の空白だけの行を空にし、
見出しと完結した構造の後の無害な ASCII の余白を除く形を与えます。
値、コメント末尾、ディレクティブと隠れた形の内部、必要な閉じ記号余白、前置部分、
保護区間は各規則に従います。
ABNF の見かけの終端後の空白は無害と推測せず、
AST がコメントとして読んだ結果に従います。

[fixture: railroad/blank-lines/abnf-collapse]

[fixture: railroad/blank-lines/ebnf-collapse]

[fixture: railroad/blank-lines/ir-collapse]

[fixture: railroad/blank-lines/peg-collapse]

入力（エスケープ表記）:
`"\nrailroad-beta \t\n\n\nr=terminal(\"blank\"); \t\n\n \t\ns=terminal(\"tail\");\n\n"`。

出力
([blank-lines/ir-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/ir-collapse-output.mmd)):

```mmd
railroad-beta
  r = terminal("blank");

  s = terminal("tail");
```

入力（エスケープ表記）:
`"\nrailroad-ebnf-beta \t\n\n\nr=\"blank\"; \t\n\n\ns=\"tail\";\n\n"`。

出力
([blank-lines/ebnf-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/ebnf-collapse-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "blank";

  s = "tail";
```

入力（エスケープ表記）:
`"\nrailroad-abnf-beta \t\n\n\nr=\"blank\";\n\n \t\ns=\"tail\";\n\n"`。

出力
([blank-lines/abnf-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/abnf-collapse-output.mmd)):

```mmd
railroad-abnf-beta
  r = "blank";

  s = "tail";
```

入力（エスケープ表記）:
`"\nrailroad-peg-beta \t\n\n\nr<-\"blank\"; \t\n\n\ns<-\"tail\";\n\n"`。

出力
([blank-lines/peg-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/peg-collapse-output.mmd)):

```mmd
railroad-peg-beta
  r <- "blank";

  s <- "tail";
```

### frontmatter の YAML

安全な実際の先頭フロントマターだけを、
共有の保護条件付き YAML 整形処理へ渡します。
埋込みの効果を保ちながら Prettier が印字する YAML にするためです。
不正な YAML、字下げした囲み記号、閉じ記号余白、HTML 引用の危険がある形、
本文の整形で囲み記号が現れる形、保持前置部分の YAML は書かれたままにします。
字下げした囲み記号、整形で作ってしまう囲み記号の行、
HTML 引用の危険がある形が書かれたままなのは、
[フロントマター](./compatibility.ja.md#フロントマター)の理由によります。
整形する YAML は Prettier が YAML を印字するとおりで、
キーのコロンは `key: value` になります（規則 1）。
YAML の入れ子とブロックスカラーは、`tabWidth` 0 でも共有の正の最小幅を使います。
図固有の隠れた YAML は不透明なので、この経路へ渡しません。

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

入力（エスケープ表記）:
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

入力（エスケープ表記）:
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

入力（エスケープ表記）:
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

入力（エスケープ表記）:
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

共有の埋め込み先方針に従い、物理 CR と CRLF を LF として読み、設定した LF、
CRLF、CR で出力します。
値、隠れたテキスト、フロントマターの内部も同じです。
先頭 BOM は埋め込み先の除去と復元の制限に従います。
LS、PS、NBSP、BOM は通常の図固有の隙間の空白にはしません。
文字列、special sequence、図固有の行コメントが所有するものは保ちます。
mermaid.js の Db は、文字列の値に U+2028、U+2029、NBSP、BOM を含めます。
通常の空白や LF への置き換えは値を変え、
空白とタブの連なりの例外にも含まれないため、文字列ではこれらの文字を保ちます。
共有の共通値は、記法で定義された空白を両端から除きます。
Unicode の区切り文字を構造上の改行へ変えず、図固有の所有関係に従うためです。
非空の 1 行の accessibility 値では、キーのコロンの後に空白 1 つを置き、
行末の空白とタブを除く形を、
[規則 1](./printed-form.ja.md#1-記号の横の空白)が与えます。
そのため、値の末尾の余白は除かれます。

[corpus fixture: railroad/ebnf-line-string-values]
[corpus fixture: railroad/ir-space-string-values]

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

入力（エスケープ表記）:
`"railroad-ebnf-beta\r\nr=? cr\r\n continuation ?;\r\n"`。

出力（エスケープ表記）: `"railroad-ebnf-beta\n  r = ? cr\n continuation ?;\n"`。

### 出現順

規則、選択肢、重複名、前方や未定義の参照、
メタデータの繰返しと空のリセットを含め、すべての出現と順序を保ちます。
呼び出し、グループ、繰り返し、先読み条件の適用先全体を AST から残します。
並べ替えや、上書きされたメタデータと空のメタデータの削除で、
Db が変わることがあります。
正規化された単一要素の形が等しくても、
Db から原文を再構築する理由にはなりません。

[fixture: railroad/source-order/abnf-duplicates]

[fixture: railroad/source-order/ebnf-duplicates]

[fixture: railroad/source-order/ir-duplicates]

[fixture: railroad/source-order/peg-duplicates]

入力（エスケープ表記）:
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

入力（エスケープ表記）:
`"railroad-ebnf-beta\naccDescr {old}\naccDescr {}\nz=later;a=\"first\";a=\"second\";later=\"end\";"`。

出力
([source-order/ebnf-duplicates-output.mmd](../tests/fixtures/railroad/source-order/ebnf-duplicates-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr: old
  accDescr {}
  z = later;
  a = "first";
  a = "second";
  later = "end";
```

入力（エスケープ表記）:
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

入力（エスケープ表記）:
`"railroad-peg-beta\naccDescr {old}\naccDescr {}\nz<-later;a<-\"first\";a<-\"second\";later<-\"end\";"`。

出力
([source-order/peg-duplicates-output.mmd](../tests/fixtures/railroad/source-order/peg-duplicates-output.mmd)):

```mmd
railroad-peg-beta
  accDescr: old
  accDescr {}
  z <- later;
  a <- "first";
  a <- "second";
  later <- "end";
```

### 末尾改行

通常の受理本文は設定した末尾改行1個で終えます。
空本文、規則、メタデータ、コメント、閉じた隠れた形が対象です。
ファイル末尾を揃えるためです。
Prettier は通常の JavaScript、CSS、YAML、Markdown の末尾に、
空行を置かず改行を 1 つ印字します。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
通常の railroad 本文にも同じ末尾を与えます。
EOF まで達する `Root` ディレクティブ、必要な隠れた形の余白、
保護された末尾と前置部分は共有の例外に従います。
ABNF の終端後に空白は加えません。

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

[corpus fixture: railroad/abnf-tail-percent-comment]

[corpus fixture: railroad/peg-tail-comment]

[corpus fixture: railroad/ir-tail-directive]

[corpus fixture: railroad/ebnf-tail-directive]

[corpus fixture: railroad/abnf-tail-directive]

[corpus fixture: railroad/peg-tail-directive]

入力（エスケープ表記）: `"railroad-beta \t"`。

出力
([final-newline/ir-empty-output.mmd](../tests/fixtures/railroad/final-newline/ir-empty-output.mmd)):

```mmd
railroad-beta
```

入力（エスケープ表記）: `"railroad-ebnf-beta \t"`。

出力
([final-newline/ebnf-empty-output.mmd](../tests/fixtures/railroad/final-newline/ebnf-empty-output.mmd)):

```mmd
railroad-ebnf-beta
```

入力（エスケープ表記）: `"railroad-abnf-beta \t"`。

出力
([final-newline/abnf-empty-output.mmd](../tests/fixtures/railroad/final-newline/abnf-empty-output.mmd)):

```mmd
railroad-abnf-beta
```

入力（エスケープ表記）: `"railroad-peg-beta \t"`。

出力
([final-newline/peg-empty-output.mmd](../tests/fixtures/railroad/final-newline/peg-empty-output.mmd)):

```mmd
railroad-peg-beta
```

### 仕様による読み

既存の6差異に従います。
directive-as-token-boundary、ignored-semicolon-as-token-boundary、
html-tag-in-frontmatter、embedded-data-opaque、bare-percent-line-before-header、
c4-keyword-anywhere です。
railroad には不透明比較から除く受理設定キーがありません。
空文字列は値で、空呼び出しは拒否します。
素の mermaid.js の拒否に素の mermaid.js の Db はないため、
仕様で受理する入力は記録された読み、原文の保持、冪等性を別に検査します。
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

共有の Markdown 経路で、外側の字下げを除去した本文に同じ規則を適用します。
埋め込み先が囲み記号、リスト、引用の列を与え、
最終本文行の余白を除く場合があります。
最後の隠れた形の余白も対象ですが、内部の隠れた形の境界は保ちます。
その後の空行は [hidden の境界](#hidden-の境界)の規則で印字します。
埋め込み先の枠の列を railroad の字下げと混同しないよう、
埋め込み先全体の出力と本文の Db 保持を別に検査します。

[test: railroad Markdown: ir-top-level]

[test: railroad Markdown: ir-wrapped-list]

[test: railroad Markdown: ir-wrapped-comment]

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
