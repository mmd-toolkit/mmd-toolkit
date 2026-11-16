# Format decisions abandoned without a reason, to be fixed

Whoever decided the format of the forms below gave the decision up and printed
them as written, although no rule of
[How the printed form is decided](./docs/printed-form.md) gives that form and no
reason for keeping it is recorded: no run has shown that the other form changes
the Db or the drawing, or is rejected, in a version of mermaid.js that counts,
and the user has not decided them. They are format decisions still to be made,
not rules.

Each form is decided in this way. The other form is run in the versions that
count. Where it changes the Db in a way that no kind of exception allows,
changes the drawing, or is rejected, the reason goes into the rules of the
diagram type, with a row in
[Forms kept for versions of mermaid.js that count](./docs/compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)
where a version that counts needs it. Otherwise the form that reads better is
proposed to the user, as AGENTS.md (item 4) says. A form leaves this list when
it is decided, and this file is deleted when the list is empty.

The list is not complete: the rules of every diagram type are still being
searched for forms kept as written without a reason.

| Diagram                                      | Form printed as written                                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| flowchart, agentflow                         | The whitespace before the colon of `accTitle :%%{init: {}}%% x`                         |
| flowchart, class                             | The whitespace of a `style` or `classDef` with a comment or a directive in it           |
| every diagram type                           | Spaces and tabs at the end of the `---` lines of the frontmatter                        |
| venn                                         | Whitespace before a comma in a color of a style, as in `rgb(1 ,2 ,3)`                   |
| sankey                                       | The case of `sankey-BETA`                                                               |
| xychart                                      | The case of `-BETA` in `xychart-BETA`                                                   |
| agentflow                                    | A connector title such as `[a/b]`, which is not put in quotes                           |
| gantt                                        | No space before an empty item, as in `excludes weekends,,2024-01-01`                    |
| gantt                                        | The case of `Weekends` after `excludes`                                                 |
| diagram types that print numbers in one form | A number with a zero at the start of its integer part, such as `007`                    |
| eventmodeling                                | Which spelling of a frame keyword is printed: `timeframe` or `tf`, `resetframe` or `rf` |
| railroad                                     | A comma of EBNF, kept or left out as written                                            |
| sequence                                     | No space between `participant` and a quoted name, as in `participant"A"`                |
| journey                                      | A score with a leading zero, such as `05`                                               |
