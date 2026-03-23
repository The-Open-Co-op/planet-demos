<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { ArrowRight, BookOpen, Users } from '@lucide/svelte';
</script>

<svelte:head>
	<title>PLANET — Demos</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-10 text-center">
	<header class="space-y-4">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to PLANET demos</h1>
		<p class="text-sm leading-relaxed text-muted-foreground sm:text-base">
			These are frontend-only mockups with static data — no backend or real authentication. Pick a
			demo to explore the flows described in the user stories.
		</p>
	</header>

	<div class="grid gap-6 sm:grid-cols-2 sm:text-left">
		<Card class="flex flex-col">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-lg">
					<Users class="size-5 text-primary" />
					Introducer
				</CardTitle>
				<CardDescription>
					Compose introductions, consent alerts, group chat, bow out, value marking, and ripple
					credentials.
				</CardDescription>
			</CardHeader>
			<CardContent class="mt-auto">
				<Button href="/introducer" class="gap-2">
					Open introducer demo
					<ArrowRight class="size-4" />
				</Button>
			</CardContent>
		</Card>

		<Card class="flex flex-col">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-lg">
					<BookOpen class="size-5 text-primary" />
					Blog (FPP)
				</CardTitle>
				<CardDescription>
					First Person Pages: blog setup, writing, DID signing, reading, follows, contact form, and
					comments.
				</CardDescription>
			</CardHeader>
			<CardContent class="mt-auto">
				<Button href="/blog" variant="secondary" class="gap-2">
					Open blog demo
					<ArrowRight class="size-4" />
				</Button>
			</CardContent>
		</Card>
	</div>
</div>
