/**
 * App Navigator
 * Bottom tab navigation for main app screens
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from './types';
import { theme } from '../theme';

// Placeholder screens
import HomeNavigator from './HomeNavigator';
import FilesNavigator from './FilesNavigator';
import SettingsNavigator from './SettingsNavigator';

// Icons (using Text as placeholder)
import { Text } from 'react-native';

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          height: 60,
        },
        tabBarLabelStyle: {
          ...theme.typography.small,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Tools',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🛠️</Text>,
        }}
      />
      <Tab.Screen
        name="Files"
        component={FilesNavigator}
        options={{
          tabBarLabel: 'My Files',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>📁</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
