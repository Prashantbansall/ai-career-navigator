const API_BASE_URL = "http://localhost:5000/api";

export const analyzeResumeAPI = async (file, targetRole) => {
  try {
    const formData = new FormData();

    formData.append("resume", file);
    formData.append("targetRole", targetRole);

    const res = await fetch(`${API_BASE_URL}/resume/analyze`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.details || data.error || "Resume analysis failed.");
    }

    return data;
  } catch (error) {
    if (error.message === "Failed to fetch") {
      throw new Error(
        "Backend server is not running. Please start the backend.",
      );
    }

    throw error;
  }
};

export const getAnalysisHistoryAPI = async () => {
  const res = await fetch(`${API_BASE_URL}/analysis`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.details || data.error || "Failed to fetch history.");
  }

  return data;
};

export const getAnalysisByIdAPI = async (id) => {
  const res = await fetch(`${API_BASE_URL}/analysis/${id}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.details || data.error || "Failed to fetch analysis.");
  }

  return data;
};

export const deleteAnalysisAPI = async (id) => {
  const res = await fetch(`${API_BASE_URL}/analysis/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.details || data.error || "Failed to delete analysis.");
  }

  return data;
};
