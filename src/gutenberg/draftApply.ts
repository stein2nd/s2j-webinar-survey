import { normalizeQuestion, type SurveyQuestion } from '@/domain/question';
import type { SurveyDocument } from '@/domain/document';
import type { DraftCandidate } from '@/gutenberg/draftApi';

export function appendSurveyCandidate(
	document: SurveyDocument,
	candidate: DraftCandidate,
): SurveyDocument {
	const question = normalizeQuestion(candidate);
	const questions = [...(document.questions ?? []), question];
	return { ...document, questions };
}

export function applyPromptCandidate(
	document: SurveyDocument,
	focusIndex: number,
	candidate: DraftCandidate,
): SurveyDocument {
	const questions = [...(document.questions ?? [])];
	if (focusIndex < 0 || focusIndex >= questions.length) {
		return document;
	}
	questions[focusIndex] = normalizeQuestion(candidate);
	return { ...document, questions };
}

export function applyChoicesCandidate(
	document: SurveyDocument,
	focusIndex: number,
	candidate: DraftCandidate,
): SurveyDocument {
	const questions = [...(document.questions ?? [])];
	if (focusIndex < 0 || focusIndex >= questions.length) {
		return document;
	}
	const current = questions[focusIndex];
	const choicesRaw = candidate.choices;
	const choices = Array.isArray(choicesRaw)
		? choicesRaw.filter((c): c is string => typeof c === 'string')
		: [];
	questions[focusIndex] = {
		...current,
		choices: choices.length >= 2 ? choices : current.choices,
	};
	return { ...document, questions };
}

export function candidatePreview(question: SurveyQuestion): string {
	return (question.prompt ?? '').trim() || '—';
}
