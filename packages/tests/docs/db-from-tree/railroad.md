# Railroad: building the Db from the tree

Japanese version: [railroad.ja.md](./railroad.ja.md)

The [syntax](../../../spec/docs/diagrams/railroad.md) defines acceptance; the
[source tree](../../../spec/docs/ast/railroad.md) retains thirty authored node
types. `railroadDbOf` reads an accepted RailroadDiagram. Root.diagramType
selects IR, EBNF, ABNF or PEG; all four produce the same
[summary](../db-summaries.md#railroad) shape. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree] [fixture:
railroad/peg-gram-written-tree]

## Building the summary from the tree

1. **Reading and order.** Read leaf ranges through the shared
   [converted-text path](../db-from-tree.md#the-converted-form). Publish rules
   in declaration order, retaining duplicate names, with each converted name and
   recursively built definition. Native ignored text and all its gap lists
   publish nothing. Neither body nor frontmatter title enters the summary;
   frontmatter title remains in the shared embedded values. Empty diagrams have
   empty accessibility strings and an empty rules list. [fixture:
   railroad/ir-db-duplicates] [fixture: railroad/ebnf-db-duplicates] [fixture:
   railroad/abnf-db-duplicates] [fixture: railroad/peg-db-duplicates] [fixture:
   railroad/ir-native-ownership] [fixture: railroad/ir-header-only] [fixture:
   railroad/ebnf-header-only] [fixture: railroad/abnf-header-only] [fixture:
   railroad/peg-header-only] [fixture: railroad/ir-frontmatter-empty-body-title]
2. **Accessibility.** Read the converted literal range, or empty text for null.
   Apply the shared `commonValue`: trim line values and collapse repeated ASCII
   space/tab; block values also trim lines and collapse repeated physical line
   breaks. Keep the last assignment, including an empty assignment suppressing
   previous values. Apply `descriptionOf` to the final description and
   `textReplacementOf(embedded.config)` to both accessibility fields. [fixture:
   railroad/ir-common-repeat] [fixture: railroad/ir-common-repeat-empty]
   [fixture: railroad/ebnf-common-repeat-empty] [fixture:
   railroad/abnf-common-repeat-empty] [fixture:
   railroad/peg-common-repeat-empty] [fixture:
   railroad/ir-common-block-whitespace] [fixture: railroad/ir-html-texts]
   [fixture: railroad/ir-entity-texts] [fixture:
   railroad/ir-config-security-level-other] [fixture:
   railroad/ebnf-config-security-level-other] [fixture:
   railroad/abnf-config-security-level-other] [fixture:
   railroad/peg-config-security-level-other]
3. **String values.** Remove converted surrounding quotes. IR, EBNF and PEG
   decode only backslash n/r/t to their control characters, dropping the
   backslash from every other escaped character. ABNF retains its entire
   double-quoted interior without decoding backslashes. EBNF special-sequence
   text loses its question marks and trims both ends, without string escape
   decoding. Once expression conversion is complete, including PEG predicate
   labels, apply `textReplacementOf(embedded.config)` to each rule name and
   recursively to terminal values, nonterminal names and special text. [fixture:
   railroad/ir-config-security-level-other] [fixture:
   railroad/ebnf-config-security-level-other] [fixture:
   railroad/abnf-config-security-level-other] [fixture:
   railroad/peg-config-security-level-other] [fixture:
   railroad/ir-lex-string-conversion] [fixture:
   railroad/ebnf-lex-string-conversion] [fixture:
   railroad/peg-lex-string-conversion] [fixture:
   railroad/abnf-lex-string-conversion] [fixture:
   railroad/abnf-string-backslash-quote] [fixture:
   railroad/ebnf-special-whitespace] [fixture: railroad/ebnf-html-texts]
4. **IR calls.** Terminal, nonterminal and special calls publish terminal value,
   nonterminal name and special text. Sequence and choice calls publish their
   argument definitions in order, collapsing a singleton to its child. Optional
   publishes optional; zeroOrMore and oneOrMore publish repetition with lower
   bound 0 or 1 and upper bound Infinity. Do not flatten nested lists. [fixture:
   railroad/ir-db-all-fields] [fixture: railroad/ir-db-singletons] [fixture:
   railroad/ir-db-empty-strings] [fixture:
   railroad/ir-spec-railroad-renderer-8ca3b06b]
5. **Natural notation and EBNF.** Identifiers become nonterminals and strings
   terminals. Choice and sequence member lists preserve order; groups publish
   their inner definition. Brackets publish optional. EBNF braces publish
   repetition from 0 to Infinity; suffixes ?, * and + publish optional or
   repetition from 0/1 to Infinity, in authored nesting order. An EBNF exception
   publishes a sequence of the left definition, terminal dash and the right
   definition, preserving any nested sequence on the left. [fixture:
   railroad/ebnf-db-all-fields] [fixture: railroad/ebnf-db-singletons] [fixture:
   railroad/abnf-db-singletons] [fixture: railroad/peg-db-singletons] [fixture:
   railroad/ebnf-db-postfix-order] [fixture: railroad/ebnf-exception-leftfold]
6. **ABNF repeats and numeric values.** Read decimal bounds with parseInt
   base 10. An omitted minimum is 0 and omitted maximum Infinity; an exact count
   supplies both bounds. Converted bounds 0 and 1 publish optional; every other
   repeat publishes repetition without rejecting reversed bounds. Apply shared
   `numberOrText()` to both published bounds, retaining non-finite values as
   strings. Numeric-value nodes publish their complete converted spelling as a
   terminal, keeping base case, digits, dots and hyphens. [fixture:
   railroad/abnf-db-repeat-optional] [fixture:
   railroad/abnf-db-repeat-implicit-optional] [fixture:
   railroad/abnf-db-repeat-zero-padded-optional] [fixture:
   railroad/abnf-db-repeat-implicit-zero] [fixture:
   railroad/abnf-db-repeat-reversed] [fixture:
   railroad/abnf-db-repeat-precision] [fixture:
   railroad/abnf-db-repeat-overflow] [fixture:
   railroad/abnf-db-repeat-max-overflow] [fixture: railroad/abnf-db-all-fields]
   [fixture: railroad/abnf-numval-boundaries] [fixture:
   railroad/abnf-directive-numval-digits]
7. **PEG suffixes and predicates.** Suffixes use the same optional and
   repetition forms. Dot publishes special text dot. Convert a predicate's full
   operand first, then label it with its prefix and a terminal in double quotes,
   a nonterminal name or special text. An operand of any other resulting type
   becomes (...). Quotes and decoded line breaks inside terminal values are not
   escaped. A predicate of a grouped predicate therefore prefixes the already
   published special text. Authored groups and complete operands stay in the
   source tree. [fixture: railroad/peg-db-all-fields] [fixture:
   railroad/peg-db-predicates] [fixture:
   railroad/peg-db-predicate-singleton-group] [fixture:
   railroad/peg-db-predicate-predicate] [fixture:
   railroad/peg-db-predicate-quote-newline]

## Checking recorded trees

Use the fixture's specified reading when present and `embeddedValuesOf` for the
same reading. A missing tree for an accepted comparable reading is a failure; an
error record is skipped only when the specified acceptance rejects. Cases
without a comparison Db remain explicit under
[the comparison Db](../../../spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db).
Railroad has no semantic embedded acceptance keys. [fixture:
railroad/ir-div-html-frontmatter-rule-accept] [fixture:
railroad/ir-div-html-frontmatter-rule-reject] [fixture:
railroad/ebnf-div-html-frontmatter-rule-double] [fixture:
railroad/abnf-div-html-frontmatter-acctitle] [fixture:
railroad/peg-div-html-frontmatter-rule-single] [fixture:
railroad/ir-config-frontmatter-fontfamily-number]
