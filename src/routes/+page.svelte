<script>
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import PhyloTree from "../components/PhyloTree.svelte";
	import FilterSystem from "../components/FilterSystem.svelte";
	import Marks from "../components/Marks.svelte";
	import MapLegend from "../components/MapLegend.svelte";
	import "../lib/fonts/fonts.css";

	let dataset = [];

	onMount(async () => {
		fetch("./src/lib/countries.json")
			.then((response) => response.json())
			.then((data) => {
				dataset = data.features;
			})
			.catch((error) => console.error("Error loading local JSON:", error));
	});
	const width = 1200,
		height = 800;

	const isFlipped = writable(false);

	function toggleView() {
		isFlipped.update((n) => !n);
		if (!isFlipped) {
		}
	}
</script>

<body>
	<main>
		<section class="title">
			<h1>brassicaceae <span>|</span> <span>Tree of Life</span></h1>
			<div class="switch-view">
				<h2>Phylogenetic Tree</h2>
				<label class="switch">
					<input type="checkbox" on:click={toggleView} />
					<span class="slider round"></span>
				</label>
				<h2>World Map</h2>
			</div>
		</section>

		<section class="filtercontainer">
			<FilterSystem />
		</section>

		<!-- DIT MISSCHIEN AANPASSEN ZODAT DE MAP ITS OWN BUSINESS MIND??? ZOLANG IK HEB GESWITCHT BLIJFT EEN STUKJE VAN WORLDMAP MEEDOEN -->
		<section class="content">
			{#if $isFlipped}
				<div class="worldMap">
					<svg {width} {height}>
						<Marks isFlipped={$isFlipped} />
					</svg>
					<MapLegend isFlipped={$isFlipped} />

					<!-- THE HOVER TOOLTIP -->
					<article id="mapInfo" style="visibility: hidden">
						<h3 id="countryname">Test</h3>
						<p id="countryfrequency">Test matches</p>
					</article>

					<!-- THE CLICK TOOLTIP -->
					<article id="countryPopup" style="visibility: hidden">
						<h3 id="nameOfCountry">Test</h3>
						<p id="frequencyOfCountry">Test Frequency</p>
						<ul id="speciesList">
							<!-- EMPTY LIST -->
						</ul>
					</article>
				</div>
			{:else}
				<div class="phyloTree">
					<PhyloTree />
				</div>
			{/if}
		</section>
	</main>
</body>

<style>
	body {
		background: url("./src/lib/img/sitebackground.jpeg") no-repeat center center
			fixed;
		background-size: cover;
		width: 100%;
		min-height: 100%;
		margin: 0;
		padding: 0;
		overflow-x: hidden;
	}

	main {
		margin: 0.75em 2em;
	}

	.filtercontainer {
		position: absolute;
		z-index: 8000;
	}

	/**********************/
	/*    TITLE SECTION   */
	/**********************/

	.title {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		border-bottom: 2px solid #729a68;
		margin-bottom: 2.5em;
	}

	.title .switch-view {
		display: flex;
		flex-direction: row;

		align-items: center;
		gap: 10px;
	}

	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}

	/* Hide default HTML checkbox */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The slider */
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: transparent;
		border: 1px solid #e1e1e1;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: "";
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: #e1e1e1;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}

	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}

	h1 {
		font-size: 2.5em;
		font-family: "Abel", sans-serif;
		margin: 0.5em 0;
		color: #e1e1e1;
		grid-area: 1 / 1 / 1 / 3;
	}

	h1 > span:first-of-type {
		font-family: "Times New Roman", Times, serif;
		font-weight: 100;
	}

	h1 > span:nth-of-type(2) {
		font-family: "Bayon", sans-serif;
	}

	h2 {
		font-family: "Bayon", sans-serif;
		font-size: 1.5em;
		color: #e1e1e1;
	}

	.content {
		margin-top: 15vh;
		z-index: 9999;
	}

	.worldMap {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.worldMap svg {
		position: absolute;
		top: 40vh;
		left: 55%;
		transform: translateX(-50%);
	}

	/* *********** */
	/* TOOLTIP */
	/* *********** */

	#mapInfo,
	#countryPopup {
		background-color: #26322ff3;
		backdrop-filter: blur(5px);
		font-family: "Inter", sans-serif;
		border-radius: 5px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
		border: 1px solid #e1e1e1;
		min-width: 10vw;
		min-height: max-content;
		color: #e1e1e1;
		padding: 1em;
		z-index: 9999;
	}

	#mapInfo h3,
	#countryPopup h3 {
		color: #e1e1e1;
		font-size: 0.85em;
		margin: 0 auto;
	}

	#mapInfo p {
		font-size: 0.65em;
		margin: 0 auto;
	}

	#countryPopup p {
		font-size: 0.65em;
		padding-top: 0;
		margin-top: 0 !important;
		padding-bottom: 1em;
		border-bottom: 1px solid #729a68;
	}
</style>
