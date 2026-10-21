import type { FieldSpec } from "./field-spec.ts"

/**
 * The fields of each node type and record of the tree, as the tables of the
 * tree documents of the specification describe them: ast.md, `ast/<diagram>.md`,
 * and parser/docs/tokens.md (`Token`, `Comment`, the lists of `Root`, and the
 * frontmatter tokens). The specification defines the form of a tree; this
 * table is its copy for the check of a tree, and
 * `tests/check-tree-node-fields.test.ts` requires it to agree with the tables.
 * The fields that are nodes are in the order of the child fields that the
 * document states for the type (the order of the visit), which the test
 * requires as well. The fields `type`, `range`, and `loc`, which every node and
 * record has, are not listed. A type that its document describes with no field table has none
 * (`ErrorDiagram`, `FlowchartEmptyStatement`, `GanttInclusiveEndDatesStatement`,
 * `StateDividerStatement`, `StateHideEmptyDescriptionStatement`,
 * `StateTerminal`).
 */
export const NODE_FIELDS: Readonly<
  Record<string, Readonly<Record<string, FieldSpec>>>
> = {
  VennDiagram: { body: { shape: "nodeList" } },
  VennSubsetStatement: {
    kind: { shape: "value", valueType: "string" },
    sets: { shape: "nodeList" },
    label: { shape: "nodeOrNull" },
    size: { shape: "nodeOrNull" },
  },
  VennTextStatement: {
    targets: { shape: "nodeListOrNull" },
    id: { shape: "node" },
    label: { shape: "nodeOrNull" },
  },
  VennStyleStatement: {
    targets: { shape: "nodeList" },
    properties: { shape: "nodeList" },
  },
  VennStyleProperty: { key: { shape: "node" }, value: { shape: "node" } },
  VennTitleStatement: { value: { shape: "node" } },
  VennLabel: {
    kind: { shape: "value", valueType: "string" },
    value: { shape: "value", valueType: "string" },
  },
  VennLiteral: { value: { shape: "value", valueType: "string" } },
  VennIgnoredText: { value: { shape: "value", valueType: "string" } },
  C4Diagram: {
    kind: { shape: "value", valueType: "string" },
    beforeBody: { shape: "nodeList" },
    body: { shape: "nodeList" },
  },
  C4ElementStatement: {
    keyword: { shape: "value", valueType: "string" },
    arguments: { shape: "nodeListWithNull" },
  },
  C4BoundaryStatement: {
    keyword: { shape: "value", valueType: "string" },
    arguments: { shape: "nodeListWithNull" },
    beforeBody: { shape: "nodeList" },
    body: { shape: "nodeList" },
  },
  C4RelationshipStatement: {
    keyword: { shape: "value", valueType: "string" },
    arguments: { shape: "nodeListWithNull" },
  },
  C4UpdateStatement: {
    keyword: { shape: "value", valueType: "string" },
    arguments: { shape: "nodeListWithNull" },
  },
  C4NamedAttribute: { key: { shape: "nodeOrNull" }, value: { shape: "node" } },
  C4TitleStatement: { value: { shape: "node" } },
  C4AccDescriptionStatement: { value: { shape: "node" } },
  C4AccTitleStatement: { value: { shape: "nodeOrNull" } },
  C4AccDescrStatement: { value: { shape: "nodeOrNull" } },
  C4AccDescrBlockStatement: { value: { shape: "nodeOrNull" } },
  C4Literal: { value: { shape: "value", valueType: "string" } },
  BlockDiagram: { body: { shape: "nodeList" } },
  BlockNodeStatement: {
    node: { shape: "node" },
    width: { shape: "nodeOrNull" },
    links: { shape: "nodeList" },
  },
  BlockNode: { id: { shape: "node" }, shape: { shape: "nodeOrNull" } },
  BlockShape: {
    open: { shape: "value", valueType: "string" },
    close: { shape: "value", valueType: "string" },
    label: { shape: "node" },
  },
  BlockArrowShape: {
    label: { shape: "node" },
    directions: { shape: "nodeList" },
  },
  BlockLink: {
    opening: { shape: "nodeOrNull" },
    label: { shape: "nodeOrNull" },
    arrow: { shape: "node" },
    target: { shape: "node" },
  },
  BlockArrow: {
    value: { shape: "value", valueType: "string" },
    startMarker: { shape: "value", valueType: "string" },
    line: { shape: "value", valueType: "string" },
    length: { shape: "value", valueType: "number" },
    endMarker: { shape: "value", valueType: "string" },
  },
  BlockOpeningArrow: {
    value: { shape: "value", valueType: "string" },
    startMarker: { shape: "value", valueType: "string" },
    line: { shape: "value", valueType: "string" },
  },
  BlockSpaceStatement: { width: { shape: "nodeOrNull" } },
  BlockColumnsStatement: { count: { shape: "nodeOrNull" } },
  BlockCompositeStatement: {
    head: { shape: "nodeOrNull" },
    body: { shape: "nodeList" },
  },
  BlockClassDefStatement: {
    name: { shape: "node" },
    styles: { shape: "nodeListWithNull" },
  },
  BlockClassStatement: {
    ids: { shape: "nodeList" },
    cssClass: { shape: "nodeOrNull" },
  },
  BlockStyleStatement: {
    id: { shape: "node" },
    styles: { shape: "nodeListWithNull" },
  },
  BlockAccDescrBlockStatement: {},
  BlockLiteral: { value: { shape: "value", valueType: "string" } },
  ClassAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
  },
  ClassAccDescrStatement: {
    value: { shape: "node" },
  },
  ClassAccTitleStatement: {
    value: { shape: "node" },
  },
  ClassAnnotation: {
    name: { shape: "nodeOrNull" },
  },
  ClassAnnotationStatement: {
    annotation: { shape: "node" },
    class: { shape: "node" },
  },
  ClassArrow: {
    value: { shape: "value", valueType: "string" },
    startMarker: { shape: "value", valueType: "string" },
    line: { shape: "value", valueType: "string" },
    endMarker: { shape: "value", valueType: "string" },
  },
  ClassAttribute: {
    visibility: { shape: "value", valueType: "string" },
    name: { shape: "nodeOrNull" },
    classifier: { shape: "value", valueType: "string" },
  },
  ClassCallbackStatement: {
    class: { shape: "node" },
    callback: { shape: "node" },
    arguments: { shape: "nodeOrNull" },
    tooltip: { shape: "nodeOrNull" },
  },
  ClassClassDefStatement: {
    cssClasses: { shape: "nodeList" },
    styles: { shape: "nodeList" },
  },
  ClassCssClassStatement: {
    idList: { shape: "node" },
    cssClass: { shape: "node" },
  },
  ClassDeclaration: {
    name: { shape: "node" },
    label: { shape: "nodeOrNull" },
    cssClass: { shape: "nodeOrNull" },
    annotation: { shape: "nodeOrNull" },
    members: { shape: "nodeListOrNull" },
  },
  ClassDiagram: {
    body: { shape: "nodeList" },
  },
  ClassDirectionStatement: {
    textBefore: { shape: "nodeOrNull" },
    direction: { shape: "value", valueType: "string" },
    textAfter: { shape: "nodeOrNull" },
  },
  ClassIgnoredText: {
    value: { shape: "value", valueType: "string" },
  },
  ClassLinkStatement: {
    class: { shape: "node" },
    url: { shape: "node" },
    tooltip: { shape: "nodeOrNull" },
    target: { shape: "value", valueType: "stringOrNull" },
  },
  ClassLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  ClassMemberStatement: {
    class: { shape: "node" },
    member: { shape: "nodeOrNull" },
  },
  ClassIdentifier: {
    name: { shape: "value", valueType: "string" },
  },
  ClassMethod: {
    visibility: { shape: "value", valueType: "string" },
    textBefore: { shape: "nodeOrNull" },
    name: { shape: "nodeOrNull" },
    parameters: { shape: "nodeOrNull" },
    returnType: { shape: "nodeOrNull" },
    classifier: { shape: "value", valueType: "string" },
    textAfter: { shape: "nodeOrNull" },
  },
  ClassName: {
    prefix: { shape: "nodeOrNull" },
    name: { shape: "node" },
    generic: { shape: "nodeOrNull" },
  },
  ClassNamespaceStatement: {
    prefix: { shape: "nodeOrNull" },
    name: { shape: "node" },
    label: { shape: "nodeOrNull" },
    body: { shape: "nodeList" },
  },
  ClassNameStatement: {
    name: { shape: "node" },
  },
  ClassNoteStatement: {
    class: { shape: "nodeOrNull" },
    text: { shape: "node" },
  },
  ClassRelationStatement: {
    from: { shape: "node" },
    fromCardinality: { shape: "nodeOrNull" },
    arrow: { shape: "node" },
    toCardinality: { shape: "nodeOrNull" },
    to: { shape: "node" },
    label: { shape: "nodeOrNull" },
  },
  ClassStyleStatement: {
    id: { shape: "node" },
    styles: { shape: "nodeList" },
  },
  ErAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
  },
  ErAccDescrStatement: {
    value: { shape: "node" },
  },
  ErAccTitleStatement: {
    value: { shape: "node" },
  },
  ErAttribute: {
    dataType: { shape: "node" },
    optional: { shape: "value", valueType: "boolean" },
    name: { shape: "node" },
    keys: { shape: "nodeList" },
    comment: { shape: "nodeOrNull" },
  },
  ErClassDefStatement: {
    cssClasses: { shape: "nodeList" },
    styles: { shape: "nodeList" },
  },
  ErClassStatement: {
    entities: { shape: "nodeList" },
    cssClasses: { shape: "nodeList" },
  },
  ErDiagram: {
    body: { shape: "nodeList" },
  },
  ErDirectionStatement: {
    textBefore: { shape: "nodeOrNull" },
    direction: { shape: "value", valueType: "string" },
    textAfter: { shape: "nodeOrNull" },
  },
  ErEntityReference: {
    name: { shape: "node" },
    cssClasses: { shape: "nodeList" },
  },
  ErEntityStatement: {
    name: { shape: "node" },
    alias: { shape: "nodeOrNull" },
    cssClasses: { shape: "nodeList" },
    attributes: { shape: "nodeListOrNull" },
  },
  ErIdentifier: {
    name: { shape: "value", valueType: "string" },
  },
  ErIgnoredText: {
    value: { shape: "value", valueType: "string" },
  },
  ErLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  ErRelationship: {
    leftCardinality: { shape: "value", valueType: "string" },
    line: { shape: "value", valueType: "string" },
    rightCardinality: { shape: "value", valueType: "string" },
  },
  ErRelationshipStatement: {
    left: { shape: "node" },
    relationship: { shape: "node" },
    right: { shape: "node" },
    role: { shape: "node" },
  },
  ErStyleStatement: {
    entities: { shape: "nodeList" },
    styles: { shape: "nodeList" },
  },
  ErSubgraphStatement: {
    id: { shape: "node" },
    title: { shape: "nodeListOrNull" },
    body: { shape: "nodeList" },
  },
  ErrorDiagram: {},
  FlowchartEmptyStatement: {},
  StateDividerStatement: {},
  StateHideEmptyDescriptionStatement: {},
  StateTerminal: {},
  Comment: {
    mark: { shape: "value", valueType: "stringOrNull" },
    value: { shape: "value", valueType: "string" },
  },
  Directive: {
    name: { shape: "value", valueType: "string" },
    value: { shape: "value", valueType: "string" },
    closed: { shape: "value", valueType: "boolean" },
  },
  FlowchartAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
    closed: { shape: "value", valueType: "boolean" },
  },
  FlowchartAccDescrStatement: {
    value: { shape: "nodeOrNull" },
  },
  FlowchartAccTitleStatement: {
    value: { shape: "nodeOrNull" },
  },
  FlowchartArrow: {
    value: { shape: "value", valueType: "string" },
    startMarker: { shape: "value", valueType: "string" },
    line: { shape: "value", valueType: "string" },
    length: { shape: "value", valueType: "number" },
    endMarker: { shape: "value", valueType: "string" },
  },
  FlowchartClassDefStatement: {
    cssClasses: { shape: "nodeListWithNull" },
    styles: { shape: "nodeListWithNull" },
  },
  FlowchartClassStatement: {
    ids: { shape: "nodeListWithNull" },
    cssClass: { shape: "node" },
  },
  FlowchartClickCallbackStatement: {
    ids: { shape: "nodeListWithNull" },
    callback: { shape: "node" },
    arguments: { shape: "nodeOrNull" },
    tooltip: { shape: "nodeOrNull" },
  },
  FlowchartClickUrlStatement: {
    ids: { shape: "nodeListWithNull" },
    url: { shape: "node" },
    tooltip: { shape: "nodeOrNull" },
    target: { shape: "value", valueType: "stringOrNull" },
  },
  FlowchartDataBlock: {
    value: { shape: "value", valueType: "string" },
  },
  FlowchartDefaultLinkStyleStatement: {
    interpolate: { shape: "nodeOrNull" },
    styles: { shape: "nodeListWithNull" },
  },
  FlowchartDiagram: {
    direction: { shape: "value", valueType: "stringOrNull" },
    body: { shape: "nodeList" },
  },
  FlowchartDirectionStatement: {
    textBefore: { shape: "nodeOrNull" },
    direction: { shape: "value", valueType: "string" },
    textAfter: { shape: "nodeOrNull" },
  },
  FlowchartIgnoredText: {
    value: { shape: "value", valueType: "string" },
  },
  FlowchartLabel: {
    kind: { shape: "value", valueType: "string" },
    value: { shape: "value", valueType: "string" },
  },
  FlowchartLink: {
    id: { shape: "nodeOrNull" },
    opening: { shape: "nodeOrNull" },
    arrow: { shape: "node" },
    label: { shape: "nodeOrNull" },
    target: { shape: "node" },
  },
  FlowchartLinkStyleStatement: {
    indices: { shape: "nodeList" },
    interpolate: { shape: "nodeOrNull" },
    styles: { shape: "nodeListWithNull" },
  },
  FlowchartLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  FlowchartOpeningArrow: {
    value: { shape: "value", valueType: "string" },
    startMarker: { shape: "value", valueType: "string" },
    line: { shape: "value", valueType: "string" },
  },
  FlowchartShape: {
    name: { shape: "value", valueType: "string" },
    property: { shape: "nodeOrNull" },
    label: { shape: "node" },
  },
  FlowchartShapeProperty: {
    name: { shape: "node" },
    value: { shape: "node" },
  },
  FlowchartStyleStatement: {
    id: { shape: "node" },
    styles: { shape: "nodeListWithNull" },
  },
  FlowchartSubgraphStatement: {
    name: { shape: "node" },
    title: { shape: "nodeOrNull" },
    body: { shape: "nodeList" },
  },
  FlowchartVertex: {
    id: { shape: "node" },
    shape: { shape: "nodeOrNull" },
    cssClass: { shape: "nodeOrNull" },
    data: { shape: "nodeList" },
  },
  FlowchartVertexGroup: {
    vertices: { shape: "nodeList" },
  },
  FlowchartVertexStatement: {
    first: { shape: "node" },
    links: { shape: "nodeList" },
  },
  Frontmatter: {
    value: { shape: "value", valueType: "string" },
    valueRange: { shape: "value", valueType: "range" },
  },
  GanttAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
  },
  GanttAccDescrStatement: {
    value: { shape: "node" },
  },
  GanttAccTitleStatement: {
    value: { shape: "node" },
  },
  GanttAxisFormatStatement: {
    value: { shape: "node" },
  },
  GanttCallback: {
    name: { shape: "node" },
    args: { shape: "nodeOrNull" },
  },
  GanttClickStatement: {
    ids: { shape: "nodeListWithNull" },
    call: { shape: "nodeOrNull" },
    href: { shape: "nodeOrNull" },
  },
  GanttDateFormatStatement: {
    value: { shape: "node" },
  },
  GanttDiagram: {
    body: { shape: "nodeList" },
  },
  GanttExcludesStatement: {
    items: { shape: "nodeList" },
  },
  GanttIncludesStatement: {
    items: { shape: "nodeList" },
  },
  GanttInclusiveEndDatesStatement: {},
  GanttLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  GanttSectionStatement: {
    name: { shape: "node" },
  },
  GanttTaskStatement: {
    description: { shape: "node" },
    tags: { shape: "nodeList" },
    items: { shape: "nodeListWithNull" },
  },
  GanttTickIntervalStatement: {
    value: { shape: "node" },
  },
  GanttTitleStatement: {
    value: { shape: "node" },
  },
  GanttTodayMarkerStatement: {
    value: { shape: "node" },
  },
  GanttWeekdayStatement: {
    day: { shape: "value", valueType: "string" },
  },
  GanttWeekendStatement: {
    day: { shape: "value", valueType: "string" },
  },
  Identifier: {
    name: { shape: "value", valueType: "string" },
  },
  JourneyAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
  },
  JourneyAccDescrStatement: {
    value: { shape: "node" },
  },
  JourneyAccTitleStatement: {
    value: { shape: "node" },
  },
  JourneyDiagram: {
    body: { shape: "nodeList" },
  },
  JourneyIgnoredText: {
    value: { shape: "value", valueType: "string" },
  },
  JourneyLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  JourneySectionStatement: {
    name: { shape: "node" },
  },
  JourneyTaskStatement: {
    description: { shape: "node" },
    score: { shape: "nodeOrNull" },
    people: { shape: "nodeListWithNull" },
    textAfter: { shape: "nodeOrNull" },
  },
  JourneyTitleStatement: {
    value: { shape: "node" },
  },
  KanbanDiagram: { body: { shape: "nodeList" } },
  KanbanNode: {
    indent: { shape: "value", valueType: "number" },
    id: { shape: "nodeOrNull" },
    shape: { shape: "nodeOrNull" },
    data: { shape: "nodeList" },
    decorations: { shape: "nodeList" },
  },
  KanbanShape: {
    opener: { shape: "value", valueType: "string" },
    closer: { shape: "value", valueType: "string" },
    label: { shape: "node" },
  },
  KanbanLabel: {
    kind: { shape: "value", valueType: "string" },
    value: { shape: "value", valueType: "string" },
  },
  KanbanIconStatement: { icon: { shape: "node" } },
  KanbanClassStatement: { cssClass: { shape: "node" } },
  KanbanDataBlock: { value: { shape: "value", valueType: "string" } },
  KanbanLiteral: { value: { shape: "value", valueType: "string" } },
  MindmapClassStatement: {
    cssClass: { shape: "node" },
  },
  MindmapDiagram: {
    root: { shape: "nodeOrNull" },
  },
  MindmapIconStatement: {
    icon: { shape: "node" },
  },
  MindmapLabel: {
    kind: { shape: "value", valueType: "string" },
    value: { shape: "value", valueType: "string" },
  },
  MindmapLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  MindmapNode: {
    indent: { shape: "value", valueType: "number" },
    id: { shape: "nodeOrNull" },
    shape: { shape: "nodeOrNull" },
    decorations: { shape: "nodeList" },
    children: { shape: "nodeList" },
  },
  MindmapShape: {
    opener: { shape: "value", valueType: "string" },
    closer: { shape: "value", valueType: "string" },
    label: { shape: "node" },
  },
  NumericLiteral: {
    value: { shape: "value", valueType: "number" },
    raw: { shape: "value", valueType: "string" },
  },
  RequirementAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
  },
  RequirementAccDescrStatement: {
    value: { shape: "node" },
  },
  RequirementAccTitleStatement: {
    value: { shape: "node" },
  },
  RequirementClassDefStatement: {
    cssClasses: { shape: "nodeList" },
    styles: { shape: "nodeList" },
  },
  RequirementClassShorthandStatement: {
    name: { shape: "node" },
    cssClasses: { shape: "nodeList" },
  },
  RequirementClassStatement: {
    names: { shape: "nodeList" },
    cssClasses: { shape: "nodeList" },
  },
  RequirementDiagram: {
    body: { shape: "nodeList" },
  },
  RequirementDirectionStatement: {
    textBefore: { shape: "nodeOrNull" },
    direction: { shape: "value", valueType: "string" },
    textAfter: { shape: "nodeOrNull" },
  },
  RequirementElementField: {
    field: { shape: "value", valueType: "string" },
    value: { shape: "node" },
  },
  RequirementElementStatement: {
    name: { shape: "node" },
    cssClasses: { shape: "nodeList" },
    body: { shape: "nodeList" },
  },
  RequirementValueField: {
    field: { shape: "value", valueType: "string" },
    value: { shape: "node" },
  },
  RequirementIdentifier: {
    name: { shape: "value", valueType: "string" },
  },
  RequirementIgnoredText: {
    value: { shape: "value", valueType: "string" },
  },
  RequirementLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  RequirementRelationshipStatement: {
    left: { shape: "node" },
    relationship: { shape: "value", valueType: "string" },
    arrow: { shape: "value", valueType: "string" },
    right: { shape: "node" },
  },
  RequirementRequirementStatement: {
    requirementType: { shape: "value", valueType: "string" },
    name: { shape: "node" },
    cssClasses: { shape: "nodeList" },
    body: { shape: "nodeList" },
  },
  RequirementRiskField: {
    risk: { shape: "value", valueType: "string" },
  },
  RequirementStyleStatement: {
    names: { shape: "nodeList" },
    styles: { shape: "nodeList" },
  },
  RequirementVerifyMethodField: {
    verifyMethod: { shape: "value", valueType: "string" },
  },
  Root: {
    diagramType: { shape: "value", valueType: "string" },
    body: { shape: "node" },
    frontmatter: { shape: "nodeOrNull", record: "Frontmatter" },
    directives: { shape: "nodeList", record: "Directive" },
    comments: { shape: "nodeList", record: "Comment" },
    tokens: { shape: "nodeList", record: "Token" },
  },
  SankeyDiagram: {
    body: { shape: "nodeList" },
  },
  SankeyIdentifier: {
    name: { shape: "value", valueType: "string" },
  },
  SankeyLinkStatement: {
    source: { shape: "node" },
    target: { shape: "node" },
    value: { shape: "node" },
  },
  SankeyLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  SequenceAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
    closed: { shape: "value", valueType: "boolean" },
  },
  SequenceAccDescrStatement: {
    value: { shape: "nodeOrNull" },
  },
  SequenceAccTitleStatement: {
    value: { shape: "nodeOrNull" },
  },
  SequenceActivateStatement: {
    id: { shape: "node" },
  },
  SequenceAltStatement: {
    sections: { shape: "nodeList" },
  },
  SequenceArrow: {
    value: { shape: "value", valueType: "string" },
    startMarker: { shape: "value", valueType: "string" },
    line: { shape: "value", valueType: "string" },
    endMarker: { shape: "value", valueType: "string" },
  },
  SequenceAutonumberStatement: {
    start: { shape: "nodeOrNull" },
    step: { shape: "nodeOrNull" },
    off: { shape: "value", valueType: "boolean" },
  },
  SequenceBoxStatement: {
    text: { shape: "nodeOrNull" },
    body: { shape: "nodeList" },
  },
  SequenceBoxText: {
    value: { shape: "value", valueType: "string" },
    colorCandidate: { shape: "nodeOrNull" },
    remainder: { shape: "nodeOrNull" },
  },
  SequenceBreakStatement: {
    text: { shape: "nodeOrNull" },
    body: { shape: "nodeList" },
  },
  SequenceCriticalStatement: {
    sections: { shape: "nodeList" },
  },
  SequenceDataBlock: {
    value: { shape: "value", valueType: "string" },
  },
  SequenceDeactivateStatement: {
    id: { shape: "node" },
  },
  SequenceDestroyStatement: {
    created: { shape: "value", valueType: "boolean" },
    id: { shape: "node" },
  },
  SequenceDetailsStatement: {
    id: { shape: "node" },
    text: { shape: "nodeOrNull" },
  },
  SequenceDiagram: {
    body: { shape: "nodeList" },
  },
  SequenceIdentifier: {
    name: { shape: "value", valueType: "string" },
  },
  SequenceIgnoredStatement: {
    value: { shape: "value", valueType: "string" },
  },
  SequenceLinksStatement: {
    id: { shape: "node" },
    text: { shape: "nodeOrNull" },
  },
  SequenceLinkStatement: {
    id: { shape: "node" },
    text: { shape: "nodeOrNull" },
  },
  SequenceLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  SequenceLoopStatement: {
    text: { shape: "nodeOrNull" },
    body: { shape: "nodeList" },
  },
  SequenceMessageStatement: {
    from: { shape: "node" },
    fromCentralConnection: { shape: "value", valueType: "boolean" },
    arrow: { shape: "node" },
    activation: { shape: "value", valueType: "stringOrNull" },
    toCentralConnection: { shape: "value", valueType: "boolean" },
    to: { shape: "node" },
    text: { shape: "nodeOrNull" },
  },
  SequenceNoteStatement: {
    placement: { shape: "value", valueType: "string" },
    ids: { shape: "nodeList" },
    text: { shape: "nodeOrNull" },
  },
  SequenceOptStatement: {
    text: { shape: "nodeOrNull" },
    body: { shape: "nodeList" },
  },
  SequenceParOverStatement: {
    sections: { shape: "nodeList" },
  },
  SequenceParStatement: {
    sections: { shape: "nodeList" },
  },
  SequenceParticipantStatement: {
    kind: { shape: "value", valueType: "string" },
    created: { shape: "value", valueType: "boolean" },
    id: { shape: "node" },
    data: { shape: "nodeOrNull" },
    alias: { shape: "nodeOrNull" },
  },
  SequencePropertiesStatement: {
    id: { shape: "node" },
    text: { shape: "nodeOrNull" },
  },
  SequenceRectStatement: {
    color: { shape: "nodeOrNull" },
    body: { shape: "nodeList" },
  },
  SequenceSection: {
    text: { shape: "nodeOrNull" },
    body: { shape: "nodeList" },
  },
  SequenceText: {
    wrap: { shape: "value", valueType: "stringOrNull" },
    value: { shape: "nodeOrNull" },
  },
  SequenceTitleStatement: {
    value: { shape: "node" },
  },
  StateAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
    closed: { shape: "value", valueType: "boolean" },
  },
  StateAccDescrStatement: {
    value: { shape: "nodeOrNull" },
  },
  StateAccTitleStatement: {
    value: { shape: "nodeOrNull" },
  },
  StateAliasDefinitionStatement: {
    textBeforeDescription: { shape: "nodeOrNull" },
    description: { shape: "node" },
    textAfterDescription: { shape: "nodeOrNull" },
    id: { shape: "nodeOrNull" },
    secondDescription: { shape: "nodeOrNull" },
    textAfter: { shape: "nodeOrNull" },
    textBeforeBody: { shape: "nodeOrNull" },
    body: { shape: "nodeListOrNull" },
  },
  StateClassDefStatement: {
    cssClass: { shape: "node" },
    styles: { shape: "nodeListWithNull" },
  },
  StateClassStatement: {
    states: { shape: "nodeList" },
    cssClass: { shape: "nodeOrNull" },
  },
  StateClickStatement: {
    reference: { shape: "node" },
    url: { shape: "node" },
    tooltip: { shape: "nodeOrNull" },
  },
  StateCompositeStatement: {
    textBeforeId: { shape: "nodeOrNull" },
    id: { shape: "nodeOrNull" },
    textBeforeBody: { shape: "nodeOrNull" },
    body: { shape: "nodeListOrNull" },
  },
  StateDefinitionStatement: {
    reference: { shape: "node" },
    description: { shape: "nodeOrNull" },
  },
  StateDiagram: {
    body: { shape: "nodeList" },
  },
  StateDirectionStatement: {
    textBefore: { shape: "nodeOrNull" },
    direction: { shape: "value", valueType: "string" },
    textAfter: { shape: "nodeOrNull" },
  },
  StateFloatingNoteStatement: {
    text: { shape: "nodeOrNull" },
    id: { shape: "nodeOrNull" },
  },
  StateIgnoredStatement: {
    value: { shape: "value", valueType: "string" },
  },
  StateIgnoredText: {
    value: { shape: "value", valueType: "string" },
  },
  StateLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  StateNoteStatement: {
    position: { shape: "value", valueType: "string" },
    textBeforeState: { shape: "nodeOrNull" },
    state: { shape: "nodeOrNull" },
    textBeforeText: { shape: "nodeOrNull" },
    text: { shape: "nodeOrNull" },
  },
  StatePseudostateDefinitionStatement: {
    id: { shape: "nodeOrNull" },
    kind: { shape: "value", valueType: "string" },
  },
  StateReference: {
    state: { shape: "node" },
    cssClass: { shape: "nodeOrNull" },
  },
  StateScaleStatement: {
    width: { shape: "node" },
  },
  StateStyleStatement: {
    states: { shape: "nodeListWithNull" },
    styles: { shape: "nodeListWithNull" },
  },
  StateTransitionStatement: {
    from: { shape: "node" },
    to: { shape: "node" },
    label: { shape: "nodeOrNull" },
  },
  StringLiteral: {
    value: { shape: "value", valueType: "string" },
    raw: { shape: "value", valueType: "string" },
    closed: { shape: "value", valueType: "boolean" },
  },
  TimelineAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
  },
  TimelineAccDescrStatement: {
    value: { shape: "node" },
  },
  TimelineAccTitleStatement: {
    value: { shape: "node" },
  },
  TimelineDiagram: {
    direction: { shape: "value", valueType: "stringOrNull" },
    body: { shape: "nodeList" },
  },
  TimelineEventStatement: {
    events: { shape: "nodeList" },
  },
  TimelineLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  TimelinePeriodStatement: {
    period: { shape: "node" },
    events: { shape: "nodeList" },
  },
  TimelineSectionStatement: {
    name: { shape: "node" },
  },
  TimelineTitleStatement: {
    value: { shape: "node" },
  },
  Token: {
    value: { shape: "value", valueType: "string" },
  },
  QuadrantAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
  },
  QuadrantAccDescrStatement: {
    value: { shape: "node" },
  },
  QuadrantAccTitleStatement: {
    value: { shape: "node" },
  },
  QuadrantAxisStatement: {
    axis: { shape: "value", valueType: "string" },
    start: { shape: "node" },
    arrow: { shape: "value", valueType: "boolean" },
    end: { shape: "nodeOrNull" },
  },
  QuadrantClassDefStatement: {
    name: { shape: "node" },
    styles: { shape: "nodeList" },
  },
  QuadrantDiagram: {
    body: { shape: "nodeList" },
  },
  QuadrantIdentifier: {
    name: { shape: "value", valueType: "string" },
  },
  QuadrantLabel: {
    kind: { shape: "value", valueType: "string" },
    value: { shape: "value", valueType: "string" },
  },
  QuadrantLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  QuadrantPointStatement: {
    name: { shape: "node" },
    className: { shape: "nodeOrNull" },
    x: { shape: "node" },
    y: { shape: "node" },
    styles: { shape: "nodeList" },
  },
  QuadrantQuadrantStatement: {
    quadrant: { shape: "value", valueType: "number" },
    text: { shape: "node" },
  },
  QuadrantTitleStatement: {
    value: { shape: "nodeOrNull" },
  },
  XychartAccDescrBlockStatement: {
    value: { shape: "nodeOrNull" },
    closed: { shape: "value", valueType: "boolean" },
  },
  XychartAccDescrStatement: {
    value: { shape: "nodeOrNull" },
  },
  XychartAccTitleStatement: {
    value: { shape: "nodeOrNull" },
  },
  XychartBand: {
    categories: { shape: "nodeList" },
  },
  XychartDiagram: {
    headers: { shape: "nodeList" },
    body: { shape: "nodeList" },
  },
  XychartHeader: {
    orientation: { shape: "value", valueType: "stringOrNull" },
  },
  XychartLiteral: {
    value: { shape: "value", valueType: "string" },
  },
  XychartPlotStatement: {
    kind: { shape: "value", valueType: "string" },
    title: { shape: "nodeOrNull" },
    values: { shape: "nodeList" },
  },
  XychartRange: {
    start: { shape: "node" },
    end: { shape: "node" },
  },
  XychartTitleStatement: {
    value: { shape: "node" },
  },
  XychartValue: {
    value: { shape: "node" },
    label: { shape: "nodeOrNull" },
  },
  XychartXAxisStatement: {
    title: { shape: "nodeOrNull" },
    data: { shape: "nodeOrNull" },
  },
  XychartYAxisStatement: {
    title: { shape: "nodeOrNull" },
    data: { shape: "nodeOrNull" },
  },
}
