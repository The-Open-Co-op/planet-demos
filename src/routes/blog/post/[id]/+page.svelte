<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';
	import { renderSimpleMarkdown } from '$lib/blog-md';
	import {
		addComment,
		blogView,
		canReadPost,
		commentsForPost,
		deleteComment,
		isAuthor,
		posts,
		settings
	} from '$lib/blog-state.svelte';
	import { userById } from '$lib/data/mock';
	import { session } from '$lib/demo-state.svelte';
	import type { BlogComment, BlogPost } from '$lib/types/blog';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';
	import { BadgeCheck, ImageIcon } from '@lucide/svelte';

	const postId = $derived(page.params.id);

	const post = $derived(posts.find((p) => p.id === postId));

	let didOpen = $state(false);
	let commentBody = $state('');
	let replyTo = $state<string | undefined>(undefined);

	const canView = $derived(post ? canReadPost(post) : false);

	const htmlBody = $derived(post ? renderSimpleMarkdown(post.bodyMd) : '');

	function formatDate(iso: string | undefined): string {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function topLevel(pc: BlogComment[]): BlogComment[] {
		return pc.filter((c) => !c.parentId);
	}

	function replies(pc: BlogComment[], parentId: string): BlogComment[] {
		return pc.filter((c) => c.parentId === parentId);
	}

	function onComment(e: Event) {
		e.preventDefault();
		if (!post || blogView.asWebVisitor) return;
		const t = commentBody.trim();
		if (!t) return;
		addComment(post.id, t, replyTo);
		toast('Comment posted', {
			description: isAuthor()
				? 'Readers are notified in a full deployment (US-50).'
				: 'Author would get a notification (US-50).'
		});
		commentBody = '';
		replyTo = undefined;
	}

	function startReply(id: string) {
		replyTo = id;
	}
</script>

<svelte:head>
	<title>{post?.title ?? 'Post'} — {settings.title}</title>
</svelte:head>

{#if !post}
	<p class="text-muted-foreground text-sm">Post not found.</p>
{:else if !canView}
	<p class="text-muted-foreground text-sm">
		This post is not available. {!blogView.asWebVisitor
			? 'Try another visibility.'
			: 'Sign in as a PLANET member to read members-only posts (US-36).'}
	</p>
{:else}
	{@const pc = commentsForPost(post.id)}
	<article class="mx-auto max-w-3xl space-y-8">
		{#if post.featuredImageUrl}
			<div class="aspect-[2.2/1] w-full overflow-hidden rounded-2xl">
				<img
					src={post.featuredImageUrl}
					alt=""
					class="size-full object-cover"
					width="1200"
					height="600"
				/>
			</div>
		{/if}

		<header class="space-y-3">
			<div class="flex flex-wrap items-center gap-2">
				<time class="text-muted-foreground text-sm">{formatDate(post.publishedAt)}</time>
				{#if post.editedAt}
					<Badge variant="outline" class="text-xs">Edited {formatDate(post.editedAt)}</Badge>
				{/if}
				{#each post.hashtags as t}
					<a class="text-primary text-sm font-medium" href="/blog">#{t}</a>
				{/each}
			</div>
			<h1 class="text-3xl font-semibold tracking-tight md:text-4xl">{post.title}</h1>
			{#if post.subtitle}
				<p class="text-muted-foreground text-lg">{post.subtitle}</p>
			{/if}
			<div class="flex flex-wrap items-center gap-3">
				<div class="flex items-center gap-2">
					<Avatar.Root class="size-9">
						<Avatar.Image src={settings.logoUrl} alt="" />
						<Avatar.Fallback>AR</Avatar.Fallback>
					</Avatar.Root>
					<span class="text-sm font-medium">{settings.authorDisplayName}</span>
				</div>
				{#if post.signed}
					<Dialog.Root bind:open={didOpen}>
						<Dialog.Trigger
							type="button"
							class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1')}
						>
							<BadgeCheck class="text-primary size-4" />
							Verified
						</Dialog.Trigger>
						<Dialog.Content class="sm:max-w-md">
							<Dialog.Header>
								<Dialog.Title>Signature details</Dialog.Title>
								<Dialog.Description>
									US-27 — US-29. Independent verification would use your PLANET tooling.
								</Dialog.Description>
							</Dialog.Header>
							<dl class="font-mono space-y-2 text-xs">
								<div>
									<dt class="text-muted-foreground">DID</dt>
									<dd>did:planet:{settings.slug}</dd>
								</div>
								<div>
									<dt class="text-muted-foreground">Signature ref</dt>
									<dd class="break-all">{post.signatureRef ?? '—'}</dd>
								</div>
							</dl>
						</Dialog.Content>
					</Dialog.Root>
				{/if}
			</div>
		</header>

		<div class="max-w-none text-[1.05rem] leading-relaxed [&_strong]:font-semibold">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html htmlBody}
		</div>

		{#if post.inlineImageUrl}
			<figure class="space-y-2">
				<div
					class="border-border bg-muted/20 flex aspect-video items-center justify-center overflow-hidden rounded-xl border"
				>
					<img src={post.inlineImageUrl} alt="" class="max-h-[420px] object-contain" />
				</div>
				{#if post.inlineImageCaption}
					<figcaption class="text-muted-foreground flex items-center gap-1 text-sm">
						<ImageIcon class="size-3.5 shrink-0" />
						{post.inlineImageCaption}
					</figcaption>
				{/if}
			</figure>
		{/if}

		<Separator />

		<section class="space-y-4" aria-labelledby="comments-heading">
			<h2 id="comments-heading" class="text-lg font-semibold">
				Comments
				{#if !settings.commentsGloballyEnabled || !post.commentsEnabled}
					<span class="text-muted-foreground text-sm font-normal">— disabled</span>
				{/if}
			</h2>
			{#if blogView.asWebVisitor}
				<p class="text-muted-foreground text-sm">PLANET members can comment (US-48, US-49).</p>
			{:else if !settings.commentsGloballyEnabled || !post.commentsEnabled}
				<p class="text-muted-foreground text-sm">Comments are turned off for this post or blog (US-53).</p>
			{:else}
				<ul class="space-y-4">
					{#each topLevel(pc) as c}
						<li class="border-border rounded-lg border p-3">
							<div class="flex items-start justify-between gap-2">
								<div>
									<p class="text-sm font-medium">
										{userById(c.authorId)?.displayName ?? 'Member'}
									</p>
									<p class="text-muted-foreground text-xs">
										{formatDate(c.createdAt)}
									</p>
								</div>
								{#if isAuthor()}
									<Button variant="ghost" size="sm" class="h-7 text-xs" onclick={() => deleteComment(c.id)}>
										Delete
									</Button>
								{/if}
							</div>
							<p class="mt-2 text-sm whitespace-pre-wrap">{c.body}</p>
							<Button variant="link" size="sm" class="mt-1 h-7 px-0 text-xs" onclick={() => startReply(c.id)}>
								Reply
							</Button>
							{#if replies(pc, c.id).length > 0}
								<ul class="border-border mt-3 space-y-2 border-l-2 pl-4">
									{#each replies(pc, c.id) as r}
										<li>
											<p class="text-xs font-medium">
												{userById(r.authorId)?.displayName}
											</p>
											<p class="text-sm">{r.body}</p>
											{#if isAuthor()}
												<Button
													variant="ghost"
													size="sm"
													class="h-6 text-xs"
													onclick={() => deleteComment(r.id)}
												>
													Delete
												</Button>
											{/if}
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>

				<Card>
					<CardContent class="pt-6">
						<form class="space-y-3" onsubmit={onComment}>
							{#if replyTo}
								<p class="text-muted-foreground text-xs">
									Replying to comment — <button type="button" class="text-primary underline" onclick={() => (replyTo = undefined)}>cancel</button>
								</p>
							{/if}
							<Textarea
								placeholder="Write a comment as {userById(session.currentUserId)?.displayName ?? 'you'}…"
								bind:value={commentBody}
								rows={3}
							/>
							<Button type="submit" size="sm">Post comment</Button>
						</form>
					</CardContent>
				</Card>
			{/if}
		</section>

		<p class="text-center">
			<Button variant="ghost" href="/blog">← Back to blog</Button>
		</p>
	</article>
{/if}
