# @mmd-toolkit/state-no-duplicate-description

英語版: [state-no-duplicate-description.md](./state-no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
mermaid.js はどの `accDescr` の文も受理し、説明を設定する文は、
それより前に設定した説明を黙って置き換える。
2 つ目の説明は、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、説明を設定する文のうち、最初のもの以外を、
前と違う説明を設定するときに報告する。
対象の図種は `stateDiagram` である。

`accDescr:` は説明を設定する。
テキストがなくても説明を設定する。
空行、コメント行、ディレクティブを飛ばして、テキストを持つ次の行を説明にし、
そうした行が後になければ、説明を空にする。
説明を持つ閉じたブロックも説明を設定する。
1 行の形とブロックの形を混ぜても、どちらが先でも、
後に書いたほうの説明が使われる。

説明を持たないブロックは、数えない。
それは、
[state-no-empty-description-block](./state-no-empty-description-block.ja.md)
が報告する。
閉じていないブロックも数えない。
そのブロックはテキストの終わりまで続き、説明を空にする。
それは、
[state-no-unclosed-description-block](./state-no-unclosed-description-block.ja.md)
が報告する。
合成状態の中の `accDescr: x` は、`accDescr` の文ではない。
mermaid.js はそれを、説明 `x` を持つ状態 `accDescr` として読み、
規則はそれを数えない。

図がすでに持つ説明を設定する文は、どちらの形でも報告しない。
`accDescr: d` の後のブロック `accDescr { d }` は、何も失わない。
説明は、mermaid.js が持つとおりに、両端の空白と、
各改行の後の空白を除いて比べる。
そのため、ブロックの行の字下げと、その中の空行は数えない。
改行は、LF、CRLF、CR のどれも LF として読む。
そのため、CRLF で書いたブロックは、LF で書いたブロックと同じ説明を設定する。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr: first
  accDescr: second
  A --> B
```

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr { first }
  accDescr: second
  A --> B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accTitle: first
  accDescr: second
  A --> B
```

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr: first
  accDescr {
    first
  }
  A --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)
- [state-no-duplicate-title](./state-no-duplicate-title.ja.md)
- [state-no-empty-description-block](./state-no-empty-description-block.ja.md)
- [state-no-unclosed-description-block](./state-no-unclosed-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/state-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/state-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
