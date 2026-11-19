---
"prettier-plugin-mmd": patch
---

Print the data block of a `kanban` card with one space inside each end in the
first formatting, where spaces or tabs follow a directive at the end of its
line: `A@{ticket: 1} %%{x}%%` followed by two spaces was printed
`A@{ticket: 1} %%{x}%%`, and only formatting that output again printed
`A@{ ticket: 1 } %%{x}%%`.
