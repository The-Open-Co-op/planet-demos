<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { Globe } from '@lucide/svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { cn } from '$lib/utils.js';

	const topNav = [
		{ href: '/', label: 'Home' },
		{ href: '/introducer', label: 'Introducer demo' },
		{ href: '/blog', label: 'Blog demo' }
	];

	const pathname = $derived(page.url.pathname);

	function topNavActive(href: string, p: string): boolean {
		if (href === '/') return p === '/';
		return p === href || p.startsWith(`${href}/`);
	}

	let { children } = $props();
</script>

<div class="bg-background text-foreground min-h-screen">
	<header
		class="border-border/80 bg-card/50 supports-backdrop-filter:bg-card/40 sticky top-0 z-40 border-b backdrop-blur-md"
	>
		<div class="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
			<a href="/" class="text-primary flex items-center gap-2 font-semibold tracking-tight">
				<Globe class="size-6" aria-hidden="true" />
				<span>PLANET</span>
				<span class="text-muted-foreground hidden font-normal sm:inline">Demos</span>
			</a>
			<nav class="flex flex-wrap items-center gap-1" aria-label="Main">
				{#each topNav as item}
					<a
						href={item.href}
						class={cn(
							'rounded-md px-3 py-2 text-sm font-medium transition-colors',
							topNavActive(item.href, pathname)
								? 'bg-muted text-foreground'
								: 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
						)}
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-8">
		{@render children()}
	</main>
	{#if browser}
		<Toaster />
	{/if}
</div>
