<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey\Admin;

use S2J\WebinarSurvey\Constants;
use S2J\WebinarSurvey\MaxQuestions;

final class SettingsPage
{
    public static function register(): void
    {
        add_action('admin_menu', array( self::class, 'add_menu' ));
        add_action('admin_init', array( self::class, 'register_settings' ));
    }

    public static function add_menu(): void
    {
        add_options_page(
            __('Survey questions', 's2j-webinar-survey'),
            __('Survey questions', 's2j-webinar-survey'),
            'manage_options',
            's2j-webinar-survey',
            array( self::class, 'render' )
        );
    }

    public static function register_settings(): void
    {
        register_setting(
            's2j_webinar_survey',
            Constants::OPTION_MAX_QUESTIONS,
            array(
                'type'              => 'integer',
                'sanitize_callback' => array( MaxQuestions::class, 'sanitize_setting' ),
                'default'           => Constants::DEFAULT_MAX_QUESTIONS,
            )
        );

        add_settings_section(
            's2j_webinar_survey_main',
            __('Question limits', 's2j-webinar-survey'),
            static function (): void {
                echo '<p>' . esc_html__(
                    'Site-wide limit for survey questions per event.',
                    's2j-webinar-survey'
                ) . '</p>';
            },
            's2j-webinar-survey'
        );

        add_settings_field(
            Constants::OPTION_MAX_QUESTIONS,
            __('Maximum questions', 's2j-webinar-survey'),
            array( self::class, 'render_max_field' ),
            's2j-webinar-survey',
            's2j_webinar_survey_main'
        );
    }

    public static function render_max_field(): void
    {
        $value = MaxQuestions::for_service();
        printf(
            '<input type="number" min="%1$d" max="%2$d" name="%3$s" id="%3$s" value="%4$d" class="small-text" />',
            Constants::MIN_MAX_QUESTIONS,
            Constants::MAX_MAX_QUESTIONS,
            esc_attr(Constants::OPTION_MAX_QUESTIONS),
            (int) $value
        );
        echo '<p class="description">' . esc_html__(
            'Allowed range: 1–15. Empty uses 6 when evaluating.',
            's2j-webinar-survey'
        ) . '</p>';
    }

    public static function render(): void
    {
        if (! current_user_can('manage_options')) {
            return;
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('Survey questions', 's2j-webinar-survey'); ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_fields('s2j_webinar_survey');
                do_settings_sections('s2j-webinar-survey');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
}
