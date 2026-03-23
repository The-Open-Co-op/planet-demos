<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import ProfileCard from '$lib/components/profile-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Separator } from '$lib/components/ui/separator';
	import { userById } from '$lib/data/mock';
	import {
		bowOut,
		chatForIntroduction,
		chatMessages,
		session,
		dismissBowOutPrompt,
		introductions,
		markValuable,
		postChatMessage,
		shouldShowBowOutPrompt
	} from '$lib/demo-state.svelte';
	import { Send } from '@lucide/svelte';

	const introId = $derived(page.params.id);

	const intro = $derived(introductions.find((i) => i.id === introId));

	const chat = $derived(intro ? chatForIntroduction(intro.id) : undefined);

	const messages = $derived(chat ? chatMessages(chat.id) : []);

	const participants = $derived.by(() => {
		if (!chat) return [];
		return chat.participantIds
			.map((id) => userById(id))
			.filter((u): u is NonNullable<typeof u> => u !== undefined);
	});

	let input = $state('');

	const canMarkValuable = $derived.by(() => {
		if (!intro || intro.status !== 'active') return false;
		if (!intro.introducedUserIds.includes(session.currentUserId)) return false;
		return !intro.valuableByUserId[session.currentUserId];
	});

	const showBowOut = $derived.by(() => {
		if (!introId) return false;
		return shouldShowBowOutPrompt(introId);
	});

	function sendLine() {
		const t = input.trim();
		if (!t || !chat) return;
		postChatMessage(chat.id, t);
		input = '';
	}

	function onBowOut() {
		if (!introId) return;
		bowOut(introId);
		toast('You stepped back', {
			description: 'Participants can continue without you. Rejoin only if re-invited.'
		});
	}

	function onDismissBowOut() {
		if (!introId) return;
		dismissBowOutPrompt(introId);
	}

	function onValuable() {
		if (!introId) return;
		markValuable(introId);
		toast('Marked as valuable', {
			description: 'The introducer receives a weightier VEC in their alerts.'
		});
	}
</script>

<svelte:head>
	<title>Introduction chat — PLANET</title>
</svelte:head>

{#if !intro || !chat}
	<p class="text-sm text-muted-foreground">
		This chat is not available. Accept an introduction first.
	</p>
{:else}
	<div class="flex flex-col gap-6 lg:flex-row">
		<section class="space-y-4 lg:w-2/3">
			<header>
				<h1 class="text-xl font-semibold tracking-tight">Introduction chat</h1>
				<p class="text-sm text-muted-foreground">
					The introducer is a full participant until they bow out (US-06, US-08).
				</p>
			</header>

			{#if showBowOut}
				<Card class="border-primary/50 bg-primary/5">
					<CardContent
						class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<p class="text-sm">
							Your intro was accepted by all parties — <strong>bow out?</strong>
						</p>
						<div class="flex gap-2">
							<Button variant="outline" size="sm" onclick={onDismissBowOut}>Dismiss</Button>
							<Button size="sm" onclick={onBowOut}>Bow out</Button>
						</div>
					</CardContent>
				</Card>
			{/if}

			<ScrollArea class="h-[min(50vh,420px)] rounded-xl border border-border">
				<ul class="flex flex-col gap-2 p-3">
					{#each messages as m}
						<li
							class={m.kind === 'system'
								? 'text-center text-xs text-muted-foreground'
								: 'rounded-lg bg-muted/50 px-3 py-2'}
						>
							{#if m.kind === 'system'}
								{m.body}
							{:else}
								<p class="text-xs font-medium">
									{userById(m.authorId ?? '')?.displayName ?? 'Member'}
								</p>
								<p class="text-sm whitespace-pre-wrap">{m.body}</p>
							{/if}
						</li>
					{/each}
				</ul>
			</ScrollArea>

			{#if chat.participantIds.includes(session.currentUserId)}
				<form
					class="flex gap-2"
					onsubmit={(e) => {
						e.preventDefault();
						sendLine();
					}}
				>
					<Input bind:value={input} placeholder="Write a message…" class="flex-1" />
					<Button type="submit" aria-label="Send message">
						<Send class="size-4" />
					</Button>
				</form>
			{:else}
				<p class="text-sm text-muted-foreground">
					You have left this chat. Rejoin only if someone invites you again.
				</p>
			{/if}
		</section>

		<aside class="space-y-4 lg:w-1/3">
			<h2 class="flex items-center gap-2 font-medium">Participants</h2>
			<div class="flex flex-col gap-3">
				{#each participants as p}
					<ProfileCard user={p} />
				{/each}
			</div>

			<Separator />

			{#if canMarkValuable}
				<div class="space-y-2">
					<p class="text-sm font-medium">Value</p>
					<p class="text-xs text-muted-foreground">
						Mark once if this introduction was genuinely valuable (US-09).
					</p>
					<Button variant="secondary" onclick={onValuable}>Mark as valuable</Button>
				</div>
			{/if}
		</aside>
	</div>
{/if}
