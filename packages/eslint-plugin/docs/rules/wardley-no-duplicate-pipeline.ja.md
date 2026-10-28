# @mmd-toolkit/wardley-no-duplicate-pipeline

英語版:
[wardley-no-duplicate-pipeline.md](./wardley-no-duplicate-pipeline.md)

前の同じ親の pipeline の子を置き換える pipeline を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

親は 1 つの pipeline を持つ。
親の後の pipeline は、その子を前の子に足さない。
mermaid.js はエラーなしにそれを置き換え、前の pipeline の子は、
ノードとしては描かれるが、pipeline の枠から外れる。

## 規則の詳細

この規則は、前の同じ親の pipeline と違う子を持つ pipeline を報告する。
対象の図種は `wardley` である。

`SQL` を持つ `Database` の pipeline と `Cloud` を持つものの後では、
pipeline の枠は `Cloud` だけを持つ。

別の順でも同じ子を持つ pipeline は報告しない。
そこで別の位置を与えた子は [wardley-no-redefined-node](./wardley-no-redefined-node.ja.md) が報告する。
pipeline の後に宣言した親も数える。
名前は [wardley-no-undef](./wardley-no-undef.ja.md) が比べるとおりに比べる。

親の子は 1 つの pipeline に書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-pipeline: error
wardley-beta
  component Database [0.4, 0.8]
  pipeline Database {
    component SQL [0.5]
  }
  pipeline Database {
    component Cloud [0.9]
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-pipeline: error
wardley-beta
  component Database [0.4, 0.8]
  pipeline Database {
    component SQL [0.5]
    component Cloud [0.9]
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [wardley-no-redefined-node](./wardley-no-redefined-node.ja.md)
- [wardley-no-undef](./wardley-no-undef.ja.md)

## 背景

[`startPipeline`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyBuilder.ts#L112-L120) は、
親の子を新しく始める。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-duplicate-pipeline.ts)
- [テストのソース](../../tests/rules/wardley-no-duplicate-pipeline.test.ts)

<!-- end auto-generated rule resources -->
