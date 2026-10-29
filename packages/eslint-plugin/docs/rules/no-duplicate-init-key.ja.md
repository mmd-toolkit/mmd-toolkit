# @mmd-toolkit/no-duplicate-init-key

英語版: [no-duplicate-init-key.md](./no-duplicate-init-key.md)

init のディレクティブの JSON の 1 つのオブジェクトで 2 度書いたキーを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

init のディレクティブの JSON の 1 つのオブジェクトがキーを 2 度持つと、
mermaid.js はエラーなしに最後の値を使う。
前の値は失われる。

## 規則の詳細

この規則は、すべての図種に当てる。
init のディレクティブの同じ JSON オブジェクトの中で、別の値で繰り返したキーを、
どの深さでも報告する。
キーは、mermaid.js と同じく各 `'` を `"` に変えて、JSON が読むとおりに比べる。

同じ値の繰り返しは報告しない。
別々の init のディレクティブでのキーの繰り返しも報告しない。
各キーの最後の値で設定を合わせることは、文書にある書き方だからである。
正しくない JSON は、
代わりに [no-invalid-init-directive](./no-invalid-init-directive.ja.md)
が報告する。

例は flowchart である。

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

## 参考

- [ディレクティブ](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/config/directives.md#L88-L96)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/no-duplicate-init-key.ts)
- [テストのソース](../../tests/rules/no-duplicate-init-key.test.ts)

<!-- end auto-generated rule resources -->
