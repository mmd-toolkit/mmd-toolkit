---
"@mmd-toolkit/spec": patch
---

Say in Indentation and lines of `diagrams/treeview.md` that a space run after a
quoted name, a class, or an icon becomes the indentation of the next node also
across empty lines, comment lines, and directive lines, and that with no node
after it, also after a comment, it reaches the end of the text as indentation
without a name, which is rejected.
