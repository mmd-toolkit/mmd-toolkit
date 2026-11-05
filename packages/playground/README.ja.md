# mmd-toolkit Playground

English version: [README.md](./README.md)

ブラウザーでMermaidのテキストを編集し、 mmd-toolkitが生成する構文木と、
Prettierによる整形結果を確認できます。

公開URL: [Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/)。

画面は英語で、デスクトップブラウザーを対象にしています。

## 使い始める

**Examples**で図種のサブメニューを開いてサンプルを選ぶか、
**Source**にMermaidのテキストを貼り付けます。
サンプルのデータは、
[Mermaid Live Editor](https://mermaid.ai/live/edit)と同じです。

編集すると、パーサーの結果が自動で更新されます。
**AST**と**Formatted**のタブを切り替えても、Sourceは編集できます。

右上のテーマボタンで、ライトテーマとダークテーマを切り替えられます。

## 構文木を調べる

**AST**タブではTreeとJSONの表示に加えて、 Tokens、Comments、Directives、
Frontmatterを個別に確認できます。

- ツリーの行をクリックすると、その行を選択し、子の展開と縮小を切り替えます。
  矢印では選択を変えずに展開と縮小を切り替えられます。
- ノードやレコードを選ぶと、Sourceの対応範囲が強調表示され、詳細を確認できます。
- Sourceのカーソルを動かすと、対応するノードやレコードが選択されます。
  ツリーはその経路を展開し、選択行までスクロールします。
- 長いリストの続きは、**Show more**で表示できます。

## 整形結果を確認する

**Formatted**を選ぶと、Prettierによる整形結果を表示します。
Sourceの編集や、**Indent**・**Use tabs**の変更に合わせて更新されます。

**Apply to source**で、整形結果をSourceに適用します。
改行はLFになります。
エディターの通常のUndoで戻せます。
サンプルの読み込みもUndoできます。

## 構文の色付け

Sourceの色は、エディターのトークナイザーであるShikiが、
[`@mmd-toolkit/textmate-grammar`](../textmate-grammar/README.ja.md)の
TextMate文法で付けます。
この文法は、このリポジトリの仕様から全図種について書いたものです。
色は文法だけで決まり、パーサーには依存しないので、
パーサーが拒否するテキストも編集中に色を保ちます。

## 入力を共有する

**Share**を選び、**Copy Link**でコピーするか、
表示されたURLを手動でコピーします。
リンクには入力と字下げ設定が含まれます。
パーサーが拒否する入力も共有できます。

編集するとアドレスバーのURLも自動で更新されます。
再読み込みやURLを開く操作で、保存された入力と字下げ設定を復元できます。

## 関連文書

- [パーサー](../parser/README.ja.md): 対応構文、ASTのフィールド、互換性。
- [フォーマッター](../prettier-plugin-mmd/README.ja.md): 整形の動作と設定。
- [開発](./docs/development.ja.md): ローカルでの起動、実装の説明、
  検証とGitHub Pagesへの公開。
