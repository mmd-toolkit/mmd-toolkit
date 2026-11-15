// The data-block node types shared by fixture-shapes and implementation tests.

/** The node types of the data blocks, whose delimiters lie in their range. */
export const DATA_BLOCK_NODE_TYPES: ReadonlySet<string> = new Set([
  "EventmodelingDataBlock",
  "AgentflowDataBlock",
  "KanbanDataBlock",
  "FlowchartDataBlock",
  "SequenceDataBlock",
  "UsecaseJsonDataBlock",
])
