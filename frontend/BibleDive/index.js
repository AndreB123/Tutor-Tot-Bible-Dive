import { AppRegistry, Platform } from 'react-native';
import App from './App';

AppRegistry.registerComponent('BibleDive', () => App);

if (Platform.OS === 'web') {
    const rootTag = document.getElementById('root') || document.getElementById('BibleDive');
    AppRegistry.runApplication('BibleDive', { rootTag });
}