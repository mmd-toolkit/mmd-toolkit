# @mmd-toolkit/wardley-no-duplicate-evolution

Japanese version:
[wardley-no-duplicate-evolution.ja.md](./wardley-no-duplicate-evolution.ja.md)

Disallow an `evolution` that replaces the stages set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A map has one row of stages. A later `evolution` replaces the stages set before
it without an error, and the earlier stages are lost.

## Rule Details

This rule applies to Wardley maps (`wardley-beta`). It reports an `evolution`
that changes the names or drawn boundaries of the stages set by the preceding
`evolution`. A statement repeating the current stages is not reported. Names are
compared without spaces at their ends, with a second name joined to the first by
a `/` with one space on each side, as mermaid.js shows them.

Boundaries are compared as drawn: mermaid.js uses them only when every stage has
one, and draws stages of equal width otherwise, so `A@0.5 -> B@1.0` and `A -> B`
are the same. Names are otherwise compared as written. mermaid.js converts
character references such as `#35;` and HTML attribute quotes before reading a
name, so names differing only in these ways may be the same for mermaid.js and
different for this rule.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-duplicate-evolution.ts)
- [Tests source](../../tests/rules/wardley-no-duplicate-evolution.test.ts)

<!-- end auto-generated rule resources -->
