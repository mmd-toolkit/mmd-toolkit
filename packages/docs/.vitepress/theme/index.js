import DefaultTheme from "vitepress/theme"
import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client"
import "@shikijs/vitepress-twoslash/style.css"
import "./style.css"

export default {
  extends: DefaultTheme,
  /** Installs the hover popups used by ESLint diagnostic markers. */
  enhanceApp({ app }) {
    app.use(TwoslashFloatingVue)
  },
}
