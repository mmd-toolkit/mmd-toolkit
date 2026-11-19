---
"prettier-plugin-mmd": patch
---

Print the directive and the comment that follow a U+2028 or U+2029 after a
`treemap` `title` or `accTitle:` text touching each other on a line of their
own, so that the second formatting changes nothing: `%%{x}%% %% c` on the line
after `title T` now prints `%%{x}%%%% c`.
