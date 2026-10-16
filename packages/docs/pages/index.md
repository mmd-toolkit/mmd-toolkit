---
layout: home
title: mmd-toolkit
description: A formatter, linter, and lossless parser for Mermaid diagram text.
hero:
  name: mmd-toolkit
  text: Tools for Mermaid text
  tagline:
    Format diagrams, find mistakes, and build tools on a lossless syntax tree.
  actions:
    - theme: brand
      text: Formatter
      link: /formatter/
    - theme: alt
      text: Linter
      link: /linter/
    - theme: alt
      text: Parser
      link: /parser/
    - theme: alt
      text: Try online
      link: https://mmd-toolkit.github.io/mmd-toolkit/playground/
features:
  - title: Formatter
    details:
      "Format .mmd and .mermaid files and Mermaid code blocks in Markdown with
      prettier-plugin-mmd."
    link: /formatter/
  - title: Linter
    details:
      "Find mistakes that Mermaid accepts silently, using
      @mmd-toolkit/eslint-plugin as an ESLint language plugin."
    link: /linter/
  - title: Parser
    details:
      "Read Mermaid text as an AST with tokens, comments, and source positions
      using @mmd-toolkit/parser."
    link: /parser/
  - title: Support status
    details:
      "Find supported diagram types and compatibility guarantees for the parser,
      formatter, and linter."
    link: /reference/support
---

<div class="home-overview">

## About mmd-toolkit

mmd-toolkit is a third-party project for Mermaid diagram text, not affiliated
with mermaid-js. Here, `mmd` refers to that text and its `.mmd` file extension.

## Try it online

Try the parser and formatter in your browser, with no installation required.
Edit Mermaid text, inspect its AST and tokens, preview Prettier formatting, and
share your input by URL.

[Open the Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/).

</div>
