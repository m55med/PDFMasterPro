// PDF Master Pro - Main Navigator (Bottom Tabs)
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, ToolStackParamList } from '../types/navigation';
import { useTheme, useLanguage } from '../context';
import { Layout, Typography } from '../constants/theme';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ToolsScreen from '../screens/main/ToolsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SubscriptionScreen from '../screens/main/SubscriptionScreen';
import FeedbackScreen from '../screens/main/FeedbackScreen';
import DocumentsScreen from '../screens/pages/DocumentsScreen';
import FavoritesScreen from '../screens/pages/FavoritesScreen';

// Legal Screens
import PrivacyPolicyScreen from '../screens/auth/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/auth/TermsOfServiceScreen';

// Tool Screens
import MergeScreen from '../screens/tools/MergeScreen';
import SplitScreen from '../screens/tools/SplitScreen';
import CompressScreen from '../screens/tools/CompressScreen';
import RotateScreen from '../screens/tools/RotateScreen';
import ProtectScreen from '../screens/tools/ProtectScreen';
import UnlockScreen from '../screens/tools/UnlockScreen';
import WatermarkScreen from '../screens/tools/WatermarkScreen';
import PageNumbersScreen from '../screens/tools/PageNumbersScreen';
import OCRScreen from '../screens/tools/OCRScreen';
import OrganizeScreen from '../screens/tools/OrganizeScreen';
import JpgToPdfScreen from '../screens/tools/JpgToPdfScreen';
import PdfToJpgScreen from '../screens/tools/PdfToJpgScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const ToolStack = createNativeStackNavigator<ToolStackParamList>();
const MainStack = createNativeStackNavigator();

// Tool Stack Navigator
const ToolsStackNavigator: React.FC = () => {
  return (
    <ToolStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <ToolStack.Screen name="ToolsList" component={ToolsScreen} />
      <ToolStack.Screen name="Merge" component={MergeScreen} />
      <ToolStack.Screen name="Split" component={SplitScreen} />
      <ToolStack.Screen name="Compress" component={CompressScreen} />
      <ToolStack.Screen name="Rotate" component={RotateScreen} />
      <ToolStack.Screen name="Protect" component={ProtectScreen} />
      <ToolStack.Screen name="Unlock" component={UnlockScreen} />
      <ToolStack.Screen name="Watermark" component={WatermarkScreen} />
      <ToolStack.Screen name="PageNumbers" component={PageNumbersScreen} />
      <ToolStack.Screen name="OCR" component={OCRScreen} />
      <ToolStack.Screen name="Organize" component={OrganizeScreen} />
      <ToolStack.Screen name="JpgToPdf" component={JpgToPdfScreen} />
      <ToolStack.Screen name="PdfToJpg" component={PdfToJpgScreen} />
    </ToolStack.Navigator>
  );
};

// Tab Icon Component
const TabIcon: React.FC<{ name: string; focused: boolean; color: string }> = ({
  name,
  focused,
  color: _color,
}) => {
  const iconMap: Record<string, string> = {
    Home: '🏠',
    Documents: '📁',
    Tools: '🔧',
    Favorites: '⭐',
    Settings: '⚙️',
  };

  return (
    <Text style={focused ? styles.tabIconFocused : styles.tabIcon}>
      {iconMap[name] || '📄'}
    </Text>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 22,
  },
  tabIconFocused: {
    fontSize: 24,
  },
});

// Tab Navigator Component
const TabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.bgWhite,
          borderTopColor: colors.border,
          height: Layout.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSize.xs,
          fontWeight: Typography.fontWeight.medium,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t.home.welcomeBack.split('!')[0] || 'Home' }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ tabBarLabel: t.documents.title }}
      />
      <Tab.Screen
        name="Tools"
        component={ToolsStackNavigator}
        options={{ tabBarLabel: t.tools.allTools }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: t.favorites.title }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: t.settings.title }}
      />
    </Tab.Navigator>
  );
};

// Main Navigator with Profile Screen
export const MainNavigator: React.FC = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <MainStack.Screen name="MainTabs" component={TabNavigator} />
      <MainStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <MainStack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <MainStack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <MainStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <MainStack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </MainStack.Navigator>
  );
};

export default MainNavigator;
