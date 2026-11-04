---
"@mmd-toolkit/spec": patch
---

`sequence`, Blocks and Rejections outside the grammar: state what the grammar
and the source order already decide. Blocks and boxes nest, each `end` closes
the innermost one, a section keyword belongs to the innermost open block, and a
statement in a block or a section counts once, where it is written.
