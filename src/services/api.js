const API_BASE_URL = "http://localhost:8000";

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "API request failed");
    }
    return response.json();
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

export const setPreferences = async (userId, preferences) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/preferences`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
    });
    return handleResponse(response);
};

export const fetchMatchStack = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/matches/${userId}/stack`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return handleResponse(response);
};

export const submitRescueReport = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/rescues/`, {
        method: "POST",
        body: formData,
    });
    return handleResponse(response);
};