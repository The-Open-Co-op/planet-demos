import { DEMO_USERS, contactsForViewer, userById } from '$lib/data/mock';
import type {
	AppNotification,
	Chat,
	ChatMessage,
	Introduction,
	IntroductionDraft,
	User
} from '$lib/types';

function nowIso(): string {
	return new Date().toISOString();
}

function nid(): string {
	return crypto.randomUUID();
}

/** Current demo persona — mutate only via `setPersona` */
export const session = $state<{ currentUserId: string }>({
	currentUserId: DEMO_USERS[0].id
});

export const introductions = $state<Introduction[]>([]);

export const notifications = $state<AppNotification[]>([]);

export const chats = $state<Chat[]>([]);

export const messagesByChatId = $state<Record<string, ChatMessage[]>>({});

export const draft = $state<IntroductionDraft>({
	step: 'compose',
	selectedUserIds: [],
	message: ''
});

function pushNotification(n: Omit<AppNotification, 'id' | 'createdAt'> & { createdAt?: string }): void {
	notifications.unshift({
		...n,
		id: nid(),
		createdAt: n.createdAt ?? nowIso()
	});
}

function allIntroducedAccepted(intro: Introduction): boolean {
	return intro.introducedUserIds.every((id) => intro.consents[id] === 'accepted');
}

function createChatFromIntro(intro: Introduction): void {
	const participantIds = [intro.introducerId, ...intro.introducedUserIds];
	chats.push({
		id: intro.id,
		introductionId: intro.id,
		participantIds
	});
	const welcome: ChatMessage = {
		id: nid(),
		chatId: intro.id,
		kind: 'system',
		body: 'Group chat started.',
		createdAt: nowIso()
	};
	messagesByChatId[intro.id] = [welcome];
}

export function getUser(id: string): User | undefined {
	return userById(id);
}

export function currentUser(): User {
	return userById(session.currentUserId) ?? DEMO_USERS[0];
}

export function viewerContacts(): User[] {
	return contactsForViewer(session.currentUserId);
}

export function setPersona(userId: string): void {
	if (!DEMO_USERS.some((u) => u.id === userId)) return;
	session.currentUserId = userId;
}

export function toggleDraftContact(userId: string): void {
	const set = new Set(draft.selectedUserIds);
	if (set.has(userId)) set.delete(userId);
	else set.add(userId);
	draft.selectedUserIds = [...set];
}

export function setDraftMessage(text: string): void {
	draft.message = text;
}

export function setComposeStep(step: IntroductionDraft['step']): void {
	draft.step = step;
}

export function resetDraft(): void {
	draft.step = 'compose';
	draft.selectedUserIds = [];
	draft.message = '';
}

export function sendIntroduction(): Introduction | null {
	if (draft.selectedUserIds.length < 2) return null;
	const text = draft.message.trim();
	if (!text) return null;

	const intro: Introduction = {
		id: nid(),
		message: text,
		introducerId: session.currentUserId,
		introducedUserIds: [...draft.selectedUserIds],
		status: 'pending_consent',
		consents: Object.fromEntries(draft.selectedUserIds.map((id) => [id, 'pending'])),
		introducerInChat: true,
		valuableByUserId: {},
		createdAt: nowIso(),
		bowOutPromptDismissed: false
	};
	introductions.unshift(intro);

	const introCopy = intro;
	const names = intro.introducedUserIds
		.map((id) => userById(id)?.displayName ?? id)
		.join(', ');

	pushNotification({
		userId: session.currentUserId,
		kind: 'intro_sent',
		title: 'Introduction requests sent',
		body: `Waiting for consent from ${names}.`,
		introductionId: introCopy.id
	});

	for (const uid of intro.introducedUserIds) {
		pushNotification({
			userId: uid,
			kind: 'intro_invite',
			title: 'Introduction request',
			body: `${userById(intro.introducerId)?.displayName ?? 'Someone'} wants to introduce you to others on PLANET.`,
			introductionId: introCopy.id,
			pendingConsent: true
		});
	}

	resetDraft();
	return introCopy;
}

export function respondToInvite(introductionId: string, accept: boolean): void {
	const intro = introductions.find((i) => i.id === introductionId);
	if (!intro || intro.status !== 'pending_consent') return;
	const uid = session.currentUserId;
	if (!intro.introducedUserIds.includes(uid)) return;

	if (accept) {
		intro.consents[uid] = 'accepted';
		const inviteIdx = notifications.findIndex(
			(n) =>
				n.userId === uid && n.introductionId === introductionId && n.kind === 'intro_invite'
		);
		if (inviteIdx !== -1) {
			const prev = notifications[inviteIdx];
			notifications[inviteIdx] = { ...prev, pendingConsent: false };
		}
		const accepter = userById(uid);
		pushNotification({
			userId: intro.introducerId,
			kind: 'vec_low_weight',
			title: 'Low-weight introducer VEC issued',
			body: `${accepter?.displayName ?? 'A member'} accepted — credential issued.`,
			introductionId
		});

		if (allIntroducedAccepted(intro)) {
			intro.status = 'active';
			createChatFromIntro(intro);
			for (let i = 0; i < notifications.length; i++) {
				const n = notifications[i];
				if (n.introductionId === introductionId && n.kind === 'intro_invite') {
					notifications[i] = { ...n, pendingConsent: false };
				}
			}
			const title = 'Everyone accepted';
			const body = 'The group introduction chat is ready.';
			for (const pid of [intro.introducerId, ...intro.introducedUserIds]) {
				pushNotification({
					userId: pid,
					kind: 'intro_all_accepted',
					title,
					body,
					introductionId
				});
			}
		}
	} else {
		intro.consents[uid] = 'declined';
		intro.status = 'declined';
		intro.declinedByUserId = uid;
		const decliner = userById(uid);

		pushNotification({
			userId: intro.introducerId,
			kind: 'intro_declined_for_introducer',
			title: 'Introduction declined',
			body: `${decliner?.displayName ?? 'An introduced party'} declined. No group chat was created.`,
			introductionId
		});

		// Remove pending invites for this intro; tell other peers without naming the decliner
		const filtered = notifications.filter(
			(n) => !(n.introductionId === introductionId && n.kind === 'intro_invite')
		);
		notifications.splice(0, notifications.length, ...filtered);

		for (const otherId of intro.introducedUserIds) {
			if (otherId === uid) continue;
			pushNotification({
				userId: otherId,
				kind: 'intro_peer_cancelled',
				title: 'Introduction closed',
				body: 'This introduction is no longer available. No one is named as having declined.',
				introductionId
			});
		}
	}

}

export function chatForIntroduction(introductionId: string): Chat | undefined {
	return chats.find((c) => c.introductionId === introductionId);
}

export function chatMessages(chatId: string): ChatMessage[] {
	return messagesByChatId[chatId] ?? [];
}

export function postChatMessage(chatId: string, body: string): void {
	const list = messagesByChatId[chatId];
	if (!list) return;
	list.push({
		id: nid(),
		chatId,
		kind: 'user',
		authorId: session.currentUserId,
		body,
		createdAt: nowIso()
	});
}

export function dismissBowOutPrompt(introductionId: string): void {
	const intro = introductions.find((i) => i.id === introductionId);
	if (intro) intro.bowOutPromptDismissed = true;
}

export function bowOut(introductionId: string): void {
	const intro = introductions.find((i) => i.id === introductionId);
	if (!intro || intro.introducerId !== session.currentUserId) return;
	const chat = chatForIntroduction(introductionId);
	if (!chat) return;

	intro.introducerInChat = false;
	intro.bowOutPromptDismissed = true;
	chat.participantIds = chat.participantIds.filter((id) => id !== intro.introducerId);

	const name = userById(intro.introducerId)?.displayName ?? 'The introducer';
	const sys: ChatMessage = {
		id: nid(),
		chatId: chat.id,
		kind: 'system',
		body: `${name} has stepped back from this conversation`,
		createdAt: nowIso()
	};
	messagesByChatId[chat.id] = [...(messagesByChatId[chat.id] ?? []), sys];
}

export function shouldShowBowOutPrompt(introductionId: string): boolean {
	const intro = introductions.find((i) => i.id === introductionId);
	if (!intro || intro.introducerId !== session.currentUserId) return false;
	if (intro.status !== 'active' || !intro.introducerInChat) return false;
	return !intro.bowOutPromptDismissed;
}

export function markValuable(introductionId: string): void {
	const intro = introductions.find((i) => i.id === introductionId);
	if (!intro || intro.status !== 'active') return;
	const uid = session.currentUserId;
	if (!intro.introducedUserIds.includes(uid)) return;
	if (intro.valuableByUserId[uid]) return;

	intro.valuableByUserId[uid] = true;
	const actor = userById(uid);
	pushNotification({
		userId: intro.introducerId,
		kind: 'intro_valuable',
		title: 'Introduction marked valuable',
		body: `${actor?.displayName ?? 'Someone'} marked your introduction as valuable — weightier VEC issued.`,
		introductionId
	});
}

/** US-10 — mock downstream intro; ripple goes to original introducer only */
export function triggerRippleDemo(seedIntroducerId: string, downstreamName: string): void {
	pushNotification({
		userId: seedIntroducerId,
		kind: 'ripple',
		title: 'Network ripple',
		body: `${downstreamName} made an introduction — you seeded their network`,
		introductionId: undefined
	});
}

function seedSampleNotifications(): void {
	for (const u of DEMO_USERS) {
		pushNotification({
			userId: u.id,
			kind: 'connection_sample',
			title: 'Sample: connection request',
			body: 'This is a generic alert to contrast with introduction alerts (US-05).',
			createdAt: new Date(Date.now() - 86400000).toISOString()
		});
	}
}

seedSampleNotifications();
