# @mmd-toolkit/wardley-no-redefined-node

英語版:
[wardley-no-redefined-node.md](./wardley-no-redefined-node.md)

別の値でもう一度宣言したノードを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

Wardley マップは id ごとに 1 つのノードを持つ。
もう一度宣言したノードは 2 つ目のノードを足さない。
mermaid.js はエラーなしに前の宣言の位置、戦略、慣性を置き換え、
前の値は失われる。

## 規則の詳細

この規則は、前の宣言と違う値を同じ id のノードに与える、 anchor、component、
pipeline の子の宣言を報告する。
対象の図種は `wardley` である。

`component API [0.6, 0.7] (build) inertia` と `component API [0.3, 0.8]` の後では、
マップは後の位置に、`build` の表示も慣性の印もない 1 つのノード `API` を持つ。

mermaid.js は、テキストの中の順によらず、anchor、component、
pipeline の子の順にノードを取るので、 component は、
anchor がその後に書かれていても、その名前の anchor を置き換え、
この規則もその順に比べる。
pipeline `P` の子 `X` は id `P_X` を持ち、
`P_X` という名前の component を置き換える。
位置は百分率として比べ、`0.6` と `60.0` は 1 つの位置である。
後の宣言が省いたラベルのずれは前のものを保ち、省いた戦略や慣性は保たない。
pipeline の親の進化の向きの位置は比べない。
mermaid.js は親をその子の上に描くからである。
ノードがすでに持つ値を与える宣言は報告しない。
名前は、
規則 [wardley-no-undef](./wardley-no-undef.ja.md) が比べるとおりに比べる。

ノードごとに自分の id を与えるか、1 度だけ宣言する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-redefined-node: error
wardley-beta
  component API [0.6, 0.7] (build) inertia
  component API [0.3, 0.8]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-redefined-node: error
wardley-beta
  component API [0.6, 0.7] (build) inertia
  component Database [0.3, 0.8]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [wardley-no-undef](./wardley-no-undef.ja.md)

## 背景

[パーサー](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L92-L171) は anchor、
component、pipeline の子をその順に足し、
[`addNode`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyBuilder.ts#L92-L102) は同じ id のノードの上にノードを保ち、
ラベルのずれだけを残す。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-redefined-node.ts)
- [テストのソース](../../tests/rules/wardley-no-redefined-node.test.ts)

<!-- end auto-generated rule resources -->
