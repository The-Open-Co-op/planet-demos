<script lang="ts">
	import { toast } from 'svelte-sonner';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Separator } from '$lib/components/ui/separator';
	import {
		blogView,
		followAll,
		followHashtag,
		followsForCurrentMember,
		settings,
		submitContact,
		unfollow,
		visiblePostsForReader,
		rssUrl
	} from '$lib/blog-state.svelte';
	import type { BlogPost } from '$lib/types/blog';
	import { Rss, User } from '@lucide/svelte';

	let contactName = $state('');
	let contactEmail = $state('');
	let contactMessage = $state('');
	let honeypot = $state('');

	const list = $derived.by((): BlogPost[] => visiblePostsForReader());

	function excerpt(p: BlogPost): string {
		const plain = p.bodyMd.replace(/[#>*_\-\d.]/g, ' ').replace(/\s+/g, ' ').trim();
		return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain;
	}

	function onFollowAll() {
		if (blogView.asWebVisitor) {
			toast('Join PLANET', {
				description: 'Following requires a PLANET account — you would be invited to sign up here (US-40).'
			});
			return;
		}
		followAll();
		toast('Following this blog', { description: 'Feed app would aggregate these posts (US-37).' });
	}

	function onFollowTag(tag: string) {
		if (blogView.asWebVisitor) {
			toast('Join PLANET', { description: `After joining, you would follow #${tag} automatically (US-41).` });
			return;
		}
		followHashtag(tag);
		toast(`Following #${tag}`, { description: 'Stored as follower DID → author + hashtag (US-37).' });
	}

	function onContact(e: Event) {
		e.preventDefault();
		if (!settings.contactFormEnabled) return;
		const ok = submitContact(contactName, contactEmail, contactMessage, honeypot);
		if (ok) {
			toast('Message sent', { description: 'Delivered to the author email in a real deployment (US-45).' });
			contactName = '';
			contactEmail = '';
			contactMessage = '';
		}
	}

	const myFollows = $derived(followsForCurrentMember());
</script>

<svelte:head>
	<title>{settings.title} — PLANET Blog demo</title>
</svelte:head>

<div class="space-y-10">
	<section
		class="border-border relative overflow-hidden rounded-2xl border bg-cover bg-center"
		style="background-image: linear-gradient(to top, rgba(0,0,0,0.65), transparent), url({settings.bannerUrl})"
	>
		<div class="text-primary-foreground flex min-h-[200px] flex-col justify-end gap-2 p-6 md:min-h-[260px] md:p-10">
			<div class="flex items-center gap-3">
				<Avatar.Root class="border-background size-14 border-2 md:size-16">
					<Avatar.Image src={settings.logoUrl} alt="" />
					<Avatar.Fallback>AR</Avatar.Fallback>
				</Avatar.Root>
				<div>
					<p class="text-2xl font-semibold tracking-tight md:text-3xl">{settings.title}</p>
					<p class="text-primary-foreground/90 max-w-xl text-sm">{settings.tagline}</p>
				</div>
			</div>
			<p class="text-primary-foreground/80 font-mono text-xs">
				planetnetwork.app/blog/{settings.slug}
			</p>
		</div>
	</section>

	<section class="grid gap-8 lg:grid-cols-3">
		<div class="lg:col-span-2 space-y-6">
			<h2 class="text-lg font-semibold">Latest posts</h2>
			<ul class="flex flex-col gap-6">
				{#each list as post}
					<li>
						<Card class="overflow-hidden transition-shadow hover:shadow-md">
							{#if post.featuredImageUrl}
								<a href="/blog/post/{post.id}" class="block aspect-[2.4/1] w-full overflow-hidden">
									<img
										src={post.featuredImageUrl}
										alt=""
										class="size-full object-cover"
										width="800"
										height="400"
									/>
								</a>
							{/if}
							<CardHeader>
								<CardTitle>
									<a href="/blog/post/{post.id}" class="hover:text-primary transition-colors">
										{post.title}
									</a>
								</CardTitle>
								{#if post.subtitle}
									<CardDescription>{post.subtitle}</CardDescription>
								{/if}
								<p class="text-muted-foreground text-sm">{excerpt(post)}</p>
								<div class="flex flex-wrap gap-2 pt-2">
									{#each post.hashtags as t}
										<button
											type="button"
											class="text-primary text-xs font-medium hover:underline"
											onclick={() => onFollowTag(t)}
										>
											#{t}
										</button>
									{/each}
								</div>
							</CardHeader>
						</Card>
					</li>
				{/each}
			</ul>
			{#if list.length === 0}
				<p class="text-muted-foreground text-sm">No public posts to show in this mode.</p>
			{/if}
		</div>

		<aside class="space-y-6 lg:col-span-1">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-base">
						<User class="size-4" />
						Author
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3 text-sm">
					<p class="font-medium">{settings.authorDisplayName}</p>
					<p class="text-muted-foreground leading-relaxed">{settings.authorBio}</p>
					<ul class="space-y-1">
						{#each settings.authorLinks as link}
							<li>
								<a class="text-primary text-sm hover:underline" href={link.url} target="_blank" rel="noreferrer"
									>{link.label}</a
								>
							</li>
						{/each}
					</ul>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="text-base">Follow & topics</CardTitle>
					<CardDescription>US-37 — US-41. Feed consumption is mocked.</CardDescription>
				</CardHeader>
				<CardContent class="flex flex-col gap-2">
					<Button variant="secondary" class="w-full" onclick={onFollowAll}>Follow entire blog</Button>
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" onclick={() => onFollowTag('planet')}>#planet</Button>
						<Button variant="outline" size="sm" onclick={() => onFollowTag('trust')}>#trust</Button>
					</div>
					{#if !blogView.asWebVisitor && myFollows.length > 0}
						<Separator class="my-2" />
						<p class="text-muted-foreground text-xs font-medium uppercase">Your follows</p>
						<ul class="space-y-1 text-sm">
							{#each myFollows as f}
								<li class="flex items-center justify-between gap-2">
									<span>
										{f.scope === 'all' ? 'Whole blog' : `#${f.hashtag}`}
									</span>
									<Button variant="ghost" size="sm" class="h-7 text-xs" onclick={() => unfollow(f.id)}>
										Unfollow
									</Button>
								</li>
							{/each}
						</ul>
					{/if}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-base">
						<Rss class="size-4" />
						RSS (US-22)
					</CardTitle>
				</CardHeader>
				<CardContent>
					<code class="bg-muted block rounded-md p-2 text-xs break-all">{rssUrl()}</code>
				</CardContent>
			</Card>

			{#if settings.contactFormEnabled}
				<Card>
					<CardHeader>
						<CardTitle class="text-base">Contact the author</CardTitle>
						<CardDescription>US-42 — US-44. Open to anyone; honeypot field for spam (US-46).</CardDescription>
					</CardHeader>
					<CardContent>
						<form class="space-y-3" onsubmit={onContact}>
							<input
								type="text"
								name="website"
								class="hidden"
								tabindex="-1"
								autocomplete="off"
								bind:value={honeypot}
								aria-hidden="true"
							/>
							<div class="space-y-1.5">
								<Label for="c-name">Name</Label>
								<Input id="c-name" bind:value={contactName} required />
							</div>
							<div class="space-y-1.5">
								<Label for="c-email">Email</Label>
								<Input id="c-email" type="email" bind:value={contactEmail} required />
							</div>
							<div class="space-y-1.5">
								<Label for="c-msg">Message</Label>
								<Textarea id="c-msg" rows={4} bind:value={contactMessage} required />
							</div>
							<Button type="submit" class="w-full">Send</Button>
						</form>
					</CardContent>
				</Card>
			{:else}
				<p class="text-muted-foreground text-sm">Contact form disabled by author (US-47).</p>
			{/if}
		</aside>
	</section>

	{#if blogView.asWebVisitor}
		<p class="text-muted-foreground border-border rounded-lg border border-dashed p-4 text-center text-sm">
			You are viewing as a <strong>web visitor</strong>. Members-only posts are hidden (US-35, US-36).
		</p>
	{/if}
</div>
