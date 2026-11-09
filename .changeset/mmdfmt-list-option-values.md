---
"mmdfmt": patch
---

Report a `printWidth` or `tabWidth` value that Prettier refuses with the value
that was written also for a diagram in a list or a block quote, where
`printWidth: "wide"` was reported as `null`. A value such as `"80"` or `true`,
which Prettier refuses, was taken there until now, and is reported now as for a
diagram outside a list.
