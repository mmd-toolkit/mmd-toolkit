# @mmd-toolkit/flowchart-no-ignored-text

英語版: [flowchart-no-ignored-text.md](./flowchart-no-ignored-text.md)

方向の行にあって、mermaid.js が捨てるテキストを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`direction` の文は、それだけで 1 行に書く。
ほかのテキストも同じ行にあると、mermaid.js は行全体を方向の文として読み、
残りをエラーなしに捨てる。

## 規則の詳細

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
同じ行の `direction` より前か、その方向の値より後にあるテキストを報告する。
`;` で区切った文や、`A[Set direction LR]-->B` のように、
ラベルの中に方向を含む行も対象になる。

方向の値の後の、`;` と空白だけのテキストは報告しない。
`%%` の前に `;` と空白しかないテキストも、
書き手がコメントのつもりで書くので報告しない。
`direction TB; x %% c` の `x` のように、
`%%` の前にあるほかのテキストは報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-ignored-text: error
flowchart LR
  subgraph S
    A-->B; direction TB
  end
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-ignored-text: error
flowchart LR
  A-->B direction TB
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-ignored-text: error
flowchart LR
  subgraph S
    direction TB; A-->B
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-ignored-text: error
flowchart LR
  subgraph S
    A --> B
    direction TB
  end
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-ignored-text: error
flowchart LR
  subgraph S
    direction TB %% vertical
    A --> B
  end
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-ignored-text.ts)
- [テストのソース](../../tests/rules/flowchart-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
