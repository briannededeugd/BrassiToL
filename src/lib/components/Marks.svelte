<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { geoPath, geoNaturalEarth1 } from "d3";
  import { selectedSpeciesStore } from "$stores/store.js";

  /**========================================================================
   *                           DECLARING VARIABLES
   *========================================================================**/
  export let isFlipped; // Accept isFlipped as a prop

  // All relevant data (metadata, landcodes, full country-names)
  let metadata = [];
  let landcodes = [];
  let countries = [];

  let matchingCountryNames = []; // Empty array for the relevant countries based on the filters
  let countryInformation = { name: "", frequency: 0 }; // Setup for the country- name and frequency pair

  let dataLoaded = false; // Boolean to check whether the data is done loading

  let selectedSpecies; // Variable for the selectedSpecies that we'll populate with the store value later

  let projection, path; // Variables for drawing the world map
  const width = 1200,
    height = 800; // Sizing for the world map

  // Reactive statements so the visualization updates with...
  $: selectedSpecies = $selectedSpeciesStore; // ... the selected filters
  $: {
    // The flipped status (also known as whether or not the world map is visible or the tree is)
    if (isFlipped && dataLoaded && selectedSpecies) {
      findLandcodes(selectedSpecies);
      drawMap();
    } else if (!isFlipped) {
      clearMap();
    }
  }

  /**========================================================================
   *                         ONMOUNT: ON ITIAL PAGE LOAD
   *
   *                    Load in all data before the page loads
   *            Fetch data and make sure it's available at all times
   *          Populate variables that are needed for the site to work
   *========================================================================**/
  onMount(async () => {
    try {
      const responses = await Promise.all([
        fetch("/BrassiToL_metadata.json"),
        fetch("/wgsrpd_mapping.json"),
        fetch("/TDWG_level3_map.json"),
      ]);

      metadata = await responses[0].json();
      landcodes = await responses[1].json();
      countries = await responses[2].json();

      console.debug("METADATA", metadata);
      console.debug("LANDCODES", landcodes);
      console.debug("COUNTRIES", countries);

      projection = geoNaturalEarth1()
        .scale(250)
        .translate([width / 2, height / 2]);
      path = geoPath(projection);

      dataLoaded = true; // Set this flag only after all data has been loaded
    } catch (error) {
      console.error("Error loading data:", error);
    }
  });

  /**========================================================================
   *                           MATCHING THE LANDCODES TO
   *                          THE FILTERED SPECIES FOR UP-
   *                             DATING THE WORLD MAP
   *========================================================================**/

  /**
   * @name findLandcodes
   * @role Getting the landcodes of the selected species
   * @param selectedSpecies | The selected species (filters) as communicated by the FilterSystem-component
   * @returns {Array} matchingCountryNames, pairs of country names and frequencies
   */
  function findLandcodes(selectedSpecies) {
    // All matched objects in an array
    const originalMatchedObjects = metadata.filter((item) =>
      selectedSpecies.has(item.SPECIES_NAME_PRINT),
    );

    // We don't want the same species twice in the list, so we make a new set and filter based on whether the species is already in the list
    const seenSpecies = new Set();
    const matchedObjects = originalMatchedObjects.filter((species) => {
      if (!seenSpecies.has(species.SPECIES_NAME_PRINT)) {
        seenSpecies.add(species.SPECIES_NAME_PRINT);
        return true;
      }
      return false;
    });

    console.debug("MATCHED OBJCTS:", matchedObjects);

    const landCodes = matchedObjects.flatMap(
      (item) => item.WCVP_WGSRPD_LEVEL_3_native,
    );
    const wgsrpdNames = landCodes
      .map((code) => {
        const landcodeObj = landcodes.find((lc) => lc.LEVEL3_COD === code);
        return landcodeObj ? landcodeObj.LEVEL3_NAM : null;
      })
      .filter((name) => name !== null);

    const countryFrequency = new Map();

    wgsrpdNames.forEach((name) => {
      countryFrequency.set(name, (countryFrequency.get(name) || 0) + 1);
    });

    matchingCountryNames = countries.features
      .filter((feature) => countryFrequency.has(feature.properties.LEVEL3_NAM))
      .map((country) => ({
        name: country.properties.LEVEL3_NAM,
        frequency: countryFrequency.get(country.properties.LEVEL3_NAM),
      }));

    return matchingCountryNames;
  }

  /**========================================================================
   *                     DRAWING AND CLEARING THE MAP
   *
   * Using the data to assign the right values to the eventual visualization
   * of the world map - also simply clearing the map if warranted by removing
   * all ofd the paths.
   *========================================================================**/

  /**
   * @name clearMap
   * @role Clearing the map visualization entirely
   */
  function clearMap() {
    const countriesSvg = d3.select("svg");
    countriesSvg.selectAll("path").remove(); // Clear paths
  }

  /**
   * @name drawMap
   * @role Drawing the map visualization with D3 - including mouseovers and mouseout - and coloring in the countries found from the selected species
   */
  function drawMap() {
    const colorScale = d3
      .scaleLinear()
      .domain([0, 10])
      .range(["#ffffff", "#729a68"])
      .clamp(true);

    const countriesSvg = d3.select("svg");

    countriesSvg.selectAll("path").remove();

    countriesSvg
      .selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("d", path)
      .on("mouseover", function (event, d) {
        countryInformation = matchingCountryNames.find(
          (cn) => cn.name === d.properties.LEVEL3_NAM,
        );
        if (countryInformation && countryInformation.frequency > 0) {
          let tooltip = d3.select("#mapInfo");

          tooltip
            .style("visibility", "visible")
            .style("position", "absolute")
            .style("left", event.clientX + 10 + "px")
            .style("top", event.clientY + 10 + "px");

          d3.select("#mapInfo > h3").text(countryInformation.name);
          d3.select("#mapInfo > p").text(
            countryInformation.frequency + " " + "species",
          );
        }
      })
      .on("mouseout", function () {
        let tooltip = d3.select("#mapInfo");
        tooltip.style("visibility", "hidden");
      })
      .on("click", function (event, d) {
        countryInformation = matchingCountryNames.find(
          (cn) => cn.name === d.properties.LEVEL3_NAM,
        );
        console.debug("COUNTRY INFO:", countryInformation);

        if (countryInformation && countryInformation.frequency > 0) {
          let countryPopUp = d3.select("#countryPopup");

          countryPopUp
            .style("visibility", "visible")
            .style("position", "absolute")
            .style("left", event.clientX + 10 + "px")
            .style("top", event.clientY + 10 + "px");

          d3.select("#nameOfCountry").text(countryInformation.name);
          d3.select("#frequencyOfCountry").text(
            countryInformation.frequency + " " + "species",
          );

          // Clear existing list items
          let speciesList = d3.select("#speciesList");
          speciesList.selectAll("li").remove();

          // From country name (countryInformation.name) to country code (in landcodes)
          const relevantName = [
            ...new Set(
              landcodes
                .filter((lc) => lc.LEVEL3_NAM === countryInformation.name)
                .map((item) => item.LEVEL3_COD),
            ),
          ];
          console.debug("REL NAMES:", relevantName);

          // Find and append species to the list
          const relevantDataItems = metadata.filter((item) => {
            // Check if WCVP_WGSRPD_LEVEL_3_native is an array and has any matching code
            if (Array.isArray(item.WCVP_WGSRPD_LEVEL_3_native)) {
              return item.WCVP_WGSRPD_LEVEL_3_native.some((code) =>
                relevantName.includes(code),
              );
            }
            // If it's not an array, directly check for inclusion
            return relevantName.includes(item.WCVP_WGSRPD_LEVEL_3_native);
          });

          console.debug(
            "DE OBJECTEN DIE HET GOEDE LAND HEBBEN:",
            relevantDataItems,
          );

          const relevantSpecies = relevantDataItems.filter((item) => {
            return selectedSpecies.has(item.SPECIES_NAME_PRINT);
          });
          console.debug("RELEVANT SPECIES", relevantSpecies);

          const speciesNames = relevantSpecies.map(
            (item) => item.SPECIES_NAME_PRINT,
          );

          // Removing the duplicates by spreading the species names in a set
          let uniqueSpecies = [...new Set(speciesNames)];
          let uniqueSpeciesNames = uniqueSpecies.sort();

          uniqueSpeciesNames.forEach((name) => {
            speciesList
              .append("li")
              .text(name)
              .style("font-size", "0.7em")
              .style("margin-top", ".75em");
          });
        }
      })
      .attr("fill", function (d) {
        const countryData = matchingCountryNames.find(
          (cn) => cn.name === d.properties.LEVEL3_NAM,
        );

        if (matchingCountryNames.length >= 1) {
          return countryData ? colorScale(countryData.frequency) : "#ffffff26";
        } else {
          return "#ffffff";
        }
      })
      .attr("stroke", "#000")
      .attr("stroke-width", ".5px")
      .style("cursor", "pointer");
  }
</script>

<svg style="z-index: 1"></svg>
