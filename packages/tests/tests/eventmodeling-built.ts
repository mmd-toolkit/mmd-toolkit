import type { CheckedNode } from "../src/check-tree/types.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** Explicit authored components only; no parser or lexer supplies the tree. */
export function buildEventmodeling(
  source: string,
  make: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    {
      header: "eventmodeling",
      diagramType: "eventmodeling",
      bodyType: "EventmodelingDiagram",
      bodyFields: (body) => ({ textBeforeHeader: [], body }),
    },
    source,
    make,
  )
}

/** Each test supplies hidden occurrences to their named ownership field. */
type Gaps = Readonly<Record<string, (() => CheckedNode[]) | undefined>>

/** A digit identity and an ASCII name both use the shared Identifier node. */
export function identifier(kit: Kit, name: string): CheckedNode {
  return kit.node("Identifier", kit.token("Identifier", name).range, { name })
}

/** A qualified name has explicit dot/name members, with their two independent gaps. */
export function qualified(
  kit: Kit,
  headName: string,
  tail: readonly { name: string; gaps?: Gaps }[] = [],
): CheckedNode {
  const head = identifier(kit, headName)
  const members = tail.map((part) => {
    const textBeforeDot = part.gaps?.textBeforeDot?.() ?? []
    const dot = kit.token("Punctuator", ".")
    const textBeforeName = part.gaps?.textBeforeName?.() ?? []
    const name = identifier(kit, part.name)
    return kit.node(
      "EventmodelingQualifiedNamePart",
      hull([...textBeforeDot, dot, ...textBeforeName, name]),
      { textBeforeDot, textBeforeName, name },
    )
  })
  return kit.node("EventmodelingQualifiedName", hull([head, ...members]), {
    head,
    tail: members,
  })
}

/** Source references preserve every occurrence and the arrow's independent fields. */
export function sourceReference(
  kit: Kit,
  frameName: string,
  gaps: Gaps = {},
): CheckedNode {
  const textBefore = gaps.textBefore?.() ?? []
  const arrow = kit.node(
    "EventmodelingArrow",
    kit.token("Punctuator", "->>").range,
    { value: "->>", startMarker: "none", line: "solid", endMarker: "arrow" },
  )
  const textBeforeFrame = gaps.textBeforeFrame?.() ?? []
  const frameNode = identifier(kit, frameName)
  return kit.node(
    "EventmodelingSourceReference",
    hull([...textBefore, arrow, ...textBeforeFrame, frameNode]),
    { textBefore, arrow, textBeforeFrame, frame: frameNode },
  )
}

/** A data reference owns its opening, name and closing gaps. */
export function dataReference(
  kit: Kit,
  dataName: string,
  gaps: Gaps = {},
): CheckedNode {
  const textBefore = gaps.textBefore?.() ?? []
  const open = kit.token("Punctuator", "[[")
  const textBeforeName = gaps.textBeforeName?.() ?? []
  const name = identifier(kit, dataName)
  const textBeforeClose = gaps.textBeforeClose?.() ?? []
  const close = kit.token("Punctuator", "]]")
  return kit.node(
    "EventmodelingDataReference",
    hull([
      ...textBefore,
      open,
      ...textBeforeName,
      name,
      ...textBeforeClose,
      close,
    ]),
    { textBefore, textBeforeName, name, textBeforeClose },
  )
}

/** The test supplies the entire body, tag and each gap; the closing LF is outside. */
export function data(
  kit: Kit,
  raw: string,
  block = false,
  dataType: string | null = null,
  gaps: Gaps = {},
): CheckedNode {
  const textBefore = gaps.textBefore?.() ?? []
  const pieces: { range: readonly [number, number] }[] = [...textBefore]
  const textBeforeDataType: CheckedNode[] = []
  const textBeforeTypeClose: CheckedNode[] = []
  const textBeforeValue: CheckedNode[] = []
  if (dataType !== null) {
    pieces.push(kit.token("Punctuator", "`"))
    textBeforeDataType.push(...(gaps.textBeforeDataType?.() ?? []))
    pieces.push(...textBeforeDataType)
    pieces.push(kit.token("Keyword", dataType))
    textBeforeTypeClose.push(...(gaps.textBeforeTypeClose?.() ?? []))
    pieces.push(...textBeforeTypeClose)
    pieces.push(kit.token("Punctuator", "`"))
    textBeforeValue.push(...(gaps.textBeforeValue?.() ?? []))
    pieces.push(...textBeforeValue)
  }
  let value: CheckedNode | null
  if (raw.startsWith('"') || raw.startsWith("'")) {
    value = kit.node("StringLiteral", kit.token("String", raw).range, {
      raw,
      value: raw.slice(1, -1),
      closed: true,
    })
    pieces.push(value)
  } else {
    pieces.push(kit.token("Punctuator", "{"))
    const content = raw.slice(1, -1)
    value =
      content === ""
        ? null
        : kit.node(
            "EventmodelingLiteral",
            kit.token("RawText", content).range,
            { value: content },
          )
    if (value !== null) pieces.push(value)
    pieces.push(kit.token("Punctuator", "}"))
  }
  return kit.node(
    block ? "EventmodelingDataBlock" : "EventmodelingInlineData",
    hull(pieces),
    {
      textBefore,
      dataType,
      textBeforeDataType,
      textBeforeTypeClose,
      textBeforeValue,
      value,
    },
  )
}

/** A frame supplies all optional members independently, including duplicate references. */
export function frame(
  kit: Kit,
  nameText: string,
  modelEntityType: string,
  makeName: () => CheckedNode,
  options: {
    keyword?: string
    gaps?: Gaps
    sources?: readonly (() => CheckedNode)[]
    reference?: () => CheckedNode
    data?: () => CheckedNode
  } = {},
): CheckedNode {
  const word = kit.token("Keyword", options.keyword ?? "tf")
  const textBeforeName = options.gaps?.textBeforeName?.() ?? []
  const name = identifier(kit, nameText)
  const textBeforeModelEntityType =
    options.gaps?.textBeforeModelEntityType?.() ?? []
  const typeWord = kit.token("Keyword", modelEntityType)
  const textBeforeEntityIdentifier =
    options.gaps?.textBeforeEntityIdentifier?.() ?? []
  const entityIdentifier = makeName()
  const sourceFrames = (options.sources ?? []).map((make) => make())
  const reference = options.reference?.() ?? null
  const inline = options.data?.() ?? null
  return kit.node(
    word.value === "rf" || word.value === "resetframe"
      ? "EventmodelingResetFrameStatement"
      : "EventmodelingTimeFrameStatement",
    hull([
      word,
      ...textBeforeName,
      name,
      ...textBeforeModelEntityType,
      typeWord,
      ...textBeforeEntityIdentifier,
      entityIdentifier,
      ...sourceFrames,
      ...(reference === null ? [] : [reference]),
      ...(inline === null ? [] : [inline]),
    ]),
    {
      textBeforeName,
      name,
      textBeforeModelEntityType,
      modelEntityType,
      textBeforeEntityIdentifier,
      entityIdentifier,
      sourceFrames,
      dataReference: reference,
      data: inline,
    },
  )
}

/** Common payloads retain all authored whitespace; there is no textAfter field. */
export function common(
  kit: Kit,
  kind: "Title" | "AccTitle" | "AccDescr" | "AccDescrBlock",
  payload: string | null,
): CheckedNode {
  const word =
    kind === "Title" ? "title" : kind === "AccTitle" ? "accTitle" : "accDescr"
  const pieces: { range: readonly [number, number] }[] = [
    kit.token("Keyword", word),
  ]
  const block = kind === "AccDescrBlock"
  if (kind !== "Title") pieces.push(kit.token("Punctuator", block ? "{" : ":"))
  const value =
    payload === null
      ? null
      : kit.node("EventmodelingLiteral", kit.token("RawText", payload).range, {
          value: payload,
        })
  if (value !== null) pieces.push(value)
  if (block) pieces.push(kit.token("Punctuator", "}"))
  return kit.node(`Eventmodeling${kind}Statement`, hull(pieces), { value })
}

/** Model declarations retain their qualified name even though the Db omits them. */
export function entity(
  kit: Kit,
  makeName: () => CheckedNode,
  before: () => CheckedNode[] = () => [],
): CheckedNode {
  const word = kit.token("Keyword", "entity")
  const textBeforeName = before()
  const name = makeName()
  return kit.node(
    "EventmodelingModelEntityStatement",
    hull([word, ...textBeforeName, name]),
    { textBeforeName, name },
  )
}

/** Data declarations and notes both require explicitly supplied block data. */
export function blockStatement(
  kit: Kit,
  wordText: "data" | "note",
  nameText: string,
  makeData: () => CheckedNode,
  before: () => CheckedNode[] = () => [],
): CheckedNode {
  const word = kit.token("Keyword", wordText)
  const gap = before()
  const name = identifier(kit, nameText)
  const body = makeData()
  return kit.node(
    wordText === "data"
      ? "EventmodelingDataEntityStatement"
      : "EventmodelingNoteStatement",
    hull([word, ...gap, name, body]),
    wordText === "data"
      ? { textBeforeName: gap, name, data: body }
      : { textBeforeSourceFrame: gap, sourceFrame: name, data: body },
  )
}

/** A GWT item records the unassigned type word and its single identifier. */
export function gwtItem(
  kit: Kit,
  modelEntityType: string,
  name: string,
  gaps: Gaps = {},
): CheckedNode {
  const textBefore = gaps.textBefore?.() ?? []
  const word = kit.token("Keyword", modelEntityType)
  const textBeforeEntityIdentifier = gaps.textBeforeEntityIdentifier?.() ?? []
  const entityIdentifier = identifier(kit, name)
  return kit.node(
    "EventmodelingGwtItem",
    hull([
      ...textBefore,
      word,
      ...textBeforeEntityIdentifier,
      entityIdentifier,
    ]),
    {
      textBefore,
      modelEntityType,
      textBeforeEntityIdentifier,
      entityIdentifier,
    },
  )
}

/** Each given/when/then clause owns its leading forms and all authored items. */
export function clause(
  kit: Kit,
  kind: string,
  items: readonly (() => CheckedNode)[],
  before: () => CheckedNode[] = () => [],
): CheckedNode {
  const textBefore = before()
  const word = kit.token("Keyword", kind)
  const body = items.map((make) => make())
  return kit.node(
    "EventmodelingGwtClause",
    hull([...textBefore, word, ...body]),
    { textBefore, kind, body },
  )
}

/** A GWT statement keeps required and optional clause occurrences separately. */
export function gwt(
  kit: Kit,
  name: string,
  given: () => CheckedNode,
  then: () => CheckedNode,
  when: (() => CheckedNode) | null = null,
  before: () => CheckedNode[] = () => [],
): CheckedNode {
  const word = kit.token("Keyword", "gwt")
  const textBeforeSourceFrame = before()
  const sourceFrame = identifier(kit, name)
  const givenNode = given()
  const whenNode = when?.() ?? null
  const thenNode = then()
  return kit.node(
    "EventmodelingGwtStatement",
    hull([
      word,
      ...textBeforeSourceFrame,
      sourceFrame,
      givenNode,
      ...(whenNode === null ? [] : [whenNode]),
      thenNode,
    ]),
    {
      textBeforeSourceFrame,
      sourceFrame,
      given: givenNode,
      when: whenNode,
      then: thenNode,
    },
  )
}

/** ast/eventmodeling.md's fixed example covers all 22 declared node types. */
export function writtenTree(): Built {
  const source =
    "eventmodeling accTitle: Title\ntf 01 evt Shop.Bought ->> 02 ->> 02 [[D]] `json`{x} accDescr: D\nrf 02 cmd Shop.Buy\nentity Shop.Buy\ndata D `text`{\ny\n}\nnote 99 {\n}\ngwt 99 given evt Bought when cmd Buy then ui Screen\n---\nhidden\n---\ntf 03 ui Shop.Screen accDescr {} title All\n"
  return buildEventmodeling(source, (k) => [
    common(k, "AccTitle", " Title"),
    frame(k, "01", "evt", () => qualified(k, "Shop", [{ name: "Bought" }]), {
      sources: [() => sourceReference(k, "02"), () => sourceReference(k, "02")],
      reference: () => dataReference(k, "D"),
      data: () => data(k, "{x}", false, "json"),
    }),
    common(k, "AccDescr", " D"),
    frame(k, "02", "cmd", () => qualified(k, "Shop", [{ name: "Buy" }]), {
      keyword: "rf",
    }),
    entity(k, () => qualified(k, "Shop", [{ name: "Buy" }])),
    blockStatement(k, "data", "D", () => data(k, "{\ny\n}", true, "text")),
    blockStatement(k, "note", "99", () => data(k, "{\n}", true)),
    gwt(
      k,
      "99",
      () => clause(k, "given", [() => gwtItem(k, "evt", "Bought")]),
      () => clause(k, "then", [() => gwtItem(k, "ui", "Screen")]),
      () => clause(k, "when", [() => gwtItem(k, "cmd", "Buy")]),
    ),
    k.node(
      "EventmodelingIgnoredText",
      k.token("RawText", "---\nhidden\n---").range,
      { kind: "yaml-block", value: "---\nhidden\n---" },
    ),
    frame(k, "03", "ui", () => qualified(k, "Shop", [{ name: "Screen" }])),
    common(k, "AccDescrBlock", null),
    common(k, "Title", "All"),
  ])
}
