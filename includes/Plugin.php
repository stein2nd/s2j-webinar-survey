<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey;

use S2J\WebinarSurvey\Admin\SettingsPage;
use S2J\WebinarSurvey\Rest\DraftController;
use S2J\WebinarSurvey\Rest\EvaluateController;

final class Plugin
{
    public static function init(): void
    {
        add_action('plugins_loaded', array( self::class, 'bootstrap' ));
    }

    public static function bootstrap(): void
    {
        load_plugin_textdomain(
            's2j-webinar-survey',
            false,
            dirname(S2J_WEBINAR_SURVEY_PLUGIN_BASENAME) . '/languages'
        );

        MetaRegistrar::register();
        SavePostHandler::register();
        Assets::register();
        SettingsPage::register();
        EvaluateController::register();
        DraftController::register();
    }
}
