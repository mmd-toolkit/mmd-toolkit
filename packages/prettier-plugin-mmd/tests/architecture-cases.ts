/** Fixed escaped cases distinguish physical line endings from value content. */
import type { Options } from "prettier"

interface ArchitectureCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
}

export const architectureCases: readonly ArchitectureCase[] = [
  {
    name: "architecture/description-blocks/unicode-empty",
    input: "architecture-beta\naccDescr{ \t\n\u2028\u00a0}\n",
    output: "architecture-beta\n  accDescr{}\n",
    options: {},
  },
  {
    name: "architecture/description-blocks/unicode-opener",
    input: "architecture-beta\naccDescr\n\n\u2028{ Detail }\n",
    output: "architecture-beta\n  accDescr { Detail }\n",
    options: {},
  },
  {
    name: "architecture/comments/ls-ps-content",
    input:
      "architecture-beta\n%%! X\u2028service swallowed\u2029Y\nservice visible\n",
    output:
      "architecture-beta\n  %%! X\u2028service swallowed\u2029Y\n  service visible\n",
    options: {},
  },
  {
    name: "architecture/semicolons/unicode-segment",
    input: "architecture-beta\nservice segment [style:#x\u2028A;B]\n",
    output: "architecture-beta\n  service segment[style:#x\u2028A;B]\n",
    options: {},
  },
  {
    name: "architecture/line-terminators-and-unicode/cr-structure",
    input: "architecture-beta\rservice cr_node\r",
    output: "architecture-beta\n  service cr_node\n",
    options: {},
  },
  {
    name: "architecture/line-terminators-and-unicode/crlf-values-hidden",
    input:
      'architecture-beta\r\nservice crlf_node "A\r\nB" ["C\r\nD"]%%{}%%\r\n\r\nservice following\r\n',
    output:
      'architecture-beta\n  service crlf_node "A\nB" ["C\nD"]%%{}%%\n\n  service following\n',
    options: {},
  },
  {
    name: "architecture/line-terminators-and-unicode/cr-yaml-block",
    input:
      "---\ntitle: Physical\n---\rarchitecture-beta\raccDescr {\r First\r Second\r}\rservice cr_hidden---\rx\r--- \r",
    output:
      "---\ntitle: Physical\n---\narchitecture-beta\n  accDescr {\n First\n Second\n  }\n  service cr_hidden---\nx\n--- \n",
    options: {},
  },
  {
    name: "architecture/line-terminators-and-unicode/output-crlf",
    input: "architecture-beta\nservice output_crlf\n",
    output: "architecture-beta\r\n  service output_crlf\r\n",
    options: { endOfLine: "crlf" },
  },
  {
    name: "architecture/line-terminators-and-unicode/output-cr",
    input: "architecture-beta\nservice output_cr\n",
    output: "architecture-beta\r  service output_cr\r",
    options: { endOfLine: "cr" },
  },
  {
    name: "architecture/line-terminators-and-unicode/value-content",
    input:
      'architecture-beta\nservice unicode "A\u2028B\u2029C\u00a0D\ufeffE" [F\u2028G\u2029H]\n',
    output:
      'architecture-beta\n  service unicode "A\u2028B\u2029C\u00a0D\ufeffE" [F\u2028G\u2029H]\n',
    options: {},
  },
  {
    name: "architecture/line-terminators-and-unicode/common-edge-trim",
    input:
      "architecture-beta\ntitle \u2028\u00a0Topic\ufeff\naccTitle: \u2029Access\u3000\naccDescr: \u00a0Detail\u2028\n",
    output:
      "architecture-beta\n  title Topic\n  accTitle: Access\n  accDescr: Detail\n",
    options: {},
  },
  {
    name: "architecture/line-terminators-and-unicode/bom-header",
    input: "\ufeffarchitecture-beta\nservice bom_node\n",
    output: "\ufeffarchitecture-beta\n  service bom_node\n",
    options: {},
  },
  {
    name: "architecture/specified-readings/bare-unicode",
    input: "%%\n\u2028architecture-beta\nservice bare_node\n",
    output: "%%\narchitecture-beta\n  service bare_node\n",
    options: {},
  },
  {
    name: "architecture/line-terminators-and-unicode/hidden-content",
    input:
      "architecture-beta\n---\nA\u2028B\u2029C\n---\nservice hidden_unicode%%{!A\u2028B\u2029C}%% \nservice next_unicode\n",
    output:
      "architecture-beta\n  ---\nA\u2028B\u2029C\n---\n  service hidden_unicode%%{!A\u2028B\u2029C}%% \n  service next_unicode\n",
    options: {},
  },
  {
    name: "architecture/line-terminators-and-unicode/description-content",
    input: "architecture-beta\naccDescr{\u00a0A\u2028B\u2029C\ufeff}\n",
    output: "architecture-beta\n  accDescr{ A\u2028B\u2029C }\n",
    options: {},
  },
  {
    name: "architecture/line-terminators-and-unicode/frontmatter-crlf",
    input:
      "---\r\ntitle:   Physical architecture\r\n---\r\narchitecture-beta\r\nservice frontmatter_crlf\r\n",
    output:
      "---\ntitle: Physical architecture\n---\narchitecture-beta\n  service frontmatter_crlf\n",
    options: {},
  },
  {
    name: "architecture/line-terminators-and-unicode/frontmatter-bom",
    input:
      "\ufeff---\ntitle:   Host BOM\n---\narchitecture-beta\nservice frontmatter_bom\n",
    output:
      "\ufeff---\ntitle: Host BOM\n---\narchitecture-beta\n  service frontmatter_bom\n",
    options: {},
  },
]
