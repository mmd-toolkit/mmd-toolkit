# When a gap in the specification is found (spec)

Section numbers below are those of [SKILL.md](../SKILL.md).

Input: an input that the specification does not decide, or decides differently
from mermaid.js, found while implementing or reviewing the parser, the
formatter, or the rules, or while writing the specification.

1. Reproduce the inputs with mermaid.js and with the parser.
2. Read the cause in the source of mermaid.js (section 3).
3. List the cases of the sentences that the input concerns, as in section 6, and
   check each once with mermaid.js.
4. Write the rule. When it touches the definition of the tree, follow item 3 of
   section 4.
5. Add fixtures (section 5), contrasting examples included.
6. Show the result as in section 7.

When only fixtures are needed (such as the grounds of a rule idea), do section 5
for each item, and show for each item either the names added or the names of
existing fixtures that suffice, with their `accepted` and values.
