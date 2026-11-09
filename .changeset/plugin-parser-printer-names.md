---
"prettier-plugin-mmd": minor
---

Type `parsers` and `printers` of the plugin with the name `mermaid`, as the
plugins of Prettier do, so that `parsers.mermaid` and `printers.mermaid` are
known to exist. Indexing them with a string variable, as in `parsers[name]`, is
now a type error: index `plugin.parsers?.[name]` of the default export instead.
