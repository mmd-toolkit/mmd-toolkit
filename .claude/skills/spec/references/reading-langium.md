# Reading a Langium diagram (spec)

Section numbers below are those of [SKILL.md](../SKILL.md).

1. Read the entry rule, every imported grammar and all reachable rules. Follow
   the generated grammar, service modules and token builder to the effective
   terminal array. Record its priority order, including inherited terminals,
   custom keyword matchers and longer alternatives. Declaration order alone and
   a general longest-match assumption do not establish that order. Inventory
   imported terminals that are unreachable, and read mermaid.js's fixed tests
   under both `packages/parser` and `packages/mermaid/src/diagrams/<diagram>`.
2. Read the actual keyword matcher and its boundary test. State the exact
   characters that satisfy the boundary and distinguish them from whitespace
   skipped between units. Judge the boundary on the diagram text after global
   directives and the semicolons selected by the common line rule are left out.
   Through the tests package's Mermaid runner, probe a global directive glued
   immediately after a keyword and before the next component. Compare cases
   where removal leaves a valid boundary with cases where it joins the two
   components. Do not import Jison's word-boundary rule. Check competing
   keywords and terminals at the same position, including composite line forms
   whose keyword and value are read together. Check each keyword with a custom
   matcher separately from punctuation-joined spellings that do not use it,
   distinguishing their word and punctuation components.
3. Read hidden terminals in priority order, including their flags and where
   their match ends. Separate them from global preprocessing. Check whether they
   consume a following line feed, use it only as a boundary, or consume the
   appended line feed at EOF. Check an earlier terminal enclosing the same text,
   fallback to comments when a hidden form fails, and matches between complete
   units versus inside an atom. First ask where the tree can hold every skipped
   form; do not propose a divergence merely because it is hidden. Check
   alternative order and greedy or lazy matches within each terminal with
   adjacent delimiters, rather than assuming the nearest closer wins. Give each
   retained form an owner and range, with any consumed following line feed
   outside that range.
4. Follow the diagram's module to its custom, common and default value
   converters. Match each conversion branch to the grammar rule name that
   actually calls it; an unused branch is not behavior. Record string escapes,
   numeric conversion, trimming and whitespace collapse separately. Keep the
   tree's authored values distinct from converted Db values, and state which
   spelling the tree preserves under section 4. Follow assigned, overwritten and
   unassigned syntax through the generated model and publication, retaining
   every written occurrence even when absent from Mermaid's model or Db. Trace
   acceptance comparison values through entity replacement, quoting and escape
   decoding, whitespace handling and configuration-dependent escaping, testing
   rewrite order and overlaps introduced by intermediate text.
5. Follow the public parse wrapper and the diagram's adapter through complete
   consumption and every error check. Determine whether any lexer error or
   parser error prevents publication, including errors attached to a recovered
   tree. Read model validation and Db rejection after conversion too. Do not
   infer acceptance from the existence of a recovered tree or from the grammar
   alone. Enumerate reachable semantic checks after final option selection,
   including the state updates, identities and replacements those checks depend
   on. If the adapter publishes nothing or has no semantic gate, record that
   absence rather than inventing a publication step or fields.

Items 6 and 7, on detection and on the steps after the reading, are in
[section 2 of spec-diagram-type](../../spec-diagram-type/SKILL.md#2-detection-and-the-steps-after-the-reading-for-a-langium-diagram-type).
