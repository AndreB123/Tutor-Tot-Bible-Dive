import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "../utils/SecureStorage";
import config from "../config/config";

const apiClient = axios.create({
    baseURL: config.apiBaseUrl
});

apiClient.interceptors.request.use(async (config)=> {
    const accessToken = await getAccessToken();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

apiClient.interceptors.response.use(response => response, async (error)=> {
    const originalRequest = error.config;
    if ( error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = await getRefreshToken();
        try {
            const response = await axios.post('/login', {refreshToken});
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            await storeTokens(accessToken, newRefreshToken);
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            await clearTokens();
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
});

export default apiClient;