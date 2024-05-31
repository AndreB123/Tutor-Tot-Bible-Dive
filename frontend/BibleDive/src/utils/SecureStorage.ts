import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { Buffer } from 'buffer';

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL

const apiClient = axios.create({
    baseURL: baseURL
});
const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/-/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString();
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT', error);
        return null;
    }
};

const isTokenExpired = (token) => {
    const decoded = parseJwt(token);
    if (!decoded) {
        console.log('Token decoding failed');
        return true
    }
    const now = Date.now() / 1000;
    return decoded.exp < now; 
};

export const getUserIDFromToken = async () => {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;

    const decoded = parseJwt(accessToken);
    return decoded ? decoded.user_id : null;
};

export const storeTokens = async (accessToken: string, refreshToken: string) => {
    console.log(`Storing access token: ${accessToken}`);
    console.log(`Storing refresh token: ${refreshToken}`);
    await Keychain.setGenericPassword('accessToken', accessToken, {service: 'accessTokenService'});
    await Keychain.setGenericPassword('refreshToken', refreshToken, {service: 'refreshTokenService'});
}

export const getAccessToken = async () => {
    const credentials = await Keychain.getGenericPassword({service: 'accessTokenService'});
    let accessToken = credentials ? credentials.password : null;
    console.log(`Retrieved access token: ${accessToken}`);
    if (accessToken && isTokenExpired(accessToken)) {
        console.log('Access token expired, refreshing...');
        accessToken = await refreshTokens();
    }

    return accessToken;
};

export const getRefreshToken = async () => {
    const credentials = await Keychain.getGenericPassword({service: 'refreshTokenService'});
    const refreshToken =  credentials ? credentials.password : null;
    console.log(`Retrieved refresh token: ${refreshToken}`);
    if (refreshToken && isTokenExpired(refreshToken)) {
        console.log('Refresh token expired');
        return null;
    }

    return refreshToken;
};

export const refreshTokens = async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
        console.log('No refresh token available, clearing tokens');
        await clearTokens();
        return null;
    }

    try {
        console.log('Attempting to refresh tokens');
        const response = await apiClient.post('/refresh_token', { refreshToken });
        const { access_token: accessToken, refresh_token: newRefreshToken } = response.data;
        await storeTokens(accessToken, newRefreshToken);
        return accessToken;
    } catch (error) {
        console.error('Error refreshing token', error);
        await clearTokens();
        return null;
    }
};

export const clearTokens = async () => {
    await Keychain.resetGenericPassword({service: 'accessTokenService'})
    await Keychain.resetGenericPassword({service: 'refreshTokenService'});
};