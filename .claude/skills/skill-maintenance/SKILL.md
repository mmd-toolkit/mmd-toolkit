---
name: skill-maintenance
description: >-
  Divide the skills under .claude/skills/ by piece of work and move text between
  them without loss. Use when a skill gains records, another file in
  references/, or a new piece of work, when a skill is split or text moves
  between skills, when a section of a skill is renamed or renumbered, when the
  skill lines of AGENTS.md change, and when reviewing such a change.
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
  criteria of the package; the criteria and the rules that more than one piece
  of work on the package needs, or that a piece of work without a skill of its
  own needs; and the steps that every piece of work follows. A method that
  several pieces of work use is such a step (the sections of
  [`spec`](../spec/SKILL.md) from Adding the nodes of the tree to Proposing a
  known divergence), also when its section is titled after one piece of work (in
  `parser`, the subsections of
  [section 4, Adding a diagram type](../parser/SKILL.md#4-adding-a-diagram-type),
  that its other sections point to or whose rules they follow).
- A skill of one piece of work, named `<entry>-<work>` after the entry skill
  whose sections it uses (`tests-diagram-type`, `spec-diagram-type`,
  `tests-mermaid-update`, `rule-ideas-suggestions`): the steps, the criteria,
  and the rules that only one piece of work needs, a piece of work that is done
  at another time, from other inputs, to other results than the rest of the
  package's work.
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
- Documents that a piece of work reads only when it needs them, in
  `<skill>/references/<name>.md`: records of past decisions, lists searched for
  one entry, the code of the scripts that the steps run, and, in a skill above
  the size of section 2, the steps of one piece of work or of one case of it
  (`rule-ideas/references/`, `prettier-plugin/references/`, `spec/references/`).
  The `SKILL.md` links each of them directly, at the step that uses it, and says
  what to search a record or a list for; a file in `references/` is never the
  only way to another file. A file in `references/` of more than 100 lines
  starts with a list of its contents, in their order.
  - Steps go there when the request, or a fact that the session has already
    read, tells it that it does that piece of work or meets that case (updating
    mermaid.js, a diagram whose grammar is Langium); when they hold no criterion
    and no rule that also binds other work; and when one link, at the step where
    that work or case starts, reaches them. The heading of a section whose steps
    move stays in the `SKILL.md`, with that link.
  - A file there that names the sections of its `SKILL.md` by number says so in
    its first sentence (`Section numbers below are those of SKILL.md.`), and a
    change that renumbers those sections searches it too (section 4).
- Records of past decisions: the decision on each rule and what was checked for
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
- A list that a piece of work searches for one entry, as the test files of each
  source file of the formatter
  (`prettier-plugin/references/tests-by-changed-file.md`). Like a record, it
  holds no rule that decides a new case.
- AGENTS.md names, in the item of each package, every skill of its work, as the
  item of `packages/eslint-plugin` names `rule-ideas`, `rule-ideas-suggestions`,
  `eslint-plugin`, and `eslint-plugin-rules`.

The official documents on skills set this form:
[the Agent Skills specification](https://agentskills.io/specification) lets a
skill folder hold any files beside `SKILL.md` and recommends `references/` for
the documents that an agent reads when needed, a `SKILL.md` under 500 lines with
a body under 5,000 tokens, and references one level deep from `SKILL.md`;
[Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
adds that every reference file is linked directly from `SKILL.md`, and that a
reference file longer than 100 lines starts with a table of contents, since
Claude may read only its first lines; and
[the skills documentation of Claude Code](https://code.claude.com/docs/en/skills)
says that such files are loaded only when they are needed.

## 2. When to split, and when not

Measure before deciding: the size of each part (`wc -c`), and which pieces of
work use it. A piece of work uses a part when its steps point to it, and also
when the part holds rules that what its steps do is subject to (a step that
implements a changed rule follows the rules of writing a lexer and a grammar,
though it names no section). State the sizes and the uses with the decision, so
that it can be checked. A `SKILL.md` body longer than the 500 lines or the 5,000
tokens that the official documents recommend is measured so. The tokens are
estimated as the bytes of the body that `wc -c` counts divided by 4, so a body
of more than 20,000 bytes is longer. Above that size, the parts that not every
piece of work of the skill uses are sorted as readers who do not know the
decision classify them: the steps and the lists of one piece of work or one case
go to `references/` (section 1), the criteria and the rules that one piece of
work alone needs go to the skill of that piece of work, and the criteria and the
rules that several pieces of work need stay. A skill made for this adds its
description to the listing of every session, which Claude Code cuts to a budget
of 1% of the context window, dropping first the descriptions of the skills used
least
([the skills documentation of Claude Code](https://code.claude.com/docs/en/skills#skill-descriptions-are-cut-short));
a part smaller than such a description stays. The decision states each part that
stays above the size: its size, the pieces of work that use it, why it stays,
and the answer of a reader who does not know the decision.

Split when:

- a part that only one piece of work uses is a large share of what the other
  pieces of work load without using it; or
- a skill holds records of past decisions in its body: they move to its
  `references/`; or
- sessions of other skills read a part alone (the scripts that `rule-ideas`
  runs, which `eslint-plugin` and `eslint-plugin-rules` also run): it moves to
  `references/`, so that they read only it.

Do not split when:

- splitting would hardly reduce what the other pieces of work load, because they
  use most of the part too (in `parser`,
  [section 4, Adding a diagram type](../parser/SKILL.md#4-adding-a-diagram-type),
  holds the rules of writing a lexer and a grammar, which implementing a changed
  rule follows too, and the steps that its sections 5 to 7 use by number; only
  its input, its wiring, the entry of the diagram's parser, and its documents
  are for a new diagram type alone); or
- there is no other piece of work to split off: the skill is the steps of one
  piece of work (`review`, `parser-performance-review`), or the rules that every
  piece of work shares (`conventions`).

When a part moves to a skill of one piece of work, a sentence in it that other
pieces of work also need stays in the entry skill, in a section that those
pieces of work reach (how the document of a new known divergence is written is
in `spec`, in the
[section on proposing a known divergence](../spec/SKILL.md#8-proposing-a-known-divergence),
which fixing a gap reaches through item 4 of the
[section on checking a rule](../spec/SKILL.md#6-checking-a-rule)).

A step that two pieces of work share, such as a list that is filled during one
of them and emptied during the other, is reached from the skills of both: the
skill that does not hold the step points to it at the step of its own procedure
at which the shared step is done (the lists of the diagram types without
recorded trees are filled during the steps of `tests-diagram-type`,
[whose step](../tests-diagram-type/SKILL.md#2-the-normalizer) says how to fill
and empty them, and emptied once the trees are recorded, during step 8 of
[`tests-tree-checks`](../tests-tree-checks/SKILL.md), which points to that step
there). Where a step moves out of a section that other pieces of work also read,
a pointer to it stands where it stood.

## 3. Moving text without changing it

1. Plan before moving: the line ranges of each file, English and Japanese, and
   where each goes; every sentence that changes inside a range (a reference
   whose target moves, a heading), old and new; and the new text in full. Read
   the boundary lines of every range before using its numbers.
2. Move the text unchanged: only the planned sentences change, and the
   rewrapping of Prettier and `pnpm run lint:md --fix` is no change. A sentence
   that seems out of place, duplicated, or stale is reported, not fixed in the
   move.
3. Check mechanically that each range, with its planned changes, stands in its
   new place exactly once (English with each run of whitespace as one space,
   Japanese with all whitespace removed), and read the text that no range
   accounts for: it is the planned new text.
4. Compare the move a second time without the table of the plan: every sentence
   of the old files, word by word, against the new files, in order and in one
   place. When sections are renumbered, the comparison replaces section numbers
   with one placeholder and checks each changed reference against a table of old
   numbers and new places; it is told which sentences moved between sections,
   and where, so that they are not counted as lost.
5. Check each English file and its `.ja.md`: the same `name`, a `description`
   that says the same (in English, or in Japanese), headings that say the same
   at the same levels and numbers, the same number of code blocks (indented ones
   too), and Japanese that says what the English says.
6. Search each file of `references/` as the guide of its skill says, for a rule
   named alone and for one covered by a note on a group, and check that both are
   found.
7. Read each changed skill as a session of each piece of work that uses it: from
   the `description` and the opening, it loads the skills it needs, reaches
   every rule that applied to that work before the change (in what it loads, or
   by the pointers there), and loads little else (the sizes, measured as in
   section 2). A rule that it no longer reaches is a finding of the move.
8. Run the document checks that the skill `conventions` names, and
   `pnpm run lint:md`, which reports a link or an anchor that the move broke.

## 4. References that lose their target

A move, or a section renamed or renumbered, can leave a reference pointing at
nothing, or at something else, with no check failing. Before the change, find
every reference to the text that changes and to the text around it:

- Search each file whole, and the files of its `references/`, not only near the
  parts that change, for references by number (`section 7`, `3.5`, `§5.3.8`,
  `item 3 of 3.3`, `7 節`, `3.4〜3.5`), by title, and relative ones (`above`,
  `below`, `here`, `this section`, `this document`, `the table above`, `上の`,
  `下の`, `この節`, `ここ`). A relative reference in text that stays can point
  into text that moves, and one in text that moves can point back.
- Search the whole repository, outside `node_modules`, for references to the
  skill and its sections: the other skills, AGENTS.md, the documents of the
  packages, and comments in code (`the tests skill`, `the spec SKILL`,
  `tests の SKILL`, `skills/<name>/SKILL.md`, links with anchors).
- A reference that names only a skill ("written with the steps of the tests
  skill") still resolves after a split, but it may no longer reach the steps it
  meant: read what it refers to, and name the skill that holds those steps.
- A reference from one skill to one section of another is a link with the anchor
  of the section, so that `pnpm run lint:md` reports it when the section is
  renamed or renumbered; a reference to several sections at once links the skill
  and names the sections.
- After the change, read each reference found: it points to the same text as
  before.

## 5. What no check covers

No check of the repository covers these; steps 4 to 7 of section 3 and section 4
check them: that moved text says what it said, that a reference written in prose
still reaches what it meant, that the guide to a records file finds what is
searched for, that each piece of work still reaches every rule that applies to
it, that each file of `references/` is linked from its `SKILL.md`, and that the
frontmatter of a `.ja.md` says what that of its English file says.
