import { userById } from '$lib/data/mock';
import { session } from '$lib/demo-state.svelte';
import type {
	BlogComment,
	BlogPost,
	BlogSettings,
	ContactSubmission,
	TopicFollow
} from '$lib/types/blog';

const AUTHOR_ID = 'user-alex';

function nid(): string {
	return crypto.randomUUID();
}

function nowIso(): string {
	return new Date().toISOString();
}

/** When true, simulates a non–PLANET web visitor (US-35, US-40) */
export const blogView = $state({ asWebVisitor: false });

export const settings = $state<BlogSettings>({
	slug: 'alexrivera',
	title: "Alex's corner",
	tagline: 'Decentralised networking, one connection at a time.',
	bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
	logoUrl: userById(AUTHOR_ID)?.avatarUrl ?? '',
	authorDisplayName: 'Alex Rivera',
	authorBio:
		'PLANET member building tools for verifiable trust. Profile synced from PLANET (mock bidirectional sync).',
	authorLinks: [
		{ label: 'PLANET', url: 'https://planetnetwork.app' },
		{ label: 'GitHub', url: 'https://github.com' }
	],
	contactFormEnabled: true,
	commentsGloballyEnabled: true,
	setupWizardCompleted: true
});

export const posts = $state<BlogPost[]>([
	{
		id: 'post-1',
		title: 'Why verifiable introductions matter',
		subtitle: 'A short manifesto',
		bodyMd:
			'## Trust at the edge\n\n**Introductions** are more than messages — they are *commitments*. On PLANET, every published post is signed with your DID.\n\n> Credibility compounds when authenticity is the default.',
		featuredImageUrl:
			'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
		inlineImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
		inlineImageCaption: 'Your keys, your words.',
		hashtags: ['planet', 'trust', 'network'],
		visibility: 'public',
		signed: true,
		signatureRef: 'did:planet:alex…f3a2',
		publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
		commentsEnabled: true
	},
	{
		id: 'post-2',
		title: 'Members-only roadmap notes',
		subtitle: 'For PLANET members',
		bodyMd: '### Q2 focus\n\n- Feed app integration\n- **Topic follows** per blogger',
		featuredImageUrl:
			'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
		hashtags: ['planet', 'roadmap'],
		visibility: 'members',
		signed: true,
		signatureRef: 'did:planet:alex…b91c',
		publishedAt: new Date(Date.now() - 86400000).toISOString(),
		commentsEnabled: true
	},
	{
		id: 'post-draft-1',
		title: 'Draft: hosting images',
		bodyMd: 'Still thinking about *author-owned storage*…',
		hashtags: ['infra'],
		visibility: 'draft',
		signed: false,
		commentsEnabled: false
	}
]);

export const comments = $state<BlogComment[]>([
	{
		id: 'c-1',
		postId: 'post-1',
		authorId: 'user-blake',
		body: 'This resonates — thanks for publishing on PLANET.',
		createdAt: new Date(Date.now() - 3600000).toISOString()
	}
]);

export const contactInbox = $state<ContactSubmission[]>([]);

export const follows = $state<TopicFollow[]>([]);

export const editor = $state({
	postId: '' as string | undefined,
	title: '',
	subtitle: '',
	bodyMd: '',
	featuredImageUrl: '',
	hashtags: '',
	visibility: 'public' as import('$lib/types/blog').PostVisibility,
	commentsEnabled: true
});

export function isAuthor(): boolean {
	return session.currentUserId === AUTHOR_ID;
}

export function canReadPost(post: BlogPost, forManagement = false): boolean {
	if (forManagement && isAuthor()) return true;
	if (post.visibility === 'draft') return isAuthor();
	if (post.visibility === 'members') {
		if (blogView.asWebVisitor) return false;
		return true;
	}
	return true;
}

export function visiblePostsForReader(): BlogPost[] {
	return posts.filter((p) => {
		if (p.visibility === 'draft') return false;
		return canReadPost(p);
	});
}

export function postsForManage(): BlogPost[] {
	return [...posts].sort((a, b) => {
		const ta = a.publishedAt ?? a.editedAt ?? '';
		const tb = b.publishedAt ?? b.editedAt ?? '';
		return tb.localeCompare(ta);
	});
}

export function completeSetupWizard(): void {
	settings.setupWizardCompleted = true;
}

export function patchSettings(p: Partial<BlogSettings>): void {
	Object.assign(settings, p);
}

export function resetEditor(): void {
	editor.postId = undefined;
	editor.title = '';
	editor.subtitle = '';
	editor.bodyMd = '';
	editor.featuredImageUrl = '';
	editor.hashtags = '';
	editor.visibility = 'public';
	editor.commentsEnabled = true;
}

export function loadEditor(post: BlogPost): void {
	editor.postId = post.id;
	editor.title = post.title;
	editor.subtitle = post.subtitle ?? '';
	editor.bodyMd = post.bodyMd;
	editor.featuredImageUrl = post.featuredImageUrl ?? '';
	editor.hashtags = post.hashtags.join(' ');
	editor.visibility = post.visibility;
	editor.commentsEnabled = post.commentsEnabled;
}

function tagsFromEditor(): string[] {
	return editor.hashtags
		.split(/[\s,]+/)
		.map((t) => t.replace(/^#/, '').trim().toLowerCase())
		.filter(Boolean);
}

export function saveDraftFromEditor(): BlogPost | null {
	const tags = tagsFromEditor();
	const id = editor.postId ?? nid();
	const existing = posts.find((p) => p.id === id);
	const row: BlogPost = {
		id,
		title: editor.title.trim() || 'Untitled draft',
		subtitle: editor.subtitle.trim() || undefined,
		bodyMd: editor.bodyMd,
		featuredImageUrl: editor.featuredImageUrl.trim() || undefined,
		hashtags: tags,
		visibility: 'draft',
		signed: existing?.signed ?? false,
		signatureRef: existing?.signatureRef,
		publishedAt: existing?.publishedAt,
		editedAt: existing?.editedAt,
		commentsEnabled: editor.commentsEnabled
	};
	if (existing) {
		const i = posts.findIndex((p) => p.id === id);
		posts[i] = row;
	} else {
		posts.unshift(row);
	}
	editor.postId = id;
	return row;
}

export function signAndPublishFromEditor(): BlogPost | null {
	const tags = tagsFromEditor();
	const id = editor.postId ?? nid();
	const existing = posts.find((p) => p.id === id);
	let vis = editor.visibility;
	if (vis === 'draft') vis = 'public';
	const wasPublished = !!existing?.publishedAt;
	const row: BlogPost = {
		id,
		title: editor.title.trim() || 'Untitled',
		subtitle: editor.subtitle.trim() || undefined,
		bodyMd: editor.bodyMd,
		featuredImageUrl: editor.featuredImageUrl.trim() || undefined,
		hashtags: tags,
		visibility: vis,
		signed: true,
		signatureRef: `did:planet:${settings.slug}…${nid().slice(0, 4)}`,
		publishedAt: wasPublished ? existing!.publishedAt! : nowIso(),
		editedAt: wasPublished ? nowIso() : undefined,
		commentsEnabled: editor.commentsEnabled
	};
	if (existing) {
		const i = posts.findIndex((p) => p.id === id);
		posts[i] = row;
	} else {
		posts.unshift(row);
	}
	resetEditor();
	return row;
}

export function deletePost(postId: string): void {
	const i = posts.findIndex((p) => p.id === postId);
	if (i !== -1) posts.splice(i, 1);
	comments.splice(
		0,
		comments.length,
		...comments.filter((c) => c.postId !== postId)
	);
}

export function commentsForPost(postId: string): BlogComment[] {
	return comments.filter((c) => c.postId === postId);
}

export function addComment(postId: string, body: string, parentId?: string): void {
	if (blogView.asWebVisitor) return;
	const uid = session.currentUserId;
	const post = posts.find((p) => p.id === postId);
	if (!post?.commentsEnabled || !settings.commentsGloballyEnabled) return;
	comments.push({
		id: nid(),
		postId,
		authorId: uid,
		body: body.trim(),
		createdAt: nowIso(),
		parentId
	});
}

export function deleteComment(commentId: string): void {
	if (!isAuthor()) return;
	const i = comments.findIndex((c) => c.id === commentId);
	if (i !== -1) comments.splice(i, 1);
}

export function submitContact(
	name: string,
	email: string,
	message: string,
	honeypot: string
): boolean {
	if (honeypot.trim() !== '') return false;
	if (!settings.contactFormEnabled) return false;
	contactInbox.unshift({
		id: nid(),
		name: name.trim(),
		email: email.trim(),
		message: message.trim(),
		createdAt: nowIso()
	});
	return true;
}

export function followAll(): void {
	if (blogView.asWebVisitor) return;
	const uid = session.currentUserId;
	if (follows.some((f) => f.followerId === uid && f.scope === 'all')) return;
	follows.push({ id: nid(), followerId: uid, scope: 'all' });
}

export function followHashtag(tag: string): void {
	if (blogView.asWebVisitor) return;
	const uid = session.currentUserId;
	const t = tag.replace(/^#/, '').toLowerCase();
	if (follows.some((f) => f.followerId === uid && f.scope === 'hashtag' && f.hashtag === t)) return;
	follows.push({ id: nid(), followerId: uid, scope: 'hashtag', hashtag: t });
}

export function unfollow(followId: string): void {
	const i = follows.findIndex((f) => f.id === followId);
	if (i !== -1) follows.splice(i, 1);
}

export function followsForCurrentMember(): TopicFollow[] {
	return follows.filter((f) => f.followerId === session.currentUserId);
}

export function rssUrl(): string {
	return `https://planetnetwork.app/blog/${settings.slug}/rss`;
}
