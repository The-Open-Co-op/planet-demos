/** Minimal markdown → HTML for demo bodies (headings, bold, italic, blockquote, lists) */
export function renderSimpleMarkdown(md: string): string {
	const lines = md.split('\n');
	const out: string[] = [];
	let inList: 'ul' | 'ol' | null = null;

	function closeList() {
		if (inList) {
			out.push(inList === 'ul' ? '</ul>' : '</ol>');
			inList = null;
		}
	}

	for (const line of lines) {
		const t = line.trim();
		if (t.startsWith('### ')) {
			closeList();
			out.push(`<h3 class="text-lg font-semibold mt-4 mb-2">${inline(t.slice(4))}</h3>`);
			continue;
		}
		if (t.startsWith('## ')) {
			closeList();
			out.push(`<h2 class="text-xl font-semibold mt-6 mb-2">${inline(t.slice(3))}</h2>`);
			continue;
		}
		if (t.startsWith('> ')) {
			closeList();
			out.push(
				`<blockquote class="border-primary/40 text-muted-foreground my-3 border-l-4 pl-4 italic">${inline(t.slice(2))}</blockquote>`
			);
			continue;
		}
		if (/^[-*]\s/.test(t)) {
			if (inList !== 'ul') {
				closeList();
				out.push('<ul class="my-2 list-disc pl-6">');
				inList = 'ul';
			}
			out.push(`<li>${inline(t.replace(/^[-*]\s+/, ''))}</li>`);
			continue;
		}
		if (/^\d+\.\s/.test(t)) {
			if (inList !== 'ol') {
				closeList();
				out.push('<ol class="my-2 list-decimal pl-6">');
				inList = 'ol';
			}
			out.push(`<li>${inline(t.replace(/^\d+\.\s+/, ''))}</li>`);
			continue;
		}
		if (t === '') {
			closeList();
			continue;
		}
		closeList();
		out.push(`<p class="my-3 leading-relaxed">${inline(t)}</p>`);
	}
	closeList();
	return out.join('');
}

function inline(s: string): string {
	return s
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>');
}
