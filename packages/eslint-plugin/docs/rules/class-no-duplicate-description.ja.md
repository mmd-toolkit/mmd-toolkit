# @mmd-toolkit/class-no-duplicate-description

英語版: [class-no-duplicate-description.md](./class-no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
別の `accDescr` の文が説明を設定すると、
mermaid.js はエラーなしに前の説明を置き換え、前のものは失われる。

## 規則の詳細

この規則は、クラス図（`classDiagram`、`classDiagram-v2`）に当てる。
前の文が設定した説明を変える `accDescr` の文を報告する。
行の形と、テキストのあるブロックをまとめて比べる。

`accDescr:` の後にテキストがないと、空行、コメント行、ディレクティブを越えて、
テキストのある次の行を説明にする。

現在の説明の繰り返しは報告しないが、前の説明に戻す文は報告する。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は報告する。
両端と各改行の後の空白を除いて比べるので、ブロックの字下げと空行は数えず、LF、
CRLF、CR はどれも LF として比べる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accDescr: first
  accDescr: second
  class A
```

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accDescr {
first
  }
  accDescr: second
  class A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accTitle: x
  accDescr: y
```

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accDescr: first
  accDescr {
    first
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [class-no-duplicate-title](./class-no-duplicate-title.ja.md)
- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/class-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/class-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
