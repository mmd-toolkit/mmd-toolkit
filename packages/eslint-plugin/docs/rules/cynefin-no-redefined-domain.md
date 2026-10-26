# @mmd-toolkit/cynefin-no-redefined-domain

Japanese version:
[cynefin-no-redefined-domain.ja.md](./cynefin-no-redefined-domain.ja.md)

Disallow a domain written again without an item that it had before.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A domain written again does not add its items to the ones written before:
mermaid.js replaces them with the later items without an error, and an item that
the later block does not repeat is lost.

## Rule Details

This rule reports a domain statement that lacks an item of the statement of the
same domain before it. It applies to `cynefin`.

After `complex "Investigate"` and `complex "Experiment"`, the domain `complex`
has only `Experiment`, and `Investigate` is not drawn. A domain written again
with no items removes every item. Each statement is compared with the one of the
same domain just before it, also an empty one.

A statement that keeps every item of the one before it is not reported, also
where it adds items or writes them in another order. An item written twice
counts twice: after `complex "A" "A"`, the statement `complex "A"` removes one
of them and is reported. A statement after one with no items loses nothing and
is not reported. Every line break (LF, CRLF, or CR) in an item is read as a line
feed. Items are otherwise compared as written: mermaid.js decodes escapes, as
`\n`, and turns character references, as `#35;`, and the quotes of HTML
attributes into other characters before it reads an item, so two items that
differ only in those may be one item for mermaid.js and two for this rule. The
domain `confusion` draws its first three items and a count of the rest, so a
change to an item after the third is reported although only the Db shows it.

Write each domain once, with all its items.

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

## Background

The
[Db](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinDb.ts#L34-L48)
stores the items of a domain under its name, over the items stored there before.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/cynefin-no-redefined-domain.ts)
- [Tests source](../../tests/rules/cynefin-no-redefined-domain.test.ts)

<!-- end auto-generated rule resources -->
