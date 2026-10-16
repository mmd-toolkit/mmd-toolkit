# tools

英語版: [README.md](./README.md)

`@mmd-toolkit/tests` の fixture を保守する人のための、コマンドラインの道具です。
fixture の作り直し、追加と印付け、mermaid.js からの入力の収集を行います。
`packages/tests` のパッケージスクリプトから実行します。
コマンドと規則は
[maintaining-fixtures.ja.md](../packages/tests/docs/maintaining-fixtures.ja.md)
にあります。

| ファイル      | スクリプト                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `fixtures.ts` | `fixtures:generate`、`fixtures:check`、`fixtures:add`、`fixtures:add-many`、`fixtures:set-divergence`、`fixtures:set-note` |
| `collect.ts`  | `fixtures:collect`                                                                                                         |

## mermaid から図種の入力を集める

`collect.ts` は、1 つの図種について、
mermaid のチェックアウトのテストファイル、文書、デモのページを読みます。
何を取るかは
[maintaining-fixtures.ja.md](../packages/tests/docs/maintaining-fixtures.ja.md)
の「mermaid から取った入力」にあります。
図種を足すときと、mermaid を上げた後に、
新しい版が持ち込む入力を足すために行います。

テストファイルのうち読むのは、
その図種自身のファイルのうち、図のテキストを mermaid に渡すものだけです。
`collect.ts` の `SPEC_FILES` に、除いたファイルの理由とともに挙げてあります。
mermaid のほかのテストファイル、例えば `mermaid.spec.ts`、`mermaidAPI.spec.ts`、
`diagram.spec.ts`、`rendering-util` の下のテスト、
端から端までのテストにあるテキストは集めません。
入力は、その図種自身のテストファイル、文書、デモから取ります。

1. mermaid を、`.gitignore` に入っている `.work/mermaid` に、
   pin した版のタグで clone します。
   タグの名前は、`mermaid@` の後に、
   `packages/tests/package.json` の devDependency `mermaid` の版を続けます。

   ```sh
   git clone --depth 1 --branch mermaid@12.0.0 https://github.com/mermaid-js/mermaid.git .work/mermaid
   ```

   収集の道具は、チェックアウトがそのタグにあることを確かめます。
   チェックアウトに何かを導入する必要はありません。
   テストファイルはスタブに対して動くので、
   チェックアウトのコードはテストファイル自身のほかには読み込まれず、
   mermaid の検出は `packages/tests` の pin した mermaid で行います。

2. 集めて、結果をリポジトリの外に書きます（ここでは `sequence`）。

   ```sh
   pnpm --filter @mmd-toolkit/tests run fixtures:collect sequence --mermaid .work/mermaid --out /tmp/sequence.json
   ```

   テストファイルごとに、実行したテストの数、記録した入力の数、
   エラーで終わったテストの数を報告し、そのあと、見つけた入力の数、
   新しい入力の数、すでに fixture にあるか繰り返しとして除いた数を報告します。
   次のときは、何も書かずに実行を止めます。

   - エラーで終わったテストがある
     （本体、フック、`expect` に渡した promise のどれか）。
     parse の呼び出しの前で止まった可能性があり、
     入力が跡を残さずに欠けるためです。
     記録器のスタブ（`src/spec-recorder.ts`）は、
     文字列に変換されること以外のどんな使い方も受け付けます。
     文字列にされるとスタブが記録するテキストに入り込むので、
     それだけは例外にしています。
     そのため、上流のテストがそれ以上のものを必要とすると、ここで見えます。
     一覧に出たテストが使うものをスタブで扱えるようにしてから、
     集め直してください。
   - 記録したテキストが `NaN` を含む。
     スタブの算術は `NaN` になるので、スタブが作った可能性がある。
   - 記録器にスタブのないモジュールを import するテストファイルがある。
   - 名前がぶつかる、異なる 2 つの入力がある。

3. 新しい入力を、まず書かずに試してから足します。

   ```sh
   pnpm --filter @mmd-toolkit/tests run fixtures:add-many sequence /tmp/sequence.json --dry-run
   pnpm --filter @mmd-toolkit/tests run fixtures:add-many sequence /tmp/sequence.json
   ```

4. mermaid が拒否する入力を確かめます
   （`add-many` がエラーとともに一覧に出します）。
   仕様は埋め込まれたデータを読まないので（既知の差異 `embedded-data-opaque`）、
   mermaid がそれだけを理由に拒否する入力は、仕様では受理されます。
   `@{ ... }` のデータブロックの中の未知の shape や壊れた YAML、
   壊れたフロントマターの YAML、
   mermaid が扱えないディレクティブの中身がそれに当たります。
   そのような fixture には印を付けます。

   ```sh
   pnpm --filter @mmd-toolkit/tests run fixtures:set-divergence divergences.json
   ```

   ファイルの中身は `{ "sequence/<name>": "embedded-data-opaque" }` です。
   見落としは、parser の受理・拒否の照合が報告します。

5. fixture が安定していることを確かめます。
   `fixtures:generate` を 2 回実行して 2 回目が `0 changed` になること、
   `fixtures:check` が通ることです。

名前は入力と最初に見つかったファイルだけで決まるので、
既存の fixture の名前は変わりません。
mermaid からなくなった入力も、誰かが手で消すまで fixture として残ります。
