<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey\Rest;

use S2J\WebinarSurvey\Constants;
use WP_Error;
use WP_REST_Request;

/**
 * 下書き REST (build → コネクタ → parse) は follow-up で実装。
 */
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
                'callback'            => array( self::class, 'not_implemented' ),
                'permission_callback' => static function (): bool {
                    return current_user_can('edit_posts');
                },
            )
        );
    }

    public static function not_implemented(WP_REST_Request $request): WP_Error
    {
        unset($request);

        return new WP_Error(
            's2j_webinar_survey_draft_not_implemented',
            __('Draft endpoint is not implemented yet.', 's2j-webinar-survey'),
            array( 'status' => 501 )
        );
    }
}
