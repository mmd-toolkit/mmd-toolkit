---
"@mmd-toolkit/spec": patch
---

Cite fixtures of an `agentflow-beta` label that holds only whitespace and a
comment, such as `A[ %% c` followed by a line `]`, in the label comment rules of
`diagrams/agentflow.md` and in AgentflowLabel of `ast/agentflow.md`: the label
is the whitespace-only label of the space and the line feed, without the
comment.
