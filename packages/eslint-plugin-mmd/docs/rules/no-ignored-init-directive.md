# mmd/no-ignored-init-directive

Japanese version:
[no-ignored-init-directive.ja.md](./no-ignored-init-directive.ja.md)

Disallow a directive meant to configure the diagram that mermaid.js ignores.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

mermaid.js takes configuration from init directives: the directives whose name
ends with `init` or `initialize`, compared exactly. Some directives that are
meant to configure the diagram are ignored without an error, and the diagram is
drawn without the configuration.

## Rule Details

This rule reports either of these directives. It applies to every diagram type.

- An init directive whose argument is not valid JSON once every `'` is read as
  `"`. A comma after the last entry, as in `%%{init: {"theme": "dark",}}%%`, is
  enough. mermaid.js then ignores every init directive of the text, also the
  valid ones before it.
- A directive whose name differs from an init name only in case, such as `Init`
  or `INIT`.

### In each diagram type

What a reported directive leaves out depends on the diagram type.

- flowchart: The setting `"flowchart": {"inheritDir": true}` gives a subgraph
  the direction of the diagram. In such a directive with a comma after the last
  entry, or named `INIT`, the subgraph gets no direction.
- sequence: The setting `"sequence": {"wrap": true}` wraps the text of the
  participants and the messages. In such a directive, the text is not wrapped.
- class: The settings of such a directive, such as `"theme": "dark"`, are not
  applied, and the class diagram is drawn without them.
- state: The settings of such a directive, such as `"theme": "dark"`, are not
  applied, and the state diagram is drawn without them.

The examples are flowcharts.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/no-ignored-init-directive: error
%%{init: {"flowchart": {"inheritDir": true},}}%%
flowchart LR
  subgraph S
    A
  end
```

```mmd
%% eslint mmd/no-ignored-init-directive: error
%%{INIT: {"flowchart": {"inheritDir": true}}}%%
flowchart LR
  subgraph S
    A
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/no-ignored-init-directive: error
%%{init: {"flowchart": {"inheritDir": true}}}%%
flowchart LR
  subgraph S
    A
  end
```

## Options

This rule has no options.

## Related Rules

- [no-unclosed-directive](./no-unclosed-directive.md)
