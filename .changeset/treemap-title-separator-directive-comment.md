---
"prettier-plugin-mmd": patch
---

Print a directive and a comment that follow a `treemap` `title` ended by U+2028
without a space between them: `%%{x}%%  %% c` is now printed `%%{x}%%%% c`, not
`%%{x}%% %% c`.
