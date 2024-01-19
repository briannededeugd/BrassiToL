<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import { geoPath, geoNaturalEarth1 } from "d3";
	import { draw } from "svelte/transition";
	import { quadInOut } from "svelte/easing";
	import { selectedSpeciesStore } from "./store.js";

	export let isFlipped; // Accept isFlipped as a prop

	let mounted = false;
	let metadata = [];
	let landcodes = [];
	let countries = [];
	let matchingCountryNames = [];
	let countryInformation = { name: "", frequency: 0 };

	let maxFrequency;
	let dataLoaded = false;
	let selectedSpecies;
	let projection, path;
	import "../lib/fonts/fonts.css";

	$: selectedSpecies = $selectedSpeciesStore;

	$: {
		if (isFlipped && dataLoaded && selectedSpecies) {
			findLandcodes(selectedSpecies);
			drawMap();
		} else if (!isFlipped) {
			clearMap();
		}
	}

	/**=========================================================
	 *     onMount: What's being built when the page is loaded
	 *=========================================================**/
	onMount(async () => {
		try {
			const responses = await Promise.all([
				fetch("./src/lib/BrassiToL_metadata.json"),
				fetch("./src/lib/BrassiToL_landcodes.json"),
				fetch("./src/lib/countries.json"),
			]);

			metadata = await responses[0].json();
			landcodes = await responses[1].json();
			countries = await responses[2].json();

			console.log("METADATA", metadata);
			console.log("LANDCODES", landcodes);
			console.log("COUNTRIES", countries);

			projection = geoNaturalEarth1();
			path = geoPath(projection);

			dataLoaded = true; // Set this flag only after all data has been loaded
		} catch (error) {
			console.error("Error loading data:", error);
		}
	});

	function clearMap() {
		const countriesSvg = d3.select("svg");
		countriesSvg.selectAll("path").remove(); // Clear paths
	}

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
		maxFrequency = Math.max(...matchingCountryNames.map((cn) => cn.frequency));
		const colorScale = d3
			.scaleLinear()
			.domain([0, maxFrequency])
			.range(["#ffffff", "#729a68"]); // Adjust the colors as needed

		const countriesSvg = d3.select("svg");

		countriesSvg.selectAll("path").remove(); // Clear existing paths

		countriesSvg
			.selectAll("path")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("d", path)
			.on("mouseover", function (event, d) {
				countryInformation = matchingCountryNames.find(
					(cn) => cn.name === d.properties.name
				);

				console.log("What have we learned:", countryInformation);

				if (countryInformation && countryInformation.frequency > 0) {
					let tooltip = d3.select("article");

					tooltip
						.style("visibility", "visible")
						.style("position", "absolute")
						.style("left", event.clientX + 10 + "px")
						.style("top", event.clientY + 10 + "px");

					d3.select("article > h3").text(countryInformation.name);
					d3.select("article > p").text(
						countryInformation.frequency + " " + "species"
					);
				}
			})
			.on("mouseout", function (event, d) {
				let tooltip = d3.select("#mapInfo");

				tooltip.style("visibility", "hidden");
			})
			.attr("fill", function (d) {
				const countryData = matchingCountryNames.find(
					(cn) => cn.name === d.properties.name
				);
				return countryData ? colorScale(countryData.frequency) : "white";
			})
			.attr("stroke", "#000")
			.attr("stroke-width", ".5px")
			.style("cursor", "pointer");
	}
</script>

<svg> </svg>

<style>
	svg {
		z-index: 1;
	}
</style>
