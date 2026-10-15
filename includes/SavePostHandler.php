<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey;

final class SavePostHandler
{
    public static function register(): void
    {
        add_action('save_post', array( self::class, 'handle' ), 20, 2);
    }

    public static function handle(int $post_id, \WP_Post $post): void
    {
        if (! in_array($post->post_type, EventPostTypes::all(), true)) {
            return;
        }

        if (! SaveContext::should_run_meta_evaluate($post_id)) {
            return;
        }

        if (! ServiceBridge::is_available()) {
            return;
        }

        $panel = get_post_meta($post_id, Constants::META_KEY, true);
        if (! is_array($panel)) {
            $panel = array();
        }

        unset($panel['status']);

        try {
            $result = ServiceBridge::evaluate($panel, MaxQuestions::for_service());
        } catch (\Throwable $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log('s2j-webinar-survey evaluate failed: ' . $e->getMessage());
            }
            return;
        }

        update_post_meta($post_id, Constants::META_KEY, $result['document']);
    }
}
