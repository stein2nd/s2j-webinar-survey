<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey\Tests\Unit;

use PHPUnit\Framework\TestCase;
use S2J\WebinarSurvey\Constants;
use S2J\WebinarSurvey\MaxQuestions;

final class MaxQuestionsTest extends TestCase {

	public function test_coerce_in_range(): void {
		self::assertSame( 6, MaxQuestions::coerce( 6 ) );
		self::assertSame( 1, MaxQuestions::coerce( '1' ) );
		self::assertSame( 15, MaxQuestions::coerce( 15 ) );
	}

	public function test_coerce_out_of_range_falls_back_to_default(): void {
		self::assertSame( Constants::DEFAULT_MAX_QUESTIONS, MaxQuestions::coerce( 0 ) );
		self::assertSame( Constants::DEFAULT_MAX_QUESTIONS, MaxQuestions::coerce( 99 ) );
		self::assertSame( Constants::DEFAULT_MAX_QUESTIONS, MaxQuestions::coerce( 'n/a' ) );
	}
}
