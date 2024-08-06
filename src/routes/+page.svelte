<script>
  import { onMount } from "svelte";
  import { inject } from "@vercel/analytics";
  import { dev } from "$app/environment";
  import * as d3 from "d3";
  import { writable } from "svelte/store";

  import PhyloTree from "$lib/components/PhyloTree.svelte";
  import FilterSystem from "$lib/components/FilterSystem.svelte";
  import Marks from "$lib/components/Marks.svelte";
  import MapLegend from "$lib/components/MapLegend.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import LoadingScreen from "$lib/components/LoadingScreen.svelte";

  import { maxFiltersReached } from "$stores/maximumstore.js";
  import { popupStore } from "$stores/popupstore.js";

  // Inject is from @vercel/analytics and allows Vercel to track traffic on the live site
  inject({ mode: dev ? "development" : "production" });

  /**========================================================================
   *                           DECLARE VARIABLES
   *========================================================================**/
  let localDontShowAgain = $popupStore.dontShowAgain; // Local variable to hold checkbox state of 'Don't Show Again' for the welcome message
  const width = 1200,
    height = 800; // Width and height of the rendered content
  const isFlipped = writable(false); // Tracks whether the phylogenetic tree or the world map is visible

  /**========================================================================
   *                         ONMOUNT: ON INITIAL PAGE LOAD
   *
   *                    Load in all data before the page loads
   *            Fetch data and make sure it's available at all times
   *          Populate variables that are needed for the site to work
   *
   *========================================================================**/
  onMount(async () => {
    const button = d3.select("#confirmationButton");

    button.on("click", function () {
      // Temporarily hide the popup for the current session
      $popupStore = { ...$popupStore, showPopup: false };

      // If "Don't Show Again" is checked, permanently hide the popup
      if (localDontShowAgain) {
        $popupStore = { ...$popupStore, dontShowAgain: true };
      }
    });
  });

  /**========================================================================
   *                       FUNCTIONS FOR THE MAIN PAGE
   *========================================================================**/
  /**
   * @name closeInfo
   * @role Closes the popup for the world map
   */
  function closeInfo() {
    const popUp = d3.select("#countryPopup");
    popUp.style("visibility", "hidden");
  }

  /**
   * @name toggleView
   * @role Switch between the phylogenetic tree and the world map
   */
  function toggleView() {
    isFlipped.update((status) => !status);
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/styles/style.css" />
  <link rel="stylesheet" href="/fonts/fonts.css" />
</svelte:head>

<LoadingScreen />
<main>
  <section class="title">
    <h1>brassicaceae <span>|</span> <span>Tree of Life</span></h1>
    <div class="switch-view">
      <h2>Phylogenetic Tree</h2>
      <label class="switch">
        <input type="checkbox" name="toggleview" on:click={toggleView} />
        <span class="slider round"></span>
      </label>
      <h2>World Map</h2>
    </div>
  </section>

  <section class="filtercontainer">
    <p>Explore Tree by</p>
    <FilterSystem />
  </section>

  <section class="content">
    {#if $isFlipped}
      <div class="mapdiv">
        <svg {width} {height}>
          <Marks isFlipped={$isFlipped} />
        </svg>
      </div>
      <MapLegend isFlipped={$isFlipped} />

      <!-- THE HOVER TOOLTIP -->
      <article id="mapInfo" style="visibility: hidden">
        <h3 id="countryname">Test</h3>
        <p id="countryfrequency">Test matches</p>
      </article>

      <!-- THE CLICK TOOLTIP -->
      <article id="countryPopup" style="visibility: hidden">
        <section id="popupMetadata">
          <section>
            <h3 id="nameOfCountry">Test</h3>
            <p id="frequencyOfCountry">Test Frequency</p>
          </section>
          <button id="closePopup" on:click={closeInfo}>✕</button>
        </section>
        <ul id="speciesList">
          <!-- EMPTY LIST -->
        </ul>
      </article>
    {:else}
      <div class="phyloTree">
        <PhyloTree />
      </div>
    {/if}
  </section>

  {#if $maxFiltersReached}
    <section class="maxlevels">
      <h3>Your maximum level of stacked filters has been reached.</h3>
      <p>
        You cannot filter deeper than this. Uncheck one of your checkboxes to
        continue filtering.
      </p>
    </section>
  {/if}

  {#if $popupStore.showPopup && !$popupStore.dontShowAgain}
    <div id="welcomeMessage" style="visibility: visible">
      <div id="dragTutorial">
        <h3>Drag to the left or right to rotate the Tree of Life.</h3>
        <label>
          <input type="checkbox" bind:checked={localDontShowAgain} />
          Don't show again
        </label>
        <button id="confirmationButton">Got it!</button>
      </div>
    </div>
  {/if}
</main>

<footer class="footer">
  <Footer />
</footer>
