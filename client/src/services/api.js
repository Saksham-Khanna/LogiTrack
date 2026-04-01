const API_BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: `Server error: ${response.status} ${response.statusText}` };
    }
    throw { response: { data: errorData } };
  }
  return response.json();
};

const shipmentApi = {
  // Auth
  login: (email, password) => 
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  register: (name, email, password, role) => 
    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    }).then(handleResponse),

  getMe: () => 
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    }).then(handleResponse),

  updateProfile: (data) => 
    fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Shipments / Orders
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/shipments?${query}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  getByTrackingId: (trackingId) => 
    fetch(`${API_BASE_URL}/shipments/${trackingId}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  create: (data) => 
    fetch(`${API_BASE_URL}/shipments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateStatus: (id, statusData) => 
    fetch(`${API_BASE_URL}/shipments/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(statusData),
    }).then(handleResponse),

  getDashboardStats: () => 
    fetch(`${API_BASE_URL}/shipments/stats/dashboard`, {
      headers: getHeaders(),
    }).then(handleResponse),
};

export default shipmentApi;
