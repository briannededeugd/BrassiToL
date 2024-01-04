<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";

	let treeData; // Declare a variable to hold the tree data

	// Fetch the Newick file content
	async function fetchTreeData() {
		const response = await fetch("/src/tree.txt");
		treeData = await response.text();
	}

	// Function to parse Newick format
	function parseNewick(newickString) {
		let ancestors = [];
		let treeData = { name: "root", children: [] };
		let currentNode = treeData;

		for (let i = 0; i < newickString.length; i++) {
			let char = newickString[i];

			if (char === "(") {
				// Start of a new subtree
				ancestors.push(currentNode);
				let newNode = { name: "", children: [] };
				currentNode.children.push(newNode);
				currentNode = newNode;
			} else if (char === ",") {
				// Start of a sibling
				let newNode = { name: "", children: [] };
				ancestors[ancestors.length - 1].children.push(newNode);
				currentNode = newNode;
			} else if (char === ")") {
				// End of current subtree
				currentNode = ancestors.pop();
			} else {
				// Accumulate node name
				currentNode.name += char;
			}
		}

		return treeData.children[0]; // Return the root of the tree
	}

	onMount(() => {
		fetchTreeData().then(() => {
			// Parse the tree data using the custom Newick parser
			const parsedTreeData = parseNewick(treeData);

			const margin = { top: 20, right: 90, bottom: 30, left: 90 };
			const width = 1000 - margin.left - margin.right;
			const height = 800 - margin.top - margin.bottom;

			const svg = d3
				.select("#tree-container")
				.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr(
					"transform",
					`translate(${width / 2},${height / 2 + margin.top})`
				); // Center the tree

			// Use d3.hierarchy on the parsed data
			const treeDataParsed = d3.hierarchy(parsedTreeData);

			// Create a radial tree layout
			const treeLayout = d3.tree().size([2 * Math.PI, width / 2]);

			// Assigns the x and y position for each node
			const treeDataProcessed = treeLayout(treeDataParsed);

			// Render tree nodes
			const nodes = svg
				.selectAll("g.node")
				.data(treeDataProcessed.descendants())
				.enter()
				.append("g")
				.attr("class", "node")
				.attr(
					"transform",
					(d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
				);

			nodes.append("circle").attr("r", 5).style("fill", "#69b3a2");

			nodes
				.append("text")
				.attr("dy", ".35em")
				.attr("x", (d) => (d.x < Math.PI === !d.children ? 13 : -13))
				.attr("text-anchor", (d) =>
					d.x < Math.PI === !d.children ? "start" : "end"
				)
				.text((d) => d.data.name);

			// Render tree links
			const links = svg
				.selectAll("path.link")
				.data(treeDataProcessed.links())
				.enter()
				.append("path")
				.attr("class", "link")
				.attr(
					"d",
					d3
						.linkRadial()
						.angle((d) => d.x)
						.radius((d) => d.y)
				);
		});
	});
</script>

<div id="tree-container"></div>
