/**
 * The keywords that are printed in the form of the examples in the
 * documentation of the pinned mermaid.js (docs/compatibility.md, Spellings that
 * are drawn the same), by the diagram type and the keyword in lower case.
 * mermaid.js reads these keywords in any case, and a text with the keyword in
 * another case has the same Db and draws the same figure. A keyword is listed
 * where the examples use one form at least twice as often as any other; a
 * keyword that the examples do not use, and one that another case changes the
 * Db or the figure of (`left` and `right` of a note in a state diagram, `class`
 * in a class diagram), are not listed and stay as written. So are `style` and
 * `classDef`: mermaid.js removes the last `;` of a line that has them in this
 * case before it reads a `:`, a `#`, and a `;` that follow in this order, and
 * the line is read as a whole after the directives and comments are removed,
 * so no rule on the line of the keyword can tell whether another case reads it
 * the same.
 */
export const keywordSpellings: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  er: {
    bt: "BT",
    direction: "direction",
    end: "end",
    lr: "LR",
    rl: "RL",
    subgraph: "subgraph",
    tb: "TB",
  },
  gantt: {
    axisformat: "axisFormat",
    dateformat: "dateFormat",
    excludes: "excludes",
    friday: "friday",
    monday: "monday",
    section: "section",
    tickinterval: "tickInterval",
    title: "title",
    weekday: "weekday",
    weekend: "weekend",
  },
  journey: {
    section: "section",
    title: "title",
  },
  mindmap: {
    "::icon(": "::icon(",
  },
  quadrantChart: {
    "quadrant-1": "quadrant-1",
    "quadrant-2": "quadrant-2",
    "quadrant-3": "quadrant-3",
    "quadrant-4": "quadrant-4",
    title: "title",
    "x-axis": "x-axis",
    "y-axis": "y-axis",
  },
  requirement: {
    analysis: "analysis",
    class: "class",
    contains: "contains",
    copies: "copies",
    demonstration: "demonstration",
    derives: "derives",
    designconstraint: "designConstraint",
    direction: "direction",
    docref: "docRef",
    element: "element",
    functionalrequirement: "functionalRequirement",
    high: "high",
    id: "id",
    inspection: "inspection",
    interfacerequirement: "interfaceRequirement",
    low: "low",
    lr: "LR",
    medium: "medium",
    performancerequirement: "performanceRequirement",
    physicalrequirement: "physicalRequirement",
    refines: "refines",
    requirement: "requirement",
    risk: "risk",
    satisfies: "satisfies",
    test: "test",
    text: "text",
    traces: "traces",
    type: "type",
    verifies: "verifies",
    verifymethod: "verifymethod",
  },
  sequence: {
    activate: "activate",
    actor: "actor",
    alt: "alt",
    and: "and",
    as: "as",
    autonumber: "autonumber",
    box: "box",
    break: "break",
    create: "create",
    critical: "critical",
    deactivate: "deactivate",
    destroy: "destroy",
    else: "else",
    end: "end",
    link: "link",
    links: "links",
    loop: "loop",
    note: "Note",
    of: "of",
    opt: "opt",
    option: "option",
    over: "over",
    par: "par",
    participant: "participant",
    rect: "rect",
    right: "right",
  },
  stateDiagram: {
    "<<choice>>": "<<choice>>",
    "<<fork>>": "<<fork>>",
    "<<join>>": "<<join>>",
    accdescr: "accDescr",
    acctitle: "accTitle",
    as: "as",
    class: "class",
    direction: "direction",
    end: "end",
    lr: "LR",
    note: "note",
    state: "state",
    tb: "TB",
  },
  timeline: {
    section: "section",
    td: "TD",
    title: "title",
  },
  usecase: {
    extend: "extend",
    include: "include",
  },
  venn: {
    set: "set",
    text: "text",
    title: "title",
    union: "union",
  },
  xychart: {
    bar: "bar",
    line: "line",
    title: "title",
    "x-axis": "x-axis",
    "y-axis": "y-axis",
  },
}
