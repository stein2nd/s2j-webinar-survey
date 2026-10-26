# S2J Webinar Survey - 管理 UI 仕様

## 設計意図 (ゴール)

運営者がイベント編集だけで設問を書き、管理者だけが上限を変えられるようにします。

## サイト設定

| 項目 | 内容 |
| --- | --- |
| メニュー見出し | S2J Webinar Survey Questions |
| 権限 | `manage_options` のみ |
| 項目 | 設問総数の上限のみ |
| 範囲 | 1以上15以下。範囲外は保存しない |
| 未設定 | サービスに渡す場合は6 |
| イベントパネル | 上限の入力は出さない |
| Service に渡す型 | 常に `int`。読み出し規則の正本は [persistence_spec.md](./persistence_spec.md) (`max_questions` の読み出し) |

投稿保存時・表示専用 `evaluate`・下書き REST は、いずれも **そのリクエスト処理時点** のサイト option を `int` 化して使います。開いたままのイベント画面は、サイト設定変更だけでは自動更新しません。

サイト設定は **S2J Webinar Survey Questions**。イベント Document Settings パネルは **S2J Webinar Survey** (プラグイン一覧名と同型)。

## イベント編集パネル

| 項目 | 内容 |
| --- | --- |
| 見出し | S2J Webinar Survey (S2J Webinar パネルと同型の i18n 英文) |
| 置き場 | GatherPress のイベント編集画面。S2J Webinar のパネルとは別 |
| 足し方 | 公開フックの外側から。フォーク本体は改変しない |
| 権限 | そのイベントを編集できるユーザー |
| シェル (初版) | Document Settings に **状態バッジ** + **Open…** のみ。編集本体は **Modal** (`@wordpress/components` `Modal` + `TabPanel`) |
| タブ | **Questions** (指針 + 内部名 + 設問 CRUD + 設問別 prompt/choices 下書き) / **Advice** (表示専用 evaluate・コード→i18n メッセージ) / **Draft** (survey 下書き。コネクタ欠如時は案内のみ) |
| 未保存 | パネルに警告。`ready` 保存済みかつ編集中は Webinar は前回 ready のまま、と明示 |
| Update 後 | `save_post` 正規化後のメタを REST で再取得しパネル文書を同期 |
| 保存 | モーダルフッターの **Update** = エディターと同じ投稿保存 (アンケート専用保存はない)。**Close** = 保存せず閉じる |
| パネル文書 | Gutenberg `useEntityProp` で `_s2j_webinar_survey`。編集はメタ経由でイベント保存に同梱 |
| localize (`s2jWebinarSurvey`) | `restNamespace`、`metaKey`、`maxQuestions`、`hasDraftConnector` (`function_exists('wp_ai_client_prompt')`)、`connectorsSettingsUrl` (`options-connectors.php`)、`s2jWebinarInstalled` / `s2jWebinarActive`、`webinarInstallGuideUrl`、`webinarActivateUrl` ([`WebinarDependency.php`](../includes/WebinarDependency.php)) |
| エディター store | Gutenberg パネルは `core/editor` から `postId` / `postType` を取得 (`postId` / `postType` 確定前はローディング文言のみ) |

### S2J Webinar 前提 (初版)

* **導入順:** [README.md §Installation](../README.md#installation) — **S2J Webinar 有効化** → GatherPress → 本プラグイン。
* **`s2jWebinarActive` が false:** Document Settings には **Open… / Modal を出さない**。[`WebinarDependencyNotice.tsx`](../src/gutenberg/WebinarDependencyNotice.tsx) のみ (未インストール → インストールガイドリンク、インストール済み無効 → 有効化リンク。権限・状態に応じ URL は空可)。
* **メタ編集・evaluate** は Webinar 無効でも PHP 側は可能だが、初版 UI は添付先が分かるよう上記ゲートとする (Zoom 添付は Webinar 側 [§外部結合](./status.md#status-external))。

**コネクタと下書きボタン (初版):** `hasDraftConnector` は Connectors API の有無のみ。Draft タブの survey 下書きは false のとき UI を隠し Connectors に誘導する。**Questions** の設問別 prompt/choices 下書きは true のときボタンを出し、テキスト生成コネクタ未設定なら REST エラーを行下に表示する (詳細は [draft_ui_spec.md §コネクタ欠如時](./draft_ui_spec.md#コネクタ欠如時))。

### 大事な指針 (Questions タブ)

サイト設定には出しません。下記は **日本語の製品文案** (ja ロケールで見せたい内容) です。PHP / JS への直書き原稿ではありません。実装では国際化関数 (`__()` / `_x()` / `@wordpress/i18n` 等) を必ず使い、msgid は英語を基本とします (日本語は翻訳リソース)。

```
アンケート設計では避けるべき「大事な指針」：
＊ 「すばらしいと思いませんか？」「役に立たなかった理由は？」のように、答えを寄せる、または前提を押しつける誘導文。
＊ 「内容と時間は適切でしたか？」のように、どちらに答えるのか、回答者に負担をかける、一文に判断が2つ入っている文。
```

初版では、誘導・二重問いを自動判定しません。

### パネル項目

画像アップロード、スキップ、マッチング、ランク、空欄記入は、初版のパネルに出しません。

* 内部名 (補足: 回答者には出さず、ウェビナー側の管理一覧向け。プロバイダ名は UI に出さない — [principles.md](./principles.md) §6)
* 設問の列 (追加・削除・並べ替え)
* 各設問:
  * 回答者に見せる文 (`prompt`)
  * 答え方 (5種。文書値は `single` / `multiple` / `short` / `long` / `rating`)
  * 必須にするか
  * 回答者を特定する問いであるか
  * 次回の企画で何を決めるか (`purpose`。補足: 回答者には出ない)
  * `single` / `multiple`: 選択肢の列
  * `rating`: `score_min` / `score_max` / `label_low` / `label_high`

**選択肢 UI (初版):**

* 単一／複数選択は **最低2件** の選択肢が必要 ([不足コード](#不足コード-表示の目安) `choices_missing`)。
* **Remove choice** は選択肢が **3件以上** のときだけ表示する (2件のときは削除ボタンを出さず、説明文で Add choice を促す)。
* 設問ごとに折りたたみ。Up / Down / Remove で並べ替え・削除。

### 投稿保存時と表示時の `evaluate`

* **保存のトリガー:** GatherPress イベント編集画面からの明示の投稿「更新」に限定する。パネル専用の「アンケートだけ保存」は持たない。除外と許可の正本は [persistence_spec.md](./persistence_spec.md) (初版: autosave、リビジョン、Quick Edit、一括編集、WP-CLI、独自カスタム REST によるメタ保存は除外。エディター経由のコア投稿 REST + `save_post` は許可)。
* **投稿保存時:** `save_post` (相当) でパネル文書を `evaluate` し、成功時は戻りでメタ文書を常に上書きする (失敗時は書かない)。不足・助言を適切なメッセージ文で表示する。クライアント生メタは正本にしない。
* **表示専用 `evaluate`** (メタ文書は書き戻さない):
  * 入力は **常にいまのパネル文書** である。メタ文書はパネル初期化の読み出しと「状態」バッジ用だけにする。
  * 搬送は UI → 本プラグイン PHP (REST 等) → Service。クライアントから Service を直接呼ばない。
  * 発火と入力 (初版は下記2つと投稿保存時のみ。キー入力のたびには走らせない。ライブ再計算・タブ間通知は別イニシアチブ):

| 発火 | 入力 |
| --- | --- |
| **Open…** でモーダルを開いた直後 (初回) | その時点のパネル文書。**このリクエスト処理時点** のサイト option (`int` 化後。未設定等は6) |
| Advice タブの **Refresh advice** | 同上 (キー入力のたびには走らせない) |
| 下書き採用直後 | 採用反映後のパネル文書。上限の読み出しは同上 |
| イベント編集の再読込 | メタからパネル再初期化後、次回モーダル open で evaluate |

  * サイト設定で上限を変えても、開いたままの画面は自動更新しない。新しい上限は開き直し／再読込で反映する。REST 最小契約と `max_questions` 読み出しは [persistence_spec.md](./persistence_spec.md)。
  * 不足・助言のメッセージだけ更新する。編集中 (上記以外) のメッセージは直前の結果のままとする。
  * 明示の投稿が保存成功後は、パネル文書をメタ文書 (正規化結果) に必ず合わせる。
* **「状態」はメタ文書の `status` (`draft` / `ready` のコード) のみとする。** S2J Webinar が読むのも、この保存済み `status` である。日本語で状態を「下書き」と呼ばない (下書きは下書き候補 / DraftKind)。
  * メタ未作成 (初回未保存):
    * 「保存済み: draft / ready」は出さない。出す場合は製品文案で「未保存」。
  * 1回以上の明示の投稿保存後:
    * バッジ等で出すなら「保存済み: draft / ready」とコードのまま明示する。
* **不足・助言メッセージ**は、直前に走らせた `evaluate` (投稿保存時または表示専用) の `deficiencies` / `advice` から出す。**仮の `status` フィールドは持たない。** メタの「状態」と同じ見た目の第二バッジは出さない。メタ文書に書くのは明示の投稿保存時だけである。
* 未保存の変更で不足がある場合は、二層あることが分かる表示とする (`deficiencies` / `advice` のメッセージとメタ文書の `status` の対比。製品文案。例: 未保存の変更により不足あり。保存するまで Webinar は前回の ready のまま)。初版の表示専用 REST に `status` は足さない。
* 投稿保存時に不足があればメタ文書の状態は `draft`。助言は不足がなくても出す。助言があっても保存でき、`ready` にもできる。
* **`too_many` (上限超過) は助言のみである。** 不足ではない。保存できる。他に不足がなければ `ready` にもできる。
* 設問0件の間、保存結果の状態は `draft`。
* サイト上限を変えたあとでも、メタ文書の状態は前回保存のままとする。新しい上限での助言は、開き直し／再読込時の表示専用 `evaluate` で出る。

## 不足・助言のメッセージ表示 (方針)

* コード文字列を、画面に出さない。コードから適切なメッセージ文を表示する。
* 表示文言はハードコードせず、本プラグインの国際化関数 (`s2j-webinar-survey` テキストドメイン) を必ず使う。英語 msgid → 選択ロケールの翻訳 (msgstr) 置換 → 表示、の流れに従う。
* 用語: **msgid** は `__()` 等に渡す英語ソース文字列。**製品文案** は仕様上の日本語 (ja で見せたい内容。直書き原稿ではない)。**翻訳** は ja 等のメッセージリソース。
* コード追加は、サービス側 minor。本プラグインは、未登録コードを汎用メッセージまたは「不明な指摘」にフォールバックしてかまわない。
* 実装: `src/domain/evaluationMessages.ts` (Advice タブ)。POT / ja 翻訳は後続で [test-results.md](./test-results.md) 手動項と揃える。

### 不足コード (表示の目安)

| コード | 表示の意図 |
| --- | --- |
| `internal_name_empty` | 内部名が空 |
| `questions_empty` | 設問が1件もない |
| `prompt_empty` | 設問文が空 |
| `answer_kind_invalid` | 答え方が不正 |
| `choices_missing` | 単一選択／複数選択 (`single` / `multiple`) で、空でない選択肢が2つ未満 |
| `choices_unexpected` | この答え方では選択肢を使わない |
| `rating_bounds_invalid` | レーティング・スケールの境界が不正 |

### 助言コード (表示の目安)

確定した英語 msgid は、実装時に POT に載せ、本表の「意図」と矛盾させません。日本語は翻訳 (msgstr) に置きます。

多重度 (文書につき1回 / 該当設問ごと) の正本は Survey Service の [advice_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/core/advice_spec.md) です。UI は **Service の戻り列をそのまま表示** します。同じコードが複数回あれば、同じ msgid を複数回出します (重複除去しない)。

| コード | 表示の意図 |
| --- | --- |
| `too_many` | 設問数が上限を超えている (助言のみ。不足ではない。保存可。他に不足がなければ `ready` 可) |
| `open_before_closed` | 自由記述 (`short` / `long`) の後ろに単一選択・複数選択・レーティング・スケールがある |
| `required_open` | 必須の自由記述 (`short` / `long`) がある |
| `identity_not_last` | 回答者を特定する問いが最後ではない |
| `purpose_missing` | 企画上の目的が空 |

## Gutenberg i18n (実装)

* `wp_set_script_translations` + `languages/s2j-webinar-survey-ja-{md5}.json` (`dist/js/s2j-webinar-survey-gutenberg.js` 相対パスのハッシュ)。
* **空 `msgstr` は JED に載らない** — PHP `.mo` だけでは Modal / パネル JS は英語のまま。[wp-plugin-spec §2.3](https://github.com/stein2nd/wp-plugin-spec/blob/main/docs/I18N_AND_A11Y_TEMPLATE.md#23-gutenberg--管理-js-wp_set_script_translations)。手順: `makepot` → `wp i18n update-po` → 訳 (map / `fill-empty-msgstr` 可) → `npm run makei18n`。既存 Jed を残すときは `npm run makejson:keep` (`--no-purge`)。補助: [`tools/i18n/fill-empty-msgstr.php`](../tools/i18n/fill-empty-msgstr.php) + [`tools/i18n/maps/survey-ja-gutenberg.php`](../tools/i18n/maps/survey-ja-gutenberg.php) (Webinar 依存 Notice 文言含む)。

## 検証

* サイト設定 option 保存: [`MaxQuestionsIntegrationTest.php`](../tests/Integration/MaxQuestionsIntegrationTest.php) (段階3b)
* メタ REST 往復 (Gutenberg と同型の `show_in_rest`): [`PanelMetaRestIntegrationTest.php`](../tests/Integration/PanelMetaRestIntegrationTest.php)
* GatherPress 上の Modal / i18n / 下書きエラー表示: [test-results.md §段階1](./test-results.md#第1段階-local-結合スモーク)

## 関連

* データ: [data_dictionary.md](./data_dictionary.md)
* 下書き UI: [draft_ui_spec.md](./draft_ui_spec.md)
* サービス助言: [advice_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/core/advice_spec.md)
