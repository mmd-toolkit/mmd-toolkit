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

この規則は、Wardley マップ（`wardley-beta`）に当てる。
どのノードも名指さないリンクの端と `evolve` を報告する。
リンクや `evolve` の後に宣言したノードも数える。
リンクは id か pipeline の子のラベルでノードを名指す。

pipeline `Database` の子 `SQL` は `Database_SQL` とも `SQL` とも名指せるが、
`evolve` はその id `Database_SQL` だけを使える。

名前は大文字小文字と空白を区別し、そのほかは書いたとおりに比べる。
mermaid.js は名前を読む前に HTML の属性の引用符を変換するので、
それだけが違う名前は、mermaid.js には同じでも、この規則には違うことがある。
親がどのノードでもない pipeline は、mermaid.js がエラーを出すので報告しない。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-undef.ts)
- [テストのソース](../../tests/rules/wardley-no-undef.test.ts)

<!-- end auto-generated rule resources -->
