<script lang="ts">
	import { toast } from 'svelte-sonner';
	import ProfileCard from '$lib/components/profile-card.svelte';
	import MentionText from '$lib/components/mention-text.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { userById } from '$lib/data/mock';
	import {
		draft,
		toggleDraftContact,
		setDraftMessage,
		setComposeStep,
		sendIntroduction,
		viewerContacts
	} from '$lib/demo-state.svelte';
	import type { User } from '$lib/types';
	import { Search } from '@lucide/svelte';

	let query = $state('');

	const contacts = $derived.by(() => viewerContacts());

	const filtered = $derived.by((): User[] => {
		const q = query.trim().toLowerCase();
		if (!q) return contacts;
		return contacts.filter(
			(c) =>
				c.displayName.toLowerCase().includes(q) || c.username.toLowerCase().includes(q)
		);
	});

	const selectedUsers = $derived(
		draft.selectedUserIds
			.map((id) => userById(id))
			.filter((u): u is User => u !== undefined)
	);

	const canPreview = $derived(
		draft.selectedUserIds.length >= 2 && draft.message.trim().length > 0
	);

	function onPreview() {
		if (!canPreview) return;
		setComposeStep('preview');
	}

	function onSend() {
		const intro = sendIntroduction();
		if (intro) {
			toast.success('Introduction sent', {
				description: 'Introduced parties will receive alerts before the chat opens.'
			});
		}
	}
</script>

<svelte:head>
	<title>Compose introduction — PLANET Introducer</title>
</svelte:head>

<div class="space-y-8">
	<header class="space-y-1">
		<h1 class="text-2xl font-semibold tracking-tight">Compose an introduction</h1>
		<p class="text-muted-foreground text-sm">
			Search your PLANET contacts, add at least two people, and write why you are connecting them.
		</p>
	</header>

	{#if draft.step === 'compose'}
		<section class="space-y-4" aria-labelledby="search-heading">
			<h2 id="search-heading" class="text-lg font-medium">Contacts</h2>
			<div class="relative">
				<Search
					class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
					aria-hidden="true"
				/>
				<Input
					type="search"
					class="pl-9"
					placeholder="Search by name or @username"
					bind:value={query}
					autocomplete="off"
					aria-label="Search contacts"
				/>
			</div>

			<ScrollArea class="border-border h-48 rounded-xl border md:h-56">
				<ul class="divide-border divide-y p-2">
					{#each filtered as c}
						<li>
							<button
								type="button"
								class="hover:bg-muted/80 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors"
								onclick={() => toggleDraftContact(c.id)}
							>
								<img
									src={c.avatarUrl}
									alt=""
									class="size-10 shrink-0 rounded-full"
									width="40"
									height="40"
								/>
								<div class="min-w-0">
									<p class="truncate font-medium">{c.displayName}</p>
									<p class="text-muted-foreground truncate text-sm">@{c.username}</p>
								</div>
								<span class="text-muted-foreground ml-auto text-xs">
									{draft.selectedUserIds.includes(c.id) ? 'Added' : 'Add'}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			</ScrollArea>
		</section>

		<section class="space-y-3" aria-labelledby="cards-heading">
			<h2 id="cards-heading" class="text-lg font-medium">In this introduction</h2>
			{#if selectedUsers.length === 0}
				<p class="text-muted-foreground text-sm">No contacts selected yet.</p>
			{:else}
				<div class="flex flex-wrap gap-4">
					{#each selectedUsers as u}
						<ProfileCard user={u} class="max-w-sm" />
					{/each}
				</div>
			{/if}
		</section>

		<section class="space-y-3" aria-labelledby="msg-heading">
			<div class="flex items-baseline justify-between gap-2">
				<Label for="intro-body" id="msg-heading" class="text-lg font-medium">Message</Label>
				{#if draft.message.trim().length === 0}
					<span class="text-muted-foreground text-xs">Add a short note so people know why you are connecting them.</span>
				{/if}
			</div>
			<Textarea
				id="intro-body"
				rows={6}
				placeholder="Write your introduction… Use @username to link to someone you selected."
				value={draft.message}
				oninput={(e) => setDraftMessage(e.currentTarget.value)}
				aria-describedby="mention-hint"
			/>
			<p id="mention-hint" class="text-muted-foreground text-xs">
				Mentions are linked below for review. You need at least two contacts and some text before you can preview.
			</p>
			{#if draft.message.length > 0}
				<div class="bg-muted/40 rounded-lg p-3">
					<p class="text-muted-foreground mb-1 text-xs font-medium uppercase">Mention preview</p>
					<MentionText text={draft.message} selectedUsers={selectedUsers} />
				</div>
			{/if}
		</section>

		<div class="flex justify-end">
			<Button disabled={!canPreview} onclick={onPreview}>Preview</Button>
		</div>
	{:else}
		<section class="space-y-6">
			<h2 class="text-lg font-medium">Preview</h2>
			<p class="text-muted-foreground text-sm">This is how your introduction will be framed.</p>

			<div class="flex flex-wrap gap-4">
				{#each selectedUsers as u}
					<ProfileCard user={u} class="max-w-sm" />
				{/each}
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium">Message</p>
				<div class="border-border bg-card rounded-xl border p-4">
					<p class="whitespace-pre-wrap leading-relaxed">{draft.message}</p>
				</div>
				<MentionText text={draft.message} selectedUsers={selectedUsers} class="mt-2" />
			</div>

			<div class="flex flex-wrap gap-2">
				<Button variant="outline" onclick={() => setComposeStep('compose')}>Back to edit</Button>
				<Button onclick={onSend}>Send introduction</Button>
			</div>
		</section>
	{/if}
</div>
