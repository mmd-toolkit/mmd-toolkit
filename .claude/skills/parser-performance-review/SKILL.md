---
name: parser-performance-review
description:
  Investigate size-dependent performance of a Mermaid parser, including a newly
  implemented diagram type, using valid complete diagrams and measured public
  API calls. Produce independently reproducible findings and repair priorities.
  Use for a requested parser performance review, not ordinary implementation or
  conformance testing.
---

# Parser performance review

Japanese version: [SKILL.ja.md](./SKILL.ja.md)

A finding is a valid complete Mermaid input that the public parser parses
slowly, with recorded timings and the source and specification that explain it.
A syntax failure is not required.

## Scope

Read AGENTS.md and [conventions](../conventions/SKILL.md). Confirm the requested
diagram types and whether shared processing is included. Read the current public
entry, dispatch, specification, fixtures, and pinned Mermaid version; do not
reuse an old diagram list or old measurements.

The output is review reports and standalone reproductions. Size variation of a
fixed valid shape belongs in a reproduction only, never in a package test, the
corpus, random inputs, or products of syntax fragments. Do not fix production
code, change fixtures, commit, or change staging.

Keep unconfirmed probes and logs outside the working tree, and write confirmed
reports where the request says. Record the source state measured, including
local changes, since later edits can invalidate a result.

## Find candidates from the actual parsing path

Read the diagram's lexer, grammar, and rejection checks, with the shared
functions they call and the specification rules they implement. Follow the
public entry through preprocessing to the final AST. Find the other callers of a
suspect shared operation before stating its scope.

Questions to ask: does a failed suffix lookahead advance one character and
retry; does every statement or node scan a global collection; does every
ancestor copy all descendant units; does a search restart through ordered ranges
or go past a known boundary.

For each candidate, name what grows and what stays fixed: a long ID, many
statements, deep nesting, or two quantities whose product is the cost. Relate
them to the total source length. Check whether the specification or the required
output entails the work; a matching priority alone does not require rescanning.

## Establish a valid reproduction

Start from a small complete diagram on the suspected path. For every exact input
at every measured size, comparison inputs included, check acceptance by the live
pinned Mermaid and that the Db built from the AST of the unmodified public
`parse(input)` equals Mermaid's Db, before reporting its timing.

If the parser fails only at larger sizes, check that live Mermaid accepts each
exact input with a non-null Db, compare the AST-derived Db where parsing
succeeds, and record the exception and stack where it fails. Report this failure
apart from a quadratic-time finding, and do not present an observed failing size
as a limit or the smallest failure.

Use the current helpers of `packages/tests`, such as
`runMermaidWithEmbeddedData` and `dbFromTree`, with the embedded data and
browser stand-ins they require, and `MMD_TOOLKIT_MERMAID_CACHE=disabled`. Read
their current contracts. A missing normalizer, an environmental failure, or a
resource exception of live Mermaid before the target parser runs is a validation
limitation: neither a successful comparison, a parser failure, nor a syntax
rejection. Do not report an unexecuted size as tested.

Keep one valid shape at several explicit sizes. Vary the dimension that causes
the suspected repeated work, and say when two must grow together. A comparison
input may show the trigger, such as LF-only versus space-filled blank lines; do
not call an untested alternative safe. Choose sizes and sample counts for
interpretable results and reasonable machine load.

Write every complete input in the standalone reproduction as a multiline
template literal, one diagram line per line, with visible escapes only for
invisible trigger characters (spaces, tabs, CR). `.repeat(...)` may scale the
identified part; do not use generic builders that hide the diagram. Do not
create `input.mmd`, fixture files, or a shared reproduction helper. Existing
parser and Db-validation imports are allowed; each reproduction explains its own
input and measurement.

## Measure the complete public parse

Time only the unmodified public parser call; input construction, live Mermaid,
Db comparisons, warm-up, assertions, sorting, and logging stay outside. Do not
use internal-helper calls, monkey patches, work counters, or operation budgets
instead.

Run measurements one at a time, while no other heavy check runs on the machine.
Keep every sample, the median, size-to-size ratios, total UTF-16 source length,
the growing dimensions, runtime and pinned Mermaid versions, command, source or
built entry, and nondefault options. Keep validation-helper stack requirements
apart from parser behavior. Setting a validation option does not show that the
API enforces it or that acceptance needed it; check that path before claiming
either.

Analyze the repeated work in the source independently of the timings. Finite
ratios are no asymptotic proof and need not be four when the input doubles.
Account for linear costs, reader lookups, output size, and noise. When several
operations grow with the same input, whole-parse times and their differences are
not isolated function times.

When the quadratic argument rests on a repeated bulk collection operation, check
its behavior in the measured runtime, and mark that evidence **Read**. A
verified cost component does not show its isolated time or that it dominates.

A timing assertion may flag excessive growth; its threshold is no performance
contract. Do not tune it to get a failure, drop samples, or remeasure until a
preferred result appears. Acceptance and Db checks pass independently of the
timing. If the slowdown is not established, keep the candidate unconfirmed.

## One finding per cause

For each confirmed cause, create one descriptive directory containing:

| File                 | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `report.md`          | Evidence, source cause, and repair scope    |
| `report.ja.md`       | Japanese version of the report              |
| `reproduce.test.mjs` | Complete inputs, validation, and timing     |
| `importance.md`      | Repair priority and its reasons             |
| `importance.ja.md`   | Japanese version of the priority assessment |

No README, aggregate report, input fixture, or shared test framework. One cause
reproduced in several diagrams is one directory; similar scans needing separate
repairs are separate directories.

The report gives the symptom, exact trigger, measured sizes and times, command
and conditions, source locations, repeated operation, and relation to the
specification. It states the repair needed, bounded to preserve acceptance,
token text, source ranges, whitespace, directives, comments, and the other
relevant decisions, without implementing it or proposing unrelated refactoring.

It opens with the valid shape measured as slow, its growing dimension, and the
measured delay. A small accepted example is labeled as a reduced illustration,
not the slow reproduction. The reproduction's opening comments name the repeated
work and what a comparison changes, before the measurement code.

An example labeled as executed is identical to its tested input, whitespace
included.

Mark executed evidence **Run**, source and specification evidence **Read**, and
name the unmeasured cases. Shared source does not show measured behavior in
every diagram. Do not extend a finite measurement to all inputs or imply that no
other problem exists. Classify a correctness disagreement separately under the
review rules; it does not replace the performance investigation.

## Assess repair priority

Rate high, medium, or low as a relative repair order, from the necessary input
shape, plausible occurrence, measured absolute delay and source size, and
confirmed scope. Keep likelihood judgments apart from usage statistics. Ordinary
syntax does not make thousands of repetitions or nesting levels ordinary; a
small source with a large delay weighs heavily.

Distinguish blank-line runs from hundreds of inline spaces, and plain whitespace
from whitespace with growing directive counts. Shared code widens possible
exposure but does not show prevalence. State what real usage would change the
priority. Do not claim editor, formatter, or linter timings that were not
measured. A low-priority finding is still reported.

## Verify and hand over

In a rereview, classify each finding as introduced by a fix, present before and
missed, or new scope, and for a missed one name the case or path the earlier
review did not cover. If the earlier reproduction is unavailable, label current
equivalent inputs as new probes. Keep reading a repair apart from measuring it,
and keep a negative result within its measured sizes.

Run each final reproduction on the reported source state, and check its outcomes
and every reported value against the log. Keep validity and Db results apart
from the timing diagnosis, and keep raw samples. Rerun only after a change to
parser code, input values, or measurement logic, or for an open concern; edits
to prose alone need no rerun once the inputs and measurement logic are checked
unchanged.

Check English/Japanese correspondence, local source links, invisible characters,
Japanese width, and formatting. Where a check skips the report's location, check
the report files explicitly, without changing tracked check configuration. Run
only the checks the changes need.

Report each finding when it is complete, with its link and the executed
evidence, and keep unconfirmed candidates and unmeasured scope apart from it.

## When Codex interrupts a response

A notice headed `このコンテンツは表示できません` that mentions cybersecurity
safeguards or Daybreak is a response interruption, not a parser rejection or a
failed test. The
[OpenAI documentation](https://learn.chatgpt.com/docs/cyber-safety#false-positives)
says legitimate work can trigger safeguards; that does not establish the cause
of a given notice.

- Record the notice and whether it was seen directly or reported. Keep what
  completed apart from what is unverified. Do not state a cause, or that a model
  change or an
  [access request](https://learn.chatgpt.com/docs/cyber-safety#trusted-access-for-cyber)
  will clear it.
- Keep completed reports, raw samples, commands, source state, and the last
  verified step. On resumption, check saved files, log completion, and the
  measurements still running before retrying; compare current inputs and source
  with the recorded state; continue the review with incomplete checks marked
  pending. Partial output is not evidence. Do not start a benchmark while the
  same one is running.
- Do not try to bypass a safeguard. If a suspected false positive keeps
  blocking, explain the limitation and point to the official `/feedback`
  guidance. Do not send feedback, apply for access, or upload reports or logs
  without the user's authorization.
