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

export const VALID_TARGET_ROLES = TARGET_ROLES.map((role) => role.value);

export const isValidTargetRole = (role) => {
  return VALID_TARGET_ROLES.includes(role);
};

export const getValidTargetRolesMessage = () => {
  return VALID_TARGET_ROLES.join(", ");
};
