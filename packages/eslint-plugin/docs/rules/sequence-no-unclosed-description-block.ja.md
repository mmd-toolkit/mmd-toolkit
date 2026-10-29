# @mmd-toolkit/sequence-no-unclosed-description-block

英語版:
[sequence-no-unclosed-description-block.md](./sequence-no-unclosed-description-block.md)

閉じる `}` のない `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js は、閉じる `}` のない `accDescr {` のブロックをエラーなしに受理する。
最初の `}` かテキストの終わりまで、後の行を説明のテキストとして読む。
`}` がなければ説明は空になる。

## 規則の詳細

この規則は、シーケンス図（`sequenceDiagram`）に当てる。
閉じる `}` のない `accDescr {` のブロックを報告する。

開く `{` より後の行に `{` がある閉じたブロックも報告する。
ただし、閉じる `}` の行で、その前に空白とディレクティブしかないものは除く。
ブロックは `{` の後の最初の `}` で終わるので、後のデータブロック、
JSON オブジェクト、メッセージの `}` が、誤ってブロックを閉じることがある。
`accDescr { a { b }` のように、開く `{` の行で閉じるブロックは報告せず、
`};` や `} A ->> B: x` のように、閉じる `}` の後に何があっても、
その例外には影響しない。

後の行に意図して `{` を含めた説明も、
閉じる `}` がその例外に当たらなければ報告する。
逆に、データブロックの閉じる `}` の前に空白とディレクティブしかなければ、
説明がそのデータブロックのテキストを取り込んでも報告しない。
規則は、それらの `}` を見分けられない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y
```

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y
  B ->> A: z
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
  B ->> A: z
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md)
- [sequence-no-empty-description-block](./sequence-no-empty-description-block.ja.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/sequence-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
