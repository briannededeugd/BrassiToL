<script>
  import { writable } from "svelte/store";

  /**========================================================================
   *                           DECLARING VARIABLES
   *========================================================================**/

  let data = []; // Empty data array so that loaded data is available globally
  let searchQuery = ""; // The user's search term
  const suggestions = writable([]); // Make suggestions based on the search query

  /**========================================================================
   *                FUNCTIONS TO MAKE SUGGESTIONS
   *========================================================================**/

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
