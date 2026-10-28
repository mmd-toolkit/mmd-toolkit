# @mmd-toolkit/no-invalid-init-directive

英語版:
[no-invalid-init-directive.md](./no-invalid-init-directive.md)

図を設定するつもりで正しく書かれず、
mermaid.js が無視するディレクティブを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`init` か `initialize` で終わる名前のディレクティブは、
`%%{init: {"theme": "dark"}}%%` のように JSON で設定を与える。
その JSON が正しくないと、
mermaid.js はエラーなしに、
テキストのすべての init のディレクティブの設定を捨てる。
`INIT` のように大文字小文字の違う `init` で終わる名前は、
まったく設定を与えない。

## 規則の詳細

この規則は、JSON が正しくない init のディレクティブと、
大文字小文字の違いだけで `init` か `initialize` で終わる名前の
ディレクティブを報告する。
対象はすべての図種である。

名前が小文字の `init` か `initialize` で終わるディレクティブが設定を与え、
`init`、`initialize`、`myinit` はそうである。
引数は、語の文字でない文字で始まるとき JSON である。
mermaid.js は JSON を読む前にテキストのすべての `'` を `"` に変えるので、
`{'theme': 'dark'}` は正しい。
`{"theme": "dark",}` のような末尾のカンマ、引用符のないキー、値の欠け、
開いたままの文字列やオブジェクトでは JSON は正しくなく、
mermaid.js は、このディレクティブと、
その前後のほかのすべての init のディレクティブの設定を捨てる。

書いたとおりで正しい JSON は、
`{"fontFamily": "O'Brien"}` のように `'` を `"` に変えると壊れる場合も
報告しない。
書き手は正しい JSON を書き、mermaid.js が自分の読み方で設定を捨てる。
`%%{init: dark}%%` のような語の引数や、引数のないものは設定を与えず、
報告しない。
mermaid.js は、設定を読む前に、テキストの終わりの空白を取り除き、
次に、`%%}%%` のように `}%%` が続く `%%` からその行の終わりまでの文字を、
その行を改行が終えるところで取り除く。
そのため、その行の `%%}%%` の後の、正しくない JSON を持つディレクティブは、
空白でない文字がその行の後にあれば自分の設定だけを捨て、
最後の行ではすべての init のディレクティブの設定を捨てる。
どちらも報告する。

`INIT`、`Init`、`myINIT` は、大文字小文字の違いだけで `init` で終わる。
mermaid.js はそれを設定として読まず、
ほかの init のディレクティブはそのまま当たる。

`}%%` のないディレクティブが後の行を JSON に取ると、
[no-unclosed-directive](./no-unclosed-directive.ja.md) もそれを報告する。

JSON を直すか、名前を小文字で書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/no-invalid-init-directive: error
%%{init: {"theme": "dark",}}%%
flowchart LR
  A --> B
```

```mmd
%% eslint @mmd-toolkit/no-invalid-init-directive: error
%%{INIT: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/no-invalid-init-directive: error
%%{init: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-unclosed-directive](./no-unclosed-directive.ja.md)
- [no-duplicate-init-key](./no-duplicate-init-key.ja.md)

## 背景

[`detectInit`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L98-L130)
は `init` か `initialize` で終わる名前のディレクティブを読み、
[`detectDirective`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L159-L198)
は、すべての `'` を `"` に変え、各 JSON の引数を読み、
その 1 つでも正しくないとディレクティブをまったく与えない。
[文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/directives.md#L75-L75)
は、正しくない引数は無視されると述べる。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/no-invalid-init-directive.ts)
- [テストのソース](../../tests/rules/no-invalid-init-directive.test.ts)

<!-- end auto-generated rule resources -->
