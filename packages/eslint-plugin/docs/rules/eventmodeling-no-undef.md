# @mmd-toolkit/eventmodeling-no-undef

Japanese version: [eventmodeling-no-undef.ja.md](./eventmodeling-no-undef.ja.md)

Disallow a source or a data reference that names nothing.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A time frame names its sources by their numbers after `->>`, and its data block
by its name between `[[` and `]]`. When the name is the name of no frame or of
no data block, mermaid.js accepts it without an error, and draws no relation
from that source and no data of that reference.

## Rule Details

This rule applies to Event Modeling diagrams (`eventmodeling`). It reports a
source of a `tf` or `timeframe` statement that names no frame, and a `[[ ]]`
reference of a frame that names no `data` block. A frame or data block declared
after the reference counts. A `[[ ]]` reference that names no `data` block is
reported even when the frame has inline data, which mermaid.js then shows
instead. Names are compared as written, with their case, so `1`, `01`, and `001`
name three frames.

A source naming a later frame is not reported, though mermaid.js draws no
relation from it.

Sources of reset frames (`rf` or `resetframe`) are not checked, because
mermaid.js draws no relation for them, whatever their sources name; their
`[[ ]]` references are checked. Frames named by `note` and `gwt` are not checked
either, because mermaid.js draws neither statement.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 ui Cart
  tf 02 cmd Buy ->> 99
```

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 evt Bought [[Paylod]]
  data Payload {
items
}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 ui Cart
  tf 02 cmd Buy ->> 01
```

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 evt Bought [[Payload]]
  data Payload {
items
}
```

## Options

This rule has no options.

## Related Rules

- [eventmodeling-no-redefined-data](./eventmodeling-no-redefined-data.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/eventmodeling-no-undef.ts)
- [Tests source](../../tests/rules/eventmodeling-no-undef.test.ts)

<!-- end auto-generated rule resources -->
