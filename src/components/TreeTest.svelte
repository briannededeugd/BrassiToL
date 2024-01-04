<script>
	import { onMount } from "svelte";
	import PhyloTree from "phylotree";
	import * as d3 from "d3";

	let treeData;

	onMount(() => {
		// Load your tree data from the .tree-file or an API
		// Example: Fetch tree data from a static file
		fetch("/static/BrassiToL_easy.tree")
			.then((response) => response.text())
			.then((data) => {
				treeData = PhyloTree.parse_newick(data);
				PhyloTree.draw("#tree-container", treeData);
			});
	});
</script>

<div id="tree-container"></div>

<style>
	#tree-container {
		width: 100%;
		height: 500px;
	}
</style>
