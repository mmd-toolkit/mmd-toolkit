---
"prettier-plugin-mmd": patch
---

Fix an `agentflow-beta` heading that holds a directive and ends with a `;` that
the line rule ignores and whitespace:
`accDescr {style:#x} flow F #%%{init: {}}%%;` followed by two spaces was printed
with the `;` and, formatted again, without it, and is now printed without it at
once. `flow F%% style:#x ;;` keeps the space before the `;;`, where it was
printed as `flow F%% style:#x;;`, which mermaid.js rejects.
