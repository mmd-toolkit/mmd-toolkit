import markdown from "@eslint/markdown"
import mmd from "@mmd-toolkit/eslint-plugin"

export default [...markdown.configs.processor, mmd.configs.recommended]
