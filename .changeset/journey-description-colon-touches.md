---
"prettier-plugin-mmd": minor
---

Print the first colon of a `journey` task touching its description:
`Make tea : 5: Me` becomes `Make tea: 5: Me`. Before, since the first release,
the whitespace before that colon stayed as written, because mermaid.js keeps it
in the description, so the same task came out in different forms although all of
them draw the same. Now the colon touches the description, as in the examples of
the documentation of mermaid.js, and a section whose descriptions are padded to
line the colons up stays as written.
