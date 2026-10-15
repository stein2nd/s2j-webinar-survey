<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey;

final class MaxQuestions
{
    /**
     * Site option → int for Service (persistence_spec).
     */
    public static function for_service(): int
    {
        $raw = get_option(Constants::OPTION_MAX_QUESTIONS, null);

        if ($raw === false || $raw === null || $raw === '') {
            return Constants::DEFAULT_MAX_QUESTIONS;
        }

        return self::coerce($raw);
    }

    /**
     * Settings save: 1–15 only; otherwise keep previous / default.
     */
    public static function sanitize_setting(mixed $value): int
    {
        if (! is_numeric($value)) {
            return self::stored_or_default();
        }

        $int = (int) $value;
        if ($int < Constants::MIN_MAX_QUESTIONS || $int > Constants::MAX_MAX_QUESTIONS) {
            return self::stored_or_default();
        }

        return $int;
    }

    public static function coerce(mixed $raw): int
    {
        if (! is_numeric($raw)) {
            return Constants::DEFAULT_MAX_QUESTIONS;
        }

        $int = (int) $raw;
        if ($int < Constants::MIN_MAX_QUESTIONS || $int > Constants::MAX_MAX_QUESTIONS) {
            return Constants::DEFAULT_MAX_QUESTIONS;
        }

        return $int;
    }

    private static function stored_or_default(): int
    {
        $stored = get_option(Constants::OPTION_MAX_QUESTIONS, null);
        if ($stored === false || $stored === null || $stored === '') {
            return Constants::DEFAULT_MAX_QUESTIONS;
        }

        return self::coerce($stored);
    }
}
