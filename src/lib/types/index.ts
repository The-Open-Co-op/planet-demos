/** PLANET member in the demo */
export interface User {
	id: string;
	displayName: string;
	/** Without @ */
	username: string;
	avatarUrl: string;
}

export type PartyConsentStatus = 'pending' | 'accepted' | 'declined';

export type IntroductionStatus = 'pending_consent' | 'declined' | 'active';

export interface Introduction {
	id: string;
	/** Freetext from the introducer */
	message: string;
	introducerId: string;
	/** Two or more introduced members (peers — no ordering in UI) */
	introducedUserIds: string[];
	status: IntroductionStatus;
	consents: Record<string, PartyConsentStatus>;
	/** Set when status is declined; only surfaced in full to the introducer */
	declinedByUserId?: string;
	/** False after bow out */
	introducerInChat: boolean;
	/** Each introduced party may mark valuable at most once */
	valuableByUserId: Record<string, boolean>;
	createdAt: string;
	/** Shown to introducer once when all have accepted */
	bowOutPromptDismissed: boolean;
}

export type ChatMessageKind = 'user' | 'system';

export interface ChatMessage {
	id: string;
	chatId: string;
	kind: ChatMessageKind;
	/** For user messages */
	authorId?: string;
	body: string;
	createdAt: string;
}

export interface Chat {
	id: string;
	introductionId: string;
	participantIds: string[];
}

export type NotificationKind =
	| 'intro_invite'
	| 'intro_sent'
	| 'intro_peer_cancelled'
	| 'intro_declined_for_introducer'
	| 'intro_all_accepted'
	| 'intro_valuable'
	| 'ripple'
	| 'vec_low_weight'
	| 'connection_sample';

export interface AppNotification {
	id: string;
	userId: string;
	kind: NotificationKind;
	title: string;
	body: string;
	introductionId?: string;
	createdAt: string;
	/** Invite still awaiting this user's response */
	pendingConsent?: boolean;
}

export type ComposeStep = 'compose' | 'preview';

export interface IntroductionDraft {
	step: ComposeStep;
	selectedUserIds: string[];
	message: string;
}
