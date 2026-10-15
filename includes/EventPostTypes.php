<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey;

final class EventPostTypes
{
    /**
     * GatherPress イベント post type (フォーク非改変のため capability ベースで列挙).
     *
     * @return list<string>
     */
    public static function all(): array
    {
        $types = get_post_types(array( 'public' => true ), 'names');
        $out   = array();

        foreach ($types as $type) {
            if (post_type_supports($type, 'gatherpress-event-date')) {
                $out[] = $type;
            }
        }

        if ($out === array() && post_type_exists('gatherpress_event')) {
            $out[] = 'gatherpress_event';
        }

        return $out;
    }
}
