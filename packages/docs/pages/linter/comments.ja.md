# 設定コメント

Mermaidの`%%`コメントで、図の中からESLintのルールを設定できます。
まず[設定ファイル](./configuration.ja.md)でプラグインとMermaid言語を登録します。
コメントはルールを選びますが、プラグインや言語の登録は行いません。

Markdownでは、コメントは1つのMermaidコードブロックに適用します。
同じファイル内の他のブロックの設定は変えません。

## ルールを設定する

`%% eslint`の後に、完全なルールIDを指定します。

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  style C fill:red
```

設定ファイルで有効になっていなくても、
この図全体で`@mmd-toolkit/flowchart-no-undef`をエラーとして有効にします。
この例では`C`を報告します。
コメントより前の部分を含め、図全体にこの設定が適用されます。
警告にするには`warn`、無効にするには`off`を指定します。

共通ルールのIDは`@mmd-toolkit/no-unclosed-directive`など、
図種ごとのルールは`@mmd-toolkit/flowchart-no-undef`などです。
名前は、
[ルール一覧](../../../eslint-plugin/docs/rules/index.ja.md)で確認できます。

## 次の行の報告を抑制する

1つの文の報告を抑制するには、`eslint-disable-next-line`を使います。
`--`の後に理由を記載できます。

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  %% eslint-disable-next-line @mmd-toolkit/flowchart-no-undef -- C is intentionally created here.
  style C fill:red
  style D fill:blue
```

このコメントは、次の行の`C`への報告を抑制します。
`D`への報告は残ります。
報告を抑制しても、Mermaidによる図の読み取り方は変わりません。

`eslint-disable-next-line`は、直後の物理的な1行に作用します。
空行や別のコメントが続く場合、その後の文には届きません。

## 範囲の報告を抑制する

範囲を`eslint-disable`と`eslint-enable`で囲みます。

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  %% eslint-disable @mmd-toolkit/flowchart-no-undef -- C is intentionally created here.
  style C fill:red
  %% eslint-enable @mmd-toolkit/flowchart-no-undef
  style D fill:blue
```

指定したルールの報告を、
`eslint-disable`から対応する`eslint-enable`まで抑制します。
有効化コメントがなければ、図の終わりまで抑制します。
この例では`D`だけを報告します。
`eslint-enable`は、抑制したルールを元に戻します。
もともと無効なルールをエラーとして有効にする設定ではありません。

複数のルールIDは、カンマで区切ります。
`eslint-disable`・`eslint-enable`でIDを省略すると、全ルールを対象にします。

## コメントを置く場所

設定コメントは独立した`%%`の行に置きます。
図全体を設定する`%% eslint`は、例のようにヘッダーより前に書けます。
報告を抑制するコメントは、対象の行や範囲に合わせて置きます。

実際のMermaidコメントとして解析される必要があります。
ラベル、説明、引用文字列の中のテキストは、ESLintの設定コメントではありません。

Markdown内の図では、Mermaidコードブロックの中にコメントを書きます。
ブロックの外の`<!-- eslint @mmd-toolkit/flowchart-no-undef: error -->`などの HTMLコメントは、
Mermaidの設定コメントとしては機能しません。

`%% eslint-disable-line`は、同じ物理行の報告を抑制します。
独立したコメント行に書くと、次の文には作用しません。
次の行を抑制するには、`eslint-disable-next-line`を使います。

`%% eslint`の設定を読み取れない場合、
ESLintはそのコメントで設定のエラーを報告します。
例えば、次の設定は不完全です。

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: [
flowchart LR
  A --> B
```

ルールの設定として使う前に、設定の構文を修正してください。
