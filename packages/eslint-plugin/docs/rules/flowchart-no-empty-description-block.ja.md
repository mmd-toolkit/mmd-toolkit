# @mmd-toolkit/flowchart-no-empty-description-block

英語版:
[flowchart-no-empty-description-block.md](./flowchart-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡 [エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions) を選んで適用できる。

<!-- end auto-generated rule notice -->

説明のブロックは、図に説明を与えるために書く。
ブロックが何も持たないか、空白だけを持つとき、 mermaid.js はそれを受理するが、
そこから説明を取らない。

## 規則の詳細

この規則は、何も持たないか空白だけを持つ、
閉じた `accDescr` のブロックを報告する。
対象の図種は `flowchart-v2`、`flowchart-elk`、`swimlane` である。
ブロックの中のディレクティブはテキストではない。
ディレクティブだけを持つブロックも報告し、
mermaid.js はその設定をそのまま適用する。

説明は、ブロックの前の値のままになる。
`accDescr: x` の後のブロック `accDescr { }` は説明を `x` のまま残し、
前に説明がなければ、説明は空のままである。
行で書いた空の説明は違う。
テキストを持つ行が後にない `accDescr:` は、説明を空のテキストにする。

コメントだけを持つブロックは報告しない。
説明の行をコメントにする書き手は、ブロックが何もしないことを意図しており、
mermaid.js もそう読む。
ブロックの前の説明が残る。
コメント行を持つブロックは、ほかにディレクティブを持っていても報告しない。
mermaid.js は、そのディレクティブの設定を適用する。
後で埋めるために残すブロックは、`accDescr {`、`%% TODO`、`}` のように、
中にコメントを書く。
そうしたブロックは報告しない。

空のブロックは、`A accDescr {}` のように同じ行の文の最後の部分の後や、
`flowchart LR accDescr {}` のようにヘッダーの後に置くこともできる。
そこでも説明を設定せず、規則は同じように報告する。

題のない subgraph の名前の後では、
空のブロックの周りの空白が名前の一部になることがある。
空白を持つ名前の subgraph は、名前でなく、
`subGraph0` のような自動で作った id になる。
名前そのものは空白を持たないのに、`subgraph S accDescr {}` のように、
こうして subgraph が自動で作った id になると、 `style S` や `S` へのリンクは、
その subgraph に届かなくなる。
名前とその行の終わりか `;` の間にある空のブロックには、
規則のメッセージがそのことを言う。

行の最初にあるブロックには、規則はブロックを消す書き換えを提案する。
後ろの空白も一緒に消し、行にほかに何もなければ行ごと消す。
後ろの `;` は残す。
ブロックは何も変えていなかったので、mermaid.js は図を前と同じに読む。
ディレクティブを持つブロックには、提案を出さない。
ブロックを消すと、mermaid.js が設定を適用するディレクティブも消えるからである。
行の中で何かの後にあるブロックには、提案を出さない。
ブロックの前の空白を消すと、前の文の読み方が変わるかどうかは、
その文によって決まるからである。
たとえば subgraph の名前の後では、その空白が名前の一部になりうる。
subgraph の本体の最初にあるブロックで、名前とブロックの間に U+2028、U+2029、
閉じていないディレクティブのどれかがあるときも、提案を出さない。
それらは改行を名前に取り込み、ブロックがなければ、
mermaid.js は後の行を名前の一部として読むことがあるからである。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {}
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr { }
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {
    %% c
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md)
- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/flowchart-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
