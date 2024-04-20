import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext'
import { UserProvider } from './src/context/UserContext';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <UserProvider>
        <AppNavigator />
        </UserProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
