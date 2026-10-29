# @mmd-toolkit/wardley-no-duplicate-evolve

英語版: [wardley-no-duplicate-evolve.md](./wardley-no-duplicate-evolve.md)

前の同じノードの `evolve` の行き先を置き換える `evolve` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

ノードは進化の矢印を 1 つ持つ。
後の `evolve` がノードに別の行き先を与えると、
mermaid.js はエラーなしに後の行き先への矢印だけを描き、前の行き先は失われる。

## 規則の詳細

この規則は、Wardley マップ（`wardley-beta`）に当てる。
同じノードの直前の `evolve` と違う行き先を与える `evolve` を報告する。
現在の行き先の繰り返しは報告しない。
行き先は百分率として比べるので、`0.9` と `90.0` は同じ行き先である。

ノードの宣言より前に書いた `evolve` も比べる。
どのノードの id も名指さない `evolve` は、
代わりに [wardley-no-undef](./wardley-no-undef.ja.md) が報告する。
名前はその規則が比べるとおりに比べる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-evolve: error
wardley-beta
  component API [0.3, 0.4]
  evolve API 0.6
  evolve API 0.9
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-evolve: error
wardley-beta
  component API [0.3, 0.4]
  evolve API 0.9
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [wardley-no-undef](./wardley-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-duplicate-evolve.ts)
- [テストのソース](../../tests/rules/wardley-no-duplicate-evolve.test.ts)

<!-- end auto-generated rule resources -->
