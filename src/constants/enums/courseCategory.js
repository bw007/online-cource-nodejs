/**
 * Enum for provider types.
 * @readonly
 * @enum {string}
 */
const COURSE_CATEGORIES = Object.freeze({
  DEVELOPMENT: 'Development',
  WEB_DEVELOPMENT: "Web Development",
  DATA_SCIENCE: "Data Science",
  MOBILE_DEVELOPMENT: "Mobile Development",
  GAME_DEVELOPMENT: "Game Development",
  CLOUD_COMPUTING: "Cloud Computing",
  CYBER_SECURITY: "Cyber Security",
  AI_MACHINE_LEARNING: "AI & Machine Learning",
  DEVOPS: "DevOps",
  UI_UX_DESIGN: "UI/UX Design",
  SOFTWARE_TESTING: "Software Testing",
});

/**
 * Array of provider values.
 * @type {string[]}
 */
const COURSE_CATEGORY_VALUES = Object.values(COURSE_CATEGORIES);

/**
 * Labels for each provider type.
 * @type {Object<string, string>}
 */
const COURSE_CATEGORY_LABELS = {
  [COURSE_CATEGORIES.DEVELOPMENT]: "Development",
  [COURSE_CATEGORIES.WEB_DEVELOPMENT]: "Web Development",
  [COURSE_CATEGORIES.DATA_SCIENCE]: "Data Science",
  [COURSE_CATEGORIES.MOBILE_DEVELOPMENT]: "Mobile Development",
  [COURSE_CATEGORIES.GAME_DEVELOPMENT]: "Game Development",
  [COURSE_CATEGORIES.CLOUD_COMPUTING]: "Cloud Computing",
  [COURSE_CATEGORIES.CYBER_SECURITY]: "Cyber Security",
  [COURSE_CATEGORIES.AI_MACHINE_LEARNING]: "AI & Machine Learning",
  [COURSE_CATEGORIES.DEVOPS]: "DevOps",
  [COURSE_CATEGORIES.UI_UX_DESIGN]: "UI/UX Design",
  [COURSE_CATEGORIES.SOFTWARE_TESTING]: "Software Testing",
};

/**
 * Exports for provider enums, values, and labels.
 * @type {{
 *  PROVIDERS: Object<string, string>,
 *  PROVIDER_VALUES: string[],
 *  PROVIDER_LABELS: Object<string, string>
 * }}
 */
module.exports = {
  COURSE_CATEGORIES,
  COURSE_CATEGORY_VALUES,
  COURSE_CATEGORY_LABELS
};
