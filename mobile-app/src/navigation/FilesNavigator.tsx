/**
 * Files Navigator
 * Stack navigator for files screens
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FilesStackParamList } from './types';
import { theme } from '../theme';
import { View, Text } from 'react-native';

// Placeholder screen
const FilesListScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Files List Screen</Text>
  </View>
);

const Stack = createStackNavigator<FilesStackParamList>();

export default function FilesNavigator() {
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
        name="FilesList"
        component={FilesListScreen}
        options={{ title: 'My Files' }}
      />
    </Stack.Navigator>
  );
}
