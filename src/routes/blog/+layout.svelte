<script lang="ts">
	import { page } from '$app/state';
	import { BookOpen, Menu, PenLine } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Label } from '$lib/components/ui/label';
	import { blogView } from '$lib/blog-state.svelte';
	import { DEMO_USERS } from '$lib/data/mock';
	import { currentUser, session, setPersona } from '$lib/demo-state.svelte';
	import { cn } from '$lib/utils.js';

	const sub = [
		{ href: '/blog', label: 'Read' },
		{ href: '/blog/manage', label: 'Write & settings' }
	];

	const pathname = $derived(page.url.pathname);

	function subNavActive(href: string, p: string): boolean {
		if (href === '/blog/manage') return p.startsWith('/blog/manage');
		return p === '/blog' || p.startsWith('/blog/post');
	}

	let { children } = $props();
</script>

<div class="-mx-4 -mt-8 mb-8 border-b border-border/60 px-4 pb-4">
	<div class="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
		<nav class="flex flex-wrap items-center gap-1" aria-label="Blog demo">
			{#each sub as item}
				<a
					href={item.href}
					class={cn(
						'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
						subNavActive(item.href, pathname)
							? 'bg-muted text-foreground'
							: 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
					)}
				>
					{#if item.href === '/blog'}
						<BookOpen class="size-4" />
					{:else}
						<PenLine class="size-4" />
					{/if}
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="flex flex-wrap items-center gap-3 lg:ml-auto">
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
		<div class="flex w-full flex-col gap-2 lg:w-auto lg:items-end">
			<Label class="text-xs text-muted-foreground">Demo mode</Label>
			<label class="flex cursor-pointer items-center gap-2 text-sm">
				<input
					type="checkbox"
					class="size-4 rounded border-input"
					checked={blogView.asWebVisitor}
					onchange={(e) => {
						blogView.asWebVisitor = e.currentTarget.checked;
					}}
				/>
				View as web visitor (not a PLANET member)
			</label>
		</div>
	</div>
</div>

{@render children()}
