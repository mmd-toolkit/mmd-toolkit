---
"prettier-plugin-mmd": patch
---

Keep a tab between the words of an `architecture-beta` label:
`service api(server)["A<tab>B"]` becomes `service api(server)[A<tab>B]` instead
of replacing the tab with a space.
