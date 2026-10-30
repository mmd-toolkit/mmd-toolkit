# Usecase positions

Japanese version: [usecase.ja.md](./usecase.ja.md)

This document supplements [positions.md](../positions.md) for the source nodes
of [ast/usecase.md](../../../spec/docs/ast/usecase.md); token items are defined
in [tokens/usecase.md](../tokens/usecase.md).

## Ranges

Root covers the whole source; UsecaseDiagram starts at its header and ends at
the final statement's final token, or the header when empty, excluding trailing
comments, directives and ignored semicolons. [fixture: usecase/header-lf]
[fixture: usecase/gram-final-statement-eof] [fixture:
usecase/directive-closed-statement-ends] [fixture:
usecase/lex-style-hash-semicolon] [fixture: usecase/comment-bare-eof]

An ActorStatement starts at actor and ends after the final actor's suffix; each
Actor excludes that keyword. EntityStatement and Entity have the same range.
Actor and Entity include their written shape delimiters and all suffixes, while
their id and label remain separate children. [fixture: usecase/gram-actor-list]
[fixture: usecase/db-all-fields] [fixture:
usecase/gram-labeled-source-metadata-declaration] [fixture:
usecase/gram-target-metadata-declaration]

A SystemBoundaryStatement starts at systemBoundary and ends after its closing
end, covering its declaration body; its title excludes surrounding shape
delimiters, and no generated parent or member node receives a range. [fixture:
usecase/gram-boundary-empty-id-reference] [fixture:
usecase/gram-boundary-empty-label] [fixture: usecase/gram-boundary-end-eof]

A RelationshipStatement starts at actor for an actor source, otherwise at its
source name, and ends after its target's last suffix; endpoints retain written
left/right order. An arrow half covers only its written operator, and an
association label lies between the opening and final arrows. [fixture:
usecase/gram-actor-relation] [fixture: usecase/db-arrows] [fixture:
usecase/db-labeled-arrows] [fixture: usecase/db-semantic-case] [fixture:
usecase/gram-split-opening-circle-prefix-hws-control] [fixture:
usecase/gram-split-backward-opening-dash-hws-control]

A Label includes its string/markdown delimiters, when present, but excludes its
shape delimiters; a bare label spans its first through last unit, preserving
interior whitespace and Unicode whitespace content. Quoted padding remains
inside both its range and value. [fixture: usecase/lex-label-unquoted-hws-trim]
[fixture: usecase/lex-label-unicode-whitespace-only] [fixture:
usecase/gram-empty-actor-label] [fixture: usecase/gram-label-quoted-padding]
[fixture: usecase/lex-markdown-crlf]

A stereotype Literal covers the complete interior including padding, excluding
<< and >>. Metadata covers its compound @{ through its closing brace;
MetadataProperty spans key through value, with the colon inside its range.
Quoted native keys/scalars have StringLiteral ranges including their matching
quotes, and raw equals the original range text. [fixture:
usecase/gram-stereotype-trimmed-conflict] [fixture:
usecase/gram-native-trailing-comma-newline] [fixture:
usecase/lex-native-single-quoted-keys] [fixture:
usecase/lex-native-string-backslashes]

A MetadataAssignmentStatement spans target through metadata close, and a
NoteStatement spans note through label end; neither includes its line ending.
[fixture: usecase/db-metadata-forward] [fixture:
usecase/gram-note-adjacent-string-label]

A JsonStatement spans json through its final class suffix; JsonDataBlock spans @
through the matching closing brace, including HWS before the actual opening
brace. Only the outer brace interior supplies its value, without child nodes for
embedded properties or nested objects. [fixture: usecase/gram-json-spaced-at]
[fixture: usecase/db-json-values] [fixture: usecase/db-json-duplicate-order]
[fixture: usecase/div-json-balanced-invalid-array]

ClassDef, Class and Style statements end after their last written class name or
CSS component. A StyleDeclaration starts at its property name and ends after its
final value component; its UsecaseIdentifier excludes padding before the colon
but retains HWS between a dash prefix and word. Its Literal includes leading HWS
after the colon and excludes trailing skipped HWS. [fixture:
usecase/db-all-fields] [fixture: usecase/gram-class-name-trailing-comma]
[fixture: usecase/gram-styles-components] [fixture:
usecase/lex-css-property-padding] [fixture:
usecase/lex-class-property-custom-gap] [fixture:
usecase/lex-css-name-custom-tab]

DirectionStatement covers direction through its value. Accessibility line
statements end after their colon when empty, otherwise at the physical value
end, including trailing padding; block statements end after their first closing
brace. Exactly empty content has no Literal range, while whitespace-only content
has its full written range. [fixture: usecase/db-direction-all] [fixture:
usecase/db-acctitle-empty] [fixture: usecase/db-accdescr-empty-gap] [fixture:
usecase/gram-a11y-line-raw-padding] [fixture:
usecase/gram-a11y-block-raw-padding] [fixture:
usecase/gram-a11y-whitespace-block]

A directive, comment region or selected semicolon inside text stays within the
containing node's range but outside its value and tokens; raw on a StringLiteral
still contains all original source characters. Positions count UTF-16 code units
and preserve CR/CRLF source widths, while U+2028/U+2029 do not advance the line
number. [fixture: usecase/directive-in-label] [fixture:
usecase/lex-native-single-quote-comment-region-ls] [fixture:
usecase/lex-style-hash-semicolon] [fixture: usecase/lex-supplementary-label]
[fixture: usecase/lex-markdown-crlf] [fixture: usecase/lex-label-u2028]
[fixture: usecase/lex-label-u2029]
