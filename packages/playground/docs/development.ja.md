# Playgroundの開発

English version: [development.md](./development.md)

ブラウザーアプリケーションの開発者向け文書です。
使い方は[README](../README.ja.md)を、
ワークスペースの準備は
[リポジトリの開発ガイド](../../../CONTRIBUTING.ja.md)を参照してください。
このパッケージはprivateで、npmリリースとは独立しています。

## ローカルでの開発

リポジトリのルートで実行します。

```sh
pnpm install --frozen-lockfile
pnpm --filter @mmd-toolkit/playground dev
```

Viteがブラウザーを自動で開きます。
既定のアドレスは`http://localhost:5173/mmd-toolkit/playground/`です。
ポートが使用中なら別のポートを選びます。
hostの指定は不要です。
Node.jsの要件は[package.json](../package.json)に記録しています。

開発時も本番ビルド時も、パーサー、フォーマッター、TextMate文法の参照先は、
ワークスペースの公開ソースエントリーポイントです。
パーサーかフォーマッターの実装を変更するとホット更新され、
現在の入力を再解析します。
Formattedの表示中なら再整形もします。
ソースエディターとUndo履歴は維持されます。
ライブラリーの再ビルドや、別のwatchプロセスは不要です。

## ブラウザーでの実装

Vue 3.6 RCのVaporコンポーネント、Monaco Editor、Shikiを使い、
テーマスイッチには、
[shine-and-bright](https://github.com/ota-meshi/shine-and-bright)を使います。
MonacoはShikiを通じて、
[`@mmd-toolkit/textmate-grammar`](../../textmate-grammar/README.ja.md)の文法で
Mermaidのテキストをトークン化します。
この文法は`src/editor.ts`で、埋め込む`yaml`の文法とともに読み込みます。
VueのRC版を含む依存バージョンはロックファイルに記録し、
CIでは`--frozen-lockfile`でインストールします。
すべてのVue SFCは`<script setup lang="ts" vapor>`を使い、
ルートは`createVaporApp`でマウントします。

編集から150 ms後に解析します。
ASTの走査はパーサーの公開APIの`visitorKeys`を使い、 tokens、comments、
directives、frontmatterは補助レコードとして扱います。
ソース範囲はUTF-16オフセットの半開区間で、
パーサーの行番号ではなくMonacoのモデルで変換します。
配列は最初に100件を描画し、ソースから選択された項目の経路を含めて、
さらに表示できます。

Prettier standaloneとMermaid・YAMLプラグインは、
Formattedが選択されたときに読み込みます。
整形は入力と字下げの変更に追従し、古くなった結果は破棄します。
Applyは一度のUndoで戻せる編集で、改行をLFにします。

初回のテーマはシステム設定に従い、明示的な選択は現在のページで維持します。
動きを減らす設定では、テーマスイッチのアニメーションを無効にします。

## URLの状態

入力と`tabWidth`・`useTabs`を、編集が500 ms止まると、
版付きの`#v1=`ハッシュに保存します。
`history.replaceState`で、履歴を増やさずURLを更新します。
Shareで現在のリンクを表示し、別のCopy Linkの操作からコピーします。

JSONをUTF-8にし、ブラウザーのCompression Streams APIでgzip圧縮して、
パディングなしのbase64urlに変換します。
JSONにすることで、片側だけのUTF-16サロゲートも保持します。
ハッシュはブラウザー内に留まり、共有サーバーやlocal storageは使いません。
外観、ツリーの選択、計算結果は含めません。
共有入力は、公開中のアプリケーションの現在の実装で解析・整形します。
Monacoが入力時に改行を正規化することがあるため、
共有と解析には現在のモデルのテキストを使います。

入力、展開後JSON、URLハッシュにはアプリケーションのサイズ上限を設けず、
切り詰めません。
壊れた・未知の版のハッシュは、現在の入力を置き換えません。
新しい編集や移動に追い越された非同期の復元や整形の結果は破棄します。

## 検証

```sh
pnpm --filter @mmd-toolkit/playground typecheck
pnpm --filter @mmd-toolkit/playground test
pnpm --filter @mmd-toolkit/playground build
pnpm --filter @mmd-toolkit/playground exec playwright install chromium firefox webkit
pnpm --filter @mmd-toolkit/playground test:e2e
```

単体テストでURLの変換、大きな共有入力、AST範囲の選択を確認します。
PlaywrightでPagesのサブパス上の本番ビルドを、 Chromium、Firefox、
WebKitで操作します。
HMRのテストはパーサーとフォーマッターの隔離したコピーを編集し、
作業中のライブラリーファイルを変更しません。

## GitHub Pages

公開先は
[Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/)です。
Viteのbaseは`/mmd-toolkit/playground/`で、エディターワーカー、 ShikiのWASM、
遅延読み込みする整形資産もこのパスに従います。
ビルドの出力先は`lib/`です。

```sh
pnpm --filter @mmd-toolkit/playground build
pnpm --filter @mmd-toolkit/playground preview
```

Previewは、本番ビルドをブラウザーで自動表示します。

[pages.yml](../../../.github/workflows/pages.yml)は、 PRを検証し、
mainの変更と手動実行でビルドします。
ドキュメントとPlaygroundのビルドジョブは独立して実行します。
mainではドキュメントを成果物のルートに、
このアプリケーションの`lib/`を`playground/`にまとめて配置し、
`github-pages`環境から公開します。
リポジトリのPages sourceは**GitHub Actions**にしておきます。
ワークフローはリポジトリの設定を変更しません。
公開するのはmainだけで、新しい公開は実行中の公開を中断します。
