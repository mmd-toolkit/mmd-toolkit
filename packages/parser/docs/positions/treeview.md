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

TreeviewNode starts at its earliest prefix, textBeforeName decoration or name,
and ends at its final annotation or name. Ordinary indentation is outside the
range, even when assigned from an earlier line. A prefix supplies the node's
assigned indentation and stays its child when a native comment intervenes.
Decorations in a pending-name gap belong to textBeforeName. [fixture:
treeview/gram-written-tree] [fixture: treeview/db-quoted-tail-space] [fixture:
treeview/box-comment-indent-carry] [fixture:
treeview/box-decoration-pending-name-gap]

Annotations start at their first textBefore decoration, otherwise prefix,
otherwise `:::`, `icon` or `##`. They end at the class name, icon's closing
parenthesis or final description character; an empty description ends at `##`.
An annotation owns preceding decorations only when it follows them; otherwise
they return to body. Its prefix does not change the node's indent. [fixture:
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
between complete items stay in body and do not end the common preamble.
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
