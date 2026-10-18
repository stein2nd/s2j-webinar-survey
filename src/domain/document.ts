/**
 * Panel / meta survey document (subset; Service is SoT for shape).
 */

import { normalizeQuestion, type SurveyQuestion } from '@/domain/question';

export type SurveyDocument = {
	internal_name?: string;
	questions?: SurveyQuestion[];
	status?: string;
};

export function defaultDocument(): SurveyDocument {
	return {
		internal_name: '',
		questions: [],
	};
}

export function normalizeDocument(raw: unknown): SurveyDocument {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
		return defaultDocument();
	}
	const obj = raw as Record<string, unknown>;
	const questions = Array.isArray(obj.questions)
		? obj.questions.map((q) => normalizeQuestion(q))
		: [];
	return {
		internal_name: typeof obj.internal_name === 'string' ? obj.internal_name : '',
		questions,
		status: typeof obj.status === 'string' ? obj.status : undefined,
	};
}

/** Panel input for display-only evaluate (no client `status`). */
export function documentForEvaluate(
	doc: SurveyDocument,
): Record<string, unknown> {
	const rest = { ...doc };
	delete rest.status;
	return { ...rest };
}

/** Compare panel edits to last saved meta (ignores volatile `status` on panel side). */
export function panelDocumentFingerprint(doc: SurveyDocument): string {
	return JSON.stringify(documentForEvaluate(normalizeDocument(doc)));
}
