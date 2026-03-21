<script lang="ts">
	import { toast } from 'svelte-sonner';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';
	import { renderSimpleMarkdown } from '$lib/blog-md';
	import {
		completeSetupWizard,
		contactInbox,
		deletePost,
		editor,
		isAuthor,
		loadEditor,
		patchSettings,
		postsForManage,
		resetEditor,
		saveDraftFromEditor,
		settings,
		signAndPublishFromEditor
	} from '$lib/blog-state.svelte';
	import type { BlogPost, PostVisibility } from '$lib/types/blog';
	import { session } from '$lib/demo-state.svelte';
	import { userById } from '$lib/data/mock';
	import { cn } from '$lib/utils.js';
	import { Eye, Sparkles } from '@lucide/svelte';

	let previewOpen = $state(false);
	const previewHtml = $derived(renderSimpleMarkdown(editor.bodyMd));

	function onSaveDraft() {
		saveDraftFromEditor();
		toast('Draft saved', { description: 'US-17 — continue editing anytime.' });
	}

	function onSignPublish() {
		signAndPublishFromEditor();
		toast('Signed & published', {
			description: 'US-24 — US-26. DID signing is mocked; readers see Verified.'
		});
	}

	function visibilityLabel(v: PostVisibility): string {
		switch (v) {
			case 'public':
				return 'Public';
			case 'members':
				return 'PLANET members only';
			case 'draft':
				return 'Draft';
			default:
				return v;
		}
	}

	const managePosts = $derived(postsForManage());
</script>

<svelte:head>
	<title>Manage blog — PLANET Blog demo</title>
</svelte:head>

{#if !isAuthor()}
	<Card>
		<CardHeader>
			<CardTitle>Author tools</CardTitle>
			<CardDescription>
				This demo blog belongs to <strong>Alex Rivera</strong>. Use <strong>View as (demo)</strong> in
				the blog header and select Alex to manage settings and publish.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<p class="text-muted-foreground text-sm">
				Current viewer: {userById(session.currentUserId)?.displayName ?? 'Unknown'}
			</p>
		</CardContent>
	</Card>
{:else}
	<div class="space-y-10">
		{#if !settings.setupWizardCompleted}
			<Card class="border-primary/40 bg-primary/5">
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Sparkles class="size-5" />
						Welcome to your blog (US-1, US-59)
					</CardTitle>
					<CardDescription>
						One blog per member — auto-provisioned when you install the app. Finish this short step
						to start publishing.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onclick={() => completeSetupWizard()}>Complete setup</Button>
				</CardContent>
			</Card>
		{/if}

		<section class="space-y-4">
			<h2 class="text-lg font-semibold">Blog appearance (US-2 — US-6)</h2>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="btitle">Blog title</Label>
					<Input id="btitle" bind:value={settings.title} />
				</div>
				<div class="space-y-2">
					<Label for="btag">Tagline</Label>
					<Input id="btag" bind:value={settings.tagline} />
				</div>
				<div class="space-y-2 md:col-span-2">
					<Label for="bbanner">Banner image URL</Label>
					<Input id="bbanner" bind:value={settings.bannerUrl} />
				</div>
				<div class="space-y-2 md:col-span-2">
					<Label for="blogo">Logo / avatar URL</Label>
					<Input id="blogo" bind:value={settings.logoUrl} />
				</div>
				<div class="space-y-2 md:col-span-2">
					<Label for="bbio">Author bio (synced profile — US-7 — US-9)</Label>
					<Textarea id="bbio" rows={3} bind:value={settings.authorBio} />
				</div>
			</div>
			<div class="flex flex-wrap gap-4">
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input
						type="checkbox"
						class="border-input size-4 rounded"
						checked={settings.contactFormEnabled}
						onchange={(e) => patchSettings({ contactFormEnabled: e.currentTarget.checked })}
					/>
					Contact form enabled (US-47)
				</label>
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input
						type="checkbox"
						class="border-input size-4 rounded"
						checked={settings.commentsGloballyEnabled}
						onchange={(e) => patchSettings({ commentsGloballyEnabled: e.currentTarget.checked })}
					/>
					Comments on by default (US-53)
				</label>
			</div>
			<p class="text-muted-foreground font-mono text-xs">URL: planetnetwork.app/blog/{settings.slug}</p>
		</section>

		<Separator />

		<section class="space-y-4">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<h2 class="text-lg font-semibold">Editor (US-11 — US-21)</h2>
				<div class="flex flex-wrap gap-2">
					<Button type="button" variant="outline" size="sm" onclick={() => resetEditor()}>New post</Button>
					<Dialog.Root bind:open={previewOpen}>
						<Dialog.Trigger
							type="button"
							class={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'gap-1')}
						>
							<Eye class="size-4" />
							Preview
						</Dialog.Trigger>
						<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
							<Dialog.Header>
								<Dialog.Title>Preview (US-18)</Dialog.Title>
								<Dialog.Description>How readers see this post.</Dialog.Description>
							</Dialog.Header>
							<article class="prose-sm space-y-3">
								<h3 class="text-xl font-semibold">{editor.title || 'Untitled'}</h3>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								<div class="text-sm leading-relaxed">{@html previewHtml}</div>
							</article>
						</Dialog.Content>
					</Dialog.Root>
				</div>
			</div>

			<div class="grid gap-4 lg:grid-cols-3">
				<div class="lg:col-span-2 space-y-3">
					<div class="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => (editor.bodyMd += '**bold**')}
						>
							Bold
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => (editor.bodyMd += '*italic*')}
						>
							Italic
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => (editor.bodyMd += '\n\n## Heading\n')}
						>
							Heading
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => (editor.bodyMd += '\n\n- list item\n')}
						>
							List
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => (editor.bodyMd += '\n\n> Quote\n')}
						>
							Quote
						</Button>
					</div>
					<p class="text-muted-foreground text-xs">
						WYSIWYG saves as markdown in the background (US-11). Use shortcuts to format.
					</p>
					<div class="space-y-2">
						<Label for="etitle">Title</Label>
						<Input id="etitle" bind:value={editor.title} placeholder="Post title" />
					</div>
					<div class="space-y-2">
						<Label for="esub">Subtitle (optional)</Label>
						<Input id="esub" bind:value={editor.subtitle} />
					</div>
					<div class="space-y-2">
						<Label for="ebody">Body</Label>
						<Textarea id="ebody" rows={12} bind:value={editor.bodyMd} class="font-mono text-sm" />
					</div>
					<div class="space-y-2">
						<Label for="efeat">Featured image URL (US-13)</Label>
						<Input id="efeat" bind:value={editor.featuredImageUrl} />
					</div>
					<div class="space-y-2">
						<Label for="etags">Hashtags (US-16)</Label>
						<Input id="etags" bind:value={editor.hashtags} placeholder="planet trust network" />
					</div>
				</div>
				<div class="space-y-3">
					<div class="space-y-2">
						<Label for="evis">Visibility (US-19)</Label>
						<select
							id="evis"
							class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
							bind:value={editor.visibility}
						>
							<option value="public">Public</option>
							<option value="members">PLANET members only</option>
							<option value="draft">Draft</option>
						</select>
					</div>
					<label class="flex cursor-pointer items-center gap-2 text-sm">
						<input
							type="checkbox"
							class="border-input size-4 rounded"
							bind:checked={editor.commentsEnabled}
						/>
						Comments on this post (US-53)
					</label>
					<Card class="bg-muted/30">
						<CardHeader class="pb-2">
							<CardTitle class="text-sm">OG image (US-23)</CardTitle>
							<CardDescription class="text-xs">
								Autogenerated preview when sharing — mocked below.
							</CardDescription>
						</CardHeader>
						<CardContent class="space-y-2">
							<div
								class="bg-card flex aspect-video flex-col justify-between rounded-lg border p-3 text-left shadow-sm"
							>
								<span class="text-muted-foreground text-[10px] uppercase">Open Graph</span>
								<p class="line-clamp-2 font-semibold">{editor.title || 'Post title'}</p>
								<div class="flex items-center gap-2">
									<img src={settings.logoUrl} alt="" class="size-8 rounded-full" width="32" height="32" />
									<span class="text-xs">{settings.authorDisplayName}</span>
								</div>
							</div>
						</CardContent>
					</Card>
					<div class="flex flex-col gap-2">
						<Button variant="secondary" onclick={onSaveDraft}>Save draft</Button>
						<Button onclick={onSignPublish}>Sign &amp; publish</Button>
						<p class="text-muted-foreground text-xs">
							US-24 — explicit confirmation; US-25 — PNM holds keys (mocked).
						</p>
					</div>
				</div>
			</div>
		</section>

		<Separator />

		<section class="space-y-3">
			<h2 class="text-lg font-semibold">Your posts</h2>
			<ul class="space-y-2">
				{#each managePosts as p}
					<li class="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
						<div>
							<p class="font-medium">{p.title}</p>
							<p class="text-muted-foreground text-xs">
								{visibilityLabel(p.visibility)}
								{#if p.signed}
									· <Badge variant="secondary" class="text-[10px]">Verified</Badge>
								{/if}
							</p>
						</div>
						<div class="flex gap-2">
							<Button size="sm" variant="outline" onclick={() => loadEditor(p)}>Edit</Button>
							<Button size="sm" variant="destructive" onclick={() => deletePost(p.id)}>Delete</Button>
						</div>
					</li>
				{/each}
			</ul>
		</section>

		{#if contactInbox.length > 0}
			<section class="space-y-3">
				<h2 class="text-lg font-semibold">Contact inbox (US-45)</h2>
				<ul class="space-y-2">
					{#each contactInbox as c}
						<li class="border-border rounded-lg border p-3 text-sm">
							<p class="font-medium">{c.name} &lt;{c.email}&gt;</p>
							<p class="text-muted-foreground text-xs">{c.createdAt}</p>
							<p class="mt-2 whitespace-pre-wrap">{c.message}</p>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
{/if}
