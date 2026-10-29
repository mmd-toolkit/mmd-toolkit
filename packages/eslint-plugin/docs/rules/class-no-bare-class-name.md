# @mmd-toolkit/class-no-bare-class-name

Japanese version:
[class-no-bare-class-name.ja.md](./class-no-bare-class-name.ja.md)

Disallow a class name alone on its line, which changes nothing.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts a class name written alone as a statement without an error,
but declares no class. What the author wrote has no effect.

## Rule Details

This rule applies to class diagrams (`classDiagram` and `classDiagram-v2`). It
reports a class name written alone as a statement, without `class`, a relation,
or a member. A name can contain several words, whose intervening whitespace
mermaid.js removes.

This includes `direction lr`, which is read as the name `directionlr` and leaves
the direction at `TB`, and `title Animals`, which is read as `titleAnimals`. A
displayed title must be set in frontmatter; there is no `title` statement. A
class is declared with `class Foo`, a relation, or a member statement such as
`Foo : +int x`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-bare-class-name: error
classDiagram
  direction lr
```

```mmd
%% eslint @mmd-toolkit/class-no-bare-class-name: error
classDiagram
  title Animals
  class A
```

```mmd
%% eslint @mmd-toolkit/class-no-bare-class-name: error
classDiagram
  Foo
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-bare-class-name: error
classDiagram
  direction RL
  class A
```

```mmd
%% eslint @mmd-toolkit/class-no-bare-class-name: error
classDiagram
  class Foo
```

## Options

This rule has no options.

## Related Rules

- [class-no-ignored-text](./class-no-ignored-text.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/class-no-bare-class-name.ts)
- [Tests source](../../tests/rules/class-no-bare-class-name.test.ts)

<!-- end auto-generated rule resources -->
