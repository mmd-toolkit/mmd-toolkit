---
"prettier-plugin-mmd": patch
---

Keep entity names in `state` styles unchanged:
`classDef k fill:#F9F;%%{init: {}}%%;` now keeps `#F9F` instead of printing
`#f9f`.
