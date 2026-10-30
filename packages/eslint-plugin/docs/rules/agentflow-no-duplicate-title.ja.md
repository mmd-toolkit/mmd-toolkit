# @mmd-toolkit/agentflow-no-duplicate-title

英語版: [agentflow-no-duplicate-title.md](./agentflow-no-duplicate-title.md)

前に設定したタイトルを置き換える `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`agentflow-beta` の図は、
`accTitle` が設定するアクセシブルなタイトルを 1 つ持つ。
後の `accTitle` は、エラーなしにそれを置き換え、前のタイトルは失われる。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
前の文が設定したタイトルを変える `accTitle` 文を報告する。
flow や `global` のブロックの中の文も、図全体のタイトルを設定するので数える。

`accTitle:` の後にテキストがないと、空行とディレクティブを越えて、
テキストのある次の行をタイトルにし、そのような行がなければタイトルを空にする。
そこではコメント行もタイトルのテキストとして数える。

現在のタイトルの繰り返しは報告しない。
タイトルは両端の空白を除き、そのほかは書いたとおりに比べるので、
文字参照や HTML の属性の引用符の違いは、
mermaid.js が同じタイトルとして読んでも報告することがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-title: error
agentflow-beta TB
  accTitle: first
  accTitle: second
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-title: error
agentflow-beta TB
  A
  accTitle: x
  accTitle:
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-title: error
agentflow-beta TB
  flow F
    A
    accTitle: inner
  end
  accTitle: outer
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-title: error
agentflow-beta TB
  A
  accTitle: first
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-title: error
agentflow-beta TB
  A
  accTitle: first
  accTitle: first
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/agentflow-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
