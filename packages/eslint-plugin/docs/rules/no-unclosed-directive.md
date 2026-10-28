# @mmd-toolkit/no-unclosed-directive

Japanese version: [no-unclosed-directive.ja.md](./no-unclosed-directive.ja.md)

Disallow a directive without its closing `}%%` that takes the lines after it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A directive runs from `%%{` to its `}%%`. A directive whose argument starts with
a character that is not a word character, as the `{` of
`%%{init: {"theme": "dark"}}%%`, runs to the first `}%%` after it. Without its
own `}%%`, it runs to a `}%%` written later, to the end of the text, or to the
first U+2028 or U+2029, and mermaid.js reads the lines up to there into the
directive without an error: the statements on them disappear from the diagram.

## Rule Details

This rule reports a directive that holds text of a later line than its `%%{`,
other than its name and the JSON object or array with which its argument starts.
It applies to every diagram type.

After `A --> B`, the lines `%%{init: {"theme": "dark"}}`, without the final
`%%`, and `C --> D` give a flowchart with the link from `A` to `B` only:
`C --> D` is in the directive. A `}%%` written later closes the directive: with
`%%{wrap}%%` after `C --> D`, the first directive runs to the `}%%` of the
second, and both `C --> D` and the `wrap` directive disappear. The rule reports
the directive in both cases, without a `}%%` and closed by a later `}%%`.

A directive whose argument starts with a word character takes that word as its
argument, and the whitespace before the word crosses line breaks: `%%{wrap` at
the end of a line takes the first word of the next line, and that word
disappears. The rule reports it.

The JSON object or array of an argument may run over several lines. It ends at
the bracket that closes its first bracket, and the lines that it covers are not
reported; an object that never closes covers the rest of the directive. So a
directive at the end of the text takes no statement, also without its `}%%`, and
is not reported: `%%{init: {"theme": "dark"}` without `}%%` as the last line
still sets the theme. A U+2028 or U+2029 ends a directive that has no `}%%`, and
the text after it is read as written.

Where what is left is no valid diagram, mermaid.js rejects the text, and the
rule does not see it: a directive left without its `}%%` before the header takes
the header. When the text that the directive takes breaks the JSON argument of
an init directive, [no-invalid-init-directive](./no-invalid-init-directive.md)
reports it too.

Close the directive with `}%%`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
flowchart LR
  A --> B
  %%{init: {"theme": "dark"}}
  C --> D
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
flowchart LR
  A --> B
  %%{init: {"theme": "dark"}}%%
  C --> D
```

## Options

This rule has no options.

## Related Rules

- [no-invalid-init-directive](./no-invalid-init-directive.md)

## Background

The
[pattern of a directive](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/regexes.ts#L9-L10)
takes a word argument, or a free-text argument up to the first `}%%`, a U+2028,
a U+2029, or the end of the text, and
[`removeDirectives`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L200-L202)
removes what it matches before the diagram is read.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/no-unclosed-directive.ts)
- [Tests source](../../tests/rules/no-unclosed-directive.test.ts)

<!-- end auto-generated rule resources -->
