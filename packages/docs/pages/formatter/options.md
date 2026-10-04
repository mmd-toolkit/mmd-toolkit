# Formatter options

The plugin uses [Prettier's standard options](https://prettier.io/docs/options)
and adds no options of its own. Set these options in your
[Prettier configuration](./configuration.md).

## Prettier options used in diagram formatting

- [`tabWidth`](https://prettier.io/docs/options#tab-width): the width of space
  indentation in diagrams.
- [`useTabs`](https://prettier.io/docs/options#tabs): whether to indent diagrams
  with tabs.
- [`endOfLine`](https://prettier.io/docs/options#end-of-line): line endings in
  the formatted output.

## Indentation

For example, this Mermaid input:

```mmd
flowchart LR
subgraph S
A --> B
end
```

is formatted with four spaces per level when `tabWidth: 4` and space indentation
are selected:

```mmd
flowchart LR
    subgraph S
        A --> B
    end
```

With `useTabs: true`, each indentation level in the diagram uses one tab.

## Line width

`printWidth` does not wrap diagram lines. Prettier's formatting of Markdown and
YAML frontmatter can still use `printWidth`.

## Try the options online

Open the [four-space example][spaces-example] or the [tab example][tabs-example]
in the Playground and select **Formatted**. **Indent** controls `tabWidth`, and
**Use tabs** controls `useTabs`. The preview updates when you change them.
Playground output always uses LF line endings.

[spaces-example]:
  https://mmd-toolkit.github.io/mmd-toolkit/playground/#v1=H4sIAAAAAAAAE6tWKs4vLUpOVbJSSsvJL0_OSCwqUfAJiskrLk1KL0osyFAIjslzVNDVtVNwislLzUuJyVPSUSpJTArPTCnJULIy0VEqLU4NSUwqVrJKS8wpTq0FAMg1m-5SAAAA
[tabs-example]:
  https://mmd-toolkit.github.io/mmd-toolkit/playground/#v1=H4sIAAAAAAAAE6tWKs4vLUpOVbJSSsvJL0_OSCwqUfAJiskrLk1KL0osyFAIjslzVNDVtVNwislLzUuJyVPSUSpJTArPTCnJULIy0VEqLU4NSUwqVrIqKSpNrQUAtB2x3lEAAAA
