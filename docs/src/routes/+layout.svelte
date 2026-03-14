<script lang="ts">
	let { children } = $props();
</script>

{@render children()}

<style>
	:global(:root) {
		color-scheme: light;
		--bg: #f3efe7;
		--bg-accent: #e1d4c3;
		--surface: rgba(255, 252, 247, 0.84);
		--surface-strong: #fffaf2;
		--text: #1a1713;
		--muted: #5b544c;
		--border: rgba(26, 23, 19, 0.12);
		--shadow: 0 20px 60px rgba(58, 43, 24, 0.12);
		--accent: #9f3d22;
		--accent-soft: #d86d43;
		--radius: 24px;
		font-family:
			"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif;
		background:
			radial-gradient(circle at top left, rgba(216, 109, 67, 0.18), transparent 28rem),
			radial-gradient(circle at right, rgba(159, 61, 34, 0.14), transparent 24rem),
			linear-gradient(180deg, var(--bg) 0%, #f7f2eb 100%);
		color: var(--text);
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		margin: 0;
		min-height: 100vh;
		background: transparent;
		color: var(--text);
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(::selection) {
		background: rgba(216, 109, 67, 0.22);
	}

	:global(a) {
		color: inherit;
	}

	:global(main) {
		width: min(1120px, calc(100% - 2rem));
		margin: 0 auto;
		padding: 3rem 0 5rem;
	}

	:global(.panel) {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		backdrop-filter: blur(16px);
	}

	:global(.eyebrow) {
		font-family: "SFMono-Regular", "Menlo", "Monaco", monospace;
		font-size: 0.78rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--accent);
	}

	:global(.muted) {
		color: var(--muted);
	}

	@media (max-width: 720px) {
		:global(main) {
			width: min(100% - 1rem, 1120px);
			padding-top: 1rem;
		}
	}
</style>
