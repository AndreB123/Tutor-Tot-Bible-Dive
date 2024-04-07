import apiClient from './APIService';
import axios, {AxiosError} from "axios";
import { storeTokens } from '../utils/SecureStorage';
import Constants from 'expo-constants';

interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export const login = async (username: string, password: string): Promise<boolean> => {
    try {
        const response = await apiClient.post<LoginResponse>('/login', { username, password });
        const { access_token, refresh_token } = response.data;

        await storeTokens(access_token, refresh_token);
        return true;
    } catch (error) {
        console.error('Login error', error);
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.log('Error data:', error.response.data);
                console.log('Status code:', error.response.status);
                console.log('Headers:', error.response.headers);
            } else {
                console.log('Error message:', error.message);
            }
        } else {
            console.log('Non-Axios error:', error);
        }
        return false;
    }
};

export const createAccount = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
        const response = await apiClient.post<LoginResponse>('/create_user', { email, username, password });
        const { access_token, refresh_token } = response.data;
        console.log("create account response:", response.data)
        await storeTokens(access_token, refresh_token);
        return true;
    } catch (error) {
        console.error('failed to create account', error);
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.log('Error data:', error.response.data);
                console.log('Status code:', error.response.status);
                console.log('Headers:', error.response.headers);
            } else {
                console.log('Error message:', error.message);
            }
        } else {
            console.log('Non-Axios error:', error);
        }
        return false;
    }
}
