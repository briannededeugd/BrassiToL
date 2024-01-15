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

	/**=========================================================
	 *     onMount: What's being built when the page is loaded
	 *=========================================================**/
	onMount(async () => {
		const response = await fetch("./src/lib/BrassiToL_metadata.json");
		metadata = await response.json();

		const landcodeResponse = await fetch("./src/lib/BrassiToL_landcodes.json");
		landcodes = await landcodeResponse.json();

		const countriesResponse = await fetch("./src/lib/countries.json");
		countries = await countriesResponse.json();

		mounted = true;

		selectedSpeciesStore.subscribe((value) => {
			selectedSpecies = value;
			findLandcodes(selectedSpecies);
		});

		projection = geoNaturalEarth1();
		path = geoPath(projection);
		drawMap();
	});

	/**===============================
	 *     Getting the landcodes
	 *    of the selected species
	 *=============================**/

	function findLandcodes(selectedSpecies) {
		const matchedObjects = metadata.filter((item) =>
			selectedSpecies.has(item.SPECIES)
		);

		// Extract and flatten the WCVP_WGSRPD_LEVEL_3_native values
		const landCodes = matchedObjects.flatMap(
			(item) => item.WCVP_WGSRPD_LEVEL_3_native
		);

		// Find the corresponding WGSRPD_name for each land code
		const wgsrpdNames = landCodes
			.map((code) => {
				const landcodeObj = landcodes.find((lc) => lc.code === code);
				return landcodeObj ? landcodeObj.WGSRPD_name : null;
			})
			.filter((name) => name !== null);

		// Now find the matching countries from the countries.json data
		const matchingCountries = countries.features.filter((feature) =>
			wgsrpdNames.includes(feature.properties.name)
		);

		// Extracting just the names or entire feature as per your requirement
		matchingCountryNames = matchingCountries.map(
			(country) => country.properties.name
		);

		// Log the results
		console.log("Matching Countries:", matchingCountryNames);
		console.log("DATA:", countries.features);
		// Return the results if needed
		return matchingCountryNames;
	}

	/**===============================
	 *     Coloring in the countries
	 *  found from the selected species
	 *===============================**/

	function drawMap() {
		const svg = d3.select("svg");
		svg
			.selectAll("path")
			.data(countries.features) // This binds each country's data to a path
			.enter()
			.append("path")
			.attr("d", path) // The 'path' here is a geoPath projection function
			.attr("fill", function (d) {
				// Using a function to access each country's data
				return matchingCountryNames.includes(d.properties.name)
					? "blue"
					: "grey";
			});
	}
</script>

<svg></svg>
