import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import CombinedProvider from './src/context/CombinedProvider';

export default function App() {
  return (
    <NavigationContainer>
      <CombinedProvider>
        <AppNavigator />
      </CombinedProvider>
    </NavigationContainer>
  );
}
