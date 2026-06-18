# GitHub Pages公開手順

## 目的

App Store / Google Playに入力する以下のURLを、GitHub Pagesで公開します。

- プライバシーポリシー: `privacy.html`
- 利用規約: `terms.html`
- サポートURL: `support.html`

## 手順

1. GitHubで公開または非公開リポジトリを作成します。
2. このプロジェクトをGitHubへpushします。
3. リポジトリの `Settings` -> `Features` でIssuesを有効にします。
4. GitHubのリポジトリ画面で `Settings` -> `Pages` を開きます。
5. `Build and deployment` のSourceを `Deploy from a branch` にします。
6. Branchを `main`、Folderを `/docs` にして保存します。
7. 数分後、`https://<ユーザー名>.github.io/<リポジトリ名>/` が公開されます。

## ストアへ入力するURL

リポジトリ名が `mamoru-tana` の場合の例です。

- Privacy Policy URL: `https://<ユーザー名>.github.io/mamoru-tana/privacy.html`
- Terms URL: `https://<ユーザー名>.github.io/mamoru-tana/terms.html`
- Support URL: `https://<ユーザー名>.github.io/mamoru-tana/support.html`

## 注意

- GitHub PagesのURLはHTTPSです。
- `github.com/<user>/<repo>/blob/...` ではなく、`github.io` の公開ページURLを使ってください。
- サポートページはGitHub Pages上で開かれると、`https://github.com/<user>/<repo>/issues` へのリンクを自動設定します。
- App Storeで住所、電話番号、メールアドレスなどが必要になった場合は、サポートページへ追記してください。
