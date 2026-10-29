# @mmd-toolkit/cynefin-no-redefined-domain

Japanese version:
[cynefin-no-redefined-domain.ja.md](./cynefin-no-redefined-domain.ja.md)

Disallow a domain written again without an item that it had before.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A domain written again does not add its items to the ones written before:
mermaid.js replaces them with the later items without an error, and an item that
the later block does not repeat is lost.

## Rule Details

This rule applies to Cynefin diagrams (`cynefin-beta`). It reports a domain
statement that lacks an item of the preceding statement of the same domain. A
domain written again with no items is reported too. A statement that keeps every
item of the preceding one is not reported, even if it adds items or changes
their order. An item written twice counts twice, so `complex "A"` after
`complex "A" "A"` is reported.

A statement after one with no items is not reported.

Items are compared as written. mermaid.js converts character references such as
`#35;` and HTML attribute quotes before reading an item. Items differing only in
these ways may be the same for mermaid.js and different for this rule. The
`confusion` domain draws its first three items and a count of the rest, but a
change to an item after the third is also reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/cynefin-no-redefined-domain: error
cynefin-beta
  complex
    "Investigate"
  clear
    "Restart"
  complex
    "Experiment"
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/cynefin-no-redefined-domain: error
cynefin-beta
  complex
    "Investigate"
    "Experiment"
  clear
    "Restart"
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/cynefin-no-redefined-domain.ts)
- [Tests source](../../tests/rules/cynefin-no-redefined-domain.test.ts)

<!-- end auto-generated rule resources -->
