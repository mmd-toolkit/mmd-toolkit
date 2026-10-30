---
name: write-user-facing-docs
description:
  Write or revise user-facing documentation, including revisions prompted by
  feedback. Keep the page's purpose and product-specific information clear,
  preserve necessary explanations when removing unwanted detail, and check that
  the finished text makes sense without the conversation.
---

# Writing user-facing documentation

Use the repository's [conventions](../conventions/SKILL.md) for document format
and checks. This skill covers the meaning and organization of the explanation.

## Establish what the page should communicate

- Determine the reader's task and the page's purpose from the request, the
  agreed plan, and the existing document. Do not invent a different purpose to
  justify the text you have written.
- Read the whole page before editing. Check related pages when needed to
  establish which page owns an explanation and avoid duplication.
- Distinguish this product's behavior from that of an upstream tool. When
  documenting upstream options, explain which ones affect this product and what
  they affect. Do not make standard defaults or behavior appear to be defined by
  this product. Include upstream details when they are needed for the reader's
  task; do not reproduce a reference just to fill the page.
- Give headings and introductory sentences enough context to identify what a
  list or example explains. A list of names and definitions does not by itself
  explain why those items matter to this product.
- Add a reference link when it helps the reader complete the task. Avoid an
  extra sentence telling the reader to follow a link whose purpose is already
  clear.

## Apply feedback without losing necessary information

- Identify the specific problem the feedback concerns before changing the text.
  A request to remove one kind of detail does not make every explanation of the
  same subject unnecessary.
- When changing the way examples are written or a configuration policy, search
  the guides in the requested scope for all examples serving the same purpose
  before editing. Apply the change in both English and Japanese, then search
  again after editing. If keeping a different form, verify why the example's
  purpose requires it.
- Preserve independently useful explanations and examples. Removing an upstream
  option's default or combined behavior does not by itself justify removing the
  explanation of how this product applies that option.
- Review the affected explanation as a whole, including its heading, surrounding
  paragraphs, examples, and links. Keep changes within the requested scope; this
  review does not authorize rewriting unrelated pages.
- Apply the same meaning changes to the English and Japanese documents. Check
  that both retain the necessary explanations, rather than just matching the
  edited lines.

## Read the finished document as the reader

- Read each changed page in full after editing, without treating the
  conversation or your intended meaning as part of the document. Confirm that
  the text itself answers the reader's task and identifies whose behavior it
  describes.
- Check that a removal has not left a heading without an explanation, an example
  without its setting, or a missing part of the subject the page promises to
  cover. Check nearby explanations for contradiction and duplication.
- Verify behavior claims against the appropriate specification, implementation,
  fixtures, or official documentation. Confirm that examples demonstrate the
  behavior the text says they do.
- Assess the explanation separately from lint, formatting, tests, and build
  results. Successful checks do not establish that a heading is informative, the
  content is useful, or necessary information is present.
- Fix problems within the authorized scope before reporting completion. Do not
  hand this reading back to the user as a series of confirmations when the
  request and existing evidence already establish the intended meaning.
