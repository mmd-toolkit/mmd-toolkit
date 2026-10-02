# mmd/sequence/no-create-destroy

Japanese version: [no-create-destroy.ja.md](./no-create-destroy.ja.md)

Disallow `create` before `destroy`.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

`create` is written before `participant` or `actor` to create a participant at a
message. Before `destroy`, mermaid.js accepts it and creates the participant,
and the participant is not destroyed: `create destroy A` does what
`create participant A` does.

## Rule Details

This rule reports a `destroy` statement that `create` comes before. It applies
to `sequence`.

`create destroy A`, followed by `B ->> A: x`, creates `A` at the message, as
`create participant A` does, and records nothing as destroyed.

Examples of **incorrect** code for this rule:

```mmd
sequenceDiagram
  create destroy A
  B ->> A: x
```

Examples of **correct** code for this rule:

```mmd
sequenceDiagram
  create participant A
  B ->> A: x
```

## Options

This rule has no options.
