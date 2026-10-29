# @mmd-toolkit/state-no-duplicate-title

英語版: [state-no-duplicate-title.md](./state-no-duplicate-title.md)

タイトルをもう一度設定する `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

図のアクセシブルなタイトルは 1 つである。
別の `accTitle` 文がタイトルを設定すると、
mermaid.js はエラーなしに前のものを置き換え、前のタイトルは失われる。

## 規則の詳細

この規則は、状態図（`stateDiagram`、`stateDiagram-v2`）に当てる。
前の文が設定したタイトルを変える `accTitle` 文を報告する。
現在のタイトルの繰り返しは報告せず、両端の空白を除いて比べる。

テキストのない `accTitle:` もタイトルを設定するので数える。
その文は、空行、コメント行、ディレクティブを越えて、
テキストのある次の行をタイトルにし、そのような行がなければタイトルを空にする。
合成状態の中の `accTitle: x` は、
説明 `x` を持つ状態 `accTitle` を定義するので数えない。

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

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-title: error
stateDiagram-v2
  accTitle: first
  accTitle: first
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
