import { RESTRICTED_URL_PREFIXES } from "./constants.js";

/**
 * Checks if a URL cannot have scripts injected into it.
 * @param {string} url 
 * @returns {boolean}
 */
export function isRestrictedUrl(url) {
  if (!url || typeof url !== "string") return true;
  return RESTRICTED_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

/**
 * Promise-based delay helper.
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
