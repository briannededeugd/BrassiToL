<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import { writable } from "svelte/store";
	import PhyloTree from "../components/PhyloTree.svelte";
	import FilterSystem from "../components/FilterSystem.svelte";
	import Marks from "../components/Marks.svelte";
	import MapLegend from "../components/MapLegend.svelte";
	import Footer from "../components/Footer.svelte";
	import "../lib/fonts/fonts.css";

	onMount(async () => {
		const welcomeMessage = d3.select("#welcomeMessage");
		const button = d3.select("#confirmationButton");

		button.on("click", function () {
			welcomeMessage.style("visibility", "hidden");
			console.log("closing the welcome message");
		});
	});

	function closeInfo() {
		const popUp = d3.select("#countryPopup");
		popUp.style("visibility", "hidden");
	}

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
			<p>Explore Tree by</p>
			<FilterSystem />
		</section>

		<section class="content">
			{#if $isFlipped}
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
					<section id="popupMetadata">
						<section>
							<h3 id="nameOfCountry">Test</h3>
							<p id="frequencyOfCountry">Test Frequency</p>
						</section>
						<button id="closePopup" on:click={closeInfo}>✕</button>
					</section>
					<ul id="speciesList">
						<!-- EMPTY LIST -->
					</ul>
				</article>
			{:else}
				<div class="phyloTree">
					<PhyloTree />
				</div>
			{/if}
		</section>

		<div id="welcomeMessage" style="visibility: visible">
			<div id="dragTutorial">
				<h3>Drag to the left or right to rotate the Tree of Life.</h3>
				<button id="confirmationButton"> Got it! </button>
			</div>
		</div>
	</main>

	<footer class="footer">
		<Footer />
	</footer>
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

	#welcomeMessage {
		background-color: #0000003e;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		font-family: "Inter", sans-serif;
	}

	#dragTutorial {
		background-color: #0d1c1bb6;
		border: 0.85px solid #e1e1e1;
		border-radius: 5px;
		color: #e1e1e1;
		width: 15vw;
		height: 15vh;
		padding: 1em 3em;
		text-align: center;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateX(-50%);
	}

	#dragTutorial h3 {
		font-size: 1em;
		margin-bottom: 1.25em;
	}

	#dragTutorial button {
		font-weight: 600;
		border-radius: 25px;
		border: none;
		background-color: #729a68;
		color: white;
		padding: 0.5em 3em;
	}

	#dragTutorial button:hover {
		background-color: #445c3d;
		cursor: pointer;
	}

	.filtercontainer {
		position: absolute;
		z-index: 9800;
		width: 95vw;
	}

	.filtercontainer > p {
		font-family: "Inter", sans-serif;
		color: #e1e1e1;
		margin: 0.75em 0 0.5em 0.25em;
		padding: 0;
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
		margin-bottom: 0.95em;
		z-index: 9999;
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
		font-size: 2em;
		font-family: "Abel", sans-serif;
		margin-bottom: 0.5em;
		color: #e1e1e1;
	}

	h1::before {
		content: "";
		display: inline-block;
		width: 1em;
		height: 1em;
		margin-right: 0.35em;
		margin-bottom: 0.2em;
		background-image: url("./src/lib/img/croplogo.png");
		background-size: contain;
		background-repeat: no-repeat;
		vertical-align: middle;
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
		z-index: 9888;
	}

	.content > svg {
		position: absolute;
		top: 30vh;
		left: 47.5%;
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
	}

	#popupMetadata {
		display: flex;
		justify-content: space-between;
		align-items: start;
		border-bottom: 1px solid #729a68;
		padding-bottom: 0.5em;
	}

	#popupMetadata button {
		height: 20px;
		width: 20px;
		color: #e1e1e1;
		border: none;
		background: transparent;
	}

	#popupMetadata button:hover {
		cursor: pointer;
		color: #729a68;
	}

	#speciesList {
		list-style-type: none;
		padding: 0;
		margin-bottom: 0;
		max-height: 82px;
		overflow-y: auto;
	}

	/* ****** */
	/* FOOTER */
	/* ****** */

	footer {
		position: absolute;
		min-width: 100vw;
		top: 200vh;
	}
</style>
