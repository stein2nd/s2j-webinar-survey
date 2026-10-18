import { __, sprintf } from '@wordpress/i18n';

const DEFICIENCY_MESSAGES: Record<string, string> = {
	internal_name_empty: __(
		'Internal name is empty.',
		's2j-webinar-survey',
	),
	questions_empty: __(
		'Add at least one question.',
		's2j-webinar-survey',
	),
	prompt_empty: __(
		'A question prompt is empty.',
		's2j-webinar-survey',
	),
	answer_kind_invalid: __(
		'A question has an invalid answer type.',
		's2j-webinar-survey',
	),
	choices_missing: __(
		'A single- or multiple-choice question needs at least two non-empty choices.',
		's2j-webinar-survey',
	),
	choices_unexpected: __(
		'Choices were provided for a question type that does not use them.',
		's2j-webinar-survey',
	),
	rating_bounds_invalid: __(
		'A rating scale has invalid bounds or labels.',
		's2j-webinar-survey',
	),
};

const ADVICE_MESSAGES: Record<string, string> = {
	too_many: __(
		'Question count exceeds the site limit (advice only; you can still save).',
		's2j-webinar-survey',
	),
	open_before_closed: __(
		'Place free-text questions after closed-ended ones.',
		's2j-webinar-survey',
	),
	required_open: __(
		'A required free-text question may reduce completion.',
		's2j-webinar-survey',
	),
	identity_not_last: __(
		'Place the respondent-identifying question last.',
		's2j-webinar-survey',
	),
	purpose_missing: __(
		'Add a planning purpose for a question (not shown to respondents).',
		's2j-webinar-survey',
	),
};

export function messageForDeficiencyCode(code: string): string {
	return (
		DEFICIENCY_MESSAGES[code] ??
		sprintf(
			/* translators: %s: deficiency code from the survey service */
			__('Unresolved deficiency: %s', 's2j-webinar-survey'),
			code,
		)
	);
}

export function messageForAdviceCode(code: string): string {
	return (
		ADVICE_MESSAGES[code] ??
		sprintf(
			/* translators: %s: advice code from the survey service */
			__('Unresolved advice: %s', 's2j-webinar-survey'),
			code,
		)
	);
}
