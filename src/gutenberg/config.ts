export type SurveyEditorConfig = {
	restNamespace: string;
	metaKey: string;
	hasDraftConnector: boolean;
	connectorsSettingsUrl: string;
	maxQuestions: number;
};

export function getSurveyEditorConfig(): SurveyEditorConfig {
	const fromWindow = window.s2jWebinarSurvey;
	const maxRaw = fromWindow?.maxQuestions;
	const maxQuestions =
		typeof maxRaw === 'number' && maxRaw >= 1 ? maxRaw : 6;
	return {
		restNamespace: fromWindow?.restNamespace ?? 's2j-webinar-survey/v1',
		metaKey: fromWindow?.metaKey ?? '_s2j_webinar_survey',
		hasDraftConnector: Boolean(fromWindow?.hasDraftConnector),
		connectorsSettingsUrl:
			fromWindow?.connectorsSettingsUrl ?? '/wp-admin/options-general.php',
		maxQuestions,
	};
}
