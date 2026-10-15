# テスト戦略と結果記録

本プラグインの検証方針と実行記録です。環境の役割 (Local / Studio / PHPUnit) の共通定義は [wp-plugin-spec: SMOKE_AND_WP_ENVIRONMENTS.md](https://github.com/stein2nd/wp-plugin-spec/blob/main/docs/SMOKE_AND_WP_ENVIRONMENTS.md) を正とし、本ファイルは **このプラグイン固有の手順と結果** です。

## 段階的な導入 (3段階)

| 段階 | 目的 | 主なツール | 本リポジトリ |
| --- | --- | --- | --- |
| **1** | WordPress 上で最低限動くこと (結合スモーク) | Local、Site Shell、WP-CLI | `tests/smoke-local.sh` / `npm run test:smoke:local` |
| **2** | テストサイト構成の再現 (GatherPress 同梱) | WordPress Studio、Blueprints | [`studio/smoke-test-blueprint.json`](../studio/smoke-test-blueprint.json) |
| **3** | PHP 自動テスト、PR 時のゲート | PHPUnit、GitHub Actions | `composer test` (純 PHPUnit。wp-env 統合は拡張予定) |

段階1・2は実 WordPress、段階3の現状は **WordPress を起動しない** ユニットテストです。

**依存:** 段階1・2では **[GatherPress](https://wordpress.org/plugins/gatherpress/)** と **gatherpress-alpha** の有効化が必要です。

---

## Local 可 / 要 HTTPS (外部結合)

[status.md §外部結合ゲート](./status.md#status-external) と同型です。

| # | 内容 | Local 可 / 要 HTTPS |
| --- | --- | --- |
| E1 | コネクタ設定 (API キー保存) | **Local 可** (保存のみ) |
| E2 | コネクタ API — 実 LLM / 外部 draft | **項目依存** (モック Local 可) |
| E3 | Survey `ready` → Webinar `attach_survey` | **要 HTTPS** (Webinar E4 後) |
| E4 | Zoom 上アンケート添付 | **要 HTTPS** |

段階1–2では **draft REST・コネクタ実呼び出しは省略可**。表示専用 `evaluate` とメタ REST は Local / Studio で検証します。

---

## 第1段階: Local (結合スモーク)

| # | 確認項目 | 期待 |
| --- | --- | --- |
| 1 | `composer install` + `npm run build:production` | `vendor/` と `dist/js/s2j-webinar-survey-gutenberg.js` |
| 2 | GatherPress + alpha 有効化 | エラーなく有効 |
| 3 | 本プラグイン有効化 | `s2j/webinar-survey-service` 同梱 |
| 4 | **設定 > Survey questions** | 設問上限 1–15 を保存 |
| 5 | イベント編集 (ブロック) | Document Settings に Survey パネル |
| 6 | REST `POST /wp-json/s2j-webinar-survey/v1/evaluate` | 200 + deficiencies / advice コード列 |

**自動:**

```bash
cd wp-content/plugins/s2j-webinar-survey
export WP_PATH="/path/to/site/app/public"
npm run test:smoke:local
```

---

## 第2段階: WordPress Studio

1. [`studio/smoke-test-blueprint.json`](../studio/smoke-test-blueprint.json) でサイト作成。
2. ビルド済みプラグインを配置して有効化。
3. 段階1チェックリスト + `npm run test:smoke:local`。

詳細: [studio/README.md](../studio/README.md)

---

## 第3段階: PHPUnit

### 3a. 純 PHPUnit (現状・CI)

```bash
composer test
# または
npm run test:unit:php:local
```

`MaxQuestions`  coercion、`MetaRegistrar` sanitize、`ServiceBridge` + Packagist Service を検証します。

### 3b. wp-env 統合 (予定)

メタ REST 往復、`save_post` 正規化は wp-env 拡張時に `tests/Integration` へ追加予定です。

---

## 最新結果

| 日付 | 環境 | 段階 | 結果 | メモ |
| --- | --- | --- | --- | --- |
| — | — | — | — | 初回記録待ち |
