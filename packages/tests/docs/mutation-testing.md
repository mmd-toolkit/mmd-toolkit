# Mutation differential testing

Japanese version: [mutation-testing.ja.md](./mutation-testing.ja.md)

This document explains how `@mmd-toolkit/tests/mutation` compares an
implementation with mermaid.js, and how to read its report.

## What it does

It derives inputs one edit away from a fixture, runs each through mermaid.js and
through a candidate implementation, and reports disagreements in acceptance,
diagram id, or Db summary. The edits are: delete, insert or replace a character;
delete, duplicate or swap a token or a line. Characters are inserted or
substituted from a fixed alphabet (in `src/mutation.ts`): the punctuation that
carries meaning somewhere in mermaid.js's grammars, the kinds of whitespace and
line break (including a lone CR, a no-break space and a byte order mark), one
letter and one digit. Lines end at LF, CRLF or a lone CR.

```js
import { loadFixtures } from "@mmd-toolkit/tests"
import { runMutationDiff } from "@mmd-toolkit/tests/mutation"

const fixtures = await loadFixtures("flowchart")
const report = await runMutationDiff(
  fixtures.map((f) => ({ name: f.name, text: f.input, config: f.config })),
  (text) => ({ accepted: myParserAccepts(text) }),
  { count: 20, seed: 1 },
)
```

Mutants are chosen by a seeded generator, so a fixture name and a seed reproduce
a report. `mutate(text, { seed, count })` returns the mutants alone, each with
the edit that made it.

## Other inputs

Inputs need not be fixtures:

- `generatedInputs(generator, seeds, count, prefix)` names the output of an
  input generator `(seed, count) => Iterable<string>` as
  `<prefix>-s<seed>-<index>`;
- `compareAll(inputs, candidate)` compares inputs unchanged;
- `runMutationDiff(..., { includeInputs: true })` compares each input before its
  mutants.

Texts mermaid.js cannot decide in Node are reported as `skipped`.

## The candidate

The candidate is called as `candidate(text, config, embedded)` and returns
`{ accepted, diagramType?, db?, knownDivergence? }`, or a promise of it.

`embedded` is what `resolveEmbeddedData()` would return for the text, taken from
the same mermaid.js run: use it to build Db values that depend on embedded data
(see [embedded-data.md](./embedded-data.md)). It is `undefined` when mermaid.js
rejected the text.

The candidate may return only `accepted` at first. `diagramType` and `db` are
compared only when the candidate returns them, and `report.comparedParts` counts
how often each was. Pass `require: ["diagramType", "db"]` (CLI: `--require db`)
to report a candidate that leaves a part out as a `missing-*` mismatch.

## Known divergences

A candidate that recognizes an input where the specification may depart from
mermaid.js returns `knownDivergence` with one of `KNOWN_DIVERGENCES`.

- A difference in acceptance, diagram id or Db is then reported in
  `report.divergences` instead of as a mismatch.
- If the results agree anyway (grammar can join the pieces again), the
  declaration is only counted in `report.declaredWithoutDifference`.
- An identifier outside `KNOWN_DIVERGENCES` is an `unknown-divergence` mismatch.
- A required part left out is a `missing-*` mismatch even when declared.

Mutants do not inherit a fixture's `knownDivergence`, since an edit can remove
the difference.

## The report

| Field                       | Contents                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| `compared`                  | The number of texts compared.                                                                     |
| `comparedParts`             | How many had their diagram id and their Db summary compared.                                      |
| `mismatches`                | Disagreements, with the text, the edit (`description`), the input it came from, and both results. |
| `divergences`               | Differences the candidate declared as known divergences.                                          |
| `declaredWithoutDifference` | By identifier, texts declared as known divergences on which the results agree anyway.             |
| `skipped`                   | Texts mermaid.js could not decide in Node, with the reason; not a verdict on the candidate.       |

## The command line

```sh
pnpm --filter @mmd-toolkit/tests run mutation --candidate <module> --seed 1
```

`<module>` default-exports the candidate. Every fixture of `--diagram` (default
`flowchart`), or those named with `--fixture`, is mutated. The CLI lists
divergences by identifier and does not fail on them; it exits with 1 on any
mismatch or skipped text.

A fixture is mutated once with each edit operator that applies to it (a fixture
of one line has no line to swap), in an order that a seed and the fixture
decide, at a position chosen at random among those of the operator. So the first
mutants of a fixture use different operators, and every operator that applies is
used, whatever the seed. `--count` is the number of mutants of each fixture;
without it, there is one round, one mutant for each operator that applies. With
`--count` of one, the operator is chosen at random among those that apply. More
than one round uses an operator again: raise `--count` to widen the forms of the
mutants of an operator, not to be surer: more mutants of the same kind find
nothing more. An operator with few places (swapping two lines of a text of
three) has few distinct mutants, and no other operator takes its place, so a
fixture can get fewer mutants than `--count`.
