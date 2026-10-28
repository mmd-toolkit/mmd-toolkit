# @mmd-toolkit/no-unclosed-directive

英語版: [no-unclosed-directive.md](./no-unclosed-directive.md)

閉じる `}%%` がなく、後の行を取るディレクティブを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ディレクティブは `%%{` からその `}%%` まで続く。
`%%{init: {"theme": "dark"}}%%` の `{` のように、
語の文字でない文字で引数が始まるディレクティブは、
その後の最初の `}%%` まで続く。
自分の `}%%` がないと、後に書いた `}%%`、テキストの終わり、
最初の U+2028 か U+2029 まで続き、
mermaid.js はそこまでの行をエラーなしにディレクティブに読み込む。
その行の文は図から消える。

## 規則の詳細

この規則は、その `%%{` より後の行の文字を持つディレクティブを報告する。
ただし、名前と、引数が始まる JSON のオブジェクトか配列は除く。
対象はすべての図種である。

`A --> B` の後で、最後の `%%` のない `%%{init: {"theme": "dark"}}` と
`C --> D` の行は、`A` から `B` へのリンクだけの flowchart を与える。
`C --> D` はディレクティブの中にある。
後に書いた `}%%` はディレクティブを閉じる。
`C --> D` の後に `%%{wrap}%%` があると、
最初のディレクティブは 2 つ目のディレクティブの `}%%` まで続き、
`C --> D` と `wrap` のディレクティブの両方が消える。
この規則は、`}%%` がない場合も、後の `}%%` に閉じられた場合も、
そのディレクティブを報告する。

語の文字で引数が始まるディレクティブはその語を引数として取り、
語の前の空白は改行をまたぐ。
行の終わりの `%%{wrap` は次の行の最初の語を取り、その語は消える。
この規則はそれを報告する。

引数の JSON のオブジェクトや配列は、複数の行にわたってよい。
それは最初の括弧を閉じる括弧で終わり、それが覆う行は報告しない。
閉じないオブジェクトはディレクティブの残りを覆う。
そのため、テキストの終わりにあるディレクティブは、`}%%` がなくても文を取らず、
報告しない。
最後の行の、`}%%` のない `%%{init: {"theme": "dark"}` も
テーマを設定する。
U+2028 や U+2029 は `}%%` のないディレクティブを終え、
その後の文字は書いたとおりに読まれる。

残りが正しい図でないと、mermaid.js はテキストを受理せず、
この規則はそれを見ない。
ヘッダーの前で `}%%` のないままのディレクティブはヘッダーを取る。
ディレクティブが取った文字が init のディレクティブの JSON を壊すと、
[no-invalid-init-directive](./no-invalid-init-directive.ja.md)
もそれを報告する。

ディレクティブを `}%%` で閉じる。

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

## 背景

[ディレクティブのパターン](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/regexes.ts#L9-L10)
は、語の引数か、最初の `}%%`、U+2028、U+2029、テキストの終わりまでの
自由な文字の引数を取り、
[`removeDirectives`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L200-L202)
は、図を読む前に、それが合うものを取り除く。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/no-unclosed-directive.ts)
- [テストのソース](../../tests/rules/no-unclosed-directive.test.ts)

<!-- end auto-generated rule resources -->
