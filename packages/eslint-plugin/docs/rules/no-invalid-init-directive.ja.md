# @mmd-toolkit/no-invalid-init-directive

英語版: [no-invalid-init-directive.md](./no-invalid-init-directive.md)

図を設定するつもりで正しく書かれず、
mermaid.js が無視するディレクティブを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

init のディレクティブは、JSON で図の設定を与える。
JSON が正しくないと、mermaid.js はエラーなしに、
すべての init のディレクティブの設定を捨てることがある。
別の大文字小文字の `init` か `initialize` で終わる名前は、
まったく設定を与えない。

## 規則の詳細

この規則は、すべての図種に当てる。
init のディレクティブの正しくない JSON と、`INIT` や `myINIT` のように、
別の大文字小文字の `init` か `initialize` で終わる名前を報告する。

`myinit` も含め、小文字の `init` か `initialize` で終わる名前が設定を与える。
mermaid.js は JSON を読む前に各 `'` を `"` に変えるので、
`{'theme': 'dark'}` は正しく、報告しない。
末尾のカンマ、引用符のないキー、欠けた値、閉じない文字列やオブジェクトは、
JSON を不正にする。

書いたとおりで正しい JSON は、`{"fontFamily": "O'Brien"}` のように、
`'` を `"` に変えると壊れても報告しない。
`%%{init: dark}%%` のような語の引数や、引数のないものは設定を与えず、
報告しない。

例は flowchart である。

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

## 参考

- [ディレクティブ](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/config/directives.md#L75-L75)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/no-invalid-init-directive.ts)
- [テストのソース](../../tests/rules/no-invalid-init-directive.test.ts)

<!-- end auto-generated rule resources -->
