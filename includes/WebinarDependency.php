<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey;

final class WebinarDependency
{
    private const WEBINAR_PLUGIN = 's2j-webinar/s2j-webinar.php';

    private const INSTALL_GUIDE_URL = 'https://github.com/stein2nd/s2j-webinar#installation';

    public static function is_installed(): bool
    {
        if (defined('S2J_WEBINAR_VERSION')) {
            return true;
        }

        self::ensure_plugin_api();
        $plugins = get_plugins();

        return isset($plugins[ self::WEBINAR_PLUGIN ]);
    }

    public static function is_active(): bool
    {
        if (defined('S2J_WEBINAR_VERSION')) {
            return true;
        }

        self::ensure_plugin_api();

        return is_plugin_active(self::WEBINAR_PLUGIN);
    }

    public static function activate_url(): string
    {
        if (! current_user_can('activate_plugins') || self::is_active()) {
            return '';
        }

        self::ensure_plugin_api();

        return wp_nonce_url(
            admin_url('plugins.php?action=activate&plugin=' . self::WEBINAR_PLUGIN),
            'activate-plugin_' . self::WEBINAR_PLUGIN
        );
    }

    public static function install_guide_url(): string
    {
        return self::INSTALL_GUIDE_URL;
    }

    private static function ensure_plugin_api(): void
    {
        if (! function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
    }
}
