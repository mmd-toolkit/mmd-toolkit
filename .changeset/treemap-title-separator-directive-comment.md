---
"prettier-plugin-mmd": patch
---

Fix a `treemap` whose `title` or `accTitle:` text is followed by U+2028, a
directive, a comment, an empty line, and a row, which changed when it was
formatted a second time: the directive and the comment were printed
`%%{x}%% %% c` and are now printed `%%{x}%%%% c`.
