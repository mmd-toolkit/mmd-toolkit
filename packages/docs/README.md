# Documentation site

This private package builds the
[mmd-toolkit documentation site](https://mmd-toolkit.github.io/mmd-toolkit/)
with VitePress.

```sh
pnpm --filter @mmd-toolkit/parser --filter @mmd-toolkit/eslint-plugin build
pnpm --filter @mmd-toolkit/docs dev
pnpm --filter @mmd-toolkit/docs build
pnpm --filter @mmd-toolkit/docs preview
pnpm --filter @mmd-toolkit/docs test
```

Build the parser and linter before running the site or its tests. Diagnostic
markers execute the workspace linter while rendering pages; rebuild those
packages after changing their implementation.

`mmd` code fences containing `%% eslint @mmd-toolkit/` use `twoslash-eslint` to
show actual ESLint diagnostics on hover. Enable the rules an example
demonstrates with `%% eslint <rule>: <config>` comments; the renderer registers
the Mermaid language without enabling rules by default. Other fences are left as
normal syntax-highlighted examples.

In `packages/eslint-plugin/docs/rules/`, begin every `mmd` example in both
languages with `%% eslint @mmd-toolkit/<rule>: error`, using the rule described
by that page. Put the comment before the diagram header and Mermaid directives,
without indentation, in both correct and incorrect examples. The linter
package's `check:docs` enforces this requirement; its
[development guide](../eslint-plugin/docs/development.md#rules-and-their-documents)
describes how these examples are also used by tests.

Edit site guides, including formatter compatibility, in `pages/`. Edit imported
rule documents in `packages/eslint-plugin/docs/rules/`. Both English and
Japanese documents are included. The specification's detailed divergence
documents, formatting rules and compatibility explanations, syntax, AST, token
and position definitions, exact error-position rules, and development guides are
read on GitHub; the site focuses on using the tools.

Diagram types are discovered from the English files in
`packages/spec/docs/diagrams/` to group the linter's rules and use the
specification's localized headings for their sidebar labels. Adding another
diagram needs no new entry in the site's configuration. The presentation order
follows Mermaid's
[`sidebarSyntax()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/.vitepress/config.ts#L160-L207)
and is defined in `.vitepress/documents.js`. Types without a defined position
are appended in filename order.

The linter's rule sidebar is generated from the imported rule pages available in
each language. Common rules come first, followed by diagram families in the
Mermaid order above; rule names are sorted within each group. New families
follow the known families in name order.

The source mapping is in `.vitepress/documents.js`. Startup and build copy the
documents into `lib/pages/`, which is ignored by Git. For imported references,
the copy omits the leading English/Japanese language notice; the originals stay
unchanged. Use the header's language menu to switch between paired pages.
Development watches the originals and updates changed, added, and removed pages.
Do not edit generated copies. The build output is `lib/site/`.

Changes to diagram types, display titles, or available rule pages also reload
the VitePress configuration to refresh navigation. Body edits use the normal
page hot updates.

Rendering resolves links to imported documents as site links, and other
repository links and fixture citations as GitHub links. The source link on each
page points to its original document.
