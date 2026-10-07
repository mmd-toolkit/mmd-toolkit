# mmd/class/no-bare-class-name

Japanese version: [no-bare-class-name.ja.md](./no-bare-class-name.ja.md)

Disallow a class name alone on its line, which changes nothing.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts a line that holds only a class name and does nothing with it:
it declares no class. What the author wrote on such a line has no effect.

## Rule Details

This rule reports a line that holds only a class name. It applies to
`classDiagram`.

A class name is one or more words, and mermaid.js leaves out the whitespace
between them. Such a line comes about in these ways:

- `direction lr`, with the direction value in lower case, is the class name
  `directionlr`, and the direction stays `TB`.
- `title Animals` is the class name `titleAnimals`. A class diagram has no
  `title` statement; the title shown with the diagram is set in the frontmatter
  only, so the title stays empty.
- `Foo` alone declares no class `Foo`. A class is declared with `class Foo`, by
  a relation, or by a member statement such as `Foo : +int x`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/class/no-bare-class-name: error
classDiagram
  direction lr
```

```mmd
%% eslint mmd/class/no-bare-class-name: error
classDiagram
  title Animals
  class A
```

```mmd
%% eslint mmd/class/no-bare-class-name: error
classDiagram
  Foo
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/class/no-bare-class-name: error
classDiagram
  direction RL
  class A
```

```mmd
%% eslint mmd/class/no-bare-class-name: error
classDiagram
  class Foo
```

## Options

This rule has no options.

## Related Rules

- [no-ignored-text](./no-ignored-text.md)
