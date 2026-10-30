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
