<script>
	import PhylogeneticTree from "../components/PhylogeneticTree.svelte";
	import treeData from "/src/tree.txt"; // Update the path

	const treeProps = { treeData };
</script>

<main>
	<PhylogeneticTree {...treeProps} />
</main>

<style>
</style>
