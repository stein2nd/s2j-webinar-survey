<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey;

use WP_Error;

final class AiTextGeneration
{
    public static function is_available(): bool
    {
        return function_exists('wp_ai_client_prompt');
    }

    /**
     * @return string|WP_Error
     */
    public static function generate(string $prompt_text): string|WP_Error
    {
        if (! self::is_available()) {
            return new WP_Error(
                's2j_webinar_survey_ai_unavailable',
                __('AI connector is not available.', 's2j-webinar-survey'),
                array( 'status' => 503 )
            );
        }

        if (function_exists('wp_supports_ai') && ! wp_supports_ai()) {
            return new WP_Error(
                's2j_webinar_survey_ai_disabled',
                __('AI is disabled. Check Settings → Connectors.', 's2j-webinar-survey'),
                array( 'status' => 503 )
            );
        }

        $timeout_filter = static function (): int {
            return 60;
        };
        add_filter('wp_ai_client_default_request_timeout', $timeout_filter);

        $result = null;

        try {
            $builder = wp_ai_client_prompt($prompt_text)->using_temperature(0.2);

            if (! $builder->is_supported_for_text_generation()) {
                return new WP_Error(
                    's2j_webinar_survey_ai_unsupported',
                    __('No connector supports text generation.', 's2j-webinar-survey'),
                    array( 'status' => 503 )
                );
            }

            $result = $builder->generate_text_result();
        } catch (\Throwable $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log('s2j-webinar-survey AI prompt: ' . $e->getMessage());
            }

            return new WP_Error(
                's2j_webinar_survey_ai_failed',
                __('AI request failed. Try again.', 's2j-webinar-survey'),
                array( 'status' => 502 )
            );
        } finally {
            remove_filter('wp_ai_client_default_request_timeout', $timeout_filter);
        }

        if (is_wp_error($result)) {
            return new WP_Error(
                's2j_webinar_survey_ai_failed',
                __('AI request failed. Try again.', 's2j-webinar-survey'),
                array( 'status' => 502 )
            );
        }

        if (! is_object($result)) {
            return new WP_Error(
                's2j_webinar_survey_ai_unexpected',
                __('AI returned an unexpected response.', 's2j-webinar-survey'),
                array( 'status' => 502 )
            );
        }

        if (! method_exists($result, 'toText')) {
            return new WP_Error(
                's2j_webinar_survey_ai_unexpected',
                __('AI returned an unexpected response.', 's2j-webinar-survey'),
                array( 'status' => 502 )
            );
        }

        return (string) $result->toText();
    }
}
