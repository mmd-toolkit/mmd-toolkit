---
"prettier-plugin-mmd": patch
---

Print the directive and the comment that follow a U+2028 or U+2029 in a
`treemap` `title` or `accTitle:` line touching each other, so that formatting
the file again changes nothing: `title`, a space, the character, a space,
`%%{x}%%`, two spaces, `%% c`, a blank line, and a row print `title` and
`%%{x}%%%% c` on separate lines.
