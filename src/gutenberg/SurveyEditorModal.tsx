import {
	Button,
	Modal,
	Notice,
	Spinner,
	TabPanel,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import type { SurveyDocument } from '@/domain/document';
import { normalizeQuestion } from '@/domain/question';
import { AdviceList } from '@/gutenberg/AdviceList';
import { appendSurveyCandidate, candidatePreview } from '@/gutenberg/draftApply';
import { requestDraft, type DraftCandidate } from '@/gutenberg/draftApi';
import { fetchDisplayEvaluate, type EvaluateResult } from '@/gutenberg/evaluateApi';
import { apiErrorMessage } from '@/gutenberg/apiErrorMessage';
import { getSurveyEditorConfig } from '@/gutenberg/config';
import { QuestionsEditor } from '@/gutenberg/QuestionsEditor';

type Props = {
	postId: number;
	document: SurveyDocument;
	onChangeDocument: (next: SurveyDocument) => void;
	onClose: () => void;
};

const GUIDELINE_LINES = [
	__(
		'Avoid leading questions that push a yes/no answer or assume dissatisfaction.',
		's2j-webinar-survey',
	),
	__(
		'Avoid double-barreled questions that ask for two judgments in one sentence.',
		's2j-webinar-survey',
	),
];

export function SurveyEditorModal({
	postId,
	document,
	onChangeDocument,
	onClose,
}: Props) {
	const config = getSurveyEditorConfig();
	const documentRef = useRef(document);
	documentRef.current = document;

	const { savePost } = useDispatch('core/editor') as {
		savePost: () => Promise<void>;
	};

	const { isSavingPost, isSaveable } = useSelect((select) => {
		const editor = select('core/editor') as {
			isSavingPost?: () => boolean;
			isEditedPostSaveable?: () => boolean;
		};
		return {
			isSavingPost: editor.isSavingPost?.() ?? false,
			isSaveable: editor.isEditedPostSaveable?.() ?? true,
		};
	}, []);

	const eventTitle = useSelect((select) => {
		const editor = select('core/editor') as {
			getEditedPostAttribute?: (key: string) => unknown;
		};
		const title = editor.getEditedPostAttribute?.('title');
		return typeof title === 'string' ? title : '';
	}, []);

	const [evaluateBusy, setEvaluateBusy] = useState(false);
	const [evaluateError, setEvaluateError] = useState<string | null>(null);
	const [evaluateResult, setEvaluateResult] = useState<EvaluateResult | null>(
		null,
	);
	const [evaluateToken, setEvaluateToken] = useState(0);

	const [surveyDraftBusy, setSurveyDraftBusy] = useState(false);
	const [surveyDraftError, setSurveyDraftError] = useState<string | null>(null);
	const [surveyCandidates, setSurveyCandidates] = useState<DraftCandidate[]>(
		[],
	);

	const runDisplayEvaluate = () => {
		setEvaluateToken((t) => t + 1);
	};

	useEffect(() => {
		if (postId <= 0) {
			return;
		}
		let cancelled = false;
		setEvaluateBusy(true);
		setEvaluateError(null);

		fetchDisplayEvaluate(postId, documentRef.current)
			.then((result) => {
				if (!cancelled) {
					setEvaluateResult(result);
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setEvaluateError(
						apiErrorMessage(
							err,
							__('Evaluation request failed.', 's2j-webinar-survey'),
						),
					);
					setEvaluateResult(null);
				}
			})
			.finally(() => {
				if (!cancelled) {
					setEvaluateBusy(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [postId, evaluateToken]);

	const questionCount = document.questions?.length ?? 0;
	const canSurveyDraft =
		config.hasDraftConnector && questionCount < config.maxQuestions;

	const requestSurveyDraft = async () => {
		setSurveyDraftBusy(true);
		setSurveyDraftError(null);
		setSurveyCandidates([]);
		try {
			const candidates = await requestDraft({
				postId,
				kind: 'survey',
				document,
				eventTitle,
			});
			setSurveyCandidates(candidates);
		} catch (err: unknown) {
			setSurveyDraftError(
				apiErrorMessage(
					err,
					__('Draft request failed.', 's2j-webinar-survey'),
				),
			);
		} finally {
			setSurveyDraftBusy(false);
		}
	};

	const tabs = [
		{
			name: 'questions',
			title: __('Questions', 's2j-webinar-survey'),
		},
		{
			name: 'advice',
			title: __('Advice', 's2j-webinar-survey'),
		},
		{
			name: 'draft',
			title: __('Draft', 's2j-webinar-survey'),
		},
	];

	return (
		<Modal
			title={__('S2J Webinar Survey', 's2j-webinar-survey')}
			onRequestClose={onClose}
			className="s2j-webinar-survey-modal"
			size="large"
		>
			<TabPanel tabs={tabs}>
				{(tab) => {
					if (tab.name === 'questions') {
						return (
							<div className="s2j-webinar-survey-modal__tab">
								<Notice status="info" isDismissible={false}>
									<strong>
										{__('Design guidelines', 's2j-webinar-survey')}
									</strong>
									<ul className="s2j-webinar-survey-modal__guidelines">
										{GUIDELINE_LINES.map((line) => (
											<li key={line}>{line}</li>
										))}
									</ul>
								</Notice>
								<TextControl
									label={__(
										'Internal name',
										's2j-webinar-survey',
									)}
									help={__(
										'Not shown to respondents. Used on webinar provider admin lists when the survey is attached.',
										's2j-webinar-survey',
									)}
									value={document.internal_name ?? ''}
									onChange={(internal_name) =>
										onChangeDocument({ ...document, internal_name })
									}
								/>
								<QuestionsEditor
									postId={postId}
									eventTitle={eventTitle}
									document={document}
									onChangeDocument={onChangeDocument}
									hasDraftConnector={config.hasDraftConnector}
									maxQuestions={config.maxQuestions}
									onDraftApplied={runDisplayEvaluate}
								/>
							</div>
						);
					}
					if (tab.name === 'advice') {
						return (
							<div className="s2j-webinar-survey-modal__tab">
								{evaluateBusy && (
									<p>
										<Spinner />
										{__('Evaluating…', 's2j-webinar-survey')}
									</p>
								)}
								{evaluateError && (
									<Notice status="error" isDismissible={false}>
										{evaluateError}
									</Notice>
								)}
								{!evaluateBusy && !evaluateError && evaluateResult && (
									<AdviceList
										deficiencies={evaluateResult.deficiencies}
										advice={evaluateResult.advice}
									/>
								)}
								<Button
									variant="secondary"
									onClick={runDisplayEvaluate}
									disabled={evaluateBusy}
								>
									{__('Refresh advice', 's2j-webinar-survey')}
								</Button>
							</div>
						);
					}
					return (
						<div className="s2j-webinar-survey-modal__tab">
							{!config.hasDraftConnector ? (
								<Notice status="warning" isDismissible={false}>
									{__(
										'Draft suggestions require an AI connector. Configure one under Settings → Connectors.',
										's2j-webinar-survey',
									)}{' '}
									<a href={config.connectorsSettingsUrl}>
										{__('Open settings', 's2j-webinar-survey')}
									</a>
								</Notice>
							) : (
								<>
									<p className="description">
										{__(
											'Each draft request calls the connector once. Nothing is saved until you update the event.',
											's2j-webinar-survey',
										)}
									</p>
									{canSurveyDraft ? (
										<Button
											variant="primary"
											onClick={() => {
												void requestSurveyDraft();
											}}
											isBusy={surveyDraftBusy}
											disabled={surveyDraftBusy}
										>
											{__(
												'Suggest question drafts',
												's2j-webinar-survey',
											)}
										</Button>
									) : (
										<p className="description">
											{__(
												'Question limit reached; survey drafts are hidden.',
												's2j-webinar-survey',
											)}
										</p>
									)}
									{surveyDraftError && (
										<Notice status="error" isDismissible={false}>
											{surveyDraftError}
										</Notice>
									)}
									{surveyCandidates.length > 0 && (
										<ul className="s2j-webinar-survey-modal__draft-list">
											{surveyCandidates.map((candidate, index) => (
												<li key={`survey-${index}`}>
													<span>
														{candidatePreview(
															normalizeQuestion(candidate),
														)}
													</span>
													<Button
														variant="secondary"
														size="small"
														onClick={() => {
															onChangeDocument(
																appendSurveyCandidate(
																	document,
																	candidate,
																),
															);
															runDisplayEvaluate();
														}}
													>
														{__(
															'Add this question',
															's2j-webinar-survey',
														)}
													</Button>
												</li>
											))}
										</ul>
									)}
									<p className="description">
										{__(
											'Per-question prompt and choice drafts are on the Questions tab.',
											's2j-webinar-survey',
										)}
									</p>
								</>
							)}
						</div>
					);
				}}
			</TabPanel>
			<div className="s2j-webinar-survey-modal__footer">
				<p className="description">
					{__(
						'Update saves the event and survey now (evaluation runs on the server). You can save first and check Advice later, or Close to keep editing without saving.',
						's2j-webinar-survey',
					)}
				</p>
				<div className="s2j-webinar-survey-modal__footer-actions">
					<Button variant="secondary" onClick={onClose}>
						{__('Close', 's2j-webinar-survey')}
					</Button>
					<Button
						variant="primary"
						onClick={() => {
							void savePost();
						}}
						isBusy={isSavingPost}
						disabled={!isSaveable || isSavingPost}
					>
						{__('Update', 's2j-webinar-survey')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
