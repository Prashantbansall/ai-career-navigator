import { TARGET_ROLES } from "../utils/roleConstants.js";

export const getRoles = (req, res) => {
  res.json({
    success: true,
    message: "Target roles fetched successfully",
    data: {
      roles: TARGET_ROLES,
    },
  });
};
