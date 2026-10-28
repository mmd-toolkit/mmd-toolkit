# @mmd-toolkit/quadrant-no-duplicate-description

英語版:
[quadrant-no-duplicate-description.md](./quadrant-no-duplicate-description.md)

チャートの説明をもう一度設定する文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

四象限チャートの説明は 1 つである。
mermaid.js は `accDescr` の文をすべて受理し、説明を設定するそれぞれの文が、
前に設定された説明を黙って置き換える。
2 つ目の説明は、たいてい、テキストを書き直した残りか、
一部を 2 度貼り付けた残りである。

## 規則の詳細

この規則は、説明を設定する文のうち、最初のもの以外を、
前と違う説明を設定するときに報告する。
対象の図種は `quadrantChart` である。

`accDescr:` とテキストのある説明のブロックは、どちらも説明を設定し、混ぜてよい。
`accDescr: a` と `accDescr { b }` の後、説明は `b` である。
キーワードは大文字小文字を問わず読む。
行にテキストのない `accDescr:` は、`accTitle:` と同じく、空行、コメント行、
指令を越えて、テキストを持つ次の行を取る。
説明を持たないブロックは数えない。
`accDescr: a` の後のブロック `accDescr {}` は、説明を `a` のままにし、
コメント行だけ、または指令だけを持つブロックも同じである。
空のブロックは [quadrant-no-empty-description-block](./quadrant-no-empty-description-block.ja.md) が報告する。

チャートがすでに持つ説明を設定する文は、どちらの形でも報告しない。
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
%% eslint @mmd-toolkit/quadrant-no-duplicate-description: error
quadrantChart
  accDescr: first
  accDescr {
    second
  }
  A: [0.3, 0.6]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-description: error
quadrantChart
  accDescr: first
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-description: error
quadrantChart
  accDescr: first
  accDescr {
    first
  }
  A: [0.3, 0.6]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-duplicate-title](./quadrant-no-duplicate-title.ja.md)
- [quadrant-no-empty-description-block](./quadrant-no-empty-description-block.ja.md)
- [xychart-no-duplicate-description](./xychart-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/quadrant-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
