# S2J Webinar Survey

GatherPress のイベント編集画面で、ウェビナー後アンケートの設問を書き、助言を見る WordPress プラグインです (プラグイン一覧名: S2J Webinar Survey)。

計算は Composer ライブラリ [s2j/webinar-survey-service](https://github.com/stein2nd/s2j-webinar-survey-service) に委譲します。Zoom への添付は [S2J Webinar](https://github.com/stein2nd/s2j-webinar) です。

## 仕様

* 索引: [docs/specs.md](./docs/specs.md)
* 統合見取り図: [docs/plugin_spec.md](./docs/plugin_spec.md)

変更案は `docs_mod/` に置きます。

## 開発・検証 (Local)

* 段階1 (実 WP): `export WP_PATH=…` → `npm run test:smoke:local`
* 段階3: `npm run test:unit:php:unit-only` (CI 同型) → `npm run test:unit:php:local` (MySQL、`.env.tests.example` 参照)
* 一括: `npm run test:quality:local` (unit + `lint:php` + integration)
* 手順と Pass 記録: [docs/test-results.md](./docs/test-results.md)
