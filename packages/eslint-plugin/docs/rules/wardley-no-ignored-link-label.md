# @mmd-toolkit/wardley-no-ignored-link-label

Japanese version:
[wardley-no-ignored-link-label.ja.md](./wardley-no-ignored-link-label.ja.md)

Disallow a label after `;` that the label in the arrow of the link replaces.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A link has one label: the one in its arrow, as `+'calls'>`, or the one after
`;`. When a link has both, mermaid.js uses the label in the arrow without an
error, and the label after `;` is lost.

## Rule Details

This rule reports a label after `;` of a link whose arrow holds another label.
It applies to `wardley`.

`API +'calls'> Database; storage` draws the label `calls` only. An empty label
in the arrow replaces it too: `API +''> Database; storage` draws no label.

A label after `;` that is the label in the arrow, a label after `;` of only
spaces, and a link with one label are not reported. A link that draws nothing,
since an end names no node or since it joins a child of a pipeline to its
parent, is not reported. Every line break (LF, CRLF, or CR) in a label is read
as a line feed. Labels are otherwise compared as written: mermaid.js turns
character references, as `#35;`, and the quotes of HTML attributes into other
characters before it reads a label, so two labels that differ only in those may
be one label for mermaid.js and two for this rule.

Write one label for each link.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-ignored-link-label: error
wardley-beta
  component API [0.6, 0.7]
  component Database [0.3, 0.8]
  API +'calls'> Database; storage
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-ignored-link-label: error
wardley-beta
  component API [0.6, 0.7]
  component Database [0.3, 0.8]
  API +'calls'> Database
```

## Options

This rule has no options.

## Related Rules

- [wardley-no-undef](./wardley-no-undef.md)

## Background

The
[parser](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L178-L186)
takes the label in the arrow, and the label after `;` only where the arrow has
none.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-ignored-link-label.ts)
- [Tests source](../../tests/rules/wardley-no-ignored-link-label.test.ts)

<!-- end auto-generated rule resources -->
