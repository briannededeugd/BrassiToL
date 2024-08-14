<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { selectedSpeciesStore } from "$stores/store.js";
  import { newickString, outgroupString } from "$stores/treefiles.js";
  import { noFilterResults } from "$stores/filterresultstore.js";
  import { isLoading } from "$stores/loadingstore.js";
  import "@fortawesome/fontawesome-free/css/all.css";

  /**========================================================================
   *                           SET-UP (DATA)
   *
   * Parsing the raw tree files so they can be used to draw the Phylogenetic
   * Tree. The strings are imported from the treefiles.js-file in the store
   * folder.
   *========================================================================**/

  // The tree strings - data for drawing the tree (includes branch length and sample numbers)
  const parsedOutgroupData = parseNewick(outgroupString);
  const parsedData = parseNewick(newickString);

  /**
   * @name parseNewick
   * @role Parsing the raw tree strings so they can be read
   * @param a | The Newick string (the tree string) for drawing the tree
   */
  function parseNewick(a) {
    for (
      var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0;
      t < s.length;
      t++
    ) {
      var n = s[t];
      switch (n) {
        case "(":
          var c = {};
          r.branchset = [c];
          e.push(r);
          r = c;
          break;
        case ",":
          var b = {};
          e[e.length - 1].branchset.push(b);
          r = b;
          break;
        case ")":
          r = e.pop();
          break;
        case ":":
          break;
        default:
          var h = s[t - 1];
          ")" == h || "(" == h || "," == h
            ? (r.name = n)
            : ":" == h && (r.length = parseFloat(n));
      }
    }
    return r;
  }

  /**========================================================================
   *                           DECLARING VARIABLES
   *
   * All variables used throughout this component.
   *========================================================================**/

  // Data arrays for the JSON-data to be appended to
  let metadata = [];
  let landcodes = [];

  let selectedSpecies; // An array for the filtered species from the store to be appended to
  let isNoFilterResults; // Variable to store the boolean fetched from the filterresultstore that checks if there are or aren't any filter results

  // Variables for the color scale to be available globally
  let supertribes = [];
  let colorScale;

  let sharedRoot; // Variable to append the root of the visualization to
  let branchLengths = []; // An array to collect the branch length for each node
  let totalBranchLengths = []; // Array to collect total branch lengths from root to each leaf

  // Booleans for user controls to be available globally
  let supertribesShown = false;
  let outgroupsShown = false;
  let isTooltipPinned = false;

  let lastClickedLabel = null; // Track which label was clicked and therefore active
  let svg; // Empty SVG to append the visualization to
  let infocontainer; // Empty container to append information per label to when it's required
  let isTooltipHoverVisible = false; // Track if the small popup is visible

  let sampleNumber; // Variable to store the sample number of the relevant label in for later use

  // Variables for the fetched data of the relevant plant for the tooltip and infocontainer
  let fullSpeciesName;
  let authorName;
  let subfamilyName;
  let supertribeName;
  let tribeName;
  let lifeformName;
  let climateName;
  let growthformName;
  let societaluseName;
  let geographicareaName;
  let imageId;

  // Variables for allowing and tracking the rotation of the tree
  let rotation = 0; // Initial rotation
  let isDragging = false;
  let startX;

  // Variables for the magnification lens function
  let lensRadius = 90; // Radius of the magnifying lens
  let magnificationFactor = 3; // How much the lens should magnify
  let lensPosition = { x: 180, y: 100 }; // Fixed position of the lens

  // Variables for the size of the tree
  const width = 900;
  const outerRadius = width / 2;
  const innerRadius = outerRadius - 170;

  /**========================================================================
   *                         ONMOUNT: ON INITIAL PAGE LOAD
   *
   *                    Load in all data before the page loads
   *            Fetch data and make sure it's available at all times
   *          Populate variables that are needed for the site to work
   *========================================================================**/
  onMount(async () => {
    isLoading.set(true);

    const responses = await Promise.all([
      fetch("/metadata/BrassiToL_metadata.json"),
      fetch("/metadata/BrassiToL_landcodes.json"),
    ]);

    metadata = await responses[0].json();
    landcodes = await responses[1].json();

    const uniqueItems = new Set(
      metadata.map((item) => item.SUPERTRIBE).filter((item) => item !== "NA"),
    );
    supertribes = [...uniqueItems];
    supertribes = supertribes.sort((a, b) => a.localeCompare(b));
    console.log("THE SUPERTRIBES", supertribes);

    colorScale = d3.scaleOrdinal().domain(supertribes).range([
      "#907ad6", // Arabodae
      "#169e73", // Brassicodae
      "#cc79a7", // Camelinodae
      "#d55e00", // Heliophilodae
      "#56b4e9", // Hesperodae
      "#e69f01", // Unplaced
      "#e1e1e1", // NA
    ]);

    /**============================
     *    CHECK OUTGROUPS TOGGLE
     *===========================**/

    svg = createPhylogeneticTree(parsedData);
    const outgroupsToggle = d3.select("#showOutgroups");
    const outgroupIcon = d3.select("#showOutgroups button img");
    infocontainer = d3.selectAll(".infobox");

    outgroupsToggle.on("click", function () {
      if (outgroupsShown) {
        outgroupsShown = false;
        svg = createPhylogeneticTree(parsedData);
        outgroupIcon.attr("src", "/img/outgroups.png");
        outgroupsToggle.style("background-color", "#0d1c1bc5");
      } else {
        outgroupsShown = true;
        svg = createPhylogeneticTree(parsedOutgroupData);
        outgroupIcon.attr("src", "/img/darkoutgroups.png");
        outgroupsToggle.style("background-color", "#e1e1e1");
      }

      updateTreeColors(selectedSpecies);

      // Append the new SVG
      const container = document.querySelector("#phyloTree");
      if (container) {
        container.appendChild(svg);
      } else {
        console.error("Container not found");
      }
    });

    // Append the new SVG
    const container = document.querySelector("#phyloTree");
    if (container) {
      container.appendChild(svg);
    } else {
      console.error("Container not found");
    }

    // appendMagnifier();

    /**======================
     *    TOGGLE ZOOM LENS
     *========================**/

    const lensButton = d3.select("#lensToggle");
    const lensIcon = d3.select("#lensToggle button img");
    const magnifyingGlass = d3.select("#magnifier");
    let lensOn = false;

    lensButton.on("click", function () {
      if (lensOn === false) {
        magnifyingGlass.style("visibility", "visible");
        lensButton.style("background-color", "#e1e1e1");
        lensIcon.attr("src", "/img/darkzoom.png");
        lensOn = true;
      } else {
        magnifyingGlass.style("visibility", "hidden");
        lensButton.style("background-color", "#0d1c1bc5");
        lensIcon.attr("src", "/img/zoom.png");
        lensOn = false;
      }
    });

    /**======================
     *    TOGGLE SETTINGS
     *========================**/

    const settingsToggle = d3.select("#settings");
    const settings = d3.select("#settingOptions");
    const settingsIcon = d3.select("#settings button img");
    let settingsShown = false;

    settingsToggle.on("click", function () {
      if (settingsShown === false) {
        settings.style("visibility", "visible");
        settingsToggle.style("background-color", "#e1e1e1");
        settingsIcon.attr("src", "/img/darksettings.png");
        settingsShown = true;
      } else {
        settings.style("visibility", "hidden");
        settingsToggle.style("background-color", "#0d1c1bc5");
        settingsIcon.attr("src", "/img/settings.png");
        settingsShown = false;
      }
    });

    /**======================
     *    TOGGLE LIGHT MODE
     *========================**/

    const modeToggle = d3.select("#switchToLightMode");
    const modeIcon = d3.select("#switchToLightMode button img");
    let lightmode = false;

    modeToggle.on("click", function () {
      if (lightmode === false) {
        modeToggle.style("background-color", "#e1e1e1");
        modeIcon.attr("src", "/img/darklight.png");
        lightmode = true;
      } else {
        modeToggle.style("background-color", "#0d1c1bc5");
        modeIcon.attr("src", "/img/light.png");
        lightmode = false;
      }
    });

    /**==========================
     *    TOGGLE SUPERTRIBES
     *=========================**/

    const showSupertribes = d3.select("#showSupertribes");
    const supertribesIcon = d3.select("#showSupertribes button img");
    const legend = d3.select("#legend");
    supertribesShown = false;

    showSupertribes.on("click", function () {
      if (supertribesShown === false) {
        supertribesShown = true;
        legend.style("visibility", "hidden");
        showSupertribes.style("background-color", "#e1e1e1");
        supertribesIcon.attr("src", "/img/darkhierarchy.png");
        updateTreeColors(selectedSpecies);
      } else {
        supertribesShown = false;
        legend.style("visibility", "visible");
        showSupertribes.style("background-color", "#0d1c1bc5");
        supertribesIcon.attr("src", "/img/hierarchy.png");
        updateTreeColors(selectedSpecies);
      }
    });

    /**======================
     *    CLOSE PINNED TOOLTIP
     *========================**/

    d3.select("#shutTooltip").on("click", closePopup);
    d3.select("body").on("keydown", function (event) {
      if (event && event.keyCode === 27) {
        console.debug("ESC was pressed");
        closePopup();
      }
    });

    function closePopup() {
      infocontainer.style("visibility", "hidden");
      isTooltipPinned = false;

      if (lastClickedLabel) {
        lastClickedLabel.classed("label--active", false); // Remove the active class
        lastClickedLabel = null; // Reset the reference
      }

      // Re-enable pointer events for labels if you've disabled them
      d3.selectAll("text.node").style("pointer-events", "auto");
    }

    // For filtering
    selectedSpeciesStore.subscribe((value) => {
      selectedSpecies = value;
      updateTreeColors(selectedSpecies);
    });

    // For no filter results
    const unsubscribe = noFilterResults.subscribe((value) => {
      isNoFilterResults = value;
      console.log("Store value changed:", value); // Log value to check changes
      updateTreeColors(selectedSpecies); // Update colors based on new store value
    });

    isLoading.set(false);
  });

  /**========================================================================
   *                           MAGNIFYING FUNCTIONS
   *
   * Currently doesn't work.
   * Appends the magnifier to the visualization and magnifies all labels
   * underneath.
   *========================================================================**/

  /**
   * @name appendMagnifier
   * @role Append the magnifier to the visualization
   */
  function appendMagnifier() {
    const magnifier = d3.select("#magnifier");
    // Create the magnifying lens
    magnifier
      .append("circle")
      .attr("class", "magnifying-lens")
      .attr("position", "absolute")
      .attr("width", "350px")
      .attr("height", "350px")
      .attr("r", lensRadius)
      .attr("cx", lensPosition.x)
      .attr("cy", lensPosition.y)
      .attr("fill", "rgba(255, 255, 255, 0.1)") // Semi-transparent lens
      .attr("stroke", "black")
      .attr("stroke-width", 2);
  }

  /**
   * @name updateMagnification
   * @role Updates the lens position and magnifies on mouse move
   */
  function updateMagnification() {
    const theTree = d3.select("#phyloTree svg");
    const nodes = theTree.selectAll(".node");

    nodes.each(function () {
      const node = d3.select(this);

      if (isWithinLens(lensPosition, lensRadius)) {
        // Apply magnification
        node.attr("transform", "scale(5)");
      }
    });
  }

  /**
   * @name isWithinLens
   * @role Checks which labels are within the lens and should therefore be magnified
   * @param nodePos | Tracks the position of the node (label)
   * @param lensX | The X-position of the appended lens
   * @param lensY | The Y-position of the appended lens
   * @param lensRadius | The radius of the appended lens
   */
  function isWithinLens(nodePos, lensX, lensY, lensRadius) {
    // Calculate distance from lens center to node
    const dx = lensX - nodePos.x;
    const dy = lensY - nodePos.y;
    return Math.sqrt(dx * dx + dy * dy) < lensRadius;
  }

  /**========================================================================
   *                           ROTATION FUNCTIONS
   *
   * Allows the user to drag the tree in order to rotate it
   *========================================================================**/

  /**
   * @name updateTransform
   * @role Update the transform values of the tree's rotation with the value of "rotation"
   */
  function updateTransform() {
    const svgElement = d3.select("#phyloTree");
    if (svgElement) {
      // Combine zoom/pan transformation with rotation
      svgElement.attr("transform", `rotate(${rotation}deg)`);
      updateMagnification();
    }
  }

  /**
   * @name mouseupAction
   * @role Track when the mouseup event fires and stop the rotation
   * @param node | The node that was previously being dragged
   */
  function mouseupAction(node) {
    const handleMouseUp = (event) => {
      stopRotate(event);
    };

    node.addEventListener("mouseup", handleMouseUp);

    return {
      destroy() {
        node.removeEventListener("mouseup", handleMouseUp);
      },
    };
  }

  /**
   * @name startRotate
   * @role Track the starting position for the rotation by drag
   * @param event | Allows for retrieving the clientX-position
   */
  // Function called when the mouse is pressed over the SVG
  function startRotate(event) {
    isDragging = true;
    startX = event.clientX; // Record the initial x position of the mouse
    event.preventDefault(); // Prevent default drag behavior
  }

  /**
   * @name rotateSVG
   * @role Transform the tree when the mouse is pressed over the SVG by checking the cursor-position as long as the user presses their mouse and transforming accordingly
   * @param event | Allows for retrieving the clientX-position
   */
  // Function called when the mouse is moved over the SVG
  function rotateSVG(event) {
    if (!isDragging) return;

    const x = event.clientX;
    const dx = x - startX; // Change in x
    rotation += dx * 0.25; // Adjust this value to control rotation sensitivity

    // Update the SVG rotation
    const svgElement = d3.select("#phyloTree svg");
    if (svgElement) {
      svgElement.style("transform", `rotate(${rotation}deg)`);
    }

    startX = x; // Update the last x position
    updateTransform();
  }

  /**
   * @name stopRotate
   * @role Make sure the isDragging becomes false (this function gets called when the mouse is released)
   */
  function stopRotate() {
    isDragging = false;
  }

  /**========================================================================
   *                         PROCESSING LABELS + MATCHING
   *                             THEM TO THE METADATA
   *
   * Extracting sample IDs, finding names of the relevant labels.
   *========================================================================**/

  /**
   * @name capitalizeFirstLetter
   * @role Simple 'capitalize every first letter'-function
   * @param string | The sentence, phrase or word of which first letters should get capitalized
   */
  function capitalizeFirstLetter(string) {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * @name extractSampleId
   * @role Extract the sample ID from the Newick string
   * @param label | Read the Newick String and extract the ID's nestled inside of it
   */
  function extractSampleId(label) {
    const match = label.match(/^([^:]+)/); // This regex captures everything before the first colon
    return match ? match[1] : label; // Return the captured group if it exists, otherwise return the whole label
  }

  /**
   * @name findFullSpecies
   * @role Find the full species name including relevant genus
   * @param label | The relevant label in the tree by their sample ID (gotten from extractSampleId)
   * @param metadata | The full metadata JSON-file
   */
  function findFullSpecies(label, metadata) {
    let sampleId = label; // Extract the SAMPLE id from the label
    let matchingEntry = metadata.find((item) => item.SAMPLE === sampleId);

    // Function to get the first non-NA taxonomic category
    function getTaxonomicCategory(entry) {
      if (entry.SPECIES_NAME_PRINT !== "NA") return entry.SPECIES_NAME_PRINT;
    }

    if (matchingEntry) {
      const taxonomicCategory = getTaxonomicCategory(matchingEntry);
      return taxonomicCategory;
    } else {
      sampleId = label.slice(1); // Remove the first character (":")
      matchingEntry = metadata.find((item) => item.SAMPLE === sampleId);

      if (matchingEntry) {
        const taxonomicCategory = getTaxonomicCategory(matchingEntry);
        return taxonomicCategory
          ? capitalizeFirstLetter(taxonomicCategory)
          : capitalizeFirstLetter(label);
      } else {
        return "";
      }
    }
  }

  /**
   * @name findSpeciesName
   * @role Find just the species name without the relevant genus
   * @param label | The relevant label in the tree by their sample ID (gotten from extractSampleId)
   * @param metadata | The full metadata JSON-file
   */
  function findSpeciesName(label, metadata) {
    let sampleId = extractSampleId(label); // Extract the SAMPLE id from the label
    let matchingEntry = metadata.find((item) => item.SAMPLE === sampleId);

    // Function to get the first non-NA taxonomic category
    function getTaxonomicCategory(entry) {
      if (entry.SPECIES_NAME_PRINT !== "NA") return entry.SPECIES_NAME_PRINT;
      return null;
    }

    if (matchingEntry) {
      const taxonomicCategory = getTaxonomicCategory(matchingEntry);
      return taxonomicCategory;
    } else {
      sampleId = label.slice(1); // Remove the first character (":")
      matchingEntry = metadata.find((item) => item.SAMPLE === sampleId);

      if (matchingEntry) {
        const taxonomicCategory = getTaxonomicCategory(matchingEntry);
        return taxonomicCategory;
      } else {
        return "";
      }
    }
  }

  /**========================================================================
   *                           DRAWING THE TREE
   *
   * Using the D3 library to draw the phylogenetic tree based on the Newick
   * strings and metadata.
   *========================================================================**/

  /**========================================================================
   *                           THE TIME RINGS
   *========================================================================**/

  /**
   * @name createTimeRings
   * @role Define and draw the time rings inside of the tree visualization
   * @param svg | The SVG to which the drawn tree will be appended
   * @param root | The very root of the tree so that the branch lengths can be collected
   */
  function createTimeRings(svg, root) {
    extractBranchLengths(root, 0);

    // Calculate the maximum total branch length to determine the crown age
    const crownAge = d3.max(totalBranchLengths);

    // Choose the number of rings and calculate interval
    const numberOfRings = 6;
    const ringInterval = crownAge / numberOfRings;

    // Create an array for the ring values
    const ringValues = d3
      .range(numberOfRings)
      .map((index) => crownAge - index * ringInterval);

    // Scales for positioning and coloring the rings
    const timeScale = d3
      .scaleLinear()
      .domain([0, crownAge])
      .range([innerRadius, 0]);

    // Custom interpolator function
    /**
     * @name myColorInterpolator
     * @role Creates an interpolator that transitions between the two colors #3c4d4b and #1b342b.
     * @param normalizedvalue | A normalized value ranging from 0 to 1
     * @returns A color that is a fraction of the way between the start color and the end color (the fraction is the normalizedvalue)
     */
    function myColorInterpolator(normalizedvalue) {
      return d3.interpolateRgb("#3c4d4b", "#1b342b")(normalizedvalue);
    }

    // Using the custom interpolator with scaleSequential
    const colorScaleRings = d3
      .scaleSequential(myColorInterpolator)
      .domain([0, numberOfRings - 1]);

    // Create the rings
    svg
      .selectAll(".time-ring")
      .data(ringValues)
      .enter()
      .append("circle")
      .attr("class", "time-ring")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", (data) => timeScale(data))
      .attr("fill", (data, index) => colorScaleRings(index))
      .attr("stroke", "#667771")
      .attr("stroke-width", ".5px")
      .lower(); // This ensures rings are behind the tree

    // Add labels to the rings
    svg
      .selectAll(".time-label")
      .data(ringValues)
      .enter()
      .append("text")
      .attr("class", "time-label")
      .attr("x", (d) => timeScale(d))
      .attr("y", 5)
      .attr("dy", "0.35em")
      .attr("fill", "#667771")
      .attr("font-size", ".75em")
      .attr("text-anchor", "start")
      .text((d) => `${Math.round(d)} MA`);
  }

  /**
   * @name extractBranchLengths
   * @role Search the tree for the length of each branch and push this to the empty branchLength array, then repeat for the child
   * @param node | The node for which the branch length should be calculated
   * @param accumulatedLength | The total length of all branches, calculated
   */
  function extractBranchLengths(node, accumulatedLength) {
    if (node.children) {
      node.children.forEach((child) => {
        const branchLength = child.data.length || 0;
        const newAccumulatedLength = accumulatedLength + branchLength;
        branchLengths.push(branchLength);
        extractBranchLengths(child, newAccumulatedLength);
      });
    } else {
      // If it's a leaf node, push the total branch length from root to this leaf
      totalBranchLengths.push(accumulatedLength);
    }
  }

  /**========================================================================
   *                           CREATING THE TREE
   *========================================================================**/
  // Draw the phylogenetic tree
  const createPhylogeneticTree = (data) => {
    d3.select("#phyloTree").select("svg").remove();

    let root = d3
      .hierarchy(data, (d) => d.branchset)
      .sum((d) => (d.branchset ? 0 : 1))
      .sort(
        (a, b) =>
          a.value - b.value || d3.ascending(a.data.length, b.data.length),
      );

    cluster(root);
    rotateTree(root);
    setRadius(root, (root.data.length = 0), innerRadius / maxLength(root));
    if (colorScale) {
      setColor(root);
    }

    sharedRoot = root;

    /**========================================================================
     *                           ZOOM FUNCTIONALITY
     *========================================================================**/

    let currentZoomLevel = 1;
    const maxZoomLevel = 1.5;
    const minZoomLevel = 1 / (1.25 * 1.25); // Allowing zoom out two levels from default
    const zoomStep = 1.25; // 25% increase for each zoom in

    // Initialize the transform
    let transform = { x: 0, y: 0, scale: 1 };

    let zoom = d3
      .zoom()
      .scaleExtent([minZoomLevel, maxZoomLevel])
      .filter(function (event) {
        // Disable dragging when zoom level is 1
        if (currentZoomLevel === 1 && event.type === "mousedown") {
          return false;
        }
        return !event.ctrlKey && event.type !== "wheel";
      })
      .on("zoom", zoomed);

    d3.select("#tree-container").call(zoom);

    function zoomed(event) {
      transform = event.transform;
      updateZoom();
    }

    function updateZoom() {
      d3.select("#phyloTree").style(
        "transform",
        `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
      );
    }

    d3.select("#zoomIn").on("click", function () {
      if (currentZoomLevel < maxZoomLevel) {
        currentZoomLevel = Math.min(currentZoomLevel * zoomStep, maxZoomLevel);
        zoomTo(currentZoomLevel);
      }
    });

    d3.select("#zoomOut").on("click", function () {
      if (currentZoomLevel > minZoomLevel) {
        currentZoomLevel = Math.max(currentZoomLevel / zoomStep, minZoomLevel);
        zoomTo(currentZoomLevel);
      }
    });

    d3.select("#resetZoom").on("click", function () {
      // Reset current zoom level to default
      currentZoomLevel = 1;

      // Reset transform to default
      transform = { x: 0, y: 0, scale: 1 };

      // Apply the default transform to the tree container
      d3.select("#tree-container")
        .transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity) // d3.zoomIdentity sets the transform back to default
        .on("end", updateZoom); // Ensure updateZoom is called after the transition
    });

    function zoomTo(scale) {
      let newTransform;

      if (currentZoomLevel === 1) {
        // Reset to default position and scale
        newTransform = d3.zoomIdentity;
        transform = { x: 0, y: 0, scale: 1 };
      } else {
        // Maintain the current position and apply the new scale
        newTransform = d3.zoomIdentity
          .translate(transform.x, transform.y)
          .scale(scale);
      }

      d3.select("#tree-container")
        .transition()
        .duration(750)
        .call(zoom.transform, newTransform)
        .on("end", updateZoom); // Ensure updateZoom is called after the transition
    }

    /**============================================
     *               BUILDING THE TREE
     *=============================================**/

    const svg = d3
      .create("svg")
      .attr("viewBox", [-outerRadius, -outerRadius, width, width])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    branchLengths = [];
    totalBranchLengths = [];
    createTimeRings(svg, sharedRoot);

    svg.append("style").text(`
			.link--active {
  				stroke: #000 !important;
  				stroke-width: 1.5px;
			}

			.link--inactive {
  				stroke: #405f7470 !important;
			}

			.link-extension--active {
  				stroke-opacity: .6;
			}

			.label--active {
  				font-weight: bold;
			}
		`);

    const linkExtension = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#E1E1E1")
      .attr("stroke-opacity", 0.25)
      .selectAll("path")
      .data(root.links().filter((d) => !d.target.children))
      .join("path")
      .each(function (d) {
        d.target.linkExtensionNode = this;
      })
      .attr("d", linkExtensionConstant);

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#E1E1E1")
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", linkVariable);

    // Create the defaultstate of the tooltip
    let tooltip = d3.select("#tooltip");

    svg
      .append("g")
      .selectAll("text")
      .data(root.leaves())
      .join("text")
      .attr("class", "node")
      .attr("dy", ".31em")
      .style("font-size", "5px")
      .style("fill", (d) => findSuperTribeColor(d.data.name))
      .style("cursor", "pointer")
      .attr(
        "transform",
        (d) =>
          `rotate(${d.x - 90}) translate(${innerRadius + 4},0)${
            d.x < 180 ? "" : " rotate(180)"
          }`,
      )
      .attr("text-anchor", (d) => (d.x < 180 ? "start" : "end"))
      .text((d) => findSpeciesName(d.data.name, metadata))
      .on("mouseover", mouseovered(true))
      .on("mouseout", mouseovered(false))
      .on("click", pinInfo(true))
      .each(function (d) {
        d.data.textNode = this;
      });

    function update(checked) {
      const t = d3.transition().duration(750);
      linkExtension.transition(t).attr("d", linkExtensionConstant);
      link.transition(t).attr("d", checked ? linkVariable : linkConstant);
    }

    function mouseovered(active) {
      return function (event, d) {
        let superTribeColor = findSuperTribeColor(d.data.name);

        // FINDING INFO
        let metadataObject = metadata.find(
          (item) => item.SAMPLE === d.data.name,
        );

        sampleNumber = metadataObject.SAMPLE;
        superTribeColor = findSuperTribeColor(sampleNumber);

        // Make the supertribe name the right color (according to the legend and tree)
        const span = d3.selectAll(".supertribespan");
        span.style("background-color", superTribeColor);

        fullSpeciesName = metadataObject.SPECIES_NAME_PRINT;
        subfamilyName = metadataObject.SUBFAMILY;
        supertribeName = metadataObject.SUPERTRIBE;
        tribeName = metadataObject.TRIBE;

        if (metadataObject.AUTHOR) {
          authorName = metadataObject.AUTHOR;
        } else {
          authorName = "";
        }

        // Apply the active class to the hovered label and remove from others
        d3.selectAll("text.node").classed("label--active", false); // Remove active class from all
        d3.select(this).classed("label--active", active);

        if (active && !isTooltipPinned) {
          // Calculate 80% of the viewport width in pixels
          const vwPercentage = 80 / 100; // Convert 80% to a decimal
          const viewportWidth = window.innerWidth; // Get the current viewport width
          const equivalentPixelValue = Math.round(viewportWidth * vwPercentage); // Calculate the equivalent pixel value

          tooltip
            .style("visibility", "visible")
            .style("cursor", "pointer")
            .style("left", function () {
              if (event.clientX > equivalentPixelValue - 300) {
                return event.clientX - 200 + "px";
              } else {
                return event.clientX + 50 + "px";
              }
            })
            .style("top", function () {
              if (event.clientY > 400) {
                return event.clientY - 200 + "px";
              } else {
                return event.clientY - 150 + "px";
              }
            });

          /**====================
           *     TREE EDITS
           *===================**/

          // Make the paths and nodes that aren't being hovered a little less visible
          svg.selectAll(".link").style("opacity", "0.3");
          svg.selectAll("text.node").style("opacity", "0.3");

          // Now highlight the path and label of the hovered node
          let currentNode = d;
          do {
            d3.select(currentNode.linkNode)
              .attr("stroke", superTribeColor)
              .style("opacity", "1")
              .raise();

            if (!currentNode.children) {
              // If it's a leaf node
              d3.select(currentNode.data.textNode)
                .style("fill", superTribeColor)
                .style("opacity", "1");
            }

            currentNode = currentNode.parent;
          } while (currentNode);
        } else if (!active && !isTooltipPinned) {
          tooltip.style("visibility", "hidden");

          d3.select(d.linkNode).attr("stroke", "#E1E1E1"); // Reset the path color
          if (!d.children) {
            d3.select(d.data.textNode).style("fill", superTribeColor); // Reset the label color
          }

          svg.selectAll(".link").style("opacity", "1");
          svg.selectAll("text.node").style("opacity", "1");

          // Re-apply the filter settings to the rest of the tree
          updateTreeColors(selectedSpecies);
        }
      };
    }

    // FUNCTION
    // The goal of this function is to collect all the necessary data for a pop-up, dependent on the clicked node (hence why it's called on "click" of each label in the tree)
    // It uses the "d" (data) to find the correct object in the metadata file, then loads in all necessary properties
    // Since most of these properties come in as their JSON-selves, we must perform a little surgery on them to format them for the frontend
    function pinInfo(active) {
      return function (event, d) {
        let superTribeColor = findSuperTribeColor(d.data.name);

        // FINDING INFO IN THE METADATA
        let metadataObject = metadata.find(
          (item) => item.SAMPLE === d.data.name,
        );

        // Helper function to capitalize the first letter of a string
        function capitalizeFirstLetter(string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
        }

        // Function to format descriptions
        function formatDescription(description) {
          // Check if the description is an array
          if (Array.isArray(description)) {
            // Map over the array and capitalize each item
            return description.map(capitalizeFirstLetter).join(", ");
          } else if (typeof description === "string" && description !== "NA") {
            // If it's a string and not "NA", capitalize the first letter
            return capitalizeFirstLetter(description);
          }
          // Return as is if none of the above conditions are met
          return description;
        }

        // Making sure the meaning of each growth type appears instead of its short counterpart
        const growthFormLabelMapping = {
          H: "Herbaceous",
          W: "Woody",
        };

        sampleNumber = metadataObject.SAMPLE;
        superTribeColor = findSuperTribeColor(sampleNumber);

        // Make the supertribe name the right color (according to the legend and tree)
        const span = d3.selectAll(".supertribespan");
        span.style("background-color", superTribeColor);

        fullSpeciesName = metadataObject.SPECIES_NAME_PRINT;
        subfamilyName = metadataObject.SUBFAMILY;
        supertribeName = metadataObject.SUPERTRIBE;
        tribeName = metadataObject.TRIBE;
        lifeformName = formatDescription(
          metadataObject.WCVP_lifeform_description,
        );
        climateName = formatDescription(
          metadataObject.WCVP_climate_description,
        );
        growthformName = growthFormLabelMapping[metadataObject.GROWTH_FORM];
        societaluseName = formatDescription(metadataObject.SOCIETAL_USE);
        geographicareaName = metadataObject.WCVP_geographic_area;
        imageId = metadataObject.powo_identifier;

        // Apply the active class to the hovered label and remove from others
        d3.selectAll("text.node").classed("label--active", false); // Remove active class from all
        d3.select(this).classed("label--active", active);

        if (active && !isTooltipPinned) {
          infocontainer.style("visibility", "visible");

          /**====================
           *     TREE EDITS
           *===================**/
          // Now that we have all the data in their correct formats, we must edit the tree to highlight the hovered label
          // First, we change the color of all links and labels to grey
          svg.selectAll(".link").attr("stroke", "#405f7470");
          svg.selectAll("text.node").style("fill", "#405f7470");

          // Then we highlight the path and label of the hovered node
          // Now, it's clear in the tree which label you're hovering over and what its path is
          let currentNode = d;
          do {
            d3.select(currentNode.linkNode)
              // We make the distinction between leaves and nodes. If there are children present, we can assume it's a path and modify the stroke
              .attr("stroke", superTribeColor)
              .raise();

            if (!currentNode.children) {
              // However, if there are no more children, we can assume we've reached the node (endpoint, text) and modify its fill
              d3.select(currentNode.data.textNode).style(
                "fill",
                superTribeColor,
              );
            }
            currentNode = currentNode.parent;
          } while (currentNode);
        } else if (!active && !isTooltipPinned) {
          // When the user no longer hovers over a label, this function is called
          isTooltipPinned = false;
          infocontainer.style("visibility", "hidden");

          d3.select(d.linkNode).attr("stroke", "#E1E1E1"); // Reset the path color
          if (!d.children) {
            d3.select(d.data.textNode).style("fill", superTribeColor); // Reset the label color
          }

          // Re-apply the filter settings to the rest of the tree
          updateTreeColors(selectedSpecies);
        }
      };
    }

    d3.select("#legend-container").select("svg").remove();

    var legendSvg = d3.select("#legend-container").append("svg");
    var legend = legendSvg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20, 20)");

    // Create one group per color in the colorScale
    const legendItem = legend
      .selectAll(".legend-item")
      .data(colorScale.domain())
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", function (d, i) {
        return "translate(0," + i * 17.5 + ")";
      });

    console.log("Color Scale Domain:", colorScale.domain());

    // Append a colored rectangle to each legend item
    legendItem
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .style("fill", colorScale);

    // Append text to each legend item
    legendItem
      .append("text")
      .style("font-size", ".85em")
      .attr("x", 24)
      .attr("y", 7)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .style("fill", "#E1E1E1")
      .text(function (d) {
        return d;
      });

    return Object.assign(svg.node(), { update });
  };

  /**========================================================================
   *                               BLACK BOX
   *
   * This code is vital to the tree - but it's sourced from ObservableHQ. I
   * do not know exactly how this works, so unless *you* do, it'd be better
   * to not touch.
   *========================================================================**/
  // Chart functions
  let cluster = d3
    .cluster()
    .size([360, innerRadius])
    .separation((a, b) => 1);

  let rotateTree = (d) => {
    d.x = (d.x + 90) % 360; // Rotate each node by 90 degrees
    if (d.children) d.children.forEach(rotateTree);
  };

  // Set the radius of each node by recursively summing and scaling the distance from the root
  let setRadius = (d, y0, k) => {
    d.radius = (y0 += d.data.length) * k;
    if (d.children) d.children.forEach((d) => setRadius(d, y0, k));
  };

  // Compute the maximum cumulative length of any node in the tree.
  let maxLength = (d) => {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
  };

  let linkExtensionConstant = (d) => {
    return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
  };

  let linkStep = (startAngle, startRadius, endAngle, endRadius) => {
    const c0 = Math.cos((startAngle = ((startAngle - 90) / 180) * Math.PI));
    const s0 = Math.sin(startAngle);
    const c1 = Math.cos((endAngle = ((endAngle - 90) / 180) * Math.PI));
    const s1 = Math.sin(endAngle);
    return (
      "M" +
      startRadius * c0 +
      "," +
      startRadius * s0 +
      (endAngle === startAngle
        ? ""
        : "A" +
          startRadius +
          "," +
          startRadius +
          " 0 0 " +
          (endAngle > startAngle ? 1 : 0) +
          " " +
          startRadius * c1 +
          "," +
          startRadius * s1) +
      "L" +
      endRadius * c1 +
      "," +
      endRadius * s1
    );
  };

  let linkConstant = (d) => {
    return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
  };

  let linkVariable = (d) => {
    return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
  };

  /**========================================================================
   *                          COLOR THE NODES AND PATHS
   *                     ACCORDING TO THE RELEVANT SUPERTRIBE
   *
   * Required identifying the relevant supertribe using the sample number and
   * the metadata and then coloring the right nodes and paths based on this.
   *========================================================================**/

  /**
   * @name findSuperTribe
   * @role Find the supertribe associated with a node label
   * @param nodeLabel | The node's sample number which is used to find the right object in the metadata
   * @param metadata | The full metadata JSON-file
   */
  function findSuperTribe(nodeLabel, metadata) {
    let foundItem = metadata.find(function (item) {
      return item.SAMPLE === nodeLabel;
    });

    let superTribe;

    if (foundItem !== undefined) {
      if (foundItem.TRIBE !== "Aethionemeae") {
        superTribe = foundItem.SUPERTRIBE;
      } else {
        superTribe = "Aethionema";
      }
    } else {
      superTribe = "Unplaced";
    }

    return superTribe;
  }

  /**
   * @name setColor
   * @role Get the right color from the color scale based on the supertribe and color the node + its children
   * @param fulldata | The data
   */
  let setColor = (fulldata) => {
    let superTribe = findSuperTribe(fulldata.data.name, metadata);
    if (superTribe === "Aethionema") {
      fulldata.color = "#E9C46A"; // Explicitly set color for "Aethionema"
    } else {
      fulldata.color = superTribe
        ? colorScale(superTribe)
        : fulldata.parent
          ? fulldata.parent.color
          : null;
    }
    if (fulldata.children) fulldata.children.forEach(setColor);
  };

  /**========================================================================
   *                      UPDATING THE TREE BASED ON FILTERS
   *
   * Using the selected Species (also known as the results of the filtering) to
   * recolor the tree,then finds the right supertribe color if the label is
   * a filter-result or coloring this differently if it isn't.
   *========================================================================**/

  /**
   * @name updateTreeColors
   * @role Recolor all paths and nodes in the tree based on filters
   * @param speciesSet | A set of selected species (species names) to identify the correct paths and nodes
   */
  function updateTreeColors(speciesSet) {
    sharedRoot.each((node) => {
      // Determine the default color or superTribe color
      let defaultColor = "#e1e1e1";
      let superTribeColor = findSuperTribeColor(node.data.name);
      let color = supertribesShown ? defaultColor : superTribeColor;

      // If noFilterResults is true, override the color to #405f7470
      if (isNoFilterResults) {
        color = "#405f7470";
      }

      // Set the path color
      d3.select(node.linkNode).attr("stroke", color);
      node.ancestors().forEach((ancestor) => {
        d3.select(ancestor.linkNode).attr("stroke", color);
      });

      // Set the text color for leaf nodes
      if (!node.children) {
        d3.select(node.data.textNode).style("fill", color);
      }
    });

    // If species are selected, update colors accordingly
    if (speciesSet.size > 0 && !isNoFilterResults) {
      sharedRoot.each((node) => {
        const speciesName = findFullSpecies(node.data.name, metadata);
        const isSpeciesSelected = speciesSet.has(speciesName);

        if (isSpeciesSelected) {
          let superTribeColor = findSuperTribeColor(node.data.name);
          // Propagate the superTribe color to all ancestors up to the root
          node.ancestors().forEach((ancestor) => {
            d3.select(ancestor.linkNode).attr("stroke", superTribeColor);

            // Ensure the text color for leaf nodes matches superTribe color
            if (!ancestor.children) {
              d3.select(ancestor.data.textNode).style("fill", superTribeColor);
            }
          });
        } else {
          // Dim the path and label of unselected nodes
          d3.select(node.linkNode).attr("stroke", "#405f7470");
          if (!node.children) {
            d3.select(node.data.textNode).style("fill", "#405f7470");
          }
        }
      });
    }
  }

  /**
   * @name findSuperTribeColor
   * @role Find the right supertribe-color of the filter-results and offering a fallbackcolor for non-results
   * @param nodeLabel
   */
  function findSuperTribeColor(nodeLabel) {
    let superTribe = findSuperTribe(nodeLabel, metadata);

    if (colorScale) {
      if (superTribe !== "Aethionema") {
        return colorScale(superTribe); // Use colorScale if it's defined
      } else if (superTribe === "Aethionema") {
        return "#E9C46A";
      } else {
        return "#405f7470";
      }
    }
    return "#405f7470"; // Fallback color if colorScale is not defined or no superTribe is found
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/styles/phylotree.css" />
  <link rel="stylesheet" href="/fonts/fonts.css" />
</svelte:head>

<div id="legend">
  <h3>Supertribes</h3>
  <div id="legend-container"></div>
</div>

<div id="magnifier" style="visibility: hidden"></div>
<section
  use:mouseupAction
  id="svg-container"
  on:mousemove={rotateSVG}
  on:mousedown={startRotate}
  aria-roledescription="Rotate the tree"
  role="button"
  tabindex="0"
>
  <section id="tree-container">
    <div id="phyloTree" />
  </section>
</section>

<section class="infobox" style="visibility: hidden;">
  <div id="largetooltip" class="largetooltip">
    <div id="tooltip-image">
      <button id="shutTooltip">
        <img src="/img/close.png" alt="Close tooltip" />
      </button>
      <a
        href="https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:{imageId}/images"
      >
        <i class="fa-solid fa-link"></i>
      </a>
    </div>

    <div class="tooltip-information">
      <p id="source">Image Source: iNaturalist, guyincognito</p>
      <h3 id="tooltip-title" class="tooltip-title">{fullSpeciesName}</h3>
      {#if authorName}
        <h4 id="tooltip-author" class="tooltip-author">{authorName}</h4>
      {/if}
      <div class="tooltip-taxonomy">
        <p>
          <span>{subfamilyName}</span>
          <i class="fas fa-angle-right"></i>
          <span class="supertribespan">{supertribeName}</span>
          <i class="fas fa-angle-right"></i>
          <span>{tribeName}</span>
          <i class="fas fa-angle-right"></i>
          <span>{fullSpeciesName}</span>
        </p>
      </div>
      <div id="tooltip-metadata">
        <div>
          <p>
            Life form <br />
            <span>{lifeformName}</span>
          </p>

          <p>
            Climate<br />
            <span>{climateName}</span>
          </p>
        </div>
        <div>
          <p>
            Growth form <br />
            <span>{growthformName}</span>
          </p>
          <p>
            Societal Use <br />
            <span>{societaluseName}</span>
          </p>
        </div>
      </div>
      <p id="geographicareaname">{geographicareaName}</p>
    </div>
  </div>
</section>

<div id="tooltip" class="tooltip" style="visibility: hidden; position: fixed;">
  <div class="tooltip-information">
    <h3 class="tooltip-title">{fullSpeciesName}</h3>
    {#if authorName}
      <h4 class="tooltip-author">{authorName}</h4>
    {/if}
    <div class="tooltip-taxonomy">
      <p>
        <span>{subfamilyName}</span>
        <i class="fas fa-angle-right"></i>
        <span class="supertribespan">{supertribeName}</span>
        <i class="fas fa-angle-right"></i>
        <span>{tribeName}</span>
        <i class="fas fa-angle-right"></i>
        <span>{fullSpeciesName}</span>
      </p>
    </div>
  </div>
</div>

<section id="zoomControls">
  <div id="settingOptions" style="visibility: hidden">
    <div id="showOutgroups">
      <button><img src="/img/outgroups.png" alt="Show outgroups" /></button>
    </div>
    <div id="showSupertribes">
      <button><img src="/img/hierarchy.png" alt="Show supertribes" /></button>
    </div>
    <div id="switchToLightMode">
      <button><img src="/img/light.png" alt="Switch to light mode" /></button>
    </div>
  </div>
  <div id="settings">
    <button>
      <img src="/img/settings.png" alt="Show settings" />
    </button>
  </div>
  <div id="lensToggle">
    <button>
      <img src="/img/zoom.png" alt="Show lens" />
    </button>
  </div>
  <div id="zoomInAndOut">
    <div id="zoomIn">
      <button>+</button>
    </div>
    <div id="zoomOut">
      <button>–</button>
    </div>
  </div>
  <div id="resetZoom">
    <button>
      <img src="/img/reset.png" alt="Reset zoom" />
    </button>
  </div>
</section>
