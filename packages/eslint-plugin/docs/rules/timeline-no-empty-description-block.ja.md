# @mmd-toolkit/timeline-no-empty-description-block

英語版:
[timeline-no-empty-description-block.md](./timeline-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

説明のブロックは、タイムラインに説明を与えるために書く。
ブロックが何も持たないか、空白しか持たないとき、
mermaid.js はそれを受理して何もしないので、ブロックは効果を持たない。

## 規則の詳細

この規則は、何も持たないか空白しか持たない `accDescr` のブロックを報告する。
対象の図種は `timeline` である。
ブロックの中の指令はテキストでない。
指令しか持たないブロックも報告し、mermaid.js はその設定をなお適用する。

説明は、ブロックの前のままである。
`accDescr: a` の後のブロック `accDescr {}` は、説明を `a` のままにする。

コメントしか持たないブロックは報告しない。
説明の行をコメントにした書き手は、ブロックが何もしないことを意図しており、
mermaid.js もそう読む。
コメント行を持つブロックは、ほかに指令を持つときも報告しない。
mermaid.js はその設定を適用する。
後で埋めるために残すブロックは、`accDescr {`、`%% TODO`、`}` のように、
中にコメントを書く。
そうしたブロックは報告しない。

空のブロックは、ほかの文の行にも書ける。
`timeline accDescr {} a` のようにヘッダーの後、
`accDescr {} 2020 : a` のように年の前、
年の後の `accDescr {} : b` のように出来事の前、
そして `accDescr {}accDescr {} a` のようにほかの空のブロックの隣である。
そこでも説明を設定せず、規則はどのブロックも同じように報告する。
タイトル、セクション、年、出来事のテキストの中では、
`accDescr {}` はそのテキストの一部であり、規則は報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/timeline-no-empty-description-block: error
timeline
  accDescr {}
  2020 : Launch
```

```mmd
%% eslint @mmd-toolkit/timeline-no-empty-description-block: error
timeline
  accDescr { }
  2020 : Launch
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/timeline-no-empty-description-block: error
timeline
  accDescr { y }
  2020 : Launch
```

```mmd
%% eslint @mmd-toolkit/timeline-no-empty-description-block: error
timeline
  accDescr {
    %% old description
  }
  2020 : Launch
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md)
- [timeline-no-duplicate-description](./timeline-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/timeline-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/timeline-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
