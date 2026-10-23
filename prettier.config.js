export default {
  tabWidth: 2,
  semi: false,
  trailingComma: "all",
  overrides: [
    {
      // Documents are read in editors and diffs, so prose is wrapped. Tables
      // and code blocks are not wrapped.
      files: "*.md",
      options: { proseWrap: "always", printWidth: 80 },
    },
    {
      // Prettier wraps only at whitespace, which Japanese text does not have,
      // and with "always" it joins the lines of Japanese text that are written
      // apart. So the line breaks of the Japanese documents are kept as their
      // authors write them.
      files: ["*.ja.md", "tmp/*.md"],
      options: { proseWrap: "preserve" },
    },
  ],
}
