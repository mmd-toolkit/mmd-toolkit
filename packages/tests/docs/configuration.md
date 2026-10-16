# How mermaid.js derives its configuration

Japanese version: [configuration.ja.md](./configuration.ja.md)

This document describes how the pinned mermaid.js derives its configuration from
the frontmatter and the directives, for checking the Db values that depend on
it. The syntax of the frontmatter and of the directives is defined by the
specification in [`common.md`](../../spec/docs/common.md).

## Configuration (reference)

This section is for reference. It does not take part in deciding whether an
input is accepted or what its tree is: an implementation of this specification
keeps the frontmatter body and the directive arguments as written, and neither
parses nor checks them (see
[`embedded-data-opaque`](../../spec/docs/known-divergences/embedded-data-opaque.md)).
The section describes how mermaid.js derives its configuration from the
frontmatter and the directives, because the Db of some diagrams reads that
configuration. The steps that build the Db of each diagram (in
[db-from-tree/](./db-from-tree/)) take the configuration into account, and
whoever checks Db values derives the configuration with mermaid.js's own
functions. Where mermaid.js rejects an input while it derives the configuration,
the text below says so; this specification accepts such an input.

The derivation follows
[`preprocessDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L91),
[`detectInit()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L98-L130)
and
[`detectDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L159-L198),
[`addDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L277-L290),
[`updateCurrentConfig()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L109-L143),
and
[`sanitizeDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils/sanitizeDirective.ts#L38-L98).

Configuration values are JSON values: null, booleans, numbers, strings, lists,
and mappings. Frontmatter values are read into the same kinds. A **container**
is a list or a mapping. A value is **empty** when it is null, false, zero, not a
number, or the empty string.

The **string form** of a value is: a string itself; `true` for true; for a
number, the decimal form that ECMA-262's Number::toString gives (`1.0` gives
`1`, `1e21` gives `1e+21`, and the YAML `.inf` gives `Infinity`); for a list,
the string forms of its elements joined with `,`, where a null element gives the
empty string; and `[object Object]` for a mapping.

The steps run in the order of the subsections. When mermaid.js rejects the input
in one step, it does not run the later ones.

### Reading the frontmatter body

[`extractFrontMatter()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/frontmatter.ts#L24-L69)
removes the indent from the body (see
[Frontmatter](../../spec/docs/common.md#frontmatter)) and reads the result as
YAML 1.2, the way js-yaml 4.3.0, the version bundled in the pinned mermaid.js,
reads it with its JSON schema (`JSON_SCHEMA`):

- A YAML syntax error makes mermaid.js reject the input with a `YAMLException`.
  A mapping that has the same key twice, and a body that holds more than one
  YAML document, are syntax errors. [fixture: common/frontmatter-yaml-error]
  [fixture: common/frontmatter-duplicate-key] [fixture:
  common/frontmatter-two-documents]
- A body that is not a mapping (for example a plain scalar) counts as an empty
  mapping. [fixture: common/frontmatter-scalar]
- A quoted scalar is a string. A plain scalar is read as the first of the
  following kinds whose form it has, and as a string otherwise. Letters in these
  forms are ASCII letters, and the letter cases shown are the only ones allowed.
  - Null: the empty scalar, `~`, `null`, `Null`, or `NULL`.
  - Boolean: `true`, `True`, `TRUE`, `false`, `False`, or `FALSE`.
  - Integer: an optional `+` or `-`, followed by `0b` and one or more binary
    digits, `0o` and one or more octal digits, `0x` and one or more hexadecimal
    digits, or one or more decimal digits (leading zeros are allowed and do not
    mean octal). Its value is the nearest double-precision number; `-0` is zero,
    not negative zero. A form whose value is infinite is not an integer.
  - Float: an optional sign, one or more decimal digits, optionally `.` and zero
    or more digits, and optionally an exponent (`e` or `E`, an optional sign,
    and one or more digits); or `.`, one or more digits, and an optional
    exponent; or an optional sign and `.inf`, `.Inf`, or `.INF`; or `.nan`,
    `.NaN`, or `.NAN` without a sign. A form of the first two kinds whose value
    is infinite is not a float.

The result is the **frontmatter mapping**. Only three of its keys are used:
`title`, `config`, and `displayMode`.

### Frontmatter configuration

[`processFrontmatter()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L19-L31)
uses the frontmatter mapping as follows. Without frontmatter, the frontmatter
mapping is empty.

- When `title` in the frontmatter mapping is not empty, its string form is the
  **title** of the diagram. The title is not configuration but a Db value, and
  like the Db values that depend on the configuration, it does not come from the
  tree: whoever checks Db values derives it with mermaid.js's own functions.
  [`renderDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L577-L579)
  passes the title to the Db as the diagram title; each diagram document says
  how its Db stores it. `title: [1, 2]` gives the title `1,2`, `title: 1.0`
  gives `1`, and `title: {a: 1}` gives `[object Object]`. mermaid.js reads the
  body after
  [`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)
  has rewritten `="..."` inside HTML tags, so `title: <b class="x">T</b>` gives
  the title `<b class='x'>T</b>`, while `title: "<a b=\"c\">"` has no `="` in
  its tag and gives the title `<a b="c">`. [fixture:
  flowchart/frontmatter-title-html-attribute] [fixture:
  common/frontmatter-title-escaped-quotes-in-tag] As plain scalars, `0x1F` gives
  `31`, `017` gives `17`, `TRUE` gives `true`, `1e400` stays the string `1e400`,
  and `~` is null, so there is no title. [fixture: common/config-title-list]
  [fixture: common/config-title-number] [fixture: common/config-title-mapping]
  [fixture: common/config-title-hex] [fixture: common/config-title-leading-zero]
  [fixture: common/config-title-bool-uppercase] [fixture:
  common/config-title-float-overflow] [fixture: common/config-title-null-tilde]
- When `config` in the frontmatter mapping is not empty, it is the **frontmatter
  configuration**. Otherwise the frontmatter configuration is an empty mapping.
  It applies as it is written; for example a `flowchart` mapping in it
  configures a flowchart. [fixture: flowchart/config-inherit-dir-frontmatter]
- When `displayMode` in the frontmatter mapping is not empty, its string form is
  copied into the frontmatter configuration:
  - When the frontmatter configuration is a string, a number, or true,
    mermaid.js rejects the input with a `TypeError`. Without a non-empty
    `displayMode`, such a frontmatter configuration is accepted by mermaid.js
    too. [fixture: common/frontmatter-display-mode-primitive-config] [fixture:
    common/frontmatter-primitive-config]
  - When the frontmatter configuration is a mapping, its `gantt` entry is first
    replaced by an empty mapping if it is absent or empty. If `gantt` is then a
    string, a number, or true, mermaid.js rejects the input with a `TypeError`.
    Otherwise `displayMode` in `gantt` is set to the string form. [fixture:
    common/config-display-mode-gantt-primitive]
  - When the frontmatter configuration is a list, nothing is copied, and the
    list contributes nothing (see
    [The text configuration](#the-text-configuration)). `config: null` with a
    `displayMode` is accepted, because a null `config` is empty. [fixture:
    common/config-display-mode-list-config] [fixture:
    common/config-display-mode-null-config]

### The configuration scan

mermaid.js finds the directives that configure the diagram with a scan of its
own, not with the scan that finds the `Directive` trivia. The scan starts from
the source after the frontmatter, with line terminators normalized to `\n` and
with `="..."` inside HTML tags rewritten to `='...'` over the whole source,
frontmatter included, as
[`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)
does, and prepares it in this order. Of these steps, only the second can change
which directives are found.

1. Leading and trailing whitespace is removed.
2. Every **closing-marker line** is removed. A closing-marker line starts at a
   `%%` that is directly followed by `}%%`, and extends through the next line
   terminator, provided that neither U+2028 nor U+2029 lies between the `%%` and
   that line terminator. Closing-marker lines are found from left to right and
   do not overlap. A `%%}%%` with no line terminator after it, or with U+2028 or
   U+2029 between it and the next line terminator, starts no closing-marker
   line.
3. Every `'` is read as `"`, so arguments with single-quoted keys and strings
   are valid JSON. [fixture: common/directive-single-quotes]

In the result, directives are found as in
[Where a directive is](../../spec/docs/common.md#where-a-directive-is). This
scan does not look at comment lines, so a directive on a comment line configures
the diagram like any other. [fixture: common/directive-in-comment] [fixture:
common/config-directive-in-comment] A directive on a closing-marker line,
however, is removed with the line: `%%}%% %%{init: ...}%%` is a comment line
that configures nothing. When U+2028 separates the directive from the `%%}%%`,
the line is not removed, and the directive applies. [fixture:
common/config-closing-marker-line] [fixture:
common/config-closing-marker-line-u2028]

The **argument value** of a directive is the argument's word as a string when
the argument is a word, and null when the directive has no argument or its
free-text argument is empty. A non-empty free-text argument is parsed as JSON,
after its leading and trailing whitespace is removed; when an object has the
same key twice, the later value counts. Parsing only happens for the directives
that the steps below look at.

### Init directives

An **init directive** is a directive whose name ends with `init` or with
`initialize`, compared exactly: `init`, `initialize`, `myinit`, and
`reinitialize` are init directives, while `INIT`, `Init`, and `init2` are not.
The name `wrap` and other names are not. [fixture:
common/config-init-name-suffix] [fixture: common/config-init-name-reinitialize]
[fixture: common/config-init-name-uppercase] [fixture:
common/config-init-name-capitalized] [fixture:
common/config-init-name-digit-after] [fixture: common/directive-unknown-name]

The init directives are taken in source order. When the argument of one of them
is not valid JSON, the scan stops at that directive, and there is no init
configuration at all: the init directives before it do not apply either.
mermaid.js still accepts the input. [fixture: common/directive-bad-json]
[fixture: common/config-bad-json-drops-other-inits] A comma before a closing `}`
is not valid JSON either: `%%{init: {"flowchart": {"inheritDir": true},}}%%`
gives no init configuration. [fixture: common/config-init-trailing-comma] A
closed init directive with valid JSON, such as `%%{init: {"theme": "dark"}}%%`
before `flowchart LR` and `A-->B`, changes nothing in how the diagram text is
read. [fixture: common/directive-init-theme] Otherwise the **init
configuration** is:

- with no init directive, none;
- with one init directive, its argument value, unless that is empty, in which
  case there is none. The value need not be a mapping: `%%{init: 5}%%` gives the
  string `5`, because a word argument is a string;
- with two or more, a mapping: each argument value is first filtered with the
  key filter (see [The text configuration](#the-text-configuration)), and the
  values are then merged, in source order, into an empty mapping with the
  depth-limited merge (see
  [The effective configuration](#the-effective-configuration)). Values that are
  not containers contribute nothing, and a list contributes its elements one by
  one. [fixture: common/config-two-inits-merged] [fixture:
  common/directive-two-primitive-inits-wrap]

When there is an init configuration, mermaid.js tries the detectors once more,
on a text of their own: the source after the frontmatter, with the three
removals of [Diagram detection](../../spec/docs/common.md#diagram-detection)
applied (a frontmatter block at its start, directives, and `%%` runs), but
without first removing comment regions and leading whitespace. When no detector
matches this text, mermaid.js rejects the input with `UnknownDiagramError`, even
when the detection of
[Diagram detection](../../spec/docs/common.md#diagram-detection) succeeds.
`error`, a line break, and `%% x` at the end of the text is the `error`
pseudo-diagram, but with an init directive before it, mermaid.js rejects it:
here the `%%` has no line break after it, so the `%%` removal leaves it in
place. This specification does not run this second detection. [fixture:
common/error-trailing-comment-line] [fixture:
common/config-init-detection-rejects]

When a detector matches and the init configuration is a mapping with a `config`
entry, that entry moves to the key named after the detected id, replacing any
entry there. The key is the id itself, except that `flowchart-v2` gives
`flowchart`. With two or more init directives the key filter has already removed
`config`, so nothing moves. [fixture: common/config-key-moves-to-diagram]
[fixture: common/config-key-dropped-with-two-inits]

### Wrap directives

A **wrap directive** is a directive whose name contains `wrap`, compared
exactly. The wrap directives are taken from the start of the prepared text,
except when the init scan stopped at a JSON error: then they are taken only
after the directive where it stopped. When the argument of one of them is not
valid JSON, there is no wrap flag. Otherwise:

- with exactly one wrap directive, the **wrap flag** is true when its name is
  `wrap`, and there is no flag for any other name;
- with two or more, the flag is true when one of the names is `wrap`, and false
  otherwise.

The **directive configuration** is the init configuration, or an empty mapping
when there is no init configuration. When there is a wrap flag, it is set as the
`wrap` entry of the directive configuration when that is a mapping. When the
directive configuration is a string, a number, or true, mermaid.js rejects the
input with a `TypeError`. When it is a list, nothing changes. So mermaid.js
rejects `%%{init: 5}%%` with `%%{wrap}%%`, accepts `%%{init: 5}%%` with only
`%%{nowrap}%%`, and rejects `%%{init: 5}%%` with both `%%{nowrap}%%` and
`%%{wrapper}%%`. [fixture: common/directive-primitive-init-wrap] [fixture:
common/directive-primitive-init-nowrap] [fixture:
common/directive-primitive-init-two-wrap-substrings]

### The text configuration

The **text configuration** is an empty mapping into which
[`cleanAndMerge()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L861-L863)
merges the frontmatter configuration and then the directive configuration, with
the **deep merge** (`merge` of es-toolkit). A source that is not a container
contributes nothing. To merge a source container into a target container, each
entry of the source (for a list, each position) is taken together with the entry
of the target that has the same key:

- When the source entry is a list, the target entry becomes the source entry
  merged into a copy of the target entry if that is a list, and into a new empty
  list otherwise.
- Otherwise, when both entries are containers, the source entry is merged into
  the target entry. A mapping merged into a list leaves the list's elements as
  they are.
- Otherwise, when the target entry is absent or null and the source entry is a
  mapping, the target entry becomes the source entry merged into a new empty
  mapping.
- Otherwise the target entry becomes the source entry, whatever it was before.

So directives win over frontmatter, and a string or number in the directive
configuration replaces a mapping in the frontmatter configuration. A list merged
into the text configuration itself creates the keys `0`, `1`, and so on, which
the key filter removes, so a list as the frontmatter configuration or the
directive configuration contributes nothing. [fixture:
common/config-directive-after-frontmatter] [fixture:
common/config-primitive-replaces-frontmatter-mapping]

The text configuration is then processed in three steps.

**1. The key filter**
([`sanitizeDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils/sanitizeDirective.ts#L38-L98)).
It is applied to the text configuration, and to a list by applying it to each
element. For a mapping, each entry is visited in order:

- The entry is removed when its key starts with `__`, contains `proto`, contains
  `constr`, or is not a configuration key, or when its value is null. A name is
  a **configuration key** when it appears, at any depth, as the key of a value
  that is not a list in the default configuration of the pinned mermaid.js
  ([`configKeys`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/defaultConfig.ts#L346-L356),
  computed from the
  [default configuration](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/defaultConfig.ts#L18-L343),
  which takes its values from
  [`config.schema.yaml`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/schemas/config.schema.yaml)
  and from the variables of the default theme).
- When the value is a container, it is filtered in turn. The keys `nodeColors`,
  `filenameIcons`, and `extensionIcons` are filtered differently: each of their
  entries is removed when its key starts with `__`, contains `proto`, or
  contains `constr`, or when its value is not a string of the allowed form. For
  `nodeColors` the allowed forms are, with ASCII letters compared
  case-insensitively: `#` followed by three to eight hexadecimal digits; `rgb(`
  or `hsl(`, then one or more characters each of which is an ASCII digit,
  whitespace, `%`, `,`, or `.`, then `)`; or one or more ASCII letters. For
  `filenameIcons` and `extensionIcons` the allowed form is one or more
  characters that are word characters or `-`, optionally followed by `:` and one
  or more such characters.
- When the value is not a container and the key contains `themeCSS`,
  `fontFamily`, or `altFontFamily`, compared exactly, the value must be a
  string: for a number or a boolean, mermaid.js rejects the input with a
  `TypeError`. A string whose braces are unbalanced is replaced by the text
  `{ /* ERROR: Unbalanced CSS */ }`. The braces are **unbalanced** when the
  string has a different number of `{` and `}`, or when some beginning of it has
  more `}` than `{`. [fixture: common/config-css-key-not-string]

After its entries, when the mapping has a non-empty `themeVariables`, each
string in `themeVariables` that is empty or contains a character other than an
ASCII letter, an ASCII digit, space, `"`, `#`, `%`, `(`, `)`, `,`, `.`, or `;`
is replaced by the empty string. This covers the entry values of a mapping and
the elements of a list. When `themeVariables` is itself a string and contains
such a character, mermaid.js rejects the input with a `TypeError`. [fixture:
common/config-theme-variables-string-rejected]

**2. The font family**
([`addDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L277-L290)).
When `fontFamily` in the text configuration is not empty and `themeVariables` in
the text configuration has no non-empty `fontFamily`, `themeVariables` becomes a
new mapping with the old entries (for a mapping its entries, for a string its
characters by position, for a list its elements by position, and nothing for
other values) and with `fontFamily` set to the value of `fontFamily` in the text
configuration.

**3. The secure filter**
([`sanitize()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L235-L270)).
It is applied to every container in the text configuration, from the top down.
In each, the keys `secure` and those listed in the `secure` entry of the site
configuration are removed, then the keys that start with `__`, and then every
string value that contains `<`, `>`, or `url(data:`; a string removed from a
list leaves its position empty, and later merges skip it. The
[default `secure` list](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/schemas/config.schema.yaml#L334-L347)
is `secure`, `securityLevel`, `startOnLoad`, `maxTextSize`,
`suppressErrorRendering`, and `maxEdges`; `secure` is in it, so the text cannot
change it. [fixture: common/config-secure-key-ignored]

The result is the text configuration. It is what
[`mermaid.parse()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L96-L117)
returns as `config`.

### The effective configuration

The **site configuration** is the default configuration of the pinned mermaid.js
with the configuration passed to
[`mermaid.initialize()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L702-L740).
Fixtures that need a site configuration record it in the `config` field of
`expected.json`.

The **effective configuration** is a copy of the site configuration into which
the text configuration is merged with the **depth-limited merge**
([`assignWithDepth()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/assignWithDepth.ts#L30-L91)):
first the text configuration is merged into an empty mapping, and then the
result is merged into the copy. To merge a source value into a target value with
a depth, which starts at 2:

- When the source is a list and the target is not, each element of the source is
  merged into the target in order, with the same depth.
- When both are lists, each element of the source that is not already an element
  of the target is appended to the target. A container is never already an
  element.
- Otherwise, when the target is absent or null, or the depth is 0: when both are
  containers, each entry of the source is copied into the target, replacing the
  entry there without merging it; otherwise the source replaces the target.
- Otherwise, when both are containers, each entry of the source is merged into
  the entry of the target with the same key. A source entry that is null is
  skipped. When the source entry is a container, a target entry that is absent
  first becomes a new empty container of the same kind, and a target entry that
  is a container or null becomes the source entry merged into it with the depth
  reduced by 1; a target entry that is a string, number, or boolean stays. When
  the source entry is not a container, it replaces the target entry unless that
  is a container or null.
- Otherwise the target stays.

So a text value changes a default only when both are containers, which are
merged, or when neither is, and then it replaces the default:
`%%{init: {"flowchart": {"inheritDir": {"a": 1}}}}%%` leaves
`flowchart.inheritDir` at its default. [fixture:
common/config-mapping-does-not-replace-default]

The effective configuration also derives the theme and the other appearance
settings. These affect rendering, but deriving them can make mermaid.js reject
the input: it reads colour values from `themeVariables` and rejects the input
when it cannot parse one, as for
`%%{init: {"themeVariables": {"primaryColor": "notacolor"}}}%%`. [fixture:
common/config-theme-colour-rejected]

[`renderDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L477-L680)
applies the text configuration and the title before it parses. `mermaid.parse()`
applies the same configuration but not the title. The fixtures follow
`renderDiagram()`.
