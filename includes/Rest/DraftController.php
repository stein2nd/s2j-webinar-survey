<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey\Rest;

use S2J\WebinarSurvey\AiTextGeneration;
use S2J\WebinarSurvey\Constants;
use S2J\WebinarSurvey\MaxQuestions;
use S2J\WebinarSurvey\ServiceBridge;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

final class DraftController
{
    public static function register(): void
    {
        add_action('rest_api_init', array( self::class, 'register_routes' ));
    }

    public static function register_routes(): void
    {
        register_rest_route(
            Constants::REST_NAMESPACE,
            '/draft',
            array(
                'methods'             => 'POST',
                'callback'            => array( self::class, 'handle' ),
                'permission_callback' => array( self::class, 'permission' ),
                'args'                => array(
                    'event_id'    => array(
                        'type'              => 'integer',
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                    'kind'        => array(
                        'type'     => 'string',
                        'required' => true,
                        'enum'     => array( 'survey', 'prompt', 'choices' ),
                    ),
                    'document'    => array(
                        'type'     => 'object',
                        'required' => true,
                    ),
                    'event_title' => array(
                        'type' => 'string',
                    ),
                    'focus_index' => array(
                        'type' => 'integer',
                    ),
                ),
            )
        );
    }

    public static function permission(WP_REST_Request $request): bool|WP_Error
    {
        $event_id = (int) $request->get_param('event_id');
        if ($event_id <= 0) {
            return new WP_Error(
                'rest_invalid_param',
                __('Invalid event_id.', 's2j-webinar-survey'),
                array( 'status' => 400 )
            );
        }

        if (! current_user_can('edit_post', $event_id)) {
            return new WP_Error(
                'rest_forbidden',
                __('Sorry, you are not allowed to edit this event.', 's2j-webinar-survey'),
                array( 'status' => 403 )
            );
        }

        return true;
    }

    public static function handle(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        if (! ServiceBridge::is_available()) {
            return new WP_Error(
                's2j_webinar_survey_service_missing',
                __('Survey service is not available.', 's2j-webinar-survey'),
                array( 'status' => 500 )
            );
        }

        if (! AiTextGeneration::is_available()) {
            return new WP_Error(
                's2j_webinar_survey_ai_unavailable',
                __('AI connector is not available.', 's2j-webinar-survey'),
                array( 'status' => 503 )
            );
        }

        $document = $request->get_param('document');
        if (! is_array($document)) {
            return new WP_Error(
                'rest_invalid_param',
                __('Invalid document.', 's2j-webinar-survey'),
                array( 'status' => 400 )
            );
        }

        unset($document['status']);

        $kind = (string) $request->get_param('kind');
        $context = array(
            'document'       => $document,
            'max_questions'  => MaxQuestions::for_service(),
            'event_title'    => (string) $request->get_param('event_title'),
        );

        $focus_index = $request->get_param('focus_index');
        if ($focus_index !== null) {
            $context['focus_index'] = (int) $focus_index;
        }

        try {
            $built = ServiceBridge::build_draft_prompt($kind, $context);
        } catch (\InvalidArgumentException $e) {
            return new WP_Error('rest_invalid_param', $e->getMessage(), array( 'status' => 400 ));
        } catch (\Throwable $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log('s2j-webinar-survey draft build: ' . $e->getMessage());
            }

            return new WP_Error(
                's2j_webinar_survey_draft_failed',
                __('Draft request failed.', 's2j-webinar-survey'),
                array( 'status' => 500 )
            );
        }

        if ($built['prompt_text'] === '' || $built['requested_count'] < 1) {
            return new WP_REST_Response(
                array(
                    'candidates' => array(),
                ),
                200
            );
        }

        $ai_text = AiTextGeneration::generate($built['prompt_text']);
        if (is_wp_error($ai_text)) {
            return $ai_text;
        }

        $parse_context = $context;
        $parse_context['requested_count'] = $built['requested_count'];

        try {
            $candidates = ServiceBridge::parse_draft_response($kind, $ai_text, $parse_context);
        } catch (\InvalidArgumentException $e) {
            return new WP_Error('rest_invalid_param', $e->getMessage(), array( 'status' => 400 ));
        } catch (\Throwable $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log('s2j-webinar-survey draft parse: ' . $e->getMessage());
            }

            return new WP_Error(
                's2j_webinar_survey_draft_failed',
                __('Draft request failed.', 's2j-webinar-survey'),
                array( 'status' => 500 )
            );
        }

        return new WP_REST_Response(
            array(
                'candidates' => $candidates,
            ),
            200
        );
    }
}
