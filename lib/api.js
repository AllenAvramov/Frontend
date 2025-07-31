import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const api = axios.create({
  baseURL: 'http://192.168.1.24:3000', //  update when deploying in render
  headers: {
    'Content-Type': 'application/json',
  },
});

//  Attach token to every request
api.interceptors.request.use(async (config) => { //interceptor: to intercept before the error of expired token and get a new one
  const accessToken = await AsyncStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

//  Refresh expired access token automatically
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Skip if not a 403 or already retried
    if (
      error.response?.status === 403 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        // Request a new access token
        const refreshRes = await axios.post(`${api.defaults.baseURL}/refresh-token`, {
          token: refreshToken,
        });

        const { accessToken } = refreshRes.data;

        // Store the new access token
        await AsyncStorage.setItem('accessToken', accessToken);

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        console.error(' Token refresh failed:', refreshError);

        // Clear tokens and optionally redirect to login
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;