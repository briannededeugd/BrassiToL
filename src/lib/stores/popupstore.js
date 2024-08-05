import { writable } from "svelte/store";
import { browser } from "$app/environment";

const defaultValue = { showPopup: true, dontShowAgain: false };

// Initialize store value from localStorage if exists, otherwise use default
const initialValue = browser
  ? (JSON.parse(window.localStorage.getItem("popupPreference")) ?? defaultValue)
  : defaultValue;

export const popupStore = writable(initialValue);

// Subscribe to store changes to sync with localStorage
popupStore.subscribe((value) => {
  if (browser && value.dontShowAgain) {
    window.localStorage.setItem("popupPreference", JSON.stringify(value));
  }
});
