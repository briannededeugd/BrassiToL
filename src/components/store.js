import { writable } from "svelte/store";

export const selectedSpeciesStore = writable(new Set());
