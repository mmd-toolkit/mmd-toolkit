---
"prettier-plugin-mmd": minor
---

Print the colon of an `include` or `extend` link in `usecase-beta` with a space
on each side: `Checkout ..>:include Browse` becomes
`Checkout ..> : include Browse`. Before, the colon touched the arrow and the
keyword as part of one operator, which is not how the documentation of
mermaid.js writes it, so the form that its examples use came out as another one.
Now the link is printed as the examples write it, and the keyword is still
printed in lower case.
