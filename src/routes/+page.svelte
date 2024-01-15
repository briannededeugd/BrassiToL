<script>
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import PhyloTree from "../components/PhyloTree.svelte";
	import FilterSystem from "../components/FilterSystem.svelte";
	import Marks from "../components/Marks.svelte";

	import { json } from "d3";

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
	}
</script>

<main>
	<section class="title">
		<h1>brassicaceae <span>|</span> <span>Tree of Life</span></h1>
		<div class="switch-view">
			<h3>Phylogenetic Tree</h3>
			<label class="switch">
				<input type="checkbox" on:click={toggleView} />
				<span class="slider round"></span>
			</label>
			<h3>World Map</h3>
		</div>
	</section>

	<section class="filtercontainer">
		<FilterSystem />
	</section>

	<section class="content">
		{#if $isFlipped}
			<div class="worldMap">
				<svg {width} {height}>
					<Marks />
				</svg>
			</div>
		{:else}
			<div class="phyloTree">
				<PhyloTree />
			</div>
		{/if}
	</section>
</main>

<style>
	main {
		margin: 0.75em 2em;
	}

	.filtercontainer {
		position: absolute;
		z-index: 9999;
	}

	/**********************/
	/*    TITLE SECTION   */
	/**********************/

	.title {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid black;
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
		background-color: white;
		border: 1px solid black;
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
		background-color: black;
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
		grid-area: 1 / 1 / 1 / 3;
	}

	h1 > span:first-of-type {
		font-family: "Times New Roman", Times, serif;
		font-weight: 100;
	}

	h1 > span:nth-of-type(2) {
		font-family: "Bayon", sans-serif;
	}

	h3 {
		font-family: "Abel", sans-serif;
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
</style>
