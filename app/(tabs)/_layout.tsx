import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

<<<<<<< Updated upstream
import Colors from '@/constants/Colors';
=======
>>>>>>> Stashed changes
import { useTheme } from '@/contexts/ThemeContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.cardBorder,
          borderTopWidth: 2,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderRadius: 20,
          marginHorizontal: 10,
          marginBottom: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        headerShown: false,
        header: () => null,
        headerStatusBarHeight: 0,
        ...Platform.select({
          android: {
            headerStyle: {
              height: 0,
            },
          },
        }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          header: () => null,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          header: () => null,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <TabBarIcon name="magic" color={color} />,
          header: () => null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          header: () => null,
        }}
      />
    </Tabs>
  );
}
