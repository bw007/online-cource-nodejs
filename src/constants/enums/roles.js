/**
 * @typedef {Object} ROLES
 * @property {string} ADMIN - System administrator
 * @property {string} STUDENT - Student user
 */

/**
 * Role constants used throughout the application.
 * @readonly
 * @enum {string}
 */
const ROLES = Object.freeze({
  ADMIN: 'admin',
  STUDENT: 'student'
});

/**
 * Array of all role values.
 * @type {string[]}
 */
const ROLE_VALUES = Object.values(ROLES);

/**
 * Human-readable labels for each role.
 * @type {Object<string, string>}
 */
const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.STUDENT]: 'Student'
};

/**
 * Groupings of roles for access control.
 * @type {Object<string, string[]>}
 * @property {string[]} ADMIN_LEVEL_ACCESS - Roles with admin-level access
 * @property {string[]} STUDENT_LEVEL_ACCESS - Roles with student-level access
 * @property {string[]} GENERAL_ACCESS - All roles with general access
 */
const ROLE_GROUPS = {
  ADMIN_LEVEL_ACCESS: [ROLES.ADMIN],
  STUDENT_LEVEL_ACCESS: [ROLES.STUDENT],
  GENERAL_ACCESS: [ROLES.ADMIN, ROLES.STUDENT]
};

/**
 * Exports role constants, values, labels, and groups.
 * @type {Object}
 * @property {ROLES} ROLES
 * @property {string[]} ROLE_VALUES
 * @property {Object<string, string>} ROLE_LABELS
 * @property {Object<string, string[]>} ROLE_GROUPS
 */
module.exports = {
  ROLES,
  ROLE_VALUES,
  ROLE_LABELS,
  ROLE_GROUPS
};