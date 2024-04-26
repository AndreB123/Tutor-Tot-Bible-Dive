import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext'
import { UserProvider } from './src/context/UserContext';
import { ChatProvider } from './src/context/ChatContext';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <UserProvider>
          <ChatProvider>
            <AppNavigator />
          </ChatProvider>
        </UserProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
