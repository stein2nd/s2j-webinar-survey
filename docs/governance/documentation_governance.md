<!--
目的：「README と docs の整合、用語、archive 運用」の明文化
-->

# S2J Webinar Survey - ドキュメンテーション・ガバナンス

本ドキュメントは、ユーザー向け説明と仕様の **整合ルール** を定義します。

共通の要約は [wp-plugin-spec / SPECS.md](https://github.com/stein2nd/wp-plugin-spec/blob/main/docs/SPECS.md) §4です。ひな型は [DOCUMENTATION_GOVERNANCE_TEMPLATE.md](https://github.com/stein2nd/wp-plugin-spec/blob/main/docs/DOCUMENTATION_GOVERNANCE_TEMPLATE.md) です。

## 設計意図 (ゴール)

README と `docs/` の説明・命名が、実装とサービス契約からずれないようにします。「正本はどれか」「完了したら何を freeze するか」を、毎回説明しなくてよくします。

## 1. Source of Truth

| 対象 | 正本 |
| --- | --- |
| 検査・助言・下書き分解の規則 | Survey Service の `docs/core/` |
| 公開 PHP API (Composer) | Survey Service の `docs/interfaces/php_api_spec.md` |
| メタキー、option、パネル文言 | 本 `docs/` (`data_dictionary.md` / `admin_ui_spec.md` 等) |
| 画面、永続化、i18n (アダプタ) | `admin_ui_spec.md` / `draft_ui_spec.md` / `persistence_spec.md` |
| 最短手順・インストール | ルート `README.md` |
| 統合の見取り図 | `docs/plugin_spec.md` (要約。細部の正本ではない) |
| 索引 | `docs/specs.md` |

矛盾時は **規則・契約の正本** (計算はサービス側、メタ・画面は本 `docs/`) を直し、README、要約、usage を追随させます。

## 2. 用語

* コード名・キー名は、[data_dictionary.md](../data_dictionary.md) と Survey Service の contracts に従う。
* 画面の表示文言は、「適切なメッセージ文を表示する」と書き、国際化関数の経由を前提とする (SPECS.md §4.2.1)。
* Survey Service の `answer_kind` (`single` / `short` 等) と、Zoom の `type` (`short_answer` 等) を混同して書かない。写像は S2J Webinar / webinar-service の仕事である。
* 「状態」はメタ文書の `status` (保存済み) のみを指す。S2J Webinar が読むのもこの `status` である。不足・助言はいまのパネル文書のライブ検査であり、メタの状態と混同しない。
* メタ文書への `evaluate` 書き込みは、初版では GatherPress イベント編集からの明示の投稿更新に限定する。除外と表示専用の発火・搬送は [persistence_spec.md](../persistence_spec.md) を正本とする。
* 「パネル文書」「メタ文書」「候補」の呼び分けは [persistence_spec.md](../persistence_spec.md) / [data_dictionary.md](../data_dictionary.md) に従う。
* 「自由記述」は `short` / `long`、「選択式」は `single` / `multiple` の総称である (パネル名はデータ辞書)。
* FOP は初出で Functional Object-Oriented Programming と展開する。
* S2J Webinar の添付契機は相手の通常「同期」での `attach_survey` と書く。「作成直後」とは書かない (create の必須条件にしない)。

## 3. Lint

* `@s2j/docs-linter` を SoT とする。
* ローカルと CI で同じ `npm run lint:docs` を使う。
* 対象は `README.md`、`CHANGELOG.md`、および `docs/` / `docs_mod/` 配下の仕様 Markdown である。

## 4. 分割ルール

* 新規仕様は [specs.md](../specs.md) のレイヤーに分類する。
* 必要になるまで、他製品にある層 (OpenAPI / SRE 等) を増やさない。

## 5. 改訂フロー (`docs_mod` → `docs`)

* 確定仕様の正本は `docs/` である。
* 大きな改訂案は `docs_mod/` で起草し、レビュー・合意のあと `docs/` に反映する。
* 依存リポジトリからのリンクは、可能な限り `docs/` を指すように保つ。
* 小さな typo は `docs/` を直接直してよい。

## 6. イニシアチブ証跡 (archive)

実装・改修の区切りごとに、人が読める合格証跡を残します。PHPUnit / Jest の HTML / XML など機械成果物とは別です (カバレッジは `/coverage/` 等。gitignore)。

### 6.1. 命名

| 種類 | フォルダー | いつ使うか |
| --- | --- | --- |
| 実装イニシアチブ | `docs/archive/impl-<slug>/` | まだない能力を初めて入れる |
| 改修イニシアチブ | `docs/archive/mod-<slug>/` | すでに `docs/` にある仕様・振る舞いを変える |
| 仕様リライトの旧正本 | `docs/archive/spec-<slug>/` または簡潔な英文名 | 公開正本の一式を置き換えたときの旧版 |

`<slug>` は短い kebab-case とする。SemVer はフォルダー名に入れず、`status.md` や CHANGELOG に書く。

### 6.2. 三点セット

作業中は `docs_mod/` に置き、完了時に archive にフリーズする。

| ファイル | 書くこと | 書かないこと |
| --- | --- | --- |
| `modification.md` | 目的、スコープ内外、タスク表、完了定義 | 長い仕様本文 (正本は `docs/`) |
| `status.md` | 進捗サマリー、完了条件のチェック、残ギャップ | 生のカバレッジ HTML |
| `test-results.md` | 仕様条件 ID ごとの PASS / WARN / FAIL | 生ログの丸貼り |

### 6.3. ライフサイクル

1. **開始** … `docs_mod/` に三点セットを置く (必要なら仕様ドラフトも)
2. **作業** … 合意した仕様は都度 `docs/` に反映する。証跡三点は `docs_mod/` で更新する
3. **フリーズ** … 下記をすべて満たしたら `docs/archive/impl-<slug>/` または `docs/archive/mod-<slug>/` にコピーして固定する
   * 該当する `docs/` 仕様が最新である
   * `test-results.md` に FAIL がない (WARN は理由付きのみ可)
   * CHANGELOG の unreleased に一行ある
4. **フリーズ後** … archive 配下は原則変更しない。続きは新しい `mod-*` (または `impl-*`) を切る
5. **片付け** … `docs_mod/` の三点は削除してよい (ディレクトリと [../../docs_mod/README.md](../../docs_mod/README.md) は残す)

### 6.4. いつ切るか

* コードまたは契約が動くイニシアチブでは、三点セットを切る。
* docs だけの整備は archive 任意とする。
* 初回実装は大きくまとめず、縦に切ってよい (例: `impl-skeleton` → `impl-settings-panel` → `impl-draft`)。

### 6.5. 全体 status との関係

* [status.md](../status.md) は製品全体の「いま」である。
* `docs/archive/.../status.md` は、そのイニシアチブ完了時点の凍結である。
* 全体 status に、進行中の `docs_mod/` と直近 archive へのリンクを短く置いてよい。進捗表の二重管理はしない。

索引は [archive/README.md](../archive/README.md) である。

## 7. `docs/archive/README.md` に置くもの

* 本ガバナンスへのリンク (規則の正本はこちら)
* 命名の一行要約 (`impl-` / `mod-` / 仕様リライト)
* 完了イニシアチブの索引表 (日付・フォルダー・種別・一言)

機械成果物は、archive に置かない。

## 8. `docs_mod/README.md` に置くもの

* 確定正本は `docs/` であること
* 起草中の仕様ドラフトと、進行中イニシアチブ三点の置き場であること
* 完了後は archive に freeze し、三点は削除してよいこと
* 詳細へのリンク (本ファイルと `docs/archive/README.md`)
