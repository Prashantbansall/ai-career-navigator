const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const parseResponse = async (res) => {
  let data;

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
      headers: {
        ...getAuthHeaders(),
      },
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

    const res = await fetch(`${API_BASE_URL}/analysis?${params.toString()}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    const data = await parseResponse(res);

    return data?.data || data;
  } catch (error) {
    handleNetworkError(error);
  }
};

export const getAnalysisByIdAPI = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

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
      headers: {
        ...getAuthHeaders(),
      },
    });

    const data = await parseResponse(res);

    return data?.data || data;
  } catch (error) {
    handleNetworkError(error);
  }
};

export const getRolesAPI = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/roles`);
    const data = await parseResponse(res);

    return data?.data?.roles || [];
  } catch (error) {
    handleNetworkError(error);
  }
};

export const exportAnalysisPdfAPI = async (analysisId) => {
  if (!analysisId) {
    throw new Error("Analysis ID is required to export PDF.");
  }

  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/pdf`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

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
    let fileName = "ai-career-navigator-career-roadmap.pdf";

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

export const getCommunityStatsAPI = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/community/stats`);

    const data = await parseResponse(res);

    return data.data || data;
  } catch (error) {
    console.error("Community stats API error:", error.message);
    throw error;
  }
};

export const registerUserAPI = async (userData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await parseResponse(res);

    return data;
  } catch (error) {
    console.error("Register API error:", error.message);
    throw error;
  }
};

export const loginUserAPI = async (credentials) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await parseResponse(res);

    return data;
  } catch (error) {
    console.error("Login API error:", error.message);
    throw error;
  }
};

export const getCurrentUserAPI = async (token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseResponse(res);

    return data;
  } catch (error) {
    console.error("Current user API error:", error.message);
    throw error;
  }
};
