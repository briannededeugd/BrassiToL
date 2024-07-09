import { writable } from "svelte/store";
import { goto } from "$app/navigation";

export function createCategoryStore(initialCategories) {
  const { subscribe, set } = writable(initialCategories);

  function flattenCategories(categories) {
    return categories.flatMap(category => {
      const categoryName = Object.keys(category)[0];
      return category[categoryName].map(value => [categoryName, value]);
    });
  }

  return {
    subscribe,
    set: (categories) => {
      const flattenedCategories = flattenCategories(categories);
      let query = flattenedCategories.reduce((acc, [key, value]) => {
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(value);
        return acc;
      }, {});

      for (let key in query) {
        query[key] = query[key].join(",");
      }

      const urlSearchParams = new URLSearchParams(query);
      const g = `?${urlSearchParams.toString()}`;
      console.log("Navigating to URL:", g);
      goto(g, { keepFocus: true, replaceState: true, noScroll: true });

      set(categories);
    },
  };
}
