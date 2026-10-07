# @mmd-toolkit/sequence-no-duplicate-description

英語版:
[sequence-no-duplicate-description.md](./sequence-no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
mermaid.js はどの `accDescr` の文も受理し、
説明を設定する文は、それより前に設定した説明を黙って置き換える。
2 つ目の説明は、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、説明を設定する文のうち、最初のもの以外をすべて報告する。
対象の図種は `sequence` である。

`accDescr:` は説明を設定する。
テキストがなくても説明を設定する。
テキストの終わりでは説明を空にする。
後にテキストがあれば、空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行を説明にする。
説明を持つ閉じたブロックも説明を設定する。
1 行の形とブロックの形を混ぜても、どちらが先でも、
後に書いたほうの説明が使われる。
`loop` のようなブロックの中の文も、図全体の説明を設定するので、数える。

説明を持たないブロックは、数えない。
それは、
[sequence-no-empty-description-block](./sequence-no-empty-description-block.ja.md)
が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr { first }
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  loop every minute
    A ->> B: x
    accDescr: inner
  end
  accDescr: outer
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr: first
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)
- [sequence-no-duplicate-title](./sequence-no-duplicate-title.ja.md)
- [sequence-no-empty-description-block](./sequence-no-empty-description-block.ja.md)
