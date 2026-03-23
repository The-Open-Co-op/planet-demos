<script lang="ts">
	import type { User } from '$lib/types';
	import { cn } from '$lib/utils.js';

	let {
		text,
		selectedUsers,
		class: className
	}: {
		text: string;
		selectedUsers: User[];
		class?: string;
	} = $props();

	const byHandle = $derived(new Map(selectedUsers.map((u) => [u.username.toLowerCase(), u])));

	type Segment = { type: 'text'; value: string } | { type: 'mention'; user: User };

	const segments = $derived.by((): Segment[] => {
		const out: Segment[] = [];
		const re = /@([a-zA-Z0-9_]+)/g;
		let last = 0;
		let m: RegExpExecArray | null;
		while ((m = re.exec(text)) !== null) {
			if (m.index > last) {
				out.push({ type: 'text', value: text.slice(last, m.index) });
			}
			const handle = m[1].toLowerCase();
			const user = byHandle.get(handle);
			if (user) {
				out.push({ type: 'mention', user });
			} else {
				out.push({ type: 'text', value: m[0] });
			}
			last = m.index + m[0].length;
		}
		if (last < text.length) {
			out.push({ type: 'text', value: text.slice(last) });
		}
		return out;
	});
</script>

<p class={cn('text-sm leading-relaxed text-muted-foreground', className)}>
	{#each segments as seg}
		{#if seg.type === 'text'}
			{seg.value}
		{:else}
			<a
				href="#profile-card-{seg.user.id}"
				class="font-medium text-primary underline-offset-2 hover:underline"
			>
				@{seg.user.username}
			</a>
		{/if}
	{/each}
</p>
