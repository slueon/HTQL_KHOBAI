// API Service - Kết nối với Backend
const API_BASE_URL = 'http://localhost:3000/api';

// Get auth token from sessionStorage
function getAuthToken() {
    return sessionStorage.getItem('authToken');
}

// Set auth token
function setAuthToken(token) {
    sessionStorage.setItem('authToken', token);
}

// Remove auth token
function removeAuthToken() {
    sessionStorage.removeItem('authToken');
}

// API Request Helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        // If unauthorized, redirect to login
        if (response.status === 401) {
            removeAuthToken();
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
            return { success: false, message: 'Session expired' };
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            message: error.message || 'Network error occurred'
        };
    }
}

// Auth API
const authAPI = {
    login: async (username, password) => {
        return await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },
    getMe: async () => {
        return await apiRequest('/auth/me');
    }
};

// Products API
const productsAPI = {
    getAll: async (search, category) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        const query = params.toString();
        return await apiRequest(`/products${query ? '?' + query : ''}`);
    },
    getById: async (id) => {
        return await apiRequest(`/products/${id}`);
    },
    create: async (product) => {
        return await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(product),
        });
    },
    update: async (id, product) => {
        return await apiRequest(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product),
        });
    },
    delete: async (id) => {
        return await apiRequest(`/products/${id}`, {
            method: 'DELETE',
        });
    }
};

// Locations API
const locationsAPI = {
    getAll: async () => {
        return await apiRequest('/locations');
    },
    getById: async (id) => {
        return await apiRequest(`/locations/${id}`);
    },
    create: async (location) => {
        return await apiRequest('/locations', {
            method: 'POST',
            body: JSON.stringify(location),
        });
    },
    update: async (id, location) => {
        return await apiRequest(`/locations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(location),
        });
    },
    delete: async (id) => {
        return await apiRequest(`/locations/${id}`, {
            method: 'DELETE',
        });
    }
};

// Suppliers API
const suppliersAPI = {
    getAll: async () => {
        return await apiRequest('/suppliers');
    },
    getById: async (id) => {
        return await apiRequest(`/suppliers/${id}`);
    },
    create: async (supplier) => {
        return await apiRequest('/suppliers', {
            method: 'POST',
            body: JSON.stringify(supplier),
        });
    },
    update: async (id, supplier) => {
        return await apiRequest(`/suppliers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(supplier),
        });
    },
    delete: async (id) => {
        return await apiRequest(`/suppliers/${id}`, {
            method: 'DELETE',
        });
    }
};

// Customers API
const customersAPI = {
    getAll: async () => {
        return await apiRequest('/customers');
    },
    getById: async (id) => {
        return await apiRequest(`/customers/${id}`);
    },
    create: async (customer) => {
        return await apiRequest('/customers', {
            method: 'POST',
            body: JSON.stringify(customer),
        });
    },
    update: async (id, customer) => {
        return await apiRequest(`/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(customer),
        });
    },
    delete: async (id) => {
        return await apiRequest(`/customers/${id}`, {
            method: 'DELETE',
        });
    }
};

// Receipts API
const receiptsAPI = {
    getAll: async (date, status) => {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (status) params.append('status', status);
        const query = params.toString();
        return await apiRequest(`/receipts${query ? '?' + query : ''}`);
    },
    getById: async (id) => {
        return await apiRequest(`/receipts/${id}`);
    },
    create: async (receipt) => {
        return await apiRequest('/receipts', {
            method: 'POST',
            body: JSON.stringify(receipt),
        });
    }
};

// Issues API
const issuesAPI = {
    getAll: async (date, status) => {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (status) params.append('status', status);
        const query = params.toString();
        return await apiRequest(`/issues${query ? '?' + query : ''}`);
    },
    getById: async (id) => {
        return await apiRequest(`/issues/${id}`);
    },
    create: async (issue) => {
        return await apiRequest('/issues', {
            method: 'POST',
            body: JSON.stringify(issue),
        });
    }
};

// Stock API
const stockAPI = {
    getCurrent: async (locationId, productId) => {
        const params = new URLSearchParams();
        if (locationId) params.append('locationId', locationId);
        if (productId) params.append('productId', productId);
        const query = params.toString();
        return await apiRequest(`/stock${query ? '?' + query : ''}`);
    },
    getHistory: async (dateFrom, dateTo, type) => {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        if (type) params.append('type', type);
        return await apiRequest(`/stock/history?${params.toString()}`);
    }
};

// Users API
const usersAPI = {
    getAll: async () => {
        return await apiRequest('/users');
    },
    getById: async (id) => {
        return await apiRequest(`/users/${id}`);
    },
    create: async (user) => {
        return await apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(user),
        });
    },
    update: async (id, user) => {
        return await apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(user),
        });
    },
    delete: async (id) => {
        return await apiRequest(`/users/${id}`, {
            method: 'DELETE',
        });
    }
};

// Vehicles API
const vehiclesAPI = {
    getAll: async () => {
        return await apiRequest('/vehicles');
    },
    getById: async (id) => {
        return await apiRequest(`/vehicles/${id}`);
    },
    create: async (vehicle) => {
        return await apiRequest('/vehicles', {
            method: 'POST',
            body: JSON.stringify(vehicle),
        });
    },
    update: async (id, vehicle) => {
        return await apiRequest(`/vehicles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(vehicle),
        });
    },
    delete: async (id) => {
        return await apiRequest(`/vehicles/${id}`, {
            method: 'DELETE',
        });
    },
    getLogs: async (id, filter, date) => {
        const params = new URLSearchParams();
        if (filter) params.append('filter', filter);
        if (date) params.append('date', date);
        const query = params.toString();
        return await apiRequest(`/vehicles/${id}/logs${query ? '?' + query : ''}`);
    }
};

// Vehicle Logs API
const vehicleLogsAPI = {
    getAll: async (filter, date, vehicleId) => {
        const params = new URLSearchParams();
        if (filter) params.append('filter', filter);
        if (date) params.append('date', date);
        if (vehicleId) params.append('vehicleId', vehicleId);
        return await apiRequest(`/vehicle-logs?${params.toString()}`);
    },
    getById: async (id) => {
        return await apiRequest(`/vehicle-logs/${id}`);
    },
    create: async (log) => {
        return await apiRequest('/vehicle-logs', {
            method: 'POST',
            body: JSON.stringify(log),
        });
    },
    getParkedAlerts: async (hours = 8) => {
        return await apiRequest(`/vehicle-logs/alerts/parked?hours=${hours}`);
    },
    getStatsReport: async (dateFrom, dateTo) => {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        return await apiRequest(`/vehicle-logs/stats/report?${params.toString()}`);
    }
};

// Dashboard API
const dashboardAPI = {
    getStats: async () => {
        return await apiRequest('/dashboard/stats');
    },
    getReports: async (dateFrom, dateTo) => {
        return await apiRequest(`/dashboard/reports?dateFrom=${dateFrom}&dateTo=${dateTo}`);
    }
};

// Export all APIs
window.API = {
    auth: authAPI,
    products: productsAPI,
    locations: locationsAPI,
    suppliers: suppliersAPI,
    customers: customersAPI,
    receipts: receiptsAPI,
    issues: issuesAPI,
    stock: stockAPI,
    users: usersAPI,
    vehicles: vehiclesAPI,
    vehicleLogs: vehicleLogsAPI,
    dashboard: dashboardAPI,
    setToken: setAuthToken,
    removeToken: removeAuthToken
};


