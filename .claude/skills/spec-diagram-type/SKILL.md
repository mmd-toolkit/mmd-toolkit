---
name: spec-diagram-type
description: >-
  Add a diagram type to the specification under packages/spec/docs/: the order
  of the steps, the detection rules of a Langium diagram type, the diagram
  document with its four sections, and the checks before the parser reads the
  specification. Use when a diagram type is added to the specification, after
  the tests skills have collected its fixtures, together with the spec skill.
---

# Adding a diagram type to the specification (spec-diagram-type)

The section Policies and criteria and sections 1 to 8 of the skill
[spec](../spec/SKILL.md) (what to read first, the tools, reading mermaid.js, the
nodes of the tree, claims and fixtures, checking a rule, the output, and
proposing a known divergence) hold for these steps. Read that skill first.

## 1. The steps

Input: the diagram type's Db normalizer and its collected fixtures (sections 2
and 3 of the [tests-diagram-type](../tests-diagram-type/SKILL.md) SKILL). The
reading of mermaid.js
([Reading mermaid.js](../spec/SKILL.md#3-reading-mermaidjs) in the spec skill)
and the proposal of the tree (item 3 of
[Adding the nodes of the tree](../spec/SKILL.md#4-adding-the-nodes-of-the-tree)
in the spec skill) do not need the fixtures and may start while they are
collected; check the claims with inputs written for the purpose
([Checking inputs with mermaid.js](../spec/SKILL.md#21-checking-inputs-with-mermaidjs)
in the spec skill), and turn them into fixtures once the collection is done, so
that a claim does not get a second fixture for an input that the collection
already has.

Adding a diagram type follows these sections, in this order:

1. [Reading mermaid.js](../spec/SKILL.md#3-reading-mermaidjs) in the spec skill;
   for a Langium diagram type, then section 2 below.
2. Section 3 below, Writing the diagram document.
3. [Adding the nodes of the tree](../spec/SKILL.md#4-adding-the-nodes-of-the-tree)
   in the spec skill.
4. [Matching claims with fixtures](../spec/SKILL.md#5-matching-claims-with-fixtures)
   and [Checking a rule](../spec/SKILL.md#6-checking-a-rule) in the spec skill.
5. [Output](../spec/SKILL.md#7-output) in the spec skill.
6. Section 4 below, Checks before the parser reads the specification.
7. [Proposing a known divergence](../spec/SKILL.md#8-proposing-a-known-divergence)
   in the spec skill.

## 2. Detection, and the steps after the reading, for a Langium diagram type

These items follow items 1 to 5 of
[references/reading-langium.md](../spec/references/reading-langium.md) of the
spec skill.

6. Read the shared preprocessing and detection rules in
   [common.md](../../../packages/spec/docs/common.md): Reading a source,
   Frontmatter, Leading whitespace and Diagram detection. Read the diagram's
   detector in [detection.md](../../../packages/spec/docs/detection.md). Before
   writing Detection in section 3, record the following as direct sentences with
   fixed cases:
   - Distinguish real leading frontmatter from the single retained
     frontmatter-shaped block at the detection point. Record the one-block skip
     and its order before bare `%%` lines and the second directive scan.
   - Record the skip's stopping cases: adjacent fences without a body line, a
     missing closer, mismatched indentation, four dashes, closing-fence suffix
     text, a closer without a following line break, and a preceding bare `%%`
     line. Check a second block, both orders of a block and a second-scan
     directive, real frontmatter before a retained block, and leading
     indentation that changes which fences match.
   - Distinguish the detection point from the header position reached. Record
     which retained forms the diagram's lexer still reads from the detection
     point, under its own terminal boundaries and acceptance gate. Record which
     bare `%%` lines and accompanying whitespace and line breaks detection
     passes and the lexer does not read again: shared Comments for the bare
     lines, trivia for that whitespace and those line breaks. Distinguish
     leading trivia before the detection point from later whitespace the diagram
     still reads.
   - List fixed cases with retained forms before and between passed bare lines,
     and with passed lines and trivia between retained forms. Compare Unicode
     whitespace after a passed line with the same whitespace without a passed
     line and with ASCII space/tab and LF controls; include whitespace
     immediately before the header and on a line of its own. Record what
     detection passes or retains, which terminal boundary must match, acceptance
     and tree ownership for each case, using Matching claims with fixtures and
     Checking a rule in the [spec](../spec/SKILL.md) skill.
   - Recheck any shared claim that other diagram types reject a form against
     their current rules and fixed fixtures. State only the scope supported by
     that evidence; do not carry forward a historical list of diagram types.
7. Apply section 3 of this skill and Adding the nodes of the tree, Matching
   claims with fixtures, and Checking a rule in the [spec](../spec/SKILL.md)
   skill to the resulting detection rules, ordered units, authored components,
   hidden forms, conversions and acceptance gate. Write direct sentences and the
   tree before considering divergences. For each sentence, probe explicit cases
   at its named boundaries and rule intersections through the tests package's
   Mermaid runner; cover hidden-form ownership, delimiters, consumed line feeds,
   EOF and the reverse direction of any divergence. Add only the cases the
   sentence distinguishes, with the fixture CLI. Do not generate inputs. Derive
   header, flag and statement gaps and their EOL requirements from this
   diagram's entry and fragment rules rather than a preceding diagram's layout.

## 3. Writing the diagram document

Write `docs/diagrams/<diagram>.md` and its `.ja.md` with the four sections of
"How to read a diagram document" in index.md.

1. Detection: point to the detector in detection.md.
2. Lexical structure: the units and the contexts, with the list of rules of each
   context in the order they are tried. "Units and contexts" in flowchart.md is
   an example of the form.
3. Grammar: in the Notation of common.md, with a table of the node that each
   rule makes, and the inputs that mermaid.js rejects after its grammar has
   accepted them, with all that decides them (Rejections outside the grammar).
   State semantic acceptance as direct rules over written statements, with the
   comparison values and state changes it needs. For conditions depending on
   site configuration outside the text, state the defaults and that whoever
   holds a changed configuration applies it, while the remaining conditions are
   decided from the tree alone.
4. Known divergences: those of the identifiers in known-divergences.md that
   apply to the diagram type, and how they show in it. A new divergence is
   defined as
   [Proposing a known divergence](../spec/SKILL.md#8-proposing-a-known-divergence)
   in the spec skill says.

The Db summary of a diagram type and how it is built from the tree are documents
of `@mmd-toolkit/tests` (`docs/db-summaries.md` and
`docs/db-from-tree/<diagram>.md`); what they need is written there with the
steps of the tests-diagram-type SKILL (the summary) and of the tests-tree-checks
SKILL (how it is built from the tree).

## 4. Checks before the parser reads the specification

The parser is written from the specification alone. Before that, go through
these checks for the diagram type, and write the result of each in the output
([Output](../spec/SKILL.md#7-output) in the spec skill).

1. **Unit names.** List every unit name of the lexical structure and the
   grammar, the names of the rules of the grammar included. One name names one
   unit: a keyword unit and a unit of text never share a name (state: the
   keyword is `style`, and the text of a style is `style-text`).
2. **Every character in a unit.** In every context, every character that is not
   whitespace belongs to a unit, a comment, or a stated rejection: separators
   such as the `:` of a one-line note or of an alias, the `;` that the line rule
   ignores, and text that a rule of mermaid.js reads and returns no token for
   (an id that `processId` drops, an empty description block). The parser gives
   each unit a token kind, and the ignored `;` a kind for each context, in
   `packages/parser/docs/tokens/<diagram>.md`; the specification names each unit
   so that it can.
3. **The grammar takes every unit.** Every unit that the lexical structure
   lists, punctuation included, appears in a rule of the grammar, and every unit
   of a rule comes from a rule of the lexical structure.
4. **Comments.** Each diagram comment has its mark (`#`, `%%`) and its value,
   with examples: a comment in an id, a comment after a statement, and a
   directive between the characters of the mark or inside the value.
5. **Forms that are not closed.** A node whose form is accepted without its
   closing part (a description block at the end of the text) has a `closed`
   field.
6. **The tree document stands alone.** Each node has its own section and table
   of fields in `ast/<diagram>.md`; no section is written as "as
   `<OtherDiagram>Node`". The conditions under which a field is null, and the
   empty forms, are in the table or below it.
7. **The summary, field by field.** For each field of each record of the
   summary, tally over all fixtures of the diagram type the three cases: the key
   is missing, the value is empty, the value is set. Each case that occurs is
   explained, with a fixture, by a sentence of `docs/db-from-tree/<diagram>.md`
   of the tests package; a sentence for a case that no sentence explains is
   written with the steps of the tests-tree-checks SKILL. Look in the Db class
   for what is set only on the first visit, what accumulates, and what an update
   leaves as it was (`Object.assign` keeps the keys that the new object does not
   have).
8. **What the Db reads beyond the values.** The tree holds what changes the Db:
   as values (whitespace that mermaid.js reads, also a value that is all
   whitespace), as null elements of a list (an empty item between `,`), or as
   tokens (whether a `:` is there). What no node or token can hold is written as
   item 4 of
   [Adding the nodes of the tree](../spec/SKILL.md#4-adding-the-nodes-of-the-tree)
   in the spec skill says.
9. **Ranges.** Every "any characters" says whether line feeds, U+2028, and
   U+2029 are included, whether as many or as few as possible are read, and
   where the rule is tried again (a rule is tried at every position of its
   context, also after a unit that does not leave it).
10. **Empty units.** For every string and text unit, say whether it may be
    empty, and where the grammar takes an empty one (`string` and
    `string-or-empty`).
11. **Empty ends of lists.** For every list (statements of a body, items between
    `,`, lines, the dividers of a body), say what happens when nothing follows
    its last separator: a body that ends with a divider, a list of ids or styles
    that ends with `,`, a text that ends right after a keyword. Check each with
    mermaid.js and the Db class; mermaid.js often builds a different structure
    when the last part is empty (state does not divide a body whose last
    statement is a divider).
12. **What follows a keyword.** For every keyword, check with mermaid.js what
    happens when a word character, a digit, `-`, `:`, `#`, `%`, `{`, `"`, a line
    feed, or the end of the text follows it, and say in the rule whether the
    keyword may be followed by a word character. In jison, a rule whose pattern
    ends with a word character, such as `"left of"`, gets `\b` at its end, and
    one that ends with `\s+` or `\s*` does not.
13. **Known divergences.** Every input of the diagram type that is a known
    divergence, under a new identifier or an existing one, has the four answers
    of
    [Proposing a known divergence](../spec/SKILL.md#8-proposing-a-known-divergence)
    in the spec skill written down.

The tally of item 7, over the records of the summary that are lists of objects:

```ts
// node <this file> <diagram> — tallies, for each field of each record of the
// summary, a fixture where the key is missing, one where the value is empty,
// and one where it is set.
import { loadFixtures } from "<repo>/packages/tests/src/index.ts"
import type { DiagramType } from "<repo>/packages/tests/src/index.ts"

function kind(value: unknown): "missing" | "empty" | "set" {
  if (value === undefined) return "missing"
  if (value === "" || (Array.isArray(value) && value.length === 0))
    return "empty"
  return "set"
}

const fixtures = (await loadFixtures(process.argv[2] as DiagramType)).filter(
  (fixture) => fixture.expected.accepted,
)
// The fields of each record, over all fixtures.
const fields = new Map<string, Set<string>>()
for (const fixture of fixtures) {
  for (const [record, items] of Object.entries(fixture.expected.db)) {
    if (!Array.isArray(items)) continue
    const names = fields.get(record) ?? new Set<string>()
    for (const item of items)
      for (const name of Object.keys(item)) names.add(name)
    fields.set(record, names)
  }
}
const tally = new Map<string, Map<string, string>>()
for (const fixture of fixtures) {
  for (const [record, names] of fields) {
    for (const item of fixture.expected.db[record] as Record<
      string,
      unknown
    >[]) {
      for (const name of names) {
        const cases =
          tally.get(`${record}.${name}`) ?? new Map<string, string>()
        if (!cases.has(kind(item[name])))
          cases.set(kind(item[name]), fixture.name)
        tally.set(`${record}.${name}`, cases)
      }
    }
  }
}
for (const [key, cases] of tally) console.log(key, Object.fromEntries(cases))
```

A field that never occurs as missing in the fixtures may still be missing for
some input; read the Db class for each field whose value can be `undefined`.
