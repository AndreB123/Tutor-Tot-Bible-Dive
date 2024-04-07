import * as Keychain from 'react-native-keychain';

export const storeTokens = async (accessToken: string, refreshToken: string) => {
    await Keychain.setGenericPassword('accessToken', accessToken, {service: 'accessTokenService'});
    await Keychain.setGenericPassword('refreshToken', refreshToken, {service: 'refreshTokenService'});
}

export const getAccessToken = async () => {
    const credentials = await Keychain.getGenericPassword({service: 'accessTokenService'});
    return credentials ? credentials.password : null;
};

export const getRefreshToken = async () => {
    const credentials = await Keychain.getGenericPassword({service: 'refreshTokenService'});
    return credentials ? credentials.password : null;
};

export const clearTokens = async () => {
    await Keychain.resetGenericPassword({service: 'accessTokenService'})
    await Keychain.resetGenericPassword({service: 'refreshTokenService'});
};