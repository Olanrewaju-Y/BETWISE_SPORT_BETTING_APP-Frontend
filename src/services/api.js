const API_BASE_URL = 'https://betwise-sport-betting-app.onrender.com/api'; // Adjust as needed

    // This is a simplified way to allow navigation from outside a component.
    // For a more robust solution, consider event emitters or integrating with your AuthContext.
    let globalNavigate = null;
    export const setGlobalNavigate = (navigate) => {
        globalNavigate = navigate;
    };
    
const api = {
    get: async (endpoint, token) => {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
        return handleResponse(response);
    },
    post: async (endpoint, data, token) => {
        const headers = { 'Content-Type': 'application/json', ... (token ? { 'Authorization': `Bearer ${token}` } : {}) };
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers, body: JSON.stringify(data) });
        return handleResponse(response);
    },
    patch: async (endpoint, data, token) => {
        const headers = { 'Content-Type': 'application/json', ... (token ? { 'Authorization': `Bearer ${token}` } : {}) };
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'PATCH', headers, body: JSON.stringify(data) });
        return handleResponse(response);
    },
    delete: async (endpoint, token) => { // Add a delete method
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE', headers });
        return handleResponse(response);
    }
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
            if ((response.status === 401 || response.status === 403) && globalNavigate) {
                // Clear auth state
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                // Potentially update an AuthContext here if you have one
                // Redirect to login
                globalNavigate('/login', { replace: true, state: { message: "Your session has expired. Please log in again." } });
            }
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.status = response.status; // Attach status for easier handling
        throw error;
    }
    return data;
};

export default api;

// Example Usage (in a component):  const data = await api.get('/user/profile', token);