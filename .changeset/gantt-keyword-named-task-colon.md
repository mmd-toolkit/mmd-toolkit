---
"prettier-plugin-mmd": patch
---

Fix a Gantt task named like a keyword becoming another statement when the colons
of its section were lined up: `title:T` next to a task with padding was printed
`title         :T`, which is a title. A task named `title`, `section`,
`dateFormat`, `axisFormat`, `tickInterval`, `includes`, `excludes`,
`todayMarker`, `accDescription`, `click`, or `call` now keeps its colon against
it.
