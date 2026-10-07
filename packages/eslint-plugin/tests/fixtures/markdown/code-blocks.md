# Diagrams in Markdown

A `mermaid` code block:

```mermaid
flowchart LR
  A --> B
```

A `mmd` code block, indented in a list item:

- Steps:

  ```mmd
  flowchart TD
    C --> D
  ```

A `mermaid` code block that holds no diagram:

```mermaid
not a diagram
```

A code block of another language, which the Mermaid language does not read:

```text
E --> F
```
