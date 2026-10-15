<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey;

final class MetaRegistrar
{
    public static function register(): void
    {
        add_action('init', array( self::class, 'register_meta' ), 20);
    }

    public static function register_meta(): void
    {
        foreach (EventPostTypes::all() as $post_type) {
            register_post_meta(
                $post_type,
                Constants::META_KEY,
                array(
                    'type'              => 'object',
                    'single'            => true,
                    'show_in_rest'      => array(
                        'schema' => array(
                            'type'                 => 'object',
                            'additionalProperties' => true,
                        ),
                    ),
                    'auth_callback'     => array( self::class, 'can_edit_post_meta' ),
                    'sanitize_callback' => array( self::class, 'sanitize_panel_document' ),
                    'default'           => array(),
                )
            );
        }
    }

    public static function can_edit_post_meta(bool $allowed, string $meta_key, int $post_id): bool
    {
        unset($allowed, $meta_key);

        return current_user_can('edit_post', $post_id);
    }

    /**
     * @param mixed $value Raw REST / meta value.
     * @return array<string, mixed>
     */
    public static function sanitize_panel_document($value): array
    {
        if (! is_array($value)) {
            return array();
        }

        unset($value['status']);

        return $value;
    }
}
