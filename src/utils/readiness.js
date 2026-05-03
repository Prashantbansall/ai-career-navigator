export const getReadinessStyle = (score) => {
  if (score <= 40) {
    return {
      label: "Needs Work",
      text: "text-red-400",
      bg: "bg-red-500",
      softBg: "bg-red-500/20",
      border: "border-red-500/30",
      badgeVariant: "danger",
    };
  }

  if (score <= 70) {
    return {
      label: "Almost Ready",
      text: "text-yellow-400",
      bg: "bg-yellow-500",
      softBg: "bg-yellow-500/20",
      border: "border-yellow-500/30",
      badgeVariant: "warning",
    };
  }

  return {
    label: "Job Ready",
    text: "text-green-400",
    bg: "bg-green-500",
    softBg: "bg-green-500/20",
    border: "border-green-500/30",
    badgeVariant: "success",
  };
};
