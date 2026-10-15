<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey;

use function S2J\WebinarSurveyService\evaluate;

final class ServiceBridge
{
    public static function is_available(): bool
    {
        return function_exists('S2J\\WebinarSurveyService\\evaluate');
    }

    /**
     * @param array<string, mixed> $document Panel document (status なし可).
     * @return array{
     *   document: array<string, mixed>,
     *   deficiencies: list<string>,
     *   advice: list<string>
     * }
     */
    public static function evaluate(array $document, int $max_questions): array
    {
        if (! self::is_available()) {
            throw new \RuntimeException('s2j/webinar-survey-service is not loaded.');
        }

        /** @var array{document: array<string, mixed>, deficiencies: list<string>, advice: list<string>} $result */
        $result = evaluate($document, $max_questions);

        return $result;
    }

    /**
     * @return array{deficiencies: list<string>, advice: list<string>}
     */
    public static function evaluate_codes_only(array $document, int $max_questions): array
    {
        $result = self::evaluate($document, $max_questions);

        return array(
            'deficiencies' => $result['deficiencies'],
            'advice'       => $result['advice'],
        );
    }
}
