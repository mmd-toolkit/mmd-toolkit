# @mmd-toolkit/wardley-no-duplicate-evolve

英語版:
[wardley-no-duplicate-evolve.md](./wardley-no-duplicate-evolve.md)

前の同じノードの `evolve` の行き先を置き換える `evolve` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ノードは進化の矢印を 1 つ持つ。
後の `evolve` がノードに別の行き先を与えると、
mermaid.js はエラーなしに後の行き先への矢印だけを描き、前の行き先は失われる。

## 規則の詳細

この規則は、
前の同じノードの `evolve` と違う行き先をノードに与える `evolve` を報告する。
対象の図種は `wardley` である。

`evolve API 0.6` と `evolve API 0.9` の後では、マップは 90 への矢印を 1 つ持つ。

ノードがすでに持つ行き先を与える `evolve` は報告しない。
行き先は百分率として比べ、`0.9` と `90.0` は 1 つの行き先である。
`evolve` の後に宣言したノードも数える。
どのノードの id でもない名前の `evolve` は何も描かず、
代わりに [wardley-no-undef](./wardley-no-undef.ja.md) が報告する。
名前はその規則が比べるとおりに比べる。

ノードごとに `evolve` を 1 つ書く。

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

## 背景

[`addTrend`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyBuilder.ts#L108-L110) は、
ノードの矢印を前に保ったものの上に保つ。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-duplicate-evolve.ts)
- [テストのソース](../../tests/rules/wardley-no-duplicate-evolve.test.ts)

<!-- end auto-generated rule resources -->
