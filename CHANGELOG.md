# S2J Webinar Survey - CHANGELOG

## unreleased

## 0.0.1 - 2026-10-06

* 開発用の npm 依存と lint / Vite ビルド用スクリプトを整えた。`@s2j/docs-linter` v1.0.27とドキュメント lint の CI を含む。
* 開発依存を最新化した (Vite v8.3.3、stylelint v17.16、React v19.3、`@wordpress/*` 等)。
* 開発依存の `braces` v3.0.3 (GHSA-vfj7-8cjw-p6xm: 深くネストしたパターンで Node.js プロセスが終了する) と `@s2j/docs-linter` 経由の `sprintf-js` (GHSA-hp3w-g68c-fv3c) は修正版が未公開のため、npm audit の指摘は残す。配布物には含まれない。
