import type { User } from '$lib/types';

const avatar = (seed: string): string =>
	`https://api.dicebear.com/9.x/open-peeps/svg?seed=${encodeURIComponent(seed)}`;

/** Demo personas — switch in the header to walk through flows */
export const DEMO_USERS: User[] = [
	{
		id: 'user-alex',
		displayName: 'Alex Rivera',
		username: 'alexrivera',
		avatarUrl: avatar('alexrivera')
	},
	{
		id: 'user-blake',
		displayName: 'Blake Chen',
		username: 'blakechen',
		avatarUrl: avatar('blakechen')
	},
	{
		id: 'user-casey',
		displayName: 'Casey Morgan',
		username: 'caseymorgan',
		avatarUrl: avatar('caseymorgan')
	},
	{
		id: 'user-dana',
		displayName: 'Dana Okonkwo',
		username: 'danaokonkwo',
		avatarUrl: avatar('danaokonkwo')
	},
	{
		id: 'user-erin',
		displayName: 'Erin Patel',
		username: 'erinpatel',
		avatarUrl: avatar('erinpatel')
	}
];

export function userById(id: string): User | undefined {
	return DEMO_USERS.find((u) => u.id === id);
}

/** PLANET contacts for search — everyone except self */
export function contactsForViewer(viewerId: string): User[] {
	return DEMO_USERS.filter((u) => u.id !== viewerId);
}

export async function simulateLoad<T>(data: T, ms = 600): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
