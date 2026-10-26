# html-tag-in-frontmatter

Japanese version:
[html-tag-in-frontmatter.ja.md](./html-tag-in-frontmatter.ja.md)

Diagram types: all. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

In the text of a diagram, the `"` inside an HTML tag, from `<` and a word to the
next `>`, is read as `'`, so that a label can hold a tag with attributes (see
[HTML attribute quotes](../common.md#html-attribute-quotes)). A diagram can also
start with a frontmatter, whose title may hold such a tag:

```mmd
---
title: <b class="x">T</b>
---
flowchart LR
  A
```

Both read the title `<b class='x'>T</b>`. [fixture:
flowchart/frontmatter-title-html-attribute] This document is about a tag that
starts in the frontmatter and does not end there, so that it reaches into the
text of the diagram.

In venn, with `title: <a` in frontmatter, `set "b="c">d"` is rejected here.
[fixture: venn/div-html-tag-starts-in-frontmatter] mermaid.js converts the inner
attribute quotes and accepts it. [fixture:
venn/div-html-tag-starts-in-frontmatter]

Without the opening tag in frontmatter, both reject the same venn body.
[fixture: venn/gram-html-tag-body-only-reference]

In Ishikawa, with `title: <a` in frontmatter, bare `b="c">d` and quoted-looking
`"b="c">d"` are accepted as node text by both. mermaid.js changes the attribute
quotes to single quotes; this specification reads the body independently of that
tag. The written IshikawaLiteral retains its original quotes. [fixture:
ishikawa/div-frontmatter-open-tag-bare-node] [fixture:
ishikawa/div-frontmatter-open-tag-quoted-node] Without the frontmatter tag,
`b="c">d` is accepted unchanged by both. [fixture:
ishikawa/lex-quotes-without-frontmatter-tag]

## The difference

Each example is a whole diagram.

1. A tag opened in the title, and a label with `"` and `>`:

   ```mmd
   ---
   title: <a
   ---
   flowchart LR
     A[b="c">d]
   ```

2. A tag and a quoted value opened in the title, and a label with a tag:

   ```mmd
   ---
   title: <a z="
   ---
   flowchart LR
     A[<b x="y">t]
   ```

3. A tag opened in the title, and an accessible title with `"` and `>`:

   ```mmd
   ---
   title: <a
   ---
   flowchart LR
     accTitle: b="c">d
     A
   ```

4. A tag opened in the title, and a message with `"` and `>`:

   ```mmd
   ---
   title: <a
   ---
   sequenceDiagram
     A -x B: b="c">d
   ```

5. The same, with an arrow that has `>`:

   ```mmd
   ---
   title: <a
   ---
   sequenceDiagram
     A ->> B: b="c">d
   ```

| Example | mermaid.js                            | This specification                       |
| ------- | ------------------------------------- | ---------------------------------------- |
| 1       | the vertex A with the label `b='c'>d` | rejected                                 |
| 2       | rejected                              | the vertex A with the label `<b x='y'>t` |
| 3       | the accessible title `b='c'>d`        | the accessible title `b="c">d`           |
| 4       | the message `b='c'>d`                 | the message `b="c">d`                    |
| 5       | the message `b="c">d`                 | the same                                 |

[fixture: flowchart/html-tag-starts-in-frontmatter] [fixture:
flowchart/html-tag-starts-in-frontmatter-value] [fixture:
flowchart/html-tag-starts-in-frontmatter-acc-title] [fixture:
sequence/div-html-tag-starts-in-frontmatter-message] [fixture:
sequence/lex-html-tag-frontmatter-arrow-ends-tag]

So in mermaid.js, a tag that starts in the frontmatter runs to the first `>`
after it, which can lie in the text, and the `"` before that `>` are read as
`'`. In example 1 the label then has no `"` left, and the flowchart grammar of
mermaid.js accepts it; without the frontmatter, both reject `A[b="c">d]`. In
example 2 the quoted value `z="` takes the `"` after `x=`, so the `"` after `y`
stays, and mermaid.js rejects the label. In example 5 the `>` of the arrow ends
the tag before the message. This specification looks for tags only in the text
after the frontmatter, and reads each of these texts as it would without the
frontmatter. A tag that starts and ends inside the frontmatter makes no
difference to the HTML reading of the diagram. [fixture: pie/frontmatter-html]
The difference goes both ways, and it can change acceptance or the Db.

In kanban, with `title: <a` in frontmatter, mermaid.js converts the inner
attribute quotes of `S["b="c">d"]` and accepts the input. This specification
ends the label string at its second quote and rejects the input. [fixture:
kanban/div-frontmatter-open-tag] Without `<a` in frontmatter, both reject it.
[fixture: kanban/gram-frontmatter-no-tag-reference]

In C4, with `title: <a` in frontmatter, `Person(a,"b="c">d")` is rejected here;
mermaid.js converts the inner attribute quotes and accepts it. [fixture:
c4/div-frontmatter-open-tag]

## What it means for an author

A frontmatter whose title has a `<` followed by a word and no `>` after it, such
as `title: <a`, is unusual. With one, mermaid.js reads every `"` between it and
the first `>` of the diagram as `'`, and so can accept a label that it would
reject, reject one that it would accept, or change the text of a label, a title,
or a message. This toolkit reads the diagram as it would without the
frontmatter. Closing the tag in the title, or leaving out the `<`, makes both
read the same. [fixture: pie/frontmatter-html]

## Why mermaid.js reads it so

mermaid.js replaces the `"` inside every tag with `'` in
[`cleanupText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17),
over the whole source, before it removes the frontmatter in
[`preprocessDiagram`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L65).
The replacement does not know where the frontmatter ends, so a tag that starts
in it is matched with a `>` in the text.

## The rule of this specification, and why

In this specification, the lexer starts reading after the frontmatter, and looks
for tags only in the text it reads; what the frontmatter contains does not
change how the text is read (see
[HTML attribute quotes](../common.md#html-attribute-quotes)). A value derived
from the frontmatter, such as the title, is the one that mermaid.js derives in
every diagram type (see
[Frontmatter configuration](../../../tests/docs/configuration.md#frontmatter-configuration)).
[fixture: pie/frontmatter-html] [fixture:
flowchart/frontmatter-title-html-attribute]

That a tag can reach from the frontmatter into the text comes from the order of
the steps of mermaid.js: the replacement runs before the frontmatter is removed.
It is nothing that a specification would state as a rule of the syntax; this is
the second of the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)).

### Agentflow

Agentflow uses the same body-only HTML rule. Its Frontmatter record and
Label/Literal nodes retain the authored text; an ignored-text sibling cannot
make a tag in the frontmatter change the lexical role of body quotes under that
scope. Matching Mermaid would change the shared scan scope rather than retain a
missing value. [fixture: agentflow/div-html-cross-frontmatter] [fixture:
agentflow/div-frontmatter-tag-enables-label] [fixture:
agentflow/div-frontmatter-tag-changes-title]

The comparison goes both ways: one frontmatter tag makes Mermaid accept a body
label that the independent body rule rejects, while an unfinished frontmatter
attribute makes Mermaid reject an otherwise valid body tag. The existing
reason-2 direct rule covers both, and its reverse pipeline-order criterion
permits the latter acceptance. [fixture:
agentflow/div-frontmatter-tag-enables-label] [fixture:
agentflow/html-label-without-frontmatter-tag] [fixture:
agentflow/div-frontmatter-attribute-blocks-body-tag] [fixture:
agentflow/html-body-tag-reference]

### Usecase

In usecase, the affected range starts with an unfinished tag/attribute in
frontmatter and runs into the body's attribute quotes. Frontmatter and
UsecaseLabel can retain all characters, but no missing-text node can make a
frontmatter tag change the lexical role of body quotes under a body-only scan.
Mermaid's cross-boundary conversion accepts the enabling example whose body-only
reference is rejected, and rejects the blocking example whose body-only
reference is accepted. Keep the existing reason-2 rule in both directions:
accepting the latter is the reverse pipeline-order criterion, not a relaxation
of the label grammar. [fixture: usecase/div-html-frontmatter-enables-label]
[fixture: usecase/lex-html-body-label-reference] [fixture:
usecase/div-html-frontmatter-blocks-label] [fixture:
usecase/lex-html-body-tag-reference]

Both readings can also accept while an accessibility value differs. With
`title: <a` in frontmatter and `accTitle: b="c">d`, Mermaid reads `b='c'>d`;
this specification keeps `b="c">d`. Frontmatter and UsecaseLiteral hold the
written text without changing the tree's values to the converted quotes. An
arrow before the accessibility statement closes the frontmatter tag at its `>`
and prevents that change to the value. [fixture:
usecase/div-html-frontmatter-acc-title-db] [fixture:
usecase/lex-html-acc-title-body-control] [fixture:
usecase/lex-html-frontmatter-arrow-closes-tag]

### Pie

Frontmatter holds its written body and StringLiteral holds a label. An ignored
sibling cannot represent a tag opened in frontmatter rewriting a later label's
quotes. The direct rule excludes frontmatter from the diagram's HTML scan; a tag
crossing the fence can therefore make Mermaid accept a label rejected here. A
tag closed inside accepted frontmatter has no such difference, and the
frontmatter title is Mermaid's converted value. If attribute conversion instead
makes the YAML invalid, Mermaid rejects while the shared
[opaque-data rule](./embedded-data-opaque.md) accepts; this is recorded like the
corresponding usecase input. Only the fence-crossing effect and the
post-conversion YAML rejection differ. A tag entirely in diagram text still
follows the common HTML rule. [fixture: pie/frontmatter-html] [fixture:
pie/div-review-frontmatter-html-cross-label] [fixture:
pie/div-review-frontmatter-html-invalid-yaml] [fixture:
usecase/div-gram-frontmatter-html-attribute-quotes] [fixture:
pie/html-all-texts]

### Gitgraph

The tree can hold frontmatter and body strings independently. A cross-fence HTML
match cannot belong to one of those nodes without crossing their boundary. The
direct body-only HTML rule uses reason 2: both-accepted values can differ,
Mermaid-only acceptance can reject here, and Mermaid rejection can accept here.
Keep the frontmatter title as Mermaid derives it; ordinary body tags and
frontmatter tags with no differing result are unmarked. [fixture:
gitgraph/div-frontmatter-cross-title-value] [fixture:
gitgraph/div-frontmatter-cross-string-enable] [fixture:
gitgraph/div-frontmatter-cross-string-block] [fixture:
gitgraph/frontmatter-body-tag-control] [fixture: gitgraph/frontmatter-html]

### Packet

Frontmatter and values retain their source, but body quote conversion does not
depend on an unclosed opaque frontmatter tag. It can change a value or reverse
acceptance in either direction; the body-only control agrees. [fixture:
packet/div-html-frontmatter-value] [fixture: packet/div-html-frontmatter-accept]
[fixture: packet/div-html-frontmatter-reject] [fixture:
packet/gram-html-body-only-reference]

### Architecture

In architecture, a tag starting in frontmatter can turn internal attribute
quotes of a text icon into single quotes and make an otherwise invalid string
accepted. An attribute opened in frontmatter can also damage a text icon that
this specification accepts. Both directions are recorded, together with a
bracketed label accepted by both but read differently. The tree can retain the
authored quotes; matching Mermaid's body conversion would additionally require
carrying frontmatter HTML context through the preprocessing order. The shared
direct rule starts body HTML reading after frontmatter instead. [fixture:
architecture/div-frontmatter-open-tag-icon] [fixture:
architecture/gram-frontmatter-open-tag-reference] [fixture:
architecture/div-frontmatter-open-attribute-icon] [fixture:
architecture/gram-frontmatter-open-attribute-reference] [fixture:
architecture/div-frontmatter-open-tag-label]

### Radar

Radar starts body HTML-attribute quote reading after frontmatter. An open tag in
frontmatter does not carry its attribute state into a label or common value. The
tree can preserve the authored quotes in StringLiteral or RadarLiteral, so loss
of that text is not a reason to reject. The difference that remains follows a
direct frontmatter/body boundary instead of carrying a preprocessing state
across it. [fixture: radar/div-html-frontmatter-cross] [fixture:
radar/div-html-frontmatter-reverse] [fixture: radar/gram-html-body-only-double]
[fixture: radar/gram-html-body-only-single] [fixture:
radar/div-html-frontmatter-value]

The double-quoted crossing example is accepted by Mermaid after its rewrite but
rejected here like its body-only control. The single-quoted reverse example is
rejected by Mermaid but accepted here like its body-only control. Both readings
also accept a common title that becomes `x='y'>` in Mermaid but remains `x="y">`
here, matching body-only quote reading. These acceptance and value differences
use this identifier, with their comparisons recorded in specified.json; label
and common-value nodes keep the authored spelling. [fixture:
radar/div-html-frontmatter-cross] [fixture: radar/div-html-frontmatter-reverse]
[fixture: radar/gram-html-body-only-double] [fixture:
radar/gram-html-body-only-single] [fixture: radar/div-html-frontmatter-value]

### Treemap

Treemap starts body HTML-attribute quote reading after frontmatter. An open tag
in frontmatter does not carry its attribute state into a name, common value or
class style. StringLiteral and TreemapLiteral can preserve the authored quotes;
matching Mermaid would additionally require carrying frontmatter HTML context
through the preprocessing order. The shared direct rule starts body reading
after frontmatter instead, without using an ignored-text node to move a closing
quote. [fixture: treemap/div-html-tag-starts-in-frontmatter] [fixture:
treemap/div-html-frontmatter-reverse] [fixture:
treemap/div-html-frontmatter-title-value] [fixture:
treemap/div-html-frontmatter-style-value] [fixture: treemap/html-fields]

The double-quoted crossing example is accepted by Mermaid with name `b='c'>d`
but rejected here. The single-quoted reverse example is rejected by Mermaid but
accepted here with name `x="y">`. Both readings accept the common title and
class definition examples: Mermaid reads title `x='y'>` and style `fill:x='y'>`,
whereas this specification keeps `x="y">` and `fill:x="y">`, matching body-only
quote reading. These acceptance and value differences use this identifier, with
their comparisons recorded in specified.json; the nodes keep the authored
spelling. [fixture: treemap/div-html-tag-starts-in-frontmatter] [fixture:
treemap/div-html-frontmatter-reverse] [fixture:
treemap/div-html-frontmatter-title-value] [fixture:
treemap/div-html-frontmatter-style-value]

### Railroad

All four railroad dialects start the body’s HTML quote reading after
frontmatter. The comparisons cover both acceptance directions and both-accepted
value differences: the rule-accept fixtures are
Mermaid-accepted/specification-rejected, rule-reject fixtures are
Mermaid-rejected/specification-accepted, and acctitle fixtures are accepted by
both with different values. Each has a specified result, including the
Mermaid-rejected direction. [fixture:
railroad/ir-div-html-frontmatter-rule-accept] [fixture:
railroad/ir-div-html-frontmatter-rule-reject] [fixture:
railroad/ir-div-html-frontmatter-acctitle] [fixture:
railroad/ebnf-div-html-frontmatter-rule-accept] [fixture:
railroad/ebnf-div-html-frontmatter-rule-reject] [fixture:
railroad/ebnf-div-html-frontmatter-acctitle] [fixture:
railroad/abnf-div-html-frontmatter-rule-accept] [fixture:
railroad/abnf-div-html-frontmatter-rule-reject] [fixture:
railroad/abnf-div-html-frontmatter-acctitle] [fixture:
railroad/peg-div-html-frontmatter-rule-accept] [fixture:
railroad/peg-div-html-frontmatter-rule-reject] [fixture:
railroad/peg-div-html-frontmatter-acctitle]

For the first question, Frontmatter, StringLiteral and RailroadLiteral retain
their authored source, including quote spelling; native hidden forms also have
RailroadIgnoredText owners. That does not preserve Mermaid’s cross-frontmatter
quote context in a value field: an ignored-text sibling cannot change where a
string closes. The second answer is reason 2, the common direct rule.
HTML-looking text entirely within the body follows the ordinary shared quote
rule and needs no mark merely for containing a tag. [fixture:
railroad/ir-html-body-control] [fixture: railroad/ebnf-html-body-control]
[fixture: railroad/abnf-html-body-control] [fixture:
railroad/peg-html-body-control]

### Wardley

Frontmatter, StringLiteral and WardleyLiteral can preserve the written quotes.
They cannot make an unfinished opaque frontmatter tag control the lexical
boundary of a body string under the shared body-only HTML rule. This remaining
difference uses reason 2, the direct frontmatter/body boundary. Mermaid accepts
the double-quoted note example with text b='c'>d while this specification
rejects it; Mermaid rejects the single-quoted example while this specification
accepts text b="c">d. Both accept the accessibility-title example, but Mermaid
reads b='c'>d and this specification reads b="c">d. The body-only controls
agree, and each differing comparison has specified.json, including the
Mermaid-rejected direction. [fixture: wardley/div-html-frontmatter-accept]
[fixture: wardley/div-html-frontmatter-reject] [fixture:
wardley/div-html-frontmatter-value] [fixture: wardley/html-body-double-control]
[fixture: wardley/html-body-single-control]

### Cynefin

Keep frontmatter and body nodes, but start body HTML attribute scanning after
real frontmatter. An unfinished tag in opaque YAML cannot govern a later
string’s quotes. Mermaid can accept when this rule rejects, reject when it
accepts, or accept with only a different value; body-only quote controls still
use the common HTML rule. [fixture: cynefin/div-html-frontmatter-accept]
[fixture: cynefin/div-html-frontmatter-reject] [fixture:
cynefin/div-html-frontmatter-value] [fixture: cynefin/html-body-double-control]
[fixture: cynefin/html-body-single-control]

The
[pinned grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/cynefin/cynefin.langium#L4-L30)
and
[public adapter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinParser.ts#L8-L19)
read the result of the common preprocessing/detection pipeline. The
[Cynefin syntax](../diagrams/cynefin.md) states the direct rule and
[tree](../ast/cynefin.md) retains its authored forms. [fixture:
cynefin/db-all-fields]

### eventmodeling

For eventmodeling the opaque Frontmatter and later StringLiteral/Literal can
hold the source, but frontmatter content must not control later HTML quote
conversion. Apply the shared rule only after real frontmatter. Mermaid can
repair mismatched inline quotes and accept where this specification rejects; it
can damage matching quotes and reject where this specification accepts. Both may
also accept with different accessibility text: single attribute quotes in
Mermaid versus the authored double quotes in the specified reading. Retained
prefixes are preserved in both comparison readings. [fixture:
eventmodeling/div-html-frontmatter-accept] [fixture:
eventmodeling/div-html-frontmatter-reject] [fixture:
eventmodeling/div-html-frontmatter-value] [fixture:
eventmodeling/html-body-double-control] [fixture:
eventmodeling/html-body-mismatch-control] [fixture:
eventmodeling/prefix-yaml-html] [fixture: eventmodeling/prefix-directive-html]

[event-modeling.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L9-L70)
defines the units; [the diagram syntax](../diagrams/eventmodeling.md) defines
their direct boundaries.

### Treeview

Treeview retains frontmatter and body spelling in their nodes, but its body
quote reading does not inspect an opaque frontmatter tag opener. The difference
can reverse acceptance in either direction: div-html-frontmatter-accept is
accepted by Mermaid and rejected here, while div-html-frontmatter-reject is the
reverse. div-html-frontmatter-value is accepted by both with different bare-name
quotes. Their specified readings retain the comparison Db and applicable
embedded values. The [diagram syntax](../diagrams/treeview.md#known-divergences)
applies this existing direct rule; no box-specific divergence is needed.
[fixture: treeview/div-html-frontmatter-accept] [fixture:
treeview/div-html-frontmatter-reject] [fixture:
treeview/div-html-frontmatter-value]

## The documentation of mermaid.js and its issues

- The pinned
  [C4 documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L7-L17)
  uses `<br/>` inside a quoted description and
  [shows YAML frontmatter for wrapping configuration](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L159-L171).
  It does not describe a tag starting in frontmatter and continuing into a C4
  argument. Searches of issues and pull requests in `mermaid-js/mermaid` on
  2026-10-21 with `C4 frontmatter in:title,body`,
  `frontmatter HTML quotes in:title,body`, and
  `C4 frontmatter tag in:title,body` found no report about that form.

- The pinned
  [venn documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
  shows YAML frontmatter and quoted labels, but no HTML tag crossing the
  frontmatter boundary. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-21 with `venn frontmatter in:title,body` and
  `venn HTML in:title,body` found no report about that form.

- The pinned
  [Ishikawa documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/ishikawa.md#L11-L38)
  shows indented node text, but no frontmatter or HTML tag crossing its
  boundary. Searches of issues and pull requests in `mermaid-js/mermaid` on
  2026-10-21 with `ishikawa`, `ishikawa frontmatter in:title,body`, and
  `ishikawa HTML in:title,body` found no report about a tag starting in
  frontmatter and continuing into Ishikawa node text.

- The pinned
  [Agentflow frontmatter example](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/agentflow.md#L67-L90)
  combines YAML configuration with quoted body labels; it does not describe an
  HTML tag crossing that boundary. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-22 with `agentflow frontmatter in:title,body`
  found the merged [PR #8073](https://github.com/mermaid-js/mermaid/pull/8073),
  whose description discusses comment preservation and frontmatter offsets, not
  a tag continuing into body quotes.

- The pinned
  [usecase documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  describes quoted labels and JSON. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-22 with `usecase title` found no inspected
  report establishing a maintainer defect judgment for this acceptance behavior.
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048), closed and merged
  on 2026-08-14 with Type: Enhancement, introduces the Chevrotain parser, model
  validation and JSON tables. This divergence follows the shared direct rule,
  not a claim that a bug label approves a grammar change.

- For pie, the pinned
  [syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md)
  does not describe an HTML tag crossing the frontmatter fence. Searches on
  2026-10-23 for `pie`, `pie frontmatter` and `pie HTML` found no maintainer
  decision on this cross-fence rewriting. The shared exclusion of opaque
  frontmatter determines the difference.

For gitgraph,
[gitgraph.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gitgraph.md)
documents the header and commands. Issue/PR searches on 2026-10-23 used
`gitGraph`, `gitGraph directive`, `gitGraph YAML`, `gitGraph semicolon`,
`gitGraph keyword`, `gitGraph duplicate` and `gitGraph cherry-pick`. No
inspected result settles this common boundary behavior.
[#4838](https://github.com/mermaid-js/mermaid/issues/4838) is closed with
Status: Approved; merged
[#6707](https://github.com/mermaid-js/mermaid/pull/6707) adds a duplicate-id
warning. These facts do not justify any additional divergence.

- The pinned
  [packet documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/packet.md#L12-L28)
  shows single positions, ranges and relative counts; it does not define this
  preprocessing boundary. Searches of the official repository's issues and pull
  requests on 2026-10-25 used `packet bitsPerRow`, `packet fractional` and
  `packet maxPacketSize`. No inspected result establishes a maintainer ruling on
  this divergence.

- The pinned
  [architecture.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L21-L175)
  documents the header, declarations and edges, without defining this common
  preprocessing boundary. Searches of the official issues/PRs on 2026-10-25 used
  architecture group undefined, architecture quotes title, architecture reverse,
  architecture unclosed and architecture align.
  [#7211](https://github.com/mermaid-js/mermaid/issues/7211) was open with
  Status: Approved and concerns edges from outer parent groups, not a maintainer
  ruling on this common boundary.

- Radar:
  [radar.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/radar.md#L66-L166)
  documents axes, curves and options. The official issues/PRs were searched on
  2026-10-25 for radar directive, radar semicolon and radar entries; no
  inspected result declares the boundaries above a defect.
  [#7187](https://github.com/mermaid-js/mermaid/issues/7187) is a closed
  documentation report marked Status: Approved.
  [#7188](https://github.com/mermaid-js/mermaid/pull/7188) corrects commas in
  documentation examples; it does not add grammar support for a trailing comma.

- Treemap: the pinned
  [treemap documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/treemap.md#L24-L115)
  describes quoted rows, indentation and class definitions, without defining
  this common preprocessing boundary. Searches of the official repository's
  issues and pull requests on 2026-10-25 used `treemap quotes`; no inspected
  result establishes a maintainer ruling on this divergence.
  [#6590](https://github.com/mermaid-js/mermaid/pull/6590) introduced treemap
  and was merged on 2025-06-27; it is not a ruling on this boundary.

- Railroad: the
  [pinned syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/railroad.md#L1-L280)
  describes the four notations, EBNF exception, ABNF semicolon comments and PEG
  predicates. It does not define native retained YAML or HTML quote context
  across frontmatter. Searches of the official repository’s issues and pull
  requests on 2026-10-26 used railroad frontmatter, railroad directive, railroad
  semicolon and railroad comment.
  [#7979](https://github.com/mermaid-js/mermaid/issues/7979) concerns demo
  header names (closed, Triage);
  [#6620](https://github.com/mermaid-js/mermaid/issues/6620) is an ABNF diagram
  proposal (open, Discussion Needed). Neither establishes a maintainer defect
  decision for these preprocessing boundaries. This divergence follows the
  existing shared rule, not such a decision. The inspected results do not
  establish that no other relevant issue exists.

- Wardley: the
  [pinned syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/wardley.md#L1-L461)
  shows coordinates, decorations and flows without defining this common
  boundary. Searches of the official issues and pull requests on 2026-10-26 used
  wardley directive, wardley semicolon and wardley flow.
  [#7642](https://github.com/mermaid-js/mermaid/pull/7642) fixes hyphenated
  names and [#7726](https://github.com/mermaid-js/mermaid/pull/7726) removes
  unnecessary sanitization; both are reflected in the pin.
  [#8379](https://github.com/mermaid-js/mermaid/pull/8379) was an open
  configuration-retention PR. The inspected results establish no maintainer
  defect decision for this boundary; the existing direct rule applies. The
  search is not claimed to be exhaustive.
- Cynefin’s
  [pinned syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/cynefin.md#L21-L111)
  describes fixed domains, quoted items and labeled transitions; its
  [notes](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/cynefin.md#L203-L210)
  state that self transitions are ignored.
  [PR #7535](https://github.com/mermaid-js/mermaid/pull/7535) added the diagram
  and was merged. On 2026-10-26, searches for cynefin parser, cynefin directive,
  cynefin semicolon and cynefin frontmatter found no inspected maintainer
  judgment on this boundary.
  [Issue #7921](https://github.com/mermaid-js/mermaid/issues/7921) was open with
  Status: Triage and requested framework naming/drawing changes, not a ruling on
  these lexical rules.

### eventmodeling

The pinned
[eventmodeling.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L37-L322)
describes frames, data and tags without defining this shared preprocessing
boundary. Searches of the official issues and pull requests on 2026-10-26 used
eventmodeling title, eventmodeling parser, event modeling data, eventmodeling
accTitle and eventmodeling validator.
[PR #7588](https://github.com/mermaid-js/mermaid/pull/7588), merged on
2026-04-16, adds validator registration; it does not establish a maintainer
ruling on this boundary. The inspected results establish no such ruling; the
existing direct rule applies. The search is not claimed to be exhaustive.

### Treeview

The pinned
[treeView.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/treeView.md#L1-L277)
describes indentation, quoted names, annotations and box drawing, without
defining this common boundary. On 2026-10-26 the official issues/PRs were
searched for `treeView quoted`, `treeView indentation`, `treeView box`,
`treeView quotes`, `treeView whitespace` and `treeView accDescr`.
[PR #7721](https://github.com/mermaid-js/mermaid/pull/7721) is the merged
box-drawing addition;
[Issue #8014](https://github.com/mermaid-js/mermaid/issues/8014) is an open
Enhancement/Triage proposal to omit the header. Inspected results establish no
maintainer defect ruling on this boundary; the existing direct rule applies. The
search is not claimed to be exhaustive.
