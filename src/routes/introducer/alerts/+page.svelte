<script lang="ts">
	import { toast } from 'svelte-sonner';
	import ProfileCard from '$lib/components/profile-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Separator } from '$lib/components/ui/separator';
	import { userById } from '$lib/data/mock';
	import {
		session,
		introductions,
		notifications,
		respondToInvite,
		chatForIntroduction
	} from '$lib/demo-state.svelte';
	import type { AppNotification, Introduction } from '$lib/types';
	import {
		Bell,
		GitBranch,
		Handshake,
		Link2,
		MessageCircle,
		Sparkles
	} from '@lucide/svelte';

	const mine = $derived.by((): AppNotification[] => {
		const uid = session.currentUserId;
		return notifications.filter((n) => n.userId === uid);
	});

	function introFor(n: AppNotification): Introduction | undefined {
		if (!n.introductionId) return undefined;
		return introductions.find((i) => i.id === n.introductionId);
	}

	function kindLabel(kind: AppNotification['kind']): string {
		switch (kind) {
			case 'intro_invite':
				return 'Introduction';
			case 'intro_sent':
				return 'Status';
			case 'intro_peer_cancelled':
				return 'Update';
			case 'intro_declined_for_introducer':
				return 'Declined';
			case 'intro_all_accepted':
				return 'Ready';
			case 'intro_valuable':
				return 'Value';
			case 'ripple':
				return 'Ripple VEC';
			case 'vec_low_weight':
				return 'VEC';
			case 'connection_sample':
				return 'Connection';
			default:
				return 'Alert';
		}
	}

	function cardClass(kind: AppNotification['kind']): string {
		if (kind === 'intro_invite' || kind === 'intro_sent' || kind === 'intro_all_accepted') {
			return 'border-primary/40 bg-primary/5';
		}
		if (kind === 'ripple') {
			return 'border-violet-500/40 bg-violet-500/5';
		}
		if (kind === 'connection_sample') {
			return 'border-border bg-card';
		}
		return 'border-border bg-card';
	}

	function iconFor(kind: AppNotification['kind']) {
		switch (kind) {
			case 'intro_invite':
			case 'intro_sent':
			case 'intro_all_accepted':
				return Sparkles;
			case 'ripple':
				return GitBranch;
			case 'connection_sample':
				return Link2;
			case 'intro_valuable':
				return Handshake;
			default:
				return Bell;
		}
	}

	function onRespond(introductionId: string, accept: boolean) {
		respondToInvite(introductionId, accept);
		toast(accept ? 'Accepted' : 'Declined', {
			description: accept
				? 'Thanks — we will open the chat when everyone accepts.'
				: 'No group chat will be created.'
		});
	}
</script>

<svelte:head>
	<title>Alerts — PLANET Introducer</title>
</svelte:head>

<div class="space-y-6">
	<header>
		<h1 class="text-2xl font-semibold tracking-tight">PNM alerts</h1>
		<p class="text-muted-foreground text-sm">
			Introduction alerts use a distinct treatment from other notifications (US-05).
		</p>
	</header>

	<ScrollArea class="h-[min(70vh,720px)] pr-3">
		<ul class="flex flex-col gap-4">
			{#each mine as n}
				{@const intro = introFor(n)}
				{@const Icon = iconFor(n.kind)}
				<li>
					<Card class={cardClass(n.kind)}>
						<CardHeader class="flex flex-row items-start gap-3 space-y-0 pb-2">
							<div
								class="bg-background/80 flex size-10 shrink-0 items-center justify-center rounded-lg border"
							>
								<Icon class="text-primary size-5" aria-hidden="true" />
							</div>
							<div class="min-w-0 flex-1 space-y-1">
								<div class="flex flex-wrap items-center gap-2">
									<CardTitle class="text-base">{n.title}</CardTitle>
									<Badge variant="secondary" class="text-xs font-normal">
										{kindLabel(n.kind)}
									</Badge>
								</div>
								<p class="text-muted-foreground text-sm">{n.body}</p>
							</div>
						</CardHeader>
						<CardContent class="space-y-4 pt-0">
							{#if intro && (n.kind === 'intro_invite' || n.kind === 'intro_all_accepted' || n.kind === 'intro_sent')}
								<Separator />
								<div class="space-y-2">
									<p class="text-sm font-medium">Introduced parties</p>
									<div class="flex flex-wrap gap-3">
										{#each intro.introducedUserIds as uid}
											{@const u = userById(uid)}
											{#if u}
												<ProfileCard user={u} class="max-w-[260px]" />
											{/if}
										{/each}
									</div>
									<p class="text-sm font-medium">Message</p>
									<p class="border-border bg-muted/30 rounded-lg border p-3 text-sm whitespace-pre-wrap">
										{intro.message}
									</p>
									<p class="text-muted-foreground text-xs">
										Introducer:
										<strong class="text-foreground">{userById(intro.introducerId)?.displayName}</strong>
									</p>
								</div>
							{/if}

							{#if n.kind === 'intro_invite' && n.pendingConsent && intro?.status === 'pending_consent'}
								<div class="flex flex-wrap gap-2">
									<Button onclick={() => onRespond(n.introductionId!, true)}>Accept</Button>
									<Button variant="outline" onclick={() => onRespond(n.introductionId!, false)}>
										Decline
									</Button>
								</div>
							{/if}

							{#if intro &&
								(n.kind === 'intro_invite' || n.kind === 'intro_all_accepted' || n.kind === 'intro_sent') &&
								intro.status === 'active' &&
								chatForIntroduction(intro.id)}
								<Button href="/introducer/chat/{intro.id}" variant="secondary" class="gap-2">
									<MessageCircle class="size-4" />
									Open introduction chat
								</Button>
							{/if}
						</CardContent>
					</Card>
				</li>
			{/each}
		</ul>
	</ScrollArea>

	{#if mine.length === 0}
		<p class="text-muted-foreground text-sm">No alerts for this persona yet.</p>
	{/if}
</div>
