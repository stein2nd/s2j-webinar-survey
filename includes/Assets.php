<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey;

final class Assets
{
    public static function register(): void
    {
        add_action('enqueue_block_editor_assets', array( self::class, 'enqueue_editor' ));
    }

    public static function enqueue_editor(): void
    {
        $screen = function_exists('get_current_screen') ? get_current_screen() : null;
        if ($screen && 'post' !== $screen->base) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- block editor query args.
        $post_type = isset($_GET['post']) ? get_post_type((int) $_GET['post']) : null;
        if (! $post_type && isset($_GET['post_type'])) {
            $post_type = sanitize_key(wp_unslash((string) $_GET['post_type']));
        }

        if (! $post_type || ! in_array($post_type, EventPostTypes::all(), true)) {
            return;
        }

        $script = 'dist/js/s2j-webinar-survey-gutenberg.js';
        $path   = S2J_WEBINAR_SURVEY_PLUGIN_DIR . $script;
        if (! file_exists($path)) {
            return;
        }

        wp_enqueue_script(
            's2j-webinar-survey-gutenberg',
            S2J_WEBINAR_SURVEY_PLUGIN_URL . $script,
            array( 'wp-plugins', 'wp-edit-post', 'wp-element', 'wp-i18n', 'wp-data', 'wp-components' ),
            (string) filemtime($path),
            true
        );

        $style      = 'dist/css/s2j-webinar-survey-gutenberg.css';
        $style_path = S2J_WEBINAR_SURVEY_PLUGIN_DIR . $style;
        if (file_exists($style_path)) {
            wp_enqueue_style(
                's2j-webinar-survey-gutenberg',
                S2J_WEBINAR_SURVEY_PLUGIN_URL . $style,
                array(),
                (string) filemtime($style_path)
            );
        }

        wp_localize_script(
            's2j-webinar-survey-gutenberg',
            's2jWebinarSurvey',
            array(
                'restNamespace' => Constants::REST_NAMESPACE,
                'metaKey'       => Constants::META_KEY,
            )
        );
    }
}
