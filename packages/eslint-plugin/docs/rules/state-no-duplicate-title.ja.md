# @mmd-toolkit/state-no-duplicate-title

英語版: [state-no-duplicate-title.md](./state-no-duplicate-title.md)

タイトルをもう一度設定する `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

図のアクセシビリティ用のタイトルは 1 つである。
mermaid.js はどの `accTitle` の文も受理し、
それぞれの文は、それより前に設定したタイトルを黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、`accTitle` の文のうち、最初のもの以外をすべて報告する。
対象の図種は `stateDiagram` である。

`accTitle: first` と `accTitle: second` の後、タイトルは `second` になる。
テキストのない `accTitle:` もタイトルを設定する。
空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行をタイトルにし、
そうした行が後になければ、タイトルを空にする。

合成状態の中の `accTitle: x` は、`accTitle` の文ではない。
mermaid.js はそれを、説明 `x` を持つ状態 `accTitle` として読み、
規則はそれを数えない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-title: error
stateDiagram-v2
  accTitle: first
  accTitle: second
  A --> B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-title: error
stateDiagram-v2
  accTitle: first
  accDescr: second
  A --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)
- [state-no-duplicate-description](./state-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/state-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/state-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
