/**
 * Root Navigator
 * Main navigation container
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { useUserStore } from '../store';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AppNavigator from './AppNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Check if user has seen onboarding
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    // TODO: Check AsyncStorage for onboarding flag
    setTimeout(() => {
      setIsLoading(false);
      setShowOnboarding(false); // Set to true if first time
    }, 2000);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="App" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
