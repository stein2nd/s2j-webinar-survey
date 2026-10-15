<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey;

final class SaveContext
{
    /**
     * persistence_spec: 明示の投稿保存のみ (autosave / Quick Edit / bulk / WP-CLI 等は除外).
     */
    public static function should_run_meta_evaluate(int $post_id): bool
    {
        if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
            return false;
        }

        if (defined('WP_CLI') && \WP_CLI) {
            return false;
        }

        if (isset($_REQUEST['action']) && 'inline-save' === $_REQUEST['action']) {
            return false;
        }

        if (isset($_REQUEST['bulk_edit'])) {
            return false;
        }

        return true;
    }
}
