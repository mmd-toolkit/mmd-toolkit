# Building the info Db from the tree

Japanese version: [info.ja.md](./info.ja.md)

`src/db-from-tree/info.ts` builds the
[empty info summary](../db-summaries.md#info) from
[ast/info.md](../../../spec/docs/ast/info.md). Return `{}` for every accepted
tree. Neither showInfo, the four common statement forms nor hidden text
contributes a Db field. Keep those authored occurrences in the tree; no version
or effective title is synthesized. [fixture: info/header-lf] [fixture:
info/header-inline-flag] [fixture: info/common-all] [fixture:
info/common-flag-all] [fixture: info/hidden-yaml-body]

A U+2028 or a U+2029 inside the value of a common statement is a comment start,
so a comment region after it is not in the value, which goes on after the region
(see [Comment lines](../../../spec/docs/common.md#comment-lines)):
`accTitle: A`, U+2028, `%% c`, a line break, and `B` has the title `A`, U+2028,
and `B`, which the summary does not keep, so the fixture records that the input
is accepted. [fixture: info/lex-acc-title-line-separator-then-comment-line]

Frontmatter and directives still supply shared embedded values, but the info
adapter publishes none of them to its Db. [fixture: info/frontmatter-title]
[fixture: info/frontmatter-config] [fixture: info/directive-config]

## Recorded comparisons

Compare `{}` with `specified.json` where present, otherwise `expected.json`. Use
the existing C4 and bare-percent specified readings, checking retained YAML and
second-scan directive prefixes and passed trivia between them. Atomic keyword
cuts reject under their existing marks. Leading opaque YAML rejected by Mermaid
has no comparison Db; do not invent one. [fixture: info/div-c4-hidden-yaml]
[fixture: info/div-c4-retained-directive] [fixture:
info/div-detect-retained-yaml-bare-ls] [fixture:
info/div-detect-retained-directive-bare-bom] [fixture:
info/div-detect-yaml-bare-directive] [fixture: info/div-directive-header-middle]
[fixture: info/div-selected-showinfo] [fixture:
info/div-frontmatter-invalid-yaml] [fixture:
info/div-frontmatter-html-invalid-yaml]
