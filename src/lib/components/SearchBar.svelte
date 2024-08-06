<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { Converter } from "csvtojson/v2/Converter";

  /**========================================================================
   *                           DECLARING VARIABLES
   *========================================================================**/

  let data = []; // Empty data array so that loaded data is available globally
  let searchQuery = ""; // The user's search term
  const suggestions = writable([]); // Make suggestions based on the search query
  let converter = new Converter({}); // Coverts CSV to JSON

  /**========================================================================
   *                         ONMOUNT: ON INITIAL PAGE LOAD
   *
   *                    Load in all data before the page loads
   *            Fetch data and make sure it's available at all times
   *          Populate variables that are needed for the site to work
   *========================================================================**/
  onMount(() => {
    loadData();
  });

  /**========================================================================
   *                FUNCTIONS TO LOAD DATA + MAKE SUGGESTIONS
   *========================================================================**/
  /**
   * @name loadData
   * @role Converts CSV-data to JSON
   */
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

  // Function to update suggestions based on search query
  /**
   * @name updateSuggestions
   * @role Load suggestions based on data and the query
   * @param query | The input of the user
   */
  function updateSuggestions(query) {
    searchQuery = query;
    if (searchQuery.trim().length > 0) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      suggestions.set(
        data.filter((row) => {
          return Object.values(row)
            .slice(1, 8) // Considering columns B to H
            .some((value) => value.toLowerCase().includes(lowerCaseQuery));
        }),
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
