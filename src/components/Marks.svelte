<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import { geoPath, geoNaturalEarth1 } from "d3";
	import { draw } from "svelte/transition";
	import { quadInOut } from "svelte/easing";
	import { selectedSpeciesStore } from "./store.js";

	let mounted = false;
	let metadata = [];
	let landcodes = [];
	let countries = [];
	let matchingCountryNames = [];
	let selectedSpecies;
	let projection, path;
	import "../lib/fonts/fonts.css";

	/**=========================================================
	 *     onMount: What's being built when the page is loaded
	 *=========================================================**/
	onMount(async () => {
		const response = await fetch("./src/lib/BrassiToL_metadata.json");
		metadata = await response.json();
		console.log("METADATA", metadata);

		const landcodeResponse = await fetch("./src/lib/BrassiToL_landcodes.json");
		landcodes = await landcodeResponse.json();
		console.log("LANDCODES", landcodes);

		const countriesResponse = await fetch("./src/lib/countries.json");
		countries = await countriesResponse.json();
		console.log("COUNTRIES", countries);

		mounted = true;

		projection = geoNaturalEarth1();
		path = geoPath(projection);

		selectedSpeciesStore.subscribe((value) => {
			console.log("Come subscribe to my channel", value);
			selectedSpecies = value;
			findLandcodes(selectedSpecies);
			drawMap();
		});
	});

	/**===============================
	 *     Getting the landcodes
	 *    of the selected species
	 *=============================**/

	function findLandcodes(selectedSpecies) {
		const matchedObjects = metadata.filter((item) =>
			selectedSpecies.has(item.SPECIES_NAME_PRINT)
		);
		const landCodes = matchedObjects.flatMap(
			(item) => item.WCVP_WGSRPD_LEVEL_3_native
		);
		const wgsrpdNames = landCodes
			.map((code) => {
				const landcodeObj = landcodes.find((lc) => lc.code === code);
				return landcodeObj ? landcodeObj.WGSRPD_name : null;
			})
			.filter((name) => name !== null);
		const countryFrequency = new Map();
		wgsrpdNames.forEach((name) => {
			countryFrequency.set(name, (countryFrequency.get(name) || 0) + 1);
		});
		matchingCountryNames = countries.features
			.filter((feature) => countryFrequency.has(feature.properties.name))
			.map((country) => ({
				name: country.properties.name,
				frequency: countryFrequency.get(country.properties.name),
			}));

		console.log("MATCHING COUNTRIES:", matchingCountryNames);
		return matchingCountryNames;
	}

	/**===============================
	 *     Coloring in the countries
	 *  found from the selected species
	 *===============================**/

	function drawMap() {
		const maxFrequency = Math.max(
			...matchingCountryNames.map((cn) => cn.frequency)
		);
		const colorScale = d3
			.scaleLinear()
			.domain([0, maxFrequency])
			.range(["lightgrey", "blue"]); // Adjust the colors as needed

		const svg = d3.select("svg");
		svg.selectAll("path").remove(); // Clear existing paths
		svg
			.selectAll("path")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("fill", function (d) {
				const countryData = matchingCountryNames.find(
					(cn) => cn.name === d.properties.name
				);
				return countryData ? colorScale(countryData.frequency) : "white";
			})
			.attr("stroke", "#000")
			.attr("stroke-width", ".5px");

		
	}

	//

	function drawLegend(maxFrequency, colorScale) {
		console.log("MAX FREQUENCY:", maxFrequency);
		const legendWidth = 300,
			legendHeight = 50;
		const numSwatches = 10; // Number of swatches in the legend

		const svgLegend = d3
			.select("#legend")
			.append("svg")
			.attr("width", legendWidth)
			.attr("height", legendHeight);

		const xScale = d3
			.scaleLinear()
			.domain([0, maxFrequency])
			.range([0, legendWidth]);

		// Create colored rectangles based on the frequency scale
		svgLegend
			.selectAll("rect")
			.data(d3.range(numSwatches))
			.enter()
			.append("rect")
			.attr("x", (d, i) => xScale((d * maxFrequency) / numSwatches))
			.attr("y", 0)
			.attr("width", legendWidth / numSwatches)
			.attr("height", legendHeight / 2)
			.attr("fill", (d) => colorScale((d * maxFrequency) / numSwatches));

		// Add text labels at specific frequency values
		svgLegend
			.append("text")
			.attr("x", xScale(0))
			.attr("y", legendHeight)
			.text("Low Frequency");

		svgLegend
			.append("text")
			.attr("x", xScale(maxFrequency))
			.attr("y", legendHeight)
			.attr("text-anchor", "end")
			.text("High Frequency");
	}
</script>

<svg></svg>
<div id="legend"></div>

<style>
	#legend {
		margin-top: 20px;
		text-align: center;
		font-size: 12px;
	}
</style>
