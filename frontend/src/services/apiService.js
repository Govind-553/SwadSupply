import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async verifyToken(token) {
    const response = await this.api.post('/auth/verify-token', { token });
    return response.data;
  }

  async getUserRole(uid) {
    const response = await this.api.get(`/auth/get-user-role/${uid}`);
    return response.data;
  }

  // Mandi prices
  async getMandiPrices() {
    const response = await this.api.get('/mandi-prices');
    return response.data;
  }

  // Voice processing
  async processVoiceOrder(transcript, userId) {
    const response = await this.api.post('/process-voice-order', {
      transcript,
      userId
    });
    return response.data;
  }

  // Orders
  async createOrder(orderData) {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  async updateOrderStatus(orderId, status) {
    const response = await this.api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  }

  async getVendorOrders(vendorId) {
    const response = await this.api.get(`/orders/vendor/${vendorId}`);
    return response.data;
  }

  // Suppliers
  async addProduct(productData) {
    const response = await this.api.post('/suppliers/products', productData);
    return response.data;
  }

  async updateProduct(productId, productData) {
    const response = await this.api.put(`/suppliers/products/${productId}`, productData);
    return response.data;
  }

  async deleteProduct(productId) {
    const response = await this.api.delete(`/suppliers/products/${productId}`);
    return response.data;
  }

  // Vendors
  async getNearbySuppliers(location, radius = 10) {
    const response = await this.api.post('/vendors/nearby-suppliers', {
      location,
      radius
    });
    return response.data;
  }

  async createGroupOrder(orderData) {
    const response = await this.api.post('/vendors/group-orders', orderData);
    return response.data;
  }
}

export default new ApiService();