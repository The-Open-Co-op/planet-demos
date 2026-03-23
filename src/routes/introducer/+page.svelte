<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, Bell, GitBranch, MessageCircle, Sparkles, Users } from '@lucide/svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { userById } from '$lib/data/mock';
	import { triggerRippleDemo } from '$lib/demo-state.svelte';

	function onRippleDemo() {
		const downstream = userById('user-casey');
		triggerRippleDemo('user-alex', downstream?.displayName ?? 'A contact');
		toast('Ripple demo', {
			description: 'Alex receives a micro-ripple VEC alert (US-10). Casey is not notified.'
		});
	}
</script>

<svelte:head>
	<title>Introducer demo — PLANET</title>
</svelte:head>

<div class="space-y-10">
	<section class="space-y-3">
		<h1 class="text-3xl font-semibold tracking-tight">Introducer demo</h1>
		<p class="max-w-2xl text-sm leading-relaxed text-muted-foreground">
			This frontend-only demo walks through PLANET introduction flows: compose and preview, consent
			alerts, the group chat, bowing out, marking value, and ripple credentials. Use the
			<strong>View as</strong> menu above to switch personas and see each side of a conversation.
		</p>
	</section>

	<section class="grid gap-4 sm:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-base">
					<Users class="size-4" />
					Compose
				</CardTitle>
				<CardDescription
					>US-01 — US-03: search contacts, write context, preview, send.</CardDescription
				>
			</CardHeader>
			<CardContent>
				<Button href="/introducer/compose" class="gap-1">
					Open compose
					<ArrowRight class="size-4" />
				</Button>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-base">
					<Bell class="size-4" />
					Alerts
				</CardTitle>
				<CardDescription>US-04, US-05, US-09, US-10: PNM-style alerts and consent.</CardDescription>
			</CardHeader>
			<CardContent>
				<Button href="/introducer/alerts" variant="secondary" class="gap-1">
					Open alerts
					<ArrowRight class="size-4" />
				</Button>
			</CardContent>
		</Card>
	</section>

	<section class="rounded-xl border border-border bg-muted/30 p-6">
		<h2 class="mb-3 flex items-center gap-2 font-medium">
			<Sparkles class="size-4" />
			Suggested flow
		</h2>
		<ol class="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
			<li>
				Stay as <strong>Alex</strong>, open Compose, pick Blake and Casey, write a message, preview,
				send.
			</li>
			<li>
				Switch to <strong>Blake</strong>, open Alerts, accept the introduction. Switch to
				<strong>Casey</strong> and accept — the chat opens for everyone.
			</li>
			<li>
				Open the chat from Alerts, post as Alex, then use the bow-out banner. As Blake or Casey, use
				<strong>Mark as valuable</strong>.
			</li>
			<li>
				Trigger the ripple demo below to see a distinct ripple alert for the seed introducer (switch
				to Alex in Alerts).
			</li>
		</ol>
		<p class="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
			<MessageCircle class="mt-0.5 size-4 shrink-0" />
			Chats appear under Alerts when an introduction is active — open a thread from there.
		</p>
		<div class="mt-4 flex flex-wrap items-center gap-2">
			<Button variant="outline" size="sm" class="gap-2" onclick={onRippleDemo}>
				<GitBranch class="size-4" />
				Simulate ripple VEC (Alex)
			</Button>
			<span class="text-xs text-muted-foreground"
				>Switch to Alex in Alerts to see the ripple notification.</span
			>
		</div>
	</section>
</div>
