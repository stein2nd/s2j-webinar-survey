export const ANSWER_KINDS = [
	'single',
	'multiple',
	'short',
	'long',
	'rating',
] as const;

export type AnswerKind = (typeof ANSWER_KINDS)[number];

export type SurveyQuestion = {
	prompt?: string;
	answer_kind?: AnswerKind | string;
	required?: boolean;
	identifies_respondent?: boolean;
	purpose?: string;
	choices?: string[];
	score_min?: number;
	score_max?: number;
	label_low?: string;
	label_high?: string;
};

export function defaultQuestion(): SurveyQuestion {
	return {
		prompt: '',
		answer_kind: 'single',
		required: false,
		identifies_respondent: false,
		purpose: '',
		choices: ['', ''],
	};
}

export function normalizeQuestion(raw: unknown): SurveyQuestion {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
		return defaultQuestion();
	}
	const obj = raw as Record<string, unknown>;
	const answer_kind =
		typeof obj.answer_kind === 'string' &&
		(ANSWER_KINDS as readonly string[]).includes(obj.answer_kind)
			? (obj.answer_kind as AnswerKind)
			: 'single';

	const question: SurveyQuestion = {
		prompt: typeof obj.prompt === 'string' ? obj.prompt : '',
		answer_kind,
		required: Boolean(obj.required),
		identifies_respondent: Boolean(obj.identifies_respondent),
		purpose: typeof obj.purpose === 'string' ? obj.purpose : '',
	};

	if (answer_kind === 'single' || answer_kind === 'multiple') {
		const choices = Array.isArray(obj.choices)
			? obj.choices.filter((c): c is string => typeof c === 'string')
			: [];
		question.choices = choices.length >= 2 ? choices : ['', ''];
	}

	if (answer_kind === 'rating') {
		if (typeof obj.score_min === 'number') {
			question.score_min = obj.score_min;
		}
		if (typeof obj.score_max === 'number') {
			question.score_max = obj.score_max;
		}
		question.label_low =
			typeof obj.label_low === 'string' ? obj.label_low : '';
		question.label_high =
			typeof obj.label_high === 'string' ? obj.label_high : '';
		if (question.score_min === undefined) {
			question.score_min = 1;
		}
		if (question.score_max === undefined) {
			question.score_max = 5;
		}
	}

	return question;
}

export function isChoiceKind(kind: string | undefined): boolean {
	return kind === 'single' || kind === 'multiple';
}

export function questionSummary(question: SurveyQuestion, index: number): string {
	const prompt = (question.prompt ?? '').trim();
	if (prompt !== '') {
		return prompt;
	}
	return `#${index + 1}`;
}
