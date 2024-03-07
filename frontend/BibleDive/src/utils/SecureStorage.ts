import * as Keychain from 'react-native-keychain';

export const storeTokens = async (accessToken: string, refreshToken: string) => {
    await Keychain.setGenericPassword('accessToken', accessToken, {service: 'accessToken'});
    await Keychain.setGenericPassword('refreshToken', refreshToken, {service: 'refreshToken'});
}

export const getAccessToken = async () => {
    const credentials = await Keychain.getGenericPassword({service: 'accessToken'});
    return credentials ? credentials.password : null;
};

export const getRefreshToken = async () => {
    const credentials = await Keychain.getGenericPassword({service: 'refreshToken'});
    return credentials ? credentials.password : null;
};

export const clearTokens = async () => {
    await Keychain.resetGenericPassword({service: 'accessToken'})
    await Keychain.resetGenericPassword({service: 'refreshToken'});
};