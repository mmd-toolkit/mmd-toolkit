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

This rule applies to Event Modeling diagrams (`eventmodeling`). It reports a
later `data` block with the same name as an earlier block when a frame
references that name and the later block's content differs from that of the
first block. Every later block is compared with the first one. A time frame
(`tf`, `timeframe`) and a reset frame (`rf`, `resetframe`) both count, before or
after the blocks.

Blocks with no frame referencing their name are not reported, because none of
them is shown.

The data type in backticks, such as `` `json` ``, is not compared, because
mermaid.js does not show it. Content is compared as written, with LF, CRLF, and
CR read as LF, so a later empty block or one differing only in a space is
reported too. Comment lines in a block do not count as content, because
mermaid.js removes them. mermaid.js converts character references such as `#35;`
and HTML before showing a block, so content differing only in these ways may be
shown alike and still be reported.

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

## Further Reading

- [Event Modeling syntax: data block names](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L95-L97)
- [Event Modeling syntax: data types](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L309-L311)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/eventmodeling-no-redefined-data.ts)
- [Tests source](../../tests/rules/eventmodeling-no-redefined-data.test.ts)

<!-- end auto-generated rule resources -->
