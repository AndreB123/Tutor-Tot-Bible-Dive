import axios from "axios";
import { getAccessToken,  } from "../utils/SecureStorage";

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL

const apiClient = axios.create({
    baseURL: baseURL
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
        const newAccessToken = await getAccessToken();
        if (newAccessToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
        }
    }
    return Promise.reject(error);
});

export default apiClient;