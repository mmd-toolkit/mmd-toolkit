# Checklist for recorded trees

Japanese version: [checklist.ja.md](./checklist.ja.md)

For the diagram determined from the input, use
`packages/spec/docs/diagrams/<diagram>.md` (Detection, Lexical structure,
Grammar, and Known divergences), `packages/spec/docs/ast/<diagram>.md` (the
heading for each node type), `packages/parser/docs/tokens/<diagram>.md` (Tokens
and any comment or trivia sections), and
`packages/parser/docs/positions/<diagram>.md` (Ranges). Read their linked
sections too. The links below give the shared grounds; apply the diagram's
sections with them.

- Check each node's type against the syntax at its input position. Grounds:
  [Shared leaf nodes](../../../../packages/spec/docs/ast.md#shared-leaf-nodes)
  and [Diagram nodes](../../../../packages/spec/docs/ast.md#diagram-nodes).
- Check for missing or extra nodes, the parent field of each child, and child
  field and list order, including documented exceptions to source order.
  Grounds: [Nodes](../../../../packages/spec/docs/ast.md#nodes).
- Check every field's presence, type, and value, including nulls and empty
  lists, against its field table and the text defining it. Grounds:
  [How fields are described](../../../../packages/spec/docs/ast.md#how-fields-are-described),
  [Root](../../../../packages/spec/docs/ast.md#root), and
  [Diagram nodes](../../../../packages/spec/docs/ast.md#diagram-nodes).
- Check written values and literal `raw` against the input, including text
  retained or omitted inside a value. Grounds:
  [Nodes](../../../../packages/spec/docs/ast.md#nodes),
  [StringLiteral](../../../../packages/spec/docs/ast.md#stringliteral), and
  [NumericLiteral](../../../../packages/spec/docs/ast.md#numericliteral).
- Check every node, token, comment, directive, and frontmatter `range` and
  `loc`, using the original input's UTF-16 offsets and line boundaries. Grounds:
  [Positions](../../../../packages/parser/docs/positions.md#positions).
- Check node boundaries, root coverage, child containment, non-overlap, and
  source order with the diagram's range exceptions. Grounds:
  [Node ranges](../../../../packages/parser/docs/positions.md#node-ranges) and
  [Invariants](../../../../packages/parser/docs/positions.md#invariants).
- Check every token's kind and boundaries, including fragments and whitespace
  within values; check for missing or extra tokens. Grounds:
  [Tokens](../../../../packages/parser/docs/tokens.md#tokens),
  [String tokens](../../../../packages/parser/docs/tokens.md#string-tokens),
  [Numeric tokens](../../../../packages/parser/docs/tokens.md#numeric-tokens),
  [Identifier tokens](../../../../packages/parser/docs/tokens.md#identifier-tokens),
  and
  [A token that a directive cuts](../../../../packages/parser/docs/tokens.md#a-token-that-a-directive-cuts).
- Check comments' fields, placement outside tokens, and fragments around comment
  regions; check the root's comment and token lists. Grounds:
  [Comment](../../../../packages/parser/docs/tokens.md#comment),
  [Comment regions in tokens](../../../../packages/parser/docs/tokens.md#comment-regions-in-tokens),
  and
  [The lists of the root](../../../../packages/parser/docs/tokens.md#the-lists-of-the-root).
- Check directive records, their placement in the root, and their correspondence
  with `Directive` tokens, including directives inside comments. Grounds:
  [Directive](../../../../packages/spec/docs/ast.md#directive),
  [Where a directive is](../../../../packages/spec/docs/common.md#where-a-directive-is),
  and
  [Directive tokens](../../../../packages/parser/docs/tokens.md#directive-tokens).
- Check frontmatter's placement in the root, fields, body, and delimiter tokens,
  including `valueRange`. Grounds:
  [Frontmatter](../../../../packages/spec/docs/ast.md#frontmatter),
  [the frontmatter rule](../../../../packages/spec/docs/common.md#frontmatter),
  and
  [Frontmatter tokens](../../../../packages/parser/docs/tokens.md#frontmatter-tokens).
- Check ignored `;` placement and token kind, including its effect on value
  fragments and node boundaries. Grounds:
  [`style` and `classDef` lines](../../../../packages/spec/docs/common.md#style-and-classdef-lines),
  [Tokens](../../../../packages/parser/docs/tokens.md#tokens), and
  [Node ranges](../../../../packages/parser/docs/positions.md#node-ranges).
- Check that gaps outside tokens and comments contain only permitted whitespace
  or line terminators. Match each token's and record's text to its source slice,
  and check every remaining position invariant, including empty ranges and
  overlaps. Grounds:
  [Invariants](../../../../packages/parser/docs/positions.md#invariants),
  [Line terminators](../../../../packages/spec/docs/common.md#line-terminators),
  [Whitespace](../../../../packages/spec/docs/common.md#whitespace), and
  [Notation](../../../../packages/spec/docs/common.md#notation).
