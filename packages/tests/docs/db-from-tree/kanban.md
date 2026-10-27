# Building the kanban Db from the tree

Japanese version: [kanban.ja.md](./kanban.ja.md)

`src/db-from-tree/kanban.ts` implements these steps for
[ast/kanban.md](../../../spec/docs/ast/kanban.md), following
[db-summaries.md, kanban](../db-summaries.md#kanban) and
[embedded-data.md](../embedded-data.md#datablockeffects).
`tests/db-from-tree-kanban.test.ts` supplies each row by hand and compares its
summary with the cited fixture's recorded Db, also after a JSON round trip. The
corpus tests also check recorded kanban trees and common detection fixtures.

## Building the summary from the tree

1. **Texts.** Read each literal or label range in converted form, using its
   written value to identify ignored semicolons: CR and CRLF become LF, HTML
   attribute quotes become single quotes, and entities become placeholders; the
   ranges are read without directives, comment regions, ignored semicolons, and
   string or markdown delimiters, while keeping interior and trailing
   whitespace. [fixture: kanban/lex-string-crlf] [fixture:
   kanban/lex-cr-quoted-value] [fixture:
   kanban/db-grid-html-attribute-item-label-quoted] [fixture:
   kanban/db-grid-entity-item-label-quoted] [fixture:
   kanban/lex-directive-at-value-start] [fixture:
   kanban/lex-comment-quoted-line] [fixture: kanban/lex-label-style-rule]
   [fixture: kanban/db-markdown-label] [fixture: kanban/db-label-multiline]
   [fixture: kanban/db-spaces-label] [fixture: kanban/db-grid-entity-item-id]
   [fixture: kanban/db-grid-entity-named-item-id] [fixture:
   kanban/db-grid-html-attribute-item-id] [fixture:
   kanban/db-grid-entity-item-icon] [fixture:
   kanban/db-grid-html-attribute-item-icon] [fixture:
   kanban/db-grid-crlf-item-icon] [fixture:
   kanban/db-grid-entity-item-label-markdown] [fixture:
   kanban/db-grid-directive-item-id] [fixture:
   kanban/db-grid-directive-item-icon] [fixture:
   kanban/lex-label-directive-line]
2. **Names.** The id is the converted node text when present, otherwise the
   shape label, and the label is the converted shape label when present,
   otherwise the node text, with character replacement applied to both and with
   spaces before a shape and trailing spaces retained. [fixture:
   kanban/db-name-no-id] [fixture: kanban/db-name-two-words] [fixture:
   kanban/db-name-space-before-shape] [fixture: kanban/db-name-trailing-space]
   [fixture: kanban/config-security-level-other]
3. **Membership.** Read Diagram.body as columns with `isGroup: true` and each
   column's children as cards with `isGroup: false`, using the enclosing
   column's converted id as `parentId`. Visit a column before its cards, in
   source order. Do not read indent or reconstruct membership; the parser builds
   the two-level nesting and checkTree independently checks it, including the
   final shallower card. [fixture: kanban/db-sections-items] [fixture:
   kanban/db-indent-unindented] [fixture: kanban/db-indent-tabs] [fixture:
   kanban/db-indent-deeper] [fixture: kanban/db-indent-shallower-last] [fixture:
   kanban/db-section-item-same-id]
4. **Repeated ids.** Keep every section and item definition separately, treating
   prototype names and different letter cases as ordinary distinct ids, then
   emit each section in declaration order followed by all items whose `parentId`
   equals its id, in their written order. [fixture:
   kanban/db-section-three-definitions] [fixture:
   kanban/db-item-three-definitions] [fixture: kanban/db-metadata-repeated-id]
   [fixture: kanban/db-object-prototype-ids] [fixture: kanban/db-name-case]
5. **Data suffixes.** For each nonempty data list, consume one embedded effect
   in source order, check its id against the converted id before sanitizing, and
   apply its `set` once to this definition, including adjacent empty blocks and
   a directive between blocks. [fixture: kanban/db-metadata-all] [fixture:
   kanban/db-metadata-repeated-id] [fixture: kanban/db-metadata-adjacent-comma]
   [fixture: kanban/db-metadata-adjacent-empty] [fixture:
   kanban/db-metadata-two-items] [fixture:
   kanban/db-metadata-adjacent-directive]
6. **Opaque effects.** Keep the effect's values unchanged, including label
   replacement, text conversions, arbitrary priorities, nested non-finite values
   and own prototype keys, and empty effects for falsy values, unknown keys,
   empty blocks, and accepted shape metadata. [fixture:
   kanban/db-metadata-label-list] [fixture: kanban/db-metadata-label-false]
   [fixture: kanban/db-metadata-label-zero] [fixture:
   kanban/db-metadata-label-null] [fixture:
   kanban/db-metadata-label-empty-string] [fixture:
   kanban/db-metadata-ticket-number] [fixture: kanban/db-metadata-assigned-list]
   [fixture: kanban/db-metadata-icon-true] [fixture:
   kanban/db-metadata-priority-non-finite] [fixture:
   kanban/db-metadata-priority-nested-non-finite] [fixture:
   kanban/db-metadata-priority-own-prototype-key] [fixture:
   kanban/db-metadata-priority-list] [fixture: kanban/db-metadata-priority-null]
   [fixture: kanban/db-metadata-priority-zero] [fixture:
   kanban/db-metadata-empty] [fixture: kanban/db-metadata-unknown-key] [fixture:
   kanban/db-metadata-shape-lower] [fixture: kanban/db-metadata-quoted-newline]
7. **Exposed metadata.** Both sections and items expose `label` and `ticket`
   effects, while only items expose `assigned`, `priority`, and `icon`; the
   recorded effects already exclude unexposed section fields. [fixture:
   kanban/db-metadata-all] [fixture: kanban/db-metadata-section-label] [fixture:
   kanban/db-metadata-section-ticket] [fixture:
   kanban/db-metadata-section-assigned] [fixture:
   kanban/db-metadata-section-priority] [fixture:
   kanban/db-metadata-section-icon]
8. **Decorations.** After the suffix effect, the last icon decoration of an item
   replaces its icon, with character replacement, while section icons and all
   class decorations contribute no field. [fixture:
   kanban/db-decoration-icon-twice] [fixture: kanban/db-decoration-icon-section]
   [fixture: kanban/db-decoration-class-item] [fixture:
   kanban/db-decoration-class-twice]
9. **Summary.** Return `{ nodes }`, empty for a board without rows, omitting
   undefined optional fields and the fixed shape, drawing, configuration, and
   title fields, while title and accessibility spellings in the body remain
   ordinary node text. [fixture: kanban/header-only-lf] [fixture:
   kanban/db-empty-board-comment] [fixture: kanban/db-shape-mismatched]
   [fixture: kanban/db-shape-square] [fixture: kanban/db-shape-round] [fixture:
   kanban/db-shape-circle] [fixture: kanban/db-shape-hexagon] [fixture:
   kanban/db-shape-cloud] [fixture: kanban/db-shape-bang] [fixture:
   kanban/db-shape-cloud-alt] [fixture: kanban/db-shape-bang-alt] [fixture:
   kanban/db-metadata-all] [fixture: kanban/header-after-frontmatter] [fixture:
   kanban/db-frontmatter-drawing-config] [fixture:
   kanban/db-title-not-statement] [fixture: kanban/db-acc-title-not-statement]
   [fixture: kanban/db-acc-descr-not-statement]
