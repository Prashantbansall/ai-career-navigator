export const VALID_TARGET_ROLES = [
  "SDE",
  "AI/ML",
  "Data Science",
  "DevOps",
  "Frontend",
  "Backend",
];

export const isValidTargetRole = (role) => {
  return VALID_TARGET_ROLES.includes(role);
};

export const getValidTargetRolesMessage = () => {
  return VALID_TARGET_ROLES.join(", ");
};
