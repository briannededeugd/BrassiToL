<script>
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import { Converter } from "csvtojson/v2/Converter";
	import * as d3 from "d3";

	let data = [];
	let searchQuery = "";
	const suggestions = writable([]);
	var converter = new Converter({});

	// Function to load your CSV data
	async function loadData() {
		try {
			converter.fromFile("BrassiToL_metadata.csv", function (err, result) {
				var csvData = JSON.stringify([
					{ resultdata: result[0] },
					{ resultdata: result[1] },
					{ resultdata: result[2] },
					{ resultdata: result[3] },
					{ resultdata: result[4] },
				]);
				csvData = JSON.parse(csvData);
				console.log(csvData);
			});
		} catch (error) {
			console.error("Error loading the TSV data:", error);
		}
	}

	onMount(() => {
		loadData();
	});

	// Function to update suggestions based on search query
	function updateSuggestions(query) {
		searchQuery = query;
		if (searchQuery.trim().length > 0) {
			const lowerCaseQuery = searchQuery.toLowerCase();
			suggestions.set(
				data.filter((row) => {
					return Object.values(row)
						.slice(1, 8) // Considering columns B to H
						.some((value) => value.toLowerCase().includes(lowerCaseQuery));
				})
			);
		} else {
			suggestions.set([]);
		}
	}
</script>

<div>
	<input
		type="text"
		placeholder="Search..."
		on:input={(e) => updateSuggestions(e.target.value)}
	/>
	<ul>
		{#each $suggestions as suggestion}
			<li>{suggestion}</li>
		{/each}
	</ul>
</div>

<style>
	/* Add your styles here */
</style>
