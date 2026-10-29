# @mmd-toolkit/wardley-no-undef

英語版: [wardley-no-undef.md](./wardley-no-undef.md)

どのノードも名指さないリンクや `evolve` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

リンクと `evolve` は、それがつなぐか動かすノードを名指す。
その名前がどのノードの名前でもないと、mermaid.js はエラーなしに受理し、
線も矢印も描かない。

## 規則の詳細

この規則は、どのノードも名指さないリンクの端と、
どのノードも名指さない `evolve` を報告する。
対象の図種は `wardley` である。

`component Database` の後では、リンク `API -> Databse` は線もラベルも描かず、
`evolve Databse 0.9` は矢印を描かない。

リンクや `evolve` の後に宣言したノードも数える。
リンクはノードを、id か pipeline の子のラベルで名指す。
pipeline `Database` の子 `SQL` は id `Database_SQL` を持ち、
リンクはそれを `Database_SQL` とも `SQL` とも名指せる。
`evolve` はノードを id だけで名指すので、
そこでは `evolve SQL 0.9` はどのノードも名指さない。
名前は大文字小文字と空白を区別して比べ、名前の中のすべての改行（LF、CRLF、
CR）は LF として読む。
名前はそのほかは書いたとおりに比べる。
mermaid.js は、`\q` のようなエスケープを解き、HTML の属性の引用符を、
名前を読む前にほかの文字に変えるので、それだけが違う 2 つの名前は、
mermaid.js には 1 つで、この規則には 2 つのことがある。
親がどのノードでもない pipeline は、mermaid.js が受理しない。

名前を直すか、ノードを宣言する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-undef: error
wardley-beta
  component API [0.6, 0.7]
  component Database [0.3, 0.8]
  API -> Databse
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-undef: error
wardley-beta
  component API [0.6, 0.7]
  component Database [0.3, 0.8]
  API -> Database
```

## オプション

この規則にはオプションがない。

## 背景

[`resolveNodeId`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyBuilder.ts#L175-L185)
は、リンクのノードを id で、次にラベルで探し、
どのノードも名指さない名前はそのまま残し、描画はそれを除く。
どのノードの id でもない名前の
[`evolve`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L189-L197)
は矢印を足さない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-undef.ts)
- [テストのソース](../../tests/rules/wardley-no-undef.test.ts)

<!-- end auto-generated rule resources -->
