# S2J Webinar Survey - テスト戦略と結果記録

本プラグインの検証方針と実行記録です。環境の役割 (Local / Studio / PHPUnit) の共通定義は [wp-plugin-spec: SMOKE_AND_WP_ENVIRONMENTS.md](https://github.com/stein2nd/wp-plugin-spec/blob/main/docs/SMOKE_AND_WP_ENVIRONMENTS.md) を正とし、本ファイルは **このプラグイン固有の手順と結果** です。

## 段階的な導入 (3段階)

| 段階 | 目的 | 主なツール | 本リポジトリ |
| --- | --- | --- | --- |
| **1** | WordPress 上で最低限動くこと (結合スモーク) | Local、Site Shell、WP-CLI | `tests/smoke-local.sh` / `npm run test:smoke:local` |
| **2** | テストサイト構成の再現 (GatherPress 同梱) | WordPress Studio、Blueprints | [`studio/smoke-test-blueprint.json`](../studio/smoke-test-blueprint.json) |
| **3** | PHP 自動テスト、PR 時のゲート | PHPUnit、GitHub Actions | `npm run test:unit:php:unit-only` (CI) / `npm run test:unit:php:local` (MySQL + 初回 svn) |

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

**Gutenberg 翻訳 (段階1):** `npm run build:production` → `npm run makei18n` (または PO 更新後 `makejson`) → イベント編集画面でスーパーリロード。JSON ファイル名の `{md5}` は `dist/js/s2j-webinar-survey-gutenberg.js` の **相対パス** (`dist/js/…`) のハッシュである (ファイル内容の MD5 ではない)。

**S2J Webinar Survey Service:** 計算規則・Packagist `s2j/webinar-survey-service` は本件 (Gutenberg ビルド / i18n) で変更なし。プラグイン側は REST → `ServiceBridge` 経由の既存契約のまま。

---

## 第1段階: Local (結合スモーク)

| # | 確認項目 | 期待 |
| --- | --- | --- |
| 1 | `composer install` + `npm run build:production` | `vendor/` と `dist/js/s2j-webinar-survey-gutenberg.js` |
| 2 | GatherPress + alpha 有効化 | エラーなく有効 |
| 3 | 本プラグイン有効化 | `s2j/webinar-survey-service` 同梱 |
| 4 | **設定 > S2J Webinar Survey Questions** | 設問上限 1–15 を保存 |
| 5 | イベント編集 (ブロック) | Document Settings — バッジ + **Open…** → Modal (CRUD / Advice / Draft)。プラグインエラーバナーなし |
| 5b | エディター i18n (`ja`) | `wp_set_script_translations` 後、ハードリロードで UI 文言が日本語 (Modal 含む) |
| 6 | Modal **Update** | 保存後バッジ・未保存警告が追随 (メタ再取得) |
| 7 | REST `POST …/v1/evaluate` | 200 + deficiencies / advice コード列 |
| 8 | REST `POST …/v1/draft` | コネクタあり時 200 + `candidates` (E2) |

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

### 3a. ユニットのみ (PHP + Composer、CI もここ)

WordPress / MySQL 不要。

```bash
npm run test:unit:php:unit-only
# 実体: composer test:unit → phpunit.unit.xml.dist → tests/Unit/
```

`MaxQuestions` coercion、`MetaRegistrar` sanitize、`ServiceBridge` + Packagist Service を検証します。

### 3b. ローカル通し (MySQL + 初回のみ Subversion)

wp-env / Docker は使いません。MLDC と同型です。

1. `.env.tests.example` を `.env.tests` にコピーし、**開発 DB (`local`) とは別名** のテスト DB を指定する。
2. 初回は Subversion で WordPress PHPUnit ライブラリを `tests/.wordpress-tests-lib/` に取得する (MySQL でテスト DB 作成)。

```bash
npm run test:unit:php:local
# pretest: composer install
# 実体: bin/phpunit-local.sh → test:unit → (必要なら install-wp-tests.sh) → test:integration
```

統合テストは `tests/Integration/` (`EvaluateControllerIntegrationTest` + `DraftControllerIntegrationTest` — ルート登録・権限)。GatherPress + Gutenberg UI は段階1スモーク / Studio で補います。

### 3c. 段階1スモーク (WP-CLI)

```bash
npm run test:smoke:local
```

---

## 最新結果

| 日付 | 環境 | 段階 | 結果 | メモ |
| --- | --- | --- | --- | --- |
| 2026-10-16 | Local (PHPUnit) | 3 | PASS | unit 6 + integration 2。`.env.tests` + 初回 install-wp-tests (WP 7.1.3) |
| 2026-10-17 | — | — | — | 仕様を Modal CRUD / draft REST / lint:php `prelint:php` に同期 ([status.md](./status.md)) |
| 2026-10-18 | Local (GatherPress) | 1 | PASS (手動) | イベント編集: Document Settings パネル・Open… → Modal (Questions / Advice / Draft)。`ja` Jed JSON 目視 OK |
| 2026-10-18 | Local (実装) | — | FIX | Gutenberg: Vite が JSX ランタイムを同梱し `wp.element` と混在 → ハードリロード後にプラグイン描画エラー。`S2JWebinarSurveyJSXRuntime` + `wp_set_script_translations` + `postId`/`postType` ガード ([status.md §管理 UI](./status.md#status-admin-ui)) |
