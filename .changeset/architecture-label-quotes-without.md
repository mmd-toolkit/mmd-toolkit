---
"prettier-plugin-mmd": minor
---

Print the label of an `architecture` group or service without quotes when it
holds no bracket, quote, or backslash: `service api(server)["A.B"]` becomes
`service api(server)[A.B]`.
