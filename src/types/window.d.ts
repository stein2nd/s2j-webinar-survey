export {};

declare global {
	interface Window {
		s2jWebinarSurvey?: {
			restNamespace?: string;
			metaKey?: string;
			hasDraftConnector?: boolean;
			connectorsSettingsUrl?: string;
			maxQuestions?: number;
			s2jWebinarInstalled?: boolean;
			s2jWebinarActive?: boolean;
			webinarInstallGuideUrl?: string;
			webinarActivateUrl?: string;
		};
	}
}
