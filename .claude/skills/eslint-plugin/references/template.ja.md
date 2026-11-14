# 規則の文書のひな形（eslint-plugin）

英語の規則の文書:

    # @mmd-toolkit/<name>

    Japanese version: [<name>.ja.md](./<name>.ja.md)

    Disallow ….

    <!-- begin auto-generated rule notice -->
    …
    <!-- end auto-generated rule notice -->

    <動機。1 段落>

    ## Rule Details

    <少数の短い文>

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

    ## When Not To Use It               （本当に言うことがあるときだけ）

    ## Related Rules                    （関連する規則があるときだけ）

    - [<name>](./<name>.md)

    ## Further Reading                  （リンクがあるときだけ）

    - [<mermaid.js の文書の頁、issue、PR>](<link>)

    ## Resources                        （生成する）

日本語の規則の文書は同じ部分を持つ。
`英語版: [<名前>.md](./<名前>.md)`、`…を禁止する。`、`## 規則の詳細`、
`この規則に**反する**コードの例:`、`この規則に**従う**コードの例:`、
`この規則にはオプションがない。` を持つ `## オプション`、`## 使わないとき`、
`## 関連する規則`、`## 参考` である。
