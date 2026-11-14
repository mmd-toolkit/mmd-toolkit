# Accepting a form in new places (spec)

What item 5 of [section 6 of SKILL.md](../SKILL.md#6-checking-a-rule) lists
before a form is accepted in new places or a rule is generalized:

1. Every position where the form can appear, going through every rule of the
   grammar of each diagram type, not only the end of a line: after the header,
   after the heading of a statement with a body (the name of a subgraph, a box,
   a namespace, a composite state), before and after whitespace, before a `;`,
   and at the end of the text.
2. Every place where a value comes from the text of a range rather than from
   units, such as the name text of a subgraph in flowchart, which is read from
   the source where empty description blocks follow the name, and whether the
   form can lie inside such a range.
3. A fixture for each kind of position listed in the first item, with each kind
   of whitespace around the form that the rule distinguishes (none, whitespace,
   a line break after it), checked with mermaid.js for acceptance and for the
   Db, the values of the second item included.

A change of acceptance at one place can change the acceptance and the Db at
other places of the same form, so check also that acceptance does not change
elsewhere (flowchart example: reading the placeholder of an entity as one unit
everywhere would change acceptance under the letter rule, rule 23, so the rule
has a limited scope; and skipping every `click` unit would join the click ids of
two click contexts and accept inputs that mermaid.js rejects, so the rule does
not skip every `click` unit).
