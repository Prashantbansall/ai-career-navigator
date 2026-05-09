const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const parseResponse = async (res) => {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(
      data?.error || data?.details || data?.message || "Something went wrong.",
    );
  }

  return data;
};

const handleNetworkError = (error) => {
  if (error.message === "Failed to fetch") {
    throw new Error("Backend server is not running. Please start the backend.");
  }

  throw error;
};

export const analyzeResumeAPI = async (file, targetRole) => {
  try {
    const formData = new FormData();

    formData.append("resume", file);
    formData.append("targetRole", targetRole);

    const res = await fetch(`${API_BASE_URL}/resume/analyze`, {
      method: "POST",
      body: formData,
    });

    const data = await parseResponse(res);

    return data?.data?.analysis || data;
  } catch (error) {
    handleNetworkError(error);
  }
};

export const getAnalysisHistoryAPI = async ({
  search = "",
  role = "All",
  page = 1,
  limit = 6,
} = {}) => {
  try {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (search.trim()) {
      params.append("search", search.trim());
    }

    if (role && role !== "All") {
      params.append("role", role);
    }

    const res = await fetch(`${API_BASE_URL}/analysis?${params.toString()}`);
    const data = await parseResponse(res);

    return data?.data || data;
  } catch (error) {
    handleNetworkError(error);
  }
};

export const getAnalysisByIdAPI = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${id}`);
    const data = await parseResponse(res);

    return data?.data?.analysis || data?.analysis || data;
  } catch (error) {
    handleNetworkError(error);
  }
};

export const deleteAnalysisAPI = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${id}`, {
      method: "DELETE",
    });

    const data = await parseResponse(res);

    return data?.data || data;
  } catch (error) {
    handleNetworkError(error);
  }
};

export const getRolesAPI = async () => {
  const res = await fetch(`${API_BASE_URL}/roles`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch roles.");
  }

  return data.data.roles;
};

// Downloads a backend-generated PDF report for a saved analysis.
export const exportAnalysisPdfAPI = async (analysisId) => {
  if (!analysisId) {
    throw new Error("Analysis ID is required to export PDF.");
  }

  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/pdf`);

    if (!res.ok) {
      let message = "Failed to export PDF.";

      try {
        const data = await res.json();
        message = data.error || data.message || message;
      } catch {
        // PDF endpoints may not always return JSON on failure.
      }

      throw new Error(message);
    }

    const blob = await res.blob();

    const contentDisposition = res.headers.get("Content-Disposition");
    let fileName = "career-roadmap.pdf";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);

      if (match?.[1]) {
        fileName = match[1];
      }
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    handleNetworkError(error);
  }
};