# Railroad formatting rules

Japanese version: [railroad.ja.md](./railroad.ja.md)

The printer follows the 32 adopted items for IR, EBNF, ABNF and PEG using one
authored [railroad tree](../../spec/docs/ast/railroad.md) and the shared
flat-body printer. Root.diagramType selects the dialect in the parser; the
printer uses the resulting nodes and tokens without another dialect classifier.
Each rule explains its choice.
[Compatibility](./compatibility.md#railroad-dialects-and-authored-values)
records preserved text and differences from mermaid.js.

## Rules

### Header

Print the authored header at column one and put an ordinary first statement on
the next line, making the dialect easy to find. IR keeps `railroad-beta`, EBNF
`railroad-ebnf-beta`, ABNF `railroad-abnf-beta`, and PEG `railroad-peg-beta`.
Add no colon or flags. Hidden forms, global trivia and protected semicolon
segments retain their shared boundaries; an empty body stays empty.

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

Input (escaped): `"railroad-beta%% heading\nr=terminal(\"x\");"`.

Output
([header/ir-comment-output.mmd](../tests/fixtures/railroad/header/ir-comment-output.mmd)):

```mmd
railroad-beta%% heading
  r = terminal("x");
```

Input (escaped): `"railroad-ebnf-beta%%{wrap}%% r=\"x\";"`.

Output
([header/ebnf-global-output.mmd](../tests/fixtures/railroad/header/ebnf-global-output.mmd)):

```mmd
railroad-ebnf-beta
  %%{wrap}%% r = "x";
```

Input (escaped): `"railroad-abnf-beta%%{!heading}%%\nr=\"x\";"`.

Output
([header/abnf-hidden-output.mmd](../tests/fixtures/railroad/header/abnf-hidden-output.mmd)):

```mmd
railroad-abnf-beta%%{!heading}%%
  r = "x";
```

Input (escaped): `"railroad-peg-beta%%{!heading}%%\n\nr<-\"x\";"`.

Output
([header/peg-hidden-spare-output.mmd](../tests/fixtures/railroad/header/peg-hidden-spare-output.mmd)):

```mmd
railroad-peg-beta%%{!heading}%%
  r <- "x";
```

### Indentation

Use the shared flat-body printer for one configured step before ordinary rules,
metadata, standalone comments and Root directives. The default is two spaces;
tabWidth four uses four and tabWidth zero uses zero because columns have no
grammatical meaning. useTabs uses one tab, even at width zero. Structural
continuation lines and standalone trivia inside a rule use two steps; a separate
structural closer or terminator aligns with the statement. Written value
columns, hidden interiors and retained prefixes keep their own columns.
Semicolon-protected segments start at one body step, like other flat diagrams;
their later lines keep their written columns because these belong to the
protected text.

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

Input (escaped): `"railroad-beta\n r=terminal(\"indent\");"`.

Output
([indentation/ir-default-output.mmd](../tests/fixtures/railroad/indentation/ir-default-output.mmd)):

```mmd
railroad-beta
  r = terminal("indent");
```

Input (escaped): `"railroad-ebnf-beta\n r=\"indent\";"`.

Output
([indentation/ebnf-default-output.mmd](../tests/fixtures/railroad/indentation/ebnf-default-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "indent";
```

Input (escaped): `"railroad-abnf-beta\n r=\"indent\";"`.

Output
([indentation/abnf-default-output.mmd](../tests/fixtures/railroad/indentation/abnf-default-output.mmd)):

```mmd
railroad-abnf-beta
  r = "indent";
```

Input (escaped): `"railroad-peg-beta\n r<-\"indent\";"`.

Output
([indentation/peg-default-output.mmd](../tests/fixtures/railroad/indentation/peg-default-output.mmd)):

```mmd
railroad-peg-beta
  r <- "indent";
```

### Statements one per line

Print each ordinary rule on its own line and attach its required final `;`
without an ordinary preceding space. This exposes rule boundaries without
changing their syntax. All four dialects require the last terminator too. ABNF
terminators must be followed immediately by LF or EOF: `; note` is a comment and
cannot replace a terminator. Keep such a comment and the real terminator on
their original sides of the line break. Shared semicolon protection takes
precedence.

[fixture: railroad/statements-one-per-line/abnf-terminator]

[fixture: railroad/statements-one-per-line/abnf-terminators]

[fixture: railroad/statements-one-per-line/ebnf-rules]

[fixture: railroad/statements-one-per-line/ebnf-terminator]

[fixture: railroad/statements-one-per-line/ir-rules]

[fixture: railroad/statements-one-per-line/ir-terminator]

[fixture: railroad/statements-one-per-line/peg-rules]

[fixture: railroad/statements-one-per-line/peg-terminator]

Input (escaped): `"railroad-beta a=terminal(\"first\");b=nonterminal(\"a\");"`.

Output
([statements-one-per-line/ir-rules-output.mmd](../tests/fixtures/railroad/statements-one-per-line/ir-rules-output.mmd)):

```mmd
railroad-beta
  a = terminal("first");
  b = nonterminal("a");
```

Input (escaped): `"railroad-ebnf-beta a=\"first\";b::=a;"`.

Output
([statements-one-per-line/ebnf-rules-output.mmd](../tests/fixtures/railroad/statements-one-per-line/ebnf-rules-output.mmd)):

```mmd
railroad-ebnf-beta
  a = "first";
  b ::= a;
```

Input (escaped): `"railroad-abnf-beta\nr=\"terminator\" \t;"`.

Output
([statements-one-per-line/abnf-terminator-output.mmd](../tests/fixtures/railroad/statements-one-per-line/abnf-terminator-output.mmd)):

```mmd
railroad-abnf-beta
  r = "terminator";
```

Input (escaped): `"railroad-peg-beta a<-\"first\";b<-a;"`.

Output
([statements-one-per-line/peg-rules-output.mmd](../tests/fixtures/railroad/statements-one-per-line/peg-rules-output.mmd)):

```mmd
railroad-peg-beta
  a <- "first";
  b <- a;
```

### Assignment

Put one ordinary space on either side of the assignment, without aligning names.
IR and ABNF keep `=`, EBNF keeps each authored `=` or `::=`, and PEG keeps `<-`.
Both EBNF forms have the same Db, but replacing an authored delimiter adds no
readability. Compound delimiters remain whole tokens.

[fixture: railroad/assignment/abnf-spaces]

[fixture: railroad/assignment/ebnf-spellings]

[fixture: railroad/assignment/ir-spaces]

[fixture: railroad/assignment/peg-spaces]

Input (escaped):
`"railroad-beta\nlongName\t=\tterminal(\"assignment\");s=terminal(\"short\");"`.

Output
([assignment/ir-spaces-output.mmd](../tests/fixtures/railroad/assignment/ir-spaces-output.mmd)):

```mmd
railroad-beta
  longName = terminal("assignment");
  s = terminal("short");
```

Input (escaped):
`"railroad-ebnf-beta\nlongName::=\"assignment\";s =\"short\";"`.

Output
([assignment/ebnf-spellings-output.mmd](../tests/fixtures/railroad/assignment/ebnf-spellings-output.mmd)):

```mmd
railroad-ebnf-beta
  longName ::= "assignment";
  s = "short";
```

Input (escaped):
`"railroad-abnf-beta\nlongName\t=\t\"assignment\";\ns=\"short\";"`.

Output
([assignment/abnf-spaces-output.mmd](../tests/fixtures/railroad/assignment/abnf-spaces-output.mmd)):

```mmd
railroad-abnf-beta
  longName = "assignment";
  s = "short";
```

Input (escaped):
`"railroad-peg-beta\nlongName\t<-\t\"assignment\";s<-\"short\";"`.

Output
([assignment/peg-spaces-output.mmd](../tests/fixtures/railroad/assignment/peg-spaces-output.mmd)):

```mmd
railroad-peg-beta
  longName <- "assignment";
  s <- "short";
```

### Choices

EBNF bars use `a | b`; ABNF and PEG slashes use `a / b`. One ordinary space on
each side makes the alternatives visible. Keep their order and hierarchy; IR
choice calls follow Calls.

[fixture: railroad/choices/abnf-slashes]

[fixture: railroad/choices/ebnf-bars]

[fixture: railroad/choices/peg-slashes]

Input (escaped): `"railroad-ebnf-beta\nr=\"red\"|\"green\"\t|\t\"violet\";"`.

Output
([choices/ebnf-bars-output.mmd](../tests/fixtures/railroad/choices/ebnf-bars-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "red" | "green" | "violet";
```

Input (escaped): `"railroad-abnf-beta\nr=\"red\"/\"green\"\t/\t\"violet\";"`.

Output
([choices/abnf-slashes-output.mmd](../tests/fixtures/railroad/choices/abnf-slashes-output.mmd)):

```mmd
railroad-abnf-beta
  r = "red" / "green" / "violet";
```

Input (escaped): `"railroad-peg-beta\nr<-\"red\"/\"green\"\t/\t\"violet\";"`.

Output
([choices/peg-slashes-output.mmd](../tests/fixtures/railroad/choices/peg-slashes-output.mmd)):

```mmd
railroad-peg-beta
  r <- "red" / "green" / "violet";
```

### Ebnf sequences

Keep the presence of each optional comma at each sequence boundary. A comma has
no ordinary space before it and one after it; adjacency has one space. Mixed
comma and adjacency forms stay mixed. Adding or removing commas can keep the Db,
but loses the authored punctuation.

[fixture: railroad/ebnf-sequences/adjacency]

[fixture: railroad/ebnf-sequences/commas]

[fixture: railroad/ebnf-sequences/mixed]

Input (escaped): `"railroad-ebnf-beta\nr=first\tsecond;"`.

Output
([ebnf-sequences/adjacency-output.mmd](../tests/fixtures/railroad/ebnf-sequences/adjacency-output.mmd)):

```mmd
railroad-ebnf-beta
  r = first second;
```

### Sequences

Separate adjacent ABNF or PEG sequence members with one ordinary space,
including strings and groups that originally touched. This distinguishes members
and prevents separate names from merging. Add no comma.

[fixture: railroad/sequences/abnf-members]

[fixture: railroad/sequences/abnf-names]

[fixture: railroad/sequences/peg-members]

[fixture: railroad/sequences/peg-names]

Input (escaped): `"railroad-abnf-beta\nr=\"a\"\"b\"(ref)[\"last\"]%x44;"`.

Output
([sequences/abnf-members-output.mmd](../tests/fixtures/railroad/sequences/abnf-members-output.mmd)):

```mmd
railroad-abnf-beta
  r = "a" "b" (ref) ["last"] %x44;
```

Input (escaped): `"railroad-peg-beta\nr<-\"a\"\"b\"(ref).;"`.

Output
([sequences/peg-members-output.mmd](../tests/fixtures/railroad/sequences/peg-members-output.mmd)):

```mmd
railroad-peg-beta
  r <- "a" "b" (ref) .;
```

### Groups

Compact ordinary gaps inside EBNF `(expr)`, `[expr]` and `{expr}`, ABNF `(expr)`
and `[expr]`, and PEG `(expr)`. Keep every delimiter, including nested and
singleton groups. This chooses tight inner edges while preserving the source
structure even where removing a group would keep the Db.

[fixture: railroad/groups/abnf-delimiters]

[fixture: railroad/groups/ebnf-delimiters]

[fixture: railroad/groups/peg-delimiters]

Input (escaped):
`"railroad-ebnf-beta\nr=( ( \"group\" ) ) [ \"optional\" ] { \"repeat\" };"`.

Output
([groups/ebnf-delimiters-output.mmd](../tests/fixtures/railroad/groups/ebnf-delimiters-output.mmd)):

```mmd
railroad-ebnf-beta
  r = (("group")) ["optional"] {"repeat"};
```

Input (escaped): `"railroad-abnf-beta\nr=( ( \"group\" ) ) [ \"optional\" ];"`.

Output
([groups/abnf-delimiters-output.mmd](../tests/fixtures/railroad/groups/abnf-delimiters-output.mmd)):

```mmd
railroad-abnf-beta
  r = (("group")) ["optional"];
```

Input (escaped): `"railroad-peg-beta\nr<-( ( \"group\" ) );"`.

Output
([groups/peg-delimiters-output.mmd](../tests/fixtures/railroad/groups/peg-delimiters-output.mmd)):

```mmd
railroad-peg-beta
  r <- (("group"));
```

### Postfixes

Attach AST postfix `?`, `*` and `+` to their operand in EBNF and PEG. Keep the
EBNF chain order and the single PEG suffix. EBNF special-sequence priority is
already represented by the AST: question marks inside its raw leaf are not
reinterpreted as postfixes. Attached operators make their scope clear without
replacing them with calls or groups.

[fixture: railroad/postfixes/ebnf-chain]

[fixture: railroad/postfixes/ebnf-question]

[fixture: railroad/postfixes/ebnf-special-priority]

[fixture: railroad/postfixes/peg-suffixes]

Input (escaped): `"railroad-ebnf-beta\nr=\"chain\" * + [\"optional\"] ?;"`.

Output
([postfixes/ebnf-chain-output.mmd](../tests/fixtures/railroad/postfixes/ebnf-chain-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "chain"*+ ["optional"]?;
```

Input (escaped): `"railroad-peg-beta\nr<-\"optional\" ? \"repeat\" * (ref) +;"`.

Output
([postfixes/peg-suffixes-output.mmd](../tests/fixtures/railroad/postfixes/peg-suffixes-output.mmd)):

```mmd
railroad-peg-beta
  r <- "optional"? "repeat"* (ref)+;
```

### Predicates

PEG predicates print `&expr` and `!expr`, retaining the entire suffix operand.
Keep groups, postfixes and nested predicates inside groups. Tight prefix spacing
shows the operand; the Db label is not a replacement expression.

[fixture: railroad/predicates/peg-nested]

[fixture: railroad/predicates/peg-operands]

Input (escaped): `"railroad-peg-beta\nr<- & ( ! \"inner\" ) \"tail\";"`.

Output
([predicates/peg-nested-output.mmd](../tests/fixtures/railroad/predicates/peg-nested-output.mmd)):

```mmd
railroad-peg-beta
  r <- &(!"inner") "tail";
```

### Repeats

ABNF retains every count and star as written, including leading zeroes, exact
counts, omitted lower or upper bounds, zero, optional bounds and large integers.
Compact only the ordinary gap between a complete repeat and its primary. Do not
fill omitted bounds or replace the repeat with an optional group: Db equality
does not justify losing the chosen form or reprinting rounded numbers.

[fixture: railroad/repeats/abnf-large]

[fixture: railroad/repeats/abnf-spellings]

[fixture: railroad/repeats/abnf-zero]

Input (escaped): `"railroad-abnf-beta\nr=9007199254740993 \"large\";"`.

Output
([repeats/abnf-large-output.mmd](../tests/fixtures/railroad/repeats/abnf-large-output.mmd)):

```mmd
railroad-abnf-beta
  r = 9007199254740993"large";
```

### Numeric values

ABNF numeric values remain one source span, including base-letter case, digits,
leading zeroes, dots and hyphens, even when digits do not fit the stated base.
The published terminal is raw text, so normalization can change the Db. A
trailing reference outside the span remains a separate sequence member, as in
`%x42 Z`.

[fixture: railroad/numeric-values/abnf-spellings]

[fixture: railroad/numeric-values/abnf-suffix]

Input (escaped): `"railroad-abnf-beta\nr=%X041.4A-4f %DFF %b2 %B001;"`.

Output
([numeric-values/abnf-spellings-output.mmd](../tests/fixtures/railroad/numeric-values/abnf-spellings-output.mmd)):

```mmd
railroad-abnf-beta
  r = %X041.4A-4f %DFF %b2 %B001;
```

### Calls

IR prints its eight constructors as `name(...)`: sequence, choice, optional,
oneOrMore, zeroOrMore, terminal, nonterminal and special. Ordinary gaps before
`(` and at the inner edges are empty; argument commas have no space before and
one after. Retain empty quoted arguments, nested calls and singleton
sequence/choice calls. Collapsing a singleton can keep the Db but loses an
authored call; trailing commas are not added.

[fixture: railroad/calls/ir-all]

[fixture: railroad/calls/ir-singletons]

[corpus fixture: railroad/ir-native-ownership]

[corpus fixture: railroad/ir-choice-native-ownership]

[corpus fixture: railroad/ir-keywords-all-calls]

Input (escaped):
`"railroad-beta\nr=sequence ( terminal ( \"first\" ) , choice ( special ( \"note\" ),nonterminal ( \"r\" ) ) , optional ( terminal ( \"\" ) ) , oneOrMore (terminal(\"many\")),zeroOrMore (terminal(\"any\")) );"`.

Output
([calls/ir-all-output.mmd](../tests/fixtures/railroad/calls/ir-all-output.mmd)):

```mmd
railroad-beta
  r = sequence(terminal("first"), choice(special("note"), nonterminal("r")), optional(terminal("")), oneOrMore(terminal("many")), zeroOrMore(terminal("any")));
```

### Exceptions

EBNF exception `-` has one ordinary space on each side. Preserve left
association and the right primary. A hyphen already inside an Identifier stays
there. This spacing is necessary because `left-right` names one reference while
`left - right` is an exception and has a different Db.

[fixture: railroad/exceptions/ebnf-hyphenated-name]

[fixture: railroad/exceptions/ebnf-left-fold]

Input (escaped): `"railroad-ebnf-beta\nr=left-right;\n"`.

Output
([exceptions/ebnf-hyphenated-name-output.mmd](../tests/fixtures/railroad/exceptions/ebnf-hyphenated-name-output.mmd)):

```mmd
railroad-ebnf-beta
  r = left-right;
```

### Special sequences

Keep the entire EBNF special-sequence source span, including both question
marks, exterior and internal whitespace, quotes, backslashes and physical
continuation columns. Trimming just its edges may keep the Db, but preserving
the authored text avoids a second lexical interpretation; collapsing internal
whitespace can change the Db.

[fixture: railroad/special-sequences/ebnf-content]

[fixture: railroad/special-sequences/ebnf-lines]

Input (escaped): `"railroad-ebnf-beta\nr=?  first  second\t ?;"`.

Output
([special-sequences/ebnf-content-output.mmd](../tests/fixtures/railroad/special-sequences/ebnf-content-output.mmd)):

```mmd
railroad-ebnf-beta
  r = ?  first  second	 ?;
```

### Quotes

Keep StringLiteral source spans unchanged: quotes, escapes, empty and
whitespace-only strings, internal padding, HTML, entities and
hidden/comment-looking text. singleQuote does not rewrite these values. IR, EBNF
and PEG allow both quote forms and backslash escapes; ABNF allows double quotes
only and treats backslash as ordinary text. Requoting adds no formatting
benefit, while trimming content or using the wrong escape model changes the Db.

[fixture: railroad/quotes/abnf-backslash]

[fixture: railroad/quotes/abnf-empty-and-text]

[fixture: railroad/quotes/ebnf-empty-and-text]

[fixture: railroad/quotes/ebnf-escape]

[fixture: railroad/quotes/ir-empty-and-text]

[fixture: railroad/quotes/ir-escape]

[fixture: railroad/quotes/peg-empty-and-text]

[fixture: railroad/quotes/peg-escape]

Input (escaped):
`"railroad-beta\nr=sequence ( terminal ( \"\" ),terminal ( \" \t \" ), nonterminal ( '' ),special(\"%%literal --- <b> plain\"));"`.

Output
([quotes/ir-empty-and-text-output.mmd](../tests/fixtures/railroad/quotes/ir-empty-and-text-output.mmd)):

```mmd
railroad-beta
  r = sequence(terminal(""), terminal(" 	 "), nonterminal(''), special("%%literal --- <b> plain"));
```

Input (escaped):
`"railroad-ebnf-beta\nr=\"\" , '' \" \t \" \"%%literal --- <b> plain\";"`.

Output
([quotes/ebnf-empty-and-text-output.mmd](../tests/fixtures/railroad/quotes/ebnf-empty-and-text-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "", '' " 	 " "%%literal --- <b> plain";
```

Input (escaped): `"railroad-abnf-beta\nr=\"q\\n\\t\\q\";"`.

Options: `{"singleQuote":true}`.

Output
([quotes/abnf-backslash-output.mmd](../tests/fixtures/railroad/quotes/abnf-backslash-output.mmd)):

```mmd
railroad-abnf-beta
  r = "q\n\t\q";
```

Input (escaped):
`"railroad-peg-beta\nr<-\"\" '' \" \t \" \"%%literal --- <b> plain\";"`.

Output
([quotes/peg-empty-and-text-output.mmd](../tests/fixtures/railroad/quotes/peg-empty-and-text-output.mmd)):

```mmd
railroad-peg-beta
  r <- "" '' " 	 " "%%literal --- <b> plain";
```

### Long lines

Do not wrap rules at printWidth. Structural wrapping can have the same Db in all
four dialects; the chosen flat form follows the other flat diagrams and avoids
extra wrapping choices across values, hidden forms, trivia and protected
segments.

[fixture: railroad/long-lines/abnf-width]

[fixture: railroad/long-lines/ebnf-width]

[fixture: railroad/long-lines/ir-width]

[fixture: railroad/long-lines/peg-width]

Input (escaped):
`"railroad-beta\nr=sequence(terminal(\"first long terminal\"),choice(terminal(\"second long terminal\"),nonterminal(\"reference\")));"`.

Options: `{"printWidth":20}`.

Output
([long-lines/ir-width-output.mmd](../tests/fixtures/railroad/long-lines/ir-width-output.mmd)):

```mmd
railroad-beta
  r = sequence(terminal("first long terminal"), choice(terminal("second long terminal"), nonterminal("reference")));
```

Input (escaped):
`"railroad-ebnf-beta\nr=(\"first long terminal\",reference)|[\"second long terminal\"] {\"third long terminal\"};"`.

Options: `{"printWidth":20}`.

Output
([long-lines/ebnf-width-output.mmd](../tests/fixtures/railroad/long-lines/ebnf-width-output.mmd)):

```mmd
railroad-ebnf-beta
  r = ("first long terminal", reference) | ["second long terminal"] {"third long terminal"};
```

Input (escaped):
`"railroad-abnf-beta\nr=2*4(\"first long terminal\"/reference)[\"second long terminal\"];"`.

Options: `{"printWidth":20}`.

Output
([long-lines/abnf-width-output.mmd](../tests/fixtures/railroad/long-lines/abnf-width-output.mmd)):

```mmd
railroad-abnf-beta
  r = 2*4("first long terminal" / reference) ["second long terminal"];
```

Input (escaped):
`"railroad-peg-beta\nr<-&(\"first long terminal\"/reference)+!.\"second long terminal\";"`.

Options: `{"printWidth":20}`.

Output
([long-lines/peg-width-output.mmd](../tests/fixtures/railroad/long-lines/peg-width-output.mmd)):

```mmd
railroad-peg-beta
  r <- &("first long terminal" / reference)+ !. "second long terminal";
```

### Component newlines

Join ordinary CR/LF gaps where the grammar reads padding: IR
constructor/open/argument/comma/close; EBNF
assignment/choice/sequence/group/exception/postfix; ABNF
assignment/choice/sequence/complete-repeat/primary/group; PEG
assignment/choice/sequence/prefix/suffix/group. Use each gap's ordinary spacing
rule. Do not split names, compound assignments, repeat components or numeric
values. Comments, directives, hidden boundaries and semicolon protection keep
their original breaks, since joining them can change acceptance or the Db.

[fixture: railroad/component-newlines/abnf-components]

[fixture: railroad/component-newlines/ebnf-components]

[fixture: railroad/component-newlines/ir-components]

[fixture: railroad/component-newlines/peg-components]

Input (escaped):
`"railroad-beta\nr\n=\nsequence\n(terminal\n(\n\"joined\"\n)\n,\nterminal(\"tail\")\n)\n;"`.

Output
([component-newlines/ir-components-output.mmd](../tests/fixtures/railroad/component-newlines/ir-components-output.mmd)):

```mmd
railroad-beta
  r = sequence(terminal("joined"), terminal("tail"));
```

Input (escaped):
`"railroad-ebnf-beta\nr\n::=\n(\n\"joined\"\n,\nother\n)\n-\n\"except\"\n+\n|\n[\n\"tail\"\n]\n;"`.

Output
([component-newlines/ebnf-components-output.mmd](../tests/fixtures/railroad/component-newlines/ebnf-components-output.mmd)):

```mmd
railroad-ebnf-beta
  r ::= ("joined", other) - "except"+ | ["tail"];
```

Input (escaped):
`"railroad-abnf-beta\nr\n=\n2*4\n(\n\"joined\"\n/\nother\n)\n[\n\"tail\"\n]\n;"`.

Output
([component-newlines/abnf-components-output.mmd](../tests/fixtures/railroad/component-newlines/abnf-components-output.mmd)):

```mmd
railroad-abnf-beta
  r = 2*4("joined" / other) ["tail"];
```

Input (escaped):
`"railroad-peg-beta\nr\n<-\n&\n(\n\"joined\"\n/\nother\n)\n+\n!\n.\n;"`.

Output
([component-newlines/peg-components-output.mmd](../tests/fixtures/railroad/component-newlines/peg-components-output.mmd)):

```mmd
railroad-peg-beta
  r <- &("joined" / other)+ !.;
```

### Multiline values

Keep physical newlines, internal blank lines and continuation columns inside
strings, EBNF special sequences and metadata blocks. Values are indivisible
atoms and gain no structural indentation on their later lines. Reflowing or
reindenting these contents can change the Db, including PEG predicate labels.
Description exterior edges and its separate closer use the shared description
rule.

[fixture: railroad/multiline-values/abnf-columns]

[fixture: railroad/multiline-values/ebnf-columns]

[fixture: railroad/multiline-values/ir-columns]

[fixture: railroad/multiline-values/peg-columns]

Input (escaped):
`"railroad-beta\nr=terminal(\"first\n   continuation\n\nlast\");"`.

Output
([multiline-values/ir-columns-output.mmd](../tests/fixtures/railroad/multiline-values/ir-columns-output.mmd)):

```mmd
railroad-beta
  r = terminal("first
   continuation

last");
```

Input (escaped): `"railroad-ebnf-beta\nr=\"first\n   continuation\n\nlast\";"`.

Output
([multiline-values/ebnf-columns-output.mmd](../tests/fixtures/railroad/multiline-values/ebnf-columns-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "first
   continuation

last";
```

Input (escaped): `"railroad-abnf-beta\nr=\"first\n   continuation\n\nlast\";"`.

Output
([multiline-values/abnf-columns-output.mmd](../tests/fixtures/railroad/multiline-values/abnf-columns-output.mmd)):

```mmd
railroad-abnf-beta
  r = "first
   continuation

last";
```

Input (escaped): `"railroad-peg-beta\nr<-&\"first\n   continuation\n\nlast\";"`.

Output
([multiline-values/peg-columns-output.mmd](../tests/fixtures/railroad/multiline-values/peg-columns-output.mmd)):

```mmd
railroad-peg-beta
  r <- &"first
   continuation

last";
```

### Title

Use the shared common-line layout: trim ordinary exterior whitespace around a
nonempty value and print `title value`; null or whitespace-only values print
bare `title`. Keep quote-looking content, escape spelling and internal
whitespace. Do not read a value from the next physical line. A bare title prefix
followed by a rule becomes two statements, keeping the rule out of the title.
The comparison Db omits body titles, which gives no permission to rewrite their
contents.

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

Input (escaped):
`"railroad-beta\ntitle\n%% next title\nr=terminal(\"bare title\");"`.

Output
([title/ir-next-line-output.mmd](../tests/fixtures/railroad/title/ir-next-line-output.mmd)):

```mmd
railroad-beta
  title
  %% next title
  r = terminal("bare title");
```

Input (escaped):
`"railroad-ebnf-beta\ntitle\n%% next title\nr=\"bare title\";"`.

Output
([title/ebnf-next-line-output.mmd](../tests/fixtures/railroad/title/ebnf-next-line-output.mmd)):

```mmd
railroad-ebnf-beta
  title
  %% next title
  r = "bare title";
```

Input (escaped): `"railroad-abnf-beta\ntitle\n%% next\nr=\"bare title\";"`.

Output
([title/abnf-next-line-output.mmd](../tests/fixtures/railroad/title/abnf-next-line-output.mmd)):

```mmd
railroad-abnf-beta
  title
  %% next
  r = "bare title";
```

Input (escaped):
`"railroad-peg-beta\ntitle\n%% next title\nr<-\"bare title\";"`.

Output
([title/peg-next-line-output.mmd](../tests/fixtures/railroad/title/peg-next-line-output.mmd)):

```mmd
railroad-peg-beta
  title
  %% next title
  r <- "bare title";
```

### Accessibility lines

Shared common-line spacing prints `accTitle: value` and `accDescr: value`, with
the colon attached to the keyword and one ordinary space before a nonempty
value. Empty values end at the colon. Trim only exterior value whitespace,
retaining internal text and brace-looking line values. Keep next-line values
separate. This gives the same compact, readable form as the other diagrams.

[fixture: railroad/accessibility-lines/abnf-empty]

[fixture: railroad/accessibility-lines/abnf-values]

[fixture: railroad/accessibility-lines/ebnf-empty]

[fixture: railroad/accessibility-lines/ebnf-values]

[fixture: railroad/accessibility-lines/ir-empty]

[fixture: railroad/accessibility-lines/ir-values]

[fixture: railroad/accessibility-lines/peg-empty]

[fixture: railroad/accessibility-lines/peg-values]

Input (escaped):
`"railroad-beta\naccTitle:\naccDescr:\nr=terminal(\"empty access\");"`.

Output
([accessibility-lines/ir-empty-output.mmd](../tests/fixtures/railroad/accessibility-lines/ir-empty-output.mmd)):

```mmd
railroad-beta
  accTitle:
  accDescr:
  r = terminal("empty access");
```

Input (escaped):
`"railroad-ebnf-beta\naccTitle: \naccDescr: {literal}\nr=\"empty access\";"`.

Output
([accessibility-lines/ebnf-empty-output.mmd](../tests/fixtures/railroad/accessibility-lines/ebnf-empty-output.mmd)):

```mmd
railroad-ebnf-beta
  accTitle:
  accDescr: {literal}
  r = "empty access";
```

Input (escaped):
`"railroad-abnf-beta\naccTitle: \n%% next\naccDescr:\nr=\"empty access\";"`.

Output
([accessibility-lines/abnf-empty-output.mmd](../tests/fixtures/railroad/accessibility-lines/abnf-empty-output.mmd)):

```mmd
railroad-abnf-beta
  accTitle:
  %% next
  accDescr:
  r = "empty access";
```

Input (escaped):
`"railroad-peg-beta\naccTitle:\naccDescr: \n%% next\nr<-\"empty access\";"`.

Output
([accessibility-lines/peg-empty-output.mmd](../tests/fixtures/railroad/accessibility-lines/peg-empty-output.mmd)):

```mmd
railroad-peg-beta
  accTitle:
  accDescr:
  %% next
  r <- "empty access";
```

### Description blocks

Use shared layoutDescriptionBlock through the common-description layout.
Whitespace-only interiors become `{}` because no content needs surrounding
padding. Keep `accDescr{` contact and leave `{Text}` tight; written exterior
spaces remain one space where present. Join a plain keyword-to-opener gap.
Preserve nonempty continuation columns and internal blank lines, and align a
separate closing brace with the statement. Comment/directive-only blocks retain
their contents through the shared fallback, rather than being emptied.

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

Input (escaped):
`"railroad-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr=terminal(\"block\");"`.

Output
([description-blocks/ir-edges-output.mmd](../tests/fixtures/railroad/description-blocks/ir-edges-output.mmd)):

```mmd
railroad-beta
  accDescr{Text}
  accDescr { Text }
  accDescr {}
  r = terminal("block");
```

Input (escaped):
`"railroad-ebnf-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr=\"block\";"`.

Output
([description-blocks/ebnf-edges-output.mmd](../tests/fixtures/railroad/description-blocks/ebnf-edges-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr{Text}
  accDescr { Text }
  accDescr {}
  r = "block";
```

Input (escaped):
`"railroad-abnf-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr=\"block\";"`.

Output
([description-blocks/abnf-edges-output.mmd](../tests/fixtures/railroad/description-blocks/abnf-edges-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr{Text}
  accDescr { Text }
  accDescr {}
  r = "block";
```

Input (escaped):
`"railroad-peg-beta\naccDescr{Text}\naccDescr { Text }\naccDescr { \n\t }\nr<-\"block\";"`.

Output
([description-blocks/peg-edges-output.mmd](../tests/fixtures/railroad/description-blocks/peg-edges-output.mmd)):

```mmd
railroad-peg-beta
  accDescr{Text}
  accDescr { Text }
  accDescr {}
  r <- "block";
```

### Comments

Standalone comments use one body step, or column one before the header. Inline
comments keep their side, line and touching/separated boundaries; ordinary
separated gaps become one space. Preserve marks, text, tails, block continuation
columns and source order. A line comment leaves its following operand or
terminator on the next line. Every dialect has `%%`; IR also has `/* */`, EBNF
`/* */` and `(* *)`, ABNF `;` line comments, and PEG `#` line comments. Bare
ABNF `;` is punctuation; `//` is not a native comment. Text owned by a value
stays in that value. These choices preserve ownership and prevent a line comment
from taking code.

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

Input (escaped): `"railroad-beta\nr=/*first\n second*/terminal(\"comment\");"`.

Output
([comments/ir-block-columns-output.mmd](../tests/fixtures/railroad/comments/ir-block-columns-output.mmd)):

```mmd
railroad-beta
  r =/*first
 second*/terminal("comment");
```

Input (escaped): `"railroad-ebnf-beta\nr=(*first\n second*)\"comment\";"`.

Output
([comments/ebnf-block-columns-output.mmd](../tests/fixtures/railroad/comments/ebnf-block-columns-output.mmd)):

```mmd
railroad-ebnf-beta
  r =(*first
 second*)"comment";
```

Input (escaped): `"railroad-abnf-beta\nr=\"comment\"; note\n;"`.

Output
([comments/abnf-before-terminator-output.mmd](../tests/fixtures/railroad/comments/abnf-before-terminator-output.mmd)):

```mmd
railroad-abnf-beta
  r = "comment"; note
  ;
```

Input (escaped): `"railroad-peg-beta\n#\nr<-\"bare comment\";#"`.

Output
([comments/peg-bare-output.mmd](../tests/fixtures/railroad/comments/peg-bare-output.mmd)):

```mmd
railroad-peg-beta
  #
  r <- "bare comment";#
```

### Global directives

Print every Root directive from its source span once at its owner position.
Within a printed line, keep whether each side touches or is separated. When
formatting splits units that were on the same line, a directive in their gap
moves with the following unit: its right boundary stays touching or separated,
while its left contact is broken. Use one body step for ordinary standalone
directives. Do not format their contents as JSON or collect them before the
header. Uniform added spaces can change strings, repeat components, numeric
values and predicate operands after common removal.

[fixture: railroad/global-directives/between-rules]

[fixture: railroad/global-directives/abnf-components]

[fixture: railroad/global-directives/abnf-standalone]

[fixture: railroad/global-directives/ebnf-contact]

[fixture: railroad/global-directives/ebnf-standalone]

[fixture: railroad/global-directives/ir-contact]

[fixture: railroad/global-directives/ir-standalone]

[fixture: railroad/global-directives/peg-contact]

[fixture: railroad/global-directives/peg-standalone]

Input (escaped):
`"railroad-beta\nr%%{wrap}%% = %%{wrap}%%terminal(\"a%%{wrap}%%last\");"`.

Output
([global-directives/ir-contact-output.mmd](../tests/fixtures/railroad/global-directives/ir-contact-output.mmd)):

```mmd
railroad-beta
  r%%{wrap}%% = %%{wrap}%%terminal("a%%{wrap}%%last");
```

Input (escaped): `"railroad-ebnf-beta\nr = %%{wrap}%% \"global\";"`.

Output
([global-directives/ebnf-contact-output.mmd](../tests/fixtures/railroad/global-directives/ebnf-contact-output.mmd)):

```mmd
railroad-ebnf-beta
  r = %%{wrap}%% "global";
```

Input (escaped):
`"railroad-abnf-beta\nr=2%%{wrap}%%*%%{wrap}%%4 %%{wrap}%% \"global\" %x4%%{wrap}%%1;"`.

Output
([global-directives/abnf-components-output.mmd](../tests/fixtures/railroad/global-directives/abnf-components-output.mmd)):

```mmd
railroad-abnf-beta
  r = 2%%{wrap}%%*%%{wrap}%%4 %%{wrap}%% "global" %x4%%{wrap}%%1;
```

Input (escaped): `"railroad-peg-beta\nr <- &%%{wrap}%% \"global\";"`.

Output
([global-directives/peg-contact-output.mmd](../tests/fixtures/railroad/global-directives/peg-contact-output.mmd)):

```mmd
railroad-peg-beta
  r <- &%%{wrap}%% "global";
```

### Hidden forms

Print each RailroadIgnoredText once, from its whole range at its AST owner.
Preserve rule gaps, all call and list-member gaps, groups, postfixes,
exceptions, repeat-primary gaps and predicate operands. Body openers may indent;
interiors and closers keep their columns. Do not YAML/JSON-format native forms
or print their trivia-stripped value field. Three fences can belong to one
hidden form; a failed directive opener can remain a percent comment. Preserve
these readings to avoid changing acceptance or moving opaque text.

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

Input (escaped):
`"railroad-beta\n%%{!unclosed note\nr=terminal(\"fallback\");"`.

Output
([hidden-forms/ir-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/ir-fallback-output.mmd)):

```mmd
railroad-beta
  %%{!unclosed note
  r = terminal("fallback");
```

Input (escaped): `"railroad-ebnf-beta\n%%{!unclosed note\nr=\"fallback\";"`.

Output
([hidden-forms/ebnf-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/ebnf-fallback-output.mmd)):

```mmd
railroad-ebnf-beta
  %%{!unclosed note
  r = "fallback";
```

Input (escaped): `"railroad-abnf-beta\n%%{!unclosed note\nr=\"fallback\";"`.

Output
([hidden-forms/abnf-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/abnf-fallback-output.mmd)):

```mmd
railroad-abnf-beta
  %%{!unclosed note
  r = "fallback";
```

Input (escaped): `"railroad-peg-beta\n%%{!unclosed note\nr<-\"fallback\";"`.

Output
([hidden-forms/peg-fallback-output.mmd](../tests/fixtures/railroad/hidden-forms/peg-fallback-output.mmd)):

```mmd
railroad-peg-beta
  %%{!unclosed note
  r <- "fallback";
```

### Hidden boundaries

Use shared hidden-gap protection for consumed LF outside node ranges, closing
space/tab and inline contact. Ordinary rules end in required `;`, so do not
impose another diagram's visible-EOL condition. The shared spare-LF rule applies
to body forms; only forms belonging to the header itself use the header-edge
exception. A statement originally on the header line retains its body boundary
when moved; shared kept-line rules can instead keep a hidden form and its
neighbors on that line. Keep both cases distinct.

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

Input (escaped):
`"railroad-beta accDescr{moved}\n%%{!after metadata}%%\n\nr=terminal(\"after moved\");"`.

Output
([hidden-boundaries/ir-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/ir-moved-before-hidden-output.mmd)):

```mmd
railroad-beta
  accDescr{moved}
  %%{!after metadata}%%

  r = terminal("after moved");
```

Input (escaped):
`"railroad-ebnf-beta accDescr{moved}\n%%{!after metadata}%%\n\nr=\"after moved\";"`.

Output
([hidden-boundaries/ebnf-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/ebnf-moved-before-hidden-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr{moved}
  %%{!after metadata}%%

  r = "after moved";
```

Input (escaped):
`"railroad-abnf-beta accDescr{moved}\n%%{!after metadata}%%\n\nr=\"after moved\";"`.

Output
([hidden-boundaries/abnf-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/abnf-moved-before-hidden-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr{moved}
  %%{!after metadata}%%

  r = "after moved";
```

Input (escaped):
`"railroad-peg-beta accDescr{moved}\n%%{!after metadata}%%\n\nr<-\"after moved\";"`.

Output
([hidden-boundaries/peg-moved-before-hidden-output.mmd](../tests/fixtures/railroad/hidden-boundaries/peg-moved-before-hidden-output.mmd)):

```mmd
railroad-peg-beta
  accDescr{moved}
  %%{!after metadata}%%

  r <- "after moved";
```

### Retained prefix

When textBeforeHeader is present, retain the complete prefix through the header
keyword: leading LF, passed bare trivia, retained YAML, second-scan forms and
real/hidden ordering. The shared keepsPrefix rule prevents ignored YAML from
becoming effective frontmatter and changing embedded title/configuration.
Ordinary comment-only prefixes still use root formatting.

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

Input (escaped):
`"\n---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-beta\nr=terminal(\"prefix\");"`.

Output
([retained-prefix/ir-leading-output.mmd](../tests/fixtures/railroad/retained-prefix/ir-leading-output.mmd)):

```mmd

---
config: {railroad: {fontSize: 19}}
---
railroad-beta
  r = terminal("prefix");
```

Input (escaped):
`"\n---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-ebnf-beta\nr=\"prefix\";"`.

Output
([retained-prefix/ebnf-leading-output.mmd](../tests/fixtures/railroad/retained-prefix/ebnf-leading-output.mmd)):

```mmd

---
config: {railroad: {fontSize: 19}}
---
railroad-ebnf-beta
  r = "prefix";
```

Input (escaped):
`"\n---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-abnf-beta\nr=\"prefix\";"`.

Output
([retained-prefix/abnf-leading-output.mmd](../tests/fixtures/railroad/retained-prefix/abnf-leading-output.mmd)):

```mmd

---
config: {railroad: {fontSize: 19}}
---
railroad-abnf-beta
  r = "prefix";
```

Input (escaped):
`"\n---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-peg-beta\nr<-\"prefix\";"`.

Output
([retained-prefix/peg-leading-output.mmd](../tests/fixtures/railroad/retained-prefix/peg-leading-output.mmd)):

```mmd

---
config: {railroad: {fontSize: 19}}
---
railroad-peg-beta
  r <- "prefix";
```

### Semicolons

Keep every authored semicolon. Required visible rule terminators and ABNF native
comment marks remain grammatical punctuation and are excluded from the shared
textual-prefix scan. All other semicolons protect their source segment through
whole crossing values/trivia. Align the first line to one body step, as in other
flat diagrams; later lines retain their written columns with no added
indentation. Columns have no grammatical meaning on the first line.

Keep an authored railroad line as written when it contains the literal string
`style` or `classDef` after global directives have been omitted. This includes
all statements, comments and native hidden forms on the line, with their inner
spacing. Do not join the line to either neighbor. When removing a directive
forms one of these strings across physical lines, keep every contributing line.
[fixture: railroad/semicolons/native-terminal-value]

[fixture: railroad/semicolons/ir-word-unclosed-directive-lines] [fixture:
railroad/semicolons/ebnf-word-unclosed-directive-lines] [fixture:
railroad/semicolons/abnf-word-unclosed-directive-lines] [fixture:
railroad/semicolons/peg-word-unclosed-directive-lines] Here a line is the
complete range that mermaid.js reads as one line. A comment line after U+2028 or
U+2029 can join text before or after the line containing the word, or on both
sides: keep all the connected source lines too. The first source line uses one
body indentation step; the contents and the columns of later source lines remain
written.

[test: railroad/semicolons/ir-style-comment-before-ls] [test:
railroad/semicolons/ir-style-comment-after-ls] [test:
railroad/semicolons/ir-style-comment-both-ls] [test:
railroad/semicolons/ir-classdef-comment-before-ps] [test:
railroad/semicolons/ir-classdef-comment-after-ps] [test:
railroad/semicolons/ir-classdef-comment-both-ps] [test:
railroad/semicolons/ebnf-style-comment-before-ls] [test:
railroad/semicolons/ebnf-style-comment-after-ls] [test:
railroad/semicolons/ebnf-style-comment-both-ls] [test:
railroad/semicolons/ebnf-classdef-comment-before-ps] [test:
railroad/semicolons/ebnf-classdef-comment-after-ps] [test:
railroad/semicolons/ebnf-classdef-comment-both-ps] [test:
railroad/semicolons/abnf-style-comment-before-ls] [test:
railroad/semicolons/abnf-style-comment-after-ls] [test:
railroad/semicolons/abnf-style-comment-both-ls] [test:
railroad/semicolons/abnf-classdef-comment-before-ps] [test:
railroad/semicolons/abnf-classdef-comment-after-ps] [test:
railroad/semicolons/abnf-classdef-comment-both-ps] [test:
railroad/semicolons/peg-style-comment-before-ls] [test:
railroad/semicolons/peg-style-comment-after-ls] [test:
railroad/semicolons/peg-style-comment-both-ls] [test:
railroad/semicolons/peg-classdef-comment-before-ps] [test:
railroad/semicolons/peg-classdef-comment-after-ps] [test:
railroad/semicolons/peg-classdef-comment-both-ps]

Shared kept-line layout keeps a whole statement or indivisible value/trivia that
crosses the line too; later lines retain their written columns.

mermaid.js can ignore the last semicolon of a line containing these strings. In
railroad that semicolon can be a required rule terminator or an ABNF comment
mark. Changing the line can therefore reject a rule or read comment text as
code. Keeping the source line protects both kinds of punctuation without
predicting how moving its contents would affect the common line rule.

The cost is that a rule name, string or comment containing `style` or `classDef`
leaves that line unformatted, even when no colon or hash follows. Other lines
follow the ordinary rules. A word found only inside a removed global directive
does not keep a line; characters joined across a removed directive do count.

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

Input (escaped):
`"railroad-beta\n accDescr { style:#x } r = sequence(terminal(\"a;b\"),terminal(\"tail\"));;"`.

Output
([semicolons/ir-protected-output.mmd](../tests/fixtures/railroad/semicolons/ir-protected-output.mmd)):

```mmd
railroad-beta
  accDescr { style:#x } r = sequence(terminal("a;b"),terminal("tail"));;
```

Input (escaped):
`"railroad-ebnf-beta\n accDescr { style:#x } r = \"a;b\", \"tail\";;"`.

Output
([semicolons/ebnf-protected-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-protected-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr { style:#x } r = "a;b", "tail";;
```

Input (escaped):
`"railroad-abnf-beta\n r=\"first\" ; content; protected\n \"last\";\n"`.

Output
([semicolons/abnf-comment-content-output.mmd](../tests/fixtures/railroad/semicolons/abnf-comment-content-output.mmd)):

```mmd
railroad-abnf-beta
  r="first" ; content; protected
 "last";
```

Input (escaped):
`"railroad-peg-beta\n accDescr { style:#x } r <- \"a;b\" \"tail\";;"`.

Output
([semicolons/peg-protected-output.mmd](../tests/fixtures/railroad/semicolons/peg-protected-output.mmd)):

```mmd
railroad-peg-beta
  accDescr { style:#x } r <- "a;b" "tail";;
```

Input (escaped): `"railroad-beta\nstyle=terminal(\":\" )/*#*/;"`.

Output
([semicolons/ir-style-call-close-output.mmd](../tests/fixtures/railroad/semicolons/ir-style-call-close-output.mmd)):

```mmd
railroad-beta
  style=terminal(":" )/*#*/;
```

Input (escaped): `"railroad-abnf-beta\nstyle=(\":\"\n)%%{!#}%% ;"`.

Output
([semicolons/abnf-style-group-newline-output.mmd](../tests/fixtures/railroad/semicolons/abnf-style-group-newline-output.mmd)):

```mmd
railroad-abnf-beta
  style=(":"
)%%{!#}%% ;
```

Input (escaped): `"railroad-beta\n   r=terminal(\"a;b\");"`.

Output
([semicolons/ir-protected-rule-indent-output.mmd](../tests/fixtures/railroad/semicolons/ir-protected-rule-indent-output.mmd)):

```mmd
railroad-beta
  r=terminal("a;b");
```

Input (escaped): `"railroad-beta\n   r=terminal(\n \"a;b\"\n);"`.

Output
([semicolons/ir-protected-multiline-indent-output.mmd](../tests/fixtures/railroad/semicolons/ir-protected-multiline-indent-output.mmd)):

```mmd
railroad-beta
  r=terminal(
 "a;b"
);
```

Input (escaped): `"railroad-beta\n/*style*/r=terminal(\":\"\n)/*#*/;"`.

Output
([semicolons/ir-leading-c-output.mmd](../tests/fixtures/railroad/semicolons/ir-leading-c-output.mmd)):

```mmd
railroad-beta
  /*style*/r=terminal(":"
)/*#*/;
```

Input (escaped): `"railroad-ebnf-beta\n(*style*)r=(\":\"\n)(*#*);"`.

Output
([semicolons/ebnf-leading-iso-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-leading-iso-output.mmd)):

```mmd
railroad-ebnf-beta
  (*style*)r=(":"
)(*#*);
```

Input (escaped): `"railroad-abnf-beta\n%%{!style}%% r=(\":\"\n)%%{!#}%% ;"`.

Output
([semicolons/abnf-leading-hidden-output.mmd](../tests/fixtures/railroad/semicolons/abnf-leading-hidden-output.mmd)):

```mmd
railroad-abnf-beta
  %%{!style}%% r=(":"
)%%{!#}%% ;
```

Input (escaped): `"railroad-peg-beta\n%%{!style}%% r<-(\":\"\n)%%{!#}%% ;"`.

Output
([semicolons/peg-leading-hidden-output.mmd](../tests/fixtures/railroad/semicolons/peg-leading-hidden-output.mmd)):

```mmd
railroad-peg-beta
  %%{!style}%% r<-(":"
)%%{!#}%% ;
```

Input (escaped): `"railroad-beta\n/*x\nstyle*/r=terminal(\":\"\n)/*#*/;"`.

Output
([semicolons/ir-leading-multiline-c-output.mmd](../tests/fixtures/railroad/semicolons/ir-leading-multiline-c-output.mmd)):

```mmd
railroad-beta
  /*x
style*/r=terminal(":"
)/*#*/;
```

Input (escaped): `"railroad-beta /*style*/r=terminal(\":\"\n)/*#*/;"`.

Output
([semicolons/ir-header-leading-c-output.mmd](../tests/fixtures/railroad/semicolons/ir-header-leading-c-output.mmd)):

```mmd
railroad-beta /*style*/r=terminal(":"
)/*#*/;
```

Input (escaped):
`"railroad-beta\na=terminal(\"style\");b=terminal(\":\"\n)/*#*/;"`.

Output
([semicolons/ir-after-rule-output.mmd](../tests/fixtures/railroad/semicolons/ir-after-rule-output.mmd)):

```mmd
railroad-beta
  a=terminal("style");b=terminal(":"
)/*#*/;
```

Input (escaped): `"railroad-ebnf-beta\naccDescr{style} b=(\":\"\n)/*#*/;"`.

Output
([semicolons/ebnf-after-description-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-after-description-output.mmd)):

```mmd
railroad-ebnf-beta
  accDescr{style} b=(":"
)/*#*/;
```

Input (escaped): `"railroad-abnf-beta\naccDescr{style} b=(\":\"\n)%%{!#}%% ;"`.

Output
([semicolons/abnf-after-description-output.mmd](../tests/fixtures/railroad/semicolons/abnf-after-description-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr{style} b=(":"
)%%{!#}%% ;
```

Input (escaped): `"railroad-peg-beta\nstyle<-\"a\";b<-(\":\"\n)%%{!#}%% ;"`.

Output
([semicolons/peg-after-rule-name-output.mmd](../tests/fixtures/railroad/semicolons/peg-after-rule-name-output.mmd)):

```mmd
railroad-peg-beta
  style<-"a";b<-(":"
)%%{!#}%% ;
```

Input (escaped):
`"railroad-beta\naccDescr{style} %%{!keep}%% b=terminal(\":\"\n)/*#*/;"`.

Output
([semicolons/ir-kept-description-hidden-output.mmd](../tests/fixtures/railroad/semicolons/ir-kept-description-hidden-output.mmd)):

```mmd
railroad-beta
  accDescr{style} %%{!keep}%% b=terminal(":"
)/*#*/;
```

Input (escaped): `"railroad-ebnf-beta\na=\"x\";(*classDef*) b=(\":\"\n)(*#*);"`.

Output
([semicolons/ebnf-comment-after-moved-rule-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-comment-after-moved-rule-output.mmd)):

```mmd
railroad-ebnf-beta
  a="x";(*classDef*) b=(":"
)(*#*);
```

Input (escaped): `"railroad-abnf-beta\n%%{style}%% b=(\":\"\n)%%{!#}%% ;"`.

Output
([semicolons/abnf-removed-directive-word-output.mmd](../tests/fixtures/railroad/semicolons/abnf-removed-directive-word-output.mmd)):

```mmd
railroad-abnf-beta
  %%{style}%% b = (":")%%{!#}%% ;
```

Input (escaped): `"railroad-peg-beta\nr<-(\"sty%%{wrap}%%le:\"\n)%%{!#}%% ;"`.

Output
([semicolons/peg-directive-split-style-output.mmd](../tests/fixtures/railroad/semicolons/peg-directive-split-style-output.mmd)):

```mmd
railroad-peg-beta
  r<-("sty%%{wrap}%%le:"
)%%{!#}%% ;
```

Input (escaped): `"railroad-ebnf-beta\nr=?style:#?\n;"`.

Output
([semicolons/ebnf-terminator-after-hash-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-terminator-after-hash-output.mmd)):

```mmd
railroad-ebnf-beta
  r=?style:#?
;
```

Input (escaped): `"railroad-beta\nstyle\n=terminal(\":#\");"`.

Output
([semicolons/ir-assignment-after-word-output.mmd](../tests/fixtures/railroad/semicolons/ir-assignment-after-word-output.mmd)):

```mmd
railroad-beta
  style
=terminal(":#");
```

Input (escaped): `"railroad-abnf-beta\nstyle=(\":\" )%%{!#}%% ; c\n;"`.

Output
([semicolons/abnf-comment-marker-spaced-output.mmd](../tests/fixtures/railroad/semicolons/abnf-comment-marker-spaced-output.mmd)):

```mmd
railroad-abnf-beta
  style=(":" )%%{!#}%% ; c
;
```

Input (escaped): `"railroad-abnf-beta\nstyle=(\":\"\n)%%{!#}%% ; c\n;"`.

Output
([semicolons/abnf-comment-marker-multiline-output.mmd](../tests/fixtures/railroad/semicolons/abnf-comment-marker-multiline-output.mmd)):

```mmd
railroad-abnf-beta
  style=(":"
)%%{!#}%% ; c
;
```

Input (escaped):
`"railroad-beta\n  a=terminal( \"x\" );style=terminal( \"y\" );b=terminal( \"z\" );"`.

Output
([semicolons/ir-word-multiple-statements-output.mmd](../tests/fixtures/railroad/semicolons/ir-word-multiple-statements-output.mmd)):

```mmd
railroad-beta
  a=terminal( "x" );style=terminal( "y" );b=terminal( "z" );
```

Input (escaped): `"railroad-abnf-beta\n  accDescr{note} style=( \"x\" );"`.

Output
([semicolons/abnf-word-multiple-statements-output.mmd](../tests/fixtures/railroad/semicolons/abnf-word-multiple-statements-output.mmd)):

```mmd
railroad-abnf-beta
  accDescr{note} style=( "x" );
```

Input (escaped): `"railroad-peg-beta\n r<-( \"style\" );"`.

Output
([semicolons/peg-word-quoted-output.mmd](../tests/fixtures/railroad/semicolons/peg-word-quoted-output.mmd)):

```mmd
railroad-peg-beta
  r<-( "style" );
```

Input (escaped): `"railroad-ebnf-beta\n myclassDef=( \"x\" );"`.

Output
([semicolons/ebnf-word-rule-name-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-word-rule-name-output.mmd)):

```mmd
railroad-ebnf-beta
  myclassDef=( "x" );
```

Input (escaped):
`"railroad-beta\n   /*style*/  /*kept*/\nr=terminal( \"x\" );"`.

Output
([semicolons/ir-word-comment-line-output.mmd](../tests/fixtures/railroad/semicolons/ir-word-comment-line-output.mmd)):

```mmd
railroad-beta
  /*style*/  /*kept*/
  r = terminal("x");
```

Input (escaped): `"railroad-ebnf-beta\nr=( \"class%%{init:\n{}}%%Def\" );"`.

Output
([semicolons/ebnf-word-directive-lines-output.mmd](../tests/fixtures/railroad/semicolons/ebnf-word-directive-lines-output.mmd)):

```mmd
railroad-ebnf-beta
  r=( "class%%{init:
{}}%%Def" );
```

Input (escaped):
`"railroad-abnf-beta\na=(\n\"x\"\n);\nstyle=( \"y\" );\nb=(\n\"z\"\n);"`.

Output
([semicolons/abnf-word-neighbor-boundaries-output.mmd](../tests/fixtures/railroad/semicolons/abnf-word-neighbor-boundaries-output.mmd)):

```mmd
railroad-abnf-beta
  a = ("x");
  style=( "y" );
  b = ("z");
```

Input (escaped): `"railroad-peg-beta\nr<-(\n\"classDef\"\n\"x\"\n);"`.

Output
([semicolons/peg-word-middle-line-output.mmd](../tests/fixtures/railroad/semicolons/peg-word-middle-line-output.mmd)):

```mmd
railroad-peg-beta
  r<-(
"classDef"
"x"
);
```

### Blank lines

Collapse ordinary blank runs to at most one and remove blanks at document/body
edges. Empty ordinary whitespace-only lines and remove harmless ASCII padding at
headers or completed structures. This keeps the same visual separation as other
flat diagrams. Values, comment tails, directive/hidden contents, necessary
closer padding, prefixes and protected segments retain their own rules. ABNF
space after an apparent terminator is not assumed harmless: its AST can instead
contain a comment.

[fixture: railroad/blank-lines/abnf-collapse]

[fixture: railroad/blank-lines/ebnf-collapse]

[fixture: railroad/blank-lines/ir-collapse]

[fixture: railroad/blank-lines/peg-collapse]

Input (escaped):
`"\nrailroad-beta \t\n\n\nr=terminal(\"blank\"); \t\n\n \t\ns=terminal(\"tail\");\n\n"`.

Output
([blank-lines/ir-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/ir-collapse-output.mmd)):

```mmd
railroad-beta
  r = terminal("blank");

  s = terminal("tail");
```

Input (escaped):
`"\nrailroad-ebnf-beta \t\n\n\nr=\"blank\"; \t\n\n\ns=\"tail\";\n\n"`.

Output
([blank-lines/ebnf-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/ebnf-collapse-output.mmd)):

```mmd
railroad-ebnf-beta
  r = "blank";

  s = "tail";
```

Input (escaped):
`"\nrailroad-abnf-beta \t\n\n\nr=\"blank\";\n\n \t\ns=\"tail\";\n\n"`.

Output
([blank-lines/abnf-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/abnf-collapse-output.mmd)):

```mmd
railroad-abnf-beta
  r = "blank";

  s = "tail";
```

Input (escaped):
`"\nrailroad-peg-beta \t\n\n\nr<-\"blank\"; \t\n\n\ns<-\"tail\";\n\n"`.

Output
([blank-lines/peg-collapse-output.mmd](../tests/fixtures/railroad/blank-lines/peg-collapse-output.mmd)):

```mmd
railroad-peg-beta
  r <- "blank";

  s <- "tail";
```

### Frontmatter yaml

Only safe real leading frontmatter uses the shared guarded YAML formatter. It
chooses readable YAML while preserving embedded effects. Malformed YAML,
indented fences, closer padding, HTML-quote hazards, fences that formatting
would create in the body and retained-prefix YAML stay written. YAML nesting and
block scalars use the shared positive minimum at tabWidth zero. Native hidden
YAML is opaque and never enters this path.

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

Input (escaped):
`"---\nconfig: {railroad: {fontSize: 19, compactMode: true}}\n---\nrailroad-beta\nr=terminal(\"yaml config\");"`.

Output
([frontmatter-yaml/ir-safe-output.mmd](../tests/fixtures/railroad/frontmatter-yaml/ir-safe-output.mmd)):

```mmd
---
config: { railroad: { fontSize: 19, compactMode: true } }
---
railroad-beta
  r = terminal("yaml config");
```

Input (escaped):
`"---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-ebnf-beta\nr=\"yaml config\";"`.

Output
([frontmatter-yaml/ebnf-safe-output.mmd](../tests/fixtures/railroad/frontmatter-yaml/ebnf-safe-output.mmd)):

```mmd
---
config: { railroad: { fontSize: 19 } }
---
railroad-ebnf-beta
  r = "yaml config";
```

Input (escaped):
`"---\ntitle: |\n  First\n  Second\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-abnf-beta\nr=\"yaml config\";"`.

Output
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

Input (escaped):
`"---\nconfig: {railroad: {fontSize: 19}}\n---\nrailroad-peg-beta\nr<-\"yaml config\";"`.

Output
([frontmatter-yaml/peg-safe-output.mmd](../tests/fixtures/railroad/frontmatter-yaml/peg-safe-output.mmd)):

```mmd
---
config: { railroad: { fontSize: 19 } }
---
railroad-peg-beta
  r <- "yaml config";
```

### Line terminators and unicode

Follow the shared host policy: read physical CR/CRLF as LF and emit the
configured LF, CRLF or CR, even inside values, hidden text and frontmatter.
Leading BOM follows the host removal/restoration limit. LS/PS/NBSP/BOM are not
ordinary native gap whitespace; retain them where strings, special sequences or
native line comments own them. Shared common-value edges still trim Notation
whitespace. This follows native lexical ownership rather than converting Unicode
separators into structural newlines.

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

Input (escaped): `"railroad-ebnf-beta\r\nr=? cr\r\n continuation ?;\r\n"`.

Output (escaped): `"railroad-ebnf-beta\n  r = ? cr\n continuation ?;\n"`.

### Source order

Keep source order and every occurrence: rules, alternatives, duplicate names,
forward/undefined references, repeated metadata and empty resets. Keep calls,
groups, repeats and complete predicate operands from the AST. Sorting or
deleting overwritten/empty metadata can change the Db; equal normalized
singleton forms do not justify rebuilding the source from the Db.

[fixture: railroad/source-order/abnf-duplicates]

[fixture: railroad/source-order/ebnf-duplicates]

[fixture: railroad/source-order/ir-duplicates]

[fixture: railroad/source-order/peg-duplicates]

Input (escaped):
`"railroad-beta\naccTitle: old\naccTitle:\nz=nonterminal(\"later\");a=terminal(\"first\");a=terminal(\"second\");later=terminal(\"end\");"`.

Output
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

Input (escaped):
`"railroad-ebnf-beta\naccDescr {old}\naccDescr {}\nz=later;a=\"first\";a=\"second\";later=\"end\";"`.

Output
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

Input (escaped):
`"railroad-abnf-beta\naccTitle: old\naccTitle:\nz=later;\na=\"first\";\na=\"second\";\nlater=\"end\";"`.

Output
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

Input (escaped):
`"railroad-peg-beta\naccDescr {old}\naccDescr {}\nz<-later;a<-\"first\";a<-\"second\";later<-\"end\";"`.

Output
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

### Final newline

Ordinary accepted bodies finish with one configured newline, including empty
bodies, rules, metadata, comments and closed hidden forms. This gives a
consistent file ending. EOF-reaching Root directives, necessary hidden padding
and protected/prefix endings retain the shared exceptions. Add no space after
ABNF terminators.

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

Input (escaped): `"railroad-beta \t"`.

Output
([final-newline/ir-empty-output.mmd](../tests/fixtures/railroad/final-newline/ir-empty-output.mmd)):

```mmd
railroad-beta
```

Input (escaped): `"railroad-ebnf-beta \t"`.

Output
([final-newline/ebnf-empty-output.mmd](../tests/fixtures/railroad/final-newline/ebnf-empty-output.mmd)):

```mmd
railroad-ebnf-beta
```

Input (escaped): `"railroad-abnf-beta \t"`.

Output
([final-newline/abnf-empty-output.mmd](../tests/fixtures/railroad/final-newline/abnf-empty-output.mmd)):

```mmd
railroad-abnf-beta
```

Input (escaped): `"railroad-peg-beta \t"`.

Output
([final-newline/peg-empty-output.mmd](../tests/fixtures/railroad/final-newline/peg-empty-output.mmd)):

```mmd
railroad-peg-beta
```

### Specified readings

Follow the six existing divergences: directive-as-token-boundary,
ignored-semicolon-as-token-boundary, html-tag-in-frontmatter,
embedded-data-opaque, bare-percent-line-before-header and c4-keyword-anywhere.
Railroad has no acceptance-setting key to remove in opaque comparison. Empty
strings are values; empty calls reject. Raw rejection gives no raw Db: accepted
specified inputs use the recorded specified reading, written text and
idempotence checks. Standalone parse failures report syntax errors without
repaired output; Markdown declines embedding.

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

For example, `railroad-beta\nr=terminal()` is rejected and produces no repaired
output.

### Markdown fences

Apply the same rules to dedented payloads through the shared Markdown route. The
host supplies fence/list/quote columns and can trim padding on the final payload
line, including final hidden padding. Interior hidden boundaries remain
necessary. Test the complete host output separately from payload Db preservation
so containers do not become railroad indentation.

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

Input:

````markdown
```mermaid
railroad-beta r=terminal("fenced");
```
````

Output:

````markdown
```mermaid
railroad-beta
  r = terminal("fenced");
```
````
