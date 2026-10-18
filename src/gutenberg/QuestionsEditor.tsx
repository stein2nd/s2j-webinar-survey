import {
	Button,
	CheckboxControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import type { SurveyDocument } from '@/domain/document';
import {
	defaultQuestion,
	isChoiceKind,
	normalizeQuestion,
	questionSummary,
	type AnswerKind,
	type SurveyQuestion,
} from '@/domain/question';
import { candidatePreview } from '@/gutenberg/draftApply';
import { apiErrorMessage } from '@/gutenberg/apiErrorMessage';
import { requestDraft, type DraftCandidate } from '@/gutenberg/draftApi';

type Props = {
	postId: number;
	eventTitle: string;
	document: SurveyDocument;
	onChangeDocument: (next: SurveyDocument) => void;
	hasDraftConnector: boolean;
	maxQuestions: number;
	onDraftApplied: () => void;
};

const ANSWER_KIND_OPTIONS: { label: string; value: AnswerKind }[] = [
	{ label: __('Single choice', 's2j-webinar-survey'), value: 'single' },
	{ label: __('Multiple choice', 's2j-webinar-survey'), value: 'multiple' },
	{ label: __('Short text', 's2j-webinar-survey'), value: 'short' },
	{ label: __('Long text', 's2j-webinar-survey'), value: 'long' },
	{ label: __('Rating scale', 's2j-webinar-survey'), value: 'rating' },
];

function updateQuestionAt(
	document: SurveyDocument,
	index: number,
	patch: Partial<SurveyQuestion>,
): SurveyDocument {
	const questions = [...(document.questions ?? [])];
	const current = questions[index] ?? defaultQuestion();
	let next = normalizeQuestion({ ...current, ...patch });

	if (patch.answer_kind && patch.answer_kind !== current.answer_kind) {
		next = normalizeQuestion({ ...defaultQuestion(), ...next, answer_kind: patch.answer_kind });
		next.prompt = current.prompt ?? '';
		next.purpose = current.purpose ?? '';
		next.required = current.required ?? false;
		next.identifies_respondent = current.identifies_respondent ?? false;
	}

	questions[index] = next;
	return { ...document, questions };
}

export function QuestionsEditor({
	postId,
	eventTitle,
	document,
	onChangeDocument,
	hasDraftConnector,
	maxQuestions,
	onDraftApplied,
}: Props) {
	const questions = document.questions ?? [];
	const [expandedIndex, setExpandedIndex] = useState(0);
	const [draftBusy, setDraftBusy] = useState<string | null>(null);
	const [draftError, setDraftError] = useState<string | null>(null);
	const [inlineCandidates, setInlineCandidates] = useState<DraftCandidate[]>(
		[],
	);
	const [draftFocusIndex, setDraftFocusIndex] = useState<number | null>(null);

	const runDraft = async (
		kind: 'prompt' | 'choices',
		focusIndex: number,
	) => {
		setDraftBusy(`${kind}-${focusIndex}`);
		setDraftError(null);
		setInlineCandidates([]);
		setDraftFocusIndex(focusIndex);
		try {
			const candidates = await requestDraft({
				postId,
				kind,
				document,
				eventTitle,
				focusIndex,
			});
			setInlineCandidates(candidates);
		} catch (err: unknown) {
			setDraftError(
				apiErrorMessage(
					err,
					__('Draft request failed.', 's2j-webinar-survey'),
				),
			);
		} finally {
			setDraftBusy(null);
		}
	};

	const addQuestion = () => {
		const next = [...questions, defaultQuestion()];
		onChangeDocument({ ...document, questions: next });
		setExpandedIndex(next.length - 1);
	};

	const removeQuestion = (index: number) => {
		const next = questions.filter((_, i) => i !== index);
		onChangeDocument({ ...document, questions: next });
		setExpandedIndex(Math.max(0, index - 1));
	};

	const moveQuestion = (index: number, direction: -1 | 1) => {
		const target = index + direction;
		if (target < 0 || target >= questions.length) {
			return;
		}
		const next = [...questions];
		const tmp = next[index];
		next[index] = next[target];
		next[target] = tmp;
		onChangeDocument({ ...document, questions: next });
		setExpandedIndex(target);
	};

	return (
		<div className="s2j-webinar-survey-questions">
			<p className="description">
				{__(
					'Site question limit applies on save (not shown here).',
					's2j-webinar-survey',
				)}{' '}
				{maxQuestions}
			</p>
			{questions.length === 0 ? (
				<p className="description">
					{__('No questions yet.', 's2j-webinar-survey')}
				</p>
			) : (
				questions.map((question, index) => {
					const q = normalizeQuestion(question);
					const expanded = expandedIndex === index;
					const kind = q.answer_kind ?? 'single';

					return (
						<div
							key={`q-${index}`}
							className="s2j-webinar-survey-questions__item"
						>
							<div className="s2j-webinar-survey-questions__item-head">
								<Button
									variant="link"
									onClick={() =>
										setExpandedIndex(expanded ? -1 : index)
									}
								>
									{questionSummary(q, index)}
								</Button>
								<div className="s2j-webinar-survey-questions__item-actions">
									<Button
										variant="secondary"
										size="small"
										disabled={index === 0}
										onClick={() => moveQuestion(index, -1)}
									>
										{__('Up', 's2j-webinar-survey')}
									</Button>
									<Button
										variant="secondary"
										size="small"
										disabled={index >= questions.length - 1}
										onClick={() => moveQuestion(index, 1)}
									>
										{__('Down', 's2j-webinar-survey')}
									</Button>
									<Button
										variant="secondary"
										size="small"
										isDestructive
										onClick={() => removeQuestion(index)}
									>
										{__('Remove', 's2j-webinar-survey')}
									</Button>
								</div>
							</div>
							{expanded && (
								<div className="s2j-webinar-survey-questions__item-body">
									<TextControl
										label={__(
											'Prompt (shown to respondents)',
											's2j-webinar-survey',
										)}
										value={q.prompt ?? ''}
										onChange={(prompt) =>
											onChangeDocument(
												updateQuestionAt(document, index, {
													prompt,
												}),
											)
										}
									/>
									{hasDraftConnector && (
										<Button
											variant="secondary"
											disabled={draftBusy !== null}
											isBusy={
												draftBusy === `prompt-${index}`
											}
											onClick={() => {
												void runDraft('prompt', index);
											}}
										>
											{__(
												'Draft this prompt',
												's2j-webinar-survey',
											)}
										</Button>
									)}
									<SelectControl
										label={__(
											'Answer type',
											's2j-webinar-survey',
										)}
										value={kind}
										options={ANSWER_KIND_OPTIONS}
										onChange={(answer_kind) =>
											onChangeDocument(
												updateQuestionAt(document, index, {
													answer_kind: answer_kind as AnswerKind,
												}),
											)
										}
									/>
									<CheckboxControl
										label={__(
											'Required',
											's2j-webinar-survey',
										)}
										checked={Boolean(q.required)}
										onChange={(required) =>
											onChangeDocument(
												updateQuestionAt(document, index, {
													required,
												}),
											)
										}
									/>
									<CheckboxControl
										label={__(
											'Identifies the respondent',
											's2j-webinar-survey',
										)}
										checked={Boolean(q.identifies_respondent)}
										onChange={(identifies_respondent) =>
											onChangeDocument(
												updateQuestionAt(document, index, {
													identifies_respondent,
												}),
											)
										}
									/>
									<TextControl
										label={__(
											'Planning purpose (not shown to respondents)',
											's2j-webinar-survey',
										)}
										value={q.purpose ?? ''}
										onChange={(purpose) =>
											onChangeDocument(
												updateQuestionAt(document, index, {
													purpose,
												}),
											)
										}
									/>
									{isChoiceKind(kind) && (
										<div className="s2j-webinar-survey-questions__choices">
											<strong>
												{__('Choices', 's2j-webinar-survey')}
											</strong>
									{(q.choices ?? ['', '']).map(
										(choice, choiceIndex) => {
											const choiceCount =
												q.choices?.length ?? 0;
											const canRemoveChoice =
												choiceCount > 2;

											return (
												<div
													key={`c-${index}-${choiceIndex}`}
													className="s2j-webinar-survey-questions__choice-row"
												>
													<TextControl
														label={__(
															'Choice',
															's2j-webinar-survey',
														)}
														hideLabelFromVision
														value={choice}
														onChange={(value) => {
															const choices = [
																...(q.choices ?? [
																	'',
																	'',
																]),
															];
															choices[choiceIndex] =
																value;
															onChangeDocument(
																updateQuestionAt(
																	document,
																	index,
																	{ choices },
																),
															);
														}}
													/>
													{canRemoveChoice && (
														<Button
															variant="secondary"
															size="small"
															isDestructive
															onClick={() => {
																const choices = (
																	q.choices ?? []
																).filter(
																	(_, i) =>
																		i !==
																		choiceIndex,
																);
																onChangeDocument(
																	updateQuestionAt(
																		document,
																		index,
																		{ choices },
																	),
																);
															}}
														>
															{__(
																'Remove choice',
																's2j-webinar-survey',
															)}
														</Button>
													)}
												</div>
											);
										},
									)}
									<p className="description">
										{__(
											'Single- and multiple-choice questions need at least two choices. Use Add choice before removing one.',
											's2j-webinar-survey',
										)}
									</p>
											<Button
												variant="secondary"
												onClick={() => {
													const choices = [
														...(q.choices ?? []),
														'',
													];
													onChangeDocument(
														updateQuestionAt(
															document,
															index,
															{ choices },
														),
													);
												}}
											>
												{__(
													'Add choice',
													's2j-webinar-survey',
												)}
											</Button>
											{hasDraftConnector && (
												<Button
													variant="secondary"
													disabled={draftBusy !== null}
													isBusy={
														draftBusy ===
														`choices-${index}`
													}
													onClick={() => {
														void runDraft(
															'choices',
															index,
														);
													}}
												>
													{__(
														'Draft choices',
														's2j-webinar-survey',
													)}
												</Button>
											)}
										</div>
									)}
									{kind === 'rating' && (
										<>
											<TextControl
												label={__(
													'Score minimum',
													's2j-webinar-survey',
												)}
												type="number"
												value={String(q.score_min ?? 1)}
												onChange={(value) =>
													onChangeDocument(
														updateQuestionAt(
															document,
															index,
															{
																score_min: parseInt(
																	value,
																	10,
																),
															},
														),
													)
												}
											/>
											<TextControl
												label={__(
													'Score maximum',
													's2j-webinar-survey',
												)}
												type="number"
												value={String(q.score_max ?? 5)}
												onChange={(value) =>
													onChangeDocument(
														updateQuestionAt(
															document,
															index,
															{
																score_max: parseInt(
																	value,
																	10,
																),
															},
														),
													)
												}
											/>
											<TextControl
												label={__(
													'Low label',
													's2j-webinar-survey',
												)}
												value={q.label_low ?? ''}
												onChange={(label_low) =>
													onChangeDocument(
														updateQuestionAt(
															document,
															index,
															{ label_low },
														),
													)
												}
											/>
											<TextControl
												label={__(
													'High label',
													's2j-webinar-survey',
												)}
												value={q.label_high ?? ''}
												onChange={(label_high) =>
													onChangeDocument(
														updateQuestionAt(
															document,
															index,
															{ label_high },
														),
													)
												}
											/>
										</>
									)}
									{draftError && expandedIndex === index && (
										<p className="s2j-webinar-survey-questions__error">
											{draftError}
										</p>
									)}
									{expandedIndex === index &&
										draftFocusIndex === index &&
										inlineCandidates.length > 0 && (
											<ul className="s2j-webinar-survey-questions__drafts">
												{inlineCandidates.map(
													(candidate, ci) => (
														<li key={`dc-${ci}`}>
															<span>
																{kind ===
																'choices'
																	? (
																			candidate.choices as string[]
																		)?.join(
																			', ',
																		)
																	: candidatePreview(
																			normalizeQuestion(
																				candidate,
																			),
																		)}
															</span>
															<Button
																variant="secondary"
																size="small"
																onClick={() => {
																	if (
																		kind ===
																		'choices'
																	) {
																		onChangeDocument(
																			applyChoicesFromCandidate(
																				document,
																				index,
																				candidate,
																			),
																		);
																	} else {
																		onChangeDocument(
																			applyPromptFromCandidate(
																				document,
																				index,
																				candidate,
																			),
																		);
																	}
																	setInlineCandidates(
																		[],
																	);
																	onDraftApplied();
																}}
															>
																{__(
																	'Use this draft',
																	's2j-webinar-survey',
																)}
															</Button>
														</li>
													),
												)}
											</ul>
										)}
								</div>
							)}
						</div>
					);
				})
			)}
			<Button variant="primary" onClick={addQuestion}>
				{__('Add question', 's2j-webinar-survey')}
			</Button>
		</div>
	);
}

function applyPromptFromCandidate(
	document: SurveyDocument,
	index: number,
	candidate: DraftCandidate,
): SurveyDocument {
	const questions = [...(document.questions ?? [])];
	questions[index] = normalizeQuestion(candidate);
	return { ...document, questions };
}

function applyChoicesFromCandidate(
	document: SurveyDocument,
	index: number,
	candidate: DraftCandidate,
): SurveyDocument {
	const questions = [...(document.questions ?? [])];
	const current = questions[index];
	const choicesRaw = candidate.choices;
	const choices = Array.isArray(choicesRaw)
		? choicesRaw.filter((c): c is string => typeof c === 'string')
		: [];
	questions[index] = {
		...current,
		choices: choices.length >= 2 ? choices : current?.choices,
	};
	return { ...document, questions };
}
