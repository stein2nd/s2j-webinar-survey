<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey\Rest;

use S2J\WebinarSurvey\Constants;
use S2J\WebinarSurvey\MaxQuestions;
use S2J\WebinarSurvey\ServiceBridge;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

final class EvaluateController
{
    public static function register(): void
    {
        add_action('rest_api_init', array( self::class, 'register_routes' ));
    }

    public static function register_routes(): void
    {
        register_rest_route(
            Constants::REST_NAMESPACE,
            '/evaluate',
            array(
                'methods'             => 'POST',
                'callback'            => array( self::class, 'handle' ),
                'permission_callback' => array( self::class, 'permission' ),
                'args'                => array(
                    'event_id' => array(
                        'type'              => 'integer',
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                    'document' => array(
                        'type'     => 'object',
                        'required' => true,
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

        $document = $request->get_param('document');
        if (! is_array($document)) {
            return new WP_Error(
                'rest_invalid_param',
                __('Invalid document.', 's2j-webinar-survey'),
                array( 'status' => 400 )
            );
        }

        unset($document['status']);

        try {
            $codes = ServiceBridge::evaluate_codes_only($document, MaxQuestions::for_service());
        } catch (\InvalidArgumentException $e) {
            return new WP_Error('rest_invalid_param', $e->getMessage(), array( 'status' => 400 ));
        } catch (\Throwable $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log('s2j-webinar-survey display evaluate: ' . $e->getMessage());
            }
            return new WP_Error(
                's2j_webinar_survey_evaluate_failed',
                __('Evaluation failed.', 's2j-webinar-survey'),
                array( 'status' => 500 )
            );
        }

        return new WP_REST_Response(
            array(
                'deficiencies' => $codes['deficiencies'],
                'advice'       => $codes['advice'],
            ),
            200
        );
    }
}
