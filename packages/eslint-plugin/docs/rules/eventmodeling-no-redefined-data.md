# @mmd-toolkit/eventmodeling-no-redefined-data

Japanese version:
[eventmodeling-no-redefined-data.ja.md](./eventmodeling-no-redefined-data.ja.md)

Disallow a `data` block that no frame can show, because an earlier block has its
name.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A frame shows the first `data` block of the name that it references. A later
block of that name is never shown: mermaid.js accepts it without an error, and
its content is lost.

## Rule Details

This rule reports a `data` block whose name an earlier `data` block has, when a
frame references the name and the content differs from the content of the first
block. It applies to `eventmodeling`.

After a block `Payload` that holds `first` and a block `Payload` that holds
`second`, a frame with `[[Payload]]` shows `first`. A later block is compared
with the first: after `first`, `second`, `first`, and `third`, the second and
the fourth blocks are reported.

A frame of either kind counts, before or after the blocks. Blocks of a name that
no frame references are not reported, since none of them is shown. The data type
in backticks, as `` `json` ``, is not compared, since mermaid.js does not show
it. Contents are compared as written, with every line break (LF, CRLF, or CR)
read as a line feed, since mermaid.js shows the spaces and the lines of a block
as written: a later empty block is reported too, and so is a block that differs
only in a space. A comment line in a block is no content, since mermaid.js
removes it. mermaid.js turns character references, as `#35;`, and HTML into
other text before it shows a block, so two contents that differ only in those
may be shown alike, and are still reported.

Give each content its own name, as `Payload01` and `Payload02`, or keep one
block.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-redefined-data: error
eventmodeling
  tf 01 evt Bought [[Payload]]
  data Payload {
first
}
  data Payload {
second
}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-redefined-data: error
eventmodeling
  tf 01 evt Bought [[Payload01]]
  tf 02 evt Bought [[Payload02]]
  data Payload01 {
first
}
  data Payload02 {
second
}
```

## Options

This rule has no options.

## Related Rules

- [eventmodeling-no-undef](./eventmodeling-no-undef.md)

## Background

The
[data of a frame](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L348-L362)
is the first data block of the name, and the
[documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L95-L97)
gives the blocks of a repeated entity names with numbers. The
[documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L309-L311)
also says that the drawing treats no data type in its own way.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/eventmodeling-no-redefined-data.ts)
- [Tests source](../../tests/rules/eventmodeling-no-redefined-data.test.ts)

<!-- end auto-generated rule resources -->
