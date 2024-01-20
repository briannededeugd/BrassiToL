<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import "/static/fonts/fonts.css";

	export let isFlipped; // Accept isFlipped as a prop

	// Reactive statement to react to changes in isFlipped
	$: if (!isFlipped) {
		clearLegend(); // You might need to implement this function
	}

	function clearLegend() {
		const SVGlegend = d3.select(".legend-container");
		SVGlegend.remove(); // Clear paths
	}
</script>

{#if isFlipped}
	<!-- Your HTML file -->
	<div class="legend-container">
		<h3>Number of species</h3>
		<div class="legend-item">
			<span class="legend-color" style="background-color: #729a68;"></span>
			<span class="legend-text">10 or more</span>
		</div>
		<div class="legend-item">
			<span class="legend-color" style="background-color: #95b38d;"></span>
		</div>
		<div class="legend-item">
			<span class="legend-color" style="background-color: #b8ccb3;"></span>
			<span class="legend-text">5</span>
		</div>
		<div class="legend-item">
			<span class="legend-color" style="background-color: #dce6d9;"></span>
		</div>
		<div class="legend-item">
			<span class="legend-color" style="background-color: #ffffff;"></span>
			<span class="legend-text">0</span>
		</div>
	</div>
{/if}

<style>
	.legend-container {
		position: absolute;
		left: 2.5vw;
		top: 82%; /* adjust as needed */
		transform: translateY(-50%); /* to center it vertically */
		font-family: "Inter", sans-serif;

		background-color: #0d1c1bc5;
		padding: 1em 2em;
		border-radius: 10px;
		max-width: 210px;
		height: 190px;
		color: white;
	}

	.legend-container > h3 {
		font-size: 0.9em;
		color: #e1e1e1;
	}

	.legend-item {
		display: flex;
		align-items: center;
		margin-bottom: 0; /* Adjust the space between legend items if needed */
	}

	.legend-color {
		display: inline-block;
		width: 25px; /* Width of the color box */
		height: 25px; /* Height of the color box */
		margin-right: 10px; /* Space between the color box and the text */
	}

	.legend-text {
		font-size: 0.75em; /* Adjust the font size if needed */
	}
</style>
