# @mmd-toolkit/agentflow-no-duplicate-title

英語版: [agentflow-no-duplicate-title.md](./agentflow-no-duplicate-title.md)

前に設定したタイトルを置き換える `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

agentflow は、`accTitle` が設定するアクセシブルなタイトルを 1 つ持つ。
後の `accTitle` は、前に設定したタイトルをエラーなしに置き換え、
前のタイトルは失われる。

## 規則の詳細

この規則は、最初のものより後の `accTitle` 文のうち、
その前のタイトルと違うタイトルを設定するものを、それぞれ報告する。
対象の図種は `agentflow` である。

`accTitle: first` と `accTitle: second` の後では、タイトルは `second` である。
文字のない `accTitle:` もタイトルを設定する。
空の行と指示子を越えて、文字のある次の行をタイトルとして取り、
そのような行が続かなければ、タイトルを空にする。
そこではコメント行も文字であり、
`accTitle:` の後の行 `%% next` はタイトル `%% next` になる。
どちらでも、その前に書いたタイトルは失われる。
flow や `global` のブロックの中の文も図全体のタイトルを設定し、数える。
mermaid.js は、flow の中のそのような文の値を、
id として flow のメンバーにも加えるので、その id の頂点はその flow に属する。

図がすでに持つタイトルを設定する文は報告しない。
`accTitle: a` の後の 2 つ目の `accTitle: a` は何も失わない。
タイトルは、mermaid.js が取り除く両端の空白を除いて比べるので、
`accTitle:  a` は同じタイトルを設定する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。
タイトルはそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
タイトルを読む前にほかの文字に変えるので、それだけが違う 2 つのタイトルは、
mermaid.js には 1 つで、この規則には 2 つのことがある。

`accTitle` 文は 1 つにする。

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

## 背景

[`accTitle` 文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L426-L426)
は、前に設定したタイトルを置き換える共通の `setAccTitle` を呼び、
flow がメンバーとして取る値を返す。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/agentflow-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
