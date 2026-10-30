# @mmd-toolkit/agentflow-no-ignored-text

英語版: [agentflow-no-ignored-text.md](./agentflow-no-ignored-text.md)

mermaid.js が方向の行から捨てる文字を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`direction` と方向の値を持つ行は、全体で 1 つの方向の文として読まれる。
mermaid.js は、その行の残りを、そこに書いた文も含めてエラーなしに捨てる。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
同じ行の `direction` より前か、その方向の値より後にあるテキストを報告する。
`;` で区切った文や、`A[Set direction LR]-->B` のように、
ラベルの中に方向を含む行も対象になる。

`;` と空白だけのテキストは報告しない。
方向の値の後で、`%%` の前に `;` と空白しかないテキストも、
書き手がコメントのつもりで書くので報告しない。
`direction TB; x %% c` の `x` のように、
`%%` の前にあるほかのテキストは報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-ignored-text: error
agentflow-beta TB
  flow F
    A --> B; direction LR
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-ignored-text: error
agentflow-beta TB
  flow F
    direction LR
    A --> B
  end
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-ignored-text.ts)
- [テストのソース](../../tests/rules/agentflow-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
