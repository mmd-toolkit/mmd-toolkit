# @mmd-toolkit/agentflow-no-undef

Japanese version: [agentflow-no-undef.ja.md](./agentflow-no-undef.ja.md)

Disallow a `style`, `class`, or `click` statement for an id that nothing
declares.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style`, `class`, and `click` name an element by its id. When no vertex, flow,
connector, or link has that id, mermaid.js accepts the statement without an
error, and it does not reach the intended element.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports an id in
a `style`, `class`, or `click` statement that no vertex, flow, connector, or
link of the diagram has. Each id in a list is checked. Generated ids, such as
`subGraph0` for an unnamed flow or `L_A_B_0` for a link, count as defined.

A statement before the element it names is not reported. This includes `class`
and `click` statements that have no effect there, a `style` whose styles the
first connector declaration discards, and a `style` that affects a separate
vertex instead of a link.

A `style` creates a vertex for an unknown id, so later `style`, `class`, and
`click` statements for that id are not reported. The reserved id `connectors`
creates no ordinary vertex, even with a shape or a `style`, so each use is
reported unless a flow, connector, or written link id declares it separately.

Ids are compared as written, so character references or HTML attribute quotes
can make mermaid.js read two ids as one while this rule treats them as
different. An id written `#35;` and an id written `#` are different ids for
mermaid.js too.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  A --> B
  style C fill:red
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  flow review["Review Agent"]
    A
  end
  class reveiw highlighted
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  A --> B
  style A fill:red
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-undef: error
agentflow-beta TB
  connector github["GitHub API"]
  click github href "https://github.com"
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-undef.ts)
- [Tests source](../../tests/rules/agentflow-no-undef.test.ts)

<!-- end auto-generated rule resources -->
