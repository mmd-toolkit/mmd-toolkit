# @mmd-toolkit/xychart-no-duplicate-description

英語版:
[xychart-no-duplicate-description.md](./xychart-no-duplicate-description.md)

チャートの説明をもう一度設定する文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
別の `accDescr` の文が説明を設定すると、
mermaid.js はエラーなしに後の説明を使い、前の説明は失われる。

## 規則の詳細

この規則は、XY チャート（`xychart`、`xychart-beta`）に当てる。
現在の説明を別の値に置き換える `accDescr:` の文か説明のブロックを報告する。
現在の説明を繰り返す文は、2 つの形を混ぜても報告しない。

説明は、両端の空白と各改行の後の空白を除いて比べるので、
ブロックの字下げと空行は数えない。
LF、CRLF、CR の改行は、LF として比べる。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。

行にテキストのない `accDescr:` も説明を設定するので数える。
その文は、空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行を取り、テキストの終わりまでにそうした行がなければ、
空の説明を設定する。
説明を持たないブロックは数えない。
閉じていないブロックも数えず、
[xychart-no-unclosed-description-block](./xychart-no-unclosed-description-block.ja.md)
が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-description: error
xychart
  accDescr: first
  accDescr {
    second
  }
  line [1, 2]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-description: error
xychart
  accDescr: first
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-description: error
xychart
  accDescr: first
  accDescr {
    first
  }
  line [1, 2]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [timeline-no-duplicate-description](./timeline-no-duplicate-description.ja.md)
- [xychart-no-duplicate-title](./xychart-no-duplicate-title.ja.md)
- [xychart-no-empty-description-block](./xychart-no-empty-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/xychart-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/xychart-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
