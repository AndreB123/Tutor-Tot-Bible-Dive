import Config from 'react-native-config';

interface AppConfig {
    apiBaseUrl: string;
    webSocketUrl: string;
}

const config: AppConfig = {
    apiBaseUrl: Config.API_BASE_URL,
    webSocketUrl: Config.WEBSOCKET_URL,
};


export default config;