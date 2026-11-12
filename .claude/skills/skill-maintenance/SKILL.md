---
name: skill-maintenance
description: >-
  Keep the skills under .claude/skills/ divided so that each session loads the
  rules of its work and little else: what goes in the entry skill of a package,
  in a skill of one piece of work, and in a records file; when to split a skill
  and when not to; how to move text between files, or rename or renumber a
  section, without changing what it says or losing a reference to it, and how to
  check that. Use when records or a new piece of work are added to a skill, when
  a skill is split or text moves between skills, when a section of a skill is
  renamed or renumbered, when the skill lines of AGENTS.md change, and when
  reviewing such a change.
---

# Keeping the skills divided by work (skill-maintenance)

A skill under `.claude/skills/<name>/` is chosen by the `name` and the
`description` of its `SKILL.md`, and its `SKILL.md` is loaded whole each time it
is used. This skill says how the skills are divided so that this works, and how
a division is changed. What holds for every Markdown document (the English and
Japanese pair, the wrapping, the document checks) is in the skill `conventions`.

## Policies and criteria

- The criterion: a session doing a piece of work loads the rules of that work,
  loads little else, and misses none of the rules that apply to it. Each rule
  below applies this criterion; a case that no rule covers is decided by
  applying it.
- A rule is written in one place. A rule that several skills need is in the one
  skill that every session concerned loads (the entry skill of the package, or
  `conventions`), and the others point to it.
- A pointer to another file is a promise that the session follows it, and
  nothing enforces it. So a pointer sends a session only to the steps of a piece
  of work or to records; a criterion, and a rule that is wrong to miss, stays in
  a file that the session loads: the skill of its work, or the entry skill that
  the skill of its work names and that the descriptions lead the session to
  load.
- The work a split takes (headings and numbers to change, references to rewrite)
  is no reason to keep a division that fails the criterion.

## 1. What goes where

- The entry skill of a package (`spec`, `tests`, `parser`, ...): the section
  Policies and criteria, which AGENTS.md names as the place of the policies and
  criteria of the package; the rules that are wrong to miss; and the steps that
  every piece of work on the package follows. A method that several pieces of
  work use is such a step (the sections of `spec` from Reading mermaid.js to
  Proposing a known divergence), also when its section is titled after one piece
  of work (in `parser`, the subsections of section 4, Adding a diagram type,
  that its other sections point to or whose rules they follow).
- A skill of one piece of work, named `<package>-<work>` (`tests-diagram-type`,
  `spec-diagram-type`, `tests-mermaid-update`): the steps of a piece of work
  that is done at another time, from other inputs, to other results than the
  rest of the package's work.
  - Its `description` says what it does and when to use it, concretely, and ends
    with "together with the <entry> skill" when the entry skill holds rules for
    it.
  - Its body starts by naming the sections of the entry skill that hold for its
    steps, and says to read them first.
  - The `description` of the entry skill names, among its uses, every piece of
    work on the package, also those that have skills of their own, and says that
    they have them, so that a session doing one of them loads the entry skill as
    well.
  - Where its steps go through sections of the entry skill, it lists the steps
    in their order and names each section by its title, with a link to its
    anchor.
- Records of past decisions, in `<skill>/records/<name>.md`
  (`rule-ideas/records/`): the decision on each rule and what was checked for
  it. A record is searched, not read whole.
  - The section of the skill that a record belongs to says what to search for:
    the name of a rule, its `<diagram>-<name>` form where a note covers a group
    of rules, the item of a diagram type, the paragraph that opens the notes of
    a diagram type.
  - A record writes every rule name in full, so that a search for the name finds
    it.
  - A sentence that also decides new cases (a rule over a kind of rule, not over
    one rule) is no record: it is in the skill, also when it stands among the
    records.
- AGENTS.md names, in the item of each package, every skill of its work, as the
  item of `packages/eslint-plugin` names `rule-ideas`, `eslint-plugin`, and
  `eslint-plugin-rules`.

## 2. When to split, and when not

Measure before deciding: the size of each part (`wc -c`), and which pieces of
work use it. A piece of work uses a part when its steps point to it, and also
when the part holds rules that what its steps do is subject to (a step that
implements a changed rule follows the rules of writing a lexer and a grammar,
though it names no section). State the sizes and the uses with the decision, so
that it can be checked.

Split when:

- a part that only one piece of work uses is a large share of what the other
  pieces of work load without using it; or
- a skill holds records of past decisions in its body: they move to its
  `records/`.

Do not split when:

- splitting would hardly reduce what the other pieces of work load, because they
  use most of the part too (in `parser`, section 4, Adding a diagram type, holds
  the rules of writing a lexer and a grammar, which implementing a changed rule
  follows too, and the steps that its sections 5 to 7 use by number; only its
  input, its wiring, the entry of the diagram's parser, and its documents are
  for a new diagram type alone); or
- there is no other piece of work to split off: the skill is the steps of one
  piece of work (`eslint-plugin`, `review`, `parser-performance-review`), or the
  rules that every piece of work shares (`conventions`).

When a part moves to a skill of one piece of work, a sentence in it that other
pieces of work also need stays in the entry skill, in a section that those
pieces of work reach (how the document of a new known divergence is written is
in `spec`, in the section on proposing a known divergence, which fixing a gap
reaches through item 4 of the section on checking a rule).

A step that two pieces of work share, such as a list that is filled during one
of them and emptied during the other, is reached from the skills of both: the
skill that does not hold the step points to it at the step of its own procedure
at which the shared step is done (the lists of the diagram types without
recorded trees are filled during the steps of `tests-diagram-type`, whose step
says how to fill and empty them, and emptied once the trees are recorded, during
step 8 of `tests-tree-checks`, which points to that step there). Where a step
moves out of a section that other pieces of work also read, a pointer to it
stands where it stood.

## 3. Moving text without changing it

1. Write the plan before moving anything: a table of the line ranges of each
   file, English and Japanese, with the file and the place each range goes to;
   each sentence that changes inside a range (a reference whose target moves, a
   heading), with its old and its new text; and the new text (a guide, a
   heading, a frontmatter) in full. Read the boundary lines of every range in
   the file before using its numbers.
2. Move the text unchanged. Only the planned sentences change; the rewrapping
   that Prettier and `pnpm run lint:md --fix` do is no change. A sentence that
   seems out of place, a duplicate, or a stale sentence is listed and reported,
   not fixed in the move.
3. Check mechanically that each range, after its planned changes, stands in its
   new place exactly once: compare English with each run of whitespace read as
   one space, and Japanese with all whitespace removed. List the text of each
   new file that no range accounts for, and read it: it is the planned new text
   and nothing else.
4. Check the move a second time without the table of the plan: compare every
   sentence of the old files, word by word, with the new files, and check that
   the order is kept and nothing is in two places. When sections are renumbered,
   replace the section numbers with one placeholder before comparing, and check
   each changed reference against a table of the old number and the new place.
   Give this comparison the sentences that moved between sections, with their
   old and new places, so that they are not counted as lost.
5. Check each English file and its `.ja.md`: the frontmatter the same byte for
   byte, headings that say the same at the same levels and with the same
   numbers, the same number of code blocks (indented ones too), and new Japanese
   text that says what the English says.
6. For each records file, search it as the guide of its skill says, for a few
   rules of different kinds (one named alone, one covered by a note on a group),
   and check that the search finds each decision.
7. Read each skill that changed as a session of each piece of work that uses it:
   from its `description` and its opening, does that session load the skills it
   needs, and does it reach, by what it loads and the pointers there, every rule
   that applied to that work before the change, and does it load little else
   (the sizes of what it loads, measured as in section 2)? A rule that it no
   longer reaches is a finding of the move.
8. Run the document checks that the skill `conventions` names, and
   `pnpm run lint:md`, which reports a link or an anchor that the move broke.

## 4. References that lose their target

A move, or a section renamed or renumbered, can leave a reference pointing at
nothing, or at something else, with no check failing. Before the change, find
every reference to the text that changes and to the text around it:

- Search each file whole, not only near the parts that change, for references by
  number (`section 7`, `3.5`, `§5.3.8`, `item 3 of 3.3`, `7 節`, `3.4〜3.5`), by
  title, and relative ones (`above`, `below`, `here`, `this section`,
  `this document`, `the table above`, `上の`, `下の`, `この節`, `ここ`). A
  relative reference in text that stays can point into text that moves, and one
  in text that moves can point back.
- Search the whole repository, outside `node_modules`, for references to the
  skill and its sections: the other skills, AGENTS.md, the documents of the
  packages, and comments in code (`the tests skill`, `the spec SKILL`,
  `tests の SKILL`, `skills/<name>/SKILL.md`, links with anchors).
- A reference that names only a skill ("written with the steps of the tests
  skill") still resolves after a split, but it may no longer reach the steps it
  meant: read what it refers to, and name the skill that holds those steps.
- A reference from one skill to a section of another is a link with the anchor
  of the section, so that `pnpm run lint:md` reports it when the section is
  renamed or renumbered.
- After the change, read each reference found: it points to the same text as
  before.

## 5. What no check covers

No check of the repository covers these; steps 4 to 7 of section 3 and section 4
check them: that moved text says what it said, that a reference written in prose
still reaches what it meant, that the guide to a records file finds what is
searched for, that each piece of work still reaches every rule that applies to
it, and that the frontmatter of a `.ja.md` equals that of its English file.
