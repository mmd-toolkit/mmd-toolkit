---
"prettier-plugin-mmd": patch
---

Fix an `agentflow-beta` heading that holds a directive and ends with a `;` that
the line rule ignores and whitespace, which was printed in one form and, when
formatted again, in another: `flow F%% style:#x %%{init: {}}%%;` followed by two
spaces is now printed `flow F%% style:#x%%{init: {}}%%` at once, and
`accDescr {style:#x} flow F #%%{init: {}}%%;` followed by two spaces is printed
without the `;` at once. `flow F%% style:#x ;;` keeps the space before the `;;`,
and `flow F%% style:#x %%{init: {}}%%;;` the space before the directive, where
they were printed as `flow F%% style:#x;;` and
`flow F%% style:#x%%{init: {}}%%;;`, which mermaid.js rejects.
