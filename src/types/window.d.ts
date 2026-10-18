export {};

declare global {
	interface Window {
		s2jWebinarSurvey?: {
			restNamespace?: string;
			metaKey?: string;
			hasDraftConnector?: boolean;
			connectorsSettingsUrl?: string;
			maxQuestions?: number;
		};
	}
}
