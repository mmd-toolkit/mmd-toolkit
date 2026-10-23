# @mmd-toolkit/no-invalid-init-directive

英語版: [no-invalid-init-directive.md](./no-invalid-init-directive.md)

規則
[@mmd-toolkit/no-invalid-init-directive](../rules/no-invalid-init-directive.ja.md)
を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`Root.directives` のディレクティブで、次のどちらかのもの。

- `'` をすべて `"` として読んでも、
  引数が正しい JSON でない init ディレクティブ。
  木は引数を解析しない。
  ディレクティブの `value` は `%%{` と `}%%` の間のテキストで、名前を含む。
  規則は、仕様の common.md（Where a directive is）の規則で、
  そこから引数を取り出し、JSON として解析する。
- init ディレクティブでなく、`name` が、
  大文字と小文字を区別しなければ `init` か `initialize` で終わるもの。

この規則は、パーサーが書かれたまま持ち、
読まない埋め込みデータを読む（仕様の既知の差異の
[`embedded-data-opaque`](../../../spec/docs/known-divergences/embedded-data-opaque.ja.md)
）。
図の字句解析のやり直しではないが、パーサーが行わない 2 つの手順、
つまりディレクティブから引数を取り出すことと、それを JSON として解析することを、
規則の側で繰り返す。
また、mermaid.js は、図を設定するディレクティブを独自の走査で見つけ、
それは、まれな場合に `Root.directives` と違う
（common.md の The configuration scan）。
`%%}%%` で始まる行にあるディレクティブは何も設定しないが、
`Root.directives` には入る。
規則は `Root.directives` に従う。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `common/config-init-trailing-comma`
- `common/config-init-name-uppercase`
- `common/config-init-name-capitalized`
- `flowchart/config-inherit-dir-directive`
- `common/directive-bad-json`
- `common/config-bad-json-drops-other-inits`
- `common/directive-single-quotes`
- `common/config-closing-marker-line`
- `sequence/config-init-trailing-comma`
- `sequence/docs-config-directives-a481990f`
- `class/config-init-trailing-comma`
- `state/config-init-trailing-comma`
- `common/directive-init-theme`

図種ごとの現れ方の項目は、次の fixture に依る。

- flowchart: `flowchart/config-inherit-dir-directive`。
- sequence: `sequence/config-init-trailing-comma` では、
  参加者とメッセージが折り返されない。
  カンマのない `sequence/docs-config-directives-a481990f` では、折り返される。
- class と state: `class/config-init-trailing-comma` と
  `state/config-init-trailing-comma` は、効いた設定がないこと
  （`embedded` が null）を記録している。
  効くディレクティブの theme は、`common/directive-init-theme` が記録している。
