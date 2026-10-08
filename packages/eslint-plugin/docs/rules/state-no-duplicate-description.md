# @mmd-toolkit/state-no-duplicate-description

Japanese version:
[state-no-duplicate-description.ja.md](./state-no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A diagram has one description. mermaid.js accepts every `accDescr` statement,
and each one that sets the description silently replaces the description set
before it. A second description is usually left over from rewriting the text or
from pasting a part twice.

## Rule Details

This rule reports every statement that sets the description after the first one.
It applies to `stateDiagram`.

`accDescr:` sets the description. Without text, it sets the description too: it
takes the next line that holds text as the description, past empty lines,
comment lines, and directives, and when no such line follows, it makes the
description empty. A closed block that holds a description sets it as well. The
line form and the block form may be mixed: whichever comes first, the
description written last is used.

A block that holds no description is not counted;
[state-no-empty-description-block](./state-no-empty-description-block.md)
reports it. Nor is a block that is not closed, which runs to the end of the text
and makes the description empty;
[state-no-unclosed-description-block](./state-no-unclosed-description-block.md)
reports it. Inside a composite state, `accDescr: x` is no `accDescr` statement:
mermaid.js reads it as a state `accDescr` with the description `x`, and the rule
does not count it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr: first
  accDescr: second
  A --> B
```

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr { first }
  accDescr: second
  A --> B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accTitle: first
  accDescr: second
  A --> B
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)
- [state-no-duplicate-title](./state-no-duplicate-title.md)
- [state-no-empty-description-block](./state-no-empty-description-block.md)
- [state-no-unclosed-description-block](./state-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/state-no-duplicate-description.ts)
- [Tests source](../../tests/rules/state-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
