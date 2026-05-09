/**
 * roleConstants.js
 *
 * Central source of truth for supported target roles.
 *
 * Keeping role values in one file helps the backend validate target roles
 * consistently and keeps the frontend role dropdown aligned with backend logic.
 */

export const TARGET_ROLES = [
  {
    value: "SDE",
    label: "Software Development Engineer",
  },
  {
    value: "AI/ML",
    label: "AI/ML Engineer",
  },
  {
    value: "Data Science",
    label: "Data Scientist",
  },
  {
    value: "DevOps",
    label: "DevOps Engineer",
  },
  {
    value: "Frontend",
    label: "Frontend Developer",
  },
  {
    value: "Backend",
    label: "Backend Developer",
  },
];

// Used by validation middleware to quickly check if a requested role is allowed.
export const VALID_TARGET_ROLES = TARGET_ROLES.map((role) => role.value);

/**
 * Checks whether a provided target role is supported.
 *
 * @param {string} role - Target role value from request body.
 * @returns {boolean}
 */
export const isValidTargetRole = (role) => {
  return VALID_TARGET_ROLES.includes(role);
};

/**
 * Returns a readable comma-separated list of valid role values.
 *
 * Used in API error messages when a client sends an unsupported role.
 */
export const getValidTargetRolesMessage = () => {
  return VALID_TARGET_ROLES.join(", ");
};
