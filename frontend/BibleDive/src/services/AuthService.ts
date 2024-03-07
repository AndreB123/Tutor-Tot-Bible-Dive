import apiClient from './APIService';
import { storeTokens } from '../utils/SecureStorage';

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export const login = async (username: string, password: string): Promise<boolean> => {
    try {
        const response = await apiClient.post<LoginResponse>('/login', { username, password });
        const { accessToken, refreshToken } = response.data;

        await storeTokens( accessToken, refreshToken);
        return true;
    } catch (error) {
        console.error('Login error', error);
        return false;
    }
};
