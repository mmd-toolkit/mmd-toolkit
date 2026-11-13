---
"prettier-plugin-mmd": patch
---

Print one space between a `title` without text and a directive or a comment
after it on its line, in `treemap` and `treeView-beta`: `title %%{init: {}}%%`
was printed `title%%{init: {}}%%`, and `title  %%{init: {}}%%`, with two spaces,
changed again when it was formatted a second time.
