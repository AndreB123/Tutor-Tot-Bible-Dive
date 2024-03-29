import apiClient from './APIService';
import axios, {AxiosError} from "axios";
import { storeTokens } from '../utils/SecureStorage';
import Constants from 'expo-constants';

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export const login = async (username: string, password: string): Promise<boolean> => {
    try {
        const response = await apiClient.post<LoginResponse>('/login', { username, password });
        const { accessToken, refreshToken } = response.data;

        await storeTokens(accessToken, refreshToken);
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error('Error data:', error.response.data);
                console.error('Status code:', error.response.status);
                console.error('Headers:', error.response.headers);
            } else {
                console.error('Error message:', error.message);
            }
        } else {
            console.error('Non-Axios error:', error);
        }
        return false;
    }
};

export const createAccount = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
        const response = await apiClient.post<LoginResponse>('/create_user', { email, username, password });
        const { accessToken, refreshToken } = response.data;

        await storeTokens(accessToken, refreshToken);
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error('Error data:', error.response.data);
                console.error('Status code:', error.response.status);
                console.error('Headers:', error.response.headers);
            } else {
                console.error('Error message:', error.message);
            }
        } else {
            console.error('Non-Axios error:', error);
        }
        return false;
    }
}
