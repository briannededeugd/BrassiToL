<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { selectedSpeciesStore } from "./store.js";
  import { createCategoryStore } from "./queryStore";
  import { writable } from "svelte/store";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import Page from "../../routes/+page.svelte";

  // Simple 'capitalize every first letter'-function
  function capitalizeFirstLetter(string) {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**============================================
   *               Declaring Variables
   *=============================================**/
  let metadata = [];
  let landcodes = [];
  let selectedCategories = {};
  let paramValue;
  let selectedItems = [];

  /**============================================
   *             Dynamic URL Check
   *=============================================**/

  const categoryStore = createCategoryStore(selectedCategories);

  // for searching
  let autocompleteOpen = false;

  $: autocompleteOpen = searchAll.trim() !== "";

  let globalSearchResults = [];
  $: {
    globalSearchResults = globalFilterItems(searchAll);
  }

  function createCheckboxState(withAllSelected = false) {
    return withAllSelected ? { allSelected: false, items: [] } : { items: [] };
  }

  // checkbox states
  let checkboxStates = {
    // Taxonomy categories without 'allSelected'
    subfamilies: createCheckboxState(),
    supertribes: createCheckboxState(),
    tribes: createCheckboxState(),
    genuses: createCheckboxState(),
    species: createCheckboxState(),

    // Geography categories without 'allSelected'
    geographicareas: createCheckboxState(),
    continents: createCheckboxState(),
    countries: createCheckboxState(),

    // Characteristics categories with 'allSelected'
    growthForm: createCheckboxState(true),
    societaluse: createCheckboxState(true),
    lifeform: createCheckboxState(true),
    climates: createCheckboxState(true),
  };

  onMount(async () => {
    const response = await fetch("/BrassiToL_metadata.json");
    metadata = await response.json();

    const landcodeResponse = await fetch("/BrassiToL_landcodes.json");
    landcodes = await landcodeResponse.json();

    d3.select("#clearFilters").on("click", clearAllFilters);

    /**======================
     *    NEW SETS FOR FILTERING FAMILIES
     *========================**/

    function processMetadataCategory(category, key) {
      const uniqueItems = new Set(
        metadata.map((item) => item[key]).filter((item) => item !== "NA"),
      );

      const checkboxItems = Array.from(uniqueItems)
        .map((item) => ({
          // Use "SPECIES_NAME_PRINT" if category is "species", else use item (the value of the key property)
          label:
            category === "species"
              ? metadata.find((x) => x[key] === item)?.SPECIES_NAME_PRINT ||
                item
              : item,
          value: item,
          checked: false,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      checkboxStates[category].items = checkboxItems;
    }

    // Usage
    processMetadataCategory("subfamilies", "SUBFAMILY");
    processMetadataCategory("supertribes", "SUPERTRIBE");
    processMetadataCategory("tribes", "TRIBE");
    processMetadataCategory("genuses", "GENUS");
    processMetadataCategory("species", "SPECIES");

    /**======================
     *   NEW SETS FOR FILTERING GEOGRAPHY
     *========================**/

    function processContinentCategory(category, geographyKey) {
      const processedContinents = new Set(
        metadata
          .map((item) => item[geographyKey])
          .filter((item) => item !== "NA"),
      );

      const checkboxItems = Array.from(processedContinents)
        .map((continent) => ({
          label: capitalizeFirstLetter(continent),
          value: continent,
          checked: false,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      checkboxStates[category].items = checkboxItems;
    }

    function processGeographicAreaCategory(category, metadata, landcodes) {
      const areaNameToCode = new Map();
      metadata
        .flatMap((item) => item.WCVP_WGSRPD_LEVEL_1_native || [])
        .filter((code) => code !== "NA")
        .forEach((code) => {
          const areaName = landcodes[code] ? landcodes[code].WGSRPD_name : code;
          areaNameToCode.set(areaName, code);
        });

      const checkboxItems = Array.from(areaNameToCode.keys()) // Use keys() to get area names
        .map((areaName) => ({
          label: areaName, // No need to convert to string, as areaName is already a string
          value: areaNameToCode.get(areaName),
          checked: false,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      checkboxStates[category].items = checkboxItems;
    }

    function processCountryCategory(
      category,
      countryKey,
      isArrayOfValues = false,
    ) {
      const processedCountries = new Set(
        metadata.flatMap((item) => {
          const value = item[countryKey];
          return isArrayOfValues
            ? Array.isArray(value)
              ? value
              : [value]
            : [value];
        }),
      );

      const checkboxItems = Array.from(processedCountries)
        .filter((countryCode) => countryCode !== "NA")
        .map((countryCode) => {
          const landcodeEntry = landcodes.find((lc) => lc.code === countryCode);
          const label = landcodeEntry ? landcodeEntry.WGSRPD_name : countryCode;

          return {
            label: label,
            value: countryCode,
            checked: false,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));

      checkboxStates[category].items = checkboxItems;
    }

    processContinentCategory("continents", "WCVP_continent");
    processGeographicAreaCategory("geographicareas", metadata, landcodes);
    processCountryCategory("countries", "WCVP_WGSRPD_LEVEL_3_native", true);

    /**======================
     *    NEW SETS FOR FILTERING CHARACTERISTICS
     *========================**/
    function processCategory(
      categoryKey,
      metadataKey,
      isArrayOfValues = false,
    ) {
      const growthFormLabelMapping = {
        H: "Herbaceous",
        W: "Woody",
      };

      const processedItems = new Set(
        metadata.flatMap((item) => {
          const value = item[metadataKey];
          return isArrayOfValues
            ? Array.isArray(value)
              ? value
              : [value]
            : [value];
        }),
      );

      const checkboxItems = Array.from(processedItems)
        .filter((item) => item !== "NA")
        .map((item) => {
          let label = item;
          if (metadataKey === "GROWTH_FORM") {
            label = growthFormLabelMapping[item] || item;
          } else {
            label = capitalizeFirstLetter(item);
          }
          return {
            label: label,
            value: item,
            checked: false,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label)); // Sort the items alphabetically by label

      checkboxStates[categoryKey].items = checkboxItems;
    }

    // Example usage
    processCategory("growthForm", "GROWTH_FORM");
    processCategory("societaluse", "SOCIETAL_USE", true);
    processCategory("lifeform", "WCVP_lifeform_description", true);
    processCategory("climates", "WCVP_climate_description");

    /**============================================
     *           REACTIVE URL PARAM FILTERS
     *=============================================**/

    // Access URL parameters
    const queryParams = $page.url.searchParams;
    const queryParamsKeys = [...queryParams.keys()];

    // Process each parameter
    for (const param of queryParams.keys()) {
      const paramValue = queryParams.get(param);
      let appliedFilters = paramValue
        .split(",")
        .map((label) => ({ label, checked: true }));

      const category = param;

      let categoryIndex = checkboxStates[category].items;
      let categoryFilters = categoryIndex.map(
        (categoryFilter) => categoryFilter.value,
      );

      appliedFilters.forEach((filter) => {
        categoryFilters.forEach((item) => {
          if (item === filter.label) {
            const checkboxFilter = categoryIndex.find(
              (checkbox) => checkbox.value === filter.label,
            );
            checkboxFilter.checked = true;
          }
        });
      });

      // set etc
      const indvParam = paramValue.split(",");

      let selectedPairing = {
        cat: category,
        value: indvParam,
      };

      const { cat, value } = selectedPairing;
      if (!selectedCategories[cat]) {
        selectedCategories[cat] = [];
        selectedCategories[cat].push(...value);
        selectedCategories[cat] = [...new Set(selectedCategories[cat])];
      } else if (!selectedCategories[cat].includes(value)) {
        selectedCategories[cat].push(value);
        selectedCategories[cat].push(...value);
        selectedCategories[cat] = [...new Set(selectedCategories[cat])];
      }

      categoryStore.set(selectedCategories);
    }

    async function getSelectedSpecies() {
      let selectedSpecies = new Set();
      Object.entries(checkboxStates).forEach(([category, state]) => {
        state.items.forEach((item) => {
          if (item.checked) {
            let property = getCategoryProperty(category);
            let value = item.value || item.label;
            let matchingItems = metadata.filter((metaItem) => {
              let dataValue = metaItem[property];
              return Array.isArray(dataValue)
                ? dataValue.includes(value)
                : dataValue === value;
            });
            matchingItems.forEach((match) =>
              selectedSpecies.add(match.SPECIES_NAME_PRINT),
            );
          }
        });
      });

      await selectedSpeciesStore.set(selectedSpecies);

      if (selectedSpecies.size > 0) {
        d3.select("#clearFilters").style("visibility", "visible");
      } else {
        d3.select("#clearFilters").style("visibility", "hidden");
      }
    }

    getSelectedSpecies();

    // Call updateTreeVisualization again after processing all params
    updateTreeVisualization();
  });

  /**============================================
   *               FILTER SYSTEM
   *=============================================**/

  //  TAXONOMY
  let taxonomyOpen = false;
  let geographyOpen = false;
  let characteristicsOpen = false;

  let searchSubfamily = "";
  let searchSupertribe = "";
  let searchTribe = "";
  let searchGenus = "";
  let searchSpecies = "";

  let searchContinent = "";
  let searchGeographicArea = "";
  let searchCountries = "";

  let searchAll = "";

  function globalFilterItems(searchTerm) {
    searchTerm = searchTerm.trim().toLowerCase();
    let results = {};

    if (searchTerm === "") {
      return results;
    }

    const categories = {
      Subfamily: checkboxStates.subfamilies.items,
      Supertribe: checkboxStates.supertribes.items,
      Tribe: checkboxStates.tribes.items,
      Genus: checkboxStates.genuses.items,
      Species: checkboxStates.species.items,
      "Geographic Area": checkboxStates.geographicareas.items,
      Continent: checkboxStates.continents.items,
      Country: checkboxStates.countries.items,
      "Growth Form": checkboxStates.growthForm.items,
      "Societal Use": checkboxStates.societaluse.items,
      "Life Form": checkboxStates.lifeform.items,
      Climate: checkboxStates.climates.items,
    };

    Object.entries(categories).forEach(([categoryName, categoryItems]) => {
      const filteredItems = categoryItems.filter((item) =>
        item.label.toLowerCase().startsWith(searchTerm),
      );
      if (filteredItems.length > 0) {
        results[categoryName] = filteredItems;
      }
    });

    return results;
  }

  function filterItems(items, searchTerm) {
    searchTerm = searchTerm.trim().toLowerCase();
    if (searchTerm === "") {
      return items; // Return all items if search term is empty
    }
    return items
      .filter((item) => item.label.toLowerCase().startsWith(searchTerm)) // If we want to also have results that INCLUDE the searchterm, we can change startsWith to includes
      .sort((a, b) => {
        // Sort checked items to the top
        if (a.checked === b.checked) {
          return a.label.localeCompare(b.label); // Then alphabetically
        }
        return a.checked ? -1 : 1;
      });
  }

  function toggleSelectAll(category) {
    const allSelected = !checkboxStates[category].allSelected;

    checkboxStates = {
      ...checkboxStates,
      [category]: {
        ...checkboxStates[category],
        allSelected: allSelected,
        items: checkboxStates[category].items.map((item) => ({
          ...item,
          checked: allSelected,
        })),
      },
    };

    const allArray = checkboxStates[category].items.map((item) => item.value);
    console.log(allArray);

    if (checkboxStates[category].allSelected === true) {
      console.log(checkboxStates[category].allSelected);
      allArray.forEach((item) => {
        let selectedPairing = {
          cat: category,
          value: item,
        };

        const { cat, value } = selectedPairing;
        if (!selectedCategories[cat]) {
          selectedCategories[cat] = [];
          selectedCategories[cat].push(value);
        } else if (!selectedCategories[cat].includes(value)) {
          selectedCategories[cat].push(value);
          selectedCategories[cat] = [...new Set(selectedCategories[cat])];
        }
      });

      console.log(selectedCategories);
    } else {
      console.log(checkboxStates[category].allSelected);
      selectedCategories[category] = [];
    }
    categoryStore.set(selectedCategories);

    updateTreeVisualization();
  }

  function handleCheckboxChange(category, itemLabel, categoryname) {
    let itemsArray = checkboxStates[categoryname].items;

    const relevantCheckbox = itemsArray.find((item) => item.label == itemLabel);

    if (!relevantCheckbox) {
      console.error("Relevant checkbox not found");
      return;
    }

    let selectedPairing = {
      category: categoryname,
      value: relevantCheckbox.value,
    };

    // Check if the checkbox is checked or unchecked
    if (relevantCheckbox.checked) {
      // Checkbox is checked, add to selectedItems and update selectedCategories
      selectedItems.push(selectedPairing);

      checkboxStates[categoryname].items.forEach((checkbox) => {
        if (checkbox.value === selectedPairing.value) {
          checkbox.checked = true;
        }
      });

      // Update selectedCategories
      const { category, value } = selectedPairing;
      if (!selectedCategories[category]) {
        selectedCategories[category] = [value];
      } else if (!selectedCategories[category].includes(value)) {
        selectedCategories[category].push(value);
      }
    } else {
      // Checkbox is unchecked, remove from selectedItems and selectedCategories
      selectedItems = selectedItems.filter(
        (item) => item.value !== relevantCheckbox.value,
      );

      checkboxStates[categoryname].items.forEach((checkbox) => {
        if (checkbox.value === selectedPairing.value) {
          checkbox.checked = false;
        }
      });

      const categoryValues = selectedCategories[categoryname];
      if (categoryValues) {
        selectedCategories[categoryname] = categoryValues.filter(
          (value) => value !== relevantCheckbox.value,
        );
      }
    }

    // Update the categoryStore with the new selectedCategories
    categoryStore.set(selectedCategories);

    // New logic for filtering and updating the tree
    updateTreeVisualization();
  }

  function handleGlobalSearchCheckboxChange(item) {
    let categoryName;
    let checked;

    // Find the item in its original category and update its checked state
    const categoryNames = {
      subfamilies: checkboxStates.subfamilies,
      supertribes: checkboxStates.supertribes,
      tribes: checkboxStates.tribes,
      genuses: checkboxStates.genuses,
      species: checkboxStates.species,
      geographicareas: checkboxStates.geographicareas,
      continents: checkboxStates.continents,
      countries: checkboxStates.countries,
      growthForm: checkboxStates.growthForm,
      societaluse: checkboxStates.societaluse,
      lifeform: checkboxStates.lifeform,
      climates: checkboxStates.climates,
    };
    const categories = Object.values(categoryNames);

    categories.forEach((category) => {
      // Create indexes
      const index = category.items.findIndex(
        (categoryItem) => categoryItem.label === item.label,
      );
      if (index !== -1) {
        category.items[index] = {
          ...category.items[index],
          checked: item.checked,
        };
      }

      // Track selected checkboxes and their categories for parameter changes
      checked = category.items.filter(
        (checkbox) => checkbox.label === item.label,
      );

      if (checked.length >= 1) {
        // Find the name of the current category using the mapping
        categoryName = Object.keys(categoryNames).find(
          (key) => categoryNames[key] === category,
        );
      }
    });

    // Only proceed if the checkbox is checked or found in one or more categories
    if (item.checked || checked.length >= 1) {
      let selectedPairing = {
        category: categoryName,
        value: item.value,
      };

      // Further processing for when the checkbox is checked
      if (item.checked) {
        // Checkbox is checked, add to selectedItems and update selectedCategories
        selectedItems.push(selectedPairing);

        // Update selectedCategories
        const { category, value } = selectedPairing;
        if (!selectedCategories[category]) {
          selectedCategories[category] = [value];
        } else if (!selectedCategories[category].includes(value)) {
          selectedCategories[category].push(value);
        }
      }

      // New logic for filtering and updating the tree
      updateTreeVisualization();
    } else {
      // Checkbox is unchecked, remove from selectedItems and selectedCategories
      selectedItems = selectedItems.filter(
        (select) => select.value !== item.value,
      );

      checkboxStates[categoryName].items.forEach((checkbox) => {
        if (checkbox.value === item.value) {
          checkbox.checked = false;
        }
      });

      const categoryValues = selectedCategories[categoryName];
      if (categoryName) {
        selectedCategories[categoryName] = categoryValues.filter(
          (value) => value !== item.value,
        );
      }
    }

    // Update the categoryStore with the new selectedCategories
    categoryStore.set(selectedCategories);

    // Trigger reactivity by assigning a new array
    categories.forEach((category) => {
      category.items = [...category.items];
    });

    updateTreeVisualization();
  }

  function clearAllFilters() {
    Object.keys(checkboxStates).forEach((category) => {
      checkboxStates[category].items.forEach((item) => {
        item.checked = false;
      });

      // If the category has 'allSelected', reset it as well
      if ("allSelected" in checkboxStates[category]) {
        checkboxStates[category].allSelected = false;
      }

      selectedCategories = {};
      categoryStore.set(selectedCategories);
    });

    updateTreeVisualization(); // Update the tree visualization
  }

  function updateTreeVisualization() {
    let selectedSpecies = new Set();

    Object.entries(checkboxStates).forEach(([category, state]) => {
      state.items.forEach((item) => {
        if (item.checked) {
          let property = getCategoryProperty(category);
          let value = item.value || item.label;
          let matchingItems = metadata.filter((metaItem) => {
            let dataValue = metaItem[property];
            return Array.isArray(dataValue)
              ? dataValue.includes(value)
              : dataValue === value;
          });
          matchingItems.forEach((match) =>
            selectedSpecies.add(match.SPECIES_NAME_PRINT),
          );
        }
      });
    });

    selectedSpeciesStore.set(selectedSpecies);

    if (selectedSpecies.size > 0) {
      d3.select("#clearFilters").style("visibility", "visible");
    } else {
      d3.select("#clearFilters").style("visibility", "hidden");
    }
  }

  function getCategoryProperty(category) {
    const categoryPropertyMap = {
      subfamilies: "SUBFAMILY",
      supertribes: "SUPERTRIBE",
      tribes: "TRIBE",
      genuses: "GENUS",
      species: "SPECIES",
      geographicareas: "WCVP_WGSRPD_LEVEL_1_native",
      continents: "WCVP_continent",
      countries: "WCVP_WGSRPD_LEVEL_3_native",
      growthForm: "GROWTH_FORM",
      societaluse: "SOCIETAL_USE",
      lifeform: "WCVP_lifeform_description",
      climates: "WCVP_climate_description",
    };
    return categoryPropertyMap[category] || null;
  }

  // Reactive statements for each category
  $: if (checkboxStates.continents.items.length > 0) {
    checkboxStates.continents.allSelected =
      checkboxStates.continents.items.every((item) => item.checked);
  }

  $: if (checkboxStates.geographicareas.items.length > 0) {
    checkboxStates.geographicareas.allSelected =
      checkboxStates.geographicareas.items.every((item) => item.checked);
  }

  $: if (checkboxStates.countries.items.length > 0) {
    checkboxStates.countries.allSelected = checkboxStates.countries.items.every(
      (item) => item.checked,
    );
  }

  $: if (checkboxStates.growthForm.items.length > 0) {
    checkboxStates.growthForm.allSelected =
      checkboxStates.growthForm.items.every((item) => item.checked);
  }

  $: if (checkboxStates.societaluse.items.length > 0) {
    checkboxStates.societaluse.allSelected =
      checkboxStates.societaluse.items.every((item) => item.checked);
  }

  $: if (checkboxStates.lifeform.items.length > 0) {
    checkboxStates.lifeform.allSelected = checkboxStates.lifeform.items.every(
      (item) => item.checked,
    );
  }

  $: if (checkboxStates.climates.items.length > 0) {
    checkboxStates.climates.allSelected = checkboxStates.climates.items.every(
      (item) => item.checked,
    );
  }

  // Closing and opening filters logic

  function toggleTaxonomy() {
    taxonomyOpen = !taxonomyOpen;
    if (taxonomyOpen) {
      geographyOpen = false;
      characteristicsOpen = false;
      searchAll = ""; // Close autocomplete dropdown
    }
  }

  function toggleGeography() {
    geographyOpen = !geographyOpen;
    if (geographyOpen) {
      taxonomyOpen = false;
      characteristicsOpen = false;
      searchAll = ""; // Close autocomplete dropdown
    }
  }

  function toggleCharacteristics() {
    characteristicsOpen = !characteristicsOpen;
    if (characteristicsOpen) {
      taxonomyOpen = false;
      geographyOpen = false;
      searchAll = ""; // Close autocomplete dropdown
    }
  }

  $: if (autocompleteOpen) {
    taxonomyOpen = false;
    geographyOpen = false;
    characteristicsOpen = false;
  }

  /**============================================
   *               CHECKED COUNTS
   *=============================================**/

  $: checkedTaxCount =
    checkboxStates.subfamilies.items.filter((item) => item.checked).length +
    checkboxStates.supertribes.items.filter((item) => item.checked).length +
    checkboxStates.tribes.items.filter((item) => item.checked).length +
    checkboxStates.genuses.items.filter((item) => item.checked).length +
    checkboxStates.species.items.filter((item) => item.checked).length;

  $: checkedGeoCount =
    checkboxStates.geographicareas.items.filter((item) => item.checked).length +
    checkboxStates.continents.items.filter((item) => item.checked).length +
    checkboxStates.countries.items.filter((item) => item.checked).length;

  $: checkedCharCount =
    checkboxStates.growthForm.items.filter((item) => item.checked).length +
    checkboxStates.societaluse.items.filter((item) => item.checked).length +
    checkboxStates.lifeform.items.filter((item) => item.checked).length +
    checkboxStates.climates.items.filter((item) => item.checked).length;
</script>

<svelte:head>
  <link rel="stylesheet" href="/styles/filters.css" />
  <link rel="stylesheet" href="/fonts/fonts.css" />
</svelte:head>

<section class="filtersystem">
  <!-- FILTER ON TAXONOMY -->
  <section class="dropdown-container">
    <!-- Filtering on taxonomy -->
    <button
      class="filtercategory {taxonomyOpen ? 'open' : ''}"
      on:click={toggleTaxonomy}
      style="color: {taxonomyOpen ? '#729a68' : '#e1e1e1'}"
    >
      Taxonomy
      {#if checkedTaxCount > 0}
        <span class="checkbox-count">({checkedTaxCount})</span>
      {/if}
    </button>

    {#if taxonomyOpen}
      <div class="taxonomyDropdown">
        <!-- Subfamily -->
        <div class="filter">
          <h3>Subfamily</h3>
          <input
            type="text"
            placeholder="Search Subfamily"
            bind:value={searchSubfamily}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.subfamilies.items, searchSubfamily) as subfamily}
              <label>
                <input
                  type="checkbox"
                  bind:checked={subfamily.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.subfamilies.items,
                      subfamily.label,
                      "subfamilies",
                    )}
                  value={subfamily}
                />
                {subfamily.label}
              </label>
            {/each}
          </div>
        </div>

        <!-- Supertribe -->
        <div class="filter">
          <h3>Supertribe</h3>
          <input
            type="text"
            placeholder="Search Supertribe"
            bind:value={searchSupertribe}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.supertribes.items, searchSupertribe) as supertribe}
              <label>
                <input
                  type="checkbox"
                  bind:checked={supertribe.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.supertribes.items,
                      supertribe.label,
                      "supertribes",
                    )}
                  value={supertribe}
                />
                {supertribe.label}
              </label>
            {/each}
          </div>
        </div>

        <!-- Tribe -->
        <div class="filter">
          <h3>Tribe</h3>
          <input
            type="text"
            placeholder="Search Tribe"
            bind:value={searchTribe}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.tribes.items, searchTribe) as tribe}
              <label>
                <input
                  type="checkbox"
                  bind:checked={tribe.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.tribes.items,
                      tribe.label,
                      "tribes",
                    )}
                  value={tribe}
                />
                {tribe.label}
              </label>
            {/each}
          </div>
        </div>

        <!-- Genus -->
        <div class="filter">
          <h3>Genus</h3>
          <input
            type="text"
            placeholder="Search Genus"
            bind:value={searchGenus}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.genuses.items, searchGenus) as genus}
              <label>
                <input
                  type="checkbox"
                  bind:checked={genus.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.genuses.items,
                      genus.label,
                      "genuses",
                    )}
                  value={genus}
                />
                {genus.label}
              </label>
            {/each}
          </div>
        </div>

        <!-- Species -->
        <div class="filter">
          <h3>Species</h3>
          <input
            type="text"
            placeholder="Search Species"
            bind:value={searchSpecies}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.species.items, searchSpecies) as specie}
              <label>
                <input
                  type="checkbox"
                  bind:checked={specie.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.species.items,
                      specie.label,
                      "species",
                    )}
                  value={specie}
                />
                {specie.label}
              </label>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </section>

  <!-- FILTER ON GEOGRAPHY -->
  <section class="dropdown-container">
    <!-- Filtering on geography -->
    <button
      class="filtercategory {geographyOpen ? 'open' : ''}"
      on:click={toggleGeography}
      style="color: {geographyOpen ? '#729a68' : '#e1e1e1'}"
    >
      Geography
      {#if checkedGeoCount > 0}
        <span class="checkbox-count">({checkedGeoCount})</span>
      {/if}
    </button>
    {#if geographyOpen}
      <div class="geographyDropdown">
        <!-- CONTINENTS -->
        <div class="filter">
          <h3>Botanical Continents</h3>
          <input
            type="text"
            placeholder="Search Botanical Continent"
            bind:value={searchContinent}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.continents.items, searchContinent) as continent}
              <label>
                <input
                  type="checkbox"
                  bind:checked={continent.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.continents.items,
                      continent.label,
                      "continents",
                    )}
                />
                {continent.label}
              </label>
            {/each}
          </div>
        </div>

        <!-- GEOGRAPHIC AREA -->
        <div class="filter">
          <h3>Regions</h3>
          <input
            type="text"
            placeholder="Search Geographic Area"
            bind:value={searchGeographicArea}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.geographicareas.items, searchGeographicArea) as geographicarea}
              <label>
                <input
                  type="checkbox"
                  bind:checked={geographicarea.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.geographicareas.items,
                      geographicarea.label,
                      "geographicareas",
                    )}
                  value={geographicarea.label}
                />
                {geographicarea.label}
              </label>
            {/each}
          </div>
        </div>

        <!-- COUNTRIES -->
        <div class="filter">
          <h3>Botanical Countries</h3>
          <input
            type="text"
            placeholder="Search Botanical Countries"
            bind:value={searchCountries}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.countries.items, searchCountries) as country}
              <label>
                <input
                  type="checkbox"
                  bind:checked={country.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.countries.items,
                      country.label,
                      "countries",
                    )}
                />
                {country.label}
              </label>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </section>

  <!-- FILTER ON CHARACTERISTICS -->
  <section class="dropdown-container">
    <!-- Filtering on characteristics -->
    <button
      class="filtercategory {characteristicsOpen ? 'open' : ''}"
      on:click={toggleCharacteristics}
      style="color: {characteristicsOpen ? '#729a68' : '#e1e1e1'}"
    >
      Characteristics
      {#if checkedCharCount > 0}
        <span class="checkbox-count">({checkedCharCount})</span>
      {/if}
    </button>
    {#if characteristicsOpen}
      <div class="characteristicsDropdown">
        <!-- GROWTH FORM -->
        <div class="filter">
          <h3>Growth Form</h3>
          <div class="checkbox-list">
            <label>
              <input
                type="checkbox"
                bind:checked={checkboxStates.growthForm.allSelected}
                on:change={() => toggleSelectAll("growthForm")}
              />
              {#if checkboxStates.growthForm.allSelected}
                Deselect All
              {:else}
                Select All
              {/if}
            </label>
            {#each checkboxStates.growthForm.items as item}
              <label>
                <input
                  type="checkbox"
                  bind:checked={item.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.growthForm.items,
                      item.label,
                      "growthForm",
                    )}
                />
                {item.label}
              </label>
            {/each}
          </div>
        </div>

        <!-- SOCIETAL USE -->
        <div class="filter">
          <h3>Societal Use</h3>
          <div class="checkbox-list">
            <label>
              <input
                type="checkbox"
                bind:checked={checkboxStates.societaluse.allSelected}
                on:change={() => toggleSelectAll("societaluse")}
              />
              {#if checkboxStates.societaluse.allSelected}
                Deselect All
              {:else}
                Select All
              {/if}
            </label>
            {#each checkboxStates.societaluse.items as item}
              <label>
                <input
                  type="checkbox"
                  bind:checked={item.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.societaluse.items,
                      item.label,
                      "societaluse",
                    )}
                />
                {item.label}
              </label>
            {/each}
          </div>
        </div>

        <!-- LIFE FORM -->
        <div class="filter">
          <h3>Life Form</h3>
          <div class="checkbox-list">
            <label>
              <input
                type="checkbox"
                bind:checked={checkboxStates.lifeform.allSelected}
                on:change={() => toggleSelectAll("lifeform")}
              />
              {#if checkboxStates.lifeform.allSelected}
                Deselect All
              {:else}
                Select All
              {/if}
            </label>
            {#each checkboxStates.lifeform.items as item}
              <label>
                <input
                  type="checkbox"
                  bind:checked={item.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.lifeform.items,
                      item.label,
                      "lifeform",
                    )}
                />
                <span>{item.label}</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- CLIMATE -->
        <div class="filter">
          <h3>Climates</h3>
          <div class="checkbox-list">
            <label>
              <input
                type="checkbox"
                bind:checked={checkboxStates.climates.allSelected}
                on:change={() => toggleSelectAll("climates")}
              />
              {#if checkboxStates.climates.allSelected}
                Deselect All
              {:else}
                Select All
              {/if}
            </label>
            {#each checkboxStates.climates.items as item}
              <label>
                <input
                  type="checkbox"
                  bind:checked={item.checked}
                  on:change={() =>
                    handleCheckboxChange(
                      checkboxStates.climates.items,
                      item.label,
                      "climates",
                    )}
                />
                <span>{item.label}</span>
              </label>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </section>

  <!-- SEARCH -->
  <section class="dropdown-container">
    <input type="text" placeholder="Search" bind:value={searchAll} />

    {#if searchAll.trim() !== ""}
      <div class="autocomplete-dropdown">
        {#if Object.keys(globalSearchResults).length === 0}
          <p>No results for your search</p>
        {:else}
          {#each Object.keys(globalSearchResults) as categoryName}
            <h3>{categoryName}</h3>
            {#each globalSearchResults[categoryName] as result}
              <label>
                <input
                  type="checkbox"
                  bind:checked={result.checked}
                  on:change={() => handleGlobalSearchCheckboxChange(result)}
                />
                {result.label}
              </label>
            {/each}
          {/each}
        {/if}
      </div>
    {/if}
  </section>

  <div class="spacer"></div>
  <button id="clearFilters" style="visibility: hidden">Clear Filters</button>
</section>
