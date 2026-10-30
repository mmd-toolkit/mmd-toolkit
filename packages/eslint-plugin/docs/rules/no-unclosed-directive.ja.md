# @mmd-toolkit/no-unclosed-directive

英語版: [no-unclosed-directive.md](./no-unclosed-directive.md)

閉じる `}%%` がなく、後の行を取るディレクティブを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ディレクティブは、`%%{` から閉じる `}%%` まで続く。
閉じる `}%%` がないと、
mermaid.js は後の行をエラーなしにディレクティブに読み込むことがあり、
その行の文は図から消える。

## 規則の詳細

この規則は、すべての図種に当てる。
`%%{` より後の行のテキストを持つディレクティブを報告する。
ただし、名前と、引数の先頭の JSON オブジェクトや配列は除く。
そうしたディレクティブは、`}%%` がないときも、後のディレクティブのものなど、
後に書いた `}%%` が閉じるときも報告する。

複数行の JSON オブジェクトや配列は報告しない。
オブジェクトが閉じなければ、ディレクティブの残りはその一部で、報告しない。
括弧と引用符は mermaid.js が読むとおりに数え、`'` も `"` も文字列を閉じる。
テキストの終わりで文を取り込まないディレクティブは、`}%%` がなくても報告しない。
行の終わりの `%%{wrap` は次の行の最初の語を引数に取り、その語は消える。
この規則はそれを報告する。

ディレクティブがヘッダーを取り込む場合など、
ディレクティブが取り込むものを除いたテキストが正しい図でなければ、
mermaid.js がエラーを出すので、この規則は報告しない。

例は flowchart である。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
flowchart LR
  A --> B
  %%{init: {"theme": "dark"}}
  C --> D
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
flowchart LR
  A --> B
  %%{init: {"theme": "dark"}}%%
  C --> D
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-invalid-init-directive](./no-invalid-init-directive.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/no-unclosed-directive.ts)
- [テストのソース](../../tests/rules/no-unclosed-directive.test.ts)

<!-- end auto-generated rule resources -->
