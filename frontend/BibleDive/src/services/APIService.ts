import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "../utils/SecureStorage";

const apiClient = axios.create({
    baseURL: '' //TODO add base URL
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
            const response = await axios.post('endpoint', {refreshToken}); //TODO add endpoint here.
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