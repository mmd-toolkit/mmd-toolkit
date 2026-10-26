# @mmd-toolkit/wardley-no-duplicate-evolution

Japanese version:
[wardley-no-duplicate-evolution.ja.md](./wardley-no-duplicate-evolution.ja.md)

Disallow an `evolution` that replaces the stages set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A map has one row of stages. A later `evolution` replaces the stages set before
it without an error, and the earlier stages are lost.

## Rule Details

This rule reports an `evolution` that gives other stages than the `evolution`
before it: other names, or other boundaries where they are drawn. It applies to
`wardley`.

After `evolution Genesis -> Custom` and `evolution Early -> Late`, the map shows
only `Early` and `Late`.

An `evolution` that gives the stages that the map already has is not reported.
Names are compared without the spaces at their ends, and a second name is joined
to the first with a `/` that has one space on each side, as mermaid.js shows
them. mermaid.js draws the boundaries only where every stage has one and draws
equal stages otherwise, so the boundaries are compared as drawn:
`A@0.5 -> B@1.0` and `A -> B` give one row of stages. Names are otherwise
compared as written: mermaid.js turns character references, as `#35;`, and the
quotes of HTML attributes into other characters before it reads a name, so two
names that differ only in those may be one name for mermaid.js and two for this
rule.

Write one `evolution`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-evolution: error
wardley-beta
  evolution Genesis -> Custom
  evolution Early -> Late
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-evolution: error
wardley-beta
  evolution Early -> Late
```

## Options

This rule has no options.

## Background

The parser keeps the last `evolution`, and the
[map](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L76-L90)
takes its names, joining a second name with a `/` that has one space on each
side, and its boundaries.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-duplicate-evolution.ts)
- [Tests source](../../tests/rules/wardley-no-duplicate-evolution.test.ts)

<!-- end auto-generated rule resources -->
