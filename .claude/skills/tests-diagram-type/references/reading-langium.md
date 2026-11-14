# Reading a Langium diagram (tests-diagram-type)

Section numbers below are those of [SKILL.md](../SKILL.md).

For a Langium diagram, derive the following from its own grammar and services.
Derive terminal order, boundaries, conversion and publication anew for each
diagram; an imported common rule does not establish how the diagram uses it.

1. Start at the `entry` rule and follow imports and rule calls. Read the
   generated grammar as well as the written grammar, and the service modules
   that inject its token builder and value converter. List only reachable
   terminals in their resulting order, including hidden ones; an imported
   terminal's declaration alone does not make it reachable, and a terminal's
   component rules need not become separate lexer units. If generated files are
   absent from the clone, read the installed pin's bundle source maps and check
   the generated module and grammar against the written service wiring.
2. Read keyword patterns too: list which keywords receive custom boundaries,
   which keep the default ordering, and which have explicit `longer_alt`
   alternatives. The
   [shared token builder](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/tokenBuilder.ts#L7-L31)
   adds whitespace/EOF-or-percent-pair lookahead only to its configured
   keywords. First matching rule, keyword boundaries and explicit alternatives
   decide the unit, rather than a general longest match. Probe glued suffixes,
   keyword prefixes, punctuation attached to keywords, and priority against
   references, numbers, strings and composite common terminals; detection has
   boundaries of its own.
3. Treat hidden terminals as lexer rules with consumed text, not as global
   removals. The imported
   [YAML and DIRECTIVE terminals](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/common.langium#L25-L34)
   consume an immediately following LF, whereas another whitespace boundary is
   only looked at. Probe each unit gap and each statement's EOL and EOF: a
   consumed sole LF prevents a later statement, but consuming the common
   appended LF can leave EOF satisfying EOL. Keep leading frontmatter, common
   directive removal and these body terminals distinct. Derive alternative
   priority before choosing a closer: a body-present alternative can take
   precedence over an adjacent empty close. Probe the detection-to-parser
   handoff for retained prefixes and passed bare-line trivia independently for
   the new diagram.
4. Follow the actual terminal rule name through the injected converter and its
   fallback, including identity, string, integer and double conversion only
   where reachable. The
   [common converter](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/valueConverter.ts#L26-L70)
   gives line and block common values different whitespace readings. For
   example, the pie
   [custom branch](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/pie/valueConverter.ts#L6-L16)
   names PIE_SECTION_LABEL, while its
   [grammar](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/pie/pie.langium#L1-L20)
   calls STRING and reaches the default escape conversion. For reachable units,
   collect both quote styles, unknown escapes, precision, overflow and
   underflow; use rejecting controls and record the reason where a previous
   diagram's unit is unreachable.
5. Read the public acceptance gate, not just the recoverable AST. The
   [public parse wrapper](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/parse.ts#L134-L150)
   rejects any lexer or parser error. Then follow the diagram's AST-to-Db
   publication, distinguishing stored values, conditional or skipped
   assignments, unassigned grammar literals and statements the adapter discards.
   Record repeated-assignment order, empty final values, duplicate handling and
   semantic rejection after publication; a diagram may publish nothing and have
   an empty summary. Test errors at the beginning, in a recovered statement and
   after a valid prefix, separately from each reachable Db rejection.
6. Keep the collector's parse stub asynchronous so that specs awaiting parse are
   recorded: `Promise.resolve(record(text))` records the call without running
   Langium or imitating acceptance. Run the spec against this shared recorder
   and check that every recorded location is an actual parse call. A stub-only
   test-body failure after the final input may use the existing explicit
   allowance of step 3 of [collecting-fixtures.md](collecting-fixtures.md) only
   after proving that no input was lost. Continue with the normalizer,
   fixed-fixture and stable-generation steps in sections 2 and 3; once the AST
   is defined, implement its Db builder and checker with the skill
   [tests-tree-checks](../../tests-tree-checks/SKILL.md).
