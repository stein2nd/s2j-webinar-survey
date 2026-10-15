# WordPress Studio (第2段階テスト環境)

本ディレクトリは **WordPress Studio の Blueprint** で検証用サイトを再現するための置き場です。日常開発は Local (段階1)、PHP 自動テストは PHPUnit (段階3) です。

## ファイル

| ファイル | 内容 |
| --- | --- |
| `smoke-test-blueprint.json` | GatherPress + gatherpress-alpha、Query Monitor、Plugin Check、シード用 mu-plugin |
| `mu-plugin-smoke-seed.php` | Blueprint `writeFile` と同期する **ソース** (リポジトリに追加する場合は JSON と同内容を維持) |

## 手順

1. Studio → **Add site** → **Upload a Blueprint** → `smoke-test-blueprint.json`。
2. `npm run dist:build` 済み (または `composer install --no-dev` + `npm run build:production`) の本プラグインを `wp-content/plugins/s2j-webinar-survey` に配置 (symlink 推奨)。
3. `wp plugin activate s2j-webinar-survey`。
4. 管理画面を一度開く (mu-plugin が下書きイベント1件を追加)。
5. GatherPress **イベント** 編集で Document Settings に **Survey questions** パネルが出ることを確認。
6. リポジトリルートで `WP_PATH='<WordPress ルート>' npm run test:smoke:local`。
7. 結果を [docs/test-results.md](../docs/test-results.md) に記録。

S2J Webinar 用 Blueprint だけを流用する場合、GatherPress 部分は同型ですが **本プラグインは wp.org 未公開のため手動配置が必須** です。
