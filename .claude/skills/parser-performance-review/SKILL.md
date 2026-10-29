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

Produce findings a fixer can verify from a complete Mermaid input, recorded
public-parser timings, and the relevant source and specification. A slow valid
input is a performance finding; a syntax failure is not required.

## Scope and repository rules

Read AGENTS.md and [conventions](../conventions/SKILL.md). Confirm the requested
diagram types and whether the request includes shared processing. Discover the
current public parser entry, dispatch, specification, fixtures, and pinned
Mermaid version; do not carry forward a fixed diagram list or old measurements.

This workflow produces review reports and standalone reproductions. Keep
controlled size variation of a fixed valid shape within the user-authorized
performance-report workflow, separately from package conformance tests. That
scope does not authorize generated package tests, corpus additions, random
inputs, or products of arbitrary syntax fragments. Current user instructions and
repository restrictions still take precedence; the location of a file does not
itself create an exception. Use the authorization for the current review, and do
not ask again for an exception already granted for it.

Keep unconfirmed probes and logs outside the working tree. Write confirmed
reports to the location that the request names. This reporting request does not
authorize production fixes, fixture changes, commits, or staging changes. Record
the source state used for measurements, including relevant local changes;
another task's edits can invalidate an earlier result.

## Find candidates from the actual parsing path

Read the diagram's lexer, grammar, and rejection checks, together with the
shared functions they call and the specification rules they implement. Follow
the public entry through preprocessing and final AST construction. Find other
callers of a suspicious shared operation before describing its scope.

Useful questions include whether a failed suffix lookahead consumes only one
character before retrying, whether every statement or node scans a global
collection, whether every ancestor copies all descendant units, and whether a
search restarts through ordered ranges or goes beyond a known boundary. These
are investigation prompts, not a checklist of guaranteed findings.

For each candidate, identify what grows and what remains fixed. Distinguish a
long ID, many statements, deep nesting, and two growing quantities whose product
creates the cost. Relate them to the complete source length. Check whether the
specification or required output itself entails that work. Required matching
priority does not by itself require repeated rescanning.

## Establish a valid, meaningful reproduction

Start with a small complete diagram that exercises the suspected path. Validate
the exact input with the current pinned Mermaid, then use the unmodified public
`parse(input)` and compare the Db built from its AST with Mermaid's Db.

Validate every exact complete input at every measured size, including comparison
inputs, with live pinned Mermaid and Db equality before reporting its timing. A
passing small example does not validate the larger inputs.

If the public parser fails only as input grows, validate every exact input with
live Mermaid and a non-null Db, and compare AST-derived Db where parsing
succeeds. Record the actual exception and stack for failing sizes; an absent AST
cannot pass a Db comparison. Keep this size-dependent failure separate from a
quadratic-time finding, and do not present one observed failing size as a
portable limit or the smallest failure.

Use the current helpers in `packages/tests`, such as
`runMermaidWithEmbeddedData`, `dbFromTree`, and their required embedded data and
browser stand-ins. Disable stored Mermaid results with
`MMD_TOOLKIT_MERMAID_CACHE=disabled`. Check current helper contracts rather than
copying outdated signatures. Missing normalizers or environmental failures are
validation limitations, not successful comparisons or syntax rejections.

If live Mermaid returns a resource exception before the target parser is called,
record that validation limitation. It is neither a target-parser failure nor
proof of invalid syntax. Do not report unexecuted sizes as tested; the exact
input still needs live acceptance and a non-null Db.

Keep the same valid syntax shape at several explicit sizes. Vary the dimension
that causes the suspected repeated work, and state when two dimensions must grow
together. Compare a relevant alternative when it clarifies the trigger, such as
LF-only versus space-filled blank lines, without calling an untested alternative
safe. Choose sizes and sample counts for interpretable measurements and
reasonable machine load; do not reuse old counts mechanically.

Write every complete input directly in multiline template literals in the
standalone reproduction: the diagram's normal lines must be visible as lines,
not compressed into one string full of `\n` escapes. Use visible escapes for
otherwise invisible trigger characters, such as spaces, tabs, and CR. Explicit
`.repeat(...)` expressions may scale the identified part; avoid generic input
builders that hide the diagram. Do not create `input.mmd`, fixture files, or a
shared reproduction helper. Existing parser and Db-validation imports are
allowed; each reproduction must explain its own input and measurement.

## Measure the complete public parse

Time only the unmodified public parser call. Input construction, live Mermaid,
Db comparisons, warm-up, assertions, sorting, and logging stay outside timing.
Do not substitute direct internal-helper calls, monkey patches, work counters,
or arbitrary operation budgets for a complete-diagram runtime reproduction.

Run performance measurements serially, while no other heavy check runs on the
machine. Keep every sample, the median, size-to-size ratios, total UTF-16 source
length, the growing dimensions, runtime version, pinned Mermaid version,
command, source entry or built entry, and nondefault options. Distinguish
validation-helper stack requirements from parser behavior. Setting a validation
option does not prove that the API enforces it or that it was needed for
acceptance; check that path before claiming either effect.

Analyze repeated work in the source independently of the timings. Finite ratios
are not an asymptotic proof and need not be exactly four when input doubles.
Account for linear costs, reader lookup costs, required output size, and timing
noise. If several operations grow in the same input, whole-parse time and a
comparison's difference are not isolated function times.

When the quadratic argument relies on a repeated bulk collection operation,
verify its behavior for the measured runtime rather than treating the method
name as a complexity guarantee. Mark runtime implementation evidence as
**Read**. A verified cost component still does not establish its isolated time
or that it dominates total parse time.

A timing assertion may diagnose excessive growth, but its threshold is not a
universal performance contract. Do not tune it merely to obtain a failing test,
discard inconvenient samples, or repeatedly measure until a preferred result
appears. Acceptance and Db checks should pass independently of the performance
diagnosis. If the measured slowdown is not established, retain a candidate as
unconfirmed instead of creating a completed finding.

## One independently reviewable finding per cause

For each confirmed cause, create one descriptive directory containing:

| File                 | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `report.md`          | Evidence, source cause, and repair scope    |
| `report.ja.md`       | Japanese version of the report              |
| `reproduce.test.mjs` | Complete inputs, validation, and timing     |
| `importance.md`      | Repair priority and its reasons             |
| `importance.ja.md`   | Japanese version of the priority assessment |

Do not add a README, aggregate report, input fixture, or shared test framework.
A shared cause reproduced in several diagrams belongs in the same directory.
Similar-looking scans needing independent repairs belong in separate ones.

The report explains the symptom, exact trigger, measured sizes and times,
executed command and conditions, source locations, repeated operation, and
relation to the specification. Give a bounded repair requirement preserving
acceptance, token text, source ranges, whitespace, directives, comments, and
other relevant decisions. Describe the change needed without implementing it or
proposing unrelated refactoring.

Lead with the valid shape actually measured as slow, its growing dimension, and
the measured delay. Label a small accepted example as a reduced illustration; do
not make the reader mistake it for the slow reproduction. The standalone's
opening comments should identify the repeated work and, when a comparison is
included, what it changes, before the measurement bookkeeping.

Keep an example labeled as executed identical to its tested input, including
whitespace. A formatted equivalent is not itself an executed example.

Mark executed evidence as **Run**, source/specification evidence as **Read**,
and unmeasured cases explicitly. Shared source is not proof of measured behavior
in every diagram. Do not turn a finite measurement into a claim about all
inputs, or imply that no other problem exists. If a correctness disagreement
appears, classify it separately under the applicable review rules; do not
replace the requested performance investigation with a syntax-error search.

## Assess repair priority

Use high, medium, or low as a relative repair order. Explain the necessary input
shape, plausible occurrence, measured absolute delay and source size, and
confirmed scope. Separate likelihood judgments from usage statistics. Ordinary
syntax alone does not make thousands of repetitions or nesting levels ordinary.
Conversely, a small source with a large measured delay deserves attention.

Distinguish blank-line runs from hundreds of inline label spaces, and plain
whitespace from whitespace combined with growing directive counts. Shared code
broadens possible exposure but does not establish prevalence. Explain what real
usage would change the priority. Do not claim editor, formatter, or linter
operation times unless those operations were measured. Low priority does not
erase a confirmed problem.

## Verify and hand over

In a rereview, identify each finding as introduced by a fix, present before and
missed, or newly added review scope. Name the case or parsing path the earlier
review omitted when it missed a finding. If the earlier reproduction is
unavailable, label current equivalent inputs as new probes; do not claim to have
rerun the original inputs. Separate reading a repair from measuring its current
behavior, and keep a finite negative result within its measured bounds.

Execute each final standalone reproduction against the source state being
reported. Check its actual outcomes and all reported values against the log.
Separate successful validity/Db checks from the timing diagnosis. Preserve raw
samples even when the outcome is uncertain. Rerun only when changed parser code,
input values, measurement logic, or an unresolved concern warrants it. After a
reproduction has actually run, prose or presentation-only edits do not require
another benchmark if the complete input values and measurement logic are
verified unchanged.

Check English/Japanese correspondence, local source links, invisible characters,
Japanese width, and formatting. A check can skip the location of the report;
then check the report files explicitly, without changing tracked check
configuration. Run checks appropriate to the actual changes, not an unrelated
package suite for report-only work.

Notify the user as each finding is complete, with its report link and a concise
statement of the executed evidence. Keep unconfirmed candidates and unmeasured
scope separate from completed findings. Existing successful fixtures or a
negative finite-size probe are not a guarantee that the parser has no other
performance problems.

## When Codex interrupts a response

If the user reports a notice headed `このコンテンツは表示できません` that
mentions cybersecurity safeguards or Daybreak, treat it as a response
interruption to investigate, not a parser rejection or failed performance test.
The
[official OpenAI documentation](https://learn.chatgpt.com/docs/cyber-safety#false-positives)
notes that legitimate or unrelated work can trigger safeguards. That does not
establish the reason for a particular notice or confirm a false positive.

- Record the available notice and whether it was observed directly or reported
  by the user. Distinguish what completed from what remains unverified. Do not
  guess an account restriction or hidden classification. Local tools remaining
  available does not prove the response was delivered or that the overall task
  continued without interruption. Do not promise to prevent the notice or keep
  working uninterrupted.
- Preserve completed reports, raw samples, commands, source state, and the last
  verified step. On resumption, inspect saved files, log completion, and the
  measurements still running on the machine before retrying. Compare current
  inputs and source with the recorded state. Continue the original authorized
  review, with incomplete checks marked pending. Partial output is not completed
  evidence; avoid starting a duplicate benchmark while an earlier run is still
  active.
- Do not promise that changing models will clear the notice or grant Daybreak
  access;
  [approval has its own requirements](https://learn.chatgpt.com/docs/cyber-safety#trusted-access-for-cyber).
  This skill supplies no way to bypass a safeguard. If a suspected false
  positive keeps blocking progress, explain the limitation and point to the
  official `/feedback` guidance when available and useful to the user. Do not
  send feedback, submit an access application, or upload the user's reports or
  logs without their authorization.
