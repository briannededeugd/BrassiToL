<script>
  import { onMount, onDestroy } from "svelte";
  import * as d3 from "d3";
  import { selectedSpeciesStore } from "$stores/store.js";
  import { createCategoryStore } from "$stores/querystore.js";
  import { maxFiltersReached } from "$stores/maximumstore.js";
  import { noFilterResults } from "$stores/filterresultstore.js";

  /**============================================
   *               Declaring Variables
   *=============================================**/
  // Data and empty states
  let metadata = [];
  let landcodes = [];
  let selectedCategories = {};
  let selectedItems = [];
  let unionizeFilters;

  // Levels for unionized filtering
  let activeFilters = [];
  let emptyFilter = {};

  //  Check states of dropdowns
  let taxonomyOpen = false;
  let geographyOpen = false;
  let characteristicsOpen = false;

  // Initial search terms
  let searchSubfamily = "";
  let searchSupertribe = "";
  let searchTribe = "";
  let searchGenus = "";
  let searchSpecies = "";
  let searchContinent = "";
  let searchGeographicArea = "";
  let searchCountries = "";
  let searchAll = "";

  // Autocompletion and search results
  let autocompleteOpen = false;
  let globalSearchResults = [];

  // Checkbox states (kind of like the database with which we'll work)
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

  // Stores
  const categoryStore = createCategoryStore(selectedCategories);

  // Reactive statements and variables
  $: autocompleteOpen = searchAll.trim() !== "";
  $: globalSearchResults = globalFilterItems(searchAll);
  $: if (autocompleteOpen) {
    taxonomyOpen = false;
    geographyOpen = false;
    characteristicsOpen = false;
  }
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
  // SelectAll logic
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

  function closeAllPopups() {
    taxonomyOpen = false;
    geographyOpen = false;
    characteristicsOpen = false;
  }

  /**========================================================================
   *                         ONMOUNT: ON INITIAL PAGE LOAD
   *
   *                    Load in all data before the page loads
   *            Fetch data and make sure it's available at all times
   *          Populate variables that are needed for the site to work
   *
   *========================================================================**/
  onMount(async () => {
    const responses = await Promise.all([
      fetch("/metadata/BrassiToL_metadata.json"),
      fetch("/metadata/BrassiToL_landcodes.json"),
    ]);

    metadata = await responses[0].json();
    landcodes = await responses[1].json();

    d3.select("#clearFilters").on("click", clearAllFilters);
    unionizeFilters = document.querySelector("#unionizeFiltersInput");

    /**======================
     *    NEW SETS FOR FILTERING FAMILIES
     *========================**/

    function processMetadataCategory(category, key) {
      const uniqueItems = new Set(
        metadata
          .map((item) => item[key])
          .filter((item) => item !== "Outgroup")
          .filter((item) => item !== "NA"),
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

    function processGeographicCategory(
      category,
      metadataKey,
      landcodeLevel,
      metadata,
    ) {
      let botanicalCodes = [];

      metadata
        .filter((item) => item[metadataKey] || [])
        .filter((code) => code !== "#N/A")
        .forEach((code) => {
          landcodes.forEach((landcode) => {
            const exists = botanicalCodes.some(
              (botanicalCode) => botanicalCode.name === landcode.WGSRPD_name,
            );

            if (landcode.level === landcodeLevel && !exists) {
              botanicalCodes.push({
                name: landcode.WGSRPD_name,
                code: landcode.code,
              });
            }
          });
        });

      const checkboxItems = botanicalCodes
        .map((areaName) => ({
          label: areaName.name,
          value: areaName.code,
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

    processGeographicCategory(
      "continents",
      "WCVP_WGSRPD_LEVEL_1_native",
      "L1",
      metadata,
    );
    processGeographicCategory(
      "geographicareas",
      "WCVP_WGSRPD_LEVEL_2_native",
      "L2",
      metadata,
    );
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
    const queryParams = new URLSearchParams(window.location.search);

    // Process each parameter
    for (const [param, paramValue] of queryParams.entries()) {
      if (param === "unionizeFilters") {
        unionizeFilters.checked = paramValue === "true";

        let selectedPairing = {
          category: "unionizeFilters",
          value: unionizeFilters.checked,
        };

        const { category, value } = selectedPairing;
        if (!selectedCategories[category]) {
          selectedCategories[category] = [value];
        } else if (!selectedCategories[category].includes(value)) {
          selectedCategories[category].push(value);
        }

        categoryStore.set(selectedCategories);
      } else {
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

              // Create emptyFilter object and push it to activeFilter array
              let emptyFilter = {
                category: category,
                value: filter.label,
              };
              activeFilters.push(emptyFilter);
            }
          });
        });

        // Set the selected categories
        let indvParam = paramValue.split(",");
        let selectedPairing = { cat: category, value: indvParam };
        const { cat, value } = selectedPairing;

        if (!selectedCategories[cat]) {
          selectedCategories[cat] = [];
          selectedCategories[cat].push(...value);
          selectedCategories[cat] = [...new Set(selectedCategories[cat])];
        } else if (!selectedCategories[cat].includes(value)) {
          selectedCategories[cat].push(...value);
          selectedCategories[cat] = [...new Set(selectedCategories[cat])];
        }
      }
    }

    // Update the category store with selected categories
    categoryStore.set(selectedCategories);

    // Function to get selected species based on the current checkbox states
    async function getSelectedSpecies() {
      let selectedSpecies = new Set();

      if (!unionizeFilters.checked) {
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
      } else {
        let collectedMatchingItems = metadata;

        Object.entries(checkboxStates).forEach(([category, state]) => {
          state.items.forEach((item) => {
            if (item.checked) {
              let property = getCategoryProperty(category);
              let value = item.value || item.label;
              collectedMatchingItems = collectedMatchingItems.filter(
                (metaItem) => {
                  let dataValue = metaItem[property];
                  return Array.isArray(dataValue)
                    ? dataValue.includes(value)
                    : dataValue === value;
                },
              );
            }
          });
        });

        collectedMatchingItems.forEach((match) => {
          selectedSpecies.add(match.SPECIES_NAME_PRINT);
        });
      }

      if (selectedSpecies.size > 0) {
        d3.select("#clearFilters").style("visibility", "visible");
      } else {
        d3.select("#clearFilters").style("visibility", "hidden");
      }

      await selectedSpeciesStore.set(selectedSpecies);
    }

    // Get selected species based on the initial state
    getSelectedSpecies();

    // Call updateTreeVisualization after processing all params
    updateTreeVisualization();

    const handleKeyDown = (event, keydown) => {
      const taxonomyDropdown = d3.select(".taxonomyDropdown").node();
      const geographyDropdown = d3.select(".geographyDropdown").node();
      const characteristicsDropdown = d3
        .select(".characteristicsDropdown")
        .node();
      const searchDropdown = d3.select(".searchDropdown").node();

      // Convert NodeList to Array for easier handling
      const dropdownNodes = [
        taxonomyDropdown,
        geographyDropdown,
        characteristicsDropdown,
        searchDropdown,
      ].filter((node) => node !== null); // Ensure nodes exist

      const isClickInsideDropdown = dropdownNodes.some((node) =>
        node.contains(event.target),
      );

      if (keydown === true) {
        if (event.keyCode === 27 && keydown === true) {
          // Esc key pressed
          closeAllPopups();
        }
      } else if (!isClickInsideDropdown) {
        // Click occurred outside all dropdowns
        closeAllPopups();
      }
    };

    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("click", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, false);
    };
  });

  /**========================================================================
   *                           SEARCHING FUNCTIONALITIES
   *========================================================================**/

  /**
   * @name globalFilterItems
   * @role Finding search term results from the global search
   * @param {*} searchTerm | The term that the user searched
   */
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
        item.label.toLowerCase().includes(searchTerm),
      );
      if (filteredItems.length > 0) {
        results[categoryName] = filteredItems;
      }
    });

    return results;
  }

  /**
   * @name filterItems
   * @role Finding search term results from the individual category searches
   * @param {*} items | All items in the relevant category
   * @param {*} searchTerm | The term that the user searched
   */
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

  /**
   * @name toggleSelectAll
   * @role Selecting all the items in a category
   * @param category | The category in which the selectAll should be applied
   */
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

    if (checkboxStates[category].allSelected === true) {
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
    } else {
      selectedCategories[category] = [];
    }
    categoryStore.set(selectedCategories);

    updateTreeVisualization();
  }

  /**========================================================================
   *                           MAIN FILTER HANDLING
   *========================================================================**/

  /**
   * @name clearAllFilters
   * @role Remove all the filters and make sure the necessary changes are applied => clear URL, uncheck checkboxes, reset level, recolor tree
   */
  function clearAllFilters() {
    Object.keys(checkboxStates).forEach((category) => {
      checkboxStates[category].items.forEach((item) => {
        item.checked = false;
      });

      // If the category has 'allSelected', reset it as well
      if ("allSelected" in checkboxStates[category]) {
        checkboxStates[category].allSelected = false;
      }

      // Reset and/or
      if (unionizeFilters.checked) {
        unionizeFilters.click();
      }

      selectedCategories = {};
      categoryStore.set(selectedCategories);
    });

    maxFiltersReached.set(false);
    updateTreeVisualization(); // Update the tree visualization
  }

  /**
   * @name HandleUnionizeFiltersChange
   * @role Detects when the applied filters need to be intersected
   */
  function handleUnionizeFiltersChange() {
    let selectedPairing = {
      category: "unionizeFilters",
      value: unionizeFilters.checked,
    };

    if (unionizeFilters.checked) {
      selectedItems.push(selectedPairing);

      const { category, value } = selectedPairing;
      if (!selectedCategories[category]) {
        selectedCategories[category] = [value];
      } else if (!selectedCategories[category].includes(value)) {
        selectedCategories[category].push(value);
      }

      // Update the categoryStore with the new selectedCategories
      categoryStore.set(selectedCategories);
      updateTreeVisualization();
    } else {
      // Remove the unionizeFilters property from selectedCategories if it exists
      if ("unionizeFilters" in selectedCategories) {
        delete selectedCategories["unionizeFilters"];
      }

      categoryStore.set(selectedCategories);

      updateTreeVisualization();
    }
  }

  /**
   * @name HandleCheckboxChange
   * @role Detects when a checkbox changes and handles what happens next
   * @param {*} itemLabel is the name of the checkbox - this is unique to its category
   * @param {*} categoryname specifies the name of the category to which this checkbox belongs
   *                          - because some names are seen across many categories
   */
  function handleCheckboxChange(itemLabel, categoryname) {
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

    pushFiltersToURL(relevantCheckbox, categoryname, selectedPairing);

    updateTreeVisualization();
  }

  /**
   * @name Handle-GLOBAL-CheckboxChange
   * @role Detects when a checkbox changes from the search results and handles what happens next
   * @param {*} item is the complete checked checkbox, which involves its value, label and checked status
   */
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

      pushFiltersToURL(item, categoryName, selectedPairing);
    }

    // Update the categoryStore with the new selectedCategories
    categoryStore.set(selectedCategories);

    // Trigger reactivity by assigning a new array
    categories.forEach((category) => {
      category.items = [...category.items];
    });

    updateTreeVisualization();
  }

  /**
   * @name pushFiltersToURL
   * @role Check whether unionizeFilters is applied, then handle checkbox
   * @param {*} relevantCheckbox | The checkbox we need to send to the URL/save
   * @param {*} categoryname | The category to which the checkbox belongs
   * @param {*} selectedPairing | The pairing of the category with the value of the checkbox
   */
  function pushFiltersToURL(relevantCheckbox, categoryname, selectedPairing) {
    if (unionizeFilters.checked) {
      if (activeFilters.length < 4) {
        if (relevantCheckbox.checked) {
          /**
           * THIS IF SAYS
           * "You have not reached your maximum yet, so
           * this checkbox that you're trying to add is
           * added, no problem!"
           */
          // Checkbox is checked, add to selectedItems and update selectedCategories
          selectedItems.push(selectedPairing);

          // Add filter to activeFilters
          emptyFilter = {
            [categoryname]: relevantCheckbox.value,
          };
          activeFilters.push(emptyFilter);

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

          // Update the categoryStore with the new selectedCategories
          categoryStore.set(selectedCategories);
        } else {
          /**
           * THIS ELSE SAYS
           * "You have not yet reached your maximum, so
           * removing this filter is no problem!"
           */
          // Checkbox is unchecked, remove from selectedItems and selectedCategories
          selectedItems = selectedItems.filter(
            (item) => item.value !== relevantCheckbox.value,
          );

          // Remove filter from activeFilters
          let match = activeFilters.find(
            (filter) => filter.category === relevantCheckbox.value,
          );
          activeFilters.pop(match);

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

          categoryStore.set(selectedCategories);
        }
      } else if (activeFilters.length >= 4) {
        if (relevantCheckbox.checked) {
          /**
           * THIS IF SAYS
           * "You have reached five filters, so we are adding
           * your fifth filter to the URL and the tree, but then
           * we're disabling all other filters, because this is
           * your maximum."
           */
          // Checkbox is checked, add to selectedItems and update selectedCategories
          selectedItems.push(selectedPairing);

          // Add filter to activeFilters
          emptyFilter = {
            [categoryname]: relevantCheckbox.value,
          };
          activeFilters.push(emptyFilter);

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

          disableEnableFiltering(true);
        } else {
          /**
           * THIS ELSE SAYS
           * "You have reached five filters, which is your max, but
           * you are unchecking a filter, which brings you down to
           * four filters, which is not your max."
           */

          // Remove filter from activeFilters
          let match = activeFilters.find(
            (filter) => filter.category === relevantCheckbox.value,
          );
          activeFilters.pop(match);

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

          categoryStore.set(selectedCategories);
          disableEnableFiltering(false);
        }
      }
    } else {
      if (relevantCheckbox.checked) {
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

        categoryStore.set(selectedCategories);
      } else {
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

        categoryStore.set(selectedCategories);
      }
    }
  }

  /**========================================================================
   *
   *                           HELPER FUNCTIONS
   *
   *========================================================================**/

  /**
   * @name capitilizeFirstLetter
   * @param {*} string | The string of which the first letter needs to be capitalized
   */
  function capitalizeFirstLetter(string) {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * @name getCategoryProperty
   * @role Retrieving the correct name for a category *as its defined in the metadata*
   * @param {0} category | Which name we want to find the metadata-name for
   */
  function getCategoryProperty(category) {
    const categoryPropertyMap = {
      subfamilies: "SUBFAMILY",
      supertribes: "SUPERTRIBE",
      tribes: "TRIBE",
      genuses: "GENUS",
      species: "SPECIES",
      geographicareas: "WCVP_WGSRPD_LEVEL_2_native",
      continents: "WCVP_WGSRPD_LEVEL_1_native",
      countries: "WCVP_WGSRPD_LEVEL_3_native",
      growthForm: "GROWTH_FORM",
      societaluse: "SOCIETAL_USE",
      lifeform: "WCVP_lifeform_description",
      climates: "WCVP_climate_description",
    };
    return categoryPropertyMap[category] || null;
  }

  /**
   * @name disableEnableFiltering
   * @role Toggle the user's ability to add more filters to their query
   * @param {*} status | A boolean on whether or not the filters should be disabled or not
   */
  function disableEnableFiltering(status) {
    // Remove disabling of filters
    const allCheckboxes = d3.selectAll(
      ".dropdown-container input[type=checkbox]",
    );
    allCheckboxes.each(function (d, i, nodes) {
      const checkbox = d3.select(this);
      if (!checkbox.property("checked")) {
        if (status === false) {
          checkbox.property("disabled", false);
        } else {
          checkbox.property("disabled", true);
        }
      }
    });

    maxFiltersReached.set(status);
  }

  /**
   * @name createCheckboxState
   * @param {*} withAllSelected | Checks whether or not a list of checkboxes should have a selectAll-checkbox
   */
  function createCheckboxState(withAllSelected = false) {
    return withAllSelected ? { allSelected: false, items: [] } : { items: [] };
  }

  /**
   * @name toggleState
   * @role Open and close the [category] dropdown, close all other dropdowns if open
   * @param {*} state | The relevant dropdown
   */
  function toggleState(state) {
    taxonomyOpen = state === "taxonomyOpen" ? !taxonomyOpen : false;
    geographyOpen = state === "geographyOpen" ? !geographyOpen : false;
    characteristicsOpen =
      state === "characteristicsOpen" ? !characteristicsOpen : false;

    if (taxonomyOpen || geographyOpen || characteristicsOpen) {
      searchAll = ""; // Close autocomplete dropdown
    }
  }

  /**========================================================================
   *
   *       MAIN GOAL: DEFINING FILTER RESULTS + COMMUNICATING WITH TREE
   *
   *========================================================================**/
  /**
   * @name updateTreeVisualization
   * @role Find the correct species in the metadata based on applied filters
   */
  function updateTreeVisualization() {
    let selectedSpecies = new Set();
    let anyCheckboxChecked = false;

    // Helper function to check if any checkboxes are checked
    function checkAnyCheckboxesChecked() {
      Object.entries(checkboxStates).forEach(([category, state]) => {
        state.items.forEach((item) => {
          if (item.checked) {
            anyCheckboxChecked = true;
          }
        });
      });
    }

    if (!unionizeFilters.checked) {
      // Iterate through filter checkboxes and populate selectedSpecies
      Object.entries(checkboxStates).forEach(([category, state]) => {
        state.items.forEach((item) => {
          if (item.checked) {
            anyCheckboxChecked = true; // Set flag if any checkbox is checked
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

      // Update the store with the selected species
      selectedSpeciesStore.set(selectedSpecies);
    } else {
      // Check if any checkboxes are checked
      checkAnyCheckboxesChecked();

      // Apply filters if any checkboxes are checked
      if (anyCheckboxChecked) {
        // Function to apply filters
        function applyFilters(filters, initialData) {
          return filters.reduce((filteredData, filter) => {
            let property = getCategoryProperty(filter.category);
            let value = filter.value;

            return filteredData.filter((item) => {
              let dataValue = item[property];
              return Array.isArray(dataValue)
                ? dataValue.includes(value)
                : dataValue === value;
            });
          }, initialData);
        }

        // Gather active filters
        let activeFilters = [];
        Object.entries(checkboxStates).forEach(([category, state]) => {
          state.items.forEach((item) => {
            if (item.checked) {
              activeFilters.push({
                category: category,
                value: item.value || item.label,
              });
            }
          });
        });

        // Initial data is metadata or empty if no previous filters
        let initialData = metadata;

        // Apply all active filters sequentially
        let filteredData = applyFilters(activeFilters, initialData);

        // Update selectedSpecies based on the final filtered data
        filteredData.forEach((match) => {
          selectedSpecies.add(match.SPECIES_NAME_PRINT);
        });

        selectedSpeciesStore.set(selectedSpecies);
      } else {
        selectedSpecies = [];
        selectedSpeciesStore.set(selectedSpecies);
        return; // Exit if no checkboxes are checked
      }
    }

    // Set visibility of clearFilters button
    if (anyCheckboxChecked) {
      d3.select("#clearFilters").style("visibility", "visible");
    } else {
      d3.select("#clearFilters").style("visibility", "hidden");
    }

    // Set noFilterResults based on the state of selectedSpecies and checkboxes
    if (anyCheckboxChecked && selectedSpecies.size === 0) {
      noFilterResults.set(true);
    } else {
      noFilterResults.set(false);
    }
  }

  /**========================================================================
   *                           TOGGLE DROPDOWNS
   *========================================================================**/

  /**
   * @name toggleTaxonomy
   * @role Call on the toggleState function with 'Taxonomy' as its parameter
   */
  function toggleTaxonomy() {
    toggleState("taxonomyOpen");
  }

  /**
   * @name toggleGeography
   * @role Call on the toggleState function with 'Geography' as its parameter
   */
  function toggleGeography() {
    toggleState("geographyOpen");
  }

  /**
   * @name toggleCharacteristics
   * @role Call on the toggleState function with 'Characteristics' as its parameter
   */
  function toggleCharacteristics() {
    toggleState("characteristicsOpen");
  }
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
            name="searchsubfamily"
            bind:value={searchSubfamily}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.subfamilies.items, searchSubfamily) as subfamily}
              <label>
                <input
                  type="checkbox"
                  name={subfamily.label}
                  bind:checked={subfamily.checked}
                  on:change={() =>
                    handleCheckboxChange(subfamily.label, "subfamilies")}
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
            name="searchsupertribe"
            bind:value={searchSupertribe}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.supertribes.items, searchSupertribe) as supertribe}
              <label>
                <input
                  type="checkbox"
                  name={supertribe.label}
                  bind:checked={supertribe.checked}
                  on:change={() =>
                    handleCheckboxChange(supertribe.label, "supertribes")}
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
            name="searchtribes"
            bind:value={searchTribe}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.tribes.items, searchTribe) as tribe}
              <label>
                <input
                  type="checkbox"
                  name={tribe.label}
                  bind:checked={tribe.checked}
                  on:change={() => handleCheckboxChange(tribe.label, "tribes")}
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
            name="searchgenus"
            bind:value={searchGenus}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.genuses.items, searchGenus) as genus}
              <label>
                <input
                  type="checkbox"
                  name={genus.label}
                  bind:checked={genus.checked}
                  on:change={() => handleCheckboxChange(genus.label, "genuses")}
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
            name="searchspecies"
            bind:value={searchSpecies}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.species.items, searchSpecies) as specie}
              <label>
                <input
                  type="checkbox"
                  name={specie.label}
                  bind:checked={specie.checked}
                  on:change={() =>
                    handleCheckboxChange(specie.label, "species")}
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
            name="searchbotanicalcontinent"
            placeholder="Search Botanical Continent"
            bind:value={searchContinent}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.continents.items, searchContinent) as continent}
              <label>
                <input
                  type="checkbox"
                  name={continent.label}
                  bind:checked={continent.checked}
                  on:change={() =>
                    handleCheckboxChange(continent.label, "continents")}
                />
                {continent.label}
              </label>
            {/each}
          </div>
        </div>

        <!-- GEOGRAPHIC AREA -->
        <div class="filter">
          <h3>Botanical Regions</h3>
          <input
            type="text"
            placeholder="Search Botanical Regions"
            name="searchgeographicarea"
            bind:value={searchGeographicArea}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.geographicareas.items, searchGeographicArea) as geographicarea}
              <label>
                <input
                  type="checkbox"
                  name={geographicarea.label}
                  bind:checked={geographicarea.checked}
                  on:change={() =>
                    handleCheckboxChange(
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
            name="searchbotanicalcountries"
            bind:value={searchCountries}
          />
          <div class="checkbox-list">
            {#each filterItems(checkboxStates.countries.items, searchCountries) as country}
              <label>
                <input
                  type="checkbox"
                  name={country.label}
                  bind:checked={country.checked}
                  on:change={() =>
                    handleCheckboxChange(country.label, "countries")}
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
      Traits
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
                name="selectallgrowthforms"
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
                  name={item.label}
                  bind:checked={item.checked}
                  on:change={() =>
                    handleCheckboxChange(item.label, "growthForm")}
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
                name="selectallsocietaluses"
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
                  name={item.label}
                  bind:checked={item.checked}
                  on:change={() =>
                    handleCheckboxChange(item.label, "societaluse")}
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
                name="selectalllifeforms"
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
                  name={item.label}
                  bind:checked={item.checked}
                  on:change={() => handleCheckboxChange(item.label, "lifeform")}
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
                name="selectallclimates"
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
                  name={item.label}
                  bind:checked={item.checked}
                  on:change={() => handleCheckboxChange(item.label, "climates")}
                />
                <span>{item.label}</span>
              </label>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </section>

  <!-- UNIONIZE FILTERS -->
  <label id="unionize-filters">
    <input
      type="checkbox"
      id="unionizeFiltersInput"
      on:change={() => handleUnionizeFiltersChange()}
    />
    <div class="container">
      <div>
        <p>And</p>
      </div>
      <div>
        <p>Or</p>
      </div>
    </div>
  </label>

  <!-- SEARCH -->
  <section class="dropdown-container">
    <input
      type="text"
      placeholder="Search"
      name="searchall"
      bind:value={searchAll}
    />

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
                  name={result.label}
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
