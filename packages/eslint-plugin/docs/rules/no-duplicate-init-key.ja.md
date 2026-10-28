# @mmd-toolkit/no-duplicate-init-key

英語版: [no-duplicate-init-key.md](./no-duplicate-init-key.md)

init のディレクティブの JSON の 1 つのオブジェクトで 2 度書いたキーを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、init のディレクティブの JSON を、
1 つのオブジェクトが 2 度持つキーの最後の値でエラーなしに読み、
前の値は失われる。

## 規則の詳細

この規則は、init のディレクティブの JSON のオブジェクトが、
別の値でもう一度持つキーを報告する。
対象はすべての図種である。

`%%{init: {"theme": "dark", "theme": "forest"}}%%` の後では、
テーマは `forest` である。
`{"flowchart": {"inheritDir": true, "inheritDir": false}}` の `flowchart` のオブジェクトのように、
どの深さのオブジェクトも調べる。
キーは、mermaid.js と同じくすべての `'` を `"` として、
JSON が読むとおりに比べる。
同じ値でもう一度書いたキーは報告せず、
2 つの init のディレクティブのキーも報告しない。
文書は、テキストの init のディレクティブを各キーの最後の値で合わせることを、
書き方として示す。

mermaid.js が読む JSON だけを調べる。
JSON が正しくないところは、
[no-invalid-init-directive](./no-invalid-init-directive.ja.md) が報告する。

2 つのメンバーの 1 つを残す。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/no-duplicate-init-key: error
%%{init: {"theme": "dark", "theme": "forest"}}%%
flowchart LR
  A --> B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/no-duplicate-init-key: error
%%{init: {"theme": "forest"}}%%
flowchart LR
  A --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-invalid-init-directive](./no-invalid-init-directive.ja.md)

## 背景

[`detectDirective`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L159-L198) は各 JSON の引数を `JSON.parse` で読み、
それはキーの最後の値を保つ。
[文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/directives.md#L88-L96) は、
テキストの init のディレクティブを、各キーに与えた最後の値で合わせる。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/no-duplicate-init-key.ts)
- [テストのソース](../../tests/rules/no-duplicate-init-key.test.ts)

<!-- end auto-generated rule resources -->
