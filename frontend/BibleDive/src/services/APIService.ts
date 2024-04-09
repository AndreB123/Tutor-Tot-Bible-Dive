import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "../utils/SecureStorage";

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL

const apiClient = axios.create({
    baseURL: baseURL
});

export const refreshTokens = async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
        await clearTokens();
        return null;
    }

    try {
        const response = await axios.post('/refresh_token', {refreshToken});
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await storeTokens(accessToken, newRefreshToken);
        return accessToken;
    } catch (error) {
        console.error('Error refreshing token', error);
        await clearTokens();
        return null;
    }
};

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
        const newAccessToken = await refreshTokens();
        if (newAccessToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
        }
    }
    return Promise.reject(error);
});

export default apiClient;