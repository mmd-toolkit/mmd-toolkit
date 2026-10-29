# @mmd-toolkit/agentflow-no-unclosed-description-block

英語版:
[agentflow-no-unclosed-description-block.md](./agentflow-no-unclosed-description-block.md)

`}` で閉じていない `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`accDescr {` のブロックはその `}` まで続く。
それがないと、mermaid.js は残りのテキストをブロックとしてエラーなしに読み、
後の文は消え、説明は空になる。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
閉じる `}` のない `accDescr {` のブロックを報告する。
flow の中では、そのようなブロックは flow の `end` も取り込み、
mermaid.js がエラーを出すので、この規則は報告しない。

開く `{` より後の行に `{` がある閉じたブロックも報告する。
ただし、閉じる `}` の行で、その前に空白とディレクティブしかないものは除く。
説明のブロックは最初の `}` で閉じるので、後の形やデータブロックの `}` が、
誤って説明を閉じることがある。
`accDescr { a { b }` のように開く `{` の行にある `}` は、
書いたとおりにブロックを閉じ、報告しない。

後の行に意図して `{` を含めた説明も、
閉じる `}` がその例外に当たらなければ報告する。
規則はそれを形と見分けられない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  A --> B
  accDescr { x
  B --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  accDescr { first
  B --> C
  A{y}
  D
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  A --> B
  accDescr { x }
  B --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  accDescr {
    uses { here
  }
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-empty-description-block](./agentflow-no-empty-description-block.ja.md)
- [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/agentflow-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
