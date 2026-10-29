# @mmd-toolkit/agentflow-no-empty-description-block

英語版:
[agentflow-no-empty-description-block.md](./agentflow-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`accDescr` のブロックは、図に説明を与えるために書く。
mermaid.js は、何もない閉じたブロックをエラーなしに受理するが、
そのブロックは説明を設定しない。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
何も持たないか、空白だけを持つ閉じた `accDescr` のブロックを報告する。
ディレクティブはテキストに数えないので、
ディレクティブだけを持つブロックも報告するが、mermaid.js はその設定を適用する。

コメント行は説明のテキストとして数えるので、それを持つブロックは空ではない。

文やヘッダーの後、flow や connector の名前の中、
`click` 文の URL やツールチップの前にある空のブロックも報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  A
  accDescr {
  }
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  flow F accDescr {}
    A
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  A
  accDescr {
    The steps of the review
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.ja.md)
- [agentflow-no-unclosed-description-block](./agentflow-no-unclosed-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/agentflow-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
