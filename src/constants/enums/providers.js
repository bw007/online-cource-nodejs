/**
 * Enum for provider types.
 * @readonly
 * @enum {string}
 */
const PROVIDERS = Object.freeze({
  GOOGLE: "google",
  GITHUB: "github",
  LOCAL: "local",
});

/**
 * Array of provider values.
 * @type {string[]}
 */
const PROVIDER_VALUES = Object.values(PROVIDERS);

/**
 * Labels for each provider type.
 * @type {Object<string, string>}
 */
const PROVIDER_LABELS = {
  [PROVIDERS.GOOGLE]: "Google",
  [PROVIDERS.GITHUB]: "GitHub",
  [PROVIDERS.LOCAL]: "Local",
};

/**
 * Exports for provider enums, values, and labels.
 * @type {{
 *   PROVIDERS: typeof PROVIDERS,
 *   PROVIDER_VALUES: string[],
 *   PROVIDER_LABELS: Object<string, string>
 * }}
 */
module.exports = {
  PROVIDERS,
  PROVIDER_VALUES,
  PROVIDER_LABELS,
};
