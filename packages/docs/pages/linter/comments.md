# Configuration comments

Mermaid's `%%` comments can configure ESLint rules inside a diagram. Register
the plugin and Mermaid language in your [configuration](./configuration.md)
first; comments select rules but do not register plugins or languages.

In Markdown, these comments apply to one Mermaid code block. They do not change
the settings of other blocks in the same file.

## Configuring a rule

Use the full rule id after `%% eslint`:

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  style C fill:red
```

This enables `@mmd-toolkit/flowchart-no-undef` as an error for the whole
diagram, even if it is not enabled in the configuration file. The rule reports
`C`. The setting applies throughout the diagram, including text before the
comment. Use `warn` for a warning or `off` to disable the rule.

Common rules use ids such as `@mmd-toolkit/no-unclosed-directive`;
diagram-specific rules use ids such as `@mmd-toolkit/flowchart-no-undef`. See
the [rule list](../../../eslint-plugin/docs/rules/index.md) for their names.

## Suppressing the next line

Use `eslint-disable-next-line` to suppress one statement. A reason follows `--`:

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  %% eslint-disable-next-line @mmd-toolkit/flowchart-no-undef -- C is intentionally created here.
  style C fill:red
  style D fill:blue
```

The comment suppresses the report for `C` on the next line. The report for `D`
remains. Suppressing a report does not change how Mermaid reads the diagram.

`eslint-disable-next-line` targets the next physical line. If a blank line or
another comment follows it, it does not reach the statement after that line.

## Suppressing a region

Use `eslint-disable` and `eslint-enable` to surround a region:

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  %% eslint-disable @mmd-toolkit/flowchart-no-undef -- C is intentionally created here.
  style C fill:red
  %% eslint-enable @mmd-toolkit/flowchart-no-undef
  style D fill:blue
```

Reports for the named rule are suppressed from `eslint-disable` until the
matching `eslint-enable`, or until the end of the diagram if there is no enable
comment. Here only `D` is reported. `eslint-enable` restores a rule that was
suppressed; it does not configure an otherwise disabled rule as an error.

List multiple rule ids separated by commas. Omitting the ids from
`eslint-disable` or `eslint-enable` applies it to all rules.

## Comment placement

Put configuration comments on their own `%%` lines. Diagram-wide `%% eslint`
settings can come before the diagram header, as shown above. Place suppression
comments at the line or region they target.

They must be actual Mermaid comments. Text inside a label, description, or
quoted string is not an ESLint configuration comment.

For diagrams in Markdown, write these comments inside the Mermaid code block. An
HTML comment such as `<!-- eslint @mmd-toolkit/flowchart-no-undef: error -->`
outside the block is not a Mermaid configuration comment. The current Markdown
processor forwards it in JavaScript comment syntax, which this plugin does not
read as an ESLint directive.

`%% eslint-disable-line` suppresses reports on the same physical line. When
written on its own comment line, it does not suppress the next statement; use
`eslint-disable-next-line` for that.

If a `%% eslint` setting cannot be parsed, ESLint reports the invalid setting at
the comment. For example, this configuration is incomplete:

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: [
flowchart LR
  A --> B
```

Correct the setting's syntax before relying on it to configure a rule.
