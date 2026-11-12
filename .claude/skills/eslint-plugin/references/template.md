# The template of a rule document (eslint-plugin)

The English rule document:

    # @mmd-toolkit/<name>

    Japanese version: [<name>.ja.md](./<name>.ja.md)

    Disallow ….

    <!-- begin auto-generated rule notice -->
    …
    <!-- end auto-generated rule notice -->

    <the motivation, one paragraph>

    ## Rule Details

    <a few short sentences>

    Examples of **incorrect** code for this rule:

    ```mmd
    %% eslint @mmd-toolkit/<name>: error
    …
    ```

    Examples of **correct** code for this rule:

    ```mmd
    %% eslint @mmd-toolkit/<name>: error
    …
    ```

    ## Options

    This rule has no options.

    ## When Not To Use It               (only when there is something real to say)

    ## Related Rules                    (only when there are related rules)

    - [<name>](./<name>.md)

    ## Further Reading                  (only when there are links)

    - [<the page of the documentation, issue, or pull request of mermaid.js>](<link>)

    ## Resources                        (generated)

The Japanese document has the same parts: `英語版: [<name>.md](./<name>.md)`,
`…を禁止する。`, `## 規則の詳細`, `この規則に**反する**コードの例:`,
`この規則に**従う**コードの例:`, `## オプション` with
`この規則にはオプションがない。`, `## 使わないとき`, `## 関連する規則`, and
`## 参考`.
