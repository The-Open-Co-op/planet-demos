<script lang="ts">
	import type { User } from '$lib/types';
	import * as Avatar from '$lib/components/ui/avatar';
	import { cn } from '$lib/utils.js';

	let {
		user,
		class: className
	}: {
		user: User;
		class?: string;
	} = $props();
</script>

<div
	id="profile-card-{user.id}"
	class={cn(
		'border-border bg-card flex min-w-[220px] flex-1 flex-col gap-3 rounded-xl border p-4 shadow-sm',
		className
	)}
>
	<div class="flex items-center gap-3">
		<Avatar.Root class="size-12 shrink-0">
			<Avatar.Image src={user.avatarUrl} alt="" />
			<Avatar.Fallback class="text-sm">{user.displayName.slice(0, 2)}</Avatar.Fallback>
		</Avatar.Root>
		<div class="min-w-0">
			<p class="truncate font-medium">{user.displayName}</p>
			<p class="text-muted-foreground truncate text-sm">@{user.username}</p>
		</div>
	</div>
</div>
