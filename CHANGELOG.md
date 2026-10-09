# S2J Webinar Survey - CHANGELOG

## unreleased

## 0.0.1 - 2026-10-09

* メタ登録を `object` / `show_in_rest` / `edit_post` 相当 auth と固定。クライアントの `status` は信頼しない。プロパティ JSON Schema 詳細は実装委ね (意味は Service 正本)。
* REST パスを正本化 (`…/v1/evaluate`・`…/v1/draft`)。evaluate 初版出力はコード列のみ。パネル文書は `show_in_rest` + `save_post` 正規化上書きと固定した。
* concept 保存図に成功時のみ同期の注記、`event_id` は権限用 (Service に載せない)、status のメタ上書きを成功時のみと明記した。
* REST に `event_id` 必須、`max_questions` はサーバー注入 (クライアント上書きなし)。「成功」= 例外なく完了 (`draft`/`ready` とも書く)。コネクタ欠如はボタン非表示を正とした。
* 下書き REST 最小契約を追加 (1リクエストに `build`→コネクタ→`parse`)。メタ上書きは成功時のみと明記。改訂履歴に表示専用2発火への整理を追記した。
* 上限反映はイベント編集の開き直し／再読込に含める (開いたままは自動更新しない)。下書きも PHP 経由。表示専用 `evaluate` の REST 最小契約を追加。保存成功後のパネル同期を必須とした。archive 三点は impl/mod のみと明記した。
* 除外リストを persistence 正本へ寄せ、表示専用 `evaluate` は当時3発火+保存のみ (後に開き直し+採用直後の2発火へ整理。キー入力では走らせない)、搬送は PHP (REST 等) 経由と明記した。表記の軽いそろえをした。
* 保存トリガーをイベント編集の明示更新に限定 (Quick Edit / 一括編集 / WP-CLI / 独自 REST 等は除外。コア投稿 REST の扱いの正本は persistence)。表記の最終そろえをした。
* autosave 除外、サーバー正規化でメタを上書きした。パネル文書／メタ文書の用語固定、不足表示の表記をそろえ、メニューとパネル見出しの同一文言を明記した。
* 表示専用 `evaluate` はパネル入力、保存は投稿の通常保存、`choices` は非対象で非表示、`too_many` は助言のみ、option キー確定、「自由記述」の定義と表記をそろえた。
* `docs/governance/documentation_governance.md` を追加し、`docs/archive/README.md` と `docs_mod/README.md` を整えた。
* 確定仕様を `docs_mod/` から `docs/` へ移した。`docs_mod/` は変更案用に残す。
* 仕様文の「日本語を表示」系を、「適切なメッセージ文を表示」(国際化関数を経由) に統一した。`principles.md` に原則7を追加。
* 保存時とパネル表示時の `evaluate` を分離した (表示時はメタ非書き戻し)。アンケート見出し・説明は相手側責務とした。
* 目的文を助言コードに対応させ、共通仕様リンクを `SPECS.md` に直し、「大事な指針」は製品文案+英語 msgid 前提と明記した。
* 「状態」はメタの status のみ、不足・助言はライブ検査と分離。i18n 用語 (msgid / 製品文案 / 翻訳) を固定。採用直後は表示専用 evaluate、と追記した。
* 境界の「状態」用語を整理。表示専用トリガーを3種に統一。メタ未作成時の状態バッジは非表示または「未保存」、と追記した。
* 不足・助言メッセージは直前の `evaluate` (保存時または表示専用) から出す、と明記。overview / concept は発火条件を詳細仕様へ委譲。
* 除外列挙の区切りを読点にそろえ、保存成功後のパネル同期・メタ上書きの表記を整えた。アンインストール用語と archive 文末を直した。
* S2J Webinar の添付契機を通常の「同期」での `attach_survey` に改め、「作成直後」表記をやめた。
* 保存の除外／許可を persistence で切り分けた (コア投稿 REST + `save_post` は許可、独自カスタム REST によるメタ保存は除外)。
* 表示専用 `evaluate` は開き直し + 採用直後の2発火と注記し、architecture / principles で FOP (Functional Object-Oriented Programming) を初出展開した。
* overview / status / admin 等の委譲文言を「除外と許可は persistence」にそろえた。

## 0.0.1 - 2026-10-08

* 実装向けに `docs_mod/` を分割した。索引は `specs.md`、統合ドラフトは `plugin_spec.md`、ほか overview / concept / architecture / principles、data_dictionary、admin_ui / draft_ui / persistence、status を置いた。
* 計算の正本リンクを Survey Service の `docs/` に合わせ、README に概要と仕様への導線を足した。

## 0.0.1 - 2026-10-07

* 確定前の仕様に、設問総数の上限をサイト設定とした。未設定の初期値は6、受け付ける範囲は1以上15以下、イベント編集には出さない、と記録した。
* 誘導と二重の問いは初版では自動判定せず、イベント編集パネル冒頭に「大事な指針」を出す、と記録した。
* 答え方を単一選択・複数選択・短い回答・長い回答・レーティングスケールの5つとし、画像・スキップ・マッチング・ランク・空欄記入は初版のパネルに出さない、と記録した。
* 初版5種の Zoom `type` を確定し、添付と写像は S2J Webinar の後続、本プラグインは Zoom フィールドを持たない、と記録した。

## 0.0.1 - 2026-10-06

* 開発用の npm 依存と lint / Vite ビルド用スクリプトを整えた。`@s2j/docs-linter` v1.0.27とドキュメント lint の CI を含む。
* 開発依存を最新化した (Vite v8.3.3、stylelint v17.16、React v19.3、`@wordpress/*` 等)。
* 開発依存の `braces` v3.0.3 (GHSA-vfj7-8cjw-p6xm: 深くネストしたパターンで Node.js プロセスが終了する) と `@s2j/docs-linter` 経由の `sprintf-js` (GHSA-hp3w-g68c-fv3c) は修正版が未公開のため、npm audit の指摘は残す。配布物には含まれない。
