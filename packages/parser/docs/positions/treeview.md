# Treeview positions

Japanese version: [treeview.ja.md](./treeview.ja.md)

Ranges implement the [authored tree](../../../spec/docs/ast/treeview.md) in
original UTF-16 offsets. Root covers the entire source; CR/CRLF, tabs, entities
and authored quotes remain in source spelling. Box columns and assigned
indentation do not change source positions. [fixture:
treeview/gram-written-tree] [fixture: treeview/text-double-crlf] [fixture:
treeview/box-tab-quoted] [fixture: treeview/entity-double] [fixture:
treeview/box-column-nonbmp-discriminating]

## Ranges

TreeviewDiagram starts at the header and ends at its final body item, or the
header end with an empty body. Outer padding, later shared Comments and the
appended logical LF do not extend it; a final outer decoration does. [fixture:
treeview/header-only] [fixture: treeview/comment-native] [fixture:
treeview/box-decoration-trailing-body]

TreeviewNode starts at its first textBefore decoration when present, otherwise
at its earliest prefix, textBeforeName decoration or name. It ends at its last
descendant, or at its own final annotation or name without children. The range
is continuous and siblings do not overlap; its start need not be the name's
start. Ordinary indentation before its first owned syntax and unrelated later
trivia are outside the range. A prefix supplies the node's assigned indentation
and stays its child when a native comment intervenes. Decorations in a
pending-name gap belong to textBeforeName. [fixture: treeview/gram-written-tree]
[fixture: treeview/db-quoted-tail-space] [fixture:
treeview/box-comment-indent-carry] [fixture:
treeview/box-decoration-pending-name-gap] [fixture:
treeview/gram-nesting-decoration-before-parent] [fixture:
treeview/gram-nesting-decoration-before-ancestor-child] [fixture:
treeview/gram-nesting-decoration-after-subtree]

After existing leaf, pending-name, annotation and block-opener ownership,
remaining decorations between complete hierarchy nodes belong to the next node's
textBefore, whether it is a child, an ancestor's other child or another root.
Independent decorations before the first node and after the last remain in body.
Shared comments, directives, selected semicolons and empty lines make no gap
nodes. [fixture: treeview/box-written-tree] [fixture:
treeview/gram-nesting-decoration-before-parent] [fixture:
treeview/gram-nesting-decoration-before-ancestor-child] [fixture:
treeview/spec-box-drawing-preprocessor-e9d19370] [fixture:
treeview/box-decoration-preamble-body] [fixture:
treeview/gram-nesting-decoration-after-subtree] [fixture:
treeview/gram-nesting-decoration-directive-inline] [fixture:
treeview/gram-nesting-decoration-directive-line] [fixture:
treeview/gram-nesting-decoration-comment-line] [fixture:
treeview/gram-nesting-decoration-empty-line] [fixture:
treeview/gram-nesting-decoration-selected-semicolon] [fixture:
treeview/gram-nesting-decoration-unselected-semicolon]

Annotations start at their first textBefore decoration, otherwise prefix,
otherwise `:::`, `icon` or `##`. They end at the class name, icon's closing
parenthesis or final description character; an empty description ends at `##`.
An annotation owns preceding decorations only when it follows them; otherwise
the next hierarchy node's textBefore owns them, or body when no such node
follows. Its prefix does not change the node's indent. [fixture:
treeview/box-decoration-before-annotation] [fixture:
treeview/ast-annotation-prefixes] [fixture:
treeview/box-decoration-trailing-body] [fixture:
treeview/annotation-class-space] [fixture: treeview/db-icon-none] [fixture:
treeview/db-description-empty]

Common statements start at their prefix, otherwise their keyword, excluding
ordinary preceding padding. A line statement ends at its final payload
character, or keyword/colon for a null value. A block ends at its first
effective closing brace; prefixes and decorations between accDescr and its
opener belong to textBeforeOpen. Empty blocks keep both braces. Decorations
before the first hierarchy node stay in body and do not end the common preamble.
[fixture: treeview/box-common-prefix] [fixture: treeview/common-whitespace]
[fixture: treeview/ast-common-removal-only-values] [fixture:
treeview/ast-common-whitespace-values] [fixture:
treeview/common-title-quoted-next] [fixture: treeview/common-repeat-empty]
[fixture: treeview/box-branch-before-block-open] [fixture:
treeview/box-decoration-before-block-open] [fixture:
treeview/box-prefix-common-block-two-prefixes] [fixture:
treeview/box-trim-block-closing-brace] [fixture:
treeview/box-decoration-preamble-body]

TreeviewIdentifier covers the whole bare name, including owned whitespace.
StringLiteral covers both quotes and the complete authored interior.
TreeviewLiteral covers all surviving authored payload, starting after title's
one separator, an accessibility colon, a description marker or an opening brace.
Null fields have no leaf; whitespace-only payloads do. Leaf ranges span internal
shared removals, while values omit them and retain all other authored spelling.
[fixture: treeview/db-bare-tail-space] [fixture: treeview/space-line-nbsp]
[fixture: treeview/db-empty-names] [fixture:
treeview/ast-common-whitespace-values] [fixture:
treeview/ast-common-removal-only-values] [fixture:
treeview/ast-description-removal-only] [fixture: treeview/directive-bare-middle]
[fixture: treeview/directive-double-middle] [fixture:
treeview/common-block-comments]

For an accDescr block, TreeviewLiteral spans the complete source interior from
after the opener to before the effective closer, excluding only shared removals
at its outer ends. A decoration immediately before the closing line therefore
keeps its following source LF, CR or CRLF, and a prefix introducing the closer
stays in the literal. Its loc ends at that authored boundary. The RawText item
uses the same range before shared cuts. [fixture:
treeview/box-block-tail-decoration-light-vertical] [fixture:
treeview/box-block-tail-decoration-heavy-vertical] [fixture:
treeview/box-block-tail-decoration-light-dash] [fixture:
treeview/box-block-tail-decoration-heavy-dash] [fixture:
treeview/box-block-tail-decoration-vertical-whitespace] [fixture:
treeview/box-block-tail-decoration-close-same-line] [fixture:
treeview/box-block-tail-decoration-dash-close-same-line] [fixture:
treeview/box-block-tail-decoration-multiple-lines] [fixture:
treeview/box-block-tail-branch-content] [fixture:
treeview/box-block-tail-branch-closer] [fixture:
treeview/box-block-tail-decoration-inactive] [fixture:
treeview/box-block-tail-decoration-indent-control] [fixture:
treeview/box-block-tail-decoration-only-interior] [fixture:
treeview/box-block-tail-decoration-empty-control] [fixture:
treeview/box-block-tail-decoration-opener-line] [fixture:
treeview/box-block-tail-decoration-ascii-dash-control] [fixture:
treeview/box-block-tail-decoration-single-dash] [fixture:
treeview/box-block-tail-decoration-spaces-after] [fixture:
treeview/box-block-tail-decoration-spaces-before] [fixture:
treeview/box-block-tail-decoration-blank-after] [fixture:
treeview/box-block-tail-decoration-two-vertical-lines] [fixture:
treeview/box-block-tail-decoration-directive-inline] [fixture:
treeview/box-block-tail-decoration-directive-line] [fixture:
treeview/box-block-tail-decoration-directive-at-start] [fixture:
treeview/box-block-tail-decoration-selected-semicolon] [fixture:
treeview/box-block-tail-decoration-unselected-semicolon] [fixture:
treeview/box-block-tail-decoration-comment-line] [fixture:
treeview/box-block-tail-decoration-comment-after] [fixture:
treeview/box-block-tail-decoration-blank-before] [fixture:
treeview/box-block-tail-decoration-ls] [fixture:
treeview/box-block-tail-decoration-ps] [fixture:
treeview/box-block-tail-decoration-comment-ls] [fixture:
treeview/box-block-tail-decoration-comment-ps] [fixture:
treeview/box-block-tail-decoration-empty-block-before] [fixture:
treeview/box-block-tail-decoration-crlf] [fixture:
treeview/box-block-tail-decoration-cr] [fixture:
treeview/box-block-tail-decoration-opener-gap-selector]

TreeviewBranchPrefix covers the line's first non-whitespace character through
its first branch and adjacent dash run, excluding leading whitespace and
following separator spaces. TreeviewIgnoredText covers a decoration's first
through last non-whitespace character, excluding outer padding and its following
LF. Inside an already-open leaf, prefixes and decorations instead remain in that
leaf, including their authored line endings and enclosed excluded padding; they
have no overlapping children. [fixture: treeview/box-written-tree] [fixture:
treeview/box-prefix-nonbmp-column] [fixture: treeview/box-prefix-arbitrary]
[fixture: treeview/box-branch-no-dash] [fixture:
treeview/box-unicode-decoration] [fixture:
treeview/ast-prefix-inside-and-outside] [fixture:
treeview/ast-decoration-internal-and-body] [fixture:
treeview/box-multiline-name-tail-trim] [fixture: treeview/box-block-decoration]
