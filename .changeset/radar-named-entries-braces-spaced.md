---
"prettier-plugin-mmd": minor
---

Print the braces of a `radar-beta` curve with named entries with one space
inside each end: `curve c{m: 60, s: 70}` is now printed
`curve c{ m: 60, s: 70 }`. The braces were printed tight, like those of a curve
of values, but a list of names and values is the kind of braces that Prettier
prints with a space inside, so these curves looked unlike the objects in the
rest of a project. Now a curve with named entries has the space, which
mermaid.js reads the same, and a curve of values only, `curve c{85, 90}`, stays
tight.
