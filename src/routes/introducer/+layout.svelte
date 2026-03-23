<script lang="ts">
	import { page } from '$app/state';
	import { Menu } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils.js';
	import { DEMO_USERS } from '$lib/data/mock';
	import { currentUser, session, setPersona } from '$lib/demo-state.svelte';

	const nav = [
		{ href: '/introducer', label: 'Home' },
		{ href: '/introducer/compose', label: 'Compose' },
		{ href: '/introducer/alerts', label: 'Alerts' }
	];

	const pathname = $derived(page.url.pathname);

	function introNavActive(href: string, p: string): boolean {
		if (href === '/introducer') return p === '/introducer';
		if (href === '/introducer/alerts') {
			return p === '/introducer/alerts' || p.startsWith('/introducer/chat');
		}
		return p === href || p.startsWith(`${href}/`);
	}

	let { children } = $props();
</script>

<div class="-mx-4 -mt-8 mb-8 border-b border-border/60 px-4 pb-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<nav class="flex flex-wrap items-center gap-1" aria-label="Introducer">
			{#each nav as item}
				<a
					href={item.href}
					class={cn(
						'rounded-md px-3 py-2 text-sm font-medium transition-colors',
						introNavActive(item.href, pathname)
							? 'bg-muted text-foreground'
							: 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
					)}
				>
					{item.label}
				</a>
			{/each}
		</nav>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" size="sm" class="gap-2">
						<span class="max-w-[10rem] truncate">{currentUser().displayName}</span>
						<Menu class="size-4 opacity-70" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-56">
				<DropdownMenu.Label>View as (demo)</DropdownMenu.Label>
				<DropdownMenu.Separator />
				{#each DEMO_USERS as u}
					<DropdownMenu.Item
						class={u.id === session.currentUserId ? 'bg-muted' : ''}
						onclick={() => setPersona(u.id)}
					>
						{u.displayName}
						<span class="ml-1 text-xs text-muted-foreground">@{u.username}</span>
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>

{@render children()}
