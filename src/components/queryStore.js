// src/lib/queryStore.js
import { goto } from '$app/navigation';
import { page } from '$app/stores';

export function createCategoryStore(category) {
    var query = undefined;
    return {
        subscribe: (h) => {
            return page.subscribe((p) => {
                query = Object.fromEntries(p.url.searchParams);
                h(query[category]); // Now handles a single category
            });
        },
        set: (v) => {
            query[category] = v.join(',');
            const urlSearchParams = new URLSearchParams(query);
            const g = `?${urlSearchParams.toString()}`;
            goto(g, { keepFocus: true, replaceState: true, noScroll: true });
        }
    };
}
