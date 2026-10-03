# mmd/class/no-inline-comment

英語版: [no-inline-comment.md](./no-inline-comment.md)

規則 [mmd/class/no-inline-comment](../../rules/class/no-inline-comment.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`Root.comments` のコメントのうち、
同じ行の前にトークンがあり（ヘッダーのキーワードも含む）、
テキストの後ろにもトークンがあるもの。
どちらも `Directive` のトークンは数えない。
同じ行にあるかどうかは、トークンとコメントの `loc` から読む。

ディレクティブは、`Root.tokens` の中の種類 `Directive` のトークンであり、
mermaid.js はコメントを読む前にディレクティブを取り除く。
`%%{init: {}}%% %% c` のように、ディレクティブの後にあるコメントだけの行は、
mermaid.js ではコメント行であり、
テキストの最後でディレクティブだけの行が後に続くコメントは、何もつながない。
どちらも報告しない。
コメントと次の文の間の行の始めにディレクティブがあっても、
コメントはその文の前の改行を取り込み、その文が後ろのトークンになる。
ディレクティブの前に空白があると、その空白が空白だけの行として残り、
mermaid.js で次の行を別に読ませる。
これは次の段落の場合で、規則はこれも報告する。

コメントの後の空白だけの行は、条件の例外にしない。
その行は、後にコメント行がないときだけ、
mermaid.js で次の行を別に読ませる（規則の文書を参照）。
それに従うには、mermaid.js がコメント行を取り除き、
改行を読む手順を繰り返し、
コメントから次のトークンまでのソースのテキストを読むことになる。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `class/div-comment-joins-member`
- `class/div-comment-joins-lines`
- `class/div-comment-then-statement`
- `class/div-comment-on-header-line`
- `class/lex-comment-on-last-line`
- `class/lex-comment-blank-line-after`
- `class/lex-comment-own-line`
- `class/div-comment-then-comment-only-line`
- `class/div-comment-then-spaces-line-then-comment-line`
- `class/lex-comment-then-spaces-line-then-bare-comment`
- `class/lex-comment-line-then-spaces-line`
- `class/lex-directive-then-comment-line`
- `class/lex-comment-then-directive-at-end`
- `class/div-comment-then-directive-line`
- `class/lex-comment-then-indented-directive-line`
