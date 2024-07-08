<script>
  import { onMount } from "svelte";

  import * as d3 from "d3";
  import "../lib/fonts/fonts.css";

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

<svelte:head>
  <link rel="stylesheet" href="./src/lib/styles/maplegend.css" />
</svelte:head>

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
