import { writable } from "svelte/store";
import { goto } from "$app/navigation";

export function createCategoryStore(initialCategories) {
  const { subscribe, set } = writable(initialCategories);

  // Flatten categories into an array of [categoryName, value] pairs
  function flattenCategories(categories) {
    return Object.entries(categories).flatMap(([categoryName, values]) => {
      return values.map((value) => [categoryName, value]);
    });
  }

  return {
    subscribe,
    set: (categories) => {
      const flattenedCategories = flattenCategories(categories);

      // Construct query object from flattened categories
      let query = flattenedCategories.reduce((acc, [key, value]) => {
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(value);
        return acc;
      }, {});

      // Convert arrays to comma-separated strings
      for (let key in query) {
        query[key] = query[key].join(",");
      }

      // Create URLSearchParams from query object
      const urlSearchParams = new URLSearchParams(query);
      const queryString = `?${urlSearchParams.toString()}`;

      // Navigate to new URL with query string
      goto(queryString, {
        keepFocus: true,
        replaceState: true,
        noScroll: true,
      });

      // Update store with new categories
      set(categories);
    },
  };
}
