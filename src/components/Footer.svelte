<script>
	import "/static/fonts/fonts.css";
</script>

<section id="footer">
	<section id="maincontent">
		<div id="about">
			<h3>About</h3>
			<p>
				Explore the Brassicaceae family using this interactive phylogenetic tree
				tool. Dive into the diversity of species, navigate the tree with ease,
				and uncover the intricate connections within this plant family. This
				tool is curated by Kasper Hendriks and his botanical research.
			</p>
			<p>
				Hendriks, K. P., Kiefer, C., Al-Shehbaz, I. A., Bailey, C. D., van
				Huysduynen, A. H., Nikolov, L. A., ... & Lens, F. (2023). Global
				Brassicaceae phylogeny based on filtering of 1,000-gene dataset. <em
					>Current Biology</em
				>, 33(19), 4052-4068.
			</p>
		</div>
		<div id="quicklinks">
			<h3>Quick Links</h3>
			<ul>
				<li>
					<a
						href="https://www.linkedin.com/in/kasper-hendriks-b4258711/?originalSubdomain=nl"
						>Kasper Hendriks</a
					>
				</li>
				<li>
					<a href="https://powo.science.kew.org/">POWO</a>
				</li>
				<li>
					<a href="https://www.naturalis.nl/en">Naturalis</a>
				</li>
				<li>
					<a href="https://www.inaturalist.org/">iNaturalist</a>
				</li>
				<li>
					<a href="https://www.uni-osnabrueck.de/en/home/"
						>Osnabrück University</a
					>
				</li>
			</ul>
		</div>
	</section>
	<section id="credits">
		<p>
			<span>This website was created by </span> Brianne de Deugd, Robin Dekker and
			Roosmarijn Hoekstra of the Amsterdam University of Applied Sciences, January
			2024, in collaboration with Kasper Hendriks of Naturalis BioDiversity Center.
		</p>
	</section>
</section>

<style>
	#footer {
		min-width: 100vw;
		color: #e1e1e1;
		font-family: "Inter", sans-serif;
		font-size: 0.85em;
		font-weight: 600;
	}

	#footer h3 {
		font-family: "Bayon", sans-serif;
		font-size: 1.75em;
		font-weight: 100;
	}

	#maincontent {
		background-color: #0e291f97;
		display: flex;
		justify-content: space-between;
		padding: 8vh 10vw;
	}

	#about {
		max-width: 30vw;
	}

	/* QUICK LINKS */

	#quicklinks {
		min-width: 20vw;
	}
	#quicklinks ul {
		list-style-type: none;
		padding: 0;
	}

	#quicklinks ul > * {
		padding: 0.5em 0;
	}

	#quicklinks ul li a {
		text-decoration: none;
		color: #e1e1e1;
		font-size: 0.9em !important;
	}

	#quicklinks ul li a:hover {
		text-decoration: underline;
	}

	#quicklinks ul li a::before {
		content: "";
		display: inline-block;
		border-radius: 2.5px;
		background-size: contain;
		background-repeat: no-repeat;
		vertical-align: middle;
		height: 2em;
		width: 2em;
		margin-right: 1em;
	}

	#quicklinks ul li:first-of-type a::before {
		background-image: url("/static/img/linkedin.jpg");
	}

	#quicklinks ul li:nth-of-type(2) a::before {
		background-image: url("/static/img/kew.jpg");
	}

	#quicklinks ul li:nth-of-type(3) a::before {
		background-image: url("/static/img/naturalis.jpg");
	}

	#quicklinks ul li:nth-of-type(4) a::before {
		background-image: url("/static/img/inaturalist.jpg");
	}

	#quicklinks ul li:nth-of-type(5) a::before {
		background-image: url("/static/img/osnabruck.jpg");
	}

	/* CREDITS */
	#credits {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 3em;
		background-color: #07241a;
		margin-top: 0;
		text-align: center;
		align-items: center;
	}

	#credits p {
		font-size: 0.75em;
		padding-top: 0.5em;
	}

	#credits p span {
		color: #667771;
	}
</style>
