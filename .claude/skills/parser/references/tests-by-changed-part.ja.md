# 変えた部分ごとのテストのファイル（parser）

| 変えた部分                                                                | テストのファイル                                                                                                                                               |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/diagrams/<図種>/`                                                    | `tests/<図種>.test.ts`、`tests/fixtures.test.ts`                                                                                                               |
| `packages/ast/src/`、`src/visitor-keys*`                                  | `tests/types.test.ts`、`tests/traverse.test.ts`、`tests/ast-<図種>-examples.test.ts`、`tests/union-docs.test.ts`、flowchart では `tests/ast-flowchart.test.ts` |
| `src/unit-grammar.ts`、`src/empty-forms.ts`、`src/diagram-*.ts`           | すべての図種の `tests/<図種>.test.ts`、`tests/diagram-parsing.test.ts`、`tests/fixtures.test.ts`                                                               |
| 共通の規則（`src/source-lexer.ts`、`directives.ts`、`entities.ts` など）  | 同じ名前のテストのファイル、`tests/fixtures.test.ts`                                                                                                           |
| `src/diagrams/flowchart/subgraph-ids.ts`                                  | `tests/fixtures.test.ts`                                                                                                                                       |
| `src/parse.ts`、`src/index.ts`                                            | `tests/parse.test.ts`、`tests/readme-example.test.ts`                                                                                                          |
| `tests/helpers/reference-inputs.ts`、`tests/helpers/known-divergences.ts` | `tests/reference-inputs.test.ts`、`tests/fixtures.test.ts`                                                                                                     |
