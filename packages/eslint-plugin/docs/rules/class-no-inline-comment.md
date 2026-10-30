# @mmd-toolkit/class-no-inline-comment

Japanese version:
[class-no-inline-comment.ja.md](./class-no-inline-comment.ja.md)

Disallow a comment after other text on its line.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

A comment after a statement can make the next line continue that statement.
mermaid.js includes the following line break in the comment, which can change
the diagram without an error or make the text invalid.

## Rule Details

This rule applies to class diagrams (`classDiagram` and `classDiagram-v2`). It
reports a comment after other text on the same line when more text follows it. A
comment on the last line of the text is not reported, because mermaid.js reads
it as intended.

Comments are also reported when the next line cannot continue the statement or
the comment follows the header. mmd-toolkit accepts and formats these texts, but
mermaid.js gives an error for them; this is the known divergence
[`comment-takes-line-break`](../../../spec/docs/known-divergences/comment-takes-line-break.md).

Comments followed by whitespace-only lines are reported even when those lines
keep the statements apart, because that depends on invisible whitespace.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-inline-comment: error
classDiagram
  Animal <|-- Duck %% ducks
  Animal : +int age
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-inline-comment: error
classDiagram
  %% Animals
  class Animal
  Animal <|-- Duck
```

```mmd
%% eslint @mmd-toolkit/class-no-inline-comment: error
classDiagram
  class Animal
  Animal <|-- Duck %% ducks
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/class-no-inline-comment.ts)
- [Tests source](../../tests/rules/class-no-inline-comment.test.ts)

<!-- end auto-generated rule resources -->
