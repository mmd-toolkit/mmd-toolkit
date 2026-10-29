# ドキュメントサイト

この非公開パッケージは、
[mmd-toolkitのドキュメントサイト](https://mmd-toolkit.github.io/mmd-toolkit/)を
VitePressで構築します。

```sh
pnpm --filter @mmd-toolkit/parser --filter @mmd-toolkit/eslint-plugin build
pnpm --filter @mmd-toolkit/docs dev
pnpm --filter @mmd-toolkit/docs build
pnpm --filter @mmd-toolkit/docs preview
pnpm --filter @mmd-toolkit/docs test
```

サイトやテストを実行する前に、パーサーとリンターをビルドします。
診断マーカーは、
ページの表示内容を生成するときにワークスペースのリンターを実行します。
これらのパッケージの実装を変更した後も、再ビルドしてください。

`%% eslint @mmd-toolkit/`を含む`mmd`コードブロックには、
`twoslash-eslint`で実際のESLintの診断を生成し、ホバーで表示します。
`mmd`の図の例に対応しています。
例で示すルールは、`%% eslint <rule>: <config>`コメントで有効にします。
表示用の設定はMermaid言語を登録しますが、既定ではルールを有効にしません。
それ以外のコードブロックには、通常の構文ハイライトだけを適用します。

`packages/eslint-plugin/docs/rules/` では、英日とも、
すべての `mmd` の例を `%% eslint @mmd-toolkit/<規則>: error` で始めます。
そのページが説明する規則を指定し、字下げせず、
図のヘッダーや Mermaid のディレクティブより前に置きます。
反する例だけでなく、従う例にも必要です。
リンターパッケージの `check:docs` がこの要件を検査します。
例をテストでも使う仕組みは、
[開発ガイド](../eslint-plugin/docs/development.ja.md#規則と文書)
に記載しています。

フォーマッターの互換性を含め、サイトのガイドは `pages/` で編集します。
取り込むルール文書は `packages/eslint-plugin/docs/rules/` で編集します。
英語と日本語の両方を取り込みます。
仕様の詳しい差異の説明、整形規則と互換性の説明、
構文・AST・トークン・位置の定義、エラー位置の規則、開発の手順はGitHubで参照し、
サイトにはツールの使い方を掲載します。

図種は `packages/spec/docs/diagrams/` の英語版ファイルから集めます。
リンターのルールを図種ごとに分類し、
サイドバーの表示名には仕様文書の各言語の見出しを使います。
新しい図種を追加しても、サイト設定への項目の追加は不要です。
表示順は、
Mermaidの
[`sidebarSyntax()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/.vitepress/config.ts#L160-L207)
に合わせ、 `.vitepress/documents.js`に定義しています。
順序をまだ定義していない図種も、末尾にファイル名順で表示します。

リンターのルールのサイドバーは、言語ごとの取り込み済み文書から生成します。
共通ルールを先頭に置き、図種は上記のMermaidの順序で並べます。
各グループのルールは名前順です。
まだ順序のない図種は、既知の図種の後に名前順で表示します。

原本とページの対応は `.vitepress/documents.js` に定義しています。
起動時とビルド時に、文書を `lib/pages/` へコピーします。
このディレクトリはGitの管理対象外です。
取り込み文書のコピーでは、冒頭の英日案内を除きます。
取り込み文書の原本は変更しません。
対応する言語のページへは、ヘッダーの言語メニューで切り替えます。
開発中は原本を監視し、変更、追加、削除されたページを更新します。
生成されたコピーは編集しないでください。
ビルドの出力先は `lib/site/` です。

図種、表示名、ルール文書の追加・削除があれば、
VitePressの設定も再読み込みしてナビゲーションを更新します。
本文だけの編集には、通常のページのホット更新を使います。

表示時には、取り込み対象の文書へのリンクをサイト内のリンクに変換します。
それ以外のリポジトリ内のリンクとフィクスチャー参照はGitHubに向けます。
各ページの原文へのリンクは、元の文書に向けます。
