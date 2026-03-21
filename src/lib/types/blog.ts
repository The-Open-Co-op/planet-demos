export type PostVisibility = 'public' | 'members' | 'draft';

export interface BlogPost {
	id: string;
	title: string;
	subtitle?: string;
	/** Stored as markdown (WYSIWYG saves as MD in the background) */
	bodyMd: string;
	featuredImageUrl?: string;
	inlineImageUrl?: string;
	inlineImageCaption?: string;
	hashtags: string[];
	visibility: PostVisibility;
	signed: boolean;
	/** Mock DID / signature id */
	signatureRef?: string;
	publishedAt?: string;
	editedAt?: string;
	commentsEnabled: boolean;
}

export interface BlogSettings {
	slug: string;
	title: string;
	tagline: string;
	bannerUrl: string;
	logoUrl: string;
	/** Synced from PLANET profile (mock) */
	authorDisplayName: string;
	authorBio: string;
	authorLinks: { label: string; url: string }[];
	contactFormEnabled: boolean;
	commentsGloballyEnabled: boolean;
	setupWizardCompleted: boolean;
}

export interface BlogComment {
	id: string;
	postId: string;
	authorId: string;
	body: string;
	createdAt: string;
	parentId?: string;
}

export interface ContactSubmission {
	id: string;
	name: string;
	email: string;
	message: string;
	createdAt: string;
}

export type FollowScope = 'all' | 'hashtag';

export interface TopicFollow {
	id: string;
	followerId: string;
	scope: FollowScope;
	hashtag?: string;
}
