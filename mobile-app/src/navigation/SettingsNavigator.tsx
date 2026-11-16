/**
 * Settings Navigator
 * Stack navigator for settings screens
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsStackParamList } from './types';
import { theme } from '../theme';
import { View, Text } from 'react-native';

// Placeholder screen
const SettingsMainScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Settings Screen</Text>
  </View>
);

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          ...theme.typography.h3,
        },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsMainScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
