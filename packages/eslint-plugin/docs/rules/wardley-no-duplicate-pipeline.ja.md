# @mmd-toolkit/wardley-no-duplicate-pipeline

英語版: [wardley-no-duplicate-pipeline.md](./wardley-no-duplicate-pipeline.md)

前の同じ親の pipeline の子を置き換える pipeline を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

親は 1 つの pipeline を持つ。
親の後の pipeline は、その子を前の子に足さない。
mermaid.js はエラーなしにそれを置き換え、前の pipeline の子は、
ノードとしては描かれるが、pipeline の枠から外れる。

## 規則の詳細

この規則は、Wardley マップ（`wardley-beta`）に当てる。
同じ親の直前の pipeline と違う子を持つ pipeline を報告する。
同じ子を持つ pipeline は、順が違っても報告しない。
後の pipeline で違う位置を与えた子は、
代わりに [wardley-no-redefined-node](./wardley-no-redefined-node.ja.md)
が報告する。

親の宣言より前に書いた pipeline も比べる。
名前は [wardley-no-undef](./wardley-no-undef.ja.md) が比べるとおりに比べる。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-duplicate-pipeline.ts)
- [テストのソース](../../tests/rules/wardley-no-duplicate-pipeline.test.ts)

<!-- end auto-generated rule resources -->
