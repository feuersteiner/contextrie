<main>
	<section class="hero panel">
		<div class="eyebrow">Contextrie Docs</div>
		<h1>Context kept sharp.</h1>
		<p class="lede">
			Contextrie helps long-running agents stay precise by curating the context they carry
			forward.
		</p>
		<div class="hero-meta">
			<div>
				<span class="label">Phase</span>
				<strong>Early development</strong>
			</div>
			<div>
				<span class="label">Surface</span>
				<strong>Docs scaffold</strong>
			</div>
			<div>
				<span class="label">Bias</span>
				<strong>Small, composable packages</strong>
			</div>
		</div>
	</section>

	<section class="grid">
		<article class="panel card">
			<div class="eyebrow">Layout</div>
			<h2>Repo surfaces</h2>
			<ul>
				<li><strong>core</strong> for contracts and source primitives</li>
				<li><strong>cli</strong> for the command-line wrapper</li>
				<li><strong>docs</strong> for the public-facing explanation layer</li>
			</ul>
		</article>

		<article class="panel card">
			<div class="eyebrow">Flow</div>
			<h2>Indexing path</h2>
			<p class="muted">
				Sources start as content without metadata, then indexing adds retrieval metadata
				that agents can judge and compose against.
			</p>
		</article>
	</section>
</main>

<style>
	.hero {
		padding: 3.5rem;
		margin-bottom: 1.25rem;
		position: relative;
		overflow: hidden;
	}

	.hero::after {
		content: '';
		position: absolute;
		inset: auto -4rem -5rem auto;
		width: 18rem;
		height: 18rem;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(216, 109, 67, 0.28), transparent 68%);
	}

	h1,
	h2,
	p,
	ul {
		position: relative;
		z-index: 1;
	}

	h1 {
		font-size: clamp(3rem, 8vw, 5.8rem);
		line-height: 0.95;
		margin: 0.35rem 0 1rem;
		max-width: 10ch;
	}

	h2 {
		font-size: 1.5rem;
		margin: 0.4rem 0 0.75rem;
	}

	.lede {
		font-size: clamp(1.05rem, 2vw, 1.35rem);
		line-height: 1.55;
		max-width: 40rem;
		color: var(--muted);
		margin: 0 0 2rem;
	}

	.hero-meta {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.85rem;
	}

	.hero-meta > div,
	.card {
		padding: 1rem 1.1rem;
		border: 1px solid var(--border);
		border-radius: 18px;
		background: rgba(255, 250, 242, 0.72);
	}

	.label {
		display: block;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--muted);
		margin-bottom: 0.35rem;
	}

	.grid {
		display: grid;
		grid-template-columns: 1.2fr 0.8fr;
		gap: 1rem;
	}

	.card ul {
		margin: 0;
		padding-left: 1.2rem;
		color: var(--muted);
		line-height: 1.6;
	}

	.card p {
		margin: 0;
		line-height: 1.6;
	}

	@media (max-width: 720px) {
		.hero {
			padding: 1.4rem;
		}

		.hero-meta,
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
